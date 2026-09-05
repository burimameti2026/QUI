import { CommonModule } from "@angular/common";
import { Component, ElementRef, HostListener, ViewChild, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { TenantRuntimeService } from "../core/tenant-runtime.service";

interface NavigationItem { group:string; label:string; url:string; icon:string; module:string; permission:string; }

@Component({selector:"qai-shell",standalone:true,imports:[CommonModule,FormsModule,RouterOutlet,RouterLink,RouterLinkActive],template:`<div class="shell"><aside><div class="brand"><i class="brand-mark">Q</i><span>Qualify</span><strong>AI</strong><small>ENTERPRISE</small></div><div class="workspace"><i>{{initials(workspaceName)}}</i><div><b>{{workspaceName}}</b><span>{{runtime.runtime()?.plan || session?.licensePlan || 'Licensed'}} workspace</span></div></div><nav><ng-container *ngFor="let group of visibleGroups"><label>{{group}}</label><a *ngFor="let item of navBy(group)" [routerLink]="item.url" routerLinkActive="active"><span>{{item.icon}}</span>{{item.label}}</a></ng-container></nav></aside><main><header class="app-header"><div class="header-search-wrap"><label class="global-search"><span>⌕</span><input [(ngModel)]="query" placeholder="Search pages and modules"/><kbd>Ctrl K</kbd></label><section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{item.icon}}</i><span><b>{{item.label}}</b><small>{{item.group}}</small></span></button></section></div></header><section class="page"><router-outlet/></section></main></div>`})
export class ShellComponent {
 @ViewChild('searchInput') searchInput?:ElementRef<HTMLInputElement>; readonly auth=inject(AuthService); readonly runtime=inject(TenantRuntimeService); private readonly router=inject(Router); query='';
 readonly groups=['COMMAND CENTER','01 — PREPARE','02 — FIND & REACH','03 — CONVERT','04 — CUSTOMER OPERATIONS','05 — AUTOMATE & IMPROVE','ADMINISTRATION'];
 readonly nav:NavigationItem[]=[
 {group:'COMMAND CENTER',label:'Dashboard',url:'/dashboard',icon:'⌂',module:'analytics',permission:'analytics.read'},
 {group:'01 — PREPARE',label:'Connections & Senders',url:'/integrations',icon:'↗',module:'integrations',permission:'integrations.read'},
 {group:'02 — FIND & REACH',label:'Prospect Discovery',url:'/discover',icon:'⌕',module:'crm',permission:'crm.read'},
 {group:'02 — FIND & REACH',label:'Campaigns',url:'/campaigns',icon:'↗',module:'crm',permission:'crm.read'},
 {group:'02 — FIND & REACH',label:'Replies & Inbox',url:'/inbox',icon:'▱',module:'inbox',permission:'conversations.read'},
 {group:'03 — CONVERT',label:'Qualified Leads',url:'/crm/leads',icon:'◆',module:'crm',permission:'crm.read'},
 {group:'03 — CONVERT',label:'Opportunities',url:'/crm/opportunities',icon:'◈',module:'crm',permission:'crm.read'},
 {group:'03 — CONVERT',label:'Sales Pipelines',url:'/pipeline',icon:'▤',module:'crm',permission:'crm.read'},
 {group:'03 — CONVERT',label:'Golden Pipeline',url:'/golden-pipeline',icon:'◇',module:'golden_pipeline',permission:'crm.read'},
 {group:'03 — CONVERT',label:'Demos & Meetings',url:'/meetings',icon:'◷',module:'crm',permission:'crm.read'},
 {group:'04 — CUSTOMER OPERATIONS',label:'Companies',url:'/crm/companies',icon:'▦',module:'crm',permission:'crm.read'},
 {group:'04 — CUSTOMER OPERATIONS',label:'Contacts',url:'/crm/contacts',icon:'◎',module:'crm',permission:'crm.read'},
 {group:'04 — CUSTOMER OPERATIONS',label:'Issues & Tickets',url:'/tickets',icon:'▣',module:'ticketing',permission:'tickets.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Business Assistants',url:'/ai/agents',icon:'✦',module:'ai_agents',permission:'agents.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Knowledge',url:'/knowledge',icon:'▥',module:'knowledge',permission:'knowledge.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Workflows',url:'/workflows',icon:'⌁',module:'workflows',permission:'automation.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Automations',url:'/automations',icon:'⚡',module:'automations',permission:'automation.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Analytics & ROI',url:'/analytics',icon:'▥',module:'analytics',permission:'analytics.read'},
 {group:'ADMINISTRATION',label:'Billing & Usage',url:'/billing',icon:'€',module:'billing',permission:'billing.read'}];
 constructor(){this.runtime.load().subscribe({error:()=>{}});}
 get session(){return this.auth.session();} get workspaceName(){return this.session?.tenantSlug||'Workspace';} get visibleGroups(){return this.groups.filter(g=>this.navBy(g).length>0);} get searchResults(){const q=this.query.trim().toLowerCase();return this.nav.filter(i=>this.allowed(i)&&(!q||`${i.label} ${i.group} ${i.module}`.toLowerCase().includes(q))).slice(0,9);} navBy(group:string){return this.nav.filter(i=>i.group===group&&this.allowed(i));} allowed(item:NavigationItem){return (item.module==='billing'||this.runtime.hasModule(item.module))&&this.auth.hasPermission(item.permission);} go(url:string){void this.router.navigate([url]);this.query='';} initials(v:string){return v.split(/\s+|@/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'U';}
}
