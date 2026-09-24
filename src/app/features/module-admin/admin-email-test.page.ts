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
  error = "";
  result: any = null;

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
      next: r => this.templates = r || [],
      error: e => this.error = e?.error?.detail || "Could not load saved templates."
    });
  }

  get selectedProspect() { return this.prospects.find(x => x.id === this.selectedProspectId); }
  get selectedTemplate() { return this.templates.find(x => x.id === this.selectedTemplateId); }
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

  get renderedSubject() { return this.render(this.selectedTemplate?.subjectTemplate || ""); }
  get renderedBody() { return this.render(this.selectedTemplate?.bodyTemplate || ""); }
  get canSend() { return !!this.sender?.verified && !!this.selectedProspectId && !!this.selectedTemplateId; }

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
