# Restore Theory tracking — release gates

Updated November 22, 2026. No merge, GTM publication, campaign/budget change, purchase or synthetic Qualified Lead is authorized by this document.

## Decision: NO-GO for paid traffic today

Code and an empty native connection have been checked. A complete production conversion has not. This is not a claim that Google matched a lead. Website release, private-runtime update, final unblocked tag verification and the call plan still need the gates below.

## One owner action: Qualified

The revised exporter ignores the legacy Ads Attribution Verified checkbox. rtConfigure hides that column without deleting it or changing the 25-column schema. Owner marks a real suitable prospect Qualified; the script retains the first Qualified At. Only candidates satisfying all of these checks reach the click feed:

- A registration/authenticated-notification record exists for that UUID in the private Journal, written by the sender/DKIM/envelope-checked mail importer.
- Manual Qualified At exists, the status remains Qualified/Booked/Paid, and timestamps are valid, not future, and within 90 days.
- Measurement Allowed is true, Test Lead is false, and a structurally usable GCLID exists.
- No owner checkbox or UTM source/medium is used to assert advertising origin.

Journal provenance establishes a processed FormSubmit notification, not a proven Google click or cryptographically verified website visit. The notification endpoint is public and browser-supplied identifiers remain unverified candidates. Google must match them to the correct account/ad interaction. Failed/unknown matches must not be labelled Imported or confirmed Google Ads leads. Manually added unknown-source calls/SMS remain held; receiving or qualifying them does not fabricate attribution. A partial registration whose Journal write failed can repair its provenance on retry without appending another lead.

This revision is staged in the PRs; the previously installed private Apps Script still needs the same reviewed source update before activation. Do not assume a GitHub merge updates Apps Script.

## Evidence collected in the actual Google interfaces (November 21)

- GTM-KSQFQQWN, workspace 3, connected to Tag Assistant in **Preview**, not a published version.
- Google Ads destination AW-18431015619 and Conversion Linker each fired once per measured page. The redundant old Google Tag remained Paused in the draft.
- Consent Default showed all four advertising/analytics consent fields Denied. After grant, ad_storage and analytics_storage showed Granted; ad_user_data and ad_personalization stayed Denied.
- A denied local form acknowledgement did not add booking_request_submitted. A granted acknowledgement produced exactly one such event and one conversion-tag attempt. Its Transaction ID resolved to that request's UUID, not the variable's literal name. Verified conversion ID 18431015619 and label 4lOwCLeQ_LwdEMP1y9RE.
- Repeating the same form after reload displayed Already received and did not create another booking_request_submitted event.
- Withdrawal controls and rt_consent_revoked were exercised. The final selected withdrawal-consent table was not conclusively captured after the asynchronous UI update; that last real-GTM check remains open. Mocked browser tests independently verify withdrawal/GPC behavior.
- **Important test boundary:** tests/gtm-preview-server.py uses the real draft container, a LOCAL form acknowledgement and a restrictive CSP. No email is sent by that QA server and Ads collection hosts are blocked. Tag Assistant reported the conversion-tag attempt as Failed, with CSP blocking observed. This is evidence of event/trigger/reference behavior, NOT a successful Ads conversion delivery. Do not report one recorded conversion or a fully passed GTM test.
- Google Data Manager run started November 21 at 15:13 PST later displayed **Completed; 0 rows imported; 0 rows with errors**. This validates the empty connection run only, not positive-row mapping or matching.

## Data Manager field audit

| Feed field | Observed destination / status |
|---|---|
| Google Click ID | Google_Click_ID → GCLID, mapped |
| Conversion Time | Conversion_Time → Conversion date/time, explicit time zone, mapped |
| Order ID | Order_ID → Row identifier, mapped; actual event-level dedup/adjustment behavior needs a genuine row check |
| Conversion Name | Feed writer sets exactly RT — Qualified Lead. Connection is attached to that conversion action (type ID 7912581747). The wizard had three mappings and no separate Conversion_Name mapping; do not claim it was mapped. Confirm the action binding and native Row identifier semantics before a positive live import. |

No contact, value, enhanced user-data, BRAID, consent-grant or session field was mapped. An empty successful run cannot prove date parsing, name resolution or deduplication of a nonempty row. After a genuine qualified inquiry, inspect run diagnostics and rejected rows, confirm the destination action, and verify the stable identifier prevents a repeat count. Prepared is not Imported. Removing a feed row cannot retract a previously imported event.

## GBRAID/WBRAID: held, Count One unchanged

Google's current offline-upgrade instructions explicitly require **Every** when importing BRAIDs and warn of upload errors otherwise. GBRAID is also non-unique and must preserve case. Therefore RT — Qualified Lead remains One and GCLID-only; do not silently enable BRAID export or change the business counting model. Supporting BRAID later requires curator approval of counting/deduplication and an actual connector test. No legacy Ads offline-upload API has been introduced.

Sources checked November 21:
- https://support.google.com/google-ads/answer/15479791?hl=en-GB
- https://support.google.com/google-ads/answer/17371255?hl=en
- https://support.google.com/google-ads-data-manager/answer/14184381?hl=en

## Native call tracking: recommended first option, not activated

Google forwarding numbers are available in the US and route to the existing (858) 888-2707. They support actual call reporting, not just tel: clicks. No separate CallRail subscription is needed for this Google path; ordinary advertising click charges still apply. Keep recording off.

Proposed staged flow, subject to approval before account/campaign/tag changes:
1. Use native call reporting / website call conversion measurement with a Google forwarding number. Preserve the destination number. Configure RT — Phone Call Received as Secondary/One using actual calls and an agreed duration rule, never a click trigger.
2. Owner records the received call using the exact caller number and call start time from Google's call details, plus connection/duration/reference and a private lead UUID. Owner alone qualifies the prospect.
3. Google documents call-conversion import keyed by caller number and call start time. This is a different source from the existing Import from clicks conversion. Do NOT push those values into the GCLID column or pretend the current feed imports calls. A supported qualified-call action/source design must be agreed with the curator; do not create a second Primary goal automatically.
4. Caller information is not available for every call; unknown/short/blocked-caller cases may be unmatchable. Native website call tracking also requires eligible advertising/call-asset/tag configuration. Because campaigns must not be changed in this task, no call asset or campaign was enabled and no test-call attribution is claimed.

This is an assessment and implementation proposal, not a connected call pipeline. No CallRail account, trial or purchase was made.

Sources:
- https://support.google.com/google-ads/answer/2382961?hl=en
- https://support.google.com/google-ads/answer/2454052?hl=en
- https://support.google.com/google-ads/answer/6275629?hl=en

## Safe publication order — owner approval required

0. Record current main SHA, published GTM version, private Apps Script source/properties, connection mapping and export contents. Review all PRs and green CI; no approval is implied by this checklist. Keep traffic off. Confirm GitHub Pages deployment configuration in the account; merges may publish automatically.
1. **PR28 → main.** Its explicit gtmEnabled:false release gate prevents loading the existing published container, even for visitors who previously consented. Verify website assets, form/SMS, denied/GPC behavior and that no GTM request is made. Do not flip the flag yet.
2. **PR29 → main.** Retarget from the stacked branch to main as needed; do not merge twice. Inspect the resulting diff and CI. Verify the new envelope reaches the real inbox and one private New/Test row, with retries deduplicated. The existing email route must remain available if the importer fails. No Qualified/Paid test in working statistics.
3. **PR30 → main.** Recheck the final combined tree, form regression and no design/pricing changes. Keep the website gate false. Pause private export while updating its combined Code.gs + lead-core.js + Export.gs source; preserve properties, IDs, rows and triggers. Run rtConfigure once to update the legacy-column note/visibility. Verify Journal provenance recovery and empty/test exclusions. Re-enable preparation only after the reviewed runtime and mapping check; a repository merge does not deploy Apps Script.
4. **Publish reviewed GTM separately**, only after owner approval and Preview gates pass. Verify redundant tag paused, one custom success trigger, correct conversion/action/reference and storage-consent checks. Do not add a duplicate GA4 import. Website gate stays false during GTM publication.
5. **Separate activation approval/commit:** set only gtmEnabled:true. The approved ID stays unchanged. The loader still requires visitor consent and honors GPC. Bump the tracking-config.js cache-version reference on every public route when activating or rolling back, verify the actual served config on each route, and allow for CDN/browser caches; publishing a file is not an instantaneous switch for cached or already-open pages. Smoke-check on the real domain before enabling paid traffic; do not create synthetic Qualified conversions. Complete the outstanding consent/transport checks and confirm the agreed call scope.
6. **Controlled $23/day launch only after the gates:** owner approves and runs the campaign. Use the first genuine eligible inquiry for manual qualification and native positive-row diagnostics; inspect rejection/matching and stable-ID deduplication. Do not increase budget based on tag firing or empty-run success. No campaign/budget change is performed by this work.

## Rollback / stop criteria

- Wrong action/reference, duplicate event, declined visitor measured, broken form or wrong runtime: keep/publish gtmEnabled:false and stop the rollout. Once a browser receives the new disabled config, the container will not load on a subsequent navigation. Bump the config asset version across routes and verify served/cached responses. Already-open tabs cannot be unloaded by changing a file; CDN/browser caching can delay rollback.
- Pause private EXPORT_ENABLED and native connection if a mapping/consent issue is found. Restore the last reviewed runtime or GTM version only with publication approval. Preserve emails, private lead data and audit records; never reset/clear live Sheets to fix an import.
- Already sent events need explicit review/retraction; hiding a row or disabling the loader does not undo them. Recover from the verified prior source/commit rather than a destructive repository reset.
- A missing click ID, denied consent or unknown call source is a legitimate unmeasurable case. Never invent attribution to make diagnostics green.
