# PR1 — attribution and lead identity

Prepared November 20, 2026. Review only; do not merge/deploy until owner approval. No Google Ads conversion actions, Sheets integration or CallRail configuration created.

## Behavior

- `tracking-config.js`: empty public `gtmId`, 30-day attribution retention. No fake production IDs.
- `lead-tracking.js`: capture gclid/gbraid/wbraid and utm_source/medium/campaign/term/content/id only after explicit measurement consent; last tagged visit replaces the entire prior campaign, untagged navigation retains it. No full URL/referrer or inferred Google source. Values are length/character checked. Identifier presence is not proof of valid Ads attribution; matching is a later server/import responsibility.
- All 17 routes and the results generator template load config/tracking before other deferred code. Storage expiry is checked on read and before sending. localStorage unavailable: current-page memory only; navigation attribution cannot be promised.
- `rtLeadTracking.setConsent(true|false)` is the integration hook for a reviewed consent UI/CMP. Defaults denied, honors Global Privacy Control, remembers a choice for 180 days. There is deliberately no hidden auto-grant. Local consent-controls.js/css supplies a nonmodal, in-flow notice with equally styled Allow measurement / No thanks and Close. Privacy choices is always available in the footer. Close/Escape dismisses this page only without granting; decline/allow persists. GPC disables Allow. Keyboard focus returns to the opener. Existing design/prices/email/SMS remain unchanged beyond these requested controls.
- Google consent defaults precede tag loading; storage/measurement grant does not grant ad_user_data or ad_personalization. Enhanced conversions and remarketing remain denied. GTM loads only for a validated owner-supplied container after grant, and skips existing gtag/GTM/Google script installations. Revocation clears saved attribution and stops rtTrack immediately WITHOUT reloading or erasing an in-progress form. Google receives a denied consent update. Already loaded vendor code can send consent-state pings; zero network requests after revocation is not claimed. On the next page, denied state prevents loading the container. Configure GTM additional consent checks before deployment. Existing independent tags must also be reviewed before activation. No noscript iframe bypasses consent.
- Lead UUID, createdAt, accepted flag and SHA-256 fingerprint of the normalized form are in same-tab sessionStorage (no readable contact fields); attribution there is consent-gated. Fingerprint is pseudonymous, not anonymous. Same unchanged request has the same reference after SMS, failed submission and reload; changed form creates a new reference. This is the most recent request, not a CRM history. Storage unavailable: same-page memory only. Same-tab state expires after the configured attribution TTL (30 days); closing the session clears it. Cross-tab/device deduplication is not claimed.
- FormSubmit still receives the original customer fields, plus requestId/createdAt and flat `attribution_*` fields when permitted. Attribution timestamp is epoch milliseconds; createdAt is ISO UTC. FormSubmit remains email-only. SMS includes Reference UUID, never click IDs. SMS-only drafts are NOT registered leads or received messages; without PR2 there is no durable lookup from that reference to attribution.
- Form phase locks before asynchronous hashing; rapid submissions cannot race. Accepted state suppresses a repeated unchanged request and event after reload. An acknowledged submission calls `booking_request_submitted` with service and lead_id, only when measurement is permitted. Never mark a click, SMS draft or submission Qualified. A custom backend response must echo the same requestId.
- FormSubmit retries can still produce duplicate email if its response is lost after delivery. The repeated reference identifies these but only a backend/idempotent store can enforce durable deduplication (PR2). Client tracking is not a security boundary.

## GTM / account-side activation (not performed)

1. At tagmanager.google.com select the owner-owned website container; copy `GTM-…` shown at the top of Workspace. If none exists, create a Web container under the owner's account. Do not create a second existing container.
2. Review the supplied consent UI/notice. It already connects to the API. Validate grant/deny/revoke in Tag Assistant before enabling tags. Enhanced data/personalization need separate reviewed permissions in later PRs.
3. Supply GTM ID in tracking-config.js only in a reviewed follow-up. This alone does not configure a conversion.
4. Google Ads: Goals → Conversions → Summary: create/review **RT — Request Service Submitted**, Secondary, Submit lead form, Count One. Obtain its conversion ID/label from Tag setup → Use Google Tag Manager. In GTM use Custom Event `booking_request_submitted`; pass data-layer `lead_id` as transaction ID. Do not also import the same form event from GA4. Do not use generic form/click triggers. Test only with paused/non-production destinations until a real inquiry exists.
5. Qualified Lead Primary is exclusively manual qualification + offline import in PR3. Phone Call Received Secondary awaits real call tracking. No account changes are part of this PR.

## Checks performed

- `node --test tests/lead-tracking.test.cjs`: seven suites, denied/GPC/grant/revoke, navigation, new campaign, expiry, malformed input, retry identity, once-only acceptance, storage failures, no/invalid/duplicate GTM.
- Browser `tests/attribution-browser.cjs` with Playwright and local server: 390/1440px, landing → service → form, SMS reference without click ID, rejected handler, reload/retry same ID, rapid submissions, exactly one acknowledged event, reload duplicate suppression, no overflow/page exceptions, denied consent still sends form without attribution/events. HTTPS requests intercepted; no real email, Google tags or conversions sent. Native SMS launch suppressed in test; generated URI/content checked.
- Existing 17-route metadata/assets/links/sitemap checker passes. No design, prices or service data changed.
- These tests do NOT verify Tag Assistant, actual Ads processing, real SMS receipt, consent legal adequacy or backend deduplication. Prior email delivery was already confirmed by owner; no new real test email was sent.

## Scope after review

PR2 only after PR1 approval: private Sheets storage and manual statuses. PR3: supported native Data Manager import, actual Qualified At and durable import deduplication. PR4: approved call-tracking selection; no purchase yet.


## PR28 review follow-up: US-only consent and late arrival

California does not automatically impose the EU opt-in model on every small local website. CCPA applicability depends on business thresholds/relationships and data practices; we have not established that Restore Theory meets those criteria. Covered businesses must honor sale/sharing opt-outs and GPC. This PR deliberately chooses a simple voluntary opt-in for optional measurement; it does not claim an EU requirement or comprehensive CCPA legal certification. No cross-context remarketing or Enhanced Conversions is enabled. Any future change to advertising purposes needs a separate notice/permissions review.

For a real visitor: a compact notice appears in normal document flow on the first unresolved page; it does not cover booking controls, sticky contact buttons or the photo viewer. Allow enables attribution and the configured GTM; No thanks keeps both off and remembers the choice. Close keeps measurement off but asks again on a later page. Footer Privacy choices can reopen the controls; Turn off measurement preserves form inputs. No reload is forced. GPC takes precedence over Allow.

**Late-consent limitation:** entry with gclid → untagged service page → Allow cannot recover the original GCLID/GBRAID/WBRAID/UTMs in this implementation. We do not pre-store an advertising identifier in sessionStorage, decorate links, or reconstruct it from referrer/history. The first-page notice explicitly explains this limitation; accepting there captures the current URL and then preserves attribution for subsequent navigation. Declining or deferring must remain possible. Saving a pending ad identifier before permission would change the chosen policy, so it is not silently added as a fix. A new tagged landing after consent can be recorded normally. Invalid, expired or blocked-storage identifiers can also be unavailable. No missing attribution is guessed or labelled Google Ads.

Additional tests: late consent versus early consent, unchanged draft upgraded with attribution only after grant, persisted decline, footer withdrawal without input loss, focus/Escape, GPC disabled Allow and 320/390/1440px overflow. Mock external requests only. No real conversion or email is generated.

### Reproducible checks

`npm ci --ignore-scripts`, `npx playwright install chromium`, `npm test`. Start `python3 -m http.server 8000 --bind 127.0.0.1` in a separate shell, then `npm run test:browser`. Optionally set CHROME_PATH to a local Chrome executable; otherwise use Playwright's pinned Chromium. package-lock.json pins test dependencies and integrity hashes. These are development tools, not website runtime dependencies.

`.github/workflows/site-checks.yml` runs on pull_request against main (not pull_request_target), with contents:read, no secrets, no deployment, 15-minute limit and cancellation of superseded runs. It installs pinned Playwright Chromium, runs logic/static checks, starts a local server, and runs mocked browser checks. No Google credentials are needed. Successful CI is evidence of code tests, NOT evidence of Google Ads receipt.

### Exact GTM actions still required from owner

1. Open tagmanager.google.com → the business-owned Web container → Workspace; send its public GTM-… ID. Do not paste the standard GTM snippet separately: this site's consent-gated loader owns installation. If no container exists, create one under your account first.
2. In the container, enable Consent Overview. Google tags must respect storage consent; set additional consent checks for ad_storage and analytics_storage on measurement/conversion tags so they cannot newly fire after withdrawal. Leave user-data collection, Enhanced Conversions and remarketing disabled in this PR; ad_user_data/ad_personalization remain denied.
3. Create a Data Layer Variable (Version 2) named `lead_id`. Create a Custom Event trigger named `booking_request_submitted` (exact match). The corresponding Google Ads Conversion Tracking tag must use the genuine conversion ID/label for **RT — Request Service Submitted**, and the lead_id variable as Transaction ID. Conversion Linker also requires advertising-storage permission. No All Pages/click/form-submit trigger for this conversion.
4. Google Ads → Goals → Conversions: the form action is Secondary, Submit lead form, Count One. Do not also import the same event through GA4. Qualified Lead stays manual/offline and has NO website trigger. Phone clicks remain clicks, not Phone Call Received.
5. Use Preview / Tag Assistant on the reviewed build with live conversion destinations paused: denied/GPC must not load GTM; Allow loads one container; a rejected form has no success event; acknowledged mocked request produces one event/reference; withdrawal stops further website measurement events and leaves form data intact. Do not fire test events into production Ads conversions. Recheck with the first genuine inquiry after separately approved launch; no fake qualified or paid orders.
6. This repository PR and the GTM container are separate publications. Neither is approved to publish yet. Account-side configuration/Tag Assistant and Google Ads matching remain unverified until access/IDs and review.

Sources checked November 20, 2026:
- https://www.oag.ca.gov/privacy/ccpa (scope, opt-out and GPC)
- https://developers.google.com/tag-platform/security/guides/consent (basic consent, default/update)
- https://developers.google.com/tag-platform/security/concepts/consent-mode (basic versus advanced behavior)


## Release gate — November 22, 2026

`tracking-config.js` now contains the verified container ID and `gtmEnabled: false`. The loader requires explicit `true` AND visitor consent. This prevents merging PR28 from immediately loading an old published GTM version before PR29/30 and the reviewed container are ready. Do not activate it as a side effect of merging another PR. After explicit owner approval, merge PR28 → PR29 → PR30 with CI/smoke checks, update the private runtime, publish the reviewed GTM version, then make a separately reviewed activation commit changing only gtmEnabled to true. Rollback to false stops loading on subsequent navigations; it cannot unload existing tabs or undo sent events. See tracking/RELEASE-CHECKLIST.md for gates and evidence. The local-only Preview server overrides the flag only in its HTTP response; published assets remain off.
