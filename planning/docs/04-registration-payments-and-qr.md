# Registration payments and QR workflows

Keep registration, payment, eligibility and attendance as distinct records. The UI must describe the real state and required next action. “Evidence submitted” does not mean “Paid”, and “Paid” does not automatically mean “Eligible to participate”.

## Student and team journey
Browse either organizer track, select an event, read price/size/rules, sign in, complete college profile, choose team or individual mode where published, obtain member consent, review the roster and fee, accept the event rules version, reserve a slot, pay the displayed official beneficiary, submit a transaction reference and optional supporting receipt, await verification, and receive a confirmed event registration and individual pass.

The ₹99 team option covers one valid team. ₹59 individual intake is a separate product, not ₹59 multiplied automatically into a team fee. Proposed individual policy: coordinator pools individually paid applicants into valid teams with consent, with no extra ₹99 charge; no pass until allocation completes. This policy needs college approval before individual checkout opens. Until then show the documented individual price with “Individual registration policy awaiting confirmation”; do not accept unallocatable payments.

For team mode, enforce 2–4 members or 2–3 for Brand War before payment. Pending invitations must be resolved first. Once evidence is submitted, freeze the price and roster snapshot. A post-payment roster change requires admin review, member consent, eligibility recheck, audit and pass reissue for affected members. Moving captainship must not create a second order or payment.

## Registration states
| State | Entry condition | Next allowed actions |
|---|---|---|
| draft | Student starts own form | Edit, invite, abandon |
| awaiting_members | Valid captain, unresolved invitations | Accept/decline, revise roster |
| awaiting_allocation | Individual policy approved; allocation incomplete | Coordinator proposes team, students accept |
| payment_due | Eligible roster or approved solo-intake mode; slot held | Pay, submit evidence, cancel, expire |
| payment_review | Evidence submitted within hold | Reviewer verifies, requests correction or rejects |
| action_required | Evidence mismatch or incomplete information | Submit corrected evidence before deadline |
| confirmed | Verified full payment plus valid eligibility and allocated roster | Issue pass, attend, request change/cancellation |
| waitlisted | Capacity unavailable before collection | Accept a time-limited offer; no payment yet |
| expired | Reservation deadline elapsed without evidence | Recheck availability and start a new reservation |
| cancelled | Approved withdrawal or event cancellation | Refund workflow if required |
| disqualified | Authorized conduct/rules decision | Revoke event pass, record reason and appeal channel |

Proposed hold: 30 minutes to submit evidence. Evidence submitted on time protects the slot through manual review. Escalate review older than 24 hours to finance; never silently expire a paid-looking submission. Capacity counts confirmed entries and active holds/reviews; waitlist and abandoned drafts do not count. Exact timer and support coverage need approval. Allocate the last slot transactionally so two users cannot buy it.

If a transfer arrives after a slot expires or an event fills, mark “Verified payment awaiting resolution”; do not force-confirm above capacity. Finance offers an approved reallocation or refund. This exception blocks automatic pass issuance and appears in a dedicated queue.

## Payment configuration
The college supplies its official QR image, beneficiary name, UPI identifier and authorized receiving account confirmation through a controlled channel. Two named approvers verify decoded destination against college records and conduct an approved test transfer before activation. Store a versioned payment profile with image checksum, verified destination, effective time and approvals. Never recreate an official QR using guessed information.

Desktop checkout shows the verified QR, beneficiary, exact amount, order reference and a copyable UPI ID. Mobile also offers an approved UPI intent link if the college provides/verifies the required details, plus QR download/manual payment guidance. Static QR often does not encode the order amount, so show the exact amount prominently. Do not assume a UPI app return, intent callback, screenshot or typed UTR proves payment.

Payment credentials are separate from entry-pass QR tokens. Never place the college payment QR on an attendance pass. Never style a decorative QR as a functional one. The design boards use labelled boxes for missing QR assets.

## Reconciliation state machine
Payment progresses from unpaid to evidence_submitted, then under_review, then verified, rejected or needs_information. Corrections append a new evidence version. Match transaction reference, credited amount, beneficiary, transaction time and settlement evidence from authorized bank/merchant records. Reviewer records source/reference and reason. No screen scraping of personal banking accounts is part of this plan.

Use a unique settled bank transaction identifier and receiving account combination to prevent the same credit funding two orders. Typed UTR uniqueness alone is not proof. Handle duplicated submissions idempotently. Reject a reviewer verifying their own order or a team they belong to; route to another reviewer. UI displays the verification history without exposing bank statements to students.

Underpayment, overpayment, missing reference, duplicate reference, wrong beneficiary, unreadable evidence and late payment each enter explicit exception queues. Do not silently change an order price to match a transfer. One verified transaction funds one order in the first release; split/combined bank transfers require finance resolution. Refund states are requested, approved, processing, completed or failed, with amount, reason and actual bank reference; clicking approve is not proof money was returned. Refund policy and service targets require college approval.

## Pass issuance and scanning
A valid confirmed registration issues one pass per authenticated participant per event; the team captain also sees a roster summary. Each pass has a random opaque token of at least 128 bits, its hash stored server-side, expiry, version, event and participant association. The QR contains no name, phone, college ID, payment data or role. Display event, participant display name, team, date/time when published and a human-readable support reference beside the QR.

Volunteer signs in with MFA, starts an assigned shift, selects the authorized station/session, permits camera access and scans. Server checks token validity, current registration, revocation, event/session, duty assignment and attendance uniqueness in one transaction. Successful attendance returns a concise green confirmation with matching identity and time; repeated scan returns amber “Already checked in” with original time; wrong event, invalid or revoked pass returns a clear denial. Never reveal a full profile for an invalid token.

Uniqueness key is participant plus event session plus attendance action. Day-one check-in must not block a separately authorized day-two session; event entry is distinct from campus entry. Check-out/re-entry, if enabled, requires an explicitly modeled policy. Shared team passes must not mark absent teammates present. Copied valid QR images are mitigated by server replay protection and name/college-ID visual matching where required; opaque tokens alone do not prevent sharing.

If the camera fails, use a rate-limited support-reference lookup at the assigned desk and verify identity before marking attendance. Log manual entries and reason. On network loss show “Not recorded”; pause definitive check-in. Authorized fallback is a numbered paper exception ledger, later reconciled by a supervisor. Do not store a roster or unrestricted payment data on volunteer phones.

## Treasure checkpoints and optional entitlements
Checkpoint completion is separate from event attendance. Assigned marshals validate a team's pass and checkpoint in order, recording server time and any approved penalty. The last checkpoint does not automatically publish a winner; the evaluator reviews correct completion and penalties. Optional meal/certificate records use their own eligibility and uniqueness rules and remain off until college approval.
