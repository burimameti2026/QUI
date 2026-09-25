import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeader } from "../../shared/ui";
import { UsersService } from "./users.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeader],
  template: `<qai-page-header title="Users & Access" subtitle="Manage tenant users, roles, permissions and account status through QualifyAI Identity."><button class="button-quiet" (click)="load()">↻ Refresh</button><button class="button-primary" (click)="creating = !creating">+ User</button></qai-page-header>
    <main class="page page-users">
      <div class="notice" *ngIf="error"><span class="icon">!</span><div class="stack"><b>Identity service could not load users</b><p>{{ error }}</p><button class="button-quiet" (click)="load()">Try again</button></div></div>
      <section class="card form" *ngIf="creating">
        <header class="card-header"><div><h2>Create user</h2><p>The user receives access inside the current tenant.</p></div></header>
        <div class="card-body">
          <div class="content-grid"><label>Email<input type="email" [(ngModel)]="form.email" /></label><label>Temporary password<input type="password" minlength="10" autocomplete="new-password" [(ngModel)]="form.password" /><small>10+ characters with uppercase, lowercase, number and special character.</small></label><label>First name<input [(ngModel)]="form.firstName" /></label><label>Last name<input [(ngModel)]="form.lastName" /></label></div>
          <label>Roles (comma separated)<input [(ngModel)]="rolesText" /></label>
          <footer class="actions"><button class="button-secondary" (click)="creating = false">Cancel</button><button class="button-primary" [disabled]="busy || !canCreate" (click)="create()">{{ busy ? "Creating…" : "Create account" }}</button></footer>
        </div>
      </section>
      <section class="card table">
        <div class="empty" *ngIf="loading">Loading users…</div>
        <div class="empty" *ngIf="!loading && !error && !rows.length"><b>No users found</b><span>Create the first tenant user to assign roles and permissions.</span><button class="button-primary" (click)="creating = true">Create user</button></div>
        <table *ngIf="!loading && rows.length"><thead><tr><th>User</th><th>Roles</th><th>Permissions</th><th>MFA</th><th>Status</th><th>Action</th></tr></thead><tbody><tr *ngFor="let u of rows"><td><b>{{ u.firstName }} {{ u.lastName }}</b><small>{{ u.email }}</small></td><td>{{ u.roles?.join(", ") || "No role assigned" }}</td><td>{{ u.permissions?.length || 0 }}</td><td>{{ u.twoFactorEnabled ? "Enabled" : "Off" }}</td><td><span class="status" [class.success]="u.isActive">{{ u.isActive ? "Active" : "Disabled" }}</span></td><td><button class="button-quiet" *ngIf="u.isActive" (click)="disable(u)">Disable</button><button class="button-quiet" *ngIf="!u.isActive" (click)="enable(u)">Enable</button></td></tr></tbody></table>
      </section>
    </main>`,
})
export class UsersPage implements OnInit {
  rows: any[] = [];
  creating = false;
  loading = false;
  busy = false;
  error = "";
  rolesText = "Admin";
  form: any = { email: "", password: "", firstName: "", lastName: "" };
  constructor(private users: UsersService) {}
  get canCreate() { return !!this.form.email?.trim() && !!this.form.firstName?.trim() && !!this.form.lastName?.trim() && this.validPassword(this.form.password); }
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.error = ""; this.users.list().subscribe({ next: (r) => { this.rows = r || []; this.loading = false; }, error: (e) => { this.error = this.apiError(e); this.loading = false; } }); }
  create() { if (!this.canCreate) { this.error = "Complete every field and use a 10+ character password with uppercase, lowercase, number and special character."; return; } this.busy = true; this.error = ""; this.users.create({ ...this.form, roles: this.rolesText.split(",").map((x) => x.trim()).filter(Boolean) }).subscribe({ next: () => { this.creating = false; this.busy = false; this.form = { email: "", password: "", firstName: "", lastName: "" }; this.load(); }, error: (e) => { this.error = this.apiError(e); this.busy = false; } }); }
  disable(u: any) { this.users.disable(u.id).subscribe({ next: () => this.load(), error: (e) => (this.error = this.apiError(e)) }); }
  enable(u: any) { this.users.enable(u.id).subscribe({ next: () => this.load(), error: (e) => (this.error = this.apiError(e)) }); }
  private apiError(e: any) { return e?.error?.detail || e?.error?.title || e?.error?.error || (e?.status ? `Identity API returned ${e.status}. Check identity-api logs for this request.` : "Identity API is unavailable."); }
  private validPassword(value: string) { return typeof value === "string" && value.length >= 10 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^a-zA-Z0-9]/.test(value); }
}
