import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { AdminI18nService } from "../core/admin-i18n.service";
import { adminText } from "../core/admin-page-translations";
import { adminUniversalText } from "../core/admin-universal-translations";

function translateValue(i18n: AdminI18nService, value: string): string {
  return adminUniversalText(adminText(i18n, value), i18n.language());
}

@Component({
  selector: "qai-page-header",
  standalone: true,
  template: `<div class="page-header">
    <div class="page-header-title" *ngIf="title || subtitle">
      <h1 *ngIf="title">{{ translate(title) || title }}</h1>
      <p *ngIf="subtitle">{{ translate(subtitle) || subtitle }}</p>
    </div>
    <div class="page-actions"><ng-content /></div>
  </div>`,
})
export class PageHeader {
  readonly i18n = inject(AdminI18nService);
  @Input() title = "";
  @Input() subtitle = "";
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
  styles:[`
    :host { display: block; min-width: 0; }
    .wizard { display: block; width: 100%; padding: 16px 18px 18px; background: #fff; }
    .wizard ol { position: relative; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; margin: 0; padding: 0; list-style: none; }
    .wizard ol::before { content: ""; position: absolute; top: 19px; left: 32px; right: 32px; height: 2px; background: #d9e3f1; }
    .wizard li { position: relative; z-index: 1; display: flex; min-width: 0; flex-direction: column; align-items: center; gap: 8px; padding: 0 8px; color: #64748b; text-align: center; }
    .wizard li > span { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid #cbd8e8; border-radius: 50%; background: #fff; color: #62748c; font-size: 11px; font-weight: 800; box-shadow: 0 0 0 5px #fff; }
    .wizard li.done > span, .wizard li.active > span { border-color: #2563eb; background: #2563eb; color: #fff; }
    .wizard li.active > span { box-shadow: 0 0 0 5px #eaf2ff; }
    .wizard li > div { min-width: 0; }
    .wizard li b { display: block; color: #334155; font-size: 10px; font-weight: 800; }
    .wizard li.active b { color: #1d4ed8; }
    .wizard li small { display: block; margin-top: 4px; color: #7b8798; font-size: 8px; line-height: 1.35; }
    @media (max-width: 680px) {
      .wizard { padding: 14px 16px 16px; }
      .wizard ol { grid-template-columns: 1fr; gap: 10px; }
      .wizard ol::before { top: 18px; bottom: 18px; left: 19px; right: auto; width: 2px; height: auto; }
      .wizard li { display: grid; grid-template-columns: 38px minmax(0, 1fr); align-items: center; gap: 11px; padding: 0; text-align: left; }
      .wizard li > span { box-shadow: 0 0 0 4px #fff; }
    }
  `]
})
export class WizardSteps { readonly i18n=inject(AdminI18nService); @Input() steps:string[]=[]; @Input() descriptions:string[]=[]; @Input() current=0; @Input() label="Setup progress"; translate(value:string):string{return translateValue(this.i18n,value);} isDone(index:number):boolean{return index<this.current;} }

@Component({selector:"qai-callout",standalone:true,imports:[CommonModule],template:`<aside [class]="'callout '+tone"><span class="callout-icon">{{icon}}</span><div><b>{{translate(title)}}</b><p>{{translate(text)}}</p><ng-content /></div></aside>`})
export class Callout { readonly i18n=inject(AdminI18nService); @Input() icon="i"; @Input() title=""; @Input() text=""; @Input() tone:"info"|"success"|"warning"="info"; translate(value:string):string{return translateValue(this.i18n,value);} }
