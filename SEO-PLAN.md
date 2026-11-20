# Restore Theory — focused SEO and local visibility plan

Prepared November 18, 2026. This release contains the follow-up SEO/content updates. The separate email activation release is already live.

## Completed local implementation

- Retain the existing green/white/dark design, three primary prices ($169/$209/$269), inclusions and size adjustments.
- Strengthen `/interior-detailing/`, `/essential-detail/` and `/deep-clean-protect/` with distinct titles/descriptions, service-focused headings, package boundaries, questions, SMS alternatives and useful links.
- Add `/results/` and four case pages alongside the existing Lincoln page. Five distinct vehicles: Lincoln, Chevrolet, Range Rover, Lexus and Tesla. Use existing real before/after files, describe visible changes, and distinguish available service recommendations from an assertion about the exact package used on a job.
- Owner confirmed the examples have no neighborhood attribution. No job addresses, treatment times, tools, product names or guarantees are inferred from photographs.
- Add `/guides/choose-a-detailing-package/` and `/guides/prepare-for-mobile-detailing/`; connect them to services, cases, coverage and booking. Their price/time markup is checked against `pricing.js`.
- Enrich five priority guides within `/service-areas/`: Poway (access), Mira Mesa (shared parking), Scripps Ranch (92131 and location confirmation), Rancho Bernardo (service selection), Rancho Peñasquitos (condition/photos). Each has relevant FAQ, service and booking links.
- Keep 13 actual coverage locations. Do not create five separate pages that only substitute the neighborhood name. Distinctive local jobs, permission to identify the area and useful local access experience would support standalone pages later.
- Add Maserati and Mercedes interior photographs from the newly supplied originals. Keep BMW and the black rear cabin first. Interior has 10 photos; eight before/after pairs remain intact. Use the new Tesla equipment image in the area guide and preparation guide. Gallery shape and manual controls are retained.
- Preserve live FormSubmit email delivery. Carry a validated area selection from the hub into the form, outgoing email and optional SMS draft without adding another required field. Automatic SMS notifications to the owner still require a separate provider.
- Synchronize all 17 indexable local routes into the sitemap, check local links/assets/fragments, unique titles/descriptions/H1s, self-canonicals, OG metadata, JSON-LD syntax and reachability from the homepage. Add three-level breadcrumbs for cases.

## Indexing: readiness versus actual status

Search Console was opened in the browser but showed the public sign-in page. No property report or verified account was available. Actual indexed status, selected Google canonicals, search impressions/clicks, crawl errors, manual actions and submitted sitemap status remain unverified. No indexing requests were submitted.

After deployment, sign into the verified `restoretheory.net` property, submit `https://restoretheory.net/sitemap.xml`, inspect the three service pages and representative new cases/guides, and request indexing for important changed URLs where appropriate. A sitemap and successful URL inspection do not guarantee indexing or rankings. Do not repeatedly submit the same URL hoping for faster crawling.

Official guidance: https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl and https://developers.google.com/search/docs/essentials/spam-policies .

Local Chrome checks are not field Core Web Vitals, PageSpeed scores or Google Rich Results validation. Runtime errors and layout are checked locally; real-device SMS delivery, external map tile reliability and production performance need their respective checks.

Final checks completed: all 17 routes at 320, 390, 1024 and 1440 CSS px; one H1 per route; no horizontal overflow, missing local resources or JavaScript page errors. Checked FAQ expansion, phone targets, 10-photo Interior with preserved first two images, eight comparison pairs, five case links, lightbox keyboard controls/closing, mobile menu and service/area preselection. At 390 and 1440 px the mocked email handler additionally verified the selected area in the payload, estimate consistency, activation rejection, retained fields on failure and acceptance-only analytics. These extra tests did not send real customer email.

Screenshots use local Chrome with external Google Fonts replaced by an empty stylesheet and map tile failure simulated. These checks cover the fallback layout, not external service uptime. Source image widths/heights and offscreen lazy loading are retained; selected preview sizes are approximately 61 KB (Maserati), 63 KB (Mercedes) and 93 KB (equipment), with larger files loaded separately where needed.

A live mobile PageSpeed Insights API request on November 18 returned HTTP 429 / RESOURCE_EXHAUSTED (shared API quota). No performance score or new field Core Web Vitals result was obtained. Full-page desktop/mobile screenshots and the four-width browser check results are saved in the session's `seo` preview artifact folder.

## Legitimate local-link shortlist — research, not outreach

No accounts, memberships, directory submissions, purchases, messages or partnership claims have been made.

| Opportunity | Verified basis | Sensible next step |
| --- | --- | --- |
| Poway Chamber of Commerce | Its official benefits page includes an online business directory, networking and community partnerships: https://www.poway.com/member-benefits/ | Evaluate genuine membership/customer value and cost with Ace. Do not buy membership solely for an SEO link. |
| Mira Mesa Town Council | It maintains an official business-member list: https://www.miramesatowncouncil.org/business-members/ | Check membership eligibility and participation options before applying. A listing or clickable backlink is not guaranteed. |
| Rancho Bernardo Business Association | Listed in the regional chamber's directory: https://chamber.sdbusinesschamber.com/list/member/rancho-bernardo-business-association-san-diego-20037 | Confirm current membership requirements, real events and whether Restore Theory fits. |
| Local automotive and property partners | Potential relationship categories: independent repair/tire shops, vehicle clubs, and apartment/workplace managers in actual coverage areas. No specific existing partnership is verified. | Ask Ace for businesses he already works with. Offer a useful preparation guide or a real joint customer case if appropriate. Do not exchange bulk keyword links. |

Public references were checked November 18, 2026. Memberships can cost money and are not authorized purchases. Paid placements should be appropriately identified by their publishers. Avoid paid ranking promises, bulk backlinks, fake directory addresses and mandatory reciprocal-link schemes.

## Google Maps is a separate workstream

The public review snapshot is centrally maintained in `integrations.js`: 5.0 / 100+, dated November 19. The owner confirmed receiving the hundredth review; the limited public Maps view showed 5.0 but did not expose the count or all review text. The count is an owner-confirmed snapshot, not live synchronization. No Google Business Profile fields or reviews were changed in this task.

Review profile completeness, truthful service areas/category and hours, real work photographs and responses to genuine reviews in the owner's account. Ask actual customers for honest feedback without manufacturing reviews. Relevance, distance and prominence affect local results; a target review count cannot guarantee a Maps position.

Official basis: https://support.google.com/business/answer/7091 .

## What to monitor

- Weekly Search Console impressions, clicks and query/page pairs for the three services, cases and two guides; distinguish indexing from ranking.
- Accepted form requests separately from call clicks and SMS drafts. Email acceptance is not a confirmed appointment or qualified lead.
- Actual delivery to the inbox, recoverable form failures, and duplicate requests when a network response is lost.
- Mobile field performance after enough data exists; no assumed traffic or revenue improvements.
- Referral visits and real enquiries from any approved local partnership, not the raw number of backlinks.

No assessment of Hothex's agency quality was made: no video, proposal, deliverables or independent results were supplied. The implementation does not imply agency endorsement or guaranteed rankings.
