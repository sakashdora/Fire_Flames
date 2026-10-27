from pathlib import Path
from pypdf import PdfReader
import pypdfium2 as pdf
from PIL import Image, ImageDraw, ImageFont
import json,csv,hashlib
root=Path(__file__).resolve().parents[1]; qa=root/'qa'; qa.mkdir(exist_ok=True)
results={}; font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
for path in (root/'deliverables').glob('*.pdf'):
    d=pdf.PdfDocument(path); folder=qa/path.stem;folder.mkdir(exist_ok=True);thumbs=[]
    r=PdfReader(path); texts=[p.extract_text() or '' for p in r.pages]
    results[path.name]={'pages':len(d),'empty_text_pages':[i+1 for i,t in enumerate(texts) if not t.strip()],'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}
    for i,page in enumerate(d):
        im=page.render(scale=1.2 if 'Design' in path.name else 1.5).to_pil().convert('RGB');im.save(folder/f'page-{i+1:02d}.png')
        im.thumbnail((400,545)); tile=Image.new('RGB',(420,575),'#e0e0e0');tile.paste(im,((420-im.width)//2,25));ImageDraw.Draw(tile).text((10,5),f'{path.stem} / {i+1}',font=font,fill='black');thumbs.append(tile)
    for start in range(0,len(thumbs),6):
        sheet=Image.new('RGB',(1260,1150),'#aaa')
        for j,t in enumerate(thumbs[start:start+6]):sheet.paste(t,((j%3)*420,(j//3)*575))
        sheet.save(folder/f'contact-{start+1:02d}.jpg',quality=90)
    (folder/'extracted.txt').write_text('\n\n'.join(f'PAGE {i+1}\n{t}' for i,t in enumerate(texts)),encoding='utf-8')
manifest=json.loads((root/'assets/manifest.json').read_text(encoding='utf-8'))
missing=[]
for rec in manifest:
    for f in [rec['file']]+rec.get('web_variants',[]):
        if not (root/f).is_file():missing.append(f)
    if 'sha256' in rec:assert hashlib.sha256((root/rec['file']).read_bytes()).hexdigest()==rec['sha256']
assert not missing,missing
catalog=json.loads((root/'data/event-catalogue.json').read_text(encoding='utf-8'))
assert sum(e['prize_pool_paise'] for e in catalog['events'] if e['track']=='e-fest')==3600000
assert all(e['price_options'] is None and not e['registration_enabled'] for e in catalog['events'] if e['track']=='esports')
assert len(list(csv.DictReader((root/'data/acceptance-tests.csv').open(encoding='utf-8-sig'))))==40
results['integrity']={'missing_assets':missing,'unique_embedded_images':len(list((root/'assets/source-embedded').iterdir())),'manifest_records':len(manifest),'markdown_specs':len(list((root/'docs').glob('[0-9]*.md'))),'acceptance_cases':40,'e_fest_pool_inr':36000,'all_application_tests':'NOT RUN; predevelopment delivery'}
(qa/'validation.json').write_text(json.dumps(results,indent=2),encoding='utf-8');print(json.dumps(results,indent=2))
