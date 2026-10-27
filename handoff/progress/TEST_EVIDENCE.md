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
