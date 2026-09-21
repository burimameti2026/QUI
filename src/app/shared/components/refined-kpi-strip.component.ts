import { Component } from '@angular/core';

/** Shared KPI strip using the canonical design-system metric grid. */
@Component({
  selector: 'qai-kpi-strip',
  standalone: true,
  template: `<section class="metric-grid"><ng-content /></section>`
})
export class RefinedKpiStrip {}