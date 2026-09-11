import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

@Component({ selector:'qai-enterprise-operations', standalone:true, imports:[CommonModule,FormsModule], template:`<div class="page"><h1>Enterprise Operations</h1><p>Manage enterprise facilities, customers, pricing, orders, fulfillment, reservations, movements, shipments and payments.</p><div *ngIf="error" class="callout warning">{{error}}</div><button (click)="load()">Refresh</button></div>` })
export class EnterpriseOperationsPage {
  readonly api=inject(ApiService); error=''; saving=false; modal=false; formType='facility'; form:any={}; item:any={}; selectedFacilityId=''; capabilities:any[]=[]; section='orders'; statusKind='order'; statusOptions:string[]=[]; nextStatus=''; statusModal=false;
  load(){ this.api.get<any>('enterprise/operations').subscribe({next:()=>{},error:(e:unknown)=>{const err=e as {error?:{detail?:string}};this.error=err.error?.detail||'Enterprise operations could not be loaded.'}}) }
  openCapabilities(row:any){this.modal=true;this.formType='capabilities';this.selectedFacilityId=row.id;this.api.get<any[]>(`enterprise/facilities/${row.id}/capabilities`).subscribe({next:r=>this.capabilities=Array.isArray(r)?r:[],error:()=>this.capabilities=[]})}
  close(){this.modal=false}
  save(){this.saving=true;let request:any=this.form;let call:any;
    if(this.formType==='facility'){call=this.form.id?this.api.put(`enterprise/facilities/${this.form.id}`,request):this.api.post('enterprise/facilities',request)}
    else if(this.formType==='customer')call=this.api.post('enterprise/customers',request);
    else if(this.formType==='priceList')call=this.api.post('enterprise/price-lists',request);
    else if(this.formType==='priceItem')call=this.api.post(`enterprise/price-lists/${this.form.priceListId}/items`,request);
    else if(this.formType==='order')call=this.api.post('enterprise/orders',{...this.form,items:[this.item]});
    else if(this.formType==='fulfillment')call=this.api.post('enterprise/fulfillments',request);
    else if(this.formType==='reservation')call=this.api.post('enterprise/reservations',request);
    else if(this.formType==='movement')call=this.api.post('enterprise/movements',request);
    else if(this.formType==='shipment')call=this.api.post('enterprise/shipments',request);
    else if(this.formType==='payment')call=this.api.post('enterprise/payments',request);
    else if(this.formType==='capability')call=this.api.post(`enterprise/facilities/${this.selectedFacilityId}/capabilities`,request);
    else {this.saving=false;return}
    call.subscribe({next:()=>{this.saving=false;this.modal=false;this.load()},error:(e:unknown)=>{const err=e as {error?:{detail?:string}};this.saving=false;this.error=err.error?.detail||'Save failed.'}})
  }
  openStatus(row:any){this.selectedFacilityId=row.id;this.statusKind=this.section==='orders'?'order':this.section==='fulfillments'?'fulfillment':this.section==='movements'?'movement':this.section==='logistics'?'shipment':'payment';this.statusOptions=this.tab.status||[];this.nextStatus=String(row.status);this.statusModal=true}
  saveStatus(){const base:any={orders:'enterprise/orders',fulfillments:'enterprise/fulfillments',movements:'enterprise/movements',logistics:'enterprise/shipments',payments:'enterprise/payments'};const endpoint=base[this.section];if(!endpoint)return;this.api.post(`${endpoint}/${this.selectedFacilityId}/status`,this.nextStatus).subscribe({next:()=>{this.statusModal=false;this.load()},error:(e:unknown)=>{const err=e as {error?:{detail?:string}};this.error=err.error?.detail||'Status update failed.'}})}
}
