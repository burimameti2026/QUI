import { DOCUMENT } from "@angular/common";
import { Inject, Injectable, signal } from "@angular/core";
import { Observable, catchError, finalize, map, of, tap, shareReplay } from "rxjs";
import { ApiService } from "./api.service";

export interface BrandTheme {
  productName: string;
  supportEmail: string;
  primaryColor: string;
  accentColor: string;
}

const DEFAULT_BRAND: BrandTheme = {
  productName: "QualifyAI",
  supportEmail: "support@company.com",
  primaryColor: "#f97316",
  accentColor: "#2563eb",
};

@Injectable({ providedIn: "root" })
export class BrandThemeService {
  readonly brand = signal<BrandTheme>(DEFAULT_BRAND);
  private request?: Observable<BrandTheme>;

  constructor(private api: ApiService, @Inject(DOCUMENT) private document: Document) {
    this.apply(DEFAULT_BRAND);
    try {
      const cached = localStorage.getItem("qui-branding");
      if (cached) {
        this.apply(this.normalize(JSON.parse(cached)));
      }
    } catch {
      // Ignore malformed local branding cache.
    }
  }

  load(): Observable<BrandTheme> {
    if (this.request) return this.request;

    this.request = this.api.get<Partial<BrandTheme>>("white-label/branding").pipe(
      map(value => this.normalize({ ...this.brand(), ...(value || {}) })),
      tap(value => {
        this.brand.set(value);
        this.apply(value);
        try { localStorage.setItem("qui-branding", JSON.stringify(value)); } catch {}
      }),
      catchError(() => of(this.brand())),
      finalize(() => { this.request = undefined; }),
      shareReplay(1)
    );

    return this.request;
  }

  save(value: Partial<BrandTheme>): Observable<BrandTheme> {
    const payload = this.normalize({ ...this.brand(), ...value });
    return this.api.put<Partial<BrandTheme>>("white-label/branding", payload).pipe(
      map(response => this.normalize({ ...payload, ...(response || {}) })),
      tap(saved => {
        this.brand.set(saved);
        this.apply(saved);
        try { localStorage.setItem("qui-branding", JSON.stringify(saved)); } catch {}
      })
    );
  }

  defaults(): BrandTheme {
    return { ...DEFAULT_BRAND };
  }

  private normalize(value: Partial<BrandTheme>): BrandTheme {
    return {
      productName: String(value.productName || DEFAULT_BRAND.productName),
      supportEmail: String(value.supportEmail || DEFAULT_BRAND.supportEmail),
      primaryColor: this.validHex(value.primaryColor) ? String(value.primaryColor) : DEFAULT_BRAND.primaryColor,
      accentColor: this.validHex(value.accentColor) ? String(value.accentColor) : DEFAULT_BRAND.accentColor,
    };
  }

  private validHex(value: unknown): boolean {
    return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
  }

  private apply(brand: BrandTheme) {
    const root = this.document.documentElement;
    const primary = brand.primaryColor;
    const accent = brand.accentColor;
    const primarySoft = this.mix(primary, "#ffffff", 0.90);
    const accentSoft = this.mix(accent, "#ffffff", 0.90);

    root.style.setProperty("--brand-primary", primary);
    root.style.setProperty("--brand-primary-hover", this.mix(primary, "#000000", 0.12));
    root.style.setProperty("--brand-primary-soft", primarySoft);
    root.style.setProperty("--brand-primary-border", this.mix(primary, "#ffffff", 0.68));
    root.style.setProperty("--brand-accent", accent);
    root.style.setProperty("--brand-accent-hover", this.mix(accent, "#000000", 0.12));
    root.style.setProperty("--brand-accent-soft", accentSoft);
    root.style.setProperty("--brand-accent-border", this.mix(accent, "#ffffff", 0.68));

    root.style.setProperty("--ui-accent", "var(--brand-primary)");
    root.style.setProperty("--ui-accent-soft", "var(--brand-primary-soft)");
    root.style.setProperty("--ref-blue", "var(--brand-accent)");
    root.style.setProperty("--cms", "var(--brand-accent)");
    root.style.setProperty("--cms-soft", "var(--brand-accent-soft)");
    root.style.setProperty("--leads", "var(--brand-primary)");
    root.style.setProperty("--leads-soft", "var(--brand-primary-soft)");
    const theme = this.document.querySelector('meta[name="theme-color"]');
    theme?.setAttribute("content", primary);
  }

  private mix(hex: string, target: string, targetWeight: number): string {
    const a = this.rgb(hex);
    const b = this.rgb(target);
    const w = Math.max(0, Math.min(1, targetWeight));
    const r = Math.round(a.r * (1 - w) + b.r * w);
    const g = Math.round(a.g * (1 - w) + b.g * w);
    const bl = Math.round(a.b * (1 - w) + b.b * w);
    return "#" + [r, g, bl].map(x => x.toString(16).padStart(2, "0")).join("");
  }

  private rgb(hex: string) {
    return {
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16),
    };
  }
}
