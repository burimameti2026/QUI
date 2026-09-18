import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrandThemeService } from "../../core/brand-theme.service";
import { PageHeader } from "../../shared/ui";
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  styleUrl: './white-label.page.css',
  template: `<qai-page-header
      title="White Label"
      subtitle="Customize product identity, widget branding and customer-facing domains."
    ></qai-page-header>
    <section class="brand-metrics">
      <article><span class="metric-icon violet">A</span><div><small>Product identity</small><strong>{{ brand.productName || 'Unnamed' }}</strong><em>Customer-facing brand</em></div></article>
      <article><span class="metric-icon green">✓</span><div><small>Support channel</small><strong>{{ brand.supportEmail ? 'Configured' : 'Missing' }}</strong><em>{{ brand.supportEmail || 'Add support email' }}</em></div></article>
      <article><span class="metric-icon orange">●</span><div><small>Primary color</small><strong>{{ brand.primaryColor | uppercase }}</strong><em>Brand theme token</em></div></article>
      <article><span class="metric-icon dark">◉</span><div><small>Preview</small><strong>Live</strong><em>Widget updates from branding</em></div></article>
    </section>
    <div class="settings-grid">
      <section class="panel form">
        <h3>Application branding</h3>
        <label>Product name<input [(ngModel)]="brand.productName" /></label
        ><label>Support email<input [(ngModel)]="brand.supportEmail" /></label>
        <div class="form2">
          <label
            >Primary color<input
              type="color"
              [(ngModel)]="brand.primaryColor" /></label
          ><label
            >Accent color<input type="color" [(ngModel)]="brand.accentColor"
          /></label>
        </div>
        <p class="theme-help">Primary and accent define the core brand identity. Component colors below control the reusable application surfaces, so pages consume the same configured values instead of hardcoded brand colors.</p>
        <div class="theme-section">
          <div class="theme-section-head"><strong>Buttons</strong><span>Header actions and primary actions</span></div>
          <div class="color-grid">
            <label class="color-setting">Primary button background<input type="color" [(ngModel)]="brand.buttonPrimaryColor" /></label>
            <label class="color-setting">Secondary button background<input type="color" [(ngModel)]="brand.buttonSecondaryColor" /></label>
          </div>
        </div>
        <div class="theme-section">
          <div class="theme-section-head"><strong>Card headers</strong><span>Workspace, prospect and configuration card headers</span></div>
          <label class="color-setting">Card header background<input type="color" [(ngModel)]="brand.cardHeaderColor" /></label>
        </div>
        <div class="theme-section">
          <div class="theme-section-head"><strong>Prospect Discovery KPIs</strong><span>Configure KPI 1–6 independently</span></div>
          <div class="color-grid kpi-colors">
            <label class="color-setting">KPI 1<input type="color" [(ngModel)]="brand.kpi1Color" /></label>
            <label class="color-setting">KPI 2<input type="color" [(ngModel)]="brand.kpi2Color" /></label>
            <label class="color-setting">KPI 3<input type="color" [(ngModel)]="brand.kpi3Color" /></label>
            <label class="color-setting">KPI 4<input type="color" [(ngModel)]="brand.kpi4Color" /></label>
            <label class="color-setting">KPI 5<input type="color" [(ngModel)]="brand.kpi5Color" /></label>
            <label class="color-setting">KPI 6<input type="color" [(ngModel)]="brand.kpi6Color" /></label>
          </div>
        </div>
        <div class="component-preview">
          <div class="component-preview-title">Live component preview</div>
          <div class="preview-row">
            <button class="preview-primary" type="button" [style.background]="brand.buttonPrimaryColor">Primary</button>
            <button class="preview-secondary" type="button" [style.background]="brand.buttonSecondaryColor">Secondary</button>
          </div>
          <div class="preview-card">
            <header [style.background]="brand.cardHeaderColor"><span>Card header</span><b>Configured</b></header>
            <div class="preview-kpis">
              <i *ngFor="let color of [brand.kpi1Color,brand.kpi2Color,brand.kpi3Color,brand.kpi4Color,brand.kpi5Color,brand.kpi6Color]" [style.background]="color"></i>
            </div>
          </div>
        </div>
        <button class="primary" (click)="saveBrand()">Save branding</button>
      </section>
      <section class="panel">
        <h3>Widget preview</h3>
        <div class="widget-preview" [style.--brand]="brand.primaryColor">
          <header>{{ brand.productName || "QualifyAI" }}</header>
          <p>Hi! How can I help with your request today?</p>
          <button type="button" disabled title="Preview only">
            Start conversation
          </button>
        </div>
      </section>
    </div>`,
})
export class WhiteLabelPage implements OnInit {
  brand = this.theme.defaults();
  constructor(private theme: BrandThemeService) {}
  ngOnInit() {
    this.theme.load().subscribe(r => this.brand = { ...this.brand, ...r });
  }
  saveBrand() {
    this.theme.save(this.brand).subscribe({
      next: (r) => {
        this.brand = r;
        alert("Branding saved.");
      },
      error: () => alert("Branding endpoint unavailable."),
    });
  }
}
