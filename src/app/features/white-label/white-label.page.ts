import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../core/api.service";
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
        <h3>Brand identity</h3>
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
  brand: any = {
    productName: "QualifyAI",
    supportEmail: "support@company.com",
    primaryColor: "#2563eb",
    accentColor: "#0f172a",
  };
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.get<any>("white-label/branding").subscribe((r) => {
      if (r) this.brand = r;
    });
  }
  saveBrand() {
    this.api.put<any>("white-label/branding", this.brand).subscribe({
      next: (r) => {
        this.brand = r;
        alert("Branding saved.");
      },
      error: () => alert("Branding endpoint unavailable."),
    });
  }
}
