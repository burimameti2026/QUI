import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  templateUrl: './autonomous-acquisition.page.html',
  styleUrl: './autonomous-acquisition.page.css'
})
export class AutonomousAcquisitionPage implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  tenantId = '';
  agents: any[] = [];
  runs: any[] = [];
  templates: any[] = [];
  editing: any = null;
  error = '';
  loading = false;
  saving = false;

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
      const [agents, runs, templates] = await Promise.all([
        firstValueFrom(this.api.get<any[]>(`${base}/agents`)),
        firstValueFrom(this.api.get<any[]>(`${base}/runs`)),
        firstValueFrom(this.api.get<any[]>('autonomous-acquisition/templates'))
      ]);
      this.agents = agents || [];
      this.runs = runs || [];
      this.templates = templates || [];
    } catch (error: any) {
      this.error = error?.error?.detail || error?.error?.title || 'Agents could not be loaded.';
    } finally {
      this.loading = false;
    }
  }

  create() {
    const t = this.templates.find(x => x.code === 'logistics');
    this.editing = {
      name: 'Logistics Acquisition Agent',
      templateCode: t?.code || 'logistics',
      industry: t?.industry || 'Logistics & Transport',
      region: t?.region || 'Europe',
      minimumScore: t?.minimumScore || 75,
      dailyDiscoveryLimit: 25,
      dailyEmailLimit: 10,
      runTimeUtc: '08:00',
      countries: ['DE', 'FR', 'IT', 'NL', 'BE', 'AT'],
      icpNotes: t?.painPoints || 'Find logistics, transport, 3PL and distribution companies with evidence of operational growth or automation opportunities.'
    };
  }

  edit(agent: any) {
    this.editing = { ...agent };
  }

  cancelEdit() {
    this.editing = null;
  }

  async save() {
    if (!this.tenantId || !this.editing) return;

    this.saving = true;
    this.error = '';
    try {
      const isEdit = !!this.editing.id;
      const path = `autonomous-acquisition/tenants/${this.tenantId}/agents${isEdit ? `/${this.editing.id}` : ''}`;
      const request = isEdit
        ? this.api.put(path, this.editing)
        : this.api.post(path, this.editing);
      await firstValueFrom(request);
      this.editing = null;
      await this.load();
    } catch (error: any) {
      this.error = error?.error?.detail || error?.error?.title || 'Agent could not be saved.';
    } finally {
      this.saving = false;
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
