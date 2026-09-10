import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, inject } from "@angular/core";
import { AdminI18nService } from "../core/admin-i18n.service";

@Component({
  selector: "qai-page-header",
  standalone: true,
  template: `<div class="page-header">
    <div>
      <h1>{{ title }}</h1>
      <p>{{ subtitle }}</p>
    </div>
    <div class="page-actions"><ng-content /></div>
  </div>`,
})
export class PageHeader {
  @Input() title = "";
  @Input() subtitle = "";
}

@Component({
  selector: "qai-modal",
  standalone: true,
  imports: [CommonModule],
  template: `<div class="modal-backdrop" *ngIf="open" (click)="close.emit()">
    <section class="modal-card" [class.modal-card--wide]="wide" role="dialog" aria-modal="true" [attr.aria-label]="title" (click)="$event.stopPropagation()">
      <header>
        <div>
          <span class="section-kicker">{{i18n.t('Workspace action')}}</span>
          <h3>{{ title }}</h3>
        </div>
        <button type="button" class="icon-button" [attr.aria-label]="i18n.t('Close')" (click)="close.emit()">×</button>
      </header>
      <div class="modal-body"><ng-content /></div>
    </section>
  </div>`,
})
export class Modal {
  readonly i18n = inject(AdminI18nService);
  @Input() open = false;
  @Input() title = "";
  @Input() wide = false;
  @Output() close = new EventEmitter<void>();
}

@Component({
  selector: "qai-empty",
  standalone: true,
  template: `<div class="empty"><b>{{ i18n.t(title) }}</b><span>{{ i18n.t(text) }}</span></div>`,
})
export class Empty {
  readonly i18n = inject(AdminI18nService);
  @Input() title = "No data";
  @Input() text = "";
}

@Component({
  selector: "qai-wizard-steps",
  standalone: true,
  imports: [CommonModule],
  template: `<nav class="wizard" [attr.aria-label]="i18n.t(label)">
    <ol><li *ngFor="let step of steps; let index = index" [class.active]="index === current" [class.done]="index < current">
      <span>{{ index < current ? "✓" : index + 1 }}</span><div><b>{{ i18n.t(step) }}</b><small *ngIf="descriptions[index]">{{ i18n.t(descriptions[index]) }}</small></div>
    </li></ol>
  </nav>`,
})
export class WizardSteps {
  readonly i18n = inject(AdminI18nService);
  @Input() steps: string[] = [];
  @Input() descriptions: string[] = [];
  @Input() current = 0;
  @Input() label = "Setup progress";
}

@Component({
  selector: "qai-callout",
  standalone: true,
  template: `<aside [class]="'callout ' + tone"><span class="callout-icon">{{ icon }}</span><div><b>{{ i18n.t(title) }}</b><p>{{ i18n.t(text) }}</p><ng-content /></div></aside>`,
})
export class Callout {
  readonly i18n = inject(AdminI18nService);
  @Input() icon = "i";
  @Input() title = "";
  @Input() text = "";
  @Input() tone: "info" | "success" | "warning" = "info";
}
