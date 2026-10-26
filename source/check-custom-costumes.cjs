const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'..'),costumes=require('../data/costumes.json').entries;
const {PotionGame,sanitizeSave}=require('./core.js');
const custom=costumes.filter(c=>c.fanMade);assert(custom.length>0);
for(const c of custom){
 assert(c.free&&c.live2d&&c.character==='Pio');
 for(const file of [c.preview,'assets/live2d/Pio/textures/'+c.texture])assert(fs.statSync(path.join(root,file)).size>0);
 assert(!c.headwear,'Custom sundress should not load the removed straw hat');
 const game=new PotionGame();assert(game.buyCostume(c.id));assert.equal(game.state.activeCostumeId,c.id);assert.equal(game.state.tickets,0);
 const restored=sanitizeSave(JSON.parse(JSON.stringify(game.state)));assert.equal(restored.activeCostumeId,c.id);assert(restored.costumes.includes(c.id));
}
console.log(`Passed: ${custom.length} custom costume, free equipping, save round trip and removed hat.`);
