import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin } from "rxjs";
import { PageHeader } from "../../shared/ui";
import { AcquisitionService } from "./acquisition.service";

@Component({
  standalone: true,
  imports: [CommonModule, PageHeader],
  templateUrl: "./acquisition.page.html",
  styleUrls: ["./acquisition.page.css"],
})
export class AcquisitionPage implements OnInit {
  private readonly data = inject(AcquisitionService);
  private readonly router = inject(Router);

  icps: any[] = [];
  prospects: any[] = [];
  campaigns: any[] = [];
  messages: any[] = [];
  targetLists: any[] = [];
  packages: any[] = [];
  overview: any = {};
  error = "";

  ngOnInit(): void { this.refresh(); }

  get icpCount() { return this.icps.length; }
  get prospectCount() { return this.prospects.length; }
  get needsEnrichmentCount() { return this.prospects.filter(x => this.statusKey(x.status) === "Discovered").length; }
  get enrichedCount() { return this.prospects.filter(x => this.statusKey(x.status) === "Enriched").length; }
  get qualifiedCount() { return this.prospects.filter(x => this.statusKey(x.status) === "Qualified").length; }
  get statusKey() {
    return (v: any) => {
      if (typeof v === "number") return ["Discovered", "Enriched", "Qualified", "Nurturing", "Replied", "Demo ready", "Converted", "Suppressed"][v] || String(v);
      const value = String(v ?? "").trim();
      return value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : "";
    };
  }
  get campaignCount() { return this.campaigns.length; }
  get pendingCount() { return this.messages.filter(x => Number(x.status) === 0).length; }
  get packageCount() { return this.packages.length; }
  get readyCount() { return [this.icpCount, this.prospectCount, this.campaignCount, this.packageCount].filter(x => x > 0).length; }

  get nextTitle(): string {
    if (!this.packageCount) return "Packages & Offers";
    if (!this.icpCount) return "ICP";
    if (!this.prospectCount) return "Prospecting";
    if (!this.qualifiedCount) return "Qualification & Score";
    if (!this.campaignCount) return "Campaigns & Messages";
    return "Approval & Delivery";
  }

  get nextRoute(): string {
    const routes: Record<string, string> = {
      "Packages & Offers": "/packages/new",
      ICP: "/acquisition/icp",
      Prospecting: "/discover",
      "Qualification & Score": "/acquisition/qualification",
      "Campaigns & Messages": "/campaigns",
      "Approval & Delivery": "/acquisition/approval-queue",
    };
    return routes[this.nextTitle];
  }

  get nextStatus() { return "NEXT"; }

  get nextDescription(): string {
    if (!this.packageCount) return "Create or select the offer that the acquisition process will promote.";
    if (!this.icpCount) return "Define the company profile and decision-maker criteria you want Prospecting to use.";
    if (!this.prospectCount) return "Run Prospecting against the selected ICP to create new accounts. Enrichment and qualification then continue automatically.";
    if (this.needsEnrichmentCount || this.enrichedCount) return "Let the backend enrichment and qualification lifecycle finish before selecting the qualified outreach audience.";
    if (!this.campaignCount) return "Build the messages, choose the audience rules and decide whether the process is manual or automated.";
    return "Review the exact recipients and messages, then move the campaign to approval.";
  }

  refresh(): void {
    this.error = "";
    forkJoin({
      overview: this.data.overview(),
      icps: this.data.icps(),
      prospects: this.data.prospects(),
      campaigns: this.data.campaigns(),
      messages: this.data.messages(),
      targetLists: this.data.targetLists(),
      packages: this.data.workspacePackages(),
    }).subscribe({
      next: r => Object.assign(this, r),
      error: e => this.error = e?.error?.detail || "Acquisition workspace could not be loaded.",
    });
  }

  startCampaign(): void {
    this.router.navigateByUrl("/campaigns");
  }

  go(path: string): void {
    void this.router.navigateByUrl(path);
  }
}