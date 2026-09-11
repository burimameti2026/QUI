import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { AdminI18nService } from "../core/admin-i18n.service";
import { adminText } from "../core/admin-page-translations";

@Component({
  selector: "qai-page-header",
  standalone: true,
  template: `<div class="page-header">
    <div>
      <h1>{{ text(title) }}</h1>
      <p>{{ text(subtitle) }}</p>
    </div>
    <div class="page-actions"><ng-content /></div>
  </div>`,
})
export class PageHeader {
  readonly i18n = inject(AdminI18nService);
  @Input() title = "";
  @Input() subtitle = "";
  text(value: string): string { return adminText(this.i18n, value); }
}

@Component({
  selector: "qai-modal",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="modal-backdrop" *ngIf="open" (click)="close.emit()">
    <section class="modal-card" [class.modal-card--wide]="wide" role="dialog" aria-modal="true" [attr.aria-label]="text(title)" (click)="$event.stopPropagation()">
      <header><div><span class="section-kicker">{{text('Workspace action')}}</span><h3>{{ text(title) }}</h3></div><button type="button" class="icon-button" [attr.aria-label]="text('Close')" (click)="close.emit()">×</button></header>
      <div class="modal-body"><ng-content /></div>
    </section>
  </div>`,
})
export class Modal { readonly i18n = inject(AdminI18nService); @Input() open=false; @Input() title=""; @Input() wide=false; @Output() close=new EventEmitter<void>(); text(value:string):string{return adminText(this.i18n,value);} }

@Component({selector:"qai-empty",standalone:true,template:`<div class="empty"><b>{{ text(title) }}</b><span>{{ text(textValue) }}</span></div>`})
export class Empty { readonly i18n=inject(AdminI18nService); @Input() title="No data"; @Input() textValue=""; text(value:string):string{return adminText(this.i18n,value);} }

@Component({selector:"qai-wizard-steps",standalone:true,imports:[CommonModule],template:`<nav class="wizard" [attr.aria-label]="text(label)"><ol><li *ngFor="let step of steps;let index=index" [class.active]="index===current" [class.done]="index<current"><span>{{index<current?'✓':index+1}}</span><div><b>{{text(step)}}</b><small *ngIf="descriptions[index]">{{text(descriptions[index])}}</small></div></li></ol></nav>`})
export class WizardSteps { readonly i18n=inject(AdminI18nService); @Input() steps:string[]=[]; @Input() descriptions:string[]=[]; @Input() current=0; @Input() label="Setup progress"; text(value:string):string{return adminText(this.i18n,value);} }

@Component({selector:"qai-callout",standalone:true,template:`<aside [class]="'callout '+tone"><span class="callout-icon">{{icon}}</span><div><b>{{text(title)}}</b><p>{{text(textValue)}}</p><ng-content /></div></aside>`})
export class Callout { readonly i18n=inject(AdminI18nService); @Input() icon="i"; @Input() title=""; @Input() textValue=""; @Input() tone:"info"|"success"|"warning"="info"; text(value:string):string{return adminText(this.i18n,value);} }
