import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { TenantRuntimeService } from "../core/tenant-runtime.service";

interface NavigationItem { group:string; label:string; url:string; icon:string; module:string; permission:string; }

@Component({selector:"qai-shell",standalone:true,imports:[CommonModule,FormsModule,RouterOutlet,RouterLink,RouterLinkActive],template:`<div class="shell"><aside><div class="brand"><i class="brand-mark">Q</i><span>Qualify</span><strong>AI</strong><small>ENTERPRISE</small></div><div class="workspace"><i>{{initials(workspaceName)}}</i><div><b>{{workspaceName}}</b><span>{{runtime.runtime()?.plan || session?.licensePlan || 'Licensed'}} workspace</span></div></div><nav><ng-container *ngFor="let group of visibleGroups"><label>{{groupLabel(group)}}</label><a *ngFor="let item of navBy(group)" [routerLink]="item.url" routerLinkActive="active"><span>{{item.icon}}</span>{{itemLabel(item)}}<em *ngIf="item.module==='enterprise'">OPS</em></a></ng-container></nav></aside><main><header class="app-header"><div class="header-search-wrap"><label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="t('search')"/><kbd>Ctrl K</kbd></label><section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{item.icon}}</i><span><b>{{itemLabel(item)}}</b><small>{{groupLabel(item.group)}}</small></span></button></section></div><div class="head-actions"><select class="language-select" [(ngModel)]="language" (ngModelChange)="setLanguage($event)" aria-label="Language"><option value="en">EN</option><option value="mk">МК</option><option value="sq">SQ</option><option value="de">DE</option></select></div></header><section class="page"><router-outlet/></section></main></div>`})
export class ShellComponent {
 readonly auth=inject(AuthService); readonly runtime=inject(TenantRuntimeService); private readonly router=inject(Router); query=''; language=localStorage.getItem('qai.admin.language')||'en';
 readonly groups=['COMMAND CENTER','01 — PREPARE','02 — FIND & REACH','03 — CONVERT','04 — CUSTOMER OPERATIONS','05 — AUTOMATE & IMPROVE','ENTERPRISE OPERATIONS','PLATFORM MANAGEMENT'];
 readonly nav:NavigationItem[]=[
 {group:'COMMAND CENTER',label:'Dashboard',url:'/dashboard',icon:'⌂',module:'core',permission:''},
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
 {group:'05 — AUTOMATE & IMPROVE',label:'Business Assistants',url:'/ai/agents',icon:'✦',module:'ai',permission:'agents.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Knowledge',url:'/knowledge',icon:'▥',module:'knowledge',permission:'knowledge.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Workflows',url:'/workflows',icon:'⌁',module:'automation',permission:'automation.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Automations',url:'/automations',icon:'⚡',module:'automation',permission:'automation.read'},
 {group:'05 — AUTOMATE & IMPROVE',label:'Analytics & ROI',url:'/analytics',icon:'▥',module:'analytics',permission:'analytics.read'},
 {group:'ENTERPRISE OPERATIONS',label:'Operations Command Center',url:'/enterprise',icon:'◉',module:'enterprise',permission:''},
 {group:'PLATFORM MANAGEMENT',label:'Platform Overview',url:'/platform',icon:'◉',module:'platform',permission:'system.admin'}];
 constructor(){this.runtime.load().subscribe({error:()=>{}});}
 get session(){return this.auth.session();} get workspaceName(){return this.session?.tenantSlug||'Workspace';} get visibleGroups(){return this.groups.filter(g=>this.navBy(g).length>0);} get searchResults(){const q=this.query.trim().toLowerCase();return this.nav.filter(i=>this.allowed(i)&&(!q||`${i.label} ${i.group} ${i.module}`.toLowerCase().includes(q))).slice(0,9);} navBy(group:string){return this.nav.filter(i=>i.group===group&&this.allowed(i));}
 allowed(item:NavigationItem){if(item.module==='core'||item.module==='enterprise')return this.runtime.isActive();if(item.module==='platform')return this.auth.hasPermission('system.admin');return this.runtime.hasModule(item.module)&&this.auth.hasPermission(item.permission);}
 groupLabel(group:string){const map:any={en:{'COMMAND CENTER':'COMMAND CENTER','01 — PREPARE':'01 — PREPARE','02 — FIND & REACH':'02 — FIND & REACH','03 — CONVERT':'03 — CONVERT','04 — CUSTOMER OPERATIONS':'04 — CUSTOMER OPERATIONS','05 — AUTOMATE & IMPROVE':'05 — AUTOMATE & IMPROVE','ENTERPRISE OPERATIONS':'ENTERPRISE OPERATIONS','PLATFORM MANAGEMENT':'PLATFORM MANAGEMENT'},mk:{'COMMAND CENTER':'ЦЕНТАР','01 — PREPARE':'01 — ПОДГОТОВКА','02 — FIND & REACH':'02 — ПРОНАЈДИ И ДОСТИГНИ','03 — CONVERT':'03 — КОНВЕРЗИЈА','04 — CUSTOMER OPERATIONS':'04 — ОПЕРАЦИИ СО КЛИЕНТИ','05 — AUTOMATE & IMPROVE':'05 — АВТОМАТИЗИРАЈ И ПОДОБРИ','ENTERPRISE OPERATIONS':'ПРЕТПРИЕМНИЧКИ ОПЕРАЦИИ','PLATFORM MANAGEMENT':'УПРАВУВАЊЕ СО ПЛАТФОРМАТА'},sq:{'COMMAND CENTER':'QENDRA','01 — PREPARE':'01 — PËRGATITJA','02 — FIND & REACH':'02 — GJEJ DHE ARRIT','03 — CONVERT':'03 — KONVERTIMI','04 — CUSTOMER OPERATIONS':'04 — OPERACIONET ME KLIENTË','05 — AUTOMATE & IMPROVE':'05 — AUTOMATIZO DHE PËRMIRËSO','ENTERPRISE OPERATIONS':'OPERACIONET E NDËRMARRJES','PLATFORM MANAGEMENT':'MENAXHIMI I PLATFORMËS'},de:{'COMMAND CENTER':'KOMMANDOZENTRALE','01 — PREPARE':'01 — VORBEREITUNG','02 — FIND & REACH':'02 — FINDEN & ERREICHEN','03 — CONVERT':'03 — KONVERTIERUNG','04 — CUSTOMER OPERATIONS':'04 — KUNDENBETRIEB','05 — AUTOMATE & IMPROVE':'05 — AUTOMATISIEREN & VERBESSERN','ENTERPRISE OPERATIONS':'UNTERNEHMENSBETRIEB','PLATFORM MANAGEMENT':'PLATTFORMVERWALTUNG'}};return map[this.language]?.[group]||group;}
 itemLabel(item:NavigationItem){return item.label;}
 t(key:string){const map:any={en:{search:'Search pages and modules'},mk:{search:'Пребарај страници и модули'},sq:{search:'Kërko faqe dhe module'},de:{search:'Seiten und Module suchen'}};return map[this.language]?.[key]||map.en[key]||key;}
 setLanguage(value:string){this.language=value;localStorage.setItem('qai.admin.language',value);}
 go(url:string){void this.router.navigate([url]);this.query='';} initials(v:string){return v.split(/\s+|@/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'U';}
}
