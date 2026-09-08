export const ModuleCodes = {
  crm: 'crm',
  goldenPipeline: 'golden_pipeline',
  aiAgents: 'ai',
  knowledge: 'knowledge',
  automation: 'automation',
  integrations: 'integrations',
  analytics: 'analytics',
  inbox: 'inbox',
  ticketing: 'ticketing',
  billing: 'billing',
  settings: 'settings'
} as const;

export type ModuleCode = typeof ModuleCodes[keyof typeof ModuleCodes];

const aliases: Record<string, ModuleCode> = {
  agents: ModuleCodes.aiAgents,
  ai_agents: ModuleCodes.aiAgents,
  automations: ModuleCodes.automation,
  workflows: ModuleCodes.automation
};

export function normalizeModuleCode(code: string): string {
  const normalized = code.trim().toLowerCase();
  return aliases[normalized] ?? normalized;
}
