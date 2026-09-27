import { Injectable } from "@angular/core";
import { ApiService } from "../../core/api.service";

@Injectable({ providedIn: "root" })
export class AcquisitionService {
  constructor(private api: ApiService) {}
  overview() {
    return this.api.get<any>("acquisition/overview");
  }
  icps() {
    return this.api.get<any[]>("acquisition/icp");
  }
  createIcp(input: any) {
    return this.api.post<any>("acquisition/icp", input);
  }
  saveIcp(input: any) {
    return this.api.post<any>("acquisition/icp", input);
  }
  discoveryProviders() {
    return this.api.get<any[]>("acquisition/discovery/providers");
  }
  discoverOnline(icpId: string, input: any) {
    return this.api.post<any>(`acquisition/icp/${icpId}/discover`, input);
  }
  prospects(minimumScore = 0) {
    return this.api.get<any[]>(
      `acquisition/prospects?minimumScore=${minimumScore}`,
    );
  }
  addProspect(input: any) {
    return this.api.post<any>("acquisition/prospects", input);
  }
  importProspects(input: any) {
    return this.api.post<any>("acquisition/prospects/import", input);
  }
  previewProspectImport(file: File, sheetName = "", headerRow?: number) {
    const form = new FormData();
    form.append("file", file);
    if (sheetName) form.append("sheetName", sheetName);
    if (headerRow) form.append("headerRow", String(headerRow));
    return this.api.post<any>("acquisition/prospects/import/preview", form);
  }
  addSignal(id: string, input: any) {
    return this.api.post<any>(`acquisition/prospects/${id}/signals`, input);
  }
  targetLists() {
    return this.api.get<any[]>("acquisition/target-lists");
  }
  createTargetList(input: any) {
    return this.api.post<any>("acquisition/target-lists", input);
  }
  addMembers(id: string, prospectIds: string[]) {
    return this.api.post<any>(
      `acquisition/target-lists/${id}/members`,
      prospectIds,
    );
  }
  aiPrepare(tenantId: string, input: any) {
    return this.api.post<any>(`ai-campaign-operator/tenants/${tenantId}/prepare`, input);
  }
  aiStart(tenantId: string, campaignId: string) {
    return this.api.post<any>(`ai-campaign-operator/tenants/${tenantId}/campaigns/${campaignId}/start`, {});
  }
  aiStatus(tenantId: string, campaignId: string) {
    return this.api.get<any>(`ai-campaign-operator/tenants/${tenantId}/campaigns/${campaignId}/status`);
  }
  campaignHistory(filters: any = {}) {
    const params = Object.entries(filters)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    return this.api.get<any>(`acquisition/campaign-history${params ? '?' + params : ''}`);
  }
  campaigns() {
    return this.api.get<any[]>("acquisition/campaigns");
  }
  containers(campaignId: string) {
    return this.api.get<any[]>(`acquisition/campaigns/${campaignId}/containers`);
  }
  setContainerTargetList(campaignId: string, containerId: string, targetListId: string | null) {
    return this.api.put<any>(`acquisition/campaigns/${campaignId}/containers/${containerId}/target-list`, { targetListId });
  }
  startContainer(campaignId: string, containerId: string) {
    return this.api.post<any>(`acquisition/campaigns/${campaignId}/containers/${containerId}/start`, {});
  }
  stopContainer(campaignId: string, containerId: string) {
    return this.api.post<any>(`acquisition/campaigns/${campaignId}/containers/${containerId}/stop`, {});
  }
  campaignActivity(id: string) {
    return this.api.get<any[]>(`acquisition/campaigns/${id}/activity`);
  }
  containerActivity(campaignId: string, containerId: string, stepType?: string | null) {
    const suffix = stepType ? `?stepType=${encodeURIComponent(stepType)}` : '';
    return this.api.get<any[]>(`acquisition/campaigns/${campaignId}/containers/${containerId}/activity${suffix}`);
  }
  messages() {
    return this.api.get<any[]>("acquisition/messages");
  }
  requestApproval(id: string) {
    return this.api.post<any>(
      `email-operations/messages/${id}/request-approval`,
      {},
    );
  }
  rejectApproval(id: string) {
    return this.api.post<any>(
      `email-operations/messages/${id}/reject-approval`,
      {},
    );
  }
  approve(id: string) {
    return this.approveAndSend(id);
  }
  approveAndSend(id: string) {
    return this.api.post<any>(
      `email-operations/messages/${id}/approve-and-send`,
      {},
    );
  }
  retryMessage(id: string) {
    return this.api.post<any>(`email-operations/messages/${id}/retry`, {});
  }
  createCampaign(input: any) {
    return this.api.post<any>("acquisition/campaigns", input);
  }
  startCampaign(id: string) {
    return this.api.post<any>(`acquisition/campaigns/${id}/start`, {});
  }
  pauseCampaign(id: string) {
    return this.api.post<any>(`acquisition/campaigns/${id}/pause`, {});
  }
  resumeCampaign(id: string) {
    return this.api.post<any>(`acquisition/campaigns/${id}/resume`, {});
  }
  stopCampaign(id: string) {
    return this.api.post<any>(`acquisition/campaigns/${id}/stop`, {});
  }
  deleteCampaign(id: string) {
    return this.api.delete<any>(`acquisition/campaigns/${id}`);
  }
  runAutonomousCampaign(id: string) {
    return this.startCampaign(id);
  }
  campaignDetail(id: string) {
    return this.api.get<any>(`acquisition/campaigns/${id}`);
  }
  saveCampaignPlan(id: string, planJson: string) {
    return this.api.put<any>(`acquisition/campaigns/${id}/plan`, { planJson });
  }
  saveCampaignMessages(id: string, steps: any[]) {
    return this.api.put<any>(`acquisition/campaigns/${id}/messages`, { steps });
  }
}
