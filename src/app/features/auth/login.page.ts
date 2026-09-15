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
  styleUrl: './login.page.css',
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
