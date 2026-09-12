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
    <header class="login-topbar">
      <div class="login-topbar-brand">
        <i class="product-logo" aria-hidden="true"><span></span><span></span><span></span></i>
        <div><b>Renova</b><small>Business automation</small></div>
      </div>
      <div class="login-topbar-meta"><span>AI-powered revenue workspace</span><em>Secure access</em></div>
    </header>
    <section class="login-hero">
      <div class="login-brand">
        <i class="product-logo" aria-hidden="true"
          ><span></span><span></span><span></span
        ></i>
        <div>
          <b>Qualify</b><strong>AI</strong><small>Business automation</small>
        </div>
      </div>
      <div class="login-hero-content">
        <span class="hero-eyebrow">FROM PROSPECT TO CUSTOMER</span>
        <h1>Turn market signals into <em>qualified revenue.</em></h1>
        <p>
          Discover companies, prioritize real buying intent and run
          approval-controlled outreach from one clear workspace.
        </p>

        <div class="product-preview" aria-label="QualifyAI product workflow preview">
          <header>
            <div><i></i><i></i><i></i></div>
            <span>Renova Balkan distributor acquisition</span>
            <b>DEMO</b>
          </header>
          <div class="preview-body">
            <aside>
              <span>01</span><span class="active">02</span><span>03</span><span>04</span>
            </aside>
            <main>
              <div class="preview-title">
                <div><small>ACTIVE WORKFLOW</small><b>Find construction buyers showing buying intent</b></div>
                <strong>75+</strong>
              </div>
              <div class="preview-flow">
                <article class="done">
                  <i>✓</i>
                  <div><b>Product & market profile</b><small>Exterior Finish · Albania · Balkans</small></div>
                </article>
                <article class="active">
                  <i>⌁</i>
                  <div><b>Prospecting & qualification</b><small>Distributors · wholesalers · contractors</small></div>
                  <em>Ready</em>
                </article>
                <article>
                  <i>→</i>
                  <div><b>Approved proposal outreach</b><small>Starts after sender review</small></div>
                </article>
              </div>
              <footer>
                <span><b>3</b> demo products</span><span><b>3</b> target markets</span><span><b>2</b> sample prospects</span>
              </footer>
            </main>
          </div>
        </div>

        <div class="hero-benefits">
          <span><i>✓</i> Tenant-isolated workspace</span><span><i>✓</i> Human approval before send</span><span><i>✓</i> Complete audit trail</span>
        </div>
      </div>
    </section>
    <form (ngSubmit)="submit()">
      <h2>Renova workspace</h2>
      <p>Sign in to the Renova marketing and acquisition workspace.</p>
      <label>Workspace<input [(ngModel)]="tenant" name="tenant" autocomplete="organization" /></label>
      <label>Email / admin<input [(ngModel)]="email" name="email" type="text" autocomplete="username" /></label>
      <label>Password<input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" /></label>
      <label *ngIf="mfaRequired">Authenticator code<input [(ngModel)]="mfaCode" name="mfaCode" inputmode="numeric" autocomplete="one-time-code" /></label>
      <button class="primary" type="submit" [disabled]="submitting">{{ submitting ? "Signing in…" : mfaRequired ? "Verify & sign in" : "Sign in" }}</button>
      <div class="error" *ngIf="error">{{ error }}</div>
      <div class="demo"><b>Renova demo</b><span>renova · renovaadmin · RenovaAdmin123!ChangeMe</span></div>
    </form>
  </div>`,
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
        if (e?.error?.error === "mfa_required") {
          this.mfaRequired = true;
          this.error = "Enter the 6-digit code from your authenticator app.";
        } else if (e?.error?.error === "invalid_mfa_code") {
          this.mfaRequired = true;
          this.error = "Invalid authenticator code.";
        } else this.error = "Sign in failed. Confirm API, tenant and credentials.";
      },
    });
  }
}
