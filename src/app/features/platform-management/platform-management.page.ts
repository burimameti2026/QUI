import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone:true, imports:[CommonModule,RouterLink,PageHeader],
  template:`
  <qai-page-header title="Platform Management" subtitle="Master administration for tenants, licensing, billing and autonomous operations."></qai-page-header>
  <section class="hero"><div><b>MASTER CONTROL</b><h2>Operate the platform through clear management domains.</h2><p>Create and govern tenants, assign users and roles, control licensed modules, and monitor autonomous operations.</p></div><a routerLink="/platform/packages" class="primary">Prepare a workspace</a></section>
  <section class="section"><h3>Tenant lifecycle</h3><div class="grid"><a routerLink="/admin/modules" class="card"><span>01</span><h3>Tenants & Licensing</h3><p>Assign tenants, plans, modules and entitlements.</p></a><a routerLink="/users" class="card"><span>02</span><h3>Users & Roles</h3><p>Create users and verify which modules each role can access.</p></a><a routerLink="/billing" class="card"><span>03</span><h3>Billing & Invoices</h3><p>Manage subscriptions, usage and recurring monthly invoicing.</p></a></div></section>
  <section class="section"><h3>Autonomous operations</h3><div class="grid"><a routerLink="/ai/agents" class="card"><span>04</span><h3>Agents</h3><p>Define agents and assign them to tenant use cases.</p></a><a routerLink="/automations" class="card"><span>05</span><h3>Automations</h3><p>Monitor schedules, executions and daily autonomous runs.</p></a><a routerLink="/audit" class="card"><span>06</span><h3>Audit & Governance</h3><p>Review administrative and operational changes.</p></a></div></section>
  <section class="section"><h3>Workspace templates</h3><div class="grid"><a routerLink="/platform/packages" class="card featured"><span>07</span><h3>Workspace Packages</h3><p>Install FusionFleet Promotion, QualifyAI Acquisition or a blank workspace into the current or selected tenant.</p><strong>Open package library →</strong></a><a routerLink="/acquisition/autonomous" class="card"><span>08</span><h3>FusionFleet Daily Acquisition</h3><p>Run and monitor discovery → scoring → approval → promotion automation.</p></a><a routerLink="/pipeline" class="card"><span>09</span><h3>Revenue Pipeline</h3><p>Review qualified leads, opportunities and next commercial actions.</p></a></div></section>
  `,
  styles:[`.hero{display:flex;justify-content:space-between;gap:24px;align-items:center;padding:30px;border:1px solid var(--border,#ddd);border-radius:14px}.hero h2{margin:8px 0}.hero p{max-width:760px}.section{margin:28px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}.card{display:block;padding:22px;border:1px solid var(--border,#ddd);border-radius:12px;text-decoration:none;color:inherit;background:var(--surface,#fff)}.card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.08)}.card span{font-size:12px;font-weight:700;opacity:.6}.card h3{margin:10px 0}.featured{border-width:2px}.primary{padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:600;background:var(--primary,#2563eb);color:#fff;white-space:nowrap}@media(max-width:700px){.hero{flex-direction:column;align-items:flex-start}}`]
})
export class PlatformManagementPage {}
