import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeader, Callout } from "../../shared/ui";
import { AdminEmailTestService } from "./admin-email-test.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader, Callout],
  templateUrl: "./admin-email-test.page.html",
  styleUrls: ["./admin-email-test.page.css"],
})
export class AdminEmailTestPage implements OnInit {
  sender: any = null;
  prospects: any[] = [];
  templates: any[] = [];
  selectedProspectId = "";
  selectedTemplateId = "";
  recipientEmail = "fusionfleetmk@gmail.com";
  loading = false;
  sending = false;
  saving = false;
  error = "";
  result: any = null;
  draftName = "";
  draftDescription = "";
  draftSubject = "";
  draftBody = "";

  constructor(private data: AdminEmailTestService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.error = "";
    this.data.sender().subscribe({
      next: r => { this.sender = r; this.recipientEmail = r.email || this.recipientEmail; },
      error: e => { this.sender = null; this.error = e?.error?.detail || "No verified Brevo sender is available."; }
    });
    this.data.prospects().subscribe({
      next: r => { this.prospects = r || []; this.loading = false; },
      error: e => { this.error = e?.error?.detail || "Could not load qualified prospects."; this.loading = false; }
    });
    this.data.templates().subscribe({
      next: r => { this.templates = r || []; if (!this.selectedTemplateId && this.templates.length) { this.selectedTemplateId = this.templates[0].id; this.syncDraft(); } },
      error: e => this.error = e?.error?.detail || "Could not load saved templates."
    });
  }

  get selectedProspect() { return this.prospects.find(x => x.id === this.selectedProspectId); }
  get selectedTemplate() { return this.templates.find(x => x.id === this.selectedTemplateId); }
  get canSave() { return !!this.draftName.trim() && !!this.draftSubject.trim() && !!this.draftBody.trim() && !this.saving; }
  syncDraft() {
    const t = this.selectedTemplate;
    this.draftName = t?.name || "";
    this.draftDescription = t?.description || "";
    this.draftSubject = t?.subjectTemplate || "";
    this.draftBody = t?.bodyTemplate || "";
    this.error = "";
    this.result = null;
  }
  get senderLabel() { return this.sender ? this.sender.name + " <" + this.sender.email + ">" : "TeamFusionFleet Mk <fusionfleetmk@gmail.com>"; }

  render(template: string) {
    const p = this.selectedProspect;
    if (!p || !template) return "";
    return template
      .replace(/\{\{company\}\}/gi, p.companyName || "")
      .replace(/\{\{contact\}\}/gi, p.contactName || "")
      .replace(/\{\{contactName\}\}/gi, p.contactName || "")
      .replace(/\{\{industry\}\}/gi, p.industry || "")
      .replace(/\{\{country\}\}/gi, p.country || "");
  }

  get renderedSubject() { return this.render(this.draftSubject); }
  get renderedBody() { return this.render(this.draftBody); }
  get canSend() { return !!this.selectedProspectId && !!this.selectedTemplateId && !!this.draftSubject.trim() && !!this.draftBody.trim() && !this.sending; }

  saveTemplate() {
    if (!this.canSave) return;
    this.saving = true;
    this.error = "";
    this.data.saveTemplate({
      id: this.selectedTemplateId || undefined,
      name: this.draftName, description: this.draftDescription,
      subjectTemplate: this.draftSubject, bodyTemplate: this.draftBody
    }).subscribe({
      next: saved => {
        this.saving = false;
        const index = this.templates.findIndex(x => x.id === saved.id);
        if (index >= 0) this.templates[index] = saved;
        else this.templates = [...this.templates, saved];
        this.selectedTemplateId = saved.id;
        this.syncDraft();
      },
      error: e => { this.error = e?.error?.detail || "The template could not be saved."; this.saving = false; }
    });
  }

  send() {
    if (!this.canSend) return;
    this.sending = true;
    this.result = null;
    this.error = "";
    this.data.send({
      prospectId: this.selectedProspectId,
      templateId: this.selectedTemplateId,
      recipientEmail: this.recipientEmail
    }).subscribe({
      next: r => { this.result = r; this.sending = false; },
      error: e => { this.error = e?.error?.detail || "The test email could not be sent."; this.sending = false; }
    });
  }
}
