import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  templateUrl: './campaign-history.page.html',
  styleUrls: ['./campaign-history.page.css']
})
export class CampaignHistoryPage implements OnInit, OnDestroy {
  rows: any[] = [];
  loading = false;
  error = '';
  search = '';
  campaignName = '';
  containerName = '';
  agentName = '';
  packCode = '';
  status = '';
  stepType = '';
  fromUtc = '';
  toUtc = '';
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly data: AcquisitionService) {}

  ngOnInit(): void {
    this.load();
    this.timer = setInterval(() => this.load(true), 5000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  load(silent = false): void {
    if (!silent) this.loading = true;
    this.error = '';
    this.data.campaignHistory({
      campaignName: this.campaignName,
      containerName: this.containerName,
      agentName: this.agentName,
      packCode: this.packCode,
      status: this.status,
      stepType: this.stepType,
      fromUtc: this.fromUtc ? new Date(this.fromUtc).toISOString() : '',
      toUtc: this.toUtc ? new Date(this.toUtc).toISOString() : '',
      take: 1000
    }).subscribe({
      next: r => {
        const q = this.search.trim().toLowerCase();
        const items = r?.items || [];
        this.rows = q
          ? items.filter((x: any) => [x.campaignName, x.containerName, x.agentName, x.packCode, x.stepName, x.stepType, x.eventType, x.message, x.runId].some(v => String(v ?? '').toLowerCase().includes(q)))
          : items;
        this.loading = false;
      },
      error: e => {
        this.loading = false;
        this.error = e?.error?.detail || e?.error?.error || 'Campaign execution history could not be loaded.';
      }
    });
  }

  clear(): void {
    this.search = this.campaignName = this.containerName = this.agentName = this.packCode = this.status = this.stepType = this.fromUtc = this.toUtc = '';
    this.load();
  }

  statusLabel(value: any): string {
    return String(value || 'Info');
  }
}