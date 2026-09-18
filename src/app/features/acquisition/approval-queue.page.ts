import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AcquisitionService } from './acquisition.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: './approval-queue.page.html',
  styleUrl: './approval-queue.page.css'
})
export class ApprovalQueuePage implements OnInit {
  private readonly data = inject(AcquisitionService);
  query = '';
  filter: 'all' | 'pending' | 'requested' | 'processed' = 'all';
  messages: any[] = [];
  loading = false;
  error = '';
  notice = '';

  get pending() { return this.messages.filter(x => String(x.status).toLowerCase() === 'queued' && !x.approvalRequested).length; }
  get requested() { return this.messages.filter(x => x.approvalRequested).length; }
  get safeDemo() { return this.messages.length > 0 && this.messages.every(x => String(x.email || '').endsWith('.test')); }
  get approved() { return this.messages.filter(x => String(x.status).toLowerCase() === 'sent' || String(x.status).toLowerCase() === 'delivered').length; }
  get failed() { return this.messages.filter(x => ['failed', 'bounced', 'rejected'].includes(String(x.status).toLowerCase())).length; }
  get visibleMessages() {
    const q = this.query.trim().toLowerCase();
    return this.messages.filter(x => {
      const status = String(x.status || '').toLowerCase();
      const filterOk =
        this.filter === 'all' ||
        (this.filter === 'pending' && !x.approvalRequested && status === 'queued') ||
        (this.filter === 'requested' && !!x.approvalRequested) ||
        (this.filter === 'processed' && ['sent', 'delivered', 'failed', 'bounced', 'rejected'].includes(status));
      const text = [x.prospect, x.contactName, x.email, x.campaign, x.subject, x.body, status].filter(Boolean).join(' ').toLowerCase();
      return filterOk && (!q || text.includes(q));
    });
  }
  setFilter(filter: 'all' | 'pending' | 'requested' | 'processed') {
    this.filter = filter;
  }
  isProcessed(message: any) {
    return ['sent', 'delivered'].includes(String(message?.status || '').toLowerCase());
  }

  ngOnInit(): void { void this.load(); }

  async load() {
    this.loading = true; this.error = ''; this.notice = '';
    try { this.messages = await firstValueFrom(this.data.messages()) || []; }
    catch (error: any) { this.error = error?.error?.detail || 'Could not load the acquisition approval queue.'; }
    finally { this.loading = false; }
  }

  async requestApproval(message: any) {
    try {
      await firstValueFrom(this.data.requestApproval(message.id));
      this.notice = 'Approval task created. Review is now recorded for this outreach message.';
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'Could not request approval.'; }
  }

  async approveAndSend(message: any) {
    try {
      await firstValueFrom(this.data.approveAndSend(message.id));
      this.notice = 'Approval was recorded and the delivery service was invoked. Any provider or safety gate remains enforced by the backend.';
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'The message could not be sent. Backend safety controls may have blocked delivery.'; }
  }

  statusLabel(message: any): string {
    if (message.approvalRequested) return 'Awaiting approval';
    return String(message.status || 'unknown').replaceAll('_', ' ');
  }
}
