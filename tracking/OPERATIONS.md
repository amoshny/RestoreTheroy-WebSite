# Tracking deployment record — November 21, 2026

This is a prepared integration, not a completed live deployment. No campaigns, budgets, billing, subscriptions or production website publication are authorized by this change.

## Architecture decision

GitHub Pages has no private server runtime. Keep FormSubmit → the existing business mailbox. An owner-owned private Apps Script reads only matching FormSubmit notifications with the Advanced Gmail API (`gmail.readonly`), parses a versioned encoded envelope, and appends one row per UUID to a private Sheet. It never changes, deletes or marks messages read and exposes no web endpoint. No credentials enter the frontend. Email delivery continues even if the script/Sheet fails. A backend can later replace this if actual FormSubmit delivery/format cannot reliably carry the envelope; do not activate a parser that was only tested on synthetic fixtures.

Read-only Gmail authorization is mailbox-wide at the API permission level; a Gmail query narrows the script's behavior, not the OAuth permission. Owner approval of that access is required. This is narrower than GmailApp's full-mail scope. Revoke from Google Account → Security → Third-party connections; delete the two Apps Script triggers to stop polling/edit handling. The Sheets scope also permits other accessible spreadsheets; only the configured workbook IDs are used. No external collaborators are required.

## Deployment gates

1. Use **arsenij.moshko@gmail.com**. The currently connected Drive/Gmail connector belongs to a DIFFERENT address, so no resources were created there. Find/adapt the owner's draft only after correct access. Workbook name: Restore Theory — Leads & Google Ads Tracking. Keep sharing Restricted.
2. Place Code.gs, lead-core.js (as a .gs source) and appsscript.json in an owner-controlled Apps Script project. No web-app deployment. Properties: LEADS_SHEET_ID, VERIFIED_MAIL_SENDER (from actual received notification), IMPORT_ENABLED=false. Run rtSetup only on an empty destination. It creates Leads, Journal, Errors, Export Ledger, status dropdown, filters, checkbox controls and LA display timezone. It refuses to overwrite existing data.
3. Confirm actual sender, Gmail receiver authentication headers, HTML/plain email carrying rt_envelope, and no truncation on one explicitly labelled technical request. Parser currently refuses missing/mismatched/ambiguous envelopes and unauthenticated sender. Original legacy emails without an envelope are flagged for manual recovery; they are NOT silently treated as imported. The frontend envelope is base64 UTF-8 transport, not encryption, and adds the same data already sent to the business inbox. Never put real mail samples or client contacts in GitHub.
4. Enable IMPORT_ENABLED only after that check, run import manually, inspect one row, rerun and confirm no duplicate, then explicitly install triggers. Cursor overlaps one day; if parsing fails the cursor is not advanced. Initial scan is seven days. Errors retain message references and codes, no names/phones/bodies. Review these privately; repeated unresolved failures can use quota. Existing emails remain the recovery source.
5. Manually change status in Leads. Only explicit Qualified sets Qualified At; Booked and Paid set their respective dates without backfilling qualification. Script writes preserve the first timestamp. Warning protections deter accidental timestamp edits but do not stop an owner/editor from changing data; Sheets is not a tamper-proof CRM. Revenue is actual payment only, never projected value/tips. Add manual unknown-source leads with rtAddManualLead; an SMS draft is not a lead. A received SMS UUID may be matched to an existing row, never infer Ads from its text alone.

## Verification completed versus pending

Pure tests cover Unicode envelope parsing, malformed/ambiguous envelopes, formula injection, New/Unknown defaults, manual timestamp transitions, no implicit Qualified, export eligibility/test exclusions. Form/SMS browser regression must pass with the envelope addition. These are local/synthetic tests. Actual Gmail import, Apps Script permissions/quota, installed edit trigger, private Sheet contents, Google Ads matching and native import diagnostics remain unverified until account-side execution. No live-system success is claimed from source-code tests.

## Supported offline path

Native Google Ads Data Manager → private Google Sheets direct connection is the first option. Google documents Editor access to the Sheet and Ads admin access. Use a separate export workbook so the Ads connection never receives customer contact columns. Mapping must be verified in the real account before enabling export. For now the adapter deliberately holds BRAID-only rows for mapping review; it does not squeeze GBRAID/WBRAID into a GCLID field. No email/phone enhanced data is exported. Current frontend ad_user_data/ad_personalization stay denied; Enhanced Conversions need a separately reviewed consent/data basis.

GCLID is a candidate from the browser, not verified evidence just because it looks valid. Ads Attribution Verified requires reliable ad-origin evidence and the final matching check happens in Ads. UTM google/cpc alone is insufficient. Test Lead always excludes the row. The disabled export draft never claims Imported when a row is merely prepared. True import status must come from Data Manager diagnostics. Do not create fake live test conversions. The first genuine ad click/inquiry is required to verify matching end to end.

## Call tracking comparison

- Google forwarding numbers: no separate tracking subscription according to Google; eligible website-ad visits can replace the displayed business number and forward to the existing destination. Suitable for a small starting budget, but individual-call identification/manual qualified-lead association must be verified in account reports before claiming a unified pipeline. Website call reporting does not guarantee a retrievable GCLID for each caller. Secondary actual call conversion only; phone click is separate.
- CallRail: public pricing currently shows Lead Tracking from $50/month plus usage, 5 numbers/250 minutes. Billing cadence and final monthly quote must be checked before purchase (site also mentions $55 base in an add-on footnote). Roughly 7–8% of a $690/month ad budget before usage. Session DNI can attribute eligible visits and route calls to (858) 888-2707, but the plan/pool, available click fields, integration permissions and dedup rules require validation. No trial/subscription started. Recording stays off unless separately approved.
- Recommendation: inspect free native call reporting first; choose CallRail only if the owner needs per-lead attribution the native route cannot supply. No invented promise that either is already configured. A stable external call ID and one lead UUID should identify repeat calls; the owner alone qualifies a genuine prospect. Unknown-source calls remain unknown.

## Owner operation after activation (not active yet)

1. Check new inquiries in Leads and the existing email inbox.
2. Change only genuinely suitable inquiries to Qualified.
3. Check Data Manager import diagnostics; Prepared is not Imported.
4. Mark Booked/Paid and record actual Revenue as those occur.
5. If a row is missing, use the email and Errors sheet to recover; do not resubmit the customer request or invent an ad source.

Sources checked: https://support.google.com/google-ads-data-manager/answer/15146000 ; https://support.google.com/google-ads/answer/15707550 ; https://developers.google.com/workspace/gmail/api/auth/scopes ; https://support.google.com/google-ads/answer/6095883 ; https://www.callrail.com/pricing .
