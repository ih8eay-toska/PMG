const DATA = typeof GAME_DATA !== 'undefined' ? GAME_DATA : require('../data/game-data.json');
const FAMILIES=DATA.families;
const TRAVELERS=[
 {id:'neet',name:'Neet',portrait:'Neet_Portrait.png',family:0,powerup:'protection',reward:5},
 {id:'dolbur',name:'Dolbur',portrait:'DolburPortrait.png',family:1,powerup:'enhancement',reward:10},
 {id:'tirami',name:'Tirami',portrait:'TiramiMain.png',family:2,powerup:'selling',reward:2}
];
const INITIAL=()=>({version:2,coins:0,tiers:[0,0,0],luck:0,price:0,speed:0,potion:null,sold:0,failed:0,best:0,ingredients:0,powerups:{protection:0,enhancement:0,selling:0},travelers:TRAVELERS.map(()=>({quests:0,readyAt:0})),discovered:[],selected:[0,0,0]});
const finite=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0&&x<=1e300;
const integer=(x,max)=>Number.isInteger(x)&&x>=0&&x<=max;
function sanitizeSave(data){
 if(!data||![1,2].includes(data.version))throw Error('This save is not compatible.');
 const s=INITIAL();
 for(const k of ['coins','best']){if(!finite(data[k]))throw Error('Invalid currency.');s[k]=data[k];}
 for(const k of ['sold','failed','ingredients']){if(!integer(data[k],Number.MAX_SAFE_INTEGER))throw Error('Invalid statistics.');s[k]=data[k];}
 if(!Array.isArray(data.tiers)||data.tiers.length!==3||data.tiers.some(x=>!integer(x,data.version===1?2:24)))throw Error('Invalid ingredient upgrades.');s.tiers=[...data.tiers];
 for(const[k,max]of [['luck',10],['price',4],['speed',19]]){if(!integer(data[k],max))throw Error('Invalid upgrades.');s[k]=data[k];}
 s.selected=[...s.tiers];
 if(data.potion!==null){const p=data.potion;if(!p||!integer(p.family,2)||!integer(p.tier,s.tiers[p.family])||!integer(p.level,24)||!finite(p.value))throw Error('Invalid potion.');const r=FAMILIES[p.family].recipes[p.tier];if(!r.max_level||p.level>=r.max_level||r.base===null)throw Error('Unrecorded potion.');s.potion={family:p.family,tier:p.tier,level:p.level,value:p.value};}
 if(data.version===2){
  for(const k of ['protection','enhancement','selling']){if(!integer(data.powerups?.[k],1e9))throw Error('Invalid powerups.');s.powerups[k]=data.powerups[k];}
  if(!Array.isArray(data.travelers)||data.travelers.length!==3)throw Error('Invalid travelers.');
  s.travelers=data.travelers.map(t=>{if(!integer(t.quests,1e9)||!integer(t.readyAt,8640000000000000))throw Error('Invalid quest timer.');return{quests:t.quests,readyAt:t.readyAt};});
  if(!Array.isArray(data.discovered)||data.discovered.length>75||data.discovered.some(k=>typeof k!=='string'||!/^\d-\d{1,2}$/.test(k)||Number(k.split('-')[0])>2||Number(k.split('-')[1])>24))throw Error('Invalid collection.');s.discovered=[...new Set(data.discovered)];
  if(!Array.isArray(data.selected)||data.selected.length!==3||data.selected.some((x,i)=>!integer(x,s.tiers[i])))throw Error('Invalid starter selection.');s.selected=[...data.selected];
 }
 if(s.potion){const key=s.potion.family+'-'+s.potion.tier;if(!s.discovered.includes(key))s.discovered.push(key);}
 return s;
}
class PotionGame{
 constructor(state=INITIAL()){this.state=state;}
 recipe(){const p=this.state.potion;return p?FAMILIES[p.family].recipes[p.tier]:null;}
 collect(family,tier){const s=this.state;if(!integer(family,2)||!integer(tier,s.tiers[family]))return false;const r=FAMILIES[family].recipes[tier];if(!s.potion){if(!r||r.base===null)return false;s.potion={family,tier,level:0,value:r.base};const key=family+'-'+tier;if(!s.discovered.includes(key))s.discovered.push(key);}else{s.potion.value=Math.min(1e300,s.potion.value+FAMILIES[family].materials[tier].value);}s.ingredients++;return true;}
 enhancementStatus(){const p=this.state.potion,r=this.recipe();if(!p)return'empty';if(p.level+1>=r.max_level)return'max';if(r.multipliers[p.level]===null||r.chances[p.level]===null)return'unknown';return'ready';}
 next(){if(this.enhancementStatus()!=='ready')return null;const s=this.state,p=s.potion,r=this.recipe();return{chance:Math.min(1,r.chances[p.level]+s.luck*(DATA.limits.luck_bonus/10)+(s.powerups.enhancement>0?.1:0)),multiplier:r.multipliers[p.level],bonus:s.powerups.enhancement>0};}
 enhance(roll=Math.random()){const n=this.next();if(!n)return null;const s=this.state;if(n.bonus)s.powerups.enhancement--;if(roll<n.chance){s.potion.value=Math.min(1e300,s.potion.value*n.multiplier);s.potion.level++;return'success';}s.failed++;if(s.powerups.protection>0){s.powerups.protection--;return'protected';}s.potion=null;return'lost';}
 sellValue(){const s=this.state;return s.potion?Math.floor(Math.min(1e300,s.potion.value*(1+s.price*.05)*(s.powerups.selling>0?2:1))):0;}
 sell(){const s=this.state;if(!s.potion)return null;const value=this.sellValue();s.coins=Math.min(1e300,s.coins+value);s.sold++;s.best=Math.max(s.best,value);if(s.powerups.selling>0)s.powerups.selling--;s.potion=null;return value;}
 upgradeInfo(key){const s=this.state;if(/^tier[0-2]$/.test(key)){const i=Number(key.slice(4)),level=s.tiers[i];return{level,max:24,cost:Math.round(60*3**level),displayLevel:level+1,displayMax:25};}const limits={luck:10,price:4,speed:19};if(!(key in limits))return null;const level=s[key];return{level,max:limits[key],cost:Math.round(({luck:80,price:90,speed:70}[key])*2**level),displayLevel:key==='speed'?level+1:level,displayMax:key==='speed'?20:limits[key]};}
 buy(key){const s=this.state,u=this.upgradeInfo(key);if(!u||u.level>=u.max||s.coins<u.cost)return false;s.coins-=u.cost;if(key.startsWith('tier')){const i=Number(key.slice(4));s.tiers[i]++;s.selected[i]=s.tiers[i];}else s[key]++;return true;}
 questRequirement(index){const t=TRAVELERS[index];if(!t)return null;let tier=this.state.tiers[t.family];while(tier>0&&FAMILIES[t.family].recipes[tier].base===null)tier--;return{family:t.family,tier,level:1};}
 canDeliver(index){const p=this.state.potion,q=this.questRequirement(index),t=this.state.travelers[index];return !!(q&&p&&!t.readyAt&&p.family===q.family&&p.tier===q.tier&&p.level>=q.level);}
 deliver(index,now=Date.now()){if(!this.canDeliver(index))return false;this.state.potion=null;this.state.travelers[index].readyAt=now+DATA.quest_reward_delay_ms;return true;}
 settle(now=Date.now()){const rewards=[];this.state.travelers.forEach((state,i)=>{if(state.readyAt&&state.readyAt<=now){const t=TRAVELERS[i];this.state.powerups[t.powerup]+=t.reward;state.readyAt=0;state.quests++;rewards.push(t);}});return rewards;}
}
if(typeof module!=='undefined')module.exports={PotionGame,FAMILIES,TRAVELERS,INITIAL,sanitizeSave,DATA};
