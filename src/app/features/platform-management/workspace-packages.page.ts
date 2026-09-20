import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PageHeader } from '../../shared/ui';
import { PackageInstallResult, WorkspacePackage, WorkspacePackageId, WorkspacePackagesService } from './workspace-packages.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeader],
  template: `
    <main class="page">
      <qai-page-header
        title="Workspace Packages"
        subtitle="Install a reusable operating package into a tenant workspace."
      ></qai-page-header>

      <section class="metric-grid">
        <article class="metric">
          <div class="metric-top"><span class="metric-icon">▦</span><span class="metric-label">Available packages</span></div>
          <strong>{{ packages.length }}</strong>
          <small>Reusable workspace setups</small>
        </article>
        <article class="metric">
          <div class="metric-top"><span class="metric-icon">★</span><span class="metric-label">Recommended</span></div>
          <strong>1</strong>
          <small>FusionFleet Promotion</small>
        </article>
        <article class="metric">
          <div class="metric-top"><span class="metric-icon">✓</span><span class="metric-label">Provisioning</span></div>
          <strong>Ready</strong>
          <small>Install into workspace</small>
        </article>
        <article class="metric">
          <div class="metric-top"><span class="metric-icon">◎</span><span class="metric-label">Mode</span></div>
          <strong>Tenant-safe</strong>
          <small>Current or selected tenant</small>
        </article>
      </section>

      <section class="hero platform-hero">
        <div>
          <span class="eyebrow">PACKAGE LIBRARY</span>
          <h2>Choose a complete operating package.</h2>
          <p>Package installation provisions a complete scenario intentionally. For the editable tenant-owned flow, prepare a real workspace from a template first.</p>
          <div class="actions">
            <a routerLink="/platform/prepare-workspace" class="button-secondary">Prepare Real Workspace →</a>
          </div>
        </div>
      </section>

      <section class="card workspace-target">
        <div class="card-header">
          <div>
            <span class="eyebrow">TARGET WORKSPACE</span>
            <h3>Installation target</h3>
            <p>Leave empty to install into the current workspace.</p>
          </div>
        </div>
        <div class="card-body form">
          <label>
            Target tenant ID
            <input [(ngModel)]="tenantId" placeholder="Current tenant if empty" />
            <small>Master administrators can install into a specific tenant.</small>
          </label>
        </div>
      </section>

      <section class="section">
        <header class="section-header">
          <div>
            <span class="eyebrow">OPERATING PACKAGES</span>
            <h3>Available packages</h3>
            <p>Install a complete scenario while keeping tenant configuration controlled.</p>
          </div>
        </header>
        <div class="content-grid">
          <article class="card package-card" *ngFor="let item of packages" [class.selected]="selected === item.id">
            <div class="card-header">
              <div>
                <h3>{{ item.name }}</h3>
                <span class="status" *ngIf="item.id === 'fusionfleet-promotion'">Recommended</span>
              </div>
            </div>
            <div class="card-body">
              <p class="package-description">{{ item.description }}</p>
              <div class="facts">
                <div>
                  <span>Required modules</span>
                  <strong>{{ item.requiredModules.length || 'Manual setup' }}</strong>
                </div>
              </div>
              <div class="list" *ngIf="item.requiredModules.length">
                <div class="list-item" *ngFor="let module of item.requiredModules">
                  <span>{{ module }}</span>
                </div>
              </div>
            </div>
            <div class="card-footer actions">
              <button class="button-primary" type="button" (click)="install(item)" [disabled]="installing">
                {{ installing && selected === item.id ? 'Installing…' : 'Install package' }}
              </button>
            </div>
          </article>
        </div>
      </section>

      <section *ngIf="result" class="card install-result">
        <div class="card-header">
          <div>
            <span class="eyebrow">INSTALLATION COMPLETE</span>
            <h3>{{ result.scenario }}</h3>
          </div>
          <span class="status">Installed</span>
        </div>
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
        <div class="card-footer actions">
          <button class="button-primary" type="button" (click)="continueWorkflow()">Continue to workflow</button>
          <a *ngIf="result.packageId === 'fusionfleet-promotion'" class="button-secondary" routerLink="/acquisition/autonomous">Configure FusionFleet automation</a>
          <a *ngIf="result.packageId === 'qualifyai-acquisition'" class="button-secondary" routerLink="/pipeline">Open revenue pipeline</a>
          <a class="button-secondary" routerLink="/ai/agents">Open agents</a>
        </div>
      </section>

      <div *ngIf="status" [class.alert]="error" [class.notice]="!error">
        {{ status }}
      </div>
    </main>
  `,
  styleUrl: './workspace-packages.page.css'
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
