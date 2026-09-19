import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AdminI18nService } from "../core/admin-i18n.service";
import { adminText } from "../core/admin-page-translations";
import { adminUniversalText } from "../core/admin-universal-translations";

function translateValue(i18n: AdminI18nService, value: string): string {
  return adminUniversalText(adminText(i18n, value), i18n.language());
}

@Component({
  selector: "qai-page-header",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `<div class="page-header" [attr.data-template]="template">
    <nav class="breadcrumbs" *ngIf="breadcrumbs.length" aria-label="Breadcrumb">
      <ng-container *ngFor="let crumb of breadcrumbs; let last = last">
        <a *ngIf="crumb.route && !last" [routerLink]="crumb.route">{{ translate(crumb.label) || crumb.label }}</a>
        <span *ngIf="!crumb.route || last" [class.current]="last">{{ translate(crumb.label) || crumb.label }}</span>
        <i *ngIf="!last">›</i>
      </ng-container>
    </nav>
    <div class="page-header-main">
    <div class="page-header-title" *ngIf="title || subtitle">
      <h1 *ngIf="title">{{ translate(title) || title }}</h1>
      <p *ngIf="subtitle">{{ translate(subtitle) || subtitle }}</p>
    </div>
    <div class="page-actions"><ng-content /></div>
    </div>
  </div>`,
  styles: [`
    :host { display:block; min-width:0; }
    .page-header{position:relative;display:block;box-sizing:border-box;padding:0 24px 16px;background:transparent;border:0;color:var(--wl-header-text,#344054)}
    .breadcrumbs{display:flex;align-items:center;gap:8px;min-height:30px;padding-top:7px;color:var(--wl-header-muted,#667085);font-size:10px;line-height:1}
    .breadcrumbs a,.breadcrumbs span{color:var(--wl-header-muted,#667085);text-decoration:none;white-space:nowrap}
    .breadcrumbs a:hover{color:var(--wl-accent,#2563eb)}
    .breadcrumbs .current{color:var(--wl-header-title,#172033);font-weight:650}
    .breadcrumbs i{font-style:normal;color:#b3bfce}
    .page-header-main{display:flex;align-items:center;justify-content:space-between;gap:20px;min-height:72px;padding:10px 0 0}
    .page-header{display:flex;align-items:center;justify-content:space-between;gap:var(--wl-header-gap,14px);min-height:var(--wl-header-height,72px);padding:var(--wl-header-padding,16px 24px);box-sizing:border-box;background:var(--wl-header-bg,#f4f7fb);border:1px solid var(--wl-header-border,#e3e9f1);border-radius:var(--wl-header-radius,0);color:var(--wl-header-text,#344054)}
    .page-header-title{min-width:0}
    .page-header-title h1{margin:0;color:var(--wl-header-title,#172033);font-size:var(--wl-header-title-size,20px);font-weight:760;letter-spacing:-.025em;line-height:1.2}
    .page-header-title p{margin:5px 0 0;color:var(--wl-header-muted,#667085);font-size:var(--wl-header-font-size,11px);line-height:1.45}
    .page-actions{display:flex;align-items:center;justify-content:flex-end;gap:var(--wl-header-gap,8px);margin-left:auto;flex:0 0 auto}
    .page-actions button,.page-actions a{min-height:var(--wl-control-height,34px);box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}
    @media(max-width:760px){.page-header{align-items:flex-start;flex-wrap:wrap}.page-actions{width:100%;flex-wrap:wrap}}
  `]
})
export class PageHeader {
  readonly i18n = inject(AdminI18nService);
  @Input() template = "header-01";
  @Input() title = "";
  @Input() subtitle = "";
  @Input() accent: "default" | "orange" = "default";
  @Input() breadcrumbs: Array<{label:string;route?:string}> = [];
  translate(value: string): string { return translateValue(this.i18n, value); }
}

@Component({
  selector: "qai-modal",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="modal-backdrop" *ngIf="open" (click)="close.emit()">
    <section class="modal-card" [class.modal-card--wide]="wide" role="dialog" aria-modal="true" [attr.aria-label]="translate(title)" (click)="$event.stopPropagation()">
      <header><div><span class="section-kicker">{{translate('Workspace action')}}</span><h3>{{ translate(title) }}</h3></div><button type="button" class="icon-button" [attr.aria-label]="translate('Close')" (click)="close.emit()">×</button></header>
      <div class="modal-body"><ng-content /></div>
    </section>
  </div>`,
})
export class Modal { readonly i18n = inject(AdminI18nService); @Input() open=false; @Input() title=""; @Input() wide=false; @Output() close=new EventEmitter<void>(); translate(value:string):string{return translateValue(this.i18n,value);} }

@Component({selector:"qai-empty",standalone:true,template:`<div class="empty"><b>{{ translate(title) }}</b><span>{{ translate(text) }}</span></div>`})
export class Empty { readonly i18n = inject(AdminI18nService); @Input() title="No data"; @Input() text=""; translate(value:string):string{return translateValue(this.i18n,value);} }

@Component({
  selector:"qai-wizard-steps",
  standalone:true,
  imports:[CommonModule],
  template:`<nav class="wizard" [attr.aria-label]="translate(label)"><ol><li *ngFor="let step of steps;let index=index" [class.active]="index===current" [class.done]="isDone(index)"><span>{{isDone(index)?'✓':index+1}}</span><div><b>{{translate(step)}}</b><small *ngIf="descriptions[index]">{{translate(descriptions[index])}}</small></div></li></ol></nav>`,
  styles:[`:host{display:block;min-width:0}`]
})
export class WizardSteps { readonly i18n=inject(AdminI18nService); @Input() steps:string[]=[]; @Input() descriptions:string[]=[]; @Input() current=0; @Input() label="Setup progress"; translate(value:string):string{return translateValue(this.i18n,value);} isDone(index:number):boolean{return index<this.current;} }

@Component({selector:"qai-callout",standalone:true,imports:[CommonModule],template:`<aside [class]="'callout '+tone"><span class="callout-icon">{{icon}}</span><div><b>{{translate(title)}}</b><p>{{translate(text)}}</p><ng-content /></div></aside>`})
export class Callout { readonly i18n=inject(AdminI18nService); @Input() icon="i"; @Input() title=""; @Input() text=""; @Input() tone:"info"|"success"|"warning"="info"; translate(value:string):string{return translateValue(this.i18n,value);} }
