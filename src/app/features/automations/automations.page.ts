import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AutomationRule } from "../../core/models/platform.models";
import { Modal, PageHeader } from "../../shared/ui";
import { AutomationsService } from "./automations.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  styleUrl: "./automations.page.css",
  template: `<main class="page page-automations">
    <qai-page-header title="Automations" subtitle="Turn customer and sales signals into automated revenue actions.">
      <button class="button-secondary" (click)="openWorkspaceMode()">Workspace data mode</button>
      <button class="button-secondary" (click)="runAll()">▶ Run sales engine</button>
      <button class="button-primary" (click)="open()">+ New automation</button>
    </qai-page-header>

    <section class="hero">
      <div>
        <span class="eyebrow">AUTOMATION EVENT FLOW</span>
        <h2>What starts a rule and where it runs</h2>
        <p>A business signal is matched to an active rule. The rule records a run, checks conditions, executes actions and leaves a log or dead letter. Run executes directly in Platform API; Publish event sends a test trigger through RabbitMQ.</p>
      </div>
      <div class="steps">
        <span><b>1</b> Business signal</span>
        <span><b>2</b> Active rule</span>
        <span><b>3</b> Actions &amp; controls</span>
        <span><b>4</b> Run log / retry</span>
      </div>
    </section>

    <p class="notice success" *ngIf="publishedMessage">{{ publishedMessage }}</p>

    <section class="metric-grid automation-kpis">
      <article class="metric"><div class="metric-top"><span class="metric-icon">⚡</span><span class="metric-label">Total automations</span></div><strong>{{ rows.length }}</strong><small>Configured business rules</small></article>
      <article class="metric"><div class="metric-top"><span class="metric-icon">✓</span><span class="metric-label">Active</span></div><strong>{{ activeCount }}</strong><small>Rules currently enabled</small></article>
      <article class="metric"><div class="metric-top"><span class="metric-icon">!</span><span class="metric-label">Failed runs</span></div><strong>{{ failedCount }}</strong><small>Needs attention</small></article>
      <article class="metric"><div class="metric-top"><span class="metric-icon">◷</span><span class="metric-label">Last run</span></div><strong>{{ lastRun === 'Never' ? '—' : 'Live' }}</strong><small>{{ lastRun }}</small></article>
    </section>

    <section class="card">
      <header class="card-header">
        <div>
          <span class="eyebrow">Revenue automation</span>
          <h2>Automation rules</h2>
          <p>Review triggers, business actions and execution controls in one workspace.</p>
        </div>
        <div class="facts">
          <span><b>{{ rows.length }}</b>Total</span>
          <span><b>{{ activeCount }}</b>Active</span>
          <span><b>{{ failedCount }}</b>Failed runs</span>
        </div>
      </header>

      <div class="toolbar">
        <label class="search"><span>⌕</span><input [(ngModel)]="query" placeholder="Search automation or trigger" /></label>
        <select [(ngModel)]="statusFilter"><option value="">All statuses</option><option value="active">Active</option><option value="paused">Paused</option></select>
        <strong>{{ visibleRows.length }} shown · Last run {{ lastRun }}</strong>
      </div>

      <div class="table" *ngIf="visibleRows.length; else noAutomations">
        <table>
          <thead><tr><th>Automation</th><th>Trigger</th><th>Business actions</th><th>Status</th><th>Enabled</th><th>Actions</th></tr></thead>
          <tbody><tr *ngFor="let a of visibleRows">
            <td><div class="identity"><i>⚡</i><span><b>{{ a.name }}</b><small>{{ conditionSummary(a) }}</small></span></div></td>
            <td><span class="eyebrow">{{ a.trigger }}</span><small class="meta">{{ triggerMeaning(a.trigger) }}</small></td>
            <td>{{ actions(a) }}</td>
            <td><span class="status" [class.success]="a.active" [class.status-pending]="!a.active">{{ a.active ? 'Active' : 'Paused' }}</span></td>
            <td><label class="toggle" [attr.aria-label]="'Enable ' + a.name"><input type="checkbox" [(ngModel)]="a.active" (change)="toggle(a)" /><span></span></label></td>
            <td><div class="actions"><button (click)="run(a)">▶ Run now</button><button [disabled]="!a.active" (click)="publish(a)">Publish test event</button><button class="button-primary" (click)="open(a)">Edit</button></div></td>
          </tr></tbody>
        </table>
      </div>
      <ng-template #noAutomations><div class="empty"><i>⚡</i><strong>No automation rules found</strong><span>Adjust the filter or create a new automation.</span><button class="button-primary" (click)="open()">Create automation</button></div></ng-template>
    </section>

    <section class="card">
      <header class="card-header"><div><h2>Execution history</h2><p>Real action results and failures.</p></div><button class="button-secondary" (click)="load()">↻ Refresh</button></header>
      <div class="table" *ngIf="runs.length; else noRuns"><table><thead><tr><th>Started</th><th>Automation</th><th>Status</th><th>Execution log</th><th></th></tr></thead>
        <tbody><tr *ngFor="let run of runs"><td>{{ run.createdAtUtc | date:'short' }}</td><td>{{ ruleName(run.ruleId) }}</td><td><span class="status" [class.success]="run.status === 'completed'" [class.status-error]="run.status === 'failed'">{{ run.status }}</span></td><td><small>{{ runSummary(run) }}</small></td><td><button *ngIf="run.status === 'failed'" (click)="retry(run)">Retry</button></td></tr></tbody>
      </table></div>
      <ng-template #noRuns><div class="empty"><strong>No automation has executed yet.</strong><span>Execution history will appear here after the first run.</span></div></ng-template>
    </section>

    <section class="card" *ngIf="deadLetters.length">
      <header class="card-header"><div><h2>Dead-letter queue</h2><p>Runs that exhausted automatic retries.</p></div></header>
      <div class="table"><table><thead><tr><th>Created</th><th>Entity</th><th>Error</th><th>Status</th></tr></thead><tbody><tr *ngFor="let x of deadLetters"><td>{{ x.createdAtUtc | date:'short' }}</td><td>{{ x.entityType }}</td><td><small>{{ x.error }}</small></td><td><span class="status status-error">{{ x.status }}</span></td></tr></tbody></table></div>
    </section>

    <qai-modal [open]="show" [title]="form.id ? 'Edit automation' : 'Create revenue automation'" (close)="show = false">
      <form class="form" (ngSubmit)="save()">
        <label>Name<input [(ngModel)]="form.name" name="name" required /></label>
        <label>Trigger<select [(ngModel)]="form.trigger" name="trigger"><option>lead.score.changed</option><option>lead.qualified</option><option>conversation.sales_intent</option><option>ticket.sla_breach</option><option>meeting.booked</option><option>schedule.weekday</option></select></label>
        <label>Conditions JSON<textarea [(ngModel)]="form.conditionsJson" name="conditions"></textarea></label>
        <label>Actions JSON<textarea [(ngModel)]="form.actionsJson" name="actions"></textarea></label>
        <label class="list-item"><input type="checkbox" [(ngModel)]="form.active" name="active" /> Active</label>
        <footer class="actions"><button type="button" (click)="show = false">Cancel</button><button class="button-primary" type="submit">Save automation</button></footer>
      </form>
    </qai-modal>
  </main>`,
})
export class AutomationsPage implements OnInit {
  rows: AutomationRule[] = [];
  runs: any[] = [];
  deadLetters: any[] = [];
  show = false;
  lastRun = "Never";
  query = "";
  statusFilter = "";
  publishedMessage = "";
  form: any = { name: "Hot lead → pipeline", trigger: "lead.qualified", conditionsJson: '[{"field":"score","operator":">=","value":80}]', actionsJson: '[{"type":"createOpportunity"},{"type":"createTask"},{"type":"notifySales"}]', active: true };
  constructor(private data: AutomationsService, private router: Router) {}
  ngOnInit() { this.load(); }
  get activeCount() { return this.rows.filter(x => x.active).length; }
  get failedCount() { return this.runs.filter(x => x.status === "failed").length; }
  get visibleRows() {
    const term = this.query.trim().toLowerCase();
    return this.rows.filter(x => {
      const statusMatches = !this.statusFilter || (this.statusFilter === "active" ? x.active : !x.active);
      return statusMatches && (!term || `${x.name} ${x.trigger} ${this.actions(x)}`.toLowerCase().includes(term));
    });
  }
  load() {
    this.data.list().subscribe(r => this.rows = r);
    this.data.runs().subscribe(r => { this.runs = r; if (r.length) this.lastRun = new Date(r[0].createdAtUtc).toLocaleString(); });
    this.data.deadLetters().subscribe(r => this.deadLetters = r);
  }
  open(a?: AutomationRule) {
    this.form = a ? { ...a } : { name: "", trigger: "lead.qualified", conditionsJson: "[]", actionsJson: '[{"type":"notifySales"}]', active: true };
    this.show = true;
  }
  actions(a: AutomationRule) { try { return JSON.parse(a.actionsJson || "[]").map((x: any) => x.type || x.action || x).join(" → "); } catch { return a.actionsJson; } }
  conditionSummary(a: AutomationRule) { try { const conditions = JSON.parse(a.conditionsJson || "[]"); return conditions.length ? `${conditions.length} execution condition${conditions.length === 1 ? "" : "s"}` : "Runs whenever the event is received"; } catch { return "Custom execution conditions"; } }
  triggerMeaning(trigger: string) {
    const labels: Record<string, string> = { "lead.score.changed": "when a lead score changes", "lead.qualified": "when a lead reaches qualified status", "conversation.sales_intent": "when a conversation shows buying intent", "ticket.sla_breach": "when a customer issue risks its SLA", "meeting.booked": "when a meeting is confirmed", "schedule.weekday": "on the configured weekday schedule" };
    return labels[trigger] || "when this business event is received";
  }
  save() {
    try { JSON.parse(this.form.conditionsJson || "[]"); const actions = JSON.parse(this.form.actionsJson || "[]"); if (!Array.isArray(actions) || actions.length === 0) throw new Error(); }
    catch { alert("Conditions must be valid JSON and at least one action is required."); return; }
    const op = this.form.id ? this.data.update(this.form.id, this.form) : this.data.create(this.form);
    op.subscribe({ next: r => { const i = this.rows.findIndex(x => x.id === r.id); i >= 0 ? this.rows[i] = r : this.rows.unshift(r); this.show = false; }, error: e => alert(e?.error?.error || "Automation could not be saved.") });
  }
  toggle(a: AutomationRule) { this.data.update(a.id, a).subscribe(); }
  run(a: AutomationRule) { this.data.run(a.id).subscribe({ next: () => { this.lastRun = new Date().toLocaleString(); this.load(); }, error: e => alert(e?.error?.detail || "Automation execution failed.") }); }
  retry(run: any) { this.data.retry(run.id).subscribe({ next: () => this.load(), error: e => alert(e?.error?.detail || "Retry failed.") }); }
  publish(a: AutomationRule) { this.data.publishTrigger(a.id).subscribe({ next: r => this.publishedMessage = `Test event ${r.eventId} was published to RabbitMQ for “${a.name}”. Open execution history to see the consumer result.`, error: () => alert("Event could not be published. Check that the rule is active.") }); }
  ruleName(id: string) { return this.rows.find(x => x.id === id)?.name || id?.slice(0, 8) || "Unknown"; }
  runSummary(run: any) { try { return JSON.parse(run.logJson || "[]").map((x: any) => x.message || x).join(" · "); } catch { return run.logJson || "—"; } }
  runAll() { this.data.runSales().subscribe(r => { this.lastRun = new Date().toLocaleString(); alert(`Processed ${r.processed || 0} leads; ${r.opportunitiesCreated || 0} opportunities; ${r.tasksCreated || 0} tasks; ${r.pipelineCreated || 0} pipeline.`); }); }
  openWorkspaceMode() { void this.router.navigateByUrl("/dashboard"); }
}
