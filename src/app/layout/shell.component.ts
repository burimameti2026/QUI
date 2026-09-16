import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { TenantRuntimeService } from '../core/tenant-runtime.service';
import { AdminI18nService } from '../core/admin-i18n.service';
import { AdminStaticI18nDirective } from '../core/admin-static-i18n.directive';

interface Item { label: string; url: string; icon: string }
const i = (label: string, url: string, icon: string): Item => ({ label, url, icon });

@Component({
  selector: 'qai-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, AdminStaticI18nDirective],
  styleUrls: ['./shell.component.css'],
  template: `
    <div class="shell" [class.collapsed]="collapsed">
      <aside class="sidebar">
        <div class="brand">
          <a class="brand-link" routerLink="/dashboard" aria-label="LeadsAI home">
            <span class="brand-logo">L</span>
            <span class="brand-copy"><strong>Leads<span>AI</span></strong><small>ENTERPRISE PLATFORM</small></span>
          </a>
          <button type="button" class="collapse-btn" (click)="toggleSidebar()" [attr.aria-label]="collapsed ? 'Expand navigation' : 'Collapse navigation'">{{ collapsed ? '→' : '←' }}</button>
        </div>

        <nav class="reference-menu" aria-label="Primary navigation">
          <label class="sidebar-search"><span>⌕</span><input [(ngModel)]="query" placeholder="Search"/><kbd>/</kbd></label>

          <section class="menu-group reference-group">
            <div class="group-heading">SALES OPERATIONS</div>
            <div class="group-items">
              <a class="menu-item" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}"><span class="nav-icon">⌂</span><span class="nav-label">Dashboard</span></a>
              <a class="menu-item" routerLink="/crm/leads" routerLinkActive="active"><span class="nav-icon">♟</span><span class="nav-label">Leads</span></a>
              <a class="menu-item" routerLink="/enterprise/orders" routerLinkActive="active"><span class="nav-icon">□</span><span class="nav-label">Orders</span></a>
              <a class="menu-item" routerLink="/crm/companies" routerLinkActive="active"><span class="nav-icon">♧</span><span class="nav-label">Customers</span></a>
              <a class="menu-item" routerLink="/inbox" routerLinkActive="active"><span class="nav-icon">▤</span><span class="nav-label">Messages</span><span class="nav-count">4</span></a>
            </div>
          </section>

          <section class="menu-group reference-group">
            <div class="group-heading">INSIGHTS &amp; MANAGEMENT</div>
          </section>

          <section class="menu-group reference-group">
            <div class="group-heading group-heading-row"><span>WORKSPACES</span><button type="button" class="group-add" aria-label="Add workspace">+</button></div>
            <div class="group-items workspace-items">
              <a class="menu-item" routerLink="/discover" routerLinkActive="active"><span class="workspace-dot sales"></span><span class="nav-label">Sales</span></a>
              <a class="menu-item" routerLink="/crm/companies" routerLinkActive="active"><span class="workspace-dot account"></span><span class="nav-label">Account Management</span></a>
              <a class="menu-item" routerLink="/tickets" routerLinkActive="active"><span class="workspace-dot support"></span><span class="nav-label">Support &amp; Success</span></a>
            </div>
          </section>

          <section class="menu-group reference-group">
            <div class="group-heading">PRODUCTIVITY</div>
            <div class="group-items">
              <a class="menu-item" routerLink="/tickets" routerLinkActive="active"><span class="nav-icon">⌁</span><span class="nav-label">Support</span></a>
              <a class="menu-item" routerLink="/tickets" routerLinkActive="active"><span class="nav-icon">▣</span><span class="nav-label">Feedback</span><span class="nav-count">1</span></a>
              <a class="menu-item" routerLink="/knowledge" routerLinkActive="active"><span class="nav-icon">?</span><span class="nav-label">Help Center</span></a>
              <a class="menu-item" routerLink="/users" routerLinkActive="active"><span class="nav-icon">⚙</span><span class="nav-label">Settings</span></a>
            </div>
          </section>
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
  query = '';
  collapsed = false;
  adminMenuOpen = false;

  get session() { return this.auth.session(); }
  get workspaceName() { return this.session?.tenantSlug || this.session?.tenantId || 'Renova Workspace'; }
  get workspaceLabel() { return 'All workspaces'; }
  toggleAdminMenu(): void { this.adminMenuOpen = !this.adminMenuOpen; }
  openAdmin(): void { this.adminMenuOpen = false; void this.router.navigateByUrl('/users'); }
  logout(): void { this.adminMenuOpen = false; this.auth.logout(); void this.router.navigate(['/login']); }
  @HostListener('document:click') closeAdminMenu(): void { this.adminMenuOpen = false; }
  initials(v: string): string { return v.split(/[-_\s]+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase() || 'R'; }
  toggleSidebar(): void { this.collapsed = !this.collapsed; }
}
