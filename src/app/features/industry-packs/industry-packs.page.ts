import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IndustryPacksService } from './industry-packs.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `
    <style>
      .scenario-picker{margin:14px 0 4px;padding:12px;border:1px solid #e1e5eb;border-radius:10px;background:#f7f8fa}
      .scenario-picker>.eyebrow{display:block;margin-bottom:8px}
      .scenario-picker button{display:block;width:100%;padding:9px 10px;margin:5px 0;border:1px solid #d9dee6;border-radius:8px;background:#fff;text-align:left;cursor:pointer}
      .scenario-picker button.active{border-color:#222;box-shadow:0 0 0 1px #222}
      .scenario-picker strong,.scenario-picker small{display:block}
      .scenario-picker strong{font-size:11px}
      .scenario-picker small{font-size:9px;opacity:.6;margin-top:2px}
    </style>
    <main class="page page-industry-packs">
      <qai-page-header
        title="Industry Packs"
        subtitle="An Industry Pack is the single source used to provision a campaign-ready acquisition definition.">
      </qai-page-header>

      <section class="hero">
        <div>
          <span class="eyebrow">INDUSTRY → CAMPAIGN</span>
          <h2>{{ installedCount }} provisioned · {{ packs.length }} available</h2>
          <p>
            Provision an Industry Pack once. The backend creates or reconciles its ICP,
            Target List, Campaign and Campaign Steps. Workspace Packages are not used for acquisition provisioning.
          </p>
        </div>
      </section>

      <p class="notice success" *ngIf="message">{{ message }}</p>
      <p class="notice alert-error" *ngIf="error">{{ error }}</p>

      <section class="card" *ngIf="installedCount">
        <header class="card-header">
          <div>
            <span class="eyebrow">CAMPAIGN-READY</span>
            <h2>Provisioned campaign containers</h2>
            <p>These Industry Packs already have a campaign container for this tenant.</p>
          </div>
          <button class="button-primary" type="button" (click)="openCampaigns()">Open campaigns</button>
        </header>

        <div class="list">
          <article class="list-item" *ngFor="let pack of provisionedPacks">
            <div class="icon">✓</div>
            <div class="stack">
              <strong>{{ pack.name }}</strong>
              <small>{{ pack.code }} · {{ pack.campaignName || 'Campaign container ready' }}</small>
            </div>
            <span class="status status-active">{{ pack.campaignStatus || 'Draft' }}</span>
          </article>
        </div>
      </section>

      <section class="content-grid">
        <article class="card" *ngFor="let pack of packs">
          <header class="card-header">
            <div>
              <span class="eyebrow">INDUSTRY PACK</span>
              <h2>{{ pack.name }}</h2>
            </div>
            <span class="status" [class.status-active]="pack.provisioned">
              {{ pack.provisioned ? 'Campaign ready' : 'Available' }}
            </span>
          </header>

          <div class="card-body">
            <p>{{ pack.description || 'Business definitions for this acquisition domain.' }}</p>
            <div class="scenario-picker" *ngIf="scenarios(pack).length">
              <span class="eyebrow">CAMPAIGN SCENARIO</span>
              <button *ngFor="let scenario of scenarios(pack)" type="button"
                [class.active]="selectedScenario[pack.id]===scenario.code"
                (click)="selectedScenario[pack.id]=scenario.code">
                <strong>{{ scenario.name }}</strong><small>{{ scenario.description }}</small>
              </button>
            </div>
            <div class="list">
              <div class="list-item"><span>ICP definition</span><span class="status">Included</span></div>
              <div class="list-item"><span>Target List</span><span class="status">Included</span></div>
              <div class="list-item"><span>Campaign Steps</span><span class="status">Included</span></div>
              <div class="list-item"><span>Execution</span><span class="status">Human-controlled</span></div>
            </div>
          </div>

          <footer class="card-footer">
            <button
              class="button-primary"
              type="button"
              (click)="provision(pack)"
              [disabled]="busyId === pack.id">
              {{ busyId === pack.id ? 'Provisioning…' : (pack.provisioned ? 'Reconcile campaign' : 'Provision campaign') }}
            </button>

            <button
              class="button-secondary"
              type="button"
              *ngIf="pack.provisioned"
              (click)="openCampaigns()">
              Open campaign
            </button>
          </footer>
        </article>
      </section>

      <div class="empty" *ngIf="!packs.length">
        <strong>No Industry Packs available</strong>
        <span>Industry Packs will appear when configured by the platform.</span>
      </div>
    </main>
  `
})
export class IndustryPacksPage implements OnInit {
  packs: any[] = [];
  busyId: string | null = null;
  selectedScenario: Record<string, string> = {};
  message = '';
  error = '';

  constructor(
    private readonly data: IndustryPacksService,
    private readonly router: Router
  ) {}

  get provisionedPacks(): any[] {
    return this.packs.filter(x => x.provisioned);
  }

  get installedCount(): number {
    return this.provisionedPacks.length;
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error = '';
    this.data.list<any[]>().subscribe({
      next: packs => this.packs = packs || [],
      error: error => this.error = error?.error?.detail || 'Industry Packs could not be loaded.'
    });
  }

  provision(pack: any): void {
    if (!pack?.id) return;

    this.busyId = pack.id;
    this.message = '';
    this.error = '';

    this.data.provision<any>(pack.id, this.selectedScenario[pack.id]).subscribe({
      next: result => {
        this.busyId = null;
        pack.installed = true;
        pack.provisioned = true;
        pack.campaignId = result?.campaignId;
        pack.targetListId = result?.targetListId;
        pack.campaignStatus = result?.campaignStatus;
        pack.campaignName = result?.definition?.campaignName || pack.name + ' Acquisition';
        this.message = `${pack.name} is campaign-ready. Campaign ${result?.campaignId || ''} was provisioned.`;
      },
      error: error => {
        this.busyId = null;
        this.error = error?.error?.detail || error?.error?.error || 'The Industry Pack could not be provisioned.';
      }
    });
  }


  scenarios(pack: any): any[] {
    const code = String(pack?.code || '').toLowerCase();
    if (!code.includes('fusionfleet') && !code.includes('logistics')) return [];
    return [
      { code: 'logistics-companies', name: 'Logistics companies', description: 'Find logistics providers and operators.' },
      { code: 'transport-companies', name: 'Transport companies', description: 'Find road and transport businesses.' },
      { code: 'freight-forwarders', name: 'Freight forwarders', description: 'Find freight forwarding companies.' },
      { code: '3pl-providers', name: '3PL providers', description: 'Find third-party logistics providers.' },
      { code: 'warehouse-operators', name: 'Warehouse operators', description: 'Find warehouse and fulfillment operators.' }
    ];
  }

  openCampaigns(): void {
    void this.router.navigateByUrl('/campaigns');
  }
}
