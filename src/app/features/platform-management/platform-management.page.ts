import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { AdminStaticI18nDirective } from '../../core/admin-static-i18n.directive';

@Component({
 standalone:true,imports:[CommonModule,RouterLink,PageHeader,AdminStaticI18nDirective],
 template:`
 <main class="page" qaiAdminStaticI18n>
  <qai-page-header title="Platform Management" subtitle="Control tenants, access, automation and workspace provisioning from one place.">
   <a class="button-primary" routerLink="/platform/prepare-workspace">＋ Prepare Real Workspace</a>
  </qai-page-header>

  <section class="hero platform-hero">
   <div class="platform-hero-copy"><span class="eyebrow">LEADSAI CONTROL CENTER</span><h2>One administration surface for the whole platform.</h2><p>Manage the workspace foundation, users, billing, autonomous acquisition and governance without leaving the enterprise shell.</p></div>
   <div class="platform-hero-status"><span class="status-dot"></span><div><b>Platform ready</b><small>Workspace controls available</small></div></div>
  </section>

  <section class="section"><header class="section-header"><div><span class="eyebrow">WORKSPACE</span><h3>Workspace management</h3><p>Provision and govern tenant-owned environments.</p></div></header>
   <div class="content-grid platform-card-grid">
    <a routerLink="/platform/prepare-workspace" class="card"><span class="icon">✦</span><div><b>Prepare Real Workspace</b><p>Configure the use case, market and autonomous acquisition agent, then queue the first discovery run.</p></div><strong>Open →</strong></a>
    <a routerLink="/platform/packages" class="card"><span class="icon">▦</span><div><b>Workspace Packages</b><p>Review reusable operating packages and controlled provisioning options.</p></div><strong>Open →</strong></a>
    <a routerLink="/admin/modules" class="card"><span class="icon">◈</span><div><b>Tenants & Licensing</b><p>Control tenants, plans, modules and platform entitlements.</p></div><strong>Open →</strong></a>
   </div>
  </section>

  <section class="section"><header class="section-header"><div><span class="eyebrow">ACCESS & COMMERCE</span><h3>Administration</h3><p>Keep access, subscriptions and accountability consistent.</p></div></header>
   <div class="content-grid">
    <a routerLink="/users" class="card"><span class="icon">◎</span><div><b>Users & Roles</b><p>Manage users and role-based access across enabled modules.</p></div><strong>Open →</strong></a>
    <a routerLink="/billing" class="card"><span class="icon">€</span><div><b>Billing & Subscription</b><p>Review subscriptions, usage and recurring billing controls.</p></div><strong>Open →</strong></a>
    <a routerLink="/audit" class="card"><span class="icon">✓</span><div><b>Audit & Governance</b><p>Review administrative changes, permissions and lifecycle events.</p></div><strong>Open →</strong></a>
   </div>
  </section>

  <section class="section"><header class="section-header"><div><span class="eyebrow">AUTONOMOUS OPERATIONS</span><h3>Acquisition & automation</h3><p>Monitor the engine that turns discovery into qualified demand.</p></div></header>
   <div class="content-grid">
    <a routerLink="/ai/agents" class="card"><span class="icon">✦</span><div><b>Acquisition Agents</b><p>Configure autonomous agents and their tenant use cases.</p></div><strong>Open →</strong></a>
    <a routerLink="/automations" class="card"><span class="icon">⚡</span><div><b>Automations</b><p>Monitor schedules, queued runs and daily autonomous execution.</p></div><strong>Open →</strong></a>
    <a routerLink="/acquisition/autonomous" class="card"><span class="icon">⌕</span><div><b>Daily Acquisition</b><p>Follow discovery → scoring → approval → promotion.</p></div><strong>Open →</strong></a>
   </div>
  </section>
 </main>`
})
export class PlatformManagementPage {}
