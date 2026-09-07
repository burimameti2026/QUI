import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeader],
  template: `
    <qai-page-header title="Platform Management" subtitle="Master administration for tenants, licensing, billing and autonomous operations."></qai-page-header>
    <div class="grid">
      <a routerLink="/admin/modules" class="card"><h3>Tenants & Modules</h3><p>Provision tenants, assign licensed modules and manage lifecycle.</p></a>
      <a routerLink="/users" class="card"><h3>Users & Roles</h3><p>Create users and manage access by tenant role.</p></a>
      <a routerLink="/billing" class="card"><h3>Plans & Billing</h3><p>Subscriptions, usage and invoices.</p></a>
      <a routerLink="/ai/agents" class="card"><h3>Agent Management</h3><p>Define AI agents and configure autonomous operations.</p></a>
      <a routerLink="/automations" class="card"><h3>Automation Monitor</h3><p>Schedules, workflow execution and automation status.</p></a>
      <a routerLink="/audit" class="card"><h3>Audit & Governance</h3><p>Review platform activity and operational changes.</p></a>
    </div>
  `,
  styles:[`.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{display:block;padding:22px;border:1px solid var(--border,#ddd);border-radius:12px;text-decoration:none;color:inherit;background:var(--surface,#fff)}.card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}.card h3{margin-top:0}`]
})
export class PlatformManagementPage {}
