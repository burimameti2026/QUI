import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TenantRuntimeService } from '../core/tenant-runtime.service';
import { AdminI18nService } from '../core/admin-i18n.service';
import { AdminStaticI18nDirective } from '../core/admin-static-i18n.directive';

interface NavigationItem { group: string; label: string; url: string; icon: string; module: string; permission: string; }

@Component({
  selector: 'qai-shell', standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, AdminStaticI18nDirective],
  template: `
    <div class="shell" [class.collapsed]="collapsed">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo" aria-hidden="true"><span>L</span></div>
          <div class="brand-copy"><strong>Leads<span>AI</span></strong><small>ENTERPRISE PLATFORM</small></div>
          <button class="collapse-btn" type="button" (click)="toggleSidebar()" [attr.aria-label]="collapsed ? 'Expand navigation' : 'Collapse navigation'">{{ collapsed ? '→' : '←' }}</button>
        </div>
        <div class="workspace-card">
          <span class="workspace-logo">⌂</span><div><b>{{ workspaceName }}</b><small>Licensed workspace</small></div><span class="workspace-more">⌄</span>
        </div>
        <nav class="reference-menu" aria-label="Application navigation">
          <ng-container *ngFor="let group of groups">
            <div class="menu-group" [class.closed]="!isGroupOpen(group)">
              <button class="group-heading" type="button" (click)="toggleGroup(group)" [attr.aria-expanded]="isGroupOpen(group)"><span>{{ i18n.t(group) }}</span><span class="group-chevron">⌄</span></button>
              <div class="group-items" *ngIf="isGroupOpen(group)">
                <ng-container *ngFor="let item of itemsFor(group)">
                  <a *ngIf="allowed(item)" class="menu-item" [routerLink]="item.url" routerLinkActive="active" [routerLinkActiveOptions]="{exact:item.url === '/dashboard'}"><span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ i18n.t(item.label) }}</span></a>
                </ng-container>
              </div>
            </div>
          </ng-container>
        </nav>
        <div class="account"><span class="avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span><div><b>{{ session?.name || 'Administrator' }}</b><small>{{ workspaceName }}</small></div><span class="account-chevron">⌄</span></div>
      </aside>
      <main>
        <header class="app-header">
          <div class="header-search-wrap"><label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label><a class="portal-link" routerLink="/renova/portal">↗ {{ i18n.t('Public Renova portal') }}</a><div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let language of i18n.languages" [value]="language.code">{{ language.label }}</option></select></div><section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{ item.icon }}</i><span><b>{{ i18n.t(item.label) }}</b><small>{{ i18n.t(item.group) }}</small></span></button></section></div>
          <div class="header-tools"><button type="button" class="header-tool" aria-label="Notifications">♧<span class="notification-dot">3</span></button><button type="button" class="header-avatar" aria-label="Account"><span class="avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span><i>⌄</i></button></div>
        </header>
        <section class="page" qaiAdminStaticI18n><router-outlet/></section>
      </main>
    </div>
  `,
  styles: [`
    :host{display:block;height:100vh;overflow:hidden}.shell{height:100vh;display:grid;grid-template-columns:248px minmax(0,1fr);background:#f6f8fc;color:#101828}.sidebar{height:100vh;box-sizing:border-box;display:flex;flex-direction:column;background:#fff;border-right:1px solid #e5e9f0;padding:20px 12px 12px;overflow:hidden}.brand{height:44px;display:flex;align-items:center;padding:0 8px 14px;gap:10px;border-bottom:1px solid #eef1f5}.brand-logo{width:31px;height:31px;flex:0 0 31px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;box-shadow:0 6px 14px rgba(37,99,235,.18)}.brand-logo span{font-size:16px;font-weight:850}.brand-copy{min-width:0;display:flex;flex-direction:column;line-height:1}.brand-copy strong{font-size:18px;letter-spacing:-.5px;color:#111827}.brand-copy strong span{color:#7c3aed}.brand-copy small{margin-top:5px;color:#98a2b3;font-size:7px;font-weight:800;letter-spacing:.14em}.collapse-btn{margin-left:auto;border:0;background:transparent;color:#98a2b3;font-size:15px;cursor:pointer}.workspace-card{margin:14px 2px 10px;padding:10px;display:flex;align-items:center;gap:9px;background:#f8fafc;border:1px solid #e6eaf0;border-radius:10px}.workspace-logo{width:31px;height:31px;display:grid;place-items:center;border-radius:8px;background:#eff6ff;color:#2563eb;font-size:15px}.workspace-card div{min-width:0;display:flex;flex-direction:column}.workspace-card b{font-size:10px;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.workspace-card small{margin-top:3px;font-size:7px;color:#667085}.workspace-more{margin-left:auto;color:#98a2b3;font-size:13px}.reference-menu{flex:1;display:flex;flex-direction:column;gap:5px;padding:2px 4px 10px;overflow:auto;min-height:0}.menu-group{padding-bottom:3px}.group-heading{display:flex;align-items:center;justify-content:space-between;width:100%;box-sizing:border-box;padding:10px 9px 6px;border:0;background:transparent;color:#98a2b3;font-size:8px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;text-align:left;cursor:pointer}.group-heading:hover{color:#667085}.group-chevron{font-size:11px;transition:transform .18s ease}.menu-group.closed .group-chevron{transform:rotate(-90deg)}.group-items{display:grid;gap:2px}.reference-menu .menu-item{position:relative;display:flex;align-items:center;min-height:38px;box-sizing:border-box;padding:0 10px;border-radius:9px;color:#52627a;text-decoration:none;font-size:10px;font-weight:560;transition:all .15s ease}.reference-menu .menu-item:hover{background:#f5f8fd;color:#315fcf}.reference-menu .menu-item.active{background:#edf3ff;color:#155eef;box-shadow:inset 3px 0 #2563eb;font-weight:700}.nav-icon{width:25px;flex:0 0 25px;display:grid;place-items:center;color:currentColor;font-size:13px;line-height:1}.nav-label{padding-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.account{display:flex;align-items:center;gap:9px;padding:11px 7px 4px;border-top:1px solid #eef1f5}.avatar{width:32px;height:32px;flex:0 0 32px;display:grid;place-items:center;border-radius:50%;background:#e8edff;color:#4338ca;font-size:10px;font-weight:800}.account div{min-width:0;display:flex;flex-direction:column}.account b{font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.account small{margin-top:3px;color:#98a2b3;font-size:7px}.account-chevron{margin-left:auto;color:#98a2b3}.shell main{min-width:0;background:#f6f8fc}.shell main>header.app-header{height:64px;box-sizing:border-box;padding:0 26px;display:flex;align-items:center;justify-content:space-between;background:#fff;border-bottom:1px solid #e5e9f0}.header-search-wrap{position:relative;display:flex;align-items:center;gap:8px;min-width:0}.global-search{width:min(440px,45vw);height:38px;box-sizing:border-box;display:flex;align-items:center;gap:8px;padding:0 10px;background:#f8fafc;border:1px solid #e1e6ee;border-radius:9px;color:#98a2b3}.global-search input{width:100%;border:0;outline:0;background:transparent;color:#111827;font-size:10px}.global-search kbd{font-size:7px;color:#98a2b3;border:1px solid #e1e6ee;border-radius:5px;padding:3px 5px;background:#fff}.portal-link,.admin-language{height:38px;display:flex;align-items:center;border:1px solid #e1e6ee;border-radius:9px;background:#fff;text-decoration:none}.portal-link{padding:0 10px;color:#52627a;font-size:9px}.admin-language{padding:0 8px;gap:4px}.admin-language>span{color:#2563eb}.admin-language select{border:0;background:transparent;outline:0;color:#52627a;font-size:9px}.header-tools{display:flex;align-items:center;gap:10px}.header-tool,.header-avatar{border:0;background:transparent;cursor:pointer}.header-tool{position:relative;color:#667085;font-size:17px}.notification-dot{position:absolute;top:-4px;right:-5px;min-width:13px;height:13px;padding:0 2px;box-sizing:border-box;border-radius:99px;background:#2563eb;color:#fff;font-size:7px;display:grid;place-items:center}.header-avatar{display:flex;align-items:center;gap:5px}.header-avatar i{color:#98a2b3;font-style:normal}.page{height:calc(100vh - 64px);overflow:auto;box-sizing:border-box;padding:26px 28px 44px;background:#f6f8fc}.header-search-results{position:absolute;top:44px;left:0;width:440px;z-index:30;background:#fff;border:1px solid #e5e9f0;border-radius:10px;box-shadow:0 16px 40px rgba(15,23,42,.12);overflow:hidden}.header-search-results button{width:100%;display:flex;gap:9px;padding:10px;border:0;background:#fff;text-align:left}.header-search-results button:hover{background:#f7f9fc}.header-search-results i{width:24px;color:#2563eb}.header-search-results span{display:flex;flex-direction:column}.header-search-results small{color:#98a2b3;margin-top:2px}.shell.collapsed{grid-template-columns:76px minmax(0,1fr)}.shell.collapsed .sidebar{padding-left:9px;padding-right:9px}.shell.collapsed .brand-copy,.shell.collapsed .workspace-card div,.shell.collapsed .workspace-more,.shell.collapsed .group-heading span:first-child,.shell.collapsed .nav-label,.shell.collapsed .account div,.shell.collapsed .account-chevron{display:none}.shell.collapsed .brand{justify-content:center}.shell.collapsed .collapse-btn{margin-left:0}.shell.collapsed .workspace-card{justify-content:center}.shell.collapsed .group-heading{justify-content:center;padding-left:4px;padding-right:4px}.shell.collapsed .group-chevron{display:none}.shell.collapsed .menu-item{justify-content:center;padding:0}.shell.collapsed .nav-icon{width:25px;flex-basis:25px}.shell.collapsed .account{justify-content:center}.shell.collapsed .reference-menu{padding-left:2px;padding-right:2px}
    @media(max-width:900px){.shell{grid-template-columns:76px minmax(0,1fr)}.sidebar{padding-left:9px;padding-right:9px}.brand-copy,.workspace-card div,.workspace-more,.group-heading span:first-child,.nav-label,.account div,.account-chevron{display:none}.brand{justify-content:center}.workspace-card{justify-content:center}.group-heading{justify-content:center}.group-chevron{display:none}.menu-item{justify-content:center}.account{justify-content:center}.portal-link{display:none}.global-search{width:min(360px,45vw)}}
    @media(max-width:700px){.shell{display:block;height:auto;min-height:100vh}.sidebar{height:auto;min-height:64px;border-right:0;border-bottom:1px solid #e5e9f0}.reference-menu,.workspace-card,.account{display:none}.shell main>header.app-header{height:60px;padding:0 14px}.page{height:auto;min-height:calc(100vh - 60px);padding:18px 14px 32px}.admin-language{display:none}.global-search{width:min(360px,70vw)}}
  `]
})
export class ShellComponent {
  readonly auth = inject(AuthService); readonly runtime = inject(TenantRuntimeService); readonly i18n = inject(AdminI18nService); private readonly router = inject(Router);
  query=''; collapsed=false;
  readonly nav: NavigationItem[] = [
    {group:'COMMAND CENTER',label:'Dashboard',url:'/dashboard',icon:'⌂',module:'core',permission:''},
    {group:'SALES & ACQUISITION',label:'Leads',url:'/crm/leads',icon:'▣',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'CRM',url:'/crm/companies',icon:'▧',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Opportunities',url:'/crm/opportunities',icon:'♡',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Prospect Discovery',url:'/discover',icon:'⌕',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Autonomous Acquisition',url:'/acquisition/autonomous',icon:'✦',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Campaigns',url:'/campaigns',icon:'↗',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Qualified Leads',url:'/crm/leads',icon:'◆',module:'crm',permission:'crm.read'},
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
    {group:'ORDERING & DISPATCH',label:'Enterprise Operations',url:'/enterprise',icon:'◉',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Delivery Orders',url:'/enterprise/orders',icon:'▤',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Shipments',url:'/enterprise/fulfillment',icon:'▤',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Invoices',url:'/billing',icon:'▤',module:'billing',permission:'billing.read'},
    {group:'ORDERING & DISPATCH',label:'Inventory',url:'/enterprise/inventory',icon:'▥',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Warehouse',url:'/enterprise/fulfillment',icon:'▤',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Fleet & Drivers',url:'/enterprise/logistics',icon:'▱',module:'core',permission:''},
    {group:'FINANCE',label:'Finance',url:'/enterprise/finance',icon:'€',module:'core',permission:''},
    {group:'AUTOMATION & IMPROVE',label:'Reports',url:'/analytics',icon:'▧',module:'analytics',permission:'analytics.read'},
    {group:'AUTOMATION & IMPROVE',label:'Automation',url:'/automations',icon:'✣',module:'automation',permission:'automation.read'},
    {group:'AUTOMATION & IMPROVE',label:'Knowledge Improvement',url:'/knowledge/improve',icon:'✦',module:'knowledge',permission:'knowledge.read'},
    {group:'ADMINISTRATION',label:'Platform Management',url:'/platform',icon:'⚙',module:'core',permission:'settings.manage'},
    {group:'ADMINISTRATION',label:'Prepare Real Workspace',url:'/platform/prepare-workspace',icon:'＋',module:'core',permission:'settings.manage'},
    {group:'ADMINISTRATION',label:'Users & Roles',url:'/users',icon:'◎',module:'core',permission:'users.read'},
    {group:'ADMINISTRATION',label:'Audit & Governance',url:'/audit',icon:'▤',module:'core',permission:'audit.read'}
  ];
  groupOpen:Record<string,boolean>={}; get groups(){return [...new Set(this.nav.map(x=>x.group))]} get session(){return this.auth.session()} get workspaceName(){return this.session?.tenantSlug||this.session?.tenantId||'Renova Workspace'} get searchResults(){const q=this.query.trim().toLowerCase();return q?this.nav.filter(x=>`${x.label} ${x.group}`.toLowerCase().includes(q)).filter(x=>this.allowed(x)).slice(0,8):[]} itemsFor(g:string){return this.nav.filter(x=>x.group===g)} isGroupOpen(g:string){return this.groupOpen[g]!==false} toggleGroup(g:string){this.groupOpen[g]=!this.isGroupOpen(g)} allowed(x:NavigationItem){return(!x.permission||this.auth.hasPermission(x.permission))&&(!x.module||this.auth.hasModule(x.module))} initials(v:string){return v.split(/[-_\s]+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'R'} toggleSidebar(){this.collapsed=!this.collapsed} go(u:string){this.query='';void this.router.navigateByUrl(u)} setLanguage(l:string){this.i18n.setLanguage(l as any)}
}
