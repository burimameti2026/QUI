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
  styles: [`:host{display:block}.golden-notice{display:flex;align-items:center;gap:9px;min-height:42px;margin-bottom:12px;padding:8px 12px;border:1px solid #fecdd3;border-radius:10px;background:#fff1f2;color:#9f1239;font-size:10px}.golden-notice b{width:23px;height:23px;display:grid;place-items:center;border-radius:7px;background:#e11d48;color:#fff}.golden-loading{display:grid;min-height:220px;place-items:center;color:#68758a;font-size:10px}.golden-board{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}.golden-column{min-width:0;overflow:hidden;border:1px solid #dde4ed;border-radius:14px;background:#f8fafc;box-shadow:0 6px 18px #17203309}.golden-column-header{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:78px;padding:15px 18px;border-bottom:1px solid #dce3ec;background:linear-gradient(180deg,#f5f7fa,#eef2f6)}.golden-column-header div{display:flex;flex-direction:column;gap:4px;min-width:0}.eyebrow{color:#68758a;font-size:8px;font-weight:800;letter-spacing:.65px}.golden-column-header strong{overflow:hidden;color:#182235;font-size:13px;text-overflow:ellipsis;white-space:nowrap}.stage-probability{display:inline-flex;min-width:38px;justify-content:center;padding:5px 7px;border:1px solid #c5d7f5;border-radius:999px;background:#eaf2ff;color:#2459b8;font-size:8px;font-weight:800}.golden-cards{display:flex;min-height:180px;flex-direction:column;gap:9px;padding:10px}.golden-card{display:flex;flex-direction:column;gap:5px;padding:12px;border:1px solid #dfe6ef;border-radius:10px;background:#fff;box-shadow:0 2px 7px #17203308;cursor:grab}.golden-card:hover{border-color:#b9cff0;box-shadow:0 5px 14px #17203310}.golden-card-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:2px}.golden-icon{width:30px;height:30px;display:grid;place-items:center;border:1px solid #c9daf6;border-radius:8px;background:#eaf2ff;color:#275ebf;font-size:10px}.score-pill{display:inline-flex;padding:4px 7px;border-radius:7px;background:#eaf2ff;color:#2459b8;font-size:8px;font-weight:800}.golden-card>strong{color:#263248;font-size:10px;line-height:1.35}.golden-card>b{color:#172033;font-size:13px}.golden-card>small{color:#8994a5;font-size:8px}.golden-drop{display:grid;min-height:52px;place-items:center;border:1px dashed #cbd7e6;border-radius:9px;color:#8a96a7;font-size:8px;text-align:center}@media(max-width:760px){.golden-board{grid-template-columns:1fr}.golden-column-header{padding:13px 15px}}`]
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
