# Tracking deployment record — November 21, 2026

This is a prepared integration, not a completed live deployment. No campaigns, budgets, billing, subscriptions or production website publication are authorized by this change.

## Architecture decision

GitHub Pages has no private server runtime. Keep FormSubmit → the existing business mailbox. An owner-owned private Apps Script reads only matching FormSubmit notifications with the Advanced Gmail API (`gmail.readonly`), parses a versioned encoded envelope, and appends one row per UUID to a private Sheet. It never changes, deletes or marks messages read and exposes no web endpoint. No credentials enter the frontend. Email delivery continues even if the script/Sheet fails. A backend can later replace this if actual FormSubmit delivery/format cannot reliably carry the envelope; do not activate a parser that was only tested on synthetic fixtures.

Read-only Gmail authorization is mailbox-wide at the API permission level; a Gmail query narrows the script's behavior, not the OAuth permission. Owner approval of that access is required. This is narrower than GmailApp's full-mail scope. Revoke from Google Account → Security → Third-party connections; delete the two Apps Script triggers to stop polling/edit handling. The Sheets scope also permits other accessible spreadsheets; only the configured workbook IDs are used. No external collaborators are required.

## Account-side verification — November 21

The owner connected Gmail and Drive as **arsenij.moshko@gmail.com** and personally authorized the private Apps Script with Gmail read-only, Sheets and trigger scopes. The Leads workbook is Restricted, owned by that account, and contains Leads, Journal, Errors and Export Ledger. A native table supplies Status dropdowns. No customer contacts or private mail samples are committed here.

A clearly marked technical email was delivered through the existing FormSubmit endpoint. Its RTP1 envelope arrived byte-for-byte intact. Receiver DKIM authentication and the actual HTML MIME format were checked. Advanced Gmail in Apps Script returns decoded Byte[] in body.data, unlike REST's base64url string; the parser now supports both and has regression tests.

The actual technical notification was imported into one New/Test row. A second processing attempt did not append a duplicate. Qualified At, Booked At, Paid At and Revenue remained blank. The canonical parser was then checked against the same received message. rtConfigure completed successfully, including LA time display, schema verification, column formats and warning protection on timestamps. Two owner-owned triggers were installed: rtImportMail every five minutes and rtOnEdit on spreadsheet edits. Their existence was verified in Apps Script. A real test-row edit New → Unqualified → New produced both expected private Journal entries, without a qualification/payment date. Website PRs remain unmerged, so production emails without RTP1 are still legacy mail and require manual recovery; this is not yet a fully activated production pipeline.

rtConfigure uses a pre-created workbook with the exact RT_HEADERS schema; it refuses a mismatched schema and does not overwrite records. When bound to the workbook it sets LEADS_SHEET_ID if absent. VERIFIED_MAIL_SENDER was verified as submissions@formsubmit.co. IMPORT_ENABLED is true in the owner's private runtime after the successful scan. This repository's code defaults it to false for a fresh installation. The account runtime combines lead-core.js and Code.gs in one editor file; private technical QA helpers do not send Ads events.

The first scan flagged two legacy notifications in Errors as ENVELOPE_MISSING. Permanent format/auth/reference failures are logged once per message and held for manual recovery; they do not block all newer mail. Transient failures retain the scan cursor and are retried. The cursor overlaps one day; initial scan is seven days. Gmail messages are never modified, deleted or marked read by the script. Email remains the recovery source if the Sheet fails. To retry a reviewed message after fixing its format, remove its review entry from Errors or recover it manually, preserving its original UUID.

Only an explicit owner status edit to Qualified sets Qualified At. Booked and Paid never backfill qualification. Dates are written once, and warning protection is not tamper-proof access control. Revenue means actual payment only. rtAddManualLead creates an Unknown/New row for received SMS/calls; a prepared SMS draft is not a received lead. A received SMS UUID can match an existing record, but does not independently prove an ad source.

Local checks: 14 logic/runtime tests pass, including both Gmail body encodings, receiver-authentication rejection, envelope/reference validation, one-row registration, formula safety and qualification/export exclusions. Mocked form/SMS browser checks passed at 390/1440px; consent controls passed at 320/390/1440px and with GPC. A real user edit of Qualified and final Ads matching still require verification; no fake Qualified or Paid event was created in the working statistics.

Google Ads account 432-803-9444 now has RT — Request Service Submitted (Website, Secondary, One) and RT — Qualified Lead (Import from clicks, Primary, One, no invented value). Both show zero conversions. GTM-KSQFQQWN is the verified existing container; draft event trigger booking_request_submitted, DLV lead_id and transaction-ID mapping are configured. The old AW Google Tag was paused in the draft to avoid duplicate configuration with the current automatically added Google Ads destination tag. GTM remains unpublished and Tag Assistant validation of the actual draft is still pending. Do not publish until that check passes.

## Supported offline path

Native Google Ads Data Manager → private Google Sheets direct connection is the first option. Google documents Editor access to the Sheet and Ads admin access. Use a separate export workbook so the Ads connection never receives customer contact columns. Mapping must be verified in the real account before enabling export. For now the adapter deliberately holds BRAID-only rows for mapping review; it does not squeeze GBRAID/WBRAID into a GCLID field. No email/phone enhanced data is exported. Current frontend ad_user_data/ad_personalization stay denied; Enhanced Conversions need a separately reviewed consent/data basis.

GCLID is a candidate from the browser, not verified evidence just because it looks valid. Ads Attribution Verified requires reliable ad-origin evidence and the final matching check happens in Ads. UTM google/cpc alone is insufficient. Test Lead always excludes the row. The disabled export draft never claims Imported when a row is merely prepared. True import status must come from Data Manager diagnostics. Do not create fake live test conversions. The first genuine ad click/inquiry is required to verify matching end to end.

## Call tracking comparison

- Google forwarding numbers: no separate tracking subscription according to Google; eligible website-ad visits can replace the displayed business number and forward to the existing destination. Suitable for a small starting budget, but individual-call identification/manual qualified-lead association must be verified in account reports before claiming a unified pipeline. Website call reporting does not guarantee a retrievable GCLID for each caller. Secondary actual call conversion only; phone click is separate.
- CallRail: public pricing currently shows Lead Tracking from $50/month plus usage, 5 numbers/250 minutes. Billing cadence and final monthly quote must be checked before purchase (site also mentions $55 base in an add-on footnote). Roughly 7–8% of a $690/month ad budget before usage. Session DNI can attribute eligible visits and route calls to (858) 888-2707, but the plan/pool, available click fields, integration permissions and dedup rules require validation. No trial/subscription started. Recording stays off unless separately approved.
- Recommendation: inspect free native call reporting first; choose CallRail only if the owner needs per-lead attribution the native route cannot supply. No invented promise that either is already configured. A stable external call ID and one lead UUID should identify repeat calls; the owner alone qualifies a genuine prospect. Unknown-source calls remain unknown.

## Owner operation after website and offline-feed activation

1. Check new inquiries in Leads and the existing email inbox.
2. Change only genuinely suitable inquiries to Qualified.
3. Check Data Manager import diagnostics; Prepared is not Imported.
4. Mark Booked/Paid and record actual Revenue as those occur.
5. If a row is missing, use the email and Errors sheet to recover; do not resubmit the customer request or invent an ad source.

Sources checked: https://support.google.com/google-ads-data-manager/answer/15146000 ; https://support.google.com/google-ads/answer/15707550 ; https://developers.google.com/workspace/gmail/api/auth/scopes ; https://support.google.com/google-ads/answer/6095883 ; https://www.callrail.com/pricing .
