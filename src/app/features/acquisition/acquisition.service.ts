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
    return this.api.post<any>(`acquisition/icp/${icpId}/discover`, input, 90000);
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
    return this.api.post<any>("acquisition/prospects/import/preview", form, 60000);
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
    return this.api.post<any>(`ai-campaign-operator/tenants/${tenantId}/prepare`, input, 120000);
  }
  aiStart(tenantId: string, campaignId: string) {
    return this.api.post<any>(`ai-campaign-operator/tenants/${tenantId}/campaigns/${campaignId}/start`, {});
  }
  aiStatus(tenantId: string, campaignId: string) {
    return this.api.get<any>(`ai-campaign-operator/tenants/${tenantId}/campaigns/${campaignId}/status`, 30000);
  }
  campaignHistory(filters: any = {}) {
    const params = Object.entries(filters)
      .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    return this.api.get<any>(`acquisition/campaigns/history${params ? '?' + params : ''}`);
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
  saveContainerConfiguration(campaignId: string, containerId: string, configurationJson: string) {
    return this.api.put<any>(`acquisition/campaigns/${campaignId}/containers/${containerId}/configuration`, { configurationJson });
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
  containerActivity(campaignId: string, containerId: string, taskId?: string | null) {
    // Campaign Designer passes a persisted task ID when viewing one step's logs.
    // The API supports taskId and stepType as separate filters; do not send a GUID
    // as stepType or the filter will silently return an empty activity list.
    const suffix = taskId ? `?taskId=${encodeURIComponent(taskId)}` : '';
    return this.api.get<any[]>(`acquisition/campaigns/${campaignId}/containers/${containerId}/activity${suffix}`);
  }
  messages() {
    return this.api.get<any[]>("acquisition/campaigns/messages");
  }
  requestApproval(id: string) {
    return this.api.post<any>(
      `email-operations/messages/${id}/request-approval`,
      {},
    );
  }
  rejectApproval(id: string) {
    return this.api.post<any>(
      `email-operations/messages/${id}/reject`,
      {},
    );
  }
  approve(id: string) {
    return this.approveAndSend(id);
  }
  approveAndSend(id: string) {
    return this.api.post<any>(
      `email-operations/messages/${id}/approve`,
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
  runAutonomousCampaign(tenantId: string, id: string) {
    return this.aiStart(tenantId, id);
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
