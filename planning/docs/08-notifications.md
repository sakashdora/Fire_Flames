# Notification design and message catalogue

Use durable in-app messages as the primary record and verified email for transactional alerts. SMS/WhatsApp are optional channels requiring an approved provider, budget, consent and tested delivery; they are not assumed operational. Never call a message delivered merely because an API accepted it.

## Delivery rules
Write the event and outbox row in the same database transaction as the business action. Worker sends at least once; a deduplication key of business event, recipient, template version and channel prevents repeated user-facing sends. Save queued, attempted, accepted, delivered where a provider proves it, bounced and failed separately. Track in-app read state separately from email delivery. Do not expose tokens or payment evidence in messages.

Proposed email retry schedule: 1 minute, 5 minutes, 30 minutes and 2 hours for transient failures; permanent failures go directly to the support queue. Honor provider rate limits. Staff dashboard alerts on exhausted attempts; a retried notification must not repeat the underlying payment or registration action. Cancellation suppresses obsolete scheduled reminders. Send one current schedule change summary instead of every intermediate draft.

## Trigger matrix
| Trigger | Recipients | Channel | Content and action |
|---|---|---|---|
| Account verification | Account owner | Managed auth email | Expiring single-use verification link |
| Team invitation | Named invitee | In-app and email | Event, captain, price model, accept/decline |
| Roster changed | Every affected member | In-app and email | Change summary and consent action |
| Payment details received | Payer/captain | In-app and email | Under review; no pass promise |
| Evidence correction required | Payer/captain | In-app and email | Safe reason and deadline |
| Payment verified, allocation pending | Individual applicant | In-app and email | Payment received; team assignment still needed |
| Registration confirmed | Each member | In-app and email | Event and authenticated pass link |
| Waitlist offer | Applicant/captain | In-app and email | Expiry and action; do not auto-charge |
| Schedule/venue changed | Confirmed affected participants and assigned staff | In-app and email | Old/new details, IST, acknowledgement if critical |
| Event reminder | Confirmed participants | In-app and email | Approved reporting time and required ID |
| Duty assigned/changed | Volunteer/judge/teacher | In-app and email | Scope, shift, supervisor and acknowledgement |
| Review backlog or delivery failure | Assigned admin/finance | In-app; email escalation | Queue link, no private evidence attached |
| Cancellation/refund update | Affected payer and members | In-app and email | Actual status and support route |
| Results published/corrected | Participants and assigned staff | In-app and email | Published revision link |
| Role or beneficiary changed | Security owner, finance and impacted staff | In-app and email | Actor, change summary, escalation contact |

## Example templates
Payment received: “We received payment details for {event_name}, registration {reference}. Status: under review. This is not a payment confirmation. View the status securely in your account.”

Confirmation: “Your {event_name} registration is confirmed. Organizer: {organizer}. Reporting: {published_reporting_time_IST_or_TBA}. Sign in to view your individual entry pass. Share your pass only with event staff.”

Correction: “Action required for {reference}: {safe_reason}. Please open your registration and provide the requested correction by {deadline_IST}. Do not send passwords or banking credentials.”

Schedule change: “{event_name} has moved from {old_time_venue} to {new_time_venue}. All times are IST. Your registration remains {status}. View the latest schedule before travelling.”

Refund update: “Refund for {reference}: {actual_state}. Amount: {amount}. {completed_bank_reference_if_available}. Contact {approved_support_contact} if you need help.”

Duty assignment: “You are assigned to {event}, {station}, {shift_IST}. Review your duties and acknowledge the shift. Your access is limited to this assignment.”

## Broadcasts and service targets
Admins draft broadcasts for their organizer/events and preview recipient count. Critical all-festival notices require super-admin approval. Validate recipients, prevent duplicate sends, escape inserted values and log sender/template/audience. Never display student email lists to recipients. Operational notices cannot be switched off in a way that hides material event changes; optional promotional messages have separate consent/preferences.

Proposed processing target: routine in-app messages within 10 seconds and email submission within 2 minutes after committed action, subject to provider availability. These are engineering targets, not guaranteed inbox arrival. Registration launch requires verified sender DNS, SPF/DKIM/DMARC as applicable, reset/verification delivery tests and a monitored reply/support mailbox.
