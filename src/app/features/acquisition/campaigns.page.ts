import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';

@Component({standalone:true,imports:[CommonModule,PageHeader],templateUrl:'./campaigns.page.html',styleUrls:['./campaigns.page.css']})
export class CampaignsPage implements OnInit {
  rows:any[]=[]; settingsOpenId:string|null=null; loading=false; busy=false; error=''; message='';
  constructor(private readonly data:AcquisitionService,private readonly router:Router){}
  ngOnInit(){this.load();}
  get running(){return this.rows.filter(x=>this.status(x.status)==='Running').length;}
  status(v:any){return ['Draft','Scheduled','Running','Paused','Completed','Stopped'][Number(v)]||String(v??'Unknown');}
  visualStatus(c:any){const s=this.status(c.status);return s==='Running'?'running':s==='Completed'?'success':s==='Stopped'?'stopped':s==='Paused'||s==='Draft'||s==='Scheduled'?'pending':'pending';}
  load(){this.loading=true;this.error='';this.data.campaigns().subscribe({next:r=>{this.rows=r||[];this.loading=false;},error:e=>{this.loading=false;this.error=this.apiError(e,'Campaign containers could not be loaded.');}});}
  openDesigner(c:any){void this.router.navigate(['/campaigns',c.id,'designer']);}
  openIndustryPacks(){void this.router.navigateByUrl('/industry-packs');}
  openApproval(){void this.router.navigateByUrl('/acquisition/approval-queue');}
  start(c:any){this.runAction(()=>this.data.startCampaign(c.id),'Campaign started.');}
  pause(c:any){this.runAction(()=>this.data.pauseCampaign(c.id),'Campaign paused.');}
  resume(c:any){this.runAction(()=>this.data.resumeCampaign(c.id),'Campaign resumed.');}
  stop(c:any){this.runAction(()=>this.data.stopCampaign(c.id),'Campaign stopped.');}
  delete(c:any){if(!confirm(\`Delete campaign container "\${c.name}"? This removes its execution data, tasks, runs, messages and target-list membership.\`))return;this.runAction(()=>this.data.deleteCampaign(c.id),'Campaign container deleted.');}
  private runAction(action:()=>any,success:string){this.busy=true;this.error='';action().subscribe({next:()=>{this.busy=false;this.message=success;this.settingsOpenId=null;this.load();},error:e=>{this.busy=false;this.error=this.apiError(e,'Campaign action failed.');}});}
  private apiError(e:any,fallback:string){return e?.error?.detail||e?.error?.error||(e?.status?\`\${fallback} API returned \${e.status}.\`:fallback);}
}