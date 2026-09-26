import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';
import { AiWorkspaceContext, AiWorkspaceContextService } from './ai-workspace-context.service';

export type AiAdvisorContext = AiWorkspaceContext;

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
  readonly context = this.contextEngine.context;
  readonly suggestionApplied = new Subject<{ field?: string; value: string }>();

  constructor(
    private readonly api: ApiService,
    private readonly contextEngine: AiWorkspaceContextService
  ) {}

  setContext(context: Partial<AiAdvisorContext>): void {
    this.contextEngine.set(context);
  }

  patchContext(context: Partial<AiAdvisorContext>): void {
    this.contextEngine.patch(context);
  }

  setPage(page: string, section: string, values: Record<string, unknown> = {}): void {
    this.contextEngine.setPage(page, section, values);
  }

  setEntity(entityType: string, entityId: string | undefined, title: string, values: Record<string, unknown> = {}): void {
    this.contextEngine.setEntity(entityType, entityId, title, values);
  }

  clearContext(): void {
    this.contextEngine.clear();
  }

  applySuggestion(value: string, field?: string): void {
    this.suggestionApplied.next({ field, value });
  }

  runAgent(goal: string) {
    return this.api.post<any>('ai/agent', {
      goal,
      contextJson: JSON.stringify(this.contextEngine.snapshot())
    });
  }

  executeTool(name: string, input: unknown) {
    return this.api.post<any>(`ai/tools/${encodeURIComponent(name)}/execute`, JSON.stringify(input));
  }

  advise(message: string) {
    return this.api.post<AiAdvisorResponse>('ai/advisor/ask', {
      message,
      context: this.contextEngine.snapshot()
    });
  }

}
