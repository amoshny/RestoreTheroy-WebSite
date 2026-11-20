# PR1 — attribution and lead identity

Prepared November 20, 2026. Review only; do not merge/deploy until owner approval. No Google Ads conversion actions, Sheets integration or CallRail configuration created.

## Behavior

- `tracking-config.js`: empty public `gtmId`, 30-day attribution retention. No fake production IDs.
- `lead-tracking.js`: capture gclid/gbraid/wbraid and utm_source/medium/campaign/term/content/id only after explicit measurement consent; last tagged visit replaces the entire prior campaign, untagged navigation retains it. No full URL/referrer or inferred Google source. Values are length/character checked. Identifier presence is not proof of valid Ads attribution; matching is a later server/import responsibility.
- All 17 routes and the results generator template load config/tracking before other deferred code. Storage expiry is checked on read and before sending. localStorage unavailable: current-page memory only; navigation attribution cannot be promised.
- `rtLeadTracking.setConsent(true|false)` is the integration hook for a reviewed consent UI/CMP. Defaults denied, honors Global Privacy Control, remembers a choice for 180 days. There is deliberately no hidden auto-grant. **No consent UI is connected in PR1: live measurement remains disabled until this is supplied.** Keep existing design untouched. Future UI needs clear accept/decline/revoke actions and disclosed purposes; do not call this API just on page load.
- Google consent defaults precede tag loading; storage/measurement grant does not grant ad_user_data or ad_personalization. Enhanced conversions and remarketing remain denied. GTM loads only for a validated owner-supplied container after grant, and skips existing gtag/GTM/Google script installations. Revocation clears saved attribution and reloads if a container was loaded. Existing independent tags must also be reviewed before activation. No noscript iframe bypasses consent.
- Lead UUID, createdAt, accepted flag and SHA-256 fingerprint of the normalized form are in same-tab sessionStorage (no readable contact fields); attribution there is consent-gated. Fingerprint is pseudonymous, not anonymous. Same unchanged request has the same reference after SMS, failed submission and reload; changed form creates a new reference. This is the most recent request, not a CRM history. Storage unavailable: same-page memory only. Same-tab state expires after the configured attribution TTL (30 days); closing the session clears it. Cross-tab/device deduplication is not claimed.
- FormSubmit still receives the original customer fields, plus requestId/createdAt and flat `attribution_*` fields when permitted. Attribution timestamp is epoch milliseconds; createdAt is ISO UTC. FormSubmit remains email-only. SMS includes Reference UUID, never click IDs. SMS-only drafts are NOT registered leads or received messages; without PR2 there is no durable lookup from that reference to attribution.
- Form phase locks before asynchronous hashing; rapid submissions cannot race. Accepted state suppresses a repeated unchanged request and event after reload. An acknowledged submission calls `booking_request_submitted` with service and lead_id, only when measurement is permitted. Never mark a click, SMS draft or submission Qualified. A custom backend response must echo the same requestId.
- FormSubmit retries can still produce duplicate email if its response is lost after delivery. The repeated reference identifies these but only a backend/idempotent store can enforce durable deduplication (PR2). Client tracking is not a security boundary.

## GTM / account-side activation (not performed)

1. At tagmanager.google.com select the owner-owned website container; copy `GTM-…` shown at the top of Workspace. If none exists, create a Web container under the owner's account. Do not create a second existing container.
2. Review consent UI/notice and connect its measurement choice to the API above. Validate grant/deny/revoke in Tag Assistant before enabling tags. Enhanced data/personalization need separate reviewed permissions in later PRs.
3. Supply GTM ID in tracking-config.js only in a reviewed follow-up. This alone does not configure a conversion.
4. Google Ads: Goals → Conversions → Summary: create/review **RT — Request Service Submitted**, Secondary, Submit lead form, Count One. Obtain its conversion ID/label from Tag setup → Use Google Tag Manager. In GTM use Custom Event `booking_request_submitted`; pass data-layer `lead_id` as transaction ID. Do not also import the same form event from GA4. Do not use generic form/click triggers. Test only with paused/non-production destinations until a real inquiry exists.
5. Qualified Lead Primary is exclusively manual qualification + offline import in PR3. Phone Call Received Secondary awaits real call tracking. No account changes are part of this PR.

## Checks performed

- `node --test tests/lead-tracking.test.cjs`: five suites, denied/GPC/grant/revoke, navigation, new campaign, expiry, malformed input, retry identity, once-only acceptance, storage failures, no/invalid/duplicate GTM.
- Browser `tests/attribution-browser.cjs` with Playwright and local server: 390/1440px, landing → service → form, SMS reference without click ID, rejected handler, reload/retry same ID, rapid submissions, exactly one acknowledged event, reload duplicate suppression, no overflow/page exceptions, denied consent still sends form without attribution/events. HTTPS requests intercepted; no real email, Google tags or conversions sent. Native SMS launch suppressed in test; generated URI/content checked.
- Existing 17-route metadata/assets/links/sitemap checker passes. No design, prices or service data changed.
- These tests do NOT verify Tag Assistant, actual Ads processing, real SMS receipt, consent legal adequacy or backend deduplication. Prior email delivery was already confirmed by owner; no new real test email was sent.

## Scope after review

PR2 only after PR1 approval: private Sheets storage and manual statuses. PR3: supported native Data Manager import, actual Qualified At and durable import deduplication. PR4: approved call-tracking selection; no purchase yet.
