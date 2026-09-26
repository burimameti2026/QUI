import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PageHeader } from '../../shared/ui';
import { AcquisitionService } from './acquisition.service';

interface Stage {
  id: string;
  type: string;
  name: string;
  description?: string;
  config: Record<string, any>;
  requiresApproval?: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  templateUrl: './campaign-designer.page.html',
  styleUrls: ['./campaign-designer.page.css']
})
export class CampaignDesignerPage implements OnInit {
  id = '';
  campaign: any;
  stages: Stage[] = [];
  selected: Stage | null = null;
  configText = '{}';
  loading = true;
  saving = false;
  error = '';
  message = '';

  private readonly defaults: Stage[] = [
    { id: 'discovery', type: 'Discovery', name: 'Discover companies', description: 'Find companies and prospects using the configured discovery provider.', config: { provider: 'serpapi', region: 'North Macedonia', keywords: [], maxResults: 50 } },
    { id: 'qualification', type: 'Qualification', name: 'Qualify prospects', description: 'Score prospects against the campaign ICP and qualification rules.', config: { minimumScore: 70, criteria: {}, intentSignals: [] } },
    { id: 'enrichment', type: 'Enrichment', name: 'Enrich company intelligence', description: 'Add company and contact intelligence before targeting.', config: { sources: [], fields: [] } },
    { id: 'target-list', type: 'TargetList', name: 'Build target list', description: 'Attach qualified prospects to the campaign target list.', config: { minimumScore: 70, dynamic: true } },
    { id: 'outreach', type: 'Outreach', name: 'Prepare outreach', description: 'Build personalized outreach messages from the campaign plan.', config: { channel: 'email', steps: [] } },
    { id: 'approval', type: 'Approval', name: 'Human approval', description: 'Hold prepared outreach until an authorized user approves it.', config: { required: true }, requiresApproval: true },
    { id: 'delivery', type: 'Delivery', name: 'Deliver outreach', description: 'Send only approved messages while the campaign is running.', config: { provider: '', dailyLimit: 10 } }
  ];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly data: AcquisitionService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.data.campaignDetail(this.id).subscribe({
      next: detail => {
        this.campaign = detail.campaign;
        this.stages = this.readStages(detail.campaign?.planJson);
        this.selected = this.stages[0] || null;
        this.syncEditor();
        this.loading = false;
      },
      error: e => {
        this.loading = false;
        this.error = e?.error?.detail || e?.error?.error ||
          'Campaign designer API returned ' + (e?.status || '') + '.';
      }
    });
  }

  select(stage: Stage): void {
    this.selected = stage;
    this.syncEditor();
    this.message = '';
    this.error = '';
  }

  syncEditor(): void {
    this.configText = JSON.stringify(this.selected?.config || {}, null, 2);
  }

  saveStage(): void {
    if (!this.selected) return;

    try {
      const parsed = JSON.parse(this.configText);
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        throw new Error();
      }

      this.selected.config = parsed;
      this.savePlan();
    } catch {
      this.error = 'Stage configuration must be a valid JSON object.';
    }
  }

  savePlan(): void {
    if (!this.selected) return;

    this.saving = true;
    this.error = '';

    const plan = {
      ...(this.parseCampaignPlan() || {}),
      stages: this.stages.map(stage => ({
        id: stage.id,
        type: stage.type,
        name: stage.name,
        description: stage.description || '',
        config: stage.config,
        requiresApproval: !!stage.requiresApproval
      }))
    };

    this.data.saveCampaignPlan(this.id, JSON.stringify(plan)).subscribe({
      next: result => {
        this.saving = false;
        this.campaign.planJson = result.planJson;
        this.message = 'Campaign plan saved. Runtime will read this campaign definition.';
      },
      error: e => {
        this.saving = false;
        this.error = e?.error?.detail || e?.error?.error ||
          'Campaign plan could not be saved.';
      }
    });
  }

  updateStageName(value: string): void {
    if (this.selected) this.selected.name = value;
  }

  icon(type: string): string {
    switch (type.toLowerCase()) {
      case 'discovery': return '⌕';
      case 'qualification': return '✓';
      case 'enrichment': return '✦';
      case 'targetlist': return '◎';
      case 'outreach': return '✉';
      case 'approval': return '⚿';
      case 'delivery': return '➤';
      default: return '◇';
    }
  }

  back(): void {
    void this.router.navigateByUrl('/campaigns');
  }

  parseCampaignPlan(): any {
    try {
      return JSON.parse(this.campaign?.planJson || '{}');
    } catch {
      return {};
    }
  }

  private readStages(json: string | null | undefined): Stage[] {
    try {
      const plan = JSON.parse(json || '{}');

      if (Array.isArray(plan.stages) && plan.stages.length) {
        return plan.stages.map((stage: any, index: number) => ({
          id: stage.id || 'stage-' + (index + 1),
          type: stage.type || 'Custom',
          name: stage.name || 'Step ' + (index + 1),
          description: stage.description || '',
          config: stage.config && typeof stage.config === 'object' ? stage.config : {},
          requiresApproval: !!stage.requiresApproval
        }));
      }
    } catch {
      // Fall back to the standard campaign workflow.
    }

    return this.defaults.map(stage => ({
      ...stage,
      config: { ...stage.config }
    }));
  }
}
