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
    <main class="page" qaiAdminStaticI18n>
      <qai-page-header title="Prepare Real Workspace" subtitle="Configure a tenant-owned acquisition workspace and start its autonomous operating loop.">
        <div actions class="page-actions"><a class="button-secondary" routerLink="/platform">Back to Platform</a></div>
      </qai-page-header>

      <nav class="steps" aria-label="Workspace setup progress">
        <span [class.active]="step===1" [class.done]="step>1"><b>01</b> Area</span>
        <span [class.active]="step===2" [class.done]="step>2"><b>02</b> Target</span>
        <span [class.active]="step===3"><b>03</b> Automation</span>
      </nav>

      <section *ngIf="step===1" class="card">
        <header class="card-header"><div><span class="eyebrow">WORKSPACE PURPOSE</span><h2>What should this workspace do?</h2></div><span class="status">Step 1 of 3</span></header>
        <div class="card-body">
          <p class="meta">Select the operating area. This determines which acquisition automation is provisioned for this tenant.</p>
          <div class="content-grid">
            <button type="button" class="card" *ngFor="let item of options?.useCases" [class.selected]="useCase===item.id" (click)="selectArea(item.id)">
              <div class="identity"><span class="avatar">→</span><span class="stack"><strong>{{item.name}}</strong><small>{{item.description}}</small></span></div>
              <div class="actions"><span class="button-quiet">Select operating area →</span></div>
            </button>
          </div>
        </div>
      </section>

      <section *ngIf="step===2" class="card">
        <header class="card-header"><div><span class="eyebrow">TARGET MARKET</span><h2>Define the target market</h2><p class="meta">Business context for this tenant's prospecting, enrichment, qualification and campaign routing.</p></div><button type="button" class="button-secondary" (click)="step=1">← Back</button></header>
        <div class="card-body">
          <div class="form content-grid">
            <label>Template<select [(ngModel)]="templateKey"><option value="">Select template</option><option *ngFor="let t of templates" [value]="t.id">{{t.name}}</option></select></label>
            <label>Industry<input [(ngModel)]="industry" placeholder="Logistics, SaaS, Manufacturing..."/></label>
            <label>Region<input [(ngModel)]="region" placeholder="DACH, Europe, North America..."/></label>
            <label>Countries<input [(ngModel)]="countries" placeholder="Germany, Austria, Switzerland"/></label>
            <label>Workspace name<input [(ngModel)]="name" placeholder="Optional workspace name"/></label>
            <label>Daily discovery limit<input type="number" [(ngModel)]="dailyDiscoveryLimit" min="1" max="100"/></label>
            <label>Minimum qualification score<input type="number" [(ngModel)]="minimumScore" min="1" max="100"/></label>
          </div>
          <section class="section">
            <header class="section-header"><div><span class="eyebrow">AUTONOMOUS LOOP</span><h3>Automation plan</h3></div></header>
            <p class="meta">Once started, the background worker continues the tenant's scheduled acquisition runs.</p>
            <div class="steps"><span><b>01</b> Configure Agent</span><span><b>02</b> Discover</span><span><b>03</b> Enrich</span><span><b>04</b> Qualify</span><span><b>05</b> Route to Campaign</span></div>
          </section>
        </div>
        <footer class="card-footer actions"><button type="button" class="button-primary" [disabled]="!ready||saving" (click)="start()">{{saving?'Preparing automation…':'Prepare & Start Automation'}}</button></footer>
      </section>

      <section *ngIf="step===3" class="card">
        <header class="card-header"><div><span class="eyebrow">AUTOMATION CONTROL</span><h2>Automation started</h2><p class="meta">The workspace is prepared for this tenant. The initial acquisition run is queued and the daily scheduler will continue automatically.</p></div><span class="status">{{result?.status || 'activation-queued'}}</span></header>
        <div class="card-body">
          <div class="metric-grid">
            <article class="metric"><span>Agent</span><strong>{{result?.agentName || '-'}}</strong><small>{{result?.agentStatus || '-'}}</small></article>
            <article class="metric"><span>Initial run</span><strong>{{result?.initialRunId || 'Already queued / not returned'}}</strong><small>Queued for autonomous discovery</small></article>
            <article class="metric"><span>Target list</span><strong>{{result?.targetListId || 'Provisioned / pending'}}</strong><small>Qualified prospects route here</small></article>
            <article class="metric"><span>Campaign</span><strong>{{result?.campaignId || 'Provisioned / pending'}}</strong><small>Delivery remains approval-controlled</small></article>
          </div>
          <section class="section"><header class="section-header"><div><span class="eyebrow">PROVISIONING</span><h3>Workspace automation lifecycle</h3></div></header>
            <div class="list">
              <div class="list-item"><span class="status-dot done"></span><span class="stack"><strong>Workspace configured</strong><small>Selected template and target market applied to this tenant only.</small></span></div>
              <div class="list-item"><span class="status-dot done"></span><span class="stack"><strong>Autonomous agent active</strong><small>{{result?.agentName}} · {{result?.agentStatus}}</small></span></div>
              <div class="list-item"><span class="status-dot" [class.done]="!!result?.initialRunId"></span><span class="stack"><strong>Initial prospecting queued</strong><small>The first acquisition run is handled by the background worker.</small></span></div>
              <div class="list-item"><span class="status-dot" [class.done]="!!result?.targetListId"></span><span class="stack"><strong>Qualified target list ready</strong><small>Qualified prospects enter the tenant target list automatically.</small></span></div>
              <div class="list-item"><span class="status-dot" [class.done]="!!result?.campaignId"></span><span class="stack"><strong>Acquisition campaign ready</strong><small>Campaign workspace is provisioned; outreach remains governed by sender and approval configuration.</small></span></div>
              <div class="list-item"><span class="status-dot done"></span><span class="stack"><strong>Daily automation enabled</strong><small>New acquisition runs continue on the tenant's configured schedule.</small></span></div>
            </div>
          </section>
        </div>
        <footer class="card-footer actions"><a routerLink="/acquisition/autonomous" class="button-primary">Open Acquisition →</a><a routerLink="/discover" class="button-secondary">Open Prospects →</a><a routerLink="/golden-pipeline" class="button-secondary">Open Golden Pipeline →</a></footer>
      </section>

      <div class="alert" *ngIf="status" [class.alert-error]="error"><strong>{{error?'Workspace action failed':'Workspace status'}}</strong><span>{{status}}</span></div>
    </main>
  `
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
