import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../../core/auth.service";
import { AdminI18nService } from "../../core/admin-i18n.service";
import { adminText } from "../../core/admin-page-translations";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<div class="login">
    <section class="login-hero">
      <div class="brand"><span class="brand-mark">Q</span><div><b>Qualify</b><strong>AI</strong><small>{{ t('Business automation') }}</small></div></div>
      <div class="hero-copy">
        <span class="eyebrow">{{ t('FROM PROSPECT TO CUSTOMER') }}</span>
        <h1>{{ t('Turn market signals into') }} <em>{{ t('qualified revenue.') }}</em></h1>
        <p>{{ t('Discover companies, prioritize buying intent and run approval-controlled outreach from one clear workspace.') }}</p>
        <div class="workflow">
          <div class="workflow-head"><span>{{ t('ACTIVE WORKFLOW') }}</span><b>{{ t('Renova acquisition') }}</b><i>{{ t('LIVE') }}</i></div>
          <div class="workflow-step done"><span>✓</span><div><b>{{ t('Market & product profile') }}</b><small>{{ t('Exterior Finish · Albania · Balkans') }}</small></div></div>
          <div class="workflow-step active"><span>02</span><div><b>{{ t('Prospecting & qualification') }}</b><small>{{ t('Distributors · wholesalers · contractors') }}</small></div><i>{{ t('Ready') }}</i></div>
          <div class="workflow-step"><span>03</span><div><b>{{ t('Approved outreach') }}</b><small>{{ t('Starts after sender review') }}</small></div></div>
        </div>
        <div class="benefits"><span>✓ {{ t('Tenant-isolated workspace') }}</span><span>✓ {{ t('Human approval before send') }}</span><span>✓ {{ t('Complete audit trail') }}</span></div>
      </div>
    </section>

    <section class="login-panel">
      <div class="form-wrap">
        <div class="login-language"><span>{{ t('Language') }}</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)" name="language"><option *ngFor="let l of i18n.languages" [value]="l.code">{{ l.label }}</option></select></div>
        <div class="form-icon">→</div>
        <span class="form-eyebrow">{{ t('SECURE WORKSPACE ACCESS') }}</span>
        <h2>{{ t('Welcome back') }}</h2>
        <p class="form-intro">{{ t('Sign in to continue to your acquisition workspace.') }}</p>
        <form (ngSubmit)="submit()" novalidate>
          <label><span>{{ t('Workspace') }}</span><input [(ngModel)]="tenant" name="tenant" autocomplete="organization" [placeholder]="t('Workspace name')" /></label>
          <label><span>{{ t('Email or admin') }}</span><input [(ngModel)]="email" name="email" type="text" autocomplete="username" [placeholder]="t('Email or username')" /></label>
          <label><span>{{ t('Password') }}</span><input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" [placeholder]="t('Enter your password')" /></label>
          <label *ngIf="mfaRequired"><span>{{ t('Authenticator code') }}</span><input [(ngModel)]="mfaCode" name="mfaCode" inputmode="numeric" autocomplete="one-time-code" [placeholder]="t('6-digit code')" /></label>
          <div class="form-meta"><span>{{ t('Protected enterprise access') }}</span><span>{{ t('Session secured') }}</span></div>
          <button type="submit" [disabled]="submitting">{{ submitting ? t('Signing in…') : mfaRequired ? t('Verify & sign in') : t('Sign in') }}<span>→</span></button>
          <div class="error" *ngIf="error">{{ t(error) }}</div>
        </form>
        <div class="demo"><span>{{ t('DEMO WORKSPACE') }}</span><b>Renova</b><small>{{ t('Demo credentials are pre-filled for local development.') }}</small></div>
        <small class="copyright">QualifyAI · {{ t('Business automation platform') }}</small>
      </div>
    </section>
  </div>`,
  styleUrl: './login.page.css',
})
export class LoginPage {
  readonly i18n = inject(AdminI18nService);
  tenant = "renova";
  email = "renovaadmin";
  password = "RenovaAdmin123!ChangeMe";
  mfaCode = "";
  mfaRequired = false;
  submitting = false;
  error = "";

  t(value: string): string { return adminText(this.i18n, value); }
  setLanguage(language: string): void { this.i18n.setLanguage(language as any); }

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
