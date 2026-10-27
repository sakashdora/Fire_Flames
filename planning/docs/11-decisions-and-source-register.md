# Decisions risks and source register

Facts from the supplied files and the user's decisions are distinguished from recommended defaults. Unresolved items below prevent only their dependent production workflows; they do not prevent preparing the specification and artwork.

## Confirmed decisions
- The user requested planning documents and assets before development; this delivery does not deploy an application.
- Participants may come from other colleges, confirmed in this chat.
- ED Cell organizes E-Fest; Srustiprosar organizes esports, per user direction.
- Use source fees where known and brochure artwork/colors; do not invent unknown esports fees.
- Provide student and teacher sign-in, admin/super-admin control, volunteers, QR management and notifications.

## Decision register
| ID | Decision needed | Proposed handling | Owner and gate |
|---|---|---|---|
| D01 | Official QR, beneficiary and UPI details | Keep payment collection disabled until supplied and independently checked | College finance; before checkout |
| D02 | Esports fees, rules, capacity and prizes | Publish info only; Free Fire/BGMI fee null and checkout disabled | Srustiprosar; before esports intake |
| D03 | Individual ₹59 team allocation | Consent-based coordinator allocation with no additional team charge | ED Cell; before individual checkout |
| D04 | Exhibition award labels | Prefer summary labels after written confirmation | ED Cell/jury; before public awards |
| D05 | Timetable, reporting, rooms and esports dates | Review proposed two-day programme and conflicts | Programme lead; before schedule publication |
| D06 | Refund/cancellation policy and settlement SLA | Explicit policy and accountable finance queue | College finance; before payments |
| D07 | Student eligibility, age and ID checks | Open colleges confirmed; remaining eligibility to be defined | College authority; before registration |
| D08 | Staff roster and two approvers | Named, individually verified accounts and MFA | College authority; before staff activation |
| D09 | Sender domain and support contact | Verified email plus in-app; optional SMS deferred | IT/communications; before notifications |
| D10 | Hosting, domain, budget and restore capability | New isolated project; proposed Supabase plus Vercel | IT owner; before provisioning |
| D11 | Pool counts and unspecified team/capacity limits | Do not infer IPL total capacity or stall-member limits | Event leads; before related intake |
| D12 | Judge aggregation, ties and conditional criteria | Publish versioned calculation policy before scoring | Evaluators; before event play |
| D13 | Retention, publicity and under-18 handling | Approve purpose/retention/consent policy | College privacy owner; before launch |
| D14 | Optional meals/certificates | Disabled unless funded and approved | College sponsor; before advertising |
| D15 | Official Instagram page and poll window | Record verified link/window and evidence procedure | ED Cell; before Bazar voting |
| D16 | Official logo masters and naming | Use extracted images now; confirm Srustiprosar spelling and high-res marks | Communications; before final branding |

## Key risks
Unverified QR risks payment misdirection; address through two-person verification and versioned settings. The short calendar risks rushed testing; release core workflows first only after their gates pass. Shared campuses and simultaneous events risk conflicts; use schedule checks and explicit allocation. Weak connectivity risks duplicate or missing attendance; use transactional scans plus controlled fallback. Manual reconciliation risks backlog; assign at least two reviewers and clear escalation. Unclear individual-fee allocation risks collecting money without valid teams; gate it until approved. Low-resolution source logos limit large-format output; preserve fidelity and request masters when needed.

## Source register
S01: `C:/Fire&Flames/ABOUT.pdf`, 26 pages. Page 1 identity/ED Cell; page 4 promotional pools; pages 7–8 IPL; 10–11 trivia; 13–14 treasure; 16–17 Brand War; 19–20 Bazar; 21 esports identity; 22 background-only; 24–25 Exhibition; 26 ₹36,000 summary. Extracted text and page images were reviewed. Embedded artwork is preserved with source-page references in the manifest.

S02: `C:/Fire&Flames/E-Fest GAME RULES & RUBRICS-1 (1).docx`. Opening date 13–14 November 2026; full rules, fees, judging weights and prize summary. Use headings as locators; Word page numbers are not asserted without a verified render. The source DOCX was read, not edited.

S03: User instructions in this chat on 27 October 2026: platform scope, two organizers, premium appearance, official QR and cross-college participation.

S04: Crossfire local reference, read-only review of `C:/CrossFire/README.md`, `src/pages/LandingPage.tsx`, `src/index.css` and `package.json`. Reusable ideas: event cards, mobile navigation, reduced-motion handling and scoped staff operations. No assumption that its live deployment, credentials, rules, free entry, meals, dates or school eligibility apply here. This was not a security audit of Crossfire.

## Technical references checked during planning
- OWASP Authorization Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Multi Factor Authentication: https://supabase.com/docs/guides/auth/auth-mfa
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C target size explanation: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum
- Web performance thresholds: https://web.dev/articles/defining-core-web-vitals-thresholds

These references support design targets, not a compliance certification. Validate current SDK behavior and service plans when implementation begins. No legal, hosting-cost or banking-integration capability is assumed from a generic reference.

## Approval record template
Record decision ID, selected option, approver name/role, date/time, evidence location and affected specification version. College review should sign product scope, event catalogue, operational policies, access matrix, design direction and release gates. Keep subsequent changes in a versioned change log with impact on fees, participants and tests. Never backdate approval or label this draft as college-approved.
