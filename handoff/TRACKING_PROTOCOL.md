# Development tracking and return handoff

Antigravity must maintain these records in the repository, not only in chat. They are the continuity contract for Antigravity, Codex and the college. Update after each coherent milestone, after any schema/deployment change, and before ending a session or nearing a context/token limit.

## Required records
| File in handoff/progress | Contents |
|---|---|
| STATE.json | Machine-readable current phase, active task, milestone, feature statuses, blockers and next action |
| IMPLEMENTATION_STATUS.md | Human-readable module checklist with evidence and limitations |
| CHANGELOG.md | Append-only dated milestone summaries and decisions |
| FILES_CHANGED.md | Exact paths added/modified/deleted, purpose and behavioral impact |
| TEST_EVIDENCE.md | Actual commands, environment, commit, outcome, log path and coverage limits |
| MIGRATIONS.md | Filename/checksum, target project/environment, applied timestamp, outcome and recovery notes |
| DEPLOYMENTS.md | Real project/site URLs, commit SHA, platform status and post-deploy checks |
| NEXT_STEPS.md | Ordered small next actions, prerequisites, current blocker and reproduction |
| CODEX_HANDOFF.md | Compact final summary for the next Codex session |

## Status vocabulary
Use `not_started`, `in_progress`, `implemented_unverified`, `verified_local`, `verified_staging`, `verified_production`, or `blocked`. Attach evidence to every verified status. `blocked` applies to the specific task and names the missing dependency; it is not a reason to abandon independent work. A static screen is not a completed feature. A successful build proves compilation only. A local database fixture is not a live Supabase authentication test.

## Milestone entry format
Record local date/time with timezone, agent, task IDs, objective, actual files changed, observed behavior, commands and outcomes, migrations/deployments performed, unresolved defects and the next exact command/task. Record Git commit SHA when available; if there is no repository or no commit, say so. Do not invent commit IDs. Preserve unrelated user changes and state which changes are yours.

## Test evidence rules
Record the exact command and working directory, runtime/target, pass/fail/blocked status and relevant output excerpt or local log path. Distinguish baseline failures, new failures and unavailable tests. Include at least one denied authorization case for protected workflows. Mark tests not run as NOT RUN. Never mark camera behavior, notification arrival, real money, restoration or multi-user concurrency verified from mocks alone.

## Migration and deployment rules
Never rename or edit a migration after it has been applied. Add a new migration and document compatibility/rollback limits. Record separate local/staging/production application state. A design SQL file is not an applied migration. A Vercel deployment can succeed while a database migration fails; report both independently. Only record actual returned URLs/project references. No keys or full connection strings.

## Before context expires or work stops
Save files. Run the relevant checks that fit the completed slice. Update all affected progress records. Write a concise CODEX_HANDOFF.md containing completed/verified work, implemented-but-untested work, untouched modules, exact blockers, changed architecture, current migration/deployment state and the next five actions. Include where to find logs/screenshots and whether any process is still running. Do not leave the next agent dependent on a conversation summary.

## Completion criteria
Application work is complete only when requirements are implemented, the appropriate acceptance tests pass, unresolved decisions are gated honestly, and deployment status is evidenced. If external services are unavailable, label the result as locally implemented or staging-verified with named blockers. Never call the project production-ready while banking, access control, QR replay protection or live deployment checks remain unverified.
