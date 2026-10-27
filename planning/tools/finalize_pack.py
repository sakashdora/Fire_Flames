from pathlib import Path
import json,hashlib,zipfile,csv
from PIL import Image
import pypdfium2 as pdf
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]
doc=pdf.PdfDocument(root.parent/'ABOUT.pdf');p=doc[0];w,h=p.get_size()
crop=(w*.10,h*.42,w*.10,h*.39)
im=p.render(scale=3,crop=crop).to_pil().convert('RGB')
target=root/'assets/brand/fire-and-flames-wordmark-source.png';im.save(target)
variants=[]
for width in [480,960]:
    v=im.copy();v.thumbnail((width,1000));name=f'assets/web/fire-and-flames-wordmark-source-{width}.webp';v.save(root/name,quality=90);variants.append(name)
path=root/'assets/manifest.json';manifest=json.loads(path.read_text(encoding='utf-8'))
manifest=[r for r in manifest if r.get('origin')!='PDF text region render']
manifest.append({'file':'assets/brand/fire-and-flames-wordmark-source.png','origin':'PDF text region render','pages':[1],'crop_removed_left_bottom_right_top_pdf_units':list(crop),'dimensions':list(im.size),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'web_variants':variants,'status':'source background retained; not a transparent logo'})
path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')
rubrics={
'treasure-discipline':[('Respectful behavior',25),('Following instructions',25),('Fair play and honesty',25),('Team coordination and responsible conduct',25)],
'brand-war':[('Brand understanding and accuracy',25),('Creativity and originality',25),('Marketing strategy and customer insight',20),('Pitch clarity and persuasion',20),('Teamwork and time management',10)],
'bazar-best-stall':[('Product/service quality and relevance',25),('Stall presentation layout and visual appeal',20),('Customer interaction and explanation',20),('Business potential and pricing clarity',15),('Branding promotion and originality',10),('Team preparedness and professionalism',10)],
'bazar-innovative':[('Novelty and originality',30),('Practical usefulness or problem-solving',25),('Creative presentation or demonstration',20),('Sustainability or responsible practices where relevant',15),('Potential to develop or scale',10)],
'exhibition':[('Problem clarity and relevance',15),('Originality and innovation',20),('Feasibility and execution plan',20),('Prototype quality or demonstration where applicable',20),('Customer or user value and market potential',15),('Presentation clarity and responses',10)]}
data={'status':'source weights; conditional criteria and judge aggregation require approval','source':'E-Fest GAME RULES & RUBRICS-1 (1).docx','rubrics':[]}
for name,criteria in rubrics.items():
    assert sum(v for _,v in criteria)==100
    data['rubrics'].append({'id':name,'total':100,'criteria':[{'label':k,'max_marks':v} for k,v in criteria]})
(root/'data/rubric-catalogue.json').write_text(json.dumps(data,indent=2),encoding='utf-8')
# Check the review-index page locators after final pagination.
r=PdfReader(root/'deliverables/Fire-and-Flames-Master-Plan.pdf')
texts=[' '.join(p.extract_text().split()) for p in r.pages]
locators=[]
for source in sorted((root/'docs').glob('[0-9][0-9]-*.md')):
    title=source.read_text(encoding='utf-8').splitlines()[0][2:]
    page=next(i+1 for i,t in enumerate(texts) if i>0 and title in t)
    assert f'{title} · p. {page}' in texts[0],(title,page)
    locators.append({'title':title,'page':page})
(root/'qa/contents-check.json').write_text(json.dumps(locators,indent=2),encoding='utf-8')
print('Wordmark regional render, five rubric datasets and contents-page checks complete.')
