import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';

export type WorkspacePackageId = 'fusionfleet-promotion' | 'qualifyai-acquisition' | 'blank';
export interface WorkspacePackage { id: WorkspacePackageId; name: string; description: string; requiredModules: string[]; }
export interface PackageInstallRequest { tenantId?: string; packageId: WorkspacePackageId; }
export interface PackageInstallResult { packageId: string; scenario: string; prospects: number; campaigns: number; opportunities: number; meetings: number; tickets: number; automations: number; }

@Injectable({ providedIn: 'root' })
export class WorkspacePackagesService {
  readonly packages: WorkspacePackage[] = [
    { id: 'fusionfleet-promotion', name: 'FusionFleet Promotion', description: 'Logistics ICP, campaign, pipeline journey, daily acquisition automation and agent.', requiredModules: ['crm','ai_agents','automations'] },
    { id: 'qualifyai-acquisition', name: 'QualifyAI Acquisition', description: 'Revenue operations ICP, acquisition campaign, qualified opportunity journey, automation and agent.', requiredModules: ['crm','ai_agents','automations'] },
    { id: 'blank', name: 'Blank Workspace', description: 'No package data; configure modules manually.', requiredModules: [] }
  ];
  constructor(private readonly api: ApiService) {}
  install(request: PackageInstallRequest): Observable<PackageInstallResult> {
    const body={packageId:request.packageId};
    const path=request.tenantId?`workspace-packages/tenant/${request.tenantId}/install`:'workspace-packages/install';
    return this.api.post<PackageInstallResult>(path, body);
  }
}
