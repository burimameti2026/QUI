import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AdminStaticI18nDirective } from '../../core/admin-static-i18n.directive';

@Component({
 standalone:true,imports:[CommonModule,RouterLink,PageHeader,AdminStaticI18nDirective],
 template:`
 <div class="platform" qaiAdminStaticI18n>
  <qai-page-header title="Platform Management" subtitle="Control tenants, access, automation and workspace provisioning from one place.">
   <a class="primary" routerLink="/platform/prepare-workspace">＋ Prepare Real Workspace</a>
  </qai-page-header>
  <section class="overview">
   <div class="overview-copy"><span class="eyebrow">LEADSAI CONTROL CENTER</span><h2>One administration surface for the whole platform.</h2><p>Manage the workspace foundation, users, billing, autonomous acquisition and governance without leaving the enterprise shell.</p></div>
   <div class="overview-status"><span class="status-dot"></span><div><b>Platform ready</b><small>Workspace controls available</small></div></div>
  </section>
  <section class="section"><header><div><span class="eyebrow">WORKSPACE</span><h3>Workspace management</h3><p>Provision and govern tenant-owned environments.</p></div></header>
   <div class="cards">
    <a routerLink="/platform/prepare-workspace" class="card featured"><span class="card-icon blue">✦</span><div><b>Prepare Real Workspace</b><p>Configure the use case, market and autonomous acquisition agent, then queue the first discovery run.</p></div><strong>Open →</strong></a>
    <a routerLink="/platform/packages" class="card"><span class="card-icon violet">▦</span><div><b>Workspace Packages</b><p>Review reusable operating packages and controlled provisioning options.</p></div><strong>Open →</strong></a>
    <a routerLink="/admin/modules" class="card"><span class="card-icon blue">◈</span><div><b>Tenants & Licensing</b><p>Control tenants, plans, modules and platform entitlements.</p></div><strong>Open →</strong></a>
   </div>
  </section>
  <section class="section"><header><div><span class="eyebrow">ACCESS & COMMERCE</span><h3>Administration</h3><p>Keep access, subscriptions and accountability consistent.</p></div></header>
   <div class="cards">
    <a routerLink="/users" class="card"><span class="card-icon blue">◎</span><div><b>Users & Roles</b><p>Manage users and role-based access across enabled modules.</p></div><strong>Open →</strong></a>
    <a routerLink="/billing" class="card"><span class="card-icon green">€</span><div><b>Billing & Subscription</b><p>Review subscriptions, usage and recurring billing controls.</p></div><strong>Open →</strong></a>
    <a routerLink="/audit" class="card"><span class="card-icon amber">✓</span><div><b>Audit & Governance</b><p>Review administrative changes, permissions and lifecycle events.</p></div><strong>Open →</strong></a>
   </div>
  </section>
  <section class="section"><header><div><span class="eyebrow">AUTONOMOUS OPERATIONS</span><h3>Acquisition & automation</h3><p>Monitor the engine that turns discovery into qualified demand.</p></div></header>
   <div class="cards">
    <a routerLink="/ai/agents" class="card"><span class="card-icon violet">✦</span><div><b>Acquisition Agents</b><p>Configure autonomous agents and their tenant use cases.</p></div><strong>Open →</strong></a>
    <a routerLink="/automations" class="card"><span class="card-icon green">⚡</span><div><b>Automations</b><p>Monitor schedules, queued runs and daily autonomous execution.</p></div><strong>Open →</strong></a>
    <a routerLink="/acquisition/autonomous" class="card"><span class="card-icon blue">⌕</span><div><b>Daily Acquisition</b><p>Follow discovery → scoring → approval → promotion.</p></div><strong>Open →</strong></a>
   </div>
  </section>
 </div>`,
 styles:[`
 :host{display:block;color:#111827}.platform{--ink:#111827;--muted:#667085;--border:#e5e7eb}.eyebrow{display:block;color:#667085;font-size:9px;font-weight:800;letter-spacing:1.1px}.primary{display:inline-flex;align-items:center;height:36px;padding:0 14px;border-radius:8px;background:#2563eb;color:#fff;text-decoration:none;font-size:10px;font-weight:700;box-shadow:0 4px 11px rgba(37,99,235,.15)}.primary:hover{background:#1d4ed8}.overview{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 14px;padding:22px 24px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;box-shadow:0 5px 18px rgba(16,24,40,.045)}.overview-copy h2{margin:6px 0 7px;font-size:21px;letter-spacing:-.4px;color:#111827}.overview-copy p{max-width:760px;margin:0;color:var(--muted);font-size:10px;line-height:1.65}.overview-status{display:flex;align-items:center;gap:9px;min-width:205px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:9px;background:#fafbfc}.status-dot{width:9px;height:9px;border-radius:50%;background:#087443;box-shadow:0 0 0 4px #ecfdf3}.overview-status div{display:flex;flex-direction:column}.overview-status b{font-size:10px;color:#111827}.overview-status small{margin-top:3px;color:#667085;font-size:8px}.section{margin-bottom:12px;padding:17px;border:1px solid var(--border);border-radius:12px;background:#fff;box-shadow:0 5px 18px rgba(16,24,40,.045)}.section header{margin-bottom:13px}.section h3{margin:5px 0 3px;font-size:15px;color:#111827}.section header p{margin:0;color:var(--muted);font-size:9px}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.card{position:relative;display:grid;grid-template-columns:38px 1fr auto;align-items:start;gap:11px;min-height:108px;padding:14px;border:1px solid #e5e7eb;border-radius:10px;background:#fff;text-decoration:none;color:inherit;box-shadow:0 4px 12px rgba(16,24,40,.035);transition:.16s}.card:hover{transform:translateY(-2px);border-color:#bfd1f6;box-shadow:0 9px 24px rgba(16,24,40,.07)}.card.featured{border-color:#cfe0ff;background:#f8fbff}.card-icon{display:grid;width:38px;height:38px;place-items:center;border-radius:9px;font-size:15px;font-weight:800}.card-icon.blue{background:#eff6ff;color:#2563eb}.card-icon.green{background:#ecfdf3;color:#087443}.card-icon.violet{background:#f3efff;color:#7c3aed}.card-icon.amber{background:#fffaeb;color:#b54708}.card div b{display:block;margin-top:1px;font-size:11px;color:#111827}.card div p{margin:5px 0 0;color:#667085;font-size:8.5px;line-height:1.55}.card>strong{align-self:center;color:#2563eb;font-size:9px;white-space:nowrap}.section:last-child{margin-bottom:0}@media(max-width:950px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.overview{align-items:flex-start;flex-direction:column}.overview-status{min-width:0}}@media(max-width:650px){.cards{grid-template-columns:1fr}.primary{margin-top:6px}.overview{padding:18px}.section{padding:14px}}
 `]
})
export class PlatformManagementPage {}
