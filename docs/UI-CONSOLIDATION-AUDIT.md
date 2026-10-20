# UI Consolidation Audit — QUI / newstyle

Audit date: 2026-10-20
Scope: focused source review of Acquisition Discovery, ICP, Industry Packs, Leads, Contacts, Companies and Opportunities. This is a code-level audit; responsive visual QA in a running browser remains outstanding.

## Confirmed design inconsistencies

### P1 — Page-level styling has multiple competing owners
- Industry Packs previously embedded a large <style> block in its inline Angular template. This was moved to industry-packs.page.css and its neutral colors were partially replaced with shared design tokens; the remaining component rules still need a complete token and visual consistency review.
- src/app/features/crm/opportunities.page.ts also embeds page CSS inside the template and hard-codes neutral colors, while other CRM pages rely on the global design system.
- ICP previously had no page stylesheet. A responsive token-based icp.page.css is now wired, but its field/grid conventions still need a visual comparison against Discovery and Industry Packs.
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
- Leads qualification/conversion: replaced generic browser alerts with consistent in-page success/error feedback; CSV row separators were corrected.
- Contacts export: renamed the exported file to leadsai-contacts.csv.
- ICP: added loading state, duplicate-save guard, score range validation (0–100), JSON validation and a responsive token-based stylesheet.
- Opportunities: added a duplicate-save guard and disables the Save button while the save/status transition is pending.
- Industry Packs and Opportunities: moved embedded styles to component CSS files and replaced hard-coded neutral colors / redundant token fallbacks.

### Acquisition queue, history and campaign operator — current pass

- Approval queue actions now prevent duplicate in-flight requests per message and disable conflicting actions while one is running.
- Approval/rejection/retry success feedback is retained after refreshing the queue rather than being immediately cleared by the reload.
- Processed messages (including Replied) are excluded from the awaiting-approval count/filter; processed messages no longer display a stale “Awaiting approval” label or allow approval actions.
- Campaign History now guards overlapping polling/manual requests and validates date ranges before converting them to UTC and querying the API. It accepts either an array response or the documented `items` envelope.
- Campaign Containers now avoid list refreshes during mutations, reset stale AI operator state when reopening the dialog, and prevent a second AI prepare action while a campaign is actively running.

## Still needs verification / follow-up

1. The dead Leads “Filters” toolbar button was removed; the working temperature filter remains.
2. Leads now separates Contacts lookup errors from the Leads list, so a failed contact picker does not hide the list.
3. Opportunity save and CRM delete actions now guard duplicate requests; Companies and Contacts refresh actions are blocked while mutations are in progress to avoid stale-response overwrites.
4. Normalize status-pill semantics (success, pending, warning, failed) across Discovery, Campaigns, CRM and approval queue.
5. Verify empty results vs. loading vs. API failure states on every page; several pages can otherwise appear blank.
6. Validate responsive layouts at narrow desktop/tablet/mobile widths, including tables, modal forms, long labels and action groups.
7. Run the frontend build and inspect the final GitHub Actions result after the current batch. Do not treat source edits alone as visual or runtime verification.

## Next pass order

1. Verify Campaign Containers → container activity and Campaign History against real persisted backend events; confirm endpoint contracts against the backend runtime.
2. Finish dead/misleading controls and normalize status-pill semantics across all modules.
3. Continue token consolidation and standardize CRM tables, filters, empty states and form validation.
4. Build, then perform a route-by-route interaction and responsive audit.
