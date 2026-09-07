import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../shared/ui';
import { WorkspacePackage, WorkspacePackageId, WorkspacePackagesService } from './workspace-packages.service';

@Component({standalone:true,imports:[CommonModule,FormsModule,PageHeader],template:`
<qai-page-header title="Workspace Packages" subtitle="Install a reusable operating template into a tenant workspace."></qai-page-header>
<section class="intro"><div><b>PACKAGE LIBRARY</b><h2>Choose what the tenant should receive.</h2><p>A package provisions a reusable baseline for a use case. Tenant data remains isolated after installation.</p></div></section>
<section class="target"><label>Target tenant ID <input [(ngModel)]="tenantId" placeholder="Current tenant if empty" /></label><small>System administrators can target another tenant; otherwise the package installs for the current workspace.</small></section>
<div class="grid"><article class="card" *ngFor="let item of packages" [class.selected]="selected===item.id"><header><b>{{item.name}}</b><span>{{item.id==='fusionfleet-promotion'?'RECOMMENDED':''}}</span></header><p>{{item.description}}</p><div class="modules"><small>Required modules</small><div><em *ngFor="let module of item.requiredModules">{{module}}</em><em *ngIf="!item.requiredModules.length">manual setup</em></div></div><button type="button" (click)="install(item)" [disabled]="installing">{{installing && selected===item.id?'Installing…':'Install package'}}</button></article></div>
<p class="status" *ngIf="status" [class.error]="error">{{status}}</p>
`,styles:[`.intro,.target{padding:24px;border:1px solid var(--border,#ddd);border-radius:14px;margin-bottom:18px}.intro h2{margin:8px 0}.target{display:grid;gap:8px}.target input{display:block;margin-top:6px;width:min(520px,100%);padding:10px;border:1px solid var(--border,#ddd);border-radius:8px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:16px}.card{padding:22px;border:1px solid var(--border,#ddd);border-radius:14px}.card.selected{outline:2px solid var(--primary,#2563eb)}header{display:flex;justify-content:space-between;gap:8px}header span{font-size:11px}.modules{margin:20px 0}.modules div{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}em{font-style:normal;font-size:12px;padding:5px 8px;border:1px solid var(--border,#ddd);border-radius:999px}button{width:100%;padding:11px;border:0;border-radius:8px;background:var(--primary,#2563eb);color:white;font-weight:600;cursor:pointer}button:disabled{opacity:.6}.status{margin-top:18px}.error{color:#b91c1c}`]})
export class WorkspacePackagesPage {
 private readonly service=inject(WorkspacePackagesService); readonly packages=this.service.packages;
 tenantId=''; selected:WorkspacePackageId='fusionfleet-promotion'; installing=false; status=''; error=false;
 install(item:WorkspacePackage):void { if(this.installing)return; this.selected=item.id; this.installing=true; this.error=false; this.status=`Installing ${item.name}…`; this.service.install({packageId:item.id,tenantId:this.tenantId.trim()||undefined}).subscribe({next:()=>{this.installing=false;this.status=`${item.name} installed successfully.`;},error:e=>{this.installing=false;this.error=true;this.status=e?.error?.detail||'Package installation failed.';}}); }
}
