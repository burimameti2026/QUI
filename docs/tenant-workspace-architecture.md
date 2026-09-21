# Tenant workspace UI contract

The UI is tenant-aware and must not assume Renova is the only workspace.

Login authenticates the user and resolves all active workspace memberships. If there is one workspace it may be selected automatically; if there are multiple, the user chooses one before entering the authenticated shell.

After workspace selection, the session carries the selected tenant/workspace context. Navigation is generated from the tenant's enabled module and portal entitlements plus the user's permissions.

The Renova portal remains `/renova`. The root route remains the QualifyAI landing page.

Renova is a reference tenant, not a special application fork. A future tenant should be onboarded through the same workspace, entitlement, and provisioning contracts.
