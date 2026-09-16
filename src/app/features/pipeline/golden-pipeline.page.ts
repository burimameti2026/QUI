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
  styles: [`:host{display:block;color:var(--ui-ink)}.golden-notice{display:flex;align-items:center;gap:9px;min-height:40px;margin-bottom:12px;padding:7px 11px;border:1px solid #efc8c3;border-radius:0;background:#fff8f6;color:var(--ui-negative);font-size:10px}.golden-notice b{width:22px;height:22px;display:grid;place-items:center;border:1px solid #e3aaa2;border-radius:0;background:#fff;color:var(--ui-negative)}.golden-loading{display:grid;min-height:220px;place-items:center;color:var(--ui-muted);font-size:10px}.golden-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:0;border-top:1px solid var(--ui-border);border-left:1px solid var(--ui-border);background:var(--ui-bg)}.golden-column{min-width:0;overflow:hidden;border-right:1px solid var(--ui-border);border-bottom:1px solid var(--ui-border);border-radius:0;background:var(--ui-bg);box-shadow:none}.golden-column-header{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:68px;padding:13px 14px;border-bottom:1px solid var(--ui-border);background:var(--ui-surface-subtle)}.golden-column-header div{display:flex;flex-direction:column;gap:4px;min-width:0}.eyebrow{color:var(--ui-faint);font-size:8px;font-weight:800;letter-spacing:.1em}.golden-column-header strong{overflow:hidden;color:var(--ui-ink);font-size:12px;text-overflow:ellipsis;white-space:nowrap}.stage-probability{display:inline-flex;min-width:34px;justify-content:center;padding:4px 6px;border:1px solid var(--ui-border);border-radius:0;background:#fff;color:var(--ui-ink-soft);font-size:8px;font-weight:800}.golden-cards{display:flex;min-height:180px;flex-direction:column;gap:8px;padding:9px}.golden-card{display:flex;flex-direction:column;gap:5px;padding:11px;border:1px solid var(--ui-border);border-radius:0;background:#fff;box-shadow:none;cursor:grab}.golden-card:hover{border-color:var(--ui-border-strong);box-shadow:none}.golden-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}.golden-icon{width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--ui-border);border-radius:0;background:var(--ui-surface-subtle);color:var(--ui-accent);font-size:10px}.score-pill{display:inline-flex;padding:4px 6px;border:1px solid #f0c8ad;border-radius:0;background:#fff7f1;color:var(--ui-accent);font-size:8px;font-weight:800}.golden-card>strong{color:var(--ui-ink);font-size:10px;line-height:1.35}.golden-card>b{color:var(--ui-ink);font-size:13px}.golden-card>small{color:var(--ui-faint);font-size:8px}.golden-drop{display:grid;min-height:50px;place-items:center;border:1px dashed var(--ui-border-strong);border-radius:0;color:var(--ui-faint);font-size:8px;text-align:center;background:var(--ui-surface)}@media(max-width:760px){.golden-board{grid-template-columns:1fr}.golden-column-header{padding:12px 13px}}`]
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
