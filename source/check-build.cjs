const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),rawHtml=fs.readFileSync(path.join(root,'Potion-Maker.html'),'utf8');
// Resolve the shared image variables before checking the equivalent embedded styles.
const imagePool=new Map([...rawHtml.matchAll(/(--build-image-[a-f0-9]{64}):url\("(data:[^"]+)"\);/g)].map(m=>[m[1],m[2]]));
const html=rawHtml.replace(/var\((--build-image-[a-f0-9]{64})\)/g,(_,name)=>{assert(imagePool.has(name),'Missing shared CSS image: '+name);return 'url("'+imagePool.get(name)+'")';});
assert.ok(!/__(?:ASSETS|REQUEST_BUTTON_ART|CAULDRON_BUBBLE_ART|CAULDRON_BOILING_ART|GAME_DATA|ECONOMY_DATA|COSTUME_DATA|FLAVOR_DATA|MATERIAL_TEXT|VISITOR_DIALOGUE|FAIRY_DATA|EXPEDITION_STORY_DATA|EXPEDITION_CHAPTER_DATA|CORE|STORAGE|APP)__/.test(html),'Unreplaced build token');
assert.ok(html.includes('data:font/ttf;base64,'+fs.readFileSync(path.join(root,'assets/fonts/Basic_337.ttf')).toString('base64')),'Missing embedded original game font');
assert.ok(html.includes('data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/ui/request-ok-charcoal-lavender.png')).toString('base64')),'Missing embedded Request/OK button art');
assert.ok(html.includes('background-image:url("data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/original-apk/scene/cauldron-content.png')).toString('base64')+'")'),'Missing embedded cauldron liquid art');
assert.ok(html.includes('url("data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/extracted/bubble.png')).toString('base64')+'") center/contain'),'Missing embedded Bubble cauldron effect');
assert.ok(html.includes('url("data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/extracted/boiling.png')).toString('base64')+'") 0 0/400% 400%'),'Missing embedded Boiling cauldron effect');
assert.ok(html.includes('data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/extracted/pretty-numbers.png')).toString('base64')),'Missing embedded potion level numbers');
assert.ok(html.includes('data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/extracted/max-level.png')).toString('base64')),'Missing embedded maximum level label');
for(const name of ['0','1','2','3','4','5','6','7','8','9','period'])assert.ok(html.includes('data:image/png;base64,'+fs.readFileSync(path.join(root,`assets/extracted/organized/ui/${name}.png`)).toString('base64')),'Missing embedded enhancement multiplier digit: '+name);
assert.ok(html.includes('data:audio/wav;base64,'+fs.readFileSync(path.join(root,'assets/audio/original-apk/Plop.wav')).toString('base64')),'Missing embedded original Plop sound');
assert.match(html,/Splash, small #2.*Joseph SARDIN.*BigSoundBank/);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(scripts.length,12);scripts.forEach(s=>new vm.Script(s));
const ctx=vm.createContext({Date,Math});scripts.slice(0,-1).forEach(s=>vm.runInContext(s,ctx));
for(const[name,file]of [['ORIGINAL_ACHIEVEMENT_DATA','original-achievements.json'],['GAME_DATA','game-data.json'],['ECONOMY_DATA','economy.json'],['FLAVOR_TEXT','flavor-text.json'],['MATERIAL_TEXT','material-descriptions.json'],['VISITOR_DIALOGUE','visitor-dialogue.json'],['FAIRY_DATA','fairies.json'],['EXPEDITION_STORY_DATA','expedition-stories.json'],['EXPEDITION_CHAPTER_DATA','expedition-chapters.json']]){
 const actual=vm.runInContext('JSON.stringify('+name+')',ctx),expected=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8')));assert.equal(actual,expected,file);
}
for(const[files,index]of [[['event-rush.js','core.js'],9],[['storage.js'],10],[['app.js','event-rush-ui.js'],11]]){const expected=files.map(file=>fs.readFileSync(path.join(root,'source',file),'utf8').replace(/\r\n/g,'\n')).join('\n').trim();assert.equal(scripts[index].replace(/\r\n/g,'\n').trim()===expected,true,'Stale embedded '+files.join(' + '));}
const assets=vm.runInContext('ASSETS',ctx),normalize=s=>s.toLowerCase().replace(/[_ -]/g,''),keys=new Set(Object.keys(assets).map(normalize));
for(const hand of ['PushcatHand.png','BlackcatHand.png'])assert.ok(keys.has(normalize(hand))&&assets[hand].startsWith('data:image/png;base64,'),'Missing original helper hand: '+hand);assert.ok(scripts[11].includes('showHelperCatch(helper)')&&scripts[11].includes("node.classList.remove('catching'),100")&&!scripts[11].includes('hand.animate(')&&!scripts[11].includes('cat.animate('),'Helper catch must switch the recovered stand/crouch layouts for 100 ms.');
for(const sound of ['Congratulation.wav','Enhance Failed.wav','Enhanced.wav','Plop.wav','Pushcat Hit.wav','Quest Complete.wav','Quest.wav','Sell.wav','Summon Pushcat.wav','UI Click.wav'])assert.ok(keys.has(normalize(sound)),'Missing embedded original sound: '+sound);
assert.ok(keys.has(normalize('Main Theme.wav')),'Missing owner-supplied original theme');
for(const sound of ['Enhancing.wav','Main_Theme.ogg'])assert.ok(!keys.has(normalize(sound)),'Do not bundle mismatched or duplicate long-form audio: '+sound);
const required=vm.runInContext('[...TRAVELERS.map(t=>t.portrait),...FAIRIES.map(f=>f.image),...FAMILIES.flatMap(f=>[...f.materials,...f.recipes].map(r=>r.image))]',ctx);
for(const key of required)assert.ok(keys.has(normalize(key)),'Missing embedded art: '+key);
assert.ok(Object.values(assets).every(s=>s.startsWith('data:')));
const ids=[...html.slice(0,html.indexOf('<script>')).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
const uiMarkup=html.slice(0,html.indexOf('<script>')),devStart=uiMarkup.indexOf('<details class="dev-cheats">'),devCheats=uiMarkup.slice(devStart,uiMarkup.indexOf('</details>',devStart)+10),rackNote=uiMarkup.slice(uiMarkup.indexOf('<div class="rack-note">'),uiMarkup.indexOf('</div>',uiMarkup.indexOf('<div class="rack-note">'))+6);assert.ok(devStart>=0&&devCheats.includes('id="ingredient-mode-toggle"'),'Exact-ingredient debug control must live in Dev cheats');assert.ok(!rackNote.includes('id="ingredient-mode-toggle"'),'Exact-ingredient control must not remain in the brewing rack');assert.match(devCheats,/>\+100,000,000 coins</);assert.doesNotMatch(devCheats,/>\+10,000 coins</);assert.match(uiMarkup,/Story route material/);assert.doesNotMatch(uiMarkup,/Material to gather/);assert.match(uiMarkup,/The material shapes the story and is not awarded when the trip returns\./);for(const id of ['expedition-steps','expedition-content','expedition-filters','expedition-future-list','expedition-preparation','expedition-dispatch-reasons','expedition-prepare-story','expedition-read-report','expedition-stamp-count'])assert.ok(uiMarkup.includes('id="'+id+'"'),'Guided expedition UI contains '+id);assert.match(uiMarkup,/id="expedition-story-next"/);assert.match(uiMarkup,/id="expedition-story-secondary"/);assert.ok(!uiMarkup.includes('id="expedition-chapter-list"'),'No unfiltered chapter list beneath the roster');assert.match(uiMarkup,/id="sell-button-glow"/);assert.match(uiMarkup,/id="enhancement-indicator" class="powerup-panel-indicator original-boost-indicator enhancement-boost"/);assert.match(uiMarkup,/id="protection-indicator" class="powerup-panel-indicator original-boost-indicator protection-boost"/);assert.match(uiMarkup,/id="selling-indicator" class="powerup-panel-indicator original-boost-indicator selling-boost"/);
assert.match(scripts[9],/expeditionChapterDraft/);assert.match(scripts[11],/Ready to continue/);assert.match(scripts[11],/openExpeditionChapterReport/);
assert.ok(!/<script[^>]+src=|<link[^>]+(?:href="https?:|rel="stylesheet")|<img[^>]+src="https?:/.test(html));
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new WebSocket/.test(scripts.at(-1)));
console.log(`Passed: current sources/data embedded, unique UI IDs, ${Object.keys(assets).length} local media files and no network dependency.`);

const pioScripts=[...html.matchAll(/<script data-pio-runtime>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(pioScripts.length,5);pioScripts.forEach(s=>new vm.Script(s));
const pioContext=vm.createContext({});vm.runInContext(pioScripts[3],pioContext);const pio=vm.runInContext("PIO_DATA",pioContext);
assert.ok(pio.settings.model.startsWith("data:application/octet-stream;base64,"));
assert.ok(Object.keys(pio.textures).length>=48);assert.ok(Object.values(pio.textures).every(s=>/^data:image\/(webp|png);base64,/.test(s)));
for(const group of Object.values(pio.settings.motions))for(const motion of group)assert.ok(motion.file.startsWith("data:"));
assert.equal(pioScripts[4].replace(/\r\n/g,"\n").trim(),fs.readFileSync(path.join(root,"source/pio.js"),"utf8").replace(/\r\n/g,"\n").trim());
console.log(`Passed: offline Pio model, ${Object.keys(pio.textures).length} wardrobe textures, motions, runtime syntax and current controller embedded.`);

const tia=vm.runInContext('TIA_DATA',pioContext);
const wardrobe=JSON.parse(fs.readFileSync(path.join(root,'data/costumes.json'),'utf8')).entries;
for(const c of wardrobe.filter(c=>c.texture)){
 const texture=fs.readFileSync(path.join(root,'assets/live2d',c.character,'textures',c.texture));
 let payload=texture,mime=c.texture.endsWith('.png')?'image/png':'image/webp';
 if(c.texture.endsWith('.png')){const crypto=require('node:crypto'),hash=crypto.createHash('sha256').update(texture).digest('hex'),cached=path.join(root,'dist/texture-cache','lossless-v1-'+hash+'.webp'),report=JSON.parse(fs.readFileSync(path.join(root,'dist/texture-cache/verification.json'),'utf8')),record=report.textures['assets/live2d/'+c.character+'/textures/'+c.texture];assert(record?.exactRgbaPixels&&record.sourceSha256===hash,'Unverified lossless texture: '+c.id);const encoded=fs.readFileSync(cached);if(encoded.length<texture.length){payload=encoded;mime='image/webp';}}
 assert.equal((c.character==='Pio'?pio.textures:tia.costumeTextures)[normalize(c.id)],`data:${mime};base64,`+payload.toString('base64'),'Wrong wearable texture for '+c.id);
}
assert.ok(tia.model.startsWith('data:application/octet-stream;base64,'));
assert.ok(tia.textures.length===1&&tia.textures[0].startsWith('data:image/webp;base64,'));
for(const group of Object.values(tia.motions))for(const motion of group)assert.ok(motion.file.startsWith('data:'));
assert.ok(keys.has(normalize('Tia.png'))&&keys.has(normalize('Slider-characters.png')));
console.log('Passed: Tia rig, default outfit, animations, fallback and character selector artwork embedded offline.');

for(const name of ['enhancing','enhanced','enhance-failed','plop','enhancement-package'])assert.ok(html.includes('data:image/png;base64,'+fs.readFileSync(path.join(root,`assets/extracted/${name}.png`)).toString('base64')),'Missing original shop/effect texture '+name);

const originalMap=JSON.parse(fs.readFileSync(path.join(root,'data/original-assets.json'),'utf8')).assets;
const manifest=JSON.parse(fs.readFileSync(path.join(root,'asset-manifest.json'),'utf8'));
assert.ok(!manifest.assets.some(r=>/wikia|fandom/i.test(r.url||'')&&!r.retained_event_banner),'Only event banners may retain wiki media');
for(const [key,file]of Object.entries(originalMap)){const record=manifest.assets.find(r=>r.path===file);assert.ok(record,'Uncatalogued original: '+file);assert.equal(assets[key],`data:${record.mime};base64,`+fs.readFileSync(path.join(root,file)).toString('base64'),'Wrong original artwork: '+key);}
for(const costume of wardrobe){assert.ok(assets[costume.id],'Missing costume preview: '+costume.id);if(costume.preview){assert.ok(!originalMap[costume.id],'Fan-made preview must not claim original provenance');assert.equal(assets[costume.id],'data:image/png;base64,'+fs.readFileSync(path.join(root,costume.preview)).toString('base64'));}if(costume.headwear)assert.ok(assets[costume.headwear],'Missing costume headwear');}
console.log('Passed: original media mapping, separate fan-made costume previews, and approved event-banner exception.');

const expectedBanners=vm.runInContext("EVENTS.map(event=>event.banner)",ctx).concat('Third_Event_Banner_-_English.webp');
assert.deepEqual(manifest.assets.filter(r=>r.retained_event_banner).map(r=>r.key).sort(),Array.from(expectedBanners).sort());
for(const key of expectedBanners){const record=manifest.assets.find(r=>r.key===key);assert.equal(assets[key],`data:${record.mime};base64,`+fs.readFileSync(path.join(root,record.path)).toString('base64'),'Missing historical event banner: '+key);}
console.log('Passed: all 12 historical event/promotion banners restored and embedded.');

const apkLayout=html.match(/<script data-apk-layout>([\s\S]*?)<\/script>/);
assert.ok(apkLayout,'Missing recovered APK UI module');new vm.Script(apkLayout[1]);
assert.equal(apkLayout[1],fs.readFileSync(path.join(root,'source/apk-layout.js'),'utf8'),'Stale APK layout module');
const layoutCss=fs.readFileSync(path.join(root,'source/apk-layout.css'),'utf8');assert.ok(html.includes(layoutCss),'Stale recovered layout CSS');for(const rule of ['#enhancement-indicator { left:calc(50% + 252.9 * var(--apk-u));top:calc(8 * var(--apk-u));width:calc(114 * var(--apk-u));height:calc(76 * var(--apk-u));','#protection-indicator { left:calc(50% + 49.9 * var(--apk-u));top:calc(11 * var(--apk-u));width:calc(63 * var(--apk-u));height:calc(73 * var(--apk-u));','#selling-indicator { left:calc(50% - 180 * var(--apk-u));top:calc(115.5 * var(--apk-u));width:calc(70 * var(--apk-u));height:calc(69 * var(--apk-u));','animation:apk-button-glow 1s ease-in-out infinite'])assert.ok(layoutCss.includes(rule),'Missing recovered boost/glow rule: '+rule);
console.log('Passed: recovered APK UI module syntax and exact current UI source embedding.');


assert.ok(fs.statSync(path.join(root,'Potion-Maker.html')).size<100*1024*1024,'Generated game exceeds GitHub regular Git 100 MiB limit');
console.log('Passed: generated game stays below GitHub regular Git file limit.');

assert.ok(rawHtml.includes('data:image/svg+xml;base64,'+fs.readFileSync(path.join(root,'source/potion-book-frame.svg')).toString('base64')),'Current scalable book frame embedded');
for(const id of ['catalog-book-stage','catalog-page-switch','catalog-reader-dialog','catalog-reader-body','catalog-reader-previous','catalog-reader-next'])assert.ok(rawHtml.includes('id="'+id+'"'),'Book overview/reader contains '+id);
console.log('Passed: scalable book artwork and complete-lore reader embedded offline.');
