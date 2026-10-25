const assert=require('node:assert/strict');
const{PotionGame,MaterialConveyor,materialPool,INITIAL,sanitizeSave,FAMILIES,TRAVELERS,FAIRIES,REQUESTS,LEVEL_EXP,ECONOMY}=require('./core.js');
let g=new PotionGame();assert.equal(g.collect(1,0),true);g.collect(0,0);assert.equal(g.state.potion.family,1);assert.equal(g.state.potion.value,7.7);
assert.equal(g.enhance(0),'success');assert.equal(g.state.potion.value,7.7*1.6);assert.equal(g.enhance(.99),'lost');assert.equal(g.state.failed,1);assert.equal(g.state.potion,null);
g.state.powerups={protection:1,enhancement:1,selling:1};g.collect(0,0);assert.equal(g.next().chance,.9);assert.equal(g.enhance(0),'success');assert.equal(g.state.powerups.enhancement,0);assert.equal(g.state.powerups.protection,1);assert.equal(g.enhance(.99),'protected');assert.equal(g.state.powerups.protection,0);assert.equal(g.state.potion.level,1);assert.equal(g.sell(),23);assert.equal(g.state.powerups.selling,0);
g=new PotionGame();g.collect(2,0);g.enhance(0);g.enhance(0);assert.equal(g.next(),null);assert.equal(g.enhancementStatus(),'max');assert.equal(g.sell(),16);
g.state.coins=1e20;for(let i=0;i<24;i++){g.state.masteryStars=Array.from({length:i},(_,t)=>'0-'+t);assert.equal(g.buy('tier0'),true);}assert.equal(g.buy('tier0'),false);assert.equal(g.state.tiers[0],24);assert.equal(g.collect(0,24),true);assert.equal(g.recipe().base,8753);assert.equal(g.next().chance,.8);
// Each newly completed potion must reach its documented maximum and save/load there.
for(const [family,tier] of [[1,5],[1,19],[1,20],[1,21],[1,23],[2,24]]){
 const expectedProduct=FAMILIES[family].recipes[tier].multipliers.reduce((a,b)=>a*b,1);
 g=new PotionGame();g.state.tiers[family]=tier;assert.equal(g.collect(family,tier),true);const base=g.recipe().base;const max=g.recipe().max_level;
 for(let level=1;level<max;level++){assert.ok(g.next());assert.equal(g.enhance(0),'success');}
 assert.equal(g.enhancementStatus(),'max');assert.equal(g.enhance(0),null);assert.ok(Math.abs(g.state.potion.value/base-expectedProduct)<=expectedProduct*1e-10);
 assert.deepEqual(sanitizeSave(JSON.parse(JSON.stringify(g.state))),g.state);assert.ok(g.sell()>0);
}
g=new PotionGame();g.state.tiers[1]=3;g.collect(1,3);assert.equal(g.next().multiplier,1.6);
// Preserve the unknown-data guard for any genuinely missing future record.
const home=FAMILIES[1].recipes[5],recordedStep=home.multipliers[3];
try{home.multipliers[3]=null;g=new PotionGame();g.state.tiers[1]=5;g.collect(1,5);g.enhance(0);g.enhance(0);g.enhance(0);assert.equal(g.enhancementStatus(),'unknown');assert.equal(g.enhance(0),null);}finally{home.multipliers[3]=recordedStep;}

// Visits are random scheduled offers; no deadline starts before explicit acceptance.
g=new PotionGame();g.tick(1000,()=>0);assert.equal(g.state.nextVisitorAt,21000);assert.equal(g.tick(20999,()=>0).length,0);
assert.equal(g.tick(21000,()=>0)[0].kind,'arrived');assert.equal(g.state.travelers[0].phase,'offer');
assert.equal(g.state.travelers[0].deadline,0);g.collect(0,0);assert.equal(g.canDeliver(0,22000),false);
assert.equal(g.acceptQuest(0,30000,()=>0),true);assert.equal(g.state.travelers[0].deadline,75000);assert.equal(g.acceptQuest(0,40000),false);
assert.equal(g.canDeliver(0,74999),true);assert.equal(g.canDeliver(0,75000),false);
const frozen=JSON.stringify(g.questRequirement(0));g.state.tiers[0]=24;assert.equal(JSON.stringify(g.questRequirement(0)),frozen);
assert.equal(g.deliver(0,31000),true);assert.equal(g.state.potion,null);assert.equal(g.state.travelers[0].phase,'returning');assert.equal(g.state.powerups.protection,0);assert.equal(g.state.travelers[0].quests,0);assert.equal(g.settle(60999).length,0);const rewards=g.settle(61000);assert.equal(rewards.length,1);assert.deepEqual(rewards[0].boost,{type:'protection',amount:1});assert.equal(rewards[0].tickets,2);assert.equal(rewards[0].fairyId,null);
g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.settle(91000).length,0);
assert.equal(g.state.powerups.protection,1);assert.equal(g.state.travelers[0].quests,1);
assert.equal(g.state.travelers[0].phase,'away');assert.equal(g.state.travelers[0].leaveAt,0);assert.equal(g.state.travelers[0].rewardBoost,null);assert.equal(g.state.travelers[0].requirement,null);
// Deadline survives a reload; failure neither pays a reward nor destroys the potion.
g=new PotionGame();g.tick(1000,()=>0);g.tick(21000,()=>0);g.acceptQuest(0,22000,()=>0);g.collect(0,0);
g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.tick(82000,()=>0)[0].kind,'failed');
assert.equal(g.state.travelers[0].phase,'failed');assert.ok(g.state.potion);assert.equal(g.deliver(0,82000),false);
assert.equal(g.state.powerups.protection,0);assert.equal(g.state.travelers[0].quests,0);assert.equal(g.settle(900000).length,0);
assert.equal(g.dismissVisitor(0,82000,()=>0),true);assert.equal(g.state.nextVisitorAt,102000);
// All three visitors can arrive and ask for any unlocked family, rather than a fixed assignment.
for(const [roll,index]of [[0,0],[.4,4],[.9,9]]){g=new PotionGame();g.state.nextVisitorAt=1;g.tick(1,()=>roll);assert.equal(g.state.travelers[index].phase,'offer');}
g=new PotionGame();g.state.tiers=[4,8,24];const req=g.randomRequirement(()=>.999);assert.equal(req.family,2);assert.equal(req.tier,24);assert.ok(req.level<FAMILIES[2].recipes[24].max_level);
// Rewards already in transit in older saves are granted on the next settle.
let v2={...INITIAL(),version:2,travelers:[{quests:2,readyAt:61000},{quests:0,readyAt:0},{quests:0,readyAt:0}]};
g=new PotionGame(sanitizeSave(v2));assert.equal(g.state.travelers[0].phase,'returning');assert.equal(g.settle(60999).length,0);assert.equal(g.settle(61000).length,1);assert.equal(g.state.travelers[0].quests,3);assert.equal(g.settle(62000).length,0);
// APK conveyor rules: constant movement with upgrade-controlled emission, fairy bonuses and an empty-belt cap.
assert.equal(materialPool([0,1,2]).length,6);assert.deepEqual(materialPool([0,0,0]).map(x=>x.family),[0,1,2]);
let belt=new MaterialConveyor(456,[0,0,0],()=>0);assert.ok(Math.abs(belt.speed(false,0)-136.8)<1e-10);assert.equal(belt.speed(false,19),belt.speed(false,0));assert.equal(belt.speed(true,19),belt.speed(false,0));
assert.deepEqual(ECONOMY.upgrades.speed.materialsPerSecond,[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);
g=new PotionGame();assert.equal(g.emissionRate(),1);g.state.speed=9;assert.equal(g.emissionRate(),10);g.state.speed=19;assert.equal(g.emissionRate(),20);
const fairies={cardsPerSecond:.5},dense=new MaterialConveyor(456,[0,0,0],()=>0,()=>fairies);
assert.equal(dense.emissionRate(true,0),1.5);assert.equal(dense.emissionRate(false,19),3);
for(let i=0;i<160;i++)dense.advance(50,true,0);const gap=dense.speed()/dense.emissionRate(true,0);assert.ok(Math.abs(dense.spacing-gap)<1e-8);
const empty=new MaterialConveyor(456,[0,0,0],()=>0);assert.equal(empty.emissionRate(false,0),1);assert.equal(empty.emissionRate(false,19),3);
for(let i=0;i<160;i++)empty.advance(50,false,19);assert.ok(Math.abs(empty.spacing-empty.speed()/3)<1e-8);
const maxPotionGame=new PotionGame();maxPotionGame.collect(0,0);maxPotionGame.state.potion.level=FAMILIES[0].recipes[0].max_level-1;maxPotionGame.state.helpers=[{remainingMs:10000,cooldownMs:0,intervalMs:1000,slot:0}];const pausedHelper={...maxPotionGame.state.helpers[0]};assert.equal(maxPotionGame.advanceHelper(100,new MaterialConveyor(456,[0,0,0],()=>0)),0);assert.deepEqual(maxPotionGame.state.helpers[0],pausedHelper,'Pushcats pause when no further potion enhancement is available');// Collecting after enhancement retains the observed additive behavior.
g=new PotionGame();g.collect(1,0);g.enhance(0);const enhanced=g.state.potion.value;g.collect(0,0);assert.equal(g.state.potion.value,enhanced+FAMILIES[0].materials[0].value);
let old={version:1,coins:123,tiers:[2,1,0],luck:3,price:3,speed:3,potion:{family:1,tier:1,level:1,value:25},sold:7,failed:1,best:50,ingredients:20};let migrated=sanitizeSave(old);assert.equal(migrated.version,INITIAL().version);assert.equal(migrated.coins,123);assert.deepEqual(migrated.tiers,[2,1,0]);assert.equal(migrated.potion.value,25);assert.deepEqual(sanitizeSave(migrated),migrated);
assert.throws(()=>sanitizeSave({...INITIAL(),coins:-1}));assert.throws(()=>sanitizeSave({...INITIAL(),powerups:{protection:-1,enhancement:0,selling:0}}));assert.throws(()=>sanitizeSave({...INITIAL(),travelers:[{}, {}, {}]}));assert.throws(()=>sanitizeSave({...INITIAL(),potion:{family:0,tier:0,level:20,value:10}}));
assert.equal(FAMILIES.length,3);assert.equal(FAMILIES.flatMap(f=>f.recipes).length,75);assert.equal(FAMILIES.flatMap(f=>f.recipes).filter(r=>r.complete).length,75);
for(const f of FAMILIES)for(const r of f.recipes){if(r.complete){assert.equal(r.multipliers.length,r.max_level-1);assert.ok(r.chances.every(c=>c>=0&&c<=1));}}
console.log('Passed: randomized evenly spaced conveyor, emission speeds, random visitors, acceptance deadlines, failure/reload, reward idempotency, v1/v2 migration, 75 complete recipes, six restored enhancement paths, selected Mana tables, unknown-data guard, powerup consumption, delayed quest rewards, v1 migration, invalid-save rejection.');

const badActive={...INITIAL(),travelers:[{quests:0,readyAt:0,phase:'active',deadline:1,requirement:null},...INITIAL().travelers.slice(1)]};assert.throws(()=>sanitizeSave(badActive));
assert.throws(()=>sanitizeSave({...INITIAL(),nextVisitorAt:-1}));

// Every visitor grants a frozen boost reward once after the delay.
assert.equal(TRAVELERS.length,10);assert.equal(FAIRIES.length,42);
for(let index=0;index<TRAVELERS.length;index++){
 g=new PotionGame();g.state.nextVisitorAt=1;let rolls=[(index+.1)/TRAVELERS.length,0,0];g.tick(1,()=>rolls.shift()||0);
 assert.equal(g.state.travelers[index].phase,'offer');assert.equal(g.acceptQuest(index,1000),true);g.collect(0,0);
 assert.equal(g.deliver(index,2000,()=>.999),true);assert.equal(g.state.travelers[index].rewardFairyId,null);const reward=g.state.travelers[index].rewardBoost;assert.deepEqual(reward,{type:'protection',amount:1});
 assert.equal(g.state.travelers[index].phase,'returning');g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.settle(31999).length,0);assert.equal(g.settle(32000).length,1);assert.deepEqual(g.state.fairies,{});assert.equal(g.settle(63000).length,0);
 assert.deepEqual(g.state.powerups,{protection:1,enhancement:0,selling:0});assert.deepEqual(sanitizeSave(g.state),g.state);
 assert.equal(g.state.travelers[index].quests,1);assert.equal(g.state.tickets,2);assert.equal(g.state.rubies,0);
}
let v3={...INITIAL(),version:3,travelers:INITIAL().travelers.slice(0,3)};v3.travelers[1]={...v3.travelers[1],phase:'active',deadline:65000,requirement:{family:0,tier:0,level:0}};
let upgraded=sanitizeSave(v3);assert.equal(upgraded.travelers.length,10);assert.equal(upgraded.travelers[1].deadline,65000);assert.deepEqual(upgraded.fairies,{});
assert.throws(()=>sanitizeSave({...INITIAL(),fairies:{'unknown-fairy':1}}));assert.throws(()=>sanitizeSave({...INITIAL(),fairies:{'fairy-1':-1}}));
console.log('Passed: all 10 visitor arrivals, random boost rewards, 42 collectible fairies, duplicate prevention, delayed delivery and v3 migration.');

// Statistics distinguish historical totals from tracked detail and record each action once.
g=new PotionGame();g.collect(0,0);g.collect(1,0);g.state.powerups={protection:1,enhancement:1,selling:1};
assert.equal(g.enhance(0),'success');assert.equal(g.enhance(.999),'protected');const price=g.sell();
assert.equal(g.state.metrics.brewsStarted,1);assert.deepEqual(g.state.metrics.ingredientsByFamily,[1,1,0]);assert.equal(g.state.metrics.enhancementAttempts,2);assert.equal(g.state.metrics.enhancementsSucceeded,1);assert.equal(g.state.metrics.enhancementsFailed,1);assert.equal(g.state.metrics.protectedFailures,1);assert.equal(g.state.metrics.potionsLost,0);assert.equal(g.state.metrics.coinsEarned,price);assert.deepEqual(g.state.metrics.powerupsUsed,{protection:1,enhancement:1,selling:1});assert.equal(g.state.metrics.recipes['0-0'].highestLevel,2);
g.collect(1,0);g.sell();assert.equal(g.state.metrics.soldLevelOne,1);g.state.coins=1000;assert.equal(g.buy('speed'),true);assert.equal(g.state.metrics.coinsSpent,137);assert.equal(g.state.metrics.upgradesBought,1);g.recordPlayTime(1000);assert.equal(g.state.metrics.activePlayMs,1000);assert.deepEqual(sanitizeSave(g.state),g.state);
g=new PotionGame();for(const [index,cost] of ECONOMY.upgrades.speed.costs.entries()){g.state.coins=cost;assert.equal(g.upgradeInfo('speed').cost,cost);assert.equal(g.buy('speed'),true);assert.equal(g.state.speed,index+1);}assert.equal(g.buy('speed'),false);assert.equal(g.emissionRate(),20);const speedReload=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(speedReload.state.speed,19);assert.equal(speedReload.emissionRate(),20);
g=new PotionGame();g.tick(1,()=>0);g.tick(20001,()=>0);g.acceptQuest(0,21000,()=>0);g.tick(81000,()=>0);assert.equal(g.state.metrics.questsOffered,1);assert.equal(g.state.metrics.questsAccepted,1);assert.equal(g.state.metrics.questsFailed,1);assert.equal(g.state.metrics.visitors.neet.failed,1);
let oldStats={...INITIAL(),version:4};delete oldStats.metrics;oldStats.sold=99;oldStats.ingredients=300;oldStats.failed=21;let statsMigrated=sanitizeSave(oldStats);assert.equal(statsMigrated.sold,99);assert.equal(statsMigrated.ingredients,300);assert.equal(statsMigrated.failed,21);assert.equal(statsMigrated.metrics.historyPartial,true);assert.equal(statsMigrated.metrics.coinsEarned,0);assert.deepEqual(sanitizeSave(statsMigrated),statsMigrated);
assert.throws(()=>sanitizeSave({...INITIAL(),metrics:{...INITIAL().metrics,coinsEarned:-1}}));assert.throws(()=>sanitizeSave({...INITIAL(),metrics:{...INITIAL().metrics,recipes:{'9-9':{}}}}));
console.log('Passed: action counters, family/potion details, powerup use, play time, quest statistics, partial-history migration and malformed-stat rejection.');

// Every supported fairy/level must create a reloadable arrival and acceptance timer.
for(const f of FAIRIES)for(let count=1;count<=10;count++){
 g=new PotionGame();g.state.fairies[f.id]=count;if(!g.setActiveFairy(f.id))continue;g.scheduleVisitor(1000,()=>.1234);assert.ok(Number.isInteger(g.state.nextVisitorAt));assert.deepEqual(sanitizeSave(g.state),g.state);
 g.state.nextVisitorAt=1;g.tick(1,()=>0);g.acceptQuest(0,1000);assert.ok(Number.isInteger(g.state.travelers[0].deadline));assert.deepEqual(sanitizeSave(g.state),g.state);
}
// Recover self-generated fractional timestamps from version 7, but reject new malformed saves.
let fractional={...INITIAL(),version:7,nextVisitorAt:18777.777};assert.equal(sanitizeSave(fractional).nextVisitorAt,18778);assert.throws(()=>sanitizeSave({...fractional,version:8}));
fractional.travelers[0]={...fractional.travelers[0],phase:'active',deadline:65333.333,requirement:{family:0,tier:0,level:0}};assert.equal(sanitizeSave(fractional).travelers[0].deadline,65333);
// The separate mastery branch also called its save format version 6.
let masterySix={...INITIAL(),version:6,mastery:{'0-0':{unlockedAt:1000,times:2,bestValue:20,recovered:false}}};for(const key of ['request','tickets','likeability','requestCoinsSpent','activeFairyId'])delete masterySix[key];masterySix.travelers.forEach(t=>{delete t.level;delete t.exp;});
let masteryMigrated=sanitizeSave(masterySix);assert.equal(masteryMigrated.metrics.recipes['0-0'].highestLevel,3);assert.equal(masteryMigrated.mastery['0-0'].times,2);assert.equal(masteryMigrated.request,null);assert.deepEqual(sanitizeSave(masteryMigrated),masteryMigrated);
// Genuine request-format version 6 continues to load and completes exactly once.
assert.equal(sanitizeSave({...INITIAL(),version:6}).tickets,0);
// Every request preserves its frozen outcome and documented rewards across a reload.
for(const r of REQUESTS){
 g=new PotionGame();g.state.coins=1e15;g.state.travelers[0].level=12;g.state.travelers[0].exp=50000;assert.equal(g.startRequest(0,r.id,1000,()=>0),true);const paid=g.state.coins;g=new PotionGame(sanitizeSave(g.state));assert.equal(g.settleRequest(g.state.request.readyAt-1),null);const result=g.settleRequest(g.state.request.readyAt);assert.ok(result);assert.equal(g.state.likeability,r.likeability);assert.equal(g.state.fairies[result.fairyId],1);assert.equal(g.state.coins,paid+(r.bonusType==='coins'?r.bonusCount:0));assert.equal(g.settleRequest(1e12),null);
}
g=new PotionGame();g.state.coins=1000;g.state.fairies['fairy-2']=10;g.setActiveFairy('fairy-2');g.startRequest(0,0,1000,()=>1);assert.equal(g.state.request.readyAt-1000,48000);g.setActiveFairy(null);assert.equal(g.state.request.readyAt-1000,48000);assert.deepEqual(sanitizeSave(g.state),g.state);
const corruptRequest=JSON.parse(JSON.stringify(g.state));corruptRequest.request.result.bonusCount=999999999;assert.throws(()=>sanitizeSave(corruptRequest));assert.throws(()=>sanitizeSave({...INITIAL(),travelers:INITIAL().travelers.map((t,i)=>i===0?{...t,level:12}:t)}));
g=new PotionGame();for(let i=0;i<18;i++)g.gainExperience(0,0,0);assert.equal(g.state.travelers[0].exp,306);assert.equal(g.state.travelers[0].level,2);assert.ok(g.requestsFor(0).some(r=>r.level===2));
// All 75 maximum-level achievements remain derivable after sale, delivery and reload.
for(let family=0;family<3;family++)for(let tier=0;tier<25;tier++){g=new PotionGame();g.state.tiers[family]=tier;g.collect(family,tier);const max=g.recipe().max_level;for(let level=1;level<max;level++)assert.equal(g.enhance(0,1),'success');g.sell();assert.equal(sanitizeSave(g.state).metrics.recipes[family+'-'+tier].highestLevel,max);}
console.log('Passed: all fairy timer/level round trips, fractional-save recovery, both version-6 formats, all 35 request rewards, EXP progression and all 75 mastery paths.');

// The final ceiling applies after every bonus; a roll at 99% still fails.
for(const family of [0,1,2]){
 const capped=new PotionGame();capped.state.luck=10;capped.state.rubyUpgrades.fortune=10;
 const id=['fairy-29','fairy-26','fairy-28'][family];capped.state.fairies[id]=10;capped.setActiveFairy(id);
 capped.state.powerups.enhancement=1;capped.collect(family,0);
 const expected=Math.min(.99,FAMILIES[family].recipes[0].chances[0]+capped.luckBonus()+.1+.03);assert.equal(capped.next().chance,expected);assert.equal(capped.enhance(.99,1),'lost');assert.equal(capped.state.powerups.enhancement,0);
 const success=new PotionGame();success.state.luck=10;success.state.powerups.enhancement=1;success.collect(0,0);
 assert.equal(success.enhance(.939999,1),'success');
}
const ordinary=new PotionGame();ordinary.collect(0,0);assert.equal(ordinary.next().chance,.8);
console.log('Passed: 99% ceiling across all families, stacked fairy bonuses, failure boundary, boost consumption, and current lower chances.');

// Existing potion values survive the balance update; future steps use current tables.
const candidate=require('../research/balance/stage-four-candidate/candidate.json');
for(let family=0;family<3;family++)for(let tier=0;tier<25;tier++){
 const recipe=FAMILIES[family].recipes[tier],expected=candidate.data.families[family].recipes[tier];
 assert.equal(recipe.base,expected.base);assert.deepEqual(recipe.multipliers,expected.multipliers);assert.deepEqual(recipe.chances,family===2?expected.chances.map(()=>.84655):expected.chances);
 const saved=new PotionGame();saved.state.tiers[family]=tier;saved.collect(family,tier);saved.state.potion.value=123.456;
 const loaded=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(saved.state))));assert.equal(loaded.state.potion.value,123.456);
 assert.equal(loaded.enhance(0,1),'success');assert.equal(loaded.state.potion.value,123.456*recipe.multipliers[0]);
}
console.log('Passed: all 75 selected recipe tables, preserved in-progress values, and current enhancement multipliers.');

// One ticket slot per 100 ingredient slots in a deterministic 101-spawn sample.
const draws=[];for(let i=0;i<101;i++){draws.push(i/101);if(i<100)draws.push(0,0);}
let draw=0;const mixed=new MaterialConveyor(8000,[0,0,0],()=>draws[draw++]);
while(mixed.items.length<101)mixed.spawn(mixed.items.length*mixed.spacing);
assert.equal(mixed.items.filter(m=>m.kind==='ticket').length,1);
assert.equal(mixed.items.filter(m=>m.kind!=='ticket').length,100);
for(let i=1;i<mixed.items.length;i++)assert.ok(Math.abs(mixed.items[i].x-mixed.items[i-1].x-mixed.spacing)<1e-8);
const ticketsOnly=new MaterialConveyor(152,[24,24,24],()=>1,()=>({materialProbability:[100,0,0]}));
assert.ok(ticketsOnly.items.every(m=>m.kind==='ticket'));
const ticketId=ticketsOnly.items[1].id;
ticketsOnly.advance(1000,true,2);assert.equal(ticketsOnly.items.find(m=>m.id===ticketId).x,0);
g=new PotionGame();const freshBefore=JSON.parse(JSON.stringify(g.state));assert.equal(g.collectTicket(),true);
assert.equal(g.state.tickets,1);assert.equal(g.state.potion,null);assert.equal(g.state.ingredients,freshBefore.ingredients);
g.collect(2,0);const potionBefore=JSON.parse(JSON.stringify(g.state));const ticket=ticketsOnly.take(ticketId);
assert.equal(ticket.kind,'ticket');assert.equal(g.collectTicket(),true);assert.equal(ticketsOnly.take(ticketId),null);
assert.equal(g.state.tickets,2);assert.deepEqual(g.state.potion,potionBefore.potion);assert.deepEqual(g.state.metrics,potionBefore.metrics);
assert.deepEqual(sanitizeSave(JSON.parse(JSON.stringify(g.state))),g.state);
g.state.tickets=Number.MAX_SAFE_INTEGER;assert.equal(g.collectTicket(),false);
console.log('Passed: 100:1 ingredient/ticket spawning, shared spacing/speed, one-time removal, isolated ticket rewards and save round trip.');

// Coarse but visible frames retain the same cards as ordinary 50 ms updates.
for(const [brewing,level]of [[false,0],[true,0],[true,19]]){
 const coarse=new MaterialConveyor(456,[0,0,0],()=>0),fine=new MaterialConveyor(456,[0,0,0],()=>0);
 coarse.advance(1000,brewing,level);for(let i=0;i<20;i++)fine.advance(50,brewing,level);
 const visible=belt=>belt.items.filter(m=>m.x<456-20);const a=visible(coarse),b=visible(fine);assert.equal(a.length,b.length);for(let i=0;i<a.length;i++)assert.ok(Math.abs(a[i].x-b[i].x)<1e-8);
}
console.log('Passed: long-frame visible emission matches fine-grained updates.');

// APK conveyor rules: 300 units/s over the 1,000-unit track; emission upgrades set cadence, with a 3/s empty-cauldron cap.
const apkBelt=new MaterialConveyor(1000,[0,0,0],()=>0);
assert.equal(apkBelt.speed(false,0),300);assert.equal(apkBelt.speed(true,19),300);
assert.equal(apkBelt.emissionRate(true,0),1);assert.equal(apkBelt.emissionRate(true,19),20);
assert.equal(apkBelt.emissionRate(false,0),1);assert.equal(apkBelt.emissionRate(false,19),3);
const fairyBelt=new MaterialConveyor(1000,[0,0,0],()=>0,()=>({cardsPerSecond:.5}));
assert.equal(fairyBelt.emissionRate(true,0),1.5);assert.equal(fairyBelt.emissionRate(false,19),3);
apkBelt.advance(1000,true,0);assert.ok(apkBelt.items.some(item=>item.x===600),'300 units of movement per second');
apkBelt.advance(0,true,0,500);assert.ok(apkBelt.items.every(item=>item.x<=500),'responsive rack resize preserves normalized position');
const cappedFrame=new MaterialConveyor(1000,[0,0,0],()=>0),serialBefore=cappedFrame.serial;cappedFrame.advance(1500,true,0);assert.equal(cappedFrame.serial-serialBefore,1,'large frames add at most one second to emission time');
console.log('Passed: APK constant conveyor speed, upgrade cadence, empty-belt cap, fairy rate bonus and responsive coordinate scaling.');
