import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TenantRuntimeService } from '../core/tenant-runtime.service';
import { AdminI18nService } from '../core/admin-i18n.service';
import { AdminStaticI18nDirective } from '../core/admin-static-i18n.directive';
import { NAVIGATION_TRANSLATIONS } from '../core/navigation-translations';

interface Item { label: string; url: string; icon: string; children?: Item[] }
interface Group { label: string; items: Item[] }
interface Workspace { id: 'leads' | 'cms' | 'finance' | 'admin'; label: string; description: string; icon: string; url: string }
const i = (label: string, url: string, icon: string, children?: Item[]): Item => ({ label, url, icon, children });

@Component({
  selector: 'qai-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, AdminStaticI18nDirective],
  styleUrls: ['./shell.component.css'],
  template: `
    <div class="shell" [class.collapsed]="collapsed" [class]="'workspace-' + currentWorkspace">
      <aside class="sidebar">
        <div class="brand">
          <a class="brand-link" routerLink="/dashboard" aria-label="LeadsAI home">
            <span class="brand-logo">L</span>
            <span class="brand-copy"><strong>Leads<span>AI</span></strong><small>ENTERPRISE PLATFORM</small></span>
          </a>
          <button type="button" class="collapse-btn" (click)="toggleSidebar()" [attr.aria-label]="collapsed ? 'Expand navigation' : 'Collapse navigation'">{{ collapsed ? '→' : '←' }}</button>
        </div>

        <nav class="reference-menu" aria-label="Primary navigation">
          <a class="home-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
            <span class="nav-icon">⌂</span><span class="nav-label">Home</span>
          </a>

          <div class="workspace-switcher" *ngIf="currentWorkspace === 'hub'">
            <span class="group-heading">WORKSPACES</span>
            <a *ngFor="let workspace of workspaces" class="workspace-nav" [class.active]="currentWorkspace === workspace.id" [routerLink]="workspace.url">
              <span class="workspace-nav-icon">{{ workspace.icon }}</span><span class="nav-label">{{ workspace.label }}</span>
            </a>
          </div>

          <ng-container *ngIf="currentWorkspace !== 'hub'">
            <div class="workspace-context">
              <span class="workspace-context-kicker">WORKSPACE</span>
              <strong>{{ workspaceLabel }}</strong>
              <a routerLink="/dashboard">← All workspaces</a>
            </div>
            <section class="menu-group" *ngFor="let group of visibleGroups">
              <div class="group-heading" *ngIf="group.label">{{ group.label }}</div>
              <div class="group-items">
                <ng-container *ngFor="let item of group.items">
                  <div class="nav-node">
                    <a class="menu-item" [routerLink]="item.url" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: !hasChildren(item) }">
                      <span class="nav-icon">{{ item.icon }}</span><span class="nav-label">{{ item.label }}</span>
                    </a>
                    <div class="child-items" *ngIf="hasChildren(item) && isItemActive(item)">
                      <a *ngFor="let child of item.children" class="child-item" [routerLink]="child.url" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                        <span class="child-dot"></span><span>{{ child.label }}</span>
                      </a>
                    </div>
                  </div>
                </ng-container>
              </div>
            </section>
          </ng-container>
        </nav>
      </aside>

      <main class="app-main">
        <header class="app-header">
          <div class="header-search-wrap">
            <label class="global-search"><span>⌕</span><input [(ngModel)]="query" placeholder="Search pages and modules"/><kbd>Ctrl K</kbd></label>
            <div class="header-context"><span class="context-dot"></span>{{ workspaceLabel }}</div>
            <a class="header-icon" routerLink="/inbox" title="Inbox">◌<span class="notification-dot"></span></a>
            <div class="admin-menu" (click)="$event.stopPropagation()">
              <button type="button" class="admin-account" [class.open]="adminMenuOpen" (click)="toggleAdminMenu()" aria-haspopup="menu" [attr.aria-expanded]="adminMenuOpen">
                <span class="admin-avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span>
                <span class="admin-copy"><b>{{ session?.name || 'Administrator' }}</b><small>{{ workspaceName }}</small></span>
                <span class="admin-chevron">{{ adminMenuOpen ? '⌃' : '⌄' }}</span>
              </button>
              <div class="admin-dropdown" *ngIf="adminMenuOpen" role="menu">
                <button type="button" class="admin-menu-item" (click)="openAdmin()" role="menuitem">◎ <span>Administrator account</span></button>
                <div class="admin-menu-divider"></div>
                <button type="button" class="admin-menu-item logout-menu-item" (click)="logout()" role="menuitem">⇥ <span>Logout</span></button>
              </div>
            </div>
          </div>
        </header>
        <section class="page" qaiAdminStaticI18n><router-outlet /></section>
      </main>
    </div>
  `
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly runtime = inject(TenantRuntimeService);
  readonly i18n = inject(AdminI18nService);
  private readonly router = inject(Router);
  readonly navigationTranslations = NAVIGATION_TRANSLATIONS;
  query = '';
  collapsed = false;
  adminMenuOpen = false;

  readonly workspaces: Workspace[] = [
    { id: 'leads', label: 'Leads', description: 'Discover, qualify and convert demand.', icon: '◎', url: '/discover' },
    { id: 'cms', label: 'CMS', description: 'Manage content, catalog and promotions.', icon: '▤', url: '/renova/content' },
    { id: 'finance', label: 'Finance', description: 'Billing and enterprise operations.', icon: '€', url: '/billing' },
    { id: 'admin', label: 'Admin', description: 'Platform, tenants, security and governance.', icon: '⚙', url: '/platform' }
  ];

  readonly workspaceGroups: Record<'leads' | 'cms' | 'finance' | 'admin', Group[]> = {
    leads: [
      { label: 'PIPELINE', items: [i('Prospect Discovery', '/discover', '⌕'), i('Leads', '/crm/leads', '▣'), i('CRM', '/crm/companies', '▧', [i('Companies', '/crm/companies', '▦'), i('Contacts', '/crm/contacts', '◎'), i('Opportunities', '/crm/opportunities', '◇')]), i('Sales Pipeline', '/pipeline', '▤'), i('Golden Pipeline', '/golden-pipeline', '◆')] },
      { label: 'ENGAGE', items: [i('Campaigns', '/campaigns', '↗'), i('Demos & Meetings', '/meetings', '◷'), i('Inbox', '/inbox', '▱'), i('Support Tickets', '/tickets', '□')] },
      { label: 'AUTOMATE', items: [i('Autonomous Acquisition', '/acquisition/autonomous', '✦'), i('Approval Queue', '/acquisition/approval-queue', '✓'), i('AI Agents', '/ai/agents', '✧'), i('Knowledge', '/knowledge', '▥', [i('Knowledge Gaps', '/knowledge/gaps', '◇')]), i('Workflows', '/workflows', '⌘'), i('Automations', '/automations', '✣')] },
      { label: 'INSIGHTS', items: [i('Analytics', '/analytics', '▥'), i('Integrations', '/integrations', '⊕')] }
    ],
    cms: [
      { label: 'CONTENT', items: [i('Renova Content', '/renova/content', '▤'), i('Product Catalog', '/catalog', '▦'), i('Promotions', '/renova/promotion', '✦')] },
      { label: 'PUBLIC EXPERIENCE', items: [i('Renova Portal', '/renova/portal', '↗')] }
    ],
    finance: [
      { label: 'FINANCE', items: [i('Billing & Invoices', '/billing', '▤'), i('Enterprise Operations', '/enterprise', '◉', [i('Orders', '/enterprise/orders', '□'), i('Inventory', '/enterprise/inventory', '▦'), i('Logistics', '/enterprise/logistics', '⇢'), i('Finance', '/enterprise/finance', '€')])] }
    ],
    admin: [
      { label: 'PLATFORM', items: [i('Platform Management', '/platform', '⚙'), i('Prepare Real Workspace', '/platform/prepare-workspace', '＋'), i('Packages', '/platform/packages', '▦')] },
      { label: 'TENANTS & ACCESS', items: [i('Modules', '/admin/modules', '▤'), i('Users & Roles', '/users', '◎'), i('Security', '/security', '◈'), i('White-label', '/white-label', '◐')] },
      { label: 'GOVERNANCE', items: [i('Industry Packs', '/industry-packs', '◇'), i('Audit', '/audit', '▤')] }
    ]
  };

  get session() { return this.auth.session(); }
  get workspaceName() { return this.session?.tenantSlug || this.session?.tenantId || 'Renova Workspace'; }
  get currentWorkspace(): 'hub' | 'leads' | 'cms' | 'finance' | 'admin' {
    const u = this.router.url.split('?')[0].split('#')[0];
    if (u === '/dashboard' || u === '/') return 'hub';
    if (u.startsWith('/renova/') || u.startsWith('/catalog')) return 'cms';
    if (u.startsWith('/billing') || u.startsWith('/enterprise')) return 'finance';
    if (u.startsWith('/platform') || u.startsWith('/admin/') || ['/users','/security','/white-label','/industry-packs','/audit'].includes(u)) return 'admin';
    return 'leads';
  }
  get workspaceLabel() { return this.currentWorkspace === 'hub' ? 'All workspaces' : this.workspaces.find(x => x.id === this.currentWorkspace)?.label || 'Leads'; }
  get visibleGroups() { return this.currentWorkspace === 'hub' ? [] : this.workspaceGroups[this.currentWorkspace]; }

  hasChildren(x: Item): boolean { return !!x.children?.length; }
  private currentUrl(): string { return this.router.url.split('?')[0].split('#')[0]; }
  isItemActive(x: Item): boolean { const u = this.currentUrl(); return u === x.url || u.startsWith(x.url + '/') || (x.children ?? []).some(c => u === c.url || u.startsWith(c.url + '/')); }
  toggleAdminMenu(): void { this.adminMenuOpen = !this.adminMenuOpen; }
  openAdmin(): void { this.adminMenuOpen = false; void this.router.navigateByUrl('/users'); }
  logout(): void { this.adminMenuOpen = false; this.auth.logout(); void this.router.navigate(['/login']); }
  @HostListener('document:click') closeAdminMenu(): void { this.adminMenuOpen = false; }
  initials(v: string): string { return v.split(/[-_\s]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'R'; }
  toggleSidebar(): void { this.collapsed = !this.collapsed; }
}
