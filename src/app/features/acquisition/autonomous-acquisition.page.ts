import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
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
export class AutonomousAcquisitionPage implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  tenantId = '';
  agents: any[] = [];
  runs: any[] = [];
  verification: any = null;
  e2eResult: any = null;
  editing: any = null;
  settings = { serpApiApiKey: '', monthlySafetyLimit: 200, timeZoneId: 'UTC' };
  hasSerpApiKey = false;
  savingSettings = false;
  error = '';
  loading = false;
  autoRefresh = false;
  timer?: ReturnType<typeof setInterval>;

  get active() { return this.agents.filter(x => String(x.status).toLowerCase().includes('active') || x.status === 1).length; }
  get completed() { return this.runs.filter(x => String(x.status).toLowerCase().includes('completed') || x.status === 2).length; }
  get discovered() { return this.runs.reduce((n, x) => n + Number(x.discoveredCount || 0), 0); }
  get qualified() { return this.runs.reduce((n, x) => n + Number(x.qualifiedCount || 0), 0); }
  get emails() { return this.runs.reduce((n, x) => n + Number(x.emailsSentCount || 0), 0); }

  ngOnInit(): void {
    this.tenantId = this.auth.session()?.tenantId || '';
    void this.load();
  }

  ngOnDestroy(): void { this.stopRefresh(); }

  async load() {
    if (!this.tenantId) { this.error = 'No authenticated tenant is available.'; return; }
    this.loading = true;
    this.error = '';
    try {
      const base = `autonomous-acquisition/tenants/${this.tenantId}`;
      const [agents, runs, settings] = await Promise.all([
        firstValueFrom(this.api.get<any[]>(`${base}/agents`)),
        firstValueFrom(this.api.get<any[]>(`${base}/runs`)),
        firstValueFrom(this.api.get<any>('autonomous-acquisition/settings'))
      ]);
      this.agents = agents || [];
      this.runs = runs || [];
      this.hasSerpApiKey = !!settings?.hasSerpApiKey;
      this.settings.monthlySafetyLimit = Number(settings?.monthlySafetyLimit || 200);
      this.settings.timeZoneId = settings?.timeZoneId || 'UTC';
    } catch (error: any) {
      this.error = error?.error?.detail || 'Could not load autonomous acquisition data.';
    } finally { this.loading = false; }
  }

  toggleRefresh() {
    this.stopRefresh();
    if (this.autoRefresh && this.tenantId) this.timer = setInterval(() => void this.load(), 10000);
  }

  private stopRefresh() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  async saveSettings() {
    this.savingSettings = true;
    this.error = '';
    try {
      const result = await firstValueFrom(this.api.put<any>('autonomous-acquisition/settings', {
        serpApiApiKey: this.settings.serpApiApiKey || null,
        monthlySafetyLimit: Number(this.settings.monthlySafetyLimit) || 200,
        timeZoneId: this.settings.timeZoneId || 'UTC'
      }));
      this.hasSerpApiKey = !!result?.hasSerpApiKey;
      this.settings.serpApiApiKey = '';
      this.settings.monthlySafetyLimit = Number(result?.monthlySafetyLimit || this.settings.monthlySafetyLimit);
      this.settings.timeZoneId = result?.timeZoneId || this.settings.timeZoneId;
    } catch (error: any) { this.error = error?.error?.detail || 'Could not save tenant acquisition settings.'; }
    finally { this.savingSettings = false; }
  }

  async verify() {
    this.error = '';
    try { this.verification = await firstValueFrom(this.api.get<any>('autonomous-acquisition/verification')); }
    catch (error: any) { this.error = error?.error?.detail || 'System verification failed.'; }
  }

  async e2e() {
    if (!this.tenantId) { this.error = 'No authenticated tenant is available for E2E.'; return; }
    this.error = '';
    try { this.e2eResult = await firstValueFrom(this.api.get<any>(`autonomous-acquisition/tenants/${this.tenantId}/e2e`)); }
    catch (error: any) { this.error = error?.error?.detail || 'E2E verification failed.'; }
  }

  create() {
    this.editing = {
      name: 'Renova Balkan Distributor Acquisition Agent',
      templateCode: 'construction-materials',
      industry: 'Construction Materials',
      region: 'Balkans',
      minimumScore: 75,
      dailyDiscoveryLimit: 25,
      dailyEmailLimit: 10,
      runTimeUtc: '08:00',
      countries: ['AL', 'MK', 'XK'],
      icpNotes: 'Building-material distributors, wholesalers, construction companies and professional contractors; evidence of market presence and commercial contact required.'
    };
  }

  edit(agent: any) { this.editing = { ...agent }; }

  async save() {
    if (!this.tenantId || !this.editing) return;
    try {
      const isEdit = !!this.editing.id;
      const path = `autonomous-acquisition/tenants/${this.tenantId}/agents${isEdit ? `/${this.editing.id}` : ''}`;
      const request = isEdit ? this.api.put(path, this.editing) : this.api.post(path, this.editing);
      await firstValueFrom(request);
      this.editing = null;
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'Could not save agent.'; }
  }

  async action(agent: any, action: string) {
    if (!this.tenantId) return;
    try {
      await firstValueFrom(this.api.post(`autonomous-acquisition/tenants/${this.tenantId}/agents/${agent.id}/${action}`, {}));
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'Agent action failed.'; }
  }
}
