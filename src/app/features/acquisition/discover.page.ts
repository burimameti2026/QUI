import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Callout, Modal, PageHeader, WizardSteps } from "../../shared/ui";
import { AcquisitionService } from "./acquisition.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader, WizardSteps, Callout],
  template: `
<div class="page" *ngIf="qualificationMode">
  <qai-page-header title="Qualification & Score" subtitle="Turn discovered prospects into a controlled, reusable audience before messaging.">
    <button class="button-quiet" (click)="load()">↻ Refresh data</button>
    <button class="button-secondary" (click)="router.navigate(['/discover'])">← Prospecting</button>
    <button class="button-primary" [disabled]="!qualifiedProspects.length" (click)="createQualifiedAudience()">Create qualified audience</button>
  </qai-page-header>
  <section class="hero">
    <div class="stack"><span class="eyebrow">03 · QUALIFICATION</span><h2>Choose who is ready for outreach</h2><p>Score the prospects already discovered for this ICP. Nothing is sent from this step.</p></div>
    <div class="card"><span class="eyebrow">Current audience</span><h3>{{ prospects.length }} discovered</h3><p>{{ qualifiedProspects.length }} meet the current threshold.</p></div>
  </section>
  <div class="notice" *ngIf="error"><b>!</b><span>{{ error }}</span></div>
  <div class="notice success" *ngIf="qualificationMessage"><b>✓</b><span>{{ qualificationMessage }}</span></div>
  <section class="content-grid">
    <article class="card">
      <header class="card-header"><div><span class="eyebrow">Qualification rule</span><h3>Minimum combined score</h3><p>Fit contributes 55% and intent contributes 45% to the priority score.</p></div></header>
      <label>Minimum score<input type="number" min="0" max="100" [(ngModel)]="qualificationScore" (change)="applyQualificationScore()"></label>
      <div class="notice"><strong>{{ qualifiedProspects.length }}</strong><span><b>Qualified prospects</b><small>Ready to become a campaign audience</small></span></div>
      <div class="actions"><button class="button-primary" [disabled]="!qualifiedProspects.length" (click)="createQualifiedAudience()">Create audience →</button></div>
    </article>
    <article class="card">
      <header class="card-header"><div><span class="eyebrow">Selected ICP</span><h3>{{ activeIcp?.name || 'No ICP selected' }}</h3><p>{{ activeIcp?.industry || 'Create/select an ICP first.' }}</p></div></header>
      <div class="list-item" *ngIf="activeIcp"><span class="status">Active</span><span class="stack"><strong>{{ activeIcp.countriesCsv || 'All markets' }}</strong><small>{{ activeIcp.minimumEmployees || 0 }}–{{ activeIcp.maximumEmployees || '∞' }} employees</small></span></div>
      <div class="empty" *ngIf="!activeIcp"><strong>ICP required</strong><span>Go back to Prospecting and select or create an ICP.</span><button (click)="router.navigate(['/acquisition/icp'])">Open ICP</button></div>
    </article>
  </section>
  <section class="card">
    <header class="card-header"><div><span class="eyebrow">Qualified audience</span><h3>Review before campaigns</h3><p>Only prospects above the threshold are included. You can change the rule and rebuild the audience.</p></div><button class="button-primary" [disabled]="!qualifiedProspects.length" (click)="continueToCampaigns()">Continue to Campaigns →</button></header>
    <div class="table" *ngIf="qualifiedProspects.length"><table><thead><tr><th>Company</th><th>Contact</th><th>Fit</th><th>Intent</th><th>Score</th><th>Status</th></tr></thead><tbody><tr *ngFor="let x of qualifiedProspects"><td><b>{{ x.companyName }}</b><small>{{ x.domain }}</small></td><td><b>{{ x.contactName || 'Research needed' }}</b><small>{{ x.jobTitle || 'Role unknown' }}</small></td><td>{{ x.fitScore }}</td><td>{{ x.intentScore }}</td><td><span class="status">{{ priority(x) }}</span></td><td>{{ status(x.status) }}</td></tr></tbody></table></div>
    <div class="empty" *ngIf="!qualifiedProspects.length"><strong>No prospects qualify yet</strong><span>Lower the threshold or return to Prospecting to discover/import more companies.</span></div>
  </section>
</div>
<div class="page" *ngIf="!qualificationMode">
  <qai-page-header title="Prospect Discovery" subtitle="Define who you want to sell to, collect market evidence and prioritize companies showing real buying intent.">
    <button class="button-quiet" (click)="load()">↻ Refresh data</button>
    <button (click)="openIcp()">+ New ICP</button>
    <button (click)="prospectOpen = true">+ Add prospect</button>
    <button class="button-primary" [disabled]="!activeIcp || discoveryRunning" (click)="openOnlineDiscovery()">⌕ Find online</button>
    <button class="button-primary" [disabled]="!activeIcp" (click)="openBulk()">⇧ Import companies</button>
  </qai-page-header>

  <section class="hero">
    <div class="stack">
      <span class="eyebrow">Acquisition workflow</span>
      <h2>Build an evidence-backed target market</h2>
      <p>Define fit, import verified accounts and move only qualified prospects into controlled outreach.</p>
      <div class="meta">
        <span><i></i>{{ activeIcp ? activeIcp.name : 'ICP required' }}</span>
        <span><b>{{ selectedIds.size }}</b> selected</span>
        <span><b>{{ overview.hot || 0 }}</b> high priority</span>
      </div>
    </div>
    <div class="card discovery-progress">
      <span class="eyebrow">Current workflow progress</span>
      <div class="discovery-timeline" role="list" aria-label="Current workflow progress">
        <div class="discovery-timeline-track" aria-hidden="true"></div>
        <div class="discovery-timeline-step" *ngFor="let step of [
          { number: '01', title: 'Define ICP', description: 'Target market' },
          { number: '02', title: 'Verify data', description: 'Trusted source' },
          { number: '03', title: 'Build audience', description: 'Qualified accounts' },
          { number: '04', title: 'Launch', description: 'Approval gate' }
        ]; let i = index" [class.is-complete]="i < journeyStep" [class.is-current]="i === journeyStep" role="listitem">
          <span class="discovery-timeline-node">{{ step.number }}</span>
          <span class="discovery-timeline-copy">
            <strong>{{ step.title }}</strong>
            <small>{{ step.description }}</small>
          </span>
        </div>
      </div>
    </div>
  </section>

  <section class="metric-grid discovery-kpis">
    <article class="metric"><div class="metric-top"><span class="metric-icon">◆</span><span class="metric-label">Discovered</span></div><strong>{{ overview.discovered || 0 }}</strong><small>Verified accounts</small></article>
    <article class="metric"><div class="metric-top"><span class="metric-icon">↗</span><span class="metric-label">Hot prospects</span></div><strong>{{ overview.hot || 0 }}</strong><small>Fit + buying intent</small></article>
    <article class="metric"><div class="metric-top"><span class="metric-icon">◈</span><span class="metric-label">Active campaigns</span></div><strong>{{ overview.activeCampaigns || 0 }}</strong><small>Controlled outreach</small></article>
    <article class="metric"><div class="metric-top"><span class="metric-icon">↩</span><span class="metric-label">Replies</span></div><strong>{{ overview.replies || 0 }}</strong><small>Open conversations</small></article>
    <article class="metric"><div class="metric-top"><span class="metric-icon">✓</span><span class="metric-label">Demo ready</span></div><strong>{{ overview.demoReady || 0 }}</strong><small>Sales handoff</small></article>
    <article class="metric"><div class="metric-top"><span class="metric-icon">◎</span><span class="metric-label">Selected</span></div><strong>{{ selectedIds.size }}</strong><small>Audience ready</small></article>
  </section>

  <div class="notice" *ngIf="error"><b>!</b><span>{{ error }}</span></div>
  <div class="notice" *ngIf="message"><b>✓</b><span>{{ message }}</span></div>

  <section class="card offer-context" *ngIf="workspaceOffer">
      <header class="card-header">
        <div><span class="eyebrow">Offer context</span><h3>{{ workspaceOffer.name }}</h3><p>{{ workspaceOffer.headline || workspaceOffer.audience }}</p></div>
        <button class="button-secondary" (click)="router.navigateByUrl('/packages/new')">Edit offer</button>
      </header>
      <div class="notice"><strong>ICP starts from this offer</strong><span>{{ workspaceOffer.audience || 'Define the target customer from the saved offer.' }}<small *ngIf="workspaceOffer.features?.length">{{ workspaceOffer.features.slice(0, 4).join(' · ') }}</small></span></div>
    </section>

    <section class="content-grid">
    <article class="card">
      <header class="card-header">
        <div><span class="eyebrow">Qualification model</span><h3>Ideal customer profiles</h3><p>Choose the rules used to qualify this audience.</p></div>
        <div class="actions">
          <button class="button-secondary" (click)="openIcp()">+ New profile</button>
          <button class="button-primary" *ngIf="activeIcp" (click)="goToProspecting()">Find companies →</button>
        </div>
      </header>
      <div class="list" *ngIf="icps.length">
        <label class="list-item" *ngFor="let x of icps" [class.selected]="selectedIcpId === x.id" [class.paused]="!x.active">
          <input type="radio" name="activeIcp" [value]="x.id" [(ngModel)]="selectedIcpId" [disabled]="!x.active" />
          <span class="avatar">{{ x.name.charAt(0) }}</span>
          <span class="stack"><strong>{{ x.name }}</strong><small>{{ x.industry || 'All industries' }} · {{ x.countriesCsv || 'All countries' }}</small><small>{{ x.minimumEmployees || 0 }}–{{ x.maximumEmployees || '∞' }} employees</small></span>
          <span class="status">{{ x.active ? (selectedIcpId === x.id ? 'Selected' : 'Use profile') : 'Paused' }}</span>
        </label>
      </div>
      <div class="empty" *ngIf="!icps.length"><i>◎</i><strong>No customer profile yet</strong><span>Create an ICP before importing company data.</span><button (click)="openIcp()">Create first profile</button></div>
    </article>

    <article class="card">
      <header class="card-header">
        <div><span class="eyebrow">Audience builder</span><h3>Create target list</h3><p>Turn selected companies into a reusable campaign audience.</p></div>
      </header>
      <div class="notice">
        <strong>{{ selectedIds.size }}</strong>
        <span><b>Prospects selected</b><small>{{ selectedIds.size ? 'Ready to create an audience' : 'Select accounts from the grid below' }}</small></span>
      </div>
      <label>Target list name<input [(ngModel)]="listName" placeholder="DACH manufacturers with freight demand" /></label>
      <div class="actions"><button class="button-primary" [disabled]="!selectedIds.size || !listName.trim()" (click)="createList()">Create target list <span>→</span></button></div>
      <small>Creating a list does not send outreach.</small>
    </article>
  </section>

  <section class="card">
    <header class="card-header">
      <div><span class="eyebrow">Market evidence</span><h3>Prioritized prospects</h3><p>Fit and intent remain separate so account size is never mistaken for buying readiness.</p></div>
      <label>Minimum score<input type="number" min="0" max="100" [(ngModel)]="minimumScore" (change)="loadProspects()" /></label>
    </header>
    <div class="toolbar">
      <span><b>{{ prospects.length }}</b> prospects shown</span>
      <span *ngIf="selectedIds.size"><b>{{ selectedIds.size }}</b> selected for audience</span>
      <button *ngIf="selectedIds.size" class="button-quiet" (click)="selectedIds.clear()">Clear selection</button>
    </div>
    <div class="table" *ngIf="prospects.length">
      <table>
        <thead><tr><th><input type="checkbox" [checked]="allSelected" [disabled]="!prospects.length" (change)="toggleAll()" /></th><th>Company account</th><th>Decision maker</th><th>Market</th><th>Fit</th><th>Intent</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          <tr *ngFor="let x of prospects" [class.selected]="selectedIds.has(x.id)">
            <td><input type="checkbox" [checked]="selectedIds.has(x.id)" (change)="toggle(x.id)" /></td>
            <td><div class="identity"><span class="avatar">{{ x.companyName.charAt(0) }}</span><div><strong>{{ x.companyName }}</strong><small>{{ x.domain }} · {{ x.datasetOrigin || x.source || 'Source not recorded' }}</small></div></div></td>
            <td><div class="stack"><strong>{{ x.contactName || x.suggestedBuyer || 'Research needed' }}</strong><small>{{ x.jobTitle || x.suggestedBuyer || 'Role unknown' }} · {{ x.email || 'Email needed' }}</small></div></td>
            <td><div class="stack"><strong>{{ x.industry || 'Unclassified' }}</strong><small>{{ x.country || 'Market unknown' }}</small></div></td>
            <td><span class="status">{{ x.fitScore }}</span></td>
            <td><span class="status">{{ x.intentScore }}</span></td>
            <td><div class="stack"><strong>{{ x.priority || priority(x) }}</strong><small *ngIf="x.contactReadiness">{{ x.contactReadiness }}</small></div></td>
            <td><span class="status">{{ status(x.status) }}</span></td>
            <td><button class="button-quiet" (click)="signalFor = x; signalOpen = true">+ Evidence</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="empty" *ngIf="!prospects.length"><i>⌕</i><strong>No prospects match this score</strong><span>Lower the score filter or import a verified company dataset.</span><button class="button-primary" [disabled]="!activeIcp" (click)="openBulk()">Import companies</button></div>
  </section>

  <qai-modal [open]="onlineDiscoveryOpen" title="Find companies online" (close)="onlineDiscoveryOpen = false">
    <form class="form" (ngSubmit)="runOnlineDiscovery()">
      <qai-callout icon="⌕" title="Company-level public discovery" text="The search connector finds public company websites, scores them against this ICP and creates a review list. It never invents contacts or email addresses." />
      <label>Search provider<select name="discoverySource" [(ngModel)]="onlineDiscovery.source"><option *ngFor="let provider of discoveryProviders" [value]="provider.name" [disabled]="!provider.configured">{{ provider.name }}{{ provider.configured ? '' : ' — needs API key' }}</option></select><small *ngIf="selectedDiscoveryProvider && !selectedDiscoveryProvider.configured">{{ selectedDiscoveryProvider.description }}</small></label>
      <label>State or region<input name="discoveryRegion" [(ngModel)]="onlineDiscovery.region" placeholder="North Rhine-Westphalia, Bavaria, DACH" /><small>Optional. The region becomes an additional market-match signal.</small></label>
      <label>Maximum companies<input type="number" name="discoveryMax" min="1" max="100" [(ngModel)]="onlineDiscovery.maximumResults" /></label>
      <label>Minimum qualification score<input type="number" name="discoveryScore" min="0" max="100" [(ngModel)]="onlineDiscovery.minimumScore" /></label>
      <label>Review target list name<input name="discoveryList" [(ngModel)]="onlineDiscovery.targetListName" placeholder="Review — German logistics prospects" /><small>Qualified accounts are placed here for human review; no outreach is sent.</small></label>
      <footer class="actions"><button type="button" (click)="onlineDiscoveryOpen = false">Cancel</button><button class="button-primary" type="submit" [disabled]="discoveryRunning || !selectedDiscoveryProvider?.configured">{{ discoveryRunning ? 'Searching…' : 'Find and qualify companies' }}</button></footer>
    </form>
  </qai-modal>

  <qai-modal [open]="icpOpen" title="Create ideal customer profile" (close)="icpOpen = false">
    <form class="form" (ngSubmit)="icpStep === 2 ? saveIcp() : nextIcp()">
      <qai-wizard-steps [steps]="['Market', 'Company fit', 'Buying intent']" [descriptions]="['Name the segment', 'Set account limits', 'Define hot signals']" [current]="icpStep" />
      <section *ngIf="icpStep === 0"><h4>Which market are you targeting?</h4><p>This profile becomes the reusable qualification rule for imports, scoring and campaign audiences.</p><label>Profile name<input [(ngModel)]="icp.name" name="name" required placeholder="European logistics growth accounts" /><small>Use a name your sales team will recognize later.</small></label><label>Industries<input [(ngModel)]="icp.industry" name="industry" placeholder="Manufacturing, e-commerce, distribution" /><small>Comma-separated industries likely to need your offer.</small></label><label>Countries<input [(ngModel)]="icp.countriesCsv" name="countries" placeholder="Germany, Italy, France" /><small>Markets where outreach is intended.</small></label></section>
      <section *ngIf="icpStep === 1"><h4>What does a good-fit company look like?</h4><p>Company size prevents discovery from filling the pipeline with accounts you cannot serve.</p><label>Minimum employees<input type="number" min="1" [(ngModel)]="icp.minimumEmployees" name="min" /><small>Smallest viable customer.</small></label><label>Maximum employees<input type="number" min="1" [(ngModel)]="icp.maximumEmployees" name="max" /><small>Largest target account.</small></label><qai-callout icon="i" title="Fit is not intent" text="Company size and industry decide whether an account fits. Current evidence decides whether it is ready now." /></section>
      <section *ngIf="icpStep === 2"><h4>Which events indicate buying intent?</h4><p>Use observable events, not generic buzzwords.</p><label>Intent signals<input [(ngModel)]="icp.intentKeywordsCsv" name="keywords" placeholder="freight tender, warehouse expansion, delivery delays" /><small>Examples: new warehouse, logistics hiring, tender announcement, service complaints.</small></label><qai-callout icon="✓" tone="success" title="Ready to save" [text]="icp.name + ' will target ' + (icp.industry || 'all industries') + ' in ' + (icp.countriesCsv || 'all markets') + '.'" /></section>
      <footer class="actions"><button type="button" (click)="icpStep ? (icpStep = icpStep - 1) : (icpOpen = false)">{{ icpStep ? 'Back' : 'Cancel' }}</button><button class="button-primary" type="submit" [disabled]="!canContinueIcp">{{ icpStep === 2 ? 'Save profile' : 'Continue' }}</button></footer>
    </form>
  </qai-modal>

  <qai-modal [open]="prospectOpen" title="Import discovered prospect" (close)="prospectOpen = false">
    <form class="form" (ngSubmit)="saveProspect()">
      <label>Company<input [(ngModel)]="prospect.companyName" name="company" required /></label><label>Domain<input [(ngModel)]="prospect.domain" name="domain" required /></label><label>Contact name<input [(ngModel)]="prospect.contactName" name="contact" /></label><label>Email<input type="email" [(ngModel)]="prospect.email" name="email" /></label><label>Job title<input [(ngModel)]="prospect.jobTitle" name="title" /></label><label>Industry<input [(ngModel)]="prospect.industry" name="industry" /></label><label>Country<input [(ngModel)]="prospect.country" name="country" /></label><label>Source<input [(ngModel)]="prospect.source" name="source" /></label><label>Fit score<input type="number" min="0" max="100" [(ngModel)]="prospect.fitScore" name="fit" /></label><label>Intent score<input type="number" min="0" max="100" [(ngModel)]="prospect.intentScore" name="intent" /></label>
      <footer class="actions"><button type="button" (click)="prospectOpen = false">Cancel</button><button class="button-primary" type="submit">Add prospect</button></footer>
    </form>
  </qai-modal>

  <qai-modal [open]="bulkOpen" [wide]="true" title="Import verified companies" (close)="bulkOpen = false">
    <form class="form" (ngSubmit)="bulkStep === 3 ? importDataset() : nextBulk()">
      <qai-wizard-steps [steps]="['Upload', 'Map fields', 'Validate', 'Create audience']" [descriptions]="['Choose the source', 'Match your columns', 'Review and confirm', 'Name the resulting list']" [current]="bulkStep" />
      <section *ngIf="bulkStep === 0"><h4>Upload a company dataset</h4><p>Upload a CSV or XLSX from any provider. We detect worksheets, headers and likely field mappings before any record is imported.</p><label>Company data file<input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" (change)="selectDataset($event)" /><small>CSV or Excel · maximum 10,000 companies or 15 MB.</small></label><label *ngIf="bulkPreview?.sheets?.length > 1">Worksheet<select [(ngModel)]="bulkSheet" name="bulkSheet" (change)="reloadSheet()"><option *ngFor="let sheet of bulkPreview.sheets" [value]="sheet">{{sheet}}</option></select><small>The best matching worksheet is selected automatically.</small></label><label>Recorded data source<input [(ngModel)]="bulkSource" name="bulkSource" placeholder="Licensed provider, registry export or customer CSV" required /><small>Retained for compliance and audit purposes.</small></label><p class="alert" *ngIf="bulkError">{{ bulkError }}</p></section>
      <section *ngIf="bulkStep === 1"><h4>Map spreadsheet columns</h4><p>{{bulkPreview?.fileName}} · {{bulkPreview?.selectedSheet}} · header row {{bulkPreview?.headerRow}}. Required fields are marked.</p><div class="list"><label class="list-item" *ngFor="let field of importFields">{{field.label}} <b *ngIf="field.required">Required</b><select [(ngModel)]="bulkMapping[field.key]" [name]="'map_'+field.key" (change)="rebuildMappedRows()"><option value="">Do not import</option><option *ngFor="let header of bulkPreview?.headers" [value]="header">{{header}}</option></select></label></div><div class="table" *ngIf="bulkPreview?.sampleRows?.length"><table><thead><tr><th *ngFor="let field of mappedFields">{{field.label}}</th></tr></thead><tbody><tr *ngFor="let row of bulkRows.slice(0,5)"><td *ngFor="let field of mappedFields">{{row[field.key] || '—'}}</td></tr></tbody></table></div><p class="alert" *ngIf="bulkError">{{bulkError}}</p></section>
      <section *ngIf="bulkStep === 2"><h4>Validate before adding data</h4><p>{{ bulkRows.length | number }} valid rows are ready. {{bulkRejected | number}} rows are incomplete and will be skipped. Importing does not send any message.</p><qai-callout icon="!" tone="warning" title="Confirm lawful use" text="You are responsible for a lawful or licensed source. Every outreach campaign still requires sender verification and approval." /><label class="list-item"><input type="checkbox" [(ngModel)]="bulkConfirmed" name="bulkConfirmed" /> I confirm the source can be used for this business purpose.</label></section>
      <section *ngIf="bulkStep === 3"><h4>Create the first campaign audience</h4><p>Imported companies will be connected to the selected ICP and placed in a target list.</p><label>Target list name<input [(ngModel)]="bulkListName" name="bulkListName" placeholder="European logistics prospects – Q3" required /><small>Use a specific market and campaign purpose.</small></label><qai-callout icon="✓" tone="success" title="Ready to import" [text]="(bulkRows.length | number) + ' companies will be added to ' + bulkListName + '. No email will be sent.'" /></section>
      <footer class="actions"><button type="button" (click)="bulkStep ? (bulkStep = bulkStep - 1) : (bulkOpen = false)">{{ bulkStep ? 'Back' : 'Cancel' }}</button><button class="button-primary" type="submit" [disabled]="bulkImporting || !canContinueBulk">{{ bulkStep === 3 ? (bulkImporting ? 'Importing…' : 'Import and create list') : 'Continue' }}</button></footer>
    </form>
  </qai-modal>

  <qai-modal [open]="signalOpen" title="Add intent evidence" (close)="signalOpen = false">
    <form class="form" (ngSubmit)="addSignal()">
      <label>Signal type<select [(ngModel)]="signal.type" name="type"><option>expansion</option><option>hiring</option><option>freight-tender</option><option>delivery-problem</option><option>website-engagement</option><option>campaign-reply</option></select></label><label>Evidence<textarea [(ngModel)]="signal.evidence" name="evidence"></textarea></label><label>Source URL<input [(ngModel)]="signal.sourceUrl" name="url" /></label><label>Intent score contribution<input type="number" min="-100" max="100" [(ngModel)]="signal.score" name="score" /></label>
      <footer class="actions"><button type="button" (click)="signalOpen = false">Cancel</button><button class="button-primary" type="submit">Add evidence</button></footer>
    </form>
  </qai-modal>
</div>
  `,
  styleUrl: "./discover.page.css",
})
export class DiscoverPage implements OnInit {
  overview: any = {};
  workspaceOffer: any = null;
  icps: any[] = [];
  prospects: any[] = [];
  minimumScore = 0;
  qualificationMode = false;
  qualificationScore = 70;
  qualificationMessage = "";
  selectedIds = new Set<string>();
  listName = "";
  selectedIcpId = "";
  message = "";
  error = "";
  icpOpen = false;
  prospectOpen = false;
  signalOpen = false;
  bulkOpen = false;
  bulkImporting = false;
  bulkSource = "";
  bulkListName = "European logistics prospects";
  bulkConfirmed = false;
  bulkRows: any[] = [];
  bulkPreview: any;
  bulkFile?: File;
  bulkSheet = "";
  bulkMapping: Record<string, string> = {};
  bulkRejected = 0;
  bulkError = "";
  discoveryProviders: any[] = [];
  onlineDiscoveryOpen = false;
  discoveryRunning = false;
  onlineDiscovery: any = { source: "serpapi", region: "", maximumResults: 50, minimumScore: 70, targetListName: "", createTargetList: true };
  icpStep = 0;
  bulkStep = 0;
  signalFor: any;
  icp: any = { name: "Logistics growth accounts", industry: "Manufacturing, e-commerce, distribution", countriesCsv: "Germany, Italy, France", minimumEmployees: 20, maximumEmployees: 1000, intentKeywordsCsv: "freight tender, warehouse expansion, delivery delays", criteriaJson: "{}", active: true };
  prospect: any = { companyName: "", domain: "", contactName: "", email: "", jobTitle: "", industry: "", country: "", source: "manual", fitScore: 60, intentScore: 20 };
  signal: any = { type: "expansion", source: "web-research", evidence: "", sourceUrl: "", score: 15 };
  readonly importFields = [
    { key: "companyName", label: "Company name", required: true }, { key: "domain", label: "Website / domain", required: true }, { key: "contactName", label: "Contact name", required: false }, { key: "email", label: "Business email", required: false }, { key: "jobTitle", label: "Job title", required: false }, { key: "industry", label: "Industry", required: false }, { key: "country", label: "Country", required: false }, { key: "source", label: "Row source", required: false }, { key: "priority", label: "Priority tier", required: false }, { key: "contactReadiness", label: "Contact readiness", required: false }, { key: "suggestedBuyer", label: "Suggested buyer", required: false }, { key: "sizeBand", label: "Company size band", required: false }, { key: "painHypothesis", label: "Pain hypothesis", required: false }, { key: "offer", label: "Recommended offer", required: false }, { key: "sourceUrl", label: "Evidence source URL", required: false }, { key: "verificationStatus", label: "Verification status", required: false }, { key: "outreachStatus", label: "Outreach status", required: false }, { key: "datasetOrigin", label: "Dataset origin", required: false }, { key: "fitScore", label: "Fit score", required: false }, { key: "intentScore", label: "Intent score", required: false },
  ];
  constructor(private data: AcquisitionService, private router: Router, private route: ActivatedRoute) {}
  ngOnInit() { this.qualificationMode = this.route.snapshot.routeConfig?.path === "qualification"; this.loadOfferContext(); this.load(); }
  loadOfferContext() { this.data.workspacePackages().subscribe({ next: (packages) => { this.workspaceOffer = packages?.[0] || null; if (this.workspaceOffer) this.applyOfferToIcp(this.workspaceOffer); }, error: () => (this.workspaceOffer = null) }); }
  applyOfferToIcp(offer: any) { const context = [offer.name, offer.audience, ...(offer.features || [])].filter(Boolean).join(' · '); if (!this.icp.name || this.icp.name === 'Logistics growth accounts') this.icp.name = (offer.name || 'Offer') + ' target market'; if (!this.icp.industry || this.icp.industry === 'Manufacturing, e-commerce, distribution') this.icp.industry = offer.audience || this.icp.industry; if (context && (!this.icp.criteriaJson || this.icp.criteriaJson === '{}')) this.icp.criteriaJson = JSON.stringify({ offerId: offer.id || null, offerName: offer.name, context }); }
  load() {
    this.data.overview().subscribe((r) => (this.overview = r));
    this.data.discoveryProviders().subscribe({ next: (r) => (this.discoveryProviders = r), error: () => (this.discoveryProviders = []) });
    this.data.icps().subscribe((r) => { this.icps = r; if (!this.activeIcp) this.selectedIcpId = r.find((x) => x.active)?.id || ""; });
    this.loadProspects();
  }
  loadProspects() { this.data.prospects(this.minimumScore).subscribe((r) => { this.prospects = r; this.selectedIds = new Set([...this.selectedIds].filter((id) => r.some((x) => x.id === id))); }); }
  get activeIcp() { return this.icps.find((x) => x.id === this.selectedIcpId && x.active); }
  get qualifiedProspects() { return this.prospects.filter((x) => this.priority(x) >= Number(this.qualificationScore)); }
  applyQualificationScore() { this.minimumScore = Number(this.qualificationScore) || 0; this.loadProspects(); }
  createQualifiedAudience() { const rows = this.qualifiedProspects; if (!rows.length) { this.qualificationMessage = "No prospects meet this threshold yet."; return; } const name = `${this.activeIcp?.name || "Qualified audience"} · Score ${this.qualificationScore}+`; this.data.createTargetList({ name, description: "Qualified audience from Acquisition Qualification & Score", icpProfileId: this.selectedIcpId || null, dynamic: false }).subscribe({ next: (list) => this.data.addMembers(list.id, rows.map((x) => x.id)).subscribe({ next: () => { this.qualificationMessage = `${rows.length} prospects qualified and added to the audience.`; }, error: (e) => this.error = e?.error?.detail || "Audience members could not be added." }), error: (e) => this.error = e?.error?.detail || "Qualified audience could not be created." }); }
  continueToCampaigns() { this.router.navigate(["/campaigns"]); }
  get selectedDiscoveryProvider() { return this.discoveryProviders.find((x) => x.name === this.onlineDiscovery.source); }
  get journeyStep() { if (!this.activeIcp) return 0; if (!this.prospects.length) return 1; if (!this.selectedIds.size) return 2; return 3; }
  goToProspecting() { if (!this.activeIcp) return; this.router.navigate(['/discover'], { queryParams: { icpId: this.activeIcp.id } }); }
  get canContinueIcp() { if (this.icpStep === 0) return !!this.icp.name?.trim() && !!this.icp.countriesCsv?.trim(); if (this.icpStep === 1) return Number(this.icp.minimumEmployees) > 0 && Number(this.icp.maximumEmployees) >= Number(this.icp.minimumEmployees); return !!this.icp.intentKeywordsCsv?.trim(); }
  get canContinueBulk() { if (this.bulkStep === 0) return !!this.bulkPreview && !!this.bulkSource.trim() && !this.bulkError; if (this.bulkStep === 1) return !!this.bulkMapping["companyName"] && !!this.bulkMapping["domain"] && !!this.bulkRows.length && !this.bulkError; if (this.bulkStep === 2) return this.bulkConfirmed; return !!this.bulkListName.trim(); }
  get mappedFields() { return this.importFields.filter((field) => !!this.bulkMapping[field.key]); }
  openIcp() { this.icpStep = 0; if (this.workspaceOffer) this.applyOfferToIcp(this.workspaceOffer); this.icpOpen = true; }
  nextIcp() { if (this.canContinueIcp && this.icpStep < 2) this.icpStep++; }
  openBulk() { this.bulkStep = 0; this.bulkError = ""; this.bulkConfirmed = false; this.bulkPreview = undefined; this.bulkFile = undefined; this.bulkRows = []; this.bulkMapping = {}; this.bulkRejected = 0; this.bulkOpen = true; }
  openOnlineDiscovery() { if (!this.activeIcp) return; this.error = ""; this.message = ""; this.onlineDiscovery.targetListName = `Review — ${this.activeIcp.name} — ${new Date().toISOString().slice(0, 10)}`; this.onlineDiscoveryOpen = true; }
  runOnlineDiscovery() { if (!this.activeIcp || !this.selectedDiscoveryProvider?.configured) return; this.discoveryRunning = true; this.error = ""; this.data.discoverOnline(this.activeIcp.id, this.onlineDiscovery).subscribe({ next: (result) => { this.discoveryRunning = false; this.onlineDiscoveryOpen = false; this.message = `Online discovery found ${result.received} companies. ${result.qualified} qualified; ${result.created} new and ${result.updated} refreshed. Review list is ready before any outreach.`; this.load(); }, error: (error) => { this.discoveryRunning = false; this.error = error?.error?.detail || "Online discovery could not run. Check the provider connection and try again."; } }); }
  nextBulk() { if (this.bulkStep === 1) this.rebuildMappedRows(); if (this.canContinueBulk && this.bulkStep < 3) this.bulkStep++; }
  get allSelected() { return !!this.prospects.length && this.prospects.every((x) => this.selectedIds.has(x.id)); }
  priority(x: any) { return Math.round(Number(x.fitScore || 0) * 0.55 + Number(x.intentScore || 0) * 0.45); }
  status(v: number) { return ["Discovered", "Enriched", "Qualified", "Nurturing", "Replied", "Demo ready", "Converted", "Suppressed"][v] || v; }
  toggle(id: string) { this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id); }
  toggleAll() { this.allSelected ? this.selectedIds.clear() : this.prospects.forEach((x) => this.selectedIds.add(x.id)); }
  saveIcp() { if (this.workspaceOffer) this.icp.criteriaJson = JSON.stringify({ ...JSON.parse(this.icp.criteriaJson || '{}'), offerId: this.workspaceOffer.id || null, offerName: this.workspaceOffer.name || '' }); this.data.createIcp(this.icp).subscribe((r) => { this.icps.push(r); this.selectedIcpId = r.id; this.icpOpen = false; this.icpStep = 0; this.message = "Profile saved. Your next step is to find companies that match this ICP."; }); }
  saveProspect() { this.data.addProspect(this.prospect).subscribe((r) => { this.prospects.unshift(r); this.prospectOpen = false; this.data.overview().subscribe((x) => (this.overview = x)); }); }
  selectDataset(event: Event) { const file = (event.target as HTMLInputElement).files?.[0]; this.bulkFile = file; this.bulkPreview = undefined; this.bulkRows = []; this.bulkError = ""; if (!file) return; if (file.size > 15_000_000) { this.bulkError = "The import file must be smaller than 15 MB."; return; } this.loadPreview(); }
  reloadSheet() { if (this.bulkFile) this.loadPreview(this.bulkSheet); }
  private loadPreview(sheet = "") { if (!this.bulkFile) return; this.bulkImporting = true; this.bulkError = ""; this.data.previewProspectImport(this.bulkFile, sheet).subscribe({ next: (preview) => { this.bulkPreview = preview; this.bulkSheet = preview.selectedSheet; this.bulkMapping = { ...preview.suggestedMappings }; this.rebuildMappedRows(); this.bulkImporting = false; }, error: (error) => { this.bulkImporting = false; this.bulkError = error?.error?.detail || "The company dataset could not be read."; } }); }
  rebuildMappedRows() { const sourceRows: any[] = this.bulkPreview?.rows || []; const mapped = sourceRows.map((source) => { const row: any = {}; for (const field of this.importFields) { const header = this.bulkMapping[field.key]; row[field.key] = header ? source[header] ?? "" : ""; } row.fitScore = Math.max(0, Math.min(100, Number(row.fitScore) || 0)); row.intentScore = Math.max(0, Math.min(100, Number(row.intentScore) || 0)); return row; }); this.bulkRows = mapped.filter((row) => String(row.companyName).trim() && String(row.domain).trim()); this.bulkRejected = mapped.length - this.bulkRows.length; this.bulkError = !this.bulkMapping["companyName"] || !this.bulkMapping["domain"] ? "Map both Company name and Website / domain." : ""; }
  importDataset() { if (!this.bulkRows.length || !this.bulkConfirmed) return; this.bulkImporting = true; this.data.importProspects({ source: this.bulkSource, complianceConfirmed: this.bulkConfirmed, targetListName: this.bulkListName, icpProfileId: this.selectedIcpId || null, prospects: this.bulkRows }).subscribe({ next: (result) => { this.bulkImporting = false; this.bulkOpen = false; this.bulkStep = 0; this.message = `${result.imported} imported; ${result.updated || 0} enriched; ${result.duplicates} duplicate rows and ${result.rejected + this.bulkRejected} invalid rows skipped.`; this.bulkRows = []; this.load(); if (result.targetListId && confirm("Target list is ready. Continue to campaign setup?")) this.router.navigate(["/campaigns"], { queryParams: { targetListId: result.targetListId } }); }, error: (error) => { this.bulkImporting = false; this.bulkError = error?.error?.detail || "Company import failed."; } }); }
  addSignal() { if (!this.signalFor) return; this.data.addSignal(this.signalFor.id, this.signal).subscribe((r) => { Object.assign(this.signalFor, r); this.signalOpen = false; }); }
  createList() { if (!this.selectedIds.size || !this.listName.trim()) return; this.error = ""; this.data.createTargetList({ name: this.listName, description: "Selected from prospect discovery", icpProfileId: this.selectedIcpId || null, dynamic: false }).subscribe({ next: (list) => this.data.addMembers(list.id, [...this.selectedIds]).subscribe({ next: () => { this.message = `Target list “${this.listName}” created with ${this.selectedIds.size} prospects.`; this.selectedIds.clear(); this.listName = ""; }, error: (e) => (this.error = e?.error?.detail || "The list was created, but prospects could not be added.") }), error: (e) => (this.error = e?.error?.detail || "Target list could not be created.") }); }
}