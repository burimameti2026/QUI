import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { PageHeader } from '../../shared/ui';

interface TenantWorker {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  saving?: boolean;
}

@Component({
 standalone:true,
 imports:[CommonModule,RouterLink,PageHeader],
 template:`
 <main class="page page-platform-management">
  <qai-page-header title="Admin Workspace" subtitle="Manage clients, licenses, access and platform governance from one administration surface.">
   <a class="button-primary" routerLink="/admin/modules">＋ Add Client</a>
  </qai-page-header>

  <section class="hero platform-hero">
   <div class="platform-hero-copy"><span class="eyebrow">ADMIN CONTROL CENTER</span><h2>One administration surface for the whole platform.</h2><p>Create clients, assign licenses, control modules, manage access and review platform governance without leaving the admin workspace.</p></div>
   <div class="platform-hero-status"><span class="status-dot"></span><div class="stack"><b>Admin ready</b><small>Client and license controls available</small></div></div>
  </section>

  <section class="section"><header class="section-header"><div><span class="eyebrow">CLIENTS & LICENSING</span><h3>Client administration</h3><p>Create clients, configure administrators and assign the licenses and modules they are entitled to use.</p></div></header>
   <div class="content-grid platform-card-grid">
    <a routerLink="/admin/modules" class="card-link"><span class="icon">◈</span><div><b>Clients & Licenses</b><p>Create a client, create its administrator, assign a plan, set limits, enable modules and control the license lifecycle.</p></div><strong>Open →</strong></a>
   </div>
  </section>

  <section class="section"><header class="section-header"><div><span class="eyebrow">TENANT RUNTIME</span><h3>Background workers</h3><p>Each tenant decides which optional background workers are allowed to run. New tenants start with all optional workers disabled.</p></div></header>
   <div class="content-grid platform-card-grid">
    <article class="card" *ngFor="let worker of workers">
      <header class="card-header">
        <div><span class="eyebrow">WORKER</span><h3>{{ worker.name }}</h3></div>
        <span class="status-pill" [class.success]="worker.enabled">{{ worker.enabled ? 'Enabled' : 'Disabled' }}</span>
      </header>
      <div class="card-body">
        <p>{{ worker.description }}</p>
        <div class="actions">
          <button type="button" class="button-primary" [disabled]="worker.saving" (click)="toggleWorker(worker)">
            {{ worker.saving ? 'Saving…' : (worker.enabled ? 'Stop worker' : 'Start worker') }}
          </button>
        </div>
      </div>
    </article>
    <article class="card" *ngIf="workers.length === 0 && !workersLoading">
      <div class="card-body"><div class="empty"><strong>No optional workers configured.</strong><span>The API did not return any tenant worker definitions.</span></div></div>
    </article>
   </div>
  </section>

  <section class="section"><header class="section-header"><div><span class="eyebrow">ACCESS & COMMERCE</span><h3>Administration</h3><p>Keep access, subscriptions and accountability consistent.</p></div></header>
   <div class="content-grid">
    <a routerLink="/users" class="card-link"><span class="icon">◎</span><div><b>Users & Roles</b><p>Manage users and role-based access across enabled modules.</p></div><strong>Open →</strong></a>
    <a routerLink="/billing" class="card-link"><span class="icon">€</span><div><b>Billing & Subscription</b><p>Review subscriptions, usage and recurring billing controls.</p></div><strong>Open →</strong></a>
    <a routerLink="/audit" class="card-link"><span class="icon">✓</span><div><b>Audit & Governance</b><p>Review administrative changes, permissions and lifecycle events.</p></div><strong>Open →</strong></a>
   </div>
  </section>

  <section class="section"><header class="section-header"><div><span class="eyebrow">AUTONOMOUS OPERATIONS</span><h3>Acquisition & automation</h3><p>Monitor the engine that turns discovery into qualified demand.</p></div></header>
   <div class="content-grid">
    <a routerLink="/ai/agents" class="card-link"><span class="icon">✦</span><div><b>AI Agents</b><p>Configure the platform intelligence available to licensed clients.</p></div><strong>Open →</strong></a>
    <a routerLink="/automations" class="card-link"><span class="icon">⚡</span><div><b>Automations</b><p>Monitor schedules, queued runs and daily autonomous execution.</p></div><strong>Open →</strong></a>
    <a routerLink="/acquisition/autonomous" class="card-link"><span class="icon">⌕</span><div><b>Daily Acquisition</b><p>Follow discovery → scoring → approval → promotion.</p></div><strong>Open →</strong></a>
   </div>
  </section>
 </main>`,
})
export class PlatformManagementPage implements OnInit {
  workers: TenantWorker[] = [];
  workersLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadWorkers();
  }

  private loadWorkers(): void {
    this.workersLoading = true;
    this.api.get<TenantWorker[]>('platform/workers').subscribe({
      next: workers => { this.workers = workers; this.workersLoading = false; },
      error: () => { this.workers = []; this.workersLoading = false; },
    });
  }

  toggleWorker(worker: TenantWorker): void {
    worker.saving = true;
    this.api.put<TenantWorker>(`platform/workers/${encodeURIComponent(worker.key)}`, { enabled: !worker.enabled }).subscribe({
      next: result => {
        worker.enabled = result.enabled;
        worker.saving = false;
      },
      error: () => { worker.saving = false; },
    });
  }
}
