import { Injectable, signal } from "@angular/core";
import { Observable, of } from "rxjs";
import { WhiteLabelConfigService } from "./white-label-config.service";

/** @deprecated Visual branding is owned exclusively by WhiteLabelConfigService. */
export interface BrandTheme {
  productName: string; supportEmail: string;
  primaryColor: string; accentColor: string;
  buttonPrimaryColor: string; buttonSecondaryColor: string;
  cardHeaderColor: string;
  kpi1Color: string; kpi2Color: string; kpi3Color: string;
  kpi4Color: string; kpi5Color: string; kpi6Color: string;
}

@Injectable({ providedIn: "root" })
export class BrandThemeService {
  readonly brand = signal<BrandTheme>({} as BrandTheme);
  constructor(private whiteLabel: WhiteLabelConfigService) { this.brand.set(this.fromWhiteLabel()); }

  load(): Observable<BrandTheme> {
    const value = this.fromWhiteLabel();
    this.brand.set(value);
    return of(value);
  }

  save(value: Partial<BrandTheme>): Observable<BrandTheme> {
    const current = this.brand();
    const styles = { ...this.whiteLabel.styles() };
    styles.cards = {
      ...styles.cards,
      accentColor: value.primaryColor || styles.cards.accentColor,
      headerColor: value.cardHeaderColor || styles.cards.headerColor
    };
    styles.buttons = {
      ...styles.buttons,
      accentColor: value.primaryColor || styles.buttons.accentColor,
      buttonBackgroundColor: value.buttonPrimaryColor || styles.buttons.buttonBackgroundColor
    };
    this.whiteLabel.saveStyles(styles);
    const next = this.fromWhiteLabel({ ...current, ...value });
    this.brand.set(next);
    return of(next);
  }

  defaults(): BrandTheme { return this.fromWhiteLabel(); }

  private fromWhiteLabel(metadata: Partial<BrandTheme> = {}): BrandTheme {
    const styles = this.whiteLabel.styles();
    const primary = styles.cards.accentColor;
    const button = styles.buttons.buttonBackgroundColor || styles.buttons.accentColor;
    return {
      productName: metadata.productName || "QualifyAI",
      supportEmail: metadata.supportEmail || "support@company.com",
      primaryColor: primary,
      accentColor: styles.header.accentColor,
      buttonPrimaryColor: button,
      buttonSecondaryColor: styles.buttons.surfaceColor,
      cardHeaderColor: styles.cards.headerColor,
      kpi1Color: styles.kpis.accentColor, kpi2Color: styles.kpis.accentColor,
      kpi3Color: styles.kpis.accentColor, kpi4Color: styles.kpis.accentColor,
      kpi5Color: styles.kpis.accentColor, kpi6Color: styles.kpis.accentColor
    };
  }
}
