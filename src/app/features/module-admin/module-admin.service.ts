import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../core/api.service';

export interface PlanDefinition { code:string; name:string; defaultMaxUsers:number; modules:string[] }
export interface LicenseCatalog { modules:string[]; plans:PlanDefinition[] }
export interface TenantEntitlements { tenantId:string; plan:string; licenseStatus:string; isUsable:boolean; maxUsers:number; startsAtUtc:string; expiresAtUtc:string|null; version:number; modules:string[]; }
export interface TenantSummary { id:string; name:string; slug:string; contactEmail:string; status:string; createdAtUtc:string; updatedAtUtc:string }
export interface ProvisioningModule { moduleCode:string; status:string; attemptCount:number; lastError:string|null; lastAttemptAtUtc:string|null; completedAtUtc:string|null; nextRetryAtUtc:string|null; updatedAtUtc:string }
export interface ProvisioningStatus { tenantId:string; modules:ProvisioningModule[] }
export interface TenantLifecycleEvent { tenantId:string; type:string; status:string; message:string; occurredAtUtc:string; data:Record<string,string>|null }
export interface TenantAlert { id:string; tenantId:string; severity:string; type:string; message:string; createdAtUtc:string; acknowledged:boolean }

@Injectable({providedIn:'root'})
export class ModuleAdminService {
  private readonly identity='/identity/api/identity';
  constructor(private api:ApiService,private http:HttpClient){}
  catalog(){return this.http.get<LicenseCatalog>(`${this.identity}/licenses/catalog`)} tenants(){return this.http.get<TenantSummary[]>(`${this.identity}/tenants`)}
  createTenant(payload:{name:string;slug:string;contactEmail:string}){return this.http.post<TenantSummary>(`${this.identity}/tenants`,payload)}
  createTenantAdmin(tenantId:string,payload:{email:string;password:string;firstName:string;lastName:string}){return this.http.post<any>(`${this.identity}/tenants/${tenantId}/admin`,payload)}
  entitlements(tenantId:string){return this.http.get<TenantEntitlements>(`${this.identity}/licenses/tenant/${tenantId}/entitlements`)}
  assign(tenantId:string,payload:{plan:string;startsAtUtc:string;maxUsers:number;expiresAtUtc:string|null;modules:string[]}){return this.http.post<TenantEntitlements>(`${this.identity}/licenses/tenant/${tenantId}`,payload)}
  update(tenantId:string,payload:{plan:string;maxUsers:number;expiresAtUtc:string|null;modules:string[]}){return this.http.put<void>(`${this.identity}/licenses/tenant/${tenantId}`,payload)}
  activate(tenantId:string){return this.http.post<void>(`${this.identity}/licenses/tenant/${tenantId}/activate`,{})} suspend(tenantId:string){return this.http.post<void>(`${this.identity}/licenses/tenant/${tenantId}/suspend`,{})}
  activateTenant(tenantId:string){return this.http.post<void>(`${this.identity}/tenants/${tenantId}/activate`,{})} suspendTenant(tenantId:string){return this.http.post<void>(`${this.identity}/tenants/${tenantId}/suspend`,{})}
  loadPresentationDemo(tenantId:string){return this.api.post<any>(`demo-scenarios/tenant/${tenantId}/reset-and-install`,{})}
  provisioning(tenantId:string){return this.api.get<ProvisioningStatus>(`admin/tenants/${tenantId}/provisioning`)}
  lifecycle(tenantId:string){return this.api.get<TenantLifecycleEvent[]>(`tenant-lifecycle/${tenantId}?take=100`)}
  alerts(tenantId:string){return this.api.get<TenantAlert[]>(`tenant-alerts/${tenantId}?take=100`)}
  acknowledgeAlert(tenantId:string,alertId:string){return this.api.post<void>(`tenant-alerts/${tenantId}/${alertId}/acknowledge`,{})}
  retryModule(tenantId:string,moduleCode:string){return this.api.post<any>(`admin/tenants/${tenantId}/provisioning/${encodeURIComponent(moduleCode)}/retry`,{})}
  retryFailed(tenantId:string){return this.api.post<any>(`admin/tenants/${tenantId}/provisioning/retry-failed`,{})}
}
