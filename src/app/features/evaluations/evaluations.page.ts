import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal, PageHeader } from '../../shared/ui';
import { EvaluationsService } from './evaluations.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  styleUrl: './evaluations.page.css',
  template: `<main class="page">
  <qai-page-header title="Workflow Evaluations" subtitle="Prove that an assistant gives the expected answer before it is connected to a live customer workflow.">
    <button class="button-secondary" (click)="createDataset()">+ Dataset</button>
    <button class="button-secondary" [disabled]="!selected" (click)="caseOpen=true">+ Test case</button>
    <button class="button-primary" [disabled]="!selected || !cases.length || !selectedAgentId || running" (click)="runSelected()">{{running ? 'Running…' : '▶ Run evaluation'}}</button>
  </qai-page-header>

  <section class="hero">
    <div>
      <span class="eyebrow">WHAT AN EVALUATION MEANS</span>
      <h2>Dataset alone is not a score</h2>
      <p>A dataset is a named regression suite. Add realistic test cases, select the assistant version, then compare each response against the expected business outcome. Results are stored so changes can be checked before release.</p>
    </div>
    <ol class="steps">
      <li><b>1</b><span>Dataset</span></li>
      <li><b>2</b><span>Test cases</span></li>
      <li><b>3</b><span>Assistant</span></li>
      <li><b>4</b><span>Evidence</span></li>
    </ol>
  </section>

  <div class="stack">
    <div class="alert" *ngIf="error">{{error}}</div>
    <div class="notice" *ngIf="message">{{message}}</div>
  </div>

  <section class="metric-grid" aria-label="Evaluation summary">
    <article class="metric"><span class="metric-top"><span class="metric-icon">▣</span><span class="metric-label">Datasets</span></span><strong>{{ rows.length }}</strong><small>Regression suites</small></article>
    <article class="metric"><span class="metric-top"><span class="metric-icon">✓</span><span class="metric-label">Test cases</span></span><strong>{{ cases.length }}</strong><small>Selected suite</small></article>
    <article class="metric"><span class="metric-top"><span class="metric-icon">◷</span><span class="metric-label">Runs</span></span><strong>{{ runs.length }}</strong><small>Evaluation history</small></article>
    <article class="metric"><span class="metric-top"><span class="metric-icon">◎</span><span class="metric-label">Active assistants</span></span><strong>{{ activeAgents.length }}</strong><small>Available evaluators</small></article>
  </section>

  <div class="content-grid">
    <section class="stack">
      <section class="card">
        <header class="card-header"><div><span class="eyebrow">REGRESSION SUITES</span><h3>Datasets</h3></div><span class="meta">{{ rows.length }} suites</span></header>
        <div class="list" *ngIf="rows.length">
          <button class="list-item" *ngFor="let dataset of rows" [class.active]="selected?.id===dataset.id" (click)="select(dataset)">
            <span class="stack"><b>{{dataset.name}}</b><small>{{dataset.description || 'No description yet'}}</small></span>
          </button>
        </div>
        <div class="empty" *ngIf="!rows.length">Create a dataset for acquisition, sales qualification, support or a specific workflow.</div>
      </section>

      <section class="card" *ngIf="selected; else emptyDataset">
        <header class="card-header">
          <div><span class="eyebrow">SELECTED DATASET</span><h2>{{selected.name}}</h2><p>{{selected.description || 'Define the customer situations and business outcomes this assistant must handle correctly.'}}</p></div>
          <label class="filter-group">Assistant<select [(ngModel)]="selectedAgentId"><option value="">Select active assistant</option><option *ngFor="let agent of activeAgents" [value]="agent.id">{{agent.name}} · {{agent.role}}</option></select></label>
        </header>
        <div class="card-body">
          <div class="section-header"><div><h3>Test cases</h3><p>Each case sends a realistic input to the selected assistant and checks whether the expected outcome is present.</p></div><span class="meta">{{cases.length}} cases</span></div>
          <div class="empty" *ngIf="!cases.length"><strong>No evidence yet</strong><p>Add the real questions, replies or scenarios you want this assistant to pass before release.</p><button class="button-primary" (click)="caseOpen=true">Add first test case</button></div>
          <div class="table" *ngIf="cases.length">
            <table><thead><tr><th>Customer input</th><th>Expected outcome</th><th>Expected tool</th><th></th></tr></thead><tbody>
              <tr *ngFor="let test of cases"><td>{{test.input}}</td><td>{{test.expectedAnswer}}</td><td>{{test.expectedTool || 'Answer only'}}</td><td><button class="button-quiet" (click)="removeCase(test)">Remove</button></td></tr>
            </tbody></table>
          </div>
        </div>
        <footer class="card-footer" *ngIf="runs.length">
          <div class="stack"><span class="eyebrow">RECENT RUNS</span><div class="list"><div class="list-item" *ngFor="let run of runs"><strong>{{run.overallScore|percent:'1.0-0'}}</strong><span class="meta">{{run.status}} · {{run.createdAtUtc|date:'medium'}}</span></div></div></div>
        </footer>
      </section>
      <ng-template #emptyDataset><section class="empty"><strong>Select a dataset</strong><span>Start with a regression suite, then add test cases.</span></section></ng-template>
    </section>

    <aside class="card">
      <header class="card-header"><div><span class="eyebrow">RELEASE GUIDE</span><h3>What to test</h3></div></header>
      <div class="list">
        <div class="list-item"><span class="stack"><b>Answer quality</b><small>Does it give the promised information?</small></span></div>
        <div class="list-item"><span class="stack"><b>Grounding</b><small>Does it stay within verified knowledge?</small></span></div>
        <div class="list-item"><span class="stack"><b>Tool choice</b><small>Does it choose the allowed business action?</small></span></div>
        <div class="list-item"><span class="stack"><b>Safe conversion</b><small>Does it ask approval before external action?</small></span></div>
      </div>
      <div class="card-body"><span class="eyebrow">CURRENT RESULT</span><p>{{cases.length ? 'Run the suite against an active assistant to produce evidence.' : 'No test cases configured — there is nothing meaningful to evaluate yet.'}}</p></div>
    </aside>
  </div>

  <qai-modal [open]="caseOpen" title="Add evaluation test case" (close)="caseOpen=false">
    <form class="form" (ngSubmit)="saveCase()">
      <label>Customer input<textarea [(ngModel)]="form.input" name="input" required placeholder="We need weekly transport of 18 pallets from Stuttgart to Milan."></textarea></label>
      <label>Expected outcome<input [(ngModel)]="form.expectedAnswer" name="expected" required placeholder="For example: I can help with that"></label>
      <label>Expected tool<input [(ngModel)]="form.expectedTool" name="tool" placeholder="Optional: CreateOpportunity"></label>
      <p class="meta">The evaluator compares the returned response with the expected outcome and records answer, grounding and tool checks.</p>
      <footer class="actions"><button class="button-secondary" type="button" (click)="caseOpen=false">Cancel</button><button class="button-primary" type="submit">Save test case</button></footer>
    </form>
  </qai-modal>
</main>`,
})
export class EvaluationsPage implements OnInit {
  rows: any[] = []; cases: any[] = []; runs: any[] = []; agents: any[] = []; selected: any; selectedAgentId = ''; running = false; caseOpen = false; error = ''; message = ''; form = { input: '', expectedAnswer: '', expectedTool: '' };
  constructor(private data: EvaluationsService) {}
  ngOnInit() { this.load(); this.data.agents().subscribe({ next: r => { this.agents = r || []; this.selectedAgentId = this.activeAgents[0]?.id || ''; }, error: () => undefined }); }
  get activeAgents() { return this.agents.filter(x => x.active); }
  load() { this.data.datasets().subscribe({ next: r => { this.rows = r || []; if (!this.selected && this.rows.length) this.select(this.rows[0]); }, error: e => this.error = this.apiError(e, 'Evaluation datasets could not be loaded.') }); }
  select(dataset: any) { this.selected = dataset; this.message = ''; this.data.cases(dataset.id).subscribe({ next: r => this.cases = r || [], error: e => this.error = this.apiError(e, 'Test cases could not be loaded.') }); this.data.runs(dataset.id).subscribe({ next: r => this.runs = r || [], error: () => this.runs = [] }); }
  createDataset() { const name = prompt('Dataset name'); if (!name?.trim()) return; const description = prompt('What should this suite prove?') || ''; this.data.create({ name: name.trim(), description }).subscribe({ next: r => { this.rows.unshift(r); this.select(r); }, error: e => this.error = this.apiError(e, 'Dataset could not be created.') }); }
  saveCase() { if (!this.selected || !this.form.input.trim() || !this.form.expectedAnswer.trim()) return; this.data.createCase(this.selected.id, this.form).subscribe({ next: r => { this.cases.push(r); this.form = { input: '', expectedAnswer: '', expectedTool: '' }; this.caseOpen = false; }, error: e => this.error = this.apiError(e, 'Test case could not be saved.') }); }
  removeCase(test: any) { if (!confirm('Remove this test case?')) return; this.data.deleteCase(test.id).subscribe({ next: () => this.cases = this.cases.filter(x => x.id !== test.id), error: e => this.error = this.apiError(e, 'Test case could not be removed.') }); }
  runSelected() { if (!this.selected || !this.selectedAgentId) return; this.running = true; this.error = ''; this.message = ''; this.data.run(this.selected.id, this.selectedAgentId).subscribe({ next: r => { this.running = false; this.runs.unshift(r.run); this.message = `${r.tests} test cases evaluated against ${r.agent}.`; }, error: e => { this.running = false; this.error = this.apiError(e, 'Evaluation could not run.'); } }); }
  private apiError(e: any, fallback: string) { return e?.error?.detail || e?.error?.title || (e?.status ? `${fallback} API returned ${e.status}.` : fallback); }
}
