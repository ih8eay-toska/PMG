const EventRush=(()=>{
 const dialogue=typeof EVENT_RUSH_DIALOGUE_DATA!=='undefined'?EVENT_RUSH_DIALOGUE_DATA:require('../data/event-rush-dialogue.json');
 const rules={id:'night-order',name:'The Shop That Would Not Sleep',activeMs:900000,packingMs:60000,supplyMs:5000,boostEvery:5,costumeEvery:50,grades:{S:150,A:100,B:50,C:1},featured:['Pajamas_Costume.png','Pajamas_Costume_Pink.png','Pajamas_Costume_Blue.png','Pajamas_Costume_Green.png','cute-pajamas-costume-purple.png','cute-pajamas-costume-skyblue.png']};
 const fresh=()=>({phase:'locked',run:0,line:0,dialogueRevision:1,storyMilestones:{unlocked:[],seen:[]},startedAt:0,endsAt:0,packingEndsAt:0,breakEndsAt:0,nextSupplyAt:0,pouch:0,eventPotion:false,collected:0,delivered:0,rewardProgress:0,pending:[],vouchers:0,rubyRewardsPending:0,boostRewardsPending:{protection:0,enhancement:0,selling:0},best:0,previous:null,endingSeen:true,boostsEarned:0,choicesEarned:0});
 const num=(n,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=0&&n<=max;
 const boostKeys=['protection','enhancement','selling'];
 const readBoosts=value=>{if(value===undefined)return{protection:0,enhancement:0,selling:0};if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==3||boostKeys.some(k=>!num(value[k])))throw Error('Invalid event grade boosts.');return Object.fromEntries(boostKeys.map(k=>[k,value[k]]));};
 const grade=n=>n===0?'No deliveries':Object.entries(rules.grades).find(([,min])=>n>=min)?.[0]||'C';
 function validate(raw,state){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid event rush.');
  const r=fresh();for(const k of Object.keys(r))if(k!=='pending'&&k!=='previous'&&k!=='boostRewardsPending'&&k!=='storyMilestones'&&k!=='dialogueRevision'&&!(k==='rubyRewardsPending'&&raw[k]===undefined))r[k]=raw[k];
  if(raw.dialogueRevision!==undefined&&raw.dialogueRevision!==1)throw Error('Unsupported event dialogue revision.');
  if(raw.dialogueRevision===undefined){if(!num(r.line,1))throw Error('Invalid legacy opening line.');if(r.phase==='opening')r.line=0;}
  r.boostRewardsPending=readBoosts(raw.boostRewardsPending);
  if(raw.storyMilestones!==undefined){const m=raw.storyMilestones,ids=['milestone-b','milestone-a'];if(!m||!Array.isArray(m.unlocked)||!Array.isArray(m.seen)||m.unlocked.length>2||m.seen.length>2||new Set(m.unlocked).size!==m.unlocked.length||new Set(m.seen).size!==m.seen.length||m.unlocked.some(id=>!ids.includes(id))||m.seen.some(id=>!m.unlocked.includes(id)))throw Error('Invalid event story memories.');r.storyMilestones={unlocked:[...m.unlocked],seen:[...m.seen]};}

  if(!['locked','opening','gathering','packing','break'].includes(r.phase)||!num(r.line,dialogue.scenes.opening.lines.length-1)||typeof r.eventPotion!=='boolean'||typeof r.endingSeen!=='boolean')throw Error('Invalid event phase.');
  for(const k of ['run','pouch','collected','delivered','vouchers','rubyRewardsPending','best','boostsEarned','choicesEarned'])if(!num(r[k]))throw Error('Invalid event counters.');
  for(const k of ['startedAt','endsAt','packingEndsAt','breakEndsAt','nextSupplyAt'])if(!num(r[k],8640000000000000))throw Error('Invalid event deadline.');
  if(!num(r.rewardProgress,49)||r.delivered+r.pouch+Number(r.eventPotion)>r.collected||r.boostsEarned!==Math.floor(r.delivered/5)||r.choicesEarned>Math.ceil(r.delivered/50))throw Error('Invalid event progress.');
  if(['gathering','packing'].includes(r.phase)){if(!r.run||!r.startedAt||r.endsAt!==r.startedAt+rules.activeMs||r.packingEndsAt!==r.endsAt+rules.packingMs||!state.tiaUnlocked||!state.tiaIntroSeen)throw Error('Invalid active event.');}
  else if(r.pouch||r.eventPotion)throw Error('Inactive event supplies.');
  if(r.eventPotion&&state.potion)throw Error('Two cauldron contents.');
  if(!Array.isArray(raw.pending)||raw.pending.length>1||raw.pending.some(p=>!p||p.eventId!==rules.id||!num(p.count)||!p.count))throw Error('Invalid pending costume choices.');r.pending=raw.pending.map(p=>({eventId:p.eventId,count:p.count}));
  if(raw.previous!==null){const p=raw.previous;if(!p||p.eventId!==rules.id||!num(p.run)||!p.run||!num(p.delivered)||!num(p.collected)||!num(p.unused)||!num(p.undelivered,1)||p.delivered+p.unused+p.undelivered!==p.collected||!num(p.finishedAt,8640000000000000)||p.grade!==grade(p.delivered)||p.boostsEarned!==Math.floor(p.delivered/5)||!num(p.choicesEarned,Math.ceil(p.delivered/50)))throw Error('Invalid previous event result.');if(p.rubyReward!==undefined&&!num(p.rubyReward))throw Error('Invalid event ruby reward.');r.previous={gradeBoostReward:readBoosts(p.gradeBoostReward),rubyReward:p.rubyReward??0,eventId:p.eventId,run:p.run,delivered:p.delivered,collected:p.collected,unused:p.unused,undelivered:p.undelivered,finishedAt:p.finishedAt,grade:p.grade,boostsEarned:p.boostsEarned,choicesEarned:p.choicesEarned};}
  return r;
 }
 function install(PotionGame,{ECONOMY,COSTUMES,EVENTS}){
  Object.assign(PotionGame.prototype,{
   rushGradeRewards(delivered){const reward={rubies:0,boosts:{protection:0,enhancement:0,selling:0}};for(const[g,min]of Object.entries(rules.grades)){if(delivered<min)continue;reward.rubies+=ECONOMY.events.gradeRubyRewards[g]||0;for(const key of boostKeys)reward.boosts[key]+=ECONOMY.events.gradeBoostRewards[g]?.[key]||0;}return reward;},
   settleRush(now=Date.now()){
    const r=this.state.eventRush;
    if(r.phase==='locked'&&this.state.tiaUnlocked&&this.state.tiaIntroSeen)r.phase='opening';
    const emptyAtDeadline=r.phase==='gathering'&&now>=r.endsAt&&!r.pouch&&!r.eventPotion;
    if(r.phase==='gathering'&&now>=r.endsAt)r.phase='packing';
    if(r.phase==='packing'&&(now>=r.packingEndsAt||(!r.pouch&&!r.eventPotion))){const finishedAt=emptyAtDeadline?r.endsAt:Math.min(now,r.packingEndsAt),rewards=this.rushGradeRewards(r.delivered),rubyReward=rewards.rubies;r.rubyRewardsPending+=rubyReward;for(const key of boostKeys)r.boostRewardsPending[key]+=rewards.boosts[key];r.previous={gradeBoostReward:rewards.boosts,rubyReward,eventId:rules.id,run:r.run,collected:r.collected,delivered:r.delivered,unused:r.pouch,undelivered:Number(r.eventPotion),finishedAt,grade:grade(r.delivered),boostsEarned:r.boostsEarned,choicesEarned:r.choicesEarned};r.best=Math.max(r.best,r.delivered);r.pouch=0;r.eventPotion=false;r.phase='break';r.breakEndsAt=finishedAt+ECONOMY.events.breakMs;r.endingSeen=false;this.rushTokens=new Set();}
    for(const grade of ['B','A']){const id='milestone-'+grade.toLowerCase();if(r.delivered>=rules.grades[grade]&&!r.storyMilestones.unlocked.includes(id))r.storyMilestones.unlocked.push(id);}
    if(r.phase==='break'&&now>=r.breakEndsAt){r.phase='opening';r.line=0;}
    if(r.rubyRewardsPending&&this.state.rubies<=Number.MAX_SAFE_INTEGER-r.rubyRewardsPending){this.state.rubies+=r.rubyRewardsPending;r.rubyRewardsPending=0;}
    for(const key of boostKeys){const amount=Math.min(r.boostRewardsPending[key],1e9-this.state.powerups[key]);if(amount>0){this.state.powerups[key]+=amount;r.boostRewardsPending[key]-=amount;}}
    return r;
   },
   startRush(now=Date.now()){
    const r=this.settleRush(now);if(r.phase!=='opening'||!this.state.tiaUnlocked||!this.state.tiaIntroSeen||r.run===Number.MAX_SAFE_INTEGER)return false;
    Object.assign(r,{phase:'gathering',run:r.run+1,line:0,startedAt:now,endsAt:now+rules.activeMs,packingEndsAt:now+rules.activeMs+rules.packingMs,breakEndsAt:0,nextSupplyAt:now,pouch:0,eventPotion:false,collected:0,delivered:0,boostsEarned:0,choicesEarned:0,endingSeen:true});this.rushTokens=new Set();return true;
   },
   mintRushSupply(now=Date.now()){const r=this.settleRush(now);if(r.phase!=='gathering'||now<r.nextSupplyAt)return null;r.nextSupplyAt=now+rules.supplyMs;const token=r.run+':'+r.nextSupplyAt;this.rushTokens??=new Set();this.rushTokens.add(token);return token;},
   collectRushSupply(token,now=Date.now()){const r=this.settleRush(now);if(r.phase!=='gathering'||!this.rushTokens?.has(token)||r.collected>=Number.MAX_SAFE_INTEGER)return false;this.rushTokens.delete(token);r.pouch++;r.collected++;return true;},
   rushBrewReason(now=Date.now(),settle=true){const r=settle?this.settleRush(now):this.state.eventRush;return !['gathering','packing'].includes(r.phase)?'Event brewing is closed.':this.enhancementPending?'Wait for enhancement to finish.':this.state.potion||r.eventPotion?'Finish your current brew first.':!r.pouch?'Catch supplies on the conveyor.':(r.delivered+1)%5===0&&Object.entries(ECONOMY.events.boostBundle).some(([k,n])=>this.state.powerups[k]>1e9-n)?'Use boost charges before brewing; boost storage is full.':'';},
   brewRush(now=Date.now()){if(this.rushBrewReason(now))return false;const r=this.state.eventRush;r.pouch--;r.eventPotion=true;return true;},
   deliverRush(now=Date.now()){
    const r=this.settleRush(now);if(!r.eventPotion||!['gathering','packing'].includes(r.phase)||r.delivered>=Number.MAX_SAFE_INTEGER)return false;
    const boost=(r.delivered+1)%rules.boostEvery===0,choice=r.rewardProgress+1===rules.costumeEvery;
    if(boost&&Object.entries(ECONOMY.events.boostBundle).some(([k,n])=>this.state.powerups[k]>1e9-n)||choice&&(r.pending[0]?.count||0)>=Number.MAX_SAFE_INTEGER)return false;
    r.eventPotion=false;r.delivered++;r.rewardProgress++;if(boost){for(const[k,n]of Object.entries(ECONOMY.events.boostBundle))this.state.powerups[k]+=n;r.boostsEarned++;}if(choice){r.rewardProgress=0;if(!r.pending.length)r.pending.push({eventId:rules.id,count:0});r.pending[0].count++;r.choicesEarned++;}this.settleRush(now);return true;
   },
   claimRushChoice(eventId,reward){const r=this.state.eventRush,p=r.pending.find(p=>p.eventId===eventId&&p.count>0);if(!p)return false;if(reward==='voucher'){if(r.vouchers>=Number.MAX_SAFE_INTEGER)return false;r.vouchers++;}else{const c=COSTUMES.entries.find(c=>c.id===reward);if(!this.voucherEligible(reward)||this.state.costumes.includes(reward)||c.character==='Tia'&&!this.state.tiaUnlocked)return false;this.state.costumes.push(reward);}if(!--p.count)r.pending=r.pending.filter(x=>x!==p);return true;},
   voucherEligible(id){const c=COSTUMES.entries.find(c=>c.id===id);return !!(c?.live2d&&!c.fanMade&&!c.free&&id!==COSTUMES.default&&id!=='Tia.png'&&rules.featured.includes(id));},
   redeemCostumeVoucher(id){const r=this.state.eventRush,c=COSTUMES.entries.find(c=>c.id===id);if(!r.vouchers||!this.voucherEligible(id)||this.state.costumes.includes(id)||c.character==='Tia'&&!this.state.tiaUnlocked)return false;r.vouchers--;this.state.costumes.push(id);return true;}
  });
 }
 return{rules,dialogue,fresh,validate,install,grade};
})();
if(typeof module!=='undefined')module.exports=EventRush;
