// Research only. Candidate objects and saves never leave the isolated engine.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {createRequire}=require('node:module');
const root=path.resolve(__dirname,'../..'),corePath=path.join(__dirname,'stage-five-before-core.js');
const live=require('./research-runtime.cjs'),baseline=require('./baseline-current.cjs'),targets=require('./PROPOSED_TARGETS.json');
const clone=value=>JSON.parse(JSON.stringify(value));
const quantile=(a,p)=>a.length?[...a].sort((x,y)=>x-y)[Math.floor((a.length-1)*p)]:null;
const describe=a=>({count:a.length,p10:quantile(a,.1),p50:quantile(a,.5),p90:quantile(a,.9)});
const csv=rows=>rows.length?Object.keys(rows[0]).join(',')+'\n'+rows.map(r=>Object.values(r).map(v=>JSON.stringify(v??'')).join(',')).join('\n')+'\n':'';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const liveFiles=['research/balance/stage-five-before-core.js','research/balance/stage-five-before.json','source/core.js','source/app.js','data/game-data.json','data/economy.json','data/fairies.json','data/costumes.json','Potion-Maker.html'];
function candidate(){
 const data=clone(live.DATA),economy=clone(live.ECONOMY);
 economy.upgrades.luck.bonusPerLevel=.004;
 // Keep the final 99% ceiling; ordinary upgrades no longer grant +10.345 points.
 for(let f=0;f<3;f++)for(let t=0;t<25;t++){
  const r=data.families[f].recipes[t],n=r.max_level-1;
  r.base=100;
  r.chances=Array.from({length:n},(_,i)=>Number((f===0?.80-.30*i/Math.max(1,n-1):f===1?.88-.16*i/Math.max(1,n-1):.91).toFixed(6)));
  r.multipliers=Array.from({length:n},(_,i)=>Number((f===0?1.65+.90*i/Math.max(1,n-1):f===1?(i<4?1.60+.30*i/3:1.05):(i<3?1.65:1.025)).toFixed(6)));
 }
 return{status:'research candidate; not loaded by gameplay',data,economy,
  rules:{incomeBaseGoldPerMinute:300,incomeGrowthPerTier:1.30,materialUpgradeMinutes:8.5,middleUpgradeMinutes:10,middleStartsAtOwnedTier:7,
   fairyChanceScale:.10,fairyMultiplierMode:'per-brew factor distributed across recipe steps',
   familyMasteryGates:clone(targets.familyMasteryGates)},materialCosts:[]};
}
function engine(c,minutes=c.rules.materialUpgradeMinutes,fairyMode='normalized'){
 const ctx=vm.createContext({GAME_DATA:c.data,ECONOMY_DATA:c.economy,require:createRequire(path.join(root,'source/core.js')),module:{exports:{}},Date,Math});
 vm.runInContext(fs.readFileSync(corePath,'utf8'),ctx,{filename:corePath});
 const api=ctx.module.exports,proto=api.PotionGame.prototype,info=proto.upgradeInfo,effects=proto.fairyEffects;
 proto.fairyEffects=function(){const out=effects.call(this);if(fairyMode==='normalized'){
  if(out.enhancementChance)out.enhancementChance=out.enhancementChance.map(v=>v*c.rules.fairyChanceScale);
  if(out.enhancementMultiplier){const n=this.state.potion?this.recipe().max_level-1:1;out.enhancementMultiplier=out.enhancementMultiplier.map(v=>(1+v)**(1/n)-1);}
 }return out;};
 proto.upgradeInfo=function(key){const u=info.call(this,key);if(!u)return u;
  if(key.startsWith('tier')){const f=Number(key.at(-1)),next=u.level+2;
   if(c.materialCosts[f]?.[u.level]){const scale=u.level+1>=c.rules.middleStartsAtOwnedTier?c.rules.middleUpgradeMinutes/c.rules.materialUpgradeMinutes:1;u.cost=Math.round(c.materialCosts[f][u.level]*minutes/4*scale);}
   const gate=c.rules.familyMasteryGates.find(g=>g.unlockTier===next),mastered=this.state.masteryStars.filter(id=>id.startsWith(f+'-')).length;
   if(gate&&mastered<gate.masteredRecipes){u.requiredMastery=gate.masteredRecipes;u.cost=Infinity;}
  }
  return u;
 };
 const harnessPath=path.join(__dirname,'baseline-current.cjs');
 const harness=vm.createContext({require:id=>id==='./research-runtime.cjs'?api:createRequire(harnessPath)(id),module:{exports:{}},__dirname,console,Date,Math});
 let harnessSource=fs.readFileSync(harnessPath,'utf8');
 const exactPick='const item=conveyor.items.find(m=>!m.kind&&m.family===q.family&&m.tier===q.tier&&m.x>=0&&m.x<cfg.width-58);';
 if(!harnessSource.includes(exactPick))throw Error('Baseline ingredient policy changed; review candidate adapter.');
 harnessSource=harnessSource.replace(exactPick,`const visible=conveyor.items.filter(m=>!m.kind&&m.x>=0&&m.x<cfg.width-58),active=s.travelers.some(t=>t.phase==='active');
 const unmastered=m=>!s.masteryStars.includes(m.family+'-'+m.tier);
 const item=scenario.flexible&&!active?(visible.filter(unmastered).sort((a,b)=>a.tier-b.tier)[0]||visible.sort((a,b)=>FAMILIES[b.family].recipes[b.tier].base-FAMILIES[a.family].recipes[a.tier].base)[0]):visible.find(m=>m.family===q.family&&m.tier===q.tier);`);
 vm.runInContext(harnessSource,harness,{filename:harnessPath});
 return{...api,...harness.module.exports};
}
function rates(api,f,t,profile={luck:5,price:2},inventory=[0,0,0]){
 const l=api.ladder(f,t,profile),g=new api.PotionGame();
 if(profile.fairy){g.state.fairies[profile.fairy]=profile.level;g.setActiveFairy(profile.fairy);}
 const weights=(g.fairyEffects().materialProbability||[0,0,0]).map(v=>1+v),p=weights[f]/weights.reduce((a,b)=>a+b,0)/(t+1)*(1-api.ECONOMY.conveyor.ticketProbability-api.ECONOMY.conveyor.solutionProbability*.75);
 const wait=api.ECONOMY.conveyor.spacing/api.ECONOMY.conveyor.baseSpeed/p;
 let manual=null,conveyor=null;
 for(let stop=0;stop<l.values.length;stop++){
  const e=api.evaluate(l,stop,...inventory),m=e.goldPerAction*120,b=e.expectedGold/(wait+e.actions*.5)*60;
  if(!manual||m>manual.goldPerMinute)manual={...e,goldPerMinute:m};
  if(!conveyor||b>conveyor.goldPerMinute)conveyor={...e,goldPerMinute:b};
 }
 return{manual,conveyor,waitSeconds:wait,maxProbability:api.evaluate(l,l.values.length-1,...inventory).probability,maxPayout:l.sale.at(-1)};
}
function calibrate(c){
 let api=engine(c);
 // Match the geometric mean of manual/conveyor rates at luck 5, selling 2.
 // A second mode remains independently visible, rather than reporting this mean as gameplay.
 for(let t=0;t<25;t++)for(let f=0;f<3;f++){
  const r=rates(api,f,t),goal=c.rules.incomeBaseGoldPerMinute*c.rules.incomeGrowthPerTier**t;
  c.data.families[f].recipes[t].base=Math.max(1,Math.round(100*goal/Math.sqrt(r.manual.goldPerMinute*r.conveyor.goldPerMinute)));
  // Ingredient additions receive the same bounded tier scale as starting potions.
  c.data.families[f].materials[t].value=Number((c.data.families[f].recipes[t].base*.1).toFixed(2));
 }
 api=engine(c);
 c.materialCosts=Array.from({length:3},(_,f)=>Array.from({length:24},(_,t)=>{
  const r=rates(api,f,t,{luck:Math.min(10,Math.floor((t+1)/2)),price:Math.min(4,Math.floor((t+1)/5))});
  const minutes=t<3?1+t*.5:4;
  return Math.round(Math.sqrt(r.manual.goldPerMinute*r.conveyor.goldPerMinute)*minutes);
 }));
 // Flat tables couple ancillary upgrades to the same income scale, not a second exponential.
 for(const [key,max]of [['luck',10],['price',4],['speed',19]]){
  // Cost tables are stored explicitly; the adapter below applies them to the real engine.
  c[key+'Costs']=Array.from({length:max},(_,i)=>Math.round(300*1.3**Math.min(24,(i+1)*(key==='price'?4:key==='luck'?2:1))*(key==='speed'?.35:.65)));
 }
 return c;
}
function studyEngine(c,minutes=c.rules.materialUpgradeMinutes,fairyMode){
 const api=engine(c,minutes,fairyMode),old=api.PotionGame.prototype.upgradeInfo;
 api.PotionGame.prototype.upgradeInfo=function(key){const u=old.call(this,key);if(c[key+'Costs']&&u.level<u.max)u.cost=c[key+'Costs'][u.level];return u;};
 return api;
}
function run(c,{seeds=16,minutes=120,costMinutes=c.rules.materialUpgradeMinutes,policies,overrides={}}={}){
 const api=studyEngine(c,costMinutes),scenarios=policies||[
  {name:'Manual · earned boosts',mode:'manual'},
  {name:'Conveyor · earned boosts',mode:'conveyor'},
  {name:'Conveyor · available ingredients',mode:'conveyor',flexible:true},
  {name:'Conveyor · available ingredients + token boosts',mode:'conveyor',flexible:true,eventSpend:'boosts'},
  {name:'Manual · paid boost chests',mode:'manual',paid:true},
  {name:'Conveyor · paid boost chests',mode:'conveyor',paid:true},
  {name:'Conveyor · spend event tokens on boosts',mode:'conveyor',eventSpend:'boosts'},
  {name:'Conveyor · traveler requests',mode:'conveyor',requests:true}];
 const runs=[];
 for(const policy of scenarios)for(let seed=1;seed<=seeds;seed++)runs.push(api.session(seed,policy,{minutes,...overrides}));
 return{costMinutes,runs,summary:api.summarizeSessions(runs)};
}
function matrix(c){const rows=[];
 for(const mode of ['normalized','original']){
  const api=studyEngine(c,4,mode),profiles=mode==='original'?[]:[{name:'Base',luck:0,price:0},{name:'Mid',luck:5,price:2},{name:'Max',luck:10,price:4}];
  for(const fairy of api.FAIRIES)for(const level of [1,5,10])profiles.push({name:fairy.name+' Lv '+level,luck:10,price:4,fairy:fairy.id,level});
  for(const profile of profiles)for(let f=0;f<3;f++)for(let t=0;t<25;t++)for(const inventory of [[0,0,0],[5,10,2]]){
   const r=rates(api,f,t,profile,inventory),recipe=c.data.families[f].recipes[t];
   rows.push({fairyMode:mode,profile:profile.name,fairy:profile.fairy||'',fairyLevel:profile.level||0,family:api.FAMILIES[f].label,tier:t+1,inventory:inventory.join('/'),base:recipe.base,maxLevel:recipe.max_level,maxPayout:r.maxPayout,maxProbability:r.maxProbability,manualStop:r.manual.stopLevel,manualGoldPerMinute:r.manual.goldPerMinute,conveyorStop:r.conveyor.stopLevel,conveyorGoldPerMinute:r.conveyor.goldPerMinute,waitSeconds:r.waitSeconds});
  }
 }
 return rows;
}
function brief(result){return result.summary.map(s=>({costMinutes:result.costMinutes,scenario:s.scenario,tia:s.milestones.tia,stars:s.end.stars,upgrades:s.upgradeWaitMinutes}));}
function main(){
 const out=path.join(__dirname,'stage-three-candidate'),before=Object.fromEntries(liveFiles.map(f=>[f,hash(path.join(root,f))]));
 const c=calibrate(candidate());fs.mkdirSync(out,{recursive:true});
 const json=(name,value)=>fs.writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n');
 json('candidate.json',c);
 if(process.argv.includes('--calibrate')){
  const uniform=clone(c);uniform.rules.middleUpgradeMinutes=uniform.rules.materialUpgradeMinutes;
  const sweep=[2,4,6,8].map(costMinutes=>run(uniform,{seeds:8,costMinutes,policies:[{name:'Manual · earned boosts',mode:'manual'},{name:'Conveyor · earned boosts',mode:'conveyor'},{name:'Conveyor · available ingredients',mode:'conveyor',flexible:true}]}));
  json('cost-sweep.json',sweep);console.log(JSON.stringify(sweep.flatMap(brief),null,2));return;
 }
 const result=run(c,{seeds:40});json('sessions.json',result.runs);json('session-summary.json',result.summary);
 console.log('Primary sessions complete. Measuring action-speed sensitivity.');
 const sensitivity=[250,1000].flatMap(actionMs=>run(c,{seeds:16,policies:[{name:'Manual '+actionMs+'ms',mode:'manual'},{name:'Available conveyor '+actionMs+'ms',mode:'conveyor',flexible:true}],overrides:{actionMs}}).runs);
 json('sensitivity-sessions.json',sensitivity);json('sensitivity-summary.json',baseline.summarizeSessions(sensitivity));
 console.log('Sessions complete. Calculating recipe/fairy matrix.');
 const rows=matrix(c);fs.writeFileSync(path.join(out,'recipes.csv'),csv(rows));
 json('source-hashes.json',before);
 json('research-hashes.json',Object.fromEntries(['stage-three.cjs','stage-three-report.cjs','baseline-current.cjs','PROPOSED_TARGETS.json'].map(f=>[f,hash(path.join(__dirname,f))])));
 for(const f of liveFiles)if(before[f]!==hash(path.join(root,f)))throw Error('Live source changed during calculation: '+f);
 json('assumptions.json',{researchOnly:true,seeds:40,horizonMinutes:120,actionMs:500,capture:.9,chestRevealMs:c.economy.chests.revealMs,finiteBoosts:true,sessionFairyPolicy:'Fresh save; acquired fairies not equipped. All fairy effects separately covered at levels 1/5/10 in recipes.csv.',analyticalConveyor:'One exact recipe; equal family tiers; empty cauldron emission; phase averaged event share; misses and interventions excluded.',timingIsAssumed:true,gates:'Same-family earlier mastery. Applied only inside research engine.',candidateFairyChanges:'Chance bonuses scaled to 10% of original; multiplier bonus applied once per whole brew, distributed over its enhancement steps. Other fairy effects unchanged.',liveFilesUnchanged:true});
 require('./stage-three-report.cjs')(c,result,rows,sensitivity,out);
 console.log(JSON.stringify(brief(result),null,2));
}
module.exports={candidate,calibrate,engine,studyEngine,rates,run,matrix,describe,brief};
if(require.main===module)main();
