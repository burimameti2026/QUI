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
      [template]="config.header?.template || 'header-01'"
      [title]="config.header?.title || config.name"
      [subtitle]="config.header?.subtitle || ''"
      >
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
        <div *ngSwitchCase="'steps'" ><qai-ui-steps
          [template]="component.template" [eyebrow]="component.badge || 'WORKFLOW'"
          [title]="component.title || ''"
          [subtitle]="component.subtitle || ''"
          [steps]="value(component, 'steps', [])"></qai-ui-steps></div>

        <div *ngSwitchCase="'metrics'" ><qai-ui-metrics
          [template]="component.template"
          [items]="value(component, 'items', [])"
          (action)="emitRoute($event)"></qai-ui-metrics></div>

        <div *ngSwitchCase="'card'" ><qai-ui-card
          [template]="component.template"
          [model]="cardModel(component)"
          (action)="emitRoute($event)"></qai-ui-card></div>

        <div *ngSwitchCase="'list-card'" ><qai-ui-list-card
          [template]="component.template"
          [eyebrow]="component.badge || ''"
          [title]="component.title || ''"
          [items]="value(component, 'items', [])"
          [action]="firstAction(component)"
          (actionClick)="emitRoute($event)"></qai-ui-list-card></div>

        <div *ngSwitchCase="'table-card'" ><qai-ui-table-card
          [template]="component.template"
          [eyebrow]="component.badge || ''"
          [title]="component.title || ''"
          [columns]="value(component, 'columns', [])"
          [rows]="value(component, 'rows', [])"
          [emptyText]="value(component, 'emptyText', 'No records.')"
          [action]="firstAction(component)"
          (actionClick)="emitRoute($event)"></qai-ui-table-card></div>

        <article class="text-block" [attr.data-template]="component.template" *ngSwitchCase="'text'" >
          <span *ngIf="component.badge" class="eyebrow">{{ component.badge }}</span>
          <h3>{{ component.title }}</h3>
          <p>{{ value(component, 'text', component.subtitle || '') }}</p>
        </article>

        <div class="grid-block" *ngSwitchCase="'grid'" [attr.data-template]="component.template">
          <ng-container *ngFor="let child of component.children || []">
            <ng-container *ngTemplateOutlet="componentTpl; context: { $implicit: child }"></ng-container>
          </ng-container>
        </div>

        <button *ngSwitchCase="'button'" type="button" [attr.data-template]="component.template" (click)="emitAction(firstAction(component) || {label: component.title || 'Action'})">
          {{ component.title || component.data?.['label'] || 'Action' }}
        </button>
      </ng-container>
    </ng-template>
  `,
  styles: [`
    :host{display:block;min-width:0}
    .page-content{padding:var(--wl-page-padding-y) var(--wl-page-padding-x) var(--wl-page-padding-bottom)}
    .page-section{min-width:0}
    .grid-block{display:grid;grid-template-columns:repeat(var(--wl-grid-columns),minmax(0,1fr));gap:var(--wl-grid-gap)}
    .grid-block>ng-container{display:contents}
    @media(max-width:680px){.grid-block{grid-template-columns:1fr}}
  `],
,
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
