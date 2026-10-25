const assert=require('node:assert/strict');
const {INITIAL}=require('./core.js');const {loadStoredGame}=require('./storage.js');
const old={...INITIAL(),version:7,coins:123};const raw=JSON.stringify(old);const items=new Map([['test',raw]]);
const storage={getItem:key=>items.get(key)||null,setItem:()=>{throw Error('Quota exceeded');}};
let loaded=loadStoredGame(storage,'test');assert.equal(loaded.blocked,true);assert.equal(loaded.game.state.coins,123);assert.match(loaded.warning,/backup/);assert.equal(items.get('test'),raw);
loaded=loadStoredGame({getItem:()=>'{broken'},'test');assert.equal(loaded.blocked,true);
loaded=loadStoredGame({getItem:()=>{throw Error('Unavailable');}},'test');assert.equal(loaded.blocked,true);assert.match(loaded.warning,/unavailable/);
loaded=loadStoredGame({getItem:()=>null},'test');assert.equal(loaded.blocked,false);assert.equal(loaded.game.state.version,INITIAL().version);
console.log('Passed: backup quota failure preserves a loaded shop; invalid/unavailable storage never overwrites its original.');

const {writeStoredGame}=require('./storage.js');
const recoveryItems=new Map(),normalStorage={getItem:k=>recoveryItems.get(k)||null,setItem:(k,v)=>recoveryItems.set(k,v)};
const first={...INITIAL(),coins:10},second={...INITIAL(),coins:20};writeStoredGame(normalStorage,'shop',first);writeStoredGame(normalStorage,'shop',second);assert.equal(JSON.parse(recoveryItems.get('shop-recovery')).coins,10);
recoveryItems.set('shop','broken');loaded=loadStoredGame(normalStorage,'shop');assert.equal(loaded.game.state.coins,10);assert.equal(loaded.blocked,false);assert.equal(recoveryItems.get('shop-unreadable'),'broken');assert.match(loaded.warning,/Recovered/);
const beforeWrite=recoveryItems.get('shop');assert.throws(()=>writeStoredGame({...normalStorage,setItem:()=>{throw Error('full');}},'shop',second));assert.equal(recoveryItems.get('shop'),beforeWrite);
recoveryItems.set('shop','broken again');loaded=loadStoredGame({...normalStorage,setItem:()=>{throw Error('full');}},'shop');assert.equal(loaded.blocked,true);assert.equal(loaded.game.state.coins,10);assert.equal(recoveryItems.get('shop'),'broken again');
// Real save functions: repeated actions share one deadline and failed writes keep dirty state.
const fs=require('node:fs'),vm=require('node:vm'),app=fs.readFileSync(require('node:path').join(__dirname,'app.js'),'utf8');let writes=0,timers=[];const status={textContent:''};const ctx=vm.createContext({game:{state:first},KEY:'shop',saveTimer:null,saveDirty:false,saveBlocked:false,saveOK:true,stored:{},localStorage:normalStorage,writeStoredGame:()=>{writes++;},$:()=>status,setText:(el,value)=>el.textContent=value,clearTimeout(){},setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;}});
for(const name of ['flushSave','save'])vm.runInContext(app.split(/\r?\n/).find(l=>l.startsWith('function '+name+'(')),ctx);
ctx.save();ctx.save();assert.equal(timers.length,1);assert.equal(timers[0].ms,5000);assert.equal(writes,0);timers[0].fn();assert.equal(writes,1);assert.equal(ctx.saveDirty,false);ctx.save(true);assert.equal(writes,2);ctx.writeStoredGame=()=>{throw Error('full');};ctx.save(true);assert.equal(ctx.saveDirty,true);assert.equal(ctx.saveOK,false);ctx.saveBlocked=true;ctx.writeStoredGame=()=>{throw Error('must not overwrite');};ctx.save(true);
console.log('Passed: validated recovery rotation, corrupt-primary recovery, quota protection, fixed five-second batching and retained dirty state on failure.');

const {readNamedSaveSlot,writeNamedSaveSlot,namedSaveSlotKey}=require('./storage.js');
const slotItems=new Map(),slotStorage={getItem:k=>slotItems.get(k)??null,setItem:(k,v)=>slotItems.set(k,v)};
assert.equal(readNamedSaveSlot(slotStorage,'slots',1),null);
for(let slot=1;slot<=3;slot++)writeNamedSaveSlot(slotStorage,'slots',slot,'Shop '+slot,{...INITIAL(),coins:slot*100});
for(let slot=1;slot<=3;slot++){const entry=readNamedSaveSlot(slotStorage,'slots',slot);assert.equal(entry.state.coins,slot*100);assert.equal(entry.name,'Shop '+slot);assert.ok(Number.isSafeInteger(entry.savedAt));}
const originalSlot=slotItems.get('slots-slot-1');
assert.throws(()=>writeNamedSaveSlot({...slotStorage,setItem(){throw Error('full');}},'slots',1,'Replacement',INITIAL()),/full/);assert.equal(slotItems.get('slots-slot-1'),originalSlot);
assert.throws(()=>writeNamedSaveSlot(slotStorage,'slots',1,' '.repeat(4),INITIAL()),/name/);assert.throws(()=>writeNamedSaveSlot(slotStorage,'slots',1,'x'.repeat(41),INITIAL()),/name/);assert.throws(()=>namedSaveSlotKey('slots',0));assert.throws(()=>namedSaveSlotKey('slots',4));
writeNamedSaveSlot(slotStorage,'slots',1,' Renamed ',{...INITIAL(),version:7,coins:444});assert.equal(readNamedSaveSlot(slotStorage,'slots',1).name,'Renamed');assert.equal(readNamedSaveSlot(slotStorage,'slots',1).state.version,INITIAL().version);assert.equal(readNamedSaveSlot(slotStorage,'slots',2).state.coins,200);
slotItems.set('slots-slot-1','broken');assert.throws(()=>readNamedSaveSlot(slotStorage,'slots',1));assert.equal(slotItems.get('slots-slot-1'),'broken');assert.equal(readNamedSaveSlot(slotStorage,'slots',3).state.coins,300);
for(const invalid of [{version:2,name:'Bad',savedAt:0,state:INITIAL()},{version:1,name:'Bad',savedAt:-1,state:INITIAL()},{version:1,name:'Bad',savedAt:0,state:{version:999}}]){slotItems.set('slots-slot-1',JSON.stringify(invalid));assert.throws(()=>readNamedSaveSlot(slotStorage,'slots',1));}
console.log('Passed: three independent named slots, names/timestamps, legacy validation, quota preservation, corrupt-slot isolation and invalid-slot refusal.');
