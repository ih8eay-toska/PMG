"""Build one offline HTML game and a local, categorized asset browser."""
from pathlib import Path
import json,base64,html
ROOT=Path(__file__).resolve().parent.parent
manifest=json.loads((ROOT/'asset-manifest.json').read_text(encoding='utf-8'))
assets={}
used={'Pio_Main.jpg','Default_Costume.png','Neet_Portrait.png','DolburPortrait.png','TiramiMain.png','Main_Theme.ogg','EnhancementFailureProtection.png','EnhancementBonus.png','SellBonus.png','Gem.png','Nyan-Ticket.png'}
fairies=json.loads((ROOT/'data/fairies.json').read_text(encoding='utf-8'))
used.update(f['image'] for f in fairies['entries'])
costumes=json.loads((ROOT/'data/costumes.json').read_text(encoding='utf-8'))
used.update(c['id'] for c in costumes['entries'])
used.add('CostumeIcon.png')
used.add('Game_icon.png')
used.add('App_icon.png')
used.add('AchievementIcon.png')
used.add('Coin.png')
used.add('Contest.png')
used.update(['QuestMark.png','RewardIcon1.png','RewardIcon2.png','RewardIconFairy.png'])
used.update(['TiaWho.png','PiaDialogue.png','TiaDialogue.png','BlackcatDialogue.png','PushcatDialogue.png'])
used.add('StarCollectable.png')
used.add('Likeability.png')
used.update(['Tia.png','Slider-characters.png','pio_slider.webp','tia_slider.webp'])
used.update(['ClairePortrait.png', 'LukePortrait.png', 'PiriaPortrait.png', 'CharlottePortraitNormal.png', 'DemianPortrait.png', 'DaisyPortrait.png', 'KylePortrait.png', 'CharlottePortraitHappy.png', 'CharlottePortraitDisappointed.png', 'DaisyPortraitHappy.png', 'DaisyPortraitDisappointed.png'])
for f in ['Life','Mana','Stamina']:
    used.update(f'{f}_{kind}{tier}.png' for kind in ['Material','Potion'] for tier in range(1,26))
normalized=lambda s:s.lower().replace('_','').replace(' ','').replace('-','')
for record in manifest['assets']:
    if record['status']!='downloaded':continue
    key=record['key']
    if key in used or normalized(key) in {normalized(k) for k in used}:
        data=(ROOT/record['path']).read_bytes()
        assets[key]=f'data:{record["mime"]};base64,'+base64.b64encode(data).decode()
for key,path in [('pio_slider.webp','assets/references/pio_slider.webp'),('tia_slider.webp','assets/references/tia_slider.webp')]:
    assets[key]='data:image/webp;base64,'+base64.b64encode((ROOT/path).read_bytes()).decode()
template=(ROOT/'source/index.template.html').read_text(encoding='utf-8')
for token,value in [('__ASSETS__',json.dumps(assets)),('__GAME_DATA__',(ROOT/'data/game-data.json').read_text(encoding='utf-8')),('__COSTUME_DATA__',(ROOT/'data/costumes.json').read_text(encoding='utf-8')),('__FLAVOR_DATA__',(ROOT/'data/flavor-text.json').read_text(encoding='utf-8')),('__MATERIAL_TEXT__',(ROOT/'data/material-descriptions.json').read_text(encoding='utf-8')),('__VISITOR_DIALOGUE__',(ROOT/'data/visitor-dialogue.json').read_text(encoding='utf-8')),('__FAIRY_DATA__',(ROOT/'data/fairies.json').read_text(encoding='utf-8')),('__ACHIEVEMENT_LORE__',(ROOT/'data/achievement-lore.json').read_text(encoding='utf-8')),('__STORAGE__',(ROOT/'source/storage.js').read_text(encoding='utf-8')),('__CORE__',(ROOT/'source/core.js').read_text(encoding='utf-8')),('__APP__',(ROOT/'source/app.js').read_text(encoding='utf-8'))]:template=template.replace(token,value)
template=template.replace('__ACHIEVEMENT_LORE__',(ROOT/'data/achievement-lore.json').read_text(encoding='utf-8'))
pio_root=ROOT/'assets/live2d/Pio'
data_url=lambda path,mime:'data:'+mime+';base64,'+base64.b64encode(path.read_bytes()).decode()
pio_settings=json.loads((pio_root/'index.json').read_text(encoding='utf-8'))
pio_settings['model']=data_url(pio_root/'model.moc','application/octet-stream')
for group in pio_settings['motions'].values():
    for motion in group:motion['file']=data_url(pio_root/motion['file'],'application/octet-stream')
for group,filename in [('success','Success.mtn'),('failure','Fail.mtn')]:
    pio_settings['motions'][group]=[{'file':data_url(pio_root/'motions'/filename,'application/octet-stream')}]
pio_textures={normalized(p.stem+'.png'):data_url(p,'image/webp') for p in (pio_root/'textures').glob('*.webp')}
pio_scripts=''.join('<script data-pio-runtime>'+ (ROOT/'assets/live2d/vendor'/name).read_text(encoding='utf-8').replace('</script','<\\/script')+'</script>' for name in ['pixi.min.js','live2d.min.js','cubism2.min.js'])
tia_root=ROOT/'assets/live2d/Tia'
tia_settings=json.loads((tia_root/'index.json').read_text(encoding='utf-8'))
tia_settings['model']=data_url(tia_root/'model.moc','application/octet-stream')
for group in tia_settings['motions'].values():
    for motion in group:motion['file']=data_url(tia_root/motion['file'],'application/octet-stream')
for group,filename in [('success','Success.mtn'),('failure','Fail.mtn')]:
    tia_settings['motions'][group]=[{'file':data_url(tia_root/'motions'/filename,'application/octet-stream')}]
tia_settings['textures']=[data_url(tia_root/'textures/default-costume.webp','image/webp')]
tia_settings['costumeTextures']={normalized(c['id']):data_url(tia_root/'textures'/c['texture'],'image/webp') for c in costumes['entries'] if c.get('character')=='Tia' and c.get('texture')}
pio_scripts+='<script data-pio-runtime>const PIO_DATA='+json.dumps({'settings':pio_settings,'textures':pio_textures})+';const TIA_DATA='+json.dumps(tia_settings)+';</script>'
pio_scripts+='<script data-pio-runtime>'+(ROOT/'source/pio.js').read_text(encoding='utf-8')+'</script>'
template=template.replace('</body>',pio_scripts+'</body>')
(ROOT/'Potion-Maker.html').write_text(template,encoding='utf-8')
cards=[]
for r in manifest['assets']:
    if r['status']!='downloaded':continue
    path=html.escape(r['path'],quote=True);name=html.escape(r['key']);group=html.escape('/'.join(Path(r['path']).parts[1:-1]))
    preview=f'<audio controls preload="none" src="{path}"></audio>'if r['mime'].startswith('audio/')else f'<img loading="lazy" src="{path}" alt="{name}">'
    cards.append(f'<article data-group="{group}"><a href="{path}" target="_blank">{preview}</a><b>{name}</b><small>{group}</small><a href="{html.escape(r["url"],quote=True)}" target="_blank" rel="noreferrer">Original wiki file</a></article>')
groups=sorted({str(Path(r['path']).parent).replace('\\','/').removeprefix('assets/') for r in manifest['assets'] if r['status']=='downloaded'})
options=''.join(f'<option>{html.escape(g)}</option>'for g in groups)
gallery=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMG · Local asset library</title><style>body{{font:15px system-ui;background:#f3ede6;color:#554139;margin:30px}}h1{{font:32px Georgia}}nav{{display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap}}input,select{{padding:10px;max-width:100%}}main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:15px}}article{{padding:15px;background:#fff9ef;border:1px solid #d4c4c2;border-radius:12px;display:flex;flex-direction:column;gap:8px;overflow-wrap:anywhere}}article[hidden]{{display:none}}article img{{width:100%;height:150px;object-fit:contain}}article audio{{width:100%}}small{{color:#8a766d}}a{{color:#80568a}}</style><h1>Local asset library</h1><p>{len(cards)} verified media files · Original assets credited to Sinsiroad and their original creators. Screenshots and atlases are references, not ready-made animations.</p><nav><a href="Potion-Maker.html">Play the game</a><input id="search" placeholder="Search filenames" aria-label="Search filenames"><select id="group" aria-label="Asset category"><option value="">All folders</option>{options}</select></nav><main>{''.join(cards)}</main><script>const filter=()=>{{const q=document.getElementById('search').value.toLowerCase(),g=document.getElementById('group').value;document.querySelectorAll('article').forEach(a=>a.hidden=!(a.textContent.toLowerCase().includes(q)&&(!g||a.dataset.group===g)));}};document.getElementById('search').oninput=filter;document.getElementById('group').onchange=filter;</script></html>'''
(ROOT/'Asset-Library.html').write_text(gallery,encoding='utf-8')
print('Built offline game',len(template),'characters; embedded',len(assets),'media files; library',len(cards))
