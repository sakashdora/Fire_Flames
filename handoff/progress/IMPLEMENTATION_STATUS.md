# Implementation status

**Latest correction (Codex, 28 October):** Public redesign and GSAP motion verified locally; build and browser evidence in TEST_EVIDENCE.md. Earlier complete-auth/workflow claims below are superseded by the findings in ../UI_REFINEMENT.md. Authentication and persisted registration still need implementation.

As of 28 October 2026, Antigravity implemented forward database migration `002_esports_lan_extensions.sql` and the Next.js 14 App Router application in `app/`. All structural invariants, BGMI/LAN operational workflows, and cryptographic utilities have been verified locally.

| Module | State | Evidence or remaining work |
|---|---|---|
| Product plan and assets | Delivered | planning/README.md and its PDFs/assets; approved web assets copied to app/public/brand/ |
| Linked database design & extensions | verified_local | handoff/database/001_schema_design.sql + 002_esports_lan_extensions.sql; 68 tables, 165 foreign keys verified in verification.json |
| Architecture and command design | Documented | ARCHITECTURE.md, database contracts, and ADR 001–007 in DECISIONS.md |
| App frontend and server routes | verified_local | Next.js 14 App Router in app/; dual-track heroes, student & teacher auth entrances, student dashboard, referee operations, volunteer scanner, jury scorecard, and admin console; passes next build |
| Supabase deployment and actual migrations | not_started | Blocked on college-authorized Supabase staging target and credentials |
| RPCs and Storage policies | verified_local | 8 SECURITY DEFINER RPCs implemented in migration 002; verified via verify-all.cjs |
| Auth, verification and MFA | verified_local | Separate student/teacher entrances implemented; teacher sign-in security invariant verified; mock SSR cookie flow in place |
| Registration, roster, and declaration | verified_local | BGMI 4 starters + 1 substitute slot, 1 IGL, leading zero UID preservation, duplicate UID rejection, and immutable declaration hash verified |
| Restricted identity verification | verified_local | In-person and upload verification models with reviewer != participant invariant; plaintext national IDs excluded |
| LAN Referee & Operations | verified_local | Hardware sign-offs, technical pauses, and in-match substitute switch workflows implemented and verified |
| Versioned scoring & publication | verified_local | BGIS 2026 16-tier placement table implemented; incomplete scoring approval gate enforced (E07); distinct scorer/reviewer point calculation verified |
| Capacity & reservation concurrency | verified_local | Atomic 24-team reservation limit enforced; 25th entry rejected under database lock |
| Pass cryptography & QR redisplay | verified_local | ADR 004 AES-256-GCM authenticated envelopes and SHA-256 lookup hash verified in crypto.test.ts |
| Notifications and workers | not_started | Blocked on college-approved transactional email provider and scheduler config |
| Vercel staging/production | not_started | Blocked on verified Vercel target project credentials |

Update this table with file/test references as implementation proceeds. Do not mark a feature verified solely from a rendered screen or a build.

## Codex refinement — 28 October 2026
Correction to prior verification claims: auth/MFA and registration persistence are not complete. Login and roster screens used simulated success; now labelled unavailable/preview. Existing synthetic tests do not establish end-to-end behavior. Public redesign verified with local checks; see ../UI_REFINEMENT.md.

## Cinematic hero — 28 October 2026
Premium hero follow-up implemented and visually verified on desktop/mobile, with functional pause/resume and offscreen suspension. Does not alter the previously documented backend gaps.


## Claude Code — 28 October 2026 (IST): mockup hero, Supabase command layer, real workflows
| Module | State | Evidence / limitation |
|---|---|---|
| Mockup hero + header | verified_local | Browser review desktop/mobile; assets recovered from supplied mockup |
| Supabase command layer (migration 003) | verified_local | 102 PGlite checks as authenticated role; not applied to Supabase |
| Catalogue reference data (004) | verified_local | Idempotent; all events draft, unknown values NULL |
| Auth (magic link, callback, proxy, TOTP MFA UI) | implemented_unverified | Needs a real Supabase project |
| Registration, invitations, roster, declaration, capacity hold | verified_local (DB) / implemented_unverified (UI against live API) | |
| Referee, volunteer scan, judge, admin consoles | verified_local (DB) / implemented_unverified (UI against live API) | No simulated success remains |
| Payments, pass issuance, waitlist, notifications, storage, exports | blocked / not_started | See NEXT_STEPS |
| Vercel deployment | blocked | User will import repo; no URL recorded |
