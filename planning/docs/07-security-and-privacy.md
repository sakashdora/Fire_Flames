# Security privacy and recovery

Security is a property of implemented and tested controls. This plan does not certify an undeveloped application as secure. Threat priorities are unauthorized staff access, cross-organizer record exposure, forged payments, reused QR passes, hostile uploads and unsafe result changes.

## Required controls
| Threat | Required control | Verification |
|---|---|---|
| Student grants themselves admin | Server-owned role records; restricted provisioning | Direct API and metadata tampering denied |
| ED Cell admin sees esports finances | Organizer and event scope on reads/writes/exports | Cross-scope negative tests |
| Revoked volunteer continues scanning | Active role and duty checked on every command | Revoke during session, next scan denied |
| Fake screenshot creates pass | Reconcile actual credit; independent finance role | Forged receipt stays unverified |
| One transfer pays two orders | Unique settled-credit allocation | Concurrent approval collision tested |
| Copied or revoked QR | Opaque random tokens, expiry, revocation, server lookup, identity check | Replay and old-pass tests |
| Hidden malicious upload | Extension plus decoded content validation, size limits, quarantine | Invalid MIME, SVG script and oversized files rejected |
| Client changes fees or score | Server calculation, versioned rules, bounded marks | Manipulated request rejected |
| Attacker brute-forces IDs or OTP | Rate limits, cooldown, generic account responses | Automated abuse tests |
| Admin tampers with published result | Locked source scores, dual-stage publication, append-only revisions | Correction produces new revision and notification |

## Authentication and application hardening
Managed identity handles password hashing, verification and reset. Student email verification is the proposed baseline, with a college help-desk process for delivery failures; never silently bypass verification. Require MFA for all staff actions; a UI prompt without server enforcement is insufficient. Supabase reference: https://supabase.com/docs/guides/auth/auth-mfa.

Prefer server-mediated sessions using Secure, HttpOnly, SameSite cookies where the chosen architecture supports them. Document the session model in an implementation decision before coding. Add CSRF protection for cookie-authenticated mutations, strict allowed origins, content security policy, clickjacking protection, TLS, safe redirects and output encoding. Avoid arbitrary HTML in event descriptions; sanitize any permitted rich text. Validate every request and use parameterized database operations. No service-role credentials or email-provider secrets in browser bundles.

Payment uploads initially allow JPEG, PNG and PDF up to a proposed 5 MB limit; verify real type, strip unnecessary metadata where feasible, quarantine until validated, disallow executables/HTML/SVG and scan supported content before staff download. Reject files that cannot be safely inspected rather than treating their filename as proof. Evidence is not publicly addressable. Reference: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html.

## Data minimization and consent
Collect the minimum to identify and contact participants: name, verified email, phone where operationally needed, college and course/year. College-ID number or visual ID inspection must have a stated eligibility purpose; do not collect Aadhaar or bank credentials. Keep player IDs only for esports when approved rules require them. Do not collect face recognition data or continuous location.

Registration terms explain organizer identity, selected event, fees, team-member consent, payment verification, cancellation/refund policy, conduct, contact and data use. Separate optional publicity/photo consent from required registration acceptance. Captains cannot give optional consent for teammates. Public results use team/display names only unless participants have been informed and consent where appropriate.

Proposed retention: payment evidence 90 days after final reconciliation, participant contact records 180 days after event closure, and audit/financial records according to the college's approved obligations and policy. These are proposals, not legal retention claims. The college privacy owner must approve retention, deletion requests, dispute holds and treatment of any under-18 participants before launch. Age eligibility is not stated in the sources; add a gate rather than invent a minimum age or consent rule.

## Privileged changes and recovery
Payment destination changes require two different named super admins and recent MFA. Notify both organizer leads and finance on activation. Role grants, bulk exports, refunds and result corrections require reasons and are auditable. Prevent self-approval and changing grants to bypass a review conflict. Staff who also compete may not judge or reconcile their own event entry.

Recovery uses a named college owner, independent identity verification, recorded reason and session revocation. Do not email passwords or share recovery codes through event groups. Lost volunteer device: suspend duty and revoke sessions immediately; reissue access on a verified replacement device. Leaked pass: revoke and issue a new version. Suspected beneficiary compromise: pause checkout immediately, preserve logs, verify account with college finance, notify affected participants using approved communication.

## Incident runbook
Detect and record an incident ID, severity and owner. Contain by revoking sessions, pausing affected workflow or disabling a track. Preserve relevant audit/evidence without broad data export. Assess affected records, recover from tested backups if needed, notify authorized college leads, and communicate factually to affected users under college policy. Record resolution and preventative action. A frontend rollback alone does not undo financial or database changes.

## Release security gate
No production launch with a known privilege escalation, cross-scope data leak, duplicate-credit allocation, invalid pass acceptance, exposed secret or unrecoverable data loss. Require reviewed policies for every private table/storage bucket, a secret scan, dependency review, role tests and an incident rehearsal. Do not promise penetration-test certification; commission an independent review if required by the college.
