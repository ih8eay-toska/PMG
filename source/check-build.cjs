const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'Potion-Maker.html'),'utf8');
assert.ok(!/__(?:ASSETS|GAME_DATA|FLAVOR_DATA|MATERIAL_TEXT|VISITOR_DIALOGUE|FAIRY_DATA|CORE|STORAGE|APP)__/.test(html),'Unreplaced build token');
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);assert.equal(scripts.length,9);scripts.forEach(s=>new vm.Script(s));
const ctx=vm.createContext({Date,Math});scripts.slice(0,-1).forEach(s=>vm.runInContext(s,ctx));
for(const[name,file]of [['GAME_DATA','game-data.json'],['FLAVOR_TEXT','flavor-text.json'],['MATERIAL_TEXT','material-descriptions.json'],['VISITOR_DIALOGUE','visitor-dialogue.json'],['FAIRY_DATA','fairies.json']]){
 const actual=vm.runInContext('JSON.stringify('+name+')',ctx),expected=JSON.stringify(JSON.parse(fs.readFileSync(path.join(root,'data',file),'utf8')));assert.equal(actual,expected,file);
}
for(const[file,index]of [['core.js',6],['storage.js',7],['app.js',8]])assert.equal(scripts[index].trim(),fs.readFileSync(path.join(root,'source',file),'utf8').trim(),'Stale embedded '+file);
const assets=vm.runInContext('ASSETS',ctx),normalize=s=>s.toLowerCase().replace(/[_ -]/g,''),keys=new Set(Object.keys(assets).map(normalize));
const required=vm.runInContext('[...TRAVELERS.map(t=>t.portrait),...FAIRIES.map(f=>f.image),...FAMILIES.flatMap(f=>[...f.materials,...f.recipes].map(r=>r.image))]',ctx);
for(const key of required)assert.ok(keys.has(normalize(key)),'Missing embedded art: '+key);
assert.ok(Object.values(assets).every(s=>s.startsWith('data:')));
const ids=[...html.slice(0,html.indexOf('<script>')).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length,'Duplicate HTML IDs');
assert.ok(!/<script[^>]+src=|<link[^>]+(?:href="https?:|rel="stylesheet")|<img[^>]+src="https?:/.test(html));
assert.ok(!/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new WebSocket/.test(scripts.at(-1)));
console.log(`Passed: current sources/data embedded, unique UI IDs, ${Object.keys(assets).length} local media files and no network dependency.`);
