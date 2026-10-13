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
const freshTraveler=()=>({quests:0,readyAt:0,phase:'away',deadline:0,requirement:null,rewardFairyId:null});
const POTION_IDS=new Set(FAMILIES.flatMap((f,i)=>f.recipes.map((r,t)=>i+'-'+t)));
const METRIC_COUNTERS=['coinsEarned','coinsSpent','brewsStarted','soldLevelOne','enhancementAttempts','enhancementsSucceeded','enhancementsFailed','protectedFailures','potionsLost','questsOffered','questsAccepted','questsDelivered','questsFailed','questsDeclined','upgradesBought','activePlayMs'];
const RECIPE_COUNTERS=['started','sold','sales','best','enhancements','failures','ingredients','highestLevel'];
const freshRecipeStats=()=>Object.fromEntries(RECIPE_COUNTERS.map(k=>[k,0]));
const freshVisitStats=()=>({offered:0,accepted:0,delivered:0,failed:0,declined:0});
const freshMetrics=()=>({...Object.fromEntries(METRIC_COUNTERS.map(k=>[k,0])),since:Date.now(),historyPartial:false,ingredientsByFamily:[0,0,0],powerupsUsed:{protection:0,enhancement:0,selling:0},recipes:{},visitors:Object.fromEntries(TRAVELERS.map(t=>[t.id,freshVisitStats()]))});
const INITIAL=()=>({version:5,coins:0,tiers:[0,0,0],luck:0,price:0,speed:0,potion:null,sold:0,failed:0,best:0,ingredients:0,powerups:{protection:0,enhancement:0,selling:0},travelers:TRAVELERS.map(freshTraveler),nextVisitorAt:0,metrics:freshMetrics(),fairies:{},discovered:[],selected:[0,0,0]});
const finite=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e300;
const integer=(x,max)=>Number.isInteger(x)&&x>=0&&x<=max;
function sanitizeSave(data){
 if(!data||![1,2,3,4,5].includes(data.version))throw Error('This save is not compatible.');
 const s=INITIAL();
 for(const k of ['coins','best']){if(!finite(data[k]))throw Error('Invalid currency.');s[k]=data[k];}
 for(const k of ['sold','failed','ingredients']){if(!integer(data[k],Number.MAX_SAFE_INTEGER))throw Error('Invalid statistics.');s[k]=data[k];}
 if(!Array.isArray(data.tiers)||data.tiers.length!==3||data.tiers.some(x=>!integer(x,data.version===1?2:24)))throw Error('Invalid ingredient upgrades.');s.tiers=[...data.tiers];
 for(const[k,max]of [['luck',10],['price',4],['speed',19]]){if(!integer(data[k],max))throw Error('Invalid upgrades.');s[k]=data[k];}
 s.selected=[...s.tiers];
 if(data.potion!==null){const p=data.potion;if(!p||!integer(p.family,2)||!integer(p.tier,s.tiers[p.family])||!integer(p.level,24)||!finite(p.value))throw Error('Invalid potion.');const r=FAMILIES[p.family].recipes[p.tier];if(!r.max_level||p.level>=r.max_level||r.base===null)throw Error('Unrecorded potion.');s.potion={family:p.family,tier:p.tier,level:p.level,value:p.value};}
 if(data.version>=2){
  for(const k of ['protection','enhancement','selling']){if(!integer(data.powerups?.[k],1e9))throw Error('Invalid powerups.');s.powerups[k]=data.powerups[k];}
  if(!Array.isArray(data.travelers)||data.travelers.length!==(data.version>=4?TRAVELERS.length:3))throw Error('Invalid travelers.');
  s.travelers=data.travelers.map(t=>{if(!integer(t.quests,1e9)||!integer(t.readyAt,8640000000000000))throw Error('Invalid quest timer.');return{...freshTraveler(),quests:t.quests,readyAt:t.readyAt,phase:t.readyAt?'returning':'away'};});
  if(!Array.isArray(data.discovered)||data.discovered.length>75||data.discovered.some(k=>typeof k!=='string'||!/^\d-\d{1,2}$/.test(k)||Number(k.split('-')[0])>2||Number(k.split('-')[1])>24))throw Error('Invalid collection.');s.discovered=[...new Set(data.discovered)];
  if(!Array.isArray(data.selected)||data.selected.length!==3||data.selected.some((x,i)=>!integer(x,s.tiers[i])))throw Error('Invalid starter selection.');s.selected=[...data.selected];
 }
 if(data.version>=3){
  if(!integer(data.nextVisitorAt,8640000000000000))throw Error('Invalid visitor schedule.');s.nextVisitorAt=data.nextVisitorAt;
  s.travelers=data.travelers.map(t=>{
   if(!['away','offer','active','returning','complete','failed'].includes(t.phase)||!integer(t.deadline,8640000000000000))throw Error('Invalid quest phase.');
   let q=null;if(t.requirement!==null){q=t.requirement;if(!q||!integer(q.family,2)||!integer(q.tier,s.tiers[q.family])||!integer(q.level,FAMILIES[q.family].recipes[q.tier].max_level-1))throw Error('Invalid quest requirement.');q={family:q.family,tier:q.tier,level:q.level};}
   if(['offer','active'].includes(t.phase)&&!q)throw Error('Missing quest requirement.');
   if((t.phase==='active')!==(t.deadline>0)||(t.phase==='returning')!==(t.readyAt>0))throw Error('Invalid quest clock.');
   let rewardFairyId=null;if(data.version>=4){if(t.rewardFairyId!==null&&!FAIRY_IDS.has(t.rewardFairyId))throw Error('Invalid fairy reward.');rewardFairyId=t.rewardFairyId;}
   return{quests:t.quests,readyAt:t.readyAt,phase:t.phase,deadline:t.deadline,requirement:q,rewardFairyId};
  });
  if(s.travelers.filter(t=>['offer','active'].includes(t.phase)).length>1)throw Error('Conflicting visitors.');
 }
 if(data.version>=4){
  if(!data.fairies||typeof data.fairies!=='object'||Array.isArray(data.fairies))throw Error('Invalid fairy collection.');
  for(const[id,count]of Object.entries(data.fairies)){if(!FAIRY_IDS.has(id)||!integer(count,1e9)||count<1)throw Error('Invalid collected fairy.');s.fairies[id]=count;}
  s.travelers.forEach((t,i)=>{if(TRAVELERS[i].rewardType==='fairy'&&['returning','complete'].includes(t.phase)&&!t.rewardFairyId)throw Error('Missing fairy reward.');if(TRAVELERS[i].rewardType!=='fairy'&&t.rewardFairyId)throw Error('Unexpected fairy reward.');});
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
 if(s.potion){const key=s.potion.family+'-'+s.potion.tier;if(!s.discovered.includes(key))s.discovered.push(key);}
 return s;
}
class PotionGame{
 constructor(state=INITIAL()){this.state=state;}
 recipe(){const p=this.state.potion;return p?FAMILIES[p.family].recipes[p.tier]:null;}
 statRecipe(p=this.state.potion){const key=p.family+'-'+p.tier;return this.state.metrics.recipes[key]||(this.state.metrics.recipes[key]=freshRecipeStats());}
 recordPlayTime(ms){if(finite(ms)&&ms<=2000)this.state.metrics.activePlayMs=Math.min(1e300,this.state.metrics.activePlayMs+ms);}
 collect(family,tier){const s=this.state;if(!integer(family,2)||!integer(tier,s.tiers[family]))return false;const r=FAMILIES[family].recipes[tier];if(!s.potion){if(!r||r.base===null)return false;s.potion={family,tier,level:0,value:r.base};s.metrics.brewsStarted++;this.statRecipe().started++;const key=family+'-'+tier;if(!s.discovered.includes(key))s.discovered.push(key);}else{s.potion.value=Math.min(1e300,s.potion.value+FAMILIES[family].materials[tier].value);}s.ingredients++;s.metrics.ingredientsByFamily[family]++;const record=this.statRecipe();record.ingredients++;record.highestLevel=Math.max(record.highestLevel,s.potion.level+1);return true;}

 enhancementStatus(){const p=this.state.potion,r=this.recipe();if(!p)return'empty';if(p.level+1>=r.max_level)return'max';if(r.multipliers[p.level]===null||r.chances[p.level]===null)return'unknown';return'ready';}
 next(){if(this.enhancementStatus()!=='ready')return null;const s=this.state,p=s.potion,r=this.recipe();return{chance:Math.min(1,r.chances[p.level]+s.luck*(DATA.limits.luck_bonus/10)+(s.powerups.enhancement>0?.1:0)),multiplier:r.multipliers[p.level],bonus:s.powerups.enhancement>0};}
 enhance(roll=Math.random()){const n=this.next();if(!n)return null;const s=this.state,record=this.statRecipe();s.metrics.enhancementAttempts++;if(n.bonus){s.powerups.enhancement--;s.metrics.powerupsUsed.enhancement++;}if(roll<n.chance){s.potion.value=Math.min(1e300,s.potion.value*n.multiplier);s.potion.level++;s.metrics.enhancementsSucceeded++;record.enhancements++;record.highestLevel=Math.max(record.highestLevel,s.potion.level+1);return'success';}s.failed++;s.metrics.enhancementsFailed++;record.failures++;if(s.powerups.protection>0){s.powerups.protection--;s.metrics.powerupsUsed.protection++;s.metrics.protectedFailures++;return'protected';}s.metrics.potionsLost++;s.potion=null;return'lost';}

 sellValue(){const s=this.state;return s.potion?Math.floor(Math.min(1e300,s.potion.value*(1+s.price*.05)*(s.powerups.selling>0?2:1))):0;}
 sell(){const s=this.state;if(!s.potion)return null;const value=this.sellValue(),record=this.statRecipe();s.metrics.coinsEarned=Math.min(1e300,s.metrics.coinsEarned+value);if(s.potion.level===0)s.metrics.soldLevelOne++;record.sold++;record.sales=Math.min(1e300,record.sales+value);record.best=Math.max(record.best,value);s.coins=Math.min(1e300,s.coins+value);s.sold++;s.best=Math.max(s.best,value);if(s.powerups.selling>0){s.powerups.selling--;s.metrics.powerupsUsed.selling++;}s.potion=null;return value;}

 upgradeInfo(key){const s=this.state;if(/^tier[0-2]$/.test(key)){const i=Number(key.slice(4)),level=s.tiers[i];return{level,max:24,cost:Math.round(60*3**level),displayLevel:level+1,displayMax:25};}const limits={luck:10,price:4,speed:19};if(!(key in limits))return null;const level=s[key];return{level,max:limits[key],cost:Math.round(({luck:80,price:90,speed:70}[key])*2**level),displayLevel:key==='speed'?level+1:level,displayMax:key==='speed'?20:limits[key]};}
 buy(key){const s=this.state,u=this.upgradeInfo(key);if(!u||u.level>=u.max||s.coins<u.cost)return false;s.coins-=u.cost;s.metrics.coinsSpent=Math.min(1e300,s.metrics.coinsSpent+u.cost);s.metrics.upgradesBought++;if(key.startsWith('tier')){const i=Number(key.slice(4));s.tiers[i]++;s.selected[i]=s.tiers[i];}else s[key]++;return true;}
 statistics(){const s=this.state;return{coins:s.coins,sold:s.sold,ingredients:s.ingredients,failed:s.failed,best:s.best,brewedTypes:s.discovered.length,unlockedRecipes:s.tiers.reduce((a,b)=>a+b+1,0),fairyTypes:Object.keys(s.fairies).length,fairiesReceived:Object.values(s.fairies).reduce((a,b)=>a+b,0),questsCompleted:s.travelers.reduce((a,t)=>a+t.quests,0),upgradesOwned:s.tiers.reduce((a,b)=>a+b,0)+s.luck+s.price+s.speed,metrics:s.metrics};}
 questRequirement(index){return this.state.travelers[index]?.requirement||null;}
 randomRequirement(random=Math.random){const pool=materialPool(this.state.tiers).filter(m=>FAMILIES[m.family].recipes[m.tier].base!==null),m=pool[randomIndex(pool.length,random)],r=FAMILIES[m.family].recipes[m.tier];return{...m,level:randomIndex(Math.min(r.max_level,4),random)};}
 scheduleVisitor(now,random=Math.random){this.state.nextVisitorAt=now+VISITOR_DELAY_MIN_MS+randomIndex(VISITOR_DELAY_MAX_MS-VISITOR_DELAY_MIN_MS+1,random);}
 acceptQuest(index,now=Date.now()){const t=this.state.travelers[index];if(!t||t.phase!=='offer')return false;t.phase='active';this.state.metrics.questsAccepted++;this.state.metrics.visitors[TRAVELERS[index].id].accepted++;t.deadline=now+QUEST_DURATION_MS;return true;}
 dismissVisitor(index,now=Date.now(),random=Math.random){const t=this.state.travelers[index];if(!t||!['offer','complete','failed'].includes(t.phase))return false;if(t.phase==='offer'){this.state.metrics.questsDeclined++;this.state.metrics.visitors[TRAVELERS[index].id].declined++;}Object.assign(t,{phase:'away',deadline:0,requirement:null,rewardFairyId:null,readyAt:0});if(this.state.travelers.every(x=>x.phase==='away'))this.scheduleVisitor(now,random);return true;}
 canDeliver(index,now=Date.now()){const p=this.state.potion,q=this.questRequirement(index),t=this.state.travelers[index];return !!(q&&p&&t.phase==='active'&&now<t.deadline&&p.family===q.family&&p.tier===q.tier&&p.level>=q.level);}
 deliver(index,now=Date.now(),random=Math.random){if(!this.canDeliver(index,now))return false;const t=this.state.travelers[index];this.state.metrics.questsDelivered++;this.state.metrics.visitors[TRAVELERS[index].id].delivered++;this.state.potion=null;t.phase='returning';if(TRAVELERS[index].rewardType==='fairy')t.rewardFairyId=FAIRIES[randomIndex(FAIRIES.length,random)].id;t.deadline=0;t.readyAt=now+DATA.quest_reward_delay_ms;return true;}
 settle(now=Date.now()){const rewards=[];this.state.travelers.forEach((state,i)=>{if(state.phase==='returning'&&state.readyAt<=now){const t=TRAVELERS[i];if(t.rewardType==='fairy'){this.state.fairies[state.rewardFairyId]=Math.min(1e9,(this.state.fairies[state.rewardFairyId]||0)+1);}else{this.state.powerups[t.powerup]=Math.min(1e9,this.state.powerups[t.powerup]+t.reward);}state.readyAt=0;state.phase='complete';state.quests++;rewards.push(t);}});return rewards;}
 tick(now=Date.now(),random=Math.random){const events=this.settle(now).map(t=>({kind:'reward',traveler:t}));this.state.travelers.forEach((t,i)=>{if(t.phase==='active'&&t.deadline<=now){t.phase='failed';t.deadline=0;this.state.metrics.questsFailed++;this.state.metrics.visitors[TRAVELERS[i].id].failed++;events.push({kind:'failed',traveler:TRAVELERS[i]});}});if(this.state.travelers.every(t=>t.phase==='away')){if(!this.state.nextVisitorAt)this.scheduleVisitor(now,random);else if(this.state.nextVisitorAt<=now){const index=randomIndex(TRAVELERS.length,random),t=this.state.travelers[index];t.phase='offer';this.state.metrics.questsOffered++;this.state.metrics.visitors[TRAVELERS[index].id].offered++;t.requirement=this.randomRequirement(random);this.state.nextVisitorAt=0;events.push({kind:'arrived',traveler:TRAVELERS[index]});}}return events;}
}
function randomIndex(length,random=Math.random){return Math.min(length-1,Math.max(0,Math.floor(random()*length)));}
function materialPool(tiers){return tiers.flatMap((top,family)=>Array.from({length:top+1},(_,tier)=>({family,tier})));}
// Spatial emission keeps gaps equal at every speed, including after catches.
class MaterialConveyor{
 constructor(width,tiers,random=Math.random){this.width=width;this.tiers=tiers;this.random=random;this.spacing=76;this.baseSpeed=38;this.serial=0;this.items=[];for(let x=0;x<=width;x+=this.spacing)this.spawn(x);this.untilSpawn=this.items.at(-1).x+this.spacing-width;}
 spawn(x){const pool=materialPool(this.tiers),m=pool[randomIndex(pool.length,this.random)];this.items.push({...m,x,id:this.serial++});}
 speed(brewing,emissionLevel){return this.baseSpeed*(brewing?1+emissionLevel*.12:1);}
 advance(ms,brewing,emissionLevel,width=this.width){if(width!==this.width){const shift=width-this.width;this.items.forEach(m=>m.x+=shift);this.width=width;}
  const distance=Math.max(0,ms)*this.speed(brewing,emissionLevel)/1000;this.items.forEach(m=>m.x-=distance);this.items=this.items.filter(m=>m.x>=-58);this.untilSpawn-=distance;
  while(this.untilSpawn<=0){if(this.untilSpawn>=-58)this.spawn(this.width+this.untilSpawn);this.untilSpawn+=this.spacing;}
 }
 take(id){const i=this.items.findIndex(m=>m.id===id);return i<0?null:this.items.splice(i,1)[0];}
}
if(typeof module!=='undefined')module.exports={PotionGame,MaterialConveyor,materialPool,FAMILIES,TRAVELERS,FAIRIES,INITIAL,sanitizeSave,DATA,QUEST_DURATION_MS};
