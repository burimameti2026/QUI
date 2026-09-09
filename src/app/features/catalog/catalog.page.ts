import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

interface ProductRow {
  id: string;
  name: string;
  code: string;
  brand?: string | null;
  shortDescription?: string | null;
  productCategoryId: string;
  variants: number;
  languages: string[];
  publication?: { status: string; isVisible: boolean; version: number; slug: string } | null;
}

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.page.html',
  styleUrl: './catalog.page.css'
})
export class CatalogPage implements OnInit {
  products: ProductRow[] = [];
  loading = true;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.api.get<ProductRow[]>('renova/catalog/products').subscribe({
      next: rows => { this.products = rows; this.loading = false; },
      error: err => { this.error = err?.error?.detail || err?.error?.title || 'Unable to load the Renova catalog.'; this.loading = false; }
    });
  }

  get publishedCount(): number { return this.products.filter(p => p.publication?.status === 'Published' && p.publication.isVisible).length; }
  get draftCount(): number { return this.products.length - this.publishedCount; }
  get languageCount(): number { return new Set(this.products.flatMap(p => p.languages || [])).size; }
}
