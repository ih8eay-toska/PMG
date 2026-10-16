// Publish the approved research tables; hand-written gameplay rules stay in source/core.js.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..'),c=require('./stage-four-candidate/candidate.json');
const json=(file,value)=>fs.writeFileSync(path.join(root,file),JSON.stringify(value,null,2)+'\n');
const snapshot=path.join(__dirname,'stage-five-before.json');
if(!fs.existsSync(snapshot))json('research/balance/stage-five-before.json',{gameData:require('../../data/game-data.json'),economy:require('../../data/economy.json')});
const previousCore=path.join(__dirname,'stage-five-before-core.js');
if(!fs.existsSync(previousCore)){
 const html=fs.readFileSync(path.join(root,'Potion-Maker.html'),'utf8');
 const core=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(match=>match[1]).find(text=>text.trimStart().startsWith("const DATA = typeof GAME_DATA"));
 if(!core)throw Error('Previous built core was not found; preserve the old build before continuing.');
 fs.writeFileSync(previousCore,core);
}
const e=JSON.parse(JSON.stringify(c.economy));e.schema=2;
e.upgrades.materials.costs=c.materialCosts.map(row=>row.map((cost,t)=>Math.round(cost*c.rules.materialUpgradeMinutes/4*(t+1>=c.rules.middleStartsAtOwnedTier?c.rules.middleUpgradeMinutes/c.rules.materialUpgradeMinutes:1))));
e.upgrades.materials.masteryGates=c.rules.familyMasteryGates;
for(const key of ['luck','price','speed'])e.upgrades[key].costs=c[key+'Costs'];
for(const rule of Object.values(e.upgrades)){delete rule.baseCost;delete rule.growth;}
e.brewing.fairyChanceScale=c.rules.fairyChanceScale;e.brewing.fairyMultiplierPerBrew=true;
e.bank.pairs=c.resourceRules.bankPairs;delete e.bank.units.coins;
e.conveyor.emptyGatherMultiplier=c.resourceRules.emptyGatherMultiplier;e.conveyor.specialDropsInManual=true;
e.visitors.ticketReward=c.resourceRules.questTickets;
e.chests.hourly.priceBands=c.resourceRules.paidBoostPrices;
e.chests.hourly.paidWindowMs=c.resourceRules.paidBoostCycleMs;e.chests.hourly.paidLimit=c.resourceRules.paidBoostLimit;
e.requests={costsByVisitorLevel:c.resourceRules.requestCostsByVisitorLevel,coinReward:c.resourceRules.requestCoinReward};
const data=JSON.parse(JSON.stringify(c.data));
for(const family of data.families)for(const recipe of family.recipes)recipe.notes=['Custom balance: base value, enhancement multipliers and success chances use the current game rules.',...recipe.notes.filter(note=>!note.startsWith('Personal balance adjustment:')).map(note=>'Historical wiki comparison (not current values): '+note)];
data.balance={revision:'stage-five',candidate:'research/balance/stage-four-candidate/candidate.json',note:'Personal balance overrides; original source figures are preserved in research/balance/stage-five-before.json.'};
data.limits.luck_bonus=e.upgrades.luck.max*e.upgrades.luck.bonusPerLevel;data.quest_reward_delay_ms=e.visitors.rewardDelayMs;
json('data/game-data.json',data);json('data/economy.json',e);
console.log('Published stage-five recipe, upgrade and resource tables.');
