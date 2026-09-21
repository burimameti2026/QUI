import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';

export interface ScenarioInstallResult {
  packageId?: string;
  scenario?: string;
  prospects?: number;
  campaigns?: number;
  opportunities?: number;
  meetings?: number;
  tickets?: number;
  automations?: number;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class PlatformManagementService {
  constructor(private readonly api: ApiService) {}

  installRealWorkspace(): Observable<ScenarioInstallResult> {
    return this.api.post<ScenarioInstallResult>('workspace-packages/install', { packageId: 'fusionfleet-promotion' });
  }
}
