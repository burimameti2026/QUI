import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Company } from '../../core/models/platform.models';
import { Modal, PageHeader } from '../../shared/ui';
import { CrmService } from './crm.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  styleUrls: ['./companies.page.css'],
  template: `
    <main class="page">
      <qai-page-header title="Companies" subtitle="Account intelligence, firmographics and commercial activity.">
        <button class="button-quiet" (click)="load()" [disabled]="loading">↻ {{ loading ? 'Loading…' : 'Refresh data' }}</button>
        <button class="button-primary" (click)="open()">+ Add company</button>
      </qai-page-header>
      <div class="alert" *ngIf="error"><span class="icon">!</span><div><b>Companies could not be loaded</b><p>{{ error }}</p></div></div>
      <section class="card">
        <header class="card-header">
          <div><span class="eyebrow">CRM DIRECTORY</span><h2>Company workspace</h2><p>Search and manage every account in one consistent directory.</p></div>
          <div class="facts"><span><b>{{ rows.length }}</b>Total</span></div>
        </header>
        <div class="toolbar directory-search">
          <label class="search"><span>⌕</span><input [(ngModel)]="q" placeholder="Search company, domain or industry" /></label>
          <span class="status">{{ visible.length }} shown</span>
        </div>
        <div class="notice" *ngIf="loading">Loading companies…</div>
        <div class="table" *ngIf="!loading && visible.length">
          <table>
            <thead><tr><th>Company</th><th>Domain</th><th>Industry</th><th>Country</th><th>Employees</th><th>Revenue</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let x of visible">
              <td><div class="identity"><span class="avatar">{{ initials(x.name) }}</span><span class="stack"><b>{{ x.name }}</b><small>CRM account</small></span></div></td>
              <td><a class="button-quiet" [href]="companyUrl(x.domain)" target="_blank" rel="noopener">{{ x.domain || '—' }}</a></td>
              <td>{{ x.industry || '—' }}</td><td>{{ x.country || '—' }}</td><td>{{ x.employees || '—' }}</td><td>{{ x.annualRevenue ? money(x.annualRevenue) : '—' }}</td>
              <td><div class="actions"><button class="button-quiet" (click)="open(x)">✎ Edit</button><button class="button-danger" (click)="remove(x)">Delete</button></div></td>
            </tr></tbody>
          </table>
        </div>
        <div class="empty" *ngIf="!loading && !error && !visible.length">
          <i>▦</i><strong>{{ rows.length ? 'No matching companies' : 'No companies yet' }}</strong>
          <span>{{ rows.length ? 'Change the search to see more accounts.' : 'Add a company or install the complete demo scenario.' }}</span>
          <button class="button-primary" *ngIf="!rows.length" (click)="open()">Add company</button>
        </div>
      </section>
      <qai-modal [open]="show" [title]="form.id ? 'Edit company' : 'Add company'" (close)="show = false">
        <form class="form" (ngSubmit)="save()">
          <label>Name<input [(ngModel)]="form.name" name="name" required /></label><label>Domain<input [(ngModel)]="form.domain" name="domain" /></label>
          <div class="content-grid"><label>Industry<input [(ngModel)]="form.industry" name="industry" /></label><label>Country<input [(ngModel)]="form.country" name="country" /></label></div>
          <div class="content-grid"><label>Employees<input type="number" [(ngModel)]="form.employees" name="employees" /></label><label>Annual revenue<input type="number" [(ngModel)]="form.annualRevenue" name="revenue" /></label></div>
          <footer class="actions"><button class="button-quiet" type="button" (click)="show = false">Cancel</button><button class="button-primary" type="submit" [disabled]="saving">{{ saving ? 'Saving…' : 'Save company' }}</button></footer>
        </form>
      </qai-modal>
    </main>
  `
})
export class CompaniesPage implements OnInit {
  rows: Company[] = []; q = ''; show = false; loading = false; saving = false; error = ''; form: Partial<Company> = {};
  constructor(private readonly crm: CrmService) {}
  ngOnInit(): void { this.load(); }
  load(): void { if (this.loading) return; this.loading = true; this.error = ''; this.crm.companies().subscribe({ next: (rows) => { this.rows = rows || []; this.loading = false; }, error: (error) => { this.error = this.apiError(error); this.loading = false; } }); }
  get visible(): Company[] { const term = this.q.trim().toLowerCase(); return this.rows.filter((company) => !term || `${company.name} ${company.domain} ${company.industry} ${company.country}`.toLowerCase().includes(term)); }
  open(company?: Company): void { this.form = company ? { ...company } : {}; this.show = true; }
  save(): void { if (this.saving) return; this.saving = true; this.error = ''; const operation = this.form.id ? this.crm.updateCompany(this.form.id, this.form) : this.crm.createCompany(this.form); operation.subscribe({ next: (result) => { const index = this.rows.findIndex((row) => row.id === result.id); if (index >= 0) this.rows[index] = result; else this.rows.unshift(result); this.show = false; this.saving = false; }, error: (error) => { this.error = this.apiError(error); this.saving = false; } }); }
  remove(company: Company): void { if (!confirm(`Delete ${company.name}?`)) return; this.error = ''; this.crm.deleteCompany(company.id).subscribe({ next: () => this.rows = this.rows.filter((row) => row.id !== company.id), error: (error) => this.error = this.apiError(error) }); }
  initials(name: string): string { return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'CO'; }
  companyUrl(domain: string): string { if (!domain) return '#'; return /^https?:\/\//i.test(domain) ? domain : `https://${domain}`; }
  money(value: number): string { return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value); }
  private apiError(error: any): string { return error?.error?.detail || error?.error?.title || (error?.status ? `CRM API returned ${error.status}.` : 'CRM API is unavailable.'); }
}
