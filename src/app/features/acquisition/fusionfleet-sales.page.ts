import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { ApiService } from "../../core/api.service";
import { AuthService } from "../../core/auth.service";
import { PageHeader } from "../../shared/ui";

type Market = {
  code: string;
  name: string;
  country: string;
  agentId?: string;
  status: string;
  run?: any;
  loading?: boolean;
  error?: string;
};

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `
    <qai-page-header title="FusionFleet Sales" subtitle="Find logistics companies and turn them into FusionFleet customers."></qai-page-header>

    <main class="page">
      <section class="intro">
        <div>
          <div class="eyebrow">LIVE CUSTOMER ACQUISITION</div>
          <h1>FusionFleet Sales</h1>
          <p>Launch discovery by market, review qualified accounts, then move approved prospects into campaigns.</p>
        </div>
        <div class="safe-state">
          <span class="dot"></span>
          Discovery-first mode
        </div>
      </section>

      <section class="kpis">
        <div class="kpi"><span>Markets</span><strong>{{ markets.length }}</strong></div>
        <div class="kpi"><span>Agents</span><strong>{{ activeAgents }}</strong></div>
        <div class="kpi"><span>Discovered</span><strong>{{ discovered }}</strong></div>
        <div class="kpi"><span>Qualified</span><strong>{{ qualified }}</strong></div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <h2>Markets</h2>
            <p>Germany, France and Italy are separate acquisition streams so conversion can be measured independently.</p>
          </div>
          <div class="section-actions"><button class="secondary" (click)="refresh()" [disabled]="loading">{{ loading ? 'Refreshing…' : 'Refresh' }}</button><button class="primary" (click)="activateAll()" [disabled]="loading">{{ loading ? 'Activating…' : 'Activate all markets' }}</button></div>
        </div>

        <div class="markets">
          <article class="market" *ngFor="let market of markets">
            <div class="market-head">
              <div>
                <div class="market-code">{{ market.code }}</div>
                <h3>{{ market.name }}</h3>
                <p>{{ market.country }} · Logistics / Transport / 3PL</p>
              </div>
              <span class="status" [class.active]="market.status === 'Active'">{{ market.status }}</span>
            </div>

            <div class="numbers">
              <div><span>Discovered</span><b>{{ market.run?.discoveredCount ?? 0 }}</b></div>
              <div><span>Qualified</span><b>{{ market.run?.qualifiedCount ?? 0 }}</b></div>
              <div><span>High score</span><b>{{ market.run?.highScoreCount ?? 0 }}</b></div>
              <div><span>Emails</span><b>{{ market.run?.emailsSentCount ?? 0 }}</b></div>
            </div>

            <div class="actions">
              <button class="primary" (click)="activateAll()" [disabled]="loading || market.loading || !!market.agentId">
                {{ market.agentId ? 'Activated' : 'Activate market' }}
              </button>
              <button class="secondary" *ngIf="market.agentId" (click)="runDiscovery(market)" [disabled]="market.loading">
                Run discovery
              </button>
            </div>

            <div class="error" *ngIf="market.error">{{ market.error }}</div>
          </article>
        </div>
      </section>

      <section class="section funnel">
        <div class="section-head">
          <div>
            <h2>Production flow</h2>
            <p>Keep discovery and qualification measurable before sending outreach.</p>
          </div>
        </div>
        <div class="steps">
          <span>ICP</span><i>→</i><span>Discovery</span><i>→</i><span>Qualification</span><i>→</i><span>Target list</span><i>→</i><span>Approval</span><i>→</i><span>Campaign</span><i>→</i><span>Reply</span><i>→</i><span>Meeting</span><i>→</i><span>Opportunity</span>
        </div>
      </section>

      <div class="error global" *ngIf="error">{{ error }}</div>
    </main>
  `,
  styles: [`
    :host { display:block; }
    .page { padding: 0 24px 32px; }
    .intro { display:flex; justify-content:space-between; gap:24px; align-items:flex-start; padding:18px 0 22px; border-bottom:1px solid #e5e7eb; }
    .eyebrow { font-size:11px; font-weight:700; letter-spacing:.12em; color:#e07a22; margin-bottom:6px; }
    h1,h2,h3,p { margin:0; }
    h1 { font-size:28px; line-height:1.15; }
    .intro p,.section-head p,.market p { margin-top:7px; color:#6b7280; font-size:13px; }
    .safe-state { border:1px solid #d1d5db; padding:9px 12px; font-size:12px; font-weight:600; background:#fff; }
    .dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#e07a22; margin-right:7px; }
    .kpis { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; padding:18px 0; }
    .kpi { background:#fff; border:1px solid #e1e4e8; padding:14px 16px; }
    .kpi span,.numbers span { display:block; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:.05em; }
    .kpi strong { display:block; margin-top:5px; font-size:24px; }
    .section { border-top:1px solid #e5e7eb; padding:20px 0; }
    .section-head { display:flex; justify-content:space-between; gap:20px; align-items:center; margin-bottom:16px; }\n    .section-actions { display:flex; gap:8px; flex-wrap:wrap; }
    .section-head h2 { font-size:18px; }
    .markets { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
    .market { background:#fff; border:1px solid #dfe3e8; padding:16px; }
    .market-head { display:flex; justify-content:space-between; gap:12px; }
    .market-code { font-size:10px; font-weight:700; color:#e07a22; letter-spacing:.1em; }
    .market h3 { margin-top:4px; font-size:17px; }
    .status { border:1px solid #d1d5db; padding:5px 8px; height:max-content; font-size:11px; font-weight:700; }
    .status.active { border-color:#9ca3af; }
    .numbers { display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin:18px 0; }
    .numbers b { display:block; margin-top:4px; font-size:18px; }
    .actions { display:flex; gap:8px; }
    button { border:0; padding:9px 12px; font:inherit; font-size:12px; font-weight:700; cursor:pointer; }
    button:disabled { opacity:.55; cursor:not-allowed; }
    .primary { background:#e07a22; color:#fff; }
    .secondary { background:#fff; color:#222; border:1px solid #cfd4da; }
    .error { margin-top:12px; padding:10px 12px; background:#fff4f4; border:1px solid #f0caca; color:#a33; font-size:12px; }
    .global { margin-top:16px; }
    .steps { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
    .steps span { background:#fff; border:1px solid #dfe3e8; padding:9px 11px; font-size:12px; font-weight:600; }
    .steps i { color:#9ca3af; font-style:normal; }
    @media(max-width:1000px){ .markets{grid-template-columns:1fr}.kpis{grid-template-columns:repeat(2,1fr)} }
    @media(max-width:650px){ .intro,.section-head{flex-direction:column}.page{padding:0 14px 24px}.numbers{grid-template-columns:repeat(2,1fr)} }
  `]
})
export class FusionFleetSalesPage {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  markets: Market[] = [
    { code: "DE", name: "Germany", country: "Germany", status: "Not configured" },
    { code: "FR", name: "France", country: "France", status: "Not configured" },
    { code: "IT", name: "Italy", country: "Italy", status: "Not configured" }
  ];
  loading = false;
  error = "";

  get tenantId(): string { return this.auth.session()?.tenantId || ""; }
  get activeAgents(): number { return this.markets.filter(x => !!x.agentId).length; }
  get discovered(): number { return this.markets.reduce((n,x)=>n + Number(x.run?.discoveredCount || 0),0); }
  get qualified(): number { return this.markets.reduce((n,x)=>n + Number(x.run?.qualifiedCount || 0),0); }

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    if (!this.tenantId) { this.error = 'No active tenant session.'; return; }
    this.loading = true;
    this.error = '';
    this.api.get<any[]>('autonomous-acquisition/tenants/' + this.tenantId + '/agents').subscribe({
      next: agents => {
        for (const market of this.markets) {
          const agent = (agents || []).find(x => String(x.name || '').toLowerCase() === ('fusionfleet — ' + market.country + ' logistics').toLowerCase());
          market.agentId = agent?.id;
          market.status = this.statusLabel(agent?.status);
          market.run = null;
          if (market.agentId) this.loadRuns(market);
        }
        this.loading = false;
      },
      error: e => { this.error = e?.error?.detail || 'Could not load FusionFleet acquisition markets.'; this.loading = false; }
    });
  }

  activateAll(): void {
    if (!this.tenantId) return;
    this.loading = true;
    this.error = '';
    this.api.get<any[]>('autonomous-acquisition/tenants/' + this.tenantId + '/agents').subscribe({
      next: agents => {
        const existing = agents || [];
        const missing = this.markets.filter(market =>
          !existing.some(x => String(x.name || '').toLowerCase() === ('fusionfleet — ' + market.country + ' logistics').toLowerCase())
        );

        if (!missing.length) {
          this.refresh();
          return;
        }

        let remaining = missing.length;
        let failed = false;

        for (const market of missing) {
          const payload = {
            name: 'FusionFleet — ' + market.country + ' Logistics',
            templateCode: 'logistics',
            industry: 'Logistics & Transport',
            region: 'Europe',
            countriesJson: JSON.stringify([market.country]),
            icpJson: JSON.stringify({
              industries: ['Logistics', 'Transportation', 'Freight Forwarding', '3PL', 'Warehousing', 'Distribution'],
              employeeRange: '20-1000',
              decisionMakerTitles: ['CEO', 'Owner', 'Managing Director', 'Sales Director', 'Commercial Director', 'Operations Director', 'Fleet Manager', 'Logistics Director'],
              minimumScore: 70
            }),
            minimumScore: 70,
            dailyDiscoveryLimit: 50,
            dailyEmailLimit: 0,
            runTimeUtc: '08:00:00',
            status: 'Active'
          };

          this.api.post<any>('autonomous-acquisition/tenants/' + this.tenantId + '/agents', payload).subscribe({
            next: () => {
              remaining--;
              if (remaining === 0 && !failed) this.refresh();
            },
            error: e => {
              failed = true;
              this.error = e?.error?.detail || 'FusionFleet sales activation failed.';
              remaining--;
              if (remaining === 0) this.loading = false;
            }
          });
        }
      },
      error: e => { this.error = e?.error?.detail || 'FusionFleet sales activation failed.'; this.loading = false; }
    });
  }

  private statusLabel(value: any): string {
    if (value === 1 || String(value).toLowerCase() === 'active') return 'Active';
    if (value === 2 || String(value).toLowerCase() === 'paused') return 'Paused';
    if (value === 3 || String(value).toLowerCase() === 'stopped') return 'Stopped';
    return value == null ? 'Not configured' : String(value);
  }

  runDiscovery(market: Market): void {
    if (!market.agentId) return;
    market.loading = true;
    market.error = "";
    this.api.post<any>('autonomous-acquisition/tenants/' + this.tenantId + '/agents/' + market.agentId + '/run', {}).subscribe({
      next: run => {
        market.run = run;
        market.loading = false;
        setTimeout(() => this.loadRuns(market), 1200);
      },
      error: e => { market.error = e?.error?.detail || 'Discovery run could not be queued.'; market.loading = false; }
    });
  }

  private loadRuns(market: Market): void {
    if (!market.agentId) return;
    this.api.get<any[]>('autonomous-acquisition/tenants/' + this.tenantId + '/agents/' + market.agentId + '/runs').subscribe({
      next: runs => { market.run = runs?.[0] || null; },
      error: () => {}
    });
  }
}
