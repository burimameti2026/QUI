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
    <section class="metric-grid kpi-grid">
      <button class="metric kpi-card" type="button" *ngFor="let metric of metrics" (click)="select(metric)">
        <div class="metric-top">
          <span class="metric-icon">{{ metric.icon }}</span>
          <span class="metric-label">{{ metric.label }}</span>
          <span class="kpi-arrow" *ngIf="metric.path">→</span>
        </div>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.detail }}</small>
      </button>
    </section>
  `
})
export class QaiKpiGrid {
  @Input() metrics: QaiKpiMetric[] = [];
  @Output() selected = new EventEmitter<QaiKpiMetric>();
  select(metric: QaiKpiMetric) { this.selected.emit(metric); }
}