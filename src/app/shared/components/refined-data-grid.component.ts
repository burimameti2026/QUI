import { Component } from '@angular/core';

/** Shared data-grid surface using the canonical design-system table. */
@Component({
  selector: 'qai-data-grid',
  standalone: true,
  template: `<div class="table"><ng-content /></div>`
})
export class RefinedDataGrid {}