import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { TenantRuntimeService } from "../core/tenant-runtime.service";
import { AdminI18nService, AdminLanguage } from "../core/admin-i18n.service";
import { AdminStaticI18nDirective } from "../core/admin-static-i18n.directive";

interface NavigationItem { group:string; label:string; url:string; icon:string; module:string; permission:string; }

@Component({selector:"qai-shell",standalone:true,imports:[CommonModule,FormsModule,RouterOutlet,RouterLink,RouterLinkActive,AdminStaticI18nDirective],template:`<div class="shell"><aside><div class="brand"><i class="brand-mark">Q</i><span>Qualify</span><strong>AI</strong><small>ENTERPRISE</small></div><div class="workspace"><i>{{initials(workspaceName)}}</i><div><b>{{workspaceName}}</b><span>{{i18n.t(runtime.runtime()?.plan || session?.licensePlan || 'Licensed')}} workspace</span></div></div><nav><ng-container *ngFor="let group of visibleGroups"><label>{{i18n.t(group)}}</label><a *ngFor="let item of navBy(group)" [routerLink]="item.url" routerLinkActive="active"><span>{{item.icon}}</span>{{i18n.t(item.label)}}</a></ng-container></nav></aside><main><header class="app-header"><div class="header-search-wrap"><label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label><a class="portal-link" routerLink="/renova/portal">↗ {{i18n.t('Public Renova portal')}}</a><div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let language of i18n.languages" [value]="language.code">{{language.label}}</option></select></div><section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{item.icon}}</i><span><b>{{i18n.t(item.label)}}</b><small>{{i18n.t(item.group)}}</small></span></button></section></div></header><section class="page" qaiAdminStaticI18n><router-outlet/></section></main></div>`})
export class ShellComponent {
 readonly auth=inject(AuthService); readonly runtime=inject(TenantRuntimeService); readonly i18n=inject(AdminI18nService); private readonly router=inject(Router); query='';
 readonly groups=['COMMAND CENTER','01 — PREPARE','02 — FIND & REACH','03 — CONVERT','04 — CUSTOMER OPERATIONS','05 — AUTOMATE & IMPROVE','PLATFORM MANAGEMENT'];
 readonly nav:NavigationItem[]=[
 {group:'COMMAND CENTER',label:'Dashboard',url:'/dashboard',icon:'⌂',module:'core',permission:''},
 {group:'01 — PREPARE',label:'Connections & Senders',url:'/integrations',icon:'↗',module:'integrations',permission:'integrations.read'},
 {group:'01 — PREPARE',label:'Renova Product Catalog',url:'/catalog',icon:'▦',module:'crm',permission:'crm.read'},
 {group:'01 — PREPARE',label:'Renova Promotion Automation',url:'/renova/promotion',icon:'✦',module:'crm',permission:'crm.read'},
 {group:'01 — PREPARE',label:'Public Renova Portal',url:'/renova/portal',icon:'↗',module:'core',permission:''},
 {group:'02 — FIND & REACH',label:'Prospect Discovery',url:'/discover',icon:'⌕',module:'crm',permission:'crm.read'},
 {group:'02 — FIND & REACH',label:'Autonomous Acquisition',url:'/acquisition/autonomous',icon:'✦',module:'crm',permission:'crm.read'},
 {group:'02 — FIND & REACH',label:'Acquisition Approval Queue',url:'/acquisition/approval-queue',icon:'✓',module:'crm',permission:'crm.read'},
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
 {group:'05 — AUTOMATE & IMPROVE',label:'Business Assistants',url:'/ai/agents',icon:'✦',module:'ai',permission:'agents.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Knowledge',url:'/knowledge',icon:'▥',module:'knowledge',permission:'knowledge.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Workflows',url:'/workflows',icon:'⌁',module:'automation',permission:'automation.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Automations',url:'/automations',icon:'⚡',module:'automation',permission:'automation.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Analytics & ROI',url:'/analytics',icon:'▥',module:'analytics',permission:'analytics.read'},
 {group:'PLATFORM MANAGEMENT',label:'Platform Overview',url:'/platform',icon:'◉',module:'platform',permission:'system.admin'}];
 constructor(){this.runtime.load().subscribe({error:()=>{}});this.i18n.setLanguage(this.i18n.language());}
 get session(){return this.auth.session();} get workspaceName(){return this.session?.tenantSlug||'Workspace';} get visibleGroups(){return this.groups.filter(g=>this.navBy(g).length>0);} get searchResults(){const q=this.query.trim().toLowerCase();return this.nav.filter(i=>this.allowed(i)&&(!q||`${i.label} ${i.group} ${i.module}`.toLowerCase().includes(q))).slice(0,9);} navBy(group:string){return this.nav.filter(i=>i.group===group&&this.allowed(i));}
 allowed(item:NavigationItem){if(item.url==='/renova/portal')return true;if(item.module==='core')return this.runtime.isActive();if(item.module==='platform')return this.auth.hasPermission('system.admin');return this.runtime.hasModule(item.module)&&this.auth.hasPermission(item.permission);}
 setLanguage(language:AdminLanguage){this.i18n.setLanguage(language);}
 go(url:string){void this.router.navigate([url]);this.query='';} initials(v:string){return v.split(/\s+|@/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'U';}
}
