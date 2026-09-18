import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrandThemeService } from "../../core/brand-theme.service";
import { PageHeader } from "../../shared/ui";

type LayoutSectionKind = "header" | "kpis" | "cards" | "grid" | "buttons" | "text";

interface LayoutItem {
  id: string;
  label: string;
  value?: string;
  template: string;
  enabled: boolean;
}

interface LayoutSection {
  id: string;
  kind: LayoutSectionKind;
  label: string;
  description: string;
  expanded: boolean;
  columns: 1 | 2 | 3 | 4;
  items: LayoutItem[];
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  styleUrl: "./white-label.page.css",
  template: `
    <qai-page-header
      title="White Label"
      subtitle="Configure the page structure, component templates and customer-facing brand without putting visual styling into page data."
    ></qai-page-header>

    <section class="builder-shell">
      <div class="builder-intro">
        <div>
          <span class="eyebrow">PAGE BUILDER</span>
          <h2>Configure the experience section by section</h2>
          <p>Expand one section, configure its content and choose a component template. Collapse it and continue to the next section. The renderer owns the visual design; this editor owns the values and structure.</p>
        </div>
        <div class="builder-actions">
          <button type="button" class="secondary" (click)="resetLayout()">Reset layout</button>
          <button type="button" class="primary" (click)="saveLayout()">Save page configuration</button>
        </div>
      </div>

      <div class="builder-grid">
        <aside class="section-list">
          <div class="list-title">Page sections</div>
          <button
            type="button"
            class="section-nav"
            *ngFor="let section of layoutSections; let i = index"
            [class.active]="section.expanded"
            (click)="openSection(section.id)"
          >
            <span class="section-number">{{ (i + 1).toString().padStart(2, "0") }}</span>
            <span><strong>{{ section.label }}</strong><small>{{ section.items.length }} configurable items</small></span>
            <span class="chevron">{{ section.expanded ? "⌄" : "›" }}</span>
          </button>
        </aside>

        <main class="section-editor">
          <article class="editor-section" *ngFor="let section of layoutSections">
            <button type="button" class="editor-head" (click)="toggleSection(section)">
              <span class="drag-handle">⋮⋮</span>
              <span class="editor-title">
                <small>{{ section.kind | uppercase }} SECTION</small>
                <strong>{{ section.label }}</strong>
                <em>{{ section.description }}</em>
              </span>
              <span class="head-meta">{{ section.items.length }} items</span>
              <span class="arrow">{{ section.expanded ? "⌃" : "⌄" }}</span>
            </button>

            <div class="editor-body" *ngIf="section.expanded">
              <div class="config-row top-row">
                <label>
                  Section label
                  <input [(ngModel)]="section.label" />
                </label>
                <label>
                  Columns
                  <select [(ngModel)]="section.columns">
                    <option [ngValue]="1">1 column</option>
                    <option [ngValue]="2">2 columns</option>
                    <option [ngValue]="3">3 columns</option>
                    <option [ngValue]="4">4 columns</option>
                  </select>
                </label>
              </div>

              <div class="component-heading">
                <div>
                  <strong>{{ section.kind === "kpis" ? "KPI configuration" : section.kind === "cards" ? "Card configuration" : section.kind === "buttons" ? "Button configuration" : "Component configuration" }}</strong>
                  <span>Choose a template for each item. Values remain data; templates remain reusable code.</span>
                </div>
                <button type="button" class="quiet" (click)="addItem(section)">+ Add item</button>
              </div>

              <div class="item-card" *ngFor="let item of section.items; let itemIndex = index">
                <div class="item-top">
                  <div class="item-id"><span>{{ itemIndex + 1 }}</span><strong>{{ item.label || "Untitled item" }}</strong></div>
                  <label class="switch"><input type="checkbox" [(ngModel)]="item.enabled" /><i></i> Enabled</label>
                </div>

                <div class="item-fields">
                  <label>Label<input [(ngModel)]="item.label" placeholder="Component label" /></label>
                  <label *ngIf="section.kind !== 'text'">Value / content<input [(ngModel)]="item.value" placeholder="Value or binding key" /></label>
                </div>

                <div class="template-area">
                  <div class="template-label">Templates</div>
                  <div class="template-options">
                    <button
                      type="button"
                      *ngFor="let template of templatesFor(section.kind)"
                      [class.selected]="item.template === template.id"
                      (click)="item.template = template.id"
                    >
                      <span class="template-preview" [attr.data-type]="template.id">{{ template.mark }}</span>
                      <span><strong>{{ template.label }}</strong><small>{{ template.description }}</small></span>
                      <b *ngIf="item.template === template.id">✓</b>
                    </button>
                  </div>
                </div>

                <div class="item-footer">
                  <span>Template ID: <code>{{ item.template }}</code></span>
                  <button type="button" class="remove" (click)="removeItem(section, itemIndex)">Remove</button>
                </div>
              </div>
            </div>
          </article>
        </main>
      </div>
    </section>

    <section class="brand-section">
      <div class="brand-heading">
        <div><span class="eyebrow">BRAND TOKENS</span><h2>Visual identity</h2><p>Brand tokens are separate from page configuration. Components consume these tokens through the design system.</p></div>
        <button type="button" class="primary" (click)="saveBrand()">Save branding</button>
      </div>
      <div class="brand-grid">
        <label>Product name<input [(ngModel)]="brand.productName" /></label>
        <label>Support email<input [(ngModel)]="brand.supportEmail" /></label>
        <label>Primary color<input type="color" [(ngModel)]="brand.primaryColor" /></label>
        <label>Accent color<input type="color" [(ngModel)]="brand.accentColor" /></label>
        <label>Primary button<input type="color" [(ngModel)]="brand.buttonPrimaryColor" /></label>
        <label>Secondary button<input type="color" [(ngModel)]="brand.buttonSecondaryColor" /></label>
      </div>
    </section>
  `,
})
export class WhiteLabelPage implements OnInit {
  brand = this.theme.defaults();

  readonly templates: Record<LayoutSectionKind, { id: string; label: string; description: string; mark: string }[]> = {
    header: [
      { id: "header-01", label: "Enterprise header", description: "Title, subtitle and actions", mark: "H" },
      { id: "header-02", label: "Compact header", description: "Condensed title treatment", mark: "H2" },
    ],
    kpis: [
      { id: "kpi-01", label: "KPI / Standard", description: "Value, label and supporting text", mark: "123" },
      { id: "kpi-02", label: "KPI / Highlight", description: "Emphasis for a key metric", mark: "★" },
      { id: "kpi-03", label: "KPI / Compact", description: "Dense operational metric", mark: "▦" },
      { id: "kpi-04", label: "KPI / Trend", description: "Metric with secondary signal", mark: "↗" },
    ],
    cards: [
      { id: "card-01", label: "Card / Standard", description: "Title, body and action", mark: "□" },
      { id: "card-02", label: "Card / Split", description: "Primary value and details", mark: "▣" },
      { id: "card-03", label: "Card / Highlight", description: "Emphasized operational card", mark: "✦" },
      { id: "card-04", label: "Card / Action", description: "Action-focused card", mark: "→" },
    ],
    grid: [
      { id: "grid-01", label: "Grid / Equal", description: "Equal responsive columns", mark: "▦" },
      { id: "grid-02", label: "Grid / Sidebar", description: "Main content with side panel", mark: "▤" },
    ],
    buttons: [
      { id: "button-01", label: "Button / Primary", description: "Primary action", mark: "→" },
      { id: "button-02", label: "Button / Secondary", description: "Secondary action", mark: "＋" },
      { id: "button-03", label: "Button / Quiet", description: "Low emphasis action", mark: "⋯" },
      { id: "button-04", label: "Button / Icon", description: "Compact icon action", mark: "↗" },
    ],
    text: [
      { id: "text-01", label: "Text / Standard", description: "Heading and supporting copy", mark: "T" },
      { id: "text-02", label: "Text / Callout", description: "Highlighted explanatory copy", mark: "!" },
    ],
  };

  layoutSections: LayoutSection[] = [
    {
      id: "header",
      kind: "header",
      label: "Header",
      description: "The common page header shared by every page.",
      expanded: true,
      columns: 1,
      items: [
        { id: "header-main", label: "Page header", value: "Dashboard", template: "header-01", enabled: true },
      ],
    },
    {
      id: "kpis",
      kind: "kpis",
      label: "KPIs",
      description: "Operational metrics. Each KPI can select its own reusable template.",
      expanded: false,
      columns: 4,
      items: [
        { id: "kpi-1", label: "Product catalog", value: "products.count", template: "kpi-01", enabled: true },
        { id: "kpi-2", label: "Promotion plans", value: "plans.active", template: "kpi-02", enabled: true },
        { id: "kpi-3", label: "Autonomous agents", value: "agents.active", template: "kpi-03", enabled: true },
        { id: "kpi-4", label: "Prospects discovered", value: "acquisition.discovered", template: "kpi-04", enabled: true },
      ],
    },
    {
      id: "cards",
      kind: "cards",
      label: "Cards",
      description: "Operational cards with their own title, content and actions.",
      expanded: false,
      columns: 2,
      items: [
        { id: "card-1", label: "Acquisition engine", value: "acquisition.latestRun", template: "card-03", enabled: true },
        { id: "card-2", label: "Active outreach", value: "campaigns.active", template: "card-01", enabled: true },
      ],
    },
    {
      id: "grid",
      kind: "grid",
      label: "Grids",
      description: "Layout container controlling how child components are arranged.",
      expanded: false,
      columns: 2,
      items: [
        { id: "grid-1", label: "Operations grid", value: "operations", template: "grid-01", enabled: true },
      ],
    },
    {
      id: "buttons",
      kind: "buttons",
      label: "Buttons",
      description: "Semantic actions available to the page and components.",
      expanded: false,
      columns: 2,
      items: [
        { id: "button-1", label: "Open promotion plan", value: "/renova/promotion", template: "button-01", enabled: true },
        { id: "button-2", label: "Refresh data", value: "refresh", template: "button-03", enabled: true },
      ],
    },
    {
      id: "text",
      kind: "text",
      label: "Text & content",
      description: "Supporting copy that can be bound to workspace data.",
      expanded: false,
      columns: 1,
      items: [
        { id: "text-1", label: "Operating picture", value: "workspace.operatingPicture", template: "text-01", enabled: true },
      ],
    },
  ];

  constructor(private theme: BrandThemeService) {}

  ngOnInit() {
    this.theme.load().subscribe(r => this.brand = { ...this.brand, ...r });
    this.loadLayout();
  }

  openSection(id: string) {
    this.layoutSections.forEach(section => section.expanded = section.id === id);
  }

  toggleSection(section: LayoutSection) {
    section.expanded = !section.expanded;
  }

  templatesFor(kind: LayoutSectionKind) {
    return this.templates[kind];
  }

  addItem(section: LayoutSection) {
    const templates = this.templatesFor(section.kind);
    const first = templates[0];
    section.items.push({
      id: `${section.id}-${Date.now()}`,
      label: `New ${section.kind} item`,
      value: "",
      template: first?.id || "text-01",
      enabled: true,
    });
  }

  removeItem(section: LayoutSection, index: number) {
    section.items.splice(index, 1);
  }

  saveLayout() {
    localStorage.setItem("qai-white-label-page-layout", JSON.stringify(this.layoutSections));
  }

  loadLayout() {
    const raw = localStorage.getItem("qai-white-label-page-layout");
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as LayoutSection[];
      if (Array.isArray(saved) && saved.length) this.layoutSections = saved;
    } catch {
      // Keep the safe default configuration.
    }
  }

  resetLayout() {
    localStorage.removeItem("qai-white-label-page-layout");
    window.location.reload();
  }

  saveBrand() {
    this.theme.save(this.brand).subscribe({
      next: r => {
        this.brand = r;
        alert("Branding saved.");
      },
      error: () => alert("Branding endpoint unavailable."),
    });
  }
}
