# Restore Theory operations audit — November 18, 2026

## Starting point

- Static HTML, CSS and JavaScript served by GitHub Pages. No framework, server, package manifest, TypeScript, build pipeline or existing form recipient was present in the local project.
- Nine existing public routes, three primary sedan prices at $169 / $209 / $269, separate legitimate Full Detail + Polish page at $289.
- Existing dynamic estimates and dated review snapshot were centralized. The booking form opened an SMS draft when no HTTPS endpoint was configured.
- The interactive desktop gallery existed, but mobile CSS hid it in favor of static pairs. Mobile CSS also hid the navigation menu.
- Existing Essential and Deep Clean FAQ sections were nested in the pricing notice. Static metadata and local links were present, but the area list had no standalone directory.
- No installed GA4/GTM ID, calendar integration or verified delivery endpoint was found.
- PGH's current homepage was read as an architecture reference. Its services, area directory, gallery and contact links informed navigation only. No copy, claims or assets were imported.

## Implemented direction

- Preserve all core prices, surcharges, package inclusions, existing URL paths and original green / white / dark palette.
- Add /service-areas/ with 13 confirmed areas, practical access guidance and substantive planning sections for the five priority areas. No separate neighborhood pages: the repository contains no confirmed location-specific jobs or testimonial attribution. Original facts and photos are needed before publishing those pages.
- Keep /full-detail-polish/ and its existing $289 specialty offer unchanged in scope, outside the three main pricing cards.
- Improve booking state handling, explicit SMS fallback and the prepared FormSubmit adapter. The owner's authorized recipient is arsenij.moshko@gmail.com.
- A real FormSubmit activation test was attempted. It timed out after 18 seconds with no response. Inbox delivery and activation have not been verified. The provider's verified flag stays false.
- Keep the online-submit button disabled until a verified endpoint exists. Text/photo contact remains available immediately and entered details can be sent by SMS. No HTTP success message is shown for an SMS draft.
- Restore mobile category gallery and menu. Keep original photos, lightbox, manual controls and touch scrolling.

## Owner setup

1. Confirm or activate the receiving endpoint for arsenij.moshko@gmail.com using FormSubmit, or provide an existing approved CRM/form endpoint.
2. Perform an actual test from the published origin and confirm the exact test request arrives in the inbox. Only then set formsubmit.verified=true.
3. Supply GA4/GTM ID and the site's consent configuration before enabling analytics delivery. Prepared events contain no customer names, phone numbers, emails, ZIP codes or message text.
4. Confirm current live scope/price of specialty polishing if changing the preserved page.
5. Provide real job photographs, work details and permission to identify the service area before adding standalone district pages. Weather/rescheduling rules also need owner confirmation.

## Measurement and deployment

This change is local and does not alter hosting or publish the website. Browser QA uses local Chrome at phone and desktop widths, with test interception for email responses. Intercepted responses are not evidence of real inbox delivery. On-device SMS delivery, physical mobile keyboards, public URL status codes and field Core Web Vitals require a production/device check. Lighthouse is not installed in this workspace.

## Completed checks

- Local Chrome widths: 320, 375, 390, 768, 1024 and 1440 px. Ten routes checked for horizontal overflow, runtime errors, missing local resources and visible image decoding.
- Mobile menu, keyboard access, gallery tabs/arrows/lightbox, touch swipe, focus return, area selection and map-independent list navigation.
- All three sedan prices, +$25 / +$50 / 2× adjustments, package preselection, native required fields, phone validation and SMS draft content.
- Intercepted custom endpoint and FormSubmit tests: recoverable failure, retained input, retry identifiers, activation guard, repeated-submit prevention and acceptance-only analytics. Real delivery remains unverified.
- Static check: titles, descriptions, canonical/OG metadata, one H1, local links/fragments, sitemap membership and JSON-LD syntax. This is not a Google rich-results eligibility certification.
- Local performance sample: three fresh Chrome loads at 390 × 844, DPR 1, no throttling and external fonts blocked. Median observed LCP: 104 ms before / 96 ms after; CLS 0 / 0; DOMContentLoaded 67 / 72 ms. These local observations do not predict production speed or measure INP. Raw observations and screenshots are in the operations preview artifact directory.

After deployment, verify actual inbox receipt first, then monitor delivery errors, accepted requests separately from SMS/call taps, Search Console indexing for the hub, and field mobile performance. Do not infer qualified leads or confirmed appointments from these interaction events.
