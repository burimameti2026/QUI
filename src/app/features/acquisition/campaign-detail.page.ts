import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';
import { TenantRuntimeService } from '../../core/tenant-runtime.service';

@Component({standalone:true,imports:[CommonModule,PageHeader],templateUrl:'./campaign-detail.page.html',styleUrls:['./campaign-detail.page.css']})
export class CampaignDetailPage implements OnInit,OnDestroy {
  id=''; data:any=null; jobs:any[]=[]; containers:any[]=[]; loading=true; error=''; active='overview';
  private timer:any;
  constructor(private route:ActivatedRoute,private api:AcquisitionService,private runtime:TenantRuntimeService,private router:Router){}
  ngOnInit(){this.id=this.route.snapshot.paramMap.get('id')||'';this.load();this.timer=setInterval(()=>this.load(false),5000);}
  ngOnDestroy(){if(this.timer)clearInterval(this.timer);}
  load(show=true){if(show)this.loading=true;this.api.campaignPlan(this.id).subscribe({next:x=>{this.data=x;this.loading=false;this.error='';this.loadJobs();},error:e=>{this.loading=false;this.error=e?.error?.detail||'Campaign workspace could not be loaded.';}});}
  loadJobs(){const tenant=this.runtime.runtime()?.tenantId;if(!tenant)return;this.api.agentJobs(tenant).subscribe({next:x=>this.jobs=(x||[]).filter((j:any)=>j.campaignId===this.id),error:()=>{}});}
  get campaign(){return this.data?.campaign||{}}
  get runtimeInfo(){return this.data?.runtime||{}}
  get workflow(){return this.data?.workflow?.steps||[]}
  get pack(){return this.data?.packageCode||this.campaign.packageCode||'—'}
  status(v:any){return String(v??'Unknown').replace(/([a-z])([A-Z])/g,'$1 $2');}
  openDesigner(){this.router.navigate(['/campaigns',this.id,'designer']);}
  openPack(){this.router.navigateByUrl('/industry-packs');}
  openCompanies(){this.router.navigateByUrl('/crm/companies');}
  openProspects(){this.router.navigateByUrl('/discover');}
  setTab(v:string){this.active=v;}
  track(_:number,x:any){return x.taskId||x.sequence||x.name;}
}
