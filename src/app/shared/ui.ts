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
      <h1 *ngIf="title">{{ translate(title) }}</h1>
      <p *ngIf="subtitle">{{ translate(subtitle) }}</p>
    </div>
    <div class="page-actions"><ng-content /></div>
  </div>`,
  styles: [`
    :host { display: block; }
    .page-header { display:flex; align-items:center; justify-content:space-between; gap:24px; width:100%; box-sizing:border-box; margin:0 0 22px; padding-inline:10px; }
    .page-header-title { min-width:0; }
    .page-header-title h1 { margin:0; }
    .page-header-title p { margin:5px 0 0; }
    .page-actions { display:flex; align-items:center; justify-content:flex-end; gap:12px; margin-left:auto; flex:0 0 auto; flex-wrap:wrap; }
    .page-actions > * { flex:0 0 auto; }
    @media (max-width:700px) {
      .page-header { align-items:flex-start; flex-direction:column; gap:14px; padding-inline:0; }
      .page-actions { width:100%; justify-content:flex-start; margin-left:0; }
    }
  `],
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

@Component({selector:"qai-wizard-steps",standalone:true,imports:[CommonModule],template:`<nav class="wizard" [attr.aria-label]="translate(label)"><ol><li *ngFor="let step of steps;let index=index" [class.active]="index===current" [class.done]="isDone(index)"><span>{{isDone(index)?'✓':index+1}}</span><div><b>{{translate(step)}}</b><small *ngIf="descriptions[index]">{{translate(descriptions[index])}}</small></div></li></ol></nav>`})
export class WizardSteps { readonly i18n=inject(AdminI18nService); @Input() steps:string[]=[]; @Input() descriptions:string[]=[]; @Input() current=0; @Input() label="Setup progress"; translate(value:string):string{return translateValue(this.i18n,value);} isDone(index:number):boolean{return index<this.current;} }

@Component({selector:"qai-callout",standalone:true,imports:[CommonModule],template:`<aside [class]="'callout '+tone"><span class="callout-icon">{{icon}}</span><div><b>{{translate(title)}}</b><p>{{translate(text)}}</p><ng-content /></div></aside>`})
export class Callout { readonly i18n=inject(AdminI18nService); @Input() icon="i"; @Input() title=""; @Input() text=""; @Input() tone:"info"|"success"|"warning"="info"; translate(value:string):string{return translateValue(this.i18n,value);} }
