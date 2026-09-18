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
    :host{display:block;min-height:100%;background:#f5f7fb;color:#101828}
    .eyebrow{display:block;color:#98a2b3;font-size:9px;font-weight:800;letter-spacing:.11em}
    .steps{display:flex;gap:8px;margin:0 28px 14px;flex-wrap:wrap}
    .steps span{display:flex;align-items:center;gap:8px;min-height:34px;padding:0 11px;border:1px solid #e5e9f0;border-radius:8px;background:#fff;color:#7b8798;font-size:9px;font-weight:700}
    .steps span b{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#f2f4f7;color:#98a2b3;font-size:8px}
    .steps .active{border-color:#fed7aa;background:#fff7ed;color:#c2410c}.steps .active b{background:#ffedd5;color:#ea580c}
    .steps .done{color:#475467}.steps .done b{background:#eaf8ee;color:#15803d}
    .section{margin:0 28px 14px;padding:20px;border:1px solid #e5e9f0;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.03),0 4px 14px rgba(36,60,88,.045)}
    .section-heading{margin-bottom:16px}.section-heading h2{margin:5px 0;color:#101828;font-size:18px;line-height:1.2;font-weight:700;letter-spacing:-.02em}.section-heading p{max-width:760px;margin:0;color:#667085;font-size:10px;line-height:1.55}
    .split-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:18px}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .choice{width:100%;text-align:left;cursor:pointer}
    .card{--accent:#f97316;--accent-soft:#fff7ed;position:relative;display:block;min-height:156px;padding:16px;overflow:hidden;border:1px solid #e5e9f0;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.03);transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease}
    .card:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:var(--accent)}.card:after{content:"";position:absolute;width:92px;height:92px;top:-54px;right:-38px;border-radius:50%;background:var(--accent-soft);opacity:.75}
    .card:hover,.card.selected{transform:translateY(-1px);border-color:#fdba74;box-shadow:0 6px 18px rgba(36,60,88,.08)}.card.selected{outline:2px solid rgba(249,115,22,.14)}
    .card-number{position:relative;z-index:1;display:grid;width:31px;height:31px;place-items:center;margin-bottom:13px;border-radius:8px;background:var(--accent-soft);color:var(--accent);font-size:11px;font-weight:800}
    .card h3{position:relative;z-index:1;margin:0 0 6px;color:#172033;font-size:13px}.card p{position:relative;z-index:1;margin:0;min-height:32px;color:#667085;font-size:9px;line-height:1.5}.card strong{position:relative;z-index:1;display:block;margin-top:13px;color:#c2410c;font-size:9px}
    .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.form-grid label{display:flex;flex-direction:column;gap:6px;color:#667085;font-size:9px;font-weight:700}.form-grid input,.form-grid select{width:100%;height:38px;padding:0 10px;border:1px solid #dfe5ed;border-radius:8px;background:#fff;color:#172033;font-size:10px;outline:0}.form-grid input:focus,.form-grid select:focus{border-color:#fdba74;box-shadow:0 0 0 3px rgba(249,115,22,.08)}
    .automation{margin-top:14px;padding:15px;border:1px solid #e5e9f0;border-radius:9px;background:#f8fafc}.automation-heading{display:flex;flex-direction:column;gap:4px}.automation-heading strong{color:#172033;font-size:12px}.automation-heading small{color:#8293a7;font-size:9px}.pipeline{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));align-items:center;gap:8px;margin-top:13px}.pipeline span{display:flex;align-items:center;justify-content:center;min-height:32px;padding:0 8px;border:1px solid #e1e7ef;border-radius:8px;background:#fff;color:#475467;font-size:9px;font-weight:700;text-align:center}.pipeline i{font-style:normal;text-align:center;color:#98a2b3;font-size:12px}
    .actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px;flex-wrap:wrap}.primary{display:inline-flex;align-items:center;justify-content:center;height:34px;min-height:34px;padding:0 14px;border:0;border-radius:8px;background:#f97316;color:#fff;text-decoration:none;font-size:10px;font-weight:750}.primary:hover{background:#ea580c}.primary:disabled{opacity:.5;cursor:not-allowed}.secondary,.secondary-link{display:inline-flex;align-items:center;height:34px;padding:0 12px;border:1px solid #dfe5ed;border-radius:8px;background:#fff;color:#475467;text-decoration:none;font-size:9px;font-weight:700}.secondary:hover,.secondary-link:hover{background:#f8fafc;border-color:#cfd8e4}
    .result-section{padding-bottom:18px}.success-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.success-head h2{margin:5px 0;color:#101828;font-size:18px}.success-head p{max-width:720px;margin:0;color:#667085;font-size:10px;line-height:1.55}.state-pill{padding:6px 9px;border:1px solid #ccebd9;border-radius:999px;background:#f0faf4;color:#15803d;font-size:8px;font-weight:800;white-space:nowrap}
    .result-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:16px}.result-grid>div{min-width:0;padding:13px;border:1px solid #e5e9f0;border-radius:9px;background:#f8fafc}.result-grid small,.result-grid strong,.result-grid span{display:block}.result-grid small{color:#98a2b3;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:.06em}.result-grid strong{margin-top:6px;color:#172033;font-size:10px;overflow-wrap:anywhere}.result-grid span{margin-top:4px;color:#8293a7;font-size:9px;line-height:1.35}
    .timeline{display:grid;margin-top:18px}.timeline div{position:relative;padding:12px 14px 12px 32px;border-left:1px solid #dfe5ed}.timeline div:before{content:"";position:absolute;left:-5px;top:17px;width:8px;height:8px;border:2px solid #cbd5e1;border-radius:50%;background:#fff}.timeline .done:before{border-color:#22c55e;background:#dcfce7}.timeline b,.timeline small{display:block}.timeline b{color:#172033;font-size:10px}.timeline small{margin-top:4px;color:#8293a7;font-size:9px;line-height:1.45}
    .status{display:flex;align-items:center;gap:8px;margin:0 28px 18px;padding:10px 12px;border:1px solid #e5e9f0;border-radius:9px;background:#fff;color:#667085;font-size:9px}.status strong{color:#172033}.status.error{border-color:#fecdd3;background:#fff1f2;color:#9f1239}.status.error strong{color:#9f1239}
    @media(max-width:1100px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.result-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pipeline{grid-template-columns:repeat(5,minmax(0,1fr))}.pipeline i{display:none}}
    @media(max-width:760px){.steps,.section,.status{margin-left:16px;margin-right:16px}.grid,.form-grid,.result-grid{grid-template-columns:1fr}.split-heading,.success-head{flex-direction:column}.pipeline{grid-template-columns:1fr}.actions{justify-content:flex-start}}
    @media(max-width:560px){.steps,.section,.status{margin-left:0;margin-right:0}.section{padding:16px;border-left:0;border-right:0;border-radius:0}}
  `]})
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
