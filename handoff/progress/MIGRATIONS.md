# Migration ledger

No application migration has been applied to any local Supabase stack, staging or production project. `handoff/database/001_schema_design.sql` is a schema-design foundation; the verifier applied it only to a disposable in-memory engine.

| Migration | Checksum | Environment and verified project | Applied at | Result | Recovery notes |
|---|---|---|---|---|---|
| None | Not applicable | No Supabase target linked | Not applicable | Not applied | Preserve source design |

Antigravity: copy reviewed schema into a timestamped first migration for a fresh target, then add RPC/policy/storage migrations. Record all actual applications. Never edit an applied migration or infer production state from local files.
