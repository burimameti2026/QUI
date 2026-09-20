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
  template: `
    <main class="page">
      <qai-page-header
        title="Integrations"
        subtitle="Connect CRM, calendar, messaging and operational systems."
      >
        <div class="page-actions">
          <button class="button-secondary" type="button" (click)="load()">↻ Refresh</button>
        </div>
      </qai-page-header>

      <section class="hero">
        <div>
          <span class="eyebrow">Outbound readiness</span>
          <h2>Connect and verify the channel before launch</h2>
          <p>
            The campaign cannot send until a provider is configured, the sender
            is verified and suppression rules are active.
          </p>
        </div>
        <qai-wizard-steps
          [steps]="['Choose provider', 'Add sender', 'Verify identity', 'Ready to send']"
          [descriptions]="['Brevo, SendGrid or SMTP', 'Name and email', 'Provider confirmation', 'Approval still required']"
          [current]="senderStep"
        />
      </section>

      <section class="metric-grid">
        <article class="metric">
          <span class="avatar">✓</span>
          <div><span class="meta">Connected</span><strong>{{ connectedCount }}</strong><span class="meta">Configured providers</span></div>
        </article>
        <article class="metric">
          <span class="avatar">◈</span>
          <div><span class="meta">Available</span><strong>{{ providers.length }}</strong><span class="meta">Provider adapters</span></div>
        </article>
        <article class="metric">
          <span class="avatar">✉</span>
          <div><span class="meta">Verified senders</span><strong>{{ verifiedSenderCount }}</strong><span class="meta">Ready identities</span></div>
        </article>
        <article class="metric">
          <span class="avatar">!</span>
          <div><span class="meta">Suppression</span><strong>Active</strong><span class="meta">Opt-out protection</span></div>
        </article>
      </section>

      <div class="content-grid">
        <section class="card">
          <header class="card-header">
            <div>
              <h3>Verified email senders</h3>
              <span class="meta">Required before any outreach can leave the platform</span>
            </div>
          </header>
          <div class="list" *ngIf="senders.length">
            <div class="list-item" *ngFor="let s of senders">
              <div class="identity">
                <span class="avatar">{{ logo(s.name) }}</span>
                <span class="stack">
                  <strong>{{ s.name }}</strong>
                  <span class="meta">{{ s.provider | uppercase }} · {{ s.status === 1 ? 'Verified' : 'Verification required' }}</span>
                </span>
              </div>
              <div class="actions" *ngIf="s.status !== 1">
                <button class="button-secondary" *ngIf="s.provider !== 'brevo'" type="button" (click)="sendVerification(s)">Resend code</button>
                <button class="button-primary" type="button" (click)="verify(s)">{{ s.provider === 'brevo' ? 'Check verification' : 'Enter code' }}</button>
              </div>
            </div>
          </div>
          <div class="empty" *ngIf="!senders.length">No sending identities configured yet.</div>
          <form class="form" (ngSubmit)="addSender()">
            <div class="section-header">
              <div><h3>Add a sending identity</h3><p>Recipients see this name and address. Use a real mailbox on your company domain.</p></div>
            </div>
            <div class="content-grid">
              <label>From name
                <input [(ngModel)]="sender.name" name="senderName" />
                <small class="meta">Example: Burim from FusionFleet</small>
              </label>
              <label>From email
                <input type="email" [(ngModel)]="sender.email" name="senderEmail" required />
                <small class="meta">Must be verified by the selected provider.</small>
              </label>
            </div>
            <label>Provider
              <select [(ngModel)]="sender.provider" name="senderProvider">
                <option value="brevo">Brevo (recommended)</option>
                <option>smtp</option>
                <option>sendgrid</option>
              </select>
            </label>
            <qai-callout
              *ngIf="sender.provider === 'brevo'"
              icon="i"
              title="Brevo verification"
              text="QualifyAI checks Brevo for this sender. If Brevo API access is IP-restricted, use SMTP credentials instead."
            />
            <div class="actions">
              <button class="button-primary" type="submit" [disabled]="!sender.name.trim() || !sender.email.trim()">Configure sender</button>
            </div>
          </form>
        </section>

        <section class="card">
          <header class="card-header">
            <div>
              <h3>Suppression list</h3>
              <span class="meta">Prevent outreach to opted-out recipients</span>
            </div>
          </header>
          <form class="form" (ngSubmit)="suppress()">
            <label>Email
              <input type="email" [(ngModel)]="suppression.email" name="suppressEmail" required />
            </label>
            <label>Reason
              <input [(ngModel)]="suppression.reason" name="reason" />
            </label>
            <div class="actions"><button class="button-primary" type="submit">Add suppression</button></div>
          </form>
        </section>
      </div>

      <section class="section">
        <div class="section-header">
          <div><h2>Available integrations</h2><p>Configure the systems used by your workspace.</p></div>
        </div>
        <div class="content-grid">
          <article class="card" *ngFor="let p of providers">
            <div class="card-body">
              <div class="identity">
                <span class="avatar">{{ logo(p) }}</span>
                <span class="stack"><strong>{{ p }}</strong><span class="meta">{{ desc(p) }}</span></span>
              </div>
              <div class="actions">
                <span class="status" *ngIf="connection(p)">Configured</span>
                <button class="button-secondary" type="button" (click)="open(p)">{{ connection(p) ? 'Configure' : 'Connect' }}</button>
                <button class="button-quiet" *ngIf="connection(p)" type="button" (click)="test(connection(p))">Test</button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <qai-modal [open]="show" [title]="provider + ' integration'" (close)="show = false">
        <form class="form" (ngSubmit)="save()">
          <div class="section-header">
            <div><h3>Connect {{ provider }}</h3><p>Give the connection a clear workspace name. Credentials are stored separately from visible configuration.</p></div>
          </div>
          <label>Connection name
            <input [(ngModel)]="form.name" name="name" placeholder="{{ provider }} – Production" />
            <small class="meta">Helps administrators identify the correct account later.</small>
          </label>
          <qai-callout
            icon="i"
            title="Provider authorization"
            text="A provider-specific OAuth or credential screen belongs here. Until that adapter is available, only administrators should use advanced configuration."
          />
          <button class="button-quiet" type="button" (click)="advanced = !advanced">{{ advanced ? 'Hide' : 'Show' }} advanced configuration</button>
          <label *ngIf="advanced">Configuration JSON
            <textarea [(ngModel)]="form.settingsJson" name="settings"></textarea>
            <small class="meta">Administrator-only adapter settings. Secrets must not be pasted here.</small>
          </label>
          <div class="actions">
            <button class="button-secondary" type="button" (click)="show = false">Cancel</button>
            <button class="button-primary" type="submit">Save connection</button>
          </div>
        </form>
      </qai-modal>
    </main>
  `,
})
export class IntegrationsPage implements OnInit {
  providers: string[] = [
    "HubSpot",
    "Salesforce",
    "Pipedrive",
    "Slack",
    "Microsoft Teams",
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

  ngOnInit() { this.load(); }

  t(value: string) { return adminText(this.i18n, value); }

  load() {
    this.data.list().subscribe((r) => (this.connections = r));
    this.data.senders().subscribe((r) => (this.senders = r));
    this.data.providers().subscribe({
      next: (r) => { if (r?.length) this.providers = r; },
    });
  }

  addSender() {
    this.data.configureSender(this.sender).subscribe({
      next: (r) => { this.load(); alert(this.t(r.instruction || "Sender configured.")); },
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
    this.data.suppress(this.suppression.email, this.suppression.reason).subscribe(() => {
      alert(this.t("Recipient suppressed."));
      this.suppression.email = "";
    });
  }

  connection(p: string) {
    return this.connections.find((x) => String(x.provider).toLowerCase() === p.toLowerCase());
  }

  open(p: string) {
    this.provider = p;
    const c = this.connection(p);
    this.form = c ? { ...c } : { provider: p, name: p + " connection", status: 1, settingsJson: "{}", secretReference: "" };
    this.advanced = false;
    this.show = true;
  }

  get connectedCount() {
    return this.connections.filter(x => x?.enabled !== false || String(x?.status).toLowerCase() === 'connected' || String(x?.status).toLowerCase() === 'configured').length;
  }

  get verifiedSenderCount() { return this.senders.filter(x => x.status === 1).length; }

  get senderStep() {
    if (!this.senders.length) return 1;
    if (!this.senders.some((s) => s.status === 1)) return 2;
    return 3;
  }

  save() {
    const op = this.form.id ? this.data.update(this.form.id, this.form) : this.data.create(this.form);
    op.subscribe((r) => {
      const i = this.connections.findIndex((x) => x.id === r.id);
      i >= 0 ? (this.connections[i] = r) : this.connections.push(r);
      this.show = false;
    });
  }

  test(c: any) {
    this.data.test(c.id).subscribe({
      next: (r) => alert(this.t(`${c.provider}: ${r.success ? "connection OK" : "test failed"}`)),
      error: () => alert(this.t("Integration test failed.")),
    });
  }

  logo(p: string) {
    return p.split(" ").map((x) => x[0]).join("").slice(0, 2);
  }

  desc(p: string) {
    return p.includes("Calendar")
      ? this.t("Book meetings automatically")
      : p === "Slack" || p.includes("Teams")
        ? this.t("Notify sales and support teams")
        : p.includes("Webhook")
          ? this.t("Send events to external systems")
          : this.t("Sync contacts, leads and opportunities");
  }
}
