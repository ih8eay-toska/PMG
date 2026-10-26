const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createRequire}=require('node:module');
const {ECONOMY,PotionGame,FAMILIES,FAIRIES,COSTUMES,EVENTS,sanitizeSave}=require('./core.js');
const positive=n=>assert.ok(Number.isFinite(n)&&n>0);
assert.equal(ECONOMY.schema,2);
for(const [key,rule]of Object.entries(ECONOMY.upgrades)){
 assert.ok(Number.isInteger(rule.max)&&rule.max>0);
 const tables=key==='materials'?rule.costs:[rule.costs];assert.equal(tables.length,key==='materials'?3:1);
 for(const table of tables){assert.equal(table.length,rule.max);for(const n of table){positive(n);assert.ok(Number.isSafeInteger(n));}}
 if(rule.bonusPerLevel!==undefined)positive(rule.bonusPerLevel);
}
assert.ok(FAMILIES.every(f=>f.recipes.length===ECONOMY.upgrades.materials.max+1));
assert.equal(ECONOMY.brewing.successCap,.99);assert.equal(ECONOMY.brewing.enhancementBoost,.1);assert.equal(ECONOMY.brewing.sellingBoost,2);
assert.equal(ECONOMY.conveyor.specialDropsInManual,true);
for(const [key,n]of Object.entries(ECONOMY.conveyor))if(key!=='specialDropsInManual')positive(n);
assert.ok(ECONOMY.conveyor.ticketProbability+ECONOMY.conveyor.solutionProbability<1);
for(const n of ['activeMs','breakMs','skinCost','boostCost'])positive(ECONOMY.events[n]);
assert.deepEqual(ECONOMY.events.boostBundle,{protection:1,enhancement:1,selling:1});
assert.ok(ECONOMY.visitors.waitMaxMs>=ECONOMY.visitors.waitMinMs);
assert.equal(ECONOMY.visitors.prepareMinMs,45000);assert.equal(ECONOMY.visitors.prepareMaxMs,90000);
assert.ok(ECONOMY.visitors.boostMax>=ECONOMY.visitors.boostMin);
for(const n of Object.values(ECONOMY.visitors))assert.ok(Number.isSafeInteger(n)&&n>=0);
assert.equal(ECONOMY.visitors.rubyReward,0);assert.equal(ECONOMY.visitors.ticketReward,2);
for(const kind of ['hourly','tickets','skin']){const c=ECONOMY.chests[kind];positive(c.cost.amount);assert.ok(c.pool.length);for(const r of c.pool){assert.ok(['tickets','rubies','fairy','skin','protection','enhancement','selling'].includes(r.currency));assert.ok(Number.isSafeInteger(r.amount)&&r.amount>0);assert.ok(Number.isSafeInteger(r.weight)&&r.weight>0);}}
// Change the shared config in an isolated engine; consumers must use it at runtime.
const savedConfig=structuredClone(ECONOMY),corePath=path.join(__dirname,'core.js'),changed=structuredClone(ECONOMY);
changed.upgrades.materials.costs[0][0]=123;changed.upgrades.materials.costs[0][1]=492;
changed.costumes.ticketPrice=777;changed.events.skinCost=42;changed.events.boostCost=2;changed.events.boostBundle={protection:2,enhancement:3,selling:4};changed.chests.hourly.priceBands[0].cost=12345;changed.chests.tickets.cost.amount=7;changed.chests.duplicateTickets=500;changed.visitors.prepareMinMs=45000;changed.visitors.prepareMaxMs=45000;changed.visitors.boostMax=7;
const ctx=vm.createContext({ECONOMY_DATA:changed,require:createRequire(corePath),module:{exports:{}},Date,Math});vm.runInContext(fs.readFileSync(corePath,'utf8'),ctx);const game=new ctx.module.exports.PotionGame();
assert.equal(game.upgradeInfo('tier0').cost,123);game.state.tiers[0]=1;assert.equal(game.upgradeInfo('tier0').cost,492);
game.state.tickets=777;assert.ok(game.buyCostume('Kids_Costume.png'));assert.equal(game.state.tickets,0);
game.state.eventRotation.solution=44;assert.equal(game.redeemEvent(0,'Turtleneck_Costume.png'),false);assert.equal(game.state.eventRotation.solution,44);game.state.tiaUnlocked=true;game.state.tiaIntroSeen=true;game.startRush(1000);for(let i=0;i<5;i++){const at=1000+i*5000,token=game.mintRushSupply(at);assert(game.collectRushSupply(token,at));assert(game.brewRush(at));assert(game.deliverRush(at));}assert.deepEqual({...game.state.powerups},{protection:2,enhancement:3,selling:4});
assert.equal(game.rewardCost('hourly').amount,12345);game.state.tickets=7;assert.ok(game.openReward('tickets','Pio',1000,()=>0));assert.equal(game.state.tickets,6);
const alternate=new ctx.module.exports.PotionGame();alternate.state.nextVisitorAt=1;alternate.tick(1,()=>.999);assert.equal(alternate.state.travelers[9].rewardBoost.amount,7);assert.equal(ctx.module.exports.sanitizeSave(alternate.state).travelers[9].rewardBoost.amount,7);
alternate.state.costumes=ctx.module.exports.COSTUMES.entries.map(c=>c.id);alternate.state.rubies=30;assert.equal(alternate.openReward('skin','Pio',1000,()=>.999).amount,500);assert.equal(ctx.module.exports.sanitizeSave(alternate.state).rewardHistory[0].amount,500);
game.state.nextVisitorAt=1;game.tick(1,()=>0);assert.ok(game.acceptQuest(0,2));assert.equal(game.state.travelers[0].deadline,45002);
const app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),text=app.split(/\r?\n/).find(line=>line.startsWith('function rewardOddsText('));ctx.game=game;ctx.window={brewerCharacter:'Pio'};ctx.ECONOMY=changed;ctx.CURRENCY_UNITS=changed.currencyUnits;ctx.rewardLabels={tickets:'tickets',rubies:'rubies'};ctx.fmt=n=>String(n);ctx.duration=n=>String(n);vm.runInContext(text,ctx);assert.match(vm.runInContext("rewardOddsText('hourly')",ctx),/3 paid openings/);
assert.deepEqual(ECONOMY,savedConfig,'isolated test must not change live defaults');
// Check every purchasable tier against the explicit tables and same-family gates.
for(let family=0;family<3;family++)for(let tier=0;tier<24;tier++){
 const g=new PotionGame();g.state.tiers[family]=tier;g.state.coins=1e10;const key='tier'+family,gate=ECONOMY.upgrades.materials.masteryGates.find(x=>x.unlockTier===tier+2),u=g.upgradeInfo(key);
 assert.equal(u.cost,ECONOMY.upgrades.materials.costs[family][tier]);
 if(gate){assert.ok(u.locked);const before=structuredClone(g.state);assert.equal(g.buy(key),false);assert.deepEqual(g.state,before);g.state.masteryStars=Array.from({length:gate.masteredRecipes},(_,t)=>family+'-'+t);}
 assert.ok(g.buy(key));assert.equal(g.state.tiers[family],tier+1);assert.equal(g.state.coins,1e10-u.cost);
 assert.equal(sanitizeSave(g.state).tiers[family],tier+1);
}
// Exchange value lives in product pricing; the retired Bank has no API or UI.
assert.deepEqual(ECONOMY.currencyUnits,{tickets:10,rubies:1});assert.equal(ECONOMY.bank,undefined);assert.equal(PotionGame.prototype.exchange,undefined);assert.equal(PotionGame.prototype.bankMaxLots,undefined);
const template=fs.readFileSync(path.join(__dirname,'index.template.html'),'utf8');assert.doesNotMatch(template,/bank-dialog|bank-exchange|data-menu-click="bank"/);assert.doesNotMatch(app,/renderBank|updateBankControls/);
// Enumerate all 100 equally spaced case rolls, including compensation states.
for(const maxFairies of [false,true])for(const allSkins of [false,true])for(const kind of ['tickets','skin']){
 const outcomes={},totals={tickets:0,rubies:0},base=new PotionGame();
 if(maxFairies)for(const f of FAIRIES)base.state.fairies[f.id]=10;
 if(allSkins)base.state.costumes=COSTUMES.entries.map(c=>c.id);
 for(let n=0;n<100;n++){
  const g=new PotionGame(structuredClone(base.state)),cost=g.rewardCost(kind);g.state[cost.currency]=cost.amount;
  const rolls=[(n+.5)/100,0],result=g.openReward(kind,'Pio',1000,()=>rolls.shift());assert.ok(result);
  outcomes[result.currency]=(outcomes[result.currency]||0)+1;if(result.currency in totals)totals[result.currency]+=result.amount;
  assert.deepEqual(sanitizeSave(g.state),g.state);
 }
 const expected=base.rewardExpectations(kind),value=totals.tickets+10*totals.rubies,cost=kind==='tickets'?10:300;
 assert.ok(Math.abs(value/100-(expected.tickets||0)-10*(expected.rubies||0))<1e-10);
 const expectedReturn=kind==='tickets'?(maxFairies?.895:.87):.775+(allSkins?.01*ECONOMY.chests.duplicateTickets/300:0)+(maxFairies?19*5/100/300:0);
 assert.ok(Math.abs(value/100/cost-expectedReturn)<1e-12);assert.ok(value/100<cost);
 if(!maxFairies)assert.equal(outcomes.fairy,kind==='tickets'?5:19);
 if(kind==='skin'&&!allSkins)assert.equal(outcomes.skin,1);
}
console.log('Passed: schema 2, isolated config wiring, all material prices/gates, bundle exchange parity and exact case odds/returns in all compensation states.');

// Offline shop grants reuse saved currency/charge fields and existing 10:1 exchange rate.
assert.equal(ECONOMY.shop.products.length,13);assert.equal(new Set(ECONOMY.shop.products.map(p=>p.id)).size,13);
for(const product of ECONOMY.shop.products){
 const g=new PotionGame(),cost=g.shopProductCost(product.id),before=JSON.stringify(g.state);assert.ok(Number.isSafeInteger(cost.amount)&&cost.amount>0);assert.equal(g.buyShopProduct(product.id),false);assert.equal(JSON.stringify(g.state),before);
 g.state[cost.currency]=cost.amount;assert.equal(g.buyShopProduct(product.id),true);assert.equal(g.state[cost.currency],0);
 for(const[key,amount]of Object.entries(product.grants))assert.equal(['enhancement','protection','selling'].includes(key)?g.state.powerups[key]:g.state[key],amount);
 const loaded=new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(g.state))));for(const[key,amount]of Object.entries(product.grants))assert.equal(['enhancement','protection','selling'].includes(key)?loaded.state.powerups[key]:loaded.state[key],amount);
 if(product.grants.rubies)assert.equal(cost.amount,product.grants.rubies*ECONOMY.currencyUnits.tickets/ECONOMY.currencyUnits.rubies);
 if(product.grants.tickets)assert.equal(cost.amount,product.grants.tickets*ECONOMY.currencyUnits.rubies/ECONOMY.currencyUnits.tickets);
}
{
 const g=new PotionGame();g.state.rubies=1000000000;g.state.powerups.protection=1e9;let before=JSON.stringify(g.state);assert.equal(g.buyShopProduct('small-enhancement-package'),false);assert.equal(JSON.stringify(g.state),before);assert.equal(g.buyShopProduct('unknown'),false);
 g.state.tickets=Number.MAX_SAFE_INTEGER;assert.equal(g.canBuyShopProduct('micro-ticket-bundle'),false);
 g.state.coins=1e300;assert.equal(g.canBuyShopProduct('micro-coin-bundle'),false);
 const fresh=new PotionGame(),early=fresh.shopProductCost('micro-coin-bundle').amount;fresh.state.tiers=[24,24,24];fresh.state.speed=19;fresh.state.price=19;const late=fresh.shopProductCost('micro-coin-bundle').amount;assert.ok(late<early);assert.equal(early,119048);assert.ok(late>0);
 // Round trips cannot create premium currency or spend gold for it.
 fresh.state.tickets=1000;const original=fresh.state.tickets+10*fresh.state.rubies;assert.ok(fresh.buyShopProduct('micro-ruby-bundle'));assert.ok(fresh.buyShopProduct('micro-ticket-bundle'));assert.equal(fresh.state.tickets+10*fresh.state.rubies,original);
}
console.log('Passed: all 13 shop purchases, refusal without mutation, save/reload, 10:1 parity, overflow guards and progression-priced gold.');
