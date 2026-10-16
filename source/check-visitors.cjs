const assert=require('node:assert/strict');
const {PotionGame,sanitizeSave,INITIAL}=require('./core.js');
function offer(type=0,amount=0){const g=new PotionGame(),rolls=[0,type,amount,0,0];g.state.nextVisitorAt=1;g.tick(1,()=>rolls.shift()||0);return g;}
let g=offer();assert.equal(g.state.travelers[0].leaveAt,60001);
g.tick(60000,()=>0);assert.equal(g.state.travelers[0].phase,'offer');
assert.equal(g.acceptQuest(0,60001),false);
assert.equal(g.tick(60001,()=>0)[0].kind,'departed');
assert.equal(g.state.travelers[0].phase,'away');assert.equal(g.state.nextVisitorAt,80001);
assert.equal(g.state.metrics.questsDeclined,1);assert.deepEqual(g.state.fairies,{});
for(const [type,expected]of [[0,'protection'],[.4,'enhancement'],[.9,'selling']])for(const [amount,expectedAmount]of [[0,1],[.999,5]]){
 g=offer(type,amount);const reward={type:expected,amount:expectedAmount};assert.deepEqual(g.state.travelers[0].rewardBoost,reward);
 assert.ok(g.acceptQuest(0,2));g.collect(0,0);assert.ok(g.deliver(0,3));assert.equal(g.state.travelers[0].readyAt,30003);
 assert.equal(g.state.rubies,0);assert.equal(g.state.powerups[expected],0);assert.deepEqual(g.state.fairies,{});
 g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.deepEqual(g.state.travelers[0].rewardBoost,reward);
 assert.equal(g.settle(30002).length,0);assert.equal(g.settle(30003).length,1);assert.equal(g.state.powerups[expected],expectedAmount);assert.equal(g.state.rubies,1);assert.deepEqual(g.state.fairies,{});
 g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.settle(30004).length,0);assert.equal(g.state.powerups[expected],expectedAmount);
 g.tick(90003,()=>0);assert.equal(g.state.travelers[0].phase,'away');assert.equal(g.state.nextVisitorAt,110003);
}
g=offer();g.acceptQuest(0,2);g.collect(0,0);g.tick(60002,()=>0);assert.equal(g.state.travelers[0].phase,'failed');assert.ok(g.state.potion);g.tick(120002,()=>0);assert.equal(g.state.travelers[0].phase,'away');
// Previously delivered legacy quests already paid their ruby; conversion must not pay it again.
const legacy=INITIAL();legacy.version=13;legacy.rubies=1;Object.assign(legacy.travelers[3],{phase:'returning',readyAt:1000,rewardFairyId:'fairy-1'});
g=new PotionGame(sanitizeSave(legacy));assert.equal(g.state.travelers[3].rewardFairyId,null);assert.equal(g.settle(999).length,0);assert.equal(g.settle(1000).length,1);assert.equal(g.state.rubies,1);assert.deepEqual(g.state.fairies,{});assert.equal(g.state.powerups.protection,3);
const pending=offer().state;
assert.throws(()=>sanitizeSave({...pending,travelers:pending.travelers.map((t,i)=>i===0?{...t,leaveAt:0}:t)}),/departure/);
assert.throws(()=>sanitizeSave({...pending,travelers:pending.travelers.map((t,i)=>i===0?{...t,rewardBoost:{type:'fairy',amount:5}}:t)}),/quest boost/);
assert.throws(()=>sanitizeSave({...pending,travelers:pending.travelers.map((t,i)=>i===0?{...t,rewardBoost:{type:'protection',amount:6}}:t)}),/quest boost/);
console.log('Passed: 60-second offer expiry, all boost types and amounts, 30-second payout, reload idempotency, automatic departures, and legacy reward conversion.');
