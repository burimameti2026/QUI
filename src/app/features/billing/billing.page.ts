import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Callout, Empty, PageHeader } from '../../shared/ui';
import { BillingService } from './billing.service';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader, Callout, Empty],
  template: `<qai-page-header title="Billing & subscription" subtitle="Current subscription, invoices and provider activity for this workspace."><button (click)="load()">↻ Refresh</button></qai-page-header>
  <section class="subscription-hero"><div><span class="section-kicker">Current subscription</span><h2>{{ currentPlanName }}</h2><p>{{ statusLabel }} · {{ renewalLabel }}</p></div><div class="subscription-price"><strong>{{ subscription?.provider || '—' }}</strong><span>billing provider</span></div></section>
  <div class="grid2"><section class="panel"><header><div><b>Subscription details</b><span>Provider-managed access and renewal</span></div></header>
  <div class="gap"><div><b>Status</b><span>Current subscription state</span></div><span class="pill success">{{ statusLabel }}</span></div>
  <div class="gap"><div><b>Plan</b><span>Active billing plan</span></div><b>{{ currentPlanName }}</b></div>
  <div class="gap"><div><b>Next renewal</b><span>Current billing period end</span></div><b>{{ subscription?.currentPeriodEndsAtUtc || subscription?.currentPeriodEndUtc | date:'mediumDate' }}</b></div>
  <div class="gap"><div><b>Subscription ID</b><span>External provider reference</span></div><b>{{ subscription?.externalSubscriptionId || '—' }}</b></div></section>
  <section class="panel"><header><div><b>Billing activity</b><span>Recent provider events</span></div></header>
  <div class="gap" *ngFor="let event of events.slice(0,5)"><div><b>{{ event.type }}</b><span>{{ event.occurredAtUtc | date:'medium' }}</span></div><span class="pill">{{ event.status }}</span></div>
  <qai-empty *ngIf="!events.length" title="No billing events yet" text="Provider webhook activity will appear here."/></section></div>
  <section class="panel table-wrap"><header><div><b>Invoices & payments</b><span>Persistent payment history from your billing provider</span></div></header>
  <table *ngIf="invoices.length"><thead><tr><th>Invoice</th><th>Amount due</th><th>Paid</th><th>Status</th><th>Due date</th></tr></thead><tbody><tr *ngFor="let invoice of invoices"><td><b>{{ invoice.externalInvoiceId || invoice.number }}</b></td><td>{{ money(invoice.amountDue ?? invoice.amount) }} {{ invoice.currency || '' }}</td><td>{{ money(invoice.amountPaid) }} {{ invoice.currency || '' }}</td><td><span class="pill">{{ invoice.status }}</span></td><td>{{ invoice.dueAtUtc | date:'mediumDate' }}</td></tr></tbody></table>
  <qai-empty *ngIf="!invoices.length" title="No invoices yet" text="Issued invoices and payments will appear here."/></section>
  <section class="panel table-wrap"><header><div><b>All billing events</b><span>Auditable billing lifecycle history</span></div></header>
  <table *ngIf="events.length"><thead><tr><th>Type</th><th>Status</th><th>Provider</th><th>Occurred</th></tr></thead><tbody><tr *ngFor="let event of events"><td>{{ event.type }}</td><td><span class="pill">{{ event.status }}</span></td><td>{{ event.provider }}</td><td>{{ event.occurredAtUtc | date:'medium' }}</td></tr></tbody></table>
  <qai-empty *ngIf="!events.length" title="No billing history yet" text="Billing lifecycle events will appear after provider activity."/></section>`
})
export class BillingPage implements OnInit {
  subscription: any; invoices: any[] = []; events: any[] = []; plans: any[] = []; usage: any[] = [];
  constructor(private data: BillingService) {}
  ngOnInit() { this.load(); }
  load() { this.data.plans().subscribe(r => this.plans = r || []); this.data.usage().subscribe(r => this.usage = r || []); this.data.subscription().subscribe(r => this.subscription = r); this.data.invoices().subscribe(r => this.invoices = r || []); }
  get currentPlanName() { return this.subscription?.planName || this.subscription?.plan || this.subscription?.planCode || 'Workspace plan'; }
  get statusLabel() { const v=this.subscription?.status; return v===1 || String(v).toLowerCase()==='active' ? 'Active' : v || 'Not activated'; }
  get renewalLabel() { const v=this.subscription?.currentPeriodEndsAtUtc || this.subscription?.currentPeriodEndUtc; return v ? `Renews ${new Date(v).toLocaleDateString()}` : 'Renewal date not set'; }
  money(v: number) { return new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(v || 0); }
}
