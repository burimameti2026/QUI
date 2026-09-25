import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService, GoldenPipelineBoard, GoldenPipelineStage } from '../crm/crm.service';
import { Opportunity } from '../../core/models/platform.models';
import { finalize } from 'rxjs';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `
  <section class="page page-golden-pipeline">
    <qai-page-header title="Golden Pipeline" subtitle="Manage opportunities across your sales stages.">
      <button [disabled]="loading()" (click)="reload()">{{ loading() ? 'Loading…' : '↻ Refresh' }}</button>
    </qai-page-header>

    <div class="golden-notice" *ngIf="error()"><b>!</b><span>{{ error() }}</span></div>
    <div class="golden-loading" *ngIf="loading() && !board()">Loading pipeline…</div>

    <section class="golden-kpis" *ngIf="board() as data">
      <article><span class="kpi-top"><span class="kpi-icon blue">◇</span><span class="kpi-label">Open opportunities</span></span><strong>{{ totalOpportunities(data) }}</strong><small>active deals across stages</small></article>
      <article><span class="kpi-top"><span class="kpi-icon violet">€</span><span class="kpi-label">Pipeline value</span></span><strong>{{ money(totalValue(data)) }}</strong><small>current open value</small></article>
      <article><span class="kpi-top"><span class="kpi-icon green">↗</span><span class="kpi-label">Weighted value</span></span><strong>{{ money(weightedValue(data)) }}</strong><small>probability-adjusted value</small></article>
      <article><span class="kpi-top"><span class="kpi-icon amber">▤</span><span class="kpi-label">Pipeline stages</span></span><strong>{{ data.stages.length }}</strong><small>configured sales stages</small></article>
    </section>

    <div class="golden-board" *ngIf="board() as data">
      <article class="golden-column" *ngFor="let stage of data.stages" (dragover)="$event.preventDefault()" (drop)="drop($event, stage.id)">
        <header class="golden-column-header">
          <div><span class="eyebrow">PIPELINE STAGE</span><strong>{{ stage.name }}</strong></div>
          <span class="stage-probability">{{ stage.probability }}%</span>
        </header>
        <div class="golden-cards">
          <article class="golden-card" *ngFor="let item of stage.opportunities" draggable="true" (dragstart)="drag(item.id)">
            <div class="golden-card-top"><span class="golden-icon">↗</span><span class="score-pill">{{ item.amount > 30000 ? 93 : item.amount > 15000 ? 84 : 71 }}</span></div>
            <strong>{{ item.name }}</strong>
            <b>{{ money(item.amount) }}</b>
            <small>{{ item.expectedCloseUtc | date:'mediumDate' }}</small>
          </article>
          <div class="golden-drop">Drop opportunity here</div>
        </div>
      </article>
    </div>
  </section>`,
  styleUrl: "./golden-pipeline.page.css"
})
export class GoldenPipelinePage implements OnInit {
  board = signal<GoldenPipelineBoard | null>(null);
  loading = signal(false);
  error = signal('');
  private draggedId = '';
  constructor(private crm: CrmService) {}
  ngOnInit() { this.reload(); }
  reload() {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.crm.goldenPipeline().pipe(finalize(() => this.loading.set(false))).subscribe({
      next: x => this.board.set(x),
      error: () => this.error.set('Golden Pipeline is unavailable. Check the API or tenant configuration.')
    });
  }
  totalOpportunities(data: GoldenPipelineBoard): number {
    return data.stages.reduce((sum: number, stage: GoldenPipelineStage) => sum + (stage.opportunities?.length || 0), 0);
  }
  totalValue(data: GoldenPipelineBoard): number {
    return data.stages.reduce((sum: number, stage: GoldenPipelineStage) => sum + (stage.opportunities || []).reduce((s: number, item: Opportunity) => s + Number(item.amount || 0), 0), 0);
  }
  weightedValue(data: GoldenPipelineBoard): number {
    return data.stages.reduce((sum: number, stage: GoldenPipelineStage) => sum + (stage.opportunities || []).reduce((s: number, item: Opportunity) => s + Number(item.amount || 0) * Number(stage.probability || 0) / 100, 0), 0);
  }
  money(value: number): string {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
  }
  drag(id: string) { this.draggedId = id; }
  drop(event: DragEvent, stageId: string) {
    event.preventDefault();
    if (!this.draggedId || this.loading()) return;
    const id = this.draggedId;
    this.draggedId = '';
    this.crm.moveGoldenPipelineOpportunity(id, stageId).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Unable to move opportunity.')
    });
  }
}
