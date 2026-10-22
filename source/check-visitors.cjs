const assert=require('node:assert/strict');
const {PotionGame,sanitizeSave,INITIAL,TRAVELERS}=require('./core.js'),dialogue=require('../data/visitor-dialogue.json');
for(const traveler of TRAVELERS){const offers=dialogue.entries[traveler.id]?.offer,flavors=dialogue.entries[traveler.id]?.offerFlavor;assert.ok(Array.isArray(offers)&&offers.length===5);assert.ok(Array.isArray(flavors)&&flavors.length===offers.length);assert.equal(new Set(offers).size,offers.length);assert.equal(new Set(flavors).size,flavors.length);assert.ok(offers.every(offer=>offer.includes('{potion}')&&offer.includes('{level}')));assert.ok(flavors.every(flavor=>!/\{(potion|level|family)\}/.test(flavor)));}
for(const doc of Object.values(dialogue.documented))for(const entry of [doc,doc.Pio,doc.Tia].filter(Boolean))if(entry.offer){assert.equal(entry.offer.length,entry.offerFlavor.length);assert.ok(entry.offerFlavor.every(flavor=>!/\{(potion|level|family)\}/.test(flavor)));}
assert.equal(dialogue.documented.tirami.Pio.offer.length,1);assert.equal(dialogue.documented.tirami.Tia.offer.length,2);assert.equal(dialogue.documented.luke.offer.length,3);assert.equal(dialogue.documented.charlotte.offer.length,1);assert.equal(dialogue.documented.demian.offer.length,1);
for(const [travelerId,phases] of Object.entries(dialogue.rewardAssumptions||{})){const entry=dialogue.entries[travelerId];assert.ok(entry,'Unknown reward-assumption traveler: '+travelerId);for(const [phase,assumption] of Object.entries(phases)){assert.ok(['returning','complete'].includes(phase),'Unknown reward-assumption phase: '+phase);assert.equal(assumption,'fairy');assert.ok([].concat(entry[phase]).length,'Missing tagged authored line.');}}
const returningLines={claire:'A fine preparation. I shall return with the payment your shop has earned.',luke:'...Good potion... I will bring something back... for the shop.',piria:'Perfect! Keep the light on - I will slip back with your payment.',charlotte:'Delightful. Charlotte always settles her debts, darling ♡.',demian:'Order received. The settlement has been entered and will arrive as scheduled.',daisy:'Lovely! I will be right back with a thank-you for the shop.'};
for(const [travelerId,line] of Object.entries(returningLines)){assert.equal(dialogue.entries[travelerId].returning,line);assert.equal(dialogue.rewardAssumptions[travelerId]?.returning,undefined,travelerId+' returning line must not be suppressed.');}
assert.equal(dialogue.entries.kyle.returning,'Thanks! I will be back with something for your shop.');
for(const traveler of TRAVELERS){const notes=dialogue.orderFlavor?.[traveler.id];assert.ok(Array.isArray(notes)&&notes.length===25,'Missing order flavor for '+traveler.id);for(const note of notes){const paragraphs=note.split('\n\n');assert.equal(paragraphs.length,2,'Order flavor must pair request and material text.');assert.ok(paragraphs[1].trim(),'Missing material tier note.');}}
function offer(type=0,amount=0){const g=new PotionGame(),rolls=[0,type,amount,0,0];g.state.nextVisitorAt=1;g.tick(1,()=>rolls.shift()||0);return g;}
let g=offer();assert.equal(g.state.travelers[0].leaveAt,60001);
g.tick(60000,()=>0);assert.equal(g.state.travelers[0].phase,'offer');
assert.equal(g.acceptQuest(0,60001),false);
assert.equal(g.tick(60001,()=>0)[0].kind,'departed');
assert.equal(g.state.travelers[0].phase,'away');assert.equal(g.state.nextVisitorAt,80001);
assert.equal(g.state.metrics.questsDeclined,1);assert.deepEqual(g.state.fairies,{});
for(const [type,expected]of [[0,'protection'],[.4,'enhancement'],[.9,'selling']])for(const [amount,expectedAmount]of [[0,1],[.999,3]]){
 g=offer(type,amount);const reward={type:expected,amount:expectedAmount};assert.deepEqual(g.state.travelers[0].rewardBoost,reward);
 assert.ok(g.acceptQuest(0,2));g.collect(0,0);assert.ok(g.deliver(0,3));assert.equal(g.state.travelers[0].readyAt,30003);
 assert.equal(g.state.rubies,0);assert.equal(g.state.powerups[expected],0);assert.deepEqual(g.state.fairies,{});
 g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.deepEqual(g.state.travelers[0].rewardBoost,reward);
 assert.equal(g.settle(30002).length,0);const rewards=g.settle(30003);assert.equal(rewards.length,1);assert.deepEqual(rewards[0].boost,reward);assert.equal(rewards[0].tickets,2);assert.equal(rewards[0].rubies,0);assert.equal(rewards[0].fairyId,null);assert.equal(g.state.powerups[expected],expectedAmount);assert.equal(g.state.rubies,0);assert.equal(g.state.tickets,2);assert.deepEqual(g.state.fairies,{});assert.equal(g.state.travelers[0].phase,'away');assert.equal(g.state.travelers[0].leaveAt,0);
 g=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));assert.equal(g.settle(30004).length,0);assert.equal(g.state.powerups[expected],expectedAmount);assert.equal(g.state.travelers[0].phase,'away');
 g.tick(90003,()=>0);assert.equal(g.state.travelers[0].phase,'away');assert.equal(g.state.nextVisitorAt,110003);
}
g=offer();g.acceptQuest(0,2,()=>0);g.collect(0,0);assert.equal(g.state.travelers[0].deadline,45002);g.tick(60002,()=>0);assert.equal(g.state.travelers[0].phase,'failed');assert.ok(g.state.potion);g.tick(120002,()=>0);assert.equal(g.state.travelers[0].phase,'away');
// Previously delivered legacy quests already paid their ruby; conversion must not pay it again.
const legacy=INITIAL();legacy.version=13;legacy.rubies=1;Object.assign(legacy.travelers[3],{phase:'returning',readyAt:1000,rewardFairyId:'fairy-1'});
g=new PotionGame(sanitizeSave(legacy));assert.equal(g.state.travelers[3].rewardFairyId,'fairy-1');assert.equal(g.settle(999).length,0);assert.equal(g.settle(1000).length,1);assert.equal(g.state.rubies,1);assert.equal(g.state.tickets,0);assert.deepEqual(g.state.fairies,{'fairy-1':1});assert.equal(g.state.powerups.protection,0);
// A legacy saved completion already paid its reward; reloading it leaves immediately without paying twice.
const completed=INITIAL();completed.powerups.protection=3;Object.assign(completed.travelers[0],{phase:'complete',leaveAt:100000,requirement:{family:0,tier:0,level:0},rewardBoost:{type:'protection',amount:3},rewardTickets:2,rewardRubies:0,rewardFairyId:null,readyAt:0,deadline:0});
g=new PotionGame(sanitizeSave(completed));assert.equal(g.tick(50000,()=>0).map(e=>e.kind).join(','),'departed');assert.equal(g.state.travelers[0].phase,'away');assert.equal(g.state.travelers[0].leaveAt,0);assert.equal(g.state.powerups.protection,3);assert.equal(g.state.tickets,0);assert.equal(g.state.nextVisitorAt,70000);
const pending=offer().state;
assert.throws(()=>sanitizeSave({...pending,travelers:pending.travelers.map((t,i)=>i===0?{...t,leaveAt:0}:t)}),/departure/);
assert.throws(()=>sanitizeSave({...pending,travelers:pending.travelers.map((t,i)=>i===0?{...t,rewardBoost:{type:'fairy',amount:5}}:t)}),/quest boost/);
assert.throws(()=>sanitizeSave({...pending,travelers:pending.travelers.map((t,i)=>i===0?{...t,rewardBoost:{type:'protection',amount:11}}:t)}),/quest boost/);
console.log('Passed: 60-second offer expiry, five unique authored request/flavor pairs with placeholders per visitor, aligned documented pools, exact reward-neutral returning lines, complete-only reward-assumption tags, 25 paired material notes per visitor, all boost types and amounts, 30-second payout, immediate post-reward departure, reload idempotency, legacy completion dismissal without double pay, and preserved legacy fairy reward.');
