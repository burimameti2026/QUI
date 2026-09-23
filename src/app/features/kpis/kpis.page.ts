import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { PageHeader } from '../../shared/ui';
import { QaiKpiGrid, QaiKpiMetric } from '../../shared/components/kpi/kpi-grid.component';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader, QaiKpiGrid],
  templateUrl: './kpis.page.html',
  styleUrl: './kpis.page.css'
})
export class KpisPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = true;
  error = '';
  products: any[] = [];
  plans: any[] = [];
  campaigns: any[] = [];
  acquisition: any = {};
  agents: any[] = [];
  runs: any[] = [];

  get tenantId() { return this.auth.session()?.tenantId || ''; }
  get activeAgents() { return this.agents.filter(x => String(x.status).toLowerCase().includes('active') || x.status === 1).length; }
  get activePlans() { return this.plans.filter(x => String(x.status).toLowerCase() === 'active').length; }
  get publishedProducts() { return this.products.filter(x => String(x.publication?.status || '').toLowerCase() === 'published').length; }
  get queuedMessages() { return Number(this.acquisition.queuedMessages || 0); }
  get qualified() { return Number(this.acquisition.hot || 0); }

  get metrics(): QaiKpiMetric[] {
    return [
      { label: 'Product catalog', value: this.products.length, detail: `${this.publishedProducts} published`, icon: '▦', path: '/catalog' },
      { label: 'Promotion plans', value: this.activePlans, detail: 'active market programs', icon: '✦', path: '/catalog' },
      { label: 'Autonomous agents', value: this.activeAgents, detail: 'active acquisition engines', icon: '↯', path: '/acquisition/autonomous' },
      { label: 'Prospects discovered', value: Number(this.acquisition.discovered || 0), detail: `${this.qualified} high-fit prospects`, icon: '⌕', path: '/discover' },
      { label: 'Awaiting delivery', value: this.queuedMessages, detail: 'messages in approval queue', icon: '✓', path: '/acquisition/approval-queue' }
    ];
  }

  ngOnInit() { void this.refresh(); }

  async refresh() {
    this.loading = true;
    this.error = '';
    try {
      [this.products, this.plans, this.campaigns, this.acquisition, this.agents, this.runs] = await Promise.all([
        firstValueFrom(this.api.get<any[]>('catalog/products')),
        firstValueFrom(this.api.get<any[]>('catalog/promotions')),
        firstValueFrom(this.api.get<any[]>('acquisition/campaigns')),
        firstValueFrom(this.api.get<any>('acquisition/overview')),
        this.tenantId ? firstValueFrom(this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/agents`)) : Promise.resolve([]),
        this.tenantId ? firstValueFrom(this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/runs`)) : Promise.resolve([])
      ]);
    } catch (e: any) {
      this.error = e?.error?.detail || 'KPI data could not be loaded.';
    } finally {
      this.loading = false;
    }
  }

  open(path: string) { void this.router.navigateByUrl(path); }
}