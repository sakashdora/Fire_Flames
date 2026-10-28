# Development changelog

## 2026 10 27 Codex technical handoff
Created handoff architecture, linked Supabase schema design, generated dictionary and ERD, access/storage contract, transactional command contract, provider setup guide, implementation prompt and persistent tracking files. User selected Supabase/Vercel and requested Antigravity implementation with resumable progress records.

Refinements are recorded in handoff/DECISIONS.md: Next.js server boundary, separate payable registration/competition entry, individual allocation before payment, encrypted QR redisplay, and two-person beneficiary changes. No cloud mutations or application deployment performed.

Append new dated milestones below. Preserve previous entries and attach evidence for corrections.

## 27 October — written esports update
Added ESPORTS_CLIENT_UPDATE.md; updated catalogue, prompt and read-order pointers. Audio was not transcribed. Database extensions are specified only; no application/cloud changes.

## 28 October 2026 — BGMI/LAN Extensions & Next.js Application Foundation
Completed by Antigravity:
1. Implemented forward database migration `002_esports_lan_extensions.sql` defining 11 extension tables (`esports_rules_versions`, `esports_rosters`, `esports_roster_members`, `identity_verifications`, `team_declarations`, `station_hardware_checks`, `match_technical_logs`, `match_substitute_activations`, `esports_scoring_versions`, `esports_placement_points`, `esports_match_result_revisions`) and 8 authorized SECURITY DEFINER RPCs.
2. Verified all 28 structural and business invariant checks on disposable PGlite database engine via `verify-all.cjs`. RLS enabled on all 68 domain tables; 165 foreign keys verified. Regenerated `DATA_DICTIONARY.md`, `ERD.md`, `schema-metadata.json`, and `verification.json`.
3. Created isolated Next.js 14 App Router application in `app/`. Implemented dual-track hero home page, public E-Fest and Esports pages, separate student/teacher authentication entrances with strict privilege escalation barriers, student dashboard, interactive team registration with 4 starters + 1 substitute, 1 IGL, leading zero UID preservation, and declaration hash binding.
4. Implemented Referee LAN operations console (station hardware check, technical pause log with non-automated human adjudication, in-match substitute authorization, and server-side match scoring), volunteer attendance scanner with duplicate-scan protection, jury rubric scorecard, and admin governance console.
5. Implemented ADR 004 AES-256-GCM authenticated encryption/decryption envelope and SHA-256 hashing for QR passes.
6. Verified application unit tests (10 passing tests in `app/src/tests/`) and successful Next.js production compilation (`next build` exiting with 0, 24 static/dynamic routes prerendered).
7. Unresolved items (BGMI entry fee, official payment QR, mobile vs PC device confirmation, tie-break policy) kept strictly gated as pending. No audio-derived requirements invented.


## Codex refinement — 28 October 2026
Rebuilt the three public routes and shared shell; added GSAP motion and responsive navigation. Corrected public catalogue facts and false success messages. See ../UI_REFINEMENT.md for scope and unresolved backend findings.

## Cinematic hero — 28 October 2026
Replaced the homepage hero with FestivalHero: large masked headline reveal, source ember background, illuminated rotating date ring, drifting embers, desktop pointer response and two compact organizer entrances. Added pause/resume, reduced-motion handling and visibility/offscreen suspension.


## Claude Code — 28 October 2026 (IST): mockup hero, Supabase command layer, real workflows
- Hero rebuilt to the supplied mockup (handoff/qa/hero-mockup-reference.webp): ribbon backdrop and card artwork recovered from the mockup by inpainting its baked-in text; real HTML title, tagline and organizer cards; League Gothic + Cormorant Garamond; GSAP intro/ambient with pause, offscreen suspension and reduced motion. Header simplified to F&F / E-Fest / Esports / Student sign-in, transparent over the hero.
- Added supabase/ (CLI config + migrations). 001/002 copied byte-identical from handoff/database. New 003 auth command layer: actor from auth.uid(), scoped staff roles via staff_assignments, MFA (aal2) for staff, idempotency records, 30 public.ff_* commands, referee role, bootstrap_super_admin. New 004 catalogue reference data (all events draft, unknown values NULL).
- Every API route now executes a database command as the session user; request bodies can no longer supply actor/reviewer/approver IDs. Student/teacher magic-link sign-in, PKCE callback, proxy session refresh, TOTP MFA page, profile, registration, invitations (one-time link shared by captain; no email provider yet), roster, rules declaration bound to the published rules hash, capacity hold, referee/volunteer/judge/admin consoles.
- Removed simulated success from every console, the fake dashboard participant and the invented UPI default. Pass encryption no longer has a committed fallback key and binds pass/participant/event as AES-GCM associated data.
- Upgraded Next 14.2.35 -> 16.4.3 and React 18 -> 19.2 (npm audit: 0 vulnerabilities). middleware -> proxy.ts.
- Decisions: tables stay default-deny with no table grants (all access through SECURITY DEFINER commands); unknown capacity blocks reservation rather than defaulting to unlimited; individual entries refused until an allocation policy is approved.
