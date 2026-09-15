import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TenantRuntimeService } from '../core/tenant-runtime.service';
import { AdminI18nService } from '../core/admin-i18n.service';
import { AdminStaticI18nDirective } from '../core/admin-static-i18n.directive';
import { NAVIGATION_TRANSLATIONS } from '../core/navigation-translations';

interface Item { label: string; url: string; icon: string; module?: string; permission?: string }
interface Group { label: string; items: Item[] }
const i = (label: string, url: string, icon: string): Item => ({ label, url, icon });

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
        <nav class="reference-menu">
          <section class="menu-group" *ngFor="let group of navigationGroups">
            <div class="group-heading">{{ navLabel(group.label) }}</div>
            <div class="group-items">
              <a *ngFor="let item of group.items" class="menu-item" [routerLink]="item.url" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ navLabel(item.label) }}</span>
              </a>
            </div>
          </section>
        </nav>
      </aside>
      <main>
        <header class="app-header">
          <div class="header-search-wrap">
            <label class="global-search"><span>⌕</span><input [(ngModel)]="query" [placeholder]="i18n.t('Search pages and modules')"/><kbd>Ctrl K</kbd></label>
            <a class="portal-link" routerLink="/renova/portal">↗ {{ i18n.t('Public Renova portal') }}</a>
            <div class="admin-menu" (click)="$event.stopPropagation()">
              <button type="button" class="admin-account" [class.open]="adminMenuOpen" (click)="toggleAdminMenu()" aria-haspopup="menu" [attr.aria-expanded]="adminMenuOpen">
                <span class="admin-avatar">{{ initials(session?.name || session?.tenantSlug || 'BA') }}</span>
                <span class="admin-copy"><b>{{ session?.name || 'Administrator' }}</b><small>{{ workspaceName }}</small></span>
                <span class="admin-chevron">{{ adminMenuOpen ? '⌃' : '⌄' }}</span>
              </button>
              <div class="admin-dropdown" *ngIf="adminMenuOpen" role="menu">
                <button type="button" class="admin-menu-item" (click)="openAdmin()" role="menuitem"><span class="admin-menu-icon">◎</span><span>{{ i18n.t('Administrator account') }}</span></button>
                <div class="admin-menu-divider"></div>
                <button type="button" class="admin-menu-item logout-menu-item" (click)="logout()" role="menuitem"><span class="admin-menu-icon">⇥</span><span>{{ navLabel('Logout') }}</span></button>
              </div>
            </div>
          </div>
        </header>
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
  adminMenuOpen = false;

  readonly navigationGroups: Group[] = [
    { label: 'COMMAND CENTER', items: [i('Dashboard', '/dashboard', '⌂')] },
    { label: 'LEADS & ACQUISITION', items: [
      i('Leads', '/crm/leads', '▣'),
      i('CRM', '/crm/companies', '▧'),
      i('Prospect Discovery', '/discover', '⌕'),
      i('Autonomous Acquisition', '/acquisition/autonomous', '✦'),
      i('Campaigns', '/campaigns', '↗'),
      i('Qualified Leads', '/crm/leads', '◆'),
      i('Sales Pipelines', '/pipeline', '▤'),
      i('Golden Pipeline', '/golden-pipeline', '◇'),
      i('Demos & Meetings', '/meetings', '◷'),
      i('Replies & Inbox', '/inbox', '▱')
    ] },
    { label: 'CONTENT & KNOWLEDGE', items: [
      i('Renova Content', '/renova/content', '▤'),
      i('Knowledge', '/knowledge', '▥'),
      i('Product Catalog', '/catalog', '▦'),
      i('Promotion Automation', '/renova/promotion', '✦')
    ] },
    { label: 'ORDERING & DISPATCH', items: [
      i('Enterprise Operations', '/enterprise', '◉'),
      i('Invoices', '/billing', '▤')
    ] },
    { label: 'FINANCE', items: [i('Finance', '/enterprise/finance', '€')] },
    { label: 'AUTOMATION & IMPROVE', items: [
      i('Reports', '/analytics', '▧'),
      i('Automation', '/automations', '✣')
    ] },
    { label: 'ADMINISTRATION', items: [
      i('Platform Management', '/platform', '⚙'),
      i('Prepare Real Workspace', '/platform/prepare-workspace', '＋'),
      i('Users & Roles', '/users', '◎'),
      i('Audit & Governance', '/audit', '▤')
    ] }
  ];

  get session() { return this.auth.session(); }
  get workspaceName() { return this.session?.tenantSlug || this.session?.tenantId || 'Renova Workspace'; }
  navLabel(key: string): string { return this.navigationTranslations[key]?.[this.i18n.language()] ?? key; }
  allowed(x: Item): boolean { return (!x.permission || this.auth.hasPermission(x.permission)) && (!x.module || this.auth.hasModule(x.module)); }
  toggleAdminMenu(): void { this.adminMenuOpen = !this.adminMenuOpen; }
  openAdmin(): void { this.adminMenuOpen = false; void this.router.navigateByUrl('/users'); }
  logout(): void { this.adminMenuOpen = false; this.auth.logout(); void this.router.navigate(['/login']); }
  @HostListener('document:click') closeAdminMenu(): void { this.adminMenuOpen = false; }
  initials(v: string): string { return v.split(/[-_\s]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'R'; }
  toggleSidebar(): void { this.collapsed = !this.collapsed; }
}
