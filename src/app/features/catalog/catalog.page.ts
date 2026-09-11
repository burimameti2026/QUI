import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

@Component({standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./catalog.page.html',styleUrl:'./catalog.page.css'})
export class CatalogPage implements OnInit {
  products: ProductRow[] = [];
  loading = true;
  error = '';
  search = '';
  statusFilter = 'all';
  categoryFilter = 'all';

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.api.get<ProductRow[]>('renova/catalog/products').subscribe({
      next: rows => { this.products = rows || []; this.loading = false; },
      error: err => { this.error = err?.error?.detail || err?.error?.title || 'Unable to load the Renova catalog.'; this.loading = false; }
    });
  }

  get categories(): string[] { return [...new Set(this.products.map(p => p.productCategoryId).filter(Boolean))]; }

  get filteredProducts(): ProductRow[] {
    const q = this.search.trim().toLowerCase();
    return this.products.filter(p => {
      const matchesSearch = !q || [p.name,p.code,p.brand,p.shortDescription].some(v => String(v || '').toLowerCase().includes(q));
      const published = p.publication?.status === 'Published' && p.publication?.isVisible === true;
      const matchesStatus = this.statusFilter === 'all' || (this.statusFilter === 'published' ? published : !published);
      const matchesCategory = this.categoryFilter === 'all' || p.productCategoryId === this.categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }

  get publishedCount(): number { return this.products.filter(p => p.publication?.status === 'Published' && p.publication.isVisible).length; }
  get draftCount(): number { return this.products.length - this.publishedCount; }
  get languageCount(): number { return new Set(this.products.flatMap(p => p.languages || [])).size; }
}
