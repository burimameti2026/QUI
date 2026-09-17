import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PageHeader } from '../../shared/ui';

interface Tab { key: string; label: string; endpoint: string; create?: string; status?: string[]; }
interface MetricCard { label: string; value: number; tone: string; icon: string; note: string; }

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeader],
  template: `
    <qai-page-header [title]="title" [subtitle]="subtitle">
      <a routerLink="/enterprise" class="quiet-action">← Enterprise Operations</a>
      <button type="button" class="quiet-action" (click)="load()" [disabled]="loading">↻ Refresh</button>
      <button type="button" class="primary-action" *ngIf="canCreate" (click)="openCreate()">＋ New {{ title }}</button>
    </qai-page-header>
    <div class="breadcrumb"><a routerLink="/enterprise"></a><span>›</span><span>Enterprise Operations</span><span>›</span><strong>{{ title }}</strong></div>
    <nav class="tabs" aria-label="Enterprise modules">
      <a *ngFor="let t of tabs" [routerLink]="'/enterprise/'+t.key" [class.active]="section===t.key"><span class="tab-icon">{{ tabIcon(t.key) }}</span><span>{{t.label}}</span></a>
    </nav>
    <section class="metric-grid">
      <article class="metric-card" *ngFor="let card of summaryCards" [class]="'metric-card '+card.tone">
        <div class="metric-top"><span class="metric-icon">{{ card.icon }}</span><span class="metric-label">{{ card.label }}</span></div>
        <strong>{{ card.value | number }}</strong>
        <small>{{ card.note }}</small>
        <span class="metric-spark"></span>
      </article>
    </section>
    <section class="list-card">
      <header class="list-header">
        <div><span class="eyebrow">ENTERPRISE OPERATIONS</span><h2>{{ title }}</h2><p>{{ rows.length | number }} records in the current workspace.</p></div>
        <div class="header-actions"><button type="button" class="export-action" (click)="exportCsv()">⇩ Export <span>⌄</span></button><button type="button" class="quiet-action" (click)="load()" [disabled]="loading">↻ Refresh</button><button type="button" class="primary-action" *ngIf="canCreate" (click)="openCreate()">＋ New</button></div>
      </header>
      <div class="filters">
        <label class="search-box"><span>⌕</span><input [(ngModel)]="search" (ngModelChange)="invalidateDerived()" placeholder="Search number, client or product..." /></label>
        <label class="select-box"><span>Status</span><select [(ngModel)]="statusFilter" (ngModelChange)="invalidateDerived()"><option value="">All statuses</option><option *ngFor="let s of statusValues" [value]="s">{{s}}</option></select></label>
        <label class="select-box"><span>Client</span><select [(ngModel)]="clientFilter" (ngModelChange)="invalidateDerived()"><option value="">All clients</option><option *ngFor="let c of clientValues" [value]="c">{{c}}</option></select></label>
        <label class="date-box"><span>▣</span><input type="date" [(ngModel)]="dateFrom" (ngModelChange)="invalidateDerived()" title="From date" /><span>–</span><input type="date" [(ngModel)]="dateTo" (ngModelChange)="invalidateDerived()" title="To date" /></label>
        <button type="button" class="filter-button" (click)="clearFilters()">≡ Filters <span *ngIf="hasFilters">•</span></button>
      </div>
      <div class="alert alert-error" *ngIf="error"><strong>Live workspace warning</strong><span>{{error}}</span></div>
      <div class="table-wrap" *ngIf="!loading && !error && pagedRows.length">
        <table><thead><tr><th class="check-col"><input type="checkbox" [checked]="allPageSelected" (change)="togglePage($event)" /></th><th *ngFor="let c of columns">{{c}}</th><th *ngIf="hasStatus">Workflow</th><th class="actions-col">Actions</th></tr></thead>
          <tbody><tr *ngFor="let row of pagedRows; trackBy: trackRow"><td class="check-col"><input type="checkbox" [checked]="isSelected(row)" (change)="toggleRow(row)" /></td><td *ngFor="let k of keys" [class.primary-cell]="k==='number'||k==='code'"><ng-container *ngIf="k==='status'; else normalValue"><span class="status-chip" [ngClass]="statusTone(row[k])">{{ display(row,k) }}</span></ng-container><ng-template #normalValue><span [title]="display(row,k)">{{ display(row,k) }}</span></ng-template></td><td *ngIf="hasStatus"><button type="button" class="table-link" (click)="openStatus(row)">Update status</button></td><td class="row-actions"><button type="button" class="dots" (click)="openRowActions(row)" [attr.aria-label]="'Actions for '+display(row,keys[0]||'id')">•••</button></td></tr></tbody>
        </table>
      </div>
      <div class="state" *ngIf="loading"><span class="spinner"></span><strong>Loading data…</strong><span>Synchronizing this module with the Enterprise API.</span></div>
      <div class="state" *ngIf="!loading && !error && !filteredRows.length"><span class="state-icon">⌕</span><strong>{{ rows.length ? 'No matching records' : 'No Renova records yet' }}</strong><span>{{ rows.length ? 'Try another search or clear the filters.' : 'This tenant API returned no records for this module.' }}</span></div>
      <footer class="table-footer" *ngIf="!loading && !error && filteredRows.length"><span>Showing {{ pageStart + 1 }} – {{ pageEnd }} of {{ filteredRows.length | number }} {{ title.toLowerCase() }}</span><div class="pagination"><button type="button" (click)="previousPage()" [disabled]="page===1">‹</button><button type="button" *ngFor="let p of pageNumbers" [class.page-active]="p===page" (click)="goPage(p)">{{p}}</button><button type="button" (click)="nextPage()" [disabled]="page===pageCount">›</button></div></footer>
    </section>
  `,
  styleUrl: './enterprise-operations.page.css',
})
export class EnterpriseOperationsPage implements OnInit {
  private readonly api=inject(ApiService); private readonly route=inject(ActivatedRoute);
  section='facilities'; rows:any[]=[]; keys:string[]=[]; columns:string[]=[]; loading=false; error=''; modal=false; statusModal=false; rowActionModal=false; saving=false;
  formType=''; modalTitle=''; form:any={}; item:any={}; capabilities:any[]=[]; selectedFacilityId=''; selectedRow:any=null; statusKind=''; nextStatus=''; statusOptions:string[]=[];
  search=''; statusFilter=''; clientFilter=''; dateFrom=''; dateTo=''; page=1; pageSize=10; selected=new Set<any>();
  private filteredCache:any[]|null=null; private derivedKey=''; private statusCache:string[]=[]; private clientCache:string[]=[]; private summaryCache:MetricCard[]=[];
  readonly tenant=localStorage.getItem('qai-tenant')||'renova';
  readonly tabs:Tab[]=[
    {key:'facilities',label:'Objektet',endpoint:'enterprise/facilities',create:'facility'}, {key:'customers',label:'Klientët',endpoint:'enterprise/customers',create:'customer'}, {key:'price-lists',label:'Price Lists',endpoint:'enterprise/price-lists',create:'priceList'}, {key:'orders',label:'Porositë',endpoint:'enterprise/orders',create:'order',status:['Draft','Submitted','Confirmed','PartiallyFulfilled','Fulfilled','Cancelled']}, {key:'fulfillments',label:'Furnizimi',endpoint:'enterprise/fulfillments',create:'fulfillment',status:['pending','ready','picked-up','delivered','completed','cancelled']}, {key:'inventory',label:'Inventari',endpoint:'enterprise/stock'}, {key:'reservations',label:'Reservations',endpoint:'enterprise/reservations',create:'reservation'}, {key:'movements',label:'Stock Movements',endpoint:'enterprise/movements',create:'movement',status:['Requested','Approved','Prepared','Dispatched','InTransit','Received','Completed','Cancelled']}, {key:'warehousing',label:'Warehousing',endpoint:'enterprise/facilities'}, {key:'distribution',label:'Shpërndarja',endpoint:'enterprise/facilities'}, {key:'logistics',label:'Logistics',endpoint:'enterprise/shipments',create:'shipment',status:['Planned','Prepared','Dispatched','InTransit','Delivered','Cancelled']}, {key:'routes',label:'Routes',endpoint:'enterprise/routes'}, {key:'documents',label:'Dokumente',endpoint:'enterprise/documents'}, {key:'payments',label:'Payments',endpoint:'enterprise/payments',create:'payment',status:['Pending','Requested','PartiallyPaid','Paid','Failed','Refunded','Cancelled']}, {key:'finance',label:'Finance',endpoint:'enterprise/finance'}
  ];
  readonly labels:any={facilities:['Objektet','Menaxhoni objektet, kapacitetet dhe statusin operacional.'],customers:['Klientët','Menaxhoni klientët dhe llogaritë komerciale.'],'price-lists':['Price Lists','Commercial pricing and price-list items.'],orders:['Porositë','Menaxhoni të gjitha porositë, statuset dhe partnerët tuaj.'],fulfillments:['Furnizimi','Pickup and delivery execution.'],inventory:['Inventari','Stock balances and availability.'],reservations:['Reservations','Reserved stock against commercial demand.'],movements:['Stock Movements','Controlled facility-to-facility stock lifecycle.'],warehousing:['Warehousing','Warehouse operations using the facility network.'],distribution:['Shpërndarja','Distribution points and local fulfillment.'],logistics:['Logistics','Shipment and delivery execution.'],routes:['Routes','Route plans from the enterprise API.'],documents:['Dokumente','Proforma, invoice, receipt and credit-note records.'],payments:['Payments','Payment requests and financial status.'],finance:['Finance','Financial operations, invoices, payments and reconciliation.']};
  ngOnInit(){this.route.paramMap.subscribe(p=>{const next=p.get('section')||'facilities';if(this.section===next&&this.rows.length)return;this.section=next;this.resetView();this.load()})}
  resetView(){this.search='';this.statusFilter='';this.clientFilter='';this.dateFrom='';this.dateTo='';this.page=1;this.selected.clear();this.invalidateDerived()}
  invalidateDerived(){this.derivedKey='';this.filteredCache=null;this.statusCache=[];this.clientCache=[];this.summaryCache=[]}
  get title(){return this.labels[this.section]?.[0]||this.section} get subtitle(){return this.labels[this.section]?.[1]||''} get tab(){return this.tabs.find(x=>x.key===this.section)||this.tabs[0]} get canCreate(){return !!this.tab.create} get hasStatus(){return !!this.tab.status}
  private ensureDerived(){const key=[this.section,this.rows,this.search,this.statusFilter,this.clientFilter,this.dateFrom,this.dateTo].map(x=>typeof x==='object'?String(this.rows.length):String(x)).join('|');if(this.derivedKey===key&&this.filteredCache)return;this.derivedKey=key;const q=this.search.trim().toLowerCase();const from=this.dateFrom?new Date(this.dateFrom+'T00:00:00'):null;const to=this.dateTo?new Date(this.dateTo+'T23:59:59'):null;this.filteredCache=this.rows.filter(r=>{const text=Object.values(r||{}).join(' ').toLowerCase();const client=String(r?.companyName||r?.clientName||r?.companyId||r?.customerAccountId||'');const dates=Object.entries(r||{}).filter(([k,v])=>/AtUtc$|Date$/i.test(k)&&v).map(([,v])=>new Date(String(v))).filter(d=>!isNaN(d.getTime()));const inDate=!from&&!to||dates.length===0||dates.some(d=>(!from||d>=from)&&(!to||d<=to));return(!q||text.includes(q))&&(!this.statusFilter||String(r?.status||'')===this.statusFilter)&&(!this.clientFilter||client===this.clientFilter)&&inDate});this.statusCache=Array.from(new Set(this.rows.map(r=>r?.status).filter(Boolean).map(String)));this.clientCache=Array.from(new Set(this.rows.map(r=>r?.companyName||r?.clientName||r?.companyId||r?.customerAccountId).filter(Boolean).map(String))).sort();const all=this.rows||[];const count=(names:string[])=>all.filter(r=>names.includes(String(r?.status))).length;const total=all.length;this.summaryCache=this.section==='finance'?[{label:'Total',value:total,tone:'blue',icon:'€',note:'financial records'},{label:'Pending',value:count(['Pending','Requested']),tone:'amber',icon:'◷',note:'awaiting action'},{label:'Paid',value:count(['Paid','Completed']),tone:'green',icon:'✓',note:'completed payments'},{label:'Failed',value:count(['Failed','Cancelled']),tone:'rose',icon:'△',note:'exceptions'}]:[{label:'Total',value:total,tone:'blue',icon:'▦',note:'records in workspace'},{label:'Active',value:all.filter(r=>r?.isActive===true||!('isActive'in r)).length,tone:'green',icon:'✓',note:'active records'},{label:'In Process',value:count(['Draft','Submitted','Pending','Requested','InTransit']),tone:'amber',icon:'◷',note:'workflow records'},{label:'Completed',value:count(['Completed','Fulfilled','Paid','Delivered']),tone:'violet',icon:'✓',note:'completed records'},{label:'With Status',value:all.filter(r=>r?.status).length,tone:'rose',icon:'◎',note:'tracked workflow'}]}
  get statusValues(){this.ensureDerived();return this.statusCache} get clientValues(){this.ensureDerived();return this.clientCache} get filteredRows(){this.ensureDerived();return this.filteredCache||[]} get pageCount(){return Math.max(1,Math.ceil(this.filteredRows.length/this.pageSize))} get pageStart(){return Math.min((this.page-1)*this.pageSize,this.filteredRows.length)} get pageEnd(){return Math.min(this.pageStart+this.pageSize,this.filteredRows.length)} get pagedRows(){const page=Math.min(this.page,this.pageCount);const start=(page-1)*this.pageSize;return this.filteredRows.slice(start,start+this.pageSize)} get pageNumbers(){const count=this.pageCount;return Array.from({length:count},(_,i)=>i+1).slice(Math.max(0,this.page-3),Math.min(count,this.page+2))} get hasFilters(){return !!(this.search||this.statusFilter||this.clientFilter||this.dateFrom||this.dateTo)} get allPageSelected(){return this.pagedRows.length>0&&this.pagedRows.every(r=>this.selected.has(r))} get summaryCards(){this.ensureDerived();return this.summaryCache}
  tabIcon(key:string){const icons:any={facilities:'⌂',customers:'♧','price-lists':'≋',orders:'▣',fulfillments:'◫',inventory:'▱',reservations:'□',movements:'✣',warehousing:'▥',distribution:'▣',logistics:'▤',routes:'⌁',documents:'▤',payments:'▰',finance:'€'};return icons[key]||'•'}
  statusTone(value:any){const s=String(value||'').toLowerCase();if(['completed','fulfilled','paid','delivered','ready'].some(x=>s.includes(x)))return'green';if(['draft','submitted','confirmed','dispatched','intransit','picked-up'].some(x=>s.includes(x)))return'blue';if(['pending','requested','prepared','partially'].some(x=>s.includes(x)))return'amber';if(['cancelled','failed','refunded'].some(x=>s.includes(x)))return'rose';return'violet'}
  clearFilters(){this.resetView()}
  load(){if(this.loading)return;this.loading=true;this.error='';this.api.get<any[]>(this.tab.endpoint).subscribe({next:r=>{this.rows=Array.isArray(r)?r:[];if(this.section==='warehousing')this.rows=this.rows.filter(x=>x.type==='Warehouse');if(this.section==='distribution')this.rows=this.rows.filter(x=>x.type==='DistributionPoint');this.configure();this.page=1;this.invalidateDerived();this.loading=false},error:e=>{this.error=e?.error?.message||`Unable to load ${this.title}.`;this.rows=[];this.configure();this.invalidateDerived();this.loading=false}})}
  configure(){const sample=this.rows[0]||{};this.keys=Object.keys(sample).filter(k=>!['id','tenantId'].includes(k)).slice(0,8);this.columns=this.keys.map(k=>k.replace(/([A-Z])/g,' $1').replace(/^./,x=>x.toUpperCase()));}
  display(row:any,key:string){const value=row?.[key];if(value===null||value===undefined||value==='')return'—';if(typeof value==='boolean')return value?'Yes':'No';if(typeof value==='object')return JSON.stringify(value);return String(value)}
  trackRow(_:number,row:any){return row?.id||row?.number||row?.code||_}
  isSelected(row:any){return this.selected.has(row)}
  toggleRow(row:any){this.selected.has(row)?this.selected.delete(row):this.selected.add(row)}
  togglePage(event:Event){const checked=(event.target as HTMLInputElement).checked;this.pagedRows.forEach(row=>checked?this.selected.add(row):this.selected.delete(row))}
  previousPage(){if(this.page>1)this.page--} nextPage(){if(this.page<this.pageCount)this.page++} goPage(p:number){this.page=p}
  exportCsv(){const rows=this.filteredRows;if(!rows.length)return;const csv=[this.columns.join(','),...rows.map(r=>this.keys.map(k=>`"${this.display(r,k).replace(/"/g,'""')}"`).join(','))].join('\n');const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${this.section}.csv`;a.click();URL.revokeObjectURL(url)}
  openCreate(){this.modal=true} openStatus(row:any){this.selectedRow=row;this.statusModal=true} openRowActions(row:any){this.selectedRow=row;this.rowActionModal=true}
}
