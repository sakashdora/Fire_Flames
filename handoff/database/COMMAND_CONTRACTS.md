# Transactional command contracts

These commands are the implementation specification. They are not already installed RPCs. Implement narrow typed functions and corresponding route handlers; never expose a general update endpoint for arbitrary status/role/price columns. All IDs are UUID unless stated otherwise; monetary inputs are integer paise; dates are timestamptz. Derive actor from authentication, not an input parameter.

## Shared transaction pattern
1. Verify authenticated identity, active profile, fresh staff authority/MFA where needed and scope. Rate-limit at the route boundary and enforce record ownership in the database.
2. Claim idempotency key scoped to actor and command; compare a canonical payload hash. Same key/same payload returns the prior safe outcome; different payload returns conflict. Avoid storing raw QR tokens or sensitive files in idempotency responses.
3. Lock affected rows in deterministic order: institution/organizer configuration if required, event, entry, registration, order, credit, then pass/session. Sort same-kind IDs before locking. Recheck state after obtaining locks.
4. Validate allowed transition and expected row version. Commit business records, audit and outbox in the same transaction. External bank/email/storage actions use a separate verified workflow, not simulated transaction success.
5. Return allowlisted state, reference, next action and correlation ID. Use 401 unauthenticated, 403/404 unauthorized, 409 version/state/capacity conflict, 422 invalid request and 429 rate limited. Do not include raw SQL errors or secret data.

## Public and identity commands
| Proposed RPC | Caller | Contract |
|---|---|---|
| rpc_public_catalogue(track text) | Anonymous | Published organizer/event labels, approved prices, public rules and published results only. Unknown prices stay null. No internal config/room secrets. |
| rpc_my_workspace() | Authenticated | Own profile, minimal registrations, notifications and effective role menu. No role escalation by route choice. |
| rpc_save_profile(input jsonb, expected_version int) | Own user | Allowlisted contact/college fields; no role/status/MFA fields. Compare and increment profile row_version atomically. |
| rpc_request_teacher_access(reason text) | Own verified user | Creates pending verification request only. No staff grant. |
| rpc_invite_staff(email text, role text, scope jsonb, expiry timestamptz) | Authorized manager | Managed Auth invitation occurs server-side. Admin can assign only volunteer/judge/teacher within own events; super admin grants admin/finance/export. Require acceptance, MFA and audit. Never send passwords. |
| rpc_revoke_staff(assignment_id uuid, reason text) | Authorized manager | Revoke assignment and duties, require hierarchy/scope, protect last super admin, notify and revoke sessions where supported. |

The profile-version parameter is mandatory; a stale edit returns conflict rather than overwriting a newer profile.

## Registration and capacity commands
| Proposed RPC | Caller | Atomic behavior |
|---|---|---|
| rpc_start_registration(event_id uuid, price_option_id uuid, idempotency_key text) | Verified student | Published approved version, eligibility, registration window and known enabled fee. Create draft using server-selected mode/version. Unknown esports mode cannot checkout. |
| rpc_invite_member(registration_id uuid, email text, idempotency_key text) | Owner/captain | Validate event/team size, mint single-use random invitation, store hash and expiry, queue invite. Bound outgoing invites; never let a captain consent as recipient. |
| rpc_accept_invitation(token text, idempotency_key text) | Intended verified recipient | Verify normalized email binding, token hash/expiry, duplicate event membership, accepted rules version and consent. Lock invitation, insert/update accepted member once. |
| rpc_allocate_entry(registration_ids uuid[], expected_versions jsonb, idempotency_key text) | Owner team / scoped coordinator for pooling | Same event/version, valid consent/size, correct fee model. Create provisional entry and entry_participants. Solo policy requires approved allocation-before-payment. No funded cross-entry transfer. |
| rpc_reserve_entry(entry_id uuid, expected_version int, idempotency_key text) | Authorized captain/coordinator | Lock event then entry. Count active held/review/confirmed entry units excluding expired unpaid holds after cleanup. Allocate one unit if capacity permits; unknown capacity requires approved operational limit policy, not invented zero. Create one reservation and each necessary order with immutable price/beneficiary snapshots. |
| rpc_join_waitlist(entry_id uuid, idempotency_key text) | Entry owner | No payment order while waitlisted. Entry-level position and offer expiry. Promotion and reserve must use same event lock. |
| rpc_accept_waitlist_offer(waitlist_id uuid, idempotency_key text) | Entry owner | Verify current offer, expiry, roster and capacity under lock; reserve and create orders once. |
| rpc_change_roster(registration_id uuid, removed_member_id uuid, invited_member_id uuid, reason text) | Scoped admin | New member already consented and eligible, same entry, no match/attendance conflict, source rules allow approved change. Deactivate old member/participant, revoke old pass, update snapshot and re-evaluate funding; retain history. |
| rpc_cancel_registration(registration_id uuid, reason text) | Owner request / authorized admin finalization | Record policy-controlled cancellation, revoke passes, release accepted membership, reconcile entry funding/capacity. Do not mark bank money refunded. Create refund request if approved policy requires. |

Reservation default 30 minutes is a proposal configurable after approval. Timely evidence submission changes the entry reservation to review_hold. Pooled individual teams may have several orders; the entry is confirmed only when all accepted members' registrations are funded. A partially paid team is a finance/coordination exception, never silently dropped at expiry. Expiration worker locks event and reservation, skips review/funded cases and releases only truly unpaid holds.

## Payments and refunds
| Proposed RPC | Caller | Atomic behavior |
|---|---|---|
| rpc_submit_payment(order_id uuid, transaction_reference text, claimed_amount bigint, paid_at timestamptz, receipt_file_id uuid, idempotency_key text) | Order owner | Validate owner, order/current state, file ownership/purpose/validated state. Append evidence version; order under review; hold reservation if on time; late cases create exception. This command cannot verify payment. |
| rpc_review_payment(order_id uuid, evidence_id uuid, outcome text, bank_match jsonb, reason text, idempotency_key text) | Scoped finance reviewer with MFA | Lock order and credit key, prohibit reviewer being owner or accepted member of the entry, verify real bank-source evidence. Require matching beneficiary/account/profile and exact amount. Atomically create/deduplicate credit, allocate once, append review, update order, re-evaluate registration/entry, audit and outbox. |
| rpc_request_refund(order_id uuid, amount bigint, reason text, idempotency_key text) | Owner/authorized staff | No refund above eligible paid amount; record request only. |
| rpc_approve_refund(refund_id uuid, idempotency_key text) | Authorized finance/super admin | No self-approval or participant conflict. Lock order; cumulative approved/processing/completed refunds <= verified allocated amount. Competing requests serialize under this lock. |
| rpc_record_refund_transfer(refund_id uuid, bank_reference text, completed_at timestamptz) | Authorized finance | Require bank evidence and correct prior state. Unique reference; record actual completion, recompute order refunded state and notify. Transfer itself is not performed by clicking this RPC. |
| rpc_propose_payment_profile(input jsonb) | Institution super admin with recent MFA | Validated official QR file, decoded destination matched to college finance evidence. Immutable proposed profile. No guessed UPI details. |
| rpc_activate_payment_profile(profile_id uuid, reason text) | Different institution super admin with recent MFA | Verify proposer != actor and independent bank/QR checks. Lock institution, retire old active version, record approval and activate new one. Existing orders keep old snapshots; resolve old-destination payments explicitly. |

Bank credit and allocation amounts must equal order.total_paise for normal verification. Overpayment/underpayment/wrong account/late credits are exceptions, not automatic success. Rejected evidence can be corrected by appending a version. Never mutate append-only evidence or credit rows to disguise an error. A misallocated bank credit requires an explicitly designed finance adjustment migration/workflow before any reassignment; initial release escalates it rather than deleting ledger rows.

## Passes and volunteer actions
| Proposed RPC | Caller | Atomic behavior |
|---|---|---|
| rpc_issue_pass_for_actor(actor uuid, pass_id uuid, entry_participant_id uuid, hash text, ciphertext text, key_version int, reason text) | Server-only internal command; service_role execution only | Vercel verifies the real requester and derives actor internally. DB validates actor is the owner or authorized issuer, confirmed fully funded registration/entry, accepted active member and no disqualification. Insert pass atomically, revoking old version only for explicit reissue. Never grant this function to anon/authenticated. |
| rpc_my_pass_envelope(entry_participant_id uuid) | Pass owner via verified user context | Return only that owner's active pass envelope to the server handler. Server decrypts token and renders QR with private/no-store response. Do not decrypt or return other users' tokens. Refreshing the page does not rotate/revoke a valid pass. |
| rpc_scan(token text, session_id uuid, station_id uuid, idempotency_key text) | Active assigned volunteer with MFA | Lock pass/registration as needed; check token, expiry/revocation, funded registration, active member, correct event/session and current duty. Insert attendance once; duplicate returns prior timestamp. No permission or network => no success. |
| rpc_manual_attendance(support_reference text, session_id uuid, station_id uuid, reason text) | Authorized on-duty desk | Rate limited, identity checked, same authority/uniqueness as QR. Do not return broad roster for invalid reference. Paper reconciliation records actual observed time separately if required via approved migration. |
| rpc_complete_checkpoint(entry_id uuid, checkpoint_id uuid, session_id uuid, penalty_seconds int, reason text) | Assigned checkpoint marshal | Correct entry/event/shift, valid active members, previous checkpoint completed and clue correctness verified. Unique completion; record server time. No auto-published winner. |

Initial QR scanning is online. Disable ambiguous success on network loss. Do not collect all participant data on volunteer devices for an unplanned offline mode. Check-out is optional; if enabled validate prior check-in and specify re-entry policy before exposing it.

QR storage decision: generate a 256-bit cryptographically random token in the trusted server. Save its SHA-256 lookup hash and AES-256-GCM encrypted envelope (nonce, ciphertext, authentication tag) with a key version. Bind the server-generated pass ID, participant ID and event ID as authenticated associated data. Encryption keys live only in Vercel server secrets, distinct across environments and never in Supabase rows. Keep old decrypt keys during controlled rotation; reencrypt or revoke/reissue as appropriate. Never log plaintext tokens, envelopes, signed URLs or encryption keys. The local DDL fixture uses dummy ciphertext and does not test cryptography. Token issuance uses an idempotent server command; losing its response does not create duplicate passes.

## Judging and publication
| Proposed RPC | Caller | Atomic behavior |
|---|---|---|
| rpc_save_scorecard(assignment_id uuid, marks jsonb, expected_revision int) | Assigned judge with MFA | No conflict, correct event/rules/rubric, current draft; each criterion bounded. Lock card; reject unknown or duplicate criteria. |
| rpc_lock_scorecard(scorecard_id uuid) | Assigned judge | All required criteria present, conditional policy resolved, bounds and version valid; lock once and audit. |
| rpc_reopen_scorecard(scorecard_id uuid, reason text) | Authorized scoped manager | Preserve old scorecard; supersede and create new revision for assigned judge. No published-result mutation without correction workflow. |
| rpc_propose_results(event_id uuid, calculation_version text) | Event admin | All required locked scores/checkpoint/poll/game evidence complete, approved aggregation/tie rules, conflict checks. Calculate deterministically and store input scorecard IDs. |
| rpc_publish_results(revision_id uuid, reason text) | Different super admin with MFA | Verify proposal, dependencies and no stale changed source; supersede prior published revision transactionally. Notify affected participants. No automatic prize payment. |
| rpc_record_match_result(match_id uuid, entries jsonb, rules_version uuid) | Assigned esports official | Approved game rules/formula, match entries/placements valid. Independent review before final standings; no invented kill/placement weighting. |

## Operations and workers
Event publication checks known fees for enabled modes, rules approval, award-label resolution, schedule, destination and appropriate eligibility. Change schedule with version conflict detection; notify affected confirmed participants and identify cross-event conflicts. Broadcasts snapshot recipients and scope; all-institution messages require super-admin approval.

Worker-only commands claim outbox rows with `FOR UPDATE SKIP LOCKED`, set a short lease, and finish/retry only their own lease. Authenticate scheduler calls and reject service-role attempts to invoke user commands without a real actor. Separate commands cover expiration, notification fanout/delivery, receipt webhooks, private exports and retention/orphan cleanup. All external callbacks require signature verification and event-ID deduplication.

## Required integration evidence
For every command record: exact function signature, grants, actor/scope checks, rows locked, transaction writes, audit/outbox event, successful case, forbidden case, duplicate retry case and relevant concurrent case. Until these tests pass on a Supabase-compatible runtime, the corresponding feature remains `implemented_unverified` or `not_started` in progress tracking.
