import { Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { normalizeModuleCode } from './module-catalog';

export interface TenantRuntime {
  tenantId: string;
  status: string;
  plan?: string;
  licenseStatus?: string;
  maxUsers: number;
  startsAtUtc?: string;
  expiresAtUtc?: string;
  modules: string[];
  limits: Record<string, number>;
}

@Injectable({ providedIn: 'root' })
export class TenantRuntimeService {
  readonly runtime = signal<TenantRuntime | null>(null);
  constructor(private api: ApiService) {}
  load() { return this.api.get<TenantRuntime>('tenant-runtime').pipe(tap(x => this.runtime.set(x))); }
  hasModule(code: string) {
    const requested = normalizeModuleCode(code);
    return this.runtime()?.modules?.some(x => normalizeModuleCode(x) === requested) ?? false;
  }
  isActive() {
    const r = this.runtime();
    return !!r && String(r.status).toLowerCase() === 'active' && String(r.licenseStatus).toLowerCase() === 'active';
  }
}
