-- FIRE & FLAMES migration 003: authenticated command layer.
-- Binds every command to auth.uid(), checks scoped staff roles (with MFA for staff),
-- and exposes only narrow public.ff_* functions to the API. Tables remain default-deny:
-- no table grants are added, so clients cannot read or write rows directly.
-- Forward-only; does not modify 001/002 objects except the staff role list.

begin;

-- ---------------------------------------------------------------------------
-- 0. Esports referee role (client brief: referee sign-offs, pauses, substitutes)
-- ---------------------------------------------------------------------------
alter table app.staff_assignments drop constraint staff_assignments_role_check;
alter table app.staff_assignments add constraint staff_assignments_role_check
  check (role in ('teacher','volunteer','judge','referee','event_admin','finance_reviewer','export_operator','super_admin'));

-- ---------------------------------------------------------------------------
-- 1. Identity helpers (internal; never granted to clients)
-- ---------------------------------------------------------------------------
create function app.actor_id() returns uuid language plpgsql stable security definer set search_path='' as $$
declare v uuid := auth.uid();
begin
  if v is null then raise exception 'Sign in required' using errcode = '28000'; end if;
  return v;
end; $$;

create function app.actor_email() returns text language sql stable security definer set search_path='' as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create function app.actor_aal() returns text language sql stable security definer set search_path='' as $$
  select coalesce(auth.jwt() ->> 'aal', 'aal1');
$$;

create function app.require_profile() returns uuid language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.actor_id();
begin
  if not exists (select 1 from app.profiles where id = v and status = 'active') then
    raise exception 'Complete your profile before continuing' using errcode = 'FFPRF';
  end if;
  return v;
end; $$;

create function app.has_role(p_roles text[], p_event_id uuid) returns boolean language sql stable security definer set search_path='' as $$
  select exists (
    select 1 from app.staff_assignments s
    left join app.events e on e.id = p_event_id
    where s.profile_id = auth.uid()
      and s.revoked_at is null and now() >= s.starts_at and now() < s.ends_at
      and s.role = any (p_roles)
      and (s.role = 'super_admin'
           or (p_event_id is not null and s.event_id = p_event_id)
           or (s.event_id is null and s.organizer_id = e.organizer_id))
  );
$$;

-- Staff commands: active profile + scoped role + MFA (aal2) session.
create function app.require_staff(p_roles text[], p_event_id uuid) returns uuid language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.require_profile();
begin
  if not app.has_role(p_roles, p_event_id) then
    raise exception 'You do not have a staff assignment for this event' using errcode = '42501';
  end if;
  if app.actor_aal() <> 'aal2' then
    raise exception 'Multi-factor verification is required for staff actions' using errcode = 'FFMFA';
  end if;
  return v;
end; $$;

create function app.event_by_slug(p_slug text, p_lock boolean default false) returns app.events language plpgsql security definer set search_path='' as $$
declare r app.events;
begin
  if p_lock then select * into r from app.events where slug = p_slug for update;
  else select * into r from app.events where slug = p_slug; end if;
  if r.id is null then raise exception 'Event not found' using errcode = 'P0002'; end if;
  return r;
end; $$;

-- Idempotency: same key + same payload returns the stored response; a different payload conflicts.
create function app.idem_begin(p_command text, p_key text, p_payload jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v_hash text := encode(sha256(convert_to(coalesce(p_payload, '{}'::jsonb)::text, 'UTF8')), 'hex');
  r app.idempotency_records;
begin
  if p_key is null or length(p_key) < 8 then return null; end if;
  select * into r from app.idempotency_records
   where actor_id = auth.uid() and command = p_command and client_key = p_key for update;
  if r.id is not null then
    if r.request_hash <> v_hash then
      raise exception 'This request key was already used for a different request' using errcode = 'FF409';
    end if;
    if r.state = 'completed' and r.expires_at > now() then return r.safe_response || jsonb_build_object('replayed', true); end if;
    delete from app.idempotency_records where id = r.id;
  end if;
  insert into app.idempotency_records(actor_id, command, client_key, request_hash, state, expires_at)
  values (auth.uid(), p_command, p_key, v_hash, 'in_progress', now() + interval '1 day');
  return null;
end; $$;

create function app.idem_finish(p_command text, p_key text, p_response jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
begin
  if p_key is not null and length(p_key) >= 8 then
    update app.idempotency_records set state = 'completed', safe_response = p_response
     where actor_id = auth.uid() and command = p_command and client_key = p_key;
  end if;
  return p_response;
end; $$;

create function app.random_token() returns text language sql volatile security definer set search_path='' as $$
  select replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '');
$$;

create function app.sha256_hex(p text) returns text language sql immutable set search_path='' as $$
  select encode(sha256(convert_to(p, 'UTF8')), 'hex');
$$;

-- Bootstrap: run once from the SQL editor (postgres role) after the first organizer signs in.
create function app.bootstrap_super_admin(p_email text, p_reason text) returns uuid language plpgsql security definer set search_path='' as $$
declare v_profile uuid; v_inst uuid; v_id uuid;
begin
  select id into v_profile from app.profiles where lower(contact_email) = lower(p_email) and status = 'active';
  if v_profile is null then raise exception 'Profile not found: sign in and save a profile first' using errcode = 'P0002'; end if;
  if exists (select 1 from app.staff_assignments where role = 'super_admin' and revoked_at is null and now() < ends_at) then
    raise exception 'A super admin already exists; grant further roles from the admin console' using errcode = 'FF409';
  end if;
  select id into v_inst from app.institutions order by created_at limit 1;
  insert into app.staff_assignments(profile_id, institution_id, role, starts_at, ends_at, granted_by, reason)
  values (v_profile, v_inst, 'super_admin', now(), now() + interval '365 days', v_profile, p_reason)
  returning id into v_id;
  insert into app.audit_log(institution_id, actor_id, effective_role, action, entity_type, entity_id, reason, correlation_id)
  values (v_inst, v_profile, 'bootstrap', 'BOOTSTRAP_SUPER_ADMIN', 'staff_assignments', v_id, p_reason, gen_random_uuid());
  return v_id;
end; $$;

-- Institution-level audit (events without event scope).
create function app.log_institution_audit(p_action text, p_entity_type text, p_entity_id uuid, p_reason text) returns void language plpgsql security definer set search_path='' as $$
begin
  insert into app.audit_log(institution_id, actor_id, action, entity_type, entity_id, reason, correlation_id)
  select id, auth.uid(), p_action, p_entity_type, p_entity_id, p_reason, gen_random_uuid()
  from app.institutions order by created_at limit 1;
end; $$;

-- ---------------------------------------------------------------------------
-- 2. Public and participant commands
-- ---------------------------------------------------------------------------
create function public.ff_public_catalogue(p_track text default null) returns jsonb language sql stable security definer set search_path='' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', e.slug, 'name', e.name, 'track', e.track, 'state', e.state,
    'registration_open', e.registration_enabled
        and (e.registration_opens_at is null or e.registration_opens_at <= now())
        and (e.registration_closes_at is null or e.registration_closes_at > now()),
    'capacity', e.capacity, 'capacity_unit', e.capacity_unit,
    'reserved', (select count(*) from app.reservations r where r.event_id = e.id
                  and r.state in ('held','review_hold','confirmed') and r.expires_at > now()
                  or (r.event_id = e.id and r.state = 'confirmed')),
    'team_min', v.team_min, 'team_max', v.team_max,
    'modes', (select coalesce(jsonb_agg(jsonb_build_object('mode', p.mode, 'amount_paise', p.amount_paise, 'enabled', p.enabled) order by p.mode), '[]')
              from app.price_options p where p.event_version_id = v.id and e.state <> 'draft')
  ) order by e.track, e.name), '[]'::jsonb)
  from app.events e
  left join app.event_versions v on v.id = e.published_version_id
  where p_track is null or e.track = p_track;
$$;

create function public.ff_my_workspace() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.actor_id(); v_profile jsonb;
begin
  select to_jsonb(p) - 'college_id_reference' into v_profile from app.profiles p where p.id = v;
  return jsonb_build_object(
    'user_id', v,
    'email', app.actor_email(),
    'aal', app.actor_aal(),
    'profile', v_profile,
    'roles', (select coalesce(jsonb_agg(jsonb_build_object('role', s.role, 'event_slug', e.slug, 'event_name', e.name,
                'organizer_slug', o.slug, 'ends_at', s.ends_at) order by s.role), '[]')
              from app.staff_assignments s left join app.events e on e.id = s.event_id left join app.organizers o on o.id = s.organizer_id
              where s.profile_id = v and s.revoked_at is null and now() >= s.starts_at and now() < s.ends_at),
    'registrations', (select coalesce(jsonb_agg(jsonb_build_object(
                'id', r.id, 'reference', r.reference, 'state', r.state, 'mode', r.mode,
                'event_slug', e.slug, 'event_name', e.name, 'track', e.track,
                'team_name', ce.display_name, 'is_owner', r.owner_id = v
              ) order by r.created_at desc), '[]')
              from app.registrations r
              join app.events e on e.id = r.event_id
              left join app.competition_entries ce on ce.id = r.entry_id
              where r.owner_id = v or exists (select 1 from app.registration_members m where m.registration_id = r.id and m.profile_id = v and m.state = 'accepted')),
    'pending_invitations', (select coalesce(jsonb_agg(jsonb_build_object('id', i.id, 'event_name', e.name, 'team_name', ce.display_name,
                'expires_at', i.expires_at) order by i.created_at desc), '[]')
              from app.team_invitations i join app.registrations r on r.id = i.registration_id
              join app.events e on e.id = r.event_id left join app.competition_entries ce on ce.id = r.entry_id
              where lower(i.invited_email) = app.actor_email() and i.accepted_at is null and i.revoked_at is null and i.expires_at > now())
  );
end; $$;

create function public.ff_save_profile(p_input jsonb, p_expected_version integer default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v uuid := app.actor_id();
  v_email text := app.actor_email();
  cur app.profiles;
  v_name text := nullif(trim(p_input ->> 'display_name'), '');
  v_aff text := coalesce(p_input ->> 'affiliation', 'student');
  v_privacy text := nullif(trim(p_input ->> 'privacy_version'), '');
begin
  if v_name is null or length(v_name) > 120 then raise exception 'Enter your full name' using errcode = '22023'; end if;
  if v_aff not in ('student','teacher','other') then raise exception 'Choose student, teacher or other' using errcode = '22023'; end if;
  if v_email = '' then raise exception 'Your account has no email address' using errcode = '22023'; end if;
  if coalesce(p_input ->> 'phone', '') !~ '^(\+?[0-9]{10,13})?$' then raise exception 'Enter a valid phone number' using errcode = '22023'; end if;
  select * into cur from app.profiles where id = v for update;
  if cur.id is null then
    if v_privacy is null then raise exception 'Accept the privacy notice to continue' using errcode = '22023'; end if;
    insert into app.profiles(id, display_name, contact_email, phone, college_name_other, course, year_of_study, affiliation,
                             publicity_consent, privacy_version, privacy_accepted_at)
    values (v, v_name, v_email, nullif(p_input ->> 'phone', ''), nullif(trim(p_input ->> 'college'), ''),
            nullif(trim(p_input ->> 'course'), ''), nullif(trim(p_input ->> 'year_of_study'), ''), v_aff,
            coalesce((p_input ->> 'publicity_consent')::boolean, false), v_privacy, now())
    returning * into cur;
  else
    if cur.status <> 'active' then raise exception 'This profile cannot be edited' using errcode = '42501'; end if;
    if p_expected_version is distinct from cur.row_version then
      raise exception 'Your profile changed elsewhere; reload and try again' using errcode = 'FF409';
    end if;
    update app.profiles set display_name = v_name, phone = nullif(p_input ->> 'phone', ''),
      college_name_other = nullif(trim(p_input ->> 'college'), ''), course = nullif(trim(p_input ->> 'course'), ''),
      year_of_study = nullif(trim(p_input ->> 'year_of_study'), ''), affiliation = v_aff,
      publicity_consent = coalesce((p_input ->> 'publicity_consent')::boolean, cur.publicity_consent),
      row_version = cur.row_version + 1
    where id = v returning * into cur;
  end if;
  return jsonb_build_object('profile_id', cur.id, 'row_version', cur.row_version);
end; $$;

create function public.ff_start_registration(p_event_slug text, p_team_name text, p_mode text, p_idempotency_key text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v uuid := app.require_profile();
  v_prior jsonb := app.idem_begin('start_registration', p_idempotency_key, jsonb_build_object('e', p_event_slug, 't', p_team_name, 'm', p_mode));
  ev app.events; v_price uuid; v_entry uuid; v_reg uuid; v_member uuid; v_ref text; v_kind text;
  v_name text := nullif(trim(p_team_name), '');
begin
  if v_prior is not null then return v_prior; end if;
  ev := app.event_by_slug(p_event_slug, true);
  if not ev.registration_enabled or ev.published_version_id is null
     or (ev.registration_opens_at is not null and ev.registration_opens_at > now())
     or (ev.registration_closes_at is not null and ev.registration_closes_at <= now()) then
    raise exception 'Registration for this event is not open' using errcode = 'FF409';
  end if;
  if p_mode = 'individual' then raise exception 'Individual entries need an approved allocation policy; register as a team' using errcode = '22023'; end if;
  select id into v_price from app.price_options where event_version_id = ev.published_version_id and mode = p_mode;
  if v_price is null then raise exception 'This entry type is not offered for the event' using errcode = '22023'; end if;
  if v_name is null or length(v_name) > 60 then raise exception 'Enter a team or entry name (up to 60 characters)' using errcode = '22023'; end if;
  if exists (select 1 from app.registration_members where event_id = ev.id and profile_id = v and state = 'accepted') then
    raise exception 'You are already part of an entry for this event' using errcode = 'FF409';
  end if;
  v_kind := case p_mode when 'team' then 'team' when 'stall' then 'stall' else 'project' end;
  insert into app.competition_entries(event_id, event_version_id, captain_id, display_name, kind)
  values (ev.id, ev.published_version_id, v, v_name, v_kind) returning id into v_entry;
  v_ref := 'FF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
  insert into app.registrations(reference, owner_id, event_id, event_version_id, price_option_id, mode, entry_id, state)
  values (v_ref, v, ev.id, ev.published_version_id, v_price, p_mode, v_entry, case when p_mode = 'team' then 'awaiting_members' else 'draft' end)
  returning id into v_reg;
  insert into app.registration_members(registration_id, event_id, profile_id, state, consented_at, rules_version_id)
  values (v_reg, ev.id, v, 'accepted', now(), ev.published_version_id) returning id into v_member;
  insert into app.entry_participants(entry_id, registration_id, member_id, event_id, profile_id)
  values (v_entry, v_reg, v_member, ev.id, v);
  perform app.log_event_audit(ev.id, v, 'START_REGISTRATION', 'registrations', v_reg);
  return app.idem_finish('start_registration', p_idempotency_key,
    jsonb_build_object('registration_id', v_reg, 'reference', v_ref, 'entry_id', v_entry, 'state', case when p_mode = 'team' then 'awaiting_members' else 'draft' end));
end; $$;

create function public.ff_registration_detail(p_registration_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.actor_id(); r app.registrations; ev app.events; ver app.event_versions; v_owner boolean;
begin
  select * into r from app.registrations where id = p_registration_id;
  if r.id is null or not (r.owner_id = v or exists (select 1 from app.registration_members m where m.registration_id = r.id and m.profile_id = v and m.state = 'accepted')) then
    raise exception 'Registration not found' using errcode = 'P0002';
  end if;
  v_owner := r.owner_id = v;
  select * into ev from app.events where id = r.event_id;
  select * into ver from app.event_versions where id = r.event_version_id;
  return jsonb_build_object(
    'id', r.id, 'reference', r.reference, 'state', r.state, 'mode', r.mode, 'is_owner', v_owner,
    'rules_accepted_at', r.rules_accepted_at,
    'event', jsonb_build_object('slug', ev.slug, 'name', ev.name, 'track', ev.track, 'capacity', ev.capacity),
    'team', jsonb_build_object('name', (select display_name from app.competition_entries where id = r.entry_id), 'min', ver.team_min, 'max', ver.team_max),
    'rules', jsonb_build_object('version', 'v' || ver.version, 'text', ver.rules_text, 'hash', app.sha256_hex(ver.rules_text)),
    'price', (select jsonb_build_object('mode', p.mode, 'amount_paise', p.amount_paise, 'enabled', p.enabled) from app.price_options p where p.id = r.price_option_id),
    'is_esports_roster', exists (select 1 from app.esports_rules_versions x where x.event_version_id = r.event_version_id),
    'members', (select coalesce(jsonb_agg(jsonb_build_object('profile_id', m.profile_id, 'display_name', p.display_name, 'is_owner', m.profile_id = r.owner_id) order by m.created_at), '[]')
                from app.registration_members m join app.profiles p on p.id = m.profile_id
                where m.registration_id = r.id and m.state = 'accepted'),
    'invitations', case when v_owner then (select coalesce(jsonb_agg(jsonb_build_object('id', i.id, 'email', i.invited_email, 'expires_at', i.expires_at,
                'status', case when i.accepted_at is not null then 'accepted' when i.revoked_at is not null then 'revoked' when i.expires_at <= now() then 'expired' else 'pending' end)
                order by i.created_at desc), '[]') from app.team_invitations i where i.registration_id = r.id) else '[]'::jsonb end,
    'roster', (select jsonb_build_object('state', ro.state, 'revision', ro.revision, 'members',
                (select coalesce(jsonb_agg(jsonb_build_object('profile_id', rm.profile_id, 'slot_type', rm.slot_type, 'slot_index', rm.slot_index,
                   'ign', rm.ign, 'player_uid', rm.player_uid, 'is_igl', rm.is_igl) order by rm.slot_index), '[]')
                 from app.esports_roster_members rm where rm.roster_id = ro.id and rm.active))
               from app.esports_rosters ro where ro.entry_id = r.entry_id order by ro.revision desc limit 1),
    'declaration', (select jsonb_build_object('accepted_at', d.accepted_at, 'hash', d.declaration_hash, 'version', d.declaration_text_version)
                    from app.team_declarations d where d.registration_id = r.id order by d.accepted_at desc limit 1),
    'reservation', (select jsonb_build_object('state', case when x.state = 'held' and x.expires_at <= now() then 'expired' else x.state end, 'expires_at', x.expires_at)
                    from app.reservations x where x.entry_id = r.entry_id order by x.created_at desc limit 1)
  );
end; $$;

create function public.ff_invite_member(p_registration_id uuid, p_email text) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v uuid := app.require_profile(); r app.registrations; ver app.event_versions;
  v_email text := lower(trim(p_email)); v_token text; v_id uuid; v_expires timestamptz := now() + interval '7 days';
  v_taken integer;
begin
  select * into r from app.registrations where id = p_registration_id for update;
  if r.id is null or r.owner_id <> v then raise exception 'Only the team captain can invite members' using errcode = '42501'; end if;
  if r.mode <> 'team' or r.state not in ('draft','awaiting_members') then raise exception 'This entry is no longer accepting members' using errcode = 'FF409'; end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Enter a valid email address' using errcode = '22023'; end if;
  if v_email = app.actor_email() then raise exception 'You are already on this team' using errcode = '22023'; end if;
  select * into ver from app.event_versions where id = r.event_version_id;
  select (select count(*) from app.registration_members where registration_id = r.id and state = 'accepted')
       + (select count(*) from app.team_invitations where registration_id = r.id and accepted_at is null and revoked_at is null and expires_at > now())
    into v_taken;
  if ver.team_max is not null and v_taken >= ver.team_max then raise exception 'Team is full (maximum % members)', ver.team_max using errcode = 'FF409'; end if;
  if exists (select 1 from app.team_invitations where registration_id = r.id and lower(invited_email) = v_email and accepted_at is null and revoked_at is null and expires_at > now()) then
    raise exception 'An invitation for this email is already pending' using errcode = 'FF409';
  end if;
  v_token := app.random_token();
  insert into app.team_invitations(registration_id, invited_email, invited_by, token_hash, expires_at)
  values (r.id, v_email, v, app.sha256_hex(v_token), v_expires) returning id into v_id;
  perform app.log_event_audit(r.event_id, v, 'INVITE_MEMBER', 'team_invitations', v_id);
  return jsonb_build_object('invitation_id', v_id, 'token', v_token, 'expires_at', v_expires);
end; $$;

create function public.ff_revoke_invitation(p_invitation_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid := app.require_profile(); i app.team_invitations; r app.registrations;
begin
  select * into i from app.team_invitations where id = p_invitation_id for update;
  select * into r from app.registrations where id = i.registration_id;
  if i.id is null or r.owner_id <> v then raise exception 'Invitation not found' using errcode = 'P0002'; end if;
  if i.accepted_at is not null then raise exception 'Invitation was already accepted' using errcode = 'FF409'; end if;
  update app.team_invitations set revoked_at = now() where id = i.id and revoked_at is null;
  perform app.log_event_audit(r.event_id, v, 'REVOKE_INVITATION', 'team_invitations', i.id);
  return jsonb_build_object('invitation_id', i.id, 'status', 'revoked');
end; $$;

create function public.ff_invitation_preview(p_token text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.actor_id(); i app.team_invitations;
begin
  select * into i from app.team_invitations where token_hash = app.sha256_hex(coalesce(p_token, ''));
  if i.id is null then raise exception 'Invitation not found' using errcode = 'P0002'; end if;
  return (select jsonb_build_object('event_name', e.name, 'team_name', ce.display_name, 'captain', p.display_name,
            'expires_at', i.expires_at, 'for_this_account', lower(i.invited_email) = app.actor_email(),
            'status', case when i.accepted_at is not null then 'accepted' when i.revoked_at is not null then 'revoked' when i.expires_at <= now() then 'expired' else 'pending' end)
          from app.registrations r join app.events e on e.id = r.event_id
          join app.competition_entries ce on ce.id = r.entry_id join app.profiles p on p.id = i.invited_by
          where r.id = i.registration_id);
end; $$;

create function public.ff_accept_invitation(p_token text) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid := app.require_profile(); i app.team_invitations; r app.registrations; ver app.event_versions; v_member uuid; v_count integer;
begin
  select * into i from app.team_invitations where token_hash = app.sha256_hex(coalesce(p_token, '')) for update;
  if i.id is null then raise exception 'Invitation not found' using errcode = 'P0002'; end if;
  if lower(i.invited_email) <> app.actor_email() then raise exception 'This invitation was sent to a different email address' using errcode = '42501'; end if;
  if i.accepted_at is not null or i.revoked_at is not null or i.expires_at <= now() then raise exception 'This invitation is no longer valid' using errcode = 'FF409'; end if;
  select * into r from app.registrations where id = i.registration_id for update;
  if r.state not in ('draft','awaiting_members') then raise exception 'This team is no longer accepting members' using errcode = 'FF409'; end if;
  if exists (select 1 from app.registration_members where event_id = r.event_id and profile_id = v and state = 'accepted') then
    raise exception 'You are already part of an entry for this event' using errcode = 'FF409';
  end if;
  select * into ver from app.event_versions where id = r.event_version_id;
  select count(*) into v_count from app.registration_members where registration_id = r.id and state = 'accepted';
  if ver.team_max is not null and v_count >= ver.team_max then raise exception 'Team is full' using errcode = 'FF409'; end if;
  insert into app.registration_members(registration_id, event_id, profile_id, state, consented_at, rules_version_id)
  values (r.id, r.event_id, v, 'accepted', now(), r.event_version_id)
  on conflict (registration_id, profile_id) do update set state = 'accepted', consented_at = now(), rules_version_id = excluded.rules_version_id
  returning id into v_member;
  insert into app.entry_participants(entry_id, registration_id, member_id, event_id, profile_id)
  values (r.entry_id, r.id, v_member, r.event_id, v)
  on conflict (member_id) do update set active = true;
  update app.team_invitations set accepted_by = v, accepted_at = now() where id = i.id;
  perform app.log_event_audit(r.event_id, v, 'ACCEPT_INVITATION', 'team_invitations', i.id);
  return jsonb_build_object('registration_id', r.id, 'status', 'accepted');
end; $$;

create function public.ff_submit_roster(p_registration_id uuid, p_starters jsonb, p_substitute jsonb default null, p_idempotency_key text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v uuid := app.require_profile();
  v_prior jsonb := app.idem_begin('submit_roster', p_idempotency_key, jsonb_build_object('r', p_registration_id, 's', p_starters, 'x', p_substitute));
  r app.registrations; v_pid uuid; v_res jsonb; v_sub jsonb := nullif(p_substitute, 'null'::jsonb);
begin
  if v_prior is not null then return v_prior; end if;
  select * into r from app.registrations where id = p_registration_id for update;
  if r.id is null or r.owner_id <> v then raise exception 'Only the team captain can submit the roster' using errcode = '42501'; end if;
  if r.state not in ('draft','awaiting_members') then raise exception 'The roster is locked for this registration' using errcode = 'FF409'; end if;
  if not exists (select 1 from app.esports_rules_versions where event_version_id = r.event_version_id) then
    raise exception 'This event does not use an esports roster' using errcode = '22023';
  end if;
  if jsonb_typeof(p_starters) <> 'array' then raise exception 'Starters must be a list' using errcode = '22023'; end if;
  if v_sub is not null and nullif(v_sub ->> 'profile_id', '') is null then v_sub := null; end if;
  for v_pid in select (x ->> 'profile_id')::uuid from jsonb_array_elements(p_starters || coalesce(jsonb_build_array(v_sub), '[]'::jsonb)) x loop
    if v_pid is null or not exists (select 1 from app.registration_members where registration_id = r.id and profile_id = v_pid and state = 'accepted') then
      raise exception 'Every roster player must be an accepted team member' using errcode = '22023';
    end if;
  end loop;
  v_res := app.rpc_esports_submit_roster(r.entry_id, r.id, p_starters, v_sub, p_idempotency_key, v);
  update app.registrations set roster_snapshot = jsonb_build_object('starters', p_starters, 'substitute', v_sub), row_version = row_version + 1 where id = r.id;
  return app.idem_finish('submit_roster', p_idempotency_key, v_res);
end; $$;

-- The declaration is the published, approved rules text of the registration's event version.
create function public.ff_accept_declaration(p_registration_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid := app.require_profile(); r app.registrations; ver app.event_versions; v_hash text; v_res jsonb;
begin
  select * into r from app.registrations where id = p_registration_id for update;
  if r.id is null or r.owner_id <> v then raise exception 'Only the registration owner can accept the declaration' using errcode = '42501'; end if;
  select * into ver from app.event_versions where id = r.event_version_id;
  if ver.approval_state <> 'approved' then raise exception 'The event rules have not been approved yet' using errcode = 'FF409'; end if;
  if exists (select 1 from app.team_declarations where registration_id = r.id and rules_version_id = ver.id) then
    raise exception 'The declaration was already accepted' using errcode = 'FF409';
  end if;
  v_hash := app.sha256_hex(ver.rules_text);
  v_res := app.rpc_esports_accept_team_declaration(r.id, ver.id, v_hash, 'v' || ver.version, v);
  update app.registrations set rules_accepted_at = now(), row_version = row_version + 1 where id = r.id;
  return v_res || jsonb_build_object('declaration_hash', v_hash, 'declaration_version', 'v' || ver.version);
end; $$;

create function public.ff_reserve_entry(p_registration_id uuid, p_idempotency_key text default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  v uuid := app.require_profile();
  v_prior jsonb := app.idem_begin('reserve_entry', p_idempotency_key, jsonb_build_object('r', p_registration_id));
  r app.registrations; ev app.events; ver app.event_versions; po app.price_options; v_members integer; v_res jsonb;
begin
  if v_prior is not null then return v_prior; end if;
  select * into r from app.registrations where id = p_registration_id;
  if r.id is null or r.owner_id <> v then raise exception 'Only the registration owner can reserve a place' using errcode = '42501'; end if;
  -- Lock order: event, then entry (inside app.rpc_reserve_entry), then registration.
  select * into ev from app.events where id = r.event_id for update;
  select * into r from app.registrations where id = p_registration_id for update;
  if r.state not in ('draft','awaiting_members') then raise exception 'This registration cannot reserve a place in its current state' using errcode = 'FF409'; end if;
  if r.rules_accepted_at is null then raise exception 'Accept the event declaration first' using errcode = 'FF409'; end if;
  select * into po from app.price_options where id = r.price_option_id;
  if not po.enabled or po.amount_paise is null then raise exception 'The entry fee has not been confirmed yet' using errcode = 'FF409'; end if;
  if ev.capacity is null then raise exception 'The organizers have not approved a capacity limit yet' using errcode = 'FF409'; end if;
  select * into ver from app.event_versions where id = r.event_version_id;
  select count(*) into v_members from app.registration_members where registration_id = r.id and state = 'accepted';
  if ver.team_min is not null and v_members < ver.team_min then raise exception 'Your team needs at least % accepted members', ver.team_min using errcode = 'FF409'; end if;
  if exists (select 1 from app.esports_rules_versions where event_version_id = r.event_version_id)
     and not exists (select 1 from app.esports_rosters where entry_id = r.entry_id and state in ('submitted','locked')) then
    raise exception 'Submit your squad roster first' using errcode = 'FF409';
  end if;
  update app.reservations set state = 'expired' where entry_id = r.entry_id and state = 'held' and expires_at <= now();
  v_res := app.rpc_reserve_entry(r.entry_id, r.row_version, p_idempotency_key, v);
  update app.registrations set state = 'payment_due', row_version = row_version + 1 where id = r.id;
  update app.competition_entries set state = 'held', row_version = row_version + 1 where id = r.entry_id;
  return app.idem_finish('reserve_entry', p_idempotency_key,
    v_res || jsonb_build_object('registration_state', 'payment_due', 'payment', 'pending_official_payment_profile'));
end; $$;

-- ---------------------------------------------------------------------------
-- 3. Staff operations (referee, volunteer, judge)
-- ---------------------------------------------------------------------------
create function public.ff_staff_context(p_event_slug text) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug);
begin
  perform app.require_staff(array['referee','volunteer','judge','event_admin','super_admin'], ev.id);
  return jsonb_build_object(
    'event', jsonb_build_object('id', ev.id, 'slug', ev.slug, 'name', ev.name, 'state', ev.state),
    'sessions', (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'label', s.label, 'starts_at', s.starts_at, 'ends_at', s.ends_at) order by s.starts_at), '[]') from app.sessions s where s.event_id = ev.id),
    'stations', (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'name', s.name, 'kind', s.kind) order by s.name), '[]') from app.stations s where s.event_id = ev.id and s.active),
    'matches', (select coalesce(jsonb_agg(jsonb_build_object('id', m.id, 'round_label', m.round_label, 'match_number', m.match_number, 'state', m.state) order by m.round_label, m.match_number), '[]') from app.esports_matches m where m.event_id = ev.id),
    'scoring_versions', (select coalesce(jsonb_agg(jsonb_build_object('id', sv.id, 'version', sv.version, 'name', sv.name, 'kill_multiplier', sv.kill_multiplier,
                          'tie_break_policy', sv.tie_break_policy, 'approval_state', sv.approval_state,
                          'placement_points', (select coalesce(jsonb_agg(jsonb_build_object('place', pp.place, 'points', pp.points) order by pp.place), '[]') from app.esports_placement_points pp where pp.scoring_version_id = sv.id))
                          order by sv.version desc), '[]') from app.esports_scoring_versions sv where sv.event_id = ev.id),
    'entries', (select coalesce(jsonb_agg(jsonb_build_object('id', ce.id, 'name', ce.display_name, 'state', ce.state,
                  'roster', (select coalesce(jsonb_agg(jsonb_build_object('member_id', rm.id, 'profile_id', rm.profile_id, 'ign', rm.ign, 'player_uid', rm.player_uid, 'slot_type', rm.slot_type, 'is_igl', rm.is_igl) order by rm.slot_index), '[]')
                             from app.esports_roster_members rm join app.esports_rosters ro on ro.id = rm.roster_id
                             where rm.entry_id = ce.id and rm.active and ro.state in ('submitted','locked'))) order by ce.display_name), '[]')
               from app.competition_entries ce where ce.event_id = ev.id and ce.state not in ('cancelled','disqualified')),
    'results', (select coalesce(jsonb_agg(jsonb_build_object('id', rr.id, 'match_id', rr.match_id, 'revision', rr.revision, 'state', rr.state,
                  'recorded_by_me', rr.recorded_by = auth.uid(), 'results', rr.results_payload) order by rr.created_at desc), '[]')
                from app.esports_match_result_revisions rr where rr.event_id = ev.id and rr.state <> 'superseded')
  );
end; $$;

create function public.ff_staff_signoff_hardware(p_station_id uuid, p_session_id uuid, p_asset_code text, p_config_version text, p_result text, p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_event uuid; v uuid;
begin
  select event_id into v_event from app.stations where id = p_station_id;
  if v_event is null then raise exception 'Station not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['referee','event_admin','super_admin'], v_event);
  if nullif(trim(p_asset_code), '') is null or nullif(trim(p_config_version), '') is null then raise exception 'Asset code and configuration version are required' using errcode = '22023'; end if;
  if p_result in ('failed','flagged') and nullif(trim(p_reason), '') is null then raise exception 'Give a reason for a failed or flagged check' using errcode = '22023'; end if;
  return app.rpc_esports_signoff_hardware(p_station_id, v_event, p_session_id, trim(p_asset_code), trim(p_config_version), p_result, nullif(trim(p_reason), ''), v);
end; $$;

create function public.ff_staff_log_incident(p_match_id uuid, p_entry_id uuid, p_request_type text, p_decision text, p_reason text, p_duration_seconds integer, p_penalty_points numeric)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_event uuid; v uuid;
begin
  select event_id into v_event from app.esports_matches where id = p_match_id;
  if v_event is null then raise exception 'Match not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['referee','event_admin','super_admin'], v_event);
  if p_entry_id is not null and not exists (select 1 from app.competition_entries where id = p_entry_id and event_id = v_event) then
    raise exception 'Team is not part of this event' using errcode = '22023';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'A reason is required for every adjudication' using errcode = '22023'; end if;
  return app.rpc_esports_log_pause_incident(p_match_id, v_event, p_entry_id, p_request_type, p_decision, trim(p_reason), p_duration_seconds, p_penalty_points, v);
end; $$;

create function public.ff_staff_activate_substitute(p_match_id uuid, p_entry_id uuid, p_starter_member_id uuid, p_substitute_member_id uuid, p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_event uuid; v uuid;
begin
  select event_id into v_event from app.esports_matches where id = p_match_id;
  if v_event is null then raise exception 'Match not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['referee','event_admin','super_admin'], v_event);
  if nullif(trim(p_reason), '') is null then raise exception 'A reason is required' using errcode = '22023'; end if;
  if (select count(*) from app.esports_roster_members rm join app.esports_rosters ro on ro.id = rm.roster_id
       where rm.id in (p_starter_member_id, p_substitute_member_id) and rm.active and rm.entry_id = p_entry_id
         and ro.state in ('submitted','locked')) <> 2 then
    raise exception 'Both players must be active members of the submitted roster' using errcode = '22023';
  end if;
  return app.rpc_esports_activate_substitute(p_match_id, v_event, p_entry_id, p_starter_member_id, p_substitute_member_id, trim(p_reason), v);
end; $$;

create function public.ff_staff_verify_identity(p_event_slug text, p_profile_id uuid, p_proof_type text, p_method text, p_status text, p_rejection_reason text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug); v uuid;
begin
  v := app.require_staff(array['referee','volunteer','event_admin','super_admin'], ev.id);
  if p_method = 'upload' then raise exception 'Upload verification needs the private evidence bucket, which is not configured yet' using errcode = 'FF409'; end if;
  if p_status not in ('verified','rejected') then raise exception 'Choose verified or rejected' using errcode = '22023'; end if;
  if p_status = 'rejected' and nullif(trim(p_rejection_reason), '') is null then raise exception 'Give a reason for rejection' using errcode = '22023'; end if;
  if not exists (select 1 from app.registration_members where event_id = ev.id and profile_id = p_profile_id and state = 'accepted') then
    raise exception 'This person is not registered for the event' using errcode = '22023';
  end if;
  if exists (select 1 from app.registration_members where event_id = ev.id and profile_id = v and state = 'accepted') then
    raise exception 'Participants in this event cannot verify other participants' using errcode = '42501';
  end if;
  return app.rpc_esports_verify_identity(ev.id, p_profile_id, p_proof_type, p_method, p_status, null, nullif(trim(p_rejection_reason), ''), v);
end; $$;

-- Results always use the latest approved scoring version; revisions supersede earlier ones.
create function public.ff_staff_record_result(p_match_id uuid, p_results jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare
  m app.esports_matches; v uuid; sv app.esports_scoring_versions; v_rev integer; v_id uuid;
  v_row record; v_place numeric; v_total numeric; v_calc jsonb := '[]'::jsonb;
begin
  select * into m from app.esports_matches where id = p_match_id for update;
  if m.id is null then raise exception 'Match not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['referee','event_admin','super_admin'], m.event_id);
  select * into sv from app.esports_scoring_versions where event_id = m.event_id and approval_state = 'approved' order by version desc limit 1;
  if sv.id is null then raise exception 'Scoring rules are not approved yet; results cannot be recorded' using errcode = 'FF409'; end if;
  if jsonb_typeof(p_results) <> 'array' or jsonb_array_length(p_results) = 0 then raise exception 'Enter at least one team result' using errcode = '22023'; end if;
  if (select count(distinct x.placement) <> count(*) or count(distinct x.entry_id) <> count(*) or bool_or(x.placement < 1 or coalesce(x.kills, 0) < 0)
      from jsonb_to_recordset(p_results) as x(entry_id uuid, placement integer, kills integer)) then
    raise exception 'Each team and each placement may appear once; kills cannot be negative' using errcode = '22023';
  end if;
  if exists (select 1 from jsonb_to_recordset(p_results) as x(entry_id uuid, placement integer, kills integer)
             where not exists (select 1 from app.competition_entries ce where ce.id = x.entry_id and ce.event_id = m.event_id)) then
    raise exception 'A team in the results is not part of this event' using errcode = '22023';
  end if;
  for v_row in select * from jsonb_to_recordset(p_results) as x(entry_id uuid, placement integer, kills integer) order by placement loop
    select points into v_place from app.esports_placement_points where scoring_version_id = sv.id and place = v_row.placement;
    v_total := coalesce(v_place, 0) + coalesce(v_row.kills, 0) * sv.kill_multiplier;
    v_calc := v_calc || jsonb_build_object('entry_id', v_row.entry_id, 'placement', v_row.placement, 'kills', coalesce(v_row.kills, 0),
                                           'placement_points', coalesce(v_place, 0), 'kill_points', coalesce(v_row.kills, 0) * sv.kill_multiplier, 'total_points', v_total);
    insert into app.esports_match_entries(match_id, event_id, entry_id, placement, kills, points, recorded_by, reviewed_by)
    values (m.id, m.event_id, v_row.entry_id, v_row.placement, coalesce(v_row.kills, 0), v_total, v, null)
    on conflict (match_id, entry_id) do update set placement = excluded.placement, kills = excluded.kills, points = excluded.points,
      recorded_by = excluded.recorded_by, reviewed_by = null;
  end loop;
  update app.esports_match_result_revisions set state = 'superseded' where match_id = m.id and state in ('draft','reviewed');
  select coalesce(max(revision), 0) + 1 into v_rev from app.esports_match_result_revisions where match_id = m.id;
  insert into app.esports_match_result_revisions(match_id, event_id, scoring_version_id, revision, state, recorded_by, results_payload)
  values (m.id, m.event_id, sv.id, v_rev, 'draft', v, v_calc) returning id into v_id;
  perform app.log_event_audit(m.event_id, v, 'RECORD_MATCH_RESULT', 'esports_match_result_revisions', v_id);
  return jsonb_build_object('revision_id', v_id, 'revision', v_rev, 'state', 'draft', 'scoring_version', sv.version, 'results', v_calc);
end; $$;

create function public.ff_staff_review_result(p_revision_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare rr app.esports_match_result_revisions; v uuid;
begin
  select * into rr from app.esports_match_result_revisions where id = p_revision_id for update;
  if rr.id is null then raise exception 'Result revision not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['referee','event_admin','super_admin'], rr.event_id);
  if rr.state <> 'draft' then raise exception 'Only a draft result can be reviewed' using errcode = 'FF409'; end if;
  if rr.recorded_by = v then raise exception 'A different official must review this result' using errcode = '42501'; end if;
  update app.esports_match_result_revisions set state = 'reviewed', reviewed_by = v, reviewed_at = now() where id = rr.id;
  update app.esports_match_entries set reviewed_by = v where match_id = rr.match_id;
  perform app.log_event_audit(rr.event_id, v, 'REVIEW_MATCH_RESULT', 'esports_match_result_revisions', rr.id);
  return jsonb_build_object('revision_id', rr.id, 'state', 'reviewed');
end; $$;

create function public.ff_my_duties() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.require_profile();
begin
  return (select coalesce(jsonb_agg(jsonb_build_object('duty_id', d.id, 'event_name', e.name, 'session_id', d.session_id, 'session', s.label,
            'station_id', d.station_id, 'station', st.name, 'starts_at', d.starts_at, 'ends_at', d.ends_at,
            'active', now() >= d.starts_at and now() < d.ends_at) order by d.starts_at), '[]')
          from app.duties d join app.events e on e.id = d.event_id join app.sessions s on s.id = d.session_id join app.stations st on st.id = d.station_id
          where d.profile_id = v and d.revoked_at is null and d.ends_at > now() - interval '12 hours');
end; $$;

-- The server hashes the scanned token; plaintext tokens never reach the database.
create function public.ff_staff_scan_pass(p_token_hash text, p_session_id uuid, p_station_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid; ps app.passes; d app.duties; v_att app.attendance; v_name text; v_event text;
begin
  select * into d from app.duties where profile_id = auth.uid() and session_id = p_session_id and station_id = p_station_id
     and revoked_at is null and now() >= starts_at and now() < ends_at limit 1;
  if d.id is null then raise exception 'You have no active duty at this station and session' using errcode = '42501'; end if;
  v := app.require_staff(array['volunteer','event_admin','super_admin'], d.event_id);
  if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'Unreadable pass code' using errcode = '22023'; end if;
  select * into ps from app.passes where token_hash = p_token_hash for update;
  if ps.id is null or ps.event_id <> d.event_id then raise exception 'Pass not valid for this event' using errcode = 'P0002'; end if;
  if ps.revoked_at is not null or ps.expires_at <= now() then raise exception 'This pass has been revoked or has expired' using errcode = 'FF409'; end if;
  if not exists (select 1 from app.entry_participants ep join app.registrations r on r.id = ep.registration_id
                 where ep.id = ps.entry_participant_id and ep.active and r.state = 'confirmed') then
    raise exception 'This participant''s registration is not confirmed' using errcode = 'FF409';
  end if;
  select p.display_name, e.name into v_name, v_event from app.profiles p, app.events e where p.id = ps.profile_id and e.id = ps.event_id;
  select * into v_att from app.attendance where event_id = ps.event_id and session_id = p_session_id and participant_id = ps.profile_id and action = 'check_in';
  if v_att.id is not null then
    return jsonb_build_object('status', 'duplicate', 'participant', v_name, 'event', v_event, 'checked_in_at', v_att.recorded_at, 'support_reference', ps.support_reference);
  end if;
  insert into app.attendance(pass_id, event_id, participant_id, session_id, station_id, duty_id, actor_id, action, method)
  values (ps.id, ps.event_id, ps.profile_id, p_session_id, p_station_id, d.id, v, 'check_in', 'qr') returning * into v_att;
  perform app.log_event_audit(ps.event_id, v, 'SCAN_CHECK_IN', 'attendance', v_att.id);
  return jsonb_build_object('status', 'checked_in', 'participant', v_name, 'event', v_event, 'checked_in_at', v_att.recorded_at, 'support_reference', ps.support_reference);
end; $$;

create function public.ff_judge_assignments() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.require_profile();
begin
  return (select coalesce(jsonb_agg(jsonb_build_object(
            'assignment_id', ja.id, 'event_name', e.name, 'entry', ce.display_name, 'rubric', ru.name, 'max_marks', ru.max_marks,
            'conflict_declared', ja.conflict_declared,
            'criteria', (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'label', c.label, 'max_marks', c.max_marks, 'conditional', c.conditional) order by c.position), '[]') from app.rubric_criteria c where c.rubric_id = ru.id),
            'scorecard', (select jsonb_build_object('id', sc.id, 'state', sc.state, 'revision', sc.revision, 'locked_at', sc.locked_at,
                            'marks', (select coalesce(jsonb_object_agg(s.criterion_id, s.marks), '{}') from app.scores s where s.scorecard_id = sc.id))
                          from app.scorecards sc where sc.judge_assignment_id = ja.id and sc.state in ('draft','locked'))
          ) order by e.name, ce.display_name), '[]')
          from app.judge_assignments ja join app.competition_entries ce on ce.id = ja.entry_id
          join app.events e on e.id = ja.event_id join app.rubrics ru on ru.id = ja.rubric_id
          where ja.judge_id = v and ja.revoked_at is null);
end; $$;

create function public.ff_judge_save_scorecard(p_assignment_id uuid, p_marks jsonb, p_lock boolean default false) returns jsonb language plpgsql security definer set search_path='' as $$
declare ja app.judge_assignments; v uuid; sc app.scorecards; k text; val text; v_missing integer;
begin
  select * into ja from app.judge_assignments where id = p_assignment_id for update;
  if ja.id is null or ja.judge_id <> auth.uid() or ja.revoked_at is not null then raise exception 'Assignment not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['judge'], ja.event_id);
  if ja.conflict_declared then raise exception 'A conflict was declared for this entry' using errcode = '42501'; end if;
  select * into sc from app.scorecards where judge_assignment_id = ja.id and state in ('draft','locked') for update;
  if sc.id is null then
    insert into app.scorecards(judge_assignment_id, rubric_id) values (ja.id, ja.rubric_id) returning * into sc;
  end if;
  if sc.state = 'locked' then raise exception 'This scorecard is locked' using errcode = 'FF409'; end if;
  if jsonb_typeof(p_marks) <> 'object' then raise exception 'Marks must map criteria to scores' using errcode = '22023'; end if;
  for k, val in select key, value #>> '{}' from jsonb_each(p_marks) loop
    if not exists (select 1 from app.rubric_criteria where id = k::uuid and rubric_id = ja.rubric_id) then
      raise exception 'Unknown criterion for this rubric' using errcode = '22023';
    end if;
    if val is null or val = '' then
      delete from app.scores where scorecard_id = sc.id and criterion_id = k::uuid;
    else
      insert into app.scores(scorecard_id, rubric_id, criterion_id, marks) values (sc.id, ja.rubric_id, k::uuid, val::numeric)
      on conflict (scorecard_id, criterion_id) do update set marks = excluded.marks;
    end if;
  end loop;
  if p_lock then
    select count(*) into v_missing from app.rubric_criteria c where c.rubric_id = ja.rubric_id and not c.conditional
      and not exists (select 1 from app.scores s where s.scorecard_id = sc.id and s.criterion_id = c.id);
    if v_missing > 0 then raise exception 'Score every required criterion before locking (% missing)', v_missing using errcode = '22023'; end if;
    update app.scorecards set state = 'locked', locked_at = now() where id = sc.id;
    perform app.log_event_audit(ja.event_id, v, 'LOCK_SCORECARD', 'scorecards', sc.id);
  end if;
  return jsonb_build_object('scorecard_id', sc.id, 'state', case when p_lock then 'locked' else 'draft' end);
end; $$;

-- ---------------------------------------------------------------------------
-- 4. Administration (event admins within scope; super admins everywhere)
-- ---------------------------------------------------------------------------
create function public.ff_admin_overview() returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v uuid := app.require_profile();
begin
  if not exists (select 1 from app.staff_assignments where profile_id = v and role in ('event_admin','super_admin') and revoked_at is null and now() between starts_at and ends_at) then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if app.actor_aal() <> 'aal2' then raise exception 'Multi-factor verification is required for staff actions' using errcode = 'FFMFA'; end if;
  return jsonb_build_object(
    'is_super_admin', app.has_role(array['super_admin'], null),
    'events', (select coalesce(jsonb_agg(jsonb_build_object(
        'slug', e.slug, 'name', e.name, 'track', e.track, 'state', e.state, 'registration_enabled', e.registration_enabled,
        'capacity', e.capacity, 'capacity_unit', e.capacity_unit,
        'version', (select jsonb_build_object('id', ver.id, 'version', ver.version, 'approval_state', ver.approval_state, 'team_min', ver.team_min, 'team_max', ver.team_max,
                      'public_description', ver.public_description, 'rules_text', ver.rules_text,
                      'prices', (select coalesce(jsonb_agg(jsonb_build_object('mode', p.mode, 'amount_paise', p.amount_paise, 'enabled', p.enabled) order by p.mode), '[]') from app.price_options p where p.event_version_id = ver.id))
                    from app.event_versions ver where ver.event_id = e.id order by ver.version desc limit 1),
        'registrations', (select coalesce(jsonb_object_agg(x.state, x.n), '{}') from (select state, count(*) n from app.registrations where event_id = e.id group by state) x),
        'reserved', (select count(*) from app.reservations r where r.event_id = e.id and (r.state = 'confirmed' or (r.state in ('held','review_hold') and r.expires_at > now())))
      ) order by e.track, e.name), '[]')
      from app.events e where app.has_role(array['event_admin','super_admin'], e.id)),
    'staff', (select coalesce(jsonb_agg(jsonb_build_object('id', s.id, 'name', p.display_name, 'email', p.contact_email, 'role', s.role,
                'event', e.name, 'ends_at', s.ends_at) order by s.role, p.display_name), '[]')
              from app.staff_assignments s join app.profiles p on p.id = s.profile_id left join app.events e on e.id = s.event_id
              where s.revoked_at is null and s.ends_at > now() and (app.has_role(array['super_admin'], null) or app.has_role(array['event_admin'], s.event_id)))
  );
end; $$;

-- Draft configuration: capacity, prices and team size before publication. Super admin only.
create function public.ff_admin_configure_event(p_event_slug text, p_capacity integer, p_team_min integer, p_team_max integer, p_prices jsonb, p_reason text)
returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug, true); v uuid; ver app.event_versions; k text; val text;
begin
  v := app.require_staff(array['super_admin'], ev.id);
  if nullif(trim(p_reason), '') is null then raise exception 'Record the source of these organizer decisions' using errcode = '22023'; end if;
  select * into ver from app.event_versions where event_id = ev.id order by version desc limit 1 for update;
  if ver.approval_state <> 'draft' then raise exception 'Published event terms cannot be changed here' using errcode = 'FF409'; end if;
  if p_capacity is not null and p_capacity <= 0 then raise exception 'Capacity must be positive' using errcode = '22023'; end if;
  update app.events set capacity = p_capacity, row_version = row_version + 1 where id = ev.id;
  update app.event_versions set team_min = p_team_min, team_max = p_team_max where id = ver.id;
  for k, val in select key, value #>> '{}' from jsonb_each(coalesce(p_prices, '{}'::jsonb)) loop
    if k not in ('team','stall','entry') then raise exception 'Unsupported entry type %', k using errcode = '22023'; end if;
    if val is not null and val !~ '^[0-9]+$' then raise exception 'Fees are whole paise' using errcode = '22023'; end if;
    insert into app.price_options(event_version_id, event_id, mode, amount_paise, enabled)
    values (ver.id, ev.id, k, val::bigint, false)
    on conflict (event_version_id, mode) do update set amount_paise = excluded.amount_paise;
  end loop;
  insert into app.audit_log(institution_id, organizer_id, event_id, actor_id, effective_role, action, entity_type, entity_id, reason,
                            safe_after, correlation_id)
  select o.institution_id, ev.organizer_id, ev.id, v, 'super_admin', 'CONFIGURE_EVENT', 'events', ev.id, trim(p_reason),
         jsonb_build_object('capacity', p_capacity, 'team_min', p_team_min, 'team_max', p_team_max, 'prices', p_prices), gen_random_uuid()
  from app.organizers o where o.id = ev.organizer_id;
  return jsonb_build_object('event', ev.slug, 'status', 'configured');
end; $$;

-- Approves the draft version with the official rules text and publishes the event.
create function public.ff_admin_publish_event(p_event_slug text, p_public_description text, p_rules_text text) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug, true); v uuid; ver app.event_versions;
begin
  v := app.require_staff(array['event_admin','super_admin'], ev.id);
  select * into ver from app.event_versions where event_id = ev.id order by version desc limit 1 for update;
  if ver.approval_state <> 'draft' then raise exception 'This event is already published' using errcode = 'FF409'; end if;
  if length(trim(coalesce(p_rules_text, ''))) < 40 then raise exception 'Paste the complete official rules text' using errcode = '22023'; end if;
  if length(trim(coalesce(p_public_description, ''))) < 10 then raise exception 'Add a public description' using errcode = '22023'; end if;
  update app.event_versions set public_description = trim(p_public_description), rules_text = trim(p_rules_text),
    approval_state = 'approved', approved_by = v, approved_at = now() where id = ver.id;
  update app.price_options set enabled = (amount_paise is not null and mode <> 'individual') where event_version_id = ver.id;
  update app.events set state = 'published', published_version_id = ver.id, row_version = row_version + 1 where id = ev.id;
  perform app.log_event_audit(ev.id, v, 'PUBLISH_EVENT', 'event_versions', ver.id);
  return jsonb_build_object('event', ev.slug, 'state', 'published', 'version', ver.version, 'rules_hash', app.sha256_hex(trim(p_rules_text)));
end; $$;

create function public.ff_admin_set_registration(p_event_slug text, p_enabled boolean, p_closes_at timestamptz default null) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug, true); v uuid;
begin
  v := app.require_staff(array['event_admin','super_admin'], ev.id);
  if p_enabled and (ev.state <> 'published' or ev.published_version_id is null) then raise exception 'Publish the event before opening registration' using errcode = 'FF409'; end if;
  if p_closes_at is not null and p_closes_at <= now() then raise exception 'The closing time must be in the future' using errcode = '22023'; end if;
  update app.events set registration_enabled = p_enabled, registration_closes_at = coalesce(p_closes_at, registration_closes_at), row_version = row_version + 1 where id = ev.id;
  perform app.log_event_audit(ev.id, v, case when p_enabled then 'OPEN_REGISTRATION' else 'CLOSE_REGISTRATION' end, 'events', ev.id);
  return jsonb_build_object('event', ev.slug, 'registration_enabled', p_enabled);
end; $$;

-- Grant hierarchy: super admin grants any role; event admin grants referee/volunteer/judge/teacher within own events.
create function public.ff_admin_grant_role(p_email text, p_role text, p_event_slug text, p_days integer, p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid := app.require_profile(); v_target uuid; ev app.events; v_org uuid; v_inst uuid; v_id uuid;
begin
  if p_event_slug is not null then ev := app.event_by_slug(p_event_slug); end if;
  if p_role = 'super_admin' or p_role in ('event_admin','finance_reviewer','export_operator') then
    perform app.require_staff(array['super_admin'], ev.id);
  elsif p_role in ('referee','volunteer','judge','teacher') then
    if ev.id is null then raise exception 'Choose the event for this role' using errcode = '22023'; end if;
    perform app.require_staff(array['event_admin','super_admin'], ev.id);
  else raise exception 'Unknown role' using errcode = '22023'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'A reason is required' using errcode = '22023'; end if;
  if p_days is null or p_days < 1 or p_days > 365 then raise exception 'Choose a duration between 1 and 365 days' using errcode = '22023'; end if;
  select id into v_target from app.profiles where lower(contact_email) = lower(trim(p_email)) and status = 'active';
  if v_target is null then raise exception 'No profile for that email; they must sign in and save a profile first' using errcode = 'P0002'; end if;
  if v_target = v then raise exception 'You cannot grant roles to yourself' using errcode = '42501'; end if;
  select o.id, o.institution_id into v_org, v_inst from app.organizers o where o.id = ev.organizer_id;
  if v_inst is null then select id into v_inst from app.institutions order by created_at limit 1; end if;
  insert into app.staff_assignments(profile_id, institution_id, organizer_id, event_id, role, starts_at, ends_at, granted_by, reason)
  values (v_target, v_inst, case when p_role = 'super_admin' then null else v_org end, case when p_role = 'super_admin' then null else ev.id end,
          p_role, now(), now() + make_interval(days => p_days), v, trim(p_reason))
  returning id into v_id;
  if ev.id is not null then perform app.log_event_audit(ev.id, v, 'GRANT_ROLE', 'staff_assignments', v_id);
  else perform app.log_institution_audit('GRANT_ROLE', 'staff_assignments', v_id, trim(p_reason)); end if;
  return jsonb_build_object('assignment_id', v_id, 'role', p_role);
end; $$;

create function public.ff_admin_revoke_role(p_assignment_id uuid, p_reason text) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid := app.require_profile(); s app.staff_assignments;
begin
  select * into s from app.staff_assignments where id = p_assignment_id for update;
  if s.id is null then raise exception 'Assignment not found' using errcode = 'P0002'; end if;
  if s.role in ('super_admin','event_admin','finance_reviewer','export_operator') then perform app.require_staff(array['super_admin'], s.event_id);
  else perform app.require_staff(array['event_admin','super_admin'], s.event_id); end if;
  if s.role = 'super_admin' and (select count(*) from app.staff_assignments where role = 'super_admin' and revoked_at is null and now() < ends_at) <= 1 then
    raise exception 'The last super admin cannot be removed' using errcode = 'FF409';
  end if;
  if nullif(trim(p_reason), '') is null then raise exception 'A reason is required' using errcode = '22023'; end if;
  update app.staff_assignments set revoked_at = now(), revoked_by = v where id = s.id;
  update app.duties set revoked_at = now() where staff_assignment_id = s.id and revoked_at is null;
  perform app.log_institution_audit('REVOKE_ROLE', 'staff_assignments', s.id, trim(p_reason));
  return jsonb_build_object('assignment_id', s.id, 'status', 'revoked');
end; $$;

create function public.ff_admin_create_session(p_event_slug text, p_label text, p_starts_at timestamptz, p_ends_at timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug); v uuid; v_id uuid;
begin
  v := app.require_staff(array['event_admin','super_admin'], ev.id);
  if nullif(trim(p_label), '') is null then raise exception 'Name the session' using errcode = '22023'; end if;
  if p_ends_at <= p_starts_at then raise exception 'The session must end after it starts' using errcode = '22023'; end if;
  insert into app.sessions(event_id, label, starts_at, ends_at, state) values (ev.id, trim(p_label), p_starts_at, p_ends_at, 'draft') returning id into v_id;
  perform app.log_event_audit(ev.id, v, 'CREATE_SESSION', 'sessions', v_id);
  return jsonb_build_object('session_id', v_id);
end; $$;

create function public.ff_admin_create_station(p_event_slug text, p_name text, p_kind text) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug); v uuid; v_id uuid;
begin
  v := app.require_staff(array['event_admin','super_admin'], ev.id);
  if nullif(trim(p_name), '') is null then raise exception 'Name the station' using errcode = '22023'; end if;
  insert into app.stations(event_id, name, kind) values (ev.id, trim(p_name), p_kind) returning id into v_id;
  perform app.log_event_audit(ev.id, v, 'CREATE_STATION', 'stations', v_id);
  return jsonb_build_object('station_id', v_id);
end; $$;

create function public.ff_admin_create_match(p_event_slug text, p_round_label text, p_match_number integer, p_session_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug); v uuid; v_id uuid;
begin
  v := app.require_staff(array['event_admin','super_admin'], ev.id);
  if ev.published_version_id is null then raise exception 'Publish the event rules before scheduling matches' using errcode = 'FF409'; end if;
  insert into app.esports_matches(event_id, session_id, round_label, match_number, state, rules_version_id)
  values (ev.id, p_session_id, trim(p_round_label), p_match_number, 'scheduled', ev.published_version_id) returning id into v_id;
  perform app.log_event_audit(ev.id, v, 'CREATE_MATCH', 'esports_matches', v_id);
  return jsonb_build_object('match_id', v_id);
end; $$;

create function public.ff_admin_assign_duty(p_email text, p_session_id uuid, p_station_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid; s app.sessions; st app.stations; sa app.staff_assignments; v_id uuid;
begin
  select * into s from app.sessions where id = p_session_id;
  select * into st from app.stations where id = p_station_id;
  if s.id is null or st.id is null or s.event_id <> st.event_id then raise exception 'Session and station must belong to the same event' using errcode = '22023'; end if;
  v := app.require_staff(array['event_admin','super_admin'], s.event_id);
  select a.* into sa from app.staff_assignments a join app.profiles p on p.id = a.profile_id
   where lower(p.contact_email) = lower(trim(p_email)) and a.event_id = s.event_id and a.role in ('volunteer','referee')
     and a.revoked_at is null and a.ends_at >= s.ends_at order by a.ends_at desc limit 1;
  if sa.id is null then raise exception 'Grant a volunteer or referee role for this event first' using errcode = 'FF409'; end if;
  insert into app.duties(staff_assignment_id, profile_id, event_id, session_id, station_id, starts_at, ends_at)
  values (sa.id, sa.profile_id, s.event_id, s.id, st.id, s.starts_at, s.ends_at) returning id into v_id;
  perform app.log_event_audit(s.event_id, v, 'ASSIGN_DUTY', 'duties', v_id);
  return jsonb_build_object('duty_id', v_id);
end; $$;

create function public.ff_admin_update_scoring(p_scoring_version_id uuid, p_kill_multiplier numeric, p_tie_break_policy text) returns jsonb language plpgsql security definer set search_path='' as $$
declare sv app.esports_scoring_versions; v uuid;
begin
  select * into sv from app.esports_scoring_versions where id = p_scoring_version_id for update;
  if sv.id is null then raise exception 'Scoring version not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['event_admin','super_admin'], sv.event_id);
  if sv.approval_state <> 'draft' then raise exception 'Approved scoring versions cannot be edited' using errcode = 'FF409'; end if;
  if p_kill_multiplier is not null and p_kill_multiplier < 0 then raise exception 'Kill points cannot be negative' using errcode = '22023'; end if;
  update app.esports_scoring_versions set kill_multiplier = p_kill_multiplier, tie_break_policy = nullif(trim(p_tie_break_policy), '') where id = sv.id;
  perform app.log_event_audit(sv.event_id, v, 'UPDATE_SCORING_DRAFT', 'esports_scoring_versions', sv.id);
  return jsonb_build_object('scoring_version_id', sv.id, 'approval_state', 'draft');
end; $$;

create function public.ff_admin_approve_scoring(p_scoring_version_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare sv app.esports_scoring_versions; v uuid;
begin
  select * into sv from app.esports_scoring_versions where id = p_scoring_version_id;
  if sv.id is null then raise exception 'Scoring version not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['event_admin','super_admin'], sv.event_id);
  if sv.approval_state <> 'draft' then raise exception 'This scoring version is not a draft' using errcode = 'FF409'; end if;
  update app.esports_scoring_versions set approval_state = 'superseded' where event_id = sv.event_id and approval_state = 'approved';
  return app.rpc_esports_approve_scoring(sv.id, v);
end; $$;

create function public.ff_admin_create_rubric(p_event_slug text, p_name text, p_criteria jsonb) returns jsonb language plpgsql security definer set search_path='' as $$
declare ev app.events := app.event_by_slug(p_event_slug); v uuid; v_id uuid; v_total numeric; c record; i integer := 0;
begin
  v := app.require_staff(array['event_admin','super_admin'], ev.id);
  if ev.published_version_id is null then raise exception 'Publish the event before creating its rubric' using errcode = 'FF409'; end if;
  if jsonb_typeof(p_criteria) <> 'array' or jsonb_array_length(p_criteria) = 0 then raise exception 'Add at least one criterion' using errcode = '22023'; end if;
  select sum((x ->> 'max_marks')::numeric) into v_total from jsonb_array_elements(p_criteria) x;
  insert into app.rubrics(event_version_id, event_id, name, max_marks) values (ev.published_version_id, ev.id, trim(p_name), v_total) returning id into v_id;
  for c in select x ->> 'label' as label, (x ->> 'max_marks')::numeric as max_marks from jsonb_array_elements(p_criteria) x loop
    i := i + 1;
    insert into app.rubric_criteria(rubric_id, label, max_marks, position) values (v_id, trim(c.label), c.max_marks, i);
  end loop;
  perform app.log_event_audit(ev.id, v, 'CREATE_RUBRIC', 'rubrics', v_id);
  return jsonb_build_object('rubric_id', v_id, 'max_marks', v_total);
end; $$;

create function public.ff_admin_assign_judge(p_email text, p_entry_id uuid, p_rubric_id uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare v uuid; ce app.competition_entries; sa app.staff_assignments; v_id uuid;
begin
  select * into ce from app.competition_entries where id = p_entry_id;
  if ce.id is null then raise exception 'Entry not found' using errcode = 'P0002'; end if;
  v := app.require_staff(array['event_admin','super_admin'], ce.event_id);
  if not exists (select 1 from app.rubrics where id = p_rubric_id and event_id = ce.event_id) then raise exception 'Rubric does not belong to this event' using errcode = '22023'; end if;
  select a.* into sa from app.staff_assignments a join app.profiles p on p.id = a.profile_id
   where lower(p.contact_email) = lower(trim(p_email)) and a.event_id = ce.event_id and a.role = 'judge' and a.revoked_at is null and a.ends_at > now() limit 1;
  if sa.id is null then raise exception 'Grant this person a judge role for the event first' using errcode = 'FF409'; end if;
  if exists (select 1 from app.registration_members where event_id = ce.event_id and profile_id = sa.profile_id and state = 'accepted') then
    raise exception 'A participant in this event cannot judge it' using errcode = '42501';
  end if;
  insert into app.judge_assignments(staff_assignment_id, judge_id, entry_id, event_id, rubric_id)
  values (sa.id, sa.profile_id, ce.id, ce.event_id, p_rubric_id) returning id into v_id;
  perform app.log_event_audit(ce.event_id, v, 'ASSIGN_JUDGE', 'judge_assignments', v_id);
  return jsonb_build_object('judge_assignment_id', v_id);
end; $$;

-- ---------------------------------------------------------------------------
-- 5. Privileges: internal helpers stay private; clients may only execute ff_* commands.
-- ---------------------------------------------------------------------------
revoke all on all functions in schema app from public, anon, authenticated, service_role;

do $$
declare f record;
begin
  for f in select p.oid::regprocedure as sig, p.proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and p.proname like 'ff\_%' loop
    execute format('revoke all on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $$;
grant execute on function public.ff_public_catalogue(text) to anon;

commit;
