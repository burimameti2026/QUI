import { Directive, ElementRef, OnDestroy, effect, inject } from '@angular/core';
import { AdminI18nService } from './admin-i18n.service';

@Directive({ selector: '[qaiAdminStaticI18n]', standalone: true })
export class AdminStaticI18nDirective implements OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>).nativeElement;
  private readonly i18n = inject(AdminI18nService);
  private readonly originals = new WeakMap<Text, string>();
  private readonly observer = new MutationObserver(() => this.translate());
  private readonly languageEffect = effect(() => { this.i18n.language(); this.translate(); });

  constructor() { this.observer.observe(this.host, { childList: true, subtree: true }); }

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
      const original = this.originals.get(text) ?? text.nodeValue ?? '';
      if (!this.originals.has(text)) this.originals.set(text, original);
      const trimmed = original.trim();
      if (!trimmed || trimmed.length > 220) continue;
      const translated = this.i18n.t(trimmed);
      if (translated === trimmed) continue;
      const leading = original.match(/^\s*/)?.[0] ?? '';
      const trailing = original.match(/\s*$/)?.[0] ?? '';
      text.nodeValue = leading + translated + trailing;
    }
  }

  ngOnDestroy(): void { this.observer.disconnect(); this.languageEffect.destroy(); }
}
