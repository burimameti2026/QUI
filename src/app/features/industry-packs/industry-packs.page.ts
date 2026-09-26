import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IndustryPacksService } from './industry-packs.service';
import { PageHeader } from '../../shared/ui';

interface PackDraft {
  id?: string;
  code: string;
  name: string;
  description: string;
  industry: string;
  purpose: string;
  offer: string;
  audience: string;
  discoveryProvider: string;
  keywords: string;
  minimumScore: number;
  outreach: string;
  approvalRequired: boolean;
  scenarios: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  template: `
    <style>
      .builder{margin:18px 0;padding:20px;border:1px solid #e1e5eb;border-radius:14px;background:#fff}
      .builder-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}
      .mode{display:flex;gap:6px;margin:16px 0}.mode button{padding:8px 12px;border:1px solid #d9dee6;background:#fff;border-radius:8px;cursor:pointer}.mode button.active{background:#555;color:#fff}
      .form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.field{display:flex;flex-direction:column;gap:5px}.field.full{grid-column:1/-1}.field label{font-size:11px;font-weight:700}.field input,.field textarea,.field select{border:1px solid #d9dee6;border-radius:8px;padding:9px;background:#fff}.field textarea{min-height:72px}
      .builder-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
      .ai-hint{padding:12px;border-radius:10px;background:#f5f6f8;margin-bottom:12px}
      .pack-tools{display:flex;justify-content:space-between;align-items:center;margin:16px 0;gap:12px}.pack-tools input{max-width:360px;padding:9px;border:1px solid #d9dee6;border-radius:8px}
      .content-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}.card-body{padding:16px}.card-footer{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #eee}
      .chips{display:flex;flex-wrap:wrap;gap:5px;margin-top:10px}.chip{padding:4px 7px;background:#f0f2f5;border-radius:999px;font-size:10px}.empty{padding:30px;text-align:center}
      @media(max-width:800px){.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.builder-head{flex-direction:column}}
    </style>
    <main class="page page-industry-packs">
      <qai-page-header title="Industry Packs" subtitle="Reusable business definitions that turn an industry, offer and ICP into campaign-ready automation.">
        <button class="button-primary" type="button" (click)="startCreate()">+ Create Industry Pack</button>
      </qai-page-header>

      <section class="hero">
        <div>
          <span class="eyebrow">REUSABLE BUSINESS BLUEPRINTS</span>
          <h2>{{ packs.length }} Industry Packs</h2>
          <p>Create once, reuse across campaigns. Each pack can define purpose, offer, ICP, discovery, qualification, outreach and approval.</p>
        </div>
      </section>

      <p class="notice success" *ngIf="message">{{ message }}</p>
      <p class="notice alert-error" *ngIf="error">{{ error }}</p>

      <section class="builder" *ngIf="builderOpen">
        <div class="builder-head">
          <div>
            <span class="eyebrow">PACK BUILDER</span>
            <h2>{{ draft.id ? 'Edit Industry Pack' : 'Create Industry Pack' }}</h2>
            <p>Use AI to draft the definition, then review and save it as a reusable template.</p>
          </div>
          <button class="button-secondary" type="button" (click)="cancelEdit()">Close</button>
        </div>

        <div class="mode">
          <button type="button" [class.active]="mode==='ai'" (click)="mode='ai'">Build with AI</button>
          <button type="button" [class.active]="mode==='manual'" (click)="mode='manual'">Build manually</button>
        </div>

        <div class="ai-hint" *ngIf="mode==='ai'">
          <strong>AI-assisted setup</strong>
          <p>Describe the business and desired customers. The UI prepares the same pack definition used by the manual editor.</p>
          <div class="field">
            <label>Describe the business</label>
            <textarea [(ngModel)]="aiPrompt" placeholder="Example: Find logistics companies in North Macedonia and prepare approved outreach for fleet management software."></textarea>
          </div>
          <button class="button-secondary" type="button" (click)="draftFromPrompt()">Generate draft</button>
        </div>

        <div class="form-grid">
          <div class="field"><label>Pack name</label><input [(ngModel)]="draft.name" placeholder="Logistics Sales Pack"></div>
          <div class="field"><label>Code</label><input [(ngModel)]="draft.code" placeholder="logistics-sales"></div>
          <div class="field"><label>Industry</label><input [(ngModel)]="draft.industry" placeholder="Logistics"></div>
          <div class="field"><label>Purpose / outcome</label><input [(ngModel)]="draft.purpose" placeholder="Book qualified demos"></div>
          <div class="field full"><label>Offer</label><textarea [(ngModel)]="draft.offer" placeholder="What are we selling and what business problem does it solve?"></textarea></div>
          <div class="field full"><label>Target audience / ICP</label><textarea [(ngModel)]="draft.audience" placeholder="Company types, size, geography and buying signals"></textarea></div>
          <div class="field"><label>Discovery provider</label><select [(ngModel)]="draft.discoveryProvider"><option value="serpapi">SerpAPI</option><option value="manual">Manual</option></select></div>
          <div class="field"><label>Minimum qualification score</label><input type="number" min="0" max="100" [(ngModel)]="draft.minimumScore"></div>
          <div class="field full"><label>Discovery keywords</label><textarea [(ngModel)]="draft.keywords" placeholder="logistics companies, transport companies, freight forwarders"></textarea></div>
          <div class="field full"><label>Outreach</label><textarea [(ngModel)]="draft.outreach" placeholder="Email sequence, messaging and follow-up strategy"></textarea></div>
          <div class="field full"><label>Scenarios</label><input [(ngModel)]="draft.scenarios" placeholder="Logistics Companies, Transport Companies, 3PL Providers"></div>
          <div class="field"><label>Approval required</label><select [(ngModel)]="draft.approvalRequired"><option [ngValue]="true">Yes</option><option [ngValue]="false">No</option></select></div>
        </div>

        <div class="builder-actions">
          <button class="button-secondary" type="button" (click)="cancelEdit()">Cancel</button>
          <button class="button-primary" type="button" [disabled]="saving" (click)="save()">{{ saving ? 'Saving…' : 'Save Industry Pack' }}</button>
        </div>
      </section>

      <div class="pack-tools">
        <strong>Saved reusable templates</strong>
        <input [(ngModel)]="query" placeholder="Search packs…">
      </div>

      <section class="content-grid">
        <article class="card" *ngFor="let pack of filteredPacks">
          <header class="card-header">
            <div><span class="eyebrow">INDUSTRY PACK</span><h2>{{ pack.name }}</h2></div>
            <span class="status" [class.status-active]="pack.provisioned">{{ pack.provisioned ? 'Campaign ready' : 'Reusable' }}</span>
          </header>
          <div class="card-body">
            <p>{{ pack.description || 'Reusable acquisition and automation definition.' }}</p>
            <div class="chips" *ngIf="packTemplate(pack).industry"><span class="chip">{{ packTemplate(pack).industry }}</span><span class="chip">ICP</span><span class="chip">Discovery</span><span class="chip">Qualification</span><span class="chip">Outreach</span></div>
            <div class="list">
              <div class="list-item"><span>Purpose</span><span>{{ packTemplate(pack).purpose || 'Defined in template' }}</span></div>
              <div class="list-item"><span>Discovery</span><span>{{ packTemplate(pack).discovery?.provider || 'Configured' }}</span></div>
              <div class="list-item"><span>Qualification</span><span>{{ packTemplate(pack).minimumScore || 0 }}+</span></div>
            </div>
          </div>
          <footer class="card-footer">
            <button class="button-secondary" type="button" (click)="edit(pack)">Edit</button>
            <button class="button-primary" type="button" (click)="provision(pack)" [disabled]="busyId===pack.id">{{ busyId===pack.id ? 'Provisioning…' : (pack.provisioned ? 'Reconcile campaign' : 'Use for Campaign') }}</button>
          </footer>
        </article>
      </section>

      <div class="empty" *ngIf="!filteredPacks.length"><strong>No matching Industry Packs</strong><span>Create a reusable pack or change your search.</span></div>
    </main>
  `
})
export class IndustryPacksPage implements OnInit {
  packs: any[] = [];
  query = '';
  builderOpen = false;
  mode: 'ai'|'manual' = 'ai';
  aiPrompt = '';
  saving = false;
  busyId: string | null = null;
  message = '';
  error = '';
  draft: PackDraft = this.emptyDraft();

  constructor(private readonly data: IndustryPacksService, private readonly router: Router) {}

  get filteredPacks() {
    const q = this.query.trim().toLowerCase();
    return !q ? this.packs : this.packs.filter(p => [p.name,p.code,p.description].some(v => String(v||'').toLowerCase().includes(q)));
  }

  ngOnInit(): void { this.load(); }

  load() {
    this.data.list<any[]>().subscribe({
      next: packs => this.packs = packs || [],
      error: e => this.error = e?.error?.detail || e?.error?.error || 'Industry Packs could not be loaded.'
    });
  }

  emptyDraft(): PackDraft {
    return { code:'',name:'',description:'',industry:'',purpose:'',offer:'',audience:'',discoveryProvider:'serpapi',keywords:'',minimumScore:70,outreach:'',approvalRequired:true,scenarios:'' };
  }

  startCreate() { this.draft=this.emptyDraft(); this.mode='ai'; this.aiPrompt=''; this.builderOpen=true; }
  cancelEdit() { this.builderOpen=false; }
  edit(pack:any) {
    const t=this.packTemplate(pack);
    this.draft={ id:pack.id, code:pack.code||'', name:pack.name||'', description:pack.description||'', industry:t.industry||'', purpose:t.purpose||'', offer:t.offer||'', audience:t.audience||'', discoveryProvider:t.discovery?.provider||'serpapi', keywords:(t.discovery?.keywords||[]).join(', '), minimumScore:Number(t.minimumScore||70), outreach:t.outreach||'', approvalRequired:t.approvalRequired!==false, scenarios:(t.scenarios||[]).map((x:any)=>typeof x==='string'?x:x.name).join(', ') };
    this.mode='manual'; this.builderOpen=true;
  }

  draftFromPrompt() {
    const p=this.aiPrompt.trim(); if(!p) return;
    const lower=p.toLowerCase();
    this.draft.name=this.draft.name || (lower.includes('logistics')?'Logistics Sales Pack':'AI Sales Pack');
    this.draft.code=this.draft.code || this.draft.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    this.draft.industry=this.draft.industry || (lower.includes('logistics')?'Logistics':'');
    this.draft.purpose=this.draft.purpose || 'Generate and qualify high-fit prospects';
    this.draft.audience=this.draft.audience || p;
    this.draft.keywords=this.draft.keywords || p;
    this.draft.outreach=this.draft.outreach || 'Prepare personalized outreach after qualification and wait for human approval before delivery.';
    this.message='Draft generated. Review the fields and save the reusable Industry Pack.';
  }

  templateJson() {
    return JSON.stringify({
      version:1, industry:this.draft.industry, purpose:this.draft.purpose, offer:this.draft.offer, audience:this.draft.audience,
      minimumScore:Number(this.draft.minimumScore||70),
      discovery:{provider:this.draft.discoveryProvider,keywords:this.draft.keywords.split(',').map(x=>x.trim()).filter(Boolean)},
      qualification:{minimumScore:Number(this.draft.minimumScore||70)},
      enrichment:{enabled:true},
      targetList:{enabled:true},
      outreach:{definition:this.draft.outreach},
      approvalRequired:this.draft.approvalRequired,
      scenarios:this.draft.scenarios.split(',').map(x=>x.trim()).filter(Boolean).map(name=>({name,code:name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}))
    });
  }

  save() {
    if(!this.draft.name.trim() || !this.draft.code.trim()) { this.error='Pack name and code are required.'; return; }
    this.saving=true; this.error='';
    const payload={code:this.draft.code,name:this.draft.name,description:this.draft.description,templateJson:this.templateJson()};
    const request=this.draft.id ? this.data.update<any>(this.draft.id,payload) : this.data.create<any>(payload);
    request.subscribe({next:()=>{this.saving=false;this.builderOpen=false;this.message='Industry Pack saved and available for reuse.';this.load();},error:e=>{this.saving=false;this.error=e?.error?.error||e?.error?.detail||'Industry Pack could not be saved.';}});
  }

  packTemplate(pack:any): any { try { return JSON.parse(pack?.templateJson||'{}'); } catch { return {}; } }

  provision(pack:any) {
    this.busyId=pack.id; this.error='';
    this.data.provision<any>(pack.id).subscribe({next:r=>{this.busyId=null;pack.provisioned=true;pack.campaignId=r?.campaignId;this.message=`${pack.name} is now campaign-ready.`;},error:e=>{this.busyId=null;this.error=e?.error?.error||e?.error?.detail||'The Industry Pack could not be provisioned.';}});
  }
}
