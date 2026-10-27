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

