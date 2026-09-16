import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { BillingService } from '../billing/billing.service';

@Component({ standalone: true, imports: [CommonModule, PageHeader], templateUrl: './dashboard.page.html', styleUrls: ['./dashboard.page.css'] })
export class DashboardPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly billing = inject(BillingService);

  loaded = false;
  error = '';
  products: any[] = [];
  plans: any[] = [];
  agents: any[] = [];
  runs: any[] = [];
  acquisition: any = {};
  campaigns: any[] = [];
  billingSnapshot: any = null;

  get tenantId() { return this.auth.session()?.tenantId || ''; }
  get sessionName() { return this.auth.session()?.name || this.auth.session()?.tenantSlug || 'Current workspace'; }
  get activeAgentCount() { return this.agents.filter(x => String(x.status).toLowerCase().includes('active') || x.status === 1).length; }
  get publishedProducts() { return this.products.filter(x => String(x.publication?.status || '').toLowerCase() === 'published').length; }
  get queuedMessages() { return Number(this.acquisition.queuedMessages || 0); }
  get qualifiedProspects() { return Number(this.acquisition.hot || 0); }
  get financeStat() { return this.billingSnapshot?.subscription?.status || this.billingSnapshot?.subscription?.planName || 'Ready'; }

  ngOnInit(): void { void this.refresh(); }

  async refresh() {
    this.loaded = false;
    this.error = '';
    const requests = await Promise.allSettled([
      firstValueFrom(this.api.get<any[]>('renova/catalog/products')),
      firstValueFrom(this.api.get<any[]>('renova/catalog/promotion-plans')),
      firstValueFrom(this.api.get<any[]>('acquisition/campaigns')),
      firstValueFrom(this.api.get<any>('acquisition/overview')),
      this.tenantId ? firstValueFrom(this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/agents`)) : Promise.resolve([]),
      this.tenantId ? firstValueFrom(this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/runs`)) : Promise.resolve([]),
      this.tenantId ? firstValueFrom(this.billing.snapshot(this.tenantId)) : Promise.resolve(null)
    ]);

    const value = <T>(index: number, fallback: T): T => requests[index].status === 'fulfilled' ? requests[index].value as T : fallback;
    this.products = value(0, []);
    this.plans = value(1, []);
    this.campaigns = value(2, []);
    this.acquisition = value(3, {});
    this.agents = value(4, []);
    this.runs = value(5, []);
    this.billingSnapshot = value(6, null);

    const failed = requests.filter(x => x.status === 'rejected').length;
    if (failed) this.error = `${failed} workspace service${failed === 1 ? '' : 's'} could not be reached. Available data is still shown.`;
    this.loaded = true;
  }

  go(path: string) { void this.router.navigateByUrl(path); }
}
