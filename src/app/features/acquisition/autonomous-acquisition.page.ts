import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  templateUrl: './autonomous-acquisition.page.html',
  styleUrl: './autonomous-acquisition.page.css'
})
export class AutonomousAcquisitionPage {
  tenantId = '';
  agents: any[] = [];
  runs: any[] = [];
  verification: any = null;
  e2eResult: any = null;
  editing: any = null;
  error = '';
  loading = false;
  autoRefresh = false;
  timer: any;

  get active() { return this.agents.filter(x => String(x.status).toLowerCase().includes('active') || x.status === 1).length; }
  get completed() { return this.runs.filter(x => String(x.status).toLowerCase().includes('completed') || x.status === 2).length; }
  get discovered() { return this.runs.reduce((n, x) => n + (x.discoveredCount || 0), 0); }
  get qualified() { return this.runs.reduce((n, x) => n + (x.qualifiedCount || 0), 0); }
  get emails() { return this.runs.reduce((n, x) => n + (x.emailsSentCount || 0), 0); }

  async json(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(String(response.status));
    return response.json();
  }

  async load() {
    if (!this.tenantId) { this.error = 'Tenant ID is required.'; return; }
    this.loading = true;
    this.error = '';
    try {
      const base = `/api/autonomous-acquisition/tenants/${this.tenantId}`;
      const [agents, runs] = await Promise.all([this.json(`${base}/agents`), this.json(`${base}/runs`)]);
      this.agents = agents || [];
      this.runs = runs || [];
    } catch { this.error = 'Could not load agents or runs from the API.'; }
    finally { this.loading = false; }
  }

  toggleRefresh() {
    clearInterval(this.timer);
    if (this.autoRefresh && this.tenantId) this.timer = setInterval(() => this.load(), 10000);
  }

  async verify() {
    this.error = '';
    try { this.verification = await this.json('/api/autonomous-acquisition/verification'); }
    catch { this.error = 'System verification failed.'; }
  }

  async e2e() {
    if (!this.tenantId) { this.error = 'Tenant ID is required for E2E.'; return; }
    this.error = '';
    try { this.e2eResult = await this.json(`/api/autonomous-acquisition/tenants/${this.tenantId}/e2e`); }
    catch { this.error = 'E2E verification failed.'; }
  }

  create() {
    this.editing = { name: '', templateCode: 'fleet', industry: 'Fleet', region: 'Europe', minimumScore: 90, dailyDiscoveryLimit: 50, dailyEmailLimit: 20, runTimeUtc: '08:00', icpNotes: '' };
  }

  edit(agent: any) { this.editing = { ...agent }; }

  async save() {
    try {
      const isEdit = !!this.editing.id;
      const url = `/api/autonomous-acquisition/tenants/${this.tenantId}/agents${isEdit ? `/${this.editing.id}` : ''}`;
      await this.jsonFetch(url, isEdit ? 'PUT' : 'POST', this.editing);
      this.editing = null;
      await this.load();
    } catch { this.error = 'Could not save agent.'; }
  }

  async action(agent: any, action: string) {
    try {
      await this.jsonFetch(`/api/autonomous-acquisition/tenants/${this.tenantId}/agents/${agent.id}/${action}`, 'POST');
      await this.load();
    } catch { this.error = 'Agent action failed.'; }
  }

  async jsonFetch(url: string, method: string, body?: any) {
    const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) throw new Error(String(response.status));
    return response.json().catch(() => null);
  }
}
