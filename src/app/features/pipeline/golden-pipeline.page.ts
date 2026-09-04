import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmService, GoldenPipelineBoard } from '../crm/crm.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
  <section class="page">
    <header><div><h1>Golden Pipeline</h1><p>Manage opportunities across your sales stages.</p></div><button (click)="reload()">Refresh</button></header>
    <p *ngIf="loading()">Loading pipeline…</p>
    <p class="error" *ngIf="error()">{{ error() }}</p>
    <div class="board" *ngIf="board() as data">
      <article class="column" *ngFor="let stage of data.stages" (dragover)="$event.preventDefault()" (drop)="drop($event, stage.id)">
        <div class="stage"><strong>{{ stage.name }}</strong><span>{{ stage.probability }}%</span></div>
        <div class="cards">
          <div class="card" *ngFor="let item of stage.opportunities" draggable="true" (dragstart)="drag(item.id)">
            <strong>{{ item.name }}</strong><span>{{ item.amount | currency }}</span><small>{{ item.expectedCloseUtc | date }}</small>
          </div>
        </div>
      </article>
    </div>
  </section>`,
  styles: [`.page{padding:24px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}h1{margin:0}.board{display:flex;gap:16px;overflow:auto}.column{min-width:260px;flex:1;background:#f7f7f8;border-radius:12px;padding:12px}.stage{display:flex;justify-content:space-between;margin-bottom:12px}.cards{min-height:120px}.card{background:white;border-radius:10px;padding:12px;margin-bottom:10px;box-shadow:0 1px 4px #0001;cursor:grab;display:flex;flex-direction:column;gap:5px}.error{color:#b00020}`]
})
export class GoldenPipelinePage implements OnInit {
  board = signal<GoldenPipelineBoard | null>(null);
  loading = signal(false);
  error = signal('');
  private draggedId = '';
  constructor(private crm: CrmService) {}
  ngOnInit() { this.reload(); }
  reload() {
    this.loading.set(true); this.error.set('');
    this.crm.goldenPipeline().subscribe({ next: x => { this.board.set(x); this.loading.set(false); }, error: () => { this.error.set('Golden Pipeline is unavailable for this tenant or license.'); this.loading.set(false); } });
  }
  drag(id: string) { this.draggedId = id; }
  drop(event: DragEvent, stageId: string) {
    event.preventDefault(); if (!this.draggedId) return;
    const id = this.draggedId; this.draggedId = '';
    this.crm.moveGoldenPipelineOpportunity(id, stageId).subscribe({ next: () => this.reload(), error: () => this.error.set('Unable to move opportunity.') });
  }
}
