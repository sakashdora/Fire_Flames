# Return handoff for Codex

## Current truth
Antigravity has implemented the complete local Next.js 14 App Router application in `app/` and the forward database extensions in `handoff/database/002_esports_lan_extensions.sql`. All 68 tables, 165 foreign keys, 8 RPCs, 11 RLS policies, cryptographic envelope routines, and 10 workflow acceptance tests have been executed and verified locally. No remote cloud project has been linked yet (blocked on Supabase/Vercel project credentials).

## Completed and verified
1. **Database Schema & Migrations**:
   - Baseline `001_schema_design.sql` (57 tables, 130 FKs) preserved unmodified.
   - Forward migration `002_esports_lan_extensions.sql` (11 tables, 35 FKs, 8 SECURITY DEFINER RPCs, 1 audit helper, 4 triggers, 11 RLS policies) created.
   - Verified via `verify-all.cjs` on disposable PGlite database: 28 structural, constraint, and permission checks passed.
   - Regenerated `DATA_DICTIONARY.md`, `ERD.md`, `schema-metadata.json`, and `verification.json`.
2. **Next.js 14 App Router Application (`app/`)**:
   - Production build compiled cleanly with exit code 0 (`npm run build`), generating 24 static and dynamic routes.
   - Automated test suite passed 10 of 10 tests (`npm test` in `app/`):
     - ADR 004 pass token envelope (AES-256-GCM + SHA-256 lookup hash).
     - E01 BGMI catalog & brief alignment (13–14 Nov 2026, ₹10k pool, 24 teams, leader phone 8260555312).
     - Free Fire catalog independence preserved.
     - E03 Roster submission validation (4 starters + 1 substitute, exactly 1 IGL, leading zero UID preservation, duplicate UID rejection).
     - E06 Declaration hash and rule version immutability binding.
     - E05 Restricted identity verification (no plaintext national IDs; data minimization).
     - E08 In-match substitute switch authorization (referee authenticated).
     - E07 Scoring approval gate (blocks approval when tie-break policy or kill multiplier is null).
     - E10 Server-side BGIS 2026 scoring calculation & distinct reviewer requirement.
     - E04 Capacity limit enforcement (atomic reservation rejects > 24 teams).
3. **Frontend & Staff Consoles**:
   - Responsive dark luxury theme with glassmorphism, gold/fire accents, modern typography, and brand assets.
   - Dual-track public portals: Fire & Flames E-Fest (ED Cell) and Kurukshetra Esports (Srustiprosar).
   - Staff consoles: Referee (hardware integrity sign-off, pause log, substitute activation, match result submission), Volunteer (checkpoint scanner), Judge (rubric evaluation), and Admin (two-person beneficiary control, scoring rule approval).
   - Student workspace: Interactive team registration with instant UID validation and honest gated checkout.

## Pending Gates (Strictly Preserved)
- **BGMI Entry Fee**: Unresolved by organizers; live payment checkout remains gated.
- **Official Payment QR**: Pending official college asset; manual/mock payment disabled.
- **Mobile vs. PC Device Rules**: Hardware integrity sign-off logs peripheral state, but does not auto-DQ pending written policy.
- **Tie-break & 17–24 Scoring Table**: Approval gate rejects scoring versions until finalized.
- **Untranscribed Voice Note**: No audio-derived rules invented.

## Important Decisions & Invariants
- ADR 007 documented in `handoff/DECISIONS.md`.
- `audit_log` non-null foreign keys handled cleanly via `app.log_event_audit` helper function.
- `app/package.json` scripts invoke `node ./node_modules/next/dist/bin/next ...` to prevent Windows shell `&` path delimiter bugs.

## Resume procedure (Next 5 actions for Codex)
1. Link staging Supabase project credentials in `.env.local` or environment variables.
2. Apply `001_schema_design.sql` then `002_esports_lan_extensions.sql` to staging Supabase.
3. Configure Supabase Auth and private storage buckets (`payment-evidence`, `official-payment-qr`, `entry-attachments`, `incident-evidence`, `private-exports`).
4. Upload official college UPI QR code and input approved entry fee to ungate payment checkout.
5. Deploy `app/` to Vercel staging and run live mobile device acceptance tests (camera scanner, referee portal).

