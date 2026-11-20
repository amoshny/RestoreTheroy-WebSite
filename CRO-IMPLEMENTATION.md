# Restore Theory — focused CRO implementation, November 20, 2026

## Audit of the existing implementation

The site is static HTML/CSS/JavaScript on GitHub Pages. There are 17 public routes, three primary packages and a separate approved Full Detail + Polish page. Actual photo cases, gallery controls, optional extras, coverage data and the direct email/SMS-draft flows already existed; they are preserved rather than rebuilt.

The existing email endpoint is FormSubmit for the owner's approved inbox, arsenij.moshko@gmail.com. Activation and inbox receipt were already confirmed by the owner. A new owner-authorized test during this task used the updated staged client and the production origin/endpoint, with the clear test name `Restore Theory CRO TEST` and a note that no appointment or charge was requested. The handler returned HTTP 200 and `success: "true"`; the owner independently confirmed receiving this separate test email. Request reference: `7d305472-cc16-42a0-a0c1-e6b16fc98b7d`.

The audit found mixed Book Online/phone-primary labels, little reassurance beside the form, mandatory appointment preferences and a specialty-page CTA that led to a form without a Polish selection. No GA4/GTM identifier, connected CRM, actual call-completion feed, confirmed-appointment feed or payment feed was found.

## Changes

- Unify the primary route as **Request a Detail** across navigation, hero, package CTAs, case pages, guides and mobile docks, keeping existing URLs. Call Ace and Text Ace remain available. The form-page navigation now jumps to the existing form without reloading entered data.
- Keep the homepage SEO H1 and original Tesla composition. Add owner-operated value copy and the owner-approved, qualified response estimate: typically 5–15 minutes **when available**. The unverified 90% statistic is not published.
- Strengthen Meet Ace using first-person accountability, the existing real owner/Tesla portrait and real equipment photograph. Keep the single athletic-discipline sentence. Preserve confirmed payment-after-service/final-inspection wording; no new guarantee, insurance claim or uniform/work photograph is invented.
- Rewrite service introductions around customer outcomes while retaining work lists, exclusions, prices and optional extras. Keep exactly three primary cards. Replace the redundant service-resource row with three compact Client Care Paths linking to existing services.
- Add a calm form reassurance block, the existing Google profile link and centralized review labels. Maps' public browser view again exposed 5.0 but not the full review count. Keep **100+ as of Nov 19, 2026**, based on the owner's explicit confirmation; do not pretend the count is live or independently verified today.
- Keep Greg, Max and Kemi with their actual names and words. Expand two excerpts using exact original sentences and explicit ellipses for more useful vehicle/communication context.
- Keep vehicle size, service, condition, ZIP, name and phone required. Make preferred date/time optional, retaining native validation for any supplied date and offering flexible timing in the SMS draft. Preserve service/area preselection and recoverable-error data retention.
- Add the specified safe/access-permitted parking explanation beside location fields. ZIP format is checked; the form does not automatically approve unverified ZIPs or property access. No new service areas are introduced.
- Put the existing $289 Polish offer into the separate `pricing.js` specialties group, not the primary services group. The owner confirmed approximately **3 hours 30 minutes** for a standard sedan. Specialty-page requests now preselect it, apply unchanged size rules and name the correct service in email/SMS. The general form still opens with the three core options; Polish is available when arriving via its existing page.
- Use the exact requested received-message only after the real handler positively acknowledges acceptance. A message-app draft never creates a received confirmation. Keep loading/locking, activation/error rejection, retry references and acceptance-only events. Increase the client timeout to 30 seconds to reduce premature uncertainty with the existing provider; this is not a delivery guarantee or server-side deduplication claim.

## Measurement boundaries

`analytics.js` prepares these distinct actions through an existing Google tag or dataLayer: `cta_click`, `booking_form_started`, `booking_request_submitted`, `click_to_call`, `sms_initiated`, and service-page views. Names, contact details, notes and ZIPs are excluded from event parameters. Repeated submits while sending or after acceptance do not emit repeated success events.

A CTA/call-link click is not an accepted request, an opening SMS draft is not a sent message, and handler acceptance is not an appointment. `qualified_lead`, `booking_confirmed`, paid-service events and actual connected-call events are not emitted without an authoritative external source. No new tracking service, paid integration or advertising campaign is installed. Supply the existing GA4/GTM/Ads setup and consent requirements before configuring conversion delivery; confirmed/paid outcomes need owner or CRM records. Lesson 1.4 was not supplied, so no claim is made about matching its exact method or final campaign goal configuration.

The real email test proves inbox delivery for that request. FormSubmit does not provide server-side idempotency through this public adapter; repeated attempts after a lost response can still produce multiple emails with the same reference. SMS/call handling is tested through link/draft construction and browser emulation, not actual physical-phone delivery. Automatic owner SMS notifications remain a separate, unconnected service.

## Maintenance and remaining facts

- `pricing.js`: three primary services, separate approved specialty and existing size logic.
- `tools/sync-pricing.py`: all public static prices/times and Service JSON-LD, including Polish.
- `integrations.js`, `reviews-snapshot.js`, `tools/sync-reviews.py`: one manual public review snapshot with matching static labels.
- `addons.json`, `tools/sync-addons.py`: unchanged optional extras across package pages.
- Existing result templates and generators have been updated so re-rendering cannot restore old CTA labels.

Keep the disabled promotion disabled. Do not launch a maintenance subscription without agreed terms, price and availability. No new discount, fake scarcity, fabricated review or guarantee was introduced. Real photos of Ace performing work can enrich future proof; the available equipment photo is not presented as such a photograph.

## Completed verification

- All 17 routes checked at 320, 390, 1024 and 1440 CSS px: no horizontal overflow, JavaScript page errors or missing local responses. Commercial navigation uses the unified CTA; legal pages retain their existing simple header.
- Checked header bounds, mobile menu/Escape, care-path destinations, 10-photo Interior, eight comparisons, lightbox arrow keys/closing and unchanged review authors/count/date.
- On each width, tested a complete SMS draft with flexible preferences and area preselection: correct +1 phone URI, iOS/desktop body separators, correct service/context and no request-received event.
- Tested the specialty page → correctly preselected form → $314 mid-size SUV / $578 RV / individual quote for compact SUV estimates. Tested handler rejection, retained fields, same retry reference, rapid repeat-submit locking, exact success copy and one acceptance event. These response scenarios used intercepted test responses and did not send additional emails.
- A separate real staged-client request was acknowledged by FormSubmit and its inbox receipt confirmed by the owner, as recorded above.
- Tested that the form-page header CTA preserves entered details instead of reloading the page. Kept required ZIP and phone validation and keyboard-accessible native controls.
- Confirmed the original styles.css palette, three core price/time definitions, vehicle rules and all four service inclusion lists match the pre-change snapshot exactly. Static metadata, local-link reachability, sitemap and all synchronization checks passed.
- Inspected desktop/mobile screenshots. The trust block is placed before form submission so mobile users encounter input fields earlier. Existing images are retained, with explicit dimensions and offscreen lazy loading.

Browser checks use local Chrome and an emulated iPhone user agent; they are not physical-phone testing. External Google Fonts are stubbed and map-tile failure simulated for repeatable fallback checks. This is not a Lighthouse/field Core Web Vitals score or a certification of external service uptime. No new advertising performance or conversion-rate result is claimed.
