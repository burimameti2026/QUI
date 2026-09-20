import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CrmService } from './crm.service';
import { Modal, PageHeader } from '../../shared/ui';
import { RefinedDataGrid } from '../../shared/components/refined-data-grid.component';
import { RefinedKpiStrip } from '../../shared/components/refined-kpi-strip.component';
import { RefinedTabs } from '../../shared/components/refined-tabs.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader, RefinedDataGrid, RefinedKpiStrip, RefinedTabs],
  styleUrls: ['./leads.page.css'],
  template: `
    <section class="page">
    <qai-page-header title="Leads" subtitle="Manage your sales leads and move qualified demand into the CRM.">
      <button class="button-quiet" type="button" (click)="load()" [disabled]="loading">↻ {{ loading ? 'Loading…' : 'Refresh data' }}</button>
      <button class="button-primary" type="button" (click)="openCreate()">+ Create Lead</button>
    </qai-page-header>
    <div class="callout warning" *ngIf="error"><span class="icon">!</span><div><b>Leads could not be loaded</b><p>{{ error }}</p></div></div>
    <section class="leads-kpi-panel"><qai-kpi-strip>
        <article class="lead-kpi"><div class="metric-top"><span class="metric-icon">#</span><span class="metric-label">Total leads</span></div><strong>{{ rows.length }}</strong><small>All leads currently in CRM</small></article>
        <article class="lead-kpi"><div class="metric-top"><span class="metric-icon">N</span><span class="metric-label">New</span></div><strong>{{ countNew() }}</strong><small>New or unqualified enquiries</small></article>
        <article class="lead-kpi"><div class="metric-top"><span class="metric-icon">Q</span><span class="metric-label">Qualified</span></div><strong>{{ count(80,101) }}</strong><small>Score 80–100</small></article>
        <article class="lead-kpi"><div class="metric-top"><span class="metric-icon">€</span><span class="metric-label">Pipeline value</span></div><strong>{{ money(total()) }}</strong><small>Estimated value across leads</small></article>
      </qai-kpi-strip></section>
      <qai-refined-tabs>
        <button [class.active]="activeTab==='All'" (click)="setTab('All')" type="button">All</button><button [class.active]="activeTab==='Favourite'" (click)="setTab('Favourite')" type="button">Favourite</button><button [class.active]="activeTab==='New'" (click)="setTab('New')" type="button">New</button><button [class.active]="activeTab==='Assigned to me'" (click)="setTab('Assigned to me')" type="button">Assigned to me</button><button [class.active]="activeTab==='Overdue'" (click)="setTab('Overdue')" type="button">Overdue</button><button [class.active]="activeTab==='Hot'" (click)="setTab('Hot')" type="button">Hot</button>
      </qai-refined-tabs>
      <qai-data-grid *ngIf="!loading && !error">
        <div class="toolbar">
          <label class="search"><span>⌕</span><input [(ngModel)]="q" placeholder="Search leads, companies, contacts..." /></label><select [(ngModel)]="temp"><option value="">All temperatures</option><option>Hot</option><option>Warm</option><option>Cold</option></select><button type="button" class="toolbar-button">▽ Filters</button><button type="button" class="toolbar-button">↕ Sort</button><span class="toolbar-spacer"></span><button type="button" class="toolbar-button">⇧ Export</button><button type="button" class="toolbar-button" (click)="load()">↻ Refresh</button>
        </div>
        <table>
          <thead><tr><th class="check-col"><input type="checkbox" [checked]="allVisibleSelected" (change)="toggleAll($event)" /></th><th>Customer</th><th>Company</th><th>Email</th><th>Status</th><th>Manager</th><th>Source</th><th>Score</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let x of visible"><td class="check-col"><input type="checkbox" [checked]="isSelected(x)" (change)="toggleSelected(x)" /></td><td><div class="lead-person"><b>{{ x.intentSummary || 'New enquiry' }}</b></div></td><td>{{ x.company || x.source || '—' }}</td><td>{{ x.email || '—' }}</td><td><span class="lead-status" [class.hot]="x.score >= 80">{{ temperature(x) }}</span></td><td>{{ x.manager || '—' }}</td><td>{{ x.source || 'Search' }}</td><td>{{ x.score ?? '—' }}</td><td>{{ createdDate(x) }}</td><td><div class="actions"><button class="small" (click)="editLead(x)">Edit</button><button class="small button-primary" (click)="convert(x)">Opportunity</button></div></td></tr>
            <tr class="empty" *ngIf="!visible.length"><td colspan="10"><strong>No leads available</strong><span>Create a lead or run the acquisition workflow.</span></td></tr>
          </tbody>
        </table>
        <div class="notice" *ngIf="selected.length"><span>Selected: {{ selected.length }}</span><button type="button" (click)="editSelected()">✎ Edit</button><button type="button" (click)="deleteSelected()">⌫ Delete</button><button type="button" class="button-danger" (click)="clearSelection()">Discard</button></div>
      </qai-data-grid>
    </section>
    <qai-modal [open]="showEdit" title="Edit lead" (close)="showEdit=false"><form class="form" (ngSubmit)="saveEdit()"><label>Intent summary<input [(ngModel)]="editForm.intentSummary" name="editIntent" required /></label><div class="content-grid"><label>Source<input [(ngModel)]="editForm.source" name="editSource" /></label><label>Score<input type="number" min="0" max="100" [(ngModel)]="editForm.score" name="editScore" /></label></div><footer><button type="button" (click)="showEdit=false">Cancel</button><button class="button-primary" type="submit">Save changes</button></footer></form></qai-modal>
    <qai-modal [open]="showCreate" title="Create lead" (close)="showCreate = false"><form class="form" (ngSubmit)="createLead()"><label>Contact<select [(ngModel)]="form.contactId" name="contactId" required><option value="" disabled>Select contact</option><option *ngFor="let c of contacts" [value]="c.id">{{ contactName(c) }} · {{ c.email }}</option></select></label><label>Intent summary<input [(ngModel)]="form.intentSummary" name="intentSummary" required /></label><div class="content-grid"><label>Source<input [(ngModel)]="form.source" name="source" /></label><label>Score<input type="number" min="0" max="100" [(ngModel)]="form.score" name="score" /></label></div><label>Estimated value<input type="number" min="0" [(ngModel)]="form.estimatedValue" name="estimatedValue" /></label><footer><button type="button" (click)="showCreate=false">Cancel</button><button class="button-primary" type="submit">Create Lead</button></footer></form></qai-modal>
  `
})
export class LeadsPage implements OnInit {
  rows:any[]=[]; contacts:any[]=[]; q=''; temp=''; activeTab='All'; selected:any[]=[]; showCreate=false; showEdit=false; loading=false; error='';
  form:any={contactId:'',source:'manual',score:50,estimatedValue:0,intentSummary:''}; editForm:any={};
  constructor(private data:CrmService){}
  ngOnInit(){this.load()}
  load(){this.loading=true;this.error='';this.data.leads().subscribe({next:r=>{this.rows=r||[];this.loading=false},error:e=>{this.error=this.apiError(e);this.loading=false}});this.data.contacts().subscribe({next:r=>this.contacts=r||[],error:e=>this.error=this.apiError(e)})}
  openCreate(){this.form={contactId:this.contacts[0]?.id||'',source:'manual',score:50,estimatedValue:0,intentSummary:''};this.showCreate=true}
  createLead(){if(!this.form.contactId||!this.form.intentSummary.trim())return;this.data.createLead(this.form).subscribe({next:r=>{this.rows.unshift(r);this.showCreate=false},error:()=>alert('Lead creation failed. Check the selected contact and API logs.')})}
  contactName(c:any){return `${c.firstName||''} ${c.lastName||''}`.trim()||c.email||'Contact'}
  setTab(tab:string){this.activeTab=tab;this.clearSelection()}
  get visible(){const query=this.q.trim().toLowerCase();return this.rows.filter(x=>{const status=String(x.status||'').toLowerCase();const tabOk=this.activeTab==='All'||(this.activeTab==='Favourite'&&(x.favorite||x.isFavorite))||(this.activeTab==='New'&&(status==='new'||!x.status))||(this.activeTab==='Assigned to me'&&!!x.manager)||(this.activeTab==='Overdue'&&(x.overdue===true||status==='overdue'))||(this.activeTab==='Hot'&&Number(x.score)>=80);const text=`${x.intentSummary||''} ${x.company||''} ${x.email||''} ${x.source||''} ${x.status||''}`.toLowerCase();return tabOk&&(!query||text.includes(query))&&(!this.temp||this.temperature(x)===this.temp)})}
  isSelected(x:any){return this.selected.some(s=>s.id===x.id)}
  get allVisibleSelected(){return this.visible.length>0&&this.visible.every(x=>this.isSelected(x))}
  toggleSelected(x:any){this.isSelected(x)?this.selected=this.selected.filter(s=>s.id!==x.id):this.selected=[...this.selected,x]}
  toggleAll(e:any){this.selected=e.target.checked?[...this.visible]:this.selected.filter(s=>!this.visible.some(v=>v.id===s.id))}
  clearSelection(){this.selected=[]}
  editLead(x:any){this.editForm={...x};this.showEdit=true}
  editSelected(){if(this.selected.length)this.editLead(this.selected[0])}
  deleteSelected(){const ids=this.selected.map(x=>x.id);this.clearSelection();ids.forEach(id=>this.data.deleteLead(id).subscribe({next:()=>this.rows=this.rows.filter(x=>x.id!==id),error:()=>{}}))}

  count(a:number,b:number){return this.rows.filter(x=>x.score>=a&&x.score<b).length}
  countNew(){return this.rows.filter(x=>{const status=String(x.status||'').toLowerCase();return status==='new'||!status}).length}
  total(){return this.rows.reduce((s,x)=>s+(Number(x.estimatedValue)||0),0)}
  createdDate(x:any){const v=x.createdAt||x.created||x.createdDate;if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(d)}
  temperature(x:any){return x.score>=80?'Hot':x.score>=50?'Warm':'Cold'}
  money(v:number){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v||0)}
  saveEdit(){if(!this.editForm?.id)return;this.data.updateLead(this.editForm.id,this.editForm).subscribe({next:r=>{const i=this.rows.findIndex(x=>x.id===this.editForm.id);if(i>=0)this.rows[i]=r;this.showEdit=false},error:()=>alert('Lead update failed.')})}
  qualify(x:any){this.data.qualify(x.id).subscribe({next:r=>Object.assign(x,r),error:()=>alert('Lead qualification failed.')})}
  convert(x:any){this.data.convert(x.id).subscribe({next:()=>alert('Opportunity created and follow-up automation scheduled.'),error:()=>alert('Could not create opportunity.')})}
  private apiError(e:any){return e?.error?.detail||e?.error?.title||(e?.status?`CRM API returned ${e.status}.`:'CRM API is unavailable.')}
}