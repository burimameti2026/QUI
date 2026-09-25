import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { AuthService } from "../../core/auth.service";
import { AdminI18nService } from "../../core/admin-i18n.service";
import { adminText } from "../../core/admin-page-translations";

interface LoginTenant { slug: string; label: string; }

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `<main class="auth page-login">
    <section class="hero">
      <div class="identity"><span class="brand-mark">Q</span><div><b>Qualify</b><strong>AI</strong><small>{{ t('Business automation') }}</small></div></div>
      <div class="stack">
        <span class="eyebrow">{{ t('PLATFORM ADMINISTRATION') }}</span>
        <h1>{{ t('Manage clients, licenses and') }} <em>{{ t('business automation.') }}</em></h1>
        <p>{{ t('Sign in to the platform administration workspace to configure clients, packages, access and modules.') }}</p>
        <div class="card"><header class="card-header"><div><span class="eyebrow">{{ t('ADMIN WORKSPACE') }}</span><b>{{ t('Platform administration') }}</b></div><span class="status success">{{ t('READY') }}</span></header>
          <ol class="steps"><li class="list-item"><span class="icon">01</span><div><b>{{ t('Create clients') }}</b><small>{{ t('Set up client access and administration.') }}</small></div></li><li class="list-item"><span class="icon">02</span><div><b>{{ t('Assign packages') }}</b><small>{{ t('Enable the modules and license for each client.') }}</small></div><span class="status">{{ t('Ready') }}</span></li><li class="list-item"><span class="icon">03</span><div><b>{{ t('Client access') }}</b><small>{{ t('Clients sign in to their own environment.') }}</small></div></li></ol>
        </div>
        <div class="facts"><span>✓ {{ t('Tenant-isolated access') }}</span><span>✓ {{ t('License-controlled modules') }}</span><span>✓ {{ t('Complete audit trail') }}</span></div>
      </div>
    </section>
    <section class="card"><div class="card-body">
      <div class="toolbar"><span>{{ t('Language') }}</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)" name="language"><option *ngFor="let l of i18n.languages" [value]="l.code">{{ l.label }}</option></select></div>
      <span class="eyebrow">{{ t('PLATFORM ADMIN ACCESS') }}</span><h2>{{ t('Welcome back') }}</h2><p class="meta">{{ t('Sign in to manage clients, licenses and platform configuration.') }}</p>
      <form class="form" (ngSubmit)="submit()" novalidate>
        <label><span>{{ t('Tenant') }}</span><select [(ngModel)]="tenant" (ngModelChange)="tenantChanged($event)" name="tenant" autocomplete="organization"><option *ngFor="let option of tenantOptions" [value]="option.slug">{{ option.label }} · {{ option.slug }}</option></select></label>
        <label><span>{{ t('Email') }}</span><input [(ngModel)]="email" name="email" type="email" autocomplete="username" [placeholder]="t('Admin email')" /></label>
        <label><span>{{ t('Password') }}</span><input [(ngModel)]="password" name="password" type="password" autocomplete="current-password" [placeholder]="t('Enter your password')" /></label>
        <label *ngIf="mfaRequired"><span>{{ t('Authenticator code') }}</span><input [(ngModel)]="mfaCode" name="mfaCode" inputmode="numeric" autocomplete="one-time-code" [placeholder]="t('6-digit code')" /></label>
        <div class="facts"><span>{{ t('Protected platform access') }}</span><span>{{ t('Tenant selection saved') }}</span></div>
        <button class="button-primary" type="submit" [disabled]="submitting">{{ submitting ? t('Signing in…') : mfaRequired ? t('Verify & sign in') : t('Sign in') }}<span>→</span></button>
        <div class="alert" *ngIf="error">{{ t(error) }}</div>
      </form>
      <div class="notice"><span class="eyebrow">{{ t('SELECTED TENANT') }}</span><b>{{ tenant }}</b><small>{{ t('The selected tenant is saved in this browser for the next test login.') }}</small></div>
      <small class="meta">FindLeadsAI · {{ t('Lead acquisition & business automation platform') }}</small>
    </div></section>
  </main>`,
  styleUrl: './login.page.css',
})
export class LoginPage {
  readonly i18n = inject(AdminI18nService);
  readonly tenantOptions: LoginTenant[] = [
    { slug: "fusionfleet", label: "FusionFleet" },
    { slug: "findleadsai", label: "FindLeadsAI" },
  ];

  tenant = this.readSavedTenant();
  email = "admin@findleadsai.local";
  password = "Admin123!ChangeMe";
  mfaCode = ""; mfaRequired = false; submitting = false; error = "";

  t(value: string): string { return adminText(this.i18n, value); }
  setLanguage(language: string): void { this.i18n.setLanguage(language as any); }
  constructor(private auth: AuthService, private router: Router) {}

  private readSavedTenant(): string {
    if (typeof localStorage === "undefined") return "fusionfleet";
    const saved = localStorage.getItem("qai-tenant")?.trim().toLowerCase();
    return this.tenantOptions.some(x => x.slug === saved) ? saved! : "fusionfleet";
  }

  tenantChanged(value: string): void {
    this.tenant = value.trim().toLowerCase();
    if (typeof localStorage !== "undefined") localStorage.setItem("qai-tenant", this.tenant);
  }

  submit() {
    if (this.submitting || !this.tenant.trim() || !this.email.trim() || !this.password) return;
    this.tenantChanged(this.tenant); this.submitting = true; this.error = "";
    this.auth.login(this.tenant, this.email, this.password, this.mfaCode).subscribe({
      next: () => { this.submitting = false; void this.router.navigate(["/dashboard"]); },
      error: (e: HttpErrorResponse) => {
        this.submitting = false;
        if (e?.error?.error === "mfa_required") { this.mfaRequired = true; this.error = "Enter the 6-digit code from your authenticator app."; }
        else if (e?.error?.error === "invalid_mfa_code") { this.mfaRequired = true; this.error = "Invalid authenticator code."; }
        else this.error = "Sign in failed. Confirm API, tenant and credentials.";
      },
    });
  }
}
