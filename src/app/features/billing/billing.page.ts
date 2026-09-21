import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Empty, PageHeader } from '../../shared/ui';
import { AuthService } from '../../core/auth.service';
import { BillingLifecycle, BillingService } from './billing.service';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader, Empty],
  template: `<main class="page">
    <qai-page-header title="Billing & subscription" subtitle="Subscription, lifecycle, usage and provider activity."><div class="page-actions"><button class="button-quiet" type="button" (click)="load()">↻ Refresh</button></div></qai-page-header>
    <div *ngIf="accessMessage" class="notice">{{accessMessage}}</div>
    <section class="hero"><div><span class="eyebrow">CURRENT SUBSCRIPTION</span><h2>{{currentPlanName}}</h2><p>{{statusLabel}} · {{renewalLabel}}</p></div><aside class="status"><strong>{{subscription?.provider||'—'}}</strong><small>Billing provider</small></aside></section>
    <div class="content-grid">
      <section class="card"><header class="card-header"><div><span class="eyebrow">LIFECYCLE</span><h2>Billing lifecycle</h2><p>Automated enterprise billing state.</p></div></header><div class="card-body list"><div class="list-item"><span class="stack"><b>State</b><small>Current lifecycle state</small></span><span class="status">{{lifecycle?.state||'Active'}}</span></div><div class="list-item"><span class="stack"><b>Trial ends</b></span><b>{{lifecycle?.trialEndsAtUtc|date:'medium'}}</b></div><div class="list-item"><span class="stack"><b>Grace ends</b></span><b>{{lifecycle?.graceEndsAtUtc|date:'medium'}}</b></div><div class="list-item"><span class="stack"><b>Retry attempt</b></span><b>{{lifecycle?.retryAttempt||0}}</b></div><div class="list-item"><span class="stack"><b>Next retry</b></span><b>{{lifecycle?.nextRetryAtUtc|date:'medium'}}</b></div></div></section>
      <section class="card"><header class="card-header"><div><span class="eyebrow">USAGE</span><h2>Usage & quota</h2><p>Real-time usage metering.</p></div></header><div class="card-body list"><div class="list-item" *ngFor="let item of usage"><span class="stack"><b>{{item.metric}}</b><small>Current usage</small></span><b>{{item.value}}</b></div><qai-empty *ngIf="!usage.length" title="No usage metrics yet" text="Usage appears when metered features are consumed."/></div></section>
    </div>
    <section class="card"><header class="card-header"><div><span class="eyebrow">FINANCE</span><h2>Invoices & payments</h2></div></header><div class="table" *ngIf="invoices.length"><table><thead><tr><th>Invoice</th><th>Amount due</th><th>Paid</th><th>Status</th><th>Due</th></tr></thead><tbody><tr *ngFor="let invoice of invoices"><td><b>{{invoice.externalInvoiceId||invoice.number}}</b></td><td>{{money(invoice.amountDue??invoice.amount,invoice.currency)}}</td><td>{{money(invoice.amountPaid,invoice.currency)}}</td><td><span class="status">{{invoice.status}}</span></td><td>{{invoice.dueAtUtc|date:'mediumDate'}}</td></tr></tbody></table></div><qai-empty *ngIf="!invoices.length" title="No invoices yet" text="Issued invoices and payments will appear here."/></section>
    <section class="card"><header class="card-header"><div><span class="eyebrow">ACTIVITY</span><h2>Billing events</h2></div></header><div class="table" *ngIf="events.length"><table><thead><tr><th>Type</th><th>Status</th><th>Provider</th><th>Occurred</th></tr></thead><tbody><tr *ngFor="let event of events"><td>{{event.type}}</td><td><span class="status">{{event.status}}</span></td><td>{{event.provider}}</td><td>{{event.occurredAtUtc|date:'medium'}}</td></tr></tbody></table></div><qai-empty *ngIf="!events.length" title="No billing history yet" text="Billing lifecycle events will appear after provider activity."/></section>
  </main>`
})
export class BillingPage implements OnInit {
  subscription:any; invoices:any[]=[]; events:any[]=[]; lifecycle:BillingLifecycle|null=null; usage:any[]=[]; accessMessage='';
  constructor(private data:BillingService,private auth:AuthService,private route:ActivatedRoute){}
  ngOnInit(){this.route.queryParamMap.subscribe(q=>{const reason=q.get('reason'),module=q.get('module');this.accessMessage=reason==='module-unavailable'?`The ${module||'requested'} module is not enabled for this tenant. Review the plan and module entitlements below.`:reason==='tenant-runtime-unavailable'?'Tenant access could not be verified. Refresh after your tenant license is available.':''});this.load()}
  load(){const tenantId=this.auth.session()?.tenantId;if(!tenantId){this.subscription=null;this.invoices=[];this.events=[];this.lifecycle=null;this.usage=[];return}this.data.snapshot(tenantId).subscribe(s=>{this.subscription=s.subscription||null;this.invoices=s.invoices||[];this.events=s.events||[]});this.data.lifecycle(tenantId).subscribe(v=>this.lifecycle=v);['api_requests','ai_tokens','storage_mb'].forEach(metric=>this.data.usageMetric(tenantId,metric).subscribe(v=>{this.usage=this.usage.filter(x=>x.metric!==metric).concat(v)}))}
  get currentPlanName(){return this.subscription?.planName||this.subscription?.plan||this.subscription?.planCode||'Workspace plan'}
  get statusLabel(){const v=this.subscription?.status;return v===1||String(v).toLowerCase()==='active'?'Active':v||'Not activated'}
  get renewalDate(){return this.subscription?.currentPeriodEndsAtUtc||this.subscription?.currentPeriodEndUtc||null}
  get renewalLabel(){return this.renewalDate?`Renews ${new Date(this.renewalDate).toLocaleDateString()}`:'Renewal date not set'}
  money(v:number,currency?:string){return new Intl.NumberFormat('en-IE',{style:'currency',currency:currency||'EUR',maximumFractionDigits:2}).format(v||0)}
}
