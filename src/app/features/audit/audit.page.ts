import { CommonModule } from '@angular/common';
import { Component,OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { PageHeader } from '../../shared/ui';

@Component({standalone:true,imports:[CommonModule,FormsModule,PageHeader],template:`
<main class="page">
<qai-page-header title="Audit Log" subtitle="Review security-sensitive actions, configuration changes and automated executions."><div class="page-actions"><button class="button-quiet" type="button" (click)="exportCsv()">Export CSV</button></div></qai-page-header>
<section class="card"><header class="card-header"><div><span class="eyebrow">SECURITY & GOVERNANCE</span><h2>Audit activity</h2><p>Review platform actions and automated executions.</p></div><span class="meta">{{visible.length}} shown</span></header>
<div class="toolbar"><label class="search"><span>⌕</span><input [(ngModel)]="q" placeholder="Search action, entity, user"></label></div>
<div class="table"><table><thead><tr><th>Time</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>User</th></tr></thead><tbody><tr *ngFor="let x of visible"><td>{{x.createdAtUtc|date:'short'}}</td><td><b>{{x.action}}</b></td><td>{{x.entityType}}</td><td><code>{{x.entityId}}</code></td><td>{{x.userId||'System / Automation'}}</td></tr></tbody></table></div>
<div class="empty" *ngIf="!visible.length"><strong>No audit records found</strong><span>{{q ? 'Try another search.' : 'Audit activity will appear here.'}}</span></div>
</section></main>`})
export class AuditPage implements OnInit{
 rows:any[]=[];q='';constructor(private api:ApiService){}
 ngOnInit(){this.api.get<any[]>('platform/audit').subscribe(r=>this.rows=r)}
 get visible(){return this.rows.filter(x=>JSON.stringify(x).toLowerCase().includes(this.q.toLowerCase()))}
 exportCsv(){const esc=(v:any)=>`"${String(v??'').replaceAll('"','""')}"`;const lines=[['Time','Action','Entity','Entity ID','User'].map(esc).join(','),...this.visible.map(x=>[x.createdAtUtc,x.action,x.entityType,x.entityId,x.userId||'System / Automation'].map(esc).join(','))];const blob=new Blob([lines.join('\r\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`qualifyai-audit-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url)}
}
