import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Opportunity } from "../../core/models/platform.models";
import { Modal, PageHeader } from "../../shared/ui";
import { RefinedDataGrid } from "../../shared/components/refined-data-grid.component";
import { RefinedTabs } from "../../shared/components/refined-tabs.component";
import { CrmService } from "./crm.service";

interface SalesPipeline { id: string; name: string; isDefault: boolean; }
interface PipelineStage { id: string; pipelineId: string; name: string; sortOrder: number; probability: number; }
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader, RefinedDataGrid, RefinedTabs],
  styleUrls: ['./opportunities.page.css'],
  template: `
    <section class="page page-crm-opportunities">
      <qai-page-header title="Opportunities" subtitle="Manage qualified demand and move active deals through the sales process.">
        <button class="button-quiet" type="button" (click)="load()" [disabled]="loading">↻ {{ loading ? 'Loading…' : 'Refresh data' }}</button>
        <button class="button-primary" type="button" (click)="open()">+ Create Opportunity</button>
      </qai-page-header>
      <div class="callout warning" *ngIf="error"><span class="icon">!</span><div><b>Opportunities could not be loaded</b><p>{{ error }}</p></div></div>
      <qai-refined-tabs>
        <button [class.active]="activeTab==='All'" (click)="setTab('All')" type="button">All</button>
        <button [class.active]="activeTab==='Open'" (click)="setTab('Open')" type="button">Open</button>
        <button [class.active]="activeTab==='Won'" (click)="setTab('Won')" type="button">Won</button>
        <button [class.active]="activeTab==='Lost'" (click)="setTab('Lost')" type="button">Lost</button>
        <button [class.active]="activeTab==='Unassigned'" (click)="setTab('Unassigned')" type="button">Unassigned</button>
      </qai-refined-tabs>
      <qai-data-grid *ngIf="!loading && !error">
        <div class="toolbar">
          <label class="search"><span>⌕</span><input [(ngModel)]="q" placeholder="Search opportunities, companies, pipeline..." /></label>
          <select [(ngModel)]="pipelineFilter"><option value="">All pipelines</option><option *ngFor="let p of pipelines" [value]="p.id">{{ p.name }}</option></select>
          <button type="button" class="toolbar-button">▽ Filters</button>
          <button type="button" class="toolbar-button">↕ Sort</button>
          <span class="toolbar-spacer"></span>
          <button type="button" class="toolbar-button" (click)="load()">↻ Refresh</button>
        </div>
        <table>
          <thead><tr><th>Opportunity</th><th>Value</th><th>Pipeline / Stage</th><th>Status</th><th>Expected close</th><th>Source</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let x of visible">
              <td><div class="lead-person"><b>{{ x.name }}</b></div></td>
              <td>{{ money(x.amount) }}</td>
              <td><span class="status" [class.unassigned]="!x.pipelineStageId">{{ stageLabel(x) }}</span></td>
              <td><span class="status" [class.hot]="status(x.status)==='Won'">{{ status(x.status) }}</span></td>
              <td>{{ x.expectedCloseUtc ? (x.expectedCloseUtc | date:'mediumDate') : '—' }}</td>
              <td>{{ x.leadId ? 'Qualified lead / campaign' : 'Manual' }}</td>
              <td><div class="actions"><button class="small" (click)="open(x)">Edit</button></div></td>
            </tr>
            <tr class="empty" *ngIf="!visible.length"><td colspan="7"><strong>No opportunities available</strong><span>Create an opportunity or convert a qualified lead.</span></td></tr>
          </tbody>
        </table>
      </qai-data-grid>
      <qai-modal [open]="show" [title]="form.id ? 'Edit opportunity' : 'New opportunity'" (close)="show = false">
        <form class="form" (ngSubmit)="save()"><label>Name<input [(ngModel)]="form.name" name="name" required /></label>
          <div class="content-grid"><label>Amount<input type="number" [(ngModel)]="form.amount" name="amount" /></label><label>Status<select [(ngModel)]="form.status" name="status"><option [ngValue]="0">Open</option><option [ngValue]="1">Won</option><option [ngValue]="2">Lost</option></select></label></div>
          <div class="content-grid"><label>Sales pipeline<select [(ngModel)]="formPipelineId" name="pipeline" (ngModelChange)="choosePipeline($event)"><option value="">Assign later</option><option *ngFor="let pipeline of pipelines" [value]="pipeline.id">{{pipeline.name}}{{pipeline.isDefault ? ' · Default' : ''}}</option></select></label><label>Pipeline stage<select [(ngModel)]="form.pipelineStageId" name="stage" [disabled]="!formPipelineId"><option [ngValue]="undefined">Choose stage</option><option *ngFor="let stage of formStages" [value]="stage.id">{{stage.name}} · {{stage.probability}}%</option></select></label></div>
          <label>Expected close<input type="date" [(ngModel)]="closeDate" name="close" /></label><footer class="actions"><button class="button-quiet" type="button" (click)="show=false">Cancel</button><button class="button-primary" type="submit">Save opportunity</button></footer>
        </form>
      </qai-modal>
    </section>`,
})
export class OpportunitiesPage implements OnInit {
  rows: Opportunity[] = []; q = ""; activeTab = "All"; pipelineFilter = ""; pipelines: SalesPipeline[] = []; stages: PipelineStage[] = []; show = false; loading = false; error = ""; form: any = { status: 0, amount: 0 }; closeDate = ""; formPipelineId = "";
  constructor(private crm: CrmService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.error = ""; this.crm.opportunities().subscribe({ next: r => { this.rows = r || []; this.loading = false; }, error: e => { this.error = this.apiError(e); this.loading = false; } }); this.crm.salesPipelines().subscribe({ next: r => { this.pipelines = r?.pipelines || []; this.stages = r?.stages || []; }, error: e => { if (!this.error) this.error = this.apiError(e); } }); }
  get visible() { const q = this.q.trim().toLowerCase(); return this.rows.filter(x => { const s=this.status(x.status); const tab=this.activeTab==="All" || s===this.activeTab || (this.activeTab==="Unassigned" && !x.pipelineStageId); const pipeline=this.stage(x.pipelineStageId)?.pipelineId; const text=`${x.name||""} ${this.stageLabel(x)} ${x.leadId||""}`.toLowerCase(); return tab && (!this.pipelineFilter || pipeline===this.pipelineFilter) && (!q || text.includes(q)); } }
  setTab(tab: string) { this.activeTab = tab; }
  open(x?: Opportunity) { this.form = x ? { ...x } : { status: 0, amount: 0 }; this.formPipelineId = x?.pipelineStageId ? this.stage(x.pipelineStageId)?.pipelineId || "" : this.defaultPipeline?.id || ""; if (!x && this.formPipelineId) this.form.pipelineStageId = this.formStages[0]?.id; this.closeDate = x?.expectedCloseUtc ? String(x.expectedCloseUtc).slice(0, 10) : ""; this.show = true; }
  save() { this.form.expectedCloseUtc = this.closeDate ? new Date(this.closeDate).toISOString() : null; const desired = this.status(this.form.status); const op = this.form.id ? this.crm.updateOpportunity(this.form.id, this.form) : this.crm.createOpportunity(this.form); op.subscribe({ next: r => this.applyStatus(r, desired), error: e => this.error = this.apiError(e) }); }
  get defaultPipeline() { return this.pipelines.find(x => x.isDefault) || this.pipelines[0]; }
  get formStages() { return this.stages.filter(x => x.pipelineId === this.formPipelineId).sort((a,b) => a.sortOrder - b.sortOrder); }
  choosePipeline(id: string) { this.formPipelineId = id; this.form.pipelineStageId = this.formStages[0]?.id; }
  stage(id?: string) { return this.stages.find(x => x.id === id); }
  stageLabel(x: Opportunity) { const stage = this.stage(x.pipelineStageId); return stage ? `${this.pipelines.find(p => p.id === stage.pipelineId)?.name || 'Pipeline'} · ${stage.name}` : 'Unassigned'; }
  private applyStatus(r: Opportunity, desired: string) { const finish = (saved: Opportunity) => { const i = this.rows.findIndex(x => x.id === saved.id); i >= 0 ? (this.rows[i] = saved) : this.rows.unshift(saved); this.show = false; }; if (desired === this.status(r.status)) { finish(r); return; } if (desired === "Open") { this.crm.reopenOpportunity(r.id).subscribe({ next: finish, error: e => this.error = this.apiError(e) }); return; } const lossReason = desired === "Lost" ? prompt("Why was this opportunity lost?") || "Not specified" : ""; this.crm.closeOpportunity(r.id, desired === "Won", lossReason).subscribe({ next: finish, error: e => this.error = this.apiError(e) }); }
  money(v: number) { return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v || 0); }
  status(v: any) { return typeof v === "string" ? v : ["Open", "Won", "Lost"][v] || String(v); }
  private apiError(e: any) { return e?.error?.detail || e?.error?.title || (e?.status ? `CRM API returned ${e.status}.` : "CRM API is unavailable."); }
}
