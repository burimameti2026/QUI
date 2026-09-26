import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';

@Component({standalone:true,imports:[CommonModule,FormsModule,PageHeader],template:`
<main class="page"><qai-page-header title="ICP & Audience" subtitle="Reusable ideal-customer definitions for campaigns and Industry Packs"><button class="button-primary" (click)="newIcp()">+ Create ICP</button></qai-page-header>
<p class="notice success" *ngIf="message">{{message}}</p><p class="notice alert-error" *ngIf="error">{{error}}</p>
<section class="card" *ngIf="editing"><header class="card-header"><h2>{{editing.id?'Edit ICP':'Create ICP'}}</h2></header><div class="card-body form-grid">
<label>Name<input [(ngModel)]="editing.name"></label><label>Industry<input [(ngModel)]="editing.industry"></label><label>Countries<input [(ngModel)]="editing.countriesCsv"></label><label>Minimum score<input type="number" [(ngModel)]="editing.minimumScore"></label><label class="full">Intent keywords<textarea [(ngModel)]="editing.intentKeywordsCsv"></textarea></label><label class="full">Criteria JSON<textarea [(ngModel)]="editing.criteriaJson"></textarea></label>
</div><footer class="card-footer"><button class="button-secondary" (click)="editing=null">Cancel</button><button class="button-primary" (click)="save()">Save ICP</button></footer></section>
<section class="content-grid"><article class="card" *ngFor="let x of icps"><header class="card-header"><h2>{{x.name}}</h2><span class="status">{{x.active===false?'Inactive':'Active'}}</span></header><div class="card-body"><p>{{x.industry||'Multi-industry audience'}}</p><div class="list"><div class="list-item"><span>Countries</span><span>{{x.countriesCsv||'Not restricted'}}</span></div><div class="list-item"><span>Intent</span><span>{{x.intentKeywordsCsv||'Not configured'}}</span></div><div class="list-item"><span>Minimum score</span><span>{{x.minimumScore||0}}</span></div></div></div><footer class="card-footer"><button class="button-secondary" (click)="edit(x)">Edit</button></footer></article></section>
<section class="empty card" *ngIf="!icps.length&&!editing"><h3>No reusable ICPs yet</h3><p>Create an audience once and reuse it across Campaign Containers.</p></section></main>`})
export class IcpPage implements OnInit {
 icps:any[]=[]; editing:any=null; error=''; message='';
 constructor(private data:AcquisitionService){}
 ngOnInit(){this.load()} load(){this.data.icps().subscribe({next:x=>this.icps=x||[],error:e=>this.error=e?.error?.error||'ICP library could not be loaded.'})}
 newIcp(){this.editing={name:'',industry:'',countriesCsv:'',intentKeywordsCsv:'',minimumScore:70,criteriaJson:'{}'}}
 edit(x:any){this.editing={...x}}
 save(){if(!this.editing?.name?.trim()){this.error='ICP name is required.';return}this.data.saveIcp(this.editing).subscribe({next:()=>{this.message='ICP saved.';this.editing=null;this.load()},error:e=>this.error=e?.error?.error||'ICP could not be saved.'})}
}