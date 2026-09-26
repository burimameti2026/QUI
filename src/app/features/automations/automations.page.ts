import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { AutomationRule } from "../../core/models/platform.models";
import { Modal, PageHeader } from "../../shared/ui";
import { RefinedDataGrid } from "../../shared/components/refined-data-grid.component";
import { RefinedTabs } from "../../shared/components/refined-tabs.component";
import { AutomationsService } from "./automations.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader, RefinedDataGrid, RefinedTabs],
  styleUrls: ["./automations.page.css"],
  template: `
    <section class="page page-automations">
      <qai-page-header title="Automations" subtitle="Manage business rules, triggers and execution controls.">
        <button class="button-quiet" type="button" (click)="load()">↻ Refresh data</button>
        <button class="button-secondary" type="button" (click)="runAll()">▶ Run sales engine</button>
        <button class="button-primary" type="button" (click)="open()">+ Create Automation</button>
      </qai-page-header>
      <div class="callout warning" *ngIf="publishedMessage"><span class="icon">!</span><div><b>Automation event</b><p>{{ publishedMessage }}</p></div></div>
      <qai-refined-tabs>
        <button [class.active]="statusFilter===''" (click)="statusFilter=''" type="button">All</button>
        <button [class.active]="statusFilter==='active'" (click)="statusFilter='active'" type="button">Active</button>
        <button [class.active]="statusFilter==='paused'" (click)="statusFilter='paused'" type="button">Paused</button>
        <button [class.active]="statusFilter==='failed'" (click)="statusFilter='failed'" type="button">Failed runs</button>
      </qai-refined-tabs>
      <div class="prospect-timeline-shell">
        <div class="prospect-timeline-toolbar">
          <label class="search"><span>⌕</span><input [(ngModel)]="query" placeholder="Search automations, triggers, actions..." /></label>
          <button type="button" class="toolbar-button">▽ Filters</button><button type="button" class="toolbar-button">↕ Sort</button>
          <span class="toolbar-spacer"></span><button type="button" class="toolbar-button" (click)="load()">↻ Refresh</button>
        </div>
        <div class="prospect-timeline">
          <article class="prospect-timeline-item" *ngFor="let a of visibleRows">
            <div class="prospect-timeline-rail"><span class="prospect-timeline-dot" [class.hot]="a.active" [class.muted]="!a.active"></span></div>
            <div class="prospect-timeline-date">{{ automationLastRun(a.id) }}</div>
            <div class="prospect-timeline-content">
              <div class="prospect-timeline-heading"><div><span class="eyebrow">AUTOMATION</span><h3>{{ a.name }}</h3></div><span class="status" [class.hot]="a.active">{{ a.active ? 'Active' : 'Paused' }}</span></div>
              <p class="prospect-timeline-summary">{{ a.trigger }} · {{ triggerMeaning(a.trigger) }}</p>
              <div class="prospect-timeline-meta"><span><b>{{ actions(a) }}</b></span><span>{{ conditionSummary(a) }}</span><div class="actions"><button class="small" (click)="run(a)">▶ Run</button><button class="small" [disabled]="!a.active" (click)="publish(a)">Test</button><button class="small button-primary" (click)="open(a)">Edit</button></div></div>
            </div>
          </article>
          <div class="prospect-timeline-empty" *ngIf="!visibleRows.length"><strong>No automations available</strong><span>Create an automation or change the current filter.</span></div>
        </div>
      </div>
      <div class="prospect-timeline-shell" *ngIf="runs.length || deadLetters.length">
        <div class="prospect-timeline-heading-bar"><span class="eyebrow">EXECUTION HISTORY</span><strong>{{ runs.length }} runs · {{ failedCount }} failed</strong></div>
        <div class="prospect-timeline execution-timeline">
          <article class="prospect-timeline-item" *ngFor="let run of runs">
            <div class="prospect-timeline-rail"><span class="prospect-timeline-dot" [class.hot]="run.status==='completed'" [class.muted]="run.status==='failed'"></span></div>
            <div class="prospect-timeline-date">{{ run.createdAtUtc | date:'medium' }}</div>
            <div class="prospect-timeline-content">
              <div class="prospect-timeline-heading"><div><span class="eyebrow">RUN</span><h3>{{ ruleName(run.ruleId) }}</h3></div><span class="status" [class.hot]="run.status==='completed'">{{ run.status }}</span></div>
              <p class="prospect-timeline-summary">{{ runSummary(run) }}</p>
              <div class="prospect-timeline-meta"><span>Run {{ run.id?.slice(0,8) }}</span><button class="small" *ngIf="run.status==='failed'" (click)="retry(run)">Retry</button></div>
            </div>
          </article>
        </div>
      </div>
      <qai-modal [open]="show" [title]="form.id ? 'Edit automation' : 'Create automation'" (close)="show=false"><form class="form" (ngSubmit)="save()"><label>Name<input [(ngModel)]="form.name" name="name" required /></label><label>Trigger<select [(ngModel)]="form.trigger" name="trigger"><option>lead.score.changed</option><option>lead.qualified</option><option>conversation.sales_intent</option><option>ticket.sla_breach</option><option>meeting.booked</option><option>schedule.weekday</option></select></label><label>Conditions JSON<textarea [(ngModel)]="form.conditionsJson" name="conditions"></textarea></label><label>Actions JSON<textarea [(ngModel)]="form.actionsJson" name="actions"></textarea></label><label class="list-item"><input type="checkbox" [(ngModel)]="form.active" name="active" /> Active</label><footer class="actions"><button type="button" (click)="show=false">Cancel</button><button class="button-primary" type="submit">Save automation</button></footer></form></qai-modal>
    </section>`,
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
      const statusMatches = !this.statusFilter || (this.statusFilter === "active" ? x.active : this.statusFilter === "paused" ? !x.active : this.failedCount > 0);
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
  automationLastRun(id: string) { const r=this.runs.find(x=>x.ruleId===id); return r?.createdAtUtc ? new Date(r.createdAtUtc).toLocaleDateString() : "Never"; }
  runSummary(run: any) { try { return JSON.parse(run.logJson || "[]").map((x: any) => x.message || x).join(" · "); } catch { return run.logJson || "—"; } }
  runAll() { this.data.runSales().subscribe(r => { this.lastRun = new Date().toLocaleString(); alert(`Processed ${r.processed || 0} leads; ${r.opportunitiesCreated || 0} opportunities; ${r.tasksCreated || 0} tasks; ${r.pipelineCreated || 0} pipeline.`); }); }
  openWorkspaceMode() { void this.router.navigateByUrl("/dashboard"); }
}
