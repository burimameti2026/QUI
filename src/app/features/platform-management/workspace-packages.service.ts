import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';

export type WorkspacePackageId = 'fusionfleet-promotion' | 'qualifyai-acquisition' | 'blank';

export interface WorkspacePackage {
  id: WorkspacePackageId;
  name: string;
  description: string;
  requiredModules: string[];
}

export interface PackageInstallRequest {
  tenantId?: string;
  packageId: WorkspacePackageId;
}

@Injectable({ providedIn: 'root' })
export class WorkspacePackagesService {
  readonly packages: WorkspacePackage[] = [
    { id: 'fusionfleet-promotion', name: 'FusionFleet Promotion', description: 'ICP, campaign, acquisition agent and automation baseline.', requiredModules: ['crm','ai_agents','automations'] },
    { id: 'qualifyai-acquisition', name: 'QualifyAI Acquisition', description: 'Acquisition and revenue operations workspace baseline.', requiredModules: ['crm','ai_agents','automations'] },
    { id: 'blank', name: 'Blank Workspace', description: 'No package data; configure modules manually.', requiredModules: [] }
  ];

  constructor(private readonly api: ApiService) {}

  install(request: PackageInstallRequest): Observable<unknown> {
    if (request.packageId === 'blank') return this.api.post('workspace-packages/install', request);
    const path = request.tenantId ? `demo-scenarios/tenant/${request.tenantId}/install` : 'demo-scenarios/install';
    return this.api.post(path, {});
  }
}
