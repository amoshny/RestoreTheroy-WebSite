# Restore Theory booking and pricing

Edit the three sedan prices, approximate service times and vehicle rules in `pricing.js`. Run `python3 tools/sync-pricing.py` to refresh the HTML and service structured data. Run the same command with `--check` before publishing. Compact SUVs and pickups require a quote until their rates are approved. Level 4 or 5 flags the need for review. It does not add a charge.

Planning benchmark for the owner: `(agreed service price − direct service expenses − customer acquisition cost) ÷ working hours`. Compare against $40 per working hour using actual costs and hours. Do not include tips.

## Direct booking delivery

The site is static. Until a delivery endpoint is verified, online submission is disabled with a visible explanation. Customers can call, open a simple SMS draft, or use Text These Details to transfer their entered details to their messaging app. They must tap Send there; opening a draft is not a delivered request.

The active FormSubmit AJAX recipient is `arsenij.moshko@gmail.com`. On November 18, 2026 the owner confirmed both clicking Activate Form and receiving the separate test inquiry titled “Restore Theory TEST: verify booking email delivery.” `restoreIntegrations.booking.formsubmit.verified` is now `true`. Tests sometimes timed out in the verification environment even though the owner received the email. Customer-facing success still requires a positive handler response; network errors retain input and do not claim delivery. No secret credentials belong in the browser.

Phone contact is `(858) 888-2707`. Existing `tel:` and `sms:` links initiate customer calls or SMS drafts; they do not send automatic owner notifications. Gmail mobile notifications are distinct from SMS delivery. No automatic SMS provider is configured or paid service activated.

Alternatively, set `restoreIntegrations.booking.endpoint` to an approved public HTTPS endpoint. This takes priority over the prepared FormSubmit adapter.

The endpoint must accept JSON POST and support CORS for the approved website origin. The payload fields are `requestId`, `size`, `vehicle`, `service`, `condition`, `zip`, `date`, `time`, `customerName`, `phone`, `email` and `notes`. Validate fields, limits and service IDs again on the server; apply rate limits or spam controls. Treat `requestId` as an idempotency key: a retry must not create a second job. Respond with a successful HTTP status and `{"ok":true,"requestId":"..."}` only after a request is durably accepted for delivery. Test receipt with the owner before using the live endpoint. A request is not a confirmed appointment.

The only configured reference ZIP is 92131 for Scripps Ranch. Other ZIP codes are reviewed by Ace. Add more ZIP rules only when coverage is confirmed. Photo upload requires an approved, secure storage and delivery path; the SMS fallback supports attaching photos in the messaging app.

## Reviews and offers

Update the dated review snapshot in `integrations.js` only after checking the Google Business Profile. To turn on the existing Trustindex integration, use the public widget ID for Restore Theory. The official Google G file comes from https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png.

Leave promotion fields blank until the exact offer is approved. Set the title, terms in the description, eligible service ID and delay in `integrations.js`. The popup is homepage-only and shows once per browser session.

No new analytics tag is installed. `analytics.js` prepares `click_to_call`, `sms_initiated`, `booking_form_started`, `service_page_view` and `booking_request_submitted`. The last event occurs only after an endpoint acknowledges acceptance. Calls and SMS taps are not completed calls or confirmed bookings. No customer contact details are included in these events. Supply the actual GA4/GTM ID and consent configuration before enabling delivery to analytics.

## Local verification

Run `python3 tools/check-site.py` and the `--check` modes of `tools/sync-pricing.py`, `tools/sync-areas.py` and `tools/sync-metadata.py` before publishing. Area names and representative coordinates are maintained in `service-areas.json`.

Browser tests cover mobile and desktop layouts, package estimates, gallery controls, navigation, form validation, and intercepted delivery success/failure. Mock responses do not establish real email delivery. The owner has now confirmed the separate real inbox test.
