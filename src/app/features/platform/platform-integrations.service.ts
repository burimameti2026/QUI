import { Injectable } from '@angular/core';
import { ApiService } from '../../core/api.service';

@Injectable({ providedIn: 'root' })
export class PlatformIntegrationsService {
  constructor(private api: ApiService) {}

  sso() { return this.api.get<any[]>('security/sso'); }
  retention() { return this.api.get<any[]>('security/retention'); }

  branding() { return this.api.get<any>('white-label/branding'); }
  updateBranding(input: any) { return this.api.put<any>('white-label/branding', input); }
  domains() { return this.api.get<any[]>('white-label/domains'); }

  industryPacks() { return this.api.get<any[]>('industry-packs'); }
  installIndustryPack(id: string) { return this.api.post<any>(`industry-packs/${id}/install`, {}); }

  audit() { return this.api.get<any[]>('platform/audit'); }
  revenueAttribution() { return this.api.get<any[]>('revenue/attribution'); }
}
