# Implementation status

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
