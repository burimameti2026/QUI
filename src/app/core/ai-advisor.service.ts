import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';

export interface AiAdvisorContext {
  area?: string;
  section?: string;
  page?: string;
  entityType?: string;
  entityId?: string;
  title?: string;
  values?: Record<string, unknown>;
  routePath?: string;
  url?: string;
}

export interface AiAdvisorResponse {
  message: string;
  suggestions?: string[];
  nextAction?: string;
  field?: string;
  tool?: string;
  toolResult?: string;
  toolInput?: string;
  requiresApproval?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AiAdvisorService {
  private readonly contextState = signal<AiAdvisorContext>({});
  readonly context = this.contextState.asReadonly();
  readonly suggestionApplied = new Subject<{ field?: string; value: string }>();

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

  applySuggestion(value: string, field?: string): void { this.suggestionApplied.next({ field, value }); }

  runAgent(goal: string) {
    return this.api.post<any>('ai/agent', { goal, contextJson: JSON.stringify(this.contextState()) });
  }

  executeTool(name: string, input: unknown) {
    return this.api.post<any>(`ai/tools/${encodeURIComponent(name)}/execute`, JSON.stringify(input));
  }

  advise(message: string) {
    return this.api.post<AiAdvisorResponse>('ai/advisor/ask', {
      message,
      context: this.contextState()
    });
  }
}
