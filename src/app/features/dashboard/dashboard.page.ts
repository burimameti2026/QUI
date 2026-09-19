import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { DEFAULT_DASHBOARD_PAGE_CONFIG, UiPageAction, UiPageConfig } from '../../shared/ui-page-config';
import { UiPageRenderer } from '../../shared/ui-page-renderer';

@Component({
  standalone: true,
  imports: [CommonModule, UiPageRenderer],
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

  readonly workflowSteps = [
    { number:'01', category:'PRODUCT', title:'Product readiness', subtitle:'Catalog & localization', active:true },
    { number:'02', category:'MARKET', title:'Promotion plan', subtitle:'Target markets & positioning' },
    { number:'03', category:'ACQUISITION', title:'Autonomous discovery', subtitle:'Find & qualify prospects' },
    { number:'04', category:'OUTREACH', title:'Human-approved delivery', subtitle:'Campaigns & replies' },
    { number:'05', category:'DEMAND', title:'Qualified demand', subtitle:'Commercial handoff' }
  ];

  get pageConfig(): UiPageConfig {
    const base = structuredClone(DEFAULT_DASHBOARD_PAGE_CONFIG);
    const byId = (id: string) => base.sections.flatMap(s => s.components).find(c => c.id === id);
    const workflow = byId('workflow-steps');
    const picture = byId('operating-picture');
    const kpis = byId('operating-kpis');
    const acquisition = byId('acquisition-engine');
    const outreach = byId('active-outreach');
    const programs = byId('program-table');
    const publicExperience = byId('public-experience');
    const review = byId('human-review');
    const handoff = byId('fusionfleet-handoff');

    if (workflow) workflow.data = { steps: this.workflowSteps };
    if (picture) picture.data = { text: 'The catalog is the source of truth for promotion. Autonomous acquisition finds and qualifies distributors. Campaigns prepare outreach. Human approval controls delivery. Public portal inquiries become inbound demand.' };
    if (kpis) kpis.data = { items: [
      { label:'Product catalog', value:this.products.length, subtitle:`${this.publishedProducts} public publications live`, icon:'▦', tone:'blue', action:{label:'Open',route:'/catalog'} },
      { label:'Promotion plans', value:this.activePlans, subtitle:'active market programs', icon:'✦', tone:'violet', action:{label:'Open',route:'/renova/promotion'} },
      { label:'Autonomous agents', value:this.activeAgentCount, subtitle:'running acquisition engines', icon:'↯', tone:'green', action:{label:'Open',route:'/acquisition/autonomous'} },
      { label:'Prospects discovered', value:this.acquisition.discovered || 0, subtitle:`${this.qualifiedProspects} high-fit prospects`, icon:'⌕', tone:'amber', action:{label:'Open',route:'/discover'} },
      { label:'Awaiting delivery', value:this.queuedMessages, subtitle:'review the approval queue', icon:'✓', tone:'rose', action:{label:'Open',route:'/acquisition/approval-queue'} }
    ]};
    if (acquisition) {
      acquisition.data = { badge:this.recentRun ? (this.recentRun.status || 'Run ready') : 'Ready', rows:[
        {label:'Latest discovery run',value:`${this.recentRun?.discoveredCount || 0} prospects`},
        {label:'Qualified',detail:'Passed autonomous scoring threshold',value:this.recentRun?.qualifiedCount || 0},
        {label:'High score',detail:'Ready for targeted sales action',value:this.recentRun?.highScoreCount || 0}
      ]};
      acquisition.actions=[{label:'Open agent',route:'/acquisition/autonomous'}];
    }
    if (outreach) {
      outreach.data = { rows:[
        {label:'Running campaigns',value:this.campaigns.length},
        {label:'Queued messages',value:this.queuedMessages},
        {label:'Replies',value:this.acquisition.replies || 0}
      ], text:'Guardrail: approval before delivery'};
      outreach.actions=[{label:'View campaigns',route:'/campaigns'}];
    }
    if (programs) {
      programs.data = { columns:[
        {key:'program',label:'Program'},{key:'language',label:'Language'},{key:'status',label:'Status'},{key:'automation',label:'Automation'}
      ], rows:this.programRows, emptyText:'No promotion plans have been created.'};
      programs.actions=[{label:'Manage plans',route:'/renova/promotion'}];
    }
    if (publicExperience) {
      publicExperience.data = { items:this.publicExperience };
      publicExperience.actions=[{label:'Open portal',route:'/renova/portal'}];
    }
    if (review) { review.data={text:'Use the approval queue to review the exact subject, body and destination before delivery. The backend still enforces sender verification, suppression and provider controls.'}; review.actions=[{label:'Open queue',route:'/acquisition/approval-queue'}]; }
    if (handoff) handoff.data={text:'LeadsAI stops at qualified marketing demand and commercial opportunity. Orders, operations, inventory and delivery remain in FusionFleet.'};

    this.applyWhiteLabelLayout(base);
    return base;
  }

  private applyWhiteLabelLayout(config: UiPageConfig) {
    const raw = localStorage.getItem('qai-white-label-page-layout');
    if (!raw) return;
    try {
      const layout = JSON.parse(raw) as Array<any>;
      const bySection = new Map(layout.map(section => [section.id, section]));

      const header = bySection.get('header')?.items?.find((item: any) => item.enabled);
      if (header) {
        config.header = config.header || {};
        if (header.label) config.header.title = header.label;
        if (header.template) (config as any).headerTemplate = header.template;
        if (header.appearance) config.header.appearance = header.appearance;
      }

      const componentMap: Record<string, string> = {
        'kpi-1':'operating-kpis','kpi-2':'operating-kpis','kpi-3':'operating-kpis','kpi-4':'operating-kpis','kpi-5':'operating-kpis',
        'card-1':'acquisition-engine','card-2':'active-outreach'
      };

      for (const section of config.sections) {
        const saved = bySection.get(section.id);
        if (!saved) continue;

        const savedItems = (saved.items || []).filter((item: any) => item.enabled !== false);
        if (!savedItems.length && saved.items?.length) {
          section.components = [];
          continue;
        }

        section.columns = saved.columns || section.columns;
        for (const item of savedItems) {
          const targetId = componentMap[item.id] || item.id;
          const target = section.components.find(component => component.id === targetId);
          if (!target) continue;
          if (item.template) target.template = item.template as any;
          if (item.label && target.type !== 'metrics') target.title = item.label;
          if (item.appearance) target.appearance = item.appearance;
        }
      }

      const kpiSection = bySection.get('kpis');
      const kpiComponent = config.sections.flatMap(s => s.components).find(c => c.id === 'operating-kpis');
      if (kpiSection && kpiComponent) {
        const configured = (kpiSection.items || []).filter((item: any) => item.enabled !== false);
        const current = this.valueFromConfig(kpiComponent, 'items');
        if (Array.isArray(current)) {
          kpiComponent.data = {
            ...(kpiComponent.data || {}),
            items: current.map((metric: any, index: number) => {
              const item = configured[index];
              return item ? { ...metric, label: item.label || metric.label } : metric;
            })
          };
        }
        const appearances = configured.map((item: any) => item.appearance).filter(Boolean);
        if (appearances.length) (kpiComponent as any).itemAppearances = appearances;
      }
    } catch {
      // Ignore invalid white-label overrides and keep the safe runtime configuration.
    }
  }

  private valueFromConfig(component: any, key: string): unknown {
    return component?.data?.[key];
  }

  get programRows(): Array<Record<string, unknown>> {
    return this.plans.map(plan => ({
      program:plan.name || '', language:String(plan.campaignLanguage || '').toUpperCase(),
      status:plan.status || '', automation:plan.enableAutonomousProspecting ? 'Autonomous' : 'Manual'
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

  handleAction(action: UiPageAction) { if (action.command === 'refresh') { void this.refresh(); return; } if (action.route) this.go(action.route); }

  go(path: string) { void this.router.navigateByUrl(path); }
}
