import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Callout, Modal, PageHeader, WizardSteps } from "../../shared/ui";
import { AcquisitionService } from "./acquisition.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader, WizardSteps, Callout],
  template: `
<div class="discover-page">
<qai-page-header
      title="Prospect Discovery"
      subtitle="Define who you want to sell to, collect market evidence and prioritize companies showing real buying intent."
    >


      <button class="quiet-action" (click)="load()">↻ Refresh data</button>
      <button (click)="openIcp()">+ New ICP</button>
      <button (click)="prospectOpen = true">+ Add prospect</button>
      <button class="primary" [disabled]="!activeIcp || discoveryRunning" (click)="openOnlineDiscovery()">⌕ Find online</button>
      <button class="primary" [disabled]="!activeIcp" (click)="openBulk()">⇧ Import companies</button>
    </qai-page-header>
    <section class="discovery-hero">
      <div class="hero-copy">
        <span class="section-kicker">Acquisition workflow</span>
        <h2>Build an evidence-backed target market</h2>
        <p>Define fit, import verified accounts and move only qualified prospects into controlled outreach.</p>
        <div class="hero-context">
          <span><i></i>{{ activeIcp ? activeIcp.name : 'ICP required' }}</span>
          <span><b>{{ selectedIds.size }}</b> selected</span>
          <span><b>{{ overview.hot || 0 }}</b> high priority</span>
        </div>
      </div>
      <div class="journey-panel">
        <span class="journey-label">Current workflow progress</span>
        <qai-wizard-steps
          [steps]="['Define ICP', 'Verify data', 'Build audience', 'Launch']"
          [descriptions]="['Target market', 'Trusted source', 'Qualified accounts', 'Approval gate']"
          [current]="journeyStep"
        />
      </div>
    </section>

    <section class="discovery-metrics">
      <article class="metric-card blue"><i>◆</i><div><span>Discovered</span><strong>{{ overview.discovered || 0 }}</strong><small>Verified accounts</small></div></article>
      <article class="metric-card rose"><i>↗</i><div><span>Hot prospects</span><strong>{{ overview.hot || 0 }}</strong><small>Fit + buying intent</small></div></article>
      <article class="metric-card violet"><i>◈</i><div><span>Active campaigns</span><strong>{{ overview.activeCampaigns || 0 }}</strong><small>Controlled outreach</small></div></article>
      <article class="metric-card amber"><i>↩</i><div><span>Replies</span><strong>{{ overview.replies || 0 }}</strong><small>Open conversations</small></div></article>
      <article class="metric-card green"><i>✓</i><div><span>Demo ready</span><strong>{{ overview.demoReady || 0 }}</strong><small>Sales handoff</small></div></article>
      <article class="metric-card teal"><i>◎</i><div><span>Selected</span><strong>{{ selectedIds.size }}</strong><small>Audience ready</small></div></article>
    </section>

    <div class="notice error-notice" *ngIf="error"><b>!</b><span>{{ error }}</span></div>
    <div class="notice success-notice" *ngIf="message"><b>✓</b><span>{{ message }}</span></div>

    <section class="workspace-grid">
      <article class="workspace-card icp-card">
        <header class="workspace-header">
          <div><span class="section-kicker">QUALIFICATION MODEL</span><h3>Ideal customer profiles</h3><p>Choose the rules used to qualify this audience.</p></div>
          <button class="header-action" (click)="openIcp()">+ New profile</button>
        </header>
        <div class="profile-list" *ngIf="icps.length">
          <label class="profile-option" *ngFor="let x of icps" [class.selected]="selectedIcpId === x.id" [class.paused]="!x.active">
            <input type="radio" name="activeIcp" [value]="x.id" [(ngModel)]="selectedIcpId" [disabled]="!x.active" />
            <span class="profile-mark">{{ x.name.charAt(0) }}</span>
            <span class="profile-copy"><strong>{{ x.name }}</strong><small>{{ x.industry || 'All industries' }} · {{ x.countriesCsv || 'All countries' }}</small><em>{{ x.minimumEmployees || 0 }}–{{ x.maximumEmployees || '∞' }} employees</em></span>
            <span class="profile-state">{{ x.active ? (selectedIcpId === x.id ? 'Selected' : 'Use profile') : 'Paused' }}</span>
          </label>
        </div>
        <div class="empty-state" *ngIf="!icps.length"><i>◎</i><strong>No customer profile yet</strong><span>Create an ICP before importing company data.</span><button (click)="openIcp()">Create first profile</button></div>
      </article>

      <article class="workspace-card audience-card">
        <header class="workspace-header">
          <div><span class="section-kicker">AUDIENCE BUILDER</span><h3>Create target list</h3><p>Turn selected companies into a reusable campaign audience.</p></div>
        </header>
        <div class="selection-summary">
          <span class="selection-count">{{ selectedIds.size }}</span>
          <div><strong>Prospects selected</strong><span>{{ selectedIds.size ? 'Ready to create an audience' : 'Select accounts from the grid below' }}</span></div>
        </div>
        <label class="list-name">Target list name<input [(ngModel)]="listName" placeholder="DACH manufacturers with freight demand" /></label>
        <button class="primary create-list" [disabled]="!selectedIds.size || !listName.trim()" (click)="createList()">Create target list <span>→</span></button>
        <small class="audience-help">Creating a list does not send outreach.</small>
      </article>
    </section>

    <section class="prospect-card">
      <header class="prospect-header">
        <div><span class="section-kicker">MARKET EVIDENCE</span><h3>Prioritized prospects</h3><p>Fit and intent remain separate so account size is never mistaken for buying readiness.</p></div>
        <label class="score-filter"><span>Minimum score</span><input type="number" min="0" max="100" [(ngModel)]="minimumScore" (change)="loadProspects()" /></label>
      </header>
      <div class="prospect-toolbar">
        <span><b>{{ prospects.length }}</b> prospects shown</span>
        <span *ngIf="selectedIds.size"><b>{{ selectedIds.size }}</b> selected for audience</span>
        <button *ngIf="selectedIds.size" (click)="selectedIds.clear()">Clear selection</button>
      </div>
      <div class="prospect-table-wrap" *ngIf="prospects.length">
      <table class="prospect-table">
        <thead>