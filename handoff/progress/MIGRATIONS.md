# Migration ledger

No application migration has been applied to any local Supabase stack, staging or production project. `handoff/database/001_schema_design.sql` is a schema-design foundation; the verifier applied it only to a disposable in-memory engine.

| Migration | Checksum | Environment and verified project | Applied at | Result | Recovery notes |
|---|---|---|---|---|---|
| `001_schema_design.sql` | `8c49e495...7122` | Local PGlite test fixture (in-memory) | 2026-10-27T23:45:00+05:30 | PASS (57 tables, 130 FKs, 29 denial/structural checks) | Baseline schema preserved untouched |
| `002_esports_lan_extensions.sql` | `2ae5619c...877c` | Local PGlite test fixture (in-memory) | 2026-10-28T00:20:00+05:30 | PASS (11 tables, 35 FKs, 8 RPCs, 1 helper, 4 triggers, 11 RLS policies) | Forward extension; non-destructive to 001 baseline |
| Staging target | Pending | Supabase staging project not yet linked | Pending | NOT RUN | Blocked on Supabase project credentials |
| Production target | Pending | Supabase production project not yet linked | Pending | NOT RUN | Blocked on deployment sign-off |

Antigravity: copy reviewed schema into a timestamped first migration for a fresh target, then add RPC/policy/storage migrations. Record all actual applications. Never edit an applied migration or infer production state from local files.

