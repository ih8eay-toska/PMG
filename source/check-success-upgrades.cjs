const assert=require('node:assert/strict');
const {PotionGame,ECONOMY,FAMILIES,sanitizeSave}=require('./core.js');
const bonuses=[0,1,1.5,2,2.5,3,3.5,4,4.5,5,5.6,6.127,6.654,7.181,7.709,8.236,8.763,9.29,9.818,10.345];
const g=new PotionGame();g.state.coins=1e8;
for(let level=0;level<19;level++){
 assert.equal(g.state.luck,level);assert.ok(Math.abs(g.luckBonus()*100-bonuses[level])<1e-10);
 const info=g.upgradeInfo('luck'),before=g.state.coins;assert.equal(info.cost,ECONOMY.upgrades.luck.costs[level]);
 assert.equal(g.buy('luck'),true);assert.equal(g.state.coins,before-info.cost);
 assert.ok(g.luckBonus()>ECONOMY.upgrades.luck.bonuses[level]);
}
assert.equal(g.buy('luck'),false);assert.equal(g.state.luck,19);
assert.equal(sanitizeSave(JSON.parse(JSON.stringify(g.state))).luck,19);
for(let level=0;level<=10;level++){
 const old=new PotionGame().state;old.version=15;old.luck=level;old.coins=1234;
 const saved=sanitizeSave(old);assert.equal(saved.luck,level);assert.equal(saved.coins,1234);
 assert.ok(ECONOMY.upgrades.luck.bonuses[saved.luck]>=level*.004);
}
const invalid=new PotionGame().state;invalid.version=15;invalid.luck=11;assert.throws(()=>sanitizeSave(invalid));
for(let family=0;family<3;family++)for(let tier=0;tier<25;tier++)for(let level=0;level<=19;level++){
 const game=new PotionGame();game.state.tiers[family]=tier;game.state.luck=level;game.collect(family,tier);
 const expected=Math.min(.99,FAMILIES[family].recipes[tier].chances[0]+bonuses[level]/100);
 assert.ok(Math.abs(game.next().chance-expected)<1e-10);
 if(family===2&&level===19)assert.ok(Math.abs(game.next().chance-.95)<1e-10);
 game.state.powerups.enhancement=1;game.state.fairies['fairy-23']=10;game.setActiveFairy('fairy-23');assert.ok(game.next().chance<=.99);
}
console.log('Passed: all 19 bonus steps/prices, exact deductions/max refusal, legacy progress, extended save round trip and all 75 recipes across 20 ranks with capped boosts.');
