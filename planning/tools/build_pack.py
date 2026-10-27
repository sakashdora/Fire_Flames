from pathlib import Path
import json, csv, re, shutil, hashlib, html
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Preformatted, KeepTogether, CondPageBreak
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'deliverables'; OUT.mkdir(exist_ok=True)
DATA=ROOT/'data'; DATA.mkdir(exist_ok=True)
QA=ROOT/'qa'; QA.mkdir(exist_ok=True)
AS=ROOT/'assets'
pdfmetrics.registerFont(TTFont('Arial','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('ArialBold','C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='ArialBold',italic='Arial',boldItalic='ArialBold')

aliases={
'ed-cell-logo.png':'p01-image03.png','srustiprosar-logo.png':'p04-image06.png',
'esports-wordmark.png':'p04-image05.png','ipl-auction.png':'p06-image03.png',
'e-trivia.png':'p09-image03.png','treasure-hunt.png':'p12-image01.png',
'brand-war.png':'p15-image05.png','srusti-bazar.png':'p18-image04.png',
'kurukshetra.png':'p21-image08.png','srusti-exhibition.png':'p23-image06.png',
'campus-photo.png':'p03-image03.png','black-texture.jpg':'p01-image01.jpg',
'ember-overlay.png':'p01-image05.png','warm-glow.png':'p01-image04.png'}
manifest=json.loads((AS/'manifest.json').read_text(encoding='utf-8'))
manifest=[r for r in manifest if r.get('origin') not in ['named source copy','generated decorative artwork']]
for name,src in aliases.items():
    target=AS/'brand'/name; shutil.copyfile(AS/'source-embedded'/src,target)
    source=next(r for r in manifest if r['file'].endswith('/'+src))
    rec={'file':'assets/brand/'+name,'source':source['file'],'pages':source['pages'],'dimensions':source['dimensions'],'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'origin':'named source copy','web_variants':[]}
    rec['visible_bounds']=list(Image.open(target).getbbox() or (0,0,*Image.open(target).size))
    if name not in ['black-texture.jpg','warm-glow.png','ember-overlay.png']:
        for width in [320,640]:
            im=Image.open(target); im.thumbnail((width,width))
            webname=Path(name).stem+f'-{width}.webp'; im.save(AS/'web'/webname,quality=88)
            rec['web_variants'].append('assets/web/'+webname)
    manifest.append(rec)
hero=AS/'generated'/'ember-hero.png'
for width in [640,1280,1920]:
    im=Image.open(hero).convert('RGB'); im.thumbnail((width,2000)); im.save(AS/'web'/f'ember-hero-{width}.webp',quality=82)
manifest.append({'file':'assets/generated/ember-hero.png','origin':'generated decorative artwork','dimensions':list(Image.open(hero).size),'prompt':'assets/generated/PROMPT.md','web_variants':[f'assets/web/ember-hero-{w}.webp' for w in [640,1280,1920]],'sha256':hashlib.sha256(hero.read_bytes()).hexdigest()})
(AS/'manifest.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False),encoding='utf-8')

events=[]
for slug,name,mi,ma,cap,pool,prizes in [
('ipl-auction','IPL Auction',2,4,None,8000,[4000,2500,1500]),
('e-trivia','e-Trivia',2,4,None,4500,[2000,1500,1000]),
('treasure-hunt','Treasure Hunt',2,4,None,7000,[3000,2500,1500]),
('brand-war','Brand War',2,3,None,4500,[2000,1500,1000]),
('srusti-bazar','Srusti Bazar',None,None,10,3000,[1000,1000,1000]),
('srusti-exhibition','Srusti Exhibition',None,None,10,9000,[3000,3000,3000])]:
    standard=slug not in ['srusti-bazar','srusti-exhibition']
    events.append({'slug':slug,'name':name,'organizer':'ED Cell','track':'e-fest','source_status':'documented with unresolved policies','publication_state':'draft','registration_enabled':False,'team_min':mi,'team_max':ma,'capacity':cap,'capacity_unit':'stall' if slug=='srusti-bazar' else 'entry','pool_team_count':8 if slug=='ipl-auction' else None,'currency':'INR','price_options':[{'mode':'team','amount_paise':9900},{'mode':'individual','amount_paise':5900,'requires_policy_approval':True}] if standard else [{'mode':'stall' if slug=='srusti-bazar' else 'entry','amount_paise':29900 if slug=='srusti-bazar' else 19900}],'prize_pool_paise':pool*100,'award_amounts_paise':[v*100 for v in prizes],'award_note':'Third amount is discretionary discipline award, not third finisher' if slug=='treasure-hunt' else ('Names conflict in source; see decision D04' if slug=='srusti-exhibition' else None),'gates':['official_payment_profile','eligibility_and_rules_approval','published_schedule']})
for slug,name in [('free-fire','Free Fire'),('bgmi','BGMI')]:
    events.append({'slug':slug,'name':name,'organizer':'Srustiprosar','organizer_source':'user instruction','track':'esports','publication_state':'draft','registration_enabled':False,'team_min':None,'team_max':None,'capacity':None,'currency':'INR','price_options':None,'prize_pool_paise':None,'gates':['esports_fees','game_rules','prize_allocation','capacity','official_payment_profile','eligibility_and_rules_approval','published_schedule']})
catalog={'schema_version':1,'status':'planning handoff only; not production seed','prepared_date':'2026-10-27','timezone':'Asia/Kolkata','e_fest_dates':['2026-11-13','2026-11-14'],'esports_session_dates':None,'external_colleges_allowed':True,'published_e_fest_pool_paise':3600000,'advertised_esports_combined_pool_paise':2000000,'combined_festival_pool_confirmed':False,'events':events}
(DATA/'event-catalogue.json').write_text(json.dumps(catalog,indent=2,ensure_ascii=False),encoding='utf-8')
testtext=(ROOT/'docs'/'10-testing-and-delivery.md').read_text(encoding='utf-8')
with (DATA/'acceptance-tests.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f); w.writerow(['id','scenario','expected_result','status','actual_result','evidence','owner'])
    for line in testtext.splitlines():
        if re.match(r'\| T\d\d ',line):
            parts=[p.strip() for p in line.strip('|').split('|')]; w.writerow(parts+['NOT RUN','','',''])
tokens={'canvas':'#0B0B0D','surface':'#161619','raised':'#222226','text':'#F7F2E8','muted':'#C4BFB5','ember':'#FF781F','gold':'#F5BF42','red':'#9B1C17','border':'#3A3530','success':'#91E6B5','warning':'#FFD57A','error':'#FFB4AB'}
(AS/'design-tokens.json').write_text(json.dumps({'status':'proposed web equivalents; not exact source hex values','colors':tokens,'spacing_base_px':8,'body_min_px':16,'target_control_px':44},indent=2),encoding='utf-8')

INK=colors.HexColor('#242326'); MUTED=colors.HexColor('#635D56'); GOLD=colors.HexColor('#C27B16')
styles={
'body':ParagraphStyle('body',fontName='Arial',fontSize=9.4,leading=14,textColor=INK,spaceAfter=8),
'h1':ParagraphStyle('h1',fontName='ArialBold',fontSize=24,leading=29,textColor=colors.black,spaceAfter=19),
'h2':ParagraphStyle('h2',fontName='ArialBold',fontSize=13,leading=17,textColor=INK,spaceBefore=14,spaceAfter=8,keepWithNext=True),
'cell':ParagraphStyle('cell',fontName='Arial',fontSize=8,leading=11,textColor=INK,spaceAfter=0),
'headcell':ParagraphStyle('headcell',fontName='ArialBold',fontSize=8,leading=11,textColor=colors.white),
'bullet':ParagraphStyle('bullet',fontName='Arial',fontSize=9.4,leading=14,leftIndent=11,firstLineIndent=-9,spaceAfter=6),
'small':ParagraphStyle('small',fontName='Arial',fontSize=8,leading=12,textColor=MUTED,spaceAfter=8)}
def inline(s):
    s=html.escape(s.replace('`',''))
    s=re.sub(r'\*\*(.*?)\*\*',r'<b>\1</b>',s)
    return s
def parse_md(text):
    lines=text.splitlines(); flow=[]; i=0; compact=False
    while i<len(lines):
        line=lines[i].strip()
        if not line: i+=1; continue
        if line.startswith('```'):
            buf=[]; i+=1
            while i<len(lines) and not lines[i].startswith('```'): buf.append(lines[i]); i+=1
            flow.append(Preformatted('\n'.join(buf),ParagraphStyle('code',fontName='Courier',fontSize=7.8,leading=11,backColor=colors.HexColor('#F4F1EB'),borderPadding=9,spaceAfter=12))); i+=1; continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].strip().startswith('|'):
                bits=[b.strip() for b in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+',b) for b in bits): rows.append(bits)
                i+=1
            cols=len(rows[0]); available=A4[0]-88
            if cols==3: weights=[.22,.49,.29]
            elif cols==4: weights=[.12,.27,.38,.23]
            elif cols==5: weights=[.18,.20,.22,.27,.13]
            elif cols==7: weights=[.22]+[.78/6]*6
            else: weights=[1/cols]*cols
            if rows[0][0]=='ID':weights=[.08,.30,.62] if cols==3 else [.07,.30,.36,.27]
            if rows[0][0]=='Rubric':weights=[.24,.65,.11]
            if rows[0][0]=='Role':weights=[.17,.23,.34,.26]
            if rows[0][0]=='Command':weights=[.25,.23,.33,.19]
            if rows[0][0]=='Trigger':weights=[.23,.22,.17,.38]
            if flow and isinstance(flow[-1],Paragraph) and flow[-1].style.name=='h2':
                flow[-1].keepWithNext=0
                flow.insert(len(flow)-1,CondPageBreak(115))
            data=[[Paragraph(inline(cell),styles['headcell' if r==0 else 'cell']) for cell in row] for r,row in enumerate(rows)]
            t=Table(data,colWidths=[available*v for v in weights],repeatRows=1,hAlign='LEFT')
            t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#252328')),('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.HexColor('#F6F3EE'),colors.white]),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),7),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5),('LINEBELOW',(0,0),(-1,0),1,GOLD),('LINEBELOW',(0,1),(-1,-1),.3,colors.HexColor('#E8E2D9'))]))
            flow.extend([t,Spacer(1,12)]); continue
        if line.startswith('# '): flow.append(Paragraph(inline(line[2:]),styles['h1']))
        elif line.startswith('## '):
            compact=line[3:] in ['Source register','Technical references checked during planning']
            flow.append(Paragraph(inline(line[3:]),styles['h2']))
        elif line.startswith('- '): flow.append(Paragraph('• '+inline(line[2:]),styles['small'] if compact else styles['bullet']))
        else:
            buf=[line]
            while i+1<len(lines) and lines[i+1].strip() and not lines[i+1].startswith(('#','|','- ','```')):
                i+=1; buf.append(lines[i].strip())
            flow.append(Paragraph(inline(' '.join(buf)),styles['small'] if compact else styles['body']))
        i+=1
    return flow

def footer(c,d):
    c.saveState(); c.setFillColor(MUTED); c.setFont('Arial',7)
    c.drawString(44,27,'FIRE & FLAMES  /  PREDEVELOPMENT SPECIFICATION  /  27 OCT 2026')
    c.drawRightString(A4[0]-44,27,str(d.page)); c.restoreState()
docs=sorted((ROOT/'docs').glob('[0-9][0-9]-*.md'))
from pypdf import PdfReader
prior_path=OUT/'Fire-and-Flames-Master-Plan.pdf'
prior_texts=[' '.join(p.extract_text().split()) for p in PdfReader(prior_path).pages] if prior_path.exists() else []
story=[Spacer(1,38),Paragraph('Fire and Flames',styles['h1']),Paragraph('Event platform and operations plan',ParagraphStyle('sub',parent=styles['h1'],fontSize=19,leading=25)),Paragraph('College review edition  •  27 October 2026',styles['small']),Spacer(1,18),Paragraph('One platform for E-Fest by ED Cell and Kurukshetra esports by Srustiprosar, with secure registration, verified payments and accountable event-day operations.',ParagraphStyle('lead',parent=styles['body'],fontSize=13,leading=21)),Spacer(1,20)]
story.append(Paragraph('Prepared for Srusti Academy of Management & Technology (Autonomous)',styles['body']))
story.append(Paragraph('Documented E-Fest dates: 13–14 November 2026. Participation is open to students from other colleges.',styles['body']))
story.append(Paragraph('This review edition contains proposed workflows and acceptance criteria. Official payment details, esports rules and several college policies remain approval items. It does not represent a deployed or tested application.',styles['body']))
story.append(Spacer(1,25)); story.append(Paragraph('Review sequence',styles['h2']))
for k,p in enumerate(docs,1):
    title=p.read_text(encoding='utf-8').splitlines()[0][2:]
    page=next((n+1 for n,t in enumerate(prior_texts) if n>0 and title in t),None)
    locator=f'  ·  p. {page}' if page else ''
    story.append(Paragraph(f'{k:02d}  {inline(title)}{locator}',styles['small']))
story.append(Paragraph('Companion deliverable: Fire and Flames Design Boards. Editable sources, structured catalogue, acceptance register and asset provenance are included in the planning folder.',styles['small']))
for p in docs:
    story.append(PageBreak()); story.extend(parse_md(p.read_text(encoding='utf-8')))
SimpleDocTemplate(str(OUT/'Fire-and-Flames-Master-Plan.pdf'),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=43,bottomMargin=47,title='Fire and Flames Event Platform and Operations Plan',author='College planning review',allowSplitting=1).build(story,onFirstPage=footer,onLaterPages=footer)

# Static review boards; no application or interactive prototype is being built.
W,H=1440,1000
c=canvas.Canvas(str(OUT/'Fire-and-Flames-Design-Boards.pdf'),pagesize=(W,H))
c.setTitle('Fire and Flames Design Boards')
def rect(x,y,w,h,color,r=0,stroke=None):
    c.setFillColor(colors.HexColor(color)); c.setStrokeColor(colors.HexColor(stroke or color))
    if r:c.roundRect(x,y,w,h,r,fill=1,stroke=bool(stroke))
    else:c.rect(x,y,w,h,fill=1,stroke=bool(stroke))
def text(x,y,s,size=16,color='#F7F2E8',bold=False):
    c.setFont('ArialBold' if bold else 'Arial',size); c.setFillColor(colors.HexColor(color)); c.drawString(x,y,s)
def para(x,y,s,w=500,size=16,color='#C4BFB5',leading=None):
    p=Paragraph(html.escape(s).replace('\n','<br/>'),ParagraphStyle('board',fontName='Arial',fontSize=size,leading=leading or size*1.45,textColor=colors.HexColor(color)))
    _,ph=p.wrap(w,1000); p.drawOn(c,x,y-ph); return ph
def art(name,x,y,w,h):
    im=Image.open(AS/'brand'/name)
    left,top,right,bottom=im.getbbox() or (0,0,*im.size)
    scale=min(w/(right-left),h/(bottom-top))
    contentw=(right-left)*scale; contenth=(bottom-top)*scale
    ix=x+(w-contentw)/2-left*scale
    iy=y+(h-contenth)/2-(im.height-bottom)*scale
    c.saveState(); clip=c.beginPath();clip.rect(x,y,w,h);c.clipPath(clip,stroke=0,fill=0)
    c.drawImage(ImageReader(im),ix,iy,im.width*scale,im.height*scale,mask='auto');c.restoreState()
def button(x,y,w,label,fill='#F5BF42',dark=True):
    rect(x,y,w,46,fill,9); text(x+18,y+15,label,15,'#0B0B0D' if dark else '#F7F2E8',True)
def pill(x,y,label,color='#F5BF42',width=130):
    rect(x,y,width,28,'#26221A',7); text(x+10,y+9,label,10,color,True)
def header(num,title,sub):
    rect(0,0,W,H,'#0B0B0D'); text(44,954,'FIRE & FLAMES  /  DESIGN REVIEW',12,'#F5BF42',True)
    text(44,914,title,28,bold=True); text(44,883,sub,14,'#C4BFB5'); text(1320,953,f'BOARD {num:02d}',11,'#C4BFB5')
def foot(s):
    text(44,27,s,11,'#C4BFB5'); text(1203,27,'STATIC CONCEPT  •  v1',11,'#F5BF42')
header(1,'Two organizers. One clear entrance.','Desktop landing concept • Source artwork and brochure colors • Both choices visible without a carousel')
c.drawImage(ImageReader(str(hero)),28,87,1384,755,preserveAspectRatio=False)
rect(48,758,1344,64,'#111113',12,stroke='#3A3530'); text(70,784,'SRUSTI  /  FIRE & FLAMES',19,bold=True)
text(620,784,'Events     Programme     Rules     Help',15); button(1080,767,132,'Student sign in'); button(1224,767,150,'Teacher sign in','#252529',False)
text(70,707,'13–14 NOVEMBER 2026  /  E-FEST',14,'#F5BF42',True)
text(70,654,'Choose your arena.',45,bold=True)
text(70,622,'Open to students from other colleges. Explore the event, then register with confidence.',17,'#C4BFB5')
for x in [70,738]:rect(x,193,632,389,'#161619',18,stroke='#4B3A26')
art('ed-cell-logo.png',94,460,78,78); text(191,517,'ORGANIZED BY ED CELL',12,'#F5BF42',True)
text(191,474,'Fire & Flames',36,bold=True); text(191,444,'THE E-FEST',16,'#F5BF42',True)
para(100,401,'Ideas, enterprise and competition. Six activities spanning strategy, creativity and student innovation.',540,17)
text(100,305,'6 ACTIVITIES',13,'#C4BFB5',True); text(326,305,'₹36,000 ACTIVITY POOL',17,'#F5BF42',True)
button(100,224,210,'Explore E-Fest  →')
art('srustiprosar-logo.png',762,460,78,78); text(859,517,'ORGANIZED BY SRUSTIPROSAR',12,'#FF781F',True)
art('kurukshetra.png',844,410,386,100)
para(768,401,'Free Fire and BGMI. A dedicated esports experience with its own rules, registration and operations.',540,17)
text(768,305,'FEES TO BE ANNOUNCED',12,'#C4BFB5',True); text(1040,305,'₹20,000 POOL',17,'#FF781F',True)
button(768,224,214,'Explore Esports  →','#FF781F')
rect(58,114,785,43,'#111113',8);text(70,130,'Fast first load. Optional motion. Clear organizer identity at every step.',16,'#C4BFB5')
foot('Hero copy is live text in the future site. Esports checkout remains closed until its configuration is approved.'); c.showPage()

header(2,'A readable mobile journey','Three phone concepts • No blocking intro • Organizer and fee stay visible through checkout')
phones=[(80,'01  DISCOVER'),(545,'02  REVIEW'),(1010,'03  PAYMENT')]
for x,label in phones:
    text(x,838,label,13,'#F5BF42',True); rect(x,100,350,710,'#242426',30,stroke='#55504A'); rect(x+9,110,332,690,'#111113',24)
    text(x+28,766,'SRUSTI',15,bold=True); text(x+207,766,'Account',12,'#C4BFB5')
    c.setStrokeColor(colors.HexColor('#C4BFB5'));c.setLineWidth(1.4)
    for line_y in [767,772,777]:c.line(x+276,line_y,x+291,line_y)
x=80
text(x+28,716,'Find your event.',26,bold=True); text(x+28,686,'13–14 Nov 2026  •  E-Fest',12,'#C4BFB5')
rect(x+24,425,302,230,'#1C1915',14,stroke='#6B4D24'); art('ed-cell-logo.png',x+40,566,50,50)
text(x+106,596,'ED CELL',11,'#F5BF42',True); text(x+40,536,'Fire & Flames',25,bold=True); text(x+40,506,'Six events  •  ₹36,000 pool',13,'#C4BFB5');button(x+40,444,268,'Explore E-Fest  →')
rect(x+24,166,302,240,'#1D1715',14,stroke='#6A3420'); text(x+40,373,'SRUSTIPROSAR',11,'#FF781F',True); art('kurukshetra.png',x+38,278,270,85)
text(x+40,258,'Free Fire & BGMI',14);text(x+40,238,'Registration details coming soon',11,'#C4BFB5');button(x+40,180,268,'Explore Esports  →','#FF781F')
x=545
text(x+28,717,'Review registration',23,bold=True); text(x+28,686,'E-Fest  /  IPL Auction',13,'#F5BF42'); pill(x+28,638,'STEP 4 OF 6',width=125)
rect(x+24,367,302,246,'#1C1C20',13)
for yy,k,v in [(578,'Registration mode','Team'),(527,'Team members','3 accepted'),(476,'Organizer','ED Cell'),(425,'Amount due','₹99 per team')]:
    text(x+40,yy,k,11,'#C4BFB5');text(x+40,yy-24,v,18,bold=True)
para(x+30,342,'Your roster and fee are saved with this registration. Each member receives their own pass after confirmation.',285,14)
rect(x+30,223,11,11,'#111113',2,stroke='#C4BFB5');text(x+48,225,'I accept the event rules and terms',12)
button(x+28,147,294,'Continue to payment  →')
x=1010
text(x+28,717,'Pay the college',24,bold=True); text(x+28,684,'IPL Auction  /  ₹99 total',15,'#F5BF42')
rect(x+85,450,180,180,'#F7F2E8',12)
para(x+103,574,'OFFICIAL QR\nREQUIRED',144,18,'#242326'); text(x+107,474,'Not a payment code',11,'#635D56')
para(x+30,421,'The approved college beneficiary and exact amount must appear here before checkout is enabled.',285,13)
rect(x+28,282,294,48,'#222226',8,stroke='#55504A'); text(x+42,301,'Transaction reference',13,'#C4BFB5')
rect(x+28,219,294,48,'#222226',8,stroke='#55504A'); text(x+42,238,'Attach payment evidence',13,'#C4BFB5')
button(x+28,147,294,'Submit details for review')
foot('Illustrative review state. No real payment QR, student record or transaction is displayed.'); c.showPage()

header(3,'Volunteer operations built for the gate','Duty-bound scanning • Clear server-confirmed results • No payment approval authority')
rect(55,105,420,715,'#161619',22,stroke='#3A3530');text(80,779,'VOLUNTEER WORKSPACE',13,'#F5BF42',True)
text(80,741,'IPL Auction · Entry desk',24,bold=True);text(80,708,'Assigned session and shift required',14,'#C4BFB5')
rect(80,395,370,280,'#090909',16,stroke='#6B5841')
for a,b,dx,dy in [(105,650,1,-1),(425,650,-1,-1),(105,420,1,1),(425,420,-1,1)]:
    c.setStrokeColor(colors.HexColor('#F5BF42'));c.setLineWidth(4);c.line(a,b,a+35*dx,b);c.line(a,b,a,b+35*dy)
para(130,555,'Camera preview\nScan an individual event pass',270,19)
button(80,319,370,'Start camera');button(80,256,370,'Use support reference','#2B2927',False)
para(80,223,'No connection? Attendance is not recorded. Contact the station supervisor.',350,15)
for y,color,title,body in [(614,'#91E6B5','Recorded','Identity matched • Correct session • First valid check-in'),(401,'#FFD57A','Already checked in','Show the original time. Do not create another attendance record.'),(188,'#FFB4AB','Not recorded','Wrong event, revoked pass or unavailable connection. Show the next action.')]:
    rect(530,y,850,180,'#161619',16,stroke='#3A3530');pill(555,y+130,'SCAN RESULT',color,130);text(555,y+89,title,30,color,True);para(555,y+63,body,795,17)
foot('Server validates the current pass, role, duty, event and duplicate constraint before returning success.');c.showPage()

header(4,'Admin work starts with the next action','Scoped operational queues • Auditable finance reviews • Super-admin approval where required')
rect(50,95,1340,733,'#141416',18,stroke='#3A3530');rect(50,95,220,733,'#1B1A1D',18)
text(75,786,'ED CELL',17,'#F5BF42',True);text(75,755,'Event admin',13,'#C4BFB5')
for y,label in [(690,'Overview'),(639,'Registrations'),(588,'Payment review'),(537,'Events & schedule'),(486,'Staff duties'),(435,'Judging & results'),(384,'Notifications'),(333,'Audit history')]:text(75,y,label,16,'#F5BF42' if y==588 else '#C4BFB5',y==588)
text(302,781,'Payment review',29,bold=True);text(302,749,'Finance permission required • ED Cell records only',14,'#C4BFB5');pill(1160,759,'SAMPLE DATA',width=155)
for x,val,label in [(302,'12','Awaiting review'),(654,'03','Needs correction'),(1006,'02','Late credit exceptions')]:
    rect(x,608,324,105,'#222226',12);text(x+20,664,val,34,'#F5BF42',True);text(x+20,632,label,14,'#C4BFB5')
rect(302,254,1028,318,'#1D1D21',12);text(323,536,'REFERENCE',12,'#C4BFB5',True);text(530,536,'EVENT',12,'#C4BFB5',True);text(823,536,'AMOUNT',12,'#C4BFB5',True);text(1004,536,'STATUS',12,'#C4BFB5',True)
for y,ref,event,amt,status in [(477,'SAMPLE-001','IPL Auction','₹99','Under review'),(414,'SAMPLE-002','Srusti Bazar','₹299','Needs information'),(351,'SAMPLE-003','Exhibition','₹199','Late credit')]:
    text(323,y,ref,15);text(530,y,event,15);text(823,y,amt,16,'#F5BF42',True);text(1004,y,status,14,'#FFD57A')
para(323,305,'Open a record to match the actual bank credit, review evidence and record an attributable decision.',940,14)
rect(302,129,1028,98,'#242018',12);text(325,190,'No screenshot-only approval',19,'#F5BF42',True);para(325,172,'Reviewers cannot verify their own payments. A verified credit is allocated once; every decision is audited.',960,14)
foot('Super admin: institution-wide scope, named role grants, beneficiary approvals, result publication and recovery.');c.showPage()

header(5,'A coherent asset system','Original PDF artwork • Named source copies • Responsive exports • One new decorative background')
items=[('ipl-auction.png','IPL Auction'),('e-trivia.png','e-Trivia'),('treasure-hunt.png','Treasure Hunt'),('brand-war.png','Brand War'),('srusti-bazar.png','Srusti Bazar'),('srusti-exhibition.png','Srusti Exhibition')]
for i,(name,label) in enumerate(items):
    x=48+(i%3)*464;y=510-(i//3)*330
    rect(x,y,438,304,'#161619',16,stroke='#3A3530');art(name,x+55,y+67,328,218);text(x+22,y+28,label,22,bold=True)
for i,(key,value) in enumerate(tokens.items()):
    if i>=8:break
    x=50+i*172;rect(x,105,150,28,value,4);text(x,81,key.upper(),10,'#C4BFB5');text(x,63,value,11)
foot('Source origins, dimensions, hashes and optimized derivatives are recorded in assets/manifest.json.');c.showPage()

header(6,'Approval and operational flow','Design review companion • Resolve the listed dependencies before enabling their production workflows')
steps=[('01','Choose event','Organizer, rules and fee'),('02','Confirm identity','College profile and consent'),('03','Review payment','Actual credited funds'),('04','Issue passes','Eligible roster confirmed'),('05','Record attendance','Scoped online scan')]
for i,(n,title,detail) in enumerate(steps):
    x=50+i*276;rect(x,615,256,190,'#1C1B1F',15,stroke='#4B3A26');text(x+18,761,n,32,'#F5BF42',True);text(x+18,713,title,19,bold=True);para(x+18,689,detail,218,14)
text(50,548,'Decisions required from the college',26,bold=True)
gates=[('FINANCE','Official QR and beneficiary; two approvers; refund policy.'),('ED CELL','Individual entry allocation, final award names, timetable and rules.'),('SRUSTIPROSAR','Game fees, format, squad sizes, scoring, sessions and prize split.'),('IT AND OPERATIONS','Named staff, sender domain, hosting ownership, support and rehearsal.')]
for i,(title,body) in enumerate(gates):
    y=418-i*92;rect(50,y,1340,76,'#161619',12);text(70,y+47,title,13,'#F5BF42',True);text(70,y+20,body,16)
foot('The master plan includes responsibilities, state transitions, source conflicts and 40 future acceptance tests.');c.showPage()
header(7,'Super admin oversight and approvals','Institution-wide visibility • Separate organizer scopes • No self-approval of sensitive changes')
rect(50,112,1340,704,'#161619',18,stroke='#3A3530')
text(78,774,'Institution control',29,bold=True);pill(1150,760,'MFA VERIFIED',width=174)
text(78,740,'ED Cell + Srustiprosar',15,'#C4BFB5')
for x,title,detail in [(78,'Staff authority','Named roles with scope and expiry'),(518,'Critical approvals','Beneficiary, refunds and publication'),(958,'Audit and recovery','Trace changes and revoke access')]:
    rect(x,603,403,101,'#242226',11);text(x+17,663,title,20,'#F5BF42',True);para(x+17,641,detail,365,14)
rect(78,224,796,344,'#201D19',14,stroke='#604B2E');text(102,526,'Payment profile activation',25,bold=True)
text(102,490,'STATE: AWAITING INDEPENDENT APPROVAL',12,'#FFD57A',True)
para(102,457,'The official QR, decoded destination and beneficiary must be checked against college finance records. The proposer cannot approve their own change.',735,17)
for y,s in [(351,'1   Finance evidence and test transfer recorded'),(316,'2   Different authorized approver verifies the destination'),(281,'3   Activation creates a new version and security notification')]:text(102,y,s,15,'#C4BFB5')
rect(907,224,455,344,'#1E1E23',14)
text(930,526,'Access review',25,bold=True)
for y,s in [(471,'Grant only the required organizer scope'),(425,'Require recent MFA for privilege changes'),(379,'Revoke active duties and sessions promptly'),(333,'Protect the last active super admin'),(287,'Record a reason for every override')]:para(930,y,s,405,15)
para(80,185,'A teacher or student may hold an assigned staff role. Sign-in choice, email suffix or a hidden menu never grants that authority.',1250,17)
foot('Illustrative control layout. Payment profile remains inactive until the official college details are supplied and verified.');c.showPage()

header(8,'Clear workspaces for students and teachers','One identity can have several approved roles • Student data and staff authority remain separate')
for x in [50,748]:rect(x,110,642,705,'#161619',18,stroke='#3A3530')
text(78,772,'My registrations',29,bold=True);text(78,741,'Student workspace  /  Any eligible college',15,'#C4BFB5')
for y,title,status,color in [(524,'IPL Auction · ED Cell','Payment under review','#FFD57A'),(335,'Exhibition · ED Cell','Confirmed','#91E6B5')]:
    rect(78,y,586,166,'#222226',12);text(98,y+127,title,20,bold=True);text(98,y+88,status,16,color,True)
    if status=='Confirmed':button(98,y+19,223,'View my event pass')
    else:para(98,y+61,'We will notify you after payment and eligibility checks. Your pass is not ready yet.',530,14)
para(80,284,'Esports registrations appear here separately once the game rules and registration settings are approved.',565,17)
text(80,178,'Profile   •   Team invites   •   Notifications   •   Help',14,'#F5BF42')
text(776,772,'Teacher workspace',29,bold=True);text(776,741,'Verified identity  /  Explicit assignments',15,'#C4BFB5')
rect(776,487,586,203,'#222226',12);text(796,646,'Assigned judging',21,bold=True);text(796,611,'Brand War  /  ED Cell',17,'#F5BF42');para(796,584,'Score assigned candidates using the approved rubric.',530,15);button(796,505,236,'Open assigned rubric')
rect(776,280,586,181,'#201D19',12);text(796,418,'No assignment yet?',21,bold=True);para(796,391,'Request an assignment from the organizer. A teacher account alone cannot manage events, review payments or grant staff access.',530,15)
para(778,229,'Switch workspace only when another approved role exists. An active staff session still requires MFA.',565,17)
foot('Names, counts and statuses on all boards are sample concepts. They are not live records or implemented functionality.');c.showPage()
c.save()
print('Built 2 PDFs, named assets, responsive exports, event catalogue, design tokens and 40-case acceptance register.')
