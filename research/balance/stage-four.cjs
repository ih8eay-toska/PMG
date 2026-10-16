// Research only: no live source, browser storage or player saves are written.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const stage3=require('./stage-three.cjs'),baseline=require('./baseline-current.cjs');
const root=path.resolve(__dirname,'../..'),clone=x=>JSON.parse(JSON.stringify(x));
const resources=['coins','tickets','rubies','solution','protection','enhancement','selling'];
const boosts=['protection','enhancement','selling'];
const describe=stage3.describe,hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
function candidate(){
 const c=clone(require('./stage-three-candidate/candidate.json'));
 c.status='stage 4 research candidate; not loaded by gameplay';
 c.rules.middleUpgradeMinutes=18;
 c.resourceRules={bankPairs:[['tickets','rubies'],['rubies','tickets']],questTickets:2,
  specialDropsInManual:true,emptyGatherMultiplier:4,paidBoostCycleMs:1200000,paidBoostLimit:3,
  paidBoostPrices:[{firstTier:1,cost:50},{firstTier:5,cost:250},{firstTier:10,cost:1000},{firstTier:15,cost:4000},{firstTier:20,cost:16000}],
  requestCostsByVisitorLevel:[150,400,1200,3000,8000,20000,50000,120000,180000,250000],requestCoinReward:125};
 c.economy.visitors.boostMax=3;c.economy.visitors.rubyReward=0;
 c.economy.chests.hourly.cost.amount=50;
 c.economy.chests.hourly.pool=boosts.map(currency=>({currency,amount:3,weight:1}));
 c.economy.chests.tickets={cost:{currency:'tickets',amount:10},pool:[
  {currency:'tickets',amount:6,weight:60},{currency:'tickets',amount:10,weight:15},{currency:'tickets',amount:20,weight:5},
  {currency:'rubies',amount:1,weight:12},{currency:'rubies',amount:3,weight:2},{currency:'rubies',amount:8,weight:1},{currency:'fairy',amount:1,weight:5}]};
 c.economy.chests.skin={cost:{currency:'rubies',amount:30},pool:[
  {currency:'rubies',amount:15,weight:60},{currency:'rubies',amount:45,weight:15},{currency:'rubies',amount:150,weight:5},
  {currency:'fairy',amount:1,weight:19},{currency:'skin',amount:1,weight:1}]};
 c.economy.chests.maxFairyTickets=5;
 return c;
}
function engine(c){
 const api=stage3.studyEngine(c),p=api.PotionGame.prototype,oldCost=p.rewardCost,oldOpen=p.openReward,oldSettle=p.settle;
 for(const r of api.REQUESTS){r.cost=c.resourceRules.requestCostsByVisitorLevel[r.level-1];if(r.bonusType==='coins')r.bonusCount=c.resourceRules.requestCoinReward;}
 p.rewardCost=function(kind){if(kind!=='hourly')return oldCost.call(this,kind);const tier=Math.max(...this.state.tiers)+1,band=c.resourceRules.paidBoostPrices.filter(r=>r.firstTier<=tier).at(-1);return{currency:'coins',amount:band.cost};};
 p.openReward=function(kind,character='Pio',now=Date.now(),random=Math.random,free=false){
  const window=Math.floor(this.state.metrics.activePlayMs/c.resourceRules.paidBoostCycleMs),saved=this.state.paidBoostWindow;
  const count=saved?.window===window?saved.count:0;
  if(kind==='hourly'&&!free&&count>=c.resourceRules.paidBoostLimit)return null;
  const result=oldOpen.call(this,kind,character,now,random,free);
  if(result&&kind==='hourly'&&!free)this.state.paidBoostWindow={window,count:count+1};
  return result;
 };
 p.settle=function(now=Date.now()){const delivered=oldSettle.call(this,now);this.state.tickets+=delivered.length*c.resourceRules.questTickets;return delivered;};
 const belt=api.MaterialConveyor.prototype,oldSpeed=belt.speed,oldAdvance=belt.advance,oldSpawn=belt.spawn;
 const multiplier=c.resourceRules.emptyGatherMultiplier||1;
 belt.speed=function(brewing,level){return oldSpeed.call(this,brewing,level)*(!brewing&&!this.manual?multiplier:1);};
 belt.advance=function(ms,brewing,...args){this.gathering=!brewing&&!this.manual;return oldAdvance.call(this,ms,brewing,...args);};
 belt.spawn=function(x){const rules=api.ECONOMY.conveyor,ticket=rules.ticketProbability,solution=rules.solutionProbability;
  if(this.gathering){rules.ticketProbability/=multiplier;rules.solutionProbability/=multiplier;}
  try{return oldSpawn.call(this,x);}finally{rules.ticketProbability=ticket;rules.solutionProbability=solution;}
 };
 return api;
}
function session(c,scenario,seed,{minutes=180,actionMs=500,startTier=1,fairy=null,maxFairies=false,initialTickets=0,initialRubies=0}={}){
 const api=engine(c),{PotionGame,MaterialConveyor,FAMILIES,TRAVELERS,EVENTS,COSTUMES}=api;
 const random=baseline.rng(seed),game=new PotionGame(),s=game.state;
 if(startTier>1){s.tiers=[startTier-1,startTier-1,startTier-1];s.masteryStars=Array.from({length:3},(_,f)=>Array.from({length:startTier-1},(_,t)=>f+'-'+t)).flat();s.tiaUnlocked=s.masteryStars.length>=20;s.luck=Math.min(10,Math.floor(startTier/2));s.price=Math.min(4,Math.floor(startTier/5));s.speed=Math.min(19,startTier-1);}
 if(maxFairies)for(const f of api.FAIRIES)s.fairies[f.id]=10;
 if(fairy){s.fairies[fairy]=10;game.setActiveFairy(fairy);}
 s.tickets=initialTickets;s.rubies=initialRubies;
 const milestones={},purchases=[],caseResults=[],paidWindows={},ledger={},drops={ticket:0,solution:0},initial={coins:0,tickets:initialTickets,rubies:initialRubies,solution:0,protection:0,enhancement:0,selling:0};
 const balance=key=>key==='solution'?s.eventRotation.solution:boosts.includes(key)?s.powerups[key]:s[key];
 function book(source,key,amount){if(!amount)return;if(!Number.isFinite(amount))throw Error('Non-finite resource ledger');ledger[source]??=Object.fromEntries(resources.map(k=>[k,{in:0,out:0}]));ledger[source][key][amount>0?'in':'out']+=Math.abs(amount);}
 let elapsed=0,now=1000000,nextAction=0,lastRequest=-600000,firstSkin=false,firstEventSkin=false,forgone=0;
 const mark=key=>{if(milestones[key]===undefined)milestones[key]=elapsed/60000;};
 const conveyor=new MaterialConveyor(456,s.tiers,random,()=>({...game.fairyEffects(),eventActive:game.eventInfo().active})),seen=new Set(),stopCache=new Map();
 conveyor.manual=scenario.mode==='manual';
 function open(kind,free=false){const cost=game.rewardCost(kind),result=game.openReward(kind,'Pio',now,random,free);if(!result)return false;
  const source=free?'free chest':kind==='hourly'?'paid boosts':kind==='tickets'?'ticket case':'ruby case';
  if(!free)book(source,cost.currency,-cost.amount);
  if(resources.includes(result.currency))book(source,result.currency,result.amount);
  caseResults.push({minute:elapsed/60000,kind,free,cost:free?0:cost.amount,...result});
  if(!free&&kind==='hourly'){const w=Math.floor(s.metrics.activePlayMs/c.resourceRules.paidBoostCycleMs);paidWindows[w]=(paidWindows[w]||0)+1;}
  if(result.currency==='fairy'&&scenario.equipFairy)game.setActiveFairy(Object.keys(s.fairies).sort((a,b)=>s.fairies[b]-s.fairies[a])[0]);
  nextAction=elapsed+(scenario.reducedMotion?0:c.economy.chests.revealMs)+actionMs;return true;
 }
 function exchange(from,to,lots){if(!c.resourceRules.bankPairs.some(pair=>pair[0]===from&&pair[1]===to)||!Number.isInteger(lots)||lots<1)return false;
  const units=c.economy.bank.units,paid=units[from]*lots,received=units[to]*lots;if(s[from]<paid)return false;s[from]-=paid;s[to]+=received;book('bank',from,-paid);book('bank',to,received);return true;
 }
 function farmingStop(f,t){const key=[f,t,s.luck,s.price,s.activeFairyId,game.fairyLevel(s.activeFairyId)].join(':');if(!stopCache.has(key)){
  const profile={luck:s.luck,price:s.price,fairy:s.activeFairyId,level:game.fairyLevel(s.activeFairyId)},l=api.ladder(f,t,profile);let best=null;
  for(let level=0;level<l.values.length;level++){const r=api.evaluate(l,level);if(!best||r.goldPerAction>best.goldPerAction)best=r;}
  stopCache.set(key,best.stopLevel-1);
 }return stopCache.get(key);}
 function target(){const q=s.travelers.find(t=>t.phase==='active');if(q)return q.requirement;
  for(let t=0;t<25;t++)for(let f=0;f<3;f++)if(t<=s.tiers[f]&&!s.masteryStars.includes(f+'-'+t))return{family:f,tier:t};
  let family=0;for(let f=1;f<3;f++)if(FAMILIES[f].recipes[s.tiers[f]].base>FAMILIES[family].recipes[s.tiers[family]].base)family=f;return{family,tier:s.tiers[family]};
 }
 function sell(){const value=game.sell();book('potion sales','coins',value||0);}
 while(elapsed<minutes*60000){
  elapsed+=250;now+=250;game.recordPlayTime(250);
  const request=s.request?clone(s.request):null,events=game.tick(now,random);
  for(const event of events){if(event.kind==='reward'){const i=TRAVELERS.findIndex(t=>t.id===event.traveler.id),reward=s.travelers[i].rewardBoost;book('quests',reward.type,reward.amount);book('quests','tickets',c.resourceRules.questTickets);book('quests','rubies',c.economy.visitors.rubyReward);}
   if(event.kind==='request'&&request?.result.bonus)book('requests',request.result.bonusType,request.result.bonusCount);}
  if(scenario.mode==='conveyor'||c.resourceRules.specialDropsInManual){conveyor.tiers=s.tiers;
   // Keep movement below a card width per step: coarse frames can skip spawns.
   for(let step=0;step<250;step+=50)conveyor.advance(50,!!s.potion,s.speed,456);
   if(!game.eventInfo().active)conveyor.items=conveyor.items.filter(m=>m.kind!=='solution');}
  if(s.tiaUnlocked&&startTier===1)mark('tia');if(s.tiers.every(t=>t===24))mark('allMaterials');
  if(s.tickets+s.rubies*10>=300)mark('skinFund');if(s.rubies>=c.economy.chests.skin.cost.amount||s.tickets>=c.economy.chests.skin.cost.amount*10)mark('rubyCaseFund');
  if(Object.keys(s.fairies).length&&!maxFairies&&!fairy)mark('fairy');
  if(elapsed<nextAction)continue;nextAction=elapsed+actionMs;
  if(scenario.mode==='conveyor'||c.resourceRules.specialDropsInManual){let caught=false;
   for(const item of conveyor.items){if(!item.kind||item.x<0||item.x>398||seen.has(item.id))continue;seen.add(item.id);if(random()>.9)continue;
    const ok=item.kind==='ticket'?game.collectTicket():game.collectSolution();if(!ok)continue;conveyor.take(item.id);drops[item.kind]++;book('drops',item.kind==='ticket'?'tickets':'solution',1);caught=true;break;
   }if(caught)continue;
  }
  if(scenario.eventBoosts&&s.eventRotation.solution&&Object.values(s.powerups).some(v=>v<5)){
   if(game.redeemEvent(game.eventInfo().index,'boosts')){book('event boosts','solution',-c.economy.events.boostCost);for(const key of boosts)book('event boosts',key,c.economy.events.boostBundle[key]);continue;}
  }
  if(!firstEventSkin&&s.eventRotation.solution>=50){const info=game.eventInfo(),id=info.skins.find(id=>!s.costumes.includes(id)&&(COSTUMES.entries.find(c=>c.id===id).character==='Pio'||s.tiaUnlocked));
   if(id&&game.redeemEvent(info.index,id)){book('event skin','solution',-50);firstEventSkin=true;mark('eventSkin');continue;}
  }
  if(scenario.quests!==false){const visible=s.travelers.findIndex(t=>t.phase!=='away');if(visible>=0){const t=s.travelers[visible];
   if(t.phase==='offer'){game.acceptQuest(visible,now);continue;}
   if(t.phase==='complete'||t.phase==='failed'){game.dismissVisitor(visible,now,random);continue;}
   if(game.canDeliver(visible,now)){forgone+=game.sellValue();game.deliver(visible,now,random);continue;}
  }}
  if(scenario.gamble){
   if(s.rubies>=30){if(open('skin'))continue;}
   if(scenario.rubyCases){if(s.tickets>=10&&exchange('tickets','rubies',Math.floor(s.tickets/10)))continue;}
   else{if(s.tickets>=10){if(open('tickets'))continue;}
    if(s.rubies>0&&s.tickets<10){if(exchange('rubies','tickets',1))continue;}}
  }else if(!firstSkin&&s.tickets+s.rubies*10>=300){
   if(s.tickets<300){exchange('rubies','tickets',Math.ceil((300-s.tickets)/10));continue;}
   if(game.buyCostume('Kids_Costume.png')){book('wardrobe','tickets',-300);firstSkin=true;mark('regularSkin');continue;}
  }
  if(now>=s.rewardReadyAt){if(open('hourly',true))continue;}
  if(scenario.requests&&!s.request&&s.travelers.every(t=>t.phase==='away')&&elapsed-lastRequest>=600000&&s.metrics.questsDelivered>=3){
   const index=s.travelers.reduce((best,t,i)=>t.level>s.travelers[best].level?i:best,0),r=game.requestsFor(index).filter(r=>s.coins>=r.cost).at(-1);
   if(r&&game.startRequest(index,r.id,now,random)){book('requests','coins',-r.cost);lastRequest=elapsed;continue;}
  }
  const upgrades=['tier0','tier1','tier2','luck','price','speed'].map(key=>({key,...game.upgradeInfo(key)})).filter(u=>u.level<u.max).sort((a,b)=>a.cost-b.cost),buy=upgrades.find(u=>s.coins>=u.cost);
  // Stock-seeking policy can buy before saving for an upgrade, at most three times/window.
  if(scenario.paid&&Object.values(s.powerups).some(v=>v<3)&&s.coins>=game.rewardCost('hourly').amount*(scenario.paid==='reserve'?2:1)){
   if(open('hourly'))continue;
  }
  if(buy&&game.buy(buy.key)){book('upgrades','coins',-buy.cost);if(buy.key.startsWith('tier'))purchases.push({minute:elapsed/60000,family:Number(buy.key.at(-1)),tier:buy.level+2,cost:buy.cost});continue;}
  if(s.potion){const active=s.travelers.find(t=>t.phase==='active'),matches=active&&s.potion.family===active.requirement.family&&s.potion.tier===active.requirement.tier;
   if(active&&!matches){sell();continue;}if(matches&&s.potion.level>=active.requirement.level)continue;
   const p=s.potion,mastered=s.masteryStars.includes(p.family+'-'+p.tier),early=scenario.earlySales&&mastered&&!active&&p.level>=farmingStop(p.family,p.tier);
   if(!game.next()||early)sell();else{const before={...s.powerups};game.enhance(random(),random());for(const key of boosts)book('consumption',key,s.powerups[key]-before[key]);}
  }else{
   const q=target();if(scenario.mode==='manual')game.collect(q.family,q.tier);
   else{const active=s.travelers.some(t=>t.phase==='active'),visible=conveyor.items.filter(m=>!m.kind&&m.x>=0&&m.x<=398),unmastered=m=>!s.masteryStars.includes(m.family+'-'+m.tier);
    const item=active||scenario.exact?visible.find(m=>m.family===q.family&&m.tier===q.tier):(visible.filter(unmastered).sort((a,b)=>a.tier-b.tier)[0]||visible.sort((a,b)=>FAMILIES[b.family].recipes[b.tier].base-FAMILIES[a.family].recipes[a.tier].base)[0]);
    if(item&&random()<.9){game.collect(item.family,item.tier);conveyor.take(item.id);}
   }
  }
 }
 // Selling charges are consumed in sell(), not enhance(). Keep this gross expense explicit.
 book('consumption','selling',-s.metrics.powerupsUsed.selling);
 const final=Object.fromEntries(resources.map(k=>[k,balance(k)]));
 for(const key of resources){const expected=initial[key]+Object.values(ledger).reduce((sum,l)=>sum+l[key].in-l[key].out,0);if(Math.abs(final[key]-expected)>1e-6)throw Error('Resource conservation failed: '+key+' '+final[key]+' != '+expected);}
 if(Object.values(paidWindows).some(v=>v>c.resourceRules.paidBoostLimit))throw Error('Paid boost window exceeded');
 const ordered=[...purchases].sort((a,b)=>a.minute-b.minute),middle=ordered.map((p,i)=>({...p,gap:p.minute-(i?ordered[i-1].minute:0)})).filter(p=>p.tier>=7&&p.tier<=16);
 return{seed,scenario:scenario.name,mode:scenario.mode,minutes,actionMs,startTier,fairy,maxFairies,milestones,final,ledger,drops,paidWindows,caseResults,purchases,middle,
  stars:s.masteryStars.length,tiers:s.tiers,questDelivered:s.metrics.questsDelivered,questFailed:s.metrics.questsFailed,questGoldForgone:forgone,used:s.metrics.powerupsUsed,
  fairiesReceived:Object.values(s.fairies).reduce((a,b)=>a+b,0)-(maxFairies?api.FAIRIES.length*10:fairy?10:0),likeability:s.likeability};
}
function summary(runs){return [...new Set(runs.map(r=>r.scenario))].map(name=>{const a=runs.filter(r=>r.scenario===name);return{scenario:name,runs:a.length,horizonMinutes:a[0].minutes,
 milestones:Object.fromEntries(['tia','regularSkin','eventSkin','rubyCaseFund','fairy','allMaterials'].map(key=>{const hits=a.filter(r=>r.milestones[key]!==undefined);return[key,{...describe(hits.map(r=>r.milestones[key])),notReached:a.length-hits.length}];})),
 middleGaps:describe(a.flatMap(r=>r.middle.map(p=>p.gap))),middleRuns:a.filter(r=>r.middle.length).length,
 end:Object.fromEntries(['stars','questDelivered','questFailed','fairiesReceived','likeability'].map(k=>[k,describe(a.map(r=>r[k]))])),
 incomePerHour:Object.fromEntries(['drops','quests','requests','free chest','paid boosts','event boosts'].map(source=>[source,Object.fromEntries(resources.map(k=>[k,describe(a.map(r=>(r.ledger[source]?.[k].in||0)*60/r.minutes))]))])),
 boostUsagePerHour:Object.fromEntries(boosts.map(k=>[k,describe(a.map(r=>r.used[k]*60/r.minutes))])),paidOpenings:describe(a.map(r=>Object.values(r.paidWindows).reduce((s,n)=>s+n,0)))};});}
const scenarios=[
 {name:'Manual · save for skins',mode:'manual',earlySales:true},
 {name:'Conveyor · save for skins',mode:'conveyor',earlySales:true},
 {name:'Manual · event boosts',mode:'manual',earlySales:true,eventBoosts:true},
 {name:'Conveyor · event boosts',mode:'conveyor',earlySales:true,eventBoosts:true},
 {name:'Manual · buy boost stock',mode:'manual',earlySales:true,paid:true},
 {name:'Conveyor · buy boost stock',mode:'conveyor',earlySales:true,paid:true},
 {name:'Conveyor · open cases',mode:'conveyor',earlySales:true,gamble:true,equipFairy:true},
 {name:'Conveyor · ruby cases',mode:'conveyor',earlySales:true,gamble:true,rubyCases:true,equipFairy:true},
 {name:'Manual · traveler requests',mode:'manual',earlySales:true,requests:true},
 {name:'Conveyor · exact recipe',mode:'conveyor',earlySales:true,exact:true}];
function returns(c){const api=engine(c),rows=[];
 for(const maxFairies of [false,true])for(const ownSkins of [false,true]){const g=new api.PotionGame();if(maxFairies)for(const f of api.FAIRIES)g.state.fairies[f.id]=10;if(ownSkins)g.state.costumes=api.COSTUMES.entries.map(r=>r.id);
  for(const kind of ['tickets','skin']){const expected=g.rewardExpectations(kind,'Pio'),cost=g.rewardCost(kind),ticketValue=(expected.tickets||0)+(expected.rubies||0)*10,paid=cost.currency==='tickets'?cost.amount:cost.amount*10;rows.push({kind,maxFairies,ownSkins,expected,currencyReturn:ticketValue/paid});}
 }return rows;}
function adjustFlow(c,multiplier){const old=require('./stage-three-candidate/candidate.json').economy.conveyor;
 c.economy.conveyor.baseSpeed=old.baseSpeed*multiplier;
 c.economy.conveyor.ticketProbability=old.ticketProbability/multiplier;
 c.economy.conveyor.solutionProbability=old.solutionProbability/multiplier;
 c.resourceRules.materialFlowSpeedMultiplier=multiplier;
 return c;
}
function main(){
 const out=path.join(__dirname,'stage-four-candidate'),c=candidate(),files=['source/core.js','source/app.js','source/storage.js','data/game-data.json','data/economy.json','data/fairies.json','data/costumes.json','Potion-Maker.html'];
 const before=Object.fromEntries(files.map(f=>[f,hash(path.join(root,f))]));fs.mkdirSync(out,{recursive:true});const json=(name,x)=>fs.writeFileSync(path.join(out,name),JSON.stringify(x,null,2)+'\n');json('candidate.json',c);json('case-returns.json',returns(c));
 if(process.argv.includes('--supply-sweep')){const sweep=[];
  for(const [flow,middle]of [[1,10],[1.25,14],[1.5,16],[1.75,16]]){const draft=adjustFlow(clone(c),flow);draft.rules.middleUpgradeMinutes=middle;draft.resourceRules.emptyGatherMultiplier=1;const runs=[];
   for(const scenario of scenarios.slice(0,2))for(let seed=1;seed<=8;seed++)runs.push(session(draft,scenario,seed));
   const result={flow,middle,summary:summary(runs),runs};sweep.push(result);console.log(JSON.stringify({flow,middle,rows:result.summary.map(r=>({name:r.scenario,tia:r.milestones.tia.p50,skin:r.milestones.regularSkin.p50,middle:r.middleGaps.p50}))}));
  }json('supply-sweep.json',sweep);return;
 }
 if(process.argv.includes('--gather-sweep')){const sweep=[];
  for(const [gather,middle]of [[1,16],[2,16],[3,16],[4,16]]){const draft=clone(c);draft.rules.middleUpgradeMinutes=middle;draft.resourceRules.emptyGatherMultiplier=gather;const runs=[];
   for(const scenario of scenarios.slice(0,2))for(let seed=1;seed<=8;seed++)runs.push(session(draft,scenario,seed));
   const result={gather,middle,summary:summary(runs),runs};sweep.push(result);console.log(JSON.stringify({gather,middle,rows:result.summary.map(r=>({name:r.scenario,tia:r.milestones.tia.p50,skin:r.milestones.regularSkin.p50,middle:r.middleGaps.p50,quests:r.end.questDelivered.p50}))}));
  }json('gather-sweep.json',sweep);return;
 }
 const seeds=process.argv.includes('--calibrate')?8:40,runs=[];
 for(const scenario of scenarios){for(let seed=1;seed<=seeds;seed++)runs.push(session(c,scenario,seed));console.log(scenario.name+' complete');}
 const rows=summary(runs);json(seeds===8?'calibration-sessions.json':'sessions.json',runs);json(seeds===8?'calibration-summary.json':'session-summary.json',rows);
 if(seeds===8){console.log(JSON.stringify(rows.map(r=>({name:r.scenario,tia:r.milestones.tia.p50,skin:r.milestones.regularSkin.p50,skinMiss:r.milestones.regularSkin.notReached,middle:r.middleGaps.p50})),null,2));return;}
 const probes=[];
 for(const startTier of [10,20])for(const mode of ['manual','conveyor'])for(let seed=1;seed<=12;seed++)probes.push(session(c,{name:'Tier '+startTier+' · '+mode,mode,earlySales:true,paid:true},seed,{startTier,minutes:120}));
 json('phase-sessions.json',probes);json('phase-summary.json',summary(probes));
 for(const f of files)if(before[f]!==hash(path.join(root,f)))throw Error('Live source changed: '+f);json('source-hashes.json',before);
 json('assumptions.json',{seeds,minutes:180,actionMs:500,stepMs:250,conveyorStepMs:50,capture:.9,chestRevealMs:4200,timingIsAssumed:true,paidLimit:'3 per fixed 20 active-minute window; adjacent windows allow a boundary burst of 6',manualDrops:'Advance a visible special-reward strip; catches still consume actions. Proposed UI work, not live behavior.',earlySales:'Farm already-mastered recipes at best no-consumable gold/action stop; pursue maximum on unmastered recipes and exact quest levels on orders.',bank:'Only 10 tickets ↔ 1 ruby. No gold exchange.',quests:'2 tickets and a random 1–3 charges of one boost; no automatic ruby.',phaseProbes:'Synthetic owned-tier anchors, prior mastery credited, no starting currencies. Not measured fresh-save arrival times.',liveChanged:false});
 json('research-hashes.json',Object.fromEntries(['stage-four.cjs','stage-four-report.cjs','stage-three.cjs','baseline-current.cjs','stage-three-candidate/candidate.json'].map(f=>[f,hash(path.join(__dirname,f))])));
 require('./stage-four-report.cjs')(c,runs,rows,probes,out);
 console.log('Stage 4 research written to '+out);
}
module.exports={candidate,engine,session,summary,returns,scenarios,adjustFlow};
if(require.main===module)main();
