import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IndustryPacksService } from './industry-packs.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader, RouterLink],
  template: `<main class="page page-industry-packs">
    <qai-page-header title="Industry Packs" subtitle="Installed packs provide the business definitions used to create campaign containers."></qai-page-header>
    <section class="hero"><div><span class="eyebrow">CAPABILITY CATALOG</span><h2>{{ installedCount }} installed · {{ packs.length }} available</h2><p>Install a pack once, then create campaign containers from it. The pack supplies the ICP, agent, workflow and task definitions; the campaign controls execution.</p></div></section>
    <section class="card" *ngIf="installedCount"><header class="card-header"><div><span class="eyebrow">INSTALLED</span><h2>Ready to create campaigns</h2><p>These packs are available to your tenant.</p></div><a class="button-primary" routerLink="/acquisition/campaigns">Create campaign</a></header><div class="list"><article class="list-item" *ngFor="let pack of installedPacks"><div class="icon">✓</div><div class="stack"><strong>{{ pack.name }}</strong><small>{{ pack.code }} · {{ pack.description }}</small></div><span class="status status-active">Installed</span></article></div></section><section class="content-grid"><article class="card" *ngFor="let pack of packs"><header class="card-header"><div><span class="eyebrow">INDUSTRY PACK</span><h2>{{ pack.name }}</h2></div><span class="status" [class.status-active]="pack.installed">{{ pack.installed ? "Installed" : "Available" }}</span></header><div class="card-body"><p>{{ pack.description || 'Business definitions for this acquisition domain.' }}</p><div class="list"><div class="list-item"><span>ICP guidance</span></div><div class="list-item"><span>Workflow template</span></div><div class="list-item"><span>Message framework</span></div><div class="list-item"><span>Agent + workflow tasks</span></div></div></div><footer class="card-footer"><button class="button-primary" type="button" *ngIf="!pack.installed" (click)="enable(pack)" [disabled]="busyId === pack.id">Install pack</button><a class="button-secondary" routerLink="/acquisition/campaigns" *ngIf="pack.installed">Create campaign</a></footer></article></section>
    <div class="empty" *ngIf="!packs.length"><strong>No Industry Packs available</strong><span>Industry Packs will appear when configured by the platform.</span></div>
  </main>`
})
export class IndustryPacksPage implements OnInit {
  packs:any[]=[]; busyId:string|null=null; constructor(private readonly data:IndustryPacksService){}
  get installedPacks():any[]{return this.packs.filter(x=>x.installed)}
  get installedCount():number{return this.installedPacks.length}
  ngOnInit():void{this.load()}
  load():void{this.data.list<any[]>().subscribe({next:packs=>this.packs=packs||[],error:()=>alert('Industry Packs could not be loaded.')})}
  enable(pack:any):void{this.busyId=pack.id; this.data.install<any>(pack.id).subscribe({next:()=>{this.busyId=null;this.load()},error:error=>{this.busyId=null;alert(error?.error?.detail||'The Industry Pack could not be installed.')}})}
}
