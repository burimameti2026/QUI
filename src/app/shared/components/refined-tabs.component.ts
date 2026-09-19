import { Component } from '@angular/core';

/** Shared compact tab navigation used for dense workspace filters. */
@Component({
  selector: 'qai-refined-tabs',
  standalone: true,
  template: `<nav class="refined-tabs"><ng-content /></nav>`,
  styles: [`
    :host{display:block;width:100%;min-width:0}
    .refined-tabs{display:flex;align-items:center;gap:6px;min-height:48px;padding:6px 8px;border:1px solid var(--qui-border);border-radius:var(--qui-radius-lg);background:var(--wl-surface,#fff);box-shadow:0 1px 2px rgba(16,24,40,.03)}
    .refined-tabs ::ng-deep button{position:relative!important;height:34px!important;min-height:34px!important;margin:0!important;padding:0 13px!important;border:1px solid transparent!important;border-radius:var(--qui-radius-md)!important;background:transparent!important;color:var(--wl-muted,#667085)!important;box-shadow:none!important;font-size:var(--qui-text-xs)!important;font-weight:700!important;white-space:nowrap!important;transition:background .12s ease,border-color .12s ease,color .12s ease}
    .refined-tabs ::ng-deep button:first-child{padding-left:13px!important}.refined-tabs ::ng-deep button.active{border-color:var(--wl-button-3-border,#fed7aa)!important;background:var(--wl-surface,#fff)7ed!important;color:#c2410c!important;box-shadow:0 1px 2px rgba(249,115,22,.08)!important}.refined-tabs ::ng-deep button:hover{border-color:var(--qui-border-soft)!important;background:var(--wl-surface-muted,#f8fafc)!important;color:#25282c!important}
    @media (max-width: 640px){.refined-tabs{overflow:auto}.refined-tabs ::ng-deep button{white-space:nowrap;flex:0 0 auto!important}}
  `]
})
export class RefinedTabs {}
