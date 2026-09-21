import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageHeader } from '../../shared/ui';
import { AnalyticsService } from './analytics.service';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `<main class="page">
    <qai-page-header title="Analytics & ROI" subtitle="Measure support efficiency, pipeline creation and Automation-influenced revenue.">
      <div class="page-actions"><button class="button-quiet" type="button" (click)="load()">↻ Refresh</button></div>
    </qai-page-header>
    <section class="metric-grid">
      <article class="metric"><span class="metric-label">Qualified leads</span><strong>{{d.qualified||0}}</strong><small>{{d.hot||0}} hot</small></article>
      <article class="metric"><span class="metric-label">Open pipeline</span><strong>{{money(d.pipeline||0)}}</strong><small>Automation influenced</small></article>
      <article class="metric"><span class="metric-label">Won revenue</span><strong>{{money(d.won||0)}}</strong><small>Closed commercial value</small></article>
      <article class="metric"><span class="metric-label">Automated conversations</span><strong>{{d.aiConversations||0}}</strong><small>AI-assisted activity</small></article>
      <article class="metric"><span class="metric-label">Tickets</span><strong>{{d.tickets||0}}</strong><small>Support workload</small></article>
    </section>
    <div class="content-grid">
      <section class="card">
        <header class="card-header"><div><span class="eyebrow">REVENUE</span><h2>Revenue attribution</h2><p>Revenue connected to automated activity.</p></div><span class="meta">{{attribution.length}} records</span></header>
        <div class="table" *ngIf="attribution.length"><table><thead><tr><th>Model</th><th>Influenced revenue</th><th>Opportunity</th><th>Created</th></tr></thead><tbody><tr *ngFor="let x of attribution"><td>{{x.model}}</td><td><b>{{money(x.influencedRevenue)}}</b></td><td>{{x.opportunityId||'—'}}</td><td>{{x.createdAtUtc|date:'short'}}</td></tr></tbody></table></div>
        <div class="empty" *ngIf="!attribution.length"><strong>No attribution records</strong><span>Revenue attribution will appear when opportunities are connected to automated activity.</span></div>
      </section>
      <section class="card">
        <header class="card-header"><div><span class="eyebrow">AUTOMATION</span><h2>Revenue automation engine</h2><p>Current operating signals.</p></div></header>
        <div class="card-body"><div class="facts"><span><b>{{d.hot||0}}</b> Hot leads</span><span><b>{{money(totalAttributed)}}</b> Attributed pipeline</span><span><b>{{conversion}}%</b> Pipeline won</span><span><b>{{d.aiConversations||0}}</b> Automated conversations</span></div></div>
      </section>
    </div>
  </main>`
})
export class AnalyticsPage implements OnInit {
  d:any={}; attribution:any[]=[];
  constructor(private data:AnalyticsService){}
  ngOnInit(){this.load()}
  load(){this.data.overview().subscribe(r=>this.d=r);this.data.revenue().subscribe(r=>this.attribution=r)}
  get totalAttributed(){return this.attribution.reduce((s,x)=>s+Number(x.influencedRevenue||0),0)}
  get conversion(){const p=Number(this.d.pipeline||0),w=Number(this.d.won||0);return p+w?Math.round(w/(p+w)*100):0}
  money(v:number){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v||0)}
}
