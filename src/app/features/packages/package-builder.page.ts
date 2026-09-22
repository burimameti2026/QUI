import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AcquisitionService } from '../acquisition/acquisition.service';

interface PackageBlock {
  id: string;
  type: 'hero' | 'features' | 'benefits' | 'how-it-works' | 'pricing' | 'cta';
  title: string;
  visible: boolean;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './package-builder.page.html',
  styleUrls: ['./package-builder.page.css']
})
export class PackageBuilderPage {
  prompt = '';
  saved = false;
  selectedId = 'hero';
  aiWorking = false;
  aiMessage = 'Tell me what you are selling. I will turn it into a customer-ready offer and preview.';
  packageName = '';
  headline = '';
  subheadline = '';
  price = '';
  billing = 'month';
  audience = '';
  features: string[] = [];
  blocks: PackageBlock[] = [
    { id: 'hero', type: 'hero', title: 'Hero', visible: true },
    { id: 'features', type: 'features', title: 'Features', visible: true },
    { id: 'benefits', type: 'benefits', title: 'Business benefits', visible: true },
    { id: 'how-it-works', type: 'how-it-works', title: 'How it works', visible: true },
    { id: 'pricing', type: 'pricing', title: 'Pricing', visible: true },
    { id: 'cta', type: 'cta', title: 'Call to action', visible: true }
  ];

  constructor(private router: Router, private acquisition: AcquisitionService) {}

  buildWithAi(): void {
    const text = this.prompt.trim();
    if (!text) return;
    this.aiWorking = true;
    this.saved = false;
    this.aiMessage = 'AI is understanding the offer and preparing a customer-ready structure…';

    this.acquisition.buildWorkspacePackage(text).subscribe({
      next: (result) => {
        this.packageName = result.name || 'New Package';
        this.headline = result.headline || '';
        this.subheadline = result.subheadline || '';
        this.price = result.price || '';
        this.billing = result.billing || 'month';
        this.audience = result.audience || '';
        this.features = result.features || [];
        this.blocks = (result.sections || []).map((title: string, index: number) => ({
          id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + index,
          type: this.sectionType(title),
          title,
          visible: true
        }));
        this.selectedId = this.blocks[0]?.id || 'hero';
        this.aiMessage = 'I built the first version from your business context. Review the preview, change anything you want, or ask AI to refine it.';
        this.aiWorking = false;
      },
      error: (err) => {
        this.aiWorking = false;
        this.aiMessage = err?.error?.detail || 'AI could not build the offer right now.';
      }
    });
  }

  sectionType(title: string): PackageBlock['type'] {
    const value = title.toLowerCase();
    if (value.includes('feature')) return 'features';
    if (value.includes('benefit')) return 'benefits';
    if (value.includes('how')) return 'how-it-works';
    if (value.includes('pricing')) return 'pricing';
    if (value.includes('call') || value.includes('action')) return 'cta';
    return 'hero';
  }

  askAi(text: string): void {
    this.prompt = text;
    this.buildWithAi();
  }

  select(id: string): void {
    this.selectedId = id;
  }

  toggle(id: string): void {
    const block = this.blocks.find(x => x.id === id);
    if (block) block.visible = !block.visible;
    if (block?.visible === false && this.selectedId === id) {
      this.selectedId = this.blocks.find(x => x.visible)?.id || 'hero';
    }
  }

  addBlock(type: PackageBlock['type']): void {
    const labels: Record<PackageBlock['type'], string> = {
      hero: 'Hero',
      features: 'Features',
      benefits: 'Business benefits',
      'how-it-works': 'How it works',
      pricing: 'Pricing',
      cta: 'Call to action'
    };
    const id = type + '-' + Date.now();
    this.blocks.push({ id, type, title: labels[type], visible: true });
    this.selectedId = id;
  }

  dragStart(event: DragEvent, id: string): void {
    event.dataTransfer?.setData('text/plain', id);
  }

  drop(event: DragEvent, targetId: string): void {
    event.preventDefault();
    const sourceId = event.dataTransfer?.getData('text/plain');
    if (!sourceId || sourceId === targetId) return;
    const source = this.blocks.find(x => x.id === sourceId);
    const targetIndex = this.blocks.findIndex(x => x.id === targetId);
    if (!source || targetIndex < 0) return;
    this.blocks = this.blocks.filter(x => x.id !== sourceId);
    this.blocks.splice(targetIndex, 0, source);
  }

  dragOver(event: DragEvent): void {
    event.preventDefault();
  }

  editSelected(value: string): void {
    if (this.selectedId === 'hero') this.headline = value;
    if (this.selectedId === 'features') this.subheadline = value;
  }

  save(): void {
    this.saved = true;
    this.aiMessage = 'Saved. Next I would connect this offer to ICP, Prospecting and Qualification so the system can tell you who matches it.';
  }

  continueToIcp(): void {
    this.save();
    void this.router.navigateByUrl('/acquisition/icp');
  }
}
