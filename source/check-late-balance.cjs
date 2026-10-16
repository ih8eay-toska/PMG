// Independently exercise the real gameplay methods across the full upgrade grid.
const assert=require('node:assert/strict');
const {PotionGame,FAMILIES,FAIRIES,sanitizeSave}=require('./core.js');
let states=0,worst=0,minAdjacent=Infinity,largestFairyValue=0;
for(let luck=0;luck<=10;luck++)for(let fortune=0;fortune<=10;fortune++){
 const ladders=Array.from({length:25},(_,tier)=>FAMILIES.map((family,f)=>{
  const game=new PotionGame();game.state.luck=luck;game.state.rubyUpgrades.fortune=fortune;game.state.tiers[f]=tier;
  assert.equal(game.collect(f,tier),true);
  const rows=[{value:game.state.potion.value,probability:1,actions:2,level:0}];
  let probability=1,attempts=0;
  while(game.next()){
   const chance=game.next().chance;attempts+=probability;probability*=chance;
   assert.equal(game.enhance(0,1),'success');
   rows.push({value:game.state.potion.value,probability,actions:1+attempts+probability,level:game.state.potion.level});
  }
  return {game,rows,f,tier,max:family.recipes[tier].max_level};
 }));
 for(let price=0;price<=4;price++)for(let value=0;value<=10;value++){
  states++;let previous;
  for(let tier=0;tier<25;tier++){
   const rates=ladders[tier].map(({game,rows,f,max})=>{
    game.state.price=price;game.state.rubyUpgrades.value=value;
    let best=-Infinity,target=0;
    for(const row of rows){
     game.state.potion={family:f,tier,level:row.level,value:row.value};
     const rate=row.probability*game.sellValue()/row.actions;
     assert.ok(Number.isFinite(rate)&&rate>0);
     if(rate>best){best=rate;target=row.level+1;}
    }
    if(tier>=12)assert.equal(target,max,'Late baseline should reward maximum enhancement');
    return best;
   });
   const spread=Math.max(...rates)/Math.min(...rates);worst=Math.max(worst,spread);
   assert.ok(spread<=2+1e-10,`Tier ${tier+1}: family spread ${spread}`);
   if(previous)for(let f=0;f<3;f++){
    const ratio=rates[f]/previous[f];minAdjacent=Math.min(minAdjacent,ratio);
    assert.ok(ratio>=1-1e-12,`Tier ${tier+1}: income dropped`);
   }
   previous=rates;
  }
 }
}
assert.equal(states,6655);
// Cross-check terminal report probabilities/retries against real charge transitions.
for(const row of require('../research/balance/late-outcomes-summary.json').tier_25){
 const f=FAMILIES.findIndex(family=>family.label===row.family),tier=24;
 const profile=row.profile==='Base'?[0,0,0,0]:row.profile==='Shop max'?[10,0,4,0]:[10,10,4,10];
 function make(level=0,h=0,e=0){
  const game=new PotionGame(),s=game.state;s.tiers[f]=tier;s.luck=profile[0];s.rubyUpgrades.fortune=profile[1];s.price=profile[2];s.rubyUpgrades.value=profile[3];
  game.collect(f,tier);for(let i=0;i<level;i++)game.enhance(0,1);
  s.powerups.protection=h;s.powerups.enhancement=e;s.powerups.selling=row.resources==='Fixed'?2:0;
  return game;
 }
 const memo=new Map(),target=row.stop_level-1;
 function visit(level,h,e){
  if(level===target)return [1,0];
  const key=[level,h,e].join(',');if(memo.has(key))return memo.get(key);
  const game=make(level,h,e),chance=game.next().chance;
  assert.equal(game.enhance(0,1),'success');
  const yes=visit(game.state.potion.level,game.state.powerups.protection,game.state.powerups.enhancement);
  const failed=make(level,h,e),result=failed.enhance(1,1);
  const no=result==='protected'?visit(failed.state.potion.level,failed.state.powerups.protection,failed.state.powerups.enhancement):[0,0];
  const answer=[chance*yes[0]+(1-chance)*no[0],1+chance*yes[1]+(1-chance)*no[1]];
  memo.set(key,answer);return answer;
 }
 const fixed=row.resources==='Fixed',[p,attempts]=visit(0,fixed?5:0,fixed?10:0);
 const payout=make(target).sellValue(),actions=1+attempts+p;
 assert.ok(Math.abs(p-row.probability)<1e-12);
 assert.ok(Math.abs(actions-row.actions)<1e-10);
 assert.ok(Math.abs(payout-row.payout)<=Math.max(1,row.payout*1e-12));
 assert.ok(Math.abs(p*payout/actions-row.gold_per_action)<=Math.max(1,row.gold_per_action*1e-12));
}
console.log('Passed: 18 terminal before-sale outcomes match actual success, shield retry, boost depletion and sale methods.');
// Fairy strength is intentionally unrestricted; still require finite saveable values.
for(const fairy of FAIRIES)for(let tier=12;tier<25;tier++)for(let f=0;f<3;f++){
 const game=new PotionGame(),s=game.state;s.tiers[f]=tier;s.luck=10;s.price=4;s.rubyUpgrades.fortune=10;s.rubyUpgrades.value=10;
 s.fairies[fairy.id]=10;game.setActiveFairy(fairy.id);s.powerups.enhancement=10;s.powerups.selling=2;
 assert.equal(game.collect(f,tier),true);
 while(game.next())assert.equal(game.enhance(0,1),'success');
 const price=game.sellValue();assert.ok(Number.isFinite(price)&&price>0&&price<1e300);
 largestFairyValue=Math.max(largestFairyValue,price);
 assert.equal(sanitizeSave(JSON.parse(JSON.stringify(s))).potion.value,s.potion.value);
}
console.log(`Passed: real gameplay methods, ${states*25} tier/state comparisons; worst spread ${worst.toFixed(9)}x; minimum adjacent ${minAdjacent.toFixed(9)}x.`);
console.log(`Passed: all ${FAIRIES.length} max-level fairies across late tiers remain finite and saveable; largest sale ${largestFairyValue.toExponential(6)}. Fairy balance is intentionally excluded.`);
