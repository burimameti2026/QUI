import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { PageHeader } from "../../shared/ui";
import { AuthService } from "../../core/auth.service";
import { AcquisitionService } from "./acquisition.service";

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: "./acquisition.page.html",
  styleUrls: ["./acquisition.page.css"],
})
export class AcquisitionPage implements OnInit {
  private readonly data = inject(AcquisitionService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  tenantId = "";
  campaigns: any[] = [];
  selectedCampaign: any = null;
  plan: any = null;
  error = "";
  loading = false;

  ngOnInit(): void {
    this.tenantId = this.auth.session()?.tenantId || "";
    void this.refresh();
  }

  get runningCount() { return this.campaigns.filter(x => this.statusKey(x.status) === "Running").length; }
  get pausedCount() { return this.campaigns.filter(x => this.statusKey(x.status) === "Paused").length; }
  get draftCount() { return this.campaigns.filter(x => this.statusKey(x.status) === "Draft" || this.statusKey(x.status) === "Scheduled").length; }

  get statusKey() {
    return (v: any) => {
      if (typeof v === "number") return ["Draft", "Scheduled", "Running", "Paused", "Completed", "Stopped"][v] || String(v);
      const value = String(v ?? "").trim();
      return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "Unknown";
    };
  }

  async refresh() {
    if (!this.tenantId) {
      this.error = "No authenticated tenant is available.";
      return;
    }
    this.loading = true;
    this.error = "";
    try {
      const campaigns = await this.data.autonomousCampaigns(this.tenantId).pipe(catchError(() => of([]))).toPromise();
      this.campaigns = campaigns || [];
      if (this.selectedCampaign) {
        const current = this.campaigns.find(x => x.id === this.selectedCampaign.id);
        this.selectedCampaign = current || null;
      }
      if (!this.selectedCampaign && this.campaigns.length) this.selectedCampaign = this.campaigns[0];
      await this.loadPlan();
    } catch (e: any) {
      this.error = e?.error?.detail || e?.error?.title || "Campaign workspace could not be loaded.";
    } finally {
      this.loading = false;
    }
  }

  async selectCampaign(campaign: any) {
    this.selectedCampaign = campaign;
    await this.loadPlan();
  }

  async loadPlan() {
    this.plan = null;
    if (!this.tenantId || !this.selectedCampaign?.id) return;
    try {
      this.plan = await this.data.autonomousCampaignPlan(this.tenantId, this.selectedCampaign.id).toPromise();
    } catch (e: any) {
      this.error = e?.error?.detail || e?.error?.title || "Campaign workflow could not be loaded.";
    }
  }

  statusClass(value: any) { return this.statusKey(value).toLowerCase().replace(/\s+/g, "-"); }

  stepStatus(step: any) {
    return this.statusKey(step?.status || step?.taskStatus || "Pending");
  }

  workflowSteps(): any[] {
    return this.plan?.steps || this.plan?.workflow?.steps || [];
  }

  currentTask(): any {
    return this.plan?.currentTask || this.plan?.currentTaskInstance || null;
  }

  packageName(): string {
    return this.plan?.package?.name || this.selectedCampaign?.packageCode || "Package";
  }

  agentName(): string {
    return this.plan?.agent?.name || this.selectedCampaign?.agentName || "Campaign agent";
  }

  start(campaign: any) {
    if (!campaign?.agentId) {
      this.error = "This campaign has no business agent assigned.";
      return;
    }
    this.error = "";
    this.data.runAgent(this.tenantId, campaign.agentId).subscribe({
      next: () => this.refresh(),
      error: (e) => this.error = e?.error?.detail || e?.error?.title || "Campaign could not be started.",
    });
  }

  pause(campaign: any) {
    this.data.pauseAutonomousCampaign(this.tenantId, campaign.id).subscribe({
      next: () => this.refresh(),
      error: (e) => this.error = e?.error?.detail || e?.error?.title || "Campaign could not be paused.",
    });
  }

  resume(campaign: any) {
    this.data.resumeAutonomousCampaign(this.tenantId, campaign.id).subscribe({
      next: () => this.refresh(),
      error: (e) => this.error = e?.error?.detail || e?.error?.title || "Campaign could not be resumed.",
    });
  }

  stop(campaign: any) {
    this.data.stopAutonomousCampaign(this.tenantId, campaign.id).subscribe({
      next: () => this.refresh(),
      error: (e) => this.error = e?.error?.detail || e?.error?.title || "Campaign could not be stopped.",
    });
  }

  openAgents() { void this.router.navigateByUrl("/agents"); }
  openCampaigns() { void this.router.navigateByUrl("/campaigns"); }
  openDiscover() { void this.router.navigateByUrl("/discover"); }
  openApproval() { void this.router.navigateByUrl("/acquisition/approval-queue"); }
}
