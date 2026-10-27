# Testing delivery and release readiness

The following plan is relative to 27 October 2026, with the documented festival starting 13 November. It is a proposed sequence, not a delivery guarantee. Do not compress finance, access-control or live-device testing to meet an arbitrary visual-demo deadline.

## Delivery phases
| Phase | Proposed window | Deliverable and exit condition |
|---|---|---|
| 0 Decisions and review | 27–28 Oct | Approve this pack; identify payment, rules, staffing and sender owners |
| 1 Foundation | 29–30 Oct | Separate environments; verified identity; tested role/scope policies; catalogue |
| 2 Registration and finance | 31 Oct–3 Nov | Team consent, capacities, payment review, exceptions, passes and audit |
| 3 Operations and communications | 4–6 Nov | Staff duties, scanning, judging, results and durable notifications |
| 4 Experience and integration | 7–8 Nov | Final source assets, mobile layouts, accessibility and end-to-end flows |
| 5 College acceptance | 9–10 Nov | Real-device rehearsal, payment/sender tests, load and restore checks |
| 6 Controlled launch | 11 Nov target | Signed release checklist; monitored registration; rollback ready |
| 7 Event readiness | 12 Nov | Roster review, devices, duties, runbooks and support rehearsal |

This leaves a short public intake window if launch waits until 11 November. College must decide whether to open a tested registration core earlier or revise the schedule. Any phased launch must still pass identity, finance, privacy and pass-integrity gates. Freeze nonessential effects or optional features before weakening a required control.

## Work packages
P0: authentication, event content, scope permissions, team registration, payment reconciliation, pass issuance, online check-in, core notifications, audit and support. P1 before event where required: judging, result approval, waitlist, programme changes, finance reports, restore rehearsal. P2 only after core stability: cinematic effects, optional certificates, optional meals, advanced analytics and game telemetry. Results may use a documented controlled manual calculation only if college explicitly accepts that changed scope; do not claim full scoring automation then.

## Acceptance scenarios
| ID | Scenario | Pass condition |
|---|---|---|
| T01 | Desktop and phone hero | Both organizers are identifiable; each CTA opens its own route |
| T02 | External-college student | Non-Srusti verified email can complete eligible profile and registration |
| T03 | Teacher sign-in selection | No role elevation; unassigned teacher sees request/access status |
| T04 | Invalid team size | Backend rejects 1/5 members for a 2–4 event and 4 for Brand War |
| T05 | Invitation replay or impersonation | Expired/reused/wrong-recipient invite cannot add a member |
| T06 | Duplicate event membership | Same student cannot enter two active teams for one event |
| T07 | Team versus solo fee | Valid team pays ₹99 once; solo mode follows approved ₹59 policy |
| T08 | Unknown esports fee | No checkout or ₹0 default; information page remains usable |
| T09 | Final slot race | One valid reservation; other request gets waitlist/conflict |
| T10 | Client fee tampering | Server returns approved fee and rejects unsupported changes |
| T11 | Fake receipt | No confirmed payment/pass without independent credit reconciliation |
| T12 | Duplicate credit | One settled bank transaction cannot fund two orders |
| T13 | Self-review | Staff payer/team member cannot verify their own transaction |
| T14 | Late payment after expiry | Exception queue; no over-capacity auto-confirmation |
| T15 | Rejected evidence correction | Version history retained; safe correction path and notification |
| T16 | Underpayment/overpayment | Explicit finance resolution; no silent amount substitution |
| T17 | Refund retry | One refund action/reference; total refund never exceeds permitted amount |
| T18 | Pass privacy | QR payload contains no personal/payment data; token not logged |
| T19 | Concurrent duplicate scans | Exactly one attendance record; second response is duplicate |
| T20 | Revoked or old pass | Denied immediately after reissue/revocation |
| T21 | Wrong event or off-duty scanner | Denied on server; no attendee record exposure |
| T22 | Two-day sessions | Valid day-two action distinct from day-one attendance |
| T23 | Offline or camera denied | Clear not-recorded state; authorized manual fallback works |
| T24 | Cross-organizer access | ED Cell admin cannot read or mutate Srustiprosar private records |
| T25 | MFA and revoked role | Missing MFA or revoked assignment blocks protected action |
| T26 | Beneficiary change | Two different approved actors required; every change versioned |
| T27 | Malicious file | Forged type/oversize/script payload rejected; private storage stays private |
| T28 | Judge bounds and locks | Invalid score rejected; locked score cannot be silently overwritten |
| T29 | Result correction | New approved revision and affected-user notifications |
| T30 | Notification outage | Outbox retries; no duplicate registration/payment action or noisy repeat |
| T31 | Schedule conflict | Overlap detected; change alerts target affected participants |
| T32 | Accessibility | Keyboard, screen reader, focus, contrast and reduced motion pass review |
| T33 | Performance | Approved device/network/load profile meets documented budgets |
| T34 | Restore and rollback | Staging restore verified with measured RPO/RTO and schema compatibility |
| T35 | Secret exposure | No privileged key in public assets, logs, repository or built bundle |
| T36 | Export access | Logged, scoped and purpose-limited; formula injection neutralized in CSV |
| T37 | Last super admin | Cannot remove sole active authority without approved replacement |
| T38 | Stale edits and retries | Version conflict surfaced; idempotency prevents duplicate writes |
| T39 | Registration closure | New orders blocked; existing paid exceptions routed correctly |
| T40 | Source correctness | Fee/prize totals and rubric maxima match approved source/version |

## Test layers and evidence
Domain tests cover transitions, fee modes, rubric totals and timing. Database integration tests use separate identities and concurrent transactions to exercise RLS, uniqueness and roles. End-to-end tests complete both student and staff journeys using synthetic records. Live-device UAT includes Android Chrome and iPhone Safari, camera permission, low light, poor network, keyboard and screen reader behavior. The college witnesses a test payment under its control and verified email delivery before collecting real registrations.

Store test ID, build commit, environment, tester, timestamp, actual result, evidence link and defect reference. No test in this pack is marked passed; these are future acceptance criteria. Asset/document integrity checks are separate from application testing. Re-test changed or failed flows; do not imply that a static mockup proves a backend works.

## Launch checklist
- College confirms organizer names, dates, eligibility, capacities, fee modes, event rules and award names.
- Official payment profile verified by two approvers; refunds and exception ownership approved.
- Named super admins, admins, finance reviewers, judges and volunteers invited and trained.
- Private-data access policies, staff MFA, audit, bank-credit uniqueness and scan replay tests pass.
- Production sender, reset links, support contact, notification monitoring and bounce handling work.
- Approved schedule, venue, maps, rule supplements and public copy are published.
- No blocking security/finance defect; staging UAT signed by college operations and technical leads.
- Backup restoration, incident response, duty reassignment and paper fallback rehearsed.
- Deployment owner, rollback procedure, monitoring window and event-day support coverage assigned.

## Ownership and cost planning
College sponsor approves scope and public policies; organizer leads approve event rules; finance owns bank verification/refunds; technical owner owns deployments, backups and incident response; independent reviewer checks access/payment tests. Budget categories are domain/hosting, database/storage and recovery plan, email delivery, optional SMS, event network/devices, support staffing and independent security review. Obtain current vendor quotes before a rupee estimate; none is invented here.
