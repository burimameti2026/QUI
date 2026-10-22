import { Injectable } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../core/api.service';

const BINDING_NODE_KEY = '__orchestration_binding__';
type WorkflowBinding = {
  campaignId: string | null;
  pipelineId: string | null;
  automationRuleIds: string[];
  containerIds: string[];
  trigger: string;
  active: boolean;
};

@Injectable({ providedIn: 'root' })
export class WorkflowsService {
  constructor(private api: ApiService) {}

  list() { return this.api.get<any[]>('workflows'); }
  create(x: any) { return this.api.post<any>('workflows', x); }

  private rawDesigner(id: string) {
    return this.api.get<any>(`workflows/${id}/designer`);
  }

  designer(id: string) {
    return this.rawDesigner(id).pipe(map((result) => ({
      ...result,
      nodes: (result.nodes || []).filter((node: any) => node.nodeKey !== BINDING_NODE_KEY),
      edges: (result.edges || []).filter((edge: any) =>
        edge.fromNodeKey !== BINDING_NODE_KEY && edge.toNodeKey !== BINDING_NODE_KEY)
    })));
  }

  saveDesigner(id: string, value: any) {
    return this.rawDesigner(id).pipe(
      switchMap((current) => {
        const bindingNode = (current.nodes || []).find((node: any) => node.nodeKey === BINDING_NODE_KEY);
        const visibleNodes = (value.nodes || []).filter((node: any) => node.nodeKey !== BINDING_NODE_KEY);
        const nodes = bindingNode ? [...visibleNodes, bindingNode] : visibleNodes;
        const edges = (value.edges || []).filter((edge: any) =>
          edge.fromNodeKey !== BINDING_NODE_KEY && edge.toNodeKey !== BINDING_NODE_KEY);
        return this.api.put<any>(`workflows/${id}/designer`, { nodes, edges });
      })
    );
  }

  orchestration(id: string) {
    return this.rawDesigner(id).pipe(map((result) => {
      const node = (result.nodes || []).find((x: any) => x.nodeKey === BINDING_NODE_KEY);
      let binding: WorkflowBinding = {
        campaignId: null, pipelineId: null, automationRuleIds: [], containerIds: [],
        trigger: 'manual', active: false
      };
      if (node?.configJson) {
        try { binding = { ...binding, ...JSON.parse(node.configJson) }; } catch { /* ignore malformed legacy config */ }
      }
      return {
        ...binding,
        campaign: binding.campaignId ? { id: binding.campaignId } : null,
        pipeline: binding.pipelineId ? { id: binding.pipelineId } : null,
        automations: binding.automationRuleIds.map((id) => ({ id })),
        containers: binding.containerIds.map((id) => ({ id }))
      };
    }));
  }

  bindOrchestration(id: string, input: WorkflowBinding) {
    return this.rawDesigner(id).pipe(switchMap((current) => {
      const visibleNodes = (current.nodes || []).filter((node: any) => node.nodeKey !== BINDING_NODE_KEY);
      const visibleEdges = (current.edges || []).filter((edge: any) =>
        edge.fromNodeKey !== BINDING_NODE_KEY && edge.toNodeKey !== BINDING_NODE_KEY);
      const existing = (current.nodes || []).find((node: any) => node.nodeKey === BINDING_NODE_KEY);
      const bindingNode = {
        id: existing?.id || crypto.randomUUID(),
        flowId: id,
        nodeKey: BINDING_NODE_KEY,
        type: 'orchestration-binding',
        configJson: JSON.stringify({
          campaignId: input.campaignId || null,
          pipelineId: input.pipelineId || null,
          automationRuleIds: [...new Set(input.automationRuleIds || [])],
          containerIds: [...new Set(input.containerIds || [])],
          trigger: input.trigger || 'manual',
          active: input.active !== false
        }),
        x: existing?.x ?? -10000,
        y: existing?.y ?? -10000
      };
      return this.api.put<any>(`workflows/${id}/designer`, {
        nodes: [...visibleNodes, bindingNode],
        edges: visibleEdges
      }).pipe(map(() => ({
        ...input,
        campaign: input.campaignId ? { id: input.campaignId } : null,
        pipeline: input.pipelineId ? { id: input.pipelineId } : null,
        automations: (input.automationRuleIds || []).map((ruleId) => ({ id: ruleId })),
        containers: (input.containerIds || []).map((containerId) => ({ id: containerId }))
      })));
    }));
  }

  run(id: string) {
    return this.orchestration(id).pipe(switchMap((binding: any) => {
      if (!binding.active) {
        return of({ startedContainers: [], automations: [], detail: 'Save and activate orchestration bindings before running.' });
      }
      const campaignId = binding.campaignId;
      const containerCalls = campaignId
        ? (binding.containerIds || []).map((containerId: string) =>
            this.api.post<any>(`acquisition/campaigns/${campaignId}/containers/${containerId}/start`, {}))
        : [];
      const automationCalls = (binding.automationRuleIds || []).map((ruleId: string) =>
        this.api.post<any>(`automations/${ruleId}/run`, {}));
      return forkJoin({
        containers: containerCalls.length ? forkJoin(containerCalls) : of([]),
        automations: automationCalls.length ? forkJoin(automationCalls) : of([])
      }).pipe(map((result) => ({
        startedContainers: result.containers,
        automations: result.automations
      })));
    }));
  }

  resources() {
    return forkJoin({
      campaigns: this.api.get<any[]>('acquisition/campaigns'),
      pipelines: this.api.get<any>('sales/pipelines'),
      automations: this.api.get<any[]>('automations')
    });
  }

  containers(campaignId: string) {
    return this.api.get<any[]>(`acquisition/campaigns/${campaignId}/containers`);
  }
}