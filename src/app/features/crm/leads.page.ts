import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CrmService } from './crm.service';
import { Modal, PageHeader } from '../../shared/ui';
import { RefinedDataGrid } from '../../shared/components/refined-data-grid.component';
import { RefinedTabs } from '../../shared/components/refined-tabs.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader, RefinedDataGrid, RefinedTabs],
  styleUrls: ['./leads.page.css'],
  template: `
    <section class="page page-crm-leads">
    <qai-page-header title="Leads" subtitle="Manage your sales leads and move qualified demand into the CRM.">
      <button class="button-quiet" type="button" (click)="load()" [disabled]="loading">↻ {{ loading ? 'Loading…' : 'Refresh data' }}</button>
      <button class="button-primary" type="button" (click)="openCreate()">+ Create Lead</button>
    </qai-page-header>
    <div class="callout warning" *ngIf="error"><span class="icon">!</span><div><b>CRM request failed</b><p>{{ error }}</p></div></div><div class="callout success" *ngIf="message">{{ message }}</div>
    
      <qai-refined-tabs>
        <button [class.active]="activeTab==='All'" (click)="setTab('All')" type="button">All</button><button [class.active]="activeTab==='Favourite'" (click)="setTab('Favourite')" type="button">Favourite</button><button [class.active]="activeTab==='New'" (click)="setTab('New')" type="button">New</button><button [class.active]="activeTab==='Assigned to me'" (click)="setTab('Assigned to me')" type="button">Assigned to me</button><button [class.active]="activeTab==='Overdue'" (click)="setTab('Overdue')" type="button">Overdue</button><button [class.active]="activeTab==='Hot'" (click)="setTab('Hot')" type="button">Hot</button>
      </qai-refined-tabs>
      <qai-data-grid *ngIf="!loading && !error">
        <div class="toolbar">
          <label class="search"><span>⌕</span><input [(ngModel)]="q" placeholder="Search leads, companies, contacts..." /></label><select [(ngModel)]="temp"><option value="">All temperatures</option><option>Hot</option><option>Warm</option><option>Cold</option></select><button type="button" class="toolbar-button" (click)="toggleSort()">↕ {{ sortByScore ? 'Sort by date' : 'Sort by score' }}</button><span class="toolbar-spacer"></span><button type="button" class="toolbar-button" (click)="exportCsv()">⇧ Export CSV</button>
        </div>
        <table>
          <thead><tr><th class="check-col"><input type="checkbox" [checked]="allVisibleSelected" (change)="toggleAll($event)" /></th><th>Customer</th><th>Company</th><th>Email</th><th>Status</th><th>Manager</th><th>Source</th><th>Score</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let x of visible"><td class="check-col"><input type="checkbox" [checked]="isSelected(x)" (change)="toggleSelected(x)" /></td><td><div class="lead-person"><b>{{ x.intentSummary || 'New enquiry' }}</b></div></td><td>{{ x.company || x.source || '—' }}</td><td>{{ x.email || '—' }}</td><td><span class="status" [class.hot]="x.score >= 80">{{ temperature(x) }}</span></td><td>{{ x.manager || '—' }}</td><td>{{ x.source || 'Search' }}</td><td>{{ x.score ?? '—' }}</td><td>{{ createdDate(x) }}</td><td><div class="actions"><button class="small" (click)="editLead(x)">Edit</button><button class="small button-primary" (click)="convert(x)">Opportunity</button></div></td></tr>
            <tr class="empty" *ngIf="!visible.length"><td colspan="10"><strong>{{ rows.length ? 'No leads match the current filters' : 'No leads available' }}</strong><span>{{ rows.length ? 'Change the search, temperature or tab filter to see more leads.' : 'Create a lead or run the acquisition workflow.' }}</span></td></tr>
          </tbody>
        </table>
        <div class="notice" *ngIf="selected.length"><span>Selected: {{ selected.length }}</span><button type="button" (click)="editSelected()">✎ Edit</button><button type="button" (click)="deleteSelected()" [disabled]="deleting">{{ deleting ? 'Deleting…' : '⌫ Delete' }}</button><button type="button" class="button-danger" (click)="clearSelection()">Discard</button></div>
      </qai-data-grid>
    </section>
    <qai-modal [open]="showEdit" title="Edit lead" (close)="showEdit=false"><form class="form" (ngSubmit)="saveEdit()"><label>Intent summary<input [(ngModel)]="editForm.intentSummary" name="editIntent" required /></label><div class="content-grid"><label>Source<input [(ngModel)]="editForm.source" name="editSource" /></label><label>Score<input type="number" min="0" max="100" [(ngModel)]="editForm.score" name="editScore" /></label></div><footer><button type="button" (click)="showEdit=false">Cancel</button><button class="button-primary" type="submit">Save changes</button></footer></form></qai-modal>
    <qai-modal [open]="showCreate" title="Create lead" (close)="showCreate = false"><div class="callout warning" *ngIf="contactsError">{{ contactsError }}</div><form class="form" (ngSubmit)="createLead()"><label>Contact<select [(ngModel)]="form.contactId" name="contactId" required><option value="" disabled>Select contact</option><option *ngFor="let c of contacts" [value]="c.id">{{ contactName(c) }} · {{ c.email }}</option></select></label><label>Intent summary<input [(ngModel)]="form.intentSummary" name="intentSummary" required /></label><div class="content-grid"><label>Source<input [(ngModel)]="form.source" name="source" /></label><label>Score<input type="number" min="0" max="100" [(ngModel)]="form.score" name="score" /></label></div><label>Estimated value<input type="number" min="0" [(ngModel)]="form.estimatedValue" name="estimatedValue" /></label><footer><button type="button" (click)="showCreate=false">Cancel</button><button class="button-primary" type="submit">Create Lead</button></footer></form></qai-modal>
  `
})
export class LeadsPage implements OnInit {
  deleting = false;
  rows:any[]=[]; contacts:any[]=[]; q=''; temp=''; activeTab='All'; selected:any[]=[]; showCreate=false; showEdit=false; loading=false; error=''; message=''; contactsError=''; sortByScore=false;
  form:any={contactId:'',source:'manual',score:50,estimatedValue:0,intentSummary:''}; editForm:any={};
  constructor(private data:CrmService){}
  ngOnInit(){this.load()}
  load(){this.loading=true;this.error='';this.data.leads().subscribe({next:r=>{this.rows=r||[];this.loading=false},error:e=>{this.error=this.apiError(e);this.loading=false}});this.data.contacts().subscribe({next:r=>{this.contacts=r||[];this.contactsError=''},error:e=>this.contactsError='Contact picker unavailable: '+this.apiError(e)})}
  openCreate(){this.form={contactId:this.contacts[0]?.id||'',source:'manual',score:50,estimatedValue:0,intentSummary:''};this.showCreate=true}
  createLead(){if(!this.form.contactId||!this.form.intentSummary.trim())return;this.data.createLead(this.form).subscribe({next:r=>{this.rows.unshift(r);this.showCreate=false},error:e=>this.error=this.apiError(e)})}
  contactName(c:any){return `${c.firstName||''} ${c.lastName||''}`.trim()||c.email||'Contact'}
  setTab(tab:string){this.activeTab=tab;this.clearSelection()}
  get visible(){const query=this.q.trim().toLowerCase();return this.rows.filter(x=>{const status=String(x.status||'').toLowerCase();const tabOk=this.activeTab==='All'||(this.activeTab==='Favourite'&&(x.favorite||x.isFavorite))||(this.activeTab==='New'&&(status==='new'||!x.status))||(this.activeTab==='Assigned to me'&&!!x.manager)||(this.activeTab==='Overdue'&&(x.overdue===true||status==='overdue'))||(this.activeTab==='Hot'&&Number(x.score)>=80);const text=`${x.intentSummary||''} ${x.company||''} ${x.email||''} ${x.source||''} ${x.status||''}`.toLowerCase();return tabOk&&(!query||text.includes(query))&&(!this.temp||this.temperature(x)===this.temp)}).sort((a,b)=>this.sortByScore?(Number(b.score)||0)-(Number(a.score)||0):new Date(b.createdAt||b.created||b.createdDate||0).getTime()-new Date(a.createdAt||a.created||a.createdDate||0).getTime())}
  isSelected(x:any){return this.selected.some(s=>s.id===x.id)}
  get allVisibleSelected(){return this.visible.length>0&&this.visible.every(x=>this.isSelected(x))}
  toggleSelected(x:any){this.isSelected(x)?this.selected=this.selected.filter(s=>s.id!==x.id):this.selected=[...this.selected,x]}
  toggleAll(e:any){this.selected=e.target.checked?[...this.visible]:this.selected.filter(s=>!this.visible.some(v=>v.id===s.id))}
  clearSelection(){this.selected=[]}
  editLead(x:any){this.editForm={...x};this.showEdit=true}
  editSelected(){if(this.selected.length)this.editLead(this.selected[0])}
  toggleSort(){this.sortByScore=!this.sortByScore}
  exportCsv(){
    const columns:[string,(x:any)=>any][]=[
      ['Intent summary',x=>x.intentSummary],['Company',x=>x.company],['Email',x=>x.email],['Status',x=>x.status],
      ['Manager',x=>x.manager],['Source',x=>x.source],['Score',x=>x.score],['Estimated value',x=>x.estimatedValue],['Created',x=>x.createdAt||x.created||x.createdDate]
    ];
    const quote=(value:any)=>'"'+String(value??'').replaceAll('"','""')+'"';
    const csv=[columns.map(([label])=>quote(label)).join(','),...this.visible.map(x=>columns.map(([,value])=>quote(value(x))).join(','))].join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8;'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='leadsai-leads.csv';anchor.click();URL.revokeObjectURL(url);
  }
  deleteSelected(){
    if(this.deleting)return;
    const targets=[...this.selected];
    if(!targets.length||!confirm(`Delete ${targets.length} selected lead(s)? This cannot be undone.`))return;
    this.deleting=true;
    this.error='';
    let remaining=targets.length;
    const finishOne=()=>{remaining--;if(remaining===0)this.deleting=false;};
    targets.forEach(item=>this.data.deleteLead(item.id).subscribe({
      next:()=>{this.rows=this.rows.filter(row=>row.id!==item.id);this.selected=this.selected.filter(row=>row.id!==item.id);finishOne()},
      error:e=>{this.error=this.apiError(e);finishOne()}
    }));
  }

  count(a:number,b:number){return this.rows.filter(x=>x.score>=a&&x.score<b).length}
  countNew(){return this.rows.filter(x=>{const status=String(x.status||'').toLowerCase();return status==='new'||!status}).length}
  total(){return this.rows.reduce((s,x)=>s+(Number(x.estimatedValue)||0),0)}
  createdDate(x:any){const v=x.createdAt||x.created||x.createdDate;if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(d)}
  temperature(x:any){return x.score>=80?'Hot':x.score>=50?'Warm':'Cold'}
  money(v:number){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v||0)}
  saveEdit(){if(!this.editForm?.id)return;this.data.updateLead(this.editForm.id,this.editForm).subscribe({next:r=>{const i=this.rows.findIndex(x=>x.id===this.editForm.id);if(i>=0)this.rows[i]=r;this.showEdit=false},error:e=>this.error=this.apiError(e)})}
  qualify(x:any){this.error='';this.data.qualify(x.id).subscribe({next:r=>{Object.assign(x,r);this.message='Lead qualification updated.'},error:e=>this.error=this.apiError(e)})}
  convert(x:any){this.error='';this.data.convert(x.id).subscribe({next:()=>{this.message='Opportunity created and follow-up automation scheduled.'},error:e=>this.error=this.apiError(e)})}
  private apiError(e:any){return e?.error?.detail||e?.error?.title||(e?.status?`CRM API returned ${e.status}.`:'CRM API is unavailable.')}
}