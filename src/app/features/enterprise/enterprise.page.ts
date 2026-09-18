import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PageHeader } from '../../shared/ui';

interface Overview { facilities:number; customers:number; orders:number; pendingOrders:number; stockItems:number; movementsInTransit:number; shipments:number; unpaidPayments:number; }

@Component({standalone:true,imports:[CommonModule,RouterLink,PageHeader],template:`
<qai-page-header title="Enterprise Operations" subtitle="Commercial, physical and financial operations in one tenant workspace."><button class="refresh" (click)="load()">↻ Refresh</button></qai-page-header>
<section class="tenant-bar"><div><span>WORKSPACE</span><strong>Renova Workspace</strong></div><small>Tenant-isolated operational data · Enterprise operations</small></section>
<section class="metrics"><article *ngFor="let m of metrics"><span>{{m.label}}</span><strong>{{m.value}}</strong><small>{{m.note}}</small></article></section>
<section class="flow"><div><b>01 · COMMERCIAL</b><span>Customer → Order → Pricing → Fulfillment</span></div><i>→</i><div><b>02 · PHYSICAL</b><span>Stock → Warehouse → Shipment → Delivery</span></div><i>→</i><div><b>03 · FINANCIAL</b><span>Proforma → Invoice → Payment → Reconciliation</span></div></section>
<section class="grid"><a *ngFor="let m of modules" [routerLink]="m.route" class="card"><div class="icon" [class]="m.tone">{{m.icon}}</div><div><b>{{m.title}}</b><span>{{m.text}}</span></div><strong>→</strong></a></section>
<div *ngIf="error" class="error">{{error}}</div>
`,styles:[`:host{display:block;color:var(--enterprise-text)!important;background:var(--enterprise-bg)!important}
.tenant-bar,.metrics article,.flow,.card{border:0!important;border-radius:var(--enterprise-radius)!important;background:#fff!important;box-shadow:var(--enterprise-shadow)!important}
.tenant-bar{margin:0 20px 14px!important;padding:18px 22px!important}
.tenant-bar span{color:#98a2b3!important;font-weight:800!important;letter-spacing:.12em!important}
.tenant-bar strong{color:#202124!important}
.tenant-bar small{color:#667085!important}
.metrics{gap:12px!important;margin:0 20px 14px!important}
.metrics article{min-height:116px!important;padding:17px 18px!important}
.metrics span,.metrics small{color:#667085!important}
.metrics strong{color:#202124!important;font-size:24px!important}
.flow{margin:0 20px 14px!important;padding:16px!important;background:linear-gradient(110deg,#f1f6ff 0%,#f7f4ff 58%,#fff7ed 100%)!important}
.flow b{color:#202124!important;letter-spacing:.08em!important}
.flow span{color:#667085!important}
.flow i{color:#98a2b3!important}
.grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:14px!important;margin:0 20px!important}
.card{min-height:104px!important;padding:16px!important;gap:12px!important}
.card:hover{transform:translateY(-1px)!important;box-shadow:0 8px 24px rgba(16,24,40,.08)!important}
.icon,.icon.green,.icon.red,.icon.violet,.icon.amber{border:0!important;border-radius:9px!important;background:#fff7ed!important;color:#f97316!important}
.card b{color:#202124!important;font-size:12px!important}
.card span{color:#667085!important}
.card>strong{color:#f97316!important}
.refresh{border:0!important;border-radius:8px!important;background:#f97316!important;color:#fff!important;font-weight:700!important}
.error{margin:14px 20px 0!important;border:0!important;border-radius:9px!important;background:#fff1f2!important;color:#9f1239!important}
@media(max-width:1050px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
@media(max-width:700px){.grid{grid-template-columns:1fr!important}.metrics{grid-template-columns:repeat(2,1fr)!important}}
`]})
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
 load(){this.error='';this.api.get<Overview>('enterprise/overview').subscribe({next:x=>this.data=x,error:e=>this.error=e?.error?.detail||' Enterprise API is unavailable.'})}
}
