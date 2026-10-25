const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'Potion-Maker.html'),'utf8');
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
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(scripts.length,11);scripts.forEach(s=>new vm.Script(s));
const ctx=vm.createContext({Date,Math});scripts.slice(0,-1).forEach(s=>vm.runInContext(s,ctx));
for(const[name,file]of [['GAME_DATA','game-data.json'],['ECONOMY_DATA','economy.json'],['FLAVOR_TEXT','flavor-text.json'],['MATERIAL_TEXT','material-descriptions.json'],['VISITOR_DIALOGUE','visitor-dialogue.json'],['FAIRY_DATA','fairies.json'],['EXPEDITION_STORY_DATA','expedition-stories.json'],['EXPEDITION_CHAPTER_DATA','expedition-chapters.json']]){
 const actual=vm.runInContext('JSON.stringify('+name+')',ctx),expected=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8')));assert.equal(actual,expected,file);
}
for(const[file,index]of [['core.js',8],['storage.js',9],['app.js',10]])assert.equal(scripts[index].trim(),fs.readFileSync(path.join(root,'source',file),'utf8').trim(),'Stale embedded '+file);
const assets=vm.runInContext('ASSETS',ctx),normalize=s=>s.toLowerCase().replace(/[_ -]/g,''),keys=new Set(Object.keys(assets).map(normalize));
for(const hand of ['PushcatHand.png','BlackcatHand.png'])assert.ok(keys.has(normalize(hand))&&assets[hand].startsWith('data:image/png;base64,'),'Missing original helper hand: '+hand);assert.ok(scripts[10].includes('hand.animate(')&&!scripts[10].includes('cat.animate('),'Helper catch must animate the hand, not move the cat.');
for(const sound of ['Congratulation.wav','Enhance Failed.wav','Enhanced.wav','Plop.wav','Pushcat Hit.wav','Quest Complete.wav','Quest.wav','Sell.wav','Summon Pushcat.wav','UI Click.wav'])assert.ok(keys.has(normalize(sound)),'Missing embedded original sound: '+sound);
assert.ok(keys.has(normalize('Main Theme.wav')),'Missing owner-supplied original theme');
for(const sound of ['Enhancing.wav','Main_Theme.ogg'])assert.ok(!keys.has(normalize(sound)),'Do not bundle mismatched or duplicate long-form audio: '+sound);
const required=vm.runInContext('[...TRAVELERS.map(t=>t.portrait),...FAIRIES.map(f=>f.image),...FAMILIES.flatMap(f=>[...f.materials,...f.recipes].map(r=>r.image))]',ctx);
for(const key of required)assert.ok(keys.has(normalize(key)),'Missing embedded art: '+key);
assert.ok(Object.values(assets).every(s=>s.startsWith('data:')));
const ids=[...html.slice(0,html.indexOf('<script>')).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
const uiMarkup=html.slice(0,html.indexOf('<script>')),devStart=uiMarkup.indexOf('<details class="dev-cheats">'),devCheats=uiMarkup.slice(devStart,uiMarkup.indexOf('</details>',devStart)+10),rackNote=uiMarkup.slice(uiMarkup.indexOf('<div class="rack-note">'),uiMarkup.indexOf('</div>',uiMarkup.indexOf('<div class="rack-note">'))+6);assert.ok(devStart>=0&&devCheats.includes('id="ingredient-mode-toggle"'),'Exact-ingredient debug control must live in Dev cheats');assert.ok(!rackNote.includes('id="ingredient-mode-toggle"'),'Exact-ingredient control must not remain in the brewing rack');assert.match(devCheats,/>\+100,000,000 coins</);assert.doesNotMatch(devCheats,/>\+10,000 coins</);assert.match(uiMarkup,/Story route material/);assert.doesNotMatch(uiMarkup,/Material to gather/);assert.match(uiMarkup,/The material shapes the story and is not awarded when the trip returns\./);assert.match(uiMarkup,/id="expedition-chapters"/);assert.match(uiMarkup,/id="expedition-chapter-list"/);assert.match(uiMarkup,/id="expedition-story-next"/);assert.match(uiMarkup,/id="expedition-story-secondary"/);assert.match(uiMarkup,/Tier chapters/);assert.match(uiMarkup,/expedition-chapter-card/);
assert.match(scripts[8],/expeditionChapterDraft/);assert.match(scripts[10],/Ready to continue/);assert.match(scripts[10],/openExpeditionChapterReport/);
assert.ok(!/<script[^>]+src=|<link[^>]+(?:href="https?:|rel="stylesheet")|<img[^>]+src="https?:/.test(html));
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new WebSocket/.test(scripts.at(-1)));
console.log(`Passed: current sources/data embedded, unique UI IDs, ${Object.keys(assets).length} local media files and no network dependency.`);

const pioScripts=[...html.matchAll(/<script data-pio-runtime>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
assert.equal(pioScripts.length,5);pioScripts.forEach(s=>new vm.Script(s));
const pioContext=vm.createContext({});vm.runInContext(pioScripts[3],pioContext);const pio=vm.runInContext("PIO_DATA",pioContext);
assert.ok(pio.settings.model.startsWith("data:application/octet-stream;base64,"));
assert.equal(Object.keys(pio.textures).length,48);assert.ok(Object.values(pio.textures).every(s=>s.startsWith("data:image/webp;base64,")));
for(const group of Object.values(pio.settings.motions))for(const motion of group)assert.ok(motion.file.startsWith("data:"));
assert.equal(pioScripts[4].replace(/\r\n/g,"\n").trim(),fs.readFileSync(path.join(root,"source/pio.js"),"utf8").replace(/\r\n/g,"\n").trim());
console.log("Passed: offline Pio model, 48 wardrobe textures, motions, runtime syntax and current controller embedded.");

const tia=vm.runInContext('TIA_DATA',pioContext);
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
for(const key of JSON.parse(fs.readFileSync(path.join(root,'data/costumes.json'),'utf8')).entries.map(c=>c.id))assert.ok(assets[key],'Missing original costume preview: '+key);
console.log('Passed: original-only media mapping, costume previews, and approved event-banner exception.');

const expectedBanners=vm.runInContext("EVENTS.map(event=>event.banner)",ctx).concat('Third_Event_Banner_-_English.webp');
assert.deepEqual(manifest.assets.filter(r=>r.retained_event_banner).map(r=>r.key).sort(),Array.from(expectedBanners).sort());
for(const key of expectedBanners){const record=manifest.assets.find(r=>r.key===key);assert.equal(assets[key],`data:${record.mime};base64,`+fs.readFileSync(path.join(root,record.path)).toString('base64'),'Missing historical event banner: '+key);}
console.log('Passed: all 12 historical event/promotion banners restored and embedded.');

const apkLayout=html.match(/<script data-apk-layout>([\s\S]*?)<\/script>/);
assert.ok(apkLayout,'Missing recovered APK UI module');new vm.Script(apkLayout[1]);
assert.equal(apkLayout[1],fs.readFileSync(path.join(root,'source/apk-layout.js'),'utf8'),'Stale APK layout module');
assert.ok(html.includes(fs.readFileSync(path.join(root,'source/apk-layout.css'),'utf8')),'Stale recovered layout CSS');
console.log('Passed: recovered APK UI module syntax and exact current UI source embedding.');
