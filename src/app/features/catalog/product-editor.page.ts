import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';

interface Category { id: string; name: string; code?: string | null; }

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-editor.page.html',
  styleUrl: './product-editor.page.css'
})
export class ProductEditorPage implements OnInit {
  categories: Category[] = [];
  saving = false;
  saved = false;
  error = '';

  product = {
    name: '', code: '', categoryId: '', brand: 'Renova', shortDescription: '',
    description: '', benefits: '', applications: '', technicalSpecifications: '',
    packaging: '', weight: '', sku: '',
    languages: { en: true, mk: false, sq: false, de: false },
    promote: true, publish: false
  };

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.get<Category[]>('renova/catalog/categories').subscribe({
      next: categories => {
        this.categories = categories;
        if (!this.product.categoryId && categories.length) this.product.categoryId = categories[0].id;
      },
      error: err => this.error = this.message(err)
    });
  }

  save(): void {
    if (!this.product.name.trim() || !this.product.code.trim() || !this.product.categoryId) {
      this.error = 'Product name, product code and category are required.';
      return;
    }
    this.saving = true;
    this.saved = false;
    this.error = '';

    const body = {
      productCategoryId: this.product.categoryId,
      name: this.product.name.trim(),
      code: this.product.code.trim(),
      brand: this.product.brand?.trim() || null,
      shortDescription: this.product.shortDescription?.trim() || null,
      description: this.product.description?.trim() || null,
      keyBenefits: this.product.benefits?.trim() || null,
      applications: this.product.applications?.trim() || null,
      technicalSpecifications: this.product.technicalSpecifications?.trim() || null
    };

    this.api.post<any>('renova/catalog/products', body).subscribe({
      next: product => {
        const productId = product?.body?.product?.id || product?.product?.id || product?.id;
        if (!productId) {
          this.error = 'The API did not return a product id.';
          this.saving = false;
          return;
        }
        this.persistDetails(productId);
      },
      error: err => {
        this.error = this.message(err);
        this.saving = false;
      }
    });
  }

  private persistDetails(productId: string): void {
    const languages = Object.entries(this.product.languages).filter(([, enabled]) => enabled).map(([language]) => language);
    const requests = languages.map(language => this.api.put<any>(
      `renova/catalog/products/${productId}/localizations/${language}`,
      {
        name: this.product.name,
        shortDescription: this.product.shortDescription,
        description: this.product.description,
        keyBenefits: this.product.benefits,
        applications: this.product.applications
      }
    ));

    requests.forEach(request => request.subscribe({ error: err => this.error = this.message(err) }));

    const weight = Number(this.product.weight);
    if (this.product.packaging || this.product.sku || this.product.weight) {
      this.api.post(`renova/catalog/products/${productId}/variants`, {
        name: this.product.packaging || 'Default',
        sku: this.product.sku || this.product.code,
        packaging: this.product.packaging || null,
        netWeight: Number.isFinite(weight) && weight > 0 ? weight : null,
        weightUnit: 'kg'
      }).subscribe({
        error: err => this.error = this.message(err)
      });
    }

    const finish = () => {
      if (this.product.publish) {
        this.api.post(`renova/catalog/products/${productId}/publish`, { slug: null }).subscribe({
          next: () => this.complete(productId),
          error: err => { this.error = this.message(err); this.saving = false; }
        });
      } else {
        this.complete(productId);
      }
    };

    window.setTimeout(finish, 250);
  }

  private complete(productId: string): void {
    this.saved = true;
    this.saving = false;
    if (this.product.promote) {
      window.setTimeout(() => this.router.navigate(['/renova/promotion'], { queryParams: { productId } }), 300);
    } else {
      window.setTimeout(() => this.router.navigate(['/catalog']), 500);
    }
  }

  private message(err: any): string {
    return err?.error?.detail || err?.error?.title || err?.message || 'Unable to save the product.';
  }
}
