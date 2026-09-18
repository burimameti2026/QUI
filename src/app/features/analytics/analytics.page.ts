import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageHeader } from '../../shared/ui';
import { AnalyticsService } from './analytics.service';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `<qai-page-header title="Analytics & ROI" subtitle="Measure support efficiency, pipeline creation and Automation-influenced revenue."><button (click)="load()">↻ Refresh</button></qai-page-header>
    <div class="metrics">
      <article><span class="metric-top"><span class="metric-icon">◎</span><span class="metric-label">Qualified leads</span></span><strong>{{d.qualified||0}}</strong><small>{{d.hot||0}} hot</small></article>
      <article><span class="metric-top"><span class="metric-icon">◇</span><span class="metric-label">Open pipeline</span></span><strong>{{money(d.pipeline||0)}}</strong><small>Automation influenced</small></article>
      <article><span class="metric-top"><span class="metric-icon">↗</span><span class="metric-label">Won revenue</span></span><strong>{{money(d.won||0)}}</strong><small>closed commercial value</small></article>
      <article><span class="metric-top"><span class="metric-icon">✦</span><span class="metric-label">Automated conversations</span></span><strong>{{d.aiConversations||0}}</strong><small>AI-assisted activity</small></article>
      <article><span class="metric-top"><span class="metric-icon">▱</span><span class="metric-label">Tickets</span></span><strong>{{d.tickets||0}}</strong><small>support workload</small></article>
    </div>
    <div class="analytics-grid">
      <section class="panel"><header><b>Revenue attribution</b><span>{{attribution.length}} records</span></header>
        <div class="table-wrap"><table><thead><tr><th>Model</th><th>Influenced revenue</th><th>Opportunity</th><th>Created</th></tr></thead><tbody><tr *ngFor="let x of attribution"><td>{{x.model}}</td><td><b>{{money(x.influencedRevenue)}}</b></td><td>{{x.opportunityId||'—'}}</td><td>{{x.createdAtUtc|date:'short'}}</td></tr></tbody></table></div>
        <div class="empty" *ngIf="!attribution.length"><b>No attribution records</b><span>Revenue attribution will appear when opportunities are connected to automated activity.</span></div>
      </section>
      <section class="panel"><header><b>Revenue automation engine</b><span>Current operating signals</span></header>
        <div class="impact"><div><b>{{d.hot||0}}</b><span>Hot leads</span></div><div><b>{{money(totalAttributed)}}</b><span>Attributed pipeline</span></div><div><b>{{conversion}}%</b><span>Pipeline won</span></div><div><b>{{d.aiConversations||0}}</b><span>Automated conversations</span></div></div>
      </section>
    </div>`,
  styleUrl: './analytics.page.css'
})
export class AnalyticsPage implements OnInit {
  d:any={};
  attribution:any[]=[];
  constructor(private data:AnalyticsService){}
  ngOnInit(){this.load()}
  load(){this.data.overview().subscribe(r=>this.d=r);this.data.revenue().subscribe(r=>this.attribution=r)}
  get totalAttributed(){return this.attribution.reduce((s,x)=>s+Number(x.influencedRevenue||0),0)}
  get conversion(){const p=Number(this.d.pipeline||0),w=Number(this.d.won||0);return p+w?Math.round(w/(p+w)*100):0}
  money(v:number){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v||0)}
}
