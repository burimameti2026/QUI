import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { KnowledgeDocument } from "../../core/models/platform.models";
import { Modal, PageHeader } from "../../shared/ui";
import { KnowledgeService } from "./knowledge.service";

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, Modal, PageHeader],
  template: `<main class="page page-knowledge">
    <qai-page-header
      title="Knowledge"
      subtitle="Ground automated answers in company documents, websites, FAQs and operational data."
    >
      <button class="button-quiet" type="button" (click)="testOpen = true">Test retrieval</button>
      <button class="button-primary" type="button" (click)="open()">+ Add knowledge</button>
    </qai-page-header>

    <section class="metric-grid" aria-label="Knowledge overview">
      <article class="metric">
        <span class="eyebrow">Documents</span>
        <strong>{{ rows.length }}</strong>
      </article>
      <article class="metric">
        <span class="eyebrow">Published</span>
        <strong>{{ published }}</strong>
      </article>
      <article class="metric">
        <span class="eyebrow">Drafts</span>
        <strong>{{ rows.length - published }}</strong>
      </article>
      <article class="metric">
        <span class="eyebrow">Knowledge base</span>
        <strong>{{ bases.length }}</strong>
      </article>
    </section>

    <section class="toolbar" aria-label="Knowledge filters">
      <label class="search">
        <span class="eyebrow">Search</span>
        <input [(ngModel)]="q" placeholder="Search knowledge" />
      </label>
    </section>

    <section class="card">
      <header class="card-header">
        <div>
          <span class="eyebrow">Knowledge library</span>
          <h2>Documents</h2>
        </div>
        <span class="meta">{{ visible.length }} shown</span>
      </header>
      <div class="table">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Version</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let x of visible">
              <td>
                <div class="stack">
                  <strong>{{ x.title }}</strong>
                  <span class="meta">{{ x.body?.slice(0, 90) }}…</span>
                </div>
              </td>
              <td>v{{ x.version }}</td>
              <td>
                <span class="status" [class.success]="x.published">
                  <span class="status-dot"></span>
                  {{ x.published ? "Published" : "Draft" }}
                </span>
              </td>
              <td>{{ x.createdAtUtc | date: "mediumDate" }}</td>
              <td>
                <div class="actions">
                  <button class="button-quiet" type="button" (click)="open(x)">Edit</button>
                  <button class="button-quiet" type="button" (click)="reindex(x)">Re-index</button>
                  <button class="button-danger" type="button" (click)="remove(x)">Delete</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!visible.length">
              <td colspan="5">
                <div class="empty">
                  <strong>No knowledge documents found</strong>
                  <span class="meta">Add a document or change the search term.</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <qai-modal
      [open]="show"
      [title]="form.id ? 'Edit knowledge' : 'Add knowledge'"
      (close)="show = false"
    >
      <form class="form" (ngSubmit)="save()">
        <label>
          Knowledge base
          <select [(ngModel)]="form.knowledgeBaseId" name="kb">
            <option *ngFor="let b of bases" [value]="b.id">{{ b.name }}</option>
          </select>
        </label>
        <label>
          Title
          <input [(ngModel)]="form.title" name="title" required />
        </label>
        <label>
          Content
          <textarea [(ngModel)]="form.body" name="body" required></textarea>
        </label>
        <label class="list-item">
          <input type="checkbox" [(ngModel)]="form.published" name="pub" />
          <span>Published for automated retrieval</span>
        </label>
        <footer class="actions">
          <button class="button-secondary" type="button" (click)="show = false">Cancel</button>
          <button class="button-primary" type="submit">Save &amp; index</button>
        </footer>
      </form>
    </qai-modal>

    <qai-modal
      [open]="testOpen"
      title="Test knowledge retrieval"
      (close)="testOpen = false"
    >
      <div class="form">
        <label>
          Customer question
          <input [(ngModel)]="testQ" placeholder="What is your international freight process?" />
        </label>
        <div class="actions">
          <button class="button-primary" type="button" (click)="testRetrieval()">Search knowledge</button>
        </div>
        <div class="notice" *ngIf="answer">
          <strong>Retrieved answer</strong>
          <p>{{ answer }}</p>
        </div>
      </div>
    </qai-modal>
  </main>`,
})
export class KnowledgePage implements OnInit {
  rows: KnowledgeDocument[] = [];
  bases: any[] = [];
  q = "";
  show = false;
  testOpen = false;
  testQ = "";
  answer = "";
  form: any = { published: true, version: 1 };
  constructor(private data: KnowledgeService) {}
  ngOnInit() {
    this.load();
  }
  load() {
    this.data.documents().subscribe((r) => (this.rows = r));
    this.data.bases().subscribe((r) => {
      this.bases = r;
      if (!this.form.knowledgeBaseId && r.length)
        this.form.knowledgeBaseId = r[0].id;
    });
  }
  get visible() {
    return this.rows.filter((x) =>
      `${x.title} ${x.body}`.toLowerCase().includes(this.q.toLowerCase()),
    );
  }
  get published() {
    return this.rows.filter((x) => x.published).length;
  }
  open(x?: KnowledgeDocument) {
    this.form = x
      ? { ...x }
      : { published: true, version: 1, knowledgeBaseId: this.bases[0]?.id };
    this.show = true;
  }
  save() {
    if (!this.form.knowledgeBaseId || !this.form.title?.trim() || !this.form.body?.trim()) {
      alert("Knowledge base, title and content are required.");
      return;
    }
    const op = this.form.id
      ? this.data.updateDocument(this.form.id, this.form)
      : this.data.createDocument(this.form);
    op.subscribe({
      next: (r) => {
        const i = this.rows.findIndex((x) => x.id === r.id);
        i >= 0 ? (this.rows[i] = r) : this.rows.unshift(r);
        this.show = false;
        this.data.reindex(r.id).subscribe();
      },
      error: (e) => alert(e?.error?.error || "Knowledge document could not be saved."),
    });
  }
  reindex(x: KnowledgeDocument) {
    this.data
      .reindex(x.id)
      .subscribe((r) => alert(`Indexed ${r.chunks || 0} chunks.`));
  }
  remove(x: KnowledgeDocument) {
    if (confirm(`Delete ${x.title}?`))
      this.data
        .deleteDocument(x.id)
        .subscribe(() => (this.rows = this.rows.filter((v) => v.id !== x.id)));
  }
  testRetrieval() {
    if (!this.testQ.trim()) return;
    this.data
      .retrieve(this.testQ)
      .subscribe({
        next: (r) => (this.answer = r.answer || JSON.stringify(r)),
        error: () => (this.answer = "Retrieval failed."),
      });
  }
}
