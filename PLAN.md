# Mother Charger CRM — Rebuild Plan

Source of truth analyzed: `mothercha_crm_prod_20260713.sql` (production dump, 2026‑07‑13), **not** the drawio file — no drawio was attached to this session, only the SQL dump. The dump is a real MySQL export with `CREATE TABLE` + data, so it is a stronger source of truth than a diagram (it reflects what's actually running, including drift from any diagram). I read structure, all foreign keys, and the actual lookup/config data (roles, statuses, screen permissions) to ground this plan in reality rather than assumptions.

**56 tables total**, not 35: the 35-ish "business" tables from your brief, plus Laravel framework tables (`cache`, `cache_locks`, `jobs`, `job_batches`, `failed_jobs`, `migrations`, `sessions`, `password_reset_tokens`) and an installed-but-empty `spatie/laravel-permission` schema (`roles`, `permissions`, `role_has_permissions`, `model_has_roles`, `model_has_permissions` — zero rows in all five). There's also `industry_types_backup`, a manual backup copy of `industry_types`, and `role_screen_permissions`, a custom (non-Spatie) screen-visibility table that's the one actually populated with data.

---

## 1. What the dump confirms about your GAPs

I checked each GAP against real data, not just column presence:

- **GAP 1 (approval location) — confirmed and worse than described.** `leads` has the full approval field set (`is_approved`, `approved_by_id`, `approved_at`, `approval_rejection_reason`, `approval_rejection_detail`, `approval_officer_note`, `approval_rejected_at`, `approval_rejected_by_id`). The live `lead_statuses` data shows the actual flow in production today:
  `new → contacted → qualified → pending_approval → approved → converted` (plus `lost`/`expired`/`not_interest`).
  So today, Head Sale approves the **Lead** (before any contract exists), then Sales manually creates the Order/Contract afterward. This matches your GAP 1 exactly — approval needs to move to post-signature (Order or Contract).
- **GAP 2 (order status lookup) — confirmed.** `orders.status` is `varchar(255) DEFAULT 'pending'`, no FK, no lookup table. There is no `order_statuses` table in the dump.
- **GAP 3 (confirmed_by_id) — confirmed.** `orders` has `confirmed_at` and `assigned_to` but no `confirmed_by_id`.
- **GAP 4 (Job Order too thin) — confirmed.** `installations` has only: `order_id, tech_token, status, tech_name, tech_phone, notes, customer_signature, installer_signature, completed_at`. No `appointment_at`, no `customer_confirmed_at`, no `job_number`, and no per-device table — per-device test results/serials currently live as flat columns on `order_items` (`device_id`, `serial_number`, `tid`, `sim_card`), one set per row, with no pass/fail test result field at all.
- **GAP 5 (contract delivery tracking) — confirmed.** `contracts` has `signed_at`, `sign_token(_expires_at)`, `notified_2months_at`, `notified_1month_at`, but no `sent_to_customer_at`.

## 2. Extra findings not in your brief (need your decisions)

1. **Two parallel role/permission systems, one of them dead.** `spatie/laravel-permission` tables exist (migrated) but are completely empty — never used. The system that's actually driving access control today is: `users.is_sale / is_head_sale / is_co_sale / is_manager` boolean flags + `users.role` free-text column + `crm_roles` (lookup: `sale`, `head_sale`, `co_sale`, `implement`, `supper_admin` — note the typo "supper_admin" is live data) + `role_screen_permissions` (maps a role string to visible screen keys, e.g. `head_sale` → `leads.pending_approvals`, `co_sale.confirmed_orders`, `job_orders`, `tickets`).
   → **Proposal:** drop the unused Spatie tables in the rebuild, keep the boolean-flag + `crm_roles` + Policy approach (matches "Laravel Policies" in your stack section), and re-implement `role_screen_permissions` as gates for sidebar/menu visibility, not as the authorization mechanism itself (Policies own authorization; screen-permissions just hide menu items). **Confirm you're OK dropping Spatie tables**, since nothing references them.
2. **`users.role` (free string) vs `crm_roles.key` vs `is_*` booleans overlap three ways** for the same concept. In the rebuild I'd like to consolidate to **one** source: `users.crm_role_id → crm_roles.id`, derive `is_sale`/`is_head_sale`/etc. as accessor methods (or keep as denormalized flags synced by observer, if you need fast filtering on them — dealer's call). Confirm which you prefer: (a) FK to `crm_roles` as single source, booleans become computed, or (b) keep booleans as-is and just add `order_statuses`/GAP fixes without touching the role model. Doesn't block starting Lead module either way, but changes the `users` migration.
3. **`leads.industry_type` / `leads.business_size` are free strings**, not FKs, even though `industry_types` and `business_sizes` lookup tables exist with real seeded data (used only for select-options, not referential integrity). Same pattern on `leads.sub_district/district/province` (string columns) *plus* `subdistrict_id/district_id/province_id` (FK columns) existing side by side — looks like a mid-migration state from string→FK. **Proposal:** finish the migration — make the `_id` FK columns authoritative, keep string columns only as a denormalized snapshot (useful once address changes shouldn't rewrite history), enforce industry_type/business_size as FKs. Confirm.
4. **`order_items` is heavily overloaded.** Beyond product/pricing, it carries: stock-confirmation fields (`stock_confirm_*`, GAP 3 territory), per-item installation address/coordinator (`installation_address`, `coordinator_name/phone`, `install_date_item`), *and* real-device fields (`device_id`, `serial_number`, `tid`, `sim_card`) that GAP 4 wants moved into a new `installation_items` table. **Proposal:** in the new schema, `installation_items` becomes the write target for device_id/serial/tid/sim/test result at install time; the columns stay on `order_items` only as historical/migrated data (frozen), new installs write to `installation_items`. Confirm this is what you want rather than moving/dropping the old columns outright.
5. **`franchises` / `partners` / `commission_split` (JSON on both `orders` and `order_items`)** describe a multi-tier referral/commission network (e.g., `franchises.default_commission_split` JSON, `partners.linked_partner_id` self-referencing chain) that your brief doesn't mention at all. It's real, populated schema — I'm treating it as existing functionality to preserve as-is (model + CRUD), not touch its business logic, unless you tell me it's deprecated.
6. **`dealers` is a real, used multi-tenant boundary** (4 dealer rows: Mother Charger, infogrammer, Procash One, Super POS), and `leads`, `orders`, `users` all carry `dealer_id`. Your brief doesn't mention dealer-scoping explicitly — I'll assume **all queries should scope by `dealer_id`** unless user is a manager/super-admin. Confirm.
7. **`lead_statuses` live data already encodes the *old* (GAP‑1) flow** (`pending_approval`, `approved`, `converted`). Once approval moves to Order/Contract, the Lead state machine simplifies to: `new → contacted → qualified → won(=allows_convert_to_order) → converted` / `lost` / `expired`. I'll design the new `lead_statuses` seed accordingly but the **old status values need a data migration** for the 6 existing lead rows in prod — I'll write that migration, not silently drop history.
8. **`tickets`/`ticket_notes` have zero rows** in the dump — confirms it's fine to build as a separate, later module per your ordering.

## 3. Proposed architecture

- **Backend:** Laravel 11, PHP 8.3, MySQL 8/MariaDB, Eloquent + migrations mirroring the dump 1:1 for existing tables, plus new migrations (never editing shipped migrations) for the 5 GAPs and any schema cleanups you approve above.
- **Auth:** Laravel Breeze (session-based, matches existing `remember_token`/`invite_token`/`reset_token` columns — this app already does its own invite/reset flow, not Fortify/Jetstream defaults) + Policies per model (`LeadPolicy`, `OrderPolicy`, `ContractPolicy`, `InstallationPolicy`, `TicketPolicy`) gated on `crm_roles`/is_* + `dealer_id` scoping.
- **Frontend:** Inertia.js + React + TypeScript + Tailwind, brand tokens (`#C7F03D` / `#111111` / `#F5F7F1`, Noto Sans Thai) as a Tailwind theme extension.
- **Queue/notifications:** Laravel queue (`jobs`/`failed_jobs` tables already exist) driving the 5 existing notification tables (`lead_expiry_notifications`, `lead_near_expiry_notifications`, `lead_assigned_notifications`, `contract_expiry_notifications`) + Telegram/Line webhook channel — no new notification tables needed for existing use cases, but Job Order (GAP 4) will likely want an `installation_appointment_notifications`-style table or reuse of a generic pattern; I'll propose the concrete migration in the Job Order module step, not now.
- **State machines:** `lead_statuses` (existing, re-seeded), new `order_statuses` (GAP 2) covering all 4 downstream stages (Sale Order / Approve / Confirm / Job Order status values in one table with a `stage` column so the UI can group them), each transition written through a service class that also writes to a new `order_status_history` table (mirroring `lead_status_history`, doesn't exist yet for orders).

## 4. Migration/model inventory (first pass — existing tables, ported as-is unless noted)

**Core/org:** users, dealers, franchises, partners, crm_roles
**Lookups:** business_sizes, industry_types, lost_reasons, lead_statuses, product_categories, product_colors, provinces, districts, subdistricts, *(new)* order_statuses
**Products:** products, product_color_on_product
**Lead:** leads, lead_contacts, lead_devices, lead_device_photos, lead_photos, lead_status_history, lead_orders, lead_extend_requests, lead_assigned_notifications, lead_expiry_notifications, lead_near_expiry_notifications
**Order/Contract:** orders, order_items, order_photos, order_support_documents, contracts, contract_expiry_notifications, *(new)* order_status_history
**Install:** installations, installation_photos, *(new)* installation_items
**Support:** tickets, ticket_notes

**Dropped from rebuild (proposal, confirm):** `roles`, `permissions`, `role_has_permissions`, `model_has_roles`, `model_has_permissions` (unused Spatie tables), `industry_types_backup` (manual backup, not app logic).

**New migrations for the 5 GAPs (additive, don't touch shipped columns):**
1. `orders`: add `approval_status`, `approved_by_id`, `approved_at`, `approval_rejection_reason`, `approval_rejection_detail`, `approval_officer_note`, `approval_rejected_at`, `approval_rejected_by_id` — **pending your GAP‑1 choice of orders vs. contracts** (see open question below)
2. `order_statuses` table + backfill `orders.status` values into it, add FK
3. `orders`: add `confirmed_by_id` (FK → users)
4. `installations`: add `appointment_at`, `customer_confirmed_at`, `job_number`; new `installation_items` table (order_item_id FK, device_id, serial_number, tid, sim_card, test_result enum(pass/fail), tested_at, tested_by_id)
5. `contracts`: add `sent_to_customer_at`

## 5. Open questions — need your answers before I write any code

1. **GAP 1: approve on `orders` or `contracts`?** My recommendation: **`orders`**, because `order_statuses` (GAP 2) already needs to represent the Approve stage as a state, and Confirm/Job Order stages key off `orders`, not `contracts`. Contracts stay the signed *document*; approval is a workflow gate on the order. Agree, or do you want it on `contracts`?
2. **Role model consolidation** (finding #2 above): keep `users.is_*` booleans + `role` string as-is and just layer new GAP fixes, or consolidate to `crm_roles` FK as single source now? This affects how big the `users` migration is.
3. **Spatie permission tables** (finding #1): OK to drop entirely in the rebuild since they hold zero data and nothing reads them?
4. **Address fields** (finding #3): OK to make `subdistrict_id/district_id/province_id` authoritative and treat the string columns as a frozen snapshot, going forward?
5. **`order_items` device fields** (finding #4): confirm new installs write serial/TID/SIM/test-result to the new `installation_items` table, old `order_items` columns kept read-only for historical rows.
6. **Dealer scoping** (finding #6): confirm every Lead/Order/User query should scope to the acting user's `dealer_id` unless they're manager/super-admin.
7. **Existing prod data**: do you want me to write this against a **copy** of this dump for local dev seeding (recommended — I'll add an anonymized/trimmed seeder), or are we starting an empty DB and this dump is reference-only? This affects whether I write a data-migration for the 6 existing `leads` rows currently sitting in the old `pending_approval`/`approved` statuses.

Once you confirm 1–7, I'll proceed in this order (per your §10): project setup + auth/roles/seed → Lead module (with tests) → Sale Order + Contract (+ e-sign) → Approve → Confirm → Job Order → Dashboard/Pipeline → Tickets — pausing for your review after each module, no code written yet.
