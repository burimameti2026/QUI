import { Component } from '@angular/core';

/** Shared dense data-grid surface used by CRM/workspace list views. */
@Component({
  selector: 'qai-data-grid',
  standalone: true,
  template: `<div class="refined-grid"><ng-content /></div>`,
  styles: [`
    :host { display:block; min-width:0; width:100%; }
    .refined-grid { width:100%; overflow:auto; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb; background:#fff; }
    ::ng-deep .refined-grid table { width:100%; min-width:980px; border-collapse:collapse; table-layout:auto; background:#fff; }
    ::ng-deep .refined-grid th { height:38px; padding:0 12px; border-bottom:1px solid #e5e7eb; background:#fafafa; color:#858a91; font-size:8.5px; font-weight:650; letter-spacing:.055em; text-align:left; text-transform:uppercase; white-space:nowrap; }
    ::ng-deep .refined-grid td { height:56px; padding:8px 12px; border-bottom:1px solid #eef0f2; color:#5c626a; font-size:10px; vertical-align:middle; white-space:nowrap; }
    ::ng-deep .refined-grid tbody tr:last-child td { border-bottom:0; }
    ::ng-deep .refined-grid tbody tr:hover td { background:#fffaf6; }
  `]
})
export class RefinedDataGrid {}
