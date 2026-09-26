import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';

export interface AiAdvisorContext {
  area?: string;
  section?: string;
  page?: string;
  entityType?: string;
  entityId?: string;
  title?: string;
  values?: Record<string, unknown>;
}

export interface AiAdvisorResponse {
  message: string;
  suggestions?: string[];
  nextAction?: string;
}

@Injectable({ providedIn: 'root' })
export class AiAdvisorService {
  private readonly contextState = signal<AiAdvisorContext>({});
  readonly context = this.contextState.asReadonly();

  constructor(private api: ApiService) {}

  setContext(context: AiAdvisorContext): void {
    this.contextState.set(context || {});
  }

  patchContext(context: AiAdvisorContext): void {
    this.contextState.update(current => ({ ...current, ...context }));
  }

  clearContext(): void {
    this.contextState.set({});
  }

  advise(message: string) {
    return this.api.post<AiAdvisorResponse>('ai/advisor/ask', {
      message,
      context: this.contextState()
    });
  }
}
