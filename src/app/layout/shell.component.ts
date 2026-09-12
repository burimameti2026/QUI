import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TenantRuntimeService } from '../core/tenant-runtime.service';
import { AdminI18nService } from '../core/admin-i18n.service';
import { AdminStaticI18nDirective } from '../core/admin-static-i18n.directive';

interface NavigationItem {
  group: string;
  label: string;
  url: string;
  icon: string;
  module: string;
  permission: string;
}

@Component({
  selector: 'qai-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, AdminStaticI18nDirective],
  template: `
    <div class="shell" [class.collapsed]="collapsed">
      <aside class="sidebar">
        <div class="brand">
          <i class="brand-mark">R</i>
          <div class="brand-copy"><strong>RENOVA</strong><small>ENTERPRISE</small></div>
          <button class="collapse-btn" type="button" (click)="toggleSidebar()" [attr.aria-label]="collapsed ? 'Expand navigation' : 'Collapse navigation'"></button>
        </div>
        <div class="workspace">
          <i>{{ initials(workspaceName) }}</i>
          <div><b>{{ workspaceName }}</b><span>{{ i18n.t(runtime.runtime()?.plan || session?.licensePlan || 'Licensed') }} workspace</span></div>
        </div>
        <nav class="department-nav">
          <ng-container *ngFor="let group of visibleGroups">
            <div class="department-heading"><span>{{ groupIcon(group) }}</span><b>{{ i18n.t(group) }}</b></div>
            <div class="department-items">
              <a *ngFor="let item of navBy(group)" [routerLink]="item.url" routerLinkActive="active" [attr.title]="i18n.t(item.label)">
                <span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ i18n.t(item.label) }}</span>
              </a>
            </div>
          </ng-container>
        </nav>
        <a class="real-workspace" routerLink="/platform/prepare-workspace">
          <span class="real-workspace-icon">＋</span><span><b>{{ i18n.t('Real Workspace') }}</b><small>{{ i18n.t('Set up and run automation') }}</small></span><strong>›</strong>
        </a>
        <div class="account"><span class="avatar">{{ initials(session?.tenantSlug || 'BA') }}</span><div><b>{{ session?.name || 'Administrator' }}</b><small>{{ workspaceName }}</small></div><span>⌄</span></div>
      </aside>
      <main>
        <header class="app-header">
          <div class="header-search-wrap">
            <label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label>
            <a class="portal-link" routerLink="/renova/portal">↗ {{ i18n.t('Public Renova portal') }}</a>
            <div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let language of i18n.languages" [value]="language.code">{{ language.label }}</option></select></div>
            <section class="header-search-results" *ngIf="query.trim()"><button type="button" *ngFor="let item of searchResults" (click)="go(item.url)"><i>{{ item.icon }}</i><span><b>{{ i18n.t(item.label) }}</b><small>{{ i18n.t(item.group) }}</small></span></button></section>
          </div>
        </header>
        <section class="page" qaiAdminStaticI18n><router-outlet/></section>
      </main>
    </div>
  `,
  styles: []
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly runtime = inject(TenantRuntimeService);
  readonly i18n = inject(AdminI18nService);
  private readonly router = inject(Router);
  query = '';
  collapsed = false;

  readonly groups = ['COMMAND CENTER','SALES & ACQUISITION','CONTENT & KNOWLEDGE','ORDERING & DISPATCH','FINANCE','AUTOMATION & IMPROVE','ADMINISTRATION'];
  readonly nav: NavigationItem[] = [
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
    {group:'ORDERING & DISPATCH',label:'Warehousing & Dispatch',url:'/enterprise/fulfillment',icon:'▦',module:'core',permission:''},
    {group:'ORDERING & DISPATCH',label:'Logistics',url:'/enterprise/logistics',icon:'↗',module:'core',permission:''},
    {group:'FINANCE',label:'Finance',url:'/enterprise/finance',icon:'€',module:'core',permission:''},
    {group:'FINANCE',label:'Billing & Subscription',url:'/platform/billing',icon:'◫',module:'core',permission:'billing.read'},
    {group:'AUTOMATION & IMPROVE',label:'Automation',url:'/automation',icon:'⚙',module:'automation',permission:'automation.read'},
    {group:'AUTOMATION & IMPROVE',label:'Analytics',url:'/analytics',icon:'◒',module:'analytics',permission:'analytics.read'},
    {group:'AUTOMATION & IMPROVE',label:'Knowledge Improvement',url:'/knowledge/improve',icon:'✦',module:'knowledge',permission:'knowledge.read'},
    {group:'ADMINISTRATION',label:'Platform Management',url:'/platform',icon:'⚙',module:'core',permission:'settings.manage'},
    {group:'ADMINISTRATION',label:'Prepare Real Workspace',url:'/platform/prepare-workspace',icon:'＋',module:'core',permission:'settings.manage'},
    {group:'ADMINISTRATION',label:'Users & Roles',url:'/platform/users',icon:'◎',module:'core',permission:'settings.manage'},
    {group:'ADMINISTRATION',label:'Audit & Governance',url:'/platform/audit',icon:'▤',module:'core',permission:'settings.manage'}
  ];

  get session() { return this.auth.session(); }
  get workspaceName() { return this.session?.tenantSlug || this.session?.tenantId || 'Renova Workspace'; }
  get visibleGroups() { return this.groups.filter(group => this.navBy(group).length > 0); }
  get searchResults() {
    const q = this.query.trim().toLowerCase();
    return q ? this.nav.filter(item => `${item.label} ${item.group}`.toLowerCase().includes(q)).slice(0, 8) : [];
  }
  navBy(group: string) { return this.nav.filter(item => item.group === group && this.allowed(item)); }
  allowed(item: NavigationItem) { return (!item.permission || this.auth.hasPermission(item.permission)) && (!item.module || this.auth.hasModule(item.module)); }
  groupIcon(group: string) { const icons: Record<string,string> = {'COMMAND CENTER':'⌂','SALES & ACQUISITION':'◇','CONTENT & KNOWLEDGE':'▤','ORDERING & DISPATCH':'▦','FINANCE':'€','AUTOMATION & IMPROVE':'✦','ADMINISTRATION':'⚙'}; return icons[group] || '•'; }
  initials(value: string) { return value.split(/[-_\s]+/).filter(Boolean).slice(0,2).map(part => part[0]).join('').toUpperCase() || 'R'; }
  toggleSidebar() { this.collapsed = !this.collapsed; }
  go(url: string) { this.query = ''; void this.router.navigateByUrl(url); }
  setLanguage(language: string) { this.i18n.setLanguage(language as any); }
}
