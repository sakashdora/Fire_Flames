# Architecture and data contracts

Proposed design: a modular application with a public frontend, authenticated workspaces, server-side commands, transactional PostgreSQL, managed authentication, private object storage and an outbox worker. This is a specification; no service account or database has been provisioned.

## Components and boundaries
Public published event content can be cached. Registration, funds, passes, scores, roles and private documents must remain authoritative on the server. Authentication establishes identity; database permissions and server-side ownership/scope checks authorize actions. Browser state is for UI preferences, never the source of payment or attendance truth.

Use a fresh Supabase project for Auth, PostgreSQL and private Storage, and a separately owned web hosting project such as Vercel, subject to college approval. Sensitive workflows run through narrow server endpoints or reviewed database procedures. Transactional email comes from a college-approved provider and sender domain. SMS/WhatsApp and bank APIs are optional later integrations, not assumed available. Assess plan limits, database recovery, email quotas and secret ownership before committing to vendors.

OWASP authorization guidance recommends default denial and permission validation on every request: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html. Supabase RLS reference: https://supabase.com/docs/guides/database/postgres/row-level-security.

## Proposed repository structure
```text
fire-and-flames/
  apps/web/src/
    routes/public/   routes/student/   routes/staff/
    features/auth/   features/events/  features/teams/
    features/payments/ features/passes/ features/scanning/
    features/judging/ features/notifications/ features/admin/
    components/ui/   styles/           assets/
  packages/domain/  packages/validation/  packages/contracts/
  backend/functions/  backend/migrations/  backend/policies/
  tests/unit/  tests/integration/  tests/access/  tests/e2e/
  docs/  scripts/  public/brand/
```

Keep shared types, validation rules and state-transition definitions in domain packages. UI calls typed commands; it does not write arbitrary payment/status columns. New project setup is a future development phase, not part of this planning delivery.

## Entity model
| Entity | Core fields | Integrity rule |
|---|---|---|
| profiles | auth user ID, name, email, phone, college, course/year | One profile per identity; own updates only |
| organizer_units | ID, label, contact | ED Cell and Srustiprosar separate scopes |
| role_assignments | user, role, organizer/event, active window, issuer | No self-assigned privileged role |
| events | organizer, slug, status, capacity, team limits | Unknown capacity/fee remains null |
| event_versions | rules, price options, rubric, publishing approvals | Accepted version immutable for a registration |
| sessions | event, venue, start/end, reporting time | Explicit timezone; detect overlaps |
| teams and members | event, captain, membership status, consent | Unique active event membership per participant |
| registrations | owner, event version, mode, roster snapshot, state | State transition validated; one active entry per participant/event |
| reservations | registration, capacity units, expires, review hold | Atomically acquire capacity |
| orders | registration, total_paise, currency, payment profile version | Server-calculated price, immutable after submission |
| payment_evidence | order, reference, private object, submitted time | Append versions; limited file access |
| bank_credits | receiving account, settled transaction ID, amount | Unique credit identity; no double allocation |
| payment_reviews | evidence, reviewer, outcome, reason | No self-review; audit every decision |
| refunds | order, amount, approval, bank reference, state | Sum cannot exceed verified refundable amount |
| passes | registration/member, token hash, version, expiry, revoked | Only confirmed eligible membership |
| attendance | member, event session, action, station, actor | Unique action per member/session |
| duty_assignments | staff, event, station, start/end | Scan only while authorized and active |
| checkpoints | event, sequence, instructions | Ordered team completion constraints |
| checkpoint_records | team, checkpoint, time, marshal, penalty | Unique completion; corrections audited |
| rubric_scores | judge, candidate, rubric version, marks, lock | Unique judge/candidate/version; bounded marks |
| result_revisions | event, totals, tie decisions, approval, publication | No overwrite of published history |
| outbox and deliveries | event key, recipient, channel, attempts, status | Unique notification deduplication key |
| audit_log and incidents | actor, scope, action, time, reason | Append-only for application roles |

Relationships: organizer has many events; event has versions, sessions and registrations; registration has a roster, one active order and many evidence attempts; verified order plus valid roster yields member passes; pass usage creates attendance. Scores belong to a candidate registration and rubric version. Do not put raw tokens or member details inside public URLs.

## Command contracts
| Command | Request essentials | Server validations | Result |
|---|---|---|---|
| POST /registrations | event ID, mode, member IDs, rules version | Ownership, consent, eligibility, duplicates | Draft/reference or typed conflict |
| POST /registrations/:id/reserve | expected version, idempotency key | Roster, published price, capacity, schedule | Order and reservation deadline |
| POST /orders/:id/evidence | transaction ref, approved upload ID | Owner, file validation, state, deadline | Review reference; never paid=true |
| POST /payments/:id/review | outcome, credited transaction, reason | Finance scope, MFA, no self-review, uniqueness | Verified or exception state |
| POST /scan | token, station, session, idempotency key | Duty, scope, pass validity and replay | recorded, duplicate or denied |
| POST /scores/:id/lock | complete marks, rubric version | Judge assignment, bounds, completeness | Immutable locked score |
| POST /events/:id/results/publish | revision, reason | Super-admin approval, locked scores | Published revision and notifications |
| POST /staff/assignments | user, role, scope, expiry | Grant authority, MFA, active issuer | Audited assignment |
| POST /payment-profiles/:id/approve | expected version, approval | Second authorized actor, verified destination | Activated profile version |

Use consistent JSON errors: code, safe message, field errors and correlation ID. Return 401 for unauthenticated, 403 or privacy-preserving 404 for unauthorized records, 409 for state/version conflicts, 422 for invalid inputs and 429 for throttling. Never return database stack traces or inferable private record details.

## Transactions and concurrency
Capacity reservation locks the event capacity record and counts holds consistently within a transaction. Confirming payment atomically records credit allocation, payment review, registration transition, pass records, audit and notification outbox. Solo intake may become payment-verified while waiting for allocation; only the allocation command can subsequently confirm it. Attendance inserts use a database uniqueness constraint and idempotency key to tolerate retries and simultaneous scanners.

Use expected version numbers for admin edits, result approval and payment profile changes. Server rechecks permissions and state at commit time. Idempotency keys are scoped to actor plus command and bind to a request payload hash; a reused key with a different payload is rejected. Background work claims jobs atomically and tolerates duplicate delivery.

## Storage and environments
Separate development, staging and production identities, storage and databases. Synthetic data only in tests. Store uploaded payment evidence privately, with short-lived authorized download URLs, randomized names and content checks. Public assets contain only approved artwork. Backups and restore permissions belong to named college owners; deployment rollback must account for forward-only schema migrations. Use append-only migrations and release-specific restore instructions, never run destructive reset scripts against production.

## Proposed service objectives
Target 99.5% availability over the event period, read response p95 below 800 ms and mutation p95 below 1.5 seconds at approved load, excluding user camera acquisition. Proposed recovery targets are one hour RTO and fifteen minutes RPO only if the purchased service and tested backup method support them. Otherwise document the measured limits and obtain a decision before launch. Alerts cover elevated scan failures, review backlog, failed jobs, capacity anomalies and payment profile changes.
