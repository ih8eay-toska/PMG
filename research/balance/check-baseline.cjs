const assert=require('node:assert/strict');
const {PotionGame,FAMILIES,FAIRIES}=require('./research-runtime.cjs');
const {checks,rng,ladder,evaluate,economy}=require('./baseline-current.cjs');
checks();
// Independently sample actual game transitions; the analytical solver does not call enhance.
for(const [family,tier,fairy]of [[0,0,null],[1,12,null],[2,24,null],[0,20,'fairy-29'],[1,20,'fairy-26'],[2,20,'fairy-28']]){
 const profile={luck:10,price:4,fairy,level:5},l=ladder(family,tier,profile),target=Math.min(3,FAMILIES[family].recipes[tier].max_level-1),predicted=evaluate(l,target,1,2,1),random=rng(9231+family+tier),n=12000;
 let successes=0,attempts=0,shields=0,charges=0;
 for(let i=0;i<n;i++){const g=new PotionGame();g.state.tiers[family]=tier;g.state.luck=10;g.state.price=4;if(fairy){g.state.fairies[fairy]=5;g.setActiveFairy(fairy);}g.collect(family,tier);g.state.powerups={protection:1,enhancement:2,selling:1};while(g.state.potion&&g.state.potion.level<target)g.enhance(random(),random());if(g.state.potion){successes++;assert.equal(g.sell(),l.doubled[target]);}attempts+=g.state.metrics.enhancementAttempts;shields+=g.state.metrics.powerupsUsed.protection;charges+=g.state.metrics.powerupsUsed.enhancement;}
 assert.ok(Math.abs(successes/n-predicted.probability)<.025,'completion probability');assert.ok(Math.abs(attempts/n-(predicted.actions-1-predicted.probability))<.08,'attempt count');assert.ok(Math.abs(shields/n-predicted.protectionUsed)<.025,'shield consumption');assert.ok(Math.abs(charges/n-predicted.enhancementUsed)<.04,'charge consumption');
}
const rows=economy().chests;
assert.ok(Math.abs(rows.find(r=>r.kind==='tickets'&&r.maxFairies&&!r.allEligibleSkinsOwned).currencyReturnFraction-1.01)<1e-12);
let tickets=0,rubies=0;for(let i=0;i<100;i++){const g=new PotionGame();g.state.tickets=5;for(const f of FAIRIES)g.state.fairies[f.id]=10;const reward=g.openReward('tickets','Pio',1000,()=>(i+.5)/100);if(reward.currency==='tickets')tickets+=reward.amount;else if(reward.currency==='rubies')rubies+=reward.amount;else assert.fail('max-fairy ticket case should contain currencies only');}
assert.ok(Math.abs((tickets/100+rubies/100*10)/5-1.01)<1e-12);
console.log('Passed: archived pre-rebalance engine: deterministic runs, probability fixtures, 72,000 sampled brews and historical 101% max-fairy ticket-case return.');
