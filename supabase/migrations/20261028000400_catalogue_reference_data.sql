-- FIRE & FLAMES migration 004: catalogue reference data.
-- Source: planning/data/event-catalogue.json and handoff/ESPORTS_CLIENT_UPDATE.md.
-- Every event starts as a DRAFT with registration disabled. Unknown fees, capacities,
-- rules and scoring values stay NULL until an organizer records them in the admin console.
-- Idempotent: safe to re-run; it never overwrites values an organizer has changed.

begin;

insert into app.institutions(name, timezone)
select 'Srusti Academy of Management & Technology (Autonomous), Bhubaneswar', 'Asia/Kolkata'
where not exists (select 1 from app.institutions);

insert into app.organizers(institution_id, slug, name)
select i.id, o.slug, o.name from app.institutions i,
  (values ('ed-cell', 'ED Cell'), ('srustiprosar', 'Srustiprosar')) as o(slug, name)
on conflict (slug) do nothing;

with src(slug, name, organizer, track, capacity, capacity_unit, pool_team_count, team_min, team_max, prize_pool_paise, description) as (values
  ('ipl-auction',       'IPL Auction',                       'ed-cell',      'e-fest',  null::int, 'entry', 8,         2,         4,         800000::bigint, 'Build a cricket franchise through a live auction. Balance your bids, shape your squad and explain your strategy.'),
  ('e-trivia',          'e-Trivia',                          'ed-cell',      'e-fest',  null,      'entry', null,      2,         4,         450000,  'Test your knowledge of entrepreneurship and business in a team quiz.'),
  ('treasure-hunt',     'Treasure Hunt',                     'ed-cell',      'e-fest',  null,      'entry', null,      2,         4,         700000,  'Follow clues and solve challenges together. The first teams to complete the hunt compete for the top prizes.'),
  ('brand-war',         'Brand War',                         'ed-cell',      'e-fest',  null,      'entry', null,      2,         3,         450000,  'Put your branding skills to work in a team challenge. Develop your pitch, present your ideas and answer the jury''s questions.'),
  ('srusti-bazar',      'Srusti Bazar',                      'ed-cell',      'e-fest',  10,        'stall', null,      null,      null,      300000,  'Set up a student venture stall and bring your ideas to a campus audience.'),
  ('srusti-exhibition', 'Srusti Exhibition',                 'ed-cell',      'e-fest',  10,        'entry', null,      null,      null,      900000,  'Present your business idea or working prototype to the jury and share the problem it solves.'),
  ('bgmi',              'Kalinga BGMI Clash — Season 1',     'srustiprosar', 'esports', 24,        'entry', null,      4,         5,         1000000, 'Kalinga BGMI Clash brings 24 teams to campus. Final device instructions, match format and scoring rules will be announced before play.'),
  ('free-fire',         'Free Fire',                         'srustiprosar', 'esports', null,      'entry', null,      null,      null,      null,    'Free Fire details are awaiting organizer confirmation.')
), ins_events as (
  insert into app.events(organizer_id, slug, name, track, state, registration_enabled, capacity, capacity_unit, pool_team_count)
  select o.id, s.slug, s.name, s.track, 'draft', false, s.capacity, s.capacity_unit, s.pool_team_count
  from src s join app.organizers o on o.slug = s.organizer
  on conflict (slug) do nothing
  returning id, slug
)
insert into app.event_versions(event_id, version, public_description, rules_text, team_min, team_max, individual_policy, prize_pool_paise, approval_state)
select e.id, 1, s.description, 'Official rules are awaiting organizer approval.', s.team_min, s.team_max, 'disabled', s.prize_pool_paise, 'draft'
from ins_events e join src s on s.slug = e.slug;

-- Documented fees (paise). Esports fees are unconfirmed and stay NULL. Nothing is enabled until publication.
insert into app.price_options(event_version_id, event_id, mode, amount_paise, enabled)
select v.id, e.id, p.mode, p.amount_paise, false
from (values
  ('ipl-auction', 'team', 9900::bigint), ('e-trivia', 'team', 9900), ('treasure-hunt', 'team', 9900), ('brand-war', 'team', 9900),
  ('srusti-bazar', 'stall', 29900), ('srusti-exhibition', 'entry', 19900),
  ('bgmi', 'team', null), ('free-fire', 'team', null)
) as p(slug, mode, amount_paise)
join app.events e on e.slug = p.slug
join app.event_versions v on v.event_id = e.id and v.version = 1
on conflict (event_version_id, mode) do nothing;

-- BGMI roster and policy configuration (confirmed values; unresolved policies stay pending/NULL).
insert into app.esports_rules_versions(event_version_id, event_id, game, prize_pool_paise)
select v.id, e.id, 'bgmi', 1000000
from app.events e join app.event_versions v on v.event_id = e.id and v.version = 1
where e.slug = 'bgmi'
on conflict (event_version_id) do nothing;

-- BGIS 2026 placement chart from the supplied image (places 1–16). Kill points and tie-break stay NULL.
insert into app.esports_scoring_versions(event_id, rules_version_id, version, name, approval_state)
select e.id, v.id, 1, 'BGIS 2026 Points System', 'draft'
from app.events e join app.event_versions v on v.event_id = e.id and v.version = 1
where e.slug = 'bgmi'
on conflict (event_id, version) do nothing;

insert into app.esports_placement_points(scoring_version_id, place, points)
select sv.id, p.place, p.points
from app.esports_scoring_versions sv join app.events e on e.id = sv.event_id and e.slug = 'bgmi' and sv.version = 1,
  (values (1, 10), (2, 6), (3, 5), (4, 4), (5, 3), (6, 2), (7, 1), (8, 1),
          (9, 0), (10, 0), (11, 0), (12, 0), (13, 0), (14, 0), (15, 0), (16, 0)) as p(place, points)
on conflict (scoring_version_id, place) do nothing;

commit;
