# Test evidence

## Codex schema verification on 27 October 2026
Working directory: `C:/Fire&Flames`.

Commands executed with bundled runtimes:
```powershell
& 'C:\Users\cloud\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' -X utf8 handoff/database/build_schema.py
& 'C:\Users\cloud\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' handoff/database/verify-schema.cjs
```

Result: PASS, 29 checks, 57 tables, 130 foreign keys. Exact cases/outcomes: `handoff/database/verification.json`. Runtime was an in-memory PGlite PostgreSQL engine with minimal auth.users/role fixtures, using an existing installed package read-only. No live Supabase or Crossfire connection was made.

Verified selected constraints: cross-event references, mode/price binding, membership consent/uniqueness, credit uniqueness/allocation, append-only history, single live pass/reservation, duplicate attendance, duty actor consistency, score maximum/locked edits/deletes and denied direct access for anon/authenticated/service_role.

NOT RUN: application build, Auth JWT/MFA integration, public/private RPC policies, Storage uploads, crypto envelope implementation, multi-connection race tests, browser/camera tests, bank/payment processing, notification delivery, backup restore or Vercel deployment. These remain Antigravity's implementation tests.

Append later test runs with actual commands, target/environment, commit where available, results and log paths. Never replace a failed result with an unsupported success claim.

## 27 October — written esports update
Checked BGMI catalogue values and exact placement mapping against supplied text/image; parsed JSON. Existing 29 structural checks apply only to unchanged baseline, not newly specified roster/identity/referee/scoring extensions. No audio transcription or new runtime tests. Portable archive integrity is checked by package_handoff.py.

## 28 October 2026 — Database Extension & Application Verification
Working directory: `C:/Fire&Flames`. Git baseline commit: `ec64cc3e7769c426ebfe212ad7759c9d72d7d402`.

### 1. Database Delta & Scenario Verification
Command:
```powershell
node handoff/database/verify-all.cjs
```
- Engine: Disposable embedded PostgreSQL (PGlite).
- Outcome: PASS.
- Verified metrics: 28 comprehensive checks, 68 tables (57 baseline + 11 forward extensions), 165 foreign keys. RLS enabled on all 68 tables.
- Scenarios validated:
  - Baseline 001 and forward migration 002 apply cleanly in succession.
  - E01: BGMI configured with 24 teams, 4 starters, 1 substitute slot, ₹10,000 pool, substitute_required kept null.
  - E02: Unknown fee cannot be enabled for checkout (fails with SQLSTATE 23514).
  - E03: 4 starters, 1 IGL, leading zero UID preservation (e.g. `0012345678`), and duplicate active UID rejection across event (fails with SQLSTATE 23505).
  - E04: Atomic capacity enforcement bounds at 24 entries; 25th reservation is rejected by `rpc_reserve_entry` (fails with SQLSTATE 23514).
  - E05: Restricted identity verification (reviewer != participant rejected with 23514, in-person and upload methods, no plaintext national IDs).
  - E06: Team declaration accepted by leader only with immutable hash (non-leader rejected with 42501; declaration is append-only, mutation rejected with 55000).
  - E07: BGIS 2026 16-tier placement points exact values (1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9-16: 0). Scoring approval rejected with 23514 when kill multiplier or tie-breaks are null! Complete rules approve successfully.
  - E08: In-match substitute switch approved by referee within locked roster without altering entry capacity.
  - E09: Referee adjudicated technical pause with human decision and audit log (no automated DQ).
  - E10: Referee signed off station hardware with asset code and config version; cross-event station checks rejected (23503); hardware checks append-only (55000).
  - Server-calculated match results: distinct scorer and reviewer enforced (rejected with 23514 if scorer == reviewer); total points computed server-side (10 place + 7 kills * 1 = 17 pts).

### 2. Application Unit Tests
Working directory: `C:/Fire&Flames/app`.
Command:
```powershell
npm test
```
- Runtime: Node v24.15.0 with `--experimental-strip-types`.
- Outcome: PASS (10 of 10 tests passed in 244ms).
- Verified cases:
  - `ADR 004: Pass token generation, hashing and AES-256-GCM encryption/decryption`: 256-bit token generation, SHA-256 hash lookup, AES-256-GCM encryption with 12-byte nonce and 16-byte auth tag, decryption match, and tampered envelope rejection.
  - `E01: BGMI Event Catalogue matches confirmed client brief`: dates 13-14 Nov 2026, 24 teams, ₹10,000 pool, 4 starters, 1 sub slot, sub required null, 1 IGL, query phone 8260555312, 16 placement rows.
  - `Free Fire details remain unconfirmed and independent`: dates unconfirmed, fee/prize not inferred by subtraction.
  - `E03: Roster submission invariants validation`: 4 starters, 1 IGL, leading zero preservation, duplicate UID detection.
  - `E06: Team declaration hash and version binding`.
  - `E05: Restricted identity verification invariants`: reviewer != participant, allowed proof types, exclusion of plaintext national IDs.
  - `E08: In-match substitute switch authorization`: locked roster boundary.
  - `E07: Scoring approval gate rejects incomplete rule sets`.
  - `Server-side match result calculation & distinct reviewer (E10)`.
  - `E04: Capacity limit enforcement for BGMI (24 teams)`.

### 3. Application Production Build
Working directory: `C:/Fire&Flames/app`.
Command:
```powershell
npm run build
```
- Tool: Next.js 14.2.35.
- Outcome: PASS (exited with code 0).
- Prerendered routes: 24 static and dynamic routes compiled cleanly.

