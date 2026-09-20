import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IndustryPacksService } from './industry-packs.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  template: `<main class="page">
    <qai-page-header title="Industry Playbooks" subtitle="Choose the vocabulary, qualification guidance and workflow starting point for your market."></qai-page-header>
    <section class="hero"><div><span class="eyebrow">TEMPLATE ONLY</span><h2>Playbooks do not add business data</h2><p>Enabling a playbook never creates prospects, contacts, campaigns, email messages or demo records. Use <strong>Prepare real workspace</strong> to import verified companies, or <strong>Load presentation demo</strong> when you need safe sample data.</p></div></section>
    <section class="content-grid"><article class="card" *ngFor="let pack of packs"><header class="card-header"><div><span class="eyebrow">INDUSTRY TEMPLATE</span><h2>{{ pack.name }}</h2></div><span class="icon">✦</span></header><div class="card-body"><p>{{ pack.description || 'A reusable starting point for qualification language, workflows and team guidance.' }}</p><div class="list"><div class="list-item"><span>ICP guidance</span></div><div class="list-item"><span>Workflow template</span></div><div class="list-item"><span>Message framework</span></div><div class="list-item"><span>Knowledge outline</span></div></div></div><footer class="card-footer"><button class="button-primary" type="button" (click)="enable(pack)">Enable playbook</button></footer></article></section>
    <div class="empty" *ngIf="!packs.length"><strong>No industry playbooks available</strong><span>Playbooks will appear when they are configured for the tenant.</span></div>
  </main>`
})
export class IndustryPacksPage implements OnInit {
  packs:any[]=[]; constructor(private readonly data:IndustryPacksService){}
  ngOnInit():void{this.data.list<any[]>().subscribe({next:packs=>this.packs=packs||[],error:()=>alert('Industry playbooks could not be loaded.')})}
  enable(pack:any):void{this.data.install<any>(pack.id).subscribe({next:()=>alert(`${pack.name} is enabled. No prospects, contacts or campaigns were created.`),error:error=>alert(error?.error?.detail||'The playbook could not be enabled.')})}
}
