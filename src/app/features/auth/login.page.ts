import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../../core/auth.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="login">
    <section class="login-hero">
      <div class="brand"><span class="brand-mark">Q</span><div><b>Qualify</b><strong>AI</strong><small>Business automation</small></div></div>
      <div class="hero-copy">
        <span class="eyebrow">FROM PROSPECT TO CUSTOMER</span>
        <h1>Turn market signals into <em>qualified revenue.</em></h1>
        <p>Discover companies, prioritize buying intent and run approval-controlled outreach from one clear workspace.</p>
        <div class="workflow">
          <div class="workflow-head"><span>ACTIVE WORKFLOW</span><b>Renova acquisition</b><i>LIVE</i></div>
          <div class="workflow-step done"><span>✓</span><div><b>Market & product profile</b><small>Exterior Finish · Albania · Balkans</small></div></div>
          <div class="workflow-step active"><span>02</span><div><b>Prospecting & qualification</b><small>Distributors · wholesalers · contractors</small></div><i>Ready</i></div>
          <div class="workflow-step"><span>03</span><div><b>Approved outreach</b><small>Starts after sender review</small></div></div>
        </div>
        <div class="benefits"><span>✓ Tenant-isolated workspace</span><span>✓ Human approval before send</span><span>✓ Complete audit trail</span></div>
      </div>
    </section>

    <section class="login-panel">
      <div class="form-wrap">
        <div class="form-icon">→</div>
        <span class="form-eyebrow">SECURE WORKSPACE ACCESS</span>
        <h2>Welcome back</h2>
        <p class="form-intro">Sign in to continue to your acquisition workspace.</p>

        <form (ngSubmit)="submit()" novalidate>
          <label><span>Workspace</span><input [(ngModel)]="tenant" name="tenant" autocomplete="organization" placeholder="Workspace name" /></label>
          <label><span>Email or admin</span><input [(ngModel)]="email" name="email" type="text" autocomplete="username" placeholder="Email or username" /></label>
          <label><span>Password</span><input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" placeholder="Enter your password" /></label>
          <label *ngIf="mfaRequired"><span>Authenticator code</span><input [(ngModel)]="mfaCode" name="mfaCode" inputmode="numeric" autocomplete="one-time-code" placeholder="6-digit code" /></label>
          <div class="form-meta"><span>Protected enterprise access</span><span>Session secured</span></div>
          <button type="submit" [disabled]="submitting">{{ submitting ? "Signing in…" : mfaRequired ? "Verify & sign in" : "Sign in" }}<span>→</span></button>
          <div class="error" *ngIf="error">{{ error }}</div>
        </form>
        <div class="demo"><span>DEMO WORKSPACE</span><b>Renova</b><small>Demo credentials are pre-filled for local development.</small></div>
        <small class="copyright">QualifyAI · Business automation platform</small>
      </div>
    </section>
  </div>`,
  styles: [`
    :host { display:block; min-height:100vh; }
    .login { min-height:100vh; display:grid; grid-template-columns:minmax(0,1.08fr) minmax(420px,.92fr); background:#f4f7f7; color:#17212b; }
    .login-hero { position:relative; overflow:hidden; padding:44px clamp(40px,6vw,96px); background:#17343a; color:#fff; display:flex; flex-direction:column; }
    .login-hero:after { content:""; position:absolute; width:460px; height:460px; right:-180px; bottom:-180px; border:1px solid rgba(79,209,197,.18); border-radius:50%; box-shadow:0 0 0 80px rgba(79,209,197,.025),0 0 0 160px rgba(79,209,197,.018); pointer-events:none; }
    .brand { display:flex; align-items:center; gap:12px; position:relative; z-index:1; }
    .brand-mark { width:38px; height:38px; display:grid; place-items:center; border-radius:10px; background:#4fd1c5; color:#17343a; font-size:20px; font-weight:800; }
    .brand div { display:grid; grid-template-columns:auto auto; column-gap:4px; align-items:center; }
    .brand b { font-size:19px; font-weight:700; }.brand strong { color:#4fd1c5; font-size:19px; }.brand small { grid-column:1/-1; color:#9db1b5; font-size:10px; letter-spacing:.08em; text-transform:uppercase; margin-top:1px; }
    .hero-copy { max-width:680px; margin:auto 0; position:relative; z-index:1; }
    .eyebrow,.form-eyebrow { color:#4fd1c5; font-size:11px; font-weight:700; letter-spacing:.16em; }
    .hero-copy h1 { max-width:620px; margin:18px 0 16px; font-size:clamp(34px,4vw,52px); line-height:1.08; letter-spacing:-.035em; font-weight:650; }.hero-copy h1 em { color:#4fd1c5; font-style:normal; }.hero-copy p { max-width:590px; margin:0 0 30px; color:#b9c9cc; font-size:15px; line-height:1.7; }
    .workflow { max-width:620px; padding:18px; border:1px solid rgba(255,255,255,.1); border-radius:12px; background:rgba(255,255,255,.045); backdrop-filter:blur(8px); }.workflow-head { display:flex; align-items:center; gap:10px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,.08); }.workflow-head span { color:#4fd1c5; font-size:9px; font-weight:700; letter-spacing:.12em; }.workflow-head b { font-size:12px; font-weight:600; flex:1; }.workflow-head i { font-style:normal; color:#7de0d7; font-size:9px; font-weight:700; }
    .workflow-step { min-height:58px; display:flex; align-items:center; gap:12px; padding:10px 4px; border-bottom:1px solid rgba(255,255,255,.07); }.workflow-step:last-child{border-bottom:0}.workflow-step>span { width:28px;height:28px;border-radius:8px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);color:#9db1b5;font-size:10px;font-weight:700; }.workflow-step.done>span,.workflow-step.active>span { background:#4fd1c5;color:#17343a;border-color:#4fd1c5; }.workflow-step div{flex:1}.workflow-step b{display:block;font-size:12px;font-weight:600}.workflow-step small{display:block;margin-top:3px;color:#91a7ab;font-size:10px}.workflow-step>i{font-style:normal;color:#4fd1c5;font-size:9px;font-weight:700}.benefits{display:flex;gap:18px;flex-wrap:wrap;margin-top:22px;color:#91a7ab;font-size:10px}.benefits span:first-child{color:#c5d3d5}
    .login-panel { display:flex; align-items:center; justify-content:center; padding:40px; background:#fff; }.form-wrap{width:min(390px,100%)}.form-icon{width:42px;height:42px;border-radius:11px;background:#e9f7f6;color:#247f7b;display:grid;place-items:center;font-size:20px;font-weight:700;margin-bottom:20px}.form-wrap h2{margin:10px 0 7px;font-size:30px;line-height:1.15;letter-spacing:-.025em;font-weight:650}.form-intro{margin:0 0 28px;color:#71808a;font-size:13px;line-height:1.5}.form-wrap form{display:grid;gap:17px}.form-wrap label{display:grid;gap:7px}.form-wrap label span{font-size:11px;font-weight:650;color:#34434d}.form-wrap input{width:100%;height:46px;padding:0 13px;border:1px solid #d8e1e3;border-radius:8px;background:#fff;color:#17212b;outline:none;transition:border-color .15s,box-shadow .15s}.form-wrap input::placeholder{color:#a4afb4}.form-wrap input:focus{border-color:#4f8f91;box-shadow:0 0 0 3px rgba(79,143,145,.11)}.form-meta{display:flex;justify-content:space-between;color:#8a969b;font-size:10px;margin-top:-3px}.form-wrap button{height:47px;border:0;border-radius:8px;background:#247f7b;color:#fff;font-weight:650;font-size:13px;display:flex;align-items:center;justify-content:center;gap:12px;box-shadow:0 5px 14px rgba(36,127,123,.18);transition:background .15s,transform .15s}.form-wrap button:hover:not(:disabled){background:#1c6b68;transform:translateY(-1px)}.form-wrap button:disabled{opacity:.6;cursor:not-allowed}.form-wrap button span{font-size:17px}.error{padding:11px 12px;border:1px solid #f1caca;background:#fff5f5;color:#b33e3e;border-radius:8px;font-size:11px;line-height:1.45}.demo{margin-top:22px;padding:13px 14px;border:1px solid #e2e8e9;border-radius:9px;background:#f8faf9}.demo span{display:block;color:#247f7b;font-size:9px;font-weight:700;letter-spacing:.1em}.demo b{display:block;margin-top:4px;font-size:12px}.demo small{display:block;margin-top:3px;color:#8a969b;font-size:10px}.copyright{display:block;margin-top:24px;color:#a1aaae;font-size:9px;text-align:center;letter-spacing:.04em}
    @media (max-width:900px){.login{grid-template-columns:1fr}.login-hero{min-height:420px;padding:30px}.hero-copy{margin-top:55px}.workflow{display:none}.login-panel{padding:36px 24px}.benefits{display:none}} @media (max-width:520px){.login-hero{min-height:340px}.hero-copy h1{font-size:34px}.login-panel{align-items:flex-start;padding-top:44px}.form-wrap{width:100%}}
  `],
})
export class LoginPage {
  tenant = "renova";
  email = "renovaadmin";
  password = "RenovaAdmin123!ChangeMe";
  mfaCode = "";
  mfaRequired = false;
  submitting = false;
  error = "";
  constructor(private auth: AuthService, private router: Router) {}
  submit() {
    if (this.submitting || !this.tenant.trim() || !this.email.trim() || !this.password) return;
    this.submitting = true;
    this.error = "";
    this.auth.login(this.tenant, this.email, this.password, this.mfaCode).subscribe({
      next: () => { this.submitting = false; void this.router.navigate(["/dashboard"]); },
      error: (e: HttpErrorResponse) => {
        this.submitting = false;
        if (e?.error?.error === "mfa_required") { this.mfaRequired = true; this.error = "Enter the 6-digit code from your authenticator app."; }
        else if (e?.error?.error === "invalid_mfa_code") { this.mfaRequired = true; this.error = "Invalid authenticator code."; }
        else this.error = "Sign in failed. Confirm API, workspace and credentials.";
      },
    });
  }
}
