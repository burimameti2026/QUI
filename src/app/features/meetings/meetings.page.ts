import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Modal, PageHeader } from "../../shared/ui";
import { CrmService } from "../crm/crm.service";
import { MeetingsService } from "./meetings.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  template: `<main class="page">
    <qai-page-header
      title="Demos & Meetings"
      subtitle="Schedule discovery calls and retain the booking against the real CRM contact."
    >
      <button class="button-quiet" (click)="load()">Refresh</button>
      <button class="button-primary" (click)="open()">+ Schedule meeting</button>
    </qai-page-header>

    <section class="metric-grid">
      <article class="metric">
        <span class="eyebrow">TOTAL MEETINGS</span>
        <strong>{{ rows.length }}</strong>
        <span class="meta">All scheduled activity</span>
      </article>
      <article class="metric">
        <span class="eyebrow">BOOKED</span>
        <strong>{{ bookedCount }}</strong>
        <span class="meta">Upcoming or pending calls</span>
      </article>
      <article class="metric">
        <span class="eyebrow">COMPLETED</span>
        <strong>{{ completedCount }}</strong>
        <span class="meta">Finished meetings</span>
      </article>
      <article class="metric">
        <span class="eyebrow">CALENDARS</span>
        <strong>{{ syncedCount }}</strong>
        <span class="meta">Externally synced</span>
      </article>
    </section>

    <div class="alert" *ngIf="error">
      <strong>Meeting action failed</strong>
      <span>{{ error }}</span>
    </div>

    <section class="card">
      <header class="card-header">
        <div>
          <span class="eyebrow">CALENDAR DIRECTORY</span>
          <h2>Meeting workspace</h2>
          <p>Every discovery call, demo and follow-up in one schedule.</p>
        </div>
        <div class="facts">
          <span><b>{{ rows.length }}</b>Total</span>
          <span><b>{{ bookedCount }}</b>Booked</span>
          <span><b>{{ completedCount }}</b>Completed</span>
        </div>
      </header>

      <div class="toolbar">
        <label class="search">
          <span>Search</span>
          <input [(ngModel)]="query" placeholder="Search contact or meeting status" />
        </label>
        <label class="filter-group">
          <span>Status</span>
          <select [(ngModel)]="statusFilter">
            <option value="">All statuses</option>
            <option>booked</option>
            <option>completed</option>
            <option>cancelled</option>
            <option>no-show</option>
          </select>
        </label>
        <span class="meta">{{ visible.length }} shown</span>
      </div>

      <div class="notice" *ngIf="loading">Loading meetings…</div>

      <div class="empty" *ngIf="!loading && !visible.length">
        <span class="icon">◷</span>
        <strong>{{ rows.length ? "No meetings match the filters" : "No meetings booked" }}</strong>
        <span>Schedule a discovery call from a qualified reply or CRM contact.</span>
        <div class="actions">
          <button class="button-primary" (click)="open()">Schedule first meeting</button>
        </div>
      </div>

      <div class="table" *ngIf="!loading && visible.length">
        <table>
          <thead>
            <tr><th>Starts</th><th>Duration</th><th>Contact</th><th>Status</th><th>Calendar</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of visible">
              <td>
                <div class="identity">
                  <span class="avatar">◷</span>
                  <span class="stack"><b>{{ row.startsAtUtc | date: "mediumDate" }}</b><span>{{ row.startsAtUtc | date: "shortTime" }}</span></span>
                </div>
              </td>
              <td>{{ duration(row) }} min</td>
              <td>{{ contactName(row.contactId) }}</td>
              <td><span class="status" [ngClass]="statusClass(row.status)">{{ row.status }}</span></td>
              <td>{{ row.externalEventId ? "Synced" : "Internal booking" }}</td>
              <td>
                <div class="actions">
                  <button class="button-quiet" (click)="open(row)">Edit</button>
                  <button class="button-danger" (click)="remove(row)">Cancel</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <qai-modal
      [open]="show"
      [title]="form.id ? 'Edit meeting' : 'Schedule meeting'"
      (close)="show = false"
    >
      <form class="form" (ngSubmit)="save()">
        <label>Contact
          <select [(ngModel)]="form.contactId" name="contact" required>
            <option value="">Select contact</option>
            <option *ngFor="let contact of contacts" [value]="contact.id">{{ displayContact(contact) }}</option>
          </select>
        </label>
        <label>Meeting type
          <select [(ngModel)]="form.meetingTypeId" name="type">
            <option value="">Discovery call (default)</option>
            <option *ngFor="let type of types" [value]="type.id">{{ type.name }} · {{ type.durationMinutes }} min</option>
          </select>
        </label>
        <div class="content-grid">
          <label>Date<input type="date" [(ngModel)]="date" name="date" required /></label>
          <label>Time<input type="time" [(ngModel)]="time" name="time" required /></label>
        </div>
        <label>Status
          <select [(ngModel)]="form.status" name="status">
            <option>booked</option>
            <option>completed</option>
            <option>cancelled</option>
            <option>no-show</option>
          </select>
        </label>
        <footer class="actions">
          <button type="button" class="button-secondary" (click)="show = false">Cancel</button>
          <button class="button-primary" type="submit" [disabled]="saving || !form.contactId">{{ saving ? "Saving…" : "Save meeting" }}</button>
        </footer>
      </form>
    </qai-modal>
  </main>`,
})
export class MeetingsPage implements OnInit {
  rows: any[] = []; contacts: any[] = []; types: any[] = []; show = false;
  form: any = { status: "booked", contactId: "", meetingTypeId: "" }; date = ""; time = "09:00";
  error = ""; loading = false; saving = false; query = ""; statusFilter = "";
  constructor(private data: MeetingsService, private crm: CrmService, private route: ActivatedRoute) {}
  ngOnInit() { this.load(); this.loadOptions(); }
  load() { this.loading = true; this.error = ""; this.data.list().subscribe({ next: rows => { this.rows = rows || []; this.loading = false; }, error: e => { this.loading = false; this.error = this.apiError(e); } }); }
  loadOptions() {
    this.crm.contacts().subscribe({ next: rows => { this.contacts = rows || []; const contactId = this.route.snapshot.queryParamMap.get("contactId"); if (contactId && this.contacts.some(x => x.id === contactId)) this.open(undefined, contactId); }, error: e => (this.error = this.apiError(e)) });
    this.data.types().subscribe({ next: rows => (this.types = rows || []), error: e => (this.error = this.apiError(e)) });
  }
  get visible() { const term = this.query.trim().toLowerCase(); return this.rows.filter(row => (!term || `${this.contactName(row.contactId)} ${row.status}`.toLowerCase().includes(term)) && (!this.statusFilter || String(row.status).toLowerCase() === this.statusFilter)); }
  get bookedCount() { return this.rows.filter(row => String(row.status).toLowerCase() === "booked").length; }
  get syncedCount() { return this.rows.filter(row => !!row.externalEventId).length; }
  get completedCount() { return this.rows.filter(row => String(row.status).toLowerCase() === "completed").length; }
  statusClass(value: unknown) { const status = String(value).toLowerCase(); return status === "booked" ? "status-pending" : status === "completed" ? "status-success" : status === "cancelled" || status === "no-show" ? "status-failed" : ""; }
  open(row?: any, contactId?: string) { this.form = row ? { ...row } : { status: "booked", contactId: contactId || this.contacts[0]?.id || "", meetingTypeId: this.types[0]?.id || "" }; const starts = row?.startsAtUtc ? new Date(row.startsAtUtc) : new Date(Date.now() + 86400000); this.date = starts.toISOString().slice(0, 10); this.time = `${String(starts.getHours()).padStart(2, "0")}:${String(starts.getMinutes()).padStart(2, "0")}`; this.show = true; }
  save() { const start = new Date(`${this.date}T${this.time}:00`); const type = this.types.find(x => x.id === this.form.meetingTypeId); const minutes = Number(type?.durationMinutes || 30); this.form.startsAtUtc = start.toISOString(); this.form.endsAtUtc = new Date(start.getTime() + minutes * 60000).toISOString(); this.form.meetingTypeId = this.form.meetingTypeId || "00000000-0000-0000-0000-000000000000"; this.saving = true; const request = this.form.id ? this.data.update(this.form.id, this.form) : this.data.create(this.form); request.subscribe({ next: row => { const index = this.rows.findIndex(x => x.id === row.id); index >= 0 ? (this.rows[index] = row) : this.rows.unshift(row); this.saving = false; this.show = false; }, error: e => { this.saving = false; this.error = this.apiError(e); } }); }
  remove(row: any) { if (confirm("Cancel this meeting?")) this.data.remove(row.id).subscribe({ next: () => (this.rows = this.rows.filter(x => x.id !== row.id)), error: e => (this.error = this.apiError(e)) }); }
  duration(row: any) { return Math.max(0, Math.round((new Date(row.endsAtUtc).getTime() - new Date(row.startsAtUtc).getTime()) / 60000)); }
  contactName(id: string) { const contact = this.contacts.find(x => x.id === id); return contact ? this.displayContact(contact) : "Contact"; }
  displayContact(contact: any) { return `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || contact.email || "Contact"; }
  private apiError(error: any) { return error?.error?.detail || error?.error?.error || (error?.status ? `Meetings API returned ${error.status}.` : "Meetings API is unavailable."); }
}
