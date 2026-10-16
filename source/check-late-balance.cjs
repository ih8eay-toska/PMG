const assert=require('node:assert/strict');
const {PotionGame,FAMILIES,FAIRIES,sanitizeSave,ECONOMY,ladder,evaluate,rng}=require('../research/balance/live-runtime.cjs');
let comparisons=0,worst=0,minAdjacent=Infinity,largestFairyValue=0;
// Compare ordinary income, allowing the best farming stop to differ from mastery.
for(let luck=0;luck<=10;luck++)for(let price=0;price<=4;price++)for(const mode of ['manual','conveyor']){
 let previous;
 for(let tier=0;tier<25;tier++){
  const rates=FAMILIES.map((family,f)=>{
   const l=ladder(f,tier,{luck,price});let best=0;
   const multiplier=mode==='conveyor'?ECONOMY.conveyor.emptySpeedMultiplier:1;
   const p=(1-(ECONOMY.conveyor.ticketProbability+ECONOMY.conveyor.solutionProbability*.75))/3/(tier+1);
   const wait=mode==='conveyor'?ECONOMY.conveyor.spacing/(ECONOMY.conveyor.baseSpeed*multiplier*p):0;
   for(let target=0;target<l.values.length;target++){const r=evaluate(l,target);best=Math.max(best,r.expectedGold/(wait+r.actions*.5)*60);}
   assert.ok(Number.isFinite(best)&&best>0);return best;
  });
  const spread=Math.max(...rates)/Math.min(...rates);worst=Math.max(worst,spread);comparisons++;
  assert.ok(spread<=1.25+1e-10,`${mode}, luck ${luck}, price ${price}, tier ${tier+1}: spread ${spread}`);
  if(previous)for(let f=0;f<3;f++){const ratio=rates[f]/previous[f];minAdjacent=Math.min(minAdjacent,ratio);assert.ok(ratio>=1-1e-12,`${mode} tier ${tier+1}: backward income`);}
  previous=rates;
 }
}
assert.equal(comparisons,2750);
// Independently sample finite protection/boost depletion against the solver.
for(const [family,tier,fairy]of [[0,24,null],[1,24,null],[2,24,null],[0,20,'fairy-29'],[1,20,'fairy-26'],[2,20,'fairy-28']]){
 const profile={luck:10,price:4,fairy,level:5},l=ladder(family,tier,profile),target=3,predicted=evaluate(l,target,1,2,1),random=rng(9231+family+tier),n=5000;
 let successes=0,attempts=0,shields=0,charges=0;
 for(let i=0;i<n;i++){
  const g=new PotionGame();g.state.tiers[family]=tier;g.state.luck=10;g.state.price=4;if(fairy){g.state.fairies[fairy]=5;g.setActiveFairy(fairy);}g.collect(family,tier);g.state.powerups={protection:1,enhancement:2,selling:1};
  while(g.state.potion&&g.state.potion.level<target)g.enhance(random(),random());
  if(g.state.potion){successes++;assert.equal(g.sell(),l.doubled[target]);}
  attempts+=g.state.metrics.enhancementAttempts;shields+=g.state.metrics.powerupsUsed.protection;charges+=g.state.metrics.powerupsUsed.enhancement;
 }
 assert.ok(Math.abs(successes/n-predicted.probability)<.03);assert.ok(Math.abs(attempts/n-(predicted.actions-1-predicted.probability))<.09);assert.ok(Math.abs(shields/n-predicted.protectionUsed)<.03);assert.ok(Math.abs(charges/n-predicted.enhancementUsed)<.05);
}
// A multiplier fairy supplies its listed whole-brew bonus, not exponential growth.
for(const fairy of FAIRIES)for(const count of [1,5,10])for(let tier=0;tier<25;tier++)for(let f=0;f<3;f++){
 const game=new PotionGame(),s=game.state;s.tiers[f]=tier;s.luck=10;s.price=4;s.fairies[fairy.id]=count;game.setActiveFairy(fairy.id);s.powerups.enhancement=10;s.powerups.selling=2;
 game.collect(f,tier);const steps=game.recipe().max_level-1,whole=game.fairyEffects(fairy.id,1).enhancementMultiplier?.[f]||0,perStep=game.fairyEffects().enhancementMultiplier?.[f]||0;
 assert.ok(Math.abs((1+perStep)**steps-1-whole)<1e-12);
 while(game.next())assert.equal(game.enhance(0,1),'success');
 const price=game.sellValue();assert.ok(Number.isFinite(price)&&price>0&&price<1e300);largestFairyValue=Math.max(largestFairyValue,price);
 assert.equal(sanitizeSave(JSON.parse(JSON.stringify(s))).potion.value,s.potion.value);
}
console.log(`Passed: ${comparisons} live ordinary-income comparisons; worst spread ${worst.toFixed(6)}x; minimum adjacent ${minAdjacent.toFixed(6)}x.`);
console.log(`Passed: 30,000 sampled boosted brews; all ${FAIRIES.length} fairies at levels 1/5/10 across all recipes; whole-brew bonuses and save round trips. Largest sale ${largestFairyValue.toFixed(2)}.`);
