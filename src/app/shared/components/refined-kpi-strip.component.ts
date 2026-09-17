import { Component } from '@angular/core';

/** Dense KPI strip matching the Leads reference: one continuous metric band, not floating cards. */
@Component({
  selector: 'qai-kpi-strip',
  standalone: true,
  template: `<section class="refined-kpi-strip"><ng-content /></section>`,
  styles: [`
    :host{display:block;width:100%;min-width:0}
    .refined-kpi-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));width:100%;border:1px solid #e1e5e9;background:#fff}
    .refined-kpi-strip>article{position:relative;min-width:0;height:104px;padding:14px 18px 11px;border-right:1px solid #e1e5e9;background:#fff;overflow:hidden}
    .refined-kpi-strip>article:last-child{border-right:0}
    .refined-kpi-strip>article:before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:#f97316}
    .refined-kpi-strip>article:nth-child(2):before{background:#64748b}.refined-kpi-strip>article:nth-child(3):before{background:#16a34a}.refined-kpi-strip>article:nth-child(4):before{background:#2563eb}.refined-kpi-strip>article:nth-child(5):before{background:#f97316}
    .refined-kpi-strip>article>span:not(.kpi-icon){display:block;color:#6f747b;font-size:9px;font-weight:600;line-height:16px}
    .refined-kpi-strip strong{display:block;margin-top:2px;color:#17191c;font-size:25px;line-height:1.1;font-weight:650;letter-spacing:-.035em}
    .refined-kpi-strip small{display:block;margin-top:5px;color:#858a91;font-size:8.5px;line-height:13px}
    .kpi-icon{position:absolute;top:15px;right:17px;display:grid!important;width:25px;height:25px;place-items:center;border:1px solid #dfe3e7;border-radius:3px;background:#fff;color:#8a8f96!important;font-size:10px!important}
    .refined-kpi-strip>article:first-child .kpi-icon,.refined-kpi-strip>article:nth-child(5) .kpi-icon{color:#f97316!important;border-color:#fed7aa;background:#fff7ed}
    .refined-kpi-strip>article:nth-child(3) .kpi-icon{color:#16a34a!important;border-color:#bbf7d0;background:#f0fdf4}.refined-kpi-strip>article:nth-child(4) .kpi-icon{color:#2563eb!important;border-color:#bfdbfe;background:#eff6ff}
    .kpi-chart{position:absolute;right:14px;bottom:9px;width:70px;height:25px;opacity:.82}.kpi-chart polyline{fill:none;stroke:#f97316;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}.refined-kpi-strip>article:nth-child(2) .kpi-chart polyline{stroke:#64748b}.refined-kpi-strip>article:nth-child(3) .kpi-chart polyline{stroke:#16a34a}.refined-kpi-strip>article:nth-child(4) .kpi-chart polyline{stroke:#2563eb}
    @media(max-width:1100px){.refined-kpi-strip{grid-template-columns:repeat(3,minmax(0,1fr))}.refined-kpi-strip>article:nth-child(3){border-right:1px solid #e1e5e9}.refined-kpi-strip>article:nth-child(4){border-right:0}}
    @media(max-width:700px){.refined-kpi-strip{grid-template-columns:1fr}.refined-kpi-strip>article{border-right:0;border-bottom:1px solid #e1e5e9}.refined-kpi-strip>article:last-child{border-bottom:0}}
  `]
})
export class RefinedKpiStrip {}
