import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AdminI18nService } from '../../core/admin-i18n.service';

interface Category { id: string; name: string; code?: string | null; }
interface ProductDetails { product: any; variants: any[]; localizations: any[]; assets?: any[]; targetMarkets?: any[]; promotions?: any[]; }

@Component({standalone:true,imports:[CommonModule,FormsModule,RouterLink],templateUrl:'./product-editor.page.html',styleUrl:'./product-editor.page.css'})
export class ProductEditorPage implements OnInit {
  readonly i18n = inject(AdminI18nService);
  categories: Category[] = [];
  editingId = '';
  variantId = '';
  existingLanguages = new Set<string>();
  wasPublished = false;
  saving = false;
  saved = false;
  error = '';
  product = {
    name: '', code: '', categoryId: '', brand: '', shortDescription: '', description: '', benefits: '', applications: '', technicalSpecifications: '',
    packaging: '', weight: '', sku: '', languages: { en: true, mk: false, sq: false, de: false }, promote: false, publish: false
  };

  constructor(private api: ApiService, private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.editingId = this.route.snapshot.paramMap.get('id') || '';
    this.api.get<Category[]>('catalog/categories').subscribe({
      next: categories => {
        this.categories = categories || [];
        if (!this.editingId && !this.product.categoryId && this.categories.length) this.product.categoryId = this.categories[0].id;
        if (this.editingId) this.loadProduct();
      },
      error: err => this.error = this.message(err)
    });
  }

  private loadProduct(): void {
    this.api.get<ProductDetails>(`catalog/products/${this.editingId}`).subscribe({
      next: details => {
        const p = details.product || {};
        Object.assign(this.product, {
          name: p.name || '', code: p.code || '', categoryId: p.productCategoryId || '', brand: p.brand || '',
          shortDescription: p.shortDescription || '', description: p.description || '', benefits: p.keyBenefits || '',
          applications: p.applications || '', technicalSpecifications: p.technicalSpecifications || ''
        });
        const variant = details.variants?.[0];
        this.variantId = variant?.id || '';
        this.product.packaging = variant?.packaging || '';
        this.product.weight = variant?.netWeight?.toString() || '';
        this.product.sku = variant?.sku || '';
        this.existingLanguages = new Set((details.localizations || []).map((l: any) => String(l.language || '').toLowerCase()));
        for (const language of ['en','mk','sq','de'] as const) this.product.languages[language] = this.existingLanguages.has(language);
        this.product.languages.en = true;
        this.wasPublished = p.isActive !== false;
        this.product.publish = this.wasPublished;
      },
      error: err => this.error = this.message(err)
    });
  }

  save(): void {
    if (!this.product.name.trim() || !this.product.code.trim() || !this.product.categoryId) {
      this.error = this.i18n.t('Product name, product code and category are required.');
      return;
    }
    this.saving = true; this.saved = false; this.error = '';
    const body = {
      productCategoryId: this.product.categoryId, name: this.product.name.trim(), code: this.product.code.trim(),
      brand: this.product.brand?.trim() || null, shortDescription: this.product.shortDescription?.trim() || null,
      description: this.product.description?.trim() || null, keyBenefits: this.product.benefits?.trim() || null,
      applications: this.product.applications?.trim() || null, technicalSpecifications: this.product.technicalSpecifications?.trim() || null,
      isActive: !!this.product.publish
    };
    const request = this.editingId
      ? this.api.put<any>(`catalog/products/${this.editingId}`, body)
      : this.api.post<any>('catalog/products', body);
    request.subscribe({
      next: product => {
        const productId = this.editingId || product?.id;
        if (!productId) { this.error = this.i18n.t('The API did not return a product id.'); this.saving = false; return; }
        this.editingId = productId;
        this.persistDetails(productId);
      },
      error: err => { this.error = this.message(err); this.saving = false; }
    });
  }

  private persistDetails(productId: string): void {
    const requests: Observable<unknown>[] = Object.entries(this.product.languages)
      .filter(([language, enabled]) => enabled && !this.existingLanguages.has(language))
      .map(([language]) => this.api.post(`catalog/products/${productId}/localizations`, {
        language,
        name: this.product.name,
        shortDescription: this.product.shortDescription || null,
        description: this.product.description || null,
        keyBenefits: this.product.benefits || null,
        applications: this.product.applications || null
      }));

    const weight = Number(this.product.weight);
    if (this.product.packaging || this.product.sku || this.product.weight) {
      const variantBody = {
        name: this.product.packaging || 'Default', sku: this.product.sku || this.product.code,
        packaging: this.product.packaging || null, netWeight: Number.isFinite(weight) && weight > 0 ? weight : null,
        weightUnit: 'kg', isActive: true
      };
      requests.push(this.variantId
        ? this.api.put(`catalog/products/${productId}/variants/${this.variantId}`, variantBody)
        : this.api.post(`catalog/products/${productId}/variants`, variantBody));
    }

    forkJoin(requests.length ? requests : [this.api.get(`catalog/products/${productId}`)]).subscribe({
      next: () => this.complete(productId),
      error: err => { this.error = this.message(err); this.saving = false; }
    });
  }

  private complete(productId: string): void {
    this.saved = true; this.saving = false;
    setTimeout(() => this.router.navigate(['/catalog'], { queryParams: { productId } }), 300);
  }

  private message(err: any): string {
    return err?.error?.detail || err?.error?.title || err?.message || this.i18n.t('Unable to save the product.');
  }
}
