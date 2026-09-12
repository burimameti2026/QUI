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
   <div class="overview-copy"><span class="eyebrow">RENOVA CONTROL CENTER</span><h2>One administration surface for the whole platform.</h2><p>Manage the workspace foundation, users, billing, autonomous acquisition and governance without leaving the enterprise shell.</p></div>
   <div class="overview-status"><span class="status-dot"></span><div><b>Platform ready</b><small>Renova workspace controls available</small></div></div>
  </section>
  <section class="section"><header><div><span class="eyebrow">WORKSPACE</span><h3>Workspace management</h3><p>Provision and govern tenant-owned environments.</p></div></header>
   <div class="cards">
    <a routerLink="/platform/prepare-workspace" class="card featured"><span class="card-icon orange">✦</span><div><b>Prepare Real Workspace</b><p>Configure the use case, market and autonomous acquisition agent, then queue the first discovery run.</p></div><strong>Open →</strong></a>
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
    <a routerLink="/acquisition/autonomous" class="card"><span class="card-icon orange">⌕</span><div><b>Daily Acquisition</b><p>Follow discovery → scoring → approval → promotion.</p></div><strong>Open →</strong></a>
   </div>
  </section>
 </div>`,
 styles:[`
 :host{display:block;color:#172033}.platform{--ink:#172033;--muted:#6d7a8e;--border:#e1e3e6}.eyebrow{display:block;color:#7b8491;font-size:9px;font-weight:850;letter-spacing:1.2px}.primary{display:inline-flex;align-items:center;height:38px;padding:0 14px;border-radius:9px;background:#e86b1f;color:#fff;text-decoration:none;font-size:10px;font-weight:800;box-shadow:0 6px 14px rgba(232,107,31,.18)}.primary:hover{background:#d95f17}.overview{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 16px;padding:22px 24px;border:1px solid #e1e3e6;border-radius:14px;background:linear-gradient(110deg,#fff 0%,#faf8f5 62%,#fff4ec 100%);box-shadow:0 8px 22px rgba(23,32,51,.05)}.overview-copy h2{margin:6px 0 7px;font-size:22px;letter-spacing:-.4px}.overview-copy p{max-width:760px;margin:0;color:var(--muted);font-size:10px;line-height:1.65}.overview-status{display:flex;align-items:center;gap:9px;min-width:205px;padding:10px 12px;border:1px solid #e5e7e8;border-radius:10px;background:#fff}.status-dot{width:9px;height:9px;border-radius:50%;background:#18a66a;box-shadow:0 0 0 4px #e6f7ef}.overview-status div{display:flex;flex-direction:column}.overview-status b{font-size:10px}.overview-status small{margin-top:3px;color:#7b8491;font-size:8px}.section{margin-bottom:14px;padding:18px;border:1px solid var(--border);border-radius:14px;background:#fff;box-shadow:0 6px 18px rgba(23,32,51,.035)}.section header{margin-bottom:13px}.section h3{margin:5px 0 3px;font-size:15px}.section header p{margin:0;color:var(--muted);font-size:9px}.cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.card{position:relative;display:grid;grid-template-columns:38px 1fr auto;align-items:start;gap:11px;min-height:106px;padding:14px;border:1px solid #e2e4e7;border-radius:11px;background:#fff;text-decoration:none;color:inherit;box-shadow:0 4px 12px rgba(23,32,51,.035);transition:.16s}.card:hover{transform:translateY(-2px);border-color:#efc0a2;box-shadow:0 10px 22px rgba(23,32,51,.08)}.card.featured{border-color:#efc6ac;background:#fffaf6}.card-icon{display:grid;width:38px;height:38px;place-items:center;border-radius:10px;font-size:15px;font-weight:850}.card-icon.orange{background:#fff0e7;color:#e86b1f}.card-icon.blue{background:#edf4ff;color:#2563eb}.card-icon.green{background:#e6f7ef;color:#07905a}.card-icon.violet{background:#f0ebff;color:#7041dc}.card-icon.amber{background:#fff6df;color:#b7791f}.card div b{display:block;margin-top:1px;font-size:11px}.card div p{margin:5px 0 0;color:#6d7a8e;font-size:8.5px;line-height:1.55}.card>strong{align-self:center;color:#e86b1f;font-size:9px;white-space:nowrap}.section:last-child{margin-bottom:0}@media(max-width:950px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))}.overview{align-items:flex-start;flex-direction:column}.overview-status{min-width:0}}@media(max-width:650px){.cards{grid-template-columns:1fr}.primary{margin-top:6px}.overview{padding:18px}.section{padding:14px}}
 `]
})
export class PlatformManagementPage {}
