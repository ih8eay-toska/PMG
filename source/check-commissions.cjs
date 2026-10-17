const assert=require('node:assert/strict');
const {PotionGame,sanitizeSave}=require('./core.js');
let g=new PotionGame();assert.equal(g.commissionOffers().length,3);assert.equal(g.acceptCommission(0),true);assert.equal(g.acceptCommission(1),false);assert.equal(g.state.coins,0);g.collect(1,0);assert.equal(g.deliverCommission(),null);g.sell();
for(let i=0;i<3;i++){g.collect(0,0);assert.equal(g.canDeliverCommission(),false);g.enhance(0);assert.equal(g.canDeliverCommission(),true);if(i===1){g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.state.commission.delivered,1);}const result=g.deliverCommission();assert.equal(result.complete,i===2);assert.equal(g.state.potion,null);}
assert.equal(g.state.commissionsCompleted,1);assert.equal(g.state.likeability,10);assert.equal(g.state.powerups.protection,2);assert.equal(g.deliverCommission(),null);
g=new PotionGame();g.state.commissionsCompleted=2;const offer=g.commissionOffers()[1];assert.ok(offer.fairyId);assert.equal(g.acceptCommission(1),true);
for(let i=0;i<3;i++){g.collect(1,0);while(g.state.potion.level+1<offer.level)g.enhance(0);if(i===2){g.startEnhancement(0);assert.equal(g.canDeliverCommission(),false);g.finishEnhancement(3000,0);}assert.ok(g.deliverCommission());}
assert.equal(g.state.fairies[offer.fairyId],1);assert.equal(g.state.commissionsCompleted,3);
const old=new PotionGame().state;delete old.commission;delete old.commissionsCompleted;assert.equal(sanitizeSave(old).commission,null);assert.throws(()=>sanitizeSave({...old,commission:{family:8}}));
const busy=new PotionGame();busy.state.request={};assert.equal(busy.acceptCommission(0),false);
console.log('Passed: three choices, single acceptance, no fee, matching and level requirements, three consumed deliveries, saved progress, one-time rewards, guaranteed third fairy and old-save defaults.');

const choices=new PotionGame();choices.state.tiers=[24,12,4];let draws=[.99,.5,0];const offers=choices.commissionOffers(()=>draws.shift());assert.deepEqual(offers.map(o=>o.family),[0,1,2]);assert.deepEqual(offers.map(o=>o.tier),[24,6,0]);assert.deepEqual(choices.commissionOffers(()=>0).map(o=>o.tier),[24,6,0]);const restored=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(choices.state))));assert.deepEqual(restored.commissionOffers(()=>0).map(o=>o.tier),[24,6,0]);assert.throws(()=>sanitizeSave({...choices.state,commissionTiers:[25,0,0]}));console.log('Passed: independent unlocked tiers for all three families, stable board choices, save persistence and locked-tier refusal.');
