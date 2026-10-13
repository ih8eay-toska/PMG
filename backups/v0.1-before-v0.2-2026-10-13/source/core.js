const FAMILIES = [
 {id:'Life',label:'Life',color:'#f18e9b',materials:['Red herb','Sturdy mushroom','Fruit of power'],potions:['Sample Red Potion','Baby HP Potion','Raspberry Potion'],multipliers:[[1.03,1.1],[1.22,1.35,1.5,1.67],[1.34,1.65,2.04,2.9]],chances:[[.9,.85],[.9,.85,.8,.75],[.9,.8,.7,.55]]},
 {id:'Mana',label:'Mana',color:'#8bbce8',materials:['Blue herb','Clever mushroom','Fruit of wisdom'],potions:['Sample Blue Potion','Infant MP Potion','Blueberry Potion'],multipliers:[[1.2,1.3],[1.25,1.43,1.67,2],[1.38,1.57,1.83,2.2]],chances:[[.8,.7],[.8,.7,.6,.5],[.8,.7,.6,.5]]},
 {id:'Stamina',label:'Stamina',color:'#e5c767',materials:['Yellow herb','Lively mushroom','Fruit of spirit'],potions:['Sample Yellow Potion','Infant SP Potion','Orange Potion'],multipliers:[[1.2,1.2],[1.25,1.25],[1.3,1.3]],chances:[[.75,.75],[.75,.75],[.75,.75]]}
];
const INITIAL = () => ({version:1,coins:0,tiers:[0,0,0],luck:0,price:0,speed:0,potion:null,sold:0,failed:0,best:0,ingredients:0});
function sanitizeSave(data) {
 if (!data || data.version !== 1) throw Error('This save is not compatible.');
 const s=INITIAL();
 const integer=(x,max)=>Number.isSafeInteger(x)&&x>=0&&x<=max;
 for(const k of ['coins','sold','failed','best','ingredients']) { if(!integer(data[k],1e12))throw Error('Invalid save values.');s[k]=data[k]; }
 if(!Array.isArray(data.tiers)||data.tiers.length!==3||data.tiers.some(x=>!integer(x,2)))throw Error('Invalid ingredient upgrades.');
 s.tiers=[...data.tiers];
 for(const k of ['luck','price','speed']){if(!integer(data[k],3))throw Error('Invalid upgrades.');s[k]=data[k];}
 if(data.potion!==null){const p=data.potion;if(!p||!integer(p.family,2)||!integer(p.tier,2)||p.tier>s.tiers[p.family]||!integer(p.level,FAMILIES[p.family].multipliers[p.tier].length)||!Number.isFinite(p.value)||p.value<0||p.value>1e12)throw Error('Invalid potion.');s.potion={family:p.family,tier:p.tier,level:p.level,value:p.value};}
 return s;
}
class PotionGame {
 constructor(state=INITIAL()){this.state=state;}
 collect(family,tier){const s=this.state;if(!Number.isInteger(family)||family<0||family>2||!Number.isInteger(tier)||tier<0||tier>s.tiers[family])return false;if(!s.potion)s.potion={family,tier,level:0,value:[10,20,30][tier]};else s.potion.value=Math.min(1e12,s.potion.value+[1,2,4][tier]);s.ingredients++;return true;}
 next(){const s=this.state,p=s.potion;if(!p)return null;const f=FAMILIES[p.family];if(p.level>=f.multipliers[p.tier].length)return null;return {chance:Math.min(.99,f.chances[p.tier][p.level]+s.luck*.02),multiplier:f.multipliers[p.tier][p.level]};}
 enhance(roll=Math.random()){const n=this.next();if(!n)return null;if(roll<n.chance){this.state.potion.value=Math.min(1e12,this.state.potion.value*n.multiplier);this.state.potion.level++;return true;}this.state.potion=null;this.state.failed++;return false;}
 sellValue(){const s=this.state;return s.potion?Math.floor(s.potion.value*(1+s.price*.05)):0;}
 sell(){const s=this.state;if(!s.potion)return null;const value=this.sellValue();s.coins=Math.min(1e12,s.coins+value);s.sold++;s.best=Math.max(s.best,value);s.potion=null;return value;}
 upgradeInfo(key){const s=this.state;if(key.startsWith('tier')){const i=Number(key.slice(4));if(!Number.isInteger(i)||i<0||i>2)return null;return {level:s.tiers[i],max:2,cost:[60,180][s.tiers[i]]??0};}if(!['luck','price','speed'].includes(key))return null;return {level:s[key],max:3,cost:({luck:80,price:90,speed:70}[key])*2**s[key]};}
 buy(key){const u=this.upgradeInfo(key),s=this.state;if(!u||u.level>=u.max||s.coins<u.cost)return false;s.coins-=u.cost;if(key.startsWith('tier'))s.tiers[Number(key.slice(4))]++;else s[key]++;return true;}
}
if(typeof module!=='undefined')module.exports={PotionGame,FAMILIES,INITIAL,sanitizeSave};
