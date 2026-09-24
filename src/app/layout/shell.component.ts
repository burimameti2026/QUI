import { CommonModule } from "@angular/common";
import { Component, HostListener, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from "@angular/router";
import { AuthService } from "../core/auth.service";
import { TenantRuntimeService } from "../core/tenant-runtime.service";
import { AdminI18nService } from "../core/admin-i18n.service";
import { NAVIGATION_TRANSLATIONS } from "../core/navigation-translations";
import { AdminStaticI18nDirective } from "../core/admin-static-i18n.directive";
interface Item {
  label: string;
  url: string;
  icon: string;
  module?: string;
  permission?: string;
  children?: Item[];
}
interface Group {
  label: string;
  items: Item[];
}
const i = (
  label: string,
  url: string,
  icon: string,
  children?: Item[],
): Item => ({ label, url, icon, children });
@Component({
  selector: "qai-shell",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AdminStaticI18nDirective,
  ],
  styleUrls: ["./shell.component.css"],
  template: ` <div
    class="shell"
  >
    <aside class="sidebar">
      <div class="brand">
        <a class="brand-link" routerLink="/dashboard" aria-label="LeadsAI home"
          ><span class="brand-logo">L</span
          ><span class="brand-copy"
            ><strong>FindLeads<span> AI</span></strong
            ></span
          ></a
>
      </div>
      <nav class="reference-menu" aria-label="Primary navigation">
        <section
          class="menu-group reference-group"
          *ngFor="let group of navigationGroups"
          [class.hidden-group]="!groupAllowed(group)"
        >
          <div class="group-heading" *ngIf="group.label">
            {{ navLabel(group.label) }}
          </div>
          <div class="group-items">
            <ng-container *ngFor="let item of group.items"
              ><div class="nav-node" *ngIf="allowed(item)">
                <a
                  class="menu-item"
                  [routerLink]="item.url"
                  routerLinkActive="active"
                  [routerLinkActiveOptions]="{ exact: !hasChildren(item) }"
                  (click)="toggleItem(item)"
                  ><span class="nav-icon">{{ item.icon }}</span
                  ><span class="nav-label">{{ navLabel(item.label) }}</span
                  ><span class="nav-chevron" *ngIf="hasChildren(item)">{{
                    isExpanded(item) ? "⌃" : "⌄"
                  }}</span></a
                >
                <div
                  class="child-items"
                  *ngIf="hasChildren(item) && isExpanded(item)"
                >
                  <a
                    *ngFor="let child of item.children"
                    class="child-item"
                    [routerLink]="child.url"
                    routerLinkActive="active"
                    [routerLinkActiveOptions]="{ exact: true }"
                    ><span class="child-dot"></span
                    ><span>{{ navLabel(child.label) }}</span></a
                  >
                </div>
              </div></ng-container
            >
          </div>
        </section>
      </nav>
    </aside>
    <main class="app-main">
      <header class="app-header">
        <div class="header-search-wrap">
          <label class="global-search"
            ><span>⌕</span
            ><input
              [(ngModel)]="query"
              placeholder="Search leads, contacts, invoices..."
            /><kbd>Ctrl K</kbd></label
          >
          <div class="header-tools">
            <a class="header-icon notification" routerLink="/inbox" aria-label="Notifications">
              ◌<span class="notification-dot" aria-hidden="true"></span>
            </a>
            <button type="button" class="header-help" aria-label="Help">?</button>
          </div>
          <div class="admin-menu" (click)="$event.stopPropagation()">
            <button
              type="button"
              class="admin-account"
              [class.open]="adminMenuOpen"
              (click)="toggleAdminMenu()"
            >
              <span class="admin-avatar">{{
                initials(session?.name || session?.tenantSlug || "BA")
              }}</span><span class="admin-chevron">{{
                adminMenuOpen ? "⌃" : "⌄"
              }}</span>
            </button>
            <div class="admin-dropdown" *ngIf="adminMenuOpen">
              <button
                type="button"
                class="admin-menu-item"
                (click)="openAdmin()"
              >
                ◎ <span>Administrator account</span>
              </button>
              <div class="admin-menu-divider"></div>
              <button
                type="button"
                class="admin-menu-item logout-menu-item"
                (click)="logout()"
              >
                ⇥ <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <div class="app-content" qaiAdminStaticI18n><router-outlet /></div>
    </main>
  </div>`,
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly runtime = inject(TenantRuntimeService);
  readonly i18n = inject(AdminI18nService);
  private readonly router = inject(Router);
  readonly navigationTranslations = NAVIGATION_TRANSLATIONS;
  query = "";
  adminMenuOpen = false;
  private readonly expandedItems = new Set<string>();
  readonly navigationGroups: Group[] = [
    { label: "COMMAND CENTER", items: [
      i("Dashboard", "/dashboard", "⌂"),
      i("KPIs", "/kpis", "▥"),
    ]},
    { label: "SALES", items: [
      i("Prospects", "/discover", "⌕"),
      i("Customers", "/crm/companies", "▦"),
      i("Contacts", "/crm/contacts", "◎"),
      i("Leads", "/crm/leads", "▣"),
      i("Pipeline", "/golden-pipeline", "◆"),
      i("Campaigns", "/campaigns", "✦"),
      i("Replies & Inbox", "/inbox", "▱"),
      i("Demos & Meetings", "/meetings", "◷"),
    ]},
    { label: "OPERATIONS", items: [
      i("Orders", "/enterprise/ordering", "＋"),
      i("Inventory", "/enterprise/inventory", "▥"),
      i("Warehouse", "/enterprise/warehousing", "□"),
      i("Shipments & Logistics", "/enterprise/logistics", "↗"),
      i("Enterprise Operations", "/enterprise", "◉"),
    ]},
    { label: "AI & AUTOMATION", items: [
      i("AI Agents", "/ai/agents", "✦"),
      i("Workflows", "/workflows", "⌁"),
      i("Automations", "/automations", "✣"),
      i("Acquisition", "/acquisition", "↗", [
        i("ICP & Audience", "/acquisition/icp", "◎"),
        i("Prospecting", "/discover", "⌕"),
        i("Qualification & Score", "/acquisition/qualification", "◇"),
        i("Approval Queue", "/acquisition/approval-queue", "◌"),
      ]),
      i("Knowledge", "/knowledge", "▥"),
    ]},
    { label: "ANALYTICS", items: [
      i("Analytics", "/analytics", "▧"),
      i("Evaluations", "/evaluations", "✓"),
      i("Integrations", "/integrations", "⊕"),
    ]},
    { label: "CATALOG", items: [
      i("Packages & Offers", "/packages/new", "✦"),
      i("Product Catalog", "/catalog", "▦"),
    ]},
    { label: "FINANCE", items: [
      i("Billing & Invoices", "/billing", "€"),
      i("Finance", "/enterprise/finance", "◫"),
    ]},
    { label: "ADMINISTRATION", items: [
      i("Admin Workspace", "/platform", "⚙", undefined),
      i("Users & Roles", "/users", "◎"),
      i("Security", "/security", "◇"),
      i("White Label", "/white-label", "□"),
      i("Industry Packs", "/industry-packs", "▤"),
      i("Audit & Governance", "/audit", "▤"),
      i("Clients & Licenses", "/admin/modules", "▦"),
    ]},
  ];
  get session() {
    return this.auth.session();
  }
  get isHub() {
    return this.router.url === "/dashboard" || this.router.url === "/";
  }
  navLabel(k: string) {
    return this.navigationTranslations[k]?.[this.i18n.language()] ?? k;
  }
  groupAllowed(group: Group) {
    return group.items.some((item) => this.allowed(item) || (item.children ?? []).some((child) => this.allowed(child)));
  }
  allowed(x: Item) {
    return (
      (!x.permission || this.auth.hasPermission(x.permission)) &&
      (!x.module || this.auth.hasModule(x.module))
    );
  }
  hasChildren(x: Item) {
    return !!x.children?.length;
  }
  isExpanded(x: Item) {
    return this.expandedItems.has(x.url);
  }
  toggleItem(x: Item) {
    if (!this.hasChildren(x)) return;
    if (this.expandedItems.has(x.url)) {
      this.expandedItems.delete(x.url);
    } else {
      this.expandedItems.add(x.url);
    }
  }
  private currentUrl() {
    return this.router.url.split("?")[0].split("#")[0];
  }
  isItemActive(x: Item) {
    const u = this.currentUrl();
    return (
      u === x.url ||
      u.startsWith(x.url + "/") ||
      (x.children ?? []).some((c) => u === c.url || u.startsWith(c.url + "/"))
    );
  }
  toggleAdminMenu() {
    this.adminMenuOpen = !this.adminMenuOpen;
  }
  openAdmin() {
    this.adminMenuOpen = false;
    void this.router.navigateByUrl("/users");
  }
  logout() {
    this.adminMenuOpen = false;
    this.auth.logout();
    void this.router.navigate(["/login"]);
  }
  @HostListener("document:click") closeAdminMenu() {
    this.adminMenuOpen = false;
  }
  initials(v: string) {
    return (
      v
        .split(/[-_\s]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((x) => x[0])
        .join("")
        .toUpperCase() || "A"
    );
  }
  setLanguage(l: string) {
    this.i18n.setLanguage(l as any);
  }
}
