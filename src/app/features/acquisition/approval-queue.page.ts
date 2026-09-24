import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AcquisitionService } from './acquisition.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
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

  get pending() { return this.messages.filter(x => this.messageStatus(x) === 'Queued' && !x.approvalRequested).length; }
  get requested() { return this.messages.filter(x => x.approvalRequested).length; }
  get safeDemo() { return this.messages.length > 0 && this.messages.every(x => String(x.email || '').endsWith('.test')); }
  get approved() { return this.messages.filter(x => ['Sent', 'Delivered'].includes(this.messageStatus(x))).length; }
  get failed() { return ['Failed', 'Suppressed'].filter(status => this.messages.some(x => this.messageStatus(x) === status)).length ? this.messages.filter(x => ['Failed', 'Suppressed'].includes(this.messageStatus(x))).length : 0; }
  get visibleMessages() {
    const q = this.query.trim().toLowerCase();
    return this.messages.filter(x => {
      const status = this.messageStatus(x);
      const filterOk =
        this.filter === 'all' ||
        (this.filter === 'pending' && !x.approvalRequested && status === 'Queued') ||
        (this.filter === 'requested' && !!x.approvalRequested) ||
        (this.filter === 'processed' && ['Sent', 'Delivered', 'Failed', 'Suppressed'].includes(status));
      const text = [x.prospect, x.contactName, x.email, x.campaign, x.subject, x.body, status].filter(Boolean).join(' ').toLowerCase();
      return filterOk && (!q || text.includes(q));
    });
  }
  setFilter(filter: 'all' | 'pending' | 'requested' | 'processed') {
    this.filter = filter;
  }
  isProcessed(message: any) {
    return ['Sent', 'Delivered', 'Failed', 'Suppressed'].includes(this.messageStatus(message));
  }

  messageStatus(message: any): string {
    const value = message?.status;
    if (value === 0 || String(value).toLowerCase() === 'queued') return 'Queued';
    if (value === 1 || String(value).toLowerCase() === 'sent') return 'Sent';
    if (value === 2 || String(value).toLowerCase() === 'delivered') return 'Delivered';
    if (value === 3 || String(value).toLowerCase() === 'replied') return 'Replied';
    if (value === 4 || String(value).toLowerCase() === 'failed') return 'Failed';
    if (value === 5 || String(value).toLowerCase() === 'suppressed') return 'Suppressed';
    return String(value ?? 'Unknown'); 
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

  async reject(message: any) {
    try {
      await firstValueFrom(this.data.rejectApproval(message.id));
      this.notice = 'Message rejected. It will not be sent.';
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'Could not reject the message.'; }
  }

  async retry(message: any) {
    try {
      await firstValueFrom(this.data.retryMessage(message.id));
      this.notice = 'Retry was accepted by the delivery service.';
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'Could not retry the message.'; }
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
    return this.messageStatus(message);
  }
}
