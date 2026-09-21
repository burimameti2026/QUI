import { Injectable, signal } from '@angular/core';
import { Observable, of, finalize, shareReplay, tap } from 'rxjs';
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
  private runtimeRequest?: Observable<TenantRuntime>;

  constructor(private api: ApiService) {}

  load(): Observable<TenantRuntime> {
    const cached = this.runtime();
    if (cached) return of(cached);
    if (this.runtimeRequest) return this.runtimeRequest;

    const request = this.api.get<TenantRuntime>('tenant-runtime').pipe(
      tap(x => this.runtime.set(x)),
      finalize(() => { this.runtimeRequest = undefined; }),
      shareReplay(1)
    );

    this.runtimeRequest = request;
    return request;
  }

  hasModule(code: string) {
    const requested = normalizeModuleCode(code);
    return this.runtime()?.modules?.some(x => normalizeModuleCode(x) === requested) ?? false;
  }

  isActive() {
    const r = this.runtime();
    return !!r && String(r.status).toLowerCase() === 'active' && String(r.licenseStatus).toLowerCase() === 'active';
  }
}
