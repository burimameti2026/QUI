import { Component } from '@angular/core';

/** Shared compact tab navigation used for dense workspace filters. */
@Component({
  selector: 'qai-refined-tabs',
  standalone: true,
  template: `<nav class="refined-tabs"><ng-content /></nav>`,
  styles: [`
    :host{display:block;width:100%;min-width:0}
    .refined-tabs{display:flex;align-items:center;gap:6px;min-height:48px;padding:6px 8px;border:1px solid #e5e9f0;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(16,24,40,.03)}
    .refined-tabs ::ng-deep button{position:relative!important;height:34px!important;min-height:34px!important;margin:0!important;padding:0 13px!important;border:1px solid transparent!important;border-radius:8px!important;background:transparent!important;color:#667085!important;box-shadow:none!important;font-size:10px!important;font-weight:700!important;white-space:nowrap!important;transition:background .12s ease,border-color .12s ease,color .12s ease}
    .refined-tabs ::ng-deep button:first-child{padding-left:13px!important}.refined-tabs ::ng-deep button.active{border-color:#fed7aa!important;background:#fff7ed!important;color:#c2410c!important;box-shadow:0 1px 2px rgba(249,115,22,.08)!important}.refined-tabs ::ng-deep button:hover{border-color:#edf0f4!important;background:#f8fafc!important;color:#25282c!important}
    @media(max-width:700px){.refined-tabs{overflow:auto}.refined-tabs ::ng-deep button{white-space:nowrap;flex:0 0 auto!important}}
  `]
})
export class RefinedTabs {}
