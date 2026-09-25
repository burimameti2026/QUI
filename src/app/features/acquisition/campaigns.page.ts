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
  plan: any = null;
  loading = false;
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
        if (this.selectedCampaign) {
          this.selectedCampaign = this.rows.find(x => x.id === this.selectedCampaign.id) || null;
        }
        if (!this.selectedCampaign && this.rows.length) this.inspect(this.rows[0]);
        this.loading = false;
      },
      error: e => {
        this.loading = false;
        this.error = this.apiError(e, 'Campaign containers could not be loaded.');
      }
    });
  }

  inspect(campaign: any): void {
    this.selectedCampaign = campaign;
    this.plan = this.parsePlan(campaign?.planJson);
  }

  start(campaign: any): void {
    this.busy = true;
    this.data.startCampaign(campaign.id).subscribe({
      next: () => {
        this.busy = false;
        this.message = 'Campaign started. Execution remains subject to the campaign worker and approval gates.';
        this.load();
      },
      error: e => {
        this.busy = false;
        this.error = this.apiError(e, 'Campaign could not be started.');
      }
    });
  }

  pause(campaign: any): void {
    this.data.pauseCampaign(campaign.id).subscribe({
      next: () => { this.message = 'Campaign paused.'; this.load(); },
      error: e => this.error = this.apiError(e, 'Campaign could not be paused.')
    });
  }

  resume(campaign: any): void {
    this.data.resumeCampaign(campaign.id).subscribe({
      next: () => { this.message = 'Campaign resumed.'; this.load(); },
      error: e => this.error = this.apiError(e, 'Campaign could not be resumed.')
    });
  }

  stop(campaign: any): void {
    this.data.stopCampaign(campaign.id).subscribe({
      next: () => { this.message = 'Campaign stopped.'; this.load(); },
      error: e => this.error = this.apiError(e, 'Campaign could not be stopped.')
    });
  }

  openIndustryPacks(): void {
    void this.router.navigateByUrl('/industry-packs');
  }

  workflowSteps(): any[] {
    return this.plan?.steps || [];
  }

  private parsePlan(value: any): any {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try { return JSON.parse(value); } catch { return null; }
  }

  private apiError(error: any, fallback: string): string {
    return error?.error?.detail || error?.error?.error || (error?.status ? `${fallback} API returned ${error.status}.` : fallback);
  }
}
