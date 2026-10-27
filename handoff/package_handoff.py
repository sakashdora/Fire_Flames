"""Package source documents, approved planning assets and technical handoff."""
from pathlib import Path
import json
import zipfile

root = Path(__file__).resolve().parent.parent
output = root / 'Fire-and-Flames-Antigravity-Handoff.zip'
files = [root / name for name in (
    'AGENTS.md', 'REFERENCE_NOTES.md', 'ABOUT.pdf',
    'E-Fest GAME RULES & RUBRICS-1 (1).docx',
)]
for folder in ('handoff', 'planning'):
    files.extend(p for p in (root / folder).rglob('*')
                 if p.is_file() and not {'qa', '__pycache__'}.intersection(p.relative_to(root).parts))
for path in files:
    if path.suffix == '.json':
        json.loads(path.read_text(encoding='utf-8-sig'))
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(files):
        archive.write(path, path.relative_to(root).as_posix())
with zipfile.ZipFile(output) as archive:
    assert archive.testzip() is None, 'Archive checksum verification failed'
    assert len(archive.namelist()) == len(set(archive.namelist()))
    assert 'handoff/ANTIGRAVITY_PROMPT.md' in archive.namelist()
print(json.dumps({'archive': str(output), 'files': len(files),
                  'size_mb': round(output.stat().st_size / 1024**2, 2),
                  'json_parse': 'PASS', 'archive_integrity': 'PASS'}))
