import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Callout, Modal, PageHeader, WizardSteps } from "../../shared/ui";
import { adminText } from "../../core/admin-page-translations";
import { AdminI18nService } from "../../core/admin-i18n.service";
import { IntegrationsService } from "./integrations.service";
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader, WizardSteps, Callout],
  template: `<qai-page-header
      title="Integrations"
      subtitle="Connect CRM, calendar, messaging and operational systems."
      ><button (click)="load()">↻ Refresh</button></qai-page-header
    >`,
})
export class IntegrationsPage implements OnInit {
  providers: string[] = [
    "HubSpot",
    "Salesforce",
    "Pipedrive",
    "Google Calendar",
    "Microsoft 365",
    "Generic Webhook",
  ];
  connections: any[] = [];
  senders: any[] = [];
  sender: any = { name: "Sales team", email: "", provider: "brevo" };
  suppression: any = { email: "", reason: "manual-suppression" };
  show = false;
  advanced = false;
  provider = "";
  form: any = {};
  constructor(private data: IntegrationsService, private i18n: AdminI18nService) {}
  ngOnInit() {
    this.load();
  }
  t(value: string) {
    return adminText(this.i18n, value);
  }
  load() {
    this.data.list().subscribe((r) => (this.connections = r));
    this.data.senders().subscribe((r) => (this.senders = r));
    this.data.providers().subscribe({
      next: (r) => {
        if (r?.length)
          this.providers = r.map((x: any) =>
            typeof x === "string" ? x : x.name || x.provider,
          );
      },
      error: () => {},
    });
  }
  addSender() {
    this.data.configureSender(this.sender).subscribe({
      next: (r) => {
        this.load();
        alert(this.t(r.instruction || "Sender configured."));
      },
      error: (e) => alert(this.t(e?.error?.detail || "Sender configuration failed.")),
    });
  }
  verify(s: any) {
    const token = s.provider === "brevo" ? null : prompt(this.t("Enter the code received in the sender mailbox"));
    if (s.provider !== "brevo" && !token) return;
    this.data.verifySender(s.id, token).subscribe({
      next: () => this.load(),
      error: (e) => alert(this.t(e?.error?.detail || "Verification failed.")),
    });
  }
  sendVerification(s: any) {
    this.data.sendVerification(s.id).subscribe({
      next: () => alert(this.t("Verification code sent to the sender mailbox.")),
      error: (e) => alert(this.t(e?.error?.detail || "Could not send the verification code.")),
    });
  }
  suppress() {
    this.data
      .suppress(this.suppression.email, this.suppression.reason)
      .subscribe(() => {
        alert(this.t("Recipient suppressed."));
        this.suppression.email = "";
      });
  }
  connection(p: string) {
    return this.connections.find(
      (x) => String(x.provider).toLowerCase() === p.toLowerCase(),
    );
  }
  open(p: string) {
    this.provider = p;
    const c = this.connection(p);
    this.form = c
      ? { ...c }
      : {
          provider: p,
          name: p + " connection",
          status: 1,
          settingsJson: "{}",
          secretReference: "",
        };
    this.advanced = false;
    this.show = true;
  }
  get senderStep() {
    if (!this.senders.length) return 1;
    if (!this.senders.some((s) => s.status === 1)) return 2;
    return 3;
  }
  save() {
    const op = this.form.id
      ? this.data.update(this.form.id, this.form)
      : this.data.create(this.form);
    op.subscribe((r) => {
      const i = this.connections.findIndex((x) => x.id === r.id);
      i >= 0 ? (this.connections[i] = r) : this.connections.push(r);
      this.show = false;
    });
  }
  test(c: any) {
    this.data.test(c.id).subscribe({
      next: (r) =>
        alert(this.t(`${c.provider}: ${r.success ? "connection OK" : "test failed"}`)),
      error: () => alert(this.t("Integration test failed.")),
    });
  }
  logo(p: string) {
    return p
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2);
  }
  desc(p: string) {
    return p.includes("Calendar")
      ? this.t("Book meetings automatically")
      : p === "Slack" || p.includes("Teams")
        ? this.t("Notify sales and support teams")
        : p.includes("Webhook")
          ? this.t("Connect any external API")
          : this.t("Sync contacts, leads and opportunities");
  }
}
