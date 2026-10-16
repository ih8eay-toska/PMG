const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'Potion-Maker.html'),'utf8');
assert.ok(!/__(?:ASSETS|GAME_DATA|ECONOMY_DATA|COSTUME_DATA|FLAVOR_DATA|MATERIAL_TEXT|VISITOR_DIALOGUE|FAIRY_DATA|CORE|STORAGE|APP)__/.test(html),'Unreplaced build token');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(scripts.length,11);scripts.forEach(s=>new vm.Script(s));
const ctx=vm.createContext({Date,Math});scripts.slice(0,-1).forEach(s=>vm.runInContext(s,ctx));
for(const[name,file]of [['GAME_DATA','game-data.json'],['ECONOMY_DATA','economy.json'],['FLAVOR_TEXT','flavor-text.json'],['MATERIAL_TEXT','material-descriptions.json'],['VISITOR_DIALOGUE','visitor-dialogue.json'],['FAIRY_DATA','fairies.json']]){
 const actual=vm.runInContext('JSON.stringify('+name+')',ctx),expected=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8')));assert.equal(actual,expected,file);
}
for(const[file,index]of [['core.js',8],['storage.js',9],['app.js',10]])assert.equal(scripts[index].trim(),fs.readFileSync(path.join(root,'source',file),'utf8').trim(),'Stale embedded '+file);
const assets=vm.runInContext('ASSETS',ctx),normalize=s=>s.toLowerCase().replace(/[_ -]/g,''),keys=new Set(Object.keys(assets).map(normalize));
const required=vm.runInContext('[...TRAVELERS.map(t=>t.portrait),...FAIRIES.map(f=>f.image),...FAMILIES.flatMap(f=>[...f.materials,...f.recipes].map(r=>r.image))]',ctx);
for(const key of required)assert.ok(keys.has(normalize(key)),'Missing embedded art: '+key);
assert.ok(Object.values(assets).every(s=>s.startsWith('data:')));
const ids=[...html.slice(0,html.indexOf('<script>')).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
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
