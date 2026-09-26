import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Opportunity } from "../../core/models/platform.models";
import { Modal, PageHeader } from "../../shared/ui";
import { CrmService } from "./crm.service";

interface SalesPipeline { id: string; name: string; isDefault: boolean; }
interface PipelineStage { id: string; pipelineId: string; name: string; sortOrder: number; probability: number; }
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  styleUrls: ['./opportunities.page.css'],
  template: `<style>
.lifecycle{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:0;margin-top:18px}.lifecycle-item{position:relative;padding:14px 18px 14px 30px;border-top:1px solid var(--wl-border,#d8dde6);border-bottom:1px solid var(--wl-border,#d8dde6);background:#fff}.lifecycle-item:not(:last-child){border-right:0}.lifecycle-item:not(:first-child)::before{content:"";position:absolute;left:12px;top:50%;width:7px;height:7px;border-radius:50%;background:#6b7280;transform:translate(-50%,-50%)}.lifecycle-item strong{display:block;font-size:12px}.lifecycle-item small{display:block;margin-top:4px;color:#6b7280;font-size:11px}.timeline{position:relative;padding:4px 0 4px 28px}.timeline::before{content:"";position:absolute;left:9px;top:8px;bottom:8px;width:1px;background:var(--wl-border,#d8dde6)}.timeline-event{position:relative;display:grid;grid-template-columns:150px minmax(0,1fr) auto;gap:18px;align-items:center;padding:16px 0}.timeline-event::before{content:"";position:absolute;left:-23px;top:23px;width:9px;height:9px;border-radius:50%;background:#6b7280;border:3px solid #fff;box-shadow:0 0 0 1px var(--wl-border,#d8dde6)}.timeline-event .time{font-size:11px;color:#6b7280}.timeline-event .event-main strong{display:block;font-size:13px}.timeline-event .event-main small{display:block;margin-top:4px;color:#6b7280}.timeline-event .event-meta{text-align:right;white-space:nowrap}@media(max-width:900px){.lifecycle{grid-template-columns:1fr 1fr}.timeline-event{grid-template-columns:1fr auto;gap:8px}.timeline-event .time{grid-column:1/-1}.timeline-event .event-meta{grid-column:2;grid-row:2}}
</style><main class="page page-crm-opportunities">
    <qai-page-header title="Opportunities" subtitle="See exactly how qualified demand becomes a deal, then place it in the right sales process."><button class="button-quiet" (click)="load()">↻ Refresh</button><button class="button-primary" (click)="open()">+ Opportunity</button></qai-page-header>
    <div class="alert" *ngIf="error"><span class="icon">!</span><div><b>Opportunities could not be loaded</b><p>{{ error }}</p></div></div>
    <section class="hero conversion-guide"><div><span class="eyebrow">OPPORTUNITY LIFECYCLE</span><h2>From prospect to revenue</h2><p>Follow the same chronological activity language used across the CRM: source, qualification, opportunity, pipeline movement and outcome.</p></div><div class="lifecycle"><div class="lifecycle-item"><strong>Prospect</strong><small>Campaign / source</small></div><div class="lifecycle-item"><strong>Qualified</strong><small>Lead or reply</small></div><div class="lifecycle-item"><strong>Opportunity</strong><small>Commercial intent</small></div><div class="lifecycle-item"><strong>Pipeline</strong><small>Stage movement</small></div><div class="lifecycle-item"><strong>Outcome</strong><small>Won / lost</small></div></div></section>
    <section class="card">
      <header class="card-header"><div><span class="eyebrow">SALES PIPELINE</span><h2>Opportunity workspace</h2><p>Keep every commercial opportunity assigned to the correct sales process.</p></div><div class="facts"><span><b>{{ rows.length }}</b> Total</span></div></header>
      <div class="notice" *ngIf="loading">Loading opportunities…</div>
      <div class="empty" *ngIf="!loading && !error && !rows.length"><strong>No opportunities available</strong><span>There are no opportunities in this workspace yet. Convert a qualified lead or add an opportunity manually.</span><button class="button-primary" (click)="open()">Create opportunity</button></div>
      <div class="timeline" *ngIf="!loading && rows.length">
        <article class="timeline-event" *ngFor="let x of rows">
          <time class="time">{{ x.expectedCloseUtc ? (x.expectedCloseUtc | date:'mediumDate') : 'No close date' }}</time>
          <div class="event-main"><strong>{{ x.name }}</strong><small>{{ stageLabel(x) }} · {{ x.leadId ? 'Qualified lead / campaign' : 'Manual opportunity' }}</small></div>
          <div class="event-meta"><span class="status">{{ status(x.status) }}</span><div>{{ money(x.amount) }}</div><button class="small" (click)="open(x)">Edit</button></div>
        </article>
      </div>
    </section>
    <qai-modal [open]="show" [title]="form.id ? 'Edit opportunity' : 'New opportunity'" (close)="show = false"><form class="form" (ngSubmit)="save()"><label>Name<input [(ngModel)]="form.name" name="name" required /></label><div class="content-grid"><label>Amount<input type="number" [(ngModel)]="form.amount" name="amount" /></label><label>Status<select [(ngModel)]="form.status" name="status"><option [ngValue]="0">Open</option><option [ngValue]="1">Won</option><option [ngValue]="2">Lost</option></select></label></div><div class="content-grid"><label>Sales pipeline<select [(ngModel)]="formPipelineId" name="pipeline" (ngModelChange)="choosePipeline($event)"><option value="">Assign later</option><option *ngFor="let pipeline of pipelines" [value]="pipeline.id">{{pipeline.name}}{{pipeline.isDefault ? ' · Default' : ''}}</option></select></label><label>Pipeline stage<select [(ngModel)]="form.pipelineStageId" name="stage" [disabled]="!formPipelineId"><option [ngValue]="undefined">Choose stage</option><option *ngFor="let stage of formStages" [value]="stage.id">{{stage.name}} · {{stage.probability}}%</option></select><small *ngIf="!pipelines.length">Create a pipeline first, then assign this deal.</small></label></div><p class="notice" *ngIf="!form.pipelineStageId">This opportunity will remain unassigned until you choose a pipeline stage. It will not appear on any board.</p><label>Expected close<input type="date" [(ngModel)]="closeDate" name="close" /></label><footer class="actions"><button class="button-quiet" type="button" (click)="show = false">Cancel</button><button class="button-primary" type="submit">Save opportunity</button></footer></form></qai-modal>
  </main>`,
})
export class OpportunitiesPage implements OnInit {
  rows: Opportunity[] = []; pipelines: SalesPipeline[] = []; stages: PipelineStage[] = []; show = false; loading = false; error = ""; form: any = { status: 0, amount: 0 }; closeDate = ""; formPipelineId = "";
  constructor(private crm: CrmService) {}
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.error = ""; this.crm.opportunities().subscribe({ next: r => { this.rows = r || []; this.loading = false; }, error: e => { this.error = this.apiError(e); this.loading = false; } }); this.crm.salesPipelines().subscribe({ next: r => { this.pipelines = r?.pipelines || []; this.stages = r?.stages || []; }, error: e => { if (!this.error) this.error = this.apiError(e); } }); }
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
