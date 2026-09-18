import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { UiCard, UiListCard, UiMetric, UiMetrics, UiSection, UiStep, UiSteps, UiTableCard, UiCardModel } from '../../shared/enterprise-ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader, UiSection, UiSteps, UiMetrics, UiCard, UiListCard, UiTableCard],
  templateUrl: './dashboard.page.html'
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
  get activeAgentCount() { return this.agents.filter(x => String(x.status).toLowerCase().includes('active') || x.status === 1).length; }
  get publishedProducts() { return this.products.filter(x => String(x.publication?.status || '').toLowerCase() === 'published').length; }
  get activePlans() { return this.plans.filter(x => String(x.status).toLowerCase() === 'active').length; }
  get recentRun() { return this.runs[0]; }
  get queuedMessages() { return Number(this.acquisition.queuedMessages || 0); }
  get qualifiedProspects() { return Number(this.acquisition.hot || 0); }

  readonly workflowSteps: UiStep[] = [
    { number:'01', category:'PRODUCT', title:'Product readiness', subtitle:'Catalog & localization', active:true },
    { number:'02', category:'MARKET', title:'Promotion plan', subtitle:'Target markets & positioning' },
    { number:'03', category:'ACQUISITION', title:'Autonomous discovery', subtitle:'Find & qualify prospects' },
    { number:'04', category:'OUTREACH', title:'Human-approved delivery', subtitle:'Campaigns & replies' },
    { number:'05', category:'DEMAND', title:'Qualified demand', subtitle:'Commercial handoff' }
  ];

  get metrics(): UiMetric[] {
    return [
      { label:'Product catalog', value:this.products.length, subtitle:`${this.publishedProducts} public publications live`, icon:'▦', tone:'blue', action:{label:'Open',route:'/catalog'} },
      { label:'Promotion plans', value:this.activePlans, subtitle:'active market programs', icon:'✦', tone:'violet', action:{label:'Open',route:'/renova/promotion'} },
      { label:'Autonomous agents', value:this.activeAgentCount, subtitle:'running acquisition engines', icon:'↯', tone:'green', action:{label:'Open',route:'/acquisition/autonomous'} },
      { label:'Prospects discovered', value:this.acquisition.discovered || 0, subtitle:`${this.qualifiedProspects} high-fit prospects`, icon:'⌕', tone:'amber', action:{label:'Open',route:'/discover'} },
      { label:'Awaiting delivery', value:this.queuedMessages, subtitle:'review the approval queue', icon:'✓', tone:'rose', action:{label:'Open',route:'/acquisition/approval-queue'} }
    ];
  }

  get acquisitionCard(): UiCardModel {
    return {
      eyebrow:'AUTONOMOUS LOOP',
      title:'Acquisition engine',
      badge:this.recentRun ? (this.recentRun.status || 'Run ready') : 'Ready',
      rows:[
        {label:'Latest discovery run',value:`${this.recentRun?.discoveredCount || 0} prospects`},
        {label:'Qualified',detail:'Passed autonomous scoring threshold',value:this.recentRun?.qualifiedCount || 0},
        {label:'High score',detail:'Ready for targeted sales action',value:this.recentRun?.highScoreCount || 0}
      ],
      action:{label:'Open agent',route:'/acquisition/autonomous'}
    };
  }

  get outreachCard(): UiCardModel {
    return {
      eyebrow:'CAMPAIGN CONTROL',
      title:'Active outreach',
      rows:[
        {label:'Running campaigns',value:this.campaigns.length},
        {label:'Queued messages',value:this.queuedMessages},
        {label:'Replies',value:this.acquisition.replies || 0}
      ],
      text:'Guardrail: approval before delivery',
      action:{label:'View campaigns',route:'/campaigns'}
    };
  }

  get programRows(): Array<Record<string, unknown>> {
    return this.plans.map(plan => ({
      program:plan.name || '',
      language:String(plan.campaignLanguage || '').toUpperCase(),
      status:plan.status || '',
      automation:plan.enableAutonomousProspecting ? 'Autonomous' : 'Manual'
    }));
  }

  get publicExperience() {
    return [
      {icon:'▦',title:`${this.products.length} catalog products`,subtitle:`${this.publishedProducts} are published to the public Renova portal.`,badge:'LIVE',tone:'success'},
      {icon:'◎',title:'4-language content',subtitle:'EN, MK, SQ and DE localization is seeded for the demo workspace.',badge:'READY',tone:'success'},
      {icon:'↯',title:'Inbound inquiry path',subtitle:'Distributor inquiries enter the tenant workspace as structured portal inquiries.',badge:'CONNECTED',tone:'success'}
    ];
  }

  ngOnInit(): void { void this.refresh(); }

  async refresh() {
    this.loaded = false; this.error = '';
    try {
      const requests = await Promise.all([
        firstValueFrom(this.api.get<any[]>('renova/catalog/products')),
        firstValueFrom(this.api.get<any[]>('renova/catalog/promotion-plans')),
        firstValueFrom(this.api.get<any[]>('acquisition/campaigns')),
        firstValueFrom(this.api.get<any>('acquisition/overview')),
        this.tenantId ? firstValueFrom(this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/agents`)) : Promise.resolve([]),
        this.tenantId ? firstValueFrom(this.api.get<any[]>(`autonomous-acquisition/tenants/${this.tenantId}/runs`)) : Promise.resolve([])
      ]);
      [this.products, this.plans, this.campaigns, this.acquisition, this.agents, this.runs] = requests;
    } catch (error: any) {
      this.error = error?.error?.detail || 'Renova command center could not load live workspace data.';
    } finally { this.loaded = true; }
  }

  go(path: string) { void this.router.navigateByUrl(path); }
}
