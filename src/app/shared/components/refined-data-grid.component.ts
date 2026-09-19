import { Component } from '@angular/core';

/** Shared dense data-grid surface matching the supplied Leads reference. */
@Component({
  selector: 'qai-data-grid',
  standalone: true,
  template: `<div class="refined-grid"><ng-content /></div>`,
  styles: [`
    :host{display:block;min-width:0;width:100%}
    .refined-grid{width:100%;overflow:auto;border-top:0;border-bottom:1px solid var(--qui-border);background:var(--qui-surface)}
    ::ng-deep .refined-grid table{width:100%;min-width:1120px;border-collapse:collapse!important;table-layout:auto;background:var(--qui-surface)}
    ::ng-deep .refined-grid th{height:38px!important;padding:0 12px!important;border-bottom:1px solid var(--qui-border)!important;background:var(--qui-surface)!important;color:#858a91!important;font-size:8.5px!important;font-weight:650!important;letter-spacing:.055em!important;text-align:left;text-transform:uppercase;white-space:nowrap}
    ::ng-deep .refined-grid td{height:56px!important;padding:8px 12px!important;border-bottom:1px solid #eef0f2!important;background:var(--qui-surface)!important;color:#5c626a!important;font-size:var(--qui-text-xs)!important;vertical-align:middle;white-space:nowrap}
    ::ng-deep .refined-grid tbody tr:last-child td{border-bottom:0!important}
    ::ng-deep .refined-grid tbody tr:hover td{background:#fffaf6!important}
    ::ng-deep .refined-grid input[type=checkbox]{width:13px!important;height:13px!important;min-height:13px!important;padding:0!important;border-radius:var(--qui-radius-xs)!important;accent-color:var(--qui-accent)}
  `]
})
export class RefinedDataGrid {}