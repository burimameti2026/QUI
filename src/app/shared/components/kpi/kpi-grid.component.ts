import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface QaiKpiMetric {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  path?: string;
}

@Component({
  selector: 'qai-kpi-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="kpi-grid">
      <button class="kpi-card" type="button" *ngFor="let metric of metrics" (click)="select(metric)">
        <div class="kpi-top"><span class="kpi-icon">{{ metric.icon }}</span><span class="kpi-label">{{ metric.label }}</span><span class="kpi-arrow" *ngIf="metric.path">→</span></div>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.detail }}</small>
      </button>
    </section>
  `,
  styles: [`
    :host{display:block}.kpi-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:var(--wl-card-gap,12px)}
    .kpi-card{min-width:0;text-align:left;padding:var(--wl-kpi-padding,var(--wl-card-padding,16px));border:0;background:var(--wl-kpi-bg,var(--wl-panel,#fff));cursor:pointer;border-radius:var(--wl-kpi-radius,0);box-shadow:var(--wl-kpi-shadow,var(--wl-card-shadow,0 10px 28px rgba(15,23,42,.10)));transition:transform .12s ease,box-shadow .12s ease;color:var(--wl-kpi-text,var(--wl-text,#171717))}
    .kpi-card:hover{transform:translateY(-2px);box-shadow:0 14px 32px rgba(15,23,42,.13)}.kpi-top{display:flex;align-items:center;gap:8px}.kpi-icon{display:grid;place-items:center;width:28px;height:28px;background:var(--wl-accent-soft,#fff4df);color:var(--wl-kpi-1,var(--wl-accent,#f5500b));font-weight:800}.kpi-label{flex:1;color:var(--wl-kpi-muted,var(--wl-muted,#737373));font-size:10px;font-weight:800}.kpi-arrow{color:var(--wl-kpi-muted,var(--wl-muted,#737373))}.kpi-card>strong{display:block;margin:20px 0 3px;font-size:30px;line-height:1;font-weight:800;letter-spacing:-.04em;color:var(--wl-kpi-title,var(--wl-text,#171717))}.kpi-card>small{color:var(--wl-kpi-muted,var(--wl-muted,#737373));font-size:10px}
    @media(max-width:1050px){.kpi-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:700px){.kpi-grid{grid-template-columns:1fr}.kpi-card>strong{margin-top:14px}}
  `]
})
export class QaiKpiGrid {
  @Input() metrics: QaiKpiMetric[] = [];
  @Output() selected = new EventEmitter<QaiKpiMetric>();
  select(metric: QaiKpiMetric) { this.selected.emit(metric); }
}
