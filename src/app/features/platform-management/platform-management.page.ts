import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { PlatformManagementService, ScenarioInstallResult } from './platform-management.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeader],
  template: `
    <qai-page-header title="Platform Management" subtitle="Master administration for the QualifyAI platform."></qai-page-header>
    <section class="hero"><div><b>MASTER CONTROL</b><h2>Manage tenants, licensing, billing and autonomous operations from one place.</h2></div><a routerLink="/admin/modules" class="primary">Manage tenants</a></section>
    <div class="section"><h3>Platform administration</h3><div class="grid">
      <a routerLink="/admin/modules" class="card"><span>01</span><h3>Tenants & Licensing</h3><p>Provision tenants, lifecycle, modules and entitlements.</p></a>
      <a routerLink="/users" class="card"><span>02</span><h3>Users & Roles</h3><p>Create users and verify effective access by role.</p></a>
      <a routerLink="/billing" class="card"><span>03</span><h3>Plans & Billing</h3><p>Subscriptions, usage and monthly invoices.</p></a>
    </div></div>
    <div class="section"><h3>Autonomous operations</h3><div class="grid">
      <a routerLink="/ai/agents" class="card"><span>04</span><h3>Agent Management</h3><p>Define agents, assign tenants and configure use cases.</p></a>
      <a routerLink="/automations" class="card"><span>05</span><h3>Automation Monitor</h3><p>Schedules, executions and daily autonomous runs.</p></a>
      <a routerLink="/audit" class="card"><span>06</span><h3>Audit & Governance</h3><p>Review operational and administrative changes.</p></a>
    </div></div>
    <div class="section fusion"><div><b>POC USE CASE</b><h3>FusionFleet Promotion Automation</h3><p>Install the FusionFleet workspace package, then configure and monitor the daily discovery → scoring → promotion flow.</p><p *ngIf="status" class="status" [class.error]="error">{{status}}</p><div *ngIf="result" class="result"><span>{{result.prospects || 0}} prospects</span><span>{{result.campaigns || 0}} campaigns</span><span>{{result.opportunities || 0}} opportunities</span><span>{{result.meetings || 0}} meetings</span><span>{{result.automations || 0}} automations</span></div></div><div class="actions"><button type="button" class="primary" (click)="prepareRealWorkspace()" [disabled]="preparing">{{preparing ? 'Installing…' : 'Prepare Real Workspace'}}</button><a routerLink="/platform/packages" class="secondary">Choose package</a><a routerLink="/ai/agents" class="secondary">Configure agent</a><a routerLink="/acquisition/autonomous" class="secondary">Open acquisition</a></div></div>
  `,
  styles:[`.hero,.fusion{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:28px;border:1px solid var(--border,#ddd);border-radius:14px;margin-bottom:28px}.hero h2{max-width:700px;margin:8px 0 0}.section{margin:28px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{display:block;padding:22px;border:1px solid var(--border,#ddd);border-radius:12px;text-decoration:none;color:inherit;background:var(--surface,#fff)}.card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}.card span{font-size:12px;font-weight:700;opacity:.6}.card h3{margin:10px 0}.actions{display:flex;gap:12px;flex-wrap:wrap}.primary,.secondary{padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:600;cursor:pointer}.primary{background:var(--primary,#2563eb);color:#fff;border:0}.primary:disabled{opacity:.65;cursor:wait}.secondary{border:1px solid var(--border,#ddd);color:inherit}.status{margin:12px 0 0}.error{color:#b91c1c}.result{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.result span{font-size:12px;padding:6px 9px;border:1px solid var(--border,#ddd);border-radius:999px}@media(max-width:700px){.hero,.fusion{flex-direction:column;align-items:flex-start}}`]
})
export class PlatformManagementPage {
  private readonly platform = inject(PlatformManagementService);
  private readonly router = inject(Router);
  preparing = false;
  status = '';
  error = false;
  result: ScenarioInstallResult | null = null;

  prepareRealWorkspace(): void {
    if (this.preparing) return;
    this.preparing = true;
    this.status = 'Installing FusionFleet Promotion workspace…';
    this.error = false;
    this.result = null;
    this.platform.installRealWorkspace().subscribe({
      next: (result) => {
        this.preparing = false;
        this.result = result;
        this.status = 'FusionFleet workspace installed. Opening autonomous acquisition…';
        setTimeout(() => this.router.navigate(['/acquisition/autonomous']), 700);
      },
      error: (err) => {
        this.preparing = false;
        this.error = true;
        this.status = err?.error?.detail || 'Workspace installation failed. Check tenant access and API availability.';
      }
    });
  }
}
