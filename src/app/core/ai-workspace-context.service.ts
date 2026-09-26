import { Injectable, signal } from '@angular/core';

export interface AiWorkspaceContext {
  version: 1;
  workspace: 'LeadsAI';
  area?: string;
  section?: string;
  page?: string;
  entityType?: string;
  entityId?: string;
  title?: string;
  routePath?: string;
  url?: string;
  values: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class AiWorkspaceContextService {
  private readonly state = signal<AiWorkspaceContext>({
    version: 1,
    workspace: 'LeadsAI',
    values: {}
  });

  readonly context = this.state.asReadonly();

  set(context: Partial<AiWorkspaceContext>): void {
    this.state.set(this.normalize({
      ...this.state(),
      ...context,
      values: { ...this.state().values, ...(context.values || {}) }
    }));
  }

  patch(context: Partial<AiWorkspaceContext>): void {
    this.set(context);
  }

  setPage(page: string, section: string, values: Record<string, unknown> = {}): void {
    this.patch({ page, section, values });
  }

  setEntity(entityType: string, entityId: string | undefined, title: string, values: Record<string, unknown> = {}): void {
    this.patch({ entityType, entityId, title, values });
  }

  clear(): void {
    this.state.set({ version: 1, workspace: 'LeadsAI', values: {} });
  }

  snapshot(): AiWorkspaceContext {
    return this.normalize(this.state());
  }

  private normalize(context: AiWorkspaceContext): AiWorkspaceContext {
    const values = this.sanitize(context.values);
    return {
      ...context,
      values,
      workspace: 'LeadsAI',
      version: 1
    };
  }

  private sanitize(value: unknown): any {
    if (Array.isArray(value)) return value.map(item => this.sanitize(item));
    if (value && typeof value === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        if (/^tenant(id)?$/i.test(key)) continue;
        result[key] = this.sanitize(item);
      }
      return result;
    }
    return value;
  }
}
