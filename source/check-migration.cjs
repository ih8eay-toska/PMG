const assert=require('node:assert/strict');
const {PotionGame,INITIAL,sanitizeSave,ECONOMY,FAMILIES,FAIRIES,TRAVELERS,REQUESTS}=require('./core.js');
const historical=require('../research/balance/research-runtime.cjs');
const {loadStoredGame}=require('./storage.js');
const clone=x=>JSON.parse(JSON.stringify(x)),reload=g=>new PotionGame(sanitizeSave(clone(g.state)));
function sameState(g){assert.deepEqual(reload(g).state,g.state);}
// Every historical version preserves all fields it actually supported.
for(let version=1;version<=14;version++){
 const raw=historical.INITIAL();raw.version=version;Object.assign(raw,{coins:1.96e18,best:1.234e17,tiers:[2,1,0],selected:[2,1,0],luck:3,price:2,speed:4,tickets:12345678901,rubies:999,sold:7,ingredients:30,failed:2,potion:{family:0,tier:2,level:1,value:123456789.125}});
 if(version<4)raw.travelers=raw.travelers.slice(0,3);
 if(version>=4)raw.fairies={'fairy-1':7};
 if(version>=7)raw.activeFairyId='fairy-1';
 if(version>=9)raw.rubyUpgrades={fortune:10,value:10,materials:10};
 if(version>=10){raw.costumes.push('Kids_Costume.png');raw.activeCostumeId='Kids_Costume.png';}
 if(version>=12){raw.masteryStars=Array.from({length:20},(_,t)=>'0-'+t);raw.tiaUnlocked=true;raw.tiaIntroSeen=true;}
 if(version>=13)raw.eventRotation={index:3,elapsedMs:123456,solution:77};
 if(version>=5)raw.metrics.activePlayMs=3456789;
 const encoded=JSON.stringify(raw),items=new Map([['shop',encoded]]),storage={getItem:k=>items.get(k)||null,setItem:(k,v)=>items.set(k,v)},loaded=loadStoredGame(storage,'shop'),g=loaded.game;
 assert.equal(loaded.blocked,false,`v${version}`);assert.equal(items.get(`shop-v${version}-backup`),encoded);assert.equal(items.get('shop'),encoded);
 assert.equal(g.state.version,15);assert.equal(g.state.coins,raw.coins);assert.equal(g.state.potion.value,raw.potion.value);assert.deepEqual(g.state.tiers,raw.tiers);
 if(version>=6)assert.equal(g.state.tickets,raw.tickets);if(version>=8)assert.equal(g.state.rubies,raw.rubies);
 if(version>=10){assert.deepEqual(g.state.costumes,raw.costumes);assert.equal(g.state.activeCostumeId,raw.activeCostumeId);}
 if(version>=12){assert.ok(g.state.tiaUnlocked);assert.ok(g.state.tiaIntroSeen);assert.deepEqual(g.state.masteryStars,raw.masteryStars);}
 if(version>=13)assert.deepEqual(g.state.eventRotation,raw.eventRotation);
 assert.equal(g.state.paidBoostWindow.count,0);sameState(g);
 storage.setItem('shop-v'+version+'-backup','first backup');loadStoredGame(storage,'shop');assert.equal(items.get('shop-v'+version+'-backup'),'first backup');
}
// Version 14 rewards are promises; deliver/reload/settle must keep them intact.
for(const phase of ['offer','active','returning','complete']){
 const state=historical.INITIAL(),t=state.travelers[0];Object.assign(t,{phase,requirement:{family:0,tier:0,level:0},rewardBoost:{type:'selling',amount:5},rewardRuby:phase==='returning',leaveAt:['offer','complete'].includes(phase)?100000:0,deadline:phase==='active'?100000:0,readyAt:phase==='returning'?30000:0});
 let g=new PotionGame(sanitizeSave(state));assert.equal(g.state.travelers[0].rewardRubies,1);assert.equal(g.state.travelers[0].rewardTickets,0);sameState(g);
 if(phase==='offer')assert.ok(g.acceptQuest(0,1));
 if(['offer','active'].includes(phase)){g.collect(0,0);assert.ok(g.deliver(0,2));}
 if(phase!=='complete'){g=reload(g);assert.equal(g.settle(100000).length,1);assert.equal(g.state.rubies,1);assert.equal(g.state.powerups.selling,5);}else assert.equal(g.settle(100000).length,0);
 g=reload(g);assert.equal(g.settle(200000).length,0);sameState(g);
}
// Returning legacy fixed boosts and fairies survive the economy update.
for(let i=0;i<TRAVELERS.length;i++){
 const state=historical.INITIAL();state.version=13;const t=state.travelers[i];Object.assign(t,{phase:'returning',readyAt:10,rewardFairyId:i>=3?'fairy-1':null});
 let g=new PotionGame(sanitizeSave(state));g=reload(g);assert.equal(g.settle(10).length,1);
 if(i>=3)assert.equal(g.state.fairies['fairy-1'],1);else assert.equal(g.state.powerups[TRAVELERS[i].powerup],TRAVELERS[i].reward);
 assert.equal(g.state.tickets,0);assert.equal(g.state.rubies,0);g=reload(g);assert.equal(g.settle(20).length,0);
}
// Historical request results survive multiple reloads, with no new payment or reroll.
const oldRequest=new historical.PotionGame();oldRequest.state.coins=1000;assert.ok(oldRequest.startRequest(0,0,1,()=>0));assert.equal(oldRequest.state.request.result.bonusCount,2000);
let request=new PotionGame(sanitizeSave(oldRequest.state));request=reload(reload(request));assert.equal(request.state.coins,0);assert.equal(request.settleRequest(60000),null);assert.ok(request.settleRequest(60001));assert.equal(request.state.coins,2000);assert.equal(request.state.likeability,1);assert.equal(reload(request).settleRequest(60002),null);
// Request ticket gains must not shrink valid balances from older saves.
const rich=new PotionGame();rich.state.coins=1e9;rich.state.tickets=2e9;rich.state.travelers[0].exp=500;rich.state.travelers[0].level=3;
const ticketRequest=REQUESTS.find(r=>r.bonusType==='tickets');assert.ok(rich.startRequest(0,ticketRequest.id,1,()=>0));rich.settleRequest(rich.state.request.readyAt);assert.equal(rich.state.tickets,2e9+ticketRequest.bonusCount);
// Chest price bands, independent free clock and saved fixed active-time windows.
for(const [tier,price]of [[1,50],[4,50],[5,250],[9,250],[10,1000],[14,1000],[15,4000],[19,4000],[20,16000],[25,16000]]){const g=new PotionGame();g.state.tiers[1]=tier-1;assert.equal(g.rewardCost('hourly').amount,price);}
let chest=new PotionGame();chest.state.coins=100000;
assert.ok(chest.openReward('hourly','Pio',1000,()=>0,true));assert.equal(chest.state.rewardReadyAt,3601000);assert.equal(chest.paidBoostInfo().remaining,3);
const freeReady=chest.state.rewardReadyAt;
for(let n=0;n<3;n++){assert.ok(chest.openReward('hourly','Pio',2000,()=>0));chest=reload(chest);assert.equal(chest.paidBoostInfo().remaining,2-n);}
const snapshot=clone(chest.state);assert.equal(chest.openReward('hourly','Pio',2000,()=>0),null);assert.equal(chest.openReward('hourly','Pio',freeReady-1,()=>0,true),null);assert.deepEqual(chest.state,snapshot);
assert.ok(chest.openReward('hourly','Pio',freeReady+10*3600000,()=>0,true));assert.equal(chest.paidBoostInfo().remaining,0);assert.equal(chest.openReward('hourly','Pio',freeReady+10*3600000,()=>0,true),null,'unclaimed free hours do not stack');
chest.state.metrics.activePlayMs=1199999;assert.equal(chest.paidBoostInfo().remaining,0);chest.recordPlayTime(1);assert.equal(chest.paidBoostInfo().remaining,3);chest=reload(chest);assert.ok(chest.openReward('hourly','Pio',4000,()=>0));assert.equal(chest.paidBoostInfo().remaining,2);
const active=chest.state.metrics.activePlayMs;for(const invalid of [Infinity,NaN,-1,60000])chest.recordPlayTime(invalid);assert.equal(chest.state.metrics.activePlayMs,active);
for(const invalid of [{window:2,count:0},{window:1,count:4},{window:1,count:.5}])assert.throws(()=>sanitizeSave({...chest.state,paidBoostWindow:invalid}),/paid chest/);
// Refusals must neither charge nor consume a free timer/quota/history slot.
for(const kind of ['hourly','tickets','skin']){const g=new PotionGame(),before=clone(g.state);assert.equal(g.openReward(kind,'Pio',1000,()=>0),null);assert.deepEqual(g.state,before);}
for(const free of [false,true]){const g=new PotionGame();g.state.coins=999;g.state.powerups.protection=1e9;const before=clone(g.state);assert.equal(g.openReward('hourly','Pio',1000,()=>0,free),null);assert.deepEqual(g.state,before);}
for(const character of ['Tia','Missing']){const g=new PotionGame();g.state.rubies=300;const before=clone(g.state);assert.equal(g.openReward('skin',character,1000,()=>0),null);assert.deepEqual(g.state,before);}
// The twentieth unique mastery unlocks Tia once; no star repeats after selling.
const master=new PotionGame();master.state.tiers[0]=19;master.state.masteryStars=Array.from({length:19},(_,t)=>'0-'+t);master.collect(0,19);while(master.next())master.enhance(0,1);
assert.equal(master.state.masteryStars.length,20);assert.ok(master.state.tiaUnlocked);assert.equal(master.state.tiaIntroSeen,false);master.sell();master.collect(0,19);while(master.next())master.enhance(0,1);assert.equal(master.state.masteryStars.length,20);assert.equal(reload(master).state.tiaIntroSeen,false);
console.log('Passed: v1–14 backups/migration, legacy promises and request results, unchanged balances, chest quota/cooldown boundaries, safe refusals and the twentieth unique star.');
