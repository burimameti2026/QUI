import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AiAdvisorService, AiAdvisorResponse } from './ai-advisor.service';

interface AdvisorMessage { role: 'user' | 'assistant'; text: string; suggestions?: string[]; nextAction?: string; field?: string; }

@Component({
  selector: 'qai-ai-advisor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <button *ngIf="!open" class="advisor-launcher" type="button" (click)="open=true" aria-label="Open AI Advisor"><span class="spark">✦</span><span>AI Advisor</span></button>
    <section *ngIf="open" class="advisor-panel" aria-label="AI Advisor">
      <header class="advisor-head"><div><span class="eyebrow">AI ADVISOR</span><strong>{{ contextTitle }}</strong></div><div class="head-actions"><button type="button" (click)="minimize()">−</button><button type="button" (click)="open=false">×</button></div></header>
      <div class="advisor-context"><span>✦</span><div><strong>{{ contextHint }}</strong><small>I can explain this section, suggest what to write, and tell you the next step.</small></div></div>
      <div class="advisor-messages">
        <div *ngFor="let item of messages" class="message" [class.user]="item.role==='user'"><div class="message-bubble">{{ item.text }}</div><div *ngIf="item.suggestions?.length" class="suggestions"><button *ngFor="let suggestion of item.suggestions" type="button" (click)="useSuggestion(suggestion)">{{ suggestion }}</button></div><div *ngIf="item.nextAction" class="next-action"><span>NEXT</span>{{ item.nextAction }}</div></div>
        <div *ngIf="loading" class="typing"><span></span><span></span><span></span> Thinking…</div><div *ngIf="error" class="advisor-error">{{ error }}</div>
      </div>
      <div class="quick-actions"><button type="button" (click)="ask('What should I do next?')">What next?</button><button type="button" (click)="ask('What should I improve here?')">Improve this</button><button type="button" (click)="ask('What should I write here?')">Help me write</button></div>
      <form class="advisor-input" (ngSubmit)="send()"><textarea [(ngModel)]="draft" name="advisorMessage" rows="2" placeholder="Ask me what to do, what to write, or why something matters…"></textarea><button type="submit" [disabled]="loading || !draft.trim()" aria-label="Send">➤</button></form>
    </section>
  `,
  styles: [`
    :host{position:fixed;right:22px;bottom:22px;z-index:2000;font-family:inherit}.advisor-launcher{display:flex;align-items:center;gap:8px;border:0;border-radius:999px;padding:12px 17px;background:#20242b;color:#fff;box-shadow:0 12px 34px rgba(0,0,0,.22);cursor:pointer;font-weight:700}.spark{font-size:17px}
    .advisor-panel{width:390px;max-width:calc(100vw - 28px);height:590px;max-height:calc(100vh - 40px);display:flex;flex-direction:column;background:#fff;border:1px solid #dfe3e8;border-radius:16px;box-shadow:0 22px 60px rgba(24,30,38,.24);overflow:hidden}.advisor-head{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;border-bottom:1px solid #e8ebef;background:#555}.advisor-head strong,.advisor-head .eyebrow{display:block;color:#fff}.eyebrow{font-size:9px;letter-spacing:.14em;font-weight:800;opacity:.75;margin-bottom:3px}.head-actions{display:flex;gap:4px}.head-actions button{border:0;background:transparent;color:#fff;font-size:20px;width:28px;height:28px;cursor:pointer}
    .advisor-context{display:flex;gap:10px;padding:13px 15px;background:#f7f8fa;border-bottom:1px solid #e8ebef}.advisor-context>span{font-size:20px}.advisor-context strong,.advisor-context small{display:block}.advisor-context strong{font-size:12px}.advisor-context small{font-size:11px;color:#6d7480;margin-top:3px;line-height:1.4}.advisor-messages{flex:1;overflow:auto;padding:15px;background:#fbfcfd}.message{margin-bottom:12px;max-width:92%}.message.user{margin-left:auto}.message-bubble{white-space:pre-wrap;line-height:1.5;font-size:12px;padding:11px 12px;border-radius:12px;background:#fff;border:1px solid #e1e5ea}.message.user .message-bubble{background:#eef0f3}.suggestions{display:flex;flex-wrap:wrap;gap:6px;margin-top:7px}.suggestions button,.quick-actions button{border:1px solid #d6dbe2;background:#fff;border-radius:999px;padding:7px 9px;font-size:10px;cursor:pointer}.suggestions button:hover,.quick-actions button:hover{background:#f0f2f5}.next-action{margin-top:7px;padding:8px 10px;border-left:3px solid #555;background:#f0f2f4;font-size:10px}.next-action span{font-weight:800;margin-right:6px}.typing{font-size:11px;color:#737a84;display:flex;align-items:center;gap:4px}.typing span{width:5px;height:5px;border-radius:50%;background:#737a84;display:inline-block}.advisor-error{margin-top:8px;padding:9px;background:#fff0f0;border:1px solid #f0cccc;border-radius:8px;color:#9a3030;font-size:11px}.quick-actions{display:flex;gap:6px;padding:9px 12px;border-top:1px solid #e8ebef;overflow:auto}.quick-actions button{white-space:nowrap}.advisor-input{display:flex;gap:8px;padding:11px;border-top:1px solid #e8ebef;background:#fff}.advisor-input textarea{flex:1;resize:none;border:1px solid #d7dce3;border-radius:10px;padding:9px;font:inherit;font-size:11px;outline:none}.advisor-input button{width:38px;border:0;border-radius:10px;background:#555;color:#fff;font-size:17px;cursor:pointer}.advisor-input button:disabled{opacity:.45;cursor:not-allowed}@media(max-width:520px){:host{right:10px;bottom:10px}.advisor-panel{width:calc(100vw - 20px);height:calc(100vh - 80px)}}
  `]
})
export class AiAdvisorComponent implements OnInit {
  private readonly advisor = inject(AiAdvisorService);
  private readonly router = inject(Router); open=false; loading=false; error=''; draft=''; messages: AdvisorMessage[]=[];
  get contextTitle(){ const c=this.advisor.context(); return c.title || c.section || c.page || 'Your workspace'; }
  get contextHint(){ const c=this.advisor.context(); return c.section ? 'You are working in '+c.section+'.' : c.page ? 'You are working in '+c.page+'.' : 'I am here to guide you through the workspace.'; }
  ngOnInit(){
    this.updateRouteContext(this.router.url);
    this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe(event => this.updateRouteContext(event.urlAfterRedirects));
    this.messages.push({role:'assistant',text:'I am your workspace advisor. Ask “what next?”, “what should I write?”, or “why does this matter?” and I will guide you step by step.'});
  }
  private updateRouteContext(url:string){
    const route=url.split('?')[0].split('#')[0];
    const parts=route.split('/').filter(Boolean);
    const labels:Record<string,string>={dashboard:'Dashboard',kpis:'KPIs',campaigns:'Campaigns',industry-packs:'Industry Packs',acquisition:'Acquisition',icp:'ICP & Audience',crm:'CRM',knowledge:'Knowledge',automations:'Automations',pipeline:'Pipeline',analytics:'Analytics',white-label:'White Label',users:'Users & Roles'};
    const key=parts[parts.length-1] || 'dashboard';
    this.advisor.patchContext({page:labels[key] || key.replace(/[-_]/g,' '),section:labels[parts[0]] || labels[key] || parts[0] || 'Workspace'});
  }
  minimize(){ this.open=false; }
  ask(text:string){ this.draft=text; this.send(); }
  send(){ const text=this.draft.trim(); if(!text||this.loading)return; this.messages.push({role:'user',text}); this.draft=''; this.loading=true; this.error=''; this.advisor.advise(text).subscribe({next:(r:AiAdvisorResponse)=>{this.loading=false;this.messages.push({role:'assistant',text:r?.message||'I could not generate a suggestion.',suggestions:r?.suggestions,nextAction:r?.nextAction,field:r?.field});},error:(e)=>{this.loading=false;this.error=e?.error?.detail||e?.error?.error||'AI Advisor is temporarily unavailable.';}}); }
  useSuggestion(suggestion:string){ const last=[...this.messages].reverse().find(x=>x.role==='assistant' && x.suggestions?.includes(suggestion)); this.advisor.applySuggestion(suggestion,last?.field); this.draft=suggestion; }
  getContext(){ return this.advisor.context(); }
}