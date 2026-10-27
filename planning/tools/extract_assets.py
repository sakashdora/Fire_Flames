from pathlib import Path
from pypdf import PdfReader
from PIL import Image, ImageDraw, ImageFont
import hashlib, json, io
root=Path(__file__).resolve().parents[1]
assets=root/'assets'
for d in ['source-embedded','source-pages','web','generated','brand','preview']:
    (assets/d).mkdir(parents=True,exist_ok=True)
reader=PdfReader(root.parent/'ABOUT.pdf')
records=[]; hashes={}
for pi,page in enumerate(reader.pages,1):
    for ji,img in enumerate(page.images,1):
        digest=hashlib.sha256(img.data).hexdigest()
        if digest in hashes:
            hashes[digest]['pages'].append(pi); continue
        name=f'p{pi:02d}-image{ji:02d}'+Path(img.name).suffix
        path=assets/'source-embedded'/name; path.write_bytes(img.data)
        try:
            im=Image.open(io.BytesIO(img.data))
            size=list(im.size)
        except Exception: size=[]
        rec={'file':str(path.relative_to(root)).replace('\\','/'),'pages':[pi],'dimensions':size,'sha256':digest,'origin':'ABOUT.pdf embedded image','status':'source artwork; no AI reconstruction'}
        hashes[digest]=rec; records.append(rec)
page_names={1:'fire-and-flames-cover',6:'ipl-auction',9:'e-trivia',12:'treasure-hunt',15:'brand-war',18:'srusti-bazar',21:'kurukshetra-esports',22:'black-texture',23:'srusti-exhibition'}
import pypdfium2 as pdf
doc=pdf.PdfDocument(root.parent/'ABOUT.pdf')
for pn,slug in page_names.items():
    im=doc[pn-1].render(scale=2).to_pil().convert('RGB')
    im.save(assets/'source-pages'/f'{slug}.png')
    for width in [480,960]:
        v=im.copy(); v.thumbnail((width,2000)); v.save(assets/'web'/f'{slug}-{width}.webp',quality=85)
    records.append({'file':f'assets/source-pages/{slug}.png','pages':[pn],'dimensions':list(im.size),'origin':'ABOUT.pdf full-page render','web_variants':[f'assets/web/{slug}-{s}.webp' for s in [480,960]],'status':'faithful source artwork; background retained'})
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
for start in range(0,len(hashes),20):
    sheet=Image.new('RGB',(1000,1250),'#e6e6e6'); draw=ImageDraw.Draw(sheet)
    for j,rec in enumerate(list(hashes.values())[start:start+20]):
        im=Image.open(root/rec['file']).convert('RGBA'); im.thumbnail((230,210)); x=(j%4)*250; y=(j//4)*250
        sheet.paste(im,(x+(250-im.width)//2,y+25),im)
        draw.text((x+8,y+3),Path(rec['file']).name,font=font,fill='black')
        draw.text((x+8,y+231),str(rec['dimensions']),font=font,fill='black')
    sheet.save(assets/'preview'/f'embedded-contact-{start}.jpg')
(assets/'manifest.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print(f'{len(hashes)} unique embedded images and {len(page_names)} faithful covers exported')
