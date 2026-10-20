# UI Consolidation Audit — QUI / newstyle

Audit date: 2026-10-20
Scope: focused source review of Acquisition Discovery, ICP, Industry Packs, Leads, Contacts, Companies and Opportunities. This is a code-level audit; responsive visual QA in a running browser remains outstanding.

## Confirmed design inconsistencies

### P1 — Page-level styling has multiple competing owners
- src/app/features/industry-packs/industry-packs.page.ts embeds a large <style> block in its inline Angular template. It defines its own card, form, button, input and spacing rules; the active mode uses gray (#555) instead of the shared orange accent. Its 14px builder radius differs from the canonical 12px card radius.
- src/app/features/crm/opportunities.page.ts also embeds page CSS inside the template and hard-codes neutral colors, while other CRM pages rely on the global design system.
- src/app/features/acquisition/icp.page.ts has an inline template without a page stylesheet and does not use the same field/grid conventions as Discovery and Industry Packs.
- Several CRM *.page.css files are intentionally empty and labeled deprecated, but page templates still use page-specific classes. The intended boundary between global styles and component styles is therefore unclear.

Action: move page-specific rules to component stylesheets, replace hard-coded values with design tokens, and standardize page header, field, card, table, empty/loading/error and action patterns. Do not delete legacy styles until imports and selectors are traced.

### P1 — CRM interaction patterns differ
- Leads uses a custom data-grid/KPI/tab composition; Contacts and Companies use separate table layouts; Opportunities adds a custom lifecycle/timeline. Shared behavior and spacing should be normalized without removing useful domain-specific content.
- Contacts export used a legacy qualifyai-contacts.csv filename while the active product namespace is LeadsAI. Corrected in the current pass.

## Confirmed functionality issues and current remediation

- Leads toolbar: Sort and Export were visible but had no handlers. Sort now toggles score/date ordering and Export CSV exports the currently filtered rows.
- Bulk lead deletion: failed deletes were silently swallowed. The action now confirms intent and displays API errors.
- Opportunity close flow: cancelling the loss-reason prompt previously continued with “Not specified”; the flow now returns before saving when the user cancels.
- Discovery data actions: overview, ICP, prospect, manual ICP/prospect save and intent-signal actions lacked useful error handling; errors are now surfaced and manual records are minimally validated.
- Leads create/edit: errors now use the page error message rather than generic browser alerts.

## Still needs verification / follow-up

1. The Leads “Filters” toolbar button has no action and is redundant with the temperature filter. Remove it or implement a real filter panel.
2. Leads page currently treats a Contacts lookup error as a fatal Leads-page error, potentially hiding already-loaded leads. Separate the contact-picker error from the leads-list error.
3. Add consistent saving/loading guards to ICP create/edit, Opportunity save/close, and CRM destructive actions to prevent duplicate requests.
4. Normalize status-pill semantics (success, pending, warning, failed) across Discovery, Campaigns, CRM and approval queue.
5. Verify empty results vs. loading vs. API failure states on every page; several pages can otherwise appear blank.
6. Validate responsive layouts at narrow desktop/tablet/mobile widths, including tables, modal forms, long labels and action groups.
7. Run the frontend build and inspect the final GitHub Actions result after the current batch. Do not treat source edits alone as visual or runtime verification.

## Next pass order

1. Finish dead/misleading controls and separate list errors from auxiliary lookup errors.
2. Consolidate Industry Packs, ICP and Opportunities styles into the shared token system.
3. Standardize CRM tables, filters, empty states and form validation.
4. Build, then perform a route-by-route interaction and responsive audit.
