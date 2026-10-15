const assert=require('node:assert/strict');
const{PotionGame,MaterialConveyor,materialPool,INITIAL,sanitizeSave,FAMILIES,TRAVELERS,FAIRIES,REQUESTS,LEVEL_EXP}=require('./core.js');
let g=new PotionGame();assert.equal(g.collect(1,0),true);g.collect(0,0);assert.equal(g.state.potion.family,1);assert.equal(g.state.potion.value,11);
assert.equal(g.enhance(0),'success');assert.equal(g.state.potion.value,13.2);assert.equal(g.enhance(.99),'lost');assert.equal(g.state.failed,1);assert.equal(g.state.potion,null);
g.state.powerups={protection:1,enhancement:1,selling:1};g.collect(0,0);assert.equal(g.next().chance,.99);assert.equal(g.enhance(0),'success');assert.equal(g.state.powerups.enhancement,0);assert.equal(g.state.powerups.protection,1);assert.equal(g.enhance(.99),'protected');assert.equal(g.state.powerups.protection,0);assert.equal(g.state.potion.level,1);assert.equal(g.sell(),20);assert.equal(g.state.powerups.selling,0);
g=new PotionGame();g.collect(2,0);g.enhance(0);g.enhance(0);assert.equal(g.next(),null);assert.equal(g.enhancementStatus(),'max');assert.equal(g.sell(),14);
g.state.coins=1e20;for(let i=0;i<24;i++)assert.equal(g.buy('tier0'),true);assert.equal(g.buy('tier0'),false);assert.equal(g.state.tiers[0],24);assert.equal(g.collect(0,24),true);assert.equal(g.recipe().base,1e6);assert.equal(g.next().chance,.12);
// Each newly completed potion must reach its documented maximum and save/load there.
for(const [family,tier,expectedProduct] of [[1,5,78.26304],[1,19,9643500],[1,20,2084141836.875],[1,21,4063390466.032],[1,23,12400793635.913],[2,24,125184900814.733]]){
 g=new PotionGame();g.state.tiers[family]=tier;assert.equal(g.collect(family,tier),true);const base=g.recipe().base;const max=g.recipe().max_level;
 for(let level=1;level<max;level++){assert.ok(g.next());assert.equal(g.enhance(0),'success');}
 assert.equal(g.enhancementStatus(),'max');assert.equal(g.enhance(0),null);assert.ok(Math.abs(g.state.potion.value/base-expectedProduct)<=expectedProduct*1e-10);
 assert.deepEqual(sanitizeSave(JSON.parse(JSON.stringify(g.state))),g.state);assert.ok(g.sell()>0);
}
g=new PotionGame();g.state.tiers[1]=3;g.collect(1,3);assert.equal(g.next().multiplier,1.62);
// Preserve the unknown-data guard for any genuinely missing future record.
const home=FAMILIES[1].recipes[5],recordedStep=home.multipliers[3];
try{home.multipliers[3]=null;g=new PotionGame();g.state.tiers[1]=5;g.collect(1,5);g.enhance(0);g.enhance(0);g.enhance(0);assert.equal(g.enhancementStatus(),'unknown');assert.equal(g.enhance(0),null);}finally{home.multipliers[3]=recordedStep;}

// Visits are random scheduled offers; no deadline starts before explicit acceptance.
g=new PotionGame();g.tick(1000,()=>0);assert.equal(g.state.nextVisitorAt,21000);assert.equal(g.tick(20999,()=>0).length,0);
assert.equal(g.tick(21000,()=>0)[0].kind,'arrived');assert.equal(g.state.travelers[0].phase,'offer');
assert.equal(g.state.travelers[0].deadline,0);g.collect(0,0);assert.equal(g.canDeliver(0,22000),false);
assert.equal(g.acceptQuest(0,30000),true);assert.equal(g.state.travelers[0].deadline,90000);assert.equal(g.acceptQuest(0,40000),false);
assert.equal(g.canDeliver(0,89999),true);assert.equal(g.canDeliver(0,90000),false);
const frozen=JSON.stringify(g.questRequirement(0));g.state.tiers[0]=24;assert.equal(JSON.stringify(g.questRequirement(0)),frozen);
assert.equal(g.deliver(0,31000),true);assert.equal(g.state.potion,null);assert.equal(g.state.travelers[0].phase,'complete');assert.equal(g.state.powerups.protection,5);assert.equal(g.state.travelers[0].quests,1);assert.equal(g.settle(90999).length,0);
g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.settle(91000).length,0);
assert.equal(g.state.powerups.protection,5);assert.equal(g.state.travelers[0].quests,1);
assert.equal(g.state.travelers[0].phase,'complete');assert.equal(g.dismissVisitor(0,92000,()=>1),true);assert.equal(g.state.nextVisitorAt,152000);
// Deadline survives a reload; failure neither pays a reward nor destroys the potion.
g=new PotionGame();g.tick(1000,()=>0);g.tick(21000,()=>0);g.acceptQuest(0,22000);g.collect(0,0);
g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.tick(82000,()=>0)[0].kind,'failed');
assert.equal(g.state.travelers[0].phase,'failed');assert.ok(g.state.potion);assert.equal(g.deliver(0,82000),false);
assert.equal(g.state.powerups.protection,0);assert.equal(g.state.travelers[0].quests,0);assert.equal(g.settle(900000).length,0);
assert.equal(g.dismissVisitor(0,82000,()=>0),true);assert.equal(g.state.nextVisitorAt,102000);
// All three visitors can arrive and ask for any unlocked family, rather than a fixed assignment.
for(const [roll,index]of [[0,0],[.4,4],[.9,9]]){g=new PotionGame();g.state.nextVisitorAt=1;g.tick(1,()=>roll);assert.equal(g.state.travelers[index].phase,'offer');}
g=new PotionGame();g.state.tiers=[4,8,24];const req=g.randomRequirement(()=>.999);assert.equal(req.family,2);assert.equal(req.tier,24);assert.ok(req.level<FAMILIES[2].recipes[24].max_level);
// Rewards already in transit in older saves are granted on the next settle.
let v2={...INITIAL(),version:2,travelers:[{quests:2,readyAt:61000},{quests:0,readyAt:0},{quests:0,readyAt:0}]};
g=new PotionGame(sanitizeSave(v2));assert.equal(g.state.travelers[0].phase,'returning');assert.equal(g.settle(1).length,1);assert.equal(g.state.travelers[0].quests,3);assert.equal(g.settle(62000).length,0);
// Unbiased material pool, identical empty-cauldron speed at every emission level,
// and spatially even emission when speed changes or an ingredient is collected.
assert.equal(materialPool([0,1,2]).length,6);assert.deepEqual(materialPool([0,0,0]).map(x=>x.family),[0,1,2]);
let belt=new MaterialConveyor(456,[0,0,0],()=>0),base=belt.speed(false,0);assert.equal(belt.speed(false,19),base);assert.ok(belt.speed(true,19)>belt.speed(true,0));
const seen=new Set();const pool=materialPool([1,2,3]);let sequence=[];for(const m of pool){const start=[0,2,5][m.family];sequence.push((start+.5)/9,(m.tier+.5)/([1,2,3][m.family]+1));}let sample=0;belt=new MaterialConveyor(760,[1,2,3],()=>sequence[sample++%sequence.length]);belt.items.forEach(m=>seen.add(m.family+'-'+m.tier));assert.equal(seen.size,pool.length);
let slow=new MaterialConveyor(456,[0,0,0],()=>0),fast=new MaterialConveyor(456,[0,0,0],()=>0);slow.advance(1000,false,19);fast.advance(1000,true,19);assert.ok(fast.items[0].x<slow.items[0].x);
belt=new MaterialConveyor(456,[0,0,0],()=>0);const before=belt.items[1].x;const taken=belt.take(belt.items[0].id);assert.ok(taken);assert.equal(belt.items[0].x,before);
for(let i=0;i<300;i++){belt.advance(100,i>100,19);const items=belt.items;for(let j=1;j<items.length;j++){const gap=items[j].x-items[j-1].x;assert.ok(Math.abs(gap/76-Math.round(gap/76))<1e-8);assert.ok(gap>=76-1e-8);}}
// Collecting after enhancement retains the observed additive behavior.
g=new PotionGame();g.collect(1,0);g.enhance(0);const enhanced=g.state.potion.value;g.collect(0,0);assert.equal(g.state.potion.value,enhanced+FAMILIES[0].materials[0].value);
let old={version:1,coins:123,tiers:[2,1,0],luck:3,price:3,speed:3,potion:{family:1,tier:1,level:1,value:25},sold:7,failed:1,best:50,ingredients:20};let migrated=sanitizeSave(old);assert.equal(migrated.version,9);assert.equal(migrated.coins,123);assert.deepEqual(migrated.tiers,[2,1,0]);assert.equal(migrated.potion.value,25);assert.deepEqual(sanitizeSave(migrated),migrated);
assert.throws(()=>sanitizeSave({...INITIAL(),coins:-1}));assert.throws(()=>sanitizeSave({...INITIAL(),powerups:{protection:-1,enhancement:0,selling:0}}));assert.throws(()=>sanitizeSave({...INITIAL(),travelers:[{}, {}, {}]}));assert.throws(()=>sanitizeSave({...INITIAL(),potion:{family:0,tier:0,level:20,value:10}}));
assert.equal(FAMILIES.length,3);assert.equal(FAMILIES.flatMap(f=>f.recipes).length,75);assert.equal(FAMILIES.flatMap(f=>f.recipes).filter(r=>r.complete).length,75);
for(const f of FAMILIES)for(const r of f.recipes){if(r.complete){assert.equal(r.multipliers.length,r.max_level-1);assert.ok(r.chances.every(c=>c>=0&&c<=1));}}
console.log('Passed: randomized evenly spaced conveyor, emission speeds, random visitors, acceptance deadlines, failure/reload, reward idempotency, v1/v2 migration, 75 complete recipes, six restored enhancement paths, corrected Small MP, unknown-data guard, powerup consumption, delayed quest rewards, v1 migration, invalid-save rejection.');

const badActive={...INITIAL(),travelers:[{quests:0,readyAt:0,phase:'active',deadline:1,requirement:null},...INITIAL().travelers.slice(1)]};assert.throws(()=>sanitizeSave(badActive));
assert.throws(()=>sanitizeSave({...INITIAL(),nextVisitorAt:-1}));

// Seven added visitors grant a frozen fairy reward after the delay, once across reloads.
assert.equal(TRAVELERS.length,10);assert.equal(FAIRIES.length,35);
for(let index=3;index<TRAVELERS.length;index++){
 g=new PotionGame();g.state.nextVisitorAt=1;let rolls=[(index+.1)/TRAVELERS.length,0,0];g.tick(1,()=>rolls.shift()||0);
 assert.equal(g.state.travelers[index].phase,'offer');assert.equal(g.acceptQuest(index,1000),true);g.collect(0,0);
 assert.equal(g.deliver(index,2000,()=>.999),true);const id=g.state.travelers[index].rewardFairyId;assert.equal(id,FAIRIES.at(-1).id);
 assert.equal(g.state.travelers[index].phase,'complete');g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.settle(61999).length,0);assert.equal(g.settle(62000).length,0);assert.equal(g.state.fairies[id],1);assert.equal(g.settle(63000).length,0);
 assert.deepEqual(g.state.powerups,{protection:0,enhancement:0,selling:0});assert.deepEqual(sanitizeSave(g.state),g.state);
 g.state.travelers[index].phase='returning';g.state.travelers[index].readyAt=64000;g.settle(64000);assert.equal(g.state.fairies[id],2);
}
let v3={...INITIAL(),version:3,travelers:INITIAL().travelers.slice(0,3)};v3.travelers[1]={...v3.travelers[1],phase:'active',deadline:65000,requirement:{family:0,tier:0,level:0}};
let upgraded=sanitizeSave(v3);assert.equal(upgraded.travelers.length,10);assert.equal(upgraded.travelers[1].deadline,65000);assert.deepEqual(upgraded.fairies,{});
assert.throws(()=>sanitizeSave({...INITIAL(),fairies:{'unknown-fairy':1}}));assert.throws(()=>sanitizeSave({...INITIAL(),fairies:{'fairy-1':-1}}));
console.log('Passed: all 10 visitor arrivals, all seven fairy rewards, 35 regular fairies, duplicate counts, delayed delivery and v3 migration.');

// Statistics distinguish historical totals from tracked detail and record each action once.
g=new PotionGame();g.collect(0,0);g.collect(1,0);g.state.powerups={protection:1,enhancement:1,selling:1};
assert.equal(g.enhance(0),'success');assert.equal(g.enhance(.999),'protected');const price=g.sell();
assert.equal(g.state.metrics.brewsStarted,1);assert.deepEqual(g.state.metrics.ingredientsByFamily,[1,1,0]);assert.equal(g.state.metrics.enhancementAttempts,2);assert.equal(g.state.metrics.enhancementsSucceeded,1);assert.equal(g.state.metrics.enhancementsFailed,1);assert.equal(g.state.metrics.protectedFailures,1);assert.equal(g.state.metrics.potionsLost,0);assert.equal(g.state.metrics.coinsEarned,price);assert.deepEqual(g.state.metrics.powerupsUsed,{protection:1,enhancement:1,selling:1});assert.equal(g.state.metrics.recipes['0-0'].highestLevel,2);
g.collect(1,0);g.sell();assert.equal(g.state.metrics.soldLevelOne,1);g.state.coins=1000;assert.equal(g.buy('speed'),true);assert.equal(g.state.metrics.coinsSpent,70);assert.equal(g.state.metrics.upgradesBought,1);g.recordPlayTime(1000);assert.equal(g.state.metrics.activePlayMs,1000);assert.deepEqual(sanitizeSave(g.state),g.state);
g=new PotionGame();g.tick(1,()=>0);g.tick(20001,()=>0);g.acceptQuest(0,21000);g.tick(81000,()=>0);assert.equal(g.state.metrics.questsOffered,1);assert.equal(g.state.metrics.questsAccepted,1);assert.equal(g.state.metrics.questsFailed,1);assert.equal(g.state.metrics.visitors.neet.failed,1);
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
 assert.equal(capped.next().chance,.99);assert.equal(capped.enhance(.99,1),'lost');assert.equal(capped.state.powerups.enhancement,0);
 const success=new PotionGame();success.state.luck=10;success.state.powerups.enhancement=1;success.collect(0,0);
 assert.equal(success.enhance(.989999,1),'success');
}
const ordinary=new PotionGame();ordinary.collect(0,0);assert.equal(ordinary.next().chance,.9);
console.log('Passed: 99% ceiling across all families, stacked fairy bonuses, failure boundary, boost consumption, and unchanged lower chances.');

// Existing potion values survive the balance update; future steps use current tables.
const applied = require('../research/balance/applied-candidates.json');
assert.equal(applied.length,17);
for(const change of applied){
 assert.deepEqual(FAMILIES[change.family].recipes[change.tier-1].multipliers,change.after);
 const saved=new PotionGame();saved.state.tiers[change.family]=change.tier-1;
 saved.collect(change.family,change.tier-1);saved.state.potion.value=123.456;
 const loaded=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(saved.state))));
 assert.equal(loaded.state.potion.value,123.456);
 assert.equal(loaded.enhance(0,1),'success');
 assert.equal(loaded.state.potion.value,123.456*change.after[0]);
}
console.log('Passed: all 17 applied multiplier arrays and existing potion values survive reload.');
