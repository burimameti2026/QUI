import { CommonModule } from "@angular/common";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Modal, PageHeader } from "../../shared/ui";
import { AcquisitionService } from "./acquisition.service";
import { AuthService } from "../../core/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  templateUrl: "./campaigns.page.html",
  styleUrls: ["./campaigns.page.css"],
})

export class CampaignsPage implements OnInit {
  readonly messageTemplates = [
    {
      id: "logistics-intro",
      name: "Logistics operational benchmark",
      description: "Existing logistics outreach template from the acquisition scenario.",
      subject: "{{company}}: reduce dispatch and delivery exceptions",
      body: "Hi {{contact}}, I noticed current growth signals at {{company}}. We help {{industry}} teams automate dispatch, warehouse and customer operations. Would a 25-minute operational demo be useful?"
    },
    {
      id: "logistics-benchmark",
      name: "Operational benchmark follow-up",
      description: "Follow-up template for logistics teams after the first touch.",
      subject: "Operational benchmark for {{company}}",
      body: "Hi {{contact}}, I prepared a short benchmark for teams operating across {{country}}. I can tailor the demo to your fleet, warehouse and delivery workflow."
    },
    {
      id: "logistics-close-loop",
      name: "Close the loop",
      description: "Short final follow-up that keeps the conversation respectful.",
      subject: "Should I close the loop on {{company}}?",
      body: "Hi {{contact}}, I don't want to keep filling your inbox if this isn't a priority. If improving dispatch, warehouse or delivery operations is on your roadmap, I'm happy to send a short example. Otherwise, I'll close the loop here."
    }
  ];
  prospects: any[] = [];
  previewProspectId = "";
  savedTemplates: any[] = [];

  @ViewChild("approvalQueue") approvalQueue?: ElementRef<HTMLElement>;
  rows: any[] = [];
  lists: any[] = [];
  packages: any[] = [];
  messages: any[] = [];
  selectedCampaign: any = null;
  editingCampaign: any = null;
  activity: any[] = [];
  resultMessages: any[] = [];
  loading = false;
  show = false;
  builderStep = 1;
  busy = false;
  message = "";
  error = "";
  guardrailOpen = false;
  selectedGuardrail: any;
  readonly guardrails = [
    { number: 1, title: "Verified sender", summary: "Mailbox/domain ownership required", detail: "Only a verified mailbox and domain can be used as the sender for a live campaign.", result: "Prevents spoofed or incorrectly configured sender identities.", action: "Manage senders", route: "/integrations" },
    { number: 2, title: "Suppression check", summary: "Opt-outs never receive outreach", detail: "Every recipient is checked against the tenant suppression list before a message is queued.", result: "Protects unsubscribed contacts and preserves sender reputation.", action: "View suppression list", route: "/integrations" },
    { number: 3, title: "Human approval", summary: "Review before each real send", detail: "A campaign can prepare a message, but it cannot leave the platform until a person approves it.", result: "Keeps message quality and launch decisions under human control.", action: "Open approval queue", target: "approval" },
    { number: 4, title: "Stop on reply", summary: "Sequence pauses automatically", detail: "As soon as a recipient replies, the remaining scheduled follow-ups are stopped automatically.", result: "Prevents awkward follow-ups after a real conversation has started.", action: "Open inbox", route: "/inbox" },
  ];
  form: any = this.emptyForm();

  constructor(
    private readonly data: AcquisitionService,
    private readonly auth: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadSavedTemplates();
    this.load();
  }

  get tenantSlug(): string {
    return this.auth.session()?.tenantSlug || "";
  }

  get previewProspect(): any {
    return this.prospects.find(x => x.id === this.previewProspectId) || this.prospects[0] || null;
  }

  get allTemplates(): any[] {
    return [...this.messageTemplates, ...this.savedTemplates];
  }

  get running(): number {
    return this.rows.filter((x) => x.status === 2).length;
  }

  get selectedPackage(): any {
    return this.packages.find((x) => x.id === this.form.offerId);
  }

  get selectedList(): any {
    return this.lists.find((x) => x.id === this.form.targetListId);
  }

  get deliveredResults(): number {
    return this.resultMessages.filter((x) => x.status === 2).length;
  }

  get interestedResults(): number {
    return this.resultMessages.filter((x) => x.classification === "interested" || x.interested === true).length;
  }

  get failedResults(): number {
    return this.resultMessages.filter((x) => x.status === 4).length;
  }

  get suppressedResults(): number {
    return this.resultMessages.filter((x) => x.status === 5).length;
  }

  get pendingApprovalMessages(): any[] {
    return this.messages.filter((x) => x.status === 0);
  }

  get pendingMessages(): number {
    return this.pendingApprovalMessages.length;
  }

  get canContinue(): boolean {
    if (this.builderStep === 1) return Boolean(this.form.targetListId && this.form.offerId && this.form.name.trim());
    if (this.builderStep === 2) return Boolean(this.form.senderName.trim() && this.form.senderEmail.includes("@"));
    return this.form.steps.every((x: any) => x.subjectTemplate.trim() && x.bodyTemplate.trim());
  }

  load(): void {
    this.loading = true;
    this.error = "";
    this.data.campaigns().subscribe({
      next: (r) => {
        this.rows = r || [];
        this.loading = false;
      },
      error: (e) => {
        this.loading = false;
        this.error = this.apiError(e, "Campaigns could not be loaded.");
      },
    });
    this.data.workspacePackages().subscribe({
      next: (r) => (this.packages = r || []),
      error: (e) => (this.error = this.apiError(e, "Offers could not be loaded.")),
    });
    this.data.targetLists().subscribe({
      next: (r) => {
        this.lists = r;
        const targetListId = this.route.snapshot.queryParamMap.get("targetListId");
        if (targetListId && r.some((x) => x.id === targetListId)) {
          this.form.targetListId = targetListId;
          this.show = true;
        }
      },
      error: (e) => (this.error = this.apiError(e, "Target lists could not be loaded.")),
    });
    this.data.prospects(0).subscribe({
      next: (r) => {
        this.prospects = (r || []).filter((x: any) => {
          const status = String(x.status ?? "").toLowerCase();
          return status === "qualified" || status === "enriched" || Number(x.status) === 1 || Number(x.status) === 2;
        });
        if (!this.previewProspectId && this.prospects.length) this.previewProspectId = this.prospects[0].id;
      },
      error: () => {}
    });
    this.data.messages().subscribe({
      next: (r) => (this.messages = r || []),
      error: (e) => (this.error = this.apiError(e, "Approval queue could not be loaded.")),
    });
  }

  openEdit(campaign: any): void {
    this.editingCampaign = campaign;
    this.form = this.formFromCampaign(campaign);
    this.builderStep = 1;
    this.error = "";
    this.show = true;
  }

  pause(campaign: any): void {
    this.data.pauseCampaign(campaign.id).subscribe({
      next: (result) => { campaign.status = result.status; this.message = "Campaign paused. No new messages will be queued."; this.load(); },
      error: (e) => (this.error = this.apiError(e, "Campaign could not be paused.")),
    });
  }

  resume(campaign: any): void {
    this.data.resumeCampaign(campaign.id).subscribe({
      next: (result) => { campaign.status = result.status; this.message = "Campaign resumed."; this.load(); },
      error: (e) => (this.error = this.apiError(e, "Campaign could not be resumed.")),
    });
  }

  openBuilder(): void {
    this.editingCampaign = null;
    this.form = this.emptyForm();
    this.builderStep = 1;
    this.error = "";
    this.show = true;
  }

  openPipelineStep(step: number): void {
    this.form = this.emptyForm();
    this.builderStep = step;
    this.error = "";
    this.show = true;
  }

  showApprovalQueue(): void {
    this.approvalQueue?.nativeElement.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  openDemos(): void {
    void this.router.navigate(["/meetings"]);
  }

  openGuardrail(guardrail: any): void {
    this.selectedGuardrail = guardrail;
    this.guardrailOpen = true;
  }

  openGuardrailAction(): void {
    const guardrail = this.selectedGuardrail;
    this.guardrailOpen = false;
    if (guardrail?.target === "approval") {
      setTimeout(() => this.showApprovalQueue());
      return;
    }
    if (guardrail?.route) void this.router.navigate([guardrail.route]);
  }

  next(): void {
    if (this.canContinue && this.builderStep < 4) this.builderStep++;
  }

  back(): void {
    if (this.builderStep > 1) this.builderStep--;
  }

  save(): void {
    if (!this.canContinue) return;
    this.busy = true;
    const request$ = this.editingCampaign
      ? this.data.updateCampaign(this.editingCampaign.id, this.form)
      : this.data.createCampaign(this.form);
    request$.subscribe({
      next: (campaign) => {
        this.busy = false;
        if (this.editingCampaign) {
          const index = this.rows.findIndex((x) => x.id === campaign.id);
          if (index >= 0) this.rows[index] = campaign;
          this.message = "Campaign updated. Changes apply to future messages; sent messages remain unchanged.";
        } else {
          this.rows.unshift(campaign);
          this.message = "Campaign created as draft. Review it, then start to queue approval-controlled messages.";
        }
        this.editingCampaign = null;
        this.show = false;
      },
      error: (error) => {
        this.busy = false;
        this.error = error?.error?.detail || "Campaign could not be saved.";
      },
    });
  }

  start(campaign: any): void {
    this.data.startCampaign(campaign.id).subscribe({
      next: (result) => {
        campaign.status = result.status;
        this.load();
        this.message = `${result.recipients} recipients enrolled; ${result.queued} first messages await approval.`;
      },
      error: (error) => (this.error = error?.error?.detail || "Campaign could not start."),
    });
  }

  requestApproval(message: any): void {
    this.data.requestApproval(message.id).subscribe({
      next: () => {
        message.approvalRequested = true;
        this.message = "Approval task created.";
      },
      error: (e) => (this.error = this.apiError(e, "Approval could not be requested.")),
    });
  }

  rejectApproval(message: any): void {
    this.data.rejectApproval(message.id).subscribe({
      next: () => {
        message.status = 5;
        message.approvalRequested = false;
        this.message = "Message rejected. It will not be sent.";
        this.load();
      },
      error: (e) => (this.error = this.apiError(e, "Message could not be rejected.")),
    });
  }

  approveAndSend(message: any): void {
    this.data.approveAndSend(message.id).subscribe({
      next: (result) => {
        this.load();
        this.message = `Email accepted by provider: ${result.providerMessageId}`;
      },
      error: (error) => (this.error = error?.error?.detail || "Email could not be sent."),
    });
  }

  retryMessage(message: any): void {
    this.data.retryMessage(message.id).subscribe({
      next: () => {
        this.load();
        this.message = "Failed message re-queued. It now requires approval again before sending.";
      },
      error: (e) => (this.error = this.apiError(e, "Email retry failed.")),
    });
  }

  status(value: number): string {
    return (["Draft", "Scheduled", "Running", "Paused", "Completed"][value] || String(value));
  }

  messageStatus(value: number): string {
    return (["Queued", "Sent", "Delivered", "Replied", "Failed", "Suppressed"][value] || String(value));
  }

  inspect(campaign: any): void {
    this.selectedCampaign = campaign;
    this.activity = [];
    this.resultMessages = this.messages.filter((x: any) => x.campaignId === campaign.id);
    this.data.campaignActivity(campaign.id).subscribe({
      next: (rows) => {
        this.activity = rows || [];
        this.resultMessages = this.messages.filter((x: any) => x.campaignId === campaign.id);
      },
      error: (e) => (this.error = this.apiError(e, "Campaign activity could not be loaded.")),
    });
  }

  private apiError(error: any, fallback: string): string {
    return error?.error?.detail || error?.error?.error || (error?.status ? `${fallback} API returned ${error.status}.` : fallback);
  }

  selectTemplate(template: any, index: number): void {
    const step = this.form.steps[index];
    if (!step) return;
    if (!template) {
      step.templateId = "";
      step.templateName = "";
      return;
    }
    step.subjectTemplate = template.subject || "";
    step.bodyTemplate = template.body || "";
    step.templateId = template.id;
    step.templateName = template.name;
    this.message = `Template “${template.name}” loaded into Message ${index + 1}. You can edit it before saving.`;
  }

  saveTemplate(index: number): void {
    const step = this.form.steps[index];
    if (!step?.subjectTemplate?.trim() || !step?.bodyTemplate?.trim()) return;
    const name = (step.templateName || `FusionFleet template ${this.savedTemplates.length + 1}`).trim();
    const item = {
      id: `custom-${Date.now()}`,
      name,
      description: "Saved from the FusionFleet campaign builder.",
      subject: step.subjectTemplate,
      body: step.bodyTemplate
    };
    this.savedTemplates = [...this.savedTemplates.filter(x => x.name !== name), item];
    this.persistSavedTemplates();
    step.templateId = item.id;
    step.templateName = item.name;
    this.message = `Template “${name}” saved for this workspace.`;
  }

  private loadSavedTemplates(): void {
    try {
      const raw = localStorage.getItem(`qai-outreach-templates:${this.tenantSlug || "default"}`);
      this.savedTemplates = raw ? JSON.parse(raw) : [];
    } catch {
      this.savedTemplates = [];
    }
  }

  private persistSavedTemplates(): void {
    try {
      localStorage.setItem(`qai-outreach-templates:${this.tenantSlug || "default"}`, JSON.stringify(this.savedTemplates));
    } catch {}
  }

  renderTemplate(value: string, prospect: any = this.previewProspect): string {
    if (!value) return "";
    if (!prospect) return value;
    const company = prospect.companyName || prospect.company || prospect.name || "your company";
    const contact = prospect.contactName || prospect.contact || prospect.firstName || "there";
    const industry = prospect.industry || "logistics";
    const country = prospect.country || prospect.location || "your market";
    return value
      .replaceAll("{{company}}", company)
      .replaceAll("{{contact}}", contact)
      .replaceAll("{{contactName}}", contact)
      .replaceAll("{{industry}}", industry)
      .replaceAll("{{country}}", country);
  }

  addStep(): void {
    this.form.steps.push(this.emptyStep(this.form.steps.length + 1, 72));
  }

  removeStep(index: number): void {
    if (this.form.steps.length <= 1) return;
    this.form.steps.splice(index, 1);
    this.form.steps.forEach((x: any, i: number) => x.stepNumber = i + 1);
  }

  private formFromCampaign(campaign: any): any {
    return {
      name: campaign.name || "", targetListId: campaign.targetListId || "", offerId: campaign.offerId || "",
      goal: campaign.goal || "book-demo", senderName: campaign.senderName || "", senderEmail: campaign.senderEmail || "",
      startsAtUtc: campaign.startsAtUtc || null,
      steps: (campaign.steps || []).map((x: any, i: number) => ({
        stepNumber: x.stepNumber || i + 1, delayHours: x.delayHours || 0, channel: x.channel || "email",
        subjectTemplate: x.subjectTemplate || "", bodyTemplate: x.bodyTemplate || "", qualification: x.qualification || "qualified",
        minimumScore: x.minimumScore ?? 70, industry: x.industry || "", countries: x.countries || "",
        companySizeMin: x.companySizeMin ?? null, companySizeMax: x.companySizeMax ?? null, contactRoles: x.contactRoles || "", stopOnReply: x.stopOnReply !== false,
      }))
    };
  }

  private emptyStep(stepNumber: number, delayHours: number): any {
    return { stepNumber, delayHours, channel: "email", subjectTemplate: "", bodyTemplate: "", qualification: "qualified", minimumScore: 70, industry: "", countries: "", companySizeMin: null, companySizeMax: null, contactRoles: "", stopOnReply: true };
  }

  private emptyForm(): any {
    return {
      name: "New outreach campaign",
      targetListId: "",
      offerId: "",
      goal: "book-demo",
      senderName: this.tenantSlug.toLowerCase().includes("fusionfleet") ? "TeamFusionFleet Mk" : "",
      senderEmail: this.tenantSlug.toLowerCase().includes("fusionfleet") ? "fusionfleetmk@gmail.com" : "",
      startsAtUtc: null,
      steps: [
        { ...this.emptyStep(1, 0), templateId: "logistics-intro", templateName: "Logistics operational benchmark", subjectTemplate: this.messageTemplates[0].subject, bodyTemplate: this.messageTemplates[0].body },
        { ...this.emptyStep(2, 72), templateId: "logistics-benchmark", templateName: "Operational benchmark follow-up", subjectTemplate: this.messageTemplates[1].subject, bodyTemplate: this.messageTemplates[1].body },
        { ...this.emptyStep(3, 96), templateId: "logistics-close-loop", templateName: "Close the loop", subjectTemplate: this.messageTemplates[2].subject, bodyTemplate: this.messageTemplates[2].body },
      ],
    };
  }
}
