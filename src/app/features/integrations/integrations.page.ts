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
    <section class="integration-metrics">
      <article><span class="metric-icon">✓</span><div><small>Connected</small><strong>{{ connectedCount }}</strong><em>Configured providers</em></div></article>
      <article><span class="metric-icon">◈</span><div><small>Available</small><strong>{{ providers.length }}</strong><em>Provider adapters</em></div></article>
      <article><span class="metric-icon">✉</span><div><small>Verified senders</small><strong>{{ verifiedSenderCount }}</strong><em>Ready identities</em></div></article>
      <article><span class="metric-icon">!</span><div><small>Suppression</small><strong>Active</strong><em>Opt-out protection</em></div></article>
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
  styles: [`:host{display:block;min-height:100%;background:#f5f7fb;color:#101828}
qai-page-header .page-header{margin:0 20px!important;padding:20px 0 16px!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important}
qai-page-header .page-header h1{color:#202124!important;font-size:22px!important;font-weight:700!important;letter-spacing:-.02em!important}qai-page-header .page-header p{margin-top:5px!important;color:#667085!important;font-size:10px!important;line-height:1.5!important}
qai-page-header .page-header button{height:34px!important;min-height:34px!important;padding:0 12px!important;border:1px solid #dfe5ed!important;border-radius:8px!important;background:#fff!important;color:#475467!important;font-size:9px!important;font-weight:700!important}qai-page-header .page-header button:hover{border-color:var(--brand-primary-border)!important;background:#fffaf6!important;color:var(--brand-primary)!important}
.product-journey{margin:0 20px 14px!important;overflow:hidden!important;border:1px solid #e3e8ef!important;border-radius:12px!important;background:#fff!important;box-shadow:0 2px 5px rgba(16,24,40,.035),0 7px 18px rgba(36,60,88,.05)!important}.product-journey>header{padding:16px 20px 12px!important;border-bottom:1px solid #edf0f4!important;background:linear-gradient(180deg,#fff,#fcfdff)!important}.product-journey .section-kicker{color:var(--brand-primary)!important;font-size:9px!important;font-weight:800!important;letter-spacing:.11em!important}.product-journey h2{margin:4px 0 5px!important;color:var(--brand-primary)!important;font-size:15px!important;line-height:1.3!important}.product-journey p{margin:0!important;max-width:760px!important;color:#667085!important;font-size:9px!important;line-height:1.55!important}
.product-journey qai-wizard-steps{display:block!important;padding:10px 16px 14px!important}
.integration-metrics{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important;margin:0 20px 14px!important}.integration-metrics article{position:relative!important;display:flex!important;gap:11px!important;min-height:92px!important;padding:15px 16px!important;border:1px solid #e3e8ef!important;border-radius:10px!important;background:#fff!important;box-shadow:0 2px 5px rgba(16,24,40,.035),0 7px 18px rgba(36,60,88,.05)!important}.integration-metrics article:before{content:""!important;position:absolute!important;top:0!important;left:0!important;width:100%!important;height:3px!important;border-radius:10px 10px 0 0!important;background:#059669!important}.integration-metrics article:nth-child(2):before{background:#7c3aed!important}.integration-metrics article:nth-child(3):before{background:var(--brand-primary)!important}.integration-metrics article:nth-child(4):before{background:#e11d48!important}.integration-metrics .metric-icon{display:grid!important;width:32px!important;height:32px!important;flex:0 0 32px!important;place-items:center!important;border-radius:8px!important;background:#eaf9f1!important;color:#059669!important;font-size:11px!important;font-weight:800!important}.integration-metrics article:nth-child(2) .metric-icon{background:#f2edff!important;color:#7c3aed!important}.integration-metrics article:nth-child(3) .metric-icon{background:var(--brand-primary-soft)!important;color:var(--brand-primary)!important}.integration-metrics article:nth-child(4) .metric-icon{background:#ffedf1!important;color:#e11d48!important}.integration-metrics small,.integration-metrics em{display:block!important;color:#667085!important;font-size:8px!important;line-height:1.35!important;font-style:normal!important}.integration-metrics strong{display:block!important;margin:5px 0 2px!important;color:#172033!important;font-size:22px!important;line-height:1!important}.integration-metrics em{color:#8293a7!important}
.grid2{display:grid!important;grid-template-columns:minmax(0,1.15fr) minmax(340px,.85fr)!important;gap:10px!important;margin:0 20px 14px!important;align-items:start!important}.panel{min-width:0!important;overflow:hidden!important;border:1px solid #e3e8ef!important;border-radius:12px!important;background:#fff!important;box-shadow:0 2px 5px rgba(16,24,40,.035),0 7px 18px rgba(36,60,88,.05)!important}.panel>header{min-height:62px!important;padding:14px 16px!important;border-bottom:1px solid #edf0f4!important;background:linear-gradient(180deg,#fff,#fcfdff)!important}.panel>header b{display:block!important;color:var(--brand-primary)!important;font-size:13px!important;font-weight:750!important}.panel>header span{display:block!important;margin-top:3px!important;color:#8293a7!important;font-size:8px!important}
.gap{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;min-height:66px!important;padding:11px 16px!important;border-bottom:1px solid #edf0f4!important;background:#fff!important}.gap:last-of-type{border-bottom:0!important}.gap b{color:#172033!important;font-size:10px!important;font-weight:750!important}.gap span{display:block!important;margin-top:3px!important;color:#8293a7!important;font-size:8px!important;text-transform:uppercase!important}.actions{display:flex!important;align-items:center!important;gap:6px!important}.actions button,.grid2 button{height:30px!important;min-height:30px!important;padding:0 9px!important;border:1px solid #dfe5ed!important;border-radius:7px!important;background:#fff!important;color:#475467!important;font-size:8px!important;font-weight:700!important}.actions button:hover,.grid2 button:hover{border-color:var(--brand-primary-border)!important;background:#fffaf6!important;color:var(--brand-primary)!important}
.form{display:grid!important;gap:11px!important;padding:16px!important}.form label{display:grid!important;gap:6px!important;color:#667085!important;font-size:9px!important;font-weight:700!important}.form input,.form select,.form textarea{width:100%!important;min-height:36px!important;border:1px solid #dfe5ed!important;border-radius:8px!important;background:#fff!important;color:#101828!important;font-size:10px!important}.form input:focus,.form select:focus,.form textarea:focus{border-color:var(--brand-primary)!important;box-shadow:0 0 0 3px rgba(249,115,22,.08)!important;outline:0!important}.form2{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important}.section-title{margin:4px 0 -4px!important;color:var(--brand-primary)!important;font-size:11px!important;font-weight:750!important}.section-copy{margin:0!important;color:#8293a7!important;font-size:9px!important;line-height:1.5!important}.field-help{color:#98a2b3!important;font-size:8px!important;font-weight:500!important;line-height:1.35!important}.form>.primary{justify-self:start!important;height:34px!important;min-height:34px!important;padding:0 13px!important;border:0!important;border-radius:8px!important;background:var(--brand-primary)!important;color:#fff!important;font-size:9px!important;font-weight:750!important}.form>.primary:hover{background:var(--brand-primary-hover)!important}
.integration-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important;margin:0 20px 24px!important}.integration-grid>article{position:relative!important;display:grid!important;grid-template-columns:36px minmax(0,1fr)!important;grid-template-rows:auto auto auto!important;column-gap:10px!important;row-gap:5px!important;min-width:0!important;min-height:154px!important;padding:15px!important;overflow:hidden!important;border:1px solid #e3e8ef!important;border-radius:10px!important;background:#fff!important;box-shadow:0 2px 5px rgba(16,24,40,.03),0 7px 18px rgba(36,60,88,.04)!important}.integration-grid>article:before{content:""!important;position:absolute!important;top:0!important;left:0!important;width:100%!important;height:3px!important;border-radius:10px 10px 0 0!important;background:#dfe5ed!important}.integration-grid>article:has(.pill.success):before{background:#059669!important}.integration-grid>article:hover{border-color:#d7dee8!important;box-shadow:0 6px 18px rgba(36,60,88,.07)!important;transform:translateY(-1px)!important}.integration-grid i{grid-row:1 / span 2!important;display:grid!important;width:36px!important;height:36px!important;place-items:center!important;border-radius:9px!important;background:#f2f5f9!important;color:#334155!important;font-size:10px!important;font-style:normal!important;font-weight:800!important}.integration-grid article>div{min-width:0!important}.integration-grid article>div b{display:block!important;color:var(--brand-primary)!important;font-size:11px!important;font-weight:750!important}.integration-grid article>div span{display:block!important;margin-top:3px!important;color:#8293a7!important;font-size:8px!important;line-height:1.45!important}.integration-grid .pill{grid-column:2!important;justify-self:start!important;padding:4px 7px!important;border:1px solid #ccebd9!important;border-radius:999px!important;background:#f0faf4!important;color:#15803d!important;font-size:8px!important;font-weight:750!important}.integration-grid>article>button{height:29px!important;min-height:29px!important;padding:0 9px!important;border:1px solid #dfe5ed!important;border-radius:7px!important;background:#fff!important;color:#475467!important;font-size:8px!important;font-weight:700!important}.integration-grid>article>button:hover{border-color:var(--brand-primary-border)!important;background:#fffaf6!important;color:var(--brand-primary)!important}.integration-grid>article>button.primary{background:var(--brand-primary)!important;border-color:var(--brand-primary)!important;color:#fff!important}
.large{min-height:140px!important;padding:9px 10px!important;resize:vertical}.link{width:max-content!important;height:auto!important;min-height:0!important;padding:0!important;border:0!important;background:transparent!important;color:var(--brand-accent)!important;font-size:9px!important;font-weight:700!important}.link:hover{background:transparent!important;color:var(--brand-accent-hover)!important}footer{display:flex!important;justify-content:flex-end!important;gap:8px!important;padding-top:4px!important}footer button{min-width:84px!important}
@media(max-width:1100px){qai-page-header .page-header,.product-journey,.integration-metrics,.grid2,.integration-grid{margin-left:16px!important;margin-right:16px!important}.integration-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}.grid2{grid-template-columns:1fr!important}.integration-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:700px){qai-page-header .page-header,.product-journey,.integration-metrics,.grid2,.integration-grid{margin-left:12px!important;margin-right:12px!important}.integration-metrics,.integration-grid{grid-template-columns:1fr!important}.form2{grid-template-columns:1fr!important}.gap{align-items:flex-start!important;flex-direction:column!important}.actions{width:100%!important}.actions button{flex:1!important}}
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
  get connectedCount() { return this.connections.filter(x => x?.enabled !== false || String(x?.status).toLowerCase() === 'connected' || String(x?.status).toLowerCase() === 'configured').length; }
  get verifiedSenderCount() { return this.senders.filter(x => x.status === 1).length; }
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
