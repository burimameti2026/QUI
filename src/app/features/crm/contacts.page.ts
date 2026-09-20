import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Contact } from '../../core/models/platform.models';
import { Modal, PageHeader } from '../../shared/ui';
import { CrmService } from './crm.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  styleUrls: ['./contacts.page.css'],
  template: `
    <main class="page">
      <qai-page-header title="Contacts" subtitle="Unified customer profiles across conversations, sales and support.">
        <button class="button-quiet" (click)="load()" [disabled]="loading">↻ {{ loading ? 'Loading…' : 'Refresh data' }}</button>
        <button class="button-secondary" (click)="exportCsv()">⇩ Export CSV</button>
        <button class="button-primary" (click)="open()">+ Add contact</button>
      </qai-page-header>
      <div class="alert" *ngIf="error"><span class="icon">!</span><div><b>Contacts could not be loaded</b><p>{{ error }}</p></div></div>
      <section class="card">
        <header class="card-header">
          <div><span class="eyebrow">CRM DIRECTORY</span><h2>Contact workspace</h2><p>Search, review and manage every person in the customer lifecycle.</p></div>
          <div class="facts"><span><b>{{ rows.length }}</b>Total</span><span><b>{{ leadCount }}</b>Leads</span><span><b>{{ customerCount }}</b>Customers</span></div>
        </header>
        <div class="toolbar">
          <label><span>⌕</span><input [(ngModel)]="q" placeholder="Search name, email or phone" /></label>
          <select [(ngModel)]="stage"><option value="">All lifecycle stages</option><option>visitor</option><option>lead</option><option>customer</option></select>
          <strong>{{ visible.length }} shown</strong>
        </div>
        <div class="notice" *ngIf="loading">Loading contacts…</div>
        <div class="table" *ngIf="!loading && visible.length">
          <table>
            <thead><tr><th>Contact</th><th>Email</th><th>Phone</th><th>Lifecycle</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody><tr *ngFor="let x of visible">
              <td><div class="identity"><span class="avatar">{{ initials(x) }}</span><span class="stack"><b>{{ x.firstName }} {{ x.lastName }}</b><small>CRM contact</small></span></div></td>
              <td><a class="button-quiet" [href]="'mailto:' + x.email">{{ x.email || '—' }}</a></td><td>{{ x.phone || '—' }}</td>
              <td><span class="status">{{ x.lifecycleStage || 'visitor' }}</span></td>
              <td>{{ x.createdAtUtc | date: 'mediumDate' }}</td>
              <td><div class="actions"><button class="button-quiet" (click)="open(x)">✎ Edit</button><button class="button-danger" (click)="remove(x)">Delete</button></div></td>
            </tr></tbody>
          </table>
        </div>
        <div class="empty" *ngIf="!loading && !error && !visible.length"><i>◎</i><strong>{{ rows.length ? 'No matching contacts' : 'No contacts available' }}</strong><span>{{ rows.length ? 'No contacts match the current search or lifecycle filter.' : 'There are no contacts in this workspace yet. Add the first contact to start the CRM directory.' }}</span><button class="button-primary" *ngIf="!rows.length" (click)="open()">Add contact</button></div>
      </section>
      <qai-modal [open]="show" [title]="form.id ? 'Edit contact' : 'New contact'" (close)="show = false">
        <form class="form" (ngSubmit)="save()">
          <div class="content-grid"><label>First name<input [(ngModel)]="form.firstName" name="first" required /></label><label>Last name<input [(ngModel)]="form.lastName" name="last" /></label></div>
          <label>Email<input [(ngModel)]="form.email" name="email" type="email" /></label><label>Phone<input [(ngModel)]="form.phone" name="phone" /></label>
          <label>Lifecycle<select [(ngModel)]="form.lifecycleStage" name="stage"><option>visitor</option><option>lead</option><option>customer</option></select></label>
          <footer class="actions"><button class="button-quiet" type="button" (click)="show = false">Cancel</button><button class="button-primary" type="submit" [disabled]="saving">{{ saving ? 'Saving…' : 'Save contact' }}</button></footer>
        </form>
      </qai-modal>
    </main>`
})
export class ContactsPage implements OnInit {
  rows: Contact[] = []; q = ''; stage = ''; show = false; loading = false; saving = false; error = '';
  form: Partial<Contact> = { lifecycleStage: 'lead' };
  constructor(private readonly crm: CrmService) {}
  ngOnInit(): void { this.load(); }
  load(): void { if (this.loading) return; this.loading = true; this.error = ''; this.crm.contacts().subscribe({ next: (rows) => { this.rows = rows || []; this.loading = false; }, error: (error) => { this.error = this.apiError(error); this.loading = false; } }); }
  get visible(): Contact[] { const q = this.q.trim().toLowerCase(); return this.rows.filter((x) => (!q || `${x.firstName} ${x.lastName} ${x.email} ${x.phone}`.toLowerCase().includes(q)) && (!this.stage || x.lifecycleStage === this.stage)); }
  get leadCount(): number { return this.rows.filter((x) => x.lifecycleStage === 'lead').length; }
  get customerCount(): number { return this.rows.filter((x) => x.lifecycleStage === 'customer').length; }
  open(x?: Contact): void { this.form = x ? { ...x } : { lifecycleStage: 'lead' }; this.show = true; }
  save(): void { if (this.saving) return; this.saving = true; this.error = ''; const operation = this.form.id ? this.crm.updateContact(this.form.id, this.form) : this.crm.createContact(this.form); operation.subscribe({ next: (result) => { const index = this.rows.findIndex((x) => x.id === result.id); if (index >= 0) this.rows[index] = result; else this.rows.unshift(result); this.show = false; this.saving = false; }, error: (error) => { this.error = this.apiError(error); this.saving = false; } }); }
  remove(x: Contact): void { if (!confirm(`Delete ${x.firstName} ${x.lastName}?`)) return; this.error = ''; this.crm.deleteContact(x.id).subscribe({ next: () => this.rows = this.rows.filter((v) => v.id !== x.id), error: (error) => this.error = this.apiError(error) }); }
  initials(x: Contact): string { return ((x.firstName || '?')[0] + (x.lastName || '')[0]).toUpperCase(); }
  exportCsv(): void { const header = 'FirstName,LastName,Email,Phone,Lifecycle\n'; const body = this.visible.map((x) => [x.firstName,x.lastName,x.email,x.phone,x.lifecycleStage].map((v) => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n'); const anchor = document.createElement('a'); anchor.href = URL.createObjectURL(new Blob([header + body], { type: 'text/csv' })); anchor.download = 'qualifyai-contacts.csv'; anchor.click(); URL.revokeObjectURL(anchor.href); }
  private apiError(error: any): string { return error?.error?.detail || error?.error?.title || (error?.status ? `CRM API returned ${error.status}.` : 'CRM API is unavailable.'); }
}
