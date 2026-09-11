import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

type CmsSection = 'intro' | 'solutions' | 'kpis' | 'stories' | 'events' | 'locations';
type ItemType = Exclude<CmsSection, 'intro'>;

interface SiteContent {
  version: number;
  status: 'Draft' | 'Published' | string;
  updatedAtUtc?: string;
  companyIntro: string;
  solutions: Array<{ number: string; title: string; description: string }>;
  kpis: Array<{ value: string; title: string; description: string }>;
  stories: Array<{ title: string; description: string; location: string; url: string; imageUrl: string }>;
  events: Array<{ title: string; description: string; url: string }>;
  locations: Array<{ name: string; type: string; address: string; url: string }>;
}

const emptyContent = (): SiteContent => ({
  version: 1,
  status: 'Published',
  companyIntro: '',
  solutions: [],
  kpis: [],
  stories: [],
  events: [],
  locations: []
});

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './renova-content-admin.page.html',
  styleUrl: './renova-content-admin.page.css'
})
export class RenovaContentAdminPage implements OnInit {
  readonly sections: CmsSection[] = ['intro', 'solutions', 'kpis', 'stories', 'events', 'locations'];
  readonly sectionLabels: Record<CmsSection, string> = {
    intro: 'Company introduction',
    solutions: 'Solutions',
    kpis: 'Key figures',
    stories: 'Projects & stories',
    events: 'Events',
    locations: 'Locations'
  };

  section: CmsSection = 'intro';
  content: SiteContent = emptyContent();
  loading = true;
  saving = false;
  publishing = false;
  message = '';
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.message = '';
    this.error = '';
    this.api.get<SiteContent>('renova/catalog/site-content').subscribe({
      next: value => {
        this.content = { ...emptyContent(), ...(value || {}) };
        this.content.solutions = Array.isArray(value?.solutions) ? value.solutions : [];
        this.content.kpis = Array.isArray(value?.kpis) ? value.kpis : [];
        this.content.stories = Array.isArray(value?.stories) ? value.stories : [];
        this.content.events = Array.isArray(value?.events) ? value.events : [];
        this.content.locations = Array.isArray(value?.locations) ? value.locations : [];
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.error = error?.error?.detail || 'Unable to load Renova portal content.';
      }
    });
  }

  selectSection(section: CmsSection): void {
    this.section = section;
  }

  addItem(type: ItemType): void {
    const defaults: Record<ItemType, object> = {
      solutions: { number: String(this.content.solutions.length + 1), title: '', description: '' },
      kpis: { value: '', title: '', description: '' },
      stories: { title: '', description: '', location: '', url: '', imageUrl: '' },
      events: { title: '', description: '', url: '' },
      locations: { name: '', type: '', address: '', url: '' }
    };
    this.content[type].push(defaults[type] as never);
    this.markDraft();
  }

  removeItem(type: ItemType, index: number): void {
    this.content[type].splice(index, 1);
    if (type === 'solutions') {
      this.content.solutions.forEach((item, position) => item.number = String(position + 1));
    }
    this.markDraft();
  }

  markDraft(): void {
    if (!this.saving && !this.publishing) this.content.status = 'Draft';
    this.message = '';
  }

  saveDraft(): void {
    this.persist('Draft');
  }

  publish(): void {
    this.publishing = true;
    this.message = '';
    this.error = '';
    this.api.post<any>('renova/catalog/site-content/publish', {}).subscribe({
      next: value => {
        this.publishing = false;
        this.content = { ...this.content, ...(value || {}), status: 'Published' };
        this.message = 'Renova portal content published.';
      },
      error: error => {
        this.publishing = false;
        this.error = error?.error?.detail || 'Unable to publish Renova portal content.';
      }
    });
  }

  unpublish(): void {
    this.publishing = true;
    this.message = '';
    this.error = '';
    this.api.post<any>('renova/catalog/site-content/unpublish', {}).subscribe({
      next: value => {
        this.publishing = false;
        this.content = { ...this.content, ...(value || {}), status: 'Draft' };
        this.message = 'Renova portal content moved to draft.';
      },
      error: error => {
        this.publishing = false;
        this.error = error?.error?.detail || 'Unable to move Renova portal content to draft.';
      }
    });
  }

  private persist(status: 'Draft' | 'Published'): void {
    this.saving = true;
    this.message = '';
    this.error = '';
    const payload: SiteContent = { ...this.content, status };
    this.api.put<SiteContent>('renova/catalog/site-content', payload).subscribe({
      next: value => {
        this.saving = false;
        this.content = { ...payload, ...(value || {}), status };
        this.message = status === 'Published' ? 'Renova portal content saved and published.' : 'Draft saved. Publish when ready.';
      },
      error: error => {
        this.saving = false;
        this.error = error?.error?.detail || 'Unable to save Renova portal content.';
      }
    });
  }

  trackByIndex(index: number): number {
    return index;
  }
}
