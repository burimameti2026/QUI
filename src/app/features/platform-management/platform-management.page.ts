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
 :host{display:block;min-height:100%;background:#f5f7fb;color:#101828}.platform{width:100%;--ink:#172033;--muted:#667085;--border:#e3e8ef}
 qai-page-header .page-header{margin:0 20px!important;padding:20px 0 16px!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important}
 qai-page-header .page-header h1{color:#202124!important;font-size:22px!important;font-weight:700!important;letter-spacing:-.02em!important}.page-header p{color:#667085!important}
 qai-page-header .page-header button,.page-header a{height:34px!important;min-height:34px!important;padding:0 12px!important;border:1px solid #dfe5ed!important;border-radius:8px!important;background:#fff!important;color:#475467!important;font-size:9px!important;font-weight:700!important}
 qai-page-header .page-header a.primary{border-color:#f97316!important;background:#f97316!important;color:#fff!important;box-shadow:none!important}
 qai-page-header .page-header a.primary:hover{background:#ea580c!important}
 .overview{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 20px 14px!important;padding:20px!important;border:1px solid #e3e8ef!important;border-radius:12px!important;background:#fff!important;box-shadow:0 2px 5px rgba(16,24,40,.035),0 7px 18px rgba(36,60,88,.05)!important}
 .overview-copy .eyebrow,.section .eyebrow{color:#f97316!important;font-size:9px!important;font-weight:800!important;letter-spacing:.11em!important}.overview-copy h2{margin:5px 0 6px!important;color:#172033!important;font-size:16px!important;line-height:1.3!important;font-weight:750!important}.overview-copy p{max-width:760px!important;margin:0!important;color:#667085!important;font-size:9px!important;line-height:1.6!important}
 .overview-status{display:flex!important;align-items:center!important;gap:10px!important;min-width:200px!important;padding:10px 12px!important;border:1px solid #ccebd9!important;border-radius:9px!important;background:#f0faf4!important}.status-dot{width:9px!important;height:9px!important;border-radius:50%!important;background:#15803d!important;box-shadow:0 0 0 4px #dcfce7!important}.overview-status div{display:flex!important;flex-direction:column!important}.overview-status b{color:#166534!important;font-size:9px!important}.overview-status small{margin-top:3px!important;color:#667085!important;font-size:8px!important}
 .platform-metrics{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:10px!important;margin:0 20px 14px!important}.platform-metrics article{position:relative!important;display:flex!important;gap:11px!important;min-height:92px!important;padding:15px 16px!important;border:1px solid #e3e8ef!important;border-radius:10px!important;background:#fff!important;box-shadow:0 2px 5px rgba(16,24,40,.035),0 7px 18px rgba(36,60,88,.05)!important}.platform-metrics article:before{content:""!important;position:absolute!important;top:0!important;left:0!important;width:100%!important;height:3px!important;border-radius:10px 10px 0 0!important;background:#2563eb!important}.platform-metrics article:nth-child(2):before{background:#7c3aed!important}.platform-metrics article:nth-child(3):before{background:#059669!important}.platform-metrics article:nth-child(4):before{background:#d97706!important}.metric-icon{display:grid!important;width:32px!important;height:32px!important;flex:0 0 32px!important;place-items:center!important;border-radius:8px!important;font-size:11px!important;font-weight:800!important}.metric-icon.blue{background:#edf4ff!important;color:#2563eb!important}.metric-icon.violet{background:#f2edff!important;color:#7c3aed!important}.metric-icon.green{background:#eaf9f1!important;color:#059669!important}.metric-icon.amber{background:#fff5df!important;color:#d97706!important}.platform-metrics small,.platform-metrics em{display:block!important;color:#667085!important;font-size:8px!important;line-height:1.35!important;font-style:normal!important}.platform-metrics strong{display:block!important;margin:5px 0 2px!important;color:#172033!important;font-size:16px!important;line-height:1!important}.platform-metrics em{color:#8293a7!important}
 .section{margin:0 20px 14px!important;padding:16px!important;border:1px solid #e3e8ef!important;border-radius:12px!important;background:#fff!important;box-shadow:0 2px 5px rgba(16,24,40,.035),0 7px 18px rgba(36,60,88,.05)!important}.section header{margin-bottom:13px!important}.section h3{margin:4px 0 3px!important;color:#d95f0a!important;font-size:14px!important;font-weight:750!important}.section header p{margin:0!important;color:#8293a7!important;font-size:9px!important}
 .cards{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}.card{position:relative!important;display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:start!important;gap:11px!important;min-height:108px!important;padding:14px!important;border:1px solid #e3e8ef!important;border-radius:10px!important;background:#fff!important;text-decoration:none!important;color:inherit!important;box-shadow:0 2px 5px rgba(16,24,40,.025),0 5px 15px rgba(36,60,88,.035)!important;transition:.16s!important}.card:hover{transform:translateY(-1px)!important;border-color:#fed7aa!important;box-shadow:0 7px 20px rgba(36,60,88,.07)!important}.card.featured{border-color:#fdba74!important;background:#fffaf6!important}.card-icon{display:grid!important;width:38px!important;height:38px!important;place-items:center!important;border-radius:9px!important;font-size:14px!important;font-weight:800!important}.card-icon.blue{background:#edf4ff!important;color:#2563eb!important}.card-icon.green{background:#eaf9f1!important;color:#059669!important}.card-icon.violet{background:#f2edff!important;color:#7c3aed!important}.card-icon.amber{background:#fff5df!important;color:#d97706!important}.card div{min-width:0!important}.card div b{display:block!important;margin-top:1px!important;color:#d95f0a!important;font-size:10px!important;font-weight:750!important}.card div p{margin:5px 0 0!important;color:#667085!important;font-size:8px!important;line-height:1.55!important}.card>strong{align-self:center!important;color:#c2410c!important;font-size:8px!important;white-space:nowrap!important}
 .section:last-child{margin-bottom:24px!important}
 .platform qai-page-header .page-header a.primary,.platform qai-page-header .page-header a.primary:visited{background:#f97316!important;border-color:#f97316!important;color:#fff!important;box-shadow:none!important}.platform qai-page-header .page-header a.primary:hover,.platform qai-page-header .page-header a.primary:focus{background:#ea580c!important;border-color:#ea580c!important;color:#fff!important}
 @media(max-width:1050px){.cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}.platform-metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}.overview{align-items:flex-start!important;flex-direction:column!important}.overview-status{min-width:0!important}}
 @media(max-width:650px){qai-page-header .page-header,.overview,.platform-metrics,.section{margin-left:12px!important;margin-right:12px!important}.cards,.platform-metrics{grid-template-columns:1fr!important}.overview{padding:16px!important}.section{padding:14px!important}.card{grid-template-columns:36px minmax(0,1fr)!important}.card>strong{grid-column:2!important;justify-self:start!important;margin-top:4px!important}}
 `]
})
export class PlatformManagementPage {}
