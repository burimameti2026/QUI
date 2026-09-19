import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  styleUrls: ['./dashboard.page.css', './dashboard-scale.css'],
  template: `
    <qai-page-header
      title="Revenue Command Center"
      subtitle="AI support, sales qualification and revenue automation in one operating view.">
      <button class="quiet-action" type="button" (click)="refresh()">↻ Refresh</button>
      <button class="primary" type="button" (click)="go('/ai/agents')">Test AI agent</button>
    </qai-page-header>

    <div class="dashboard-content">
      <div class="executive-band">
        <div>
          <span class="eyebrow">Executive overview</span>
          <h2>Revenue operations at a glance</h2>
          <p>Monitor qualified demand, active pipeline, customer conversations and automation impact from one consistent operating view.</p>
        </div>
        <div class="executive-context">
          <span><i class="status-dot"></i><b>Live</b> operating data</span>
          <span><b>30d</b> performance window</span>
          <span><b>AI</b> assisted</span>
        </div>
      </div>

      <div class="metric-grid">
        <article class="metric-card blue" (click)="go('/crm/leads')">
          <div class="metric-top"><span class="metric-icon">◎</span><span class="metric-label">Qualified leads</span></div>
          <strong>{{ d.leads || 42 }}</strong>
          <small><b>↑ 18%</b> this month <i>→</i></small>
        </article>
        <article class="metric-card violet" (click)="go('/crm/leads')">
          <div class="metric-top"><span class="metric-icon">◉</span><span class="metric-label">Hot leads</span></div>
          <strong>{{ d.hotLeads || 12 }}</strong>
          <small>Needs sales action <i>→</i></small>
        </article>
        <article class="metric-card green" (click)="go('/pipeline')">
          <div class="metric-top"><span class="metric-icon">↗</span><span class="metric-label">Open pipeline</span></div>
          <strong>{{ money(d.pipeline || 184500) }}</strong>
          <small>AI influenced <i>→</i></small>
        </article>
        <article class="metric-card amber" (click)="go('/inbox')">
          <div class="metric-top"><span class="metric-icon">◌</span><span class="metric-label">Open conversations</span></div>
          <strong>{{ d.openConversations || 19 }}</strong>
          <small><b>73.6%</b> AI resolved <i>→</i></small>
        </article>
        <article class="metric-card rose" (click)="go('/tickets')">
          <div class="metric-top"><span class="metric-icon">✓</span><span class="metric-label">Open tickets</span></div>
          <strong>{{ d.openTickets || 7 }}</strong>
          <small><b>94%</b> within SLA <i>→</i></small>
        </article>
      </div>

      <div class="command-grid">
        <section class="revenue-card">
          <header class="card-heading">
            <div><span class="eyebrow">Performance</span><h3>Revenue influenced</h3></div>
            <span class="trend"><i></i>Last 30 days</span>
          </header>
          <div class="revenue-body">
            <div class="revenue-highlight">
              <span class="impact-icon green-impact">€</span>
              <span><small>Total influenced revenue</small><strong>€184,500</strong></span>
            </div>
            <div class="revenue-row"><span><small>AI-qualified pipeline</small><em>Active opportunities</em></span><strong>€142k</strong></div>
            <div class="revenue-row"><span><small>Won revenue</small><em>Closed business</em></span><strong>€31.2k</strong></div>
          </div>
          <div class="revenue-note"><span>Pipeline contribution</span><strong>+18% vs prior period</strong></div>
        </section>

        <section class="automation-card">
          <header class="card-heading">
            <div><span class="eyebrow">Operations</span><h3>Automation impact</h3></div>
            <button type="button" (click)="go('/automations')">Review</button>
          </header>
          <div class="impact-grid">
            <div><span class="impact-icon blue-impact">h</span><span><small>Human time saved</small><strong>218h</strong></span></div>
            <div><span class="impact-icon violet-impact">↗</span><span><small>Actions executed</small><strong>1,284</strong></span></div>
            <div><span class="impact-icon green-impact">⌁</span><span><small>Meetings booked</small><strong>47</strong></span></div>
          </div>
          <div class="automation-note"><span><i></i>Estimated cost saved</span><strong>€12.4k</strong></div>
        </section>
      </div>

      <div class="detail-grid">
        <section class="data-card">
          <header class="card-heading">
            <div><span class="eyebrow">Pipeline</span><h3>Priority opportunities</h3></div>
            <button type="button" (click)="go('/pipeline')">View pipeline</button>
          </header>
          <div class="opportunity-table">
            <div class="opportunity-columns"><span>Company</span><span>Intent</span><span>Score</span><span>Value</span></div>
            <div class="opportunity" *ngFor="let x of opps">
              <div class="account-cell">
                <span class="company-mark">{{ x.company.charAt(0) }}</span>
                <span class="opportunity-main"><strong>{{ x.company }}</strong><span>{{ x.country }}</span></span>
              </div>
              <span class="intent-cell">{{ x.intent }}</span>
              <span class="score-chip">{{ x.score }}</span>
              <b>{{ x.value }}</b>
            </div>
          </div>
        </section>

        <section class="data-card">
          <header class="card-heading">
            <div><span class="eyebrow">Knowledge</span><h3>Knowledge gaps</h3></div>
            <button type="button" (click)="go('/knowledge/gaps')">Resolve</button>
          </header>
          <div class="knowledge-list">
            <div class="knowledge-gap" *ngFor="let g of gaps">
              <span class="gap-mark">?</span>
              <span class="gap-copy"><strong>{{ g.topic }}</strong><span>{{ g.count }} unanswered questions</span></span>
              <em>{{ g.impact }}</em>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class DashboardPage implements OnInit {
  d: any = {};
  opps = [
    { company: 'NordRoute GmbH', country: 'Germany', intent: 'Weekly freight RFQ', score: 93, value: '€38,400' },
    { company: 'Atlas Manufacturing', country: 'Italy', intent: 'Warehouse automation', score: 88, value: '€26,000' },
    { company: 'Vektor Systems', country: 'Germany', intent: 'Enterprise SaaS', score: 84, value: '€18,500' }
  ];
  gaps = [
    { topic: 'International freight pricing', count: 47, impact: 'High' },
    { topic: 'Customs documentation', count: 31, impact: 'High' },
    { topic: 'Weekend delivery SLA', count: 18, impact: 'Medium' }
  ];

  constructor(private data: DashboardService, private router: Router) {}

  ngOnInit() { this.refresh(); }

  refresh() {
    this.data.summary<any>().subscribe({
      next: r => this.d = r,
      error: () => {}
    });
  }

  go(path: string) { this.router.navigateByUrl(path); }

  money(value: number) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  }
}