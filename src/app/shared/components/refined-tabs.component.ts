import { Component } from '@angular/core';

/** Shared tab navigation using the canonical toolbar and button system. */
@Component({
  selector: 'qai-refined-tabs',
  standalone: true,
  template: `<nav class="toolbar actions"><ng-content /></nav>`
})
export class RefinedTabs {}