"""Build one offline HTML game and a local, categorized asset browser."""
from pathlib import Path
import json,base64,html
ROOT=Path(__file__).resolve().parent.parent
manifest=json.loads((ROOT/'asset-manifest.json').read_text(encoding='utf-8'))
assets={}
costumes=json.loads((ROOT/'data/costumes.json').read_text(encoding='utf-8'))
normalized=lambda s:s.lower().replace('_','').replace(' ','').replace('-','')
original_assets=json.loads((ROOT/'data/original-assets.json').read_text(encoding='utf-8'))['assets']
for key,path in original_assets.items():
    record=next(r for r in manifest['assets'] if r['path']==path)
    assets[key]=f'data:{record["mime"]};base64,'+base64.b64encode((ROOT/path).read_bytes()).decode()
# Historical event banners are the sole approved wiki-media exception.
for record in manifest['assets']:
    if record.get('retained_event_banner'):
        assets[record['key']]=f'data:{record["mime"]};base64,'+base64.b64encode((ROOT/record['path']).read_bytes()).decode()
for key,path in {
    'OriginalMenuCostume.png':'assets/original-apk/ui/costumes.png',
    'OriginalMenuShop.png':'assets/original-apk/ui/in-app-products.png',
    'OriginalMenuExpeditions.png':'assets/original-apk/ui/explorations.png',
    'OriginalMenuFairy.png':'assets/original-apk/ui/fairies.png',
    'OriginalMenuItems.png':'assets/original-apk/ui/items.png',
    'OriginalMenuStats.png':'assets/original-apk/ui/stats.png',
    'OriginalMenuAchievements.png':'assets/original-apk/ui/achievements.png',
    'OriginalMenuSave.png':'assets/original-apk/ui/archive.png',
    'OriginalMenuMail.png':'assets/original-apk/ui/mailbox.png',
    'OriginalMenuSettings.png':'assets/original-apk/ui/settings.png',
    'OriginalMenuHelp.png':'assets/original-apk/ui/help.png',
    'OriginalMenuContest.png':'assets/original-apk/ui/contest.png',
}.items():
    assets[key]='data:image/png;base64,'+base64.b64encode((ROOT/path).read_bytes()).decode()
for name in ['Congratulation.wav','Enhance Failed.wav','Enhanced.wav','Plop.wav','Pushcat Hit.wav','Quest Complete.wav','Quest.wav','Sell.wav','Summon Pushcat.wav','UI Click.wav']:
    assets[name]='data:audio/wav;base64,'+base64.b64encode((ROOT/'assets/audio/original-apk'/name).read_bytes()).decode()
assets['PushcatHand.png']='data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized/helpers/pushcat-hand.png').read_bytes()).decode()
assets['BlackcatHand.png']='data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized/helpers/blackcat-hand.png').read_bytes()).decode()
for key,path in {'OriginalPushcatSummon.png':'helpers/summon-pushcat.png','OriginalQuestMark.png':'ui/quest-exclamation.png',**{f'OriginalTraveler-{key}.png':f'characters/{name}.png' for key,name in {'neet':'healer','dolbur':'warrior','tirami':'tirami','claire':'knight','luke':'sorceress','piria':'thief','charlotte':'charlotte','demian':'demian','daisy':'daisy','kyle':'kyle'}.items()}}.items():
    assets[key]='data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized'/path).read_bytes()).decode()
for key,name in {
    'Character':'characters','Costume':'costumes','Shop':'in-app-products','Request':'explorations',
    'Fairy':'fairies','Items':'items','Stats':'stats','Achievements':'achievements','Save':'archive',
    'Mail':'mailbox','Settings':'settings','Help':'help','Contest':'contest',
}.items():
    folder='costumes' if key=='Costume' else 'ui'
    assets['OriginalMenuLabel'+key+'.png']='data:image/png;base64,'+base64.b64encode((ROOT/f'assets/extracted/organized/{folder}/{name}-label-english.png').read_bytes()).decode()
assets['OriginalMenuCharacter.png']='data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized/ui/characters.png').read_bytes()).decode()
assets['OriginalMenuComingSoon.png']='data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized/ui/coming-soon.png').read_bytes()).decode()
for name in [str(number) for number in range(10)]:
    assets[f'PrettyDigit{name}.png']='data:image/png;base64,'+base64.b64encode((ROOT/f'assets/extracted/organized/ui/{name}.png').read_bytes()).decode()
assets['PrettyPercent.png']='data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized/ui/percent.png').read_bytes()).decode()
assets['PrettyPeriod.png']='data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized/ui/period.png').read_bytes()).decode()
for key,name in {'OriginalEnhancing.png':'enhancing','OriginalEnhanced.png':'enhanced','OriginalEnhanceFailed.png':'enhance-failed','OriginalPlop.png':'plop','OriginalEnhancementPack.png':'enhancement-package'}.items():
    assets[key]='data:image/png;base64,'+base64.b64encode((ROOT/f'assets/extracted/{name}.png').read_bytes()).decode()
for family in ['Life','Mana','Stamina']:
    for tier in range(1,26):
        assets[f'{family}_Material{tier}.png']='data:image/png;base64,'+base64.b64encode((ROOT/f'assets/original-apk/materials/{family.lower()}-material{tier}.png').read_bytes()).decode()
        assets[f'{family}_Potion{tier}.png']='data:image/png;base64,'+base64.b64encode((ROOT/f'assets/original-apk/potions/{family.lower()}-potion{tier}.png').read_bytes()).decode()

template=(ROOT/'source/index.template.html').read_text(encoding='utf-8')
template=template.replace('__GAME_FONT__','data:font/ttf;base64,'+base64.b64encode((ROOT/'assets/fonts/Basic_337.ttf').read_bytes()).decode())

template=template.replace('__REQUEST_BUTTON_ART__','data:image/png;base64,'+base64.b64encode((ROOT/'assets/ui/request-ok-charcoal-lavender.png').read_bytes()).decode())
template=template.replace('__ORIGINAL_CAULDRON_ART__','data:image/png;base64,'+base64.b64encode((ROOT/'assets/original-apk/scene/cauldron.png').read_bytes()).decode())
template=template.replace('__ORIGINAL_BREWING_BACKGROUND__','data:image/png;base64,'+base64.b64encode((ROOT/'assets/original-apk/scene/brewing-background.png').read_bytes()).decode())
template=template.replace('__ORIGINAL_POTION_SLOT__','data:image/png;base64,'+base64.b64encode((ROOT/'assets/original-apk/ui/brewing/potion-slot.png').read_bytes()).decode())
template=template.replace('__ORIGINAL_CAULDRON_CONTENT__','data:image/png;base64,'+base64.b64encode((ROOT/'assets/original-apk/scene/cauldron-content.png').read_bytes()).decode())
template=template.replace('__CAULDRON_BUBBLE_ART__','data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/bubble.png').read_bytes()).decode())
template=template.replace('__CAULDRON_BOILING_ART__','data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/boiling.png').read_bytes()).decode())
mobile_ui=(ROOT/'source/original-mobile-ui.css').read_text(encoding='utf-8')
for token,path in {
    '__APK_ORDERS_BOOK__':'assets/extracted/organized/ui/book.png',
    '__APK_COIN_FRAME__':'assets/extracted/organized/ui/coin-frame.png',
    '__APK_WOOD_TOP__':'assets/extracted/organized/ui/background-top.png',
    '__APK_WOOD_BOTTOM__':'assets/extracted/organized/ui/background-bottom.png',
    '__APK_MENU_ICON__':'assets/extracted/organized/ui/miscellaneous.png',
    '__APK_BIG_BUTTON__':'assets/extracted/organized/ui/big-button.png',
    '__APK_ITEM_SLOT__':'assets/extracted/organized/ui/item-slot.png',
    '__APK_UPGRADES_ICON__':'assets/extracted/organized/ui/upgrades.png',
    '__APK_SCENE_BACKGROUND__':'assets/original-apk/scene/brewing-background.png',
    '__APK_CAULDRON_ART__':'assets/original-apk/scene/cauldron.png',
    '__APK_RACK_PAPER__':'assets/extracted/organized/ui/background-texture2d-sharedassets0-assets-182.png',
    '__APK_BOARD_PAPER__':'assets/extracted/organized/ui/background-texture2d-sharedassets0-assets-167.png',
    '__APK_GEARS__':'assets/extracted/organized/ui/cover.png',
    '__APK_QUEST_FRAME__':'assets/extracted/organized/ui/quest-circle.png',
    '__APK_QUEST_LABEL__':'assets/extracted/organized/ui/quest-label.png',
    '__APK_PROGRESS_LABEL__':'assets/extracted/organized/ui/quest-progressing-label.png',
    '__APK_QUEST_BACK__':'assets/extracted/organized/ui/quest-gauge-back.png',
    '__APK_QUEST_FILL__':'assets/extracted/organized/ui/quest-gauge-fill.png',
    '__APK_PROGRESS_FILL__':'assets/extracted/organized/ui/quest-progressing-gauge-fill.png',
    '__APK_RATE_LABEL__':'assets/extracted/organized/potions/success-rate-label.png',
    '__APK_RATE_UNDERLINE__':'assets/extracted/organized/potions/success-rate-underline.png',
    '__APK_ITEM_NAME__':'assets/extracted/organized/ui/item-name-frame.png',
    '__APK_PRETTY_NUMBERS__':'assets/extracted/pretty-numbers.png',
    '__APK_MAX_LEVEL__':'assets/extracted/max-level.png',
}.items():
    mobile_ui=mobile_ui.replace(token,'data:image/png;base64,'+base64.b64encode((ROOT/path).read_bytes()).decode())
template=template.replace('__ORIGINAL_MOBILE_UI__',mobile_ui)
for token,name in [('__APK_MENU_PANEL__','background-big.png'),('__APK_MENU_CLOSE__','close.png')]:
    template=template.replace(token,'data:image/png;base64,'+base64.b64encode((ROOT/'assets/extracted/organized/ui'/name).read_bytes()).decode())
for token,value in [('__ASSETS__',json.dumps(assets)),('__UPDATE_DATA__',(ROOT/'data/updates.json').read_text(encoding='utf-8')),('__EVENT_STORIES__',(ROOT/'data/event-stories.json').read_text(encoding='utf-8')),('__EXPEDITION_JOBS__',(ROOT/'data/expedition-jobs.json').read_text(encoding='utf-8')),('__EXPEDITION_STORY_DATA__',(ROOT/'data/expedition-stories.json').read_text(encoding='utf-8')),('__EXPEDITION_CHAPTER_DATA__',(ROOT/'data/expedition-chapters.json').read_text(encoding='utf-8')),('__GAME_DATA__',(ROOT/'data/game-data.json').read_text(encoding='utf-8')),('__ECONOMY_DATA__',(ROOT/'data/economy.json').read_text(encoding='utf-8')),('__COSTUME_DATA__',(ROOT/'data/costumes.json').read_text(encoding='utf-8')),('__FLAVOR_DATA__',(ROOT/'data/flavor-text.json').read_text(encoding='utf-8')),('__MATERIAL_TEXT__',(ROOT/'data/material-descriptions.json').read_text(encoding='utf-8')),('__VISITOR_DIALOGUE__',(ROOT/'data/visitor-dialogue.json').read_text(encoding='utf-8')),('__FAIRY_DATA__',(ROOT/'data/fairies.json').read_text(encoding='utf-8')),('__ACHIEVEMENT_LORE__',(ROOT/'data/achievement-lore.json').read_text(encoding='utf-8')),('__STORAGE__',(ROOT/'source/storage.js').read_text(encoding='utf-8')),('__CORE__',(ROOT/'source/core.js').read_text(encoding='utf-8')),('__APP__',(ROOT/'source/app.js').read_text(encoding='utf-8'))]:template=template.replace(token,value)
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
pio_scripts+='<script data-pio-runtime>const PIO_DATA='+json.dumps({'settings':pio_settings,'textures':pio_textures})+';const TIA_DATA='+json.dumps(tia_settings)+';const BREWER_DIALOGUE='+(ROOT/'data/brewer-dialogue.json').read_text(encoding='utf-8')+';</script>'
pio_scripts+='<script data-pio-runtime>'+(ROOT/'source/pio.js').read_text(encoding='utf-8')+'</script>'
template=template.replace('</style>',(ROOT/'source/apk-layout.css').read_text(encoding='utf-8')+'</style>',1)
template=template.replace('</body>',pio_scripts+'<script data-apk-layout>'+(ROOT/'source/apk-layout.js').read_text(encoding='utf-8')+'</script></body>')
(ROOT/'Potion-Maker.html').write_text(template,encoding='utf-8')
cards=[]
for r in manifest['assets']:
    if r['status']!='downloaded':continue
    path=html.escape(r['path'],quote=True);name=html.escape(r['key']);group=html.escape('/'.join(Path(r['path']).parts[1:-1]))
    preview=f'<audio controls preload="none" src="{path}"></audio>'if r['mime'].startswith('audio/')else f'<img loading="lazy" src="{path}" alt="{name}">'
    source_link='<small>'+html.escape(r.get('source','Original game extraction'))+'</small>'
    cards.append(f'<article data-group="{group}"><a href="{path}" target="_blank">{preview}</a><b>{name}</b><small>{group}</small>{source_link}</article>')
groups=sorted({str(Path(r['path']).parent).replace('\\','/').removeprefix('assets/') for r in manifest['assets'] if r['status']=='downloaded'})
options=''.join(f'<option>{html.escape(g)}</option>'for g in groups)
gallery=f'''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>PMG · Local asset library</title><style>body{{font:15px system-ui;background:#f3ede6;color:#554139;margin:30px}}h1{{font:32px Georgia}}nav{{display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap}}input,select{{padding:10px;max-width:100%}}main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:15px}}article{{padding:15px;background:#fff9ef;border:1px solid #d4c4c2;border-radius:12px;display:flex;flex-direction:column;gap:8px;overflow-wrap:anywhere}}article[hidden]{{display:none}}article img{{width:100%;height:150px;object-fit:contain}}article audio{{width:100%}}small{{color:#8a766d}}a{{color:#80568a}}</style><h1>Local asset library</h1><p>{len(cards)} local media files · Original assets credited to Sinsiroad and their original creators. Screenshots and atlases are references, not ready-made animations.</p><nav><a href="Potion-Maker.html">Play the game</a><input id="search" placeholder="Search filenames" aria-label="Search filenames"><select id="group" aria-label="Asset category"><option value="">All folders</option>{options}</select></nav><main>{''.join(cards)}</main><script>const filter=()=>{{const q=document.getElementById('search').value.toLowerCase(),g=document.getElementById('group').value;document.querySelectorAll('article').forEach(a=>a.hidden=!(a.textContent.toLowerCase().includes(q)&&(!g||a.dataset.group===g)));}};document.getElementById('search').oninput=filter;document.getElementById('group').onchange=filter;</script></html>'''
(ROOT/'Asset-Library.html').write_text(gallery,encoding='utf-8')
print('Built offline game',len(template),'characters; embedded',len(assets),'media files; library',len(cards))
