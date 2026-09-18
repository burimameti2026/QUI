import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService, GoldenPipelineBoard } from '../crm/crm.service';
import { finalize } from 'rxjs';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `
  <section class="page">
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
            <b>{{ item.amount | currency }}</b>
            <small>{{ item.expectedCloseUtc | date:'mediumDate' }}</small>
          </article>
          <div class="golden-drop">Drop opportunity here</div>
        </div>
      </article>
    </div>
  </section>`,
  styles: [`:host{display:block;color:var(--ui-ink)}.golden-notice{display:flex;align-items:center;gap:9px;min-height:40px;margin-bottom:12px;padding:7px 11px;border:1px solid #efc8c3;border-radius:0;background:#fff8f6;color:var(--ui-negative);font-size:10px}.golden-notice b{width:22px;height:22px;display:grid;place-items:center;border:1px solid #e3aaa2;border-radius:0;background:#fff;color:var(--ui-negative)}.golden-loading{display:grid;min-height:220px;place-items:center;color:var(--ui-muted);font-size:10px}.golden-board{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;background:var(--ui-bg)}.golden-column{min-width:0;overflow:hidden;border-right:1px solid var(--ui-border);border-bottom:1px solid var(--ui-border);border-radius:0;background:var(--ui-bg);box-shadow:none}.golden-column-header{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:68px;padding:13px 14px;border-bottom:1px solid var(--ui-border);background:var(--ui-surface-subtle)}.golden-column-header div{display:flex;flex-direction:column;gap:4px;min-width:0}.eyebrow{color:var(--ui-faint);font-size:8px;font-weight:800;letter-spacing:.1em}.golden-column-header strong{overflow:hidden;color:var(--ui-ink);font-size:12px;text-overflow:ellipsis;white-space:nowrap}.stage-probability{display:inline-flex;min-width:34px;justify-content:center;padding:4px 6px;border:1px solid var(--ui-border);border-radius:0;background:#fff;color:var(--ui-ink-soft);font-size:8px;font-weight:800}.golden-cards{display:flex;min-height:180px;flex-direction:column;gap:8px;padding:9px}.golden-card{display:flex;flex-direction:column;gap:5px;padding:11px;border:1px solid var(--ui-border);border-radius:0;background:#fff;box-shadow:none;cursor:grab}.golden-card:hover{border-color:var(--ui-border-strong);box-shadow:none}.golden-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}.golden-icon{width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--ui-border);border-radius:0;background:var(--ui-surface-subtle);color:var(--ui-accent);font-size:10px}.score-pill{display:inline-flex;padding:4px 6px;border:1px solid #f0c8ad;border-radius:0;background:#fff7f1;color:var(--ui-accent);font-size:8px;font-weight:800}.golden-card>strong{color:var(--ui-ink);font-size:10px;line-height:1.35}.golden-card>b{color:var(--ui-ink);font-size:13px}.golden-card>small{color:var(--ui-faint);font-size:8px}.golden-drop{display:grid;min-height:50px;place-items:center;border:1px dashed var(--ui-border-strong);border-radius:0;color:var(--ui-faint);font-size:8px;text-align:center;background:var(--ui-surface)}@media(max-width:760px){.golden-board{grid-template-columns:1fr}.golden-column-header{padding:12px 13px}}
.golden-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;margin:0 28px 14px}
.golden-kpis article{position:relative;min-width:0;min-height:132px;padding:17px 16px;overflow:hidden;border:0;border-radius:3px;background:#fff;box-shadow:none}
.golden-kpis article:before{content:"";position:absolute;left:0;right:0;top:0;height:3px;background:#2563eb}
.golden-kpis article:nth-child(2):before{background:#7c3aed}.golden-kpis article:nth-child(3):before{background:#059669}.golden-kpis article:nth-child(4):before{background:#d97706}
.kpi-top{display:flex;align-items:center;gap:10px;min-height:31px}.kpi-icon{display:grid;width:31px;height:31px;flex:0 0 31px;place-items:center;border-radius:8px;font-size:13px}.kpi-icon.blue{background:#edf4ff;color:#2563eb}.kpi-icon.violet{background:#f2edff;color:#7c3aed}.kpi-icon.green{background:#eaf9f1;color:#059669}.kpi-icon.amber{background:#fff5df;color:#d97706}.kpi-label{display:block;color:#667085;font-size:11px;font-weight:650}.golden-kpis strong{display:block;margin:15px 0 8px;color:#172033;font-size:30px;line-height:1;font-weight:750;letter-spacing:-.04em}.golden-kpis small{display:block;color:#8293a7;font-size:10px;line-height:1.35}
.golden-board{margin:0 28px 18px;padding:8px!important;border:0!important;border-radius:10px!important;background:#eef2f7!important;box-shadow:0 1px 2px rgba(16,24,40,.03),0 4px 14px rgba(36,60,88,.045)!important}
.golden-column{background:#f8fafc!important;border-radius:10px!important;border-color:#e5e9f0!important}.golden-column-header{background:#fff!important}.golden-card{border-radius:9px!important;box-shadow:0 1px 2px rgba(16,24,40,.03)!important}
@media(max-width:1100px){.golden-board{grid-template-columns:repeat(2,minmax(0,1fr))}}\n@media(max-width:900px){.golden-kpis{grid-template-columns:repeat(2,minmax(0,1fr));margin-left:16px;margin-right:16px}.golden-board{margin-left:16px;margin-right:16px}}
@media(max-width:560px){.golden-kpis{grid-template-columns:1fr;margin-left:0;margin-right:0}.golden-board{margin-left:0;margin-right:0;border-left:0;border-right:0;border-radius:0!important}}
`]
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
    return data.stages.reduce((sum, stage) => sum + (stage.opportunities?.length || 0), 0);
  }
  totalValue(data: GoldenPipelineBoard): number {
    return data.stages.reduce((sum, stage) => sum + (stage.opportunities || []).reduce((s, item) => s + Number(item.amount || 0), 0), 0);
  }
  weightedValue(data: GoldenPipelineBoard): number {
    return data.stages.reduce((sum, stage) => sum + (stage.opportunities || []).reduce((s, item) => s + Number(item.amount || 0) * Number(stage.probability || 0) / 100, 0), 0);
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
