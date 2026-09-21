import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { AdminI18nService, AdminLanguage } from '../../core/admin-i18n.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.css'
})
export class LandingPage {
  readonly languages = [
    { code: 'en' as AdminLanguage, label: 'EN' },
    { code: 'mk' as AdminLanguage, label: 'MK' },
    { code: 'sq' as AdminLanguage, label: 'SQ' },
    { code: 'de' as AdminLanguage, label: 'DE' }
  ];
  readonly year = new Date().getFullYear();
  demoRequest = { name: '', email: '', company: '', message: '', website: '' };
  submittingDemo = false;
  demoRequestMessage = '';
  demoRequestError = '';

  t(key: string): string { return this.i18n.t(key); }

  constructor(readonly auth: AuthService, private readonly api: ApiService, readonly i18n: AdminI18nService) {
    document.documentElement.lang = this.i18n.language();
  }

  get language(): AdminLanguage { return this.i18n.language(); }
  setLanguage(language: AdminLanguage): void { this.i18n.setLanguage(language); }

  requestDemo(): void {
    if (!this.demoRequest.name.trim() || !this.demoRequest.email.includes('@')) {
      this.demoRequestError = 'Enter your name and a valid work email.';
      return;
    }
    this.submittingDemo = true;
    this.demoRequestError = '';
    this.demoRequestMessage = '';
    this.api.post<any>('public/demo-requests', this.demoRequest).subscribe({
      next: () => {
        this.submittingDemo = false;
        this.demoRequestMessage = 'Thanks — your request is with our product team. We will reply shortly.';
        this.demoRequest = { name: '', email: '', company: '', message: '', website: '' };
      },
      error: error => {
        this.submittingDemo = false;
        this.demoRequestError = error?.error?.detail || 'Your request could not be sent right now. Please try again.';
      }
    });
  }
}
