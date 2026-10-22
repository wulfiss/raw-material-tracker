# Daily Supabase → SharePoint Excel refresh

This setup refreshes the existing workbook daily at **14:00 Argentina time**.
It replaces export sheets with a complete current snapshot; it does not append
historical copies. User-created workbook sheets are preserved. Nothing is
published or configured remotely by these files.

## 1. Enable the export in Supabase

In the project used by your Vercel preview, open SQL Editor and run
`integrations/sharepoint/setup-export.sql`. This creates a read-only RPC with
execution restricted to the server service role. Do not run database resets or
historical seeds. Application tables are explicitly listed; Supabase Auth users,
passwords, and internal schemas are excluded. Missing optional modules are
reported rather than exported as if they existed.

The `traceability` dataset is one row per **recorded date + material lot + recipe**.
It includes use date, material, supplier, material lot, expiry date, recipe, and
recording user. Historical material/product names come from the saved daily-use
record. This represents actual recorded uses, not inferred uses from recipe
membership or inbound reception dates. If daily-use tables are not installed,
`SB_sync_status` reports that limitation. Recipe membership remains separately
available in `SB_recipe_ingredients`.

## 2. Add the Office Script

Open the existing workbook in Excel for the web. Under Automate → New Script,
paste `refresh-workbook.ts` and save it as `RefreshSupabase`.
Use an `.xlsx` workbook supported by Excel Online (Business).
This requires Office Scripts enabled for your Microsoft 365 account/tenant.

The script creates dedicated `SB_` sheets, including `SB_traceability` and
`SB_sync_status`. It owns their contents; keep manual notes on other sheets.
It replaces those sheets' tables on refresh, so base existing charts/formulas
on stable sheet ranges or test table-dependent features before relying on them.
Do not rename export sheets. A previously existing `SB_` sheet without the script
marker will cause a safe error. Column headers use database names.

## 3. Create the Power Automate flow

Create a **Scheduled cloud flow** with:

- Frequency: Day; Interval: 1.
- Time zone: **Argentina Standard Time** (Buenos Aires, UTC−03:00).
- At these hours: `14`; At these minutes: `0`.
- Trigger settings → Concurrency control: On; Degree of parallelism: `1`.

Add **HTTP** (premium connector), named `GetSupabaseSnapshot`:

- Method: `POST`
- URI: `https://YOUR_PROJECT_REF.supabase.co/rest/v1/rpc/export_excel_snapshot`
- Headers:
  - `apikey`: your project's server secret key (`sb_secret_...`).
  - Do not add an `Authorization` header when using this secret key.
  - `Content-Type`: `application/json`
- Body: `{}`

Use an existing approved secret store/Power Automate secret mechanism for the
key where available. Turn on **Secure Inputs** and **Secure Outputs** in the HTTP
action's settings. Never put this privileged key in the workbook or source control;
it has broad project access. Use the secret key from the same project as the URL, not a public
`sb_publishable_...` key. A legacy `service_role` JWT is also supported: use it
in `apikey` and add `Authorization: Bearer YOUR_SERVICE_ROLE_JWT`.

Add **Excel Online (Business) → Run script** (or **Run script from SharePoint
library** if your script is stored there). Select:

- Location: your SharePoint site.
- Document library: the workbook's library, often Documents.
- File: your existing workbook.
- Script: `RefreshSupabase`.
- `snapshotJson`: select **Body** from the HTTP action in Dynamic content.
  Alternatively, use the **fx / Expression** editor to enter
  `string(body('GetSupabaseSnapshot'))`. Do not paste that expression as plain
  text or into Excel: only Power Automate evaluates it.

Enable Secure Inputs/Outputs for this action too. Keep its default “run after
successful HTTP action” behavior. Start with no automatic retry for Run script
while verifying workbook locking behavior. Add a failed-run notification using
your usual Power Automate notification action. This repository does not send it.

## 4. Validate once before leaving it scheduled

Manually run the flow. Confirm it succeeds and `SB_sync_status` has a fresh
snapshot time. Compare a known recorded material/date/recipe with
`SB_traceability`, plus table counts against Supabase. Run again and confirm
records are replaced without duplicates and manual sheets are unchanged.
A scheduled trigger runs around 14:00; service delays can affect exact timing.

This flow is designed for a small application export: the Office Script refuses
payloads above one million characters, tables above 50,000 rows, or oversized
cells before editing sheets. It fails explicitly rather than silently truncating
records. The SQL RPC returns a JSON object, avoiding PostgREST's usual row cap
on array responses. Large exports require a paged/staged implementation.
Office Script writes are not transactional: a workbook lock or service error
mid-refresh can leave partial changes. A successful `SB_sync_status` update is
written last; monitor failed runs and rerun after resolving the failure.

To activate this setup, you need your Supabase project reference, the SharePoint
site/library/workbook location, and access to the required credentials and
connectors. No hosted configuration has been applied by preparing these files.
