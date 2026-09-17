import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CrmService } from './crm.service';
import { Modal } from '../../shared/ui';
import { RefinedDataGrid } from '../../shared/components/refined-data-grid.component';
import { RefinedKpiStrip } from '../../shared/components/refined-kpi-strip.component';
import { RefinedTabs } from '../../shared/components/refined-tabs.component';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, RefinedDataGrid, RefinedKpiStrip, RefinedTabs],
  styleUrls: ['./leads.orange-style.css'],
  template: `
    <section class="leads-page-header">
      <div class="title"><h1>Leads <span class="count">{{ rows.length }}</span></h1><p>Manage your sales leads and move qualified demand into the CRM.</p></div>
      <div class="actions"><button type="button" (click)="load()">↻ Refresh data</button><button type="button">⇧ Import</button><button type="button" class="primary" (click)="openCreate()">+ Create Lead</button></div>
    </section>
    <div class="callout warning" *ngIf="error"><span class="callout-icon">!</span><div><b>Leads could not be loaded</b><p>{{ error }}</p></div></div>
    <section class="lead-workspace">
      <qai-kpi-strip>
        <article><span class="kpi-icon">♧</span><span>New Leads</span><strong>{{ rows.length }}</strong><small>↗ 12% vs previous period</small><svg class="kpi-chart" viewBox="0 0 108 38"><polyline points="0,29 14,15 27,24 39,18 51,26 65,11 78,20 91,8 108,3"/></svg></article>
        <article><span class="kpi-icon">◎</span><span>Qualified Leads</span><strong>{{ count(80,101) }}</strong><small>↗ 4.2% vs previous period</small><svg class="kpi-chart" viewBox="0 0 108 38"><polyline points="0,25 13,17 25,21 39,10 52,16 64,12 76,20 91,8 108,4"/></svg></article>
        <article><span class="kpi-icon">◷</span><span>Avg Response Time</span><strong>1.8h</strong><small>↗ 15% vs previous period</small><svg class="kpi-chart" viewBox="0 0 108 38"><polyline points="0,27 13,25 26,17 39,21 52,13 65,17 78,9 92,14 108,4"/></svg></article>
        <article><span class="kpi-icon">△</span><span>Hot Leads</span><strong>{{ count(80,101) }}</strong><small>↘ 2% vs previous period</small><svg class="kpi-chart" viewBox="0 0 108 38"><polyline points="0,12 14,7 27,16 39,8 51,14 65,6 78,12 91,5 108,11"/></svg></article>
        <article><span class="kpi-icon">◷</span><span>Pipeline Value</span><strong>{{ money(total()) }}</strong><small>Current qualified demand</small><svg class="kpi-chart" viewBox="0 0 108 38"><polyline points="0,27 14,23 27,25 40,15 52,18 65,10 78,15 92,8 108,5"/></svg></article>
      </qai-kpi-strip>
      <qai-refined-tabs>
        <button [class.active]="activeTab==='All'" (click)="setTab('All')" type="button">All</button><button [class.active]="activeTab==='Favourite'" (click)="setTab('Favourite')" type="button">Favourite</button><button [class.active]="activeTab==='New'" (click)="setTab('New')" type="button">New</button><button [class.active]="activeTab==='Assigned to me'" (click)="setTab('Assigned to me')" type="button">Assigned to me</button><button [class.active]="activeTab==='Overdue'" (click)="setTab('Overdue')" type="button">Overdue</button><button [class.active]="activeTab==='Hot'" (click)="setTab('Hot')" type="button">Hot</button>
      </qai-refined-tabs>
      <qai-data-grid *ngIf="!loading && !error">
        <div class="lead-grid-toolbar">
          <label class="lead-search"><span>⌕</span><input [(ngModel)]="q" placeholder="Search leads, companies, contacts..." /></label><button type="button" class="toolbar-button">▽ &nbsp;Filters</button><button type="button" class="toolbar-button">↕ &nbsp;Sort</button><select [(ngModel)]="temp"><option value="">All statuses</option><option>Hot</option><option>Warm</option><option>Cold</option></select><div class="grid-tools"><button type="button">⇧</button><button type="button">⇩</button><button type="button" (click)="load()">↻</button><div class="view-toggle"><button type="button" class="active">☷</button><button type="button">⊞</button></div></div>
        </div>
        <table>
          <thead><tr><th class="check-col"><input type="checkbox" [checked]="allVisibleSelected" (change)="toggleAll($event)" /></th><th>Customer</th><th>Company</th><th>Email</th><th>Status</th><th>Manager</th><th>Source</th><th>Score</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            <tr *ngFor="let x of visible"><td class="check-col"><input type="checkbox" [checked]="isSelected(x)" (change)="toggleSelected(x)" /></td><td><div class="lead-person"><b>{{ x.intentSummary || 'New enquiry' }}</b></div></td><td>{{ x.company || x.source || '—' }}</td><td>{{ x.email || '—' }}</td><td><span class="lead-status" [class.hot]="x.score >= 80">{{ temperature(x) }}</span></td><td>{{ x.manager || '—' }}</td><td>{{ x.source || 'Search' }}</td><td>{{ x.score ?? '—' }}</td><td>{{ createdDate(x) }}</td><td><div class="directory-actions"><button class="small" (click)="editLead(x)">Edit</button><button class="small primary" (click)="convert(x)">Opportunity</button></div></td></tr>
            <tr class="grid-empty-row" *ngIf="!visible.length"><td colspan="10"><strong>No leads available</strong><span>Create a lead or run the acquisition workflow.</span></td></tr>
          </tbody>
        </table>
        <div class="selection-bar" *ngIf="selected.length"><span>Selected: {{ selected.length }}</span><button type="button" (click)="editSelected()">✎ Edit</button><button type="button" (click)="assignSelected()">↗ Assign to</button><button type="button" (click)="deleteSelected()">⌫ Delete</button><button type="button" class="discard" (click)="clearSelection()">Discard</button></div>
      </qai-data-grid>
    </section>
    <qai-modal [open]="showEdit" title="Edit lead" (close)="showEdit=false"><form class="form" (ngSubmit)="saveEdit()"><label>Intent summary<input [(ngModel)]="editForm.intentSummary" name="editIntent" required /></label><div class="form2"><label>Source<input [(ngModel)]="editForm.source" name="editSource" /></label><label>Score<input type="number" min="0" max="100" [(ngModel)]="editForm.score" name="editScore" /></label></div><label>Manager<input [(ngModel)]="editForm.manager" name="editManager" /></label><footer><button type="button" (click)="showEdit=false">Cancel</button><button class="primary" type="submit">Save changes</button></footer></form></qai-modal>
    <qai-modal [open]="showAssign" title="Assign selected leads" (close)="showAssign=false"><form class="form" (ngSubmit)="saveAssignment()"><label>Manager<input [(ngModel)]="form.manager" name="manager" placeholder="Assign manager" /></label><footer><button type="button" (click)="showAssign=false">Cancel</button><button class="primary" type="submit">Assign {{ selected.length }} leads</button></footer></form></qai-modal>
    <qai-modal [open]="showCreate" title="Create lead" (close)="showCreate = false"><form class="form" (ngSubmit)="createLead()"><label>Contact<select [(ngModel)]="form.contactId" name="contactId" required><option value="" disabled>Select contact</option><option *ngFor="let c of contacts" [value]="c.id">{{ contactName(c) }} · {{ c.email }}</option></select></label><label>Intent summary<input [(ngModel)]="form.intentSummary" name="intentSummary" required /></label><div class="form2"><label>Source<input [(ngModel)]="form.source" name="source" /></label><label>Score<input type="number" min="0" max="100" [(ngModel)]="form.score" name="score" /></label></div><label>Estimated value<input type="number" min="0" [(ngModel)]="form.estimatedValue" name="estimatedValue" /></label><footer><button type="button" (click)="showCreate=false">Cancel</button><button class="primary" type="submit">Create Lead</button></footer></form></qai-modal>
  `
})
export class LeadsPage implements OnInit {
  rows:any[]=[]; contacts:any[]=[]; q=''; temp=''; activeTab='All'; selected:any[]=[]; showCreate=false; showEdit=false; showAssign=false; loading=false; error='';
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
  assignSelected(){if(this.selected.length)this.showAssign=true}
  deleteSelected(){const ids=this.selected.map(x=>x.id);this.clearSelection();ids.forEach(id=>this.data.deleteLead(id).subscribe({next:()=>this.rows=this.rows.filter(x=>x.id!==id),error:()=>{}}))}

  count(a:number,b:number){return this.rows.filter(x=>x.score>=a&&x.score<b).length}
  total(){return this.rows.reduce((s,x)=>s+(Number(x.estimatedValue)||0),0)}
  createdDate(x:any){const v=x.createdAt||x.created||x.createdDate;if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(d)}
  temperature(x:any){return x.score>=80?'Hot':x.score>=50?'Warm':'Cold'}
  money(v:number){return new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(v||0)}
  saveEdit(){if(!this.editForm?.id)return;this.data.updateLead(this.editForm.id,this.editForm).subscribe({next:r=>{const i=this.rows.findIndex(x=>x.id===this.editForm.id);if(i>=0)this.rows[i]=r;this.showEdit=false},error:()=>alert('Lead update failed.')})}
  saveAssignment(){const manager=String(this.form.manager||'').trim();if(!manager)return;this.selected.forEach(x=>this.data.updateLead(x.id,{manager}).subscribe({next:r=>{const i=this.rows.findIndex(v=>v.id===x.id);if(i>=0)this.rows[i]=r},error:()=>{}}));this.showAssign=false;this.clearSelection()}
  qualify(x:any){this.data.qualify(x.id).subscribe({next:r=>Object.assign(x,r),error:()=>alert('Lead qualification failed.')})}
  convert(x:any){this.data.convert(x.id).subscribe({next:()=>alert('Opportunity created and follow-up automation scheduled.'),error:()=>alert('Could not create opportunity.')})}
  private apiError(e:any){return e?.error?.detail||e?.error?.title||(e?.status?`CRM API returned ${e.status}.`:'CRM API is unavailable.')}
}