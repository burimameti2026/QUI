import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/api.service';

export interface ScenarioInstallResult {
  scenarioName?: string;
  message?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class PlatformManagementService {
  constructor(private readonly api: ApiService) {}

  installRealWorkspace(): Observable<ScenarioInstallResult> {
    return this.api.post<ScenarioInstallResult>('demo-scenarios/install', {});
  }
}
