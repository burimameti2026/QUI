import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  buildWithAi(): void {
    const text = this.prompt.trim();
    if (!text) return;
    this.aiWorking = true;
    this.saved = false;
    this.aiMessage = 'Understanding the offer, target customer and positioning…';

    setTimeout(() => {
      const lower = text.toLowerCase();
      const fusion = lower.includes('fusionfleet') || lower.includes('fleet') || lower.includes('logistics') || lower.includes('transport');

      if (fusion) {
        this.packageName = 'FusionFleet OPS';
        this.headline = 'Run your transport operation from one place.';
        this.subheadline = 'Orders, fleet, drivers, tracking and operational visibility in one platform.';
        this.price = '299';
        this.billing = 'month';
        this.audience = 'Logistics and transport companies · 10–500 employees';
        this.features = ['Transport orders', 'Live shipment tracking', 'Fleet management', 'Driver management', 'Operational analytics', 'Customer communication'];
        this.aiMessage = 'I built a first FusionFleet OPS offer. I also identified the main ICP and prepared a customer-facing structure. Review it, change anything you want, then save it.';
      } else {
        const name = text.split(/\s+/).slice(0, 4).join(' ');
        this.packageName = name || 'New Package';
        this.headline = text;
        this.subheadline = 'A customer-ready offer generated from your business description.';
        this.price = '';
        this.audience = 'Define the target customer';
        this.features = ['Core capability', 'Business outcome', 'Operational visibility'];
        this.aiMessage = 'I created a first structure from your description. Tell me what to change — audience, positioning, pricing, sections or wording — and I will adapt the preview.';
      }

      this.aiWorking = false;
      this.selectedId = 'hero';
    }, 450);
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
