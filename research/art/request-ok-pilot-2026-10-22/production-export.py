from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import numpy as np, json, hashlib, base64, shutil
from pathlib import Path
P=Path(r'C:\Users\Toska\Documents\GitHub\PMG\research\art\request-ok-pilot-2026-10-22')
SRC=P/'charcoal-lavender-background-v2.png'
originals={n:hashlib.sha256((P/n).read_bytes()).hexdigest() for n in ['charcoal-lavender-background-v2.png','charcoal-lavender-mockup.png']}
a=np.array(Image.open(SRC).convert('RGBA'))
mask=a[:,:,3]>=128
bbox=Image.fromarray((mask*255).astype('uint8')).getbbox()
# Only export alpha is sanitized. Approved source RGB survives unchanged wherever retained.
a[:,:,3]=mask.astype('uint8')*255
a[~mask,:3]=0
cropped=Image.fromarray(a).crop(bbox)
natural_w=round(cropped.width*92/cropped.height)
natural=cropped.resize((natural_w,92),Image.Resampling.LANCZOS)
CAP=40
strip=Image.new('RGBA',(264,92))
strip.paste(natural.crop((0,0,CAP,92)),(0,0))
strip.paste(natural.crop((CAP,0,natural_w-CAP,92)).resize((184,92),Image.Resampling.LANCZOS),(CAP,0))
strip.paste(natural.crop((natural_w-CAP,0,natural_w,92)),(224,0))
# PNG compression only; no indexed palette or lossy color quantization.
arr=np.array(strip); arr[arr[:,:,3]<=8]=0; strip=Image.fromarray(arr)
strip.save(P/'charcoal-lavender-production-v3-2x.png',optimize=True,compress_level=9)

def render(w):
    out=Image.new('RGBA',(w,46))
    out.paste(strip.crop((0,0,40,92)).resize((20,46),Image.Resampling.LANCZOS),(0,0))
    out.paste(strip.crop((40,0,224,92)).resize((w-40,46),Image.Resampling.LANCZOS),(20,0))
    out.paste(strip.crop((224,0,264,92)).resize((20,46),Image.Resampling.LANCZOS),(w-20,0))
    clean=np.array(out); clean[clean[:,:,3]<=8]=0
    return Image.fromarray(clean)
renders={w:render(w) for w in [293,132]}
for w,im in renders.items(): im.save(P/f'charcoal-lavender-production-v3-{w}x46.png',optimize=True,compress_level=9)
FONT=Path(r'C:\Windows\Fonts'); font=ImageFont.truetype(str(FONT/'seguisb.ttf'),14); title=ImageFont.truetype(str(FONT/'seguisb.ttf'),24); sub=ImageFont.truetype(str(FONT/'segoeui.ttf'),13); small=ImageFont.truetype(str(FONT/'segoeui.ttf'),12)
cream='#eee8db'; gold='#ead080'; ink='#282433'

def label(draw,xy,text,color):
    x,y=xy; b=draw.textbbox((0,0),text,font=font); draw.text((x-(b[2]-b[0])/2,y-(b[3]-b[1])/2-b[1]),text,font=font,fill=color)

def state_art(im,state):
    if state in ['Hover','Pressed']:
        alpha=im.getchannel('A'); im=ImageEnhance.Brightness(im.convert('RGB')).enhance(1.10 if state=='Hover' else .92).convert('RGBA'); im.putalpha(alpha)
    return im

for name,bg,fg,line in [('dark','#171b22','#eee8db','#aeb3be'),('light','#f3eee6','#282433','#635a69')]:
    sheet=Image.new('RGB',(800,900),bg); d=ImageDraw.Draw(sheet)
    d.text((30,24),'Charcoal + lavender — production v3',font=title,fill=fg)
    d.text((30,62),f'STATIC COMPOSITE / {name.upper()} SURFACE / actual button pixels',font=sub,fill=line)
    d.text((30,86),'Live-label-equivalent: Segoe UI Semibold 14 px · labels are separate from art',font=small,fill=line)
    for si,w in enumerate([293,132]):
        top=135+si*340
        d.text((30,top),f'{w} × 46 px · fixed 20 px end caps',font=sub,fill=fg)
        for i,state in enumerate(['Normal','Hover','Pressed','Keyboard focus']):
            y=top+44+i*66
            for j,text in enumerate(['Request','OK']):
                x=45+j*(w+24)
                if state=='Keyboard focus':
                    ring=Image.new('RGBA',((w+16)*4,62*4)); rd=ImageDraw.Draw(ring)
                    rd.rounded_rectangle((4,4,(w+15)*4,60*4),radius=23*4,outline=ink,width=8)
                    rd.rounded_rectangle((12,12,(w+13)*4,58*4),radius=21*4,outline=gold,width=8)
                    ring=ring.resize((w+16,62),Image.Resampling.LANCZOS); sheet.paste(ring,(x-8,y-8),ring)
                dy=1 if state=='Pressed' else 0
                sheet.paste(state_art(renders[w],state),(x,y+dy),state_art(renders[w],state))
                label(d,(x+w/2,y+23+dy),text,cream)
            d.text((770,y+17),state.replace('Keyboard focus','Focus'),font=small,fill=line,anchor='ra')
    d.text((30,829),'Hover: art +10% · Pressed: art −8%, art and label +1 px down',font=small,fill=line)
    d.text((30,851),'Focus: separate 2 px gold ring + 2 px dark outer ring; 3 px clear gap',font=small,fill=line)
    d.text((30,873),'Static review only. Browser integration, native focus and layout remain unverified.',font=small,fill=line)
    sheet.save(P/f'production-preview-{name}.png',optimize=True)

# Edge inspection sheet, including pixel enlargement and two contrasting surfaces.
proof=Image.new('RGB',(960,640),'#d9d6ce'); d=ImageDraw.Draw(proof)
d.text((24,20),'ALPHA EDGE INSPECTION — v3 / static export',font=title,fill=ink)
d.text((24,58),'Top: native pixels. Bottom: 4× nearest-neighbor enlargement (no smoothing).',font=sub,fill=ink)
for j,(bg,tag) in enumerate([('#171b22','DARK'),('#ffffff','WHITE')]):
    x=24+j*472; d.rectangle((x,95,x+447,615),fill=bg)
    d.text((x+15,108),tag,font=sub,fill=('#eee8db' if j==0 else ink))
    for k,w in enumerate([293,132]):
        y=147+k*72; proof.paste(renders[w],(x+24,y),renders[w])
    detail=renders[132].crop((0,0,60,46)).resize((240,184),Image.Resampling.NEAREST)
    proof.paste(detail,(x+24,330),detail)
    d.text((x+24,540),'Left cap + top/bottom border at 4×',font=small,fill=('#eee8db' if j==0 else ink))
proof.save(P/'production-alpha-inspection.png',optimize=True)

# Quantitative review of label area and alpha exports.
def luminance(c):
    v=np.asarray(c,dtype=float)/255
    v=np.where(v<=.04045,v/12.92,((v+.055)/1.055)**2.4)
    return v[...,0]*.2126+v[...,1]*.7152+v[...,2]*.0722
text_lum=float(luminance([238,232,219]))
contrasts={}
for w,im in renders.items():
    contrasts[str(w)]={}
    for state in ['Normal','Hover','Pressed']:
        ar=np.array(state_art(im,state)); center=ar[12:34,w//2-32:w//2+32,:3]
        l=luminance(center); contrasts[str(w)][state]=round(float(((text_lum+.05)/(l+.05)).min()),2)
left_equal=bool(np.array_equal(np.array(renders[293])[:,:20],np.array(renders[132])[:,:20]))
right_equal=bool(np.array_equal(np.array(renders[293])[:,-20:],np.array(renders[132])[:,-20:]))
files={}
for name in ['charcoal-lavender-production-v3-2x.png','charcoal-lavender-production-v3-293x46.png','charcoal-lavender-production-v3-132x46.png','production-preview-dark.png','production-preview-light.png','production-alpha-inspection.png']:
    im=Image.open(P/name); ar=np.asarray(im); files[name]={'dimensions_px':list(im.size),'bytes':(P/name).stat().st_size,'mode':im.mode}
    if im.mode=='RGBA':
        al=ar[:,:,3]; files[name].update({'alpha_range':[int(al.min()),int(al.max())],'nonzero_alpha_bounds_exclusive':im.getchannel('A').getbbox(),'transparent_rgb_zero':bool(np.all(ar[al==0,:3]==0))})
checks={'original_sha256':originals,'originals_unchanged':all(hashlib.sha256((P/n).read_bytes()).hexdigest()==h for n,h in originals.items()),'source_crop_exclusive':bbox,'source_crop_size':list(cropped.size),'alpha_export_rule':'source alpha <128 removed; retained source alpha normalized to255; RGB retained inside silhouette; alpha-aware Lanczos reduction; export alpha <=8 zeroed to remove resampling ringing','natural_2x_size':[natural_w,92],'canonical_2x_size':[264,92],'three_slice_source_x':[0,40,224,264],'three_slice_css_caps_px':20,'render_left_caps_pixel_identical':left_equal,'render_right_caps_pixel_identical':right_equal,'minimum_label_area_contrast':contrasts,'files':files}
(P/'production-checks.json').write_text(json.dumps(checks,indent=2)+'\n',encoding='utf-8')
print(json.dumps(checks,indent=2))

# Deliver a self-contained local preview with true DOM labels and independent focus feedback.
b64=base64.b64encode((P/'charcoal-lavender-production-v3-2x.png').read_bytes()).decode()
css='''*{box-sizing:border-box}body{margin:0;padding:28px;font:14px "Segoe UI",sans-serif;background:#aeb0b5;color:#282433}h1{font-size:24px;margin:0 0 12px}p{max-width:900px;line-height:1.5}.surfaces{display:flex;gap:24px;flex-wrap:wrap}.surface{padding:24px 28px 34px;border-radius:14px;width:700px}.dark{background:#171b22;color:#eee8db}.light{background:#f3eee6;color:#282433}h2{font-size:18px;margin:0 0 24px}h3{font-size:14px;margin:28px 0 20px}.row{display:flex;align-items:center;gap:24px;margin:22px 0;position:relative}.state{font-size:12px;width:90px}.pair{display:flex;gap:24px}.face{appearance:none;position:relative;border:0;background:transparent;padding:0;isolation:isolate;width:293px;height:46px;flex:none;cursor:pointer;color:#eee8db;font:600 14px "Segoe UI",sans-serif;line-height:46px}.small .face{width:132px}.skin{position:absolute;inset:0;display:grid;grid-template-columns:20px minmax(0,1fr) 20px;pointer-events:none}.skin i{display:block;background-image:var(--art);background-repeat:no-repeat;background-size:132px 46px}.skin i:nth-child(1){background-position:left top}.skin i:nth-child(2){background-size:143.4782608695652% 46px;background-position:center top}.skin i:nth-child(3){background-position:right top}.label{position:relative;z-index:1;display:block;pointer-events:none}.face:hover .skin,.demo-hover .skin{filter:brightness(1.10)}.face:active .skin,.demo-pressed .skin{filter:brightness(.92);transform:translateY(1px)}.face:active .label,.demo-pressed .label{transform:translateY(1px)}.face:focus{outline:none}.face:focus-visible::after,.demo-focus::after{content:"";position:absolute;inset:-5px;border:2px solid #ead080;border-radius:21px;outline:2px solid #282433;pointer-events:none}.caption{font-size:12px;line-height:1.4;opacity:.8}.state-grid .row{display:block}.state-grid .state{display:block;width:auto;margin-bottom:12px}.interactive{display:flex;gap:24px;flex-wrap:wrap}'''
button=lambda word,cl='':f'<button class="face {cl}" type="button"><span class="skin" aria-hidden="true"><i></i><i></i><i></i></span><span class="label">{word}</span></button>'
sections=''
for surface in ['dark','light']:
    sections+=f'<section class="surface {surface}"><h2>{surface.title()} surface</h2>'
    for w in [293,132]:
        sections+=f'<div class="state-grid {"small" if w==132 else ""}"><h3>{w} × 46 CSS px</h3>'
        for state,cl in [('Normal',''),('Hover','demo-hover'),('Pressed','demo-pressed'),('Keyboard focus','demo-focus')]:
            sections+=f'<div class="row"><span class="state">{state}</span><div class="pair">{button("Request",cl)}{button("OK",cl)}</div></div>'
        sections+='</div>'
    sections+='<h3>Interactive sample — pointer and Tab</h3><div class="interactive small">'+button('Request')+button('OK')+'</div><p class="caption">Preview controls have no game action. Request opens an expedition chapter; OK accepts a potion order in the existing game. Keep those helper captions in the final layout.</p></section>'
html='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMG production art preview — v3</title><style>:root{--art:url("data:image/png;base64,'+b64+'") }'+css+'</style><h1>PMG Request / OK — production art v3</h1><p>Standalone review preview. Labels are live DOM text; button art is blank. State rows are staged examples. The interactive samples support native pointer and keyboard focus. This file has not been browser-verified and is not integrated with the game.</p><div class="surfaces">'+sections+'</div></html>'
(P/'production-preview.html').write_text(html,encoding='utf-8')
# Save rejected built-in edit for traceability; it does not feed the final export.
shutil.copyfile(r'C:\Users\Toska\.codex\generated_images\01a162d9-7296-7c50-b8f4-69d7e1050a41\exec-9e673c5d-b63a-4f26-b955-a0ec95070f89.png',P/'iterations'/'charcoal-lavender-production-imagegen-rejected.png')


