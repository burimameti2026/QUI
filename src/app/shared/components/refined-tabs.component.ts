import { Component } from '@angular/core';

/** Shared flat tab navigation used for dense workspace filters. */
@Component({
  selector: 'qai-refined-tabs',
  standalone: true,
  template: `<nav class="refined-tabs"><ng-content /></nav>`,
  styles: [`
    :host{display:block;width:100%;min-width:0}
    .refined-tabs{display:flex;align-items:stretch;height:43px;border-top:0;border-bottom:1px solid #e1e5e9;background:#fff}
    .refined-tabs ::ng-deep button{position:relative!important;height:42px!important;min-height:42px!important;margin:0!important;padding:0 15px!important;border:0!important;border-bottom:2px solid transparent!important;border-radius:0!important;background:#fff!important;color:#747980!important;box-shadow:none!important;font-size:10px!important;font-weight:600!important}
    .refined-tabs ::ng-deep button:first-child{padding-left:4px!important}.refined-tabs ::ng-deep button.active{border-bottom-color:#f97316!important;color:#ea580c!important}.refined-tabs ::ng-deep button:hover{background:#fafafa!important;color:#25282c!important}
    @media(max-width:700px){.refined-tabs{overflow:auto}.refined-tabs ::ng-deep button{white-space:nowrap}}
  `]
})
export class RefinedTabs {}
