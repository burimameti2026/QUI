import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PageHeader } from './ui';
import { UiCard, UiCardModel, UiListCard, UiMetric, UiMetrics, UiSection, UiStep, UiSteps, UiTableCard } from './enterprise-ui';
import { UiBinding, UiPageAction, UiPageComponentConfig, UiPageConfig } from './ui-page-config';

@Component({
  selector: 'qai-ui-page-renderer',
  standalone: true,
  imports: [CommonModule, PageHeader, UiSection, UiSteps, UiMetrics, UiCard, UiListCard, UiTableCard],
  template: `
    <qai-page-header
      *ngIf="config.shell.header"
      [title]="config.header?.title || config.name"
      [subtitle]="config.header?.subtitle || ''"
      [style]="headerStyle()">
      <ng-container *ngFor="let action of config.header?.actions || []">
        <button type="button"
          [class.primary]="action.variant === 'primary'"
          [class.quiet-action]="action.variant !== 'primary'"
          (click)="emitAction(action)">
          {{ action.label }}
        </button>
      </ng-container>
    </qai-page-header>

    <main class="page-content">
      <div class="page-section" *ngFor="let section of config.sections">
        <ng-container *ngIf="!section.collapsed">
          <qai-ui-section [columns]="section.columns || 1">
            <ng-container *ngFor="let component of section.components">
              <ng-container *ngTemplateOutlet="componentTpl; context: { $implicit: component }"></ng-container>
            </ng-container>
          </qai-ui-section>
        </ng-container>
      </div>
    </main>

    <ng-template #componentTpl let-component>
      <ng-container [ngSwitch]="component.type">
        <div *ngSwitchCase="'steps'" [ngStyle]="appearanceStyle(component)"><qai-ui-steps
          [eyebrow]="component.badge || 'WORKFLOW'"
          [title]="component.title || ''"
          [subtitle]="component.subtitle || ''"
          [steps]="value(component, 'steps', [])"></qai-ui-steps></div>

        <div *ngSwitchCase="'metrics'" [ngStyle]="appearanceStyle(component)"><qai-ui-metrics
          [items]="value(component, 'items', [])"
          (action)="emitRoute($event)"></qai-ui-metrics></div>

        <div *ngSwitchCase="'card'" [ngStyle]="appearanceStyle(component)"><qai-ui-card
          [model]="cardModel(component)"
          (action)="emitRoute($event)"></qai-ui-card></div>

        <div *ngSwitchCase="'list-card'" [ngStyle]="appearanceStyle(component)"><qai-ui-list-card
          [eyebrow]="component.badge || ''"
          [title]="component.title || ''"
          [items]="value(component, 'items', [])"
          [action]="firstAction(component)"
          (actionClick)="emitRoute($event)"></qai-ui-list-card></div>

        <div *ngSwitchCase="'table-card'" [ngStyle]="appearanceStyle(component)"><qai-ui-table-card
          [eyebrow]="component.badge || ''"
          [title]="component.title || ''"
          [columns]="value(component, 'columns', [])"
          [rows]="value(component, 'rows', [])"
          [emptyText]="value(component, 'emptyText', 'No records.')"
          [action]="firstAction(component)"
          (actionClick)="emitRoute($event)"></qai-ui-table-card></div>

        <article class="text-block" *ngSwitchCase="'text'" [ngStyle]="appearanceStyle(component)">
          <span *ngIf="component.badge" class="eyebrow">{{ component.badge }}</span>
          <h3>{{ component.title }}</h3>
          <p>{{ value(component, 'text', component.subtitle || '') }}</p>
        </article>

        <div class="grid-block" *ngSwitchCase="'grid'" [ngStyle]="appearanceStyle(component)">
          <ng-container *ngFor="let child of component.children || []">
            <ng-container *ngTemplateOutlet="componentTpl; context: { $implicit: child }"></ng-container>
          </ng-container>
        </div>
      </ng-container>
    </ng-template>
  `,
  styles: [`
    :host{display:block;min-width:0}
    .page-content{padding:0 24px 24px}
    .page-section{min-width:0}
    .text-block{border:1px solid #d6e0ec;border-radius:14px;background:#fff;padding:18px;box-shadow:0 7px 20px rgba(15,47,104,.055)}
    .text-block .eyebrow{font-size:9px;font-weight:800;letter-spacing:.9px;color:#68778d}
    .text-block h3{margin:5px 0 7px;color:#173f7a;font-size:14px}
    .text-block p{margin:0;color:#66748a;font-size:11px;line-height:1.7}
    .grid-block{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
    .grid-block>ng-container{display:contents}
    button{border:0;border-radius:9px;padding:9px 13px;font-size:10px;font-weight:700;cursor:pointer;margin-left:7px}
    button.primary{background:#1769e0;color:#fff}
    button.quiet-action{background:#eef5ff;color:#1769e0}
    @media(max-width:680px){.page-content{padding:0 12px 18px}.grid-block{grid-template-columns:1fr}}
  `]
})
export class UiPageRenderer {
  @Input() config!: UiPageConfig;
  @Input() context: Record<string, unknown> = {};
  @Output() action = new EventEmitter<UiPageAction>();

  value(component: UiPageComponentConfig, key: string, fallback: unknown = ''): any {
    const binding = component.bindings?.[key];
    if (binding) return this.resolve(binding);
    if (component.data && key in component.data) return this.resolveValue(component.data[key]);
    return fallback;
  }

  cardModel(component: UiPageComponentConfig): UiCardModel {
    const data = (component.data || {}) as Record<string, unknown>;
    return {
      eyebrow: component.badge || this.value(component, 'eyebrow', ''),
      title: component.title || String(this.value(component, 'title', '')),
      subtitle: component.subtitle || String(this.value(component, 'subtitle', '')),
      badge: String(this.value(component, 'badge', '')) || undefined,
      rows: this.value(component, 'rows', []) as any[],
      text: String(this.value(component, 'text', '')),
      action: this.firstAction(component)
    };
  }

  firstAction(component: UiPageComponentConfig): any {
    const a = component.actions?.[0];
    return a ? { label: a.label, route: a.route || a.command || '' } : null;
  }

  emitAction(action: UiPageAction) { this.action.emit(action); }

  appearanceStyle(component: UiPageComponentConfig): Record<string, string> {
    const a = component.appearance || {};
    return {
      '--ui-surface': a.surfaceColor || '#ffffff',
      '--ui-header': a.headerColor || '#d6e8ff',
      '--ui-border': a.borderColor || '#d6e0ec',
      '--ui-title': a.titleColor || '#173f7a',
      '--ui-text': a.textColor || '#26364d',
      '--ui-muted': a.mutedTextColor || '#68778d',
      '--ui-accent': a.accentColor || '#1769e0',
      '--ui-button-bg': a.buttonBackgroundColor || a.accentColor || '#1769e0',
      '--ui-button-text': a.buttonTextColor || '#ffffff',
      '--ui-button-border': a.buttonBorderColor || a.accentColor || '#1769e0',
      '--ui-button-hover': a.buttonHoverBackgroundColor || a.accentColor || '#1769e0',
      ...(a.height ? { 'min-height': a.height + 'px' } : {}),
      ...(a.radius ? { '--ui-radius': a.radius + 'px' } : {})
    };
  }

  headerStyle(): Record<string,string> {
    const a = (this.config?.header as any)?.appearance || {};
    return {
      ...(a.headerColor ? {'--wl-header-bg': a.headerColor} : {}),
      ...(a.borderColor ? {'--wl-header-border': a.borderColor} : {}),
      ...(a.titleColor ? {'--wl-header-title': a.titleColor} : {}),
      ...(a.textColor ? {'--wl-header-text': a.textColor} : {}),
      ...(a.mutedTextColor ? {'--wl-header-muted': a.mutedTextColor} : {}),
    };
  }

  emitRoute(route: string) {
    if (route) this.action.emit({ label: route, route });
  }

  private resolve(binding: UiBinding): unknown {
    const value = this.readPath(binding.source);
    return value === undefined || value === null || value === '' ? binding.fallback ?? '' : this.resolveValue(value);
  }

  private readPath(path: string): unknown {
    return path.split('.').reduce<unknown>((current, key) => {
      if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, this.context);
  }

  private resolveValue(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(item => this.resolveValue(item));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k,v]) => [k,this.resolveValue(v)]));
    }
    return value;
  }
}
