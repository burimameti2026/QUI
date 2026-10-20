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
  readonly busyMessageIds = new Set<string>();

  isBusy(message: any): boolean { return this.busyMessageIds.has(String(message?.id)); }
  private beginAction(message: any): boolean {
    const id = String(message?.id ?? '');
    if (!id || this.busyMessageIds.has(id)) return false;
    this.busyMessageIds.add(id);
    this.error = '';
    this.notice = '';
    return true;
  }

  get pending() { return this.messages.filter(x => this.messageStatus(x) === 'Queued' && !x.approvalRequested && !x.approvalGranted).length; }
  get approvedQueued() { return this.messages.filter(x => this.isApprovedAndQueued(x)).length; }
  get requested() { return this.messages.filter(x => x.approvalRequested && !this.isProcessed(x)).length; }
  get safeDemo() { return this.messages.length > 0 && this.messages.every(x => String(x.email || '').endsWith('.test')); }
  get approved() { return this.messages.filter(x => ['Sent', 'Delivered', 'Replied'].includes(this.messageStatus(x))).length; }
  get failed() { return ['Failed', 'Suppressed'].filter(status => this.messages.some(x => this.messageStatus(x) === status)).length ? this.messages.filter(x => ['Failed', 'Suppressed'].includes(this.messageStatus(x))).length : 0; }
  get visibleMessages() {
    const q = this.query.trim().toLowerCase();
    return this.messages.filter(x => {
      const status = this.messageStatus(x);
      const filterOk =
        this.filter === 'all' ||
        (this.filter === 'pending' && !x.approvalRequested && !x.approvalGranted && status === 'Queued') ||
        (this.filter === 'requested' && !!x.approvalRequested && !this.isProcessed(x)) ||
        (this.filter === 'processed' && ['Sent', 'Delivered', 'Replied', 'Failed', 'Suppressed'].includes(status));
      const text = [x.prospect, x.contactName, x.email, x.campaign, x.subject, x.body, this.statusLabel(x)].filter(Boolean).join(' ').toLowerCase();
      return filterOk && (!q || text.includes(q));
    });
  }
  setFilter(filter: 'all' | 'pending' | 'requested' | 'processed') {
    this.filter = filter;
  }
  isProcessed(message: any) {
    return ['Sent', 'Delivered', 'Replied', 'Failed', 'Suppressed'].includes(this.messageStatus(message));
  }

  isApprovedAndQueued(message: any): boolean {
    return !!message?.approvalGranted && this.messageStatus(message) === 'Queued';
  }

  messageStatus(message: any): string {
    const value = message?.status;
    if (value === 0 || String(value).toLowerCase() === 'queued') return 'Queued';
    if (value === 1 || String(value).toLowerCase() === 'sent') return 'Sent';
    if (value === 2 || String(value).toLowerCase() === 'delivered') return 'Delivered';
    if (value === 3 || String(value).toLowerCase() === 'replied') return 'Replied';
    if (value === 4 || String(value).toLowerCase() === 'failed') return 'Failed';
    if (value === 5 || String(value).toLowerCase() === 'suppressed') return 'Suppressed';
    if (String(value).toLowerCase() === 'cancelled' || String(value).toLowerCase() === 'canceled') return 'Cancelled';
    return String(value ?? 'Unknown'); 
  }

  ngOnInit(): void { void this.load(); }

  async load() {
    if (this.loading) return;
    this.loading = true; this.error = '';
    try { this.messages = await firstValueFrom(this.data.messages()) || []; }
    catch (error: any) { this.error = error?.error?.detail || 'Could not load the acquisition approval queue.'; }
    finally { this.loading = false; }
  }

  async requestApproval(message: any) {
    if (!this.beginAction(message)) return;
    try {
      await firstValueFrom(this.data.requestApproval(message.id));
      await this.load();
      this.notice = 'Approval task created. Review is now recorded for this outreach message.';
    } catch (error: any) { this.error = error?.error?.detail || 'Could not request approval.'; }
    finally { this.busyMessageIds.delete(String(message.id)); }
  }

  async reject(message: any) {
    if (!this.beginAction(message)) return;
    try {
      await firstValueFrom(this.data.rejectApproval(message.id));
      await this.load();
      this.notice = 'Message rejected. It will not be sent.';
    } catch (error: any) { this.error = error?.error?.detail || 'Could not reject the message.'; }
    finally { this.busyMessageIds.delete(String(message.id)); }
  }

  async retry(message: any) {
    if (!this.beginAction(message)) return;
    try {
      await firstValueFrom(this.data.retryMessage(message.id));
      await this.load();
      this.notice = 'Retry was accepted by the delivery service.';
    } catch (error: any) { this.error = error?.error?.detail || 'Could not retry the message.'; }
    finally { this.busyMessageIds.delete(String(message.id)); }
  }

  async approve(message: any) {
    if (!message?.approvalRequested || this.isProcessed(message) || !this.beginAction(message)) return;
    try {
      await firstValueFrom(this.data.approve(message.id));
      await this.load();
      this.notice = 'Approval recorded. The backend still enforces sender, suppression, provider and tenant delivery gates.';
    } catch (error: any) { this.error = error?.error?.detail || 'The message could not be approved. Backend safety controls may have blocked delivery.'; }
    finally { this.busyMessageIds.delete(String(message.id)); }
  }

  statusLabel(message: any): string {
    if (message.approvalRequested && !this.isProcessed(message)) return 'Awaiting approval';
    if (this.isApprovedAndQueued(message)) return 'Approved · queued for delivery';
    return this.messageStatus(message);
  }
}
