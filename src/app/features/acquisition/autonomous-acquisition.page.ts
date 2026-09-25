import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: './autonomous-acquisition.page.html',
  styleUrl: './autonomous-acquisition.page.css'
})
export class AutonomousAcquisitionPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  tenantId = '';
  agents: any[] = [];
  runs: any[] = [];
  error = '';
  loading = false;

  get activeCount() {
    return this.agents.filter(x => this.statusKey(x.status) === 'Active').length;
  }

  get pausedCount() {
    return this.agents.filter(x => this.statusKey(x.status) === 'Paused').length;
  }

  get stoppedCount() {
    return this.agents.filter(x => this.statusKey(x.status) === 'Stopped').length;
  }

  get runningCount() {
    return this.runs.filter(x => this.statusKey(x.status) === 'Running' || this.statusKey(x.status) === 'Queued').length;
  }

  get completedCount() {
    return this.runs.filter(x => this.statusKey(x.status) === 'Completed').length;
  }

  ngOnInit(): void {
    this.tenantId = this.auth.session()?.tenantId || '';
    void this.load();
  }

  async load() {
    if (!this.tenantId) {
      this.error = 'No authenticated tenant is available.';
      return;
    }

    this.loading = true;
    this.error = '';
    try {
      const base = `autonomous-acquisition/tenants/${this.tenantId}`;
      this.agents = await firstValueFrom(this.api.get<any[]>(`${base}/agents`)) || [];
      const runLists = await Promise.all(this.agents.map(agent =>
        firstValueFrom(this.api.get<any[]>(`${base}/agents/${agent.id}/runs`)).catch(() => [])
      ));
      this.runs = runLists.flat().sort((a, b) =>
        new Date(b.scheduledAtUtc || 0).getTime() - new Date(a.scheduledAtUtc || 0).getTime()
      );
    } catch (error: any) {
      this.error = error?.error?.detail || error?.error?.title || 'Agents could not be loaded.';
    } finally {
      this.loading = false;
    }
  }

  async action(agent: any, action: 'activate' | 'pause' | 'stop' | 'run') {
    if (!this.tenantId || !agent?.id) return;

    this.error = '';
    try {
      await firstValueFrom(
        this.api.post(
          `autonomous-acquisition/tenants/${this.tenantId}/agents/${agent.id}/${action}`,
          {}
        )
      );
      await this.load();
    } catch (error: any) {
      this.error = error?.error?.detail || error?.error?.title || 'Agent action failed.';
    }
  }

  statusKey(value: any): string {
    if (typeof value === 'number') {
      return ['Draft', 'Active', 'Paused', 'Stopped', 'Failed'][value] || String(value);
    }
    const text = String(value ?? '').trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : 'Unknown';
  }

  statusClass(value: any): string {
    return this.statusKey(value).toLowerCase().replace(/\\s+/g, '-');
  }
}
