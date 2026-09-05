import { Injectable } from '@angular/core';
import { ApiService } from '../../core/api.service';

export interface BillingSnapshot {
  tenantId: string;
  subscription: any;
  invoices: any[];
  events: any[];
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  constructor(private api: ApiService) {}
  plans() { return this.api.get<any[]>('billing/plans'); }
  usage() { return this.api.get<any[]>('billing/usage'); }
  subscription() { return this.api.get<any>('billing/subscription'); }
  invoices() { return this.api.get<any[]>('billing/invoices'); }
  snapshot(tenantId: string) { return this.api.get<BillingSnapshot>(`billing/tenants/${tenantId}`); }
}
