export type UiPageComponentType =
  | 'header' | 'steps' | 'metrics' | 'card' | 'list-card' | 'table-card' | 'grid' | 'text' | 'button';

export type UiTemplateId =
  | 'header-01' | 'header-02' | 'steps-01'
  | 'kpi-01' | 'kpi-02' | 'kpi-03' | 'kpi-04'
  | 'card-01' | 'card-02' | 'card-03' | 'card-04'
  | 'list-01' | 'grid-01' | 'grid-02' | 'table-01' | 'text-01' | 'text-02'
  | 'button-01' | 'button-02' | 'button-03' | 'button-04';

export interface UiBinding { source: string; fallback?: string | number; }

export interface UiPageAction {
  id?: string;
  label: string;
  route?: string;
  command?: string;
  variant?: 'primary' | 'secondary' | 'quiet';
}
export interface UiPageComponentConfig {
  id: string;
  type: UiPageComponentType;
  template: UiTemplateId;
  title?: string;
  subtitle?: string;
  badge?: string;
  columns?: 1 | 2 | 3 | 4 | 5;
  data?: Record<string, unknown>;
  bindings?: Record<string, UiBinding>;
  actions?: UiPageAction[];
  children?: UiPageComponentConfig[];
}
export interface UiPageSectionConfig {
  id: string;
  title?: string;
  subtitle?: string;
  columns?: 1 | 2 | 3 | 4 | 5;
  collapsed?: boolean;
  components: UiPageComponentConfig[];
}
export interface UiBreadcrumb { label: string; route?: string; }

export interface UiPageConfig {
  id: string;
  name: string;
  shell: { header: boolean; breadcrumb?: boolean };
  breadcrumb?: UiBreadcrumb[];
  header?: { title?: string; subtitle?: string; actions?: UiPageAction[]; template?: "header-01" | "header-02" };
  sections: UiPageSectionConfig[];
}

export const UI_COMPONENT_REGISTRY: Record<UiPageComponentType, {
  templates: UiTemplateId[];
  configurable: string[];
}> = {
  header: { templates: ['header-01', 'header-02'], configurable: ['title', 'subtitle', 'actions'] },
  steps: { templates: ['steps-01'], configurable: ['title', 'subtitle', 'badge', 'steps'] },
  metrics: { templates: ['kpi-01', 'kpi-02', 'kpi-03', 'kpi-04'], configurable: ['items', 'bindings', 'actions'] },
  card: { templates: ['card-01', 'card-02', 'card-03', 'card-04'], configurable: ['title', 'subtitle', 'badge', 'rows', 'text', 'actions', 'bindings'] },
  'list-card': { templates: ['list-01'], configurable: ['title', 'items', 'actions', 'bindings'] },
  'table-card': { templates: ['table-01'], configurable: ['title', 'columns', 'rows', 'actions', 'bindings'] },
  grid: { templates: ['grid-01', 'grid-02'], configurable: ['columns', 'children'] },
  text: { templates: ['text-01', 'text-02'], configurable: ['title', 'text'] },
  button: { templates: ['button-01', 'button-02', 'button-03', 'button-04'], configurable: ['label', 'route', 'command', 'variant'] }
};

export const DEFAULT_DASHBOARD_PAGE_CONFIG: UiPageConfig = {
  id: 'dashboard',
  name: 'Acquisition command center',
  shell: { header: true, breadcrumb: true },
  breadcrumb: [
    { label: 'Home', route: '/dashboard' },
    { label: 'Command Center' },
    { label: 'Dashboard' }
  ],
  header: {
    template: 'header-02',
    title: 'Acquisition command center',
    subtitle: 'Build, qualify and route demand through one operating picture.',
    actions: [
      { id: 'refresh', label: 'Refresh data', command: 'refresh', variant: 'secondary' },
      { id: 'promotion', label: 'Open promotion plan', route: '/renova/promotion', variant: 'primary' }
    ]
  },
  sections: [
    { id: 'workflow', columns: 1, components: [{ id: 'workflow-steps', type: 'steps', template: 'steps-01', title: 'Build an evidence-backed target market' }] },
    { id: 'operating-picture', columns: 1, components: [{ id: 'operating-picture', type: 'card', template: 'card-01', title: 'One operating picture for the full acquisition loop.' }] },
    { id: 'kpis', columns: 5, components: [{ id: 'operating-kpis', type: 'metrics', template: 'kpi-01' }] },
    { id: 'operations', columns: 2, components: [
      { id: 'acquisition-engine', type: 'card', template: 'card-02', title: 'Acquisition engine' },
      { id: 'active-outreach', type: 'card', template: 'card-03', title: 'Active outreach' }
    ]},
    { id: 'programs', columns: 2, components: [
      { id: 'program-table', type: 'table-card', template: 'table-01', title: 'Current programs' },
      { id: 'public-experience', type: 'list-card', template: 'list-01', title: 'Public product experience' }
    ]},
    { id: 'handoff', columns: 2, components: [
      { id: 'human-review', type: 'card', template: 'card-04', title: 'Human review' },
      { id: 'fusionfleet-handoff', type: 'card', template: 'card-04', title: 'Qualified demand → FusionFleet' }
    ]}
  ]
};
