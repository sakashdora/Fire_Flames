-- FIRE & FLAMES forward migration 002: Esports & LAN Operations Extensions
-- Implements BGMI roster snapshots, team declarations, restricted identity verification,
-- station hardware sign-offs, referee pause/technical incident logs, substitute activations,
-- versioned scoring with 16-tier placement chart, and server-side calculation.
-- Does NOT modify 001_schema_design.sql baseline.

begin;

-- 1. Esports Event Rules Version Config Extension
create table app.esports_rules_versions (
  id uuid primary key default gen_random_uuid(),
  event_version_id uuid not null,
  event_id uuid not null,
  game text not null check(game in ('bgmi', 'free-fire')),
  tournament_name text not null default 'KALINGA BGMI CLASH SEASON 1',
  source_alias text default 'KALINGA CLASH 2K26',
  dates jsonb not null default '["2026-11-13","2026-11-14"]'::jsonb,
  team_capacity integer not null default 24 check(team_capacity > 0),
  starters_count integer not null default 4 check(starters_count = 4),
  substitute_slots integer not null default 1 check(substitute_slots = 1),
  substitute_required boolean default null, -- explicitly unresolved
  igl_required integer not null default 1 check(igl_required = 1),
  leader_phone_only boolean not null default true,
  query_phone text default '8260555312',
  prize_pool_paise bigint check(prize_pool_paise is null or prize_pool_paise >= 0),
  prize_distribution jsonb default null, -- explicitly unresolved
  entry_fee_status text not null default 'pending' check(entry_fee_status in ('pending', 'approved', 'active')),
  device_policy_status text not null default 'pending' check(device_policy_status in ('pending', 'approved', 'active')),
  scoring_rules_status text not null default 'pending_complete_rules' check(scoring_rules_status in ('pending_complete_rules', 'approved', 'active')),
  approved_id_types jsonb not null default '["aadhaar","pan","voter_id"]'::jsonb,
  declaration_text_ref text not null default 'draft_v1',
  scoring_reference text not null default 'BGIS 2026 partial placement chart',
  created_at timestamptz not null default now(),
  foreign key(event_version_id, event_id) references app.event_versions(id, event_id),
  unique(event_version_id),
  unique(id, event_id)
);
alter table app.esports_rules_versions enable row level security;

-- 2. Esports Rosters
create table app.esports_rosters (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null,
  event_id uuid not null,
  registration_id uuid not null,
  revision integer not null default 1 check(revision > 0),
  state text not null default 'draft' check(state in ('draft', 'submitted', 'locked', 'archived')),
  locked_at timestamptz,
  locked_by uuid references app.profiles(id),
  created_at timestamptz not null default now(),
  foreign key(entry_id, event_id) references app.competition_entries(id, event_id),
  foreign key(registration_id) references app.registrations(id),
  unique(entry_id, revision),
  unique(id, event_id),
  unique(id, entry_id)
);
alter table app.esports_rosters enable row level security;

-- 3. Esports Roster Members (4 starters + 1 substitute, unique UIDs, 1 IGL among starters)
create table app.esports_roster_members (
  id uuid primary key default gen_random_uuid(),
  roster_id uuid not null,
  entry_id uuid not null,
  event_id uuid not null,
  profile_id uuid not null references app.profiles(id),
  slot_type text not null check(slot_type in ('starter', 'substitute')),
  slot_index integer not null check(slot_index between 1 and 5),
  ign text not null check(length(trim(ign)) > 0),
  player_uid text not null check(length(trim(player_uid)) > 0),
  is_igl boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  foreign key(roster_id, entry_id) references app.esports_rosters(id, entry_id),
  foreign key(entry_id, event_id) references app.competition_entries(id, event_id),
  check((slot_type = 'starter' and slot_index between 1 and 4) or (slot_type = 'substitute' and slot_index = 5)),
  check(not is_igl or slot_type = 'starter')
);
alter table app.esports_roster_members enable row level security;

create unique index one_active_slot_per_entry on app.esports_roster_members(roster_id, slot_index) where active;
create unique index one_uid_per_event on app.esports_roster_members(event_id, player_uid) where active;
create unique index one_profile_per_event_roster on app.esports_roster_members(event_id, profile_id) where active;

-- 4. Restricted Identity Verification (Data-minimizing: in-person or private file, reviewer != participant)
create table app.identity_verifications (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references app.events(id),
  profile_id uuid not null references app.profiles(id),
  proof_type text not null check(proof_type in ('aadhaar', 'pan', 'voter_id', 'college_id')),
  method text not null check(method in ('in_person', 'upload')),
  status text not null default 'pending' check(status in ('pending', 'verified', 'rejected')),
  reviewer_id uuid references app.profiles(id),
  verified_at timestamptz,
  file_id uuid references app.files(id),
  rejection_reason text,
  expires_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  check(reviewer_id is null or reviewer_id <> profile_id),
  check((status = 'pending' and verified_at is null and reviewer_id is null) or (status in ('verified', 'rejected') and reviewer_id is not null and verified_at is not null)),
  check(method <> 'upload' or file_id is not null),
  unique(event_id, profile_id, proof_type)
);
alter table app.identity_verifications enable row level security;

-- 5. Team Declaration Acceptance (Binds leader to exact published text hash, append-only)
create table app.team_declarations (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references app.registrations(id),
  event_id uuid not null references app.events(id),
  rules_version_id uuid not null,
  leader_id uuid not null references app.profiles(id),
  declaration_text_version text not null,
  declaration_hash text not null,
  ip_address text,
  user_agent text,
  accepted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key(rules_version_id, event_id) references app.event_versions(id, event_id),
  unique(registration_id, rules_version_id)
);
alter table app.team_declarations enable row level security;

-- 6. Station Hardware Inspection Checks (Append-only)
create table app.station_hardware_checks (
  id uuid primary key default gen_random_uuid(),
  station_id uuid not null references app.stations(id),
  event_id uuid not null references app.events(id),
  session_id uuid references app.sessions(id),
  asset_code text not null,
  config_version text not null,
  inspector_id uuid not null references app.profiles(id),
  result text not null check(result in ('passed', 'failed', 'flagged')),
  reason text,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table app.station_hardware_checks enable row level security;

-- 7. Referee Pause & Technical Incident Adjudication Log (Append-only, human adjudication only)
create table app.match_technical_logs (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  event_id uuid not null,
  entry_id uuid references app.competition_entries(id),
  official_id uuid not null references app.profiles(id),
  request_type text not null check(request_type in ('pause', 'disconnect', 'restart', 'integrity', 'penalty', 'disqualification')),
  decision text not null check(decision in ('granted', 'denied', 'penalty', 'disqualification', 'restarted', 'resumed')),
  reason text not null,
  pause_started_at timestamptz,
  pause_ended_at timestamptz,
  duration_seconds integer check(duration_seconds is null or duration_seconds >= 0),
  penalty_points numeric(10,2) check(penalty_points is null or penalty_points >= 0),
  evidence_notes text,
  created_at timestamptz not null default now(),
  foreign key(match_id, event_id) references app.esports_matches(id, event_id)
);
alter table app.match_technical_logs enable row level security;

-- 8. In-Match Substitute Activations (Referee-only, locked roster boundary, append-only)
create table app.match_substitute_activations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  event_id uuid not null,
  entry_id uuid not null,
  starter_member_id uuid not null references app.esports_roster_members(id),
  substitute_member_id uuid not null references app.esports_roster_members(id),
  authorized_by uuid not null references app.profiles(id),
  reason text not null,
  activated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  foreign key(match_id, event_id) references app.esports_matches(id, event_id),
  foreign key(entry_id, event_id) references app.competition_entries(id, event_id)
);
alter table app.match_substitute_activations enable row level security;

-- 9. Versioned Scoring Rules (16-tier placement table, gated approval on complete rules)
create table app.esports_scoring_versions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references app.events(id),
  rules_version_id uuid not null,
  version integer not null check(version > 0),
  name text not null default 'BGIS 2026 Points System',
  kill_multiplier numeric(6,2) check(kill_multiplier is null or kill_multiplier >= 0),
  tie_break_policy text,
  lobby_size integer check(lobby_size is null or lobby_size > 0),
  approval_state text not null default 'draft' check(approval_state in ('draft', 'approved', 'superseded')),
  approved_by uuid references app.profiles(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key(rules_version_id, event_id) references app.event_versions(id, event_id),
  unique(event_id, version),
  unique(id, event_id),
  -- E07 Gate: Final scoring approval is prohibited if kill points, tie breaks or approval audit are missing!
  check(not (approval_state = 'approved' and (kill_multiplier is null or tie_break_policy is null or approved_by is null or approved_at is null)))
);
alter table app.esports_scoring_versions enable row level security;

-- 10. Placement Points Table (Placements 1 to 16 from confirmed image)
create table app.esports_placement_points (
  id uuid primary key default gen_random_uuid(),
  scoring_version_id uuid not null references app.esports_scoring_versions(id),
  place integer not null check(place between 1 and 24),
  points numeric(6,2) not null check(points >= 0),
  created_at timestamptz not null default now(),
  unique(scoring_version_id, place)
);
alter table app.esports_placement_points enable row level security;

-- 11. Match Result Revisions (Server calculated, distinct scorer and reviewer)
create table app.esports_match_result_revisions (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  event_id uuid not null,
  scoring_version_id uuid not null,
  revision integer not null default 1 check(revision > 0),
  state text not null default 'draft' check(state in ('draft', 'reviewed', 'published', 'superseded')),
  recorded_by uuid not null references app.profiles(id),
  reviewed_by uuid references app.profiles(id),
  reviewed_at timestamptz,
  results_payload jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  foreign key(match_id, event_id) references app.esports_matches(id, event_id),
  foreign key(scoring_version_id, event_id) references app.esports_scoring_versions(id, event_id),
  check(reviewed_by is null or reviewed_by <> recorded_by),
  check(not (state in ('reviewed', 'published') and (reviewed_by is null or reviewed_at is null))),
  unique(match_id, revision)
);
alter table app.esports_match_result_revisions enable row level security;

-- Append-only triggers for audit and integrity
create trigger declarations_append_only before update or delete on app.team_declarations for each row execute function app.reject_mutation();
create trigger station_checks_append_only before update or delete on app.station_hardware_checks for each row execute function app.reject_mutation();
create trigger technical_logs_append_only before update or delete on app.match_technical_logs for each row execute function app.reject_mutation();
create trigger sub_activations_append_only before update or delete on app.match_substitute_activations for each row execute function app.reject_mutation();

-- Revoke direct permissions on new tables from non-superuser roles
revoke all on all tables in schema app from public,anon,authenticated,service_role;

-- -------------------------------------------------------------
-- COMMAND FUNCTIONS (SECURITY DEFINER with strict authorization)
-- -------------------------------------------------------------

-- Audit logging helper that populates institution_id and organizer_id from event_id
create or replace function app.log_event_audit(
  p_event_id uuid,
  p_actor_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid
) returns void language plpgsql security definer set search_path='' as $$
declare
  v_inst uuid;
  v_org uuid;
begin
  select o.institution_id, e.organizer_id into v_inst, v_org
  from app.events e
  join app.organizers o on o.id = e.organizer_id
  where e.id = p_event_id;

  insert into app.audit_log(institution_id, organizer_id, event_id, actor_id, action, entity_type, entity_id, correlation_id)
  values (v_inst, v_org, p_event_id, p_actor_id, p_action, p_entity_type, p_entity_id, gen_random_uuid());
end;
$$;

-- Roster Submission RPC: Enforces exactly 4 starters, 1 IGL, valid UIDs, unique per-event UID
create or replace function app.rpc_esports_submit_roster(
  p_entry_id uuid,
  p_registration_id uuid,
  p_starters jsonb,
  p_substitute jsonb,
  p_idempotency_key text,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_event_id uuid;
  v_captain_id uuid;
  v_roster_id uuid;
  v_rev integer := 1;
  v_starter record;
  v_sub record;
  v_igl_count integer := 0;
  v_starter_count integer := 0;
begin
  -- Lock competition entry
  select e.event_id, e.captain_id into v_event_id, v_captain_id
  from app.competition_entries e
  where e.id = p_entry_id for update;

  if v_event_id is null then
    raise exception 'Competition entry not found' using errcode = '23503';
  end if;

  if p_actor_id <> v_captain_id then
    raise exception 'Only the team captain may submit the roster' using errcode = '42501';
  end if;

  -- Validate starter count = 4
  select count(*) into v_starter_count from jsonb_to_recordset(p_starters) as x(profile_id uuid, ign text, player_uid text, is_igl boolean);
  if v_starter_count <> 4 then
    raise exception 'Roster submission requires exactly 4 starters' using errcode = '23514';
  end if;

  -- Check IGL count = 1
  for v_starter in select * from jsonb_to_recordset(p_starters) as x(profile_id uuid, ign text, player_uid text, is_igl boolean) loop
    if v_starter.is_igl then
      v_igl_count := v_igl_count + 1;
    end if;
    if trim(v_starter.ign) = '' or trim(v_starter.player_uid) = '' then
      raise exception 'IGN and player UID cannot be blank' using errcode = '23514';
    end if;
  end loop;

  if v_igl_count <> 1 then
    raise exception 'Exactly one starter must be designated as IGL' using errcode = '23514';
  end if;

  -- Create or retrieve existing active draft roster
  select id, revision into v_roster_id, v_rev
  from app.esports_rosters
  where entry_id = p_entry_id and state in ('draft', 'submitted')
  order by revision desc limit 1 for update;

  if v_roster_id is null then
    insert into app.esports_rosters(entry_id, event_id, registration_id, revision, state)
    values (p_entry_id, v_event_id, p_registration_id, 1, 'submitted')
    returning id into v_roster_id;
  else
    -- deactivate existing members for this roster draft update
    update app.esports_roster_members set active = false where roster_id = v_roster_id;
  end if;

  -- Insert starters (slot_index 1..4)
  declare
    v_idx integer := 1;
  begin
    for v_starter in select * from jsonb_to_recordset(p_starters) as x(profile_id uuid, ign text, player_uid text, is_igl boolean) loop
      insert into app.esports_roster_members(roster_id, entry_id, event_id, profile_id, slot_type, slot_index, ign, player_uid, is_igl, active)
      values (v_roster_id, p_entry_id, v_event_id, v_starter.profile_id, 'starter', v_idx, v_starter.ign, v_starter.player_uid, coalesce(v_starter.is_igl, false), true);
      v_idx := v_idx + 1;
    end loop;
  end;

  -- Insert substitute if provided (slot_index 5)
  if p_substitute is not null and p_substitute ? 'profile_id' and p_substitute->>'profile_id' is not null then
    select * into v_sub from jsonb_to_record(p_substitute) as x(profile_id uuid, ign text, player_uid text);
    if trim(v_sub.ign) = '' or trim(v_sub.player_uid) = '' then
      raise exception 'Substitute IGN and player UID cannot be blank' using errcode = '23514';
    end if;
    insert into app.esports_roster_members(roster_id, entry_id, event_id, profile_id, slot_type, slot_index, ign, player_uid, is_igl, active)
    values (v_roster_id, p_entry_id, v_event_id, v_sub.profile_id, 'substitute', 5, v_sub.ign, v_sub.player_uid, false, true);
  end if;

  -- Audit log via helper
  perform app.log_event_audit(v_event_id, p_actor_id, 'SUBMIT_ESPORTS_ROSTER', 'esports_rosters', v_roster_id);

  return jsonb_build_object('roster_id', v_roster_id, 'status', 'submitted', 'starters', v_starter_count);
end;
$$;

-- Team Declaration Acceptance RPC
create or replace function app.rpc_esports_accept_team_declaration(
  p_registration_id uuid,
  p_rules_version_id uuid,
  p_declaration_hash text,
  p_declaration_version text,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_event_id uuid;
  v_owner_id uuid;
  v_decl_id uuid;
begin
  select event_id, owner_id into v_event_id, v_owner_id
  from app.registrations
  where id = p_registration_id for update;

  if v_event_id is null then
    raise exception 'Registration not found' using errcode = '23503';
  end if;

  if p_actor_id <> v_owner_id then
    raise exception 'Only the registration owner may accept team declaration' using errcode = '42501';
  end if;

  insert into app.team_declarations(registration_id, event_id, rules_version_id, leader_id, declaration_text_version, declaration_hash)
  values (p_registration_id, v_event_id, p_rules_version_id, p_actor_id, p_declaration_version, p_declaration_hash)
  returning id into v_decl_id;

  perform app.log_event_audit(v_event_id, p_actor_id, 'ACCEPT_TEAM_DECLARATION', 'team_declarations', v_decl_id);

  return jsonb_build_object('declaration_id', v_decl_id, 'status', 'accepted', 'accepted_at', now());
end;
$$;

-- Restricted Identity Verification RPC (No plaintext national ID, reviewer != participant)
create or replace function app.rpc_esports_verify_identity(
  p_event_id uuid,
  p_profile_id uuid,
  p_proof_type text,
  p_method text,
  p_status text,
  p_file_id uuid,
  p_rejection_reason text,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_id uuid;
begin
  if p_actor_id = p_profile_id then
    raise exception 'Reviewer cannot verify own identity' using errcode = '23514';
  end if;

  insert into app.identity_verifications(
    event_id, profile_id, proof_type, method, status, reviewer_id, verified_at, file_id, rejection_reason
  ) values (
    p_event_id, p_profile_id, p_proof_type, p_method, p_status, p_actor_id, now(), p_file_id, p_rejection_reason
  )
  on conflict (event_id, profile_id, proof_type) do update set
    status = excluded.status,
    reviewer_id = excluded.reviewer_id,
    verified_at = excluded.verified_at,
    file_id = excluded.file_id,
    rejection_reason = excluded.rejection_reason
  returning id into v_id;

  perform app.log_event_audit(p_event_id, p_actor_id, 'VERIFY_IDENTITY', 'identity_verifications', v_id);

  return jsonb_build_object('verification_id', v_id, 'status', p_status, 'verified_at', now());
end;
$$;

-- Hardware Sign-Off RPC
create or replace function app.rpc_esports_signoff_hardware(
  p_station_id uuid,
  p_event_id uuid,
  p_session_id uuid,
  p_asset_code text,
  p_config_version text,
  p_result text,
  p_reason text,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_check_id uuid;
  v_station_event uuid;
begin
  select event_id into v_station_event from app.stations where id = p_station_id;
  if v_station_event is null or v_station_event <> p_event_id then
    raise exception 'Station does not belong to specified event' using errcode = '23503';
  end if;

  insert into app.station_hardware_checks(
    station_id, event_id, session_id, asset_code, config_version, inspector_id, result, reason
  ) values (
    p_station_id, p_event_id, p_session_id, p_asset_code, p_config_version, p_actor_id, p_result, p_reason
  ) returning id into v_check_id;

  perform app.log_event_audit(p_event_id, p_actor_id, 'SIGNOFF_HARDWARE', 'station_hardware_checks', v_check_id);

  return jsonb_build_object('check_id', v_check_id, 'result', p_result, 'checked_at', now());
end;
$$;

-- Pause & Technical Incident Adjudication RPC (Human referee adjudication)
create or replace function app.rpc_esports_log_pause_incident(
  p_match_id uuid,
  p_event_id uuid,
  p_entry_id uuid,
  p_request_type text,
  p_decision text,
  p_reason text,
  p_duration_seconds integer,
  p_penalty_points numeric,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_log_id uuid;
  v_match_event uuid;
begin
  select event_id into v_match_event from app.esports_matches where id = p_match_id;
  if v_match_event is null or v_match_event <> p_event_id then
    raise exception 'Match does not belong to specified event' using errcode = '23503';
  end if;

  insert into app.match_technical_logs(
    match_id, event_id, entry_id, official_id, request_type, decision, reason, duration_seconds, penalty_points
  ) values (
    p_match_id, p_event_id, p_entry_id, p_actor_id, p_request_type, p_decision, p_reason, p_duration_seconds, p_penalty_points
  ) returning id into v_log_id;

  perform app.log_event_audit(p_event_id, p_actor_id, 'LOG_TECHNICAL_INCIDENT', 'match_technical_logs', v_log_id);

  return jsonb_build_object('log_id', v_log_id, 'decision', p_decision, 'recorded_at', now());
end;
$$;

-- In-Match Substitute Activation RPC
create or replace function app.rpc_esports_activate_substitute(
  p_match_id uuid,
  p_event_id uuid,
  p_entry_id uuid,
  p_starter_member_id uuid,
  p_substitute_member_id uuid,
  p_reason text,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_act_id uuid;
  v_starter_type text;
  v_starter_entry uuid;
  v_sub_type text;
  v_sub_entry uuid;
begin
  -- Validate starter
  select slot_type, entry_id into v_starter_type, v_starter_entry
  from app.esports_roster_members where id = p_starter_member_id;

  -- Validate substitute
  select slot_type, entry_id into v_sub_type, v_sub_entry
  from app.esports_roster_members where id = p_substitute_member_id;

  if v_starter_entry <> p_entry_id or v_sub_entry <> p_entry_id then
    raise exception 'Both players must belong to the specified entry roster' using errcode = '23514';
  end if;

  if v_starter_type <> 'starter' or v_sub_type <> 'substitute' then
    raise exception 'Must substitute a starter with a designated substitute slot' using errcode = '23514';
  end if;

  insert into app.match_substitute_activations(
    match_id, event_id, entry_id, starter_member_id, substitute_member_id, authorized_by, reason
  ) values (
    p_match_id, p_event_id, p_entry_id, p_starter_member_id, p_substitute_member_id, p_actor_id, p_reason
  ) returning id into v_act_id;

  perform app.log_event_audit(p_event_id, p_actor_id, 'ACTIVATE_SUBSTITUTE', 'match_substitute_activations', v_act_id);

  return jsonb_build_object('activation_id', v_act_id, 'status', 'activated', 'activated_at', now());
end;
$$;

-- Scoring Version Approval RPC: Rejects incomplete rule sets (E07)
create or replace function app.rpc_esports_approve_scoring(
  p_scoring_version_id uuid,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_kill_mult numeric;
  v_tie_break text;
  v_event_id uuid;
begin
  select kill_multiplier, tie_break_policy, event_id into v_kill_mult, v_tie_break, v_event_id
  from app.esports_scoring_versions
  where id = p_scoring_version_id for update;

  if v_kill_mult is null or v_tie_break is null then
    raise exception 'Cannot approve incomplete scoring version: kill multiplier and tie-break policy are required' using errcode = '23514';
  end if;

  update app.esports_scoring_versions
  set approval_state = 'approved', approved_by = p_actor_id, approved_at = now()
  where id = p_scoring_version_id;

  perform app.log_event_audit(v_event_id, p_actor_id, 'APPROVE_SCORING_VERSION', 'esports_scoring_versions', p_scoring_version_id);

  return jsonb_build_object('scoring_version_id', p_scoring_version_id, 'status', 'approved');
end;
$$;

-- Record Match Result Revision RPC (Server computed placement + kill points, distinct reviewer)
create or replace function app.rpc_esports_record_match_result(
  p_match_id uuid,
  p_scoring_version_id uuid,
  p_results jsonb,
  p_actor_id uuid,
  p_reviewer_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_event_id uuid;
  v_rev_id uuid;
  v_kill_mult numeric;
  v_row record;
  v_pts numeric := 0;
  v_placement_pts numeric := 0;
  v_calculated_results jsonb := '[]'::jsonb;
begin
  select event_id into v_event_id from app.esports_matches where id = p_match_id;
  if v_event_id is null then
    raise exception 'Match not found' using errcode = '23503';
  end if;

  if p_reviewer_id is not null and p_reviewer_id = p_actor_id then
    raise exception 'Scorer and reviewer must be distinct individuals' using errcode = '23514';
  end if;

  select coalesce(kill_multiplier, 0) into v_kill_mult
  from app.esports_scoring_versions where id = p_scoring_version_id;

  -- Iterate through entry rows and compute points server-side
  for v_row in select * from jsonb_to_recordset(p_results) as x(entry_id uuid, placement integer, kills integer) loop
    select coalesce(points, 0) into v_placement_pts
    from app.esports_placement_points
    where scoring_version_id = p_scoring_version_id and place = v_row.placement;

    v_pts := coalesce(v_placement_pts, 0) + (coalesce(v_row.kills, 0) * v_kill_mult);

    v_calculated_results := v_calculated_results || jsonb_build_object(
      'entry_id', v_row.entry_id,
      'placement', v_row.placement,
      'kills', v_row.kills,
      'placement_points', v_placement_pts,
      'total_points', v_pts
    );

    -- Update or insert esports_match_entries
    insert into app.esports_match_entries(match_id, event_id, entry_id, placement, kills, points, recorded_by, reviewed_by)
    values (p_match_id, v_event_id, v_row.entry_id, v_row.placement, v_row.kills, v_pts, p_actor_id, p_reviewer_id)
    on conflict (match_id, entry_id) do update set
      placement = excluded.placement,
      kills = excluded.kills,
      points = excluded.points,
      recorded_by = excluded.recorded_by,
      reviewed_by = excluded.reviewed_by;
  end loop;

  insert into app.esports_match_result_revisions(
    match_id, event_id, scoring_version_id, revision, state, recorded_by, reviewed_by, reviewed_at, results_payload
  ) values (
    p_match_id, v_event_id, p_scoring_version_id, 1,
    case when p_reviewer_id is not null then 'reviewed' else 'draft' end,
    p_actor_id, p_reviewer_id,
    case when p_reviewer_id is not null then now() else null end,
    v_calculated_results
  ) returning id into v_rev_id;

  perform app.log_event_audit(v_event_id, p_actor_id, 'RECORD_MATCH_RESULT', 'esports_match_result_revisions', v_rev_id);

  return jsonb_build_object('revision_id', v_rev_id, 'results', v_calculated_results);
end;
$$;

-- Atomic Capacity Reservation RPC: Enforces 24-team limit for BGMI under concurrent locks (E04)
create or replace function app.rpc_reserve_entry(
  p_entry_id uuid,
  p_expected_version integer,
  p_idempotency_key text,
  p_actor_id uuid
) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_event_id uuid;
  v_capacity integer;
  v_active_count integer;
  v_res_id uuid;
begin
  -- Lock the entry row first
  select event_id into v_event_id from app.competition_entries where id = p_entry_id for update;
  if v_event_id is null then
    raise exception 'Entry not found' using errcode = '23503';
  end if;

  -- Lock event row to serialize capacity calculations
  select capacity into v_capacity from app.events where id = v_event_id for update;

  if v_capacity is not null then
    select count(*) into v_active_count
    from app.reservations
    where event_id = v_event_id and state in ('held', 'review_hold', 'confirmed')
      and (expires_at is null or expires_at > now());

    if v_active_count >= v_capacity then
      raise exception 'Capacity reached: maximum % entries already reserved or confirmed', v_capacity using errcode = '23514';
    end if;
  end if;

  -- Create reservation
  insert into app.reservations(entry_id, event_id, state, expires_at)
  values (p_entry_id, v_event_id, 'held', now() + interval '30 minutes')
  returning id into v_res_id;

  perform app.log_event_audit(v_event_id, p_actor_id, 'RESERVE_ENTRY', 'reservations', v_res_id);

  return jsonb_build_object('reservation_id', v_res_id, 'status', 'held', 'expires_at', now() + interval '30 minutes');
end;
$$;

commit;
