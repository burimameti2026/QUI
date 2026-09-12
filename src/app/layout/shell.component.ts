import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { TenantRuntimeService } from "../core/tenant-runtime.service";
import { AdminI18nService, AdminLanguage } from "../core/admin-i18n.service";
import { AdminStaticI18nDirective } from "../core/admin-static-i18n.directive";

interface NavigationItem { group:string; label:string; url:string; icon:string; module:string; permission:string; }

@Component({selector:"qai-shell",standalone:true,imports:[CommonModule,FormsModule,RouterOutlet,RouterLink,RouterLinkActive,AdminStaticI18nDirective],template:`<div class="shell"><aside><div class="brand" title="QualifyAI"><i class="brand-mark">Q</i><span>Qualify</span><strong>AI</strong><small>ENTERPRISE</small></div><div class="workspace"><i>{{initials(workspaceName)}}</i><div><b>{{workspaceName}}</b><span>{{i18n.t(runtime.runtime()?.plan || session?.licensePlan || 'Licensed')}} workspace</span></div></div><nav class="department-nav"><ng-container *ngFor="let group of visibleGroups"><button type="button" class="department-toggle" [class.expanded]="isExpanded(group)" (click)="toggleGroup(group)" [attr.aria-expanded]="isExpanded(group)" [attr.title]="i18n.t(group)"><span class="department-title"><i>{{groupIcon(group)}}</i><b>{{i18n.t(group)}}</b></span><em>⌄</em></button><div class="department-items" *ngIf="isExpanded(group)"><a *ngFor="let item of navBy(group)" [routerLink]="item.url" routerLinkActive="active" [attr.title]="i18n.t(item.label)"><span>{{item.icon}}</span>{{i18n.t(item.label)}}</a></div></ng-container></nav></aside><main><header class="app-header"><div class="header-search-wrap"><label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label><a class="portal-link" routerLink="/renova/portal">↗ {{i18n.t('Public Renova portal')}}</a><div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let language of i18n.languages" [value]="language.code">{{language.label}}</option></select></div><section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{item.icon}}</i><span><b>{{i18n.t(item.label)}}</b><small>{{i18n.t(item.group)}}</small></span></button></section></div></header><section class="page" qaiAdminStaticI18n><router-outlet/></section></main></div>`,styles:[`.department-nav{padding:8px 4px 20px;overflow-y:auto;scrollbar-width:thin}.department-toggle{display:flex;align-items:center;justify-content:center;width:44px;min-height:40px;margin:4px auto;padding:0;border:0;border-radius:8px;background:transparent;color:#7b8490;text-align:center;cursor:pointer}.department-toggle:hover,.department-toggle.expanded{background:#f4f5f6;color:#20252b}.department-title{display:flex;align-items:center;justify-content:center;gap:0;min-width:0}.department-title i{display:grid;width:32px;height:32px;place-items:center;border:1px solid #e3e5e8;border-radius:8px;background:#fff;color:#e06b2f;font-style:normal;font-size:12px}.department-title b,.department-toggle em{display:none}.department-items{padding:2px 0 6px;border:0;margin:0}.department-items a{display:flex;align-items:center;justify-content:center;gap:0;width:44px;min-height:39px;margin:3px auto;padding:0;border-radius:8px;color:#59616b;text-decoration:none;font-size:0;font-weight:650}.department-items a:hover{background:#f5f6f7;color:#20252b}.department-items a.active{background:#fff1e9;color:#e06b2f;box-shadow:inset 3px 0 0 #e06b2f}.department-items a span{width:auto;text-align:center;font-size:15px;line-height:1}@media(max-width:900px){.department-nav{display:flex;align-items:center;gap:3px;overflow-x:auto;overflow-y:hidden;padding:3px 4px}.department-toggle{flex:0 0 34px;width:34px;min-height:34px;margin:0}.department-title i{width:28px;height:28px}.department-items{display:flex;padding:0}.department-items a{flex:0 0 36px;width:36px;min-height:34px;margin:0 2px}.shell>aside{width:100%!important;padding:8px 10px!important}.brand span,.brand strong,.brand small{display:inline}.workspace{display:none}}`]})
export class ShellComponent {
 readonly auth=inject(AuthService); readonly runtime=inject(TenantRuntimeService); readonly i18n=inject(AdminI18nService); private readonly router=inject(Router); query='';
 readonly groups=['COMMAND CENTER','SALES & ACQUISITION','CONTENT & KNOWLEDGE','ORDERING & DISPATCH','FINANCE','AUTOMATION & IMPROVE','ADMINISTRATION'];
 private expandedGroups=new Set<string>(this.groups);
 readonly nav:NavigationItem[]=[
  {group:'COMMAND CENTER',label:'Dashboard',url:'/dashboard',icon:'⌂',module:'core',permission:''},
  {group:'COMMAND CENTER',label:'Enterprise Overview',url:'/enterprise',icon:'◉',module:'core',permission:''},
  {group:'SALES & ACQUISITION',label:'Prospect Discovery',url:'/discover',icon:'⌕',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Autonomous Acquisition',url:'/acquisition/autonomous',icon:'✦',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Acquisition Approval Queue',url:'/acquisition/approval-queue',icon:'✓',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Campaigns',url:'/campaigns',icon:'↗',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Qualified Leads',url:'/crm/leads',icon:'◆',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Opportunities',url:'/crm/opportunities',icon:'◈',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Sales Pipelines',url:'/pipeline',icon:'▤',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Golden Pipeline',url:'/golden-pipeline',icon:'◇',module:'golden_pipeline',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Demos & Meetings',url:'/meetings',icon:'◷',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Companies',url:'/crm/companies',icon:'▦',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Contacts',url:'/crm/contacts',icon:'◎',module:'crm',permission:'crm.read'},
  {group:'SALES & ACQUISITION',label:'Replies & Inbox',url:'/inbox',icon:'▱',module:'inbox',permission:'conversations.read'},
  {group:'CONTENT & KNOWLEDGE',label:'CMS — Renova Content',url:'/renova/content',icon:'▤',module:'core',permission:'settings.manage'},
  {group:'CONTENT & KNOWLEDGE',label:'Knowledge',url:'/knowledge',icon:'▥',module:'knowledge',permission:'knowledge.read'},
  {group:'CONTENT & KNOWLEDGE',label:'Knowledge Gaps',url:'/knowledge/gaps',icon:'◇',module:'knowledge',permission:'knowledge.read'},
  {group:'CONTENT & KNOWLEDGE',label:'Renova Product Catalog',url:'/catalog',icon:'▦',module:'crm',permission:'crm.read'},
  {group:'CONTENT & KNOWLEDGE',label:'Renova Promotion Automation',url:'/renova/promotion',icon:'✦',module:'crm',permission:'crm.read'},
  {group:'ORDERING & DISPATCH',label:'Ordering',url:'/enterprise/orders',icon:'▤',module:'core',permission:''},
  {group:'ORDERING & DISPATCH',label:'Inventory',url:'/enterprise/inventory',icon:'▥',module:'core',permission:''},
  {group:'ORDERING & DISPATCH',label:'Warehousing & Dispatch',url:'/enterprise/warehousing',icon:'▦',module:'core',permission:''},
  {group:'ORDERING & DISPATCH',label:'Distribution',url:'/enterprise/distribution',icon:'◎',module:'core',permission:''},
  {group:'ORDERING & DISPATCH',label:'Logistics & Delivery',url:'/enterprise/logistics',icon:'↗',module:'core',permission:''},
  {group:'ORDERING & DISPATCH',label:'Facilities',url:'/enterprise/facilities',icon:'⌂',module:'core',permission:''},
  {group:'FINANCE',label:'Financials',url:'/enterprise/payments',icon:'€',module:'core',permission:''},
  {group:'FINANCE',label:'Billing & Subscription',url:'/billing',icon:'▤',module:'billing',permission:'billing.read'},
  {group:'AUTOMATION & IMPROVE',label:'Business Assistants',url:'/ai/agents',icon:'✦',module:'ai',permission:'agents.read'},
  {group:'AUTOMATION & IMPROVE',label:'Workflows',url:'/workflows',icon:'⌁',module:'automation',permission:'automation.read'},
  {group:'AUTOMATION & IMPROVE',label:'Automations',url:'/automations',icon:'⚡',module:'automation',permission:'automation.read'},
  {group:'AUTOMATION & IMPROVE',label:'Analytics & ROI',url:'/analytics',icon:'▥',module:'analytics',permission:'analytics.read'},
  {group:'ADMINISTRATION',label:'Connections & Senders',url:'/integrations',icon:'↗',module:'integrations',permission:'integrations.read'},
  {group:'ADMINISTRATION',label:'Users & Roles',url:'/users',icon:'◎',module:'core',permission:'users.read'},
  {group:'ADMINISTRATION',label:'Security',url:'/security',icon:'◆',module:'core',permission:'users.read'},
  {group:'ADMINISTRATION',label:'White Label',url:'/white-label',icon:'◇',module:'core',permission:'settings.manage'},
  {group:'ADMINISTRATION',label:'Audit & Governance',url:'/audit',icon:'✓',module:'core',permission:'audit.read'},
  {group:'ADMINISTRATION',label:'Platform Management',url:'/platform',icon:'◉',module:'platform',permission:'system.admin'},
  {group:'ADMINISTRATION',label:'Industry Packs',url:'/industry-packs',icon:'▦',module:'platform',permission:'system.admin'},
  {group:'ADMINISTRATION',label:'Module Administration',url:'/admin/modules',icon:'⚙',module:'platform',permission:'system.admin'}
 ];
 constructor(){this.runtime.load().subscribe({error:()=>{}});this.i18n.setLanguage(this.i18n.language());}
 get session(){return this.auth.session();} get workspaceName(){return this.session?.tenantSlug||'Workspace';} get visibleGroups(){return this.groups.filter(g=>this.navBy(g).length>0);} get searchResults(){const q=this.query.trim().toLowerCase();return this.nav.filter(i=>this.allowed(i)&&(!q||`${i.label} ${i.group} ${i.module}`.toLowerCase().includes(q))).slice(0,9);} navBy(group:string){return this.nav.filter(i=>i.group===group&&this.allowed(i));}
 isExpanded(group:string){const active=this.navBy(group).some(i=>this.router.url.startsWith(i.url));return active||this.expandedGroups.has(group);}
 toggleGroup(group:string){if(this.expandedGroups.has(group))this.expandedGroups.delete(group);else this.expandedGroups.add(group);}
 groupIcon(group:string){return ({'COMMAND CENTER':'⌂','SALES & ACQUISITION':'◆','CONTENT & KNOWLEDGE':'▤','ORDERING & DISPATCH':'▦','FINANCE':'€','AUTOMATION & IMPROVE':'✦','ADMINISTRATION':'⚙'} as Record<string,string>)[group]||'•';}
 allowed(item:NavigationItem){if(item.url==='/renova/portal')return true;if(item.module==='core')return this.runtime.isActive();if(item.module==='platform')return this.auth.hasPermission('system.admin');return this.runtime.hasModule(item.module)&&this.auth.hasPermission(item.permission);}
 setLanguage(language:AdminLanguage){this.i18n.setLanguage(language);}
 go(url:string){void this.router.navigate([url]);this.query='';} initials(v:string){return v.split(/\s+|@/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'U';}
}