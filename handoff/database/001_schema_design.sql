-- FIRE & FLAMES schema design v2, 2026-10-27
-- Fresh disposable/staging Supabase database only after review. NOT a complete live app.
-- Supabase auth.users and anon/authenticated/service_role roles must already exist.
begin;
create schema app;

create table app.institutions (
id uuid primary key default gen_random_uuid(),
name text not null, timezone text not null default 'Asia/Kolkata',
support_email text, support_phone text, archived_at timestamptz,
created_at timestamptz not null default now()
);
alter table app.institutions enable row level security;

create table app.organizers (
id uuid primary key default gen_random_uuid(),
institution_id uuid not null references app.institutions(id),
slug text not null unique, name text not null,
active boolean not null default true, unique(id,institution_id),
created_at timestamptz not null default now()
);
alter table app.organizers enable row level security;

create table app.colleges (
id uuid primary key default gen_random_uuid(),
name text not null, city text, state text, verified_at timestamptz,
active boolean not null default true,
created_at timestamptz not null default now()
);
alter table app.colleges enable row level security;

create table app.profiles (
id uuid primary key references auth.users(id) on delete restrict,
display_name text not null, contact_email text not null, phone text,
college_id uuid references app.colleges(id), college_name_other text,
course text, year_of_study text, college_id_reference text,
affiliation text not null check(affiliation in ('student','teacher','other')),
status text not null default 'active' check(status in ('active','suspended','anonymized')),
publicity_consent boolean not null default false,
privacy_version text, privacy_accepted_at timestamptz, row_version integer not null default 1,
check(college_id is null or college_name_other is null),
created_at timestamptz not null default now()
);
alter table app.profiles enable row level security;

create table app.verification_requests (
id uuid primary key default gen_random_uuid(),
profile_id uuid not null references app.profiles(id),
kind text not null check(kind in ('teacher','eligibility','account_recovery')),
status text not null default 'pending' check(status in ('pending','approved','rejected')),
reviewed_by uuid references app.profiles(id), reviewed_at timestamptz, reason text,
check(reviewed_by is null or reviewed_by<>profile_id),
created_at timestamptz not null default now()
);
alter table app.verification_requests enable row level security;

create table app.events (
id uuid primary key default gen_random_uuid(),
organizer_id uuid not null references app.organizers(id),
slug text not null unique, name text not null,
track text not null check(track in ('e-fest','esports')),
state text not null default 'draft' check(state in ('draft','published','closed','cancelled','archived')),
registration_enabled boolean not null default false,
published_version_id uuid,
registration_opens_at timestamptz, registration_closes_at timestamptz,
capacity integer check(capacity>0), capacity_unit text not null default 'entry' check(capacity_unit in ('entry','stall')),
pool_team_count integer check(pool_team_count>0), row_version integer not null default 1,
unique(id,organizer_id),
check(registration_closes_at is null or registration_opens_at is null or registration_closes_at>registration_opens_at),
check(not registration_enabled or (state='published' and published_version_id is not null)),
created_at timestamptz not null default now()
);
alter table app.events enable row level security;

create table app.event_versions (
id uuid primary key default gen_random_uuid(),
event_id uuid not null references app.events(id), version integer not null check(version>0),
public_description text not null, rules_text text not null, eligibility_text text,
team_min integer check(team_min>0), team_max integer check(team_max>0),
individual_policy text check(individual_policy in ('disabled','allocate_before_payment')),
prize_pool_paise bigint check(prize_pool_paise>=0),
currency text not null default 'INR' check(currency='INR'),
configuration jsonb not null default '{}'::jsonb,
approval_state text not null default 'draft' check(approval_state in ('draft','approved','superseded')),
authored_by uuid references app.profiles(id), approved_by uuid references app.profiles(id), approved_at timestamptz,
unique(event_id,version), unique(id,event_id),
check(team_min is null or team_max is null or team_max>=team_min),
check(approval_state='draft' or (approved_by is not null and approved_at is not null)),
created_at timestamptz not null default now()
);
alter table app.event_versions enable row level security;

create table app.price_options (
id uuid primary key default gen_random_uuid(),
event_version_id uuid not null, event_id uuid not null,
mode text not null check(mode in ('team','individual','stall','entry')),
amount_paise bigint check(amount_paise>=0),
enabled boolean not null default false,
foreign key(event_version_id,event_id) references app.event_versions(id,event_id),
unique(event_version_id,mode), unique(id,event_version_id,event_id,mode),
check(not enabled or amount_paise is not null),
created_at timestamptz not null default now()
);
alter table app.price_options enable row level security;

create table app.rubrics (
id uuid primary key default gen_random_uuid(),
event_version_id uuid not null, event_id uuid not null,
name text not null, max_marks numeric(10,2) not null check(max_marks>0),
aggregation_policy jsonb, conditional_criteria_policy text,
foreign key(event_version_id,event_id) references app.event_versions(id,event_id),
unique(id,event_id), unique(id,event_version_id,event_id),
created_at timestamptz not null default now()
);
alter table app.rubrics enable row level security;

create table app.rubric_criteria (
id uuid primary key default gen_random_uuid(), rubric_id uuid not null references app.rubrics(id),
label text not null, max_marks numeric(10,2) not null check(max_marks>0),
position integer not null check(position>0), conditional boolean not null default false,
unique(rubric_id,position), unique(id,rubric_id),
created_at timestamptz not null default now()
);
alter table app.rubric_criteria enable row level security;

create table app.awards (
id uuid primary key default gen_random_uuid(), event_version_id uuid not null, event_id uuid not null,
label text not null, amount_paise bigint not null check(amount_paise>=0),
kind text not null check(kind in ('rank','jury','discipline','instagram_poll')),
rank integer check(rank>0), label_confirmed boolean not null default false,
foreign key(event_version_id,event_id) references app.event_versions(id,event_id), unique(id,event_id),
created_at timestamptz not null default now()
);
alter table app.awards enable row level security;

create table app.venues (
id uuid primary key default gen_random_uuid(), institution_id uuid not null references app.institutions(id),
name text not null, directions text, accessibility_notes text, capacity integer check(capacity>0),
created_at timestamptz not null default now()
);
alter table app.venues enable row level security;

create table app.sessions (
id uuid primary key default gen_random_uuid(), event_id uuid not null references app.events(id),
venue_id uuid references app.venues(id), label text not null,
starts_at timestamptz not null, ends_at timestamptz not null, reporting_at timestamptz,
state text not null default 'draft' check(state in ('draft','published','cancelled','completed')),
row_version integer not null default 1,
unique(id,event_id), check(ends_at>starts_at), check(reporting_at is null or reporting_at<=starts_at),
created_at timestamptz not null default now()
);
alter table app.sessions enable row level security;

create table app.staff_assignments (
id uuid primary key default gen_random_uuid(), profile_id uuid not null references app.profiles(id),
institution_id uuid not null references app.institutions(id), organizer_id uuid, event_id uuid,
role text not null check(role in ('teacher','volunteer','judge','event_admin','finance_reviewer','export_operator','super_admin')),
starts_at timestamptz not null, ends_at timestamptz not null,
granted_by uuid not null references app.profiles(id), reason text not null,
revoked_at timestamptz, revoked_by uuid references app.profiles(id),
foreign key(organizer_id,institution_id) references app.organizers(id,institution_id),
foreign key(event_id,organizer_id) references app.events(id,organizer_id),
unique(id,profile_id), check(ends_at>starts_at),
check((role='super_admin' and organizer_id is null and event_id is null) or (role<>'super_admin' and organizer_id is not null)),
check(role not in ('volunteer','judge','teacher') or event_id is not null),
created_at timestamptz not null default now()
);
alter table app.staff_assignments enable row level security;

create table app.files (
id uuid primary key default gen_random_uuid(), owner_id uuid references app.profiles(id),
organizer_id uuid references app.organizers(id), bucket text not null, object_path text not null,
purpose text not null check(purpose in ('payment_evidence','official_qr','poll_evidence','entry_attachment','export','incident')),
mime_type text not null, size_bytes bigint not null check(size_bytes>0 and size_bytes<=5242880),
sha256 text check(sha256 is null or sha256 ~ '^[0-9a-f]{64}$'),
scan_state text not null default 'quarantined' check(scan_state in ('quarantined','validated','rejected','deleted')),
validated_at timestamptz, retention_until timestamptz,
unique(bucket,object_path),
created_at timestamptz not null default now()
);
alter table app.files enable row level security;

create table app.payment_profiles (
id uuid primary key default gen_random_uuid(), institution_id uuid not null references app.institutions(id),
version integer not null check(version>0), beneficiary_name text not null,
upi_id text not null, receiving_account_reference text not null,
qr_file_id uuid not null references app.files(id), qr_sha256 text not null check(qr_sha256 ~ '^[0-9a-f]{64}$'),
state text not null default 'draft' check(state in ('draft','pending_approval','active','retired','suspended')),
proposed_by uuid not null references app.profiles(id), activated_at timestamptz,
unique(institution_id,version), unique(id,institution_id), unique(id,receiving_account_reference),
created_at timestamptz not null default now()
);
alter table app.payment_profiles enable row level security;

create table app.payment_profile_approvals (
id uuid primary key default gen_random_uuid(), payment_profile_id uuid not null references app.payment_profiles(id),
approver_id uuid not null references app.profiles(id), outcome text not null check(outcome in ('approved','rejected')),
verified_destination boolean not null, evidence_reference text not null, reason text not null,
unique(payment_profile_id,approver_id),
created_at timestamptz not null default now()
);
alter table app.payment_profile_approvals enable row level security;

create table app.competition_entries (
id uuid primary key default gen_random_uuid(), event_id uuid not null, event_version_id uuid not null,
captain_id uuid not null references app.profiles(id), display_name text not null,
kind text not null check(kind in ('team','pooled_individuals','stall','project')),
state text not null default 'forming' check(state in ('forming','ready','held','confirmed','cancelled','disqualified','completed')),
description text, project_details jsonb not null default '{}'::jsonb, row_version integer not null default 1,
foreign key(event_version_id,event_id) references app.event_versions(id,event_id),
unique(id,event_id), unique(id,event_version_id,event_id),
created_at timestamptz not null default now()
);
alter table app.competition_entries enable row level security;

create table app.registrations (
id uuid primary key default gen_random_uuid(), reference text not null unique,
owner_id uuid not null references app.profiles(id), event_id uuid not null, event_version_id uuid not null,
price_option_id uuid not null, mode text not null check(mode in ('team','individual','stall','entry')),
entry_id uuid, state text not null default 'draft' check(state in ('draft','awaiting_members','awaiting_allocation','waitlisted','payment_due','payment_review','action_required','confirmed','expired','cancelled','disqualified')),
rules_accepted_at timestamptz, roster_snapshot jsonb, row_version integer not null default 1,
foreign key(price_option_id,event_version_id,event_id,mode) references app.price_options(id,event_version_id,event_id,mode),
foreign key(entry_id,event_version_id,event_id) references app.competition_entries(id,event_version_id,event_id),
unique(id,event_id), unique(id,entry_id,event_id),
check(state<>'confirmed' or (entry_id is not null and rules_accepted_at is not null)),
created_at timestamptz not null default now()
);
alter table app.registrations enable row level security;

create table app.registration_members (
id uuid primary key default gen_random_uuid(), registration_id uuid not null, event_id uuid not null,
profile_id uuid not null references app.profiles(id),
state text not null default 'invited' check(state in ('invited','accepted','declined','removed')),
consented_at timestamptz, rules_version_id uuid,
foreign key(registration_id,event_id) references app.registrations(id,event_id),
foreign key(rules_version_id,event_id) references app.event_versions(id,event_id),
unique(registration_id,profile_id), unique(id,registration_id,event_id,profile_id),
check(state<>'accepted' or (consented_at is not null and rules_version_id is not null)),
created_at timestamptz not null default now()
);
alter table app.registration_members enable row level security;

create table app.team_invitations (
id uuid primary key default gen_random_uuid(), registration_id uuid not null references app.registrations(id),
invited_email text not null, invited_by uuid not null references app.profiles(id),
token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'), expires_at timestamptz not null,
accepted_by uuid references app.profiles(id), accepted_at timestamptz, revoked_at timestamptz,
check((accepted_by is null)=(accepted_at is null)),
created_at timestamptz not null default now()
);
alter table app.team_invitations enable row level security;

create table app.entry_participants (
id uuid primary key default gen_random_uuid(), entry_id uuid not null, registration_id uuid not null,
member_id uuid not null, event_id uuid not null, profile_id uuid not null,
active boolean not null default true,
foreign key(registration_id,entry_id,event_id) references app.registrations(id,entry_id,event_id),
foreign key(member_id,registration_id,event_id,profile_id) references app.registration_members(id,registration_id,event_id,profile_id),
unique(entry_id,profile_id), unique(id,event_id,profile_id), unique(member_id),
created_at timestamptz not null default now()
);
alter table app.entry_participants enable row level security;

create table app.waitlist_entries (
id uuid primary key default gen_random_uuid(), entry_id uuid not null, event_id uuid not null,
position bigint generated always as identity, state text not null default 'waiting' check(state in ('waiting','offered','accepted','expired','withdrawn')),
offered_at timestamptz, offer_expires_at timestamptz,
foreign key(entry_id,event_id) references app.competition_entries(id,event_id), unique(entry_id),
check(offer_expires_at is null or (offered_at is not null and offer_expires_at>offered_at)),
created_at timestamptz not null default now()
);
alter table app.waitlist_entries enable row level security;

create table app.reservations (
id uuid primary key default gen_random_uuid(), entry_id uuid not null, event_id uuid not null,
units integer not null default 1 check(units=1),
state text not null default 'held' check(state in ('held','review_hold','confirmed','released','expired')),
expires_at timestamptz not null, review_deadline_at timestamptz,
foreign key(entry_id,event_id) references app.competition_entries(id,event_id), unique(id,entry_id,event_id),
created_at timestamptz not null default now()
);
alter table app.reservations enable row level security;

create table app.orders (
id uuid primary key default gen_random_uuid(), registration_id uuid not null, event_id uuid not null,
entry_id uuid not null, reservation_id uuid not null,
payment_profile_id uuid not null references app.payment_profiles(id),
reference text not null unique, total_paise bigint not null check(total_paise>0), currency text not null default 'INR' check(currency='INR'),
state text not null default 'unpaid' check(state in ('unpaid','evidence_submitted','under_review','needs_information','verified','rejected','void','part_refunded','refunded')),
price_snapshot jsonb not null, beneficiary_snapshot jsonb not null,
foreign key(registration_id,entry_id,event_id) references app.registrations(id,entry_id,event_id),
foreign key(reservation_id,entry_id,event_id) references app.reservations(id,entry_id,event_id),
unique(id,event_id), unique(id,payment_profile_id),
created_at timestamptz not null default now()
);
alter table app.orders enable row level security;

create table app.payment_evidence (
id uuid primary key default gen_random_uuid(), order_id uuid not null references app.orders(id),
version integer not null check(version>0), submitted_by uuid not null references app.profiles(id),
transaction_reference text not null, claimed_amount_paise bigint not null check(claimed_amount_paise>0),
claimed_paid_at timestamptz, receipt_file_id uuid references app.files(id),
unique(order_id,version), unique(id,order_id),
created_at timestamptz not null default now()
);
alter table app.payment_evidence enable row level security;

create table app.bank_credits (
id uuid primary key default gen_random_uuid(), payment_profile_id uuid not null,
receiving_account_reference text not null, settled_transaction_id text not null,
amount_paise bigint not null check(amount_paise>0), credited_at timestamptz not null,
verified_source_reference text not null, recorded_by uuid not null references app.profiles(id),
foreign key(payment_profile_id,receiving_account_reference) references app.payment_profiles(id,receiving_account_reference),
unique(receiving_account_reference,settled_transaction_id), unique(id,payment_profile_id),
created_at timestamptz not null default now()
);
alter table app.bank_credits enable row level security;

create table app.credit_allocations (
id uuid primary key default gen_random_uuid(), order_id uuid not null unique, credit_id uuid not null unique,
payment_profile_id uuid not null, allocated_by uuid not null references app.profiles(id),
amount_paise bigint not null check(amount_paise>0),
foreign key(order_id,payment_profile_id) references app.orders(id,payment_profile_id),
foreign key(credit_id,payment_profile_id) references app.bank_credits(id,payment_profile_id),
created_at timestamptz not null default now()
);
alter table app.credit_allocations enable row level security;

create table app.payment_reviews (
id uuid primary key default gen_random_uuid(), order_id uuid not null, evidence_id uuid not null,
reviewer_id uuid not null references app.profiles(id),
outcome text not null check(outcome in ('verified','rejected','needs_information','exception')),
reason text not null, credit_id uuid references app.bank_credits(id),
foreign key(evidence_id,order_id) references app.payment_evidence(id,order_id),
check(outcome<>'verified' or credit_id is not null),
created_at timestamptz not null default now()
);
alter table app.payment_reviews enable row level security;

create table app.payment_exceptions (
id uuid primary key default gen_random_uuid(), order_id uuid not null references app.orders(id),
kind text not null check(kind in ('late_credit','underpayment','overpayment','duplicate_reference','wrong_beneficiary','missing_reference','invalid_evidence','other')),
state text not null default 'open' check(state in ('open','in_review','resolved')),
assigned_to uuid references app.profiles(id), reason text not null, resolved_by uuid references app.profiles(id), resolved_at timestamptz,
created_at timestamptz not null default now()
);
alter table app.payment_exceptions enable row level security;

create table app.refunds (
id uuid primary key default gen_random_uuid(), order_id uuid not null references app.orders(id),
amount_paise bigint not null check(amount_paise>0), reason text not null,
requested_by uuid not null references app.profiles(id), approved_by uuid references app.profiles(id),
state text not null default 'requested' check(state in ('requested','approved','processing','completed','failed','rejected')),
bank_reference text unique, completed_at timestamptz,
check(approved_by is null or approved_by<>requested_by),
check(state<>'completed' or (bank_reference is not null and completed_at is not null)),
created_at timestamptz not null default now()
);
alter table app.refunds enable row level security;

create table app.passes (
id uuid primary key default gen_random_uuid(), entry_participant_id uuid not null, event_id uuid not null, profile_id uuid not null,
version integer not null check(version>0), token_hash text not null unique check(token_hash ~ '^[0-9a-f]{64}$'),
token_ciphertext text not null, token_key_version integer not null check(token_key_version>0),
support_reference text not null unique, expires_at timestamptz not null,
revoked_at timestamptz, revocation_reason text,
foreign key(entry_participant_id,event_id,profile_id) references app.entry_participants(id,event_id,profile_id),
unique(entry_participant_id,version), unique(id,event_id,profile_id),
created_at timestamptz not null default now()
);
alter table app.passes enable row level security;

create table app.stations (
id uuid primary key default gen_random_uuid(), event_id uuid not null references app.events(id),
venue_id uuid references app.venues(id), name text not null,
kind text not null check(kind in ('entry','checkpoint','helpdesk')),
active boolean not null default true, unique(id,event_id),
created_at timestamptz not null default now()
);
alter table app.stations enable row level security;

create table app.duties (
id uuid primary key default gen_random_uuid(), staff_assignment_id uuid not null, profile_id uuid not null,
event_id uuid not null, session_id uuid not null, station_id uuid not null,
starts_at timestamptz not null, ends_at timestamptz not null, acknowledged_at timestamptz, revoked_at timestamptz,
foreign key(staff_assignment_id,profile_id) references app.staff_assignments(id,profile_id),
foreign key(session_id,event_id) references app.sessions(id,event_id),
foreign key(station_id,event_id) references app.stations(id,event_id),
unique(id,event_id,session_id,station_id,profile_id), check(ends_at>starts_at),
created_at timestamptz not null default now()
);
alter table app.duties enable row level security;

create table app.attendance (
id uuid primary key default gen_random_uuid(), pass_id uuid not null, event_id uuid not null, participant_id uuid not null,
session_id uuid not null, station_id uuid not null, duty_id uuid not null, actor_id uuid not null,
action text not null check(action in ('check_in','check_out')),
recorded_at timestamptz not null default now(), method text not null check(method in ('qr','manual','paper_reconciliation')),
observed_at timestamptz,
reason text, foreign key(pass_id,event_id,participant_id) references app.passes(id,event_id,profile_id),
foreign key(duty_id,event_id,session_id,station_id,actor_id) references app.duties(id,event_id,session_id,station_id,profile_id),
unique(event_id,session_id,participant_id,action),
check(method='qr' or reason is not null),
created_at timestamptz not null default now()
);
alter table app.attendance enable row level security;

create table app.checkpoints (
id uuid primary key default gen_random_uuid(), event_id uuid not null references app.events(id),
station_id uuid not null, sequence integer not null check(sequence>0), label text not null,
private_instructions text, foreign key(station_id,event_id) references app.stations(id,event_id),
unique(event_id,sequence), unique(id,event_id,station_id),
created_at timestamptz not null default now()
);
alter table app.checkpoints enable row level security;

create table app.checkpoint_completions (
id uuid primary key default gen_random_uuid(), entry_id uuid not null, event_id uuid not null,
checkpoint_id uuid not null, station_id uuid not null, session_id uuid not null,
duty_id uuid not null, actor_id uuid not null,
completed_at timestamptz not null default now(), penalty_seconds integer not null default 0 check(penalty_seconds>=0),
reason text, foreign key(entry_id,event_id) references app.competition_entries(id,event_id),
foreign key(checkpoint_id,event_id,station_id) references app.checkpoints(id,event_id,station_id),
foreign key(duty_id,event_id,session_id,station_id,actor_id) references app.duties(id,event_id,session_id,station_id,profile_id),
unique(entry_id,checkpoint_id),
created_at timestamptz not null default now()
);
alter table app.checkpoint_completions enable row level security;

create table app.judge_assignments (
id uuid primary key default gen_random_uuid(), staff_assignment_id uuid not null, judge_id uuid not null,
entry_id uuid not null, event_id uuid not null, rubric_id uuid not null,
conflict_declared boolean not null default false, revoked_at timestamptz,
foreign key(staff_assignment_id,judge_id) references app.staff_assignments(id,profile_id),
foreign key(entry_id,event_id) references app.competition_entries(id,event_id),
foreign key(rubric_id,event_id) references app.rubrics(id,event_id),
unique(judge_id,entry_id,rubric_id), unique(id,rubric_id),
created_at timestamptz not null default now()
);
alter table app.judge_assignments enable row level security;

create table app.scorecards (
id uuid primary key default gen_random_uuid(), judge_assignment_id uuid not null, rubric_id uuid not null,
revision integer not null default 1 check(revision>0),
state text not null default 'draft' check(state in ('draft','locked','superseded')),
locked_at timestamptz, reopened_reason text, reopened_by uuid references app.profiles(id),
foreign key(judge_assignment_id,rubric_id) references app.judge_assignments(id,rubric_id),
unique(judge_assignment_id,revision), unique(id,rubric_id), check(state<>'locked' or locked_at is not null),
created_at timestamptz not null default now()
);
alter table app.scorecards enable row level security;

create table app.scores (
id uuid primary key default gen_random_uuid(), scorecard_id uuid not null, rubric_id uuid not null, criterion_id uuid not null,
marks numeric(10,2) not null check(marks>=0), note text,
foreign key(scorecard_id,rubric_id) references app.scorecards(id,rubric_id),
foreign key(criterion_id,rubric_id) references app.rubric_criteria(id,rubric_id), unique(scorecard_id,criterion_id),
created_at timestamptz not null default now()
);
alter table app.scores enable row level security;

create table app.result_revisions (
id uuid primary key default gen_random_uuid(), event_id uuid not null references app.events(id),
revision integer not null check(revision>0),
state text not null default 'draft' check(state in ('draft','proposed','published','superseded')),
calculation_version text not null, proposed_by uuid not null references app.profiles(id),
approved_by uuid references app.profiles(id), published_at timestamptz, reason text,
unique(event_id,revision), unique(id,event_id),
check(approved_by is null or approved_by<>proposed_by),
check(state<>'published' or (approved_by is not null and published_at is not null)),
created_at timestamptz not null default now()
);
alter table app.result_revisions enable row level security;

create table app.result_rows (
id uuid primary key default gen_random_uuid(), result_revision_id uuid not null, event_id uuid not null, entry_id uuid not null,
total_marks numeric(12,2), rank integer check(rank>0), tie_reason text, source_scorecard_ids jsonb not null default '[]'::jsonb,
foreign key(result_revision_id,event_id) references app.result_revisions(id,event_id),
foreign key(entry_id,event_id) references app.competition_entries(id,event_id),
unique(result_revision_id,entry_id), unique(id,event_id),
created_at timestamptz not null default now()
);
alter table app.result_rows enable row level security;

create table app.award_allocations (
id uuid primary key default gen_random_uuid(), award_id uuid not null, result_row_id uuid not null, event_id uuid not null,
approved_by uuid not null references app.profiles(id), disbursed_at timestamptz, disbursement_reference text,
foreign key(award_id,event_id) references app.awards(id,event_id),
foreign key(result_row_id,event_id) references app.result_rows(id,event_id), unique(award_id),
check(disbursed_at is null or disbursement_reference is not null),
created_at timestamptz not null default now()
);
alter table app.award_allocations enable row level security;

create table app.poll_evidence (
id uuid primary key default gen_random_uuid(), event_id uuid not null references app.events(id), award_id uuid not null,
official_url text not null, opens_at timestamptz not null, closes_at timestamptz not null,
evidence_file_id uuid not null references app.files(id), winner_entry_id uuid not null,
recorded_by uuid not null references app.profiles(id), verified_by uuid references app.profiles(id),
foreign key(award_id,event_id) references app.awards(id,event_id),
foreign key(winner_entry_id,event_id) references app.competition_entries(id,event_id),
check(closes_at>opens_at), check(verified_by is null or verified_by<>recorded_by),
created_at timestamptz not null default now()
);
alter table app.poll_evidence enable row level security;

create table app.esports_matches (
id uuid primary key default gen_random_uuid(), event_id uuid not null references app.events(id), session_id uuid,
round_label text not null, match_number integer not null check(match_number>0),
state text not null default 'draft' check(state in ('draft','scheduled','running','completed','cancelled')),
private_room_details jsonb, rules_version_id uuid not null,
foreign key(session_id,event_id) references app.sessions(id,event_id),
foreign key(rules_version_id,event_id) references app.event_versions(id,event_id),
unique(event_id,round_label,match_number), unique(id,event_id),
created_at timestamptz not null default now()
);
alter table app.esports_matches enable row level security;

create table app.esports_match_entries (
id uuid primary key default gen_random_uuid(), match_id uuid not null, event_id uuid not null, entry_id uuid not null,
slot integer check(slot>0), placement integer check(placement>0), kills integer check(kills>=0),
points numeric(12,2), recorded_by uuid references app.profiles(id), reviewed_by uuid references app.profiles(id),
foreign key(match_id,event_id) references app.esports_matches(id,event_id),
foreign key(entry_id,event_id) references app.competition_entries(id,event_id),
unique(match_id,entry_id), unique(match_id,slot), check(reviewed_by is null or reviewed_by<>recorded_by),
created_at timestamptz not null default now()
);
alter table app.esports_match_entries enable row level security;

create table app.player_profiles (
id uuid primary key default gen_random_uuid(), profile_id uuid not null references app.profiles(id),
game text not null check(game in ('free-fire','bgmi')), player_uid text not null, display_name text not null,
unique(profile_id,game), unique(game,player_uid),
created_at timestamptz not null default now()
);
alter table app.player_profiles enable row level security;

create table app.broadcasts (
id uuid primary key default gen_random_uuid(), organizer_id uuid references app.organizers(id), event_id uuid,
author_id uuid not null references app.profiles(id), subject text not null, body text not null,
audience_filter jsonb not null, state text not null default 'draft' check(state in ('draft','approved','queued','sent','cancelled')),
approved_by uuid references app.profiles(id), scheduled_at timestamptz,
foreign key(event_id,organizer_id) references app.events(id,organizer_id), check(event_id is null or organizer_id is not null),
created_at timestamptz not null default now()
);
alter table app.broadcasts enable row level security;

create table app.notifications (
id uuid primary key default gen_random_uuid(), recipient_id uuid not null references app.profiles(id),
event_id uuid references app.events(id), kind text not null, subject text not null, body text not null,
safe_internal_path text, dedupe_key text not null unique, read_at timestamptz,
created_at timestamptz not null default now()
);
alter table app.notifications enable row level security;

create table app.outbox (
id uuid primary key default gen_random_uuid(), topic text not null, aggregate_type text not null, aggregate_id uuid not null,
recipient_id uuid references app.profiles(id), template_version text not null, payload jsonb not null,
dedupe_key text not null unique, state text not null default 'pending' check(state in ('pending','leased','completed','failed','cancelled')),
available_at timestamptz not null default now(), leased_until timestamptz, lease_owner text,
attempts integer not null default 0 check(attempts>=0), last_error_code text,
check(state<>'leased' or (leased_until is not null and lease_owner is not null)),
created_at timestamptz not null default now()
);
alter table app.outbox enable row level security;

create table app.notification_deliveries (
id uuid primary key default gen_random_uuid(), outbox_id uuid not null references app.outbox(id),
channel text not null check(channel in ('email','in_app','sms','whatsapp')),
provider_message_id text, state text not null default 'queued' check(state in ('queued','accepted','delivered','bounced','failed')),
attempt integer not null check(attempt>0), last_error_code text,
unique(outbox_id,channel,attempt),
created_at timestamptz not null default now()
);
alter table app.notification_deliveries enable row level security;

create table app.webhook_receipts (
id uuid primary key default gen_random_uuid(), provider text not null, provider_event_id text not null,
signature_verified boolean not null check(signature_verified), payload_hash text not null,
processed_at timestamptz, unique(provider,provider_event_id),
created_at timestamptz not null default now()
);
alter table app.webhook_receipts enable row level security;

create table app.idempotency_records (
id uuid primary key default gen_random_uuid(), actor_id uuid not null references app.profiles(id),
command text not null, client_key text not null, request_hash text not null,
state text not null check(state in ('in_progress','completed')),
safe_response jsonb, expires_at timestamptz not null, unique(actor_id,command,client_key),
created_at timestamptz not null default now()
);
alter table app.idempotency_records enable row level security;

create table app.audit_log (
id uuid primary key default gen_random_uuid(), institution_id uuid not null references app.institutions(id),
organizer_id uuid, event_id uuid, actor_id uuid references app.profiles(id), effective_role text,
action text not null, entity_type text not null, entity_id uuid,
reason text, safe_before jsonb, safe_after jsonb, correlation_id uuid not null,
foreign key(organizer_id,institution_id) references app.organizers(id,institution_id),
foreign key(event_id,organizer_id) references app.events(id,organizer_id),
check(event_id is null or organizer_id is not null),
created_at timestamptz not null default now()
);
alter table app.audit_log enable row level security;

create table app.incidents (
id uuid primary key default gen_random_uuid(), organizer_id uuid not null, event_id uuid,
reported_by uuid not null references app.profiles(id), assigned_to uuid references app.profiles(id),
severity text not null check(severity in ('low','medium','high','critical')),
state text not null default 'open' check(state in ('open','investigating','resolved','closed')),
description text not null, resolution text, resolved_at timestamptz,
foreign key(event_id,organizer_id) references app.events(id,organizer_id),
foreign key(organizer_id) references app.organizers(id),
created_at timestamptz not null default now()
);
alter table app.incidents enable row level security;

create table app.export_jobs (
id uuid primary key default gen_random_uuid(), requested_by uuid not null references app.profiles(id),
organizer_id uuid not null references app.organizers(id), event_id uuid,
purpose text not null, state text not null default 'queued' check(state in ('queued','running','completed','failed','expired')),
file_id uuid references app.files(id), expires_at timestamptz,
foreign key(event_id,organizer_id) references app.events(id,organizer_id),
created_at timestamptz not null default now()
);
alter table app.export_jobs enable row level security;

create table app.decision_records (
id uuid primary key default gen_random_uuid(), institution_id uuid not null references app.institutions(id),
decision_key text not null, version integer not null check(version>0), value jsonb not null,
approved_by uuid not null references app.profiles(id), approved_at timestamptz not null, evidence_reference text not null,
unique(institution_id,decision_key,version),
created_at timestamptz not null default now()
);
alter table app.decision_records enable row level security;


-- Event publication must reference that event's own immutable rules version.
alter table app.events add constraint events_own_published_version
 foreign key(published_version_id,id) references app.event_versions(id,event_id);

create unique index one_accepted_event_membership on app.registration_members(event_id,profile_id) where state='accepted';
create unique index one_active_event_participant on app.entry_participants(event_id,profile_id) where active;
create unique index one_live_reservation on app.reservations(entry_id) where state in ('held','review_hold','confirmed');
create unique index one_live_order on app.orders(registration_id) where state<>'void';
create unique index one_live_pass on app.passes(entry_participant_id) where revoked_at is null;
create unique index one_current_scorecard on app.scorecards(judge_assignment_id) where state in ('draft','locked');
create unique index one_published_result on app.result_revisions(event_id) where state='published';
create unique index one_active_payment_profile on app.payment_profiles(institution_id) where state='active';
create index active_staff_lookup on app.staff_assignments(profile_id,role,organizer_id,event_id,ends_at) where revoked_at is null;
create index registration_owner_lookup on app.registrations(owner_id,event_id,state);
create index review_queue on app.orders(state,created_at);
create index notification_inbox on app.notifications(recipient_id,created_at desc);
create index outbox_due on app.outbox(available_at,created_at) where state in ('pending','leased');
create index audit_scope_time on app.audit_log(organizer_id,event_id,created_at desc);
create index active_duty_lookup on app.duties(profile_id,event_id,starts_at,ends_at) where revoked_at is null;

-- Financial evidence and security history are append-only to application commands.
create function app.reject_mutation() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Append-only record: create a new revision or adjustment' using errcode='55000'; end;
$$;
revoke all on function app.reject_mutation() from public,anon,authenticated,service_role;
create trigger audit_append_only before update or delete on app.audit_log for each row execute function app.reject_mutation();
create trigger evidence_append_only before update or delete on app.payment_evidence for each row execute function app.reject_mutation();
create trigger review_append_only before update or delete on app.payment_reviews for each row execute function app.reject_mutation();
create trigger credit_append_only before update or delete on app.bank_credits for each row execute function app.reject_mutation();
create trigger allocation_append_only before update or delete on app.credit_allocations for each row execute function app.reject_mutation();

-- Refuse direct marks beyond their criterion; commands must also check ownership/lock.
create function app.check_score_bound() returns trigger language plpgsql set search_path='' as $$
declare maximum numeric; card_state text;
begin
 if TG_OP='UPDATE' and (old.scorecard_id<>new.scorecard_id or old.criterion_id<>new.criterion_id or old.rubric_id<>new.rubric_id) then
   raise exception 'Score identity is immutable' using errcode='55000';
 end if;
 select s.state into card_state from app.scorecards s where s.id=new.scorecard_id for update;
 select c.max_marks into maximum from app.rubric_criteria c where c.id=new.criterion_id and c.rubric_id=new.rubric_id;
 if maximum is null or new.marks>maximum then raise exception 'Score exceeds criterion maximum' using errcode='23514'; end if;
 if card_state is distinct from 'draft' then
   raise exception 'Scorecard is not editable' using errcode='55000';
 end if;
 return new;
end; $$;
revoke all on function app.check_score_bound() from public,anon,authenticated,service_role;
create trigger score_bounds before insert or update on app.scores for each row execute function app.check_score_bound();
create function app.guard_score_delete() returns trigger language plpgsql set search_path='' as $$
declare card_state text;
begin
 select s.state into card_state from app.scorecards s where s.id=old.scorecard_id for update;
 if card_state is distinct from 'draft' then raise exception 'Scorecard is not editable' using errcode='55000'; end if;
 return old;
end; $$;
revoke all on function app.guard_score_delete() from public,anon,authenticated,service_role;
create trigger score_delete_guard before delete on app.scores for each row execute function app.guard_score_delete();

-- No RPC or policy is silently open by default. Implement reviewed commands next.
revoke all on schema app from public,anon,authenticated,service_role;
revoke all on all tables in schema app from public,anon,authenticated,service_role;
revoke all on all sequences in schema app from public,anon,authenticated,service_role;
revoke all on all functions in schema app from public,anon,authenticated,service_role;
alter default privileges in schema app revoke all on tables from public,anon,authenticated,service_role;
alter default privileges in schema app revoke all on sequences from public,anon,authenticated,service_role;
alter default privileges in schema app revoke execute on functions from public,anon,authenticated,service_role;

commit;
