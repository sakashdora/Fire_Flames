# Changed file register

## 2026 10 27 Codex
- Added `AGENTS.md`: project-wide reading and continuity instructions.
- Added `handoff/README.md`, `ARCHITECTURE.md`, `DECISIONS.md`, `SUPABASE_VERCEL_SETUP.md`: technical addendum and deployment design.
- Added `handoff/database/build_schema.py` and `001_schema_design.sql`: reproducible 57-table relational foundation.
- Added `handoff/database/verify-schema.cjs`, `verification.json`, `schema-metadata.json`, `DATA_DICTIONARY.md`, `ERD.md`: disposable verification and actual structural references.
- Added `handoff/database/README.md`, `DATABASE_MODEL.md`, `COMMAND_CONTRACTS.md`, `ACCESS_AND_STORAGE.md`: lifecycle, transaction and authorization contracts.
- Added `handoff/ANTIGRAVITY_PROMPT.md`, `TRACKING_PROTOCOL.md` and `progress/*`: implementation and resume protocol.
- Added `handoff/package_handoff.py`: builds and checks the portable source/planning/technical ZIP bundle.
- Original PDF/DOCX and prior planning assets/PDFs were not altered by this handoff.

For every later milestone list exact changed paths, what changed, why, user-visible impact and relevant tests. Record deletions explicitly.

## 27 October — written esports update
Changed handoff/ESPORTS_CLIENT_UPDATE.md, ANTIGRAVITY_PROMPT.md, README.md, database/README.md, planning/README.md, planning/docs/02-event-catalogue.md, planning/data/event-catalogue.json, REFERENCE_NOTES.md and progress records. Added apply_client_update.py and sources/bgmi-points-reference.png. Originals and baseline SQL untouched.

## 28 October 2026 — BGMI/LAN Extensions & Next.js Application Foundation
- Added `handoff/database/002_esports_lan_extensions.sql`: forward database migration introducing 11 operational tables (`esports_rules_versions`, `esports_rosters`, `esports_roster_members`, `identity_verifications`, `team_declarations`, `station_hardware_checks`, `match_technical_logs`, `match_substitute_activations`, `esports_scoring_versions`, `esports_placement_points`, `esports_match_result_revisions`) and 8 SECURITY DEFINER RPCs.
- Added `handoff/database/verify-all.cjs`: comprehensive test harness verifying baseline 001 and forward migration 002 on PGlite.
- Regenerated `handoff/database/DATA_DICTIONARY.md`, `ERD.md`, `schema-metadata.json`, `verification.json`: updated from actual schema state (68 tables, 165 foreign keys).
- Added `handoff/DECISIONS.md`: appended ADR 007 documenting forward database extensions and Next.js app foundation.
- Added `app/package.json` & `app/package-lock.json`: Next.js 14, React 18, Supabase SSR, Lucide icons, Tailwind merge, Node test runner setup.
- Added `app/tsconfig.json` & `app/next.config.mjs`: TypeScript and Next.js unoptimized static image config.
- Added `app/public/brand/*`: 45 approved extracted assets from `planning/assets/web` and `bgmi-points-reference.png`.
- Added `app/src/domain/events.ts`: typed event catalogue defining 6 E-Fest events and 2 Esports competitions with confirmed BGMI brief and explicit pending gates.
- Added `app/src/lib/qr-crypto.ts`: ADR 004 AES-256-GCM authenticated encryption/decryption envelope and SHA-256 pass token hashing.
- Added `app/src/lib/supabase.ts`: browser and SSR server Supabase client constructors.
- Added `app/src/app/globals.css`: rich design system with black, gold, ember orange, and crimson gradients, glassmorphism, and responsive styling.
- Added `app/src/app/layout.tsx`: responsive layout with announcement bar, dual-track navigation, and separate student/teacher/staff portals.
- Added `app/src/app/page.tsx`: dual-track hero homepage (Fire & Flames E-Fest by ED Cell and Kurukshetra Esports by Srustiprosar), LAN integrity highlights, and event grid.
- Added `app/src/app/(public)/e-fest/page.tsx`: dedicated E-Fest page with complete ED Cell event catalogue and documented fee policies.
- Added `app/src/app/(public)/esports/page.tsx`: dedicated Kurukshetra Esports page with confirmed BGMI brief, accessible BGIS 2026 placement table, and honest pending gates.
- Added `app/src/app/(auth)/student-login/page.tsx` & `teacher-login/page.tsx`: separate authentication entrances; teacher entrance includes strict notice that teacher sign-in never confers staff authority.
- Added `app/src/app/(student)/dashboard/page.tsx`: student workspace displaying locked team rosters, declaration status, and restricted identity verification.
- Added `app/src/app/(student)/register/page.tsx`: interactive registration workflow with 4 starters, 1 IGL, leading zero UID preservation, and declaration hash binding.
- Added `app/src/app/(staff)/referee/page.tsx`: referee LAN console for station hardware checks, technical pause/incident logs, and in-match substitute switch.
- Added `app/src/app/(staff)/volunteer/page.tsx`: volunteer scanning portal with duty-bound session check-in and duplicate-scan protection.
- Added `app/src/app/(staff)/judge/page.tsx`: jury scorecard workspace with rubric bounds and immutable locking.
- Added `app/src/app/(staff)/admin/page.tsx`: admin governance console with scoring approval gates, two-person beneficiary approvals, and capacity locks.
- Added `app/src/app/api/*`: 10 route handlers for events, roster submission, declaration acceptance, identity verification, referee hardware/pauses/substitutes, scoring approval/results, and atomic reservation.
- Updated `handoff/progress/MIGRATIONS.md`, `DEPLOYMENTS.md`, `NEXT_STEPS.md`, `CODEX_HANDOFF.md`: synchronized migration ledger, deployment platform status, prioritized next actions, and complete continuity handoff for Codex.
- Baseline 001 SQL file, original PDF/DOCX assets, and planning deliverables were untouched.



## Codex refinement — 28 October 2026
app/package.json and package-lock.json: GSAP. app/src/components/FestivalMotion.tsx and SiteHeader.tsx: motion/navigation. app/src/app/page.tsx, (public)/e-fest/page.tsx, (public)/esports/page.tsx, layout.tsx, globals.css: redesign. app/src/domain/events.ts and tests/events.test.ts: source corrections/regression test. (student)/register/page.tsx: selected event and honest preview state. (auth)/student-login/page.tsx and teacher-login/page.tsx: remove false dispatch claims. app/tsconfig.json: allow existing test import extensions. handoff/UI_REFINEMENT.md and progress records: findings/evidence.

Additional: .gitignore and app/next.config.mjs isolate preview output; Next added the preview type-directory include to tsconfig. handoff/qa contains desktop/mobile proof. Concurrent login/health files were not edited.

## Cinematic hero — 28 October 2026
Added app/src/components/FestivalHero.tsx and festival-hero.css; app/src/app/page.tsx now imports the standalone hero. Existing track pages, business logic, database and auth untouched in this follow-up. Screenshots: handoff/qa/hero-cinematic-desktop.png and hero-cinematic-mobile.png.


## Claude Code — 28 October 2026 (IST): mockup hero, Supabase command layer, real workflows
Added: supabase/config.toml, supabase/migrations (0100-0400), supabase/tests/verify-command-layer.cjs (+ generated command-layer-verification.json); app/src/proxy.ts; app/src/lib/{env.ts, supabase/{server,browser,proxy}.ts, api/{command,errors}.ts, client/api.ts}; app/src/app/auth/{callback,signout}/route.ts; app/src/app/(auth)/mfa; app/src/app/(student)/{registrations/[id],invite/[token]}; API routes me, profile, registrations, invitations, catalogue, staff/*, volunteer/scan, judge/*, scoring/review-result, admin/*; components/{auth,ui,workspace,staff}/*, components/layout/SiteFooter.tsx; app/src/app/workspace.css; app/vercel.json; app/.env.example; brand assets hero-ribbon-*, efest-gateway-*, kurukshetra-banner-*, srustiprosar-logo-dark-320; tests/errors.test.ts; handoff/qa/hero-mockup-reference.webp; .claude/launch.json (local preview only, untracked).
Moved: components/FestivalHero.tsx + festival-hero.css -> components/hero/; SiteHeader -> components/layout/; FestivalMotion -> components/motion/; lib/qr-crypto.ts -> lib/crypto/pass-envelope.ts (rewritten).
Rewritten: all previous API routes (same paths), student/teacher login, dashboard, register, admin, referee, volunteer, judge pages, layout, health route, crypto test.
Deleted: app/src/lib/supabase.ts (placeholder credentials), app/src/tests/workflows.test.ts (fixture-only assertions).
Modified: app/package.json/lock (Next 16, React 19, @supabase/ssr 0.12, pglite dev dep, server-only), root package.json scripts, .gitignore, globals.css (fonts, header), handoff/database/verify-all.cjs (PGlite path now app/node_modules instead of C:/CrossFire).
Untouched: handoff/database 001/002 originals, PDFs/DOCX, planning/.
