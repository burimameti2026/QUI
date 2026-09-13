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

        <nav class="reference-menu" aria-label="Application navigation">
          <ng-container *ngFor="let group of groups">
            <div class="menu-group" [class.closed]="!isGroupOpen(group)">
              <button class="group-heading" type="button" (click)="toggleGroup(group)" [attr.aria-expanded]="isGroupOpen(group)">
                <span>{{ i18n.t(group) }}</span><span class="group-chevron">⌄</span>
              </button>
              <div class="group-items" *ngIf="isGroupOpen(group)">
                <ng-container *ngFor="let item of itemsFor(group)">
                  <a *ngIf="allowed(item)" class="menu-item" [routerLink]="item.url" routerLinkActive="active" [routerLinkActiveOptions]="{exact:item.url === '/dashboard'}">
                    <span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ i18n.t(item.label) }}</span>
                  </a>
                </ng-container>
              </div>
            </div>
          </ng-container>
        </nav>

        <div class="account"><span class="avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span><div><b>{{ session?.name || 'Administrator' }}</b><small>{{ workspaceName }}</small></div><span class="account-chevron">⌄</span></div>
      </aside>
      <main>
        <header class="app-header">
          <div class="header-search-wrap">
            <label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label>
            <a class="portal-link" routerLink="/renova/portal">↗ {{ i18n.t('Public Renova portal') }}</a>
            <div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let language of i18n.languages" [value]="language.code">{{ language.label }}</option></select></div>
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
    .reference-menu{display:flex;flex-direction:column;gap:4px;padding:4px 7px 14px;overflow:auto;min-height:0;}
    .menu-group{padding:0 0 4px;}
    .group-heading{display:flex;align-items:center;justify-content:space-between;width:100%;padding:9px 10px 6px;border:0;background:transparent;color:#98a3b5;font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-align:left;cursor:pointer;}
    .group-heading:hover{color:#687792;}
    .group-chevron{font-size:11px;letter-spacing:0;transition:transform .18s ease;color:#9ba6b7;}
    .menu-group.closed .group-chevron{transform:rotate(-90deg);}
    .group-items{display:grid;gap:2px;}
    .reference-menu .menu-item{position:relative;display:flex;align-items:center;width:100%;box-sizing:border-box;min-height:37px;padding:8px 10px;border:0;border-radius:10px;background:transparent;color:#52627f;text-decoration:none;font:inherit;font-size:10px;font-weight:500;cursor:pointer;text-align:left;transition:background .16s ease,color .16s ease,box-shadow .16s ease;}
    .reference-menu .menu-item:hover{background:#f5f8fd;color:#315fcf;}
    .reference-menu .menu-item.active{background:linear-gradient(90deg,#edf3ff,#f4f7ff);color:#155eef;box-shadow:inset 3px 0 0 #2563eb,0 3px 10px rgba(37,99,235,.055);font-weight:650;}
    .reference-menu .nav-icon{width:25px;flex:0 0 25px;display:inline-grid;place-items:center;font-size:12px;line-height:1;color:currentColor;opacity:.9;}
    .reference-menu .nav-label{padding-left:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .account{margin-top:auto;}
    .shell.collapsed .reference-menu .nav-label,.shell.collapsed .reference-menu .group-heading span:first-child{display:none!important;}
    .shell.collapsed .reference-menu .group-heading{justify-content:center;padding:6px;}
    .shell.collapsed .reference-menu .group-heading .group-chevron{display:none;}
    .shell.collapsed .reference-menu .group-items{display:grid!important;}
    .shell.collapsed .reference-menu{padding-left:4px;padding-right:4px;}
    .shell.collapsed .reference-menu .menu-item{width:42px;height:42px;min-height:42px;padding:0;justify-content:center;margin:2px auto;}
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
  groupOpen: Record<string, boolean> = {};
  get groups() { return [...new Set(this.nav.map(item => item.group))]; }
  get session() { return this.auth.session(); }
  get workspaceName() { return this.session?.tenantSlug || this.session?.tenantId || 'Renova Workspace'; }
  get searchResults() { const q = this.query.trim().toLowerCase(); return q ? this.nav.filter(item => `${item.label} ${item.group}`.toLowerCase().includes(q)).filter(item => this.allowed(item)).slice(0, 8) : []; }
  itemsFor(group: string) { return this.nav.filter(item => item.group === group); }
  isGroupOpen(group: string) { return this.groupOpen[group] !== false; }
  toggleGroup(group: string) { this.groupOpen[group] = !this.isGroupOpen(group); }
  allowed(item: NavigationItem) { return (!item.permission || this.auth.hasPermission(item.permission)) && (!item.module || this.auth.hasModule(item.module)); }
  initials(value: string) { return value.split(/[-_\s]+/).filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'R'; }
  toggleSidebar() { this.collapsed = !this.collapsed; }
  go(url: string) { this.query = ''; void this.router.navigateByUrl(url); }
  setLanguage(language: string) { this.i18n.setLanguage(language as any); }
}