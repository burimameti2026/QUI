import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';
import { IndustryPacksService } from '../industry-packs/industry-packs.service';
import { AiAdvisorService } from '../../core/ai-advisor.service';
import { TenantRuntimeService } from '../../core/tenant-runtime.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.css']
})
export class CampaignsPage implements OnDestroy, OnInit {
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
  aiCreateOpen = false;
  aiGoal = '';
  aiWorking = false;
  aiResult = '';
  aiError = '';
  operatorResult: any = null;
  operatorStarting = false;
  operatorLive: any = null;
  private operatorPoll: ReturnType<typeof setInterval> | null = null;
  private logsPoll: ReturnType<typeof setInterval> | null = null;
  private logsRequestInFlight = false;
  private logsRequestSequence = 0;
  logsOpen = false;
  logsLoading = false;
  logsError = '';
  logsCampaign: any = null;
  logsContainer: any = null;
  logsContainers: any[] = [];
  containerLogs: any[] = [];

  constructor(
    private readonly data: AcquisitionService,
    private readonly router: Router,
    private readonly packsService: IndustryPacksService,
    private readonly aiAdvisor: AiAdvisorService,
    private readonly tenantRuntime: TenantRuntimeService
  ) {}

  ngOnDestroy(): void {
    if (this.operatorPoll) clearInterval(this.operatorPoll);
    if (this.logsPoll) clearInterval(this.logsPoll);
  }

  ngOnInit(): void {
    this.load();
    this.data.icps().subscribe({
      next: x => this.icps = x || [],
      error: e => this.error = this.apiError(e, 'ICP library could not be loaded.')
    });
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
    if (this.loading || this.busy || this.creating) return;
    this.loading = true;
    this.error = '';

    this.data.campaigns().subscribe({
      next: rows => {
        this.rows = rows || [];
        this.loading = false;
        this.syncAdvisorContext();
      },
      error: (error: any) => {
        this.loading = false;
        this.error = this.apiError(error, 'Campaign containers could not be loaded.');
      }
    });
  }

  openContainerLogs(campaign: any): void {
    this.settingsOpenId = null;
    this.logsCampaign = campaign;
    this.logsContainer = null;
    this.logsContainers = [];
    this.containerLogs = [];
    this.logsOpen = true;
    this.logsLoading = true;
    this.logsError = '';
    if (this.logsPoll) clearInterval(this.logsPoll);

    this.data.containers(campaign.id).subscribe({
      next: (containers: any[]) => {
        this.logsContainers = containers || [];
        const initialContainer = this.logsContainers[0];
        if (!initialContainer) {
          this.logsLoading = false;
          return;
        }
        this.selectLogContainer(String(initialContainer.id));
        this.logsPoll = setInterval(() => {
          if (this.logsContainer?.id) this.loadSelectedContainerLogs(true);
        }, 3000);
      },
      error: e => {
        this.logsLoading = false;
        this.logsError = this.apiError(e, 'Campaign containers could not be loaded.');
      }
    });
  }

  selectLogContainer(containerId: string): void {
    const next = this.logsContainers.find(x => String(x.id) === String(containerId)) || null;
    if (String(next?.id ?? '') !== String(this.logsContainer?.id ?? '')) this.logsRequestSequence++;
    this.logsContainer = next;
    this.loadSelectedContainerLogs();
  }

  private loadSelectedContainerLogs(silent = false): void {
    if (!this.logsCampaign?.id || !this.logsContainer?.id) {
      this.containerLogs = [];
      this.logsLoading = false;
      return;
    }
    if (this.logsRequestInFlight) return;
    const requestSequence = ++this.logsRequestSequence;
    const requestedContainerId = String(this.logsContainer.id);
    this.logsRequestInFlight = true;
    if (!silent) this.logsLoading = true;
    this.data.containerActivity(this.logsCampaign.id, requestedContainerId).subscribe({
      next: (rows: any[]) => {
        if (requestSequence === this.logsRequestSequence && String(this.logsContainer?.id ?? '') === requestedContainerId) {
          this.containerLogs = (rows || []).sort((a: any, b: any) =>
            new Date(b.atUtc).getTime() - new Date(a.atUtc).getTime()
          );
          this.logsLoading = false;
        }
        this.logsRequestInFlight = false;
        if (String(this.logsContainer?.id ?? '') !== requestedContainerId) this.loadSelectedContainerLogs(true);
      },
      error: e => {
        if (requestSequence === this.logsRequestSequence) {
          this.logsLoading = false;
          this.logsError = this.apiError(e, 'Container logs could not be loaded.');
        }
        this.logsRequestInFlight = false;
        if (String(this.logsContainer?.id ?? '') !== requestedContainerId) this.loadSelectedContainerLogs(true);
      }
    });
  }

  closeContainerLogs(): void {
    this.logsOpen = false;
    this.logsCampaign = null;
    this.logsContainer = null;
    this.logsContainers = [];
    this.containerLogs = [];
    this.logsError = '';
    if (this.logsPoll) {
      clearInterval(this.logsPoll);
      this.logsPoll = null;
    }
  }

  containerStatus(value: any): string {
    const states = ['Stopped', 'Running', 'Paused', 'Failed', 'Pending', 'Queued', 'Starting', 'Completed', 'Waiting'];
    if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value))) {
      return states[Number(value)] || 'Unknown';
    }
    const normalized = String(value ?? '').trim();
    if (!normalized) return 'Unknown';
    return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
  }

  openDesigner(campaign: any): void {
    this.aiAdvisor.setContext({
      page: 'Campaigns',
      section: 'Campaigns',
      title: campaign?.name || 'Campaign',
      entityType: 'campaign',
      entityId: campaign?.id,
      values: { campaign: this.campaignContext(campaign), availableCampaigns: this.rows.map(x => this.campaignContext(x)) }
    });
    void this.router.navigate(['/campaigns', campaign.id, 'designer']);
  }

  private syncAdvisorContext(): void {
    this.aiAdvisor.setContext({
      page: 'Campaigns',
      section: 'Campaigns',
      title: 'Campaign Containers',
      values: {
        campaignCount: this.rows.length,
        runningCount: this.running,
        campaigns: this.rows.map(x => this.campaignContext(x))
      }
    });
  }

  private campaignContext(campaign: any): Record<string, unknown> {
    return {
      id: campaign?.id,
      name: campaign?.name,
      packageCode: campaign?.packageCode,
      objective: campaign?.objective,
      goal: campaign?.goal,
      status: this.status(campaign?.status),
      industry: campaign?.industry,
      senderName: campaign?.senderName,
      startsAtUtc: campaign?.startsAtUtc
    };
  }

  openAiCreate(): void {
    this.aiCreateOpen = true;
    this.aiGoal = '';
    this.aiResult = '';
    this.aiError = '';
    this.aiWorking = false;
    this.operatorResult = null;
    this.operatorLive = null;
    if (this.operatorPoll) { clearInterval(this.operatorPoll); this.operatorPoll = null; }
    this.aiAdvisor.setContext({
      page: 'AI Campaign Operator',
      section: 'Campaign Creation',
      title: 'Create Campaign with AI',
      values: {
        availablePacks: this.packs.map(x => ({ id: x.id, code: x.code, name: x.name, description: x.description })),
        availableIcps: this.icps.map(x => ({ id: x.id, name: x.name, industry: x.industry, countries: x.countriesCsv }))
      }
    });
  }

  closeAiCreate(): void {
    if (this.aiWorking) return;
    this.aiCreateOpen = false;
  }

  createWithAi(): void {
    const goal = this.aiGoal.trim();
    if (!goal || this.aiWorking) return;
    const tenantId = this.tenantRuntime.runtime()?.tenantId;
    if (!tenantId) {
      this.aiError = 'Workspace runtime is not ready. Refresh the page and try again.';
      this.tenantRuntime.load().subscribe({ error: e => this.aiError = this.apiError(e, 'Workspace runtime could not be loaded.') });
      return;
    }
    this.aiWorking = true;
    this.aiError = '';
    this.aiResult = '';
    this.data.aiPrepare(tenantId, { brief: goal, goal: 'book-demo' }).subscribe({
      next: (result: any) => {
        this.aiWorking = false;
        this.operatorResult = result;
        this.operatorLive = null;
        this.aiResult = (result?.actions || []).join(' · ') || (result?.status === 'ready' ? 'Campaign is ready to launch.' : 'AI prepared the campaign.');
        const campaignId = result?.campaignId;
        if (campaignId) {
          this.message = result?.status === 'ready' ? 'AI prepared the campaign. Ready to launch.' : 'AI prepared the campaign.';
          this.load();
        } else {
          this.load();
        }
      },
      error: (e: any) => {
        this.aiWorking = false;
        this.aiError = this.apiError(e, 'AI could not create the campaign.');
      }
    });
  }

  startAiPrepared(): void {
    const tenantId = this.tenantRuntime.runtime()?.tenantId;
    const campaignId = this.operatorResult?.campaignId;
    if (!tenantId || !campaignId || this.operatorStarting) return;
    this.operatorStarting = true;
    this.aiError = '';
    this.data.aiStart(tenantId, campaignId).subscribe({
      next: (result: any) => {
        this.operatorStarting = false;
        this.message = 'Campaign started. AI acquisition run is queued.';
        this.operatorLive = { aiStatus: 'queued' };
        this.load();
        this.startOperatorPolling();
      },
      error: (e: any) => {
        this.operatorStarting = false;
        this.aiError = this.apiError(e, 'Campaign could not be started.');
      }
    });
  }

  private startOperatorPolling(): void {
    const tenantId = this.tenantRuntime.runtime()?.tenantId;
    const campaignId = this.operatorResult?.campaignId;
    if (!tenantId || !campaignId) return;
    if (this.operatorPoll) clearInterval(this.operatorPoll);
    const poll = () => this.data.aiStatus(tenantId, campaignId).subscribe({
      next: x => {
        this.operatorLive = x;
        if (['completed', 'attention', 'failed'].includes(String(x?.aiStatus)) && this.operatorPoll) {
          clearInterval(this.operatorPoll);
          this.operatorPoll = null;
        }
      },
      error: e => this.aiError = this.apiError(e, 'Live campaign status could not be loaded.')
    });
    poll();
    this.operatorPoll = setInterval(poll, 3000);
  }

  canPrepareAgain(): boolean {
    const status = String(this.operatorLive?.aiStatus || '').toLowerCase();
    return !this.operatorResult || ['completed', 'attention', 'failed'].includes(status);
  }

  liveLabel(): string { switch (String(this.operatorLive?.aiStatus || 'ready').toLowerCase()) { case 'queued': return 'Run queued — waiting for acquisition worker'; case 'running': return 'AI acquisition is running'; case 'waiting': return 'Run waiting for approval or another dependency'; case 'completed': return 'Acquisition run completed'; case 'attention': case 'failed': return 'Run needs attention'; default: return 'Ready to launch'; } }

  lifecycleStep(step: string): 'done' | 'active' | 'pending' { const s=String(this.operatorLive?.aiStatus||'ready'); const m=this.operatorLive?.metrics||{}; if(step==='prepare') return this.operatorResult?'done':'pending'; if(step==='run') return s==='ready'?'pending':s==='queued'?'active':'done'; if(step==='discover') return s==='queued'?'pending':'done'; if(step==='qualify') return m.recipients>0?'done':s==='running'?'active':'pending'; if(step==='outreach') return m.awaitingDelivery>0||m.sent>0?'done':m.recipients>0?'active':'pending'; if(step==='approval') return m.awaitingDelivery>0?'active':m.sent>0?'done':'pending'; return 'pending'; }

  openCreate(): void { this.createOpen = true; this.createMode = 'pack'; this.selectedPack = null; this.selectedScenario = ''; this.selectedIcpId = ''; this.loadPacks(); }

  loadPacks(): void {
    this.packsService.list<any[]>().subscribe({
      next: x => this.packs = x || [],
      error: e => this.error = this.apiError(e, 'Industry Packs could not be loaded.')
    });
  }

  selectPack(pack: any): void {
    this.selectedPack = pack;
    const options = this.scenarios(pack);
    this.selectedScenario = options[0]?.code || '';
  }

  packTemplate(pack:any):any {
    try { return JSON.parse(pack?.templateJson||'{}'); } catch { return {}; }
  }

  scenarios(pack:any):any[] {
    const configured = this.packTemplate(pack).scenarios;
    if (Array.isArray(configured) && configured.length) return configured;

    const code = String(pack?.code || '').toLowerCase();
    if (code.includes('fusionfleet') || code.includes('logistics')) {
      return [
        { code:'logistics-companies', name:'Logistics Companies' },
        { code:'transport-companies', name:'Transport Companies' },
        { code:'freight-forwarders', name:'Freight Forwarders' },
        { code:'3pl-providers', name:'3PL Providers' },
        { code:'warehouse-operators', name:'Warehouse Operators' }
      ];
    }

    return [{ code:'', name:'Default scenario' }];
  }

  createContainer(): void {
    if (!this.selectedPack || !this.selectedIcpId) return;
    this.creating = true; this.error = '';
    this.packsService.provisionForCampaign<any>(this.selectedPack.id, this.selectedScenario || undefined, this.selectedIcpId).subscribe({
      next: (result:any) => {
        this.creating=false; this.createOpen=false; this.message=result?.alreadyProvisioned
          ? 'Campaign Container reconciled from the Industry Pack and selected ICP.'
          : 'Campaign Container created from Industry Pack and ICP.';
        this.load();
        if (result?.campaignId) void this.router.navigate(['/campaigns', result.campaignId, 'designer']);
      },
      error: e => { this.creating=false; this.error=this.apiError(e,'Campaign Container could not be created.'); }
    });
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

  runAutonomous(campaign: any): void {
    const runtime = this.tenantRuntime.runtime();
    if (runtime?.tenantId) {
      this.runAutonomousForTenant(runtime.tenantId, campaign);
      return;
    }

    this.busy = true;
    this.error = '';
    this.tenantRuntime.load().subscribe({
      next: loaded => {
        this.busy = false;
        this.runAutonomousForTenant(loaded.tenantId, campaign);
      },
      error: error => {
        this.busy = false;
        this.error = this.apiError(error, 'Workspace runtime could not be loaded.');
      }
    });
  }

  private runAutonomousForTenant(tenantId: string, campaign: any): void {
    if (!tenantId || !this.tenantRuntime.isActive()) {
      this.error = 'An active workspace and license are required to run autonomous acquisition.';
      return;
    }

    this.runAction(
      () => this.data.runAutonomousCampaign(tenantId, campaign.id),
      'Autonomous acquisition run queued. Discovery and qualification will continue in the background.'
    );
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
