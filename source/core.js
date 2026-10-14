const DATA = typeof GAME_DATA !== 'undefined' ? GAME_DATA : require('../data/game-data.json');
const FAMILIES=DATA.families;
const FAIRIES=(typeof FAIRY_DATA!=='undefined'?FAIRY_DATA:require('../data/fairies.json')).entries;
const FAIRY_IDS=new Set(FAIRIES.map(f=>f.id));
const TRAVELERS=[
 {id:'neet',name:'Neet',portrait:'Neet_Portrait.png',family:0,powerup:'protection',reward:5},
 {id:'dolbur',name:'Dolbur',portrait:'DolburPortrait.png',family:1,powerup:'enhancement',reward:10},
 {id:'tirami',name:'Tirami',portrait:'TiramiMain.png',family:2,powerup:'selling',reward:2},
 {id:"claire",name:"Claire",portrait:"ClairePortrait.png",rewardType:'fairy',reward:1},
 {id:"luke",name:"Luke",portrait:"LukePortrait.png",rewardType:'fairy',reward:1},
 {id:"piria",name:"Piria",portrait:"PiriaPortrait.png",rewardType:'fairy',reward:1},
 {id:"charlotte",name:"Charlotte",portrait:"CharlottePortraitNormal.png",rewardType:'fairy',reward:1},
 {id:"demian",name:"Demian",portrait:"DemianPortrait.png",rewardType:'fairy',reward:1},
 {id:"daisy",name:"Daisy",portrait:"DaisyPortrait.png",rewardType:'fairy',reward:1},
 {id:"kyle",name:"Kyle",portrait:"KylePortrait.png",rewardType:'fairy',reward:1}
];
const QUEST_DURATION_MS=60000;
const VISITOR_DELAY_MIN_MS=20000,VISITOR_DELAY_MAX_MS=60000;
const QUEST_EXP=[[17,44,67,89,null,134,156,178,201,223,245,268,290,null,335,357,null,402,424,null,469,491,null,null,559],[8,22,null,44,55,67,78,89,null,111,122,134,145,156,null,178,190,null,212,null,null,null,281,293,306],[2,5,7,12,16,22,27,33,40,47,54,62,70,78,87,null,105,null,null,134,null,null,null,176,187]];
function visitorLevel(exp){let level=1;while(level<12&&exp>=LEVEL_EXP[level])level++;return level;}
const LEVEL_EXP=[0,300,500,1000,1500,3000,5000,7500,10000,15000,30000,50000];
const REQUESTS=[
 ['Recycle',1,1000,60000,1,'coins',2000,.70,'Squishy',.30],['Wash Cauldron',1,1000,60000,1,'coins',2000,.70,'Squashy',.30],['Gardening',1,1000,60000,1,'coins',2000,.70,'Mushy',.30],
 ['Wash Dishes',2,10000,120000,2,'selling',2,.22,'Beany-Kong',.22],
 ['Laundry',3,100000,300000,4,'tickets',3,.30,'Surprise-Pong',.25],['Organize Books',3,100000,300000,4,'tickets',3,.30,'Happy-Pong',.25],['Bake Cookies',3,100000,300000,4,'tickets',3,.30,'Amaze-Pong',.25],['Tidy Room',3,100000,300000,4,'tickets',3,.30,'Angry-Pong',.25],
 ['Sweeping Yard',4,1000000,600000,7,'enhancement',5,.60,'Sunnyside-Chick',.40],['Organize Potions',4,1000000,600000,7,'enhancement',5,.60,'Ice-Chick',.40],['Shopping Market',4,1000000,600000,7,'enhancement',5,.60,'Hot-Chick',.40],
 ['Promote Store',5,10000000,1800000,20,'protection',5,.60,'Clover-Puru',.40],['Taste Potions',5,10000000,1800000,20,'protection',5,.60,'Dande-Puru',.40],['Volunteering',5,10000000,1800000,20,'protection',5,.60,'Bell-Puru',.40],
 ['Help Farming',6,100000000,3600000,35,'selling',2,.60,'Red-Cho',.40],['Teach Children',6,100000000,3600000,35,'selling',2,.60,'Blue-Cho',.40],['Neighborhood Watch',6,100000000,3600000,35,'selling',2,.60,'Yellow-Cho',.40],
 ['Cleanup Streets',7,1e9,7200000,60,'tickets',20,.50,'Purplish-Kun',.30],['Patrol Village',7,1e9,7200000,60,'tickets',20,.50,'Orangish-Kun',.30],['Guild Request',7,1e9,7200000,60,'tickets',20,.50,'Greenish-Kun',.30],
 ['Explore Lore Woods',8,1e10,14400000,100,'enhancement',10,.60,'Magi-Run',.30],['Explore Bella Hills',8,1e10,14400000,100,'enhancement',10,.60,'Thief-Run',.30],['Explore Lamb Lake',8,1e10,14400000,100,'enhancement',10,.60,'Cleri-Run',.30],['Explore Myu Mine',8,1e10,14400000,100,'enhancement',10,.60,'Arch-Run',.30],['Explore Dartz Swamp',8,1e10,14400000,100,'enhancement',10,.60,'Warri-Run',.30],
 ['Explore Onix Dungeon',9,1e11,18000000,120,'protection',10,.60,'Blue-Me',.30],['Explore Ragna Volcano',9,1e11,18000000,120,'protection',10,.60,'Purp-Me',.30],['Explore Miya Labyrinth',9,1e11,18000000,120,'protection',10,.60,'Yell-Me',.30],['Explore Sealed Tower',9,1e11,18000000,120,'protection',10,.60,'Red-Me',.30],['Explore Celesta Shrine',9,1e11,18000000,120,'protection',10,.60,'Green-Me',.30],
 ['Explore Netherworld 1',10,1e12,25200000,150,'selling',5,.70,'Poong-Poong',.30],['Explore Netherworld 2',10,1e12,25200000,150,'selling',5,.70,'Gentle-Poong',.30],['Explore Netherworld 3',10,1e12,25200000,150,'selling',5,.70,'King-Poong',.30],['Explore Netherworld 4',10,1e12,25200000,150,'selling',5,.70,'Hero-Poong',.30],['Explore Netherworld 5',10,1e12,25200000,150,'selling',5,.70,'Wiz-Poong',.30]
].map(([name,level,cost,duration,likeability,bonusType,bonusCount,bonusChance,fairyName,fairyChance],id)=>({id,name,level,cost,duration,likeability,bonusType,bonusCount,bonusChance,fairyName,fairyChance}));
const REQUEST_FAIRY=new Map(FAIRIES.map(f=>[f.name.toLowerCase().replace(/[^a-z]/g,''),f.id]));
// Values are Lv 1 and Lv 10 wiki values. Effects for absent systems remain inactive.
const FAIRY_EFFECTS={
 'fairy-1':{questPrep:[.05,.25]},'fairy-2':{requestDurationReduction:[.11,.20]},'fairy-3':{visitorDelay:[.10,.20]},
 'fairy-5':{materialProbability:[[0,.05,0],[0,.50,0]]},'fairy-6':{materialProbability:[[.05,0,0],[.50,0,0]]},'fairy-7':{materialProbability:[[0,.025,.025],[0,.25,.25]]},'fairy-8':{materialProbability:[[.025,.025,0],[.25,.25,0]]},
 'fairy-9':{enhancementMultiplier:[[0,0,.05],[0,0,.15]]},'fairy-10':{enhancementMultiplier:[[0,.05,0],[0,.15,0]]},'fairy-11':{enhancementMultiplier:[[.05,0,0],[.15,0,0]]},
 'fairy-12':{enhancementChance:[[0,.02,.02],[0,.20,.20]]},'fairy-13':{enhancementChance:[[.02,0,.02],[.20,0,.20]]},'fairy-14':{enhancementChance:[[.02,.02,0],[.20,.20,0]]},
 'fairy-15':{enhancementMultiplier:[[.10,0,0],[.20,0,0]],sellBonus:[[.10,0,0],[.20,0,0]]},'fairy-16':{enhancementMultiplier:[[0,.10,0],[0,.20,0]],sellBonus:[[0,.10,0],[0,.20,0]]},'fairy-17':{enhancementMultiplier:[[0,0,.10],[0,0,.20]],sellBonus:[[0,0,.10],[0,0,.20]]},
 'fairy-18':{failureProtection:[[.05,.05,0],[.05,.15,0]]},'fairy-19':{failureProtection:[[.05,0,.05],[.15,0,.15]]},'fairy-20':{failureProtection:[[0,.05,.05],[0,.15,.15]]},'fairy-22':{materialAmount:[.10,.30]},
 'fairy-23':{failureProtection:[[.05,.05,.05],[.15,.15,.15]],enhancementChance:[[.02,.02,.02],[.20,.20,.20]]},'fairy-24':{questPrep:[.05,.25],requestDurationReduction:[.11,.20]},'fairy-25':{materialAmount:[.10,.30]},
 'fairy-26':{failureProtection:[[0,.05,0],[0,.15,0]],enhancementMultiplier:[[0,.10,0],[0,.20,0]],enhancementChance:[[0,.03,0],[0,.30,0]]},'fairy-27':{failureProtection:[[.05,.05,0],[.15,.15,0]],enhancementMultiplier:[[.10,.10,0],[.20,.20,0]],enhancementChance:[[.015,.015,0],[.15,.15,0]]},
 'fairy-28':{failureProtection:[[0,0,.05],[0,0,.15]],enhancementMultiplier:[[0,0,.10],[0,0,.20]],enhancementChance:[[0,0,.03],[0,0,.30]]},'fairy-29':{failureProtection:[[.05,0,0],[.20,0,0]],enhancementMultiplier:[[.10,0,0],[.20,0,0]],enhancementChance:[[.03,0,0],[.30,0,0]]},
 'fairy-30':{failureProtection:[[0,.05,.05],[0,.15,.15]],enhancementMultiplier:[[0,.10,.10],[0,.15,.15]],enhancementChance:[[0,.015,.015],[0,.15,.15]]},'fairy-31':{materialAmount:[.10,.30]},'fairy-32':{questPrep:[.05,.60]},'fairy-34':{materialAmount:[.15,.42]},'fairy-35':{visitorDelay:[.10,.30],requestDurationReduction:[.15,.42]}
};
const freshTraveler=()=>({quests:0,readyAt:0,phase:'away',deadline:0,requirement:null,rewardFairyId:null,level:1,exp:0});
const POTION_IDS=new Set(FAMILIES.flatMap((f,i)=>f.recipes.map((r,t)=>i+'-'+t)));
const METRIC_COUNTERS=['coinsEarned','coinsSpent','brewsStarted','soldLevelOne','enhancementAttempts','enhancementsSucceeded','enhancementsFailed','protectedFailures','potionsLost','questsOffered','questsAccepted','questsDelivered','questsFailed','questsDeclined','upgradesBought','activePlayMs'];
const RECIPE_COUNTERS=['started','sold','sales','best','enhancements','failures','ingredients','highestLevel'];
const freshRecipeStats=()=>Object.fromEntries(RECIPE_COUNTERS.map(k=>[k,0]));
const freshVisitStats=()=>({offered:0,accepted:0,delivered:0,failed:0,declined:0});
const freshMetrics=()=>({...Object.fromEntries(METRIC_COUNTERS.map(k=>[k,0])),since:Date.now(),historyPartial:false,ingredientsByFamily:[0,0,0],powerupsUsed:{protection:0,enhancement:0,selling:0},recipes:{},visitors:Object.fromEntries(TRAVELERS.map(t=>[t.id,freshVisitStats()]))});
const INITIAL=()=>({version:8,coins:0,tickets:0,likeability:0,requestCoinsSpent:0,tiers:[0,0,0],luck:0,price:0,speed:0,potion:null,sold:0,failed:0,best:0,ingredients:0,powerups:{protection:0,enhancement:0,selling:0},travelers:TRAVELERS.map(freshTraveler),request:null,nextVisitorAt:0,metrics:freshMetrics(),fairies:{},activeFairyId:null,discovered:[],selected:[0,0,0]});
const finite=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e300;
const integer=(x,max)=>Number.isInteger(x)&&x>=0&&x<=max;
function sanitizeSave(data){
 if(!data||![1,2,3,4,5,6,7,8].includes(data.version))throw Error('This save is not compatible.');
 const s=INITIAL();
 const legacyMastery=data.version===6&&data.request===undefined&&data.mastery!==undefined;
 const hasRequests=data.version>=6&&!legacyMastery;
 function saveTime(value){if(!finite(value)||value>8640000000000000||(data.version>=8&&!Number.isInteger(value)))throw Error('Invalid save timestamp.');return Math.round(value);}

 for(const k of ['coins','best']){if(!finite(data[k]))throw Error('Invalid currency.');s[k]=data[k];}if(hasRequests){if(!integer(data.tickets,1e9)||!integer(data.likeability,1e9)||!finite(data.requestCoinsSpent))throw Error('Invalid request rewards.');s.tickets=data.tickets;s.likeability=data.likeability;s.requestCoinsSpent=data.requestCoinsSpent;}
 for(const k of ['sold','failed','ingredients']){if(!integer(data[k],Number.MAX_SAFE_INTEGER))throw Error('Invalid statistics.');s[k]=data[k];}
 if(!Array.isArray(data.tiers)||data.tiers.length!==3||data.tiers.some(x=>!integer(x,data.version===1?2:24)))throw Error('Invalid ingredient upgrades.');s.tiers=[...data.tiers];
 for(const[k,max]of [['luck',10],['price',4],['speed',19]]){if(!integer(data[k],max))throw Error('Invalid upgrades.');s[k]=data[k];}
 s.selected=[...s.tiers];
 if(data.potion!==null){const p=data.potion;if(!p||!integer(p.family,2)||!integer(p.tier,s.tiers[p.family])||!integer(p.level,24)||!finite(p.value))throw Error('Invalid potion.');const r=FAMILIES[p.family].recipes[p.tier];if(!r.max_level||p.level>=r.max_level||r.base===null)throw Error('Unrecorded potion.');s.potion={family:p.family,tier:p.tier,level:p.level,value:p.value};}
 if(data.version>=2){
  for(const k of ['protection','enhancement','selling']){if(!integer(data.powerups?.[k],1e9))throw Error('Invalid powerups.');s.powerups[k]=data.powerups[k];}
  if(!Array.isArray(data.travelers)||data.travelers.length!==(data.version>=4?TRAVELERS.length:3))throw Error('Invalid travelers.');
  s.travelers=data.travelers.map(t=>{if(!integer(t.quests,1e9))throw Error('Invalid quest timer.');const readyAt=saveTime(t.readyAt);return{...freshTraveler(),quests:t.quests,readyAt,phase:readyAt?'returning':'away'};});
  if(!Array.isArray(data.discovered)||data.discovered.length>75||data.discovered.some(k=>typeof k!=='string'||!/^\d-\d{1,2}$/.test(k)||Number(k.split('-')[0])>2||Number(k.split('-')[1])>24))throw Error('Invalid collection.');s.discovered=[...new Set(data.discovered)];
  if(!Array.isArray(data.selected)||data.selected.length!==3||data.selected.some((x,i)=>!integer(x,s.tiers[i])))throw Error('Invalid starter selection.');s.selected=[...data.selected];
 }
 if(data.version>=3){
  s.nextVisitorAt=saveTime(data.nextVisitorAt);
  s.travelers=data.travelers.map(t=>{
   if(!['away','offer','active','returning','complete','failed'].includes(t.phase))throw Error('Invalid quest phase.');const deadline=saveTime(t.deadline),readyAt=saveTime(t.readyAt);
   let q=null;if(t.requirement!==null){q=t.requirement;if(!q||!integer(q.family,2)||!integer(q.tier,s.tiers[q.family])||!integer(q.level,FAMILIES[q.family].recipes[q.tier].max_level-1))throw Error('Invalid quest requirement.');q={family:q.family,tier:q.tier,level:q.level};}
   if(['offer','active'].includes(t.phase)&&!q)throw Error('Missing quest requirement.');
   if((t.phase==='active')!==(deadline>0)||(t.phase==='returning')!==(readyAt>0))throw Error('Invalid quest clock.');
   let rewardFairyId=null;if(data.version>=4){if(t.rewardFairyId!==null&&!FAIRY_IDS.has(t.rewardFairyId))throw Error('Invalid fairy reward.');rewardFairyId=t.rewardFairyId;}
   let level=1,exp=0;if(hasRequests){if(!integer(t.level,12)||t.level<1||!integer(t.exp,1e9))throw Error('Invalid visitor progression.');level=t.level;exp=t.exp;if(level!==visitorLevel(exp))throw Error('Visitor level does not match EXP.');}
   return{...freshTraveler(),quests:t.quests,readyAt,phase:t.phase,deadline,requirement:q,rewardFairyId,level,exp};
  });
  if(s.travelers.filter(t=>['offer','active'].includes(t.phase)).length>1)throw Error('Conflicting visitors.');
 }
 if(data.version>=4){
  if(!data.fairies||typeof data.fairies!=='object'||Array.isArray(data.fairies))throw Error('Invalid fairy collection.');
  for(const[id,count]of Object.entries(data.fairies)){if(!FAIRY_IDS.has(id)||!integer(count,1e9)||count<1)throw Error('Invalid collected fairy.');s.fairies[id]=count;}
  if(data.version>=7){if(data.activeFairyId!==null&&(!FAIRY_IDS.has(data.activeFairyId)||!FAIRY_EFFECTS[data.activeFairyId]||!s.fairies[data.activeFairyId]))throw Error('Invalid active fairy.');s.activeFairyId=data.activeFairyId;}
  s.travelers.forEach((t,i)=>{if(TRAVELERS[i].rewardType==='fairy'&&['returning','complete'].includes(t.phase)&&!t.rewardFairyId)throw Error('Missing fairy reward.');if(TRAVELERS[i].rewardType!=='fairy'&&t.rewardFairyId)throw Error('Unexpected fairy reward.');});
 }
 if(hasRequests&&data.request!==null){
  const r=data.request,meta=r&&REQUESTS.find(q=>q.id===r.requestId);
  if(!r||!integer(r.travelerIndex,TRAVELERS.length-1)||!meta||s.travelers[r.travelerIndex].level<meta.level||s.travelers.some(t=>t.phase!=='away'))throw Error('Invalid active request.');
  const readyAt=saveTime(r.readyAt);if(!readyAt)throw Error('Invalid request timer.');
  const result=r.result;if(!result||typeof result.bonus!=='boolean'||typeof result.fairy!=='boolean'||['likeability','bonusType','bonusCount'].some(k=>result[k]!==meta[k]))throw Error('Request reward does not match its definition.');
  s.request={travelerIndex:r.travelerIndex,requestId:r.requestId,readyAt,result:{likeability:meta.likeability,bonusType:meta.bonusType,bonusCount:meta.bonusCount,bonus:result.bonus,fairy:result.fairy}};
 }

 while(s.travelers.length<TRAVELERS.length)s.travelers.push(freshTraveler());
 if(data.version>=5){
  const m=data.metrics;if(!m||typeof m!=='object'||Array.isArray(m)||!integer(m.since,8640000000000000)||typeof m.historyPartial!=='boolean')throw Error('Invalid statistics history.');
  for(const k of METRIC_COUNTERS)if(!finite(m[k]))throw Error('Invalid statistics counter.');
  if(!Array.isArray(m.ingredientsByFamily)||m.ingredientsByFamily.length!==3||m.ingredientsByFamily.some(x=>!integer(x,Number.MAX_SAFE_INTEGER)))throw Error('Invalid family statistics.');
  for(const k of ['protection','enhancement','selling'])if(!integer(m.powerupsUsed?.[k],Number.MAX_SAFE_INTEGER))throw Error('Invalid powerup statistics.');
  if(!m.recipes||typeof m.recipes!=='object'||Array.isArray(m.recipes)||Object.keys(m.recipes).some(k=>!POTION_IDS.has(k)))throw Error('Invalid potion statistics.');
  for(const[id,record]of Object.entries(m.recipes)){if(!record||RECIPE_COUNTERS.some(k=>!finite(record[k])))throw Error('Invalid potion counter.');const[f,t]=id.split('-').map(Number);if(!integer(record.highestLevel,FAMILIES[f].recipes[t].max_level))throw Error('Invalid highest potion level.');}
  if(!m.visitors||typeof m.visitors!=='object'||Array.isArray(m.visitors)||Object.keys(m.visitors).length!==TRAVELERS.length)throw Error('Invalid visitor statistics.');
  for(const t of TRAVELERS){const r=m.visitors[t.id];if(!r||Object.keys(freshVisitStats()).some(k=>!integer(r[k],Number.MAX_SAFE_INTEGER)))throw Error('Invalid visitor counter.');}
  s.metrics=JSON.parse(JSON.stringify(m));
 }else{
  s.metrics.historyPartial=true;
  if(s.potion){const p=s.potion,record=freshRecipeStats();record.highestLevel=p.level+1;s.metrics.recipes[p.family+'-'+p.tier]=record;}
 }
 if(data.mastery!==undefined){
  if(!data.mastery||typeof data.mastery!=='object'||Array.isArray(data.mastery))throw Error('Invalid legacy achievements.');s.mastery={};
  for(const[id,r]of Object.entries(data.mastery)){
   if(!POTION_IDS.has(id)||!r||!integer(r.unlockedAt,8640000000000000)||!integer(r.times,1e9)||!finite(r.bestValue)||typeof r.recovered!=='boolean')throw Error('Invalid legacy mastery.');
   s.mastery[id]={unlockedAt:r.unlockedAt,times:r.times,bestValue:r.bestValue,recovered:r.recovered};
   const[f,t]=id.split('-').map(Number),record=s.metrics.recipes[id]||(s.metrics.recipes[id]=freshRecipeStats());record.highestLevel=FAMILIES[f].recipes[t].max_level;
  }
 }
 if(s.potion){const p=s.potion,record=s.metrics.recipes[p.family+'-'+p.tier]||(s.metrics.recipes[p.family+'-'+p.tier]=freshRecipeStats());record.highestLevel=Math.max(record.highestLevel,p.level+1);}
 if(s.potion){const key=s.potion.family+'-'+s.potion.tier;if(!s.discovered.includes(key))s.discovered.push(key);}
 return s;
}
class PotionGame{
 constructor(state=INITIAL()){this.state=state;}
 fairyLevel(id){return Math.min(10,this.state.fairies[id]||0);}
 fairyEffects(){const s=this.state,id=s.activeFairyId,raw=FAIRY_EFFECTS[id],level=this.fairyLevel(id);if(!raw||!level)return{};const out={};for(const[key,pair]of Object.entries(raw)){if(Array.isArray(pair[0]))out[key]=pair[0].map((v,i)=>v+(pair[1][i]-v)*(level-1)/9);else out[key]=pair[0]+(pair[1]-pair[0])*(level-1)/9;}return out;}
 setActiveFairy(id){if(id!==null&&(!FAIRY_IDS.has(id)||!FAIRY_EFFECTS[id]||!this.state.fairies[id]))return false;this.state.activeFairyId=id;return true;}
 recipe(){const p=this.state.potion;return p?FAMILIES[p.family].recipes[p.tier]:null;}
 statRecipe(p=this.state.potion){const key=p.family+'-'+p.tier;return this.state.metrics.recipes[key]||(this.state.metrics.recipes[key]=freshRecipeStats());}
 recordPlayTime(ms){if(finite(ms)&&ms<=2000)this.state.metrics.activePlayMs=Math.min(1e300,this.state.metrics.activePlayMs+ms);}
 collect(family,tier){const s=this.state;if(!integer(family,2)||!integer(tier,s.tiers[family]))return false;const r=FAMILIES[family].recipes[tier];if(!s.potion){if(!r||r.base===null)return false;s.potion={family,tier,level:0,value:r.base};s.metrics.brewsStarted++;this.statRecipe().started++;const key=family+'-'+tier;if(!s.discovered.includes(key))s.discovered.push(key);}else{s.potion.value=Math.min(1e300,s.potion.value+FAMILIES[family].materials[tier].value*(1+(this.fairyEffects().materialAmount||0)));}s.ingredients++;s.metrics.ingredientsByFamily[family]++;const record=this.statRecipe();record.ingredients++;record.highestLevel=Math.max(record.highestLevel,s.potion.level+1);return true;}

 enhancementStatus(){const p=this.state.potion,r=this.recipe();if(!p)return'empty';if(p.level+1>=r.max_level)return'max';if(r.multipliers[p.level]===null||r.chances[p.level]===null)return'unknown';return'ready';}
 next(){if(this.enhancementStatus()!=='ready')return null;const s=this.state,p=s.potion,r=this.recipe();const fairy=this.fairyEffects();return{chance:Math.min(1,r.chances[p.level]+s.luck*(DATA.limits.luck_bonus/10)+(s.powerups.enhancement>0?.1:0)+(fairy.enhancementChance?.[p.family]||0)),multiplier:r.multipliers[p.level]*(1+(fairy.enhancementMultiplier?.[p.family]||0)),bonus:s.powerups.enhancement>0};}
 enhance(roll=Math.random(),fairyRoll=Math.random()){const n=this.next();if(!n)return null;const s=this.state,record=this.statRecipe();s.metrics.enhancementAttempts++;if(n.bonus){s.powerups.enhancement--;s.metrics.powerupsUsed.enhancement++;}if(roll<n.chance){s.potion.value=Math.min(1e300,s.potion.value*n.multiplier);s.potion.level++;s.metrics.enhancementsSucceeded++;record.enhancements++;record.highestLevel=Math.max(record.highestLevel,s.potion.level+1);return'success';}s.failed++;s.metrics.enhancementsFailed++;record.failures++;if(s.powerups.protection>0){s.powerups.protection--;s.metrics.powerupsUsed.protection++;s.metrics.protectedFailures++;return'protected';}if(fairyRoll<(this.fairyEffects().failureProtection?.[s.potion.family]||0)){s.metrics.protectedFailures++;return'fairy-protected';}s.metrics.potionsLost++;s.potion=null;return'lost';}

 sellValue(){const s=this.state;if(!s.potion)return 0;const fairy=this.fairyEffects().sellBonus?.[s.potion.family]||0;return Math.floor(Math.min(1e300,s.potion.value*(1+s.price*.05+fairy)*(s.powerups.selling>0?2:1)));}
 sell(){const s=this.state;if(!s.potion)return null;const value=this.sellValue(),record=this.statRecipe();s.metrics.coinsEarned=Math.min(1e300,s.metrics.coinsEarned+value);if(s.potion.level===0)s.metrics.soldLevelOne++;record.sold++;record.sales=Math.min(1e300,record.sales+value);record.best=Math.max(record.best,value);s.coins=Math.min(1e300,s.coins+value);s.sold++;s.best=Math.max(s.best,value);if(s.powerups.selling>0){s.powerups.selling--;s.metrics.powerupsUsed.selling++;}s.potion=null;return value;}

 upgradeInfo(key){const s=this.state;if(/^tier[0-2]$/.test(key)){const i=Number(key.slice(4)),level=s.tiers[i];return{level,max:24,cost:Math.round(60*3**level),displayLevel:level+1,displayMax:25};}const limits={luck:10,price:4,speed:19};if(!(key in limits))return null;const level=s[key];return{level,max:limits[key],cost:Math.round(({luck:80,price:90,speed:70}[key])*2**level),displayLevel:key==='speed'?level+1:level,displayMax:key==='speed'?20:limits[key]};}
 buy(key){const s=this.state,u=this.upgradeInfo(key);if(!u||u.level>=u.max||s.coins<u.cost)return false;s.coins-=u.cost;s.metrics.coinsSpent=Math.min(1e300,s.metrics.coinsSpent+u.cost);s.metrics.upgradesBought++;if(key.startsWith('tier')){const i=Number(key.slice(4));s.tiers[i]++;s.selected[i]=s.tiers[i];}else s[key]++;return true;}
 statistics(){const s=this.state;return{coins:s.coins,sold:s.sold,ingredients:s.ingredients,failed:s.failed,best:s.best,brewedTypes:s.discovered.length,unlockedRecipes:s.tiers.reduce((a,b)=>a+b+1,0),fairyTypes:Object.keys(s.fairies).length,fairiesReceived:Object.values(s.fairies).reduce((a,b)=>a+b,0),questsCompleted:s.travelers.reduce((a,t)=>a+t.quests,0),upgradesOwned:s.tiers.reduce((a,b)=>a+b,0)+s.luck+s.price+s.speed,metrics:s.metrics};}
 questRequirement(index){return this.state.travelers[index]?.requirement||null;}
 experienceFor(family,tier){const bases=QUEST_EXP[family];if(bases[tier]!==null&&bases[tier]!==undefined)return bases[tier];let lo=tier-1,hi=tier+1;while(lo>=0&&bases[lo]===null)lo--;while(hi<bases.length&&bases[hi]===null)hi++;if(lo<0)return bases[hi]||1;if(hi>=bases.length)return bases[lo];return Math.round(bases[lo]+(bases[hi]-bases[lo])*(tier-lo)/(hi-lo));}
 experienceIsEstimated(family,tier){const bases=QUEST_EXP[family];return bases[tier]===null;}
 gainExperience(index,family,tier){const t=this.state.travelers[index];if(!t)return null;const gained=this.experienceFor(family,tier);t.exp=Math.min(1e9,t.exp+gained);t.level=visitorLevel(t.exp);return{gained,level:t.level,exp:t.exp};}
 requestsFor(index){const t=this.state.travelers[index];return t?REQUESTS.filter(r=>r.level<=t.level):[];}
 startRequest(index,requestId,now=Date.now(),random=Math.random){const s=this.state,t=s.travelers[index],r=REQUESTS.find(q=>q.id===requestId);if(!t||!r||t.level<r.level||s.request||s.travelers.some(v=>v.phase!=='away')||t.phase!=='away'||s.coins<r.cost)return false;s.coins-=r.cost;s.requestCoinsSpent=Math.min(1e300,s.requestCoinsSpent+r.cost);const bonus=random()<r.bonusChance,fairy=random()<r.fairyChance;s.request={travelerIndex:index,requestId:r.id,readyAt:Math.round(now+r.duration*(1-(this.fairyEffects().requestDurationReduction||0))),result:{likeability:r.likeability,bonusType:r.bonusType,bonusCount:r.bonusCount,bonus,fairy}};return true;}
 settleRequest(now=Date.now()){const s=this.state,r=s.request;if(!r||r.readyAt>now)return null;const meta=REQUESTS.find(q=>q.id===r.requestId);s.likeability=Math.min(1e9,s.likeability+r.result.likeability);if(r.result.bonus){if(r.result.bonusType==='coins')s.coins=Math.min(1e300,s.coins+r.result.bonusCount);else if(r.result.bonusType==='tickets')s.tickets=Math.min(1e9,s.tickets+r.result.bonusCount);else s.powerups[r.result.bonusType]=Math.min(1e9,s.powerups[r.result.bonusType]+r.result.bonusCount);}let fairyId=null;if(r.result.fairy){fairyId=REQUEST_FAIRY.get(meta.fairyName.toLowerCase().replace(/[^a-z]/g,''))||null;if(fairyId)s.fairies[fairyId]=Math.min(1e9,(s.fairies[fairyId]||0)+1);}s.request=null;return{traveler:TRAVELERS[r.travelerIndex],request:meta,fairyId};}
 randomRequirement(random=Math.random){const pool=materialPool(this.state.tiers).filter(m=>FAMILIES[m.family].recipes[m.tier].base!==null),m=pool[randomIndex(pool.length,random)],r=FAMILIES[m.family].recipes[m.tier];return{...m,level:randomIndex(Math.min(r.max_level,4),random)};}
 scheduleVisitor(now,random=Math.random){const reduction=this.fairyEffects().visitorDelay||0;this.state.nextVisitorAt=Math.round(now+(VISITOR_DELAY_MIN_MS+randomIndex(VISITOR_DELAY_MAX_MS-VISITOR_DELAY_MIN_MS+1,random))*(1-reduction));}
 acceptQuest(index,now=Date.now()){const t=this.state.travelers[index];if(!t||t.phase!=='offer')return false;t.phase='active';this.state.metrics.questsAccepted++;this.state.metrics.visitors[TRAVELERS[index].id].accepted++;t.deadline=Math.round(now+QUEST_DURATION_MS*(1+(this.fairyEffects().questPrep||0)));return true;}
 dismissVisitor(index,now=Date.now(),random=Math.random){const t=this.state.travelers[index];if(!t||!['offer','complete','failed'].includes(t.phase))return false;if(t.phase==='offer'){this.state.metrics.questsDeclined++;this.state.metrics.visitors[TRAVELERS[index].id].declined++;}Object.assign(t,{phase:'away',deadline:0,requirement:null,rewardFairyId:null,readyAt:0});if(this.state.travelers.every(x=>x.phase==='away'))this.scheduleVisitor(now,random);return true;}
 canDeliver(index,now=Date.now()){const p=this.state.potion,q=this.questRequirement(index),t=this.state.travelers[index];return !!(q&&p&&t.phase==='active'&&now<t.deadline&&p.family===q.family&&p.tier===q.tier&&p.level>=q.level);}
 deliver(index,now=Date.now(),random=Math.random){if(!this.canDeliver(index,now))return false;const t=this.state.travelers[index],p=this.state.potion;this.state.metrics.questsDelivered++;this.state.metrics.visitors[TRAVELERS[index].id].delivered++;this.gainExperience(index,p.family,p.tier);this.state.potion=null;t.phase='returning';if(TRAVELERS[index].rewardType==='fairy')t.rewardFairyId=FAIRIES[randomIndex(FAIRIES.length,random)].id;t.deadline=0;t.readyAt=now;this.settle(now);return true;}
 settle(now=Date.now()){const rewards=[];this.state.travelers.forEach((state,i)=>{if(state.phase==='returning'){const t=TRAVELERS[i];if(t.rewardType==='fairy'){this.state.fairies[state.rewardFairyId]=Math.min(1e9,(this.state.fairies[state.rewardFairyId]||0)+1);}else{this.state.powerups[t.powerup]=Math.min(1e9,this.state.powerups[t.powerup]+t.reward);}state.readyAt=0;state.phase='complete';state.quests++;rewards.push(t);}});return rewards;}
 tick(now=Date.now(),random=Math.random){const events=this.settle(now).map(t=>({kind:'reward',traveler:t}));const requestResult=this.settleRequest(now);if(requestResult)events.push({kind:'request',...requestResult});this.state.travelers.forEach((t,i)=>{if(t.phase==='active'&&t.deadline<=now){t.phase='failed';t.deadline=0;this.state.metrics.questsFailed++;this.state.metrics.visitors[TRAVELERS[i].id].failed++;events.push({kind:'failed',traveler:TRAVELERS[i]});}});if(!this.state.request&&this.state.travelers.every(t=>t.phase==='away')){if(!this.state.nextVisitorAt)this.scheduleVisitor(now,random);else if(this.state.nextVisitorAt<=now){const index=randomIndex(TRAVELERS.length,random),t=this.state.travelers[index];t.phase='offer';this.state.metrics.questsOffered++;this.state.metrics.visitors[TRAVELERS[index].id].offered++;t.requirement=this.randomRequirement(random);this.state.nextVisitorAt=0;events.push({kind:'arrived',traveler:TRAVELERS[index]});}}return events;}
}
function randomIndex(length,random=Math.random){return Math.min(length-1,Math.max(0,Math.floor(random()*length)));}
function materialPool(tiers){return tiers.flatMap((top,family)=>Array.from({length:top+1},(_,tier)=>({family,tier})));}
// Spatial emission keeps gaps equal at every speed, including after catches.
class MaterialConveyor{
 constructor(width,tiers,random=Math.random,effects=()=>({})){this.width=width;this.tiers=tiers;this.random=random;this.effects=effects;this.spacing=76;this.baseSpeed=38;this.serial=0;this.items=[];for(let x=0;x<=width;x+=this.spacing)this.spawn(x);this.untilSpawn=this.items.at(-1).x+this.spacing-width;}
 spawn(x){const bonus=this.effects()?.materialProbability||[0,0,0],weights=this.tiers.map((top,f)=>(top+1)*(1+(bonus[f]||0)));let roll=this.random()*weights.reduce((a,b)=>a+b,0),family=0;while(family<weights.length-1&&roll>=weights[family]){roll-=weights[family];family++;}const m={family,tier:randomIndex(this.tiers[family]+1,this.random)};this.items.push({...m,x,id:this.serial++});}
 speed(brewing,emissionLevel){return this.baseSpeed*(brewing?1+emissionLevel*.12:1);}
 advance(ms,brewing,emissionLevel,width=this.width){if(width!==this.width){const shift=width-this.width;this.items.forEach(m=>m.x+=shift);this.width=width;}
  const distance=Math.max(0,ms)*this.speed(brewing,emissionLevel)/1000;this.items.forEach(m=>m.x-=distance);this.items=this.items.filter(m=>m.x>=-58);this.untilSpawn-=distance;
  while(this.untilSpawn<=0){if(this.untilSpawn>=-58)this.spawn(this.width+this.untilSpawn);this.untilSpawn+=this.spacing;}
 }
 take(id){const i=this.items.findIndex(m=>m.id===id);return i<0?null:this.items.splice(i,1)[0];}
}
if(typeof module!=='undefined')module.exports={PotionGame,MaterialConveyor,materialPool,FAMILIES,TRAVELERS,FAIRIES,REQUESTS,LEVEL_EXP,INITIAL,sanitizeSave,DATA,QUEST_DURATION_MS};
