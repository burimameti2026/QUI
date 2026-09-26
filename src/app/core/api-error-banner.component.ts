import { Component, inject } from '@angular/core';
import { ApiErrorService } from './api-error.service';

@Component({
  selector: 'qai-api-error-banner',
  standalone: true,
  template: `
    @if (errors.notice(); as notice) {
      <div class="qai-api-error-host" role="alert">
        <div class="qai-api-error-banner" [class.qai-api-error-warning]="notice.kind === 'warning'">
          <div class="qai-api-error-copy">
            <strong>{{ notice.title }}</strong>
            <span>{{ notice.message }}</span>
            @if (notice.traceId) {
              <small>Reference: {{ notice.traceId }}</small>
            }
          </div>
          <button type="button" aria-label="Dismiss error" (click)="errors.clear()">×</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .qai-api-error-host {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 2147483000;
      width: min(460px, calc(100vw - 40px));
      pointer-events: none;
    }

    .qai-api-error-banner {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      border: 1px solid rgba(220, 38, 38, .28);
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 14px 36px rgba(15, 23, 42, .18);
      color: #111827;
      pointer-events: auto;
    }

    .qai-api-error-banner.qai-api-error-warning {
      border-color: rgba(217, 119, 6, .32);
    }

    .qai-api-error-copy {
      min-width: 0;
      display: grid;
      gap: 4px;
      line-height: 1.4;
    }

    .qai-api-error-copy strong {
      font-size: 14px;
    }

    .qai-api-error-copy span {
      font-size: 13px;
    }

    .qai-api-error-copy small {
      margin-top: 2px;
      font-size: 11px;
      color: #6b7280;
    }

    .qai-api-error-banner button {
      flex: 0 0 auto;
      border: 0;
      background: transparent;
      color: #6b7280;
      font-size: 22px;
      line-height: 1;
      cursor: pointer;
      padding: 0 2px;
    }
  `]
})
export class ApiErrorBannerComponent {
  readonly errors = inject(ApiErrorService);
}
