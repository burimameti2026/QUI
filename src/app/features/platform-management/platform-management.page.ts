import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AdminStaticI18nDirective } from '../../core/admin-static-i18n.directive';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeader, AdminStaticI18nDirective],
  template: `
    <div qaiAdminStaticI18n>
      <qai-page-header title="Platform Management" subtitle="Master administration for tenants, licensing, billing and autonomous operations."></qai-page-header>

      <section class="hero">
        <div>
          <span class="eyebrow">MASTER CONTROL</span>
          <h2>Operate the platform through clear management domains.</h2>
          <p>Create and govern tenants, assign users and roles, control licensed modules, and monitor autonomous operations.</p>
        </div>
        <a routerLink="/platform/prepare-workspace" class="primary">Prepare a workspace →</a>
      </section>

      <section class="section">
        <div class="section-heading"><span class="eyebrow">TENANT OPERATIONS</span><h3>Tenant lifecycle</h3><p>Control the commercial and access foundations of every workspace.</p></div>
        <div class="grid">
          <a routerLink="/admin/modules" class="card blue"><span class="card-number">01</span><h3>Tenants & Licensing</h3><p>Assign tenants, plans, modules and entitlements.</p><strong>Open management →</strong></a>
          <a routerLink="/users" class="card violet"><span class="card-number">02</span><h3>Users & Roles</h3><p>Create users and verify which modules each role can access.</p><strong>Manage access →</strong></a>
          <a routerLink="/billing" class="card green"><span class="card-number">03</span><h3>Billing & Invoices</h3><p>Manage subscriptions, usage and recurring monthly invoicing.</p><strong>Open billing →</strong></a>
        </div>
      </section>

      <section class="section">
        <div class="section-heading"><span class="eyebrow">AUTONOMOUS OPERATIONS</span><h3>AI & automation control</h3><p>Monitor the systems that execute work for each tenant.</p></div>
        <div class="grid">
          <a routerLink="/ai/agents" class="card violet"><span class="card-number">04</span><h3>Agents</h3><p>Define agents and assign them to tenant use cases.</p><strong>Manage agents →</strong></a>
          <a routerLink="/automations" class="card green"><span class="card-number">05</span><h3>Automations</h3><p>Monitor schedules, executions and daily autonomous runs.</p><strong>View automations →</strong></a>
          <a routerLink="/audit" class="card amber"><span class="card-number">06</span><h3>Audit & Governance</h3><p>Review administrative and operational changes.</p><strong>Review audit →</strong></a>
        </div>
      </section>

      <section class="section">
        <div class="section-heading"><span class="eyebrow">WORKSPACE CONTROL</span><h3>Workspace templates</h3><p>Prepare tenant-owned operating environments from controlled templates.</p></div>
        <div class="grid">
          <a routerLink="/platform/prepare-workspace" class="card featured blue"><span class="card-number">07</span><h3>Prepare Real Workspace</h3><p>Choose the use case and target market, provision the acquisition agent, queue the first discovery run and enable the tenant's daily automation.</p><strong>Open workspace builder →</strong></a>
          <a routerLink="/platform/packages" class="card violet"><span class="card-number">08</span><h3>Workspace Packages</h3><p>Install a complete operating package when you intentionally want the provisioned package scenario.</p><strong>View packages →</strong></a>
          <a routerLink="/acquisition/autonomous" class="card green"><span class="card-number">09</span><h3>Daily Acquisition</h3><p>Run and monitor discovery → scoring → approval → promotion automation.</p><strong>Open acquisition →</strong></a>
        </div>
      </section>
    </div>
  `,
  styles: [
    `:host{display:block;--dash-border:#dfe5ed;--dash-ink:#172033;--dash-muted:#68758a;--dash-surface:#f6f8fb}.eyebrow{display:block;color:#66748b;font-size:10px;font-weight:800;letter-spacing:1.15px}.hero{display:flex;justify-content:space-between;gap:28px;align-items:center;padding:28px;margin-bottom:14px;overflow:hidden;border:1px solid #d9e0ea;border-radius:16px;background:radial-gradient(circle at 88% 10%,#dbeafe 0,transparent 30%),linear-gradient(120deg,#f8fafc 0%,#eef2f7 58%,#f2effc 100%);box-shadow:0 7px 20px #17203309}.hero h2{margin:7px 0 8px;color:#172033;font-size:22px;letter-spacing:-.4px}.hero p{max-width:720px;margin:0;color:#68758a;font-size:11px;line-height:1.65}.primary{padding:11px 16px;border-radius:8px;text-decoration:none;font-size:10px;font-weight:700;background:#2563eb;color:#fff;white-space:nowrap;box-shadow:0 5px 12px #2563eb25}.primary:hover{background:#1d4ed8}.section{margin:0 0 14px;padding:18px;border:1px solid #dfe5ed;border-radius:14px;background:#f4f6f9;box-shadow:0 6px 18px #17203309}.section-heading{margin-bottom:13px}.section-heading h3{margin:5px 0 4px;color:#172033;font-size:14px;letter-spacing:-.1px}.section-heading p{margin:0;color:#7b8798;font-size:10px;line-height:1.5}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{--accent:#2563eb;--accent-soft:#dbeafe;position:relative;display:block;min-height:145px;box-sizing:border-box;padding:16px;overflow:hidden;text-decoration:none;color:inherit;border:1px solid #dfe5ed;border-radius:13px;background:linear-gradient(145deg,#fff 0%,#f4f6f9 100%);box-shadow:0 5px 16px #1720330a;transition:transform 160ms ease,border-color 160ms ease,box-shadow 160ms ease}.card::before{content:'';position:absolute;inset:0 0 auto;height:3px;background:var(--accent)}.card::after{content:'';position:absolute;width:90px;height:90px;top:-52px;right:-38px;border-radius:50%;background:var(--accent-soft);opacity:.65}.card:hover{transform:translateY(-2px);border-color:#c5d0df;background:linear-gradient(145deg,#fff 0%,#f1f4f8 100%);box-shadow:0 12px 26px #17203314}.card.blue{--accent:#2563eb;--accent-soft:#dbeafe}.card.violet{--accent:#7c3aed;--accent-soft:#ede9fe}.card.green{--accent:#059669;--accent-soft:#d1fae5}.card.amber{--accent:#d97706;--accent-soft:#fef3c7}.card-number{position:relative;z-index:1;display:grid;width:31px;height:31px;place-items:center;margin-bottom:13px;border-radius:9px;color:var(--accent);background:var(--accent-soft);font-size:10px;font-weight:800}.card h3{position:relative;z-index:1;margin:0 0 6px;color:#172033;font-size:13px}.card p{position:relative;z-index:1;margin:0;min-height:32px;color:#68758a;font-size:9px;line-height:1.55}.card strong{position:relative;z-index:1;display:block;margin-top:12px;color:var(--accent);font-size:9px}.featured{min-height:165px}@media(max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:700px){.hero{flex-direction:column;align-items:flex-start}.grid{grid-template-columns:1fr}}`
  ]
})
export class PlatformManagementPage {}
