// Applies every migration in supabase/migrations to a disposable PGlite database and
// exercises the public.ff_* command layer as the anon/authenticated roles with JWT claims,
// the same way PostgREST calls them on Supabase. Run: node supabase/tests/verify-command-layer.cjs
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const appModules = path.resolve(__dirname, '../../app/node_modules/@electric-sql/pglite/dist/index.cjs');
const { PGlite } = require(process.env.PGLITE_MODULE_PATH || appModules);

const checks = [];
let db;

const AUTH_STUB = `
create role anon nologin; create role authenticated nologin; create role service_role nologin;
create schema auth;
create table auth.users(id uuid primary key, email text);
create function auth.jwt() returns jsonb language sql stable as $$ select nullif(current_setting('request.jwt.claims', true), '')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt() ->> 'sub', '')::uuid $$;
grant usage on schema auth to anon, authenticated;
grant execute on all functions in schema auth to anon, authenticated;
`;

async function as(user, aal = 'aal1') {
  await db.exec('reset role');
  const claims = user ? JSON.stringify({ sub: user.id, email: user.email, aal, role: 'authenticated' }) : '';
  await db.query("select set_config('request.jwt.claims', $1, false)", [claims]);
  await db.exec(`set role ${user ? 'authenticated' : 'anon'}`);
}

async function call(user, fn, args = {}, aal = 'aal1') {
  await as(user, aal);
  const keys = Object.keys(args);
  const sql = `select public.${fn}(${keys.map((k, i) => `${k} => $${i + 1}`).join(', ')}) as r`;
  try {
    const res = await db.query(sql, keys.map(k => (args[k] !== null && typeof args[k] === 'object') ? JSON.stringify(args[k]) : args[k]));
    return res.rows[0].r;
  } finally {
    await db.exec('reset role');
  }
}

function pass(name, extra = {}) { checks.push({ test: name, result: 'PASS', ...extra }); }

async function ok(name, user, fn, args, aal) {
  const r = await call(user, fn, args, aal);
  pass(name);
  return r;
}

async function fails(name, code, user, fn, args, aal) {
  try {
    await call(user, fn, args, aal);
  } catch (e) {
    if (code && e.code !== code) throw new Error(`${name}: expected ${code}, got ${e.code} (${e.message})`);
    pass(name, { sqlstate: e.code });
    return e;
  }
  throw new Error(`${name}: unexpectedly succeeded`);
}

async function sqlFails(name, code, user, sql) {
  await as(user);
  try { await db.query(sql); } catch (e) {
    await db.exec('reset role');
    if (code && e.code !== code) throw new Error(`${name}: expected ${code}, got ${e.code} (${e.message})`);
    pass(name, { sqlstate: e.code });
    return;
  }
  await db.exec('reset role');
  throw new Error(`${name}: unexpectedly succeeded`);
}

async function newUser(label, profile = true) {
  const user = { id: randomUUID(), email: `${label}@example.test` };
  await db.query('insert into auth.users(id, email) values ($1, $2)', [user.id, user.email]);
  if (profile) {
    await call(user, 'ff_save_profile', { p_input: { display_name: `User ${label}`, affiliation: 'student', privacy_version: 'v1' } });
  }
  return user;
}

async function main() {
  db = new PGlite();
  await db.exec(AUTH_STUB);
  const dir = path.resolve(__dirname, '../migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    await db.exec(fs.readFileSync(path.join(dir, f), 'utf8'));
    pass(`apply ${f}`);
  }
  // Re-applying the reference data must be a no-op.
  await db.exec(fs.readFileSync(path.join(dir, files.find(f => f.includes('catalogue'))), 'utf8'));
  const evCount = (await db.query('select count(*)::int n from app.events')).rows[0].n;
  if (evCount !== 8) throw new Error('expected 8 seeded events, got ' + evCount);
  pass('catalogue reference data is idempotent (8 events)');

  // --- Privilege boundary ---
  const cat = await ok('anon reads public catalogue', null, 'ff_public_catalogue', {});
  if (cat.some(e => e.registration_open)) throw new Error('seeded events must start closed');
  if (cat.find(e => e.slug === 'bgmi').modes.length !== 0) throw new Error('draft prices must not be public');
  pass('draft events are closed and hide draft prices');
  await fails('anon cannot read a workspace', '42501', null, 'ff_my_workspace', {});
  await sqlFails('authenticated cannot read app tables directly', '42501', { id: randomUUID(), email: 'x@example.test' }, 'select * from app.events');
  await sqlFails('authenticated cannot call internal app RPCs', '42501', { id: randomUUID(), email: 'x@example.test' },
    `select app.rpc_reserve_entry('${randomUUID()}', 1, 'k', '${randomUUID()}')`);
  await fails('a request without a session is rejected', '28000', { id: '', email: '' }, 'ff_my_workspace', {});

  // --- Profiles ---
  const admin = await newUser('admin');
  const noProfile = await newUser('noprofile', false);
  await fails('commands require a saved profile', 'FFPRF', noProfile, 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'X', p_mode: 'team' });
  await fails('profile save requires privacy acceptance', '22023', noProfile, 'ff_save_profile', { p_input: { display_name: 'No Privacy' } });
  await fails('stale profile edit conflicts', 'FF409', admin, 'ff_save_profile', { p_input: { display_name: 'Admin' }, p_expected_version: 7 });
  await ok('profile edit with current version', admin, 'ff_save_profile', { p_input: { display_name: 'Organizer Admin' }, p_expected_version: 1 });

  // --- Bootstrap and staff authority ---
  await db.query("select app.bootstrap_super_admin('admin@example.test', 'verifier bootstrap')");
  pass('bootstrap first super admin from SQL');
  try { await db.query("select app.bootstrap_super_admin('admin@example.test', 'again')"); throw new Error('second bootstrap succeeded'); }
  catch (e) { if (e.code !== 'FF409') throw e; pass('bootstrap refuses a second super admin', { sqlstate: e.code }); }
  await fails('staff actions need MFA (aal2)', 'FFMFA', admin, 'ff_admin_overview', {}, 'aal1');
  const ov = await ok('super admin overview with MFA', admin, 'ff_admin_overview', {}, 'aal2');
  if (ov.events.length !== 8) throw new Error('super admin should see 8 events');

  const student = await newUser('s1');
  await fails('students cannot open admin overview', '42501', student, 'ff_admin_overview', {}, 'aal2');
  await fails('registration closed before publication', 'FF409', student, 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'Early', p_mode: 'team' });
  await fails('cannot open registration for a draft event', 'FF409', admin, 'ff_admin_set_registration', { p_event_slug: 'ipl-auction', p_enabled: true }, 'aal2');
  await fails('publishing needs complete rules text', '22023', admin, 'ff_admin_publish_event', { p_event_slug: 'ipl-auction', p_public_description: 'Live auction', p_rules_text: 'short' }, 'aal2');

  const RULES = 'Teams of two to four. Bids are final once the hammer falls. Organizer decisions are final. (verifier text)';
  await ok('configure approved capacity before publication', admin, 'ff_admin_configure_event',
    { p_event_slug: 'ipl-auction', p_capacity: 2, p_team_min: 2, p_team_max: 4, p_prices: { team: '9900' }, p_reason: 'verifier decision record' }, 'aal2');
  await ok('publish event with official rules', admin, 'ff_admin_publish_event', { p_event_slug: 'ipl-auction', p_public_description: 'Live cricket auction', p_rules_text: RULES }, 'aal2');
  await fails('published terms are frozen', 'FF409', admin, 'ff_admin_configure_event',
    { p_event_slug: 'ipl-auction', p_capacity: 99, p_team_min: 2, p_team_max: 4, p_prices: {}, p_reason: 'x' }, 'aal2');
  await ok('open registration', admin, 'ff_admin_set_registration', { p_event_slug: 'ipl-auction', p_enabled: true }, 'aal2');
  const cat2 = await call(null, 'ff_public_catalogue', {});
  const ipl = cat2.find(e => e.slug === 'ipl-auction');
  if (!ipl.registration_open || ipl.modes[0].amount_paise !== 9900 || !ipl.modes[0].enabled) throw new Error('published catalogue mismatch');
  pass('published catalogue shows open registration and approved fee');

  // --- Team registration, invitations, declaration, capacity ---
  const key = 'idem-' + randomUUID();
  const reg1 = await ok('captain starts a team registration', student, 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'Bid Masters', p_mode: 'team', p_idempotency_key: key });
  const replay = await call(student, 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'Bid Masters', p_mode: 'team', p_idempotency_key: key });
  if (replay.registration_id !== reg1.registration_id || !replay.replayed) throw new Error('idempotent replay failed');
  pass('same idempotency key replays the original result');
  await fails('same key with a different payload conflicts', 'FF409', student, 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'Other', p_mode: 'team', p_idempotency_key: key });
  await fails('one entry per person per event', 'FF409', student, 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'Dup', p_mode: 'team' });
  await fails('individual entries need an allocation policy', '22023', await newUser('solo'), 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'Solo', p_mode: 'individual' });

  const s2 = await newUser('s2');
  const intruder = await newUser('intruder');
  await fails('only the captain can invite', '42501', s2, 'ff_invite_member', { p_registration_id: reg1.registration_id, p_email: 'x@example.test' });
  const inv = await ok('captain invites a member', student, 'ff_invite_member', { p_registration_id: reg1.registration_id, p_email: 'S2@example.test' });
  if (!/^[0-9a-f]{64}$/.test(inv.token)) throw new Error('invite token format');
  const stored = (await db.query('select token_hash from app.team_invitations where id = $1', [inv.invitation_id])).rows[0].token_hash;
  if (stored === inv.token) throw new Error('plaintext token stored');
  pass('only the token hash is stored');
  await fails('duplicate pending invite rejected', 'FF409', student, 'ff_invite_member', { p_registration_id: reg1.registration_id, p_email: 's2@example.test' });
  await fails('invitation bound to recipient email', '42501', intruder, 'ff_accept_invitation', { p_token: inv.token });
  const preview = await ok('recipient previews invitation', s2, 'ff_invitation_preview', { p_token: inv.token });
  if (!preview.for_this_account || preview.team_name !== 'Bid Masters') throw new Error('preview mismatch');
  await ok('recipient accepts invitation', s2, 'ff_accept_invitation', { p_token: inv.token });
  await fails('invitation is single use', 'FF409', s2, 'ff_accept_invitation', { p_token: inv.token });
  await fails('reserve requires the declaration', 'FF409', student, 'ff_reserve_entry', { p_registration_id: reg1.registration_id });
  await fails('members cannot accept the team declaration', '42501', s2, 'ff_accept_declaration', { p_registration_id: reg1.registration_id });
  const decl = await ok('captain accepts declaration bound to rules hash', student, 'ff_accept_declaration', { p_registration_id: reg1.registration_id });
  const expectHash = require('node:crypto').createHash('sha256').update(RULES, 'utf8').digest('hex');
  if (decl.declaration_hash !== expectHash) throw new Error('declaration hash mismatch');
  pass('declaration hash equals SHA-256 of the published rules');
  const detail = await ok('member reads registration detail', s2, 'ff_registration_detail', { p_registration_id: reg1.registration_id });
  if (detail.members.length !== 2 || detail.invitations.length !== 0) throw new Error('members must not see invitations; expected 2 members');
  await fails('non-members cannot read a registration', 'P0002', intruder, 'ff_registration_detail', { p_registration_id: reg1.registration_id });
  const res1 = await ok('captain reserves a place', student, 'ff_reserve_entry', { p_registration_id: reg1.registration_id, p_idempotency_key: 'reserve-' + randomUUID() });
  if (res1.registration_state !== 'payment_due') throw new Error('state after reserve');

  async function fullTeam(label) {
    const cap = await newUser(label + 'a'); const mate = await newUser(label + 'b');
    const r = await call(cap, 'ff_start_registration', { p_event_slug: 'ipl-auction', p_team_name: 'Team ' + label, p_mode: 'team' });
    const t = await call(cap, 'ff_invite_member', { p_registration_id: r.registration_id, p_email: mate.email });
    await call(mate, 'ff_accept_invitation', { p_token: t.token });
    await call(cap, 'ff_accept_declaration', { p_registration_id: r.registration_id });
    return { cap, reg: r };
  }
  const t2 = await fullTeam('t2');
  await ok('second team reserves the last place', t2.cap, 'ff_reserve_entry', { p_registration_id: t2.reg.registration_id });
  const t3 = await fullTeam('t3');
  await fails('capacity is enforced (third team rejected)', '23514', t3.cap, 'ff_reserve_entry', { p_registration_id: t3.reg.registration_id });

  // --- BGMI roster ---
  await ok('publish BGMI with official rules', admin, 'ff_admin_publish_event', { p_event_slug: 'bgmi', p_public_description: 'Kalinga BGMI Clash', p_rules_text: 'Organizer-provided devices only. Four starters and one substitute. Referee decisions are final. (verifier text)' }, 'aal2');
  await ok('open BGMI registration', admin, 'ff_admin_set_registration', { p_event_slug: 'bgmi', p_enabled: true }, 'aal2');
  const squad = [];
  for (let i = 0; i < 5; i++) squad.push(await newUser('bg' + i));
  const bgReg = await call(squad[0], 'ff_start_registration', { p_event_slug: 'bgmi', p_team_name: 'Kalinga Warriors', p_mode: 'team' });
  for (let i = 1; i < 5; i++) {
    const t = await call(squad[0], 'ff_invite_member', { p_registration_id: bgReg.registration_id, p_email: squad[i].email });
    await call(squad[i], 'ff_accept_invitation', { p_token: t.token });
  }
  await fails('team size cap enforced on invites', 'FF409', squad[0], 'ff_invite_member', { p_registration_id: bgReg.registration_id, p_email: 'sixth@example.test' });
  const starters = squad.slice(0, 4).map((u, i) => ({ profile_id: u.id, ign: 'IGN' + i, player_uid: '00' + (12345670 + i), is_igl: i === 0 }));
  const sub = { profile_id: squad[4].id, ign: 'SubIGN', player_uid: '0099999999' };
  await fails('roster players must be accepted members', '22023', squad[0], 'ff_submit_roster',
    { p_registration_id: bgReg.registration_id, p_starters: [...starters.slice(0, 3), { profile_id: intruder.id, ign: 'X', player_uid: '1', is_igl: false }], p_substitute: null });
  await fails('roster needs exactly one IGL', '23514', squad[0], 'ff_submit_roster',
    { p_registration_id: bgReg.registration_id, p_starters: starters.map(s => ({ ...s, is_igl: false })), p_substitute: sub });
  await ok('captain submits BGMI roster', squad[0], 'ff_submit_roster', { p_registration_id: bgReg.registration_id, p_starters: starters, p_substitute: sub, p_idempotency_key: 'roster-' + randomUUID() });
  const uidRow = (await db.query("select player_uid from app.esports_roster_members where ign = 'IGN0' and active")).rows[0];
  if (uidRow.player_uid !== '0012345670') throw new Error('leading zeros lost');
  pass('player UID leading zeros preserved');
  await call(squad[0], 'ff_accept_declaration', { p_registration_id: bgReg.registration_id });
  await fails('BGMI reserve blocked while fee unconfirmed', 'FF409', squad[0], 'ff_reserve_entry', { p_registration_id: bgReg.registration_id });

  // --- Scoped staff roles ---
  const ref1 = await newUser('ref1'); const ref2 = await newUser('ref2'); const efAdmin = await newUser('efadmin');
  await fails('cannot grant a role to yourself', '42501', admin, 'ff_admin_grant_role', { p_email: admin.email, p_role: 'referee', p_event_slug: 'bgmi', p_days: 5, p_reason: 'x' }, 'aal2');
  await ok('grant referee 1', admin, 'ff_admin_grant_role', { p_email: ref1.email, p_role: 'referee', p_event_slug: 'bgmi', p_days: 30, p_reason: 'LAN duty' }, 'aal2');
  await ok('grant referee 2', admin, 'ff_admin_grant_role', { p_email: ref2.email, p_role: 'referee', p_event_slug: 'bgmi', p_days: 30, p_reason: 'LAN duty' }, 'aal2');
  await ok('grant E-Fest event admin', admin, 'ff_admin_grant_role', { p_email: efAdmin.email, p_role: 'event_admin', p_event_slug: 'ipl-auction', p_days: 30, p_reason: 'E-Fest lead' }, 'aal2');
  await fails('event admin cannot grant event_admin', '42501', efAdmin, 'ff_admin_grant_role', { p_email: ref1.email, p_role: 'event_admin', p_event_slug: 'ipl-auction', p_days: 5, p_reason: 'x' }, 'aal2');
  await fails('event admin is scoped to own event', '42501', efAdmin, 'ff_admin_set_registration', { p_event_slug: 'bgmi', p_enabled: false }, 'aal2');
  await fails('referee is scoped to own event', '42501', ref1, 'ff_staff_context', { p_event_slug: 'ipl-auction' }, 'aal2');

  const session = await ok('create LAN session', admin, 'ff_admin_create_session',
    { p_event_slug: 'bgmi', p_label: 'Day 1', p_starts_at: new Date(Date.now() - 3600e3).toISOString(), p_ends_at: new Date(Date.now() + 3600e3).toISOString() }, 'aal2');
  const station = await ok('create station', admin, 'ff_admin_create_station', { p_event_slug: 'bgmi', p_name: 'PC-01', p_kind: 'checkpoint' }, 'aal2');
  const match = await ok('create match', admin, 'ff_admin_create_match', { p_event_slug: 'bgmi', p_round_label: 'Qualifier', p_match_number: 1, p_session_id: session.session_id }, 'aal2');
  await fails('hardware sign-off needs MFA', 'FFMFA', ref1, 'ff_staff_signoff_hardware', { p_station_id: station.station_id, p_session_id: session.session_id, p_asset_code: 'A1', p_config_version: 'c1', p_result: 'passed', p_reason: null }, 'aal1');
  await fails('students cannot sign off hardware', '42501', student, 'ff_staff_signoff_hardware', { p_station_id: station.station_id, p_session_id: session.session_id, p_asset_code: 'A1', p_config_version: 'c1', p_result: 'passed', p_reason: null }, 'aal2');
  const hw = await ok('referee signs off hardware', ref1, 'ff_staff_signoff_hardware', { p_station_id: station.station_id, p_session_id: session.session_id, p_asset_code: 'SRU-PC-01', p_config_version: 'cfg-2026-11', p_result: 'passed', p_reason: null }, 'aal2');
  const inspector = (await db.query('select inspector_id from app.station_hardware_checks where id = $1', [hw.check_id])).rows[0].inspector_id;
  if (inspector !== ref1.id) throw new Error('inspector must be the authenticated actor');
  pass('sign-off records the authenticated referee, not a request field');
  await fails('failed check requires a reason', '22023', ref1, 'ff_staff_signoff_hardware', { p_station_id: station.station_id, p_session_id: session.session_id, p_asset_code: 'A1', p_config_version: 'c1', p_result: 'failed', p_reason: '' }, 'aal2');
  await ok('referee logs a pause decision', ref1, 'ff_staff_log_incident', { p_match_id: match.match_id, p_entry_id: bgReg.entry_id, p_request_type: 'pause', p_decision: 'granted', p_reason: 'Controller disconnect', p_duration_seconds: 90, p_penalty_points: null }, 'aal2');

  const ctx = await ok('referee loads event context', ref1, 'ff_staff_context', { p_event_slug: 'bgmi' }, 'aal2');
  const roster = ctx.entries.find(e => e.id === bgReg.entry_id).roster;
  const starter = roster.find(m => m.slot_type === 'starter'); const subm = roster.find(m => m.slot_type === 'substitute');
  await ok('referee activates substitute', ref1, 'ff_staff_activate_substitute', { p_match_id: match.match_id, p_entry_id: bgReg.entry_id, p_starter_member_id: starter.member_id, p_substitute_member_id: subm.member_id, p_reason: 'Medical' }, 'aal2');
  await ok('referee verifies identity in person', ref1, 'ff_staff_verify_identity', { p_event_slug: 'bgmi', p_profile_id: squad[1].id, p_proof_type: 'college_id', p_method: 'in_person', p_status: 'verified' }, 'aal2');
  await fails('upload verification blocked until storage exists', 'FF409', ref1, 'ff_staff_verify_identity', { p_event_slug: 'bgmi', p_profile_id: squad[1].id, p_proof_type: 'pan', p_method: 'upload', p_status: 'verified' }, 'aal2');

  const results = [{ entry_id: bgReg.entry_id, placement: 1, kills: 7 }];
  await fails('results blocked until scoring approved', 'FF409', ref1, 'ff_staff_record_result', { p_match_id: match.match_id, p_results: results }, 'aal2');
  const sv = ctx.scoring_versions[0];
  await fails('incomplete scoring cannot be approved', '23514', admin, 'ff_admin_approve_scoring', { p_scoring_version_id: sv.id }, 'aal2');
  await ok('admin records organizer scoring decisions', admin, 'ff_admin_update_scoring', { p_scoring_version_id: sv.id, p_kill_multiplier: 1, p_tie_break_policy: 'Verifier policy text' }, 'aal2');
  await ok('admin approves complete scoring', admin, 'ff_admin_approve_scoring', { p_scoring_version_id: sv.id }, 'aal2');
  const rec = await ok('referee records a match result', ref1, 'ff_staff_record_result', { p_match_id: match.match_id, p_results: results }, 'aal2');
  if (rec.results[0].total_points !== 17) throw new Error('expected 10 placement + 7 kills = 17, got ' + rec.results[0].total_points);
  pass('server computes 10 placement + 7 kill points = 17');
  const rec2 = await ok('re-recording creates revision 2', ref1, 'ff_staff_record_result', { p_match_id: match.match_id, p_results: results }, 'aal2');
  if (rec2.revision !== 2) throw new Error('revision numbering');
  await fails('recorder cannot review own result', '42501', ref1, 'ff_staff_review_result', { p_revision_id: rec2.revision_id }, 'aal2');
  await fails('superseded revision cannot be reviewed', 'FF409', ref2, 'ff_staff_review_result', { p_revision_id: rec.revision_id }, 'aal2');
  await ok('second referee reviews result', ref2, 'ff_staff_review_result', { p_revision_id: rec2.revision_id }, 'aal2');

  // --- Volunteer duty boundary ---
  await fails('scan requires an active duty', '42501', ref1, 'ff_staff_scan_pass', { p_token_hash: 'a'.repeat(64), p_session_id: session.session_id, p_station_id: station.station_id }, 'aal2');
  await ok('assign referee duty at station', admin, 'ff_admin_assign_duty', { p_email: ref1.email, p_session_id: session.session_id, p_station_id: station.station_id }, 'aal2');
  await fails('referee role cannot scan passes', '42501', ref1, 'ff_staff_scan_pass', { p_token_hash: 'a'.repeat(64), p_session_id: session.session_id, p_station_id: station.station_id }, 'aal2');

  // --- Judging ---
  const judge = await newUser('judge');
  const rubric = await ok('event admin creates rubric', efAdmin, 'ff_admin_create_rubric', { p_event_slug: 'ipl-auction', p_name: 'Auction strategy', p_criteria: [{ label: 'Strategy', max_marks: 10 }, { label: 'Budget', max_marks: 5 }] }, 'aal2');
  await ok('event admin grants judge', efAdmin, 'ff_admin_grant_role', { p_email: judge.email, p_role: 'judge', p_event_slug: 'ipl-auction', p_days: 10, p_reason: 'Jury' }, 'aal2');
  await fails('participants cannot be assigned as judge', 'FF409', efAdmin, 'ff_admin_assign_judge', { p_email: student.email, p_entry_id: reg1.entry_id, p_rubric_id: rubric.rubric_id }, 'aal2');
  await ok('assign judge to entry', efAdmin, 'ff_admin_assign_judge', { p_email: judge.email, p_entry_id: reg1.entry_id, p_rubric_id: rubric.rubric_id }, 'aal2');
  const asg = (await call(judge, 'ff_judge_assignments', {}))[0];
  const [c1, c2] = asg.criteria;
  await fails('marks above criterion maximum rejected', '23514', judge, 'ff_judge_save_scorecard', { p_assignment_id: asg.assignment_id, p_marks: { [c1.id]: '11' }, p_lock: false }, 'aal2');
  await ok('judge saves draft marks', judge, 'ff_judge_save_scorecard', { p_assignment_id: asg.assignment_id, p_marks: { [c1.id]: '8' }, p_lock: false }, 'aal2');
  await fails('lock requires every criterion', '22023', judge, 'ff_judge_save_scorecard', { p_assignment_id: asg.assignment_id, p_marks: {}, p_lock: true }, 'aal2');
  await ok('judge locks complete scorecard', judge, 'ff_judge_save_scorecard', { p_assignment_id: asg.assignment_id, p_marks: { [c2.id]: '4' }, p_lock: true }, 'aal2');
  await fails('locked scorecard is immutable', 'FF409', judge, 'ff_judge_save_scorecard', { p_assignment_id: asg.assignment_id, p_marks: { [c2.id]: '5' }, p_lock: false }, 'aal2');

  // --- Revocation guard and audit ---
  const sa = (await db.query("select id from app.staff_assignments where role = 'super_admin'")).rows[0].id;
  await fails('last super admin cannot be revoked', 'FF409', admin, 'ff_admin_revoke_role', { p_assignment_id: sa, p_reason: 'test' }, 'aal2');
  const audit = (await db.query('select count(*)::int n, count(*) filter (where actor_id is null)::int anon from app.audit_log')).rows[0];
  if (audit.n < 20 || audit.anon > 0) throw new Error('audit coverage: ' + JSON.stringify(audit));
  pass(`audit trail recorded ${audit.n} actor-attributed commands`);

  const out = { status: 'PASS', engine: 'PGlite (disposable)', migrations: files, checks: checks.length, generated_at: new Date().toISOString(), results: checks };
  fs.writeFileSync(path.join(__dirname, 'command-layer-verification.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(JSON.stringify({ status: 'PASS', checks: checks.length }, null, 2));
}

main().catch(err => {
  console.error('FAIL:', err.message);
  console.error(JSON.stringify(checks.slice(-3), null, 2));
  process.exit(1);
});
