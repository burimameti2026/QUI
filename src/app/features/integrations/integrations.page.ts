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
    >
    <section class="product-journey">
      <header>
        <div>
          <span class="section-kicker">Outbound readiness</span>
          <h2>Connect and verify the channel before launch</h2>
          <p>
            The campaign cannot send until a provider is configured, the sender
            is verified and suppression rules are active.
          </p>
        </div>
      </header>
      <qai-wizard-steps
        [steps]="[
          'Choose provider',
          'Add sender',
          'Verify identity',
          'Ready to send',
        ]"
        [descriptions]="[
          'Brevo, SendGrid or SMTP',
          'Name and email',
          'Provider confirmation',
          'Approval still required',
        ]"
        [current]="senderStep"
      />
    </section>
    <div class="grid2">
      <section class="panel">
        <header>
          <div>
            <b>Verified email senders</b
            ><span>Required before any outreach can leave the platform</span>
          </div>
        </header>
        <div class="gap" *ngFor="let s of senders">
          <div>
            <b>{{ s.name }}</b
            ><span
              >{{ s.provider | uppercase }} ·
              {{ s.status === 1 ? "Verified" : "Verification required" }}</span
            >
          </div>
          <div class="actions" *ngIf="s.status !== 1">
            <button *ngIf="s.provider !== 'brevo'" (click)="sendVerification(s)">Resend code</button>
            <button (click)="verify(s)">
              {{ s.provider === "brevo" ? "Check verification" : "Enter code" }}
            </button>
          </div>
        </div>
        <form class="form" (ngSubmit)="addSender()">
          <h4 class="section-title">Add a sending identity</h4>
          <p class="section-copy">
            Recipients see this name and address. Use a real mailbox on your
            company domain.
          </p>
          <div class="form2">
            <label
              >From name<input
                [(ngModel)]="sender.name"
                name="senderName"
              /><small class="field-help"
                >Example: Burim from FusionFleet</small
              ></label
            ><label
              >From email<input
                type="email"
                [(ngModel)]="sender.email"
                name="senderEmail"
                required
              /><small class="field-help"
                >Must be verified by the selected provider.</small
              ></label
            >
          </div>
          <label
            >Provider<select
              [(ngModel)]="sender.provider"
              name="senderProvider"
            >
              <option value="brevo">Brevo (recommended)</option>
              <option>smtp</option>
              <option>sendgrid</option>
            </select></label
          ><qai-callout
            *ngIf="sender.provider === 'brevo'"
            icon="i"
            title="Brevo verification"
            text="QualifyAI checks Brevo for this sender. If Brevo API access is IP-restricted, use SMTP credentials instead."
          /><button
            class="primary"
            type="submit"
            [disabled]="!sender.name.trim() || !sender.email.trim()"
          >
            Configure sender
          </button>
        </form>
      </section>
      <section class="panel">
        <header>
          <div>
            <b>Suppression list</b
            ><span>Prevent outreach to opted-out recipients</span>
          </div>
        </header>
        <form class="form" (ngSubmit)="suppress()">
          <label
            >Email<input
              type="email"
              [(ngModel)]="suppression.email"
              name="suppressEmail"
              required /></label
          ><label
            >Reason<input
              [(ngModel)]="suppression.reason"
              name="reason" /></label
          ><button type="submit">Add suppression</button>
        </form>
      </section>
    </div>
    <div class="integration-grid">
      <article *ngFor="let p of providers">
        <i>{{ logo(p) }}</i>
        <div>
          <b>{{ p }}</b
          ><span>{{ desc(p) }}</span>
        </div>
        <span class="pill success" *ngIf="connection(p)">Configured</span
        ><button (click)="open(p)">
          {{ connection(p) ? "Configure" : "Connect" }}</button
        ><button *ngIf="connection(p)" (click)="test(connection(p))">
          Test
        </button>
      </article>
    </div>
    <qai-modal
      [open]="show"
      [title]="provider + ' integration'"
      (close)="show = false"
      ><form class="form" (ngSubmit)="save()">
        <h4 class="section-title">Connect {{ provider }}</h4>
        <p class="section-copy">
          Give the connection a clear workspace name. Credentials are stored
          separately from visible configuration.
        </p>
        <label
          >Connection name<input
            [(ngModel)]="form.name"
            name="name"
            placeholder="{{ provider }} – Production"
          /><small class="field-help"
            >Helps administrators identify the correct account later.</small
          ></label
        ><qai-callout
          icon="i"
          title="Provider authorization"
          text="A provider-specific OAuth or credential screen belongs here. Until that adapter is available, only administrators should use advanced configuration."
        /><button type="button" class="link" (click)="advanced = !advanced">
          {{ advanced ? "Hide" : "Show" }} advanced configuration</button
        ><label *ngIf="advanced"
          >Configuration JSON<textarea
            class="large"
            [(ngModel)]="form.settingsJson"
            name="settings"
          ></textarea
          ><small class="field-help"
            >Administrator-only adapter settings. Secrets must not be pasted
            here.</small
          ></label
        >
        <footer>
          <button type="button" (click)="show = false">Cancel</button
          ><button class="primary" type="submit">Save connection</button>
        </footer>
      </form></qai-modal
    >`,
  styles: [`
    :host { display:block; min-height:100%; background:#f5f7fb; color:#101828; }
    .product-journey { margin:0 28px 14px; overflow:hidden; border:1px solid #e5e9f0; border-radius:10px; background:#fff; box-shadow:0 1px 2px rgba(16,24,40,.03),0 4px 14px rgba(36,60,88,.045); }
    .product-journey > header { display:flex; align-items:flex-start; justify-content:space-between; gap:20px; padding:18px 20px 12px; border-bottom:1px solid #edf0f4; background:#fff; }
    .product-journey h2 { margin:4px 0 5px; color:#101828; font-size:16px; line-height:1.25; font-weight:700; letter-spacing:-.015em; }
    .product-journey p { max-width:760px; margin:0; color:#667085; font-size:10px; line-height:1.5; }
    .grid2 { display:grid; grid-template-columns:minmax(0,1.15fr) minmax(340px,.85fr); gap:14px; margin:0 28px 14px; align-items:start; }
    .panel { min-width:0; overflow:hidden; border:1px solid #e5e9f0 !important; border-radius:10px !important; background:#fff !important; box-shadow:0 1px 2px rgba(16,24,40,.03),0 4px 14px rgba(36,60,88,.045) !important; }
    .panel > header { min-height:60px !important; padding:14px 16px !important; border-bottom:1px solid #edf0f4 !important; background:#fff !important; }
    .panel > header b { display:block; color:#101828; font-size:12px; font-weight:700; }
    .panel > header span { display:block; margin-top:3px; color:#98a2b3; font-size:9px; }
    .gap { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:62px; padding:10px 16px; border-bottom:1px solid #edf0f4; background:#fff; }
    .gap:last-of-type { border-bottom:0; }
    .gap > div:first-child { min-width:0; }
    .gap b { display:block; overflow:hidden; color:#172033; font-size:10px; font-weight:700; text-overflow:ellipsis; white-space:nowrap; }
    .gap span { display:block; margin-top:3px; color:#8293a7; font-size:8px; letter-spacing:.02em; text-transform:uppercase; }
    .actions { display:flex; align-items:center; gap:6px; flex:0 0 auto; }
    .actions button, .grid2 button { height:31px !important; min-height:31px !important; padding:0 10px !important; border:1px solid #dfe5ed !important; border-radius:7px !important; background:#fff !important; color:#475467 !important; font-size:9px !important; font-weight:700 !important; }
    .actions button:hover, .grid2 button:hover { border-color:#cfd8e4 !important; background:#f8fafc !important; color:#172033 !important; }
    .form { display:grid; gap:11px; padding:16px; }
    .form label { display:grid; gap:6px; color:#667085; font-size:9px; font-weight:700; }
    .form input, .form select, .form textarea { width:100%; min-height:36px !important; border:1px solid #dfe5ed !important; border-radius:8px !important; background:#fff !important; color:#101828 !important; font-size:10px !important; }
    .form2 { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .section-title { margin:4px 0 -5px; color:#172033; font-size:11px; font-weight:750; }
    .section-copy { margin:0; color:#8293a7; font-size:9px; line-height:1.45; }
    .field-help { color:#98a2b3; font-size:8px; font-weight:500; line-height:1.35; }
    .form > .primary { justify-self:start; height:34px !important; min-height:34px !important; padding:0 13px !important; border:0 !important; border-radius:8px !important; background:#2563eb !important; color:#fff !important; font-size:10px !important; font-weight:700 !important; }
    .form > .primary:hover { background:#1d4ed8 !important; }
    .integration-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin:0 28px 24px; }
    .integration-grid > article { position:relative; display:grid; grid-template-columns:36px minmax(0,1fr); grid-template-rows:auto auto auto; column-gap:10px; row-gap:3px; min-width:0; min-height:148px; padding:15px; overflow:hidden; border:1px solid #e5e9f0; border-radius:10px; background:#fff; box-shadow:0 1px 2px rgba(16,24,40,.03); }
    .integration-grid > article:hover { border-color:#d7dee8; box-shadow:0 4px 14px rgba(36,60,88,.06); transform:translateY(-1px); }
    .integration-grid i { grid-row:1 / span 2; display:grid; width:36px; height:36px; place-items:center; border-radius:9px; background:#f2f5f9; color:#334155; font-size:11px; font-style:normal; font-weight:800; letter-spacing:.03em; }
    .integration-grid article > div { min-width:0; }
    .integration-grid article > div b { display:block; color:#172033; font-size:11px; font-weight:750; }
    .integration-grid article > div span { display:block; margin-top:3px; color:#8293a7; font-size:9px; line-height:1.4; }
    .integration-grid .pill { grid-column:2; justify-self:start; padding:4px 7px; border:1px solid #ccebd9; border-radius:999px; background:#f0faf4; color:#15803d; font-size:8px; font-weight:750; }
    .integration-grid > article > button { height:31px !important; min-height:31px !important; padding:0 10px !important; border:1px solid #dfe5ed !important; border-radius:7px !important; background:#fff !important; color:#475467 !important; font-size:9px !important; font-weight:700 !important; }
    .integration-grid > article > button:hover { border-color:#f5b790 !important; color:#c2410c !important; background:#fffaf6 !important; }
    .large { min-height:140px !important; padding:9px 10px !important; resize:vertical; }
    .link { width:max-content; height:auto !important; min-height:0 !important; padding:0 !important; border:0 !important; background:transparent !important; color:#2563eb !important; font-size:9px !important; font-weight:700 !important; }
    .link:hover { background:transparent !important; color:#1d4ed8 !important; }
    footer { display:flex; justify-content:flex-end; gap:8px; padding-top:4px; }
    footer button { min-width:84px; }
    @media (max-width:1100px) { .integration-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } .grid2 { grid-template-columns:1fr; } }
    @media (max-width:760px) { .product-journey,.grid2,.integration-grid { margin-left:16px; margin-right:16px; } .form2 { grid-template-columns:1fr; } .integration-grid { grid-template-columns:1fr; } }
    @media (max-width:560px) { .product-journey,.grid2,.integration-grid { margin-left:0; margin-right:0; } .gap { align-items:flex-start; flex-direction:column; } .actions { width:100%; } }
  `]
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
