import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Opportunity } from "../../core/models/platform.models";
import { Modal, PageHeader } from "../../shared/ui";
import { PipelineService } from "./pipeline.service";

import { PipelineService, PipelineStage, SalesPipeline } from "./pipeline.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  templateUrl: "./pipeline.page.html",
  styleUrl: "./pipeline.page.css",
})
export class PipelinePage implements OnInit {
  pipelines: SalesPipeline[] = [];
  stages: PipelineStage[] = [];
  opps: Opportunity[] = [];
  selectedId = "";
  view: "overview" | "board" | "configuration" = "overview";
  loading = false;
  saving = false;
  error = "";
  pipelineQuery = "";
  drag: Opportunity | null = null;
  selectedOpportunity: Opportunity | null = null;
  pipelineForm = { name: "", isDefault: false };
  stageForm = { name: "", probability: 0 };
  constructor(private data: PipelineService) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.loading = true;
    this.error = "";
    this.data.snapshot().subscribe({
      next: ({ sales, opportunities }) => {
        this.pipelines = sales.pipelines || [];
        this.stages = sales.stages || [];
        this.opps = opportunities || [];
        if (this.selectedId && !this.pipelines.some((x) => x.id === this.selectedId)) {
          this.selectedId = "";
          this.view = "overview";
        }
        this.loading = false;
      },
      error: (e) => {
        this.error = this.apiError(e, "Pipeline data could not be loaded.");
        this.loading = false;
      },
    });
  }
  open(pipeline: SalesPipeline, view: "board" | "configuration" = "board") {
    this.selectedId = pipeline.id;
    this.pipelineForm = { name: pipeline.name, isDefault: pipeline.isDefault };
    this.view = view;
  }
  back() {
    this.view = "overview";
    this.selectedId = "";
  }
  get selected() {
    return this.pipelines.find((x) => x.id === this.selectedId);
  }
  get visiblePipelines() {
    const term = this.pipelineQuery.trim().toLowerCase();
    return this.pipelines.filter((pipeline) => !term || pipeline.name.toLowerCase().includes(term));
  }
  get selectedStages() {
    return this.stages
      .filter((x) => x.pipelineId === this.selectedId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  get unassignedOpen() {
    return this.opps.filter(
      (x) => !x.pipelineStageId && this.opportunityStatus(x.status) === "Open",
    );
  }
  pipelineStages(id: string) {
    return this.stages
      .filter((x) => x.pipelineId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  pipelineOpps(id: string) {
    const ids = new Set(this.pipelineStages(id).map((x) => x.id));
    return this.opps.filter((x) => !!x.pipelineStageId && ids.has(x.pipelineStageId));
  }
  pipelineOpenOpps(id: string) {
    return this.pipelineOpps(id).filter((x) => this.opportunityStatus(x.status) === "Open");
  }
  pipelineValue(id: string) {
    return this.pipelineOpenOpps(id).reduce(
      (sum, x) => sum + Number(x.amount || 0),
      0,
    );
  }
  cards(id: string) {
    return this.opps.filter(
      (x) => x.pipelineStageId === id && this.opportunityStatus(x.status) === "Open",
    );
  }
  stageTotal(id: string) {
    return this.cards(id).reduce((sum, x) => sum + Number(x.amount || 0), 0);
  }
  get total() {
    return this.selectedId ? this.pipelineValue(this.selectedId) : 0;
  }
  get weighted() {
    return this.selectedStages.reduce(
      (sum, s) =>
        sum + this.stageTotal(s.id) * (Number(s.probability || 0) / 100),
      0,
    );
  }
  newPipeline() {
    this.selectedId = "";
    this.pipelineForm = { name: "", isDefault: this.pipelines.length === 0 };
    this.view = "configuration";
  }
  savePipeline() {
    const name = this.pipelineForm.name.trim();
    if (!name) return;
    this.saving = true;
    const request = this.selected
      ? this.data.updatePipeline(this.selected.id, {
          ...this.pipelineForm,
          name,
        })
      : this.data.createPipeline({ ...this.pipelineForm, name });
    request.subscribe({
      next: (p) => {
        const existing = this.pipelines.find((x) => x.id === p.id);
        existing ? Object.assign(existing, p) : this.pipelines.push(p);
        this.selectedId = p.id;
        this.saving = false;
      },
      error: (e) => {
        this.error = this.apiError(e, "Pipeline could not be saved.");
        this.saving = false;
      },
    });
  }
  addStage() {
    if (!this.selected || !this.stageForm.name.trim()) return;
    const input = {
      name: this.stageForm.name.trim(),
      probability: Number(this.stageForm.probability),
      sortOrder: this.selectedStages.length
        ? Math.max(...this.selectedStages.map((x) => Number(x.sortOrder || 0))) + 1
        : 0,
    };
    this.data.createStage(this.selected.id, input).subscribe({
      next: (s) => {
        this.stages.push(s);
        this.stageForm = { name: "", probability: 0 };
      },
      error: (e) =>
        (this.error = this.apiError(e, "Stage could not be added.")),
    });
  }
  saveStage(stage: PipelineStage) {
    this.data
      .updateStage(stage.pipelineId, stage.id, {
        name: stage.name,
        probability: Number(stage.probability),
        sortOrder: Number(stage.sortOrder),
      })
      .subscribe({
        next: (s) => Object.assign(stage, s),
        error: (e) =>
          (this.error = this.apiError(e, "Stage could not be saved.")),
      });
  }
  removeStage(stage: PipelineStage) {
    if (!confirm(`Delete stage “${stage.name}”?`)) return;
    this.data
      .deleteStage(stage.pipelineId, stage.id)
      .subscribe({
        next: () =>
          (this.stages = this.stages.filter((x) => x.id !== stage.id)),
        error: (e) =>
          (this.error = this.apiError(
            e,
            "Stage could not be deleted. Move its opportunities first.",
          )),
      });
  }
  dropOn(id: string) {
    const opportunity = this.drag;
    this.drag = null;
    if (!opportunity || opportunity.pipelineStageId === id) return;

    const before = opportunity.pipelineStageId;
    opportunity.pipelineStageId = id;
    this.data.move(opportunity.id, id).subscribe({
      next: (saved) => {
        Object.assign(opportunity, saved);
        this.load();
      },
      error: (e) => {
        opportunity.pipelineStageId = before;
        this.error = this.apiError(e, "Opportunity could not be moved.");
      },
    });
  }
  assignUnassigned(opportunity: Opportunity, stageId: string) {
    if (!stageId) return;
    const before = opportunity.pipelineStageId;
    opportunity.pipelineStageId = stageId;
    this.data.move(opportunity.id, stageId).subscribe({
      next: (saved) => {
        Object.assign(opportunity, saved);
        this.load();
      },
      error: (e) => {
        opportunity.pipelineStageId = before;
        this.error = this.apiError(e, "Opportunity could not be assigned.");
      },
    });
  }
  closeSelected(won: boolean) {
    if (!this.selectedOpportunity) return;
    const current = this.selectedOpportunity;
    const reason = won
      ? ""
      : (prompt("Why was this opportunity lost?") || "").trim();
    if (!won && !reason) return;
    this.data.closeOpportunity(current.id, won, reason).subscribe({
      next: (r) => {
        Object.assign(current, r);
        this.selectedOpportunity = null;
        this.load();
      },
      error: (e) =>
        (this.error = this.apiError(e, "Opportunity could not be closed.")),
    });
  }
  reopenSelected() {
    if (!this.selectedOpportunity) return;
    const current = this.selectedOpportunity;
    this.data.reopenOpportunity(current.id).subscribe({
      next: (r) => {
        Object.assign(current, r);
        this.selectedOpportunity = null;
        this.load();
      },
      error: (e) =>
        (this.error = this.apiError(e, "Opportunity could not be reopened.")),
    });
  }
  opportunityStatus(value: any) {
    if (typeof value === "string") return value;
    return ["Open", "Won", "Lost"][Number(value)] || String(value);
  }
  money(v: number) {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(v || 0);
  }
  get openOpportunities() {
    return this.opps.filter((x) => this.opportunityStatus(x.status) === "Open");
  }
  get openValue() {
    return this.openOpportunities.reduce((sum, x) => sum + Number(x.amount || 0), 0);
  }
  get wonValue() {
    return this.opps
      .filter((x) => this.opportunityStatus(x.status) === "Won")
      .reduce((sum, x) => sum + Number(x.amount || 0), 0);
  }
  get weightedValue() {
    const stageProbabilities = new Map(
      this.stages.map((stage) => [stage.id, Number(stage.probability || 0)]),
    );
    return this.openOpportunities.reduce(
      (sum, x) =>
        sum +
        Number(x.amount || 0) *
          (stageProbabilities.get(x.pipelineStageId || "") || 0) /
          100,
      0,
    );
  }
  private apiError(error: any, fallback: string) {
    return (
      error?.error?.detail ||
      error?.error?.error ||
      (error?.status ? `${fallback} API returned ${error.status}.` : fallback)
    );
  }
}
