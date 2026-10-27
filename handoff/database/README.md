# Database foundation

Latest required extensions: `../ESPORTS_CLIENT_UPDATE.md`. These are specified, not implemented in this baseline or covered by its existing 29 checks.

`001_schema_design.sql` defines 57 domain tables, 130 foreign keys, unique indexes, checks, default-deny RLS and a few defensive triggers. `DATA_DICTIONARY.md` and `ERD.md` are generated from a successful application to a disposable PostgreSQL engine. The schema is not installed in any live Supabase project.

## How to use it
Read the model, command contracts and access policy first. On a new disposable Supabase database, convert the reviewed design into a timestamped first migration under `app/supabase/migrations`. Keep the design file as the reference; subsequent applied migration files are immutable. On an existing database, inspect current migrations and prepare an additive adaptation rather than replaying `create schema app`. Do not run any reset/drop on a remote project.

The baseline references real Supabase `auth.users` and expects Supabase roles to exist. The local verifier creates minimal role/auth fixtures solely for tests; never run those fixture definitions in Supabase. Only the authenticated owner-controlled provisioning process creates profiles and first super admins. There are no seeded passwords, keys, privileged accounts, real bank identifiers or fake payment QR codes.

## What the SQL enforces now
- Explicit primary keys and links between event versions, prices, entries, registrations, members, orders, credits, passes, duties and results.
- Cross-event and many cross-organizer consistency constraints using composite foreign keys.
- One active accepted membership per event/person, one active pass, one live order and one live reservation per entry.
- One bank credit allocation per order and per settled credit; one attendance action per person/session.
- Nonnegative amounts, valid time intervals, null versus unknown fee distinction and bounded score marks.
- Append-only audit, payment evidence, bank credits, credit allocations and payment-review history.
- All tables have RLS enabled and direct client privileges revoked. Nothing is made writable just to get a UI working.

## What Antigravity must implement before enabling workflows
The schema cannot encode every multi-record business rule in a check constraint. Authenticated RPCs must enforce current MFA/role/duty, member consent and actor ownership, capacity under locks, approved configuration, price and beneficiary snapshots, actual bank reconciliation, no self-review, total refund limits, complete funding, pass eligibility, checkpoint order, rubric-version consistency, scorecard locking, result publication and notification creation. Exact transaction contracts are in COMMAND_CONTRACTS.md. Implement each with positive, denied and retry/concurrency cases.

No application RPCs, public read projection, Storage bucket policies, Auth hooks or cloud deployment are included as completed work. Default-deny means the app will initially receive access denials until reviewed RPCs are installed. That is intentional, not a reason to grant all table privileges or disable RLS.

## Verification and reproducibility
Run `build_schema.py` only to regenerate the reference SQL from its explicit table definitions. Run `verify-schema.cjs` using a local PGlite installation; set `PGLITE_MODULE_PATH` to its absolute module path if needed. The current workspace test used the already-installed package at `C:/CrossFire/node_modules/@electric-sql/pglite/dist/index.cjs` read-only and an in-memory disposable database. It did not connect to Crossfire's live database or read its environment files.

The verifier records actual checks in `verification.json`. It tests DDL execution and selected constraints/denials. It is not a live Supabase integration test or a multi-connection race test. Antigravity must add Supabase-local or staging tests with real Auth JWTs, RPC grants, Storage and concurrent clients before claiming runtime security.

## Important lifecycle conventions
Approved rules/prices are versioned; never edit what a paid registration accepted. New prices apply to new registrations only. Never hard-delete financial or attendance history; use explicit cancellation, correction or superseding records with audit. Profiles may be anonymized under approved retention policy; financial references remain intact as required. A production schema migration requires a verified target and recovery plan.
