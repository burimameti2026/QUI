import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { PackageInstallResult, WorkspacePackage, WorkspacePackageId, WorkspacePackagesService } from './workspace-packages.service';

@Component({standalone:true,imports:[CommonModule,FormsModule,RouterLink,PageHeader],template:`
<qai-page-header title="Workspace Packages" subtitle="Install a reusable operating package into a tenant workspace."></qai-page-header>
<section class="package-metrics">
  <article><span class="metric-icon violet">▦</span><div><small>Available packages</small><strong>{{ packages.length }}</strong><em>Reusable workspace setups</em></div></article>
  <article><span class="metric-icon orange">✦</span><div><small>Recommended</small><strong>1</strong><em>FusionFleet Promotion</em></div></article>
  <article><span class="metric-icon green">✓</span><div><small>Provisioning</small><strong>Ready</strong><em>Install into workspace</em></div></article>
  <article><span class="metric-icon blue">⚙</span><div><small>Mode</small><strong>Tenant-safe</strong><em>Current or selected tenant</em></div></article>
</section>
<section class="intro"><div><b>PACKAGE LIBRARY</b><h2>Choose a complete operating package.</h2><p>Package installation provisions a complete scenario intentionally. For the editable tenant-owned flow, prepare a real workspace from a template first.</p><a routerLink="/platform/prepare-workspace" class="builder">Prepare Real Workspace →</a></div></section>
<section class="target"><label>Target tenant ID <input [(ngModel)]="tenantId" placeholder="Current tenant if empty" /></label><small>Leave empty for the current workspace. Master administrators can install into a specific tenant.</small></section>
<div class="grid"><article class="card" *ngFor="let item of packages" [class.selected]="selected===item.id"><header><b>{{item.name}}</b><span>{{item.id==='fusionfleet-promotion'?'RECOMMENDED':''}}</span></header><p>{{item.description}}</p><div class="modules"><small>Required modules</small><div><em *ngFor="let module of item.requiredModules">{{module}}</em><em *ngIf="!item.requiredModules.length">manual setup</em></div></div><button type="button" (click)="install(item)" [disabled]="installing">{{installing && selected===item.id?'Installing…':'Install package'}}</button></article></div>
<section *ngIf="result" class="result"><h3>{{result.scenario}}</h3><div><span>{{result.prospects}} prospects</span><span>{{result.campaigns}} campaigns</span><span>{{result.opportunities}} opportunities</span><span>{{result.meetings}} meetings</span><span>{{result.tickets}} tickets</span><span>{{result.automations}} automations</span></div><div class="next"><button type="button" (click)="continueWorkflow()">Continue to workflow</button><a *ngIf="result.packageId==='fusionfleet-promotion'" routerLink="/acquisition/autonomous">Configure FusionFleet automation</a><a *ngIf="result.packageId==='qualifyai-acquisition'" routerLink="/pipeline">Open revenue pipeline</a><a routerLink="/ai/agents">Open agents</a></div></section>
<p class="status" *ngIf="status" [class.error]="error">{{status}}</p>
` ,styleUrl:'./workspace-packages.page.css'})
export class WorkspacePackagesPage {
 private readonly service=inject(WorkspacePackagesService); private readonly router=inject(Router); readonly packages=this.service.packages;
 tenantId=''; selected:WorkspacePackageId='fusionfleet-promotion'; installing=false; status=''; error=false; result:PackageInstallResult|null=null;
 install(item:WorkspacePackage):void { if(this.installing)return; this.selected=item.id; this.installing=true; this.error=false; this.result=null; this.status=`Installing ${item.name}…`; this.service.install({packageId:item.id,tenantId:this.tenantId.trim()||undefined}).subscribe({next:result=>{this.installing=false;this.result=result;this.status=`${item.name} installed successfully.`;},error:e=>{this.installing=false;this.error=true;this.status=e?.error?.detail||'Package installation failed.';}}); }
 continueWorkflow():void { if(!this.result)return; const route=this.result.packageId==='fusionfleet-promotion'?'/acquisition/autonomous':this.result.packageId==='qualifyai-acquisition'?'/pipeline':'/platform'; this.router.navigate([route]); }
}
