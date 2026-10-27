# Roles and access

Identity, affiliation and operational authority are separate. A person may be a student volunteer or a teacher judge, but staff permissions exist only through approved assignments. Selecting “Teacher sign in” is not a grant of admin rights.

## Role definitions
| Role | Access scope | Allowed duties | Never implied |
|---|---|---|---|
| Visitor | Public | View published events, rules, schedules and approved results | Participant directory or payment data |
| Student | Own profile and accepted memberships | Register, invite members as captain, submit own payment, view own passes | View other students or approve funds |
| Teacher | Own verified profile | View assigned coordination tasks; judge if separately assigned | Automatic admin or finance access |
| Volunteer | Active shift, event and station | Scan, limited lookup, attendance and incidents | Fees, funds approval, exports or scores |
| Judge | Assigned event and candidates | Draft and lock own rubric scores | Other judges' draft scores or payment evidence |
| Event admin | Assigned organizer and events | Registrations, teams, timetable, volunteer/judge duties, result proposals | Cross-organizer access or super-admin grants |
| Finance reviewer | Explicit additional permission and organizer scope | Reconcile deposits, reject evidence, propose refunds | Change beneficiary or own-payment approval |
| Super admin | Institution-wide explicit membership | Assign admins, approve settings, payment profile, result publication and incident recovery | Bypass audit or unilateral self-approval |

## Permission matrix
| Action | Student | Teacher | Volunteer | Judge | Event admin | Super admin |
|---|---|---|---|---|---|
| Own profile and registration | Own | Own where eligible | Own student role | Own where eligible | Own where eligible | Own where eligible |
| View event participant roster | No | Assigned only | Minimal on-duty | Assigned candidates | Scoped | Institution |
| Check in participant | No | With duty | Assigned station | No | Scoped override with reason | Logged override |
| Verify payment | No | Finance grant only | No | No | Finance grant only | Finance grant; no self-review |
| Edit event setup | No | No | No | No | Draft scoped | Approve/publish |
| Assign volunteer or judge | No | No | No | No | Scoped | Institution |
| Grant admin or finance role | No | No | No | No | No | Yes with reason and MFA |
| Submit scores | No | Judge grant | No | Assigned | Only if judge grant | Only if judge grant |
| Publish or correct results | No | No | No | No | Propose | Approve |
| Export personal data | Own | No | No | No | Separate export grant | Logged and purpose-limited |
| Change payment beneficiary | No | No | No | No | No | Propose; second approver required |

“Assigned” always means explicit current database assignment, not a frontend route or email suffix. Scope checks apply to organizer, event, duty window and record ownership on every request. A global role does not remove conflict-of-interest restrictions.

## Account lifecycle
Students verify an email address, complete name, mobile, college, course/year and college-ID number only where needed for eligibility, and accept terms. No bulk public student list. Captains invite members with expiring single-use links; each member authenticates and consents. A captain cannot set another person's password or silently consent for them.

Teachers are invited or submit an access request for manual college verification. Staff invitation is issued to a specific address and role; first sign-in requires account setup and MFA enrollment. No shared volunteer accounts. Admins may assign already verified volunteers/judges only within their own events. Only super admins grant admin/finance privileges. Assignment expiry automatically removes effective permissions.

Provision the first super admin through a documented owner-controlled bootstrap outside public registration. Require a second named super admin for beneficiary changes and recovery. The last active super admin cannot be demoted without an approved replacement. There is no public role dropdown that grants elevated access.

## Session and audit behavior
Staff MFA is enforced on the server and database, not just shown as a setup prompt. Proposed staff idle timeout: 30 minutes with reauthentication; require recent MFA for privilege grants, exports, refunds and beneficiary changes. Revoked roles must stop working immediately by checking active membership on each sensitive action; do not wait for a cached role claim to expire. Student sessions use normal managed-auth limits and explicit sign-out on shared devices.

Audit entries contain actor, effective role, scope, action, record, time, reason, before/after summary and request correlation ID. Exclude raw QR tokens, passwords, session tokens and full payment screenshots. Audit access is restricted and retention follows college policy. Application users cannot update or delete audit records.
