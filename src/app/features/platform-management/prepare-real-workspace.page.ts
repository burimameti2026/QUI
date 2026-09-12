import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AdminStaticI18nDirective } from '../../core/admin-static-i18n.directive';
import { RealWorkspaceOptions, RealWorkspaceRequest, RealWorkspaceResult, RealWorkspaceService } from './real-workspace.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeader, AdminStaticI18nDirective],
  template: `
    <div qaiAdminStaticI18n>
      <qai-page-header title="Prepare Real Workspace" subtitle="Configure a tenant-owned acquisition workspace and start its autonomous operating loop."></qai-page-header>

      <nav class="steps" aria-label="Workspace setup progress">
        <span [class.active]="step===1" [class.done]="step>1"><b>01</b> Area</span>
        <span [class.active]="step===2" [class.done]="step>2"><b>02</b> Target</span>
        <span [class.active]="step===3"><b>03</b> Automation</span>
      </nav>

      <section *ngIf="step===1" class="section">
        <div class="section-heading"><span class="eyebrow">WORKSPACE PURPOSE</span><h2>What should this workspace do?</h2><p>Select the operating area. This determines which acquisition automation is provisioned for this tenant.</p></div>
        <div class="grid">
          <button type="button" class="card choice blue" *ngFor="let item of options?.useCases" [class.selected]="useCase===item.id" (click)="selectArea(item.id)">
            <span class="card-number">→</span><h3>{{item.name}}</h3><p>{{item.description}}</p><strong>Select operating area →</strong>
          </button>
        </div>
      </section>

      <section *ngIf="step===2" class="section">
        <div class="section-heading split-heading">
          <div><span class="eyebrow">TARGET MARKET</span><h2>Define the target market</h2><p>You provide business context. Prospecting, enrichment, qualification and campaign routing happen automatically inside this tenant.</p></div>
          <button type="button" class="secondary" (click)="step=1">← Back</button>
        </div>

        <div class="form-grid">
          <label>Template<select [(ngModel)]="templateKey"><option value="">Select template</option><option *ngFor="let t of templates" [value]="t.id">{{t.name}}</option></select></label>
          <label>Industry<input [(ngModel)]="industry" placeholder="Logistics, SaaS, Manufacturing..."/></label>
          <label>Region<input [(ngModel)]="region" placeholder="DACH, Europe, North America..."/></label>
          <label>Countries<input [(ngModel)]="countries" placeholder="Germany, Austria, Switzerland"/></label>
          <label>Workspace name<input [(ngModel)]="name" placeholder="Optional workspace name"/></label>
          <label>Daily discovery limit<input type="number" [(ngModel)]="dailyDiscoveryLimit" min="1" max="100"/></label>
          <label>Minimum qualification score<input type="number" [(ngModel)]="minimumScore" min="1" max="100"/></label>
        </div>

        <div class="automation">
          <div class="automation-heading"><span class="eyebrow">AUTONOMOUS LOOP</span><strong>Automation plan</strong><small>Once started, the background worker continues the tenant's scheduled acquisition runs.</small></div>
          <div class="pipeline"><span>Configure Agent</span><i>→</i><span>Discover</span><i>→</i><span>Enrich</span><i>→</i><span>Qualify</span><i>→</i><span>Route to Campaign</span></div>
        </div>

        <div class="actions"><button type="button" class="primary" [disabled]="!ready||saving" (click)="start()">{{saving?'Preparing automation…':'Prepare & Start Automation'}}</button></div>
      </section>

      <section *ngIf="step===3" class="section result-section">
        <div class="success-head">
          <div><span class="eyebrow">AUTOMATION CONTROL</span><h2>Automation started</h2><p>The workspace is prepared for this tenant. The initial acquisition run is queued and the daily scheduler will continue automatically.</p></div>
          <span class="state-pill">{{result?.status || 'activation-queued'}}</span>
        </div>

        <div class="result-grid">
          <div><small>Agent</small><strong>{{result?.agentName || '-'}}</strong><span>{{result?.agentStatus || '-'}}</span></div>
          <div><small>Initial run</small><strong>{{result?.initialRunId || 'Already queued / not returned'}}</strong><span>Queued for autonomous discovery</span></div>
          <div><small>Target list</small><strong>{{result?.targetListId || 'Provisioned / pending'}}</strong><span>Qualified prospects route here</span></div>
          <div><small>Campaign</small><strong>{{result?.campaignId || 'Provisioned / pending'}}</strong><span>Delivery remains approval-controlled</span></div>
        </div>

        <div class="timeline">
          <div class="done"><b>Workspace configured</b><small>Selected template and target market applied to this tenant only.</small></div>
          <div class="done"><b>Autonomous agent active</b><small>{{result?.agentName}} · {{result?.agentStatus}}</small></div>
          <div [class.done]="!!result?.initialRunId"><b>Initial prospecting queued</b><small>The first acquisition run is handled by the background worker.</small></div>
          <div [class.done]="!!result?.targetListId"><b>Qualified target list ready</b><small>Qualified prospects enter the tenant target list automatically.</small></div>
          <div [class.done]="!!result?.campaignId"><b>Acquisition campaign ready</b><small>Campaign workspace is provisioned; outreach remains governed by sender and approval configuration.</small></div>
          <div class="done"><b>Daily automation enabled</b><small>New acquisition runs continue on the tenant's configured schedule.</small></div>
        </div>

        <div class="actions"><a routerLink="/acquisition/autonomous" class="primary">Open Acquisition →</a><a routerLink="/discover" class="secondary-link">Open Prospects →</a><a routerLink="/golden-pipeline" class="secondary-link">Open Golden Pipeline →</a></div>
      </section>

      <div class="status" *ngIf="status" [class.error]="error"><strong>{{error?'Workspace action failed':'Workspace status'}}</strong><span>{{status}}</span></div>
    </div>
  `,
  styles: [`
    :host{display:block;--dash-border:#dfe5ed;--dash-ink:#172033;--dash-muted:#68758a}
    .eyebrow{display:block;color:#66748b;font-size:10px;font-weight:800;letter-spacing:1.15px}
    .steps{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
    .steps span{display:flex;align-items:center;gap:8px;padding:8px 12px;border:1px solid #dfe5ed;border-radius:999px;background:#fff;color:#7b8798;font-size:9px;font-weight:700}
    .steps span b{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#f1f4f8;color:#7b8798;font-size:8px}
    .steps .active{border-color:#b9cef4;background:#f4f8ff;color:#315fbd}.steps .active b,.steps .done b{background:#dbeafe;color:#2563eb}.steps .done{color:#475467}
    .section{margin:0 0 14px;padding:18px;border:1px solid #dfe5ed;border-radius:14px;background:#f4f6f9;box-shadow:0 6px 18px #17203309}
    .section-heading{margin-bottom:14px}.section-heading h2{margin:5px 0 5px;color:#172033;font-size:20px;letter-spacing:-.35px}.section-heading p{margin:0;max-width:760px;color:#68758a;font-size:10px;line-height:1.6}.split-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
    .choice{width:100%;text-align:left;cursor:pointer}.card{--accent:#2563eb;--accent-soft:#dbeafe;position:relative;display:block;min-height:145px;box-sizing:border-box;padding:16px;overflow:hidden;text-decoration:none;color:inherit;border:1px solid #dfe5ed;border-radius:13px;background:linear-gradient(145deg,#fff 0%,#f4f6f9 100%);box-shadow:0 5px 16px #1720330a;transition:transform 160ms ease,border-color 160ms ease,box-shadow 160ms ease}.card::before{content:'';position:absolute;inset:0 0 auto;height:3px;background:var(--accent)}.card::after{content:'';position:absolute;width:90px;height:90px;top:-52px;right:-38px;border-radius:50%;background:var(--accent-soft);opacity:.65}.card:hover,.card.selected{transform:translateY(-2px);border-color:#9dbbe9;box-shadow:0 12px 26px #17203314}.card.selected{outline:2px solid #2563eb33}.card.blue{--accent:#2563eb;--accent-soft:#dbeafe}.card-number{position:relative;z-index:1;display:grid;width:31px;height:31px;place-items:center;margin-bottom:13px;border-radius:9px;color:var(--accent);background:var(--accent-soft);font-size:10px;font-weight:800}.card h3{position:relative;z-index:1;margin:0 0 6px;color:#172033;font-size:13px}.card p{position:relative;z-index:1;margin:0;min-height:32px;color:#68758a;font-size:9px;line-height:1.55}.card strong{position:relative;z-index:1;display:block;margin-top:12px;color:var(--accent);font-size:9px}
    .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.form-grid label{display:flex;flex-direction:column;gap:6px;color:#5f6c80;font-size:9px;font-weight:700}.form-grid input,.form-grid select{width:100%;box-sizing:border-box;height:38px;padding:0 10px;border:1px solid #dfe5ed;border-radius:8px;background:#fff;color:#172033;outline:0}.form-grid input:focus,.form-grid select:focus{border-color:#9dbbe9;box-shadow:0 0 0 3px #2563eb12}
    .automation{margin-top:14px;padding:15px;border:1px solid #d9e0e9;border-radius:11px;background:#fff}.automation-heading{display:flex;flex-direction:column;gap:4px}.automation-heading strong{color:#172033;font-size:13px}.automation-heading small{color:#7b8798;font-size:9px}.pipeline{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:13px}.pipeline span{padding:7px 10px;border:1px solid #d9e0e9;border-radius:999px;background:#f8fafc;color:#536176;font-size:9px;font-weight:700}.pipeline i{font-style:normal;color:#9aa7b8}
    .actions{display:flex;gap:9px;justify-content:flex-end;margin-top:16px;flex-wrap:wrap}.primary{display:inline-flex;align-items:center;justify-content:center;padding:11px 16px;border:1px solid #2563eb;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;font-size:10px;font-weight:800;box-shadow:0 5px 12px #2563eb25}.primary:hover{background:#1d4ed8}.primary:disabled{opacity:.5;cursor:not-allowed}.secondary,.secondary-link{display:inline-flex;align-items:center;padding:10px 14px;border:1px solid #d9e0e9;border-radius:8px;background:#fff;color:#315fbd;text-decoration:none;font-size:9px;font-weight:700}.secondary:hover,.secondary-link:hover{background:#f1f5fb;border-color:#c4d1e3}
    .success-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.success-head h2{margin:5px 0;color:#172033;font-size:20px}.success-head p{max-width:720px;margin:0;color:#68758a;font-size:10px;line-height:1.6}.state-pill{padding:7px 10px;border-radius:999px;background:#eaf8ee;color:#16703a;border:1px solid #bde8ca;font-size:9px;font-weight:800;white-space:nowrap}
    .result-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:16px}.result-grid>div{padding:14px;border:1px solid #d9e0e9;border-radius:10px;background:linear-gradient(100deg,#f8fafc,#edf1f5)}.result-grid small,.result-grid strong,.result-grid span{display:block}.result-grid small{color:#68758a;font-size:9px}.result-grid strong{margin-top:6px;color:#172033;font-size:10px;overflow-wrap:anywhere}.result-grid span{margin-top:4px;color:#68758a;font-size:9px}
    .timeline{display:grid;margin-top:18px}.timeline div{position:relative;padding:13px 15px 13px 38px;border-left:2px solid #dfe5ed}.timeline div:before{content:'○';position:absolute;left:-10px;top:9px;background:#f4f6f9;color:#8a96a8;font-size:18px}.timeline .done:before{content:'✓';font-weight:800;color:#059669}.timeline b,.timeline small{display:block}.timeline b{color:#172033;font-size:10px}.timeline small{margin-top:4px;color:#68758a;font-size:9px;line-height:1.5}
    .status{display:flex;gap:8px;align-items:center;padding:10px 12px;margin-top:10px;border:1px solid #dfe5ed;border-radius:9px;background:#fff;color:#68758a;font-size:9px}.status strong{color:#172033}.status.error{border-color:#fecdd3;background:#fff1f2;color:#9f1239}.status.error strong{color:#9f1239}
    @media(max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.result-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:700px){.split-heading,.success-head{flex-direction:column}.form-grid,.grid,.result-grid{grid-template-columns:1fr}.actions{justify-content:flex-start}.state-pill{align-self:flex-start}}
  `]
})
export class PrepareRealWorkspacePage {
  private readonly service=inject(RealWorkspaceService); options:RealWorkspaceOptions|null=null; result:RealWorkspaceResult|null=null; step=1; useCase=''; templateKey=''; industry=''; region=''; countries=''; name=''; dailyDiscoveryLimit=25; minimumScore=70; saving=false; status=''; error=false;
  ngOnInit(){this.service.options().subscribe({next:x=>this.options=x,error:()=>this.fail('Could not load workspace options.')});}
  get templates(){return (this.options?.templates||[]).filter(x=>!this.useCase||x.useCaseId===this.useCase);}
  get ready(){return !!this.useCase&&!!this.templateKey&&!!this.industry&&!!this.region;}
  selectArea(id:string){this.useCase=id;this.templateKey='';this.step=2;}
  start(){if(!this.ready)return;this.saving=true;this.status='';this.error=false;this.service.prepare(this.request()).subscribe({next:x=>{this.result=x;this.step=3;this.saving=false;this.status='Workspace automation queued successfully.'},error:e=>{this.saving=false;this.fail(e?.error?.detail||e?.error?.error||'Could not start workspace automation.')}});}
  private request():RealWorkspaceRequest{return {tenantId:'',name:this.name||null,useCase:this.useCase,templateKey:this.templateKey,industry:this.industry,region:this.region,countriesJson:JSON.stringify(this.countries.split(',').map(x=>x.trim()).filter(Boolean)),dailyDiscoveryLimit:this.dailyDiscoveryLimit,minimumScore:this.minimumScore};}
  private fail(message:string){this.status=message;this.error=true;}
}
