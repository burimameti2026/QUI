import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PageHeader } from '../../shared/ui';

interface Overview { facilities:number; customers:number; orders:number; pendingOrders:number; stockItems:number; movementsInTransit:number; shipments:number; unpaidPayments:number; }

@Component({standalone:true,imports:[CommonModule,RouterLink,PageHeader],template:`
<qai-page-header title="Renova Operations" subtitle="Commercial, physical and financial operations in one tenant workspace."><button class="refresh" (click)="load()">↻ Refresh</button></qai-page-header>
<section class="tenant-bar"><div><span>WORKSPACE</span><strong>RENOVA</strong></div><small>Tenant-isolated operational data · RenovaPromotions</small></section>
<section class="metrics"><article *ngFor="let m of metrics"><span>{{m.label}}</span><strong>{{m.value}}</strong><small>{{m.note}}</small></article></section>
<section class="flow"><div><b>01 · COMMERCIAL</b><span>Customer → Order → Pricing → Fulfillment</span></div><i>→</i><div><b>02 · PHYSICAL</b><span>Stock → Warehouse → Shipment → Delivery</span></div><i>→</i><div><b>03 · FINANCIAL</b><span>Proforma → Invoice → Payment → Reconciliation</span></div></section>
<section class="grid"><a *ngFor="let m of modules" [routerLink]="m.route" class="card"><div class="icon" [class]="m.tone">{{m.icon}}</div><div><b>{{m.title}}</b><span>{{m.text}}</span></div><strong>→</strong></a></section>
<div *ngIf="error" class="error">{{error}}</div>
`,styles:[`:host{display:block;color:#172033}.refresh{border:1px solid #d8e0ea;background:#fff;border-radius:8px;padding:8px 12px;color:#315fbd;font-size:10px}.tenant-bar{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;margin:0 0 14px;border:1px solid #dfe5ed;border-radius:13px;background:linear-gradient(110deg,#fff,#f2f5f8)}.tenant-bar span{display:block;font-size:8px;color:#7b8798;letter-spacing:1px}.tenant-bar strong{display:block;margin-top:4px;font-size:17px;letter-spacing:.5px}.tenant-bar small{color:#718096;font-size:9px}.metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin-bottom:14px}.metrics article{padding:14px;border:1px solid #dfe5ed;border-radius:11px;background:#fff;box-shadow:0 5px 16px #1720330a}.metrics span,.metrics small{display:block;color:#718096;font-size:8px}.metrics strong{display:block;margin:10px 0 6px;font-size:22px}.flow{display:grid;grid-template-columns:1fr 28px 1fr 28px 1fr;align-items:center;padding:13px;margin-bottom:14px;border:1px solid #dfe5ed;border-radius:12px;background:#f5f7f9}.flow div{padding:7px 10px}.flow b,.flow span{display:block}.flow b{font-size:9px;letter-spacing:.5px}.flow span{margin-top:5px;color:#718096;font-size:8px}.flow i{text-align:center;color:#a0aec0;font-style:normal}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.card{display:flex;align-items:center;gap:10px;min-height:72px;padding:12px;border:1px solid #dfe5ed;border-radius:11px;background:#fff;color:inherit;text-decoration:none;transition:.16s}.card:hover{transform:translateY(-2px);border-color:#c6d2df;box-shadow:0 8px 20px #17203312}.icon{width:32px;height:32px;display:grid;place-items:center;border-radius:8px;background:#edf4ff;color:#2563eb;font-weight:800}.icon.green{background:#e3f8ed;color:#059669}.icon.red{background:#fff0f0;color:#c62828}.icon.violet{background:#f0ebff;color:#7c3aed}.icon.amber{background:#fff7df;color:#b7791f}.card div:nth-child(2){flex:1;min-width:0}.card b,.card span{display:block}.card b{font-size:10px}.card span{margin-top:3px;color:#718096;font-size:8px;line-height:1.4}.card>strong{color:#315fbd}.error{margin-top:14px;padding:12px;border:1px solid #fecdd3;background:#fff1f2;color:#9f1239;border-radius:9px;font-size:9px}@media(max-width:1050px){.metrics{grid-template-columns:repeat(3,1fr)}.grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:700px){.tenant-bar{display:block}.tenant-bar small{display:block;margin-top:7px}.metrics{grid-template-columns:repeat(2,1fr)}.flow{grid-template-columns:1fr;gap:4px}.flow i{transform:rotate(90deg)}.grid{grid-template-columns:1fr}}`]
})
export class EnterprisePage implements OnInit {
 private readonly api=inject(ApiService); data:Overview={facilities:0,customers:0,orders:0,pendingOrders:0,stockItems:0,movementsInTransit:0,shipments:0,unpaidPayments:0}; error='';
 readonly modules=[
  {route:'/enterprise/facilities',title:'Facilities',text:'Factories, warehouses and distribution points.',icon:'⌂',tone:'green'},
  {route:'/enterprise/orders',title:'Ordering',text:'B2C, B2B, distributor and partner orders.',icon:'▤',tone:'red'},
  {route:'/enterprise/inventory',title:'Inventory',text:'Stock, reservations and stock movements.',icon:'▥',tone:'violet'},
  {route:'/enterprise/warehousing',title:'Warehousing',text:'Receiving, picking, packing and dispatch.',icon:'▦',tone:'amber'},
  {route:'/enterprise/distribution',title:'Distribution',text:'Distribution points and local fulfillment.',icon:'◎',tone:'green'},
  {route:'/enterprise/logistics',title:'Logistics',text:'Shipments, routes and delivery execution.',icon:'↗',tone:'red'},
  {route:'/enterprise/payments',title:'Payments & Documents',text:'Proforma, invoices, receipts and payments.',icon:'€',tone:'violet'},
  {route:'/crm/companies',title:'Partners & Customers',text:'Commercial accounts and relationships.',icon:'◈',tone:'amber'},
  {route:'/discover',title:'Acquisition',text:'Prospects, qualification and opportunities.',icon:'⌕',tone:'green'},
  {route:'/automations',title:'Automation',text:'Workflows, agents, schedules and runs.',icon:'⚡',tone:'violet'},
  {route:'/analytics',title:'Analytics',text:'Operational and commercial performance.',icon:'▥',tone:'red'},
  {route:'/audit',title:'Governance',text:'Permissions, audit and lifecycle controls.',icon:'✓',tone:'amber'}
 ];
 get metrics(){return [{label:'Facilities',value:this.data.facilities,note:'Factories · warehouses · distribution'},{label:'Customers',value:this.data.customers,note:'Customer accounts'},{label:'Orders',value:this.data.orders,note:`${this.data.pendingOrders} pending`},{label:'Stock',value:this.data.stockItems,note:'Tracked balances'},{label:'Shipments',value:this.data.shipments,note:'Active shipments'},{label:'Payments',value:this.data.unpaidPayments,note:'Open payment states'}]}
 ngOnInit(){this.load()}
 load(){this.error='';this.api.get<Overview>('enterprise/overview').subscribe({next:x=>this.data=x,error:e=>this.error=e?.error?.detail||'Renova Enterprise API is unavailable.'})}
}
