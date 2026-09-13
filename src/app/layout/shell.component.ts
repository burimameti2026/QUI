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
          <i class="brand-mark" aria-hidden="true"></i>
          <div class="brand-copy"><strong>Leads<span>AI</span></strong><small>ENTERPRISE PLATFORM</small></div>
          <button class="collapse-btn" type="button" (click)="toggleSidebar()" [attr.aria-label]="collapsed ? 'Expand navigation' : 'Collapse navigation'">{{ collapsed ? '→' : '←' }}</button>
        </div>

        <nav class="reference-menu">
          <a class="menu-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span class="nav-icon">⌂</span><span class="nav-label">{{ i18n.t('Dashboard') }}</span></a>
          <a class="menu-item" routerLink="/crm/leads" routerLinkActive="active"><span class="nav-icon">▣</span><span class="nav-label">{{ i18n.t('Leads') }}</span></a>
          <a class="menu-item" routerLink="/crm/companies" routerLinkActive="active"><span class="nav-icon">▧</span><span class="nav-label">{{ i18n.t('CRM') }}</span></a>
          <a class="menu-item" routerLink="/crm/opportunities" routerLinkActive="active"><span class="nav-icon">♡</span><span class="nav-label">{{ i18n.t('Opportunities') }}</span></a>

          <button class="menu-item menu-parent" type="button" [class.open]="ordersOpen" (click)="ordersOpen = !ordersOpen"><span class="nav-icon">▤</span><span class="nav-label">{{ i18n.t('Orders') }}</span><span class="menu-chevron" [class.open]="ordersOpen">⌄</span></button>
          <div class="menu-children" *ngIf="ordersOpen">
            <a routerLink="/enterprise/orders" routerLinkActive="active"><span class="child-dot"></span>{{ i18n.t('Delivery Orders') }}</a>
            <a routerLink="/enterprise/fulfillment" routerLinkActive="active"><span class="child-dot"></span>{{ i18n.t('Shipments') }}</a>
            <a routerLink="/billing" routerLinkActive="active"><span class="child-dot"></span>{{ i18n.t('Invoices') }}</a>
          </div>

          <a class="menu-item" routerLink="/enterprise/inventory" routerLinkActive="active"><span class="nav-icon">▥</span><span class="nav-label">{{ i18n.t('Inventory') }}</span></a>
          <a class="menu-item" routerLink="/enterprise/fulfillment" routerLinkActive="active"><span class="nav-icon">▤</span><span class="nav-label">{{ i18n.t('Warehouse') }}</span></a>
          <a class="menu-item" routerLink="/enterprise/logistics" routerLinkActive="active"><span class="nav-icon">▱</span><span class="nav-label">{{ i18n.t('Fleet & Drivers') }}</span></a>
          <a class="menu-item" routerLink="/analytics" routerLinkActive="active"><span class="nav-icon">▧</span><span class="nav-label">{{ i18n.t('Reports') }}</span></a>
          <a class="menu-item" routerLink="/automations" routerLinkActive="active"><span class="nav-icon">✣</span><span class="nav-label">{{ i18n.t('Automation') }}</span></a>
          <a class="menu-item" routerLink="/platform" routerLinkActive="active"><span class="nav-icon">⚙</span><span class="nav-label">{{ i18n.t('Settings') }}</span></a>
        </nav>

        <div class="account"><span class="avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span><div><b>{{ session?.name || 'Administrator' }}</b><small>{{ workspaceName }}</small></div><span class="account-chevron">⌄</span></div>
      </aside>

      <main>
        <header class="app-header">
          <div class="header-search-wrap">
            <label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label>
            <a class="portal-link" routerLink="/renova/portal">↗ {{ i18n.t('Public Renova portal') }}</a>
            <div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let language of i18n.languages" [value]="language.code">{{ language.label }}</option></div>
            <section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{ item.icon }}</i><span><b>{{ i18n.t(item.label) }}</b><small>{{ i18n.t(item.group) }}</small></span></button></section>
          </div>
          <div class="header-tools">
            <button type="button" class="header-tool" aria-label="Notifications">♧<span class="notification-dot">3</span></button>
            <button type="button" class="header-avatar" aria-label="Account"><span class="avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span><i>⌄</i></button>
          </div>
        </header>
        <section class="page" qaiAdminStaticI18n><router-outlet/></section>
      </main>
    </div>
  `,
  styles: [`
    :host{display:block}
    .reference-menu{display:flex;flex-direction:column;gap:2px;padding:2px 6px 12px;}
    .reference-menu .menu-item{position:relative;display:flex;align-items:center;width:100%;box-sizing:border-box;min-height:39px;padding:9px 11px;border:0;border-radius:10px;background:transparent;color:#52627f;text-decoration:none;font:inherit;font-size:10px;font-weight:500;cursor:pointer;text-align:left;transition:background .16s ease,color .16s ease;}
    .reference-menu .menu-item:hover{background:#f7f9fd;color:#315fcf;}
    .reference-menu .menu-item.active{background:#edf3ff;color:#155eef;box-shadow:inset 3px 0 0 #2563eb;font-weight:650;}
    .reference-menu .menu-parent.open{color:#445571;}
    .reference-menu .nav-icon{width:25px;flex:0 0 25px;display:inline-grid;place-items:center;font-size:13px;line-height:1;color:currentColor;opacity:.92;}
    .reference-menu .nav-label{padding-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .reference-menu .menu-chevron{margin-left:auto;font-size:12px;color:#8290a7;transition:transform .18s ease;}
    .reference-menu .menu-chevron.open{transform:rotate(180deg);color:#52627f;}
    .reference-menu .menu-children{margin:0 0 5px 25px;padding:1px 0 2px 12px;border-left:1px solid #e8edf5;display:grid;gap:2px;}
    .reference-menu .menu-children a{display:flex;align-items:center;min-height:31px;padding:7px 9px;color:#65738a;text-decoration:none;font-size:9px;border-radius:8px;white-space:nowrap;}
    .reference-menu .menu-children a:hover{background:#f7f9fd;color:#315fcf;}
    .reference-menu .menu-children a.active{background:#edf3ff;color:#155eef;font-weight:650;box-shadow:inset 2px 0 0 #2563eb;}
    .reference-menu .child-dot{width:5px;height:5px;border:1px solid currentColor;border-radius:50%;margin-right:9px;flex:0 0 5px;}
    .account{margin-top:auto;}
    .shell.collapsed .reference-menu .nav-label,.shell.collapsed .reference-menu .menu-chevron,.shell.collapsed .reference-menu .menu-children{display:none!important;}
    .shell.collapsed .reference-menu{padding-left:4px;padding-right:4px;}
    .shell.collapsed .reference-menu .menu-item{width:42px;height:42px;min-height:42px;padding:0;justify-content:center;margin:3px auto;}
    .shell.collapsed .reference-menu .nav-icon{width:24px;flex-basis:24px;}
  `]
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly runtime = inject(TenantRuntimeService);
  readonly i18n = inject(AdminI18nService);
  private readonly router = inject(Router);
  query = '';
  collapsed = false;
  ordersOpen = true;

  readonly nav: NavigationItem[] = [
    {group:'COMMAND CENTER',label:'Dashboard',url:'/dashboard',icon:'⌂',module:'core',permission:''},
    {group:'SALES & ACQUISITION',label:'Leads',url:'/crm/leads',icon:'▣',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'CRM',url:'/crm/companies',icon:'▧',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Opportunities',url:'/crm/opportunities',icon:'♡',module:'crm',permission:'crm.read'},
    {group:'ORDERING & DISPATCH',label:'Delivery Orders',url:'/enterprise/orders',icon:'▤',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Shipments',url:'/enterprise/fulfillment',icon:'▤',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Invoices',url:'/billing',icon:'▤',module:'billing',permission:'billing.read'},
    {group:'ORDERING & DISPATCH',label:'Inventory',url:'/enterprise/inventory',icon:'▥',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Warehouse',url:'/enterprise/fulfillment',icon:'▤',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Fleet & Drivers',url:'/enterprise/logistics',icon:'▱',module:'core',permission:''},
    {group:'AUTOMATION & IMPROVE',label:'Reports',url:'/analytics',icon:'▧',module:'analytics',permission:'analytics.read'},
    {group:'AUTOMATION & IMPROVE',label:'Automation',url:'/automations',icon:'✣',module:'automation',permission:'automation.read'},
    {group:'ADMINISTRATION',label:'Settings',url:'/platform',icon:'⚙',module:'core',permission:'settings.manage'},
    {group:'SALES & ACQUISITION',label:'Prospect Discovery',url:'/discover',icon:'⌕',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Autonomous Acquisition',url:'/acquisition/autonomous',icon:'✦',module:'crm',permission:'crm.read'},
    {group:'SALES & ACQUISITION',label:'Acquisition Approval Queue',url:'/acquisition/approval-queue',icon:'✓',module:'crm',permission:'crm.read'},
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
    {group:'FINANCE',label:'Finance',url:'/enterprise/finance',icon:'€',module:'core',permission:''},
    {group:'AUTOMATION & IMPROVE',label:'Knowledge Improvement',url:'/knowledge/improve',icon:'✦',module:'knowledge',permission:'knowledge.read'},
    {group:'ADMINISTRATION',label:'Platform Management',url:'/platform',icon:'⚙',module:'core',permission:'settings.manage'},
    {group:'ADMINISTRATION',label:'Prepare Real Workspace',url:'/platform/prepare-workspace',icon:'＋',module:'core',permission:'settings.manage'},
    {group:'ADMINISTRATION',label:'Users & Roles',url:'/users',icon:'◎',module:'core',permission:'users.read'},
    {group:'ADMINISTRATION',label:'Audit & Governance',url:'/audit',icon:'▤',module:'core',permission:'audit.read'}
  ];
  get session() { return this.auth.session(); }
  get workspaceName() { return this.session?.tenantSlug || this.session?.tenantId || 'Renova Workspace'; }
  get searchResults() { const q = this.query.trim().toLowerCase(); return q ? this.nav.filter(item => `${item.label} ${item.group}`.toLowerCase().includes(q)).filter(item => this.allowed(item)).slice(0, 8) : []; }
  navBy(group: string) { return this.nav.filter(item => item.group === group && this.allowed(item)); }
  allowed(item: NavigationItem) { return (!item.permission || this.auth.hasPermission(item.permission)) && (!item.module || this.auth.hasModule(item.module)); }
  initials(value: string) { return value.split(/[-_\s]+/).filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'R'; }
  toggleSidebar() { this.collapsed = !this.collapsed; }
  go(url: string) { this.query = ''; void this.router.navigateByUrl(url); }
  setLanguage(language: string) { this.i18n.setLanguage(language as any); }
}