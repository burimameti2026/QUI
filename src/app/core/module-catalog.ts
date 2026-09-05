export const ModuleCodes = {
  crm: 'crm',
  goldenPipeline: 'golden_pipeline',
  aiAgents: 'ai_agents',
  knowledge: 'knowledge',
  workflows: 'workflows',
  automations: 'automations',
  integrations: 'integrations',
  analytics: 'analytics',
  inbox: 'inbox',
  ticketing: 'ticketing',
  billing: 'billing',
  settings: 'settings'
} as const;

export type ModuleCode = typeof ModuleCodes[keyof typeof ModuleCodes];

const aliases: Record<string, ModuleCode> = {
  ai: ModuleCodes.aiAgents,
  agents: ModuleCodes.aiAgents,
  automation: ModuleCodes.automations,
  workflows: ModuleCodes.workflows
};

export function normalizeModuleCode(code: string): string {
  const normalized = code.trim().toLowerCase();
  return aliases[normalized] ?? normalized;
}
