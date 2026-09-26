import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';
import { IndustryPacksService } from '../industry-packs/industry-packs.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.css']
})
export class CampaignsPage implements OnInit {
  rows: any[] = [];
  settingsOpenId: string | null = null;
  loading = false;
  busy = false;
  error = '';
  message = '';
  search = '';
  createOpen = false;
  createMode: 'pack' | 'scratch' = 'pack';
  packs: any[] = [];
  selectedPack: any = null;
  selectedScenario = '';
  icps: any[] = [];
  selectedIcpId = '';
  creating = false;

  constructor(
    private readonly data: AcquisitionService,
    private readonly router: Router,
    private readonly packsService: IndustryPacksService
  ) {}

  ngOnInit(): void {
    this.load();
    this.data.icps().subscribe({ next: x => this.icps = x || [] });
    this.loadPacks();
  }

  get filteredRows(): any[] {
    const q = this.search.trim().toLowerCase();
    if (!q) return this.rows;
    return this.rows.filter(x => [x.name, x.packageCode, x.objective, x.goal, this.status(x.status)].some(v => String(v ?? '').toLowerCase().includes(q)));
  }

  get running(): number {
    return this.rows.filter(x => this.status(x.status) === 'Running').length;
  }

  status(value: any): string {
    return ['Draft', 'Scheduled', 'Running', 'Paused', 'Completed', 'Stopped'][Number(value)]
      || String(value ?? 'Unknown');
  }

  visualStatus(campaign: any): string {
    const value = this.status(campaign.status);
    if (value === 'Running') return 'running';
    if (value === 'Completed') return 'success';
    if (value === 'Stopped') return 'stopped';
    return 'pending';
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.data.campaigns().subscribe({
      next: rows => {
        this.rows = rows || [];
        this.loading = false;
      },
      error: (error: any) => {
        this.loading = false;
        this.error = this.apiError(error, 'Campaign containers could not be loaded.');
      }
    });
  }

  openDesigner(campaign: any): void {
    void this.router.navigate(['/campaigns', campaign.id, 'designer']);
  }

  openCreate(): void { this.createOpen = true; this.createMode = 'pack'; this.selectedPack = null; this.selectedScenario = ''; this.selectedIcpId = ''; this.loadPacks(); }

  loadPacks(): void { this.packsService.list<any[]>().subscribe({ next: x => this.packs = x || [] }); }

  selectPack(pack: any): void { this.selectedPack = pack; const t=this.packTemplate(pack); this.selectedScenario=t.scenarios?.[0]?.code || ''; }
  packTemplate(pack:any):any { try{return JSON.parse(pack?.templateJson||'{}')}catch{return {}} }
  scenarios(pack:any):any[] { return this.packTemplate(pack).scenarios || []; }

  createContainer(): void {
    if (!this.selectedPack || !this.selectedIcpId) return;
    this.creating = true; this.error = '';
    const t=this.packTemplate(this.selectedPack);
    const input={targetListId: this.selectedPack.targetListId, name: this.selectedScenario ? this.selectedPack.name+' — '+this.selectedScenario : this.selectedPack.name+' Acquisition', goal:t.purpose||'generate qualified prospects', senderName:'',senderEmail:'',startsAtUtc:null,steps:[]};
    if (!input.targetListId) { this.error='This Industry Pack must be provisioned before it can create a campaign container.'; this.creating=false; return; }
    this.data.createCampaign(input).subscribe({next:(campaign:any)=>{this.creating=false;this.createOpen=false;this.message='Campaign Container created.';this.load();this.router.navigate(['/campaigns',campaign.id,'designer']);},error:e=>{this.creating=false;this.error=this.apiError(e,'Campaign Container could not be created.')}});
  }
  closeCreate(): void { this.createOpen = false; }

  openIndustryPacks(): void {
    void this.router.navigateByUrl('/industry-packs');
  }

  createFromScratch(): void {
    this.createOpen = false;
    void this.router.navigateByUrl('/industry-packs?create=1');
  }

  openApproval(_campaign?: any): void {
    void this.router.navigateByUrl('/acquisition/approval-queue');
  }

  start(campaign: any): void {
    this.runAction(() => this.data.startCampaign(campaign.id), 'Campaign started.');
  }

  pause(campaign: any): void {
    this.runAction(() => this.data.pauseCampaign(campaign.id), 'Campaign paused.');
  }

  resume(campaign: any): void {
    this.runAction(() => this.data.resumeCampaign(campaign.id), 'Campaign resumed.');
  }

  stop(campaign: any): void {
    this.runAction(() => this.data.stopCampaign(campaign.id), 'Campaign stopped.');
  }

  delete(campaign: any): void {
    if (!confirm('Delete campaign container "' + campaign.name +
      '"? This removes its execution data, tasks, runs, messages and target-list membership.')) {
      return;
    }

    this.runAction(() => this.data.deleteCampaign(campaign.id), 'Campaign container deleted.');
  }

  private runAction(action: () => any, success: string): void {
    this.busy = true;
    this.error = '';

    action().subscribe({
      next: () => {
        this.busy = false;
        this.message = success;
        this.settingsOpenId = null;
        this.load();
      },
      error: (error: any) => {
        this.busy = false;
        this.error = this.apiError(error, 'Campaign action failed.');
      }
    });
  }

  private apiError(error: any, fallback: string): string {
    return error?.error?.detail
      || error?.error?.error
      || (error?.status ? fallback + ' API returned ' + error.status + '.' : fallback);
  }
}
