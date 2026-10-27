# Product and scope

Build one trustworthy event platform with two distinct public experiences and one controlled operations system. Students should understand the organizer, event requirements, price and payment status before registering. Staff should see only the records and actions their assigned duties require.

## Confirmed foundation
Fire & Flames is the E-Fest of Srusti Academy of Management & Technology (Autonomous), organized by ED Cell on 13–14 November 2026. The shared entrance also presents Kurukshetra esports, Free Fire and BGMI, organized by Srustiprosar per the user's instruction. Dates for individual esports sessions require confirmation. Students from other colleges are welcome. Teachers have a separate sign-in entry but do not automatically receive management permissions.

## Core requirements
| ID | Requirement | Release evidence |
|---|---|---|
| R01 | Two visible organizer-labelled hero panels and deep-linked event pages | Desktop and mobile navigation reaches the correct event |
| R02 | Verified student identity, college profile and self-service registration | External-college student completes the full flow |
| R03 | Teams, invitations, roster consent and membership limits | Duplicate membership and invalid sizes blocked server-side |
| R04 | Official college QR payment and controlled reconciliation | Payment evidence alone cannot produce a valid pass |
| R05 | Teacher, volunteer, judge, admin and super-admin access | Denied action tests across roles and organizer scopes |
| R06 | Volunteer QR attendance and duty assignment | Concurrent duplicate scans record one valid attendance |
| R07 | Event management, capacities, schedules, scoring and results | Published results trace back to locked scores and approval |
| R08 | In-app and email transaction notifications | Outage, retry and deduplication tested |
| R09 | Responsive, accessible, fast public and staff screens | Real phone, keyboard and reduced-motion checks |
| R10 | Audit history, backups, restoration and incident controls | Restore rehearsal and attributable activity logs |

## Release scope
The first production release includes both landing paths, the six documented E-Fest activities, esports information pages, student/teacher authentication, team and solo intake, manual official-QR payment reconciliation, passes, online scanning, scoped operations, judging, controlled results, notifications and support. Paid esports intake opens only after its separate configuration is approved. This is a feature gate, not a fake free registration option.

Each event has its own registration. A student can enter multiple compatible activities; there is no implied all-event pass or combined fee. The initial checkout handles one event registration per order. Team price is charged once per team, never once per member. Cross-organizer consolidated checkout is deferred to avoid ambiguous payment allocation.

## Proposed technology direction
Prefer a separate React and TypeScript application, a managed PostgreSQL backend, managed authentication, private file storage and server-side operations. Supabase and Vercel are the proposed fit based on Crossfire's existing approach; versions, account ownership, hosting plan and costs must be assessed at implementation. Do not reuse Crossfire's live database or keys.

Sites was assessed as an alternative. Its documented hosted identity is ChatGPT sign-in. It is not the selected production path for the requested college email and teacher/student flow unless the college explicitly accepts that identity model. No Sites project is registered during planning.

## Success measures and limits
Acceptance targets: no unauthorized cross-track access; no duplicate payment allocation; no confirmed entry without verified funding and valid roster; no duplicate same-session attendance; all operational changes auditable. Target a typical verified scan response below two seconds on a working campus connection. Provisional load test: 500 concurrent browsing sessions, 50 concurrent registration mutations and 20 scanners; validate actual expected attendance before sizing hosting.

Public loading should target LCP at or below 2.5 seconds, INP at or below 200 milliseconds and CLS at or below 0.1, measured at the 75th percentile where field data is available. These are targets, not measurements of an app that already exists. Reference: https://web.dev/articles/defining-core-web-vitals-thresholds.

## Explicit exclusions
No automated bank verification without a supported verified integration; no live esports game telemetry or anti-cheat claim; no guaranteed notification delivery; no automatic Instagram vote scraping; no offline scan claiming final success. Meals, certificates and guest hospitality are optional modules, not promises inherited from Crossfire. The college must enable and define them before they appear publicly.
