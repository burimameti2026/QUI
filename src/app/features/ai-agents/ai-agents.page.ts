import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AiAgent } from "../../core/models/platform.models";
import { Modal, PageHeader } from "../../shared/ui";
import { AiAgentsService } from "./ai-agents.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  template: `<qai-page-header
      title="Business Assistant Studio"
      subtitle="Configure autonomous support, qualification and revenue actions."
      ><select [(ngModel)]="selectedId" (change)="selectAgent()">
        <option *ngFor="let a of agents" [value]="a.id">{{ a.name }}</option>
      </select>
      <button class="button-secondary" (click)="newOpen = true">+ Agent</button>
      <button class="button-primary" (click)="save()">Save configuration</button>
    </qai-page-header>

    <main class="page">
      <section class="hero">
        <div>
          <span class="eyebrow">AGENT DEPLOYMENT</span>
          <h2>Where {{agent.name || 'this assistant'}} works</h2>
          <p>An active agent is available to the assistant runtime and sandbox test. It is not automatically connected to Inbox, a campaign or a workflow — that binding must be configured before it can act on customer data.</p>
        </div>
        <ol class="steps">
          <li><b class="status-dot" [class.success-dot]="agent.active"></b><span><strong>Runtime</strong><small>{{agent.active ? 'Enabled for controlled tests' : 'Paused'}}</small></span></li>
          <li><b class="status-dot"></b><span><strong>Live channel</strong><small>Not connected</small></span></li>
          <li><b class="status-dot"></b><span><strong>Workflow binding</strong><small>Not connected</small></span></li>
        </ol>
      </section>

      <div class="content-grid">
        <aside class="card">
          <div class="card-body stack">
            <div class="identity"><div class="icon">✦</div><div><h3>{{ agent.name || "Revenue Assistant" }}</h3><p>{{ agent.role || "Support & Sales" }}</p></div></div>
            <nav class="nav" aria-label="Agent configuration">
              <button class="button-quiet" [class.active]="tab === 'behavior'" (click)="tab = 'behavior'">Behavior</button>
              <button class="button-quiet" [class.active]="tab === 'tools'" (click)="tab = 'tools'">Tools & actions</button>
              <button class="button-quiet" [class.active]="tab === 'model'" (click)="tab = 'model'">Model</button>
              <button class="button-quiet" [class.active]="tab === 'guardrails'" (click)="tab = 'guardrails'">Guardrails</button>
            </nav>
          </div>
        </aside>

        <div class="stack">
          <section class="card" *ngIf="tab === 'behavior'">
            <header class="card-header"><h3>Agent behavior</h3></header>
            <div class="card-body form">
              <div class="content-grid"><label>Name<input [(ngModel)]="agent.name" /></label><label>Role<input [(ngModel)]="agent.role" /></label></div>
              <label>Instructions<textarea [(ngModel)]="agent.instructions"></textarea></label>
              <div class="content-grid"><label>Tone<select [(ngModel)]="agent.tone"><option>professional</option><option>friendly</option><option>concise</option></select></label><label>Languages<input [(ngModel)]="agent.languagesCsv" /></label></div>
              <label class="list-item"><input type="checkbox" [(ngModel)]="agent.active" /> Agent active</label>
            </div>
          </section>

          <section class="card" *ngIf="tab === 'tools'">
            <header class="card-header"><div><h3>Tools & actions</h3><p>Actions available after tenant and permission checks.</p></div></header>
            <div class="list"><article class="list-item" *ngFor="let t of tools"><span class="icon">⚡</span><div class="stack"><b>{{ t }}</b><span class="meta">{{ desc(t) }}</span></div><span class="status success">Enabled</span></article></div>
          </section>

          <section class="card" *ngIf="tab === 'model'">
            <header class="card-header"><h3>Model routing</h3></header>
            <div class="card-body form"><label>Primary model<select [(ngModel)]="agent.model"><option>local</option><option>gpt-5</option><option>azure-openai</option></select></label><p class="meta">External models require provider credentials in production configuration.</p></div>
          </section>

          <section class="card" *ngIf="tab === 'guardrails'">
            <header class="card-header"><h3>Guardrails</h3></header>
            <div class="card-body form"><label>Operational policy<textarea [(ngModel)]="guardrails"></textarea></label></div>
          </section>

          <aside class="card">
            <header class="card-header"><div><h3>Agent test</h3><p>Safe sandbox only</p></div><span class="status">Not live</span></header>
            <div class="card-body stack">
              <div class="list"><p class="list-item" *ngIf="prompt">{{ prompt }}</p><p class="list-item" *ngIf="answer"><b>{{ agent.name }}</b>{{ answer }}</p></div>
              <textarea [(ngModel)]="prompt" placeholder="Test a customer message"></textarea>
              <button class="button-primary" (click)="runTest()">Run test</button>
            </div>
          </aside>
        </div>
      </div>
    </main>

    <qai-modal [open]="newOpen" title="New business assistant" (close)="newOpen = false"><form class="form" (ngSubmit)="create()"><label>Name<input [(ngModel)]="newAgent.name" name="name" required /></label><label>Role<input [(ngModel)]="newAgent.role" name="role" /></label><footer class="actions"><button class="button-secondary" type="button" (click)="newOpen = false">Cancel</button><button class="button-primary" type="submit">Create agent</button></footer></form></qai-modal>`,
  styleUrl: './ai-agents.page.css',
})
export class AiAgentsPage implements OnInit {
  agents: AiAgent[] = [];
  selectedId = "";
  agent: any = { name: "Revenue Assistant", role: "Support & Sales", instructions: "Resolve support questions from verified knowledge. Detect buying intent, collect qualification data, score leads and trigger approved revenue actions.", tone: "professional", languagesCsv: "en,de,it,mk", model: "local", active: true };
  tab = "behavior";
  prompt = "We need weekly transport of 18 pallets from Stuttgart to Milan.";
  answer = "";
  tools: string[] = [];
  newOpen = false;
  newAgent: any = { name: "New Business Assistant", role: "Support & Sales", tone: "professional", model: "local", languagesCsv: "en", active: true, instructions: "Answer from verified knowledge, qualify demand and escalate when confidence is low." };
  guardrails = "Never invent pricing. Never expose private customer data. Escalate when confidence is low.";
  constructor(private data: AiAgentsService) {}
  ngOnInit() {
    this.data.list().subscribe((r) => { this.agents = r; if (r.length) { this.selectedId = r[0].id; this.selectAgent(); } });
    this.data.tools().subscribe((r) => (this.tools = r));
  }
  selectAgent() { const x = this.agents.find((a) => a.id === this.selectedId); if (x) this.agent = { ...x }; }
  save() {
    if (!this.agent.name?.trim() || !this.agent.instructions?.trim()) { alert("Agent name and instructions are required."); return; }
    const op = this.agent.id ? this.data.update(this.agent.id, this.agent) : this.data.create(this.agent);
    op.subscribe((r) => { this.agent = r; const i = this.agents.findIndex((a) => a.id === r.id); i >= 0 ? (this.agents[i] = r) : this.agents.push(r); alert("Agent configuration saved. It is available for sandbox tests; connect a channel or workflow before using it with customers."); });
  }
  create() {
    if (!this.newAgent.name?.trim() || !this.newAgent.instructions?.trim()) { alert("Agent name and instructions are required."); return; }
    this.data.create(this.newAgent).subscribe({ next: (r) => { this.agents.push(r); this.selectedId = r.id; this.agent = { ...r }; this.newOpen = false; }, error: (e) => alert(e?.error?.error || "Business assistant could not be created.") });
  }
  runTest() { if (!this.prompt.trim() || !this.agent.id) return; this.answer = "Thinking…"; this.data.test(this.agent.id, this.prompt).subscribe({ next: (r) => (this.answer = r.message || "No response"), error: () => (this.answer = "Agent test failed. Check API/provider configuration.") }); }
  desc(t: string) { const d: any = { SearchKnowledge: "Retrieve grounded answers", CreateLead: "Capture sales demand", CreateTicket: "Open a support case", CreateOpportunity: "Create pipeline revenue", BookMeeting: "Schedule a sales call", CallWebhook: "Execute external workflow" }; return d[t] || "Business action"; }
}
