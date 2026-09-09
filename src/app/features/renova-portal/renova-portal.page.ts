import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';

const RENOVA_TENANT_ID = '2f0c6e75-4df1-4bd5-bb49-6ef8ea0e3f1a';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renova-portal.page.html',
  styleUrl: './renova-portal.page.css'
})
export class RenovaPortalPage implements OnInit {
  tenantId = RENOVA_TENANT_ID;
  language = 'en';
  products: any[] = [];
  selected: any = null;
  loading = true;
  error = '';
  inquiry = { name: '', company: '', email: '', phone: '', countryCode: '', message: '' };
  inquirySent = false;
  inquiryBusy = false;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.language = this.route.snapshot.queryParamMap.get('language') || 'en';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.get<any[]>(`public/portal/${this.tenantId}/products?language=${encodeURIComponent(this.language)}`).subscribe({
      next: products => {
        this.products = products || [];
        const slug = this.route.snapshot.queryParamMap.get('product');
        this.selected = slug ? this.products.find(x => x.slug === slug) || this.products[0] : this.products[0];
        this.loading = false;
        if (this.selected) this.loadDetail(this.selected.slug);
      },
      error: err => { this.loading = false; this.error = err?.error?.detail || 'Unable to load the Renova portal.'; }
    });
  }

  loadDetail(slug: string): void {
    this.api.get<any>(`public/portal/${this.tenantId}/products/${encodeURIComponent(slug)}?language=${encodeURIComponent(this.language)}`).subscribe({
      next: product => this.selected = product,
      error: err => this.error = err?.error?.detail || 'Unable to load product details.'
    });
  }

  select(product: any): void {
    this.selected = product;
    this.inquirySent = false;
    this.loadDetail(product.slug);
    history.replaceState(null, '', `/renova/portal?product=${encodeURIComponent(product.slug)}&language=${encodeURIComponent(this.language)}`);
  }

  submitInquiry(): void {
    if (!this.selected || !this.inquiry.name.trim() || !this.inquiry.email.trim()) return;
    this.inquiryBusy = true;
    this.api.post(`public/portal/${this.tenantId}/inquiries`, {
      catalogProductId: this.selected.id,
      ...this.inquiry,
      language: this.language
    }).subscribe({
      next: () => { this.inquiryBusy = false; this.inquirySent = true; this.inquiry = { name: '', company: '', email: '', phone: '', countryCode: '', message: '' }; },
      error: err => { this.inquiryBusy = false; this.error = err?.error?.detail || 'Your request could not be submitted.'; }
    });
  }

  setLanguage(language: string): void {
    this.language = language;
    this.load();
  }
}
