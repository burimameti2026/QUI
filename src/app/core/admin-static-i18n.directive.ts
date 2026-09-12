import { Directive, ElementRef, OnDestroy, effect, inject } from '@angular/core';
import { AdminI18nService, AdminLanguage } from './admin-i18n.service';
import { adminText } from './admin-page-translations';
import { adminExtraText } from './admin-extra-translations';
import { adminCrmText } from './admin-crm-translations';
import { ADMIN_CMS_TRANSLATIONS } from './admin-cms-translations';
import { adminUiGapText } from './admin-ui-gap-translations';
import { adminPageCopyText } from './admin-page-copy-translations';
import { adminNavigationText } from './admin-navigation-translations';
import { adminPageInteriorText } from './admin-page-interior-translations';

@Directive({ selector: '[qaiAdminStaticI18n]', standalone: true })
export class AdminStaticI18nDirective implements OnDestroy {
  private readonly host = inject(ElementRef).nativeElement as HTMLElement;
  private readonly i18n = inject(AdminI18nService);
  private readonly originals = new WeakMap<Text, string>();
  private readonly attributeOriginals = new WeakMap<HTMLElement, Map<string, string>>();
  private readonly observer = new MutationObserver(() => this.translate());
  private readonly languageEffect = effect(() => { this.i18n.language(); this.translate(); });
  private readonly uiAttributes = ['placeholder', 'title', 'aria-label'] as const;

  constructor() {
    this.observer.observe(this.host, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: [...this.uiAttributes] });
    queueMicrotask(() => this.translate());
  }

  private translate(): void {
    const walker = document.createTreeWalker(this.host, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node as Text;
      const parent = text.parentElement;
      if (!parent || /^(SCRIPT|STYLE|TEXTAREA|INPUT)$/i.test(parent.tagName)) continue;
      nodes.push(text);
    }

    for (const text of nodes) {
      const current = text.nodeValue ?? '';
      const original = this.originals.get(text) ?? current;
      if (!this.originals.has(text)) this.originals.set(text, original);
      const translated = this.translateValue(original.trim());
      if (translated === original.trim()) continue;
      const leading = original.match(/^\s*/)?.[0] ?? '';
      const trailing = original.match(/\s*$/)?.[0] ?? '';
      if (current !== leading + translated + trailing) text.nodeValue = leading + translated + trailing;
    }

    const elements = Array.from(this.host.querySelectorAll('*')) as HTMLElement[];
    for (const element of elements) {
      for (const attribute of this.uiAttributes) {
        const value = element.getAttribute(attribute);
        if (value === null || value.trim().length === 0 || value.trim().length > 400) continue;
        let originals = this.attributeOriginals.get(element);
        if (!originals) { originals = new Map<string, string>(); this.attributeOriginals.set(element, originals); }
        const original = originals.get(attribute) ?? value;
        if (!originals.has(attribute)) originals.set(attribute, original);
        const translated = this.translateValue(original.trim());
        if (translated === original.trim()) continue;
        const leading = original.match(/^\s*/)?.[0] ?? '';
        const trailing = original.match(/\s*$/)?.[0] ?? '';
        const nextValue = leading + translated + trailing;
        if (value !== nextValue) element.setAttribute(attribute, nextValue);
      }
    }
  }

  private translateValue(value: string): string {
    const language = this.i18n.language();
    const interior = adminPageInteriorText(value, language);
    if (interior !== value) return interior;
    const navigation = adminNavigationText(value, language);
    if (navigation !== value) return navigation;
    const pageCopy = adminPageCopyText(value, language);
    if (pageCopy !== value) return pageCopy;
    const gap = adminUiGapText(value, language);
    if (gap !== value) return gap;
    const cms = ADMIN_CMS_TRANSLATIONS[value]?.[language];
    if (cms) return cms;

    const dynamicKpi = value.match(/^(\d+)\s+(selected|high priority|verified accounts|hot prospects|active campaigns|replies|demo ready)$/i);
    if (dynamicKpi) {
      const count = dynamicKpi[1];
      const suffix = dynamicKpi[2].toLowerCase();
      const suffixKeys: Record<string,string> = {
        selected: '0 selected',
        'high priority': '0 high priority',
        'verified accounts': 'Verified accounts',
        'hot prospects': 'Hot prospects',
        'active campaigns': 'Active campaigns',
        replies: 'Replies',
        'demo ready': 'Demo ready'
      };
      const key = suffixKeys[suffix];
      const translatedSuffix = key ? adminNavigationText(key, language).replace(/^0\s*/, '') : suffix;
      if (translatedSuffix !== suffix) return `${count} ${translatedSuffix}`;
    }

    const compound = this.translateCompound(value, language);
    if (compound !== value) return compound;

    return adminCrmText(adminExtraText(adminText(this.i18n, value), language), language);
  }

  private translateCompound(value: string, language: AdminLanguage): string {
    let match = value.match(/^(\d+)\s+campaigns\s+·\s+(\d+)\s+running$/i);
    if (match) {
      const campaigns = adminPageInteriorText('Campaigns', language);
      const active = adminPageInteriorText('Active', language);
      return `${match[1]} ${campaigns} · ${match[2]} ${active.toLowerCase()}`;
    }

    match = value.match(/^(\d+)\s+(total|pending)$/i);
    if (match) {
      const key = match[2].toLowerCase() === 'total' ? 'Total' : 'Pending';
      const translated = adminPageInteriorText(key, language);
      if (translated !== key) return `${match[1]} ${translated}`;
    }

    match = value.match(/^Showing\s+(\d+)\s*[–-]\s*(\d+)\s+of\s+(\d+)$/i);
    if (match) {
      const showing = adminPageInteriorText('Showing', language);
      const of = adminPageInteriorText('of', language);
      if (showing !== 'Showing' && of !== 'of') return `${showing} ${match[1]}–${match[2]} ${of} ${match[3]}`;
    }

    match = value.match(/^Page\s+(\d+)\s+of\s+(\d+)$/i);
    if (match) {
      const page = adminPageInteriorText('Page', language);
      const of = adminPageInteriorText('of', language);
      if (page !== 'Page' && of !== 'of') return `${page} ${match[1]} ${of} ${match[2]}`;
    }

    return value;
  }

  ngOnDestroy(): void { this.observer.disconnect(); this.languageEffect.destroy(); }
}
