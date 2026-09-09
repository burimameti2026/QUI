import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { RenovaPortalPage as BaseRenovaPortalPage } from './renova-portal.page';

interface RenovaSiteContent {
  version: number;
  status: string;
  updatedAtUtc: string;
  companyIntro: string;
  solutions: Array<{ number: string; title: string; description: string }>;
  kpis: Array<{ value: string; title: string; description: string }>;
  stories: Array<{ title: string; description: string; location: string; url: string; imageUrl: string }>;
  events: Array<{ title: string; description: string; url: string }>;
  locations: Array<{ name: string; type: string; address: string; url: string }>;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renova-portal.page.html',
  styleUrl: './renova-portal.page.css'
})
export class RenovaPortalDataPage extends BaseRenovaPortalPage implements OnInit, OnDestroy {
  private readonly apiClient: ApiService;
  private readonly routeClient: ActivatedRoute;

  constructor(api: ApiService, route: ActivatedRoute) {
    super(api, route);
    this.apiClient = api;
    this.routeClient = route;
  }

  override ngOnInit(): void {
    const requested = this.routeClient.snapshot.queryParamMap.get('language') as any;
    if (requested && this.languages.includes(requested)) this.language = requested;
    this.startHero();
    this.loadSiteContent();
    this.loadProducts();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  private loadSiteContent(): void {
    this.apiClient.get<RenovaSiteContent>(`public/portal/${this.tenantId}/site-content?tenant=renova`).subscribe({
      next: content => {
        if (!content) return;
        const solutions = content.solutions.map(x => [x.number, x.title, x.description]);
        const kpis = content.kpis.map(x => [x.value, x.title, x.description]);
        const stories = content.stories.map(x => [x.title, x.description, x.location, x.url, x.imageUrl]);
        const events = content.events.map(x => [x.title, x.description, x.url]);
        const locations = content.locations.map(x => [x.name, x.type, x.address, x.url]);
        Object.assign(this as any, { solutions, kpis, stories, events, locations });
      },
      error: err => { this.error = err?.error?.detail || 'Unable to load Renova site content.'; }
    });
  }

  private loadProducts(): void {
    this.loading = true;
    this.error = '';
    const language = encodeURIComponent(this.language.toUpperCase());
    this.apiClient.get<any[]>(`public/portal/${this.tenantId}/products?tenant=renova&language=${language}`).subscribe({
      next: products => {
        this.products = products || [];
        const slug = this.routeClient.snapshot.queryParamMap.get('product');
        this.selected = slug ? this.products.find(x => x.slug === slug) || this.products[0] : this.products[0];
        this.loading = false;
        if (this.selected) this.loadDetailWithTenant(this.selected.slug);
      },
      error: err => {
        this.loading = false;
        this.error = err?.error?.detail || 'Unable to load the Renova catalog.';
      }
    });
  }

  private loadDetailWithTenant(slug: string): void {
    const language = encodeURIComponent(this.language.toUpperCase());
    this.apiClient.get<any>(`public/portal/${this.tenantId}/products/${encodeURIComponent(slug)}?tenant=renova&language=${language}`).subscribe({
      next: product => this.selected = product,
      error: err => this.error = err?.error?.detail || 'Unable to load product details.'
    });
  }

  override setLanguage(language: any): void {
    this.language = language;
    this.inquirySent = false;
    this.updateUrl();
    this.loadProducts();
  }

  override select(product: any): void {
    this.selected = product;
    this.inquirySent = false;
    this.loadDetailWithTenant(product.slug);
    this.updateUrl();
    document.getElementById('product-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  override submitInquiry(): void {
    if (!this.selected || !this.inquiry.name.trim() || !this.inquiry.email.trim()) return;
    this.inquiryBusy = true;
    this.apiClient.post(`public/portal/${this.tenantId}/inquiries?tenant=renova`, {
      catalogProductId: this.selected.id,
      ...this.inquiry,
      language: this.language.toUpperCase()
    }).subscribe({
      next: () => {
        this.inquiryBusy = false;
        this.inquirySent = true;
        this.inquiry = { name: '', company: '', email: '', phone: '', countryCode: '', message: '' };
      },
      error: err => {
        this.inquiryBusy = false;
        this.error = err?.error?.detail || 'Your request could not be submitted.';
      }
    });
  }
}
