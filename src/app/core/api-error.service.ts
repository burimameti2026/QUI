import { Injectable, signal } from '@angular/core';

export type ApiErrorKind = 'info' | 'warning' | 'error';

export interface ApiErrorNotice {
  title: string;
  message: string;
  status?: number;
  code?: string;
  traceId?: string;
  kind: ApiErrorKind;
}

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  readonly notice = signal<ApiErrorNotice | null>(null);

  show(error: unknown): void {
    const response = this.toResponse(error);
    if (!response) return;

    const status = response.status;
    const body = response.error as Record<string, unknown> | null | undefined;
    const message = this.extractMessage(body, status);

    this.notice.set({
      title: this.titleFor(status),
      message,
      status,
      code: this.stringValue(body?.['code']),
      traceId: this.stringValue(body?.['traceId']),
      kind: status === 403 || status === 409 || status === 422 ? 'warning' : 'error'
    });
  }

  clear(): void {
    this.notice.set(null);
  }

  private toResponse(error: unknown): { status: number; error: unknown } | null {
    if (!error || typeof error !== 'object') return null;
    const candidate = error as { status?: unknown; error?: unknown };
    return typeof candidate.status === 'number'
      ? { status: candidate.status, error: candidate.error }
      : null;
  }

  private extractMessage(body: Record<string, unknown> | null | undefined, status?: number): string {
    const detail = this.stringValue(body?.['detail']);
    if (detail) return detail;

    const message = this.stringValue(body?.['message']);
    if (message) return message;

    const title = this.stringValue(body?.['title']);
    if (title) return title;

    const errors = body?.['errors'];
    if (errors && typeof errors === 'object') {
      const values = Object.values(errors as Record<string, unknown>)
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter(value => typeof value === 'string')
        .map(value => value as string);
      if (values.length) return values.join(' ');
    }

    switch (status) {
      case 400: return 'The request could not be processed. Check the entered values.';
      case 401: return 'Your session has expired. Please sign in again.';
      case 403: return 'You are not allowed to perform this action.';
      case 404: return 'The requested resource was not found.';
      case 409: return 'This action cannot be completed in the current state.';
      case 422: return 'The request contains values that cannot be processed.';
      default: return 'Something went wrong while processing the request.';
    }
  }

  private titleFor(status?: number): string {
    switch (status) {
      case 400:
      case 422: return 'Check your request';
      case 401: return 'Session expired';
      case 403: return 'Action not allowed';
      case 404: return 'Not found';
      case 409: return 'Action cannot be completed';
      default: return 'Request failed';
    }
  }

  private stringValue(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value : undefined;
  }
}
