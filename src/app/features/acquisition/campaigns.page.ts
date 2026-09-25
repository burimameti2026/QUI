import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
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
  rows: any[] = [];
  packages: any[] = [];
  selectedCampaign: any = null;
  plan: any = null;
  loading = false;
  busy = false;
  show = false;
  message = "";
  error = "";
  builderStep = 1;

  form: any = this.emptyForm();

  constructor(
    private readonly data: AcquisitionService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get tenantId(): string {
    return this.auth.session()?.tenantId || "";
  }

  get running(): number {
    return this.rows.filter(x => Number(x.status) === 2).length;
  }

  get statusLabels(): string[] {
    return ["Draft", "Scheduled", "Running", "Paused", "Completed", "Stopped"];
  }

  status(value: any): string {
    return this.statusLabels[Number(value)] || String(value ?? "Unknown");
  }

  statusClass(value: any): string {
    return this.status(value).toLowerCase().replace(/\s+/g, "-");
  }

  selectedPackage(): any {
    return this.packages.find(x => (x.code || x.id) === this.form.packageCode);
  }

  load(): void {
    if (!this.tenantId) {
      this.error = "No authenticated tenant is available.";
      return;
    }

    this.loading = true;
    this.error = "";
    this.data.autonomousCampaigns(this.tenantId).subscribe({
      next: rows => {
        this.rows = rows || [];
        this.loading = false;
      },
      error: e => {
        this.loading = false;
        this.error = this.apiError(e, "Campaign containers could not be loaded.");
      }
    });

    this.data.workspacePackages().subscribe({
      next: packages => {
        this.packages = packages || [];
        if (!this.form.packageCode && this.packages.length) {
          const logistics = this.packages.find(x => String(x.code || x.id).toLowerCase().includes("logistics"));
          this.form.packageCode = logistics?.code || logistics?.id || this.packages[0].code || this.packages[0].id;
        }
      },
      error: e => this.error = this.apiError(e, "Workspace packages could not be loaded.")
    });
  }

  openBuilder(): void {
    this.form = this.emptyForm();
    this.builderStep = 1;
    this.selectedCampaign = null;
    this.plan = null;
    this.message = "";
    this.error = "";
    this.show = true;
  }

  next(): void {
    if (this.canContinue() && this.builderStep < 4) this.builderStep++;
  }

  back(): void {
    if (this.builderStep > 1) this.builderStep--;
  }

  canContinue(): boolean {
    if (this.builderStep === 1) return !!this.form.name?.trim() && !!this.form.packageCode;
    if (this.builderStep === 2) return !!this.form.industry?.trim() && !!this.form.region?.trim();
    if (this.builderStep === 3) return !!this.form.objective?.trim();
    return true;
  }

  save(): void {
    if (!this.tenantId || !this.canContinue()) return;

    this.busy = true;
    this.error = "";

    const countries = String(this.form.countries || "")
      .split(",")
      .map((x: string) => x.trim())
      .filter(Boolean);

    const input = {
      name: this.form.name.trim(),
      packageCode: this.form.packageCode,
      objective: this.form.objective.trim(),
      industry: this.form.industry.trim(),
      region: this.form.region.trim(),
      countries,
      minimumScore: Number(this.form.minimumScore) || 70,
      dailyDiscoveryLimit: Number(this.form.dailyDiscoveryLimit) || 25,
      dailyEmailLimit: Number(this.form.dailyEmailLimit) || 10,
      senderName: this.form.senderName?.trim() || null,
      senderEmail: this.form.senderEmail?.trim() || null,
      icp: {
        companyType: this.form.companyType?.trim() || "Logistics, transport, 3PL and distribution companies",
        buyerRoles: this.form.buyerRoles?.trim() || "Operations Director, Logistics Director, Head of Operations, COO",
        painPoints: this.form.painPoints?.trim() || "Manual coordination, repetitive email work and fragmented operational workflows",
        qualification: this.form.qualification?.trim() || "Prioritize companies showing operational growth or automation signals"
      }
    };

    this.data.createAutonomousCampaign(this.tenantId, input).subscribe({
      next: result => {
        this.busy = false;
        this.show = false;
        this.message = "Campaign container created. Its package workflow is ready to execute.";
        const campaign = result?.campaign;
        if (campaign) {
          this.rows = [campaign, ...this.rows.filter(x => x.id !== campaign.id)];
          this.inspect(campaign);
        } else {
          this.load();
        }
      },
      error: e => {
        this.busy = false;
        this.error = this.apiError(e, "Campaign container could not be created.");
      }
    });
  }

  inspect(campaign: any): void {
    if (!this.tenantId || !campaign?.id) return;
    this.selectedCampaign = campaign;
    this.plan = null;
    this.data.autonomousCampaignPlan(this.tenantId, campaign.id).subscribe({
      next: plan => this.plan = plan,
      error: e => this.error = this.apiError(e, "Campaign workflow could not be loaded.")
    });
  }

  start(campaign: any): void {
    if (!campaign?.agentId) {
      this.error = "This campaign has no workflow agent linked.";
      return;
    }
    this.busy = true;
    this.data.runAgent(this.tenantId, campaign.agentId).subscribe({
      next: () => {
        this.busy = false;
        this.message = "Campaign started. The workflow is queued for execution.";
        this.load();
        this.inspect(campaign);
      },
      error: e => {
        this.busy = false;
        this.error = this.apiError(e, "Campaign could not be started.");
      }
    });
  }

  pause(campaign: any): void {
    this.data.pauseAutonomousCampaign(this.tenantId, campaign.id).subscribe({
      next: () => { this.message = "Campaign paused. Its workflow will not advance."; this.load(); this.inspect(campaign); },
      error: e => this.error = this.apiError(e, "Campaign could not be paused.")
    });
  }

  resume(campaign: any): void {
    this.data.resumeAutonomousCampaign(this.tenantId, campaign.id).subscribe({
      next: () => { this.message = "Campaign resumed."; this.load(); this.inspect(campaign); },
      error: e => this.error = this.apiError(e, "Campaign could not be resumed.")
    });
  }

  stop(campaign: any): void {
    this.data.stopAutonomousCampaign(this.tenantId, campaign.id).subscribe({
      next: () => { this.message = "Campaign stopped."; this.load(); this.inspect(campaign); },
      error: e => this.error = this.apiError(e, "Campaign could not be stopped.")
    });
  }

  private emptyForm(): any {
    return {
      name: "FusionFleetMk",
      packageCode: "logistics",
      objective: "Find and qualify logistics companies that can benefit from process automation and prepare targeted outreach.",
      industry: "Logistics & Transport",
      region: "Europe",
      countries: "DE, FR, IT, NL, BE, AT",
      companyType: "3PL providers, freight forwarders, transport operators, warehouse and distribution companies",
      buyerRoles: "Operations Director, Logistics Director, Head of Operations, COO",
      painPoints: "Manual coordination, repetitive email work and fragmented operational workflows",
      qualification: "Prioritize companies with evidence of operational growth, manual work or automation opportunities",
      minimumScore: 75,
      dailyDiscoveryLimit: 25,
      dailyEmailLimit: 10,
      senderName: "",
      senderEmail: ""
    };
  }

  private apiError(error: any, fallback: string): string {
    return error?.error?.detail || error?.error?.error || (error?.status ? `${fallback} API returned ${error.status}.` : fallback);
  }
}
