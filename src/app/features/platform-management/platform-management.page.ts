import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeader],
  template: `
    <qai-page-header title="Platform Management" subtitle="Master administration for the QualifyAI platform."></qai-page-header>
    <section class="hero">
      <div><b>MASTER CONTROL</b><h2>Manage tenants, licensing, billing and autonomous operations from one place.</h2></div>
      <a routerLink="/admin/modules" class="primary">Manage tenants</a>
    </section>
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
    <div class="section fusion"><div><b>POC USE CASE</b><h3>FusionFleet Promotion Automation</h3><p>Prepare a real workspace, configure the autonomous acquisition agent and monitor the daily discovery → scoring → promotion flow.</p></div><div class="actions"><a routerLink="/ai/agents" class="primary">Configure agent</a><a routerLink="/acquisition/autonomous" class="secondary">Open acquisition</a></div></div>
  `,
  styles:[`.hero,.fusion{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:28px;border:1px solid var(--border,#ddd);border-radius:14px;margin-bottom:28px}.hero h2{max-width:700px;margin:8px 0 0}.section{margin:28px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{display:block;padding:22px;border:1px solid var(--border,#ddd);border-radius:12px;text-decoration:none;color:inherit;background:var(--surface,#fff)}.card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}.card span{font-size:12px;font-weight:700;opacity:.6}.card h3{margin:10px 0}.actions{display:flex;gap:12px;flex-wrap:wrap}.primary,.secondary{padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:600}.primary{background:var(--primary,#2563eb);color:#fff}.secondary{border:1px solid var(--border,#ddd);color:inherit}@media(max-width:700px){.hero,.fusion{flex-direction:column;align-items:flex-start}`]
})
export class PlatformManagementPage {}
