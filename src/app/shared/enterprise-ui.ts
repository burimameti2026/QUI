import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type UiColumns = 1 | 2 | 3 | 4 | 5;
export interface UiAction { label: string; route?: string; }
export interface UiStep { number: string; category: string; title: string; subtitle: string; active?: boolean; }
export interface UiMetric { label: string; value: string | number; subtitle?: string; icon?: string; tone?: 'blue'|'violet'|'green'|'amber'|'rose'; action?: UiAction; }
export interface UiRow { label: string; detail?: string; value: string | number; }
export interface UiCardModel { eyebrow?: string; title: string; subtitle?: string; badge?: string; badgeTone?: 'neutral'|'success'|'info'|'warning'; rows?: UiRow[]; text?: string; action?: UiAction; }

@Component({selector:'qai-ui-section',standalone:true,imports:[CommonModule],template:`<section class="ui-section" [ngClass]="'columns-'+columns"><ng-content/></section>`,styles:[`
  :host{display:block;min-width:0}
  .ui-section{display:grid;grid-template-columns:1fr;gap:var(--wl-grid-gap,16px);min-width:0}
  .ui-section.columns-1{grid-template-columns:1fr}
  .ui-section.columns-2{grid-template-columns:repeat(2,minmax(0,1fr))}
  .ui-section.columns-3{grid-template-columns:repeat(3,minmax(0,1fr))}
  .ui-section.columns-4{grid-template-columns:repeat(4,minmax(0,1fr))}
  .ui-section.columns-5{grid-template-columns:repeat(5,minmax(0,1fr))}
  @media(max-width:1100px){.ui-section.columns-4,.ui-section.columns-5{grid-template-columns:repeat(2,minmax(0,1fr))}}
  @media(max-width:760px){.ui-section.columns-2,.ui-section.columns-3,.ui-section.columns-4,.ui-section.columns-5{grid-template-columns:1fr}}
`]})
export class UiSection { @Input() columns:UiColumns=1; }

@Component({selector:'qai-ui-steps',standalone:true,imports:[CommonModule],template:`
<article class="surface" [attr.data-template]="template"><header><div><span class="eyebrow">{{eyebrow}}</span><h2>{{title}}</h2><p *ngIf="subtitle">{{subtitle}}</p></div><span class="badge" *ngIf="badge"><i></i>{{badge}}</span></header><div class="steps"><ng-container *ngFor="let step of steps;let last=last"><div class="step" [class.active]="step.active"><span class="node">{{step.number}}</span><div><small>{{step.category}}</small><strong>{{step.title}}</strong><em>{{step.subtitle}}</em></div></div><span class="connector" *ngIf="!last"></span></ng-container></div></article>`,
styles:[`:host{display:block;min-width:0}.metrics{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:var(--wl-kpi-gap,16px)!important;width:100%;min-width:0;box-sizing:border-box}.metric{appearance:none;min-width:0;min-height:132px;box-sizing:border-box;display:flex!important;flex-direction:column;justify-content:space-between;align-items:stretch;gap:8px;padding:16px 16px 14px!important;margin:0!important;background:var(--wl-kpi-bg,var(--wl-card-bg,#fff))!important;color:var(--wl-kpi-text,var(--wl-card-text,#475467))!important;border:1px solid var(--wl-kpi-border,var(--wl-card-border,#e3e9f1))!important;border-radius:var(--wl-kpi-radius,12px)!important;box-shadow:0 2px 9px rgba(16,24,40,.045)!important;text-align:left;font:inherit;cursor:default;transition:box-shadow 120ms ease,border-color 120ms ease}.metric:hover{border-color:#d5deeb!important;box-shadow:0 5px 16px rgba(16,24,40,.07)!important}.metric-top{display:flex;align-items:center;gap:10px;min-width:0}.metric-top .label{min-width:0;color:var(--wl-kpi-muted,var(--wl-card-muted,#667085));font-size:10px;font-weight:650;line-height:1.3}.metric .icon{width:40px;height:40px;flex:0 0 40px;display:grid;place-items:center;border-radius:50%;background:var(--wl-kpi-icon-bg,var(--wl-accent-soft,#edf4ff));color:var(--wl-kpi-icon,var(--wl-accent,#2563eb));font-size:17px}.metric-value-row{display:flex;align-items:flex-end;justify-content:space-between;gap:10px}.metric strong{display:block;margin:0;color:var(--wl-kpi-value,var(--wl-card-title,#172033));font-size:25px;font-weight:780;line-height:1;letter-spacing:-.035em}.sparkline{display:block;width:68px;height:25px;flex:0 0 68px;opacity:.9}.sparkline svg{display:block;width:100%;height:100%;overflow:visible}.sparkline path{fill:none;stroke:var(--wl-kpi-accent,var(--wl-accent,#2563eb));stroke-width:1.7;stroke-linecap:round}.metric small{display:flex;align-items:center;gap:5px;min-height:15px;color:var(--wl-kpi-muted,var(--wl-card-muted,#667085));font-size:9px;line-height:1.35}.metric small .trend{color:#12b76a;font-weight:700}.metric small .period{color:var(--wl-kpi-muted,var(--wl-card-muted,#667085))}@media(max-width:1100px){.metrics{grid-template-columns:repeat(3,minmax(0,1fr))!important}}@media(max-width:760px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media(max-width:520px){.metrics{grid-template-columns:1fr!important}}`]})
export class UiSteps { @Input() template='steps-01'; @Input() eyebrow='WORKFLOW'; @Input() title=''; @Input() subtitle=''; @Input() badge=''; @Input() steps:UiStep[]=[]; }

@Component({selector:'qai-ui-metrics',standalone:true,imports:[CommonModule],template:`<div class="metrics" [attr.data-template]="template"><button type="button" *ngFor="let item of items; let i = index" class="metric" (click)="action.emit(item.action?.route||'')">
  <span class="metric-top"><span class="icon">{{item.icon||'•'}}</span><span class="label">{{item.label}}</span></span>
  <span class="metric-value-row"><strong>{{item.value}}</strong><span class="sparkline" aria-hidden="true"><svg viewBox="0 0 72 24" preserveAspectRatio="none"><path d="M1 20 C8 19 10 14 17 15 S25 12 31 13 S40 7 47 10 S56 5 62 7 S67 3 71 2"></path></svg></span></span>
  <small><span class="trend">↗ {{item.tone === 'rose' ? '5%' : item.tone === 'amber' ? '8%' : item.tone === 'violet' ? '12%' : '15%'}}</span><span class="period">vs. previous period</span></small>
</button></div>`,styles:[`:host{display:block;min-width:0}`]})
export class UiMetrics {
  @Input() template='kpi-01';
  @Input() items:UiMetric[]=[];
  @Output() action=new EventEmitter<string>();
}

@Component({selector:'qai-ui-card',standalone:true,imports:[CommonModule],template:`
<article class="card" [attr.data-template]="template"><header><div><span class="eyebrow" *ngIf="model.eyebrow">{{model.eyebrow}}</span><h3>{{model.title}}</h3><p *ngIf="model.subtitle">{{model.subtitle}}</p></div><span class="status" *ngIf="model.badge" [class.success]="model.badgeTone==='success'">{{model.badge}}</span></header><div class="body"><div class="row" *ngFor="let row of model.rows;let first=first" [class.first]="first"><span><small>{{row.label}}</small><em *ngIf="row.detail">{{row.detail}}</em></span><strong>{{row.value}}</strong></div><p class="text" *ngIf="model.text">{{model.text}}</p></div><footer *ngIf="model.action"><span>Next action</span><button type="button" (click)="action.emit(model.action?.route||'')">{{model.action?.label}} →</button></footer><ng-content/></article>`,
styles:[`:host{display:block;min-width:0}`]})
export class UiCard { @Input() template='card-01'; @Input() model:UiCardModel={title:''}; @Output() action=new EventEmitter<string>(); }

@Component({selector:'qai-ui-list-card',standalone:true,imports:[CommonModule],template:`
<article class="card" [attr.data-template]="template"><header><div><span class="eyebrow" *ngIf="eyebrow">{{eyebrow}}</span><h3>{{title}}</h3></div><button *ngIf="action" type="button" (click)="actionClick.emit(action?.route||'')">{{action?.label}} →</button></header><div class="list"><div class="item" *ngFor="let item of items"><span class="icon">{{item.icon||'•'}}</span><div class="copy"><strong>{{item.title}}</strong><span>{{item.subtitle}}</span></div><em *ngIf="item.badge" [class.success]="item.tone==='success'">{{item.badge}}</em></div></div></article>`,
styles:[`:host{display:block;min-width:0}`]})
export class UiListCard { @Input() template='list-01'; @Input() eyebrow=''; @Input() title=''; @Input() items:Array<{icon?:string,title:string,subtitle:string,badge?:string,tone?:string}>=[]; @Input() action:UiAction|null=null; @Output() actionClick=new EventEmitter<string>(); }

@Component({selector:'qai-ui-table-card',standalone:true,imports:[CommonModule],template:`
<article class="card" [attr.data-template]="template"><header><div><span class="eyebrow" *ngIf="eyebrow">{{eyebrow}}</span><h3>{{title}}</h3></div><button *ngIf="action" type="button" (click)="actionClick.emit(action?.route||'')">{{action?.label}} →</button></header><div class="table-wrap"><table><thead><tr><th *ngFor="let col of columns">{{col.label}}</th></tr></thead><tbody><tr *ngFor="let row of rows"><td *ngFor="let col of columns">{{row[col.key]}}</td></tr></tbody></table><p *ngIf="!rows.length" class="empty">{{emptyText}}</p></div></article>`,
styles:[`:host{display:block;min-width:0}`]})
export class UiTableCard { @Input() template='table-01'; @Input() eyebrow=''; @Input() title=''; @Input() columns:Array<{key:string,label:string}>=[]; @Input() rows:Array<Record<string,unknown>>=[]; @Input() emptyText='No records.'; @Input() action:UiAction|null=null; @Output() actionClick=new EventEmitter<string>(); }
