import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { QaiKpiGrid, QaiKpiMetric } from '../../shared/components/kpi/kpi-grid.component';
import { PackageInstallResult, WorkspacePackage, WorkspacePackageId, WorkspacePackagesService } from './workspace-packages.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeader, QaiKpiGrid],
  template: `
    <main class="page">
      <qai-page-header title="Workspace Packages" subtitle="Provision reusable operating packages into the current tenant workspace.">
        <button class="button-quiet" type="button" (click)="result = null">Clear result</button>
        <a class="button-primary" routerLink="/platform/prepare-workspace">Prepare real workspace</a>
      </qai-page-header>

      <section class="hero">
        <div>
          <span class="eyebrow">WORKSPACE PACKAGES</span>
          <h2>Start a workspace from a proven operating setup.</h2>
          <p>Choose a package, select the installation target and provision the required modules through the tenant-safe installation flow.</p>
        </div>
        <div class="stack">
          <span><i class="status-dot"></i> Package library</span>
          <span><b>{{ packages.length }}</b> available packages</span>
          <span><b>{{ tenantId || 'Current workspace' }}</b> target</span>
        </div>
      </section>

      <qai-kpi-grid [metrics]="kpiMetrics"></qai-kpi-grid>

      <section class="content-grid">
        <article class="card workspace-target">
          <header class="card-header">
            <div>
              <span class="eyebrow">TARGET WORKSPACE</span>
              <h3>Installation target</h3>
            </div>
          </header>
          <div class="card-body">
            <label>
              <span>Target tenant ID</span>
              <input [(ngModel)]="tenantId" placeholder="Current tenant if empty" />
              <small>Leave empty to install into the current workspace. Master administrators can select another tenant.</small>
            </label>
          </div>
        </article>

        <article class="card package-intent">
          <header class="card-header">
            <div>
              <span class="eyebrow">OPERATING MODEL</span>
              <h3>Package installation</h3>
            </div>
          </header>
          <div class="list">
            <div class="list-item"><span class="icon">01</span><span class="stack"><strong>Select a package</strong><span>Choose the scenario that matches the workspace operating model.</span></span></div>
            <div class="list-item"><span class="icon">02</span><span class="stack"><strong>Provision modules</strong><span>Required modules are installed as one controlled package.</span></span></div>
            <div class="list-item"><span class="icon">03</span><span class="stack"><strong>Continue the workflow</strong><span>Move directly into the configured acquisition or revenue flow.</span></span></div>
          </div>
        </article>
      </section>

      <section class="card">
        <header class="card-header">
          <div>
            <span class="eyebrow">PACKAGE LIBRARY</span>
            <h3>Available operating packages</h3>
          </div>
          <span class="status">{{ packages.length }} packages</span>
        </header>
        <div class="card-body">
          <div class="content-grid">
            <article class="card" *ngFor="let item of packages">
            <header class="card-header">
              <div class="identity">
                <span class="icon">{{ packages.indexOf(item) + 1 | number:'2.0' }}</span>
                <div>
                  <h3>{{ item.name }}</h3>
                  <span class="status" *ngIf="item.id === 'fusionfleet-promotion'">Recommended</span>
                </div>
              </div>
            </header>
            <div class="card-body">
              <p class="package-description">{{ item.description }}</p>
              <div class="facts">
                <div><span>Required modules</span><strong>{{ item.requiredModules.length || 'Manual setup' }}</strong></div>
              </div>
              <div class="list" *ngIf="item.requiredModules.length">
                <div class="list-item" *ngFor="let module of item.requiredModules"><span>{{ module }}</span></div>
              </div>
            </div>
            <footer class="card-footer">
              <button class="button-primary" type="button" (click)="install(item)" [disabled]="installing">{{ installing && selected === item.id ? 'Installing…' : 'Install package' }}</button>
            </footer>
            </article>
          </div>
        </div>
      </section>

      <section *ngIf="result" class="card">
        <header class="card-header">
          <div><span class="eyebrow">INSTALLATION COMPLETE</span><h3>{{ result.scenario }}</h3></div>
          <span class="status">Installed</span>
        </header>
        <div class="card-body">
          <div class="facts">
            <div><span>Prospects</span><strong>{{ result.prospects }}</strong></div>
            <div><span>Campaigns</span><strong>{{ result.campaigns }}</strong></div>
            <div><span>Opportunities</span><strong>{{ result.opportunities }}</strong></div>
            <div><span>Meetings</span><strong>{{ result.meetings }}</strong></div>
            <div><span>Tickets</span><strong>{{ result.tickets }}</strong></div>
            <div><span>Automations</span><strong>{{ result.automations }}</strong></div>
          </div>
        </div>
        <footer class="card-footer actions">
          <button class="button-primary" type="button" (click)="continueWorkflow()">Continue to workflow</button>
          <a *ngIf="result.packageId === 'fusionfleet-promotion'" class="button-secondary" routerLink="/acquisition/autonomous">Configure automation</a>
          <a *ngIf="result.packageId === 'qualifyai-acquisition'" class="button-secondary" routerLink="/pipeline">Open revenue pipeline</a>
          <a class="button-secondary" routerLink="/ai/agents">Open agents</a>
        </footer>
      </section>

      <div *ngIf="status" [class.alert]="error" [class.notice]="!error">{{ status }}</div>
    </main> `,
})
export class WorkspacePackagesPage {
  private readonly service = inject(WorkspacePackagesService);
  private readonly router = inject(Router);
  readonly packages = this.service.packages;
  tenantId = '';
  selected: WorkspacePackageId = 'fusionfleet-promotion';
  installing = false;
  status = '';
  error = false;
  result: PackageInstallResult | null = null;

  get kpiMetrics(): QaiKpiMetric[] {
    return [
      { label: 'Available packages', value: this.packages.length, detail: 'reusable workspace setups', icon: '▦' },
      { label: 'Recommended', value: 1, detail: 'FusionFleet Promotion', icon: '✦' },
      { label: 'Provisioning', value: 'Ready', detail: 'install into workspace', icon: '✓' },
      { label: 'Mode', value: 'Tenant-safe', detail: 'current or selected tenant', icon: '◎' }
    ];
  }

  install(item: WorkspacePackage): void {
    if (this.installing) return;
    this.selected = item.id;
    this.installing = true;
    this.error = false;
    this.result = null;
    this.status = `Installing ${item.name}…`;
    this.service.install({ packageId: item.id, tenantId: this.tenantId.trim() || undefined }).subscribe({
      next: result => {
        this.installing = false;
        this.result = result;
        this.status = `${item.name} installed successfully.`;
      },
      error: e => {
        this.installing = false;
        this.error = true;
        this.status = e?.error?.detail || 'Package installation failed.';
      }
    });
  }

  continueWorkflow(): void {
    if (!this.result) return;
    const route = this.result.packageId === 'fusionfleet-promotion'
      ? '/acquisition/autonomous'
      : this.result.packageId === 'qualifyai-acquisition'
        ? '/pipeline'
        : '/platform';
    this.router.navigate([route]);
  }
}
