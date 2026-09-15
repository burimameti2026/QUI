import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TenantRuntimeService } from '../core/tenant-runtime.service';
import { AdminI18nService } from '../core/admin-i18n.service';
import { AdminStaticI18nDirective } from '../core/admin-static-i18n.directive';
import { NAVIGATION_TRANSLATIONS } from '../core/navigation-translations';

interface Item { label: string; url: string; icon: string; module?: string; permission?: string; children?: Item[] }
interface Group { label: string; items: Item[] }
const i = (label: string, url: string, icon: string, children?: Item[]): Item => ({ label, url, icon, children });

@Component({
  selector: 'qai-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, AdminStaticI18nDirective],
  template: `
    <div class="shell" [class.collapsed]="collapsed">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-logo"><span>L</span></div>
          <div class="brand-copy"><strong>Leads<span>AI</span></strong><small>ENTERPRISE PLATFORM</small></div>
          <button type="button" class="collapse-btn" (click)="toggleSidebar()">{{ collapsed ? '→' : '←' }}</button>
        </div>
        <div class="workspace-card"><span class="workspace-logo">⌂</span><div><b>{{ workspaceName }}</b><small>Licensed workspace</small></div><span class="workspace-more">⌄</span></div>
        <nav class="reference-menu">
          <section class="menu-group" *ngFor="let group of navigationGroups">
            <div class="group-heading">{{ navLabel(group.label) }}</div>
            <div class="group-items">
              <ng-container *ngFor="let item of group.items">
                <div class="nav-node" *ngIf="allowed(item)">
                  <a *ngIf="!hasChildren(item)" class="menu-item" [routerLink]="item.url" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                    <span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ navLabel(item.label) }}</span>
                  </a>
                  <button *ngIf="hasChildren(item)" type="button" class="menu-item parent-item" [class.active]="isItemActive(item)" (click)="openItem(item)">
                    <span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ navLabel(item.label) }}</span><span class="node-chevron">{{ isItemExpanded(item) ? '⌃' : '⌄' }}</span>
                  </button>
                  <div class="child-items" *ngIf="hasChildren(item) && isItemExpanded(item)">
                    <a *ngFor="let child of item.children" class="child-item" [routerLink]="child.url" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                      <span class="child-dot"></span><span>{{ navLabel(child.label) }}</span>
                    </a>
                  </div>
                </div>
              </ng-container>
            </div>
          </section>
        </nav>
        <div class="sidebar-footer">
          <div class="account"><span class="avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span><div><b>{{ session?.name || 'Administrator' }}</b><small>{{ workspaceName }}</small></div></div>
          <button type="button" class="logout-button" (click)="logout()"><span>⇥</span><span class="nav-label">{{ navLabel('Logout') }}</span></button>
        </div>
      </aside>
      <main>
        <header class="app-header"><div class="header-search-wrap"><label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label><a class="portal-link" routerLink="/renova/portal">↗ {{ i18n.t('Public Renova portal') }}</a><div class="admin-language"><span>◎</span><select [ngModel]="i18n.language()" (ngModelChange)="setLanguage($event)"><option *ngFor="let l of i18n.languages" [value]="l.code">{{ l.label }}</option></select></div></div></header>
        <section class="page" qaiAdminStaticI18n><router-outlet /></section>
      </main>
    </div>
  `,
  styleUrl: './shell.component.css'
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly runtime = inject(TenantRuntimeService);
  readonly i18n = inject(AdminI18nService);
  private readonly router = inject(Router);
  readonly navigationTranslations = NAVIGATION_TRANSLATIONS;
  query = '';
  collapsed = false;
  expandedItem: Item | null | undefined = undefined;

  readonly navigationGroups: Group[] = [
    { label: 'COMMAND CENTER', items: [i('Dashboard', '/dashboard', '⌂')] },
    { label: 'SALES & ACQUISITION', items: [i('Leads', '/crm/leads', '▣'), i('CRM', '/crm/companies', '▧', [i('Companies', '/crm/companies', '▦'), i('Contacts', '/crm/contacts', '◎'), i('Opportunities', '/crm/opportunities', '♡')]), i('Prospect Discovery', '/discover', '⌕'), i('Autonomous Acquisition', '/acquisition/autonomous', '✦'), i('Campaigns', '/campaigns', '↗'), i('Qualified Leads', '/crm/leads', '◆'), i('Sales Pipelines', '/pipeline', '▤'), i('Golden Pipeline', '/golden-pipeline', '◇'), i('Demos & Meetings', '/meetings', '◷'), i('Replies & Inbox', '/inbox', '▱')] },
    { label: 'CONTENT & KNOWLEDGE', items: [i('CMS — Renova Content', '/renova/content', '▤'), i('Knowledge', '/knowledge', '▥', [i('Knowledge Gaps', '/knowledge/gaps', '◇'), i('Knowledge Improvement', '/knowledge/improve', '✦')]), i('Renova Product Catalog', '/catalog', '▦', [i('Promotion Automation', '/renova/promotion', '✦')])] },
    { label: 'ORDERING & DISPATCH', items: [i('Enterprise Operations', '/enterprise', '◉', [i('Delivery Orders', '/enterprise/orders', '▤'), i('Shipments', '/enterprise/fulfillment', '▤'), i('Inventory', '/enterprise/inventory', '▥'), i('Warehouse', '/enterprise/fulfillment', '▤'), i('Fleet & Drivers', '/enterprise/logistics', '▱')]), i('Invoices', '/billing', '▤')] },
    { label: 'FINANCE', items: [i('Finance', '/enterprise/finance', '€')] },
    { label: 'AUTOMATION & IMPROVE', items: [i('Reports', '/analytics', '▧'), i('Automation', '/automations', '✣')] },
    { label: 'ADMINISTRATION', items: [i('Platform Management', '/platform', '⚙', [i('Prepare Real Workspace', '/platform/prepare-workspace', '＋'), i('Users & Roles', '/users', '◎'), i('Audit & Governance', '/audit', '▤')])] }
  ];

  get session() { return this.auth.session(); }
  get workspaceName() { return this.session?.tenantSlug || this.session?.tenantId || 'Renova Workspace'; }
  navLabel(key: string): string { return this.navigationTranslations[key]?.[this.i18n.language()] ?? key; }
  allowed(x: Item): boolean { return (!x.permission || this.auth.hasPermission(x.permission)) && (!x.module || this.auth.hasModule(x.module)); }
  hasChildren(x: Item): boolean { return !!x.children?.length; }
  private currentUrl(): string { return this.router.url.split('?')[0].split('#')[0]; }
  isItemActive(x: Item): boolean {
    const u = this.currentUrl();
    if (u === x.url || u.startsWith(x.url + '/')) return true;
    for (const child of x.children ?? []) if (u === child.url || u.startsWith(child.url + '/')) return true;
    return false;
  }
  isItemExpanded(x: Item): boolean {
    if (!this.hasChildren(x)) return false;
    if (this.expandedItem !== undefined) return this.expandedItem === x;
    return this.isItemActive(x);
  }
  openItem(x: Item): void {
    if (!this.hasChildren(x)) return;
    this.expandedItem = this.isItemExpanded(x) ? null : x;
    if (x.url) void this.router.navigateByUrl(x.url);
  }
  toggleItem(x: Item): void { this.openItem(x); }
  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
  initials(v: string): string { return v.split(/[-_\s]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'R'; }
  toggleSidebar(): void { this.collapsed = !this.collapsed; }
  setLanguage(l: string): void { this.i18n.setLanguage(l as any); }
}