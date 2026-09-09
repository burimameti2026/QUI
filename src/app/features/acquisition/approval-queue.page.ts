import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { PageHeader } from '../../shared/ui';

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: './approval-queue.page.html',
  styleUrl: './approval-queue.page.css'
})
export class ApprovalQueuePage implements OnInit {
  private readonly api = inject(ApiService);
  messages: any[] = [];
  loading = false;
  error = '';
  notice = '';

  get pending() { return this.messages.filter(x => String(x.status).toLowerCase() === 'queued' && !x.approvalRequested).length; }
  get requested() { return this.messages.filter(x => x.approvalRequested).length; }
  get safeDemo() { return this.messages.length > 0 && this.messages.every(x => String(x.email || '').endsWith('.test')); }

  ngOnInit(): void { void this.load(); }

  async load() {
    this.loading = true; this.error = ''; this.notice = '';
    try { this.messages = await firstValueFrom(this.api.get<any[]>('acquisition/messages')) || []; }
    catch (error: any) { this.error = error?.error?.detail || 'Could not load the acquisition approval queue.'; }
    finally { this.loading = false; }
  }

  async requestApproval(message: any) {
    try {
      await firstValueFrom(this.api.post(`email-operations/messages/${message.id}/request-approval`, {}));
      this.notice = 'Approval task created. Review is now recorded for this outreach message.';
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'Could not request approval.'; }
  }

  async approveAndSend(message: any) {
    try {
      await firstValueFrom(this.api.post(`email-operations/messages/${message.id}/approve-and-send`, {}));
      this.notice = 'Approval was recorded and the delivery service was invoked. Any provider or safety gate remains enforced by the backend.';
      await this.load();
    } catch (error: any) { this.error = error?.error?.detail || 'The message could not be sent. Backend safety controls may have blocked delivery.'; }
  }

  statusLabel(message: any): string {
    if (message.approvalRequested) return 'Awaiting approval';
    return String(message.status || 'unknown').replaceAll('_', ' ');
  }
}
