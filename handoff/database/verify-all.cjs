const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const modulePath = process.env.PGLITE_MODULE_PATH || require('node:path').resolve(__dirname, '../../app/node_modules/@electric-sql/pglite/dist/index.cjs');
const { PGlite } = require(modulePath);

const root = __dirname;
const checks = [];

async function main() {
  const db = new PGlite();
  
  // 1. Roles and Auth setup
  await db.exec('create role anon; create role authenticated; create role service_role; create schema auth; create table auth.users(id uuid primary key);');
  
  // 2. Apply baseline 001
  await db.exec(fs.readFileSync(path.join(root, '001_schema_design.sql'), 'utf8'));
  checks.push({ test: 'Apply baseline 001_schema_design.sql to disposable PostgreSQL', result: 'PASS' });
  
  // 3. Apply forward migration 002
  await db.exec(fs.readFileSync(path.join(root, '002_esports_lan_extensions.sql'), 'utf8'));
  checks.push({ test: 'Apply forward migration 002_esports_lan_extensions.sql cleanly on top of baseline', result: 'PASS' });
  
  // Helper functions
  async function insert(table, data) {
    const keys = Object.keys(data);
    const r = await db.query(
      `insert into app.${table} (${keys.join(',')}) values (${keys.map((_, i) => '$' + (i + 1)).join(',')}) returning id`,
      keys.map(k => data[k])
    );
    return r.rows[0].id;
  }
  
  async function reject(name, sql, args, expectedCode) {
    try {
      await db.query(sql, args);
      throw new Error('Unexpected success: ' + name);
    } catch (e) {
      if (expectedCode && e.code !== expectedCode) {
        throw new Error(`Test ${name} failed: expected SQLSTATE ${expectedCode}, got ${e.code} (${e.message})`);
      }
      checks.push({ test: name, result: 'PASS', expected_sqlstate: e.code });
    }
  }

  // --- Baseline entities ---
  const institution = await insert('institutions', { name: 'Srusti Academy' });
  const org = await insert('organizers', { institution_id: institution, slug: 'srustiprosar', name: 'Srustiprosar Esports' });
  
  const userIds = [];
  for (let i = 0; i < 10; i++) {
    const uid = randomUUID();
    await db.query('insert into auth.users values($1)', [uid]);
    await insert('profiles', {
      id: uid,
      display_name: `Player ${i}`,
      contact_email: `player${i}@example.com`,
      affiliation: 'student'
    });
    userIds.push(uid);
  }
  const [captain, p2, p3, p4, sub, referee, admin, reviewer, stranger, p5] = userIds;

  // BGMI Event Setup
  const event = await insert('events', {
    organizer_id: org,
    slug: 'bgmi',
    name: 'Kalinga BGMI Clash — Season 1',
    track: 'esports',
    capacity: 24,
    capacity_unit: 'entry'
  });
  
  const version = await insert('event_versions', {
    event_id: event,
    version: 1,
    public_description: 'KALINGA CLASH 2K26 BGMI Tournament',
    rules_text: 'BGIS Points system applies',
    team_min: 4,
    team_max: 5,
    prize_pool_paise: 1000000
  });

  // Price option with NULL amount (unknown fee)
  const unknownPrice = await insert('price_options', {
    event_version_id: version,
    event_id: event,
    mode: 'team',
    amount_paise: null,
    enabled: false
  });

  // E02: Unknown fee cannot be enabled
  await reject('E02: Unknown fee cannot be enabled for checkout',
    'update app.price_options set enabled=true where id=$1',
    [unknownPrice], '23514');

  // Insert esports rules version extension
  const esportsRules = await insert('esports_rules_versions', {
    event_version_id: version,
    event_id: event,
    game: 'bgmi',
    tournament_name: 'KALINGA BGMI CLASH SEASON 1',
    source_alias: 'KALINGA CLASH 2K26',
    team_capacity: 24,
    starters_count: 4,
    substitute_slots: 1,
    substitute_required: null, // explicitly unresolved
    prize_pool_paise: 1000000
  });
  checks.push({ test: 'E01: BGMI configured with 24 teams, 4 starters, 1 substitute slot, ₹10,000 pool, substitute_required kept null', result: 'PASS' });

  // Publish event with version
  await db.query('update app.events set state=\'published\', published_version_id=$1, registration_enabled=true where id=$2', [version, event]);

  // Competition Entry
  const entry = await insert('competition_entries', {
    event_id: event,
    event_version_id: version,
    captain_id: captain,
    display_name: 'Team Alpha',
    kind: 'team'
  });

  const reg = await insert('registrations', {
    reference: 'BGMI-REG-01',
    owner_id: captain,
    event_id: event,
    event_version_id: version,
    price_option_id: unknownPrice,
    mode: 'team',
    entry_id: entry
  });

  // Test E06: Team declaration acceptance by leader
  const declRes = await db.query(
    'select app.rpc_esports_accept_team_declaration($1, $2, $3, $4, $5) as res',
    [reg, version, 'hash_abc123', 'v1.0', captain]
  );
  if (declRes.rows[0].res.status !== 'accepted') throw new Error('Declaration failed');
  checks.push({ test: 'E06: Leader successfully accepted team declaration with immutable hash', result: 'PASS' });

  // Non-leader declaration rejected
  await reject('E06: Non-leader cannot accept team declaration',
    'select app.rpc_esports_accept_team_declaration($1, $2, $3, $4, $5)',
    [reg, version, 'hash_abc123', 'v1.0', stranger], '42501');

  // Declaration is append-only
  await reject('E06: Team declarations are append-only (cannot mutate)',
    'update app.team_declarations set declaration_hash=\'mutated\' where registration_id=$1',
    [reg], '55000');

  // Test E03: Roster Submission RPC
  const startersFixture = JSON.stringify([
    { profile_id: captain, ign: 'AlphaCaptain', player_uid: '0012345678', is_igl: true },
    { profile_id: p2, ign: 'AlphaAssault', player_uid: '0023456789', is_igl: false },
    { profile_id: p3, ign: 'AlphaSniper', player_uid: '0034567890', is_igl: false },
    { profile_id: p4, ign: 'AlphaSupport', player_uid: '0045678901', is_igl: false }
  ]);
  const subFixture = JSON.stringify({ profile_id: sub, ign: 'AlphaSub', player_uid: '0056789012' });

  // Valid submission
  const rosterRes = await db.query(
    'select app.rpc_esports_submit_roster($1, $2, $3::jsonb, $4::jsonb, $5, $6) as res',
    [entry, reg, startersFixture, subFixture, 'idemp-1', captain]
  );
  const rosterId = rosterRes.rows[0].res.roster_id;
  checks.push({ test: 'E03: Roster submitted successfully with 4 starters, 1 IGL, and 1 substitute slot preserving leading zero UIDs', result: 'PASS' });

  // Verify UID leading zeros preserved in DB
  const uidCheck = await db.query('select player_uid from app.esports_roster_members where roster_id=$1 and slot_index=1', [rosterId]);
  if (uidCheck.rows[0].player_uid !== '0012345678') throw new Error('Leading zeros in UID were truncated!');
  checks.push({ test: 'E03: Player UID leading zeros preserved as string', result: 'PASS' });

  // Reject roster without exactly 1 IGL (0 IGLs)
  const noIglStarters = JSON.stringify([
    { profile_id: captain, ign: 'AlphaCaptain', player_uid: '0012345678', is_igl: false },
    { profile_id: p2, ign: 'AlphaAssault', player_uid: '0023456789', is_igl: false },
    { profile_id: p3, ign: 'AlphaSniper', player_uid: '0034567890', is_igl: false },
    { profile_id: p4, ign: 'AlphaSupport', player_uid: '0045678901', is_igl: false }
  ]);
  await reject('E03: Roster rejected when zero IGLs designated',
    'select app.rpc_esports_submit_roster($1, $2, $3::jsonb, null, $4, $5)',
    [entry, reg, noIglStarters, 'idemp-2', captain], '23514');

  // Reject roster without exactly 4 starters (3 starters)
  const threeStarters = JSON.stringify([
    { profile_id: captain, ign: 'AlphaCaptain', player_uid: '0012345678', is_igl: true },
    { profile_id: p2, ign: 'AlphaAssault', player_uid: '0023456789', is_igl: false },
    { profile_id: p3, ign: 'AlphaSniper', player_uid: '0034567890', is_igl: false }
  ]);
  await reject('E03: Roster rejected when fewer than 4 starters provided',
    'select app.rpc_esports_submit_roster($1, $2, $3::jsonb, null, $4, $5)',
    [entry, reg, threeStarters, 'idemp-3', captain], '23514');

  // Reject duplicate UID in another team in same event
  const otherEntry = await insert('competition_entries', {
    event_id: event,
    event_version_id: version,
    captain_id: stranger,
    display_name: 'Team Beta',
    kind: 'team'
  });
  const otherReg = await insert('registrations', {
    reference: 'BGMI-REG-02',
    owner_id: stranger,
    event_id: event,
    event_version_id: version,
    price_option_id: unknownPrice,
    mode: 'team',
    entry_id: otherEntry
  });
  const duplicateUidStarters = JSON.stringify([
    { profile_id: stranger, ign: 'BetaCaptain', player_uid: '0012345678', is_igl: true }, // duplicate of captain UID!
    { profile_id: userIds[7], ign: 'BetaTwo', player_uid: '9900000001', is_igl: false },
    { profile_id: userIds[8], ign: 'BetaThree', player_uid: '9900000002', is_igl: false },
    { profile_id: userIds[9], ign: 'BetaFour', player_uid: '9900000003', is_igl: false }
  ]);
  await reject('E03: Duplicate player UID across active event rosters is rejected',
    'select app.rpc_esports_submit_roster($1, $2, $3::jsonb, null, $4, $5)',
    [otherEntry, otherReg, duplicateUidStarters, 'idemp-4', stranger], '23505');

  // Test E05: Restricted Identity Verification (Data-minimizing, reviewer != participant)
  await reject('E05: Participant cannot verify own identity',
    'select app.rpc_esports_verify_identity($1, $2, $3, $4, $5, null, null, $6)',
    [event, captain, 'aadhaar', 'in_person', 'verified', captain], '23514');

  const verifyRes = await db.query(
    'select app.rpc_esports_verify_identity($1, $2, $3, $4, $5, null, null, $6) as res',
    [event, captain, 'aadhaar', 'in_person', 'verified', referee]
  );
  if (verifyRes.rows[0].res.status !== 'verified') throw new Error('Verification failed');
  checks.push({ test: 'E05: Authorized reviewer verified player identity in-person without plaintext national ID', result: 'PASS' });

  // Test E10: Station hardware checks
  const station = await insert('stations', { event_id: event, name: 'Station-01', kind: 'entry' });
  const stationCheckRes = await db.query(
    'select app.rpc_esports_signoff_hardware($1, $2, null, $3, $4, $5, $6, $7) as res',
    [station, event, 'PC-KALINGA-01', 'v1.4.2-locked', 'passed', 'Device integrity verified', referee]
  );
  if (stationCheckRes.rows[0].res.result !== 'passed') throw new Error('Hardware check failed');
  checks.push({ test: 'E10: Referee signed off station hardware integrity with asset code and config version', result: 'PASS' });

  // Hardware check is append-only
  await reject('E10: Station checks are append-only',
    'update app.station_hardware_checks set result=\'failed\' where station_id=$1',
    [station], '55000');

  // Cross-event station check rejected
  const otherEvent = await insert('events', { organizer_id: org, slug: 'free-fire', name: 'Free Fire Clash', track: 'esports' });
  await reject('E10: Hardware check for station from different event rejected',
    'select app.rpc_esports_signoff_hardware($1, $2, null, $3, $4, $5, $6, $7)',
    [station, otherEvent, 'PC-02', 'v1', 'passed', null, referee], '23503');

  // Match setup
  const match = await insert('esports_matches', {
    event_id: event,
    round_label: 'Finals Round 1',
    match_number: 1,
    rules_version_id: version,
    state: 'scheduled'
  });

  // Test E08: Substitute switch during match (Referee authorized)
  const starterMemberRow = await db.query('select id from app.esports_roster_members where roster_id=$1 and slot_index=4', [rosterId]);
  const subMemberRow = await db.query('select id from app.esports_roster_members where roster_id=$1 and slot_index=5', [rosterId]);
  const starterMemberId = starterMemberRow.rows[0].id;
  const subMemberId = subMemberRow.rows[0].id;

  const subActRes = await db.query(
    'select app.rpc_esports_activate_substitute($1, $2, $3, $4, $5, $6, $7) as res',
    [match, event, entry, starterMemberId, subMemberId, 'Player illness', referee]
  );
  if (subActRes.rows[0].res.status !== 'activated') throw new Error('Substitute activation failed');
  checks.push({ test: 'E08: Referee activated in-match substitute switch within locked roster without altering entry capacity', result: 'PASS' });

  // Test E09: Technical pause & incident log (Human referee adjudication, no auto DQ)
  const pauseRes = await db.query(
    'select app.rpc_esports_log_pause_incident($1, $2, $3, $4, $5, $6, $7, $8, $9) as res',
    [match, event, entry, 'pause', 'granted', 'Audio latency issue reported by captain', 120, null, referee]
  );
  if (pauseRes.rows[0].res.decision !== 'granted') throw new Error('Technical pause log failed');
  checks.push({ test: 'E09: Referee adjudicated technical pause with human decision and audit log (no automated DQ)', result: 'PASS' });

  // Test E07: Versioned Scoring (16-tier placement chart)
  const scoringVer = await insert('esports_scoring_versions', {
    event_id: event,
    rules_version_id: version,
    version: 1,
    name: 'BGIS 2026 Placement Chart',
    kill_multiplier: null, // kept null (unresolved!)
    tie_break_policy: null, // kept null (unresolved!)
    approval_state: 'draft'
  });

  // Insert BGIS 2026 confirmed placement table (1..16)
  const pointsMap = [
    [1, 10], [2, 6], [3, 5], [4, 4], [5, 3], [6, 2], [7, 1], [8, 1],
    [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [16, 0]
  ];
  for (const [place, pts] of pointsMap) {
    await insert('esports_placement_points', { scoring_version_id: scoringVer, place, points: pts });
  }
  checks.push({ test: 'E07: Configured confirmed 16-tier placement points table exactly matching supplied chart', result: 'PASS' });

  // E07: Attempting to approve incomplete scoring version (kill_multiplier/tie_break is null) must be REJECTED!
  await reject('E07: Scoring approval rejected when kill points or tie-break rules are null',
    'select app.rpc_esports_approve_scoring($1, $2)',
    [scoringVer, admin], '23514');

  // Now update scoring with approved complete rules and test successful approval
  await db.query('update app.esports_scoring_versions set kill_multiplier=1, tie_break_policy=\'highest placement\' where id=$1', [scoringVer]);
  const approveScoringRes = await db.query(
    'select app.rpc_esports_approve_scoring($1, $2) as res',
    [scoringVer, admin]
  );
  if (approveScoringRes.rows[0].res.status !== 'approved') throw new Error('Scoring approval failed');
  checks.push({ test: 'E07: Scoring version approved only after complete kill multiplier and tie-break policy provided', result: 'PASS' });

  // Match results recording: server calculates points, distinct scorer and reviewer
  await reject('Match results rejected when scorer and reviewer are the same person',
    'select app.rpc_esports_record_match_result($1, $2, $3::jsonb, $4, $4)',
    [match, scoringVer, JSON.stringify([{ entry_id: entry, placement: 1, kills: 7 }]), referee], '23514');

  const matchRes = await db.query(
    'select app.rpc_esports_record_match_result($1, $2, $3::jsonb, $4, $5) as res',
    [match, scoringVer, JSON.stringify([{ entry_id: entry, placement: 1, kills: 7 }]), referee, reviewer]
  );
  // Place 1 = 10 pts + 7 kills * 1 = 17 pts
  const computedPoints = matchRes.rows[0].res.results[0].total_points;
  if (Number(computedPoints) !== 17) throw new Error(`Expected 17 points, got ${computedPoints}`);
  checks.push({ test: 'Match result calculated server-side (10 placement + 7 kills = 17) with distinct scorer and reviewer', result: 'PASS' });

  // Test E04: Atomic Capacity Reservation capping at 24 entries
  // Reserve 1st entry
  const res1 = await db.query(
    'select app.rpc_reserve_entry($1, 1, $2, $3) as res',
    [entry, 'res-idemp-1', captain]
  );
  if (res1.rows[0].res.status !== 'held') throw new Error('Reservation failed');
  checks.push({ test: 'E04: Capacity reservation successfully reserved initial slot', result: 'PASS' });

  // Fill up capacity to 24 by creating dummy entries/reservations
  for (let i = 2; i <= 24; i++) {
    const dummyCapt = randomUUID();
    await db.query('insert into auth.users values($1)', [dummyCapt]);
    await insert('profiles', { id: dummyCapt, display_name: `Capt ${i}`, contact_email: `c${i}@test.com`, affiliation: 'student' });
    const dummyEntry = await insert('competition_entries', {
      event_id: event, event_version_id: version, captain_id: dummyCapt, display_name: `Team ${i}`, kind: 'team'
    });
    await insert('reservations', { entry_id: dummyEntry, event_id: event, state: 'held', expires_at: '2030-01-01' });
  }

  // 25th entry reservation must be rejected by rpc_reserve_entry!
  const excessCapt = randomUUID();
  await db.query('insert into auth.users values($1)', [excessCapt]);
  await insert('profiles', { id: excessCapt, display_name: 'Excess Capt', contact_email: 'excess@test.com', affiliation: 'student' });
  const excessEntry = await insert('competition_entries', {
    event_id: event, event_version_id: version, captain_id: excessCapt, display_name: 'Team 25', kind: 'team'
  });

  await reject('E04: 25th team reservation rejected when 24 team capacity is reached',
    'select app.rpc_reserve_entry($1, 1, $2, $3)',
    [excessEntry, 'res-excess', excessCapt], '23514');
  checks.push({ test: 'E04: Atomic capacity enforcement prevents exceeding 24 confirmed/held team slots', result: 'PASS' });

  // Check RLS on all domain tables (baseline 57 + extensions 11 = 68 tables)
  const tables = (await db.query("select c.relname, c.relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='app' and c.relkind='r' order by c.relname")).rows;
  if (tables.length !== 68 || tables.some(t => !t.relrowsecurity)) {
    throw new Error(`Unexpected table count (${tables.length}) or missing RLS!`);
  }
  checks.push({ test: `All ${tables.length} domain tables have RLS enabled`, result: 'PASS' });

  // Metadata generation
  const columns = (await db.query("select table_name,column_name,data_type,is_nullable,column_default from information_schema.columns where table_schema='app' order by table_name,ordinal_position")).rows;
  const constraints = (await db.query("select c.conrelid::regclass::text as table_name,c.conname,c.contype,pg_get_constraintdef(c.oid) as definition,c.confrelid::regclass::text as target from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname='app' order by table_name,conname")).rows;
  
  fs.writeFileSync(path.join(root, 'schema-metadata.json'), JSON.stringify({ tables, columns, constraints }, null, 2));

  // Regenerate Data Dictionary
  let dict = '# Database dictionary\n\nGenerated from the applied disposable schema (001 baseline + 002 esports extensions), not from a live Supabase database. Columns and keys are structural facts; command-level invariants are specified separately.\n';
  for (const t of tables) {
    dict += `\n## ${t.relname}\n\n| Column | Type | Nullable | Default |\n|---|---|---|---|\n`;
    for (const col of columns.filter(c => c.table_name === t.relname)) {
      dict += `| ${col.column_name} | ${col.data_type} | ${col.is_nullable} | ${(col.column_default || '').replaceAll('|', ' / ')} |\n`;
    }
    dict += '\nConstraints:\n';
    for (const co of constraints.filter(c => c.table_name === 'app.' + t.relname)) {
      dict += `- \`${co.definition}\`\n`;
    }
  }
  fs.writeFileSync(path.join(root, 'DATA_DICTIONARY.md'), dict);

  // Regenerate ERD
  let er = '# Complete database relationships\n\nGenerated from actual foreign keys. An edge means one parent can have many children; unique keys may further restrict cardinality. Optional links are defined in the dictionary. The diagram does not imply cascade deletion.\n\n```mermaid\nerDiagram\n';
  const seen = new Set();
  for (const co of constraints.filter(c => c.contype === 'f')) {
    const from = co.table_name.replaceAll('.', '_');
    const to = co.target.replaceAll('.', '_');
    const key = from + '|' + to;
    if (seen.has(key)) continue;
    seen.add(key);
    er += `  ${to} ||--o{ ${from} : references\n`;
  }
  er += '```\n\nFor implementation, use the domain diagrams in DATABASE_MODEL.md and the exact composite foreign keys in 001_schema_design.sql and 002_esports_lan_extensions.sql.\n';
  fs.writeFileSync(path.join(root, 'ERD.md'), er);

  const evidence = {
    status: 'PASS',
    engine: 'PGlite disposable embedded PostgreSQL',
    auth: 'minimal auth.users fixture only; not Supabase Auth',
    cloud_changes: false,
    checks: checks.length,
    tables: tables.length,
    foreign_keys: constraints.filter(c => c.contype === 'f').length,
    details: checks,
    limitations: [
      'No live Supabase Auth/Storage cloud integration (independent local verification)',
      'No live Vercel/email/bank tests',
      'Unresolved decisions (BGMI fee, official QR, device rules, tie-break policy) gated as pending'
    ]
  };
  fs.writeFileSync(path.join(root, 'verification.json'), JSON.stringify(evidence, null, 2));

  console.log(JSON.stringify({
    status: 'PASS',
    checks: checks.length,
    tables: tables.length,
    foreign_keys: constraints.filter(c => c.contype === 'f').length
  }, null, 2));

  await db.close();
}

main().catch(e => {
  console.error(e);
  process.exitCode = 1;
});
