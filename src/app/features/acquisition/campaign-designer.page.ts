import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';

interface FlowNode {
  id: string;
  type: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  requiresApproval?: boolean;
  x: number;
  y: number;
  status?: string;
  error?: string | null;
  resultJson?: string;
  startedAtUtc?: string | null;
  completedAtUtc?: string | null;
}

interface PaletteItem {
  type: string;
  name: string;
  description: string;
  icon: string;
  config: Record<string, any>;
  requiresApproval?: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  templateUrl: './campaign-designer.page.html',
  styleUrls: ['./campaign-designer.page.css']
})
export class CampaignDesignerPage implements OnInit, OnDestroy {
  id = '';
  campaign: any;
  nodes: FlowNode[] = [];
  selected: FlowNode | null = null;
  loading = true;
  saving = false;
  error = '';
  message = '';
  paletteFilter = '';
  executionMode = false;
  private timer?: ReturnType<typeof setInterval>;

  readonly palette: PaletteItem[] = [
    { type: 'Discovery', name: 'Discover companies', description: 'Find companies with SerpAPI or another configured discovery provider.', icon: '⌕', config: { provider: 'serpapi', region: 'North Macedonia', keywords: ['logistics companies'], maxResults: 50 } },
    { type: 'Qualification', name: 'Qualify prospects', description: 'Score companies against ICP and intent rules.', icon: '✓', config: { minimumScore: 70, criteria: {}, intentSignals: [] } },
    { type: 'Enrichment', name: 'Enrich company intelligence', description: 'Collect company and buyer intelligence.', icon: '✦', config: { sources: ['website'], fields: ['company', 'size', 'website', 'buyer', 'signals'] } },
    { type: 'TargetList', name: 'Build target list', description: 'Put qualified prospects into the campaign target list.', icon: '◎', config: { minimumScore: 70, dynamic: true } },
    { type: 'Outreach', name: 'Prepare outreach', description: 'Prepare personalized outreach before approval.', icon: '✉', config: { channel: 'email', steps: [] } },
    { type: 'Approval', name: 'Human approval', description: 'Pause outreach until an authorized user approves it.', icon: '⚿', config: { required: true }, requiresApproval: true },
    { type: 'Delivery', name: 'Deliver outreach', description: 'Deliver only approved outreach while the campaign is running.', icon: '➤', config: { provider: '', dailyLimit: 10 } }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly data: AcquisitionService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.load();
    this.timer = setInterval(() => {
      if (this.campaign?.status === 2 || this.statusText(this.campaign?.status) === 'Running') this.refreshExecution();
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  get filteredPalette(): PaletteItem[] {
    const q = this.paletteFilter.trim().toLowerCase();
    return q ? this.palette.filter(x => (x.name + ' ' + x.type).toLowerCase().includes(q)) : this.palette;
  }

  get isRunning(): boolean {
    return this.statusText(this.campaign?.status) === 'Running';
  }

  get hasErrors(): boolean {
    return this.nodes.some(x => this.nodeStatus(x) === 'failed');
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.data.campaignDetail(this.id).subscribe({
      next: detail => {
        this.applyDetail(detail);
        this.loading = false;
      },
      error: e => {
        this.loading = false;
        this.error = e?.error?.detail || e?.error?.error || 'Campaign designer API returned ' + (e?.status || '') + '.';
      }
    });
  }

  refreshExecution(): void {
    this.data.campaignDetail(this.id).subscribe({
      next: detail => this.applyDetail(detail, true),
      error: () => undefined
    });
  }

  private applyDetail(detail: any, preserveSelection = false): void {
    this.campaign = detail.campaign;
    const plan = this.parsePlan();
    const oldId = preserveSelection ? this.selected?.id : null;
    const execution = new Map<string, any>((detail.tasks || []).map((task: any) => [this.taskKey(task), task]));
    this.nodes = this.readNodes(plan).map(node => {
      const task = execution.get(node.id) || execution.get(node.type);
      return {
        ...node,
        status: task?.status,
        error: task?.error || null,
        resultJson: task?.resultJson || '{}',
        startedAtUtc: task?.startedAtUtc,
        completedAtUtc: task?.completedAtUtc
      };
    });
    this.selected = (oldId && this.nodes.find(x => x.id === oldId)) || this.nodes[0] || null;
  }

  private taskKey(task: any): string {
    try {
      const cfg = JSON.parse(task?.configurationJson || '{}');
      return cfg?.input?.stageId || task?.type;
    } catch {
      return task?.type;
    }
  }

  select(node: FlowNode): void {
    this.selected = node;
    this.message = '';
    this.error = '';
  }

  addFromPalette(item: PaletteItem): void {
    const previous = this.nodes[this.nodes.length - 1];
    const node: FlowNode = {
      id: item.type.toLowerCase() + '-' + Date.now().toString(36),
      type: item.type,
      name: item.name,
      description: item.description,
      config: JSON.parse(JSON.stringify(item.config)),
      requiresApproval: item.requiresApproval,
      x: previous ? previous.x : 80,
      y: previous ? previous.y + 150 : 60
    };
    this.nodes = [...this.nodes, node];
    this.selected = node;
    this.message = 'Component added to the campaign flow.';
    this.error = '';
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const type = event.dataTransfer?.getData('application/x-campaign-node');
    const item = this.palette.find(x => x.type === type);
    if (item) this.addFromPalette(item);
  }

  allowDrop(event: DragEvent): void {
    event.preventDefault();
  }

  dragPalette(event: DragEvent, item: PaletteItem): void {
    event.dataTransfer?.setData('application/x-campaign-node', item.type);
  }

  removeSelected(): void {
    if (!this.selected) return;
    const id = this.selected.id;
    this.nodes = this.nodes.filter(x => x.id !== id);
    this.selected = this.nodes[0] || null;
  }

  moveSelected(direction: 'up' | 'down'): void {
    if (!this.selected) return;
    const index = this.nodes.findIndex(x => x.id === this.selected!.id);
    const next = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || next < 0 || next >= this.nodes.length) return;
    [this.nodes[index], this.nodes[next]] = [this.nodes[next], this.nodes[index]];
    this.nodes = [...this.nodes];
  }

  savePlan(): void {
    if (!this.nodes.length) return;
    this.saving = true;
    this.error = '';
    const stages = this.nodes.map((node, index) => ({
      id: node.id,
      type: node.type,
      name: node.name,
      description: node.description || '',
      config: node.config,
      requiresApproval: !!node.requiresApproval,
      order: index + 1
    }));
    const edges = this.nodes.slice(0, -1).map((node, index) => ({
      id: 'edge-' + node.id + '-' + this.nodes[index + 1].id,
      from: node.id,
      to: this.nodes[index + 1].id
    }));
    const plan = {
      ...(this.parsePlan() || {}),
      version: 2,
      nodes: this.nodes.map((node, index) => ({
        id: node.id, type: node.type, name: node.name,
        description: node.description || '', config: node.config,
        requiresApproval: !!node.requiresApproval, position: { x: 80, y: 60 + index * 150 }
      })),
      edges,
      stages
    };
    this.data.saveCampaignPlan(this.id, JSON.stringify(plan)).subscribe({
      next: result => {
        this.saving = false;
        this.campaign.planJson = result.planJson;
        this.message = 'Campaign flow saved. Runtime will rebuild the executable plan.';
      },
      error: e => {
        this.saving = false;
        this.error = e?.error?.detail || e?.error?.error || 'Campaign flow could not be saved.';
      }
    });
  }

  fieldEntries(): Array<{ key: string; label: string; kind: string; value: any }> {
    if (!this.selected) return [];
    const c = this.selected.config || {};
    return Object.keys(c).map(key => ({
      key,
      label: this.label(key),
      kind: Array.isArray(c[key]) ? 'array' : typeof c[key],
      value: c[key]
    }));
  }

  updateConfig(key: string, value: any): void {
    if (!this.selected) return;
    this.selected.config[key] = value;
  }

  updateArray(key: string, value: string): void {
    if (!this.selected) return;
    this.selected.config[key] = value.split(',').map(x => x.trim()).filter(Boolean);
  }

  label(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, x => x.toUpperCase());
  }

  statusText(value: any): string {
    return ['Draft', 'Scheduled', 'Running', 'Paused', 'Completed', 'Stopped'][Number(value)] || String(value ?? 'Unknown');
  }

  nodeStatus(node: FlowNode): string {
    const s = String(node.status ?? '').toLowerCase();
    if (s.includes('failed')) return 'failed';
    if (s.includes('running')) return 'running';
    if (s.includes('completed')) return 'completed';
    if (s.includes('waiting')) return 'waiting';
    if (s.includes('cancel')) return 'cancelled';
    return this.isRunning ? 'pending' : 'idle';
  }

  nodeIcon(node: FlowNode): string {
    const state = this.nodeStatus(node);
    if (state === 'failed') return '!';
    if (state === 'completed') return '✓';
    if (state === 'running') return '●';
    if (state === 'waiting') return '⚿';
    return this.palette.find(x => x.type.toLowerCase() === node.type.toLowerCase())?.icon || '○';
  }

  errorDetails(node: FlowNode): string {
    return node.error || 'No execution error recorded.';
  }

  formatDate(value?: string | null): string {
    return value ? new Date(value).toLocaleString() : '—';
  }

  parsePlan(): any {
    try { return JSON.parse(this.campaign?.planJson || '{}'); } catch { return {}; }
  }

  back(): void { void this.router.navigateByUrl('/campaigns'); }
}
