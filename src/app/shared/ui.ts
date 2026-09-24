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
  template: `
    <div
      class="modal-backdrop"
      *ngIf="open"
      (mousedown)="onBackdropMouseDown($event)"
      (click)="onBackdropClick($event)"
    >
      <section
        class="modal-card"
        [class.modal-card--wide]="wide"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="translate(title)"
        (mousedown)="$event.stopPropagation()"
        (click)="$event.stopPropagation()"
      >
        <header>
          <div>
            <span class="section-kicker">{{ translate('Workspace action') }}</span>
            <h3>{{ translate(title) }}</h3>
          </div>

          <button
            type="button"
            class="icon-button"
            [attr.aria-label]="translate('Close')"
            (click)="close.emit()"
          >
            ×
          </button>
        </header>

        <div class="modal-body">
          <ng-content />
        </div>
      </section>
    </div>
  `,
})
export class Modal {
  readonly i18n = inject(AdminI18nService);

  @Input() open = false;
  @Input() title = "";
  @Input() wide = false;

  @Output() close = new EventEmitter<void>();

  onBackdropMouseDown(event: MouseEvent): void {
    if (event.target !== event.currentTarget) {
      event.stopPropagation();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  translate(value: string): string {
    return translateValue(this.i18n, value);
  }
}

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
