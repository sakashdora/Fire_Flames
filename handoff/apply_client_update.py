"""Apply the documented October 27 written esports update once."""
from pathlib import Path
import json
import shutil

root = Path(__file__).resolve().parent.parent
def add(path, marker, text):
    p = root / path
    old = p.read_text(encoding='utf-8-sig')
    if text not in old:
        assert marker in old, path
        p.write_text(old.replace(marker, marker + '\n' + text, 1), encoding='utf-8')

notice = ('Read `handoff/ESPORTS_CLIENT_UPDATE.md` first. This latest written BGMI/LAN update supersedes older blanket unknowns: BGMI dates are 13–14 November 2026, capacity 24 teams, prize pool ₹10,000, four starters including one IGL and a substitute slot whose mandatory status remains unresolved. The exact partial placement chart, identity/declaration requirements and unresolved device/scoring conflicts are in that addendum. The voice note has NOT been transcribed; do not invent spoken requirements. Implement the specified database extensions through forward migrations and new tests; the existing 57-table baseline does not include them. Preserve the bgmi slug and confirm Kalinga branding versus the Kurukshetra umbrella before replacing hero branding.\n')
add('handoff/ANTIGRAVITY_PROMPT.md', '## Read before changing code\n', notice)
add('handoff/README.md', '## Read in this order\n', '0. `ESPORTS_CLIENT_UPDATE.md` — latest BGMI/LAN facts, chart transcription, unresolved conflicts and database delta. Audio contents remain unverified.\n')
add('handoff/database/README.md', '# Database foundation\n', 'Latest required extensions: `../ESPORTS_CLIENT_UPDATE.md`. These are specified, not implemented in this baseline or covered by its existing 29 checks.\n')
add('planning/docs/02-event-catalogue.md', '## Esports\n', '**Latest client update:** See `../../handoff/ESPORTS_CLIENT_UPDATE.md`. BGMI now has dates 13–14 November 2026, 24 teams, ₹10,000 pool, four starters/IGL and a substitute slot (mandatory status unresolved), leader contact and partial placement points. Fee and complete rules remain gated. The following original paragraph is historical context, not the current BGMI specification.\n')
add('planning/README.md', '## Start here\n', '- Latest technical and esports amendments: `../handoff/README.md` and `../handoff/ESPORTS_CLIENT_UPDATE.md`. The review PDFs remain v1 and must be read with these amendments.\n')
add('REFERENCE_NOTES.md', '# Fire & Flames reference notes\n', '\nLatest source addendum: `handoff/ESPORTS_CLIENT_UPDATE.md` records the October 27 written LAN/BGMI brief and scoring chart. Voice note untranscribed; no audio claims are confirmed.\n')
p = root / 'planning/data/event-catalogue.json'
data = json.loads(p.read_text(encoding='utf-8-sig'))
bgmi = next(x for x in data['events'] if x['slug'] == 'bgmi')
bgmi.update(name='Kalinga BGMI Clash — Season 1', display_name_status='provisional normalization of supplied heading', source_alias='KALINGA CLASH 2K26', dates=['2026-11-13','2026-11-14'], format='offline venue-based', capacity=24, capacity_unit='team', starters_required=4, substitute_slots=1, substitute_required=None, igl_required=1, leader_phone_only=True, query_phone='8260555312', prize_pool_paise=1000000, prize_distribution=None, team_min=None, team_max=5, source_status='latest written client brief; audio unverified', placement_points={str(k):v for k,v in enumerate([10,6,5,4,3,2,1,1,0,0,0,0,0,0,0,0],1)}, kill_points=None, tie_breaks=None, lobby_size=None, gates=['esports_fees','official_payment_profile','device_policy','substitute_policy','identity_verification_policy','approved_declaration','complete_match_and_scoring_rules','prize_distribution','published_schedule'])
data['latest_esports_source'] = 'handoff/ESPORTS_CLIENT_UPDATE.md'
data['esports_session_dates_note'] = 'BGMI dates supplied on event record; Free Fire/session timetable still unknown.'
p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
for name in ['CHANGELOG.md','FILES_CHANGED.md','TEST_EVIDENCE.md','NEXT_STEPS.md','CODEX_HANDOFF.md']:
    p = root / 'handoff/progress' / name
    text = '\n## 27 October — written esports update\n'
    body = {
      'CHANGELOG.md':'Added ESPORTS_CLIENT_UPDATE.md; updated catalogue, prompt and read-order pointers. Audio was not transcribed. Database extensions are specified only; no application/cloud changes.\n',
      'FILES_CHANGED.md':'Changed handoff/ESPORTS_CLIENT_UPDATE.md, ANTIGRAVITY_PROMPT.md, README.md, database/README.md, planning/README.md, planning/docs/02-event-catalogue.md, planning/data/event-catalogue.json, REFERENCE_NOTES.md and progress records. Added apply_client_update.py and sources/bgmi-points-reference.png. Originals and baseline SQL untouched.\n',
      'TEST_EVIDENCE.md':'Checked BGMI catalogue values and exact placement mapping against supplied text/image; parsed JSON. Existing 29 structural checks apply only to unchanged baseline, not newly specified roster/identity/referee/scoring extensions. No audio transcription or new runtime tests. Portable archive integrity is checked by package_handoff.py.\n',
      'NEXT_STEPS.md':'Read ESPORTS_CLIENT_UPDATE.md first; implement forward database extensions and tests, then BGMI roster/declaration/referee flows. Resolve dependent policies before enabling registration/scoring. Obtain an audio transcript before incorporating spoken requirements.\n',
      'CODEX_HANDOFF.md':'Latest written BGMI facts are in ESPORTS_CLIENT_UPDATE.md and the updated catalogue. Read this addendum over old unknown-detail statements and v1 PDFs. No app work was done; 57-table schema remains baseline only. Audio contents unverified. New extension requirements must receive separate migration and test evidence.\n'
    }[name]
    old=p.read_text(encoding='utf-8')
    if text not in old: p.write_text(old+text+body,encoding='utf-8')
p=root/'handoff/progress/STATE.json'
state=json.loads(p.read_text())
state['latest_requirements_addendum']='handoff/ESPORTS_CLIENT_UPDATE.md'
state['audio_transcription_status']='unavailable; not transcribed'
state['esports_database_extensions']='specified_not_implemented'
state['external_dependencies']=[x.replace('Esports rules fees capacities and prize allocation','BGMI fee/device/substitute/identity/scoring/prize-distribution decisions; Free Fire details') for x in state['external_dependencies']]
p.write_text(json.dumps(state,indent=2)+'\n',encoding='utf-8')
dest=root/'handoff/sources'
dest.mkdir(exist_ok=True)
shutil.copyfile('C:/Users/cloud/AppData/Local/Temp/codex-clipboard-874b08be-2e47-4cce-a5fc-d11ed0b28234.png',dest/'bgmi-points-reference.png')
assert bgmi['capacity']==24 and bgmi['price_options'] is None
assert bgmi['placement_points']['8']==1 and bgmi['placement_points']['16']==0
assert next(x for x in data['events'] if x['slug']=='free-fire')['prize_pool_paise'] is None
print('PASS: catalogue, source image, progress and handoff updates; SQL unchanged')
