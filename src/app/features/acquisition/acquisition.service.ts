import { Injectable } from "@angular/core";
import { ApiService } from "../../core/api.service";

@Injectable({ providedIn: "root" })
export class AcquisitionService {
  constructor(private api: ApiService) {}

  campaigns() { return this.api.get<any[]>("acquisition/campaigns"); }
  campaignDetail(id: string) { return this.api.get<any>(`acquisition/campaigns/${id}`); }
  startCampaign(id: string) { return this.api.post<any>(`acquisition/campaigns/${id}/start`, {}); }
  pauseCampaign(id: string) { return this.api.post<any>(`acquisition/campaigns/${id}/pause`, {}); }
  resumeCampaign(id: string) { return this.api.post<any>(`acquisition/campaigns/${id}/resume`, {}); }
  stopCampaign(id: string) { return this.api.post<any>(`acquisition/campaigns/${id}/stop`, {}); }
  deleteCampaign(id: string) { return this.api.delete<any>(`acquisition/campaigns/${id}`); }
  saveCampaignPlan(id: string, planJson: string) { return this.api.put<any>(`acquisition/campaigns/${id}/plan`, { planJson }); }
  icps() { return this.api.get<any[]>(`acquisition/icp`); }
  saveIcp(input: any) { return this.api.post<any>(`acquisition/icp`, input); }
  createCampaign(input: any) { return this.api.post<any>(`acquisition/campaigns`, input); }
  prospects(minimumScore = 0) { return this.api.get<any[]>(`acquisition/prospects?minimumScore=${minimumScore}`); }
  targetLists() { return this.api.get<any[]>(`acquisition/target-lists`); }

  messages() { return this.api.get<any[]>("acquisition/messages"); }
  approve(id: string) { return this.api.post<any>(`email-operations/messages/${id}/approve`, {}); }
  requestApproval(id: string) { return this.api.post<any>(`email-operations/messages/${id}/request-approval`, {}); }
  rejectApproval(id: string) { return this.api.post<any>(`email-operations/messages/${id}/reject`, {}); }
  retryMessage(id: string) { return this.api.post<any>(`email-operations/messages/${id}/retry`, {}); }

  workspacePackages() { return this.api.get<any[]>("workspace-packages"); }
  buildWorkspacePackage(prompt: string) { return this.api.post<any>("workspace-packages/ai/build", { prompt }); }
  saveWorkspacePackage(input: any) { return this.api.post<any>("workspace-packages/save", input); }
}
