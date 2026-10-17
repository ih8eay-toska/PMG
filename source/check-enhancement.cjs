const assert=require('node:assert/strict');
const {PotionGame,sanitizeSave}=require('./core.js');
let g=new PotionGame();g.collect(0,0);
assert.equal(g.startEnhancement(100),true);
assert.equal(g.startEnhancement(200),false);
assert.equal(g.enhance(0),null);
assert.equal(g.sell(),null);
assert.equal(g.finishEnhancement(3099,0),null);
assert.equal(g.state.potion.level,0);
const valueDuringEnhancement=g.state.potion.value;
assert.equal(g.collect(0,0),false);assert.equal(g.state.potion.value,valueDuringEnhancement);
assert.equal(g.finishEnhancement(3100,0),'success');
assert.equal(g.state.potion.level,1);
assert.equal(g.finishEnhancement(3100,0),null);
assert.equal(g.startEnhancement(4000),true);
assert.equal(g.finishEnhancement(7000,.999),'lost');
assert.equal(g.state.potion,null);
assert.equal(g.startEnhancement(8000),false);
for(const [id,level,family,expected] of [['fairy-4',1,0,2934],['fairy-4',10,2,2334],['fairy-9',10,2,1500],['fairy-10',10,1,1500],['fairy-11',10,0,1500],['fairy-31',10,0,1500],['fairy-9',10,0,3000]]){
 g=new PotionGame();g.collect(family,0);g.state.fairies[id]=level;assert.equal(g.setActiveFairy(id),true);assert.ok(Math.abs(g.enhancementDuration()-expected)<1e-8);
}
g=new PotionGame();g.collect(0,0);g.startEnhancement(0);
const saved=sanitizeSave(JSON.parse(JSON.stringify(g.state)));
assert.equal(new PotionGame(saved).enhancementPending,undefined);
g.state=saved;assert.equal(g.finishEnhancement(3000,0),null);assert.equal(g.state.potion.level,0);
console.log('Timed enhancements: wait, repeat prevention, sale guard, blocked collection, failure, fairy durations, reload and replaced state passed.');
