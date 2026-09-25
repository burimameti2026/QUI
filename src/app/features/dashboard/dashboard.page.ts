import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { QaiKpiGrid, QaiKpiMetric } from '../../shared/components/kpi/kpi-grid.component';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader, QaiKpiGrid],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.css'
})
export class DashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loaded = false;
  error = '';
  products: any[] = [];
  plans: any[] = [];
  agents: any[] = [];
  runs: any[] = [];
  acquisition: any = {};
  campaigns: any[] = [];

  get tenantId() { return this.auth.session()?.tenantId || ''; }
  get tenantName() { return this.auth.session()?.tenantSlug || this.auth.session()?.tenantId || 'Workspace'; }
  get activeAgentCount() {
    return this.agents.filter(x => String(x.status).toLowerCase().includes('active') || x.status === 1).length;
  }
  get publishedProducts() {
    return this.products.filter(x => String(x.publication?.status || '').toLowerCase() === 'published').length;
  }
  get activePlans() {
    return this.plans.filter(x => String(x.status).toLowerCase() === 'active').length;
  }
  get recentRun() { return this.runs[0]; }
  get queuedMessages() { return Number(this.acquisition.queuedMessages || 0); }
  get qualifiedProspects() { return Number(this.acquisition.hot || 0); }
  get kpiMetrics(): QaiKpiMetric[] {
    return [
      { label: 'Product catalog', value: this.products.length, detail: this.publishedProducts + ' public publications live', icon: '▦', path: '/catalog' },
      { label: 'Promotion plans', value: this.activePlans, detail: 'active market programs', icon: '✦', path: '/renova/promotion' },
      { label: 'Autonomous agents', value: this.activeAgentCount, detail: 'running acquisition engines', icon: '↯', path: '/acquisition/autonomous' },
      { label: 'Prospects discovered', value: Number(this.acquisition.discovered || 0), detail: this.qualifiedProspects + ' high-fit prospects', icon: '⌕', path: '/discover' },
      { label: 'Awaiting delivery', value: this.queuedMessages, detail: 'review the approval queue', icon: '✓', path: '/acquisition/approval-queue' }
    ];
  }

  ngOnInit(): void {
    void this.refresh();
  }

  async refresh() {
    this.loaded = false;
    this.error = '';

    const requests = await Promise.all([
      this.loadSafe<any[]>(this.api.get<any[]>('renova/catalog/products'), []),
      this.loadSafe<any[]>(this.api.get<any[]>('renova/catalog/promotion-plans'), []),
      this.loadSafe<any[]>(this.api.get<any[]>('acquisition/campaigns'), []),
      this.loadSafe<any>(this.api.get<any>('acquisition/overview'), {}),
      this.tenantId
        ? this.loadSafe<any[]>(this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/agents`), [])
        : Promise.resolve([])
    ]);

    [this.products, this.plans, this.campaigns, this.acquisition, this.agents] = requests;

    // There is no tenant-wide /runs route in the current API.
    // Runs are scoped to an agent, so load the latest runs from the agents we already fetched.
    const runLists = await Promise.all(
      this.agents.map(agent =>
        this.loadSafe<any[]>(
          this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/agents/${agent.id}/runs`),
          []
        )
      )
    );
    this.runs = runLists.flat().sort(
      (a, b) => new Date(b.scheduledAtUtc || 0).getTime() - new Date(a.scheduledAtUtc || 0).getTime()
    );

    this.loaded = true;
  }

  private async loadSafe<T>(request: import('rxjs').Observable<T>, fallback: T): Promise<T> {
    try {
      return await firstValueFrom(request);
    } catch {
      return fallback;
    }
  }

  go(path: string) {
    void this.router.navigateByUrl(path);
  }

  get programRows(): Array<Record<string, unknown>> {
    return this.plans.map(plan => ({
      program: plan.name || '',
      language: String(plan.campaignLanguage || '').toUpperCase(),
      status: plan.status || '',
      automation: plan.enableAutonomousProspecting ? 'Autonomous' : 'Manual'
    }));
  }

  get publicExperience() {
    return [
      {
        icon: '▦',
        title: `${this.products.length} catalog products`,
        subtitle: `${this.publishedProducts} are published to the public ${this.tenantName} portal.`,
        badge: 'LIVE',
        tone: 'success'
      },
      {
        icon: '◎',
        title: '4-language content',
        subtitle: 'EN, MK, SQ and DE localization is seeded for the demo workspace.',
        badge: 'READY',
        tone: 'success'
      },
      {
        icon: '↯',
        title: 'Inbound inquiry path',
        subtitle: 'Distributor inquiries enter the tenant workspace as structured portal inquiries.',
        badge: 'CONNECTED',
        tone: 'success'
      }
    ];
  }
}
