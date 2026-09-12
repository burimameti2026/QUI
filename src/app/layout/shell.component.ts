import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthService } from "../core/auth.service";
import { TenantRuntimeService } from "../core/tenant-runtime.service";
import { AdminI18nService, AdminLanguage } from "../core/admin-i18n.service";
import { AdminStaticI18nDirective } from "../core/admin-static-i18n.directive";

interface NavigationItem { group:string; label:string; url:string; icon:string; module:string; permission:string; }

@Component({
 selector:"qai-shell",standalone:true,
 imports:[CommonModule,FormsModule,RouterOutlet,RouterLink,RouterLinkActive,AdminStaticI18nDirective],
 template:`
 <div class="shell">
  <aside class="sidebar">
   <div class="brand" title="RENOVA">
    <i class="brand-mark">R</i><div class="brand-copy"><strong>RENOVA</strong><small>ENTERPRISE</small></div>
   </div>
   <div class="workspace"><i>{{initials(workspaceName)}}</i><div><b>{{workspaceName}}</b><span>{{i18n.t(runtime.runtime()?.plan || session?.licensePlan || 'Licensed')}} workspace</span></div></div>
   <nav class="department-nav">
    <ng-container *ngFor="let group of visibleGroups">
     <div class="department-heading"><span>{{groupIcon(group)}}</span><b>{{i18n.t(group)}}</b></div>
     <div class="department-items">
      <a *ngFor="let item of navBy(group)" [routerLink]="item.url" routerLinkActive="active" [attr.title]="i18n.t(item.label)">
       <span class="nav-icon">{{item.icon}}</span><span class="nav-label">{{i18n.t(item.label)}}</span>
      </a>
     </div>
    </ng-container>
   </nav>
   <a class="real-workspace" routerLink="/platform/prepare-workspace">
    <span class="real-workspace-icon">＋</span><span><b>{{i18n.t('Real Workspace')}}</b><small>{{i18n.t('Set up and run automation')}}</small></span><strong>›</strong>
   </a>
   <div class="account"><span class="avatar">{{initials(session?.tenantSlug || 'BA')}}</span><div><b>Administrator</b><small>{{workspaceName}}</small></div><span>⌄</span></div>
  </aside>
  <main>
   <header class="app-header">
    <div class="header-search-wrap">
     <label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label>
     <a class="portal-link" routerLink="/renova/portal">↗ {{i18n.t('Public Renova portal')}}</a>
     <div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let language of i18n.languages" [value]="language.code">{{language.label}}</option></select></div>
     <section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{item.icon}}</i><span><b>{{i18n.t(item.label)}}</b><small>{{i18n.t(item.group)}}</small></span></button></section>
    </div>
   </header>
   <section class="page" qaiAdminStaticI18n><router-outlet/></section>
  </main>
 </div>`,
 styles:[`
 :host{display:block;min-height:100vh;background:#f8f7f4;color:#172033}
 .shell{display:grid;grid-template-columns:276px minmax(0,1fr);min-height:100vh;background:#f8f7f4}
 .sidebar{position:sticky;top:0;display:flex;height:100vh;box-sizing:border-box;flex-direction:column;padding:22px 14px 14px;border-right:1px solid #e4e3df;background:#fff}
 .brand{display:flex;align-items:center;gap:11px;padding:2px 10px 22px;border-bottom:1px solid #eeeDEA}
 .brand-mark{display:grid;width:36px;height:36px;place-items:center;border-radius:10px;background:#e86b1f;color:#fff;font-size:20px;font-weight:900;font-style:normal}
 .brand-copy{display:flex;flex-direction:column}.brand-copy strong{font-size:18px;letter-spacing:2px;color:#18263f}.brand-copy small{margin-top:2px;color:#8a93a0;font-size:8px;font-weight:800;letter-spacing:1.7px}
 .workspace{display:flex;align-items:center;gap:10px;padding:16px 10px 13px}.workspace>i{display:grid;width:34px;height:34px;place-items:center;border-radius:10px;background:#fff0e7;color:#e86b1f;font-size:11px;font-weight:800;font-style:normal}.workspace div{display:flex;min-width:0;flex-direction:column}.workspace b{overflow:hidden;color:#1c2a42;font-size:11px;text-overflow:ellipsis}.workspace span{margin-top:3px;color:#8a93a0;font-size:8px}
 .department-nav{flex:1;overflow:auto;padding:2px 0 10px;scrollbar-width:thin}.department-heading{display:flex;align-items:center;gap:8px;margin:14px 8px 5px;color:#8992a0}.department-heading:first-child{margin-top:4px}.department-heading span{display:grid;width:20px;height:20px;place-items:center;color:#e86b1f;font-size:12px}.department-heading b{font-size:8px;font-weight:850;letter-spacing:1px}
 .department-items a{display:flex;align-items:center;gap:11px;min-height:39px;margin:2px 0;padding:0 11px;border-radius:9px;color:#46546b;text-decoration:none;font-size:11px;font-weight:650;transition:.16s}.department-items a:hover{background:#faf5f1;color:#1d2b43}.department-items a.active{background:#fff0e7;color:#df5f16;box-shadow:inset 3px 0 0 #e86b1f}.nav-icon{display:grid;width:22px;height:22px;place-items:center;color:currentColor;font-size:14px;line-height:1}.nav-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 .real-workspace{display:flex;align-items:center;gap:9px;margin:8px 4px;padding:11px 9px;border:1px solid #f1d7c8;border-radius:10px;background:#fff7f1;color:#26354e;text-decoration:none}.real-workspace-icon{display:grid;width:28px;height:28px;place-items:center;border-radius:7px;background:#e86b1f;color:#fff;font-size:18px}.real-workspace span:nth-child(2){display:flex;min-width:0;flex:1;flex-direction:column}.real-workspace b{color:#d95e17;font-size:10px}.real-workspace small{margin-top:2px;color:#8791a0;font-size:8px}.real-workspace>strong{color:#d95e17;font-size:18px;font-weight:500}
 .account{display:flex;align-items:center;gap:9px;padding:14px 8px 2px;border-top:1px solid #eeeDEA}.account .avatar{display:grid;width:34px;height:34px;place-items:center;border-radius:50%;background:#e9edf2;color:#34435b;font-size:10px;font-weight:800}.account div{display:flex;min-width:0;flex:1;flex-direction:column}.account b{color:#26354e;font-size:10px}.account small{margin-top:2px;color:#8a93a0;font-size:8px}.account>span:last-child{color:#657187;font-size:14px}
 main{min-width:0}.app-header{position:sticky;top:0;z-index:50;display:flex;align-items:center;min-height:70px;padding:0 32px;border-bottom:1px solid #e5e4e0;background:rgba(255,255,255,.96);backdrop-filter:blur(12px)}.header-search-wrap{position:relative;display:flex;align-items:center;gap:10px;width:100%}.global-search{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;max-width:680px;flex:1;height:40px;padding:0 12px;border:1px solid #e1e1de;border-radius:9px;background:#f8f8f7;color:#7b8491;text-align:left}.global-search:hover,.global-search:focus-within{border-color:#efb08a;background:#fff;box-shadow:0 0 0 3px rgba(232,107,31,.08)}.global-search>span{color:#e86b1f;font-size:19px}.global-search input{width:100%;height:100%;padding:0;border:0;outline:0;background:transparent;color:#1f2937;font-size:11px}.global-search kbd{padding:3px 6px;border:1px solid #dedfdd;border-bottom-width:2px;border-radius:5px;background:#fff;color:#7b8491;font-size:8px}.portal-link{display:flex;align-items:center;height:40px;padding:0 11px;border:1px solid #e1e1de;border-radius:9px;background:#fff;color:#df651b;font-size:10px;font-weight:750;text-decoration:none;white-space:nowrap}.admin-language{display:flex;align-items:center;gap:5px;height:40px;padding:0 9px;border:1px solid #e1e1de;border-radius:9px;background:#fff}.admin-language>span{color:#e86b1f;font-size:13px}.admin-language select{border:0;outline:0;background:transparent;color:#26354e;font-size:10px;font-weight:750}.header-search-results{position:absolute;top:48px;left:0;z-index:90;width:min(560px,100%);padding:7px;border:1px solid #dedfdc;border-radius:11px;background:#fff;box-shadow:0 18px 42px rgba(24,38,63,.14)}.header-search-results button{display:grid;grid-template-columns:32px 1fr;align-items:center;gap:9px;width:100%;min-height:50px;padding:7px;border:0;border-radius:7px;background:transparent;text-align:left}.header-search-results button:hover{background:#fff7f1}.header-search-results i{display:grid;width:29px;height:29px;place-items:center;border-radius:7px;background:#fff0e7;color:#e86b1f;font-style:normal}.header-search-results b,.header-search-results small{display:block}.header-search-results b{font-size:10px}.header-search-results small{margin-top:2px;color:#8a93a0;font-size:8px}
 .page{box-sizing:border-box;max-width:1500px;margin:0 auto;padding:28px 32px 44px}
 @media(max-width:1050px){.shell{grid-template-columns:220px}.sidebar{padding-left:10px;padding-right:10px}.page{padding:22px}.app-header{padding:0 22px}.portal-link{display:none}}
 @media(max-width:760px){.shell{display:block}.sidebar{position:relative;height:auto;border-right:0;border-bottom:1px solid #e4e3df}.department-nav{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));max-height:360px}.real-workspace{display:none}.account{margin-top:8px}.app-header{position:sticky;padding:0 12px}.global-search{max-width:none}.admin-language{display:none}.page{padding:16px}}
 `]
})
export class ShellComponent {
 readonly auth=inject(AuthService); readonly runtime=inject(TenantRuntimeService); readonly i18n=inject(AdminI18nService); private readonly router=inject(Router); query='';
 readonly groups=['COMMAND CENTER','SALES & ACQUISITION','CONTENT & KNOWLEDGE','ORDERING & DISPATCH','FINANCE','AUTOMATION & IMPROVE','ADMINISTRATION'];
 readonly nav:NavigationItem[]=[
  {group:'COMMAND CENTER',label:'Dashboard',url:'/dashboard',icon:'⌂',module:'core',permission:''},{group:'COMMAND CENTER',label:'Enterprise Overview',url:'/enterprise',icon:'◉',module:'core',permission:''},
  {group:'SALES & ACQUISITION',label:'Prospect Discovery',url:'/discover',icon:'⌕',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Autonomous Acquisition',url:'/acquisition/autonomous',icon:'✦',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Acquisition Approval Queue',url:'/acquisition/approval-queue',icon:'✓',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Campaigns',url:'/campaigns',icon:'↗',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Qualified Leads',url:'/crm/leads',icon:'◆',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Opportunities',url:'/crm/opportunities',icon:'◈',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Sales Pipelines',url:'/pipeline',icon:'▤',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Golden Pipeline',url:'/golden-pipeline',icon:'◇',module:'golden_pipeline',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Demos & Meetings',url:'/meetings',icon:'◷',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Companies',url:'/crm/companies',icon:'▦',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Contacts',url:'/crm/contacts',icon:'◎',module:'crm',permission:'crm.read'},{group:'SALES & ACQUISITION',label:'Replies & Inbox',url:'/inbox',icon:'▱',module:'inbox',permission:'conversations.read'},
  {group:'CONTENT & KNOWLEDGE',label:'CMS — Renova Content',url:'/renova/content',icon:'▤',module:'core',permission:'settings.manage'},{group:'CONTENT & KNOWLEDGE',label:'Knowledge',url:'/knowledge',icon:'▥',module:'knowledge',permission:'knowledge.read'},{group:'CONTENT & KNOWLEDGE',label:'Knowledge Gaps',url:'/knowledge/gaps',icon:'◇',module:'knowledge',permission:'knowledge.read'},{group:'CONTENT & KNOWLEDGE',label:'Renova Product Catalog',url:'/catalog',icon:'▦',module:'crm',permission:'crm.read'},{group:'CONTENT & KNOWLEDGE',label:'Renova Promotion Automation',url:'/renova/promotion',icon:'✦',module:'crm',permission:'crm.read'},
  {group:'ORDERING & DISPATCH',label:'Ordering',url:'/enterprise/orders',icon:'▤',module:'core',permission:''},{group:'ORDERING & DISPATCH',label:'Inventory',url:'/enterprise/inventory',icon:'▥',module:'core',permission:''},{group:'ORDERING & DISPATCH',label:'Warehousing & Dispatch',url:'/enterprise/warehousing',icon:'▦',module:'core',permission:''},{group:'ORDERING & DISPATCH',label:'Distribution',url:'/enterprise/distribution',icon:'◎',module:'core',permission:''},{group:'ORDERING & DISPATCH',label:'Logistics & Delivery',url:'/enterprise/logistics',icon:'↗',module:'core',permission:''},{group:'ORDERING & DISPATCH',label:'Facilities',url:'/enterprise/facilities',icon:'⌂',module:'core',permission:''},
  {group:'FINANCE',label:'Financials',url:'/enterprise/payments',icon:'€',module:'core',permission:''},{group:'FINANCE',label:'Billing & Subscription',url:'/billing',icon:'▤',module:'billing',permission:'billing.read'},
  {group:'AUTOMATION & IMPROVE',label:'Business Assistants',url:'/ai/agents',icon:'✦',module:'ai',permission:'agents.read'},{group:'AUTOMATION & IMPROVE',label:'Workflows',url:'/workflows',icon:'⌁',module:'automation',permission:'automation.read'},{group:'AUTOMATION & IMPROVE',label:'Automations',url:'/automations',icon:'⚡',module:'automation',permission:'automation.read'},{group:'AUTOMATION & IMPROVE',label:'Analytics & ROI',url:'/analytics',icon:'▥',module:'analytics',permission:'analytics.read'},
  {group:'ADMINISTRATION',label:'Connections & Senders',url:'/integrations',icon:'↗',module:'integrations',permission:'integrations.read'},{group:'ADMINISTRATION',label:'Users & Roles',url:'/users',icon:'◎',module:'core',permission:'users.read'},{group:'ADMINISTRATION',label:'Security',url:'/security',icon:'◆',module:'core',permission:'users.read'},{group:'ADMINISTRATION',label:'White Label',url:'/white-label',icon:'◇',module:'core',permission:'settings.manage'},{group:'ADMINISTRATION',label:'Audit & Governance',url:'/audit',icon:'✓',module:'core',permission:'audit.read'},{group:'ADMINISTRATION',label:'Platform Management',url:'/platform',icon:'◉',module:'platform',permission:'system.admin'},{group:'ADMINISTRATION',label:'Industry Packs',url:'/industry-packs',icon:'▦',module:'platform',permission:'system.admin'},{group:'ADMINISTRATION',label:'Module Administration',url:'/admin/modules',icon:'⚙',module:'platform',permission:'system.admin'}
 ];
 constructor(){this.runtime.load().subscribe({error:()=>{}});this.i18n.setLanguage(this.i18n.language());}
 get session(){return this.auth.session();} get workspaceName(){return this.session?.tenantSlug||'Workspace';} get visibleGroups(){return this.groups.filter(g=>this.navBy(g).length>0);} get searchResults(){const q=this.query.trim().toLowerCase();return this.nav.filter(i=>this.allowed(i)&&(!q||`${i.label} ${i.group} ${i.module}`.toLowerCase().includes(q))).slice(0,9);} navBy(group:string){return this.nav.filter(i=>i.group===group&&this.allowed(i));}
 groupIcon(group:string){return ({'COMMAND CENTER':'⌂','SALES & ACQUISITION':'◆','CONTENT & KNOWLEDGE':'▤','ORDERING & DISPATCH':'▦','FINANCE':'€','AUTOMATION & IMPROVE':'✦','ADMINISTRATION':'⚙'} as Record<string,string>)[group]||'•';}
 allowed(item:NavigationItem){if(item.url==='/renova/portal')return true;if(item.module==='core')return this.runtime.isActive();if(item.module==='platform')return this.auth.hasPermission('system.admin');return this.runtime.hasModule(item.module)&&this.auth.hasPermission(item.permission);}
 setLanguage(language:AdminLanguage){this.i18n.setLanguage(language);} go(url:string){void this.router.navigate([url]);this.query='';} initials(v:string){return v.split(/\s+|@/).filter(Boolean).map(x=>x[0]).join('').slice(0,2).toUpperCase()||'U';}
}
