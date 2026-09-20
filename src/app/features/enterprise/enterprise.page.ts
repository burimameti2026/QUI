import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PageHeader } from '../../shared/ui';

interface Overview { facilities:number; customers:number; orders:number; pendingOrders:number; stockItems:number; movementsInTransit:number; shipments:number; unpaidPayments:number; }

@Component({standalone:true,imports:[CommonModule,RouterLink,PageHeader],template:`
<qai-page-header title="Enterprise Operations" subtitle="Commercial, physical and financial operations in one tenant workspace."><button class="button-quiet" (click)="load()">↻ Refresh</button></qai-page-header>
<section class="hero enterprise-hero"><div><span class="eyebrow">ENTERPRISE WORKSPACE</span><h2>One operational surface for commercial, physical and financial work.</h2><p>Navigate the enterprise lifecycle without decorative layers or competing visual treatments.</p></div><span class="status">Renova Workspace</span></section>
<section class="metric-grid"><article *ngFor="let m of metrics"><span>{{m.label}}</span><strong>{{m.value}}</strong><small>{{m.note}}</small></article></section>
<section class="card enterprise-flow"><header class="card-header"><div><span class="eyebrow">OPERATING MODEL</span><h3>Enterprise lifecycle</h3><p>Three connected operating stages from demand to reconciliation.</p></div></header><div class="card-body"><div class="enterprise-timeline"><div class="enterprise-timeline-track"></div><div><span>01</span><b>Commercial</b><small>Customer → Order → Pricing → Fulfillment</small></div><div><span>02</span><b>Physical</b><small>Stock → Warehouse → Shipment → Delivery</small></div><div><span>03</span><b>Financial</b><small>Proforma → Invoice → Payment → Reconciliation</small></div></div></div></section>
<section class="content-grid enterprise-module-grid"><a *ngFor="let m of modules" [routerLink]="m.route" class="card enterprise-module"><div class="icon">{{m.icon}}</div><div><b>{{m.title}}</b><span>{{m.text}}</span></div><strong>→</strong></a></section>
<div *ngIf="error" class="error">{{error}}</div>
`})
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
