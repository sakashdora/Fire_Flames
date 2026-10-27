# Experience and brand specification

The public site should feel like the brochure brought into a clear, fast web experience: charcoal, metallic gold, ember orange, deep red and warm white. Management screens should emphasize readable data and unambiguous status. The attached design boards are static concepts, not working screens.

## Two event entrances
Desktop hero shows two equal panels simultaneously, with a shared institution header and the event date above them. Left: “Fire & Flames / The E-Fest / Organized by ED Cell”, six activities, documented ₹36,000 activity pool, “Explore E-Fest”. Right: “Kurukshetra / Esports / Organized by Srustiprosar”, Free Fire and BGMI, advertised ₹20,000 esports pool, “Explore Esports”. Unknown fees show “To be announced”. Do not put a single ambiguous Register button over both panels or hide one track in an auto-rotating carousel.

At 360–430 px, use stacked compact hero panels in a clear order, each with its organizer label and action. Both are reachable immediately without dismissing an intro. A compact top-level track selector links to each section. Use separate URLs `/e-fest` and `/esports`; individual event pages live below the correct track. Selection persists through sign-in using a validated internal return path. Site-wide account view groups registrations by organizer.

Avoid compulsory loading animations, scroll hijacking, autoplay sound and heavy WebGL. Optional brief ember animation starts after content is usable, stops offscreen/in background and honors reduced motion. Deep links, back navigation and recovery after refresh must work without replaying an intro.

## Design tokens
| Token | Proposed value | Usage |
|---|---|---|
| Canvas | #0B0B0D | Public background |
| Surface | #161619 | Cards and panels |
| Raised surface | #222226 | Dialog and form panels |
| Primary text | #F7F2E8 | Main copy on dark |
| Secondary text | #C4BFB5 | Supporting labels |
| Ember | #FF781F | Primary action with near-black text |
| Gold | #F5BF42 | E-Fest accent and highlights |
| Deep red | #9B1C17 | Decorative brand accent, not small text |
| Border | #3A3530 | Field boundaries |
| Success | #91E6B5 | With “Verified” or “Recorded” text |
| Warning | #FFD57A | With reason and next action |
| Error | #FFB4AB | With message, not color alone |

These are proposed web tokens matched to the PDF visually, not a claim that the brochure specifies exact hex codes. Use the extracted official logos without redrawing or recoloring. The ED Cell badge is only 160×160 in the source; render it modestly and request a higher-resolution official master for large print. Preserve source aspect ratios and transparency.

Use a condensed bold display typeface for short event headings and a readable sans-serif for content, forms and tables. Prototype boards use available Arial; final font family and self-hosting license must be verified. Minimum body size 16 px on phones; avoid compressed paragraph fonts from the brochure. Render fees, dates and requirements as HTML, not flattened images.

## Layout and accessibility
Use an 8 px spacing base, 16–24 px phone gutters, 24–32 px desktop card gaps and a 1200–1280 px content width. Target 44×44 px controls or larger; mobile scan action 56 px. Keep visible keyboard focus, skip link, semantic labels, error summaries, descriptive button text and sufficient contrast. Gold/orange buttons use near-black text; test contrast, including disabled states. Tables convert to labelled record cards on narrow screens, with no clipped actions. Charts include text summaries.

Meet WCAG 2.2 AA as the acceptance objective, with manual keyboard/screen-reader review. Reference: https://www.w3.org/TR/WCAG22/. Practical target-size reference: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum. Use reduced-motion preferences and never use animation to communicate the only copy of a status.

## Screen inventory
| Area | Required screens | Critical states |
|---|---|---|
| Public | Dual hero, track pages, event detail, rules, schedule, help, approved results | Loading, unavailable, closed, sold out, fee unknown |
| Authentication | Student sign-in, teacher sign-in, verification, reset, MFA, access request | Expired link, invalid credentials, disabled account, unassigned teacher |
| Student | Profile, college details, event choice, roster invitations, review, checkout, payment status, pass, history | Incomplete team, waitlist, correction needed, refunded, revoked pass |
| Volunteer | Duty selection, scanner, scan result, lookup, incident, shift summary | Wrong station, off duty, duplicate, denied camera, offline |
| Judge | Assigned candidates, rubric, save draft, submit lock, conflict declaration | Missing criterion, score limit, locked score, reopened revision |
| Admin | Overview, scoped event setup, roster, reconciliation, assignments, schedules, result proposals, broadcasts | Pending approval, conflict, partial failure, stale edit |
| Super admin | Institution overview, roles, settings approvals, beneficiary versions, exports, audits, recovery | Last-admin protection, dual approval, suspended track |

## Form and status design
Registration is a short stepper: event → profile → team → review → payment → status. Save drafts server-side for signed-in users. Keep one primary action per step and show the selected organizer/event/fee summary throughout. Preserve valid input after errors. Required fields are visibly labelled. Show exact fees rather than “starting from” during checkout.

Student dashboard shows “Action needed”, “Payment under review”, “Confirmed” and “Waitlisted” separately. A pass button is disabled with an explanation until all conditions are met. Teacher workspace shows assignments and an access-request route if none exist. Admin dashboard starts with review queues and operational exceptions, not vanity metrics. Super-admin dashboard emphasizes unresolved approvals and access risk.

## Asset and performance budget
Use named source artwork from `assets/brand`, optimized derivatives from `assets/web`, and the generated background only for decorative atmosphere. Preload at most the primary hero background; lazy-load offscreen event cards. Suggested first-viewport image budget: 350 KB mobile and 700 KB desktop; initial route JavaScript target 200 KB gzip excluding deferred scanner/management modules. Set image dimensions to prevent shifts. Preserve a solid-color background when images fail. Do not send the 42 MB brochure as a page background; brochure download is explicit.

## Copy examples
Primary actions: “Explore E-Fest”, “Explore Esports”, “Review registration”, “Submit payment details”, “View my pass”, “Start duty”. Payment message: “Your payment details are under review. We will notify you after verification.” Offline scanner: “Connection lost. Attendance has not been recorded.” Staff rejection: “This action is outside your assigned duty. Contact the event desk.”
