import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.css'],
})
export class CampaignsPage implements OnInit {
  rows: any[] = [];
  selectedCampaign: any = null;
  detail: any = null;
  selectedTask: any = null;
  settingsOpenId: string | null = null;
  loading = false;
  detailLoading = false;
  busy = false;
  error = '';
  message = '';

  constructor(
    private readonly data: AcquisitionService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  get running(): number {
    return this.rows.filter(x => this.status(x.status) === 'Running').length;
  }

  status(value: any): string {
    return ['Draft', 'Scheduled', 'Running', 'Paused', 'Completed', 'Stopped'][Number(value)] || String(value ?? 'Unknown');
  }

  statusClass(value: any): string {
    return this.status(value).toLowerCase().replace(/\s+/g, '-');
  }

  load(): void {
    this.loading = true;
    this.error = '';

    this.data.campaigns().subscribe({
      next: rows => {
        this.rows = rows || [];
        this.loading = false;
        if (this.selectedCampaign) {
          const current = this.rows.find(x => x.id === this.selectedCampaign.id);
          if (current) {
            this.selectedCampaign = current;
            this.loadDetail(current.id);
          } else {
            this.selectedCampaign = null;
            this.detail = null;
          }
        } else if (this.rows.length) {
          this.inspect(this.rows[0]);
        }
      },
      error: e => {
        this.loading = false;
        this.error = this.apiError(e, 'Campaign containers could not be loaded.');
      }
    });
  }

  inspect(campaign: any): void {
    this.selectedCampaign = campaign;
    this.loadDetail(campaign.id);
  }

  loadDetail(id: string): void {
    this.detailLoading = true;
    this.detail = null;
    this.data.campaignDetail(id).subscribe({
      next: detail => {
        this.detail = detail;
        this.detailLoading = false;
      },
      error: e => {
        this.detailLoading = false;
        this.error = this.apiError(e, 'Campaign container details could not be loaded.');
      }
    });
  }

  start(campaign: any): void {
    this.busy = true;
    this.data.startCampaign(campaign.id).subscribe({
      next: () => {
        this.busy = false;
        this.message = 'Campaign started. Discovery and execution are now scoped to this running container.';
        this.load();
      },
      error: e => {
        this.busy = false;
        this.error = this.apiError(e, 'Campaign could not be started.');
      }
    });
  }

  pause(campaign: any): void {
    this.busy = true;
    this.data.pauseCampaign(campaign.id).subscribe({
      next: () => { this.busy = false; this.message = 'Campaign paused.'; this.load(); },
      error: e => { this.busy = false; this.error = this.apiError(e, 'Campaign could not be paused.'); }
    });
  }

  resume(campaign: any): void {
    this.busy = true;
    this.data.resumeCampaign(campaign.id).subscribe({
      next: () => { this.busy = false; this.message = 'Campaign resumed.'; this.load(); },
      error: e => { this.busy = false; this.error = this.apiError(e, 'Campaign could not be resumed.'); }
    });
  }

  stop(campaign: any): void {
    this.busy = true;
    this.data.stopCampaign(campaign.id).subscribe({
      next: () => { this.busy = false; this.message = 'Campaign stopped.'; this.load(); },
      error: e => { this.busy = false; this.error = this.apiError(e, 'Campaign could not be stopped.'); }
    });
  }

  delete(campaign: any): void {
    if (!confirm(`Delete campaign container "${campaign.name}"? This removes its campaign execution data, tasks, runs, messages and target-list membership.`)) return;
    this.busy = true;
    this.data.deleteCampaign(campaign.id).subscribe({
      next: () => {
        this.busy = false;
        this.message = 'Campaign container deleted.';
        this.settingsOpenId = null;
        if (this.selectedCampaign?.id === campaign.id) {
          this.selectedCampaign = null;
          this.detail = null;
          this.selectedTask = null;
        }
        this.load();
      },
      error: e => {
        this.busy = false;
        this.error = this.apiError(e, 'Campaign container could not be deleted.');
      }
    });
  }

  selectTask(task: any): void {
    this.selectedTask = this.selectedTask?.id === task.id ? null : task;
  }

  taskIcon(type: any): string {
    switch (String(type ?? '').toLowerCase()) {
      case 'discover': return '⌕';
      case 'qualify': return '✓';
      case 'enrich': return '✦';
      case 'buildtargetlist': return '◎';
      case 'outreach': return '✉';
      case 'approval': return '⚿';
      case 'deliver': return '➤';
      default: return '◇';
    }
  }

  campaignVisualStatus(campaign: any): string {
    const s = this.status(campaign.status);
    if (s === 'Running') return 'running';
    if (s === 'Paused' || s === 'Draft' || s === 'Scheduled') return 'pending';
    if (s === 'Stopped') return 'failed';
    if (s === 'Completed') return 'success';
    return 'pending';
  }

  runStat(campaign: any, key: string): number {
    return Number(campaign[key] ?? 0);
  }

  openIndustryPacks(): void {
    void this.router.navigateByUrl('/industry-packs');
  }

  openApproval(): void {
    void this.router.navigateByUrl('/acquisition/approval-queue');
  }

  taskStatus(value: any): string {
    return ['Pending', 'Running', 'Completed', 'Failed'][Number(value)] || String(value ?? 'Pending');
  }

  pipelineStatus(index: number): string {
    const tasks = this.detail?.tasks || [];
    const typeByIndex = ['Discover', 'Qualify', 'Enrich', 'BuildTargetList', 'Outreach'];
    const task = tasks.find((x: any) => x.type === typeByIndex[index]);
    if (task) return this.taskStatus(task.status);
    if (index === 0 && this.detail?.latestRun) return this.taskStatus(this.detail.latestRun.status);
    return 'Pending';
  }

  currentTask(): any {
    const tasks = this.detail?.tasks || [];
    return tasks.find((x: any) => this.taskStatus(x.status) === 'Running')
      || tasks.find((x: any) => this.taskStatus(x.status) === 'Pending')
      || null;
  }

  hasApprovalWaiting(): boolean {
    return (this.detail?.tasks || []).some((x: any) => x.requiresApproval && this.taskStatus(x.status) !== 'Completed')
      || (this.detail?.latestRun?.status === 'WaitingApproval');
  }

  prospectStatus(value: any): string {
    return ['Discovered', 'Enriched', 'Qualified', 'Nurturing', 'Replied', 'DemoReady', 'Converted', 'Suppressed'][Number(value)] || String(value ?? 'Unknown');
  }

  approvalState(prospect: any): string {
    const campaignId = this.selectedCampaign?.id;
    const messages = this.detail?.activity || [];
    if (!campaignId || !messages.length) return '—';
    return 'Review in approval queue';
  }

  track(_: number, item: any): string {
    return item.id;
  }

  private apiError(error: any, fallback: string): string {
    return error?.error?.detail || error?.error?.error || (error?.status ? `${fallback} API returned ${error.status}.` : fallback);
  }
}
