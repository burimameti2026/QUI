import { Injectable } from "@angular/core";
import { forkJoin } from "rxjs";
import { ApiService } from "../../core/api.service";
import { Opportunity } from "../../core/models/platform.models";

export interface SalesPipeline {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  sortOrder: number;
  probability: number;
}

export interface PipelineSnapshot {
  pipelines: SalesPipeline[];
  stages: PipelineStage[];
  opportunities: Opportunity[];
}

@Injectable({ providedIn: "root" })
export class PipelineService {
  constructor(private api: ApiService) {}

  snapshot() {
    return forkJoin({
      sales: this.api.get<{ pipelines?: SalesPipeline[]; stages?: PipelineStage[] }>("sales/pipelines"),
      opportunities: this.api.get<Opportunity[]>("crm/opportunities"),
    });
  }

  move(id: string, stageId: string) {
    return this.api.put<Opportunity>(`crm/opportunities/${id}/stage`, { stageId });
  }

  createPipeline(input: Pick<SalesPipeline, "name" | "isDefault">) {
    return this.api.post<SalesPipeline>("sales/pipelines", input);
  }

  updatePipeline(id: string, input: Pick<SalesPipeline, "name" | "isDefault">) {
    return this.api.put<SalesPipeline>(`sales/pipelines/${id}`, input);
  }

  createStage(pipelineId: string, input: Pick<PipelineStage, "name" | "sortOrder" | "probability">) {
    return this.api.post<PipelineStage>(`sales/pipelines/${pipelineId}/stages`, input);
  }

  updateStage(pipelineId: string, stageId: string, input: Pick<PipelineStage, "name" | "sortOrder" | "probability">) {
    return this.api.put<PipelineStage>(
      `sales/pipelines/${pipelineId}/stages/${stageId}`,
      input,
    );
  }

  deleteStage(pipelineId: string, stageId: string) {
    return this.api.delete<void>(`sales/pipelines/${pipelineId}/stages/${stageId}`);
  }

  closeOpportunity(id: string, won: boolean, lossReason = "") {
    return this.api.post<Opportunity>(`crm/opportunities/${id}/close`, { won, lossReason });
  }

  reopenOpportunity(id: string) {
    return this.api.post<Opportunity>(`crm/opportunities/${id}/reopen`, {});
  }
}
