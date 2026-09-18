import { Component } from '@angular/core';

/** Dense KPI strip matching the supplied Leads reference. */
@Component({
  selector: 'qai-kpi-strip',
  standalone: true,
  template: `<section class="refined-kpi-strip"><ng-content /></section>`,
  styles: [`
    :host{display:block;width:100%;min-width:0}
    .refined-kpi-strip{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));width:100%;border:1px solid #e1e5e9;background:#fff}
    .refined-kpi-strip>article{position:relative;min-width:0;height:104px;padding:14px 18px 11px;border-right:1px solid #e1e5e9;background:#fff;overflow:hidden}
    .refined-kpi-strip>article:last-child{border-right:0}
    .refined-kpi-strip>article:before{content:"";position:absolute;left:0;top:0;bottom:0;width:2px;background:var(--brand-primary)}
    .refined-kpi-strip>article:nth-child(2):before{background:#64748b}.refined-kpi-strip>article:nth-child(3):before{background:#16a34a}.refined-kpi-strip>article:nth-child(4):before{background:var(--brand-primary)}.refined-kpi-strip>article:nth-child(5):before{background:var(--brand-primary)}
    .refined-kpi-strip>article>span:not(.kpi-icon){display:block;color:#6f747b;font-size:9px;font-weight:600;line-height:16px}
    .refined-kpi-strip strong{display:block;margin-top:2px;color:#17191c;font-size:25px;line-height:1.1;font-weight:650;letter-spacing:-.035em}
    .refined-kpi-strip small{display:block;margin-top:5px;color:#858a91;font-size:8.5px;line-height:13px}
    .kpi-icon{position:absolute;top:15px;right:17px;display:grid!important;width:25px;height:25px;place-items:center;border:1px solid #dfe3e7;border-radius:3px;background:#fff;color:#8a8f96!important;font-size:10px!important}
    .refined-kpi-strip>article:first-child .kpi-icon{color:var(--brand-primary)!important;border-color:var(--brand-primary-border);background:var(--brand-primary-soft)}
    .refined-kpi-strip>article:nth-child(3) .kpi-icon{color:#16a34a!important;border-color:#bbf7d0;background:#f0fdf4}
    .refined-kpi-strip>article:nth-child(4) .kpi-icon{color:var(--brand-primary)!important;border-color:var(--brand-primary-border);background:var(--brand-primary-soft)}
    .kpi-chart{position:absolute;right:14px;bottom:9px;width:70px;height:25px;opacity:.82}.kpi-chart polyline{fill:none;stroke:var(--brand-primary);stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round}.refined-kpi-strip>article:nth-child(2) .kpi-chart polyline{stroke:#64748b}.refined-kpi-strip>article:nth-child(3) .kpi-chart polyline{stroke:#16a34a}.refined-kpi-strip>article:nth-child(4) .kpi-chart polyline{stroke:var(--brand-primary)}
    @media(max-width:900px){.refined-kpi-strip{grid-template-columns:repeat(5,minmax(0,1fr));min-width:760px}.refined-kpi-strip>article{height:100px}}
    @media(max-width:600px){.refined-kpi-strip{grid-template-columns:repeat(5,minmax(145px,1fr));min-width:725px}}
  `]
})
export class RefinedKpiStrip {}