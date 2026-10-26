function rewardChip(kind,amount,name=''){const chip=document.createElement('span'),image=document.createElement('img'),count=document.createElement('span'),labels={protection:'failure protection charges',enhancement:'enhancement bonus charges',selling:'double-sale charges',tickets:'Pushcat tickets',rubies:'rubies',coins:'gold',likeability:'likeability',stamps:'expedition stamps',vouchers:'Costume Vouchers',fairy:name||'random fairy'},images={protection:'EnhancementFailureProtection.png',enhancement:'EnhancementBonus.png',selling:'SellBonus.png',tickets:'Nyan-Ticket.png',rubies:'Gem.png',coins:'Coin.png',likeability:'Likeability.png',stamps:'ExpeditionStamp.svg',vouchers:'CostumeVoucher.png',fairy:FAIRIES.find(f=>f.name===name)?.image||FAIRIES[0].image};chip.className='reward-chip';chip.setAttribute('role','img');chip.title=amount+' '+labels[kind];chip.setAttribute('aria-label',chip.title);image.src=art(images[kind]);image.alt='';image.setAttribute('aria-hidden','true');count.textContent=String(amount);chip.append(count,image);return chip;}
function renderRewardChips(node,items,prefix=''){node.replaceChildren();if(prefix)node.append(document.createTextNode(prefix));for(const item of items)node.append(rewardChip(item.kind,item.amount,item.name||''));}
const $=id=>document.getElementById(id),KEY='pmg-offline-v1',CAULDRON_LIQUID_COLORS=['#d52b3d','#286fc4','#d5a91d'];

const SETTINGS_KEY='pmg-settings-v1',gameSettings={musicVolume:.25,effectsVolume:0,musicEnabled:true,character:true,lightMode:false,confirmSell:false,shortcuts:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,idleDialogue:true,dialogueDuration:1,textSize:'normal'};
try{const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}');for(const key of Object.keys(gameSettings)){const value=saved?.[key];if(typeof gameSettings[key]==='boolean'&&typeof value==='boolean')gameSettings[key]=value;else if(['musicVolume','effectsVolume'].includes(key)&&Number.isFinite(value)&&value>=0&&value<=1)gameSettings[key]=value;else if(key==='dialogueDuration'&&[.75,1,1.5,2].includes(value))gameSettings[key]=value;else if(key==='textSize'&&['normal','large'].includes(value))gameSettings[key]=value;}if(saved&&Object.hasOwn(saved,'conveyorSpeed')){delete saved.conveyorSpeed;localStorage.setItem(SETTINGS_KEY,JSON.stringify(saved));}}catch{}
let game=new PotionGame(),saveOK=true,saveBlocked=false,catalogFamily=0,achievementFamily=-1,requestTraveler=0,requestChoice=0;
const THEME_KEY='pmg-theme-v1';function applyTheme(theme){document.documentElement.dataset.theme=theme;const button=$('theme-toggle');button.setAttribute('aria-checked',String(theme==='dark'));button.setAttribute('aria-label','Dark Mode');}let initialTheme='light';try{if(localStorage.getItem(THEME_KEY)==='dark')initialTheme='dark';}catch{}applyTheme(initialTheme);$('theme-toggle').onclick=()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(theme);try{localStorage.setItem(THEME_KEY,theme);}catch{}};
function art(key){if(ASSETS[key])return ASSETS[key];if(!art.aliases){art.aliases=new Map();for(const name of Object.keys(ASSETS)){const alias=name.toLowerCase().replace(/[_ -]/g,'');if(!art.aliases.has(alias))art.aliases.set(alias,ASSETS[name]);}}return art.aliases.get(key.toLowerCase().replace(/[_ -]/g,''))||'';}
const originalSfxPlayers=new Map();
function playOriginalSfx(name,scale=.3,cooldownMs=0){if(document.hidden||!gameSettings.effectsVolume)return;const now=performance.now(),player=originalSfxPlayers.get(name);if(player&&now-player.lastAt<cooldownMs)return;let entry=player;if(!entry){const audio=new Audio(art(name));audio.preload='auto';entry={audio,lastAt:-Infinity,scale};originalSfxPlayers.set(name,entry);}entry.lastAt=now;entry.scale=scale;try{entry.audio.pause();entry.audio.currentTime=0;entry.audio.volume=gameSettings.effectsVolume*scale;void entry.audio.play().catch(()=>{});}catch{}}
function stopOriginalSfx(){for(const{audio}of originalSfxPlayers.values()){audio.pause();try{audio.currentTime=0;}catch{}}}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopOriginalSfx();});
const stored=loadStoredGame(localStorage,KEY);game=stored.game;saveBlocked=stored.blocked;saveOK=!stored.warning;$('save-status').textContent=stored.warning||'Saved on this device';


let saveTimer=null,saveDirty=false;
const CURRENCY_UNITS=ECONOMY.currencyUnits,CURRENCY_NAMES={coins:'gold',tickets:'Pushcat tickets',rubies:'rubies'};
function fmt(x){if(!Number.isFinite(x))return String(x);const sign=x<0?'-':'',n=Math.abs(x);if(n<1e6)return Math.floor(x).toLocaleString('en-US');const units=['K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','Ud','Dd','Td','Qad','Qid','Sxd','Spd','Ocd','Nod','Vg','Uvg','Dvg','Tvg','Qavg','Qivg','Sxvg','Spvg','Ocvg','Novg','Tg'];let group=Math.floor(Math.log10(n)/3),index=group-1;if(index>=units.length)return x.toExponential(3);let scaled=n/10**(group*3);const digits=scaled<100?2:scaled<1000?1:0;let rounded=Number(scaled.toFixed(digits));if(rounded>=1000&&index+1<units.length){rounded/=1000;index++;}return`${sign}${rounded} ${units[index]}`;}
$('pushcat-summon-icon').src=art('OriginalPushcatSummon.png');$('coin-icon').src=art('Coin.png');$('sale-price-icon').src=art('Coin.png');$('ticket-icon').src=art('Nyan-Ticket.png');$('ruby-icon').src=art('Gem.png');$('protection-icon').src=art(DATA.powerups.protection.image);$('enhancement-icon').src=art(DATA.powerups.enhancement.image);$('selling-icon').src=art(DATA.powerups.selling.image);$('sell-button-glow').src=art('OriginalBigButtonGlow.png');for(const cap of document.querySelectorAll('.apk-gauge-cap'))cap.src=art('Original-gauge-frame.png');$('enhancement-progress').style.backgroundImage=`url("${art('Original-gauge-background.png')}")`;$('enhancement-progress').querySelector('.apk-enhance-fill').style.backgroundImage=`url("${art('Original-gauge-fill.png')}")`;
function setText(el,value){value=String(value);if(el.textContent!==value)el.textContent=value;}
function renderSpeakerLine(portrait,speaker,line,entry){const src=art(entry.portrait);if(portrait.src!==src)portrait.src=src;portrait.alt=entry.speaker==='?'?'Unknown speaker':entry.speaker;setText(speaker,entry.speaker);setText(line,entry.text);}
function renderNumberArt(el,text){if(el.dataset.numberArt===text)return;el.dataset.numberArt=text;el.replaceChildren();for(const ch of text){const key=/[0-9]/.test(ch)?'PrettyDigit'+ch+'.png':ch==='.'?'PrettyPeriod.png':ch==='%'?'PrettyPercent.png':null;const glyph=document.createElement(key?'img':'span');glyph.setAttribute('aria-hidden','true');glyph.className=ch==='.'?'number-period':ch===','?'number-comma':'number-digit';if(key){glyph.src=art(key);glyph.alt='';}else glyph.textContent=ch;el.append(glyph);}const spoken=document.createElement('span');spoken.className='sr-only';spoken.textContent=text;el.append(spoken);}
function renderEnhanceMultiplier(value){const el=$('enhance-multiplier');if(value==null||!Number.isFinite(value)){el.hidden=true;el.replaceChildren();delete el.dataset.multiplier;delete el.dataset.numberArt;return;}const text=Number(value.toFixed(2)).toString();if(el.dataset.multiplier===text){el.hidden=false;return;}el.dataset.multiplier=text;el.replaceChildren();const amount=document.createElement('span');amount.className='mult-number';amount.textContent=text;el.append(amount);const times=document.createElement('span');times.className='mult-times';times.textContent=' times';el.append(times);el.hidden=false;}

function flushSave(){clearTimeout(saveTimer);saveTimer=null;if(saveBlocked||!saveDirty)return;try{writeStoredGame(localStorage,KEY,game.state);saveDirty=false;saveOK=true;setText($('save-status'),'Saved on this device');}catch{saveOK=false;setText($('save-status'),'Export a backup to keep progress');}}
function save(immediate=false){if(saveBlocked){setText($('save-status'),stored.warning||'Saving blocked · export a backup');return;}saveDirty=true;if(immediate){flushSave();return;}if(saveTimer===null){setText($('save-status'),'Saving…');saveTimer=setTimeout(flushSave,5000);}}
async function transformBytes(bytes,Transform,format,limit){const reader=new Blob([bytes]).stream().pipeThrough(new Transform(format)).getReader(),chunks=[];let length=0;while(true){const{done,value}=await reader.read();if(done)break;length+=value.length;if(length>limit){await reader.cancel();throw Error('Save code is too large.');}chunks.push(value);}const output=new Uint8Array(length);let offset=0;for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.length;}return output;}
function encodeBase64(bytes){let binary='';for(let start=0;start<bytes.length;start+=0x8000)binary+=String.fromCharCode(...bytes.subarray(start,start+0x8000));return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function makeSaveCode(value){if(typeof CompressionStream!=='function')throw Error('Compressed save codes need a recent browser.');const bytes=new TextEncoder().encode(typeof value==='string'?value:JSON.stringify(value));if(bytes.length>100000)throw Error('Save is too large to export.');return'PMG2-'+encodeBase64(await transformBytes(bytes,CompressionStream,'gzip',100000));}
async function readSaveCode(value){const code=value.replace(/\s/g,'');if(code.length>140000||!['PMG1-','PMG2-'].includes(code.slice(0,5)))throw Error('That does not look like a Potion Maker save code.');let binary;try{let encoded=code.slice(5).replace(/-/g,'+').replace(/_/g,'/');encoded+='='.repeat((4-encoded.length%4)%4);binary=atob(encoded);}catch{throw Error('The save code is incomplete or damaged.');}if(binary.length>100000)throw Error('Save code is too large.');let bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));if(code.startsWith('PMG2-')){if(typeof DecompressionStream!=='function')throw Error('Compressed save codes need a recent browser.');bytes=await transformBytes(bytes,DecompressionStream,'gzip',100000);}return sanitizeSave(JSON.parse(new TextDecoder().decode(bytes)));}

function notice(text,type='',name='',color=''){const el=$('notice');el.textContent=text;el.className='notice '+type;if(name&&text.startsWith(name)){const label=document.createElement('span');label.textContent=name;label.style.color=color;label.style.fontWeight='600';el.replaceChildren(label,text.slice(name.length));}}
function showFailureSmoke(){showCauldronTexture('failed',1050);}
function showSuccessRipple(){showCauldronTexture('enhanced',750);}
function showCauldronTexture(kind,duration){
 const host=document.querySelector(kind==='enhancing'?'#enhancement-progress':kind==='enhanced'||kind==='failed'?'.potion-heading':'.cauldron');if(!host)return;
 // APK ParticleSystem UV modules: 5×5 gathering sparks, 5×3 success flash, 4×4 smoke.
 const sheets={enhancing:['OriginalEnhancing.png',5,5,1,Math.min(150,Math.ceil(duration/20))],enhanced:['OriginalEnhanced.png',5,3,1.2,5],failed:['OriginalEnhanceFailed.png',4,4,1,36],plop:['OriginalPlop.png',4,1,.5,1]},sheet=sheets[kind];if(!sheet)return;
 const active=host.querySelectorAll('.texture-fx-'+kind);if(kind==='plop'&&active.length>=3)return;if(kind!=='plop')active.forEach(node=>node.remove());
 const [image,columns,rows,aspect,count]=sheet,layer=document.createElement('span');layer.className='cauldron-effect texture-fx-'+kind;layer.setAttribute('aria-hidden','true');host.append(layer);
 for(let i=0;i<(gameSettings.reducedMotion?1:count);i++){
  const node=document.createElement('span');node.className='cauldron-texture';node.style.backgroundImage=`url("${art(image)}")`;node.style.backgroundSize=`${columns*100}% ${rows*100}%`;node.style.aspectRatio=String(aspect);layer.append(node);
  const spread=kind==='failed'?((i*37)%100-50):kind==='enhanced'?(i-2)*4:0;node.style.left=(kind==='enhancing'?i/count*100:50+spread*.35)+'%';node.style.top=(kind==='enhancing'?50:45)+'%';if(kind==='enhancing'||kind==='enhanced'){node.style.maskImage=node.style.backgroundImage;node.style.maskSize=node.style.backgroundSize;node.style.backgroundImage='none';node.style.backgroundColor=kind==='enhanced'?'#ffe770':i%2?'#ff4bf3':'#78abff';}
  if(gameSettings.reducedMotion){const frame=kind==='failed'?6:kind==='enhancing'?12:3;node.style.backgroundPosition=`${frame%columns*100/(columns-1)}% ${rows===1?0:Math.floor(frame/columns)*100/(rows-1)}%`;node.style.maskPosition=node.style.backgroundPosition;node.style.opacity='.55';continue;}
  // Step between sprite frames; stepping the whole animation holds its transparent first frame.
  const frames=Array.from({length:columns*rows},(_,frame)=>{const t=frame/(columns*rows-1),rise=kind==='failed'?-55*t:kind==='enhancing'?-24*(1-t):0,drift=kind==='failed'?spread*t*.6:0,scale=kind==='enhanced'?.75+.3*t:kind==='failed'?.65+.65*t:1;return {maskPosition:`${frame%columns*100/(columns-1)}% ${rows===1?0:Math.floor(frame/columns)*100/(rows-1)}%`,backgroundPosition:`${frame%columns*100/(columns-1)}% ${rows===1?0:Math.floor(frame/columns)*100/(rows-1)}%`,transform:`translate(-50%,-50%) translate(${drift}px,${rise}px) scale(${scale})`,opacity:t<.12?t/.12:t>.7?(1-t)/.3:1,offset:t,easing:'steps(1,end)'};});
  node.animate(frames,{duration:kind==='failed'?710:kind==='enhancing'?Math.min(1000,duration):duration,delay:kind==='enhancing'?i*20:0,easing:'linear',fill:'both'});
 }
 setTimeout(()=>layer.remove(),duration+(kind==='enhancing'&&!gameSettings.reducedMotion?1000:0));
}
const INGREDIENT_FLIGHT_MS=480,INGREDIENT_PLOP_MAX=3;
let plopLoad=null,plopVoices=0;
function loadIngredientPlop(){
 if(plopLoad)return plopLoad;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return plopLoad=Promise.resolve(null);
  effectAudio??=new Audio();
  const data=art('Plop.wav'),comma=data.indexOf(',');if(comma<0)return plopLoad=Promise.resolve(null);
  const binary=atob(data.slice(comma+1)),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return plopLoad=effectAudio.decodeAudioData(bytes.buffer).catch(()=>null);
 }catch{return plopLoad=Promise.resolve(null);}
}
function playIngredientPlop(delay=0){
 if(document.hidden||!gameSettings.effectsVolume)return;
 void loadIngredientPlop();
 setTimeout(()=>{
  if(document.hidden||!gameSettings.effectsVolume||plopVoices>=INGREDIENT_PLOP_MAX)return;
  void loadIngredientPlop().then(buffer=>{
   if(!buffer||document.hidden||!gameSettings.effectsVolume||plopVoices>=INGREDIENT_PLOP_MAX)return;
   try{
    if(effectAudio.state==='suspended')void effectAudio.resume().catch(()=>{});
    const now=effectAudio.currentTime+.004,level=gameSettings.effectsVolume/Math.sqrt(plopVoices+1);
    const source=effectAudio.createBufferSource(),gain=effectAudio.createGain();
    source.buffer=buffer;gain.gain.setValueAtTime(level,now);source.connect(gain);gain.connect(effectAudio.destination);
    source.onended=()=>{plopVoices=Math.max(0,plopVoices-1);source.disconnect();gain.disconnect();};
    source.start(now);plopVoices++;
   }catch{}
  });
 },delay);
}
function flash(result){const el=$('scene');el.classList.remove('success-flash','failure-flash');void el.offsetWidth;el.classList.add(result==='success'?'success-flash':'failure-flash');}
 $('game-favicon').href=art('Game_icon.png');document.querySelector('.app-icon').src=art('App_icon.png');$('pio').src=art('Pio_Main.jpg');$('brew-character').src=art(game.state.activeCostumeId);$('brew-character').style.borderRadius='100px 100px 10px 10px';document.querySelectorAll('.costume-shop-icon,.menu-costume-icon').forEach(icon=>icon.src=art('CostumeIcon.png'));document.querySelectorAll('.achievement-icon,.achievement-nav-icon').forEach(icon=>icon.src=art('AchievementIcon.png'));
let newItemRevealTimer=0,newItemRevealFrame=0;
function queueNewItemReveal(kind,family,tier,delay=0){clearTimeout(newItemRevealTimer);cancelAnimationFrame(newItemRevealFrame);const state=game.state;newItemRevealTimer=setTimeout(()=>{newItemRevealFrame=requestAnimationFrame(()=>{if(game.state===state)showNewItemReveal(kind,family,tier);});},delay);}
function showNewItemReveal(kind,family,tier){
 const potion=kind==='potion',item=potion?FAMILIES[family].recipes[tier]:FAMILIES[family].materials[tier],dialog=$('new-item-dialog');if(!item)return;
 dialog.getAnimations({subtree:true}).forEach(a=>a.cancel());dialog.dataset.kind=kind;dialog.dataset.family=family;dialog.dataset.tier=tier;
 const image=$('new-item-icon');image.src=art(item.image);image.alt=item.name;setText($('new-item-name'),item.name);setText($('new-item-level'),potion?'Lv. '+item.max_level:'');$('new-item-level').hidden=!potion;
 const lore=FLAVOR_TEXT.entries[family+'-'+tier],description=$('new-item-description'),stats=$('new-item-stats');description.textContent=potion?lore?.description||'':'';stats.replaceChildren();
 const row=(label,value)=>{const group=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');group.className='new-item-stat';dt.textContent=label+': ';dd.textContent=value;group.append(dt,dd);stats.append(group);};
 if(potion){const record=game.state.metrics.recipes[family+'-'+tier];row('Highest Potion Level reached',(record?.highestLevel||0)+' / '+item.max_level);row('Potions made',fmt(record?.started||0));row('Potions sold',fmt(record?.sold||0));row('Times Potion Max Level was reached','Not recorded');row('Successful Enhancements',fmt(record?.enhancements||0));row('Failed Enhancements',fmt(record?.failures||0));if(lore?.original_bottle_note){const note=document.createElement('p');note.className='new-item-original-note';note.textContent=lore.original_bottle_note;stats.append(note);}}
 else{row('Found','Not recorded');row('Self added materials','Not recorded');row('Pushcat added materials','Not recorded');row('Added value','+'+materialValue(item.value));row('Starting Potion',FAMILIES[family].recipes[tier].name);}
 if(!dialog.open)dialog.showModal();playOriginalSfx('Congratulation.wav',.22);
 if(gameSettings.reducedMotion)return;
 const stage=dialog.querySelector('.new-item-stage'),banner=dialog.querySelector('.new-item-banner'),sun=dialog.querySelector('.new-item-sunlight'),rays=dialog.querySelector('.new-item-rays'),frames=Array.from({length:31},(_,i)=>i/30);
 stage.animate(frames.map(t=>({opacity:Math.max(0,-.3+1.3*t),transform:`translate(-50%,-50%) scale(${.7+.3*(1-(1-t)**3)})`,offset:t})),{duration:300,easing:'linear'});
 banner.animate(frames.map(t=>({transform:`scale(${.5-.5*Math.cos(Math.PI*t)})`,offset:t})),{delay:100,duration:300,fill:'backwards',easing:'linear'});
 const entrance=rays.animate(frames.map(t=>({transform:`scale(${2*(1+(t-1)**2*(4*(t-1)+3))})`,offset:t})),{delay:100,duration:300,fill:'backwards',easing:'linear'});
 sun.animate([{transform:'rotate(0deg)'},{transform:'rotate(360deg)'}],{duration:4800,iterations:Infinity,easing:'linear'});
 entrance.finished.then(()=>{if(!dialog.open||gameSettings.reducedMotion)return;rays.animate(Array.from({length:101},(_,i)=>{const seconds=i/20,scale=seconds<=.5?2+.5*(seconds*2)**2:seconds<=1?2.5-.5*(1-(2-2*seconds)**2):2;return{transform:`scale(${scale})`,offset:i/100};}),{duration:5000,iterations:Infinity,easing:'linear'});}).catch(()=>{});
}
function jingleNewItem(){if(gameSettings.reducedMotion)return;const icon=$('new-item-icon'),keys=[[0,.0020449897,3.9918201,3.9918201],[.25,1,.9125767,.9125767],[.85,-.3,-.08333355,-.08333355],[1,0,2,2]];icon.getAnimations().forEach(a=>a.cancel());icon.animate(Array.from({length:41},(_,i)=>{const t=i/40,j=keys.findIndex((k,index)=>index<keys.length-1&&t<=keys[index+1][0]),a=keys[Math.max(0,j)],b=keys[Math.max(0,j)+1],d=b[0]-a[0],u=(t-a[0])/d,v=(2*u**3-3*u**2+1)*a[1]+(u**3-2*u**2+u)*d*a[3]+(-2*u**3+3*u**2)*b[1]+(u**3-u**2)*d*b[2];return{transform:`rotate(${10*v}deg)`,offset:t};}),{duration:200,easing:'linear'});}

const upgradeRows=[['tier0','Life Potion Materials'],['tier1','Mana Potion Materials'],['tier2','Stamina Potion Materials'],['speed','Material Emission'],['luck','Enhancement Success Rate'],['price','Selling Price'],['pushcat','Pushcat Speed']];
const upgradeNodes=new Map();
function renderUpgrades(){const s=game.state,key=JSON.stringify([s.coins,s.tiers,s.luck,s.price,s.speed,s.pushcat,s.activeFairyId,s.fairies,s.masteryStars,s.metrics.enhancementsSucceeded,s.metrics.brewsStarted]);if(renderUpgrades.state===s&&renderUpgrades.key===key)return;renderUpgrades.state=s;renderUpgrades.key=key;const box=$('upgrades');for(const[key,title]of upgradeRows){let nodes=upgradeNodes.get(key);if(!nodes){const row=document.createElement('div');row.className='upgrade';const copy=document.createElement('div'),heading=document.createElement('h3'),desc=document.createElement('p'),costLine=document.createElement('div'),coin=document.createElement('img'),cost=document.createElement('span'),progress=document.createElement('div'),button=document.createElement('button'),level=document.createElement('span'),action=document.createElement('span');costLine.className='upgrade-cost';coin.src=art('Coin.png');coin.alt='';coin.setAttribute('aria-hidden','true');costLine.append(coin,cost);button.classList.add('upgrade-action');level.className='upgrade-level';action.className='upgrade-label';button.append(level,action);button.dataset.upgrade=key;button.onclick=()=>{if(game.buy(key)){notice(`${title} upgraded.`,'success');save(true);render();updateBeltLabels();if(key.startsWith('tier')){const family=Number(key.slice(4));queueNewItemReveal('material',family,game.state.tiers[family]);}}};copy.append(heading,desc,costLine,progress);row.append(copy,button);box.append(row);nodes={heading,desc,costLine,cost,progress,button,level,action};upgradeNodes.set(key,nodes);}
 const u=game.upgradeInfo(key),max=u.level>=u.max,{heading,desc,costLine,cost,progress,button,level,action}=nodes;let description;
 if(key.startsWith('tier')){const f=Number(key.slice(4));description=max?'All material tiers unlocked.':`Next: ${FAMILIES[f].materials[u.level+1].name}`;}else if(key==='speed'){const rate=game.emissionRate();description=`${u.level===0?rate/2:rate} materials per second while brewing${max?' · maximum':` · ${game.emissionRate(u.level+1)} per second at level ${u.level+2}`}. More emitted items mean more special-drop opportunities.`;}else if(key==='pushcat'){const info=game.helperInfo();description=`Level ${u.level+1} / 15 · Pushcat ${(info.intervalMs/1000).toFixed(2)}s per catch · Blackcat ${(info.intervalMs/ECONOMY.helpers.blackcatSpeedMultiplier/1000).toFixed(2)}s. Upgrades speed up active cats too.`;}else if(key==='luck')description=`+${Number((game.luckBonus()*100).toFixed(3))}${max?' (maximum)':' → +'+Number((game.luckBonus(u.level+1)*100).toFixed(3))} percentage points · permanent success bonus`;else description=`+${game.state.price*ECONOMY.upgrades.price.bonusPerLevel*100}% to potion sales`;
 setText(heading,title);setText(desc,description);costLine.hidden=max;setText(cost,`${fmt(u.cost)} coins`);progress.hidden=max||!u.requiredMastery;setText(progress,`${u.mastered} / ${u.requiredMastery} ${key.startsWith('tier')?FAMILIES[Number(key.slice(4))].label:''} potions mastered`);setText(level,`Level ${u.displayLevel}`);setText(action,max?'Max':u.locked?'Mastery locked':'Upgrade');button.classList.toggle('maxed',max);costLine.classList.toggle('unaffordable',!max&&game.state.coins<u.cost);button.disabled=max||u.locked||game.state.coins<u.cost;const label=max?title+' maximum':u.locked?`Master ${u.requiredMastery} ${FAMILIES[Number(key.slice(4))].label} potions to unlock this upgrade`:`Buy ${title} for ${u.cost} coins`;if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);
}renderUpgradeSummary();}
function renderUpgradeSummary(){const complete=upgradeRows.every(([key])=>{const u=game.upgradeInfo(key);return u.level>=u.max;}),details=$('completed-upgrades'),box=$('upgrades'),goal=$('upgrade-goal');details.hidden=!complete;goal.hidden=!complete;if(complete){if(box.parentElement!==details)details.append(box);const next=FAMILIES.flatMap((family,f)=>family.recipes.slice(0,game.state.tiers[f]+1).map((recipe,t)=>({recipe,f,t}))).find(({recipe,f,t})=>(game.state.metrics.recipes[f+'-'+t]?.highestLevel||0)<recipe.max_level);if(next){const{recipe,f,t}=next,level=game.state.metrics.recipes[f+'-'+t]?.highestLevel||0;setText($('upgrade-goal-name'),recipe.name);setText($('upgrade-goal-progress'),`Reach level ${recipe.max_level} · best ${level} / ${recipe.max_level}`);setText($('upgrade-goal-title'),ACHIEVEMENT_LORE.entries[f+'-'+t].title);}else{setText($('upgrade-goal-name'),'Every potion mastered');setText($('upgrade-goal-progress'),'All 75 potion achievements earned.');setText($('upgrade-goal-title'),'Your collection is complete.');}}else if(box.parentElement===details){details.before(box);details.open=false;}}
$('upgrade-goal-open').onclick=()=>$('achievements').click();

// Presentation themes follow costume filename series; these are not original event assignments.
const COSTUME_FAMILIES={"Everyday & shop work":["default","kids","frill-blouse","hood","overalls","sinsiroad-shop"],"Sleepwear":["pajamas","cute-pajamas"],"School & uniforms":["literature-girl","school","elementary-school","blazer","sailor","summer-uniform","school-2017","school-2018","school-2019","hoodie-uniform","sfc-uniform"],"Winter wear":["winter","nordic","winter-coat-2017","winter-coat","winter-date"],"Dresses & fashion":["dress","fall-dress","lolita","party-dress","ribbon-dress","rose-dress","macaron-dress","spring-dress"],"Witches":["witch","star-witch","forest-witch","night-witch"],"Sacred & seasonal magic":["goddess","shaman","priest","sakura-fairy","winter-fairy"],"Magical girls & night sky":["magical-girl","nightsky"],"Adventurers":["healer","knight","sorceress","warrior","thief","tirami1"],"Animals & mascots":["animal","bunny-girl","blackcat","pushcat"],"Gothic & Halloween":["vampire","darklord","succubus","halloween","halloween-2019"],"Traditional & festivals":["hanbok","sulbim","furisode","qipao","china-dress","sakura","new2015"],"Summer & seaside":["maid-bikini","bikini","sports-bikini","frill-bikini","sukumizu","summer-dress","cami-dress","sailor-bikini","swimsuit-2017","marine"],"Medical & care":["nurse"],"Hospitality & sweets":["maid","chef","cake","lemonade","limeade"],"Sports & outdoor travel":["jersey","rider-suit","sportia","sporty-hood","traveler","raincoat"],"Christmas & festive winter":["santa","santa2016","santa-2017","santa-2018","turtleneck"],"Valentine & White Day":["valentine","whiteday"],"Stage & collaborations":["akiba-idol","concert","voice-story"],"Special outfits":["blueround","sabori","sarori","sinsiroad"],"Fan-made crossover":["fan-shinobu"]};
function costumeFamily(costume){const series=costume.id==='Tia.png'?'default':costume.fanMade?'fan-shinobu':costume.id.toLowerCase().replaceAll('_','-').replace(/^(pio|tia)-/,'').split('-costume')[0];return Object.keys(COSTUME_FAMILIES).find(family=>COSTUME_FAMILIES[family].includes(series))||'Special outfits';}
$('costume-family').onchange=()=>renderCostumeShop();
function renderCostumeShop(){
 const character=window.brewerCharacter||'Pio',entries=COSTUMES.entries.filter(c=>c.character===character&&c.live2d),grid=$('costume-grid'),owned=new Set(game.state.costumes);grid.replaceChildren();
 $('costume-shop-balance').textContent=`You have ${fmt(game.state.tickets)} tickets · ${entries.filter(c=>owned.has(c.id)).length} / ${entries.length} ${character} costumes owned.`;
 const filter=$('costume-family'),selected=filter.value,families=Object.keys(COSTUME_FAMILIES).filter(family=>entries.some(c=>costumeFamily(c)===family));
 filter.replaceChildren(new Option('All themes',''));for(const family of families)filter.add(new Option(`${family} (${entries.filter(c=>costumeFamily(c)===family).length})`,family));filter.value=families.includes(selected)?selected:'';
 const voucherBalance=document.createElement('p');voucherBalance.className='costume-voucher-balance';voucherBalance.append(rewardChip('vouchers',game.state.eventRush.vouchers),document.createTextNode(' Costume Vouchers · Redeem for eligible event outfits below.'));grid.append(voucherBalance);
 for(const family of families){
  if(filter.value&&filter.value!==family)continue;
  const sectionEntries=entries.filter(c=>costumeFamily(c)===family);
  const section=document.createElement('section'),title=document.createElement('h3'),note=document.createElement('p'),cards=document.createElement('div');
  section.className='costume-section';title.textContent=family;note.className='small muted';note.textContent=`${sectionEntries.filter(c=>owned.has(c.id)).length} / ${sectionEntries.length} owned`;cards.className='costume-grid';
  for(const costume of sectionEntries){
   const card=document.createElement('section'),image=document.createElement('img'),heading=document.createElement('h3'),status=document.createElement('p'),button=document.createElement('button'),isOwned=owned.has(costume.id),equipped=game.state.activeCostumeId===costume.id,eventSkin=EVENT_SKINS.has(costume.id),price=costume.live2d&&!costume.free?ECONOMY.costumes.ticketPrice:0;
   card.className='costume-card';card.dataset.costumeId=costume.id;image.src=art(costume.id);image.alt=costume.name;image.loading='lazy';heading.textContent=costume.name;status.textContent=equipped?'Wearing':isOwned?'Owned':eventSkin?EVENTS.find(event=>event.skins.includes(costume.id)).name:costume.free||!costume.live2d?(costume.live2d?'Animated · free':'Static PNG · free'):'';
   button.textContent=equipped?'Wearing':eventSkin&&!isOwned?'Event skin':costume.free||!costume.live2d?'Wear · free':isOwned?'Wear':'';button.className=isOwned||!costume.live2d||eventSkin?'':'primary';button.disabled=equipped||(!isOwned&&(eventSkin||game.state.tickets<price));
   if(!isOwned&&costume.live2d&&!costume.free&&!eventSkin){const ticket=document.createElement('img');ticket.src=art('Nyan-Ticket.png');ticket.alt='';ticket.className='costume-ticket-icon';status.append(document.createTextNode(`${price} `),ticket);button.textContent='Buy';}
   button.onclick=()=>{const success=isOwned?game.equipCostume(costume.id):game.buyCostume(costume.id);if(!success)return;try{localStorage.setItem('pmg-costume-'+character,costume.id);}catch{}save(true);render();renderCostumeShop();notice(`${costume.name} equipped.`,'success');};card.append(image,heading,status,button);if(!isOwned&&game.voucherEligible(costume.id)){const redeem=document.createElement('button');redeem.type='button';redeem.append(rewardChip('vouchers',1),document.createTextNode(' Redeem'));redeem.disabled=game.state.eventRush.vouchers<1;redeem.onclick=()=>{if(rushTransaction(()=>game.redeemCostumeVoucher(costume.id),costume.name+' added to your wardrobe.'))renderCostumeShop();};card.append(redeem);}if(eventSkin&&isOwned){const marker=document.createElement('span');marker.className='costume-origin';marker.textContent='Event outfit';card.append(marker);}cards.append(card);
  }
  section.append(title,note,cards);grid.append(section);
 }
}

function renderPowerups(){for(const[key,id,label,verb]of [['protection','protection-indicator','Protection','Consumed automatically when an enhancement fails.'],['enhancement','enhancement-indicator','Enhancement boost','One charge is used on each enhancement attempt.'],['selling','selling-indicator','Sale boost','One charge is used on a potion sale.']]){const indicator=$(id),count=$(id+'-count'),amount=game.state.powerups[key];indicator.hidden=amount<1;indicator.title=verb;indicator.setAttribute('aria-label',`${amount} ${label.toLowerCase()} ${amount===1?'charge':'charges'}`);setText(count,amount);}}
let travelerSnapshot='';
function readyQuestIndex(){return game.state.travelers.findIndex((_,index)=>game.canDeliver(index));}
function updateSellAction(){if(game.state.eventRush.eventPotion){const button=$('sell');setText($('sell-label'),'Deliver');button.classList.remove('quest-ready');button.title='Deliver one event bottle';button.setAttribute('aria-label',button.title);$('selling-indicator').hidden=true;return;}const index=readyQuestIndex(),button=$('sell'),ready=index>=0;setText($('sell-label'),ready?'Deliver to '+TRAVELERS[index].name:game.canDeliverCommission()?'Deliver commission':'Sell');button.classList.toggle('quest-ready',ready);const actionTitle=ready?`Give this potion to ${TRAVELERS[index].name}`:game.canDeliverCommission()?'Hand this potion over to your commission':'Sell the current potion';button.title=actionTitle;button.setAttribute('aria-label',actionTitle);$('selling-indicator').hidden=ready||game.state.powerups.selling<1;}
function updateQuestButtons(){updateSellAction();const index=game.state.travelers.findIndex(t=>t.phase==='active');if(index>=0){const button=$('travelers').querySelector('[data-phase="active"] [data-quest-give]');if(button){const ready=game.canDeliver(index);button.disabled=!ready;button.classList.toggle('quest-ready',ready);}}}

function fillVisitorText(line,q){return String(line||'').replaceAll('{level}',String((q?.level??0)+1)).replaceAll('{potion}',q?FAMILIES[q.family].recipes[q.tier].name:'potion').replaceAll('{family}',q?FAMILIES[q.family].label:'potion');}
// Keep this pool independent of the equipped costume; Tirami's Pio/Tia-addressed documented lines stay under documented.
function visitorRequest(traveler,q){const authored=VISITOR_DIALOGUE.entries[traveler.id],documented=VISITOR_DIALOGUE.documented?.[traveler.id],lines=[].concat(authored?.offer||[],documented?.offer||[]),flavors=[].concat(authored?.offerFlavor||[],documented?.offerFlavor||[]);if(!lines.length)return null;const seed=((q?.family??0)+1)*131+((q?.tier??0)+1)*17+((q?.level??0)+1)*7,index=Math.abs(seed)%lines.length;return{line:lines[index],flavor:flavors[index]||''};}
function visitorLine(traveler,state,q,phase=state.phase){
 if(phase==='offer'){const request=visitorRequest(traveler,q);if(request)return fillVisitorText(request.line,q);}
 const character=COSTUMES.entries.find(c=>c.id===game.state.activeCostumeId)?.character||'Pio',documented=VISITOR_DIALOGUE.documented?.[traveler.id],documentedLines=documented?.[character]?.[phase]||documented?.[phase],authored=VISITOR_DIALOGUE.entries[traveler.id]?.[phase],lines=documentedLines||authored;
 if(!lines||!lines.length)return'';
 if(!documentedLines&&!state.rewardFairyId&&VISITOR_DIALOGUE.rewardAssumptions?.[traveler.id]?.[phase]==='fairy')return'';
 const seed=state.leaveAt||state.deadline||state.readyAt||0,pool=Array.isArray(lines)?lines:[lines];
 return fillVisitorText(pool[Math.floor(seed/1000)%pool.length]||'',q);
}
// Original prefab rectangles: body width/height, then Face x/y/width/height from its top-left.
const visitorFaceRects={"charlotte":[316.0,295.0,82.0,63.0,98.0,87.0],"daisy":[231.0,295.0,63.0,73.0,105.0,95.0],"demian":[306.0,295.0,98.0,76.0,109.0,86.0],"kyle":[279.0,295.0,59.0,79.0,98.0,95.0],"tirami":[266.0,295.0,30.0,78.0,140.0,100.0]};
function visitorPortrait(traveler,phase){const portrait=document.createElement('span'),body=document.createElement('img'),rect=visitorFaceRects[traveler.id],expression=phase==='failed'?'failure':['returning','complete'].includes(phase)?'success':null;portrait.className='visitor-portrait';body.src=art('OriginalTraveler-'+traveler.id+'.png');body.alt=traveler.name;portrait.append(body);if(rect){const[w,h,x,y,fw,fh]=rect;portrait.style.aspectRatio=w+'/'+h;if(expression){const face=document.createElement('img');face.className='visitor-expression';face.src=art('OriginalFace-'+traveler.id+'-'+expression+'.png');face.alt='';face.setAttribute('aria-hidden','true');face.style.cssText=`left:${x/w*100}%;top:${y/h*100}%;width:${fw/w*100}%;height:${fh/h*100}%`;portrait.append(face);portrait.dataset.expression=expression;}}return portrait;}
function renderTravelers(){const snapshot=JSON.stringify([game.state.travelers,game.state.activeCostumeId]);if(snapshot===travelerSnapshot){updateQuestButtons();return;}updateSellAction();travelerSnapshot=snapshot;const box=$('travelers');box.replaceChildren();let shown=0;TRAVELERS.forEach((traveler,i)=>{
 const state=game.state.travelers[i];if(state.phase==='away')return;shown++;
 const q=game.questRequirement(i),card=document.createElement('div');card.className='card traveler';card.dataset.phase=state.phase;
 const im=visitorPortrait(traveler,state.phase);
 const body=document.createElement('div');body.className='traveler-body';const heading=document.createElement('h3');heading.textContent=traveler.name;
 const speech=document.createElement('p');speech.className='speech';const spoken=visitorLine(traveler,state,q),rewardSummary=!spoken&&['returning','complete'].includes(state.phase);if(rewardSummary){speech.classList.add('visitor-reward-summary');speech.textContent=(state.phase==='returning'?'Reward due: ':'Reward received: ')+visitorRewardText(traveler,state)+'.';}else if(q){const potionName=FAMILIES[q.family].recipes[q.tier].name;spoken.split(potionName).forEach((part,index)=>{if(index){const name=document.createElement('span');name.textContent=potionName;name.style.color=FAMILIES[q.family].color;speech.append(name);}speech.append(document.createTextNode(part));});}else speech.textContent=spoken;
 const flavor=document.createElement('div');flavor.className='visitor-order-flavor';flavor.hidden=!q;if(q){const request=visitorRequest(traveler,q),tierNote=(VISITOR_DIALOGUE.orderFlavor?.[traveler.id]?.[q.tier]||'').split('\n\n').slice(1).join('\n\n'),paragraphs=[request?.flavor||'',tierNote].map(text=>fillVisitorText(text,q)).filter(Boolean);for(const [index,paragraph] of paragraphs.entries()){const p=document.createElement('p');if(index===1&&paragraphs.length>1)p.className='visitor-tier-note';p.textContent=paragraph;flavor.append(p);}}
 const description=document.createElement('p');if(q){const xp=game.experienceFor(q.family,q.tier);description.className='quest-order';const label=document.createElement('span'),name=document.createElement('strong'),level=document.createElement('span');label.className='small muted';label.textContent='Required potion';name.textContent=FAMILIES[q.family].recipes[q.tier].name;name.style.color=FAMILIES[q.family].color;level.className='quest-level';level.textContent=`Level ${q.level+1} or higher`;const xpNote=document.createElement('span');xpNote.className='small muted';xpNote.textContent=`${xp}${game.experienceIsEstimated(q.family,q.tier)?' estimated':''} EXP`;description.append(label,name,level,xpNote);const image=document.createElement('img');image.src=art(FAMILIES[q.family].recipes[q.tier].image);image.alt=FAMILIES[q.family].recipes[q.tier].name;description.append(image);}
 const progress=document.createElement('p');progress.className='small muted';progress.textContent=state.level>=12?`Level 12 · ${fmt(state.exp)} EXP · max level`:`Level ${state.level} · ${fmt(state.exp)} / ${fmt(LEVEL_EXP[state.level])} EXP`;
 const reward=document.createElement('p');reward.className='quest-reward';const rewardItems=[];if(state.rewardBoost)rewardItems.push({kind:state.rewardBoost.type,amount:state.rewardBoost.amount});if(state.rewardTickets)rewardItems.push({kind:'tickets',amount:state.rewardTickets});if(state.rewardRubies)rewardItems.push({kind:'rubies',amount:state.rewardRubies});if(state.rewardFairyId)rewardItems.push({kind:'fairy',amount:1,name:FAIRIES.find(f=>f.id===state.rewardFairyId)?.name});renderRewardChips(reward,rewardItems,'Reward: ');reward.hidden=rewardSummary;
 const timer=document.createElement('p');timer.dataset.questTimer=i;timer.className=state.phase==='active'?'timer quest-deadline':'timer';
 const actions=document.createElement('div');actions.className='quest-actions';
 function button(label,action,disabled=false,parent=actions,className=''){const b=document.createElement('button');b.type='button';b.textContent=label;b.disabled=disabled;if(className)b.className=className;b.onclick=()=>{if(action()){save(true);render();updateBeltLabels();}};parent.append(b);return b;}
 if(state.phase==='offer'){
  timer.textContent=questTimerText(state);actions.classList.add('traveler-offer-actions');
  const choices=document.createElement('div');choices.className='traveler-choices';
  const requestChoice=document.createElement('div');requestChoice.className='traveler-choice';
  const request=button('Request',()=>{openVisitorExpedition(i);return false;},false,requestChoice,'traveler-request');request.setAttribute('aria-label','Request: open '+traveler.name+'’s expedition chapter');
  const requestNote=document.createElement('span');requestNote.className='traveler-choice-note';requestNote.textContent='Open expedition chapter';requestChoice.append(requestNote);
  const acceptChoice=document.createElement('div');acceptChoice.className='traveler-choice';
  const accept=button('OK',()=>{const accepted=game.acceptQuest(i);if(accepted)playOriginalSfx('Quest.wav',.18);return accepted;},false,acceptChoice,'primary');accept.setAttribute('aria-label','OK: accept this potion order');
  const acceptNote=document.createElement('span');acceptNote.className='traveler-choice-note';acceptNote.textContent='Accept potion order';acceptChoice.append(acceptNote);
  choices.append(requestChoice,acceptChoice);actions.append(choices);
 }
 if(state.phase==='active'){
  timer.textContent=questTimerText(state);const ready=game.canDeliver(i),give=button('Give potion',()=>{if(!game.deliver(i))return false;playOriginalSfx('Quest Complete.wav',.22);notice('Potion delivered. '+traveler.name+' will return with your reward in '+ECONOMY.visitors.rewardDelayMs/1000+' seconds.','success');return true;},!ready);
  give.setAttribute('data-quest-give','');give.classList.add('primary');give.classList.toggle('quest-ready',ready);
 }
 if(state.phase==='active')button('Expeditions',()=>{openVisitorExpedition(i);return false;});
 if(state.phase==='returning')timer.textContent=questTimerText(state);
 if(state.phase==='failed')timer.textContent=questTimerText(state);
 if(state.phase==='complete')timer.textContent=questTimerText(state);
 const header=document.createElement('div');header.className='traveler-header';const identity=document.createElement('div');identity.append(heading,progress);header.append(im,identity);body.append(speech,flavor,description,reward,timer,actions);card.append(header,body);box.append(card);
 });if(!shown){const empty=document.createElement('div');empty.className='card visitor-empty';empty.textContent='The shop is quiet. A traveler may stop by soon.';box.append(empty);}}
function updateVisitorShortcut(){const index=game.state.travelers.findIndex(t=>t.phase!=='away'),shortcut=$('visitor-shortcut');shortcut.hidden=index<0;if(index<0)return;const state=game.state.travelers[index],traveler=TRAVELERS[index];shortcut.dataset.travelerIndex=index;shortcut.dataset.phase=state.phase;const ready=game.canDeliver(index),complete=state.phase==='complete';shortcut.classList.toggle('quest-complete',ready||complete);shortcut.setAttribute('aria-label',traveler.name+(ready?' · Potion ready to deliver':complete?' · Quest complete':' · View visitor order'));shortcut.title=ready?'Potion ready to deliver':complete?'Quest complete · reward received':'View visitor order';$('visitor-shortcut-portrait').src=art('OriginalTraveler-'+traveler.id+'.png');$('visitor-shortcut-portrait').alt=traveler.name;const remaining=['offer','complete','failed'].includes(state.phase)?Math.max(0,Math.min(1,(state.leaveAt-Date.now())/QUEST_OFFER_MS)):state.phase==='active'?Math.max(0,Math.min(1,(state.deadline-Date.now())/QUEST_PREP_MAX_MS)):Math.max(0,Math.min(1,(state.readyAt-Date.now())/QUEST_REWARD_DELAY_MS));$('visitor-time-fill').style.transform=`scaleX(${remaining})`;}
$('visitor-shortcut').onclick=()=>{const index=Number($('visitor-shortcut').dataset.travelerIndex),card=$('travelers').querySelectorAll('.traveler')[0];if(!card)return;$('visitor-order-content').replaceChildren(card.cloneNode(true));$('visitor-order-content').querySelectorAll('button').forEach((button,i)=>{button.onclick=()=>{card.querySelectorAll('button')[i].click();$('visitor-order-dialog').close();};});const footer=$('visitor-order-footer');footer.replaceChildren();for(const node of $('visitor-order-content').querySelectorAll('[data-quest-timer],.quest-actions'))footer.append(node);$('visitor-order-dialog').showModal();};
const EXPEDITION_PROFILES=[["A cleric who visits the shop for potions and protective supplies.", "Hello, Pio. Shall we prepare something helpful today?", "Hello, Tia. May I lend a hand with your preparations?"], ["An energetic warrior who approaches adventures with plenty of enthusiasm.", "Pio! Let’s get ready for another adventure!", "Tia! Your potions will make this trip a success!"], ["A competitive potion merchant and Pio’s lively rival.", "Pio! Let’s see whose preparations are better today!", "Tia! Show me what an elite potion maker can do!"], ["A palace knight who values careful preparation and speaks with formality.", "Good day, Pio. I am ready to assist with the supplies.", "Good day, Tia. Shall we review the expedition?"], ["A quiet wizard who takes care of his pets and speaks in short phrases.", "Pio… supplies… for the journey…", "Tia… ready… to search…"], ["A playful thief with a talent for moving quietly and finding opportunities.", "Hey, Pio. Want me to find something interesting?", "Hey, Tia. Let’s see what I can find this time."], ["An elegant, wealthy regular with an appreciation for beautiful potions.", "Pio, darling. Charlotte would love to arrange a little outing.", "Tia, darling. Shall we choose something lovely?"], ["A formal revenue officer who keeps a close eye on the shop’s accounts.", "Pio. Let us make sure the preparations are in order.", "Tia. I trust you have reviewed the expedition costs."], ["A polite baker who uses potions in her breadmaking.", "Hello, Pio! Could we prepare a few bakery supplies?", "Hello, Tia! Shall we get everything ready for the trip?"], ["A young traveler who visits the shop with challenges.", "Hello, Pio. Ready to choose our next destination?", "Hello, Tia. Where should we go this time?"]];
let expeditionTraveler=0,expeditionTarget=0,expeditionFamily=-1,expeditionTier=0,expeditionVisitorOpen=false,expeditionViewKey='';
const expeditionStoryQueue=[];
let expeditionStoryScene=null,expeditionChapterScene=null;
function updateExpeditionStoryPreview(material){
 const title=$('expedition-story-preview-title'),text=$('expedition-story-preview-text');
 if(!title||!text)return;
 if(!material){title.textContent='Story preview';text.textContent='Choose a material to see the spoiler-free preview for this job.';return;}
 const preview=game.expeditionStoryPreview(expeditionTraveler,expeditionTier,expeditionFamily);
 if(preview?.hook){title.textContent='Story preview · '+preview.label;text.textContent=preview.hook;return;}
 if(preview?.kind==='event'){title.textContent='Story preview · '+preview.label;text.textContent='The shared Cold Roost story follows this '+FAMILIES[expeditionFamily].label+' route after the trip.';return;}
 title.textContent='Story preview';text.textContent='No story preview is available for this tier yet. The existing expedition is unchanged.';
}
function appendStoryParagraphs(container,text){for(const paragraph of String(text||'').split(/\n\s*\n/).map(part=>part.trim()).filter(Boolean)){const body=document.createElement('p');body.textContent=paragraph;container.append(body);}}
function renderExpeditionStory(story){
 const dispatchInfo=$('expedition-story-dispatch-info');if(dispatchInfo){dispatchInfo.hidden=true;dispatchInfo.textContent='';}
 const title=$('expedition-story-title'),meta=$('expedition-story-meta'),content=$('expedition-story-content');
 if(!title||!meta||!content)return;
 title.textContent=story.title||'Expedition story';
 meta.textContent=[story.travelerName,story.tier?'Tier '+story.tier:'',story.familyLabel,story.materialName].filter(Boolean).join(' · ');
 content.replaceChildren();
 for(const section of story.sections||[]){const block=document.createElement('section'),heading=document.createElement('h3');block.className='expedition-story-section';block.dataset.kind=section.kind||'';heading.textContent=section.title;block.append(heading);appendStoryParagraphs(block,section.text);content.append(block);}
 $('expedition-story-next').hidden=true;$('expedition-story-secondary').hidden=true;
}
function chapterSpeakerName(speaker){if(!speaker||speaker==='narrator')return'';return speaker.replace(/[-_]/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase());}
function chapterRoute(scene){return scene?.chapter.routes.find(route=>route.family===scene.family)||null;}
function chapterChoiceIndex(scene){return Math.max(0,(scene?.chapter.opening||[]).findIndex(beat=>beat.phase==='choice'));}
function chapterBeats(scene){
 if(scene.stage==='dispatched')return (scene.chapter.dispatch||[]).slice(0,1).map(beat=>({...beat}));
 const beats=(scene.chapter.opening||[]).map(beat=>({...beat})),route=chapterRoute(scene);
 if(route)beats.push(...route.confirmBeats.map(beat=>({...beat})),...route.departureBeats.map(beat=>({...beat})));
 return beats;
}
function chapterTraveler(scene){return TRAVELERS[scene.index];}
function renderExpeditionStoryBeat(story,index){
 const dispatchInfo=$('expedition-story-dispatch-info');if(dispatchInfo){dispatchInfo.hidden=true;dispatchInfo.textContent='';}
 const title=$('expedition-story-title'),meta=$('expedition-story-meta'),content=$('expedition-story-content'),beat=story.beats?.[index];
 if(!title||!meta||!content||!beat)return;
 title.textContent=story.title||'Expedition story';
 meta.textContent=[story.travelerName,story.tier?'Tier '+story.tier:'',story.familyLabel,story.materialName].filter(Boolean).join(' · ');
 content.replaceChildren();
 const block=document.createElement('section'),text=document.createElement('div'),speaker=document.createElement('p'),portraitTraveler=beat.portrait&&beat.portrait!=='none'?TRAVELERS.find(t=>t.id===beat.portrait):null,portrait=portraitTraveler?art(portraitTraveler.portrait):'';
 block.className='expedition-story-section expedition-story-beat';text.className='expedition-story-beat-text';
 if(portrait){const image=document.createElement('img');image.src=portrait;image.alt='';block.classList.add('with-portrait');block.append(image);}
 const label=chapterSpeakerName(beat.speaker);if(label){speaker.className='expedition-story-speaker';speaker.textContent=label;text.append(speaker);}
 appendStoryParagraphs(text,beat.text);block.append(text);content.append(block);
 $('expedition-story-next').hidden=false;$('expedition-story-secondary').hidden=true;$('expedition-story-next').disabled=false;
 $('expedition-story-next').textContent=index>=story.beats.length-1?'Finish':'Continue';
}
function setChapterNote(text){const content=$('expedition-story-content');if(!text||!content)return;const note=document.createElement('p');note.className='expedition-story-note';note.textContent=text;content.append(note);}
function renderExpeditionChapter(){
 const scene=expeditionChapterScene;if(!scene)return;
 const beats=chapterBeats(scene);scene.beatIndex=Math.min(scene.beatIndex,Math.max(0,beats.length-1));
 const beat=beats[scene.beatIndex],route=chapterRoute(scene),traveler=chapterTraveler(scene);
 const story={title:'Tier '+scene.chapter.tier+' · '+scene.chapter.job,travelerId:scene.chapter.traveler,travelerName:traveler.name,tier:scene.chapter.tier,family:route?.family??-1,familyLabel:route?.familyLabel||'',materialName:route?.material||'',beats};
 renderExpeditionStoryBeat(story,scene.beatIndex);
 if(beat?.phase==='choice'&&scene.stage==='opening'){
  const options=document.createElement('div');options.className='expedition-chapter-options';
  for(const option of scene.chapter.routes){const button=document.createElement('button'),name=document.createElement('strong'),teaser=document.createElement('small');button.type='button';button.className='expedition-chapter-option';name.textContent=option.material;teaser.textContent=[option.familyLabel,scene.chapter.opening.find(item=>item.phase==='choice')?.options?.[option.family]?.teaser].filter(Boolean).join(' · ');button.append(name,teaser);button.onclick=()=>{if(!game.setExpeditionChapterDraft(scene.chapter.id,option.family))return;scene.family=option.family;scene.beatIndex=chapterChoiceIndex(scene)+1;save(true);renderExpeditionChapter();};options.append(button);}
  $('expedition-story-content').append(options);$('expedition-story-next').hidden=true;
 }
 const isDeparture=scene.stage==='opening'&&scene.family>=0&&scene.beatIndex===beats.length-1;
 if(isDeparture){
  const info=game.combinedExpeditionInfo(scene.index,scene.tier),present=['offer','active'].includes(game.state.travelers[scene.index].phase),active=game.state.expedition,request=game.state.request;
  $('expedition-story-next').textContent='Begin trip';$('expedition-story-next').disabled=!present||!!active||!!request||!info||game.state.coins<info.cost;
  if(info){const dispatchInfo=$('expedition-story-dispatch-info');if(dispatchInfo){dispatchInfo.hidden=false;dispatchInfo.textContent='This trip costs '+fmt(info.cost)+' gold. Dispatch replaces this order and cannot be cancelled.';}}
  if(!present)setChapterNote(traveler.name+' is not in the shop right now. You can read the chapter and choose a route, then leave and return when '+traveler.name+' is here to dispatch. No gold is charged and no timer starts.');
  else if(active)setChapterNote('An expedition is already underway. Reading the chapter is free; dispatch waits until the current trip returns.');
  else if(request)setChapterNote('A previously dispatched request is still running. Reading the chapter is free; dispatch waits until it returns.');
  else if(!info)setChapterNote('This trip is not ready to dispatch yet.');
  else if(game.state.coins<info.cost)setChapterNote('You need '+fmt(info.cost-game.state.coins)+' more before dispatch.');
 }
 if(isDeparture&&scene.prepareOnly){$('expedition-story-next').textContent='Save route & return';$('expedition-story-next').disabled=false;const info=$('expedition-story-dispatch-info');if(info)info.textContent='Story preparation is free. Return to the expedition screen to review costs and dispatch.';}
 if(scene.stage==='dispatched'){$('expedition-story-next').textContent='Close';$('expedition-story-next').disabled=false;}
 const secondary=$('expedition-story-secondary');
 if(scene.family>=0&&scene.stage==='opening'){secondary.hidden=false;secondary.textContent='Change route';}
}
function openExpeditionChapter(index,tier,prepareOnly=false){
 const dialog=$('expedition-story-dialog');if(!dialog||dialog.open)return;
 const chapter=game.expeditionChapter(index,tier);if(!chapter||!chapter.routes.length)return;
 const draft=game.state.expeditionChapterDraft,saved=draft?.chapterId===chapter.id?chapter.routes.find(route=>route.family===draft.family):null;
 expeditionStoryScene=null;const scene={chapter,index,tier,family:saved?.family??-1,beatIndex:0,stage:'opening',prepareOnly};
 if(scene.family>=0)scene.beatIndex=chapterBeats(scene).length-1;
 expeditionChapterScene=scene;
 renderExpeditionChapter();try{dialog.showModal();}catch{return;}
}
function dispatchExpeditionChapter(){
 const scene=expeditionChapterScene,traveler=chapterTraveler(scene),info=game.combinedExpeditionInfo(scene.index,scene.tier),present=['offer','active'].includes(game.state.travelers[scene.index].phase);
 if(!present||!info||game.state.expedition||game.state.request||game.state.coins<info.cost)return renderExpeditionChapter();
 if(!game.dispatchCombinedExpedition(scene.index,scene.tier,scene.family))return renderExpeditionChapter();
 game.clearExpeditionChapterDraft(scene.chapter.id);
 scene.stage='dispatched';scene.beatIndex=0;save(true);render();renderExpeditionChapter();
 notice(traveler.name+' departed on '+scene.chapter.job+'. The chapter will show Ready to continue when the trip returns.','success');
}
function advanceExpeditionChapter(){
 const scene=expeditionChapterScene;if(!scene)return;
 if(scene.stage==='dispatched')return $('expedition-story-dialog').close();
 const beats=chapterBeats(scene);
 if(scene.beatIndex<beats.length-1){scene.beatIndex++;renderExpeditionChapter();return;}
 if(scene.family>=0){if(scene.prepareOnly)return $('expedition-story-dialog').close();dispatchExpeditionChapter();}
}
function advanceExpeditionStory(){
 if(!expeditionStoryScene)return;
 if(expeditionStoryScene.index>=expeditionStoryScene.story.beats.length-1){markExpeditionStorySeen(expeditionStoryScene.story);return $('expedition-story-dialog').close();}
 expeditionStoryScene.index++;renderExpeditionStoryBeat(expeditionStoryScene.story,expeditionStoryScene.index);
}
function openExpeditionChapterReport(story){const dialog=$('expedition-story-dialog');if(!dialog||dialog.open||!story?.beats?.length)return;expeditionChapterScene=null;expeditionStoryScene={story,index:0};renderExpeditionStoryBeat(story,0);try{dialog.showModal();}catch{return;}}
function openExpeditionChapterReplay(route){const dialog=$('expedition-story-dialog');if(!dialog||dialog.open||!route?.chapterBeats?.length)return;const story={title:'Tier '+route.tier+' · '+route.job,travelerId:route.traveler.id,travelerName:route.traveler.name,tier:route.tier,family:route.family,familyLabel:route.familyLabel,materialName:route.materialName,chapterId:route.chapterId,recordIds:route.recordId?[route.recordId]:[],beats:route.chapterBeats};expeditionChapterScene=null;expeditionStoryScene={story,index:0};renderExpeditionStoryBeat(story,0);try{dialog.showModal();}catch{return;}}
function markExpeditionStorySeen(story){if(story?.recordIds?.length&&game.markExpeditionStorySeen(story.recordIds))save(true);}
function showNextExpeditionStory(){
 const dialog=$('expedition-story-dialog');
 if(!dialog||dialog.open||!expeditionStoryQueue.length)return;
 const story=expeditionStoryQueue.shift();
 if(story?.beats?.length){expeditionChapterScene=null;expeditionStoryScene={story,index:0};renderExpeditionStoryBeat(story,0);}else{expeditionStoryScene=null;renderExpeditionStory(story);}
 try{dialog.showModal();}catch{return;}
 if(!story.chapterId)markExpeditionStorySeen(story);
}
function queueExpeditionStory(story){if(!story||story.chapterId)return;expeditionStoryQueue.push(story);showNextExpeditionStory();}
function queuePendingExpeditionStory(){
 const dialog=$('expedition-story-dialog');
 if(!dialog||dialog.open||expeditionStoryQueue.length)return;
 const story=game.pendingExpeditionStory();
 if(story)queueExpeditionStory(story);
}
function renderExpeditionJournal(){
 const box=$('expedition-journal'),summary=$('expedition-journal-summary');
 if(!box||!summary)return;
 const journal=game.expeditionJournal(),counts=journal.counts,total=counts.routes+counts.eventFamilies+counts.neutral;
 summary.textContent=total?`${counts.routes} tier 1-5 ${counts.routes===1?'route':'routes'} · ${counts.eventFamilies} Cold Roost ${counts.eventFamilies===1?'family':'families'} · ${counts.neutral} other tier-5 ${counts.neutral===1?'traveler':'travelers'}.`:'No completed expedition stories yet. Finish a tier 1-5 trip with a story route to begin the journal.';
 box.replaceChildren();
 if(!total){const empty=document.createElement('p');empty.className='expedition-journal-empty';empty.textContent='The journal is waiting for its first story.';box.append(empty);return;}
 if(journal.events.length){
  const heading=document.createElement('h3');heading.textContent='Tier 5 · The Cold Roost';box.append(heading);
  for(const event of journal.events){
   const section=document.createElement('section');section.className='expedition-journal-event';
   const title=document.createElement('h3');title.textContent=event.familyLabel+' · '+event.materialName;
   const openingLabel=document.createElement('h4');openingLabel.textContent='The Cold Roost: shared opening';
   const opening=document.createElement('p');opening.textContent=event.opening;
   const tellingLabel=document.createElement('h4');tellingLabel.textContent=event.title;
   const telling=document.createElement('p');telling.textContent=event.telling;
   section.append(title,openingLabel,opening,tellingLabel,telling);
   if(event.viewpoints.length){const viewpointHeading=document.createElement('h4');viewpointHeading.textContent='Completed viewpoints';section.append(viewpointHeading);for(const viewpoint of event.viewpoints){const card=document.createElement('div'),name=document.createElement('h4'),text=document.createElement('p');card.className='expedition-journal-viewpoint';name.textContent=viewpoint.traveler.name+"'s viewpoint";text.textContent=viewpoint.text;card.append(name,text);section.append(card);}}
   box.append(section);
  }
 }
 if(journal.routes.length){
  const heading=document.createElement('h3');heading.textContent='Tier 1-5 routes';box.append(heading);
  const groups=new Map();for(const route of journal.routes){if(!groups.has(route.traveler.id))groups.set(route.traveler.id,[]);groups.get(route.traveler.id).push(route);}
  for(const traveler of TRAVELERS){const routes=groups.get(traveler.id);if(!routes)continue;const details=document.createElement('details'),summary=document.createElement('summary');details.className='expedition-journal-group';summary.textContent=traveler.name+' · '+routes.length+' completed '+(routes.length===1?'route':'routes');details.append(summary);for(const route of routes){const article=document.createElement('article'),title=document.createElement('h4'),job=document.createElement('p');article.className='expedition-journal-route';title.textContent='Tier '+route.tier+' · '+route.familyLabel+' · '+route.materialName;job.className='small muted';job.textContent=route.job;article.append(title,job);if(route.chapterId&&route.chapterBeats?.length){const replay=document.createElement('button'),outcome=document.createElement('p');replay.type='button';replay.textContent='Replay chapter report';replay.onclick=()=>openExpeditionChapterReplay(route);outcome.textContent=route.outcome;article.append(replay,outcome);}else if(route.journey){const journeyHeading=document.createElement('h5');journeyHeading.textContent='Journey';article.append(journeyHeading);appendStoryParagraphs(article,route.journey);const outcomeHeading=document.createElement('h5');outcomeHeading.textContent='Outcome';article.append(outcomeHeading);appendStoryParagraphs(article,route.outcome);}else{const outcome=document.createElement('p');outcome.textContent=route.outcome;article.append(outcome);}details.append(article);}box.append(details);}
 }
 if(journal.neutral.length){
  const heading=document.createElement('h3');heading.textContent='Tier 5 · Other travelers';box.append(heading);
  for(const story of journal.neutral){const section=document.createElement('section'),title=document.createElement('h4'),text=document.createElement('p');section.className='expedition-journal-neutral';title.textContent=story.traveler.name+' · '+story.job;text.textContent=story.text;section.append(title,text);box.append(section);}
 }
}
function openExpeditionJournal(){prepareExpeditionReturn($('expedition-journal-dialog'));renderExpeditionJournal();$('expedition-journal-dialog').showModal();}
$('expedition-journal-open').onclick=openExpeditionJournal;
$('expedition-story-journal').onclick=openExpeditionJournal;
$('expedition-story-next').onclick=()=>{if(expeditionChapterScene)advanceExpeditionChapter();else advanceExpeditionStory();};
$('expedition-story-secondary').onclick=()=>{const scene=expeditionChapterScene;if(scene&&scene.stage==='opening'){if(game.clearExpeditionChapterDraft(scene.chapter.id))save(true);scene.family=-1;scene.beatIndex=chapterChoiceIndex(scene);renderExpeditionChapter();}};
$('expedition-story-dialog').addEventListener('close',()=>{expeditionStoryScene=null;expeditionChapterScene=null;$('expedition-story-next').hidden=true;$('expedition-story-secondary').hidden=true;if($('expedition-dialog').open){expeditionViewKey='';renderExpeditions();}if(expeditionStoryQueue.length)showNextExpeditionStory();else queuePendingExpeditionStory();});
function renderExpeditionChapters(){
 const section=$('expedition-chapters'),list=$('expedition-chapter-list');if(!section||!list)return;
 const chapters=game.unlockedExpeditionChapters();section.hidden=!chapters.length;list.replaceChildren();
 for(const chapter of chapters){const traveler=TRAVELERS[chapter.index],active=game.state.expedition?.travelerIndex===chapter.index,present=['offer','active'].includes(game.state.travelers[chapter.index].phase),report=game.expeditionChapterReport(chapter.index,chapter.jobTier),draft=game.state.expeditionChapterDraft?.chapterId===chapter.id,button=document.createElement('button'),name=document.createElement('strong'),detail=document.createElement('small'),status=document.createElement('small');button.type='button';button.className='expedition-chapter-card'+(report?' ready':'');name.textContent='Tier '+chapter.tier+' · '+chapter.job;detail.textContent=traveler.name+' · '+chapter.routes.length+' unlocked '+(chapter.routes.length===1?'route':'routes');status.textContent=report?'Ready to continue · read '+traveler.name+"'s trip report":active?'Expedition underway · read the chapter while it runs':draft?'Route saved · resume before dispatch':present?'Chapter ready · choose a route and dispatch':'Read now; dispatch when '+traveler.name+' is in the shop';button.append(name,detail,status);button.onclick=report?()=>openExpeditionChapterReport(report):()=>openExpeditionChapter(chapter.index,chapter.jobTier);list.append(button);}
}
let expeditionStep=1,expeditionFilter='all',expeditionBusy=false;
const expeditionSelections=new Map(),expeditionRouteSelections=new Map();
function expeditionDispatchReasons(index,tier,family){
 const s=game.state,t=s.travelers[index],info=game.combinedExpeditionInfo(index,tier),reasons=[];
 if(s.expedition)reasons.push('An expedition is already in progress. Wait for it to return.');
 if(s.request)reasons.push('A previous request is still running. Wait for it to return.');
 if(!['offer','active'].includes(t.phase))reasons.push(TRAVELERS[index].name+' is not in the shop with a live potion order.');
 if(t.level<info.level)reasons.push('Visitor level '+info.level+' required (currently '+t.level+').');
 if(tier>Math.max(...s.tiers))reasons.push('Unlock material tier '+(tier+1)+' in any family.');
 if(family<0)reasons.push('Prepare a story route first.');
 else if(s.tiers[family]<tier)reasons.push('Unlock '+FAMILIES[family].label+' material tier '+(tier+1)+'.');
 if(s.coins<info.cost)reasons.push('Need '+fmt(info.cost-s.coins)+' more gold.');
 return reasons;
}
function expeditionAvailability(index){
 const s=game.state,t=s.travelers[index],info=game.combinedExpeditionInfo(index,0);
 if(s.expedition?.travelerIndex===index)return 'Expedition in progress';
 if(!['offer','active'].includes(t.phase))return t.phase==='returning'?'Returning with order rewards':t.phase==='complete'?'Order reward ready':t.phase==='failed'?'Order ended · not dispatchable':'Not in shop';
 if(s.expedition||s.request)return 'In shop · another trip is running';
 if(t.level<info.level)return 'Visitor level '+info.level+' required';
 if(s.coins<info.cost)return 'In shop · needs more gold';
 return 'Available for dispatch';
}
function rememberExpeditionSelection(){expeditionSelections.set(expeditionTraveler,{tier:expeditionTier,family:expeditionFamily});if(expeditionFamily>=0)expeditionRouteSelections.set(expeditionTraveler+':'+expeditionTier,expeditionFamily);}
function selectExpeditionVisitor(index){
 rememberExpeditionSelection();expeditionTraveler=index;const previous=expeditionSelections.get(index);
 expeditionTier=previous?.tier??0;expeditionFamily=previous?.family??-1;expeditionVisitorOpen=true;expeditionStep=2;expeditionViewKey='';renderExpeditions();$('expedition-job-title').focus({preventScroll:true});
}
function setExpeditionStep(step){
 if(step>1&&!expeditionVisitorOpen)return;
 expeditionStep=step;expeditionViewKey='';renderExpeditions();$('expedition-content').scrollTop=0;if(step===1)$('expedition-picker-title').focus({preventScroll:true});else if(step===3)$('expedition-job-title').focus({preventScroll:true});
}
function expeditionNode(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function renderExpeditions(){
 const s=game.state,active=s.expedition,visitor=TRAVELERS[expeditionTraveler],now=Date.now();
 setText($('expedition-stamp-count'),fmt(s.expeditionStamps));
 setText($('expedition-status'),active?TRAVELERS[active.travelerIndex].name+' · '+duration(Math.max(0,active.readyAt-now))+' remaining · continues while the game is closed':s.request?'A previous request is running. Story preparation is still available.':'Story preparation is free. Dispatch starts the timer and charges gold.');
 const key=JSON.stringify([expeditionStep,expeditionFilter,expeditionVisitorOpen,expeditionTraveler,expeditionTier,expeditionFamily,s.coins,s.tiers,s.travelers.map(t=>[t.phase,t.level]),active,s.request,s.expeditionChapterDraft,s.expeditionStories,s.fairies,s.fairySearchMisses,s.expeditionStamps,window.brewerCharacter]);
 if(key===expeditionViewKey)return;expeditionViewKey=key;
 const stepButtons=$('expedition-steps').querySelectorAll('button');stepButtons.forEach((button,i)=>{const step=i+1;button.disabled=step>1&&!expeditionVisitorOpen;button.setAttribute('aria-current',step===expeditionStep?'step':'false');button.dataset.state=step===expeditionStep?'current':step<expeditionStep?'complete':'upcoming';button.querySelector('b').textContent=step<expeditionStep?'✓':String(step);button.setAttribute('aria-label','Step '+step+': '+['Choose Visitor','Choose Expedition','Prepare and Dispatch'][i]+', '+button.dataset.state);});
 $('expedition-picker').hidden=expeditionStep!==1;$('expedition-workspace').hidden=expeditionStep===1;
 $('expedition-back').hidden=expeditionStep===1;$('expedition-back').textContent=expeditionStep===3?'← Expeditions':'← Visitors';
 $('expedition-selection').hidden=!expeditionVisitorOpen;
 setText($('expedition-selection'),visitor.name+' · Tier '+(expeditionTier+1)+' · '+EXPEDITION_JOBS[visitor.id][expeditionTier].name);
 const grid=$('expedition-visitors');grid.replaceChildren();let shown=0;
 TRAVELERS.forEach((traveler,index)=>{
  const status=expeditionAvailability(index);if(expeditionFilter==='available'&&status!=='Available for dispatch')return;shown++;
  const button=expeditionNode('button','expedition-roster-card'+(expeditionVisitorOpen&&index===expeditionTraveler?' selected':'')),image=expeditionNode('img'),copy=expeditionNode('span'),name=expeditionNode('strong','',(expeditionVisitorOpen&&index===expeditionTraveler?'✓ ':'')+traveler.name),detail=expeditionNode('small','',status),level=expeditionNode('small','','Visitor level '+s.travelers[index].level);
  button.type='button';button.dataset.visitor=traveler.id;button.setAttribute('aria-pressed',String(expeditionVisitorOpen&&index===expeditionTraveler));image.src=art(traveler.portrait);image.alt='';copy.append(name,detail,level);button.append(image,copy);button.onclick=()=>selectExpeditionVisitor(index);grid.append(button);
 });
 $('expedition-roster-empty').hidden=shown>0;
 for(const button of $('expedition-filters').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.filter===expeditionFilter));
 const action=$('expedition-dispatch');action.onclick=null;action.disabled=false;
 if(expeditionStep===1){setText($('expedition-action-state'),'Choose a visitor to explore their expeditions.');setText($('expedition-action-cost'),'You can prepare stories even when a visitor is away.');action.textContent='Choose a visitor';action.disabled=true;$('expedition-dispatch-warning').hidden=true;return;}
 const maxTier=Math.max(...s.tiers),info=game.combinedExpeditionInfo(expeditionTraveler,expeditionTier),job=EXPEDITION_JOBS[visitor.id][expeditionTier],unlocked=expeditionTier<=maxTier,chapter=game.expeditionChapter(expeditionTraveler,expeditionTier),draft=s.expeditionChapterDraft;
 const route=chapter?(draft?.chapterId===chapter.id?chapter.routes.find(r=>r.family===draft.family):null):null;
 const family=chapter?(route?.family??-1):expeditionFamily;
 const reasons=expeditionDispatchReasons(expeditionTraveler,expeditionTier,family);
 $('expedition-portrait').src=art(visitor.portrait);$('expedition-portrait').alt='';setText($('expedition-name'),visitor.name);setText($('expedition-visitor-status'),expeditionAvailability(expeditionTraveler));
 setText($('expedition-intro'),EXPEDITION_PROFILES[expeditionTraveler][0]);setText($('expedition-greeting'),EXPEDITION_PROFILES[expeditionTraveler][window.brewerCharacter==='Tia'?2:1]);
 const quests=$('expedition-quests'),future=$('expedition-future-list');quests.replaceChildren();future.replaceChildren();
 for(let tier=0;tier<25;tier++){
  const entry=EXPEDITION_JOBS[visitor.id][tier],details=game.combinedExpeditionInfo(expeditionTraveler,tier),locked=tier>maxTier,selected=tier===expeditionTier,report=game.expeditionChapterReport(expeditionTraveler,tier);
  const button=expeditionNode('button','expedition-job-card'+(locked?' locked':'')+(selected?' selected':'')),name=expeditionNode('strong','',entry.name),status=expeditionNode('small','',report?'Report ready to read':locked?'Locked · reach material tier '+(tier+1):'Unlocked · '+(s.expedition||s.request?'trip already running':!['offer','active'].includes(s.travelers[expeditionTraveler].phase)?'visitor away':s.coins<details.cost?'more gold needed':'ready to prepare')+(selected?' · Selected':'')),meta=expeditionNode('span','expedition-job-meta','Tier '+(tier+1)+' · '+duration(details.duration)+' · '+fmt(details.cost)+' gold');
  button.type='button';button.dataset.tier=String(tier);button.setAttribute('aria-pressed',String(selected));button.append(name,status,meta);
  button.onclick=()=>{rememberExpeditionSelection();expeditionTier=tier;expeditionFamily=expeditionRouteSelections.get(expeditionTraveler+':'+tier)??expeditionFamily;if(s.tiers[expeditionFamily]<tier)expeditionFamily=-1;rememberExpeditionSelection();setExpeditionStep(2);$('expedition-job-title').focus({preventScroll:true});};(locked?future:quests).append(button);
 }
 $('expedition-future').hidden=maxTier>=24;setText($('expedition-future-label'),'Future expeditions · '+Math.max(0,24-maxTier)+' locked');
 setText($('expedition-job-title'),job.name);setText($('expedition-job-summary'),'Tier '+(expeditionTier+1)+' · '+duration(info.duration)+' · '+fmt(info.cost)+' gold');
 setText($('expedition-job-description'),job.description);
 const requirements=$('expedition-requirements');requirements.replaceChildren();
 for(const text of ['Material tier '+(expeditionTier+1)+' in the chosen family','Visitor level '+info.level+' · currently '+s.travelers[expeditionTraveler].level,'A live potion order from '+visitor.name,'One expedition at a time'])requirements.append(expeditionNode('li','',text));
 const rewards=$('expedition-job-rewards-info');rewards.replaceChildren();
 const guaranteed=expeditionNode('p','','Guaranteed: '+fmt(info.stamps)+' stamps · '+info.likeability+' likeability');rewards.append(guaranteed);
 for(const [kind,amount] of Object.entries(info.boostBundle)){const text={protection:'failure protection charges',enhancement:'enhancement boost charges',selling:'selling boost charges'}[kind];rewards.append(expeditionNode('p','',amount+' '+text));}
 const names=info.fairyPool.map(id=>FAIRIES.find(f=>f.id===id)?.name).filter(Boolean);
 rewards.append(expeditionNode('p','',names.length?'Fairy: '+Math.round(info.fairyChance*100)+'% chance · '+names.join(', '):'Fairy: no eligible fairy remains in this pool.'));
 rewards.append(expeditionNode('p','','Extra reward: '+Math.round(info.bonusChance*100)+'% chance for '+info.bonus.amount+' '+info.bonus.currency+'.'));
 $('expedition-preparation').hidden=expeditionStep!==3||!unlocked;
 const report=game.expeditionChapterReport(expeditionTraveler,expeditionTier);$('expedition-read-report').hidden=!report;$('expedition-read-report').onclick=()=>{if(report)openExpeditionChapterReport(report);};
 const storyButton=$('expedition-prepare-story');storyButton.hidden=!chapter;storyButton.textContent=route?'Read or change story route':'Read chapter & choose route';storyButton.onclick=()=>openExpeditionChapter(expeditionTraveler,expeditionTier,true);
 setText($('expedition-route-state'),family>=0?'Route ready · '+FAMILIES[family].materials[expeditionTier].name+' ('+FAMILIES[family].label+')':chapter?'Choose a route in the chapter. Your choice is saved without charging gold.':'Choose the material that shapes this trip’s story. It is not a material reward.');
 const options=$('expedition-material-options');options.replaceChildren();options.hidden=!!chapter;
 if(!chapter)FAMILIES.forEach((f,i)=>{const locked=s.tiers[i]<expeditionTier,button=expeditionNode('button','expedition-material-option'+(i===family?' selected':''));button.type='button';button.disabled=locked;button.setAttribute('aria-pressed',String(i===family));button.dataset.family=String(i);button.append(expeditionNode('strong','',f.label),expeditionNode('small','',locked?'Unlock material tier '+(expeditionTier+1):f.materials[expeditionTier].name));button.onclick=()=>{expeditionFamily=i;rememberExpeditionSelection();expeditionViewKey='';renderExpeditions();$('expedition-material-options').querySelector('[data-family="'+i+'"]').focus({preventScroll:true});};options.append(button);});
 $('expedition-story-preview').hidden=!!chapter;updateExpeditionStoryPreview(family>=0?FAMILIES[family].materials[expeditionTier]:null);
 const list=$('expedition-dispatch-reasons');list.replaceChildren();for(const reason of reasons)list.append(expeditionNode('li','',reason));
 $('expedition-dispatch-warning').hidden=expeditionStep!==3;
 setText($('expedition-action-cost'),fmt(info.cost)+' gold · '+duration(info.duration)+(expeditionStep===3?' · charged only on dispatch':''));
 if(expeditionStep===2){setText($('expedition-action-state'),unlocked?'Expedition selected. Prepare a story route next.':'Locked · reach material tier '+(expeditionTier+1)+' in any family.');action.textContent='Prepare story & dispatch';action.disabled=!unlocked;action.onclick=()=>setExpeditionStep(3);}
 else{setText($('expedition-action-state'),reasons.length?'Dispatch unavailable · '+reasons[0]:'Ready to dispatch '+visitor.name+'.');action.textContent='Dispatch · '+fmt(info.cost)+' gold';action.disabled=!!reasons.length||expeditionBusy;action.onclick=()=>{
   if(expeditionBusy||expeditionDispatchReasons(expeditionTraveler,expeditionTier,family).length)return;
   expeditionBusy=true;action.disabled=true;
   try{if(game.dispatchCombinedExpedition(expeditionTraveler,expeditionTier,family)){if(chapter)game.clearExpeditionChapterDraft(chapter.id);save(true);notice(visitor.name+' departed on '+job.name+'. Trips continue while the game is closed.','success');render();}}
   finally{expeditionBusy=false;expeditionViewKey='';renderExpeditions();}
  };}
 rememberExpeditionSelection();
}
$('expedition-steps').querySelectorAll('button').forEach((button,i)=>button.onclick=()=>setExpeditionStep(i+1));
$('expedition-filters').querySelectorAll('button').forEach(button=>button.onclick=()=>{expeditionFilter=button.dataset.filter;expeditionViewKey='';renderExpeditions();});
$('expedition-change-visitor').onclick=()=>setExpeditionStep(1);
function prepareExpeditionReturn(dialog){const back=dialog.querySelector('[data-back-to-menu]');if(!back)return;const parent=$('expedition-story-dialog').open?$('expedition-story-dialog'):$('expedition-dialog');back.textContent=parent.open?'← '+(parent.id==='expedition-dialog'?'Visitor Expeditions':'Story'):'← Back to menu';back.onclick=()=>{dialog.close();if(!parent.open)$('game-menu-open').click();};}


function renderStampExchange(){setText($('stamp-balance'),fmt(game.state.expeditionStamps)+' expedition stamps');const grid=$('stamp-offers');grid.replaceChildren();for(const offer of game.stampOffers()){const card=document.createElement('section'),title=document.createElement('h3'),note=document.createElement('p'),button=document.createElement('button');card.className='commission-card pm-card';renderRewardChips(title,[{kind:offer.id.startsWith('fairy-')?'fairy':offer.id==='tickets'?'tickets':offer.id.slice(6),amount:1,name:offer.id.startsWith('fairy-')?offer.name:''}]);const locked=Math.min(...game.state.tiers)+1<offer.tier,maxed=offer.id.startsWith('fairy-')&&game.fairyLevel(offer.id)>=10;note.textContent=offer.cost+' stamps · Requires all three material families at tier '+offer.tier;button.textContent=locked?'Material tier locked':maxed?'Fairy maxed':'Exchange · '+offer.cost;button.disabled=locked||maxed||game.state.expeditionStamps<offer.cost;button.onclick=()=>{if(game.redeemStamps(offer.id)){save(true);render();renderStampExchange();notice(offer.name+' received from the Stamp Exchange.','success');}};card.append(title,note,button);grid.append(card);}}
$('stamp-exchange-open').onclick=()=>{prepareExpeditionReturn($('stamp-dialog'));renderStampExchange();$('stamp-dialog').showModal();};
function openVisitorExpedition(index){selectExpeditionVisitor(index);if($('visitor-order-dialog').open)$('visitor-order-dialog').close();renderExpeditions();$('expedition-dialog').showModal();}
$('expeditions-menu').onclick=()=>{expeditionStep=1;expeditionViewKey='';renderExpeditions();$('expedition-dialog').showModal();};
$('expedition-back').onclick=()=>setExpeditionStep(expeditionStep===3?2:1);
// Posted customers are presentation only; they do not require a timed traveler visit.
function commissionCustomer(family){return [
 {traveler:TRAVELERS[0],role:'Shrine cleric',purpose:'Restock the shrine’s care shelf for pilgrims and garden volunteers.'},
 {traveler:TRAVELERS[4],role:'Wizard',purpose:'Prepare a reserve for Luke’s magic and the familiars in his care.'},
 {traveler:TRAVELERS[8],role:'Baker',purpose:'Keep Daisy’s bakery supplied through the early morning shift.'}
][family];}
function commissionDeliveryStatus(c){
 const p=game.state.potion;
 if(game.state.eventRush.eventPotion)return 'An event bottle is in the cauldron. Deliver it through the event first.';
 if(game.enhancementPending)return 'Enhancement is still in progress. Wait for the result.';
 if(!p)return 'The cauldron is empty. Brew the requested potion to continue.';
 if(p.family!==c.family||p.tier!==c.tier)return 'The current potion is a different recipe. Keep it or sell it, then brew the requested potion.';
 if(p.level+1<c.level)return `Current potion: Lv. ${p.level+1}. Enhance it to Lv. ${c.level} or higher.`;
 return game.canDeliverCommission()?'The current potion qualifies. Hand it over instead of selling it.':'A reward balance is full. Make room before the final delivery.';
}
function renderRequestBoard(){
 const c=game.state.commission;let offers;
 if(!c&&!game.state.commissionTiers){offers=game.commissionOffers();save(true);}
 const s=game.state,key=JSON.stringify([s.commission,s.commissionTiers,s.commissionsCompleted,s.fairies,s.request,s.potion?.family,s.potion?.tier,s.potion?.level,!!game.enhancementPending,!!s.eventRush.eventPotion,game.canDeliverCommission()]);
 if(renderRequestBoard.state===s&&renderRequestBoard.key===key)return;
 renderRequestBoard.state=s;renderRequestBoard.key=key;
 const box=$('commission-board');box.replaceChildren();
 $('request-status').textContent=(c?'Your active commission':'Choose one written request')+' · '+fmt(game.state.commissionsCompleted)+' completed'+(game.state.request?' · '+requestStatusText():'');
 for(const offer of c?[c]:offers||game.commissionOffers()){
  const family=FAMILIES[offer.family],recipe=family.recipes[offer.tier],reward=game.commissionRewards(offer),customer=commissionCustomer(offer.family);
  const card=document.createElement('section'),header=document.createElement('div'),portrait=document.createElement('img'),identity=document.createElement('div'),title=document.createElement('h3'),role=document.createElement('p'),purpose=document.createElement('p');
  card.className='commission-card pm-card commission-request';card.dataset.family=offer.family;
  header.className='commission-customer';portrait.className='commission-portrait';portrait.src=art(customer.traveler.portrait);portrait.alt='';
  title.textContent=customer.traveler.name;title.id='commission-customer-'+offer.family;card.setAttribute('aria-labelledby',title.id);
  role.className='small muted';role.textContent=customer.role;identity.append(title,role);header.append(portrait,identity);
  purpose.className='commission-purpose';purpose.textContent=customer.purpose;
  const requirement=document.createElement('div'),image=document.createElement('img'),details=document.createElement('div'),familyLabel=document.createElement('p'),potionLabel=document.createElement('h4'),amount=document.createElement('p'),level=document.createElement('strong');
  requirement.className='commission-requirement';image.src=art(recipe.image);image.alt='';image.className='commission-potion';familyLabel.className='small muted';familyLabel.textContent=family.label+' potion · Tier '+(offer.tier+1);potionLabel.textContent=recipe.name;
  amount.textContent=`${offer.quantity} bottles · `;level.className='commission-level';level.textContent=`Lv. ${offer.level} or higher, each`;amount.append(level);details.append(familyLabel,potionLabel,amount);requirement.append(details,image);
  const prize=document.createElement('div'),prizeTitle=document.createElement('p');prize.className='commission-rewards';prizeTitle.className='small muted';prizeTitle.textContent='Guaranteed on completion';prize.append(prizeTitle);
  const rewardRows=[{kind:'likeability',amount:reward.likeability,label:'Shop likeability'},{kind:reward.boost,amount:reward.amount,label:{protection:'Failure protection',enhancement:'Enhancement bonus',selling:'Double-sale boost'}[reward.boost]}];
  if(reward.fairyId)rewardRows.push({kind:'fairy',amount:1,name:FAIRIES.find(f=>f.id===reward.fairyId).name,label:FAIRIES.find(f=>f.id===reward.fairyId).name+' · Fairy copy'});
  for(const row of rewardRows){const line=document.createElement('p');line.append(rewardChip(row.kind,row.amount,row.name),document.createTextNode(' '+row.label));prize.append(line);}
  card.append(header,purpose,requirement,prize);
  if(c){const label=document.createElement('p'),progress=document.createElement('progress');label.className='commission-progress-label';label.id='commission-delivered';label.textContent=`Delivered ${c.delivered} / ${c.quantity} bottles`;progress.max=c.quantity;progress.value=c.delivered;progress.setAttribute('aria-labelledby',label.id);card.append(label,progress);}
  const status=document.createElement('p'),button=document.createElement('button');status.className='commission-delivery-status small muted';status.id='commission-status-'+offer.family;
  status.textContent=c?commissionDeliveryStatus(c):game.state.request?'Finish the expedition already in progress before accepting.':'Ready to accept';
  button.className='primary';button.textContent=c?'Hand over current potion':'Accept commission';button.disabled=c?!game.canDeliverCommission():!!game.state.request;button.setAttribute('aria-describedby',status.id);
  button.onclick=()=>{if(c)handOverCommission();else if(game.acceptCommission(offer.family)){save(true);render();}};
  card.append(status,button);box.append(card);
 }
 const note=document.createElement('p');note.className='small muted';note.textContent='Handed-over bottles are consumed without sale coins. Higher levels qualify for the same reward. Finish your commission to refresh the choices; timed traveler orders remain separate.';box.append(note);
}
function handOverCommission(){const result=game.deliverCommission();if(!result)return;notice(result.complete?'Commission complete! Boosts and likeability awarded'+(result.fairyId?' · '+FAIRIES.find(f=>f.id===result.fairyId).name+' joined your collection':'')+'.':`Potion handed over: ${result.delivered} / ${result.quantity}.`,'success');save(true);render();updateBeltLabels();}

$('commission-shortcut').onclick=()=>{if(game.canDeliverCommission())handOverCommission();else{renderRequestBoard();$('request-dialog').showModal();}};
function requestStatusText(){const active=game.state.request;if(!active)return'';return`${TRAVELERS[active.travelerIndex].name} is away on ${REQUESTS.find(r=>r.id===active.requestId).name}. Time left: ${duration(Math.max(0,active.readyAt-Date.now()))}.`;}
function updateRequestIndicator(){const el=$('request-current'),c=game.state.commission,active=game.state.request;el.hidden=!active&&!c;setText(el,c?`Commission: ${c.delivered} / ${c.quantity} ${FAMILIES[c.family].recipes[c.tier].name} · Lv. ${c.level}+`:active?requestStatusText():'');const shortcut=$('commission-shortcut'),ready=game.canDeliverCommission();setText($('commission-progress'),c?(ready?'Deliver · ':'')+`${c.delivered} / ${c.quantity}`:'');shortcut.classList.toggle('ready',ready);shortcut.title=c?`${ready?'Deliver now · ':''}${c.delivered} / ${c.quantity} · Lv. ${c.level}+ ${FAMILIES[c.family].recipes[c.tier].name}`:'View potion commissions';shortcut.setAttribute('aria-label',shortcut.title);}
function visitorRewardDescription(reward){const parts=[],r=reward?.boost;if(r)parts.push(`${r.amount} ${r.type==='protection'?'failure protection':r.type==='enhancement'?'enhancement bonus':'selling bonus'} ${r.amount===1?'charge':'charges'}`);if(reward?.tickets)parts.push(`${reward.tickets} Pushcat tickets`);if(reward?.rubies)parts.push(`${reward.rubies} ${reward.rubies===1?'ruby':'rubies'}`);if(reward?.fairyId)parts.push(FAIRIES.find(f=>f.id===reward.fairyId)?.name||'fairy');return parts.join(' · ')||'No pending reward';}
function visitorRewardText(t,state){return visitorRewardDescription({boost:state.rewardBoost,tickets:state.rewardTickets,rubies:state.rewardRubies,fairyId:state.rewardFairyId});}
function rewardArrivalText(e){return `${e.traveler.name} returned: ${visitorRewardDescription(e.reward)}.`;}

function duration(ms){const seconds=Math.floor(ms/1000),h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60);return `${h}h ${m}m ${seconds%60}s`;}
function savedTime(ms){const seconds=ms/1000;return (Number.isInteger(seconds)?seconds.toFixed(0):seconds.toFixed(1))+'s';}
function masteredPotionCount(){syncMasteryStars(game.state);return game.state.masteryStars.length;}
function visibleOriginalAchievementTiers(progress){
 const chains=new Map();
 for(const p of progress){
  // Fairy acquisitions are separate goals; other conditions form increasing milestone tiers.
  const key=p.row.Condition===16?'fairy-'+p.row.ConditionSpecificId:p.row.Condition;
  if(!chains.has(key))chains.set(key,[]);chains.get(key).push(p);
 }
 return Array.from(chains.values(),chain=>{chain.sort((a,b)=>a.target-b.target||a.row.Id-b.row.Id);return chain.find(p=>!p.claimed)||chain[chain.length-1];});
}
let achievementSection='original',originalAchievementGroup='All',selectedAchievement=null;
const achievementViews={original:{status:'all',sort:'default',search:'',page:0},mastery:{status:'all',sort:'default',search:'',page:0}};
function achievementPageSize(){return window.innerWidth<=600?2:window.innerWidth<1000?(window.innerHeight<900?4:6):window.innerHeight<900?6:9;}
function achievementExact(value){return value.toLocaleString('en-US',{maximumFractionDigits:2});}
function achievementRecords(section){
 if(section==='original')return ORIGINAL_ACHIEVEMENTS.map((row,order)=>{const p=game.originalAchievementProgress(row.Id);return{...p,type:'original',id:row.Id,title:row.title,name:row.title,group:row.group,order,state:p.claimed?'completed':p.claimable?'claimable':!p.prerequisite?'locked':'progress',icon:'AchievementIcon.png',claimIndex:game.state.originalAchievements.claimed.indexOf(row.Id)};});
 const stars=new Set(game.state.masteryStars),items=[];
 FAMILIES.forEach((family,f)=>family.recipes.forEach((recipe,tier)=>{const id=f+'-'+tier,record=game.state.metrics.recipes[id],current=record?.highestLevel||0,earned=stars.has(id)||current>=recipe.max_level,entry=ACHIEVEMENT_LORE.entries[id];items.push({type:'mastery',id,family:f,tier,recipe,entry,record,current,target:recipe.max_level,earned,claimable:false,title:entry.title,name:recipe.name,group:family.label,order:f*25+tier,state:earned?'completed':tier>game.state.tiers[f]?'locked':'progress',icon:recipe.image,legacy:earned&&!current});}));
 return items;
}
function achievementRatio(item){return item.earned?1:Math.max(0,Math.min(1,item.current/Math.max(1,item.target)));}
function achievementStatus(item){return{claimable:'Ready to Claim',completed:item.type==='original'?'Reward Claimed':'Mastery Earned',locked:item.type==='original'?'Prerequisite Required':'Material Tier Locked',progress:'In Progress'}[item.state];}
function achievementProgressText(item){return item.legacy?'Mastery recorded':achievementExact(Math.min(item.earned?item.target:item.current,item.target))+' / '+achievementExact(item.target)+(item.type==='mastery'?' levels':'');}
function achievementElement(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function achievementProgress(item){const meter=document.createElement('progress');meter.max=Math.max(1,item.target);meter.value=achievementRatio(item)*meter.max;meter.setAttribute('aria-label',item.name+' progress');meter.setAttribute('aria-valuetext',achievementProgressText(item)+' · '+Math.round(achievementRatio(item)*1000)/10+'%');return meter;}
function achievementRewards(row){const rewards=achievementElement('span','achievement-rewards');for(const [amount,label,icon] of [[row.RewardRuby,'Rubies','Gem.png'],[row.RewardTicket,'Tickets','Nyan-Ticket.png']]){if(!amount)continue;const reward=achievementElement('span','achievement-reward'),image=document.createElement('img');image.src=art(icon);image.alt='';reward.append(image,document.createTextNode(achievementExact(amount)+' '+(amount===1?(label==='Rubies'?'Ruby':'Ticket'):label)));rewards.append(reward);}if(!rewards.children.length)rewards.textContent='No currency reward';return rewards;}
function achievementClaimBlocked(item){return saveBlocked?'Saving is blocked':game.state.rubies>Number.MAX_SAFE_INTEGER-item.row.RewardRuby||game.state.tickets>Number.MAX_SAFE_INTEGER-item.row.RewardTicket?'Currency capacity reached':'';}
function claimAchievementReward(id){
 const p=visibleOriginalAchievementTiers(ORIGINAL_ACHIEVEMENTS.map(row=>game.originalAchievementProgress(row.Id))).find(p=>p.row.Id===id);
 if(!p?.claimable||achievementClaimBlocked(p))return false;
 const focusInGrid=$('achievement-grid').contains(document.activeElement),before={rubies:game.state.rubies,tickets:game.state.tickets,claimed:[...game.state.originalAchievements.claimed]};
 if(!game.claimOriginalAchievement(id))return false;save(true);
 if(!saveOK||saveBlocked){game.state.rubies=before.rubies;game.state.tickets=before.tickets;game.state.originalAchievements.claimed=before.claimed;saveDirty=true;notice('Could not save the reward. Please try again.','failure');}
 else notice(p.row.title+' · '+p.row.RewardRuby+' rubies and '+p.row.RewardTicket+' tickets claimed.','success');
 render();if(focusInGrid)$('achievement-grid').querySelector('.achievement-claim:not(:disabled),.achievement-open')?.focus({preventScroll:true});return saveOK&&!saveBlocked;
}
function achievementDetailItem(){
 if(!selectedAchievement)return null;const items=achievementRecords(selectedAchievement.type),item=items.find(i=>String(i.id)===String(selectedAchievement.id));if(!item)return null;
 if(item.type==='original'&&!item.claimed&&!visibleOriginalAchievementTiers(items).some(i=>i.id===item.id))return null;
 return item;
}
function openAchievementDetail(item){selectedAchievement={type:item.type,id:item.id};renderAchievementDetail();$('achievement-detail-dialog').showModal();}
function renderAchievementDetail(){
 const item=achievementDetailItem();if(!item){if($('achievement-detail-dialog').open)$('achievement-detail-dialog').close();return;}
 setText($('achievement-detail-context'),(item.type==='original'?'Original Achievements':'Potion Mastery')+' · '+item.group);setText($('achievement-detail-title'),item.title);
 const body=$('achievement-detail-body');body.replaceChildren();const image=document.createElement('img');image.className='achievement-detail-sprite';image.src=art(item.icon);image.alt='';body.append(image);
 if(item.type==='mastery')body.append(achievementElement('h3','achievement-detail-potion',item.name));
 body.append(achievementElement('p','achievement-full-description',item.type==='original'?item.row.description:item.entry.lore||''));
 const stats=achievementElement('dl','achievement-detail-stats');const rows=[['Status',achievementStatus(item)],[item.type==='original'?'Tracked progress':'Highest recorded enhancement',item.legacy?'Unavailable in this save':achievementExact(item.current)],['Requirement',item.type==='original'?achievementExact(item.target):'Level '+item.target+' · maximum enhancement']];
 for(const [label,value] of rows){const row=document.createElement('div');row.append(achievementElement('dt','',label),achievementElement('dd','',value));stats.append(row);}body.append(stats,achievementProgress(item));
 if(item.type==='original'){
  const requirements=achievementElement('section','achievement-detail-section');requirements.append(achievementElement('h3','','Requirements'));const list=document.createElement('ul');
  if(item.row.PrerequisiteAchivementId){const prerequisite=ORIGINAL_ACHIEVEMENTS.find(r=>r.Id===item.row.PrerequisiteAchivementId);list.append(achievementElement('li','','Prerequisite: '+prerequisite.title+(item.prerequisite?' · earned':' · not yet earned')));}if(list.children.length){requirements.append(list);body.append(requirements);}body.append(achievementElement('h3','','Reward'),achievementRewards(item.row));
  if(item.row.adapted)body.append(achievementElement('p','achievement-context-note','Adapted expedition milestone · original request: '+item.row.originalRequest));else if(!item.row.originalTitle)body.append(achievementElement('p','achievement-context-note','Descriptive title: the APK has no English title for this entry.'));
 }else{body.append(achievementElement('p','achievement-context-note','Enhance '+item.name+' to its existing maximum level to earn mastery automatically. No separate reward claim is required.'));if(item.state==='locked')body.append(achievementElement('p','achievement-context-note','Unlock '+item.group+' materials at tier '+(item.tier+1)+' to brew this potion.'));if(item.legacy)body.append(achievementElement('p','achievement-context-note','Mastery is recorded in this save, but its detailed enhancement history is unavailable.'));}
 if(game.state.metrics.historyPartial)body.append(achievementElement('p','achievement-context-note','Older saved totals are preserved. Some detailed tracking may be incomplete.'));
 const claim=$('achievement-detail-claim');claim.hidden=item.type!=='original';if(item.type==='original'){const blocked=achievementClaimBlocked(item);claim.disabled=!item.claimable||!!blocked;claim.textContent=item.claimed?'Reward Claimed':blocked||'Claim Reward';claim.onclick=()=>claimAchievementReward(item.id);}
 setText($('achievement-detail-state'),achievementStatus(item));
}
function renderAchievements(){
 const original=achievementRecords('original'),mastery=achievementRecords('mastery'),current=visibleOriginalAchievementTiers(original),view=achievementViews[achievementSection],pageSize=achievementPageSize();
 setText($('achievement-original-count'),original.filter(i=>i.earned).length+' / '+original.length);setText($('achievement-mastery-count'),mastery.filter(i=>i.earned).length+' / '+mastery.length);
 const ready=current.filter(i=>i.claimable).length;setText($('achievement-ready-count'),ready+(ready===1?' reward ready':' rewards ready'));$('achievement-ready-count').disabled=!ready;
 for(const button of document.querySelectorAll('[data-achievement-section]'))button.setAttribute('aria-pressed',String(button.dataset.achievementSection===achievementSection));
 const filters=$('achievement-filters');filters.replaceChildren();const groups=achievementSection==='original'?['All',...new Set(ORIGINAL_ACHIEVEMENTS.map(r=>r.group))]:['All',...FAMILIES.map(f=>f.label)];
 for(const [index,group] of groups.entries()){const selected=achievementSection==='original'?originalAchievementGroup===group:achievementFamily===index-1,button=achievementElement('button',selected?'active':'',group);button.type='button';button.setAttribute('aria-pressed',String(selected));button.dataset.group=group;button.onclick=()=>{if(achievementSection==='original')originalAchievementGroup=group;else achievementFamily=index-1;view.page=0;renderAchievements();Array.from($('achievement-filters').children).find(n=>n.dataset.group===group)?.focus({preventScroll:true});};filters.append(button);}
 for(const button of document.querySelectorAll('[data-achievement-status]')){button.hidden=achievementSection==='mastery'&&button.dataset.achievementStatus==='claimable';button.setAttribute('aria-pressed',String(button.dataset.achievementStatus===view.status));}
 const sort=$('achievement-sort');sort.replaceChildren();for(const [value,label] of [['default','Default order'],['closest','Closest to completion'],...(achievementSection==='original'?[['claimed','Recently claimed']]:[])]){const option=document.createElement('option');option.value=value;option.textContent=label;sort.append(option);}sort.value=view.sort;if($('achievement-search').value!==view.search)$('achievement-search').value=view.search;
 let items=achievementSection==='original'?(view.status==='completed'?original.filter(i=>i.claimed):current):mastery;
 const query=view.search.trim().toLowerCase();items=items.filter(i=>(achievementSection==='original'?(originalAchievementGroup==='All'||i.group===originalAchievementGroup):(achievementFamily<0||i.family===achievementFamily))&&(view.status==='all'||i.state===view.status)&&( !query||[i.name,i.title,i.type==='original'?i.row.description:i.entry.lore].join(' ').toLowerCase().includes(query)));
 const priority=i=>i.claimable?0:i.state==='progress'?1:i.state==='locked'?2:3;
 items=[...items].sort(view.sort==='closest'?(a,b)=>Number(b.claimable)-Number(a.claimable)||Number(a.state==='locked')-Number(b.state==='locked')||achievementRatio(b)-achievementRatio(a)||a.order-b.order:view.sort==='claimed'?(a,b)=>b.claimIndex-a.claimIndex||a.order-b.order:(a,b)=>priority(a)-priority(b)||a.order-b.order);
 const pages=Math.max(1,Math.ceil(items.length/pageSize));view.page=Math.max(0,Math.min(view.page,pages-1));const grid=$('achievement-grid');grid.replaceChildren();
 for(const item of items.slice(view.page*pageSize,(view.page+1)*pageSize)){
  const card=achievementElement('article','achievement-card achievement-'+item.state),open=achievementElement('button','achievement-open'),heading=achievementElement('span','achievement-card-heading'),image=document.createElement('img'),titles=achievementElement('span','achievement-card-titles');
  card.dataset.achievementId=String(item.id);card.dataset.state=item.state;if(item.type==='mastery')card.style.setProperty('--mastery-color',FAMILIES[item.family].color);if(selectedAchievement?.type===item.type&&String(selectedAchievement.id)===String(item.id))card.classList.add('selected');
  image.src=art(item.icon);image.alt='';titles.append(achievementElement('strong','achievement-card-title',item.name),achievementElement('span','achievement-card-group',item.group+(item.type==='mastery'?' · Tier '+(item.tier+1):'')));heading.append(image,titles);open.type='button';open.append(heading,achievementElement('span','achievement-progress-label',achievementProgressText(item)),achievementProgress(item));
  if(item.type==='original')open.append(achievementRewards(item.row));open.append(achievementElement('span','achievement-state-label',achievementStatus(item)));open.setAttribute('aria-label',item.name+' · '+achievementStatus(item)+' · '+achievementProgressText(item)+'. View full details');open.onclick=()=>openAchievementDetail(item);card.append(open);
  if(item.claimable){const claim=achievementElement('button','achievement-claim primary',achievementClaimBlocked(item)||'Claim Reward');claim.type='button';claim.disabled=!!achievementClaimBlocked(item);claim.onclick=()=>claimAchievementReward(item.id);card.append(claim);}grid.append(card);
 }
 $('achievement-empty').hidden=items.length>0;setText($('achievement-page-label'),'Page '+(view.page+1)+' of '+pages);setText($('achievement-range'),items.length?achievementExact(view.page*pageSize+1)+'–'+achievementExact(Math.min((view.page+1)*pageSize,items.length))+' of '+items.length:'No matching achievements');$('achievement-previous').disabled=view.page===0;$('achievement-next').disabled=view.page>=pages-1;
 setText($('achievement-context'),view.status==='completed'&&achievementSection==='original'?'Claimed history includes earlier tiers. The main view shows the current milestone.':game.state.metrics.historyPartial?'Older saved totals are preserved; some detailed tracking is incomplete.':achievementSection==='original'?'Claim a reward to reveal its next milestone.':'Mastery is earned automatically at maximum enhancement.');
 if($('achievement-detail-dialog').open)renderAchievementDetail();
}
document.querySelectorAll('[data-achievement-section]').forEach(button=>button.onclick=()=>{achievementSection=button.dataset.achievementSection;renderAchievements();});
document.querySelectorAll('[data-achievement-status]').forEach(button=>button.onclick=()=>{const view=achievementViews[achievementSection];view.status=button.dataset.achievementStatus;view.page=0;renderAchievements();});
$('achievement-sort').onchange=()=>{const view=achievementViews[achievementSection];view.sort=$('achievement-sort').value;view.page=0;renderAchievements();};
$('achievement-search').oninput=()=>{const view=achievementViews[achievementSection];view.search=$('achievement-search').value;view.page=0;renderAchievements();};
$('achievement-previous').onclick=()=>{achievementViews[achievementSection].page--;renderAchievements();$('achievement-content').scrollTop=0;};
$('achievement-next').onclick=()=>{achievementViews[achievementSection].page++;renderAchievements();$('achievement-content').scrollTop=0;};
$('achievement-ready-count').onclick=()=>{achievementSection='original';originalAchievementGroup='All';Object.assign(achievementViews.original,{status:'claimable',search:'',page:0});renderAchievements();};
$('achievement-clear-filters').onclick=()=>{originalAchievementGroup='All';achievementFamily=-1;Object.assign(achievementViews[achievementSection],{status:'all',sort:'default',search:'',page:0});renderAchievements();};
$('achievement-detail-dialog').addEventListener('close',()=>{if(!$('achievements-dialog').open)return;const card=Array.from($('achievement-grid').children).find(n=>n.dataset.achievementId===String(selectedAchievement?.id));(card?.querySelector('.achievement-open')||$('achievement-grid').querySelector('.achievement-open')||$('achievement-search')).focus({preventScroll:true});});
let achievementResizeFrame;
window.addEventListener('resize',()=>{cancelAnimationFrame(achievementResizeFrame);achievementResizeFrame=requestAnimationFrame(()=>{if($('achievements-dialog').open)renderAchievements();});});


const statisticSections=new Map();let statisticsDirty=true;
function renderStatistics(){statisticsDirty=false;const v=game.statistics(),m=v.metrics,s=game.state,box=$('statistics-content');setText($('statistics-history'),(m.historyPartial?'Older totals shown below are preserved. Detailed counters cover activity since ':'Detailed counters tracked since ')+new Date(m.since).toLocaleString()+'.');
 function section(title,rows){let cached=statisticSections.get(title);if(!cached){const group=document.createElement('section');group.className='stats-section';const h=document.createElement('h3'),grid=document.createElement('dl');h.textContent=title;grid.className='statistics-grid';group.append(h,grid);box.append(group);cached={grid,values:[]};statisticSections.set(title,cached);}rows.forEach(([label,value],i)=>{let data=cached.values[i];if(!data){const cell=document.createElement('div'),term=document.createElement('dt');term.textContent=label;data=document.createElement('dd');if(label==='Active play time')data.id='statistics-play-time';cell.append(term,data);cached.grid.append(cell);cached.values.push(data);}setText(data,value);});}
 function table(title,headers,rows){let cached=statisticSections.get(title);if(!cached){const group=document.createElement('section');group.className='stats-section';const h=document.createElement('h3'),wrap=document.createElement('div'),table=document.createElement('table'),head=document.createElement('thead'),hr=document.createElement('tr'),body=document.createElement('tbody');h.textContent=title;wrap.className='table-scroll';headers.forEach(label=>{const th=document.createElement('th');th.scope='col';th.textContent=label;hr.append(th);});head.append(hr);table.append(head,body);wrap.append(table);group.append(h,wrap);box.append(group);cached={body,rows:[]};statisticSections.set(title,cached);}rows.forEach((values,i)=>{let cells=cached.rows[i];if(!cells){const row=document.createElement('tr');cells=values.map(()=>{const cell=document.createElement('td');row.append(cell);return cell;});cached.body.append(row);cached.rows.push(cells);}values.forEach((value,j)=>setText(cells[j],value));});while(cached.rows.length>rows.length){cached.rows.pop();cached.body.lastElementChild.remove();}}
 section('Shop totals',[['Coins in purse',fmt(v.coins)],['Potions sold · all saved history',fmt(v.sold)],['Best sale · all saved history',fmt(v.best)+' G'],['Ingredients used · all saved history',fmt(v.ingredients)],['Failed enhancements · all saved history',fmt(v.failed)],['Completed traveler orders · all saved history',fmt(v.questsCompleted)]]);
 section('Brewing and income · tracked history',[['Coins collected from sales',fmt(m.coinsEarned)+' G'],['Coins spent on upgrades',fmt(m.coinsSpent)+' G'],['Potions started',fmt(m.brewsStarted)],['Level 1 potions sold',fmt(m.soldLevelOne)],['Enhancement attempts',fmt(m.enhancementAttempts)],['Successful enhancements',fmt(m.enhancementsSucceeded)],['Failed enhancements',fmt(m.enhancementsFailed)],['Success rate',m.enhancementAttempts?(100*m.enhancementsSucceeded/m.enhancementAttempts).toFixed(1)+'%':'—'],['Protected failures',fmt(m.protectedFailures)],['Potions lost',fmt(m.potionsLost)],['Upgrades purchased',fmt(m.upgradesBought)],['Active play time',duration(m.activePlayMs)]]);
 table('Potion families · tracked history',['Family','Ingredients used','Brews started','Sold','Sales','Best sale','Highest level'],FAMILIES.map((f,i)=>{const r=Object.entries(m.recipes).filter(([key])=>key.startsWith(i+'-')).map(([,r])=>r),sum=k=>r.reduce((a,b)=>a+b[k],0);return[f.label,fmt(m.ingredientsByFamily[i]),fmt(sum('started')),fmt(sum('sold')),fmt(sum('sales'))+' G',fmt(Math.max(0,...r.map(x=>x.best)))+' G',Math.max(0,...r.map(x=>x.highestLevel))||'—'];}));
 section('Orders · tracked history',[['Visitors arrived',fmt(m.questsOffered)],['Orders accepted',fmt(m.questsAccepted)],['Potions delivered',fmt(m.questsDelivered)],['Orders expired',fmt(m.questsFailed)],['Offers declined',fmt(m.questsDeclined)],['Awaiting acceptance',s.travelers.filter(t=>t.phase==='offer').length],['Orders in progress',s.travelers.filter(t=>t.phase==='active').length],['Rewards in transit',s.travelers.filter(t=>t.phase==='returning').length]]);
 table('Visitor records',['Visitor','Level','EXP','Arrivals*','Accepted*','Delivered*','Expired*','Declined*','Completed total'],TRAVELERS.map((t,i)=>{const r=m.visitors[t.id],v=s.travelers[i];return[t.name,v.level,fmt(v.exp),r.offered,r.accepted,r.delivered,r.failed,r.declined,v.quests];}));
 section('Requests and rewards',[['Request coins spent',fmt(s.requestCoinsSpent)+' G'],['Pushcat tickets',fmt(s.tickets)],['Likeability earned · aggregate',fmt(s.likeability)],['Request in progress',s.request?REQUESTS.find(r=>r.id===s.request.requestId).name:'None']]);
 section('Collections and upgrades',[['Potion types brewed',`${v.brewedTypes} / 75`],['Potion recipes unlocked',`${v.unlockedRecipes} / 75`],['Fairy types collected',`${v.fairyTypes} / ${FAIRIES.length}`],['Fairies received',fmt(v.fairiesReceived)],['Duplicate fairies',fmt(v.fairiesReceived-v.fairyTypes)],['Life material level',s.tiers[0]+1],['Mana material level',s.tiers[1]+1],['Stamina material level',s.tiers[2]+1],['Material Emission level',`${s.speed+1} / ${ECONOMY.upgrades.speed.max+1}`],['Enhancement upgrade bonus',`+${(game.luckBonus()*100).toFixed(3)} percentage points`],['Selling upgrade bonus',`+${s.price*ECONOMY.upgrades.price.bonusPerLevel*100}%`],['Total owned upgrade steps',v.upgradesOwned]]);
 section('Pushcat helpers',[['Summons tracked',fmt(s.helperStats.summons)],['Blackcats summoned',fmt(s.helperStats.blackcats)],['Ingredients caught',fmt(s.helperStats.materials)],['Pushcat upgrade level',s.pushcat+1],['Summon milestones','100 / 500 summons: 1 ruby + 5 tickets; 2,000: 1 ruby + 10 tickets (automatic)']]);
 table('Powerups',['Type','Available now','Used in tracked history'],[['Protection',s.powerups.protection,m.powerupsUsed.protection],['Enhancement bonus',s.powerups.enhancement,m.powerupsUsed.enhancement],['Double sale',s.powerups.selling,m.powerupsUsed.selling]]);
 table('Every potion · tracked history',['Potion','Highest level','Started','Sold','Sales','Best sale','Enhancements','Failures'],FAMILIES.flatMap((f,i)=>f.recipes.map((r,t)=>{const rec=m.recipes[i+'-'+t]||{};return[r.name,(rec.highestLevel||'—')+' / '+r.max_level,rec.started||0,rec.sold||0,fmt(rec.sales||0)+' G',fmt(rec.best||0)+' G',rec.enhancements||0,rec.failures||0];})));
 let note=$('statistics-note');if(!note){note=document.createElement('p');note.id='statistics-note';note.className='small muted';box.append(note);}note.textContent='* Detailed visitor counters cover tracked history. Tickets and aggregate likeability are earned through requests. Supported fairy levels and bonuses are active; Pushcat, Blackcat and rubies are not.';
}

const FAIRY_LABELS={'fairy-4':'Faster potion enhancement','fairy-36':'Longer and faster helpers','fairy-37':'Greater Blackcat chance; shorter working time','fairy-43':'Faster helpers and more ingredient value','fairy-behe':'Advanced fairy abilities','fairy-21':'Longer and faster helpers; greater Blackcat chance','fairy-33':'Greater Blackcat chance','fairy-1':'More time to prepare visitor orders','fairy-2':'Requests finish sooner','fairy-3':'Visitors arrive sooner','fairy-5':'More Mana ingredients','fairy-6':'More Life ingredients','fairy-7':'More Mana and Stamina ingredients','fairy-8':'More Life and Mana ingredients','fairy-9':'Stronger Stamina enhancement','fairy-10':'Stronger Mana enhancement','fairy-11':'Stronger Life enhancement','fairy-12':'Better Mana and Stamina success chance','fairy-13':'Better Life and Stamina success chance','fairy-14':'Better Life and Mana success chance','fairy-15':'Stronger Life enhancement and sale value','fairy-16':'Stronger Mana enhancement and sale value','fairy-17':'Stronger Stamina enhancement and sale value','fairy-18':'Chance to protect Life or Mana potion on failure','fairy-19':'Chance to protect Life or Stamina potion on failure','fairy-20':'Chance to protect Mana or Stamina potion on failure','fairy-22':'More value from added ingredients','fairy-23':'Better enhancement chance and failure protection','fairy-24':'More visitor preparation time; requests finish sooner','fairy-25':'More value from added ingredients','fairy-26':'Mana enhancement, success chance, and protection','fairy-27':'Life and Mana enhancement, success chance, and protection','fairy-28':'Stamina enhancement, success chance, and protection','fairy-29':'Life enhancement, success chance, and protection','fairy-30':'Mana and Stamina enhancement and protection','fairy-31':'More value from added ingredients','fairy-32':'More visitor preparation time','fairy-34':'More value from added ingredients','fairy-35':'Visitors arrive and requests finish sooner'};
for(const id of ['fairy-40','fairy-41','fairy-42'])FAIRY_LABELS[id]='Pushcat summon time −5% · Blackcat summon chance +5% (future summoning bonus)';
function fairyEffectText(id,level=game.fairyLevel(id)||1){const preview=fairyEffectText.preview||(fairyEffectText.preview=new PotionGame());preview.state.fairies[id]=level;const effects=preview.fairyEffects(id,1),parts=[],percent=v=>Number((v*100).toFixed(2));for(const[key,label]of [['enhancementDurationReduction','shorter enhancement time'],['enhancementChance','success chance'],['enhancementMultiplier','extra value across the full enhancement path'],['sellBonus','sale bonus'],['failureProtection','protection chance after a failed enhancement, without a protection charge'],['materialProbability','ingredient spawn weight']])effects[key]?.forEach((value,f)=>{if(value)parts.push(`${FAMILIES[f].label}: +${percent(value)}${key==='enhancementChance'?' percentage points':'%'} ${label}`);});if(effects.cardsPerSecond)parts.push(`Material emission: +${percent(effects.cardsPerSecond)}%`);if(effects.materialAmount)parts.push(`Added ingredient value: +${percent(effects.materialAmount)}%`);if(effects.questPrep)parts.push(`Visitor preparation time: +${percent(effects.questPrep)}% (${Number((QUEST_PREP_MIN_MS/1000*(1+effects.questPrep)).toFixed(2))}–${Number((QUEST_PREP_MAX_MS/1000*(1+effects.questPrep)).toFixed(2))} seconds)`);if(effects.visitorDelay)parts.push(`Visitor wait: −${percent(effects.visitorDelay)}% (${Number((ECONOMY.visitors.waitMinMs/1000*(1-effects.visitorDelay)).toFixed(2))}–${Number((ECONOMY.visitors.waitMaxMs/1000*(1-effects.visitorDelay)).toFixed(2))} seconds)`);if(effects.requestDurationReduction)parts.push(`Request duration: −${percent(effects.requestDurationReduction)}%`);if(effects.pushcatSummonTime)parts.push(`Helper working time: +${percent(effects.pushcatSummonTime)}%`);if(effects.pushcatSummonTimeReduction)parts.push(`Helper working time: −${percent(effects.pushcatSummonTimeReduction)}%`);if(effects.pushcatSpeed)parts.push(`Helper collection speed: +${percent(effects.pushcatSpeed)}%`);if(effects.blackcatSummonChance)parts.push(`Blackcat summon chance: +${percent(effects.blackcatSummonChance)} percentage points`);if(effects.ticketSpawnReduction)parts.push(`Ticket spawn interval: −${percent(effects.ticketSpawnReduction)}% (adapted as more frequent ticket rolls)`);if(effects.questMaterialWeight)parts.push(`Requested ingredient spawn weight: +${percent(effects.questMaterialWeight)}%`);if(id==='fairy-43')parts.push('The APK scales this fairy’s material emission bonus from 5% to 50% across levels.');if(id==='fairy-51'&&level<6)parts.push('Material emission bonus unlocks at level 6.');if(id==='fairy-behe'&&level<10)parts.push('Helper bonuses unlock at level 10; earlier values are undocumented.');return parts.join('\n')||'Inactive: no implemented ability in this game.';}

let selectedFairyId=null;
function fairyDisplayName(fairy){return fairy.originalName||fairy.name;}
function renderFairies(){
 const active=game.state.activeFairyId,owned=FAIRIES.filter(f=>game.fairyLevel(f.id)>0).length,rate=Math.round(100*owned/FAIRIES.length);
 $('fairy-summary').textContent=owned+' / '+FAIRIES.length+' collected · '+(active?fairyDisplayName(FAIRIES.find(f=>f.id===active))+' is summoned':'No fairy summoned');
 const meter=$('fairy-collection-rate');meter.setAttribute('aria-valuenow',rate);meter.querySelector('span').style.width=rate+'%';meter.querySelector('b').textContent=rate+'%';
 const focused=document.activeElement?.dataset.fairyId,grid=$('fairy-grid');grid.replaceChildren();
 const ordered=[...FAIRIES].sort((a,b)=>(a.nativeId||999)*(game.fairyLevel(a.id)?1:10000)-(b.nativeId||999)*(game.fairyLevel(b.id)?1:10000));
 for(const f of ordered){
  const level=game.fairyLevel(f.id),button=document.createElement('button'),image=document.createElement('img'),rank=document.createElement('span'),label=document.createElement('span');
  button.type='button';button.className='fairy-slot '+(level?'owned':'locked')+(active===f.id?' equipped':'');button.dataset.fairyId=f.id;button.style.setProperty('--fairy-rarity-color',f.rarityColor);button.setAttribute('aria-label',fairyDisplayName(f)+', '+f.rarityLabel+' rarity, '+(level?'level '+level:'not collected')+(active===f.id?', summoned':''));button.title=fairyDisplayName(f);image.src=art(f.image);image.alt='';rank.className='fairy-slot-rank';rank.textContent=f.rarityLabel;label.className='fairy-slot-level';label.textContent=level?'Lv.'+level:'';button.append(image,rank,label);
  if(active===f.id){const check=document.createElement('span');check.className='fairy-slot-summoned';check.textContent='✓';check.setAttribute('aria-hidden','true');button.append(check);}
  button.onclick=()=>showFairyBook(f.id);grid.append(button);
 }
 if(focused)Array.from(grid.children).find(n=>n.dataset.fairyId===focused)?.focus({preventScroll:true});
 if($('equipped-fairy-dialog').open)renderFairyBook();
}
function showFairyBook(id){if(!FAIRIES.some(f=>f.id===id))return;selectedFairyId=id;renderFairyBook();if(!$('equipped-fairy-dialog').open)$('equipped-fairy-dialog').showModal();}
function renderFairyAbilityList(node,id,level){node.replaceChildren();for(const line of fairyEffectText(id,level).split('\n').filter(line=>line&&!line.startsWith('The APK '))){const item=document.createElement('li');item.textContent=line;node.append(item);}}
function renderFairyBook(){
 const fairy=FAIRIES.find(f=>f.id===selectedFairyId);if(!fairy)return;
 const level=game.fairyLevel(fairy.id),active=game.state.activeFairyId===fairy.id;
 $('equipped-fairy-name').textContent=fairyDisplayName(fairy);$('equipped-fairy-image').src=art(fairy.image);$('equipped-fairy-image').alt=fairyDisplayName(fairy);$('equipped-fairy-image').classList.toggle('uncollected',!level);
 $('fairy-book-alias').textContent=fairy.originalName!==fairy.name?fairy.name:'';$('fairy-book-owned').textContent=active?'Summoned':level?'Collected':'Not collected';$('fairy-book-owned').className=active?'summoned':'';
 const rarity=$('fairy-book-rarity');rarity.replaceChildren();rarity.setAttribute('aria-label',fairy.rarityLabel+' rarity, '+fairy.rarity+' of 5 stars');for(let i=0;i<fairy.rarity;i++){const star=document.createElement('span');star.setAttribute('aria-hidden','true');rarity.append(star);}
 $('equipped-fairy-level').textContent=level?'Lv: '+level+' · Max Lv: 10':'Not collected · Lv.1 preview';const meter=$('fairy-book-level-meter');meter.setAttribute('aria-valuenow',level);meter.querySelector('span').style.width=level*10+'%';
 $('fairy-book-progress-note').textContent=level>=10?'Maximum level reached.':level?'Collect another copy to reach level '+(level+1)+'.':'Collect this fairy to summon it. Duplicates raise its level.';
 renderFairyAbilityList($('equipped-fairy-effect'),fairy.id,level||1);$('fairy-book-maximum').hidden=level>=10;renderFairyAbilityList($('fairy-book-max-effects'),fairy.id,10);
 const rule=ECONOMY.expeditions.rewards,tier=rule.fairyUnlocks[fairy.id],travelers=TRAVELERS.filter(t=>(rule.visitorFairies[t.id]||[]).includes(fairy.id));
 $('fairy-book-origin').textContent=(travelers.length?'Expeditions with '+travelers.map(t=>t.name).join(', ')+' at material tier '+tier+' or higher.\n':'')+'Stamp Exchange: '+(rule.exchange.fairyBaseCost+rule.exchange.fairyTierCost*tier)+' stamps after tier '+tier+' is unlocked in all three families.\nFairy rewards can also come from chests and commissions.';
 const button=$('fairy-book-toggle');button.textContent=active?'Unsummon':level?'Summon':'Not collected';button.disabled=!level||!FAIRY_LABELS[fairy.id]||saveBlocked;
 button.onclick=()=>{if(!game.setActiveFairy(active?null:fairy.id))return;save();renderFairies();render();updateBeltLabels();$('equipped-fairy-dialog').close();if($('fairy-dialog').open)$('fairy-dialog').close();};
}
function renderFairyShortcut(){const id=game.state.activeFairyId,key=id+'|'+game.fairyLevel(id);if(renderFairyShortcut.key===key)return;renderFairyShortcut.key=key;const fairy=FAIRIES.find(f=>f.id===id),button=$('fairy-shortcut');button.hidden=!fairy;if(!fairy)return;const name=fairyDisplayName(fairy);$('fairy-shortcut-image').src=art(fairy.image);$('fairy-shortcut-image').alt=name;button.setAttribute('aria-label',name+', level '+game.fairyLevel(id)+' of 10. View fairy book');if($('equipped-fairy-dialog').open)renderFairyBook();}
$('fairy-shortcut').onclick=()=>{if(game.state.activeFairyId)showFairyBook(game.state.activeFairyId);};
function questTimerText(t){const now=Date.now(),seconds=time=>Math.max(0,Math.ceil((time-now)/1000));return t.phase==='offer'?`Leaves in ${seconds(t.leaveAt)}s · ${QUEST_PREP_MIN_MS/1000}–${QUEST_PREP_MAX_MS/1000} seconds to brew after accepting.`:t.phase==='active'?`Time left: ${seconds(t.deadline)}s`:t.phase==='returning'?`Reward arrives in ${seconds(t.readyAt)}s`:t.phase==='complete'?'Reward received':t.phase==='failed'?`Quest expired · potion kept · leaves in ${seconds(t.leaveAt)}s`:'';}

function renderPotionLevel(level,max=false){const el=$('potion-level'),key=level===null?'empty':(max?'max:':'level:')+level;if(el.dataset.level===key)return;el.dataset.level=key;el.className='level'+(max?' max':'');el.replaceChildren();el.title='';if(level===null){el.removeAttribute('role');el.removeAttribute('aria-label');return;}el.setAttribute('role','img');el.setAttribute('aria-label',max?`Potion level ${level}, maximum`:`Potion level ${level}`);el.title=`Level ${level}${max?' · maximum':''}`;if(max)return;const prefix=document.createElement('span');prefix.className='pn pn-lv';el.append(prefix);for(const digit of String(level)){const glyph=document.createElement('span');glyph.className='pn pn-'+digit;el.append(glyph);}}

function render(){window.refreshRush?.();window.refreshProducts?.();window.refreshHelper?.();window.refreshMail?.();window.refreshEvents?.();syncMasteryStars(game.state);window.refreshCharacterUnlock?.();statisticsDirty=true;const s=game.state,p=s.potion,n=game.next(),character=$('brew-character'),costumeArt=art(s.activeCostumeId);if(character.src!==costumeArt)character.src=costumeArt;setText($('achievement-count'),game.state.masteryStars.length+' / 75');for(const[id,value]of [['coins',s.coins],['tickets-display',s.tickets],['rubies-display',s.rubies],['sold',s.sold],['best',s.best],['failed',s.failed],['gathered',s.ingredients]])setText($(id),id==='coins'?Math.floor(value).toLocaleString('en-US',{useGrouping:true,maximumFractionDigits:0}):fmt(value));const saleAmount=p?Math.floor(game.sellValue()).toLocaleString('en-US',{useGrouping:true,maximumFractionDigits:0}):'';setText($('value'),saleAmount);const salePrice=$('sale-price');salePrice.hidden=!p;if(p)salePrice.setAttribute('aria-label',`Selling price ${saleAmount} coins`);$('enhance').disabled=!n||!!game.enhancementPending;$('sell').disabled=(!p&&!s.eventRush.eventPotion)||!!game.enhancementPending;const liquid=p?CAULDRON_LIQUID_COLORS[p.family]:'#a6a8aa';if(document.documentElement.style.getPropertyValue('--liquid')!==liquid)document.documentElement.style.setProperty('--liquid',liquid);
 if(s.eventRush.eventPotion){setText($('potion-name'),'Overnight Order Potion');renderPotionLevel(1,true);if($('bottle-wrap').dataset.potion!=='event:night-order'){const im=document.createElement('img');im.className='bottle';im.src=art('OriginalMiracleSolution.png');im.alt='Overnight Order Potion';$('bottle-wrap').replaceChildren(im);$('bottle-wrap').className='has-potion';$('bottle-wrap').dataset.potion='event:night-order';}delete $('enhance-details').dataset.enhancement;setText($('enhance-details'),'MAX · Ready to deliver to the event order');$('enhance-details').removeAttribute('aria-label');$('enhance-details').title='';renderEnhanceMultiplier(null);
 }else if(p){const f=FAMILIES[p.family],r=game.recipe(),key=p.family+'-'+p.tier;setText($('potion-name'),r.name);renderPotionLevel(p.level+1,p.level+1===r.max_level);if($('bottle-wrap').dataset.potion!==key){const im=document.createElement('img');im.className='bottle';im.alt=r.name;im.src=art(r.image);$('bottle-wrap').replaceChildren(im);$('bottle-wrap').className='has-potion';$('bottle-wrap').dataset.potion=key;}if(n){const details=$('enhance-details'),key=n.chance+'|'+n.multiplier;delete details.dataset.status;if(details.dataset.enhancement!==key){const chance=document.createElement('strong'),cap=n.chance>=ECONOMY.brewing.successCap?` · ${Number((ECONOMY.brewing.successCap*100).toFixed(2))}% ceiling`:'';const chanceText=`${(n.chance*100).toFixed(2).replace(/\.00$/,'')}%`;renderNumberArt(chance,chanceText);details.replaceChildren(chance);details.setAttribute('aria-label',`Success rate ${chanceText}${cap}`);details.title=`Success rate${cap}`;details.dataset.enhancement=key;renderEnhanceMultiplier(n.multiplier);}}else{delete $('enhance-details').dataset.enhancement;const status=game.enhancementStatus();$('enhance-details').dataset.status=status;setText($('enhance-details'),status==='unknown'?'Next enhancement is unrecorded':'Maximum enhancement reached');$('enhance-details').removeAttribute('aria-label');$('enhance-details').title='';renderEnhanceMultiplier(null);}
 }else{setText($('potion-name'),'');renderPotionLevel(null);if($('bottle-wrap').className!=='empty-bottle'||$('bottle-wrap').children.length){$('bottle-wrap').replaceChildren();$('bottle-wrap').className='empty-bottle';delete $('bottle-wrap').dataset.potion;}delete $('enhance-details').dataset.enhancement;delete $('enhance-details').dataset.status;setText($('enhance-details'),'Start brewing to see your chances');$('enhance-details').removeAttribute('aria-label');$('enhance-details').title='';renderEnhanceMultiplier(null);}if($('achievements-dialog').open)renderAchievements();if($('expedition-dialog').open)renderExpeditions();if($('request-dialog').open)renderRequestBoard();renderUpgrades();renderPowerups();renderTravelers();renderFairyShortcut();updateVisitorShortcut();updateRequestIndicator();if(ingredientMode==='manual')drawSelectedIngredients();}

let conveyor=null,belt=[],beltElements=new Map(),lastFrame=performance.now(),beltWidth=0,beltSlots='',ingredientMode='conveyor';let reducedMotion=gameSettings.reducedMotion;
const specialRack=document.createElement('section');specialRack.className='manual-specials';specialRack.hidden=true;specialRack.innerHTML='<p class="small muted">Catch special drops here · keys 4–6</p><div class="rack conveyor-rack"><div id="special-ingredients" class="ingredients conveyor" role="group" aria-label="Passing tickets and Miracle Solution"></div></div>';$('starter-selectors').after(specialRack);
function materialValue(value){return value<1e6?Number(value.toFixed(2)).toLocaleString('en-US',{maximumFractionDigits:2}):fmt(value);}
function imgButton(family,tier){const f=FAMILIES[family],m=f.materials[tier],b=document.createElement('button');b.className='ingredient';b.title=`${m.name} · +${materialValue(m.value)} value`;const img=document.createElement('img');img.src=art(m.image);img.alt=m.name;b.append(img);return b;}
function updateBeltLabels(){const manual=ingredientMode==='manual',toggle=$('ingredient-mode-toggle');setText(toggle,manual?'Return to conveyor':'Choose exact ingredients (debug)');toggle.setAttribute('aria-pressed',String(manual));setText($('ingredient-mode-status'),manual?'Exact ingredients (debug)':'Conveyor');$('dev-cheats-mode').hidden=!manual;if(manual){$('rack-label').textContent=game.state.potion?'Add a chosen ingredient (debug)':'Choose a debug ingredient to start';$('refill-note').textContent='Pick a material family and tier below · return in Settings ▸ Dev tools';return;}$('rack-label').textContent=game.state.eventRush.eventPotion?'Event potion ready · Deliver below':game.state.potion?'Add passing ingredients':'Catch an ingredient to start';const effectiveRate=conveyor.emissionRate(!!game.state.potion,game.state.speed);$('refill-note').textContent=`Conveyor · ${effectiveRate} material${effectiveRate===1?'':'s'}/s`;}
function ticketButton(){const b=document.createElement('button');b.className='ingredient conveyor-ticket';b.title='Pushcat ticket · +1 ticket';const img=document.createElement('img');img.src=art('Nyan-Ticket.png');img.alt='Pushcat ticket';b.append(img);return b;}
function eventSupplyButton(){const b=solutionButton();b.classList.add('conveyor-event-supply');b.title='Overnight order supply · collect into event pouch';b.querySelector('img').src=art('OriginalEventSupply.png');b.querySelector('img').alt='Event supply';return b;}
function solutionButton(){const b=document.createElement('button');b.className='ingredient conveyor-solution';b.title='Miracle Solution · +1 event token';const img=document.createElement('img');img.src=art('OriginalMiracleSolution.png');img.alt='Miracle Solution';b.append(img);return b;}
function syncBelt(){const items=ingredientMode==='manual'?conveyor.items.filter(m=>m.kind):conveyor.items,live=new Set(items.map(m=>m.id));for(const[id,el]of beltElements){if(!live.has(id)){el.remove();beltElements.delete(id);}}
 for(const m of items){let el=beltElements.get(m.id);if(!el){el=m.kind==='event-supply'?eventSupplyButton():m.kind==='ticket'?ticketButton():m.kind==='solution'?solutionButton():imgButton(m.family,m.tier);el.tabIndex=-1;el.setAttribute('aria-hidden','true');el.dataset.belt=m.id;el.onclick=()=>catchMaterial(m.id);beltElements.set(m.id,el);$(ingredientMode==='manual'?'special-ingredients':'ingredients').append(el);}const x=reducedMotion?Math.round(m.x/conveyor.spacing)*conveyor.spacing:m.x;const transform=`translateX(${x}px) scaleX(-1)`,width=`${m.kind==='event-supply'?44:Math.max(2,Math.min(58,conveyor.spacing-2))}px`,top=`${m.id%3*2}px`;if(el.style.transform!==transform)el.style.transform=transform;if(el.style.width!==width)el.style.width=width;if(el.style.top!==top)el.style.top=top;}
 belt=items.filter(m=>m.x>=-15&&m.x<beltWidth-20);
 const slots=belt.map(m=>m.id).join(',');if(slots===beltSlots)return;beltSlots=slots;const visibleIds=new Set(belt.map(m=>m.id));for(const[id,el]of beltElements){el.tabIndex=visibleIds.has(id)?0:-1;el.setAttribute('aria-hidden',String(!visibleIds.has(id)));el.removeAttribute('data-visible-slot');}
 belt.forEach((m,i)=>{const el=beltElements.get(m.id),key=ingredientMode==='manual'?i+4:i+1;el.dataset.visibleSlot=i;el.dataset.shortcut=key<=6?key:'';el.setAttribute('aria-label',(m.kind==='ticket'?'Pushcat ticket · +1 ticket':m.kind==='event-supply'?'Event supply · +1 to pouch':m.kind==='solution'?'Miracle Solution · +1 event token':`${FAMILIES[m.family].materials[m.tier].name} · +${FAMILIES[m.family].materials[m.tier].value}`)+(key<=6?` · key ${key}`:''));});
}
function startBelt(reset=true){const ingredients=$('ingredients');delete ingredients.dataset.selection;ingredients.replaceChildren();$('special-ingredients').replaceChildren();beltElements.clear();ingredients.parentElement.classList.add('running');ingredients.parentElement.classList.toggle('conveyor-rack',ingredientMode==='conveyor');specialRack.hidden=ingredientMode!=='manual'||!ECONOMY.conveyor.specialDropsInManual;beltWidth=ingredients.clientWidth;beltSlots='';if(reset||!conveyor)conveyor=new MaterialConveyor(beltWidth,game.state.tiers,Math.random,()=>({...game.fairyEffects(),eventActive:game.eventInfo().active,questRequirement:game.state.travelers.find(t=>t.phase==='active')?.requirement}),ingredientMode==='manual');conveyor.manual=ingredientMode==='manual';if(ingredientMode==='manual')drawSelectedIngredients();else{ingredients.className='ingredients conveyor';$('starter-selectors').replaceChildren();updateBeltLabels();}syncBelt();}
function drawSelectedIngredients(){const ingredients=$('ingredients'),selectors=$('starter-selectors'),selection=JSON.stringify([game.state.tiers,game.state.selected]);if(ingredients.dataset.selection===selection){updateBeltLabels();if(conveyor)syncBelt();return;}ingredients.dataset.selection=selection;ingredients.className='ingredients starting';ingredients.replaceChildren();selectors.replaceChildren();belt=[];beltSlots='';FAMILIES.forEach((family,index)=>{const tier=Math.min(game.state.selected[index],game.state.tiers[index]),material=family.materials[tier],button=imgButton(index,tier),label=document.createElement('small');label.textContent=material.name;button.title=`Choose ${material.name} · +${materialValue(material.value)} value`;button.append(label);button.dataset.shortcut=index+1;button.onclick=()=>collectMaterial(index,tier);ingredients.append(button);const select=document.createElement('select');select.setAttribute('aria-label',`${family.label} material tier`);for(let optionTier=0;optionTier<=game.state.tiers[index];optionTier++){const option=document.createElement('option');option.value=String(optionTier);option.textContent=`Tier ${optionTier+1} · ${family.materials[optionTier].name}`;select.append(option);}select.value=String(tier);select.onchange=()=>{game.state.selected[index]=Number(select.value);save();drawSelectedIngredients();};selectors.append(select);});updateBeltLabels();if(conveyor)syncBelt();}
$('ingredient-mode-toggle').onclick=()=>{ingredientMode=ingredientMode==='conveyor'?'manual':'conveyor';startBelt(false);};
new ResizeObserver(entries=>{beltWidth=entries[0].contentRect.width;window.refreshHelper?.();}).observe($('ingredients'));
function collectMaterial(family,tier,id=null){const starting=!game.state.potion;if(!game.collect(family,tier))return;animateIngredient(family,tier,id);if(id!==null)conveyor.take(id);notice(starting?`${game.recipe().name} started.`:`${FAMILIES[family].materials[tier].name} added to the brew.`,'',starting?game.recipe().name:FAMILIES[family].materials[tier].name,FAMILIES[family].color);save();render();updateBeltLabels();if(ingredientMode==='conveyor')syncBelt();else drawSelectedIngredients();}
function catchMaterial(id){const m=conveyor.items.find(m=>m.id===id);if(!m)return;if(m.kind==='event-supply'){if(rushTransaction(()=>game.collectRushSupply(m.token),'Event supply stored in your pouch.')){conveyor.take(id);syncBelt();}return;}if(m.kind==='solution'){if(!game.collectSolution()){notice('Miracle Solution can only be caught during an active event.');return;}conveyor.take(id);notice('Caught Miracle Solution! +1 event token.','success');save(true);render();syncBelt();return;}if(m.kind==='ticket'){if(!game.collectTicket()){notice('Ticket balance is too large to add another ticket.');return;}conveyor.take(id);notice('Caught a Pushcat ticket! +1 ticket.','success');save();render();syncBelt();return;}collectMaterial(m.family,m.tier,id);}
let lastVisualFrame=0;
function animate(now){if(gameSettings.lightMode&&now-lastVisualFrame<1000/30){requestAnimationFrame(animate);return;}lastVisualFrame=now;updateRewardChestFrame();updateEnhancementProgress(now);const delta=Math.max(0,now-lastFrame);lastFrame=now;if(!document.hidden&&conveyor&&(ingredientMode==='conveyor'||ECONOMY.conveyor.specialDropsInManual)){conveyor.tiers=game.state.tiers;const active=game.state.helpers.length;conveyor.advance(delta,!!game.state.potion,game.state.speed,beltWidth);window.advanceRushConveyor?.();const collected=game.advanceHelper(delta,conveyor),specialCaught=(game.helperCatches||[]).some(caught=>!!caught.item.kind);for(const caught of game.helperCatches||[])animateIngredient(caught.item.family,caught.item.tier,caught.item.id,caught.helper,caught.item.kind);if(collected||active!==game.state.helpers.length){save(specialCaught);render();updateBeltLabels();}syncBelt();}requestAnimationFrame(animate);}

$('enhance').onclick=()=>{if(!game.startEnhancement(performance.now()))return;showCauldronTexture('enhancing',game.enhancementPending.duration);render();updateEnhancementProgress(performance.now());};
function updateEnhancementProgress(now){const bar=$('enhancement-progress'),pending=game.enhancementPending;bar.hidden=!pending;if(!pending)return;const fraction=Math.max(0,Math.min(1,(now-pending.start)/pending.duration));bar.value=fraction;bar.style.setProperty('--enhance-progress',fraction);bar.setAttribute('aria-valuenow',String(Math.round(fraction*100)));if(fraction>=1)completeEnhancement(now);}
function completeEnhancement(now){const previousAchievements=masteredPotionCount(),hadTia=game.state.tiaUnlocked,result=game.finishEnhancement(now);$('enhancement-progress').hidden=!game.enhancementPending;if(!result){render();return;}const achievements=masteredPotionCount(),celebration=achievements>previousAchievements||(!hadTia&&game.state.tiaUnlocked);if(!hadTia&&game.state.tiaUnlocked){notice('All three beginner potions mastered! Tia is now unlocked for free.','success');setTimeout(()=>window.playTiaUnlockScene?.(),500);}notice(result==='success'?'Enhancement succeeded. Keep brewing—or sell while you’re ahead.':result==='protected'?'Enhancement failed, but a protection charge saved the potion.':result==='fairy-protected'?'Your fairy protected the potion from a failed enhancement.':'The potion was lost. Start a fresh brew with any ingredient.',result==='success'?'success':result==='protected'?'':'failure');if(achievements>previousAchievements&&game.state.potion){const p=game.state.potion,id=p.family+'-'+p.tier,speaker=window.brewerCharacter==='Tia'?'Tia':'Pio',line=FLAVOR_TEXT.entries[id].mastery_commentary?.[speaker];notice(ACHIEVEMENT_LORE.entries[id].title+' mastered!'+(line?' '+speaker+': '+line:''),'success');}window.pioReact?.(result);if(result==='success'){showSuccessRipple();playOriginalSfx('Enhanced.wav',.2);}else{showFailureSmoke();playOriginalSfx('Enhance Failed.wav',.22);}flash(result);save(celebration);render();if(result==='success'&&game.state.potion){const p=game.state.potion;if(p.level+1===FAMILIES[p.family].recipes[p.tier].max_level)queueNewItemReveal('potion',p.family,p.tier,500);}if(!game.state.potion)updateBeltLabels();}
$('sell').onclick=()=>{if(game.state.eventRush.eventPotion){rushTransaction(()=>game.deliverRush(),'One bottle delivered to the event order.');updateBeltLabels();return;}const index=readyQuestIndex();if(index>=0){if(!game.deliver(index))return;playOriginalSfx('Quest Complete.wav',.22);notice('Potion delivered. '+TRAVELERS[index].name+' will return with your reward in '+ECONOMY.visitors.rewardDelayMs/1000+' seconds.','success');save(true);render();updateBeltLabels();return;}if(game.canDeliverCommission()){handOverCommission();return;}if(!game.state.potion||game.enhancementPending)return;if(gameSettings.confirmSell&&!confirm('Sell '+FAMILIES[game.state.potion.family].recipes[game.state.potion.tier].name+' for '+fmt(game.sellValue())+' coins?'))return;const doubled=game.state.powerups.selling>0,value=game.sell(),saved=game.lastSaleExpeditionTimeSaved||0;if(value===null)return;playOriginalSfx('Sell.wav',.3);notice(`Sold for ${fmt(value)} coins${doubled?' with a ×2 sell bonus':''}.${saved?` ${savedTime(saved)} saved on ${TRAVELERS[game.state.expedition.travelerIndex].name}'s expedition timer.`:''}`,'success');save();render();updateBeltLabels();};
let catalogTier=0;
function catalogCard(view,tier){
 const catalogView=view,entries=FAMILIES[catalogFamily].recipes;
 if(catalogView==='materials'){
  const m=FAMILIES[catalogFamily].materials[tier];const unlocked=tier<=game.state.tiers[catalogFamily],card=document.createElement('div');card.className='catalog-item'+(unlocked?'':' locked');const img=document.createElement('img');img.src=art(m.image);img.alt=m.name;const title=document.createElement('h3');title.textContent=m.name;const status=document.createElement('div');status.textContent=`Tier ${tier+1} · ${unlocked?'unlocked':'locked'}`;const value=document.createElement('div');value.textContent=`Added value +${materialValue(m.value)}`;const materialText=MATERIAL_TEXT.entries[catalogFamily+'-'+tier];const materialLore=materialText?.lore?document.createElement('p'):null;if(materialLore){materialLore.className='catalog-flavor material-lore';materialLore.textContent=materialText.lore;}const supplier=materialText?.supplier_note?document.createElement('p'):null;if(supplier){supplier.className='catalog-flavor supplier-note';supplier.textContent='Supplier’s note: '+materialText.supplier_note;}const potion=document.createElement('p');potion.className='bottle-note';potion.textContent=`Starts: ${m.starting_name}`;card.append(img,title,status,value);if(materialLore)card.append(materialLore);if(supplier)card.append(supplier);card.append(potion);return card;
 }
 const r=entries[tier];const unlocked=tier<=game.state.tiers[catalogFamily],card=document.createElement('div');card.className='catalog-item'+(unlocked?'':' locked');const img=document.createElement('img');img.src=art(r.image);img.alt=r.name;const title=document.createElement('h3');title.textContent=r.name;const status=document.createElement('div');status.textContent=`Tier ${tier+1} · ${unlocked?'unlocked':'locked'}${game.state.discovered.includes(catalogFamily+'-'+tier)?' · brewed':''}`;const base=document.createElement('div');base.textContent=r.base===null?'Base value unrecorded':`Base ${fmt(r.base)} G · max level ${r.max_level}`;const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=r.complete?'Enhancement table':'Partial wiki data';details.append(summary);r.multipliers.forEach((m,i)=>{const line=document.createElement('div');line.textContent=`${i+1} → ${i+2}: ${m===null?'unknown multiplier':'×'+Number(m.toFixed(3))} · ${r.chances[i]===null?'unknown chance':(r.chances[i]*100).toFixed(2).replace(/\.00$/,'')+'%'}`;details.append(line);});for(const note of r.notes){const line=document.createElement('p');line.className='muted';line.textContent=note;details.append(line);}card.append(img,title);const lore=FLAVOR_TEXT.entries[catalogFamily+'-'+tier];if(lore){const flavor=document.createElement('div');flavor.className='catalog-flavor';const description=document.createElement('p');description.textContent=lore.description;flavor.append(description);if(lore.expanded_lore){const expansion=document.createElement('p');expansion.className='expanded-lore';expansion.textContent=lore.expanded_lore;flavor.append(expansion);}const review=lore.customer_review||lore.bottle_note;if(review){const note=document.createElement('p');note.className='bottle-note';note.textContent=lore.customer_review?review:'Original bottle note: '+review;flavor.append(note);}const record=game.state.metrics.recipes[catalogFamily+'-'+tier],speaker=window.brewerCharacter==='Tia'?'Tia':'Pio',comment=lore.mastery_commentary?.[speaker],note=document.createElement('p');note.className='bottle-note mastery-commentary';note.textContent=(record?.highestLevel>=r.max_level&&comment)?speaker+': '+comment:speaker+': ???';flavor.append(note);card.append(flavor);}card.append(status,base,details);
 if(catalogView==='potions'){const recipe=entries[tier],record=game.state.metrics.recipes[catalogFamily+'-'+tier],level=record?.highestLevel||0,section=document.createElement('section'),heading=document.createElement('h4'),stats=document.createElement('dl');section.className='catalog-records';heading.textContent='Your brewing record';stats.className='catalog-record-grid';for(const[label,value]of [['Best enhancement',level?`Level ${level} / ${recipe.max_level}`:'Not brewed yet'],['Times brewed',fmt(record?.started||0)],['Best sale',record?.sold?fmt(record.best)+' G':'No sales yet']]){const item=document.createElement('div'),term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;item.append(term,detail);stats.append(item);}const achievement=document.createElement('div');achievement.className='catalog-achievement';const open=document.createElement('button');open.type='button';open.textContent='View mastery achievement';open.onclick=()=>openAchievementDetail(achievementRecords('mastery').find(item=>item.id===catalogFamily+'-'+tier));achievement.append(open);section.append(heading,stats,achievement);if(game.state.metrics.historyPartial){const note=document.createElement('p');note.className='small muted';note.textContent='Records from older saves may be incomplete.';section.append(note);}card.insertBefore(section,card.querySelector('details'));}
 return card;
}
function catalogOverview(kind){
 const family=FAMILIES[catalogFamily],material=family.materials[catalogTier],recipe=family.recipes[catalogTier],id=catalogFamily+'-'+catalogTier,isMaterial=kind==='material',entry=isMaterial?material:recipe,unlocked=catalogTier<=game.state.tiers[catalogFamily],page=document.createElement('article'),figure=document.createElement('figure'),image=document.createElement('img'),name=document.createElement('h4'),status=document.createElement('p'),stats=document.createElement('dl'),intro=document.createElement('p'),read=document.createElement('button');
 page.className='book-overview';page.dataset.kind=kind;figure.className='book-illustration';image.src=art(entry.image);image.alt=entry.name;figure.append(image);name.className='book-entry-name';name.textContent=entry.name;status.className='book-entry-status';status.textContent='Tier '+(catalogTier+1)+' · '+(unlocked?'Unlocked':'Locked')+(!isMaterial&&game.state.discovered.includes(id)?' · Brewed':'');
 stats.className='book-overview-stats';const rows=isMaterial?[['Added value','+'+materialValue(material.value)]]:[['Base value',recipe.base===null?'Unrecorded':fmt(recipe.base)+' G'],['Max level',String(recipe.max_level)]];
 for(const [label,value] of rows){const row=document.createElement('div'),term=document.createElement('dt'),detail=document.createElement('dd');term.textContent=label;detail.textContent=value;row.append(term,detail);stats.append(row);}
 intro.className='book-introduction';intro.textContent=isMaterial?'Brew with this material to start '+FAMILIES[catalogFamily].recipes[catalogTier].name+'.':'Enhance to MAX to unlock your potion maker’s commentary.';read.type='button';read.className='book-read-lore';read.id='catalog-read-'+kind;read.textContent='Read full lore';read.setAttribute('aria-label','Read full '+kind+' lore for '+entry.name);read.onclick=()=>openCatalogReader(isMaterial?0:1);
 page.append(figure,name,status,stats,intro,read);return page;
}
let catalogReaderPage=0,catalogMobilePage='material';
function setCatalogPage(page){catalogMobilePage=page;document.querySelector('.catalog-spread').dataset.page=page;for(const button of $('catalog-page-switch').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.bookPage===page));}
function renderCatalogReader(){
 const material=catalogReaderPage===0,entry=(material?FAMILIES[catalogFamily].materials:FAMILIES[catalogFamily].recipes)[catalogTier],card=catalogCard(material?'materials':'potions',catalogTier);
 if(!material){const lore=FLAVOR_TEXT.entries[catalogFamily+'-'+catalogTier],flavor=card.querySelector('.catalog-flavor');if(lore&&flavor){const note=lore.original_bottle_note||lore.bottle_note;if(lore.customer_review&&note&&note!==lore.customer_review){const heading=document.createElement('h4'),text=document.createElement('p');heading.textContent='Original bottle note';text.textContent=note;flavor.append(heading,text);}if(lore.supplier_note){const heading=document.createElement('h4'),text=document.createElement('p');heading.textContent='Apothecary supply note';text.textContent=lore.supplier_note;flavor.append(heading,text);}}}
 setText($('catalog-reader-title'),entry.name);setText($('catalog-reader-context'),FAMILIES[catalogFamily].label+' · Tier '+(catalogTier+1)+' · '+(material?'Material notes':'Potion lore & brewing record'));
 card.querySelector('h3')?.remove();$('catalog-reader-body').replaceChildren(card);$('catalog-reader-body').scrollTop=0;$('catalog-reader-previous').disabled=material;$('catalog-reader-next').disabled=!material;setText($('catalog-reader-page'),material?'Material · 1 / 2':'Potion · 2 / 2');
}
function openCatalogReader(page){catalogReaderPage=page;renderCatalogReader();$('catalog-reader-dialog').showModal();}
function renderCatalog(){
 const filters=$('catalog-filters');filters.replaceChildren();FAMILIES.forEach((family,i)=>{const button=document.createElement('button');button.type='button';button.textContent=family.label;button.className=i===catalogFamily?'active':'';button.style.setProperty('--book-family-color',family.color);button.setAttribute('aria-pressed',String(i===catalogFamily));button.onclick=()=>{catalogFamily=i;catalogTier=0;renderCatalog();$('catalog-filters').children[i].focus({preventScroll:true});};filters.append(button);});
 const select=$('catalog-tier');select.replaceChildren();FAMILIES[catalogFamily].materials.forEach((material,tier)=>{const option=document.createElement('option');option.value=String(tier);option.textContent=(tier+1)+'. '+material.name+' / '+FAMILIES[catalogFamily].recipes[tier].name;select.append(option);});select.value=String(catalogTier);select.title=select.selectedOptions[0]?.textContent||'';$('catalog-previous').disabled=catalogTier===0;$('catalog-next').disabled=catalogTier===24;
 $('catalog-material').replaceChildren(catalogOverview('material'));$('catalog-potion').replaceChildren(catalogOverview('potion'));setText($('catalog-pair-label'),FAMILIES[catalogFamily].label+' · Recipe '+(catalogTier+1)+' of 25');setCatalogPage(catalogMobilePage);$('catalog-book-stage').scrollTop=0;
 const back=$('catalog-dialog').querySelector('[data-back-to-menu]');if(back)back.textContent='← Back to menu';
}
$('catalog-tier').onchange=event=>{const tier=Number(event.target.value);if(Number.isInteger(tier)&&tier>=0&&tier<25){catalogTier=tier;renderCatalog();}};
$('catalog-previous').onclick=()=>{catalogTier=Math.max(0,catalogTier-1);renderCatalog();};
$('catalog-next').onclick=()=>{catalogTier=Math.min(24,catalogTier+1);renderCatalog();};
for(const button of $('catalog-page-switch').querySelectorAll('button'))button.onclick=()=>setCatalogPage(button.dataset.bookPage);
$('catalog-reader-previous').onclick=()=>{catalogReaderPage=0;renderCatalogReader();};
$('catalog-reader-next').onclick=()=>{catalogReaderPage=1;renderCatalogReader();};


 for(const[a,b]of [['costume-shop','costume-shop-dialog'],['help','help-dialog'],['sources','source-dialog'],['save-tools','save-dialog'],['catalog','catalog-dialog'],['fairy-book','fairy-dialog'],['statistics','statistics-dialog']])$(a).onclick=()=>{if(a==='costume-shop')renderCostumeShop();if(a==='catalog'){catalogTier=0;renderCatalog();}if(a==='fairy-book')renderFairies();if(a==='statistics')renderStatistics();if(a==='save-tools'){setSavePage('device');renderSaveSlots();$('save-slots-message').textContent='';$('save-message').textContent='';}$(b).showModal();};document.getElementById("achievements").onclick=()=>{renderAchievements();document.getElementById("achievements-dialog").showModal();};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.ctrlKey||e.altKey||e.metaKey||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.repeat)return;if(/^[1-6]$/.test(e.key)){const i=Number(e.key)-1;if(ingredientMode==='manual'&&i<3)collectMaterial(i,Math.min(game.state.selected[i],game.state.tiers[i]));else{const item=belt[ingredientMode==='manual'?i-3:i];if(item)catchMaterial(item.id);}}if(e.key.toLowerCase()==='e')$('enhance').click();if(e.key.toLowerCase()==='s')$('sell').click();});
const visitorBell=new Audio(art('ShopDoorBell.mp3'));visitorBell.preload='auto';
function playVisitorBell(){if(document.hidden||!gameSettings.effectsVolume)return;try{visitorBell.volume=gameSettings.effectsVolume;visitorBell.currentTime=0;void visitorBell.play().catch(()=>{});}catch{}}
const music=art('Main Theme.wav')?new Audio(art('Main Theme.wav')):null;
let musicAutoPending=!!music;
function updateMusicButton(){const on=gameSettings.musicEnabled;$('music').setAttribute('aria-checked',String(on));}
function stopMusicAutostart(){musicAutoPending=false;document.removeEventListener('pointerdown',autoStartMusic);document.removeEventListener('keydown',autoStartMusic);}
async function autoStartMusic(event){if(!gameSettings.musicEnabled||!musicAutoPending||event?.target?.closest?.('#music'))return;try{await music.play();stopMusicAutostart();updateMusicButton();}catch{updateMusicButton();}}
if(music){music.loop=true;music.autoplay=gameSettings.musicEnabled;music.volume=gameSettings.musicVolume;document.addEventListener('pointerdown',autoStartMusic);document.addEventListener('keydown',autoStartMusic);void autoStartMusic();}
$('music').onclick=async()=>{gameSettings.musicEnabled=!gameSettings.musicEnabled;stopMusicAutostart();if(music){if(gameSettings.musicEnabled){try{await music.play();}catch{notice('Tap Music again if the browser blocks playback.');}}else music.pause();}updateMusicButton();persistGameSettings();};
$('dev-coins').onclick=()=>{game.state.coins=Math.min(1e300,game.state.coins+100000000);save();render();notice('Debug cheat: added 100,000,000 coins.','success');};
$('dev-unlock').onclick=()=>{game.state.tiers=[24,24,24];game.state.selected=[24,24,24];save();render();startBelt();notice('Debug cheat: all material tiers unlocked.','success');};
$('dev-max-potion').onclick=()=>{const p=game.state.potion;if(!p){notice('Start a potion first.');return;}const r=game.recipe(),fromLevel=p.level,gained=Math.max(0,r.max_level-1-fromLevel),fairyBonus=game.fairyEffects().enhancementMultiplier?.[p.family]||0;for(let level=fromLevel;level<r.max_level-1;level++){const multiplier=r.multipliers[level];if(Number.isFinite(multiplier))p.value=Math.min(1e300,p.value*multiplier*(1+fairyBonus));}p.level=r.max_level-1;const record=game.statRecipe();record.highestLevel=r.max_level;record.enhancements+=gained;game.state.metrics.enhancementsSucceeded=Math.min(1e300,game.state.metrics.enhancementsSucceeded+gained);game.state.metrics.enhancementAttempts=Math.min(1e300,game.state.metrics.enhancementAttempts+gained);save();render();notice('Debug cheat: current potion set to maximum level and value.','success');};
$('export').onclick=async()=>{try{save(true);$('save-code').value=await makeSaveCode(saveBlocked&&stored.raw?stored.raw:game.state);$('save-message').textContent='Compressed save code generated. Copy it somewhere safe.';}catch(error){$('save-message').textContent='Could not create save code: '+error.message;}};$('copy-save-code').onclick=async()=>{const field=$('save-code');if(!field.value){$('save-message').textContent='Generate a save code first.';return;}try{await navigator.clipboard.writeText(field.value);$('save-message').textContent='Save code copied.';}catch{field.focus();field.select();$('save-message').textContent='Save code selected. Press Ctrl+C to copy it.';}};
function savePreview(state){const character=COSTUMES.entries.find(c=>c.id===state.activeCostumeId)?.character||'Pio';return `${fmt(state.coins)} gold · ${fmt(state.tickets)} tickets · ${fmt(state.rubies)} rubies\n${state.masteryStars.length} Mastery Stars · ${character}`;}
function saveNamedSlot(slot,name){try{if(saveBlocked)throw Error('Restore saving or export the unreadable save before using slots.');if(game.enhancementPending)throw Error('Wait for the enhancement to finish.');if(localStorage.getItem(namedSaveSlotKey(KEY,slot))!==null&&!confirm('Overwrite slot '+slot+'? This replaces its saved shop.'))return;const entry=writeNamedSaveSlot(localStorage,KEY,slot,name,game.state);renderSaveSlots();$('save-slots-message').textContent='Saved '+entry.name+' in slot '+slot+'.';}catch(error){$('save-slots-message').textContent='Could not save slot: '+error.message;}}
function loadNamedSlot(slot){try{if(game.enhancementPending)throw Error('Wait for the enhancement to finish.');const entry=readNamedSaveSlot(localStorage,KEY,slot);if(!entry)throw Error('This slot is empty.');if(!confirm('Load '+entry.name+' from slot '+slot+'?\n\n'+savePreview(entry.state)+'\n\nThis replaces your current shop. It will be backed up first. Named slots do not autosave.'))return;installImportedSave(entry.state);renderSaveSlots();$('save-slots-message').textContent=saveOK?'Loaded '+entry.name+'. Your previous shop is available in Recovery.':'Slot loaded, but saving failed. Export a backup.';}catch(error){$('save-slots-message').textContent='Could not load slot: '+error.message;}}
function setSavePage(page){
 for(const button of document.querySelectorAll('[data-save-panel]'))button.setAttribute('aria-pressed',String(button.dataset.savePanel===page));
 for(const section of document.querySelectorAll('[data-save-page]'))section.hidden=section.dataset.savePage!==page;
 if(page==='recovery')renderSaveRecovery();
 $('save-message').textContent='';$('save-slots-message').textContent='';
 document.querySelector('#save-dialog .save-content').scrollTo(0,0);
}
function renderSaveRecovery(){
 const button=$('restore-import-backup'),summary=$('save-recovery-summary');button.disabled=true;
 try{const raw=localStorage.getItem(KEY+'-before-import');if(!raw){summary.textContent='No previous shop yet. A recovery copy appears here after you load or import a shop.';return;}const state=sanitizeSave(JSON.parse(raw));summary.textContent=savePreview(state);button.disabled=false;}catch{summary.textContent='This recovery copy could not be read. You can still import a backup file.';}
}
function renderSaveSlots(){
 const current=game.state,character=COSTUMES.entries.find(c=>c.id===current.activeCostumeId)?.character||'Pio';
 $('save-current-portrait').src=art(current.activeCostumeId);$('save-current-summary').textContent=character+' · '+fmt(current.coins)+' gold · '+current.masteryStars.length+' Mastery Stars';
 renderSaveRecovery();
 const box=$('save-slots');box.replaceChildren();
 for(let slot=1;slot<=3;slot++){
  let entry=null,problem='';try{entry=readNamedSaveSlot(localStorage,KEY,slot);}catch(error){problem=error.message;}
  const card=document.createElement('article'),number=document.createElement('span'),body=document.createElement('div'),heading=document.createElement('h4'),time=document.createElement('time'),preview=document.createElement('p'),actions=document.createElement('div'),saveButton=document.createElement('button'),loadButton=document.createElement('button'),editor=document.createElement('details'),summary=document.createElement('summary'),label=document.createElement('label'),name=document.createElement('input');
  card.className='save-slot'+(entry?' is-filled':' is-empty');number.className='save-slot-number';number.textContent=String(slot);number.setAttribute('aria-label','Slot '+slot);body.className='save-slot-body';heading.textContent=entry?entry.name:problem?'Snapshot unavailable':'Empty snapshot';
  if(entry){time.dateTime=new Date(entry.savedAt).toISOString();time.textContent='Saved '+new Date(entry.savedAt).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});preview.textContent=fmt(entry.state.coins)+' gold · '+entry.state.masteryStars.length+' Mastery Stars';}else preview.textContent=problem||'Save a copy of your current shop here.';
  preview.className='small muted';actions.className='save-slot-actions';saveButton.type=loadButton.type='button';saveButton.textContent=entry||problem?'Update snapshot':'Create snapshot';saveButton.className=entry?'save-secondary':'save-primary';saveButton.setAttribute('aria-label','Save current shop to slot '+slot);saveButton.disabled=saveBlocked;saveButton.onclick=()=>saveNamedSlot(slot,name.value);
  if(entry){loadButton.textContent='Load';loadButton.className='save-primary';loadButton.setAttribute('aria-label','Load slot '+slot+' — '+entry.name);loadButton.onclick=()=>loadNamedSlot(slot);actions.append(loadButton);}
  actions.append(saveButton);summary.textContent=entry?'Change name on next save':'Name this snapshot';label.htmlFor='save-slot-name-'+slot;label.textContent='Snapshot name';name.id=label.htmlFor;name.type='text';name.maxLength=40;name.value=entry?entry.name:'Shop '+slot;name.autocomplete='off';label.append(name);editor.className='save-slot-name-editor';editor.append(summary,label);body.append(heading,time,preview,editor);card.append(number,body,actions);box.append(card);
 }
}
function installImportedSave(next,backup=true){const replacement=new PotionGame(next);if(backup)localStorage.setItem(KEY+'-before-import',saveBlocked&&stored.raw?stored.raw:JSON.stringify(game.state));writeStoredGame(localStorage,KEY,replacement.state);clearTimeout(saveTimer);saveTimer=null;saveDirty=false;saveBlocked=false;saveOK=true;game=replacement;window.brewerCharacter=COSTUMES.entries.find(c=>c.id===next.activeCostumeId)?.character||'Pio';try{localStorage.setItem('pmg-brewer-character',window.brewerCharacter);localStorage.setItem('pmg-costume-'+window.brewerCharacter,next.activeCostumeId);}catch{}const tickEvents=game.tick();save(true);travelerSnapshot='';render();startBelt();if(typeof queueExpeditionStory==='function')for(const event of tickEvents)if(event.kind==='expedition'&&event.story)queueExpeditionStory(event.story);if(typeof queuePendingExpeditionStory==='function')queuePendingExpeditionStory();notice('Your saved shop is ready.','success');renderSaveSlots();$('save-message').textContent=saveOK?'Save imported. Your previous shop is available in Recovery.':'Save loaded, but saving failed. Export a backup.';}
async function importSaveCode(code){const next=await readSaveCode(code.trim());if(!confirm('Import this shop?\n\n'+savePreview(next)+'\n\nThis replaces your progress. Your current shop will be backed up.'))return;installImportedSave(next);}
$('import').onclick=async()=>{try{await importSaveCode($('save-code').value);}catch(error){$('save-message').textContent='Could not import: '+error.message;}};
$('download-save').onclick=async()=>{try{const code=await makeSaveCode(saveBlocked&&stored.raw?stored.raw:game.state),url=URL.createObjectURL(new Blob([code],{type:'text/plain'})),link=document.createElement('a');link.href=url;link.download='Potion-Maker-'+new Date().toISOString().replace(/[:.]/g,'-')+'.pmgsave';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);$('save-message').textContent='Save file download started. Send it to a friend or keep it as a backup.';}catch(error){$('save-message').textContent='Could not download save: '+error.message;}};
$('choose-save-file').onclick=()=>{$('save-file').value='';$('save-file').click();};
$('save-file').onchange=async()=>{const file=$('save-file').files[0];if(!file)return;try{if(file.size>140000)throw Error('Save file is too large.');await importSaveCode(await file.text());}catch(error){$('save-message').textContent='Could not import file: '+error.message;}};
$('restore-import-backup').onclick=()=>{try{const raw=localStorage.getItem(KEY+'-before-import');if(!raw)throw Error('No pre-import backup is available.');const next=sanitizeSave(JSON.parse(raw));if(!confirm('Restore your previous shop?\n\n'+savePreview(next)+'\n\nThis replaces your current progress.'))return;installImportedSave(next,false);$('save-message').textContent='Pre-import backup restored.';}catch(error){$('save-message').textContent='Could not restore backup: '+error.message;}};

$('reset').onclick=()=>{if(!confirm('Start a new shop? Export a backup first if you want to keep your progress.'))return;saveBlocked=false;game=new PotionGame();game.tick();save(true);travelerSnapshot='';render();startBelt();notice('A fresh start. Catch a passing ingredient.');$('save-message').textContent='New shop started.';};
$('save-now').onclick=()=>save(true);
let lastTrackedAt=performance.now(),lastStatisticsSave=performance.now(),lastDisplayedSecond=-1;
setInterval(()=>{const tickNow=performance.now(),elapsed=tickNow-lastTrackedAt;lastTrackedAt=tickNow;if(!document.hidden&&elapsed<2000){game.recordPlayTime(elapsed);}if(tickNow-lastStatisticsSave>=5000){lastStatisticsSave=tickNow;save(true);}const events=game.tick();window.refreshRush?.(false);if(events.length){if(events.some(e=>e.kind==='arrived'))playVisitorBell();if(events.some(e=>['departed','failed','reward'].includes(e.kind))&&$('visitor-order-dialog').open)$('visitor-order-dialog').close();notice(events.map(e=>e.kind==='expedition'?`${e.traveler.name} returned from an expedition: ${e.stamps||0} stamps · +${e.likeability} likeability${Object.keys(e.boostBundle).length?' · '+Object.entries(e.boostBundle).map(([key,amount])=>amount+' '+key+' charges').join(', '):''}${e.fairyId?' · '+FAIRIES.find(f=>f.id===e.fairyId).name:e.focus!=='supplies'?' · fairy search progress saved':''}${e.extra?' · '+e.extra.amount+' '+e.extra.currency:''}.`:e.kind==='arrived'?`${e.traveler.name} has arrived with an order.`:e.kind==='departed'?`${e.traveler.name} left the shop.`:e.kind==='failed'?`${e.traveler.name}'s quest expired.`:e.kind==='request'?`${e.traveler.name} completed ${e.request.name}.${e.fairyId?' '+FAIRIES.find(f=>f.id===e.fairyId).name+' joined your collection.':''}`:rewardArrivalText(e)).join(' '),events.some(e=>e.kind==='failed')?'failure':'success');save(true);render();if($('fairy-dialog').open)renderFairies();if($('costume-shop-dialog').open)renderCostumeShop();}for(const event of events)if(event.kind==='expedition'&&event.story)queueExpeditionStory(event.story);queuePendingExpeditionStory();
 const second=Math.floor(Date.now()/1000);if(second!==lastDisplayedSecond){lastDisplayedSecond=second;window.refreshHelper?.();window.refreshEvents?.();if($('expedition-dialog').open)renderExpeditions();document.querySelectorAll('[data-quest-timer]').forEach(el=>{const t=game.state.travelers[Number(el.dataset.questTimer)];if(['offer','active','returning','complete','failed'].includes(t.phase))setText(el,questTimerText(t));});updateQuestButtons();updateVisitorShortcut();if(game.state.request){setText($('request-current'),requestStatusText());if($('request-dialog').open)setText($('request-status'),requestStatusText());}if($('statistics-dialog').open){if(statisticsDirty)renderStatistics();setText($('statistics-play-time'),duration(game.state.metrics.activePlayMs));}}
},250);
window.addEventListener('pagehide',()=>save(true));document.addEventListener('visibilitychange',()=>{lastTrackedAt=performance.now();lastFrame=performance.now();if(document.hidden)save(true);});const startupEvents=game.tick();render();startBelt();requestAnimationFrame(animate);if(saveOK)save(true);for(const event of startupEvents)if(event.kind==='expedition'&&event.story)queueExpeditionStory(event.story);queuePendingExpeditionStory();

document.addEventListener('click',event=>{const current=event.target.closest('.header-menu');document.querySelectorAll('.header-menu[open]').forEach(menu=>{if(menu!==current||event.target.closest('button'))menu.open=false;});});
document.addEventListener('keydown',event=>{if(event.key==='Escape')document.querySelectorAll('.header-menu[open]').forEach(menu=>{menu.open=false;menu.querySelector('summary').focus();});});

const gameMenu=$('game-menu'),menuGrid=$('game-menu-grid');
const portraitUpgrades=document.createElement('button'),portraitUpgradeDialog=document.createElement('dialog'),portraitUpgradeClose=document.createElement('button'),upgradePanel=document.querySelector('main>aside:last-child'),upgradePanelAnchor=document.createComment('Shop upgrades position');
upgradePanel.classList.add('original-upgrades');const upgradeTitle=upgradePanel.querySelector('h2');upgradeTitle.classList.add('original-title');const upgradeScroll=document.createElement('div');upgradeScroll.className='upgrade-list-scroll';while(upgradeTitle.nextSibling)upgradeScroll.append(upgradeTitle.nextSibling);upgradePanel.append(upgradeScroll);upgradePanel.before(upgradePanelAnchor);portraitUpgrades.type='button';portraitUpgrades.className='portrait-upgrades';portraitUpgrades.textContent='Upgrades';portraitUpgrades.setAttribute('aria-haspopup','dialog');portraitUpgradeDialog.id='portrait-upgrade-dialog';portraitUpgradeDialog.setAttribute('aria-label','Shop upgrades');portraitUpgradeClose.type='button';portraitUpgradeClose.className='close';portraitUpgradeClose.textContent='×';portraitUpgradeClose.setAttribute('aria-label','Close shop upgrades');portraitUpgradeClose.onclick=()=>portraitUpgradeDialog.close();const shellUpgradeTitle=document.createElement('h2');shellUpgradeTitle.textContent='Shop upgrades';portraitUpgradeDialog.append(portraitUpgradeClose,shellUpgradeTitle);document.body.append(portraitUpgradeDialog);document.querySelector('.actions').append(portraitUpgrades);
portraitUpgrades.onclick=()=>{portraitUpgradeDialog.append(upgradePanel);portraitUpgradeDialog.showModal();};portraitUpgradeDialog.addEventListener('close',()=>upgradePanelAnchor.after(upgradePanel));
$('event-panel-icon').src=art('NewEventIcon.png');
const eventDialog=document.createElement('dialog');eventDialog.id='event-dialog';eventDialog.setAttribute('aria-labelledby','event-page-title');eventDialog.innerHTML=`<button class="close" aria-label="Close event">×</button><h2 id="event-page-title"></h2><img class="event-page-banner" alt=""><p class="event-page-status"></p><p class="event-page-balance"></p><p class="small muted"></p><details class="event-history"><summary>Historical notes</summary><section class="event-story"><h3></h3><p></p></section></details><div class="event-rewards"></div><p class="event-feedback" role="status"></p>`;document.body.append(eventDialog);eventDialog.querySelector('.close').onclick=()=>eventDialog.close();
let eventPageIndex=0;
function eventTime(ms){const seconds=Math.ceil(ms/1000);return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');}
function openEvent(index){eventDialog.dataset.rush='false';eventPageIndex=index;eventDialog.querySelector('.event-feedback').textContent='';refreshLegacyEventPage();eventDialog.showModal();}

document.querySelectorAll('#game-menu [data-menu-art]').forEach(image=>image.src=art(image.dataset.menuArt));
$('game-menu-open').onclick=()=>{gameMenu.dataset.shopView='false';menuGrid.hidden=false;document.querySelectorAll('.game-menu-subpage').forEach(page=>page.hidden=true);gameMenu.showModal();};
gameMenu.addEventListener('click',event=>{const destination=event.target.closest('[data-menu-destination]');if(destination){if(gameMenu.open)gameMenu.close();if(destination.dataset.menuClick)$(destination.dataset.menuClick).click();return;}const page=event.target.closest('[data-menu-page]');if(page){gameMenu.dataset.shopView=String(page.dataset.menuPage==='shops');menuGrid.hidden=true;$('game-menu-'+page.dataset.menuPage).hidden=false;if(page.dataset.menuPage==='shops'){gameMenu.scrollTop=0;window.refreshProducts?.();}}if(event.target.closest('[data-menu-back]')){gameMenu.dataset.shopView='false';document.querySelectorAll('.game-menu-subpage').forEach(panel=>panel.hidden=true);menuGrid.hidden=false;}});

// Rewards are committed before animation; closing the reveal cannot lose a prize.
const rewardShop=document.createElement('div');rewardShop.className='reward-shop';
const rewardDialog=document.createElement('dialog');rewardDialog.id='reward-dialog';rewardDialog.setAttribute('aria-label','Shop reward');rewardDialog.innerHTML='<button class="close" aria-label="Close reward">×</button><h2></h2><p class="reward-odds small muted"></p><p class="reward-balance"></p><p class="reward-quota small"></p><div class="reward-chest" role="img" aria-label="Treasure chest"></div><div class="case-window"><div class="case-reel"></div></div><p class="reward-result" aria-live="polite"></p><button class="reward-free primary"></button><button class="reward-open primary"></button>';document.body.append(rewardDialog);rewardDialog.querySelector('.close').onclick=()=>rewardDialog.close();
let rewardKind='hourly',rewardBusy=false,rewardAnimation=null,rewardChestAnimation=null;
const rewardButtons={},rewardNames={hourly:'Boost chest',tickets:'Ticket case',skin:'Ruby case'},rewardLabels={tickets:'Pushcat tickets',rubies:'rubies',fairy:'fairy',skin:'skin',protection:'failure protection',enhancement:'enhancement boost',selling:'double-sale boost'};
function rewardOddsText(kind){const cost=game.rewardCost(kind),rules=ECONOMY.chests;if(kind==='hourly')return ` One free opening every ${duration(rules.freeBoostCooldownMs)}. Gold price follows your highest unlocked material tier. Up to ${rules.hourly.paidLimit} paid openings per ${rules.hourly.paidWindowMs/60000} active minutes; paid openings keep the free timer. Each opening awards one boost type.`;const expected=game.rewardExpectations(kind,window.brewerCharacter||'Pio'),parts=['tickets','rubies'].filter(key=>expected[key]>0).map(key=>Number(expected[key].toFixed(2))+' '+rewardLabels[key]),returned=Object.entries(expected).reduce((sum,[key,amount])=>sum+(CURRENCY_UNITS[key]?amount/CURRENCY_UNITS[key]:0),0),paid=cost.amount/CURRENCY_UNITS[cost.currency];return ` Average currency return: ${parts.join(' + ')} (${Number((returned/paid*100).toFixed(2))}% at the 10-ticket-per-ruby rate). Fairy and new-skin value excluded. Fairies below level 10 are equally likely; all maxed converts a fairy roll to ${rules.maxFairyTickets} tickets.`+(kind==='skin'?` Eligible current-character skins are equally likely; event skins are excluded. Duplicates convert to ${rules.duplicateTickets} tickets. Each opening has its own odds; no guaranteed skin after a fixed number of openings.`:'');}
function chestFrame(frame){const material={hourly:'wood',tickets:'iron',skin:'gold'}[rewardKind];return `url("${art('Original-'+material+'-chest-'+frame+'.png')}")`;}
function resetRewardChest(){rewardChestAnimation?.cancel();const chest=rewardDialog.querySelector('.reward-chest');chest.style.backgroundImage=chestFrame(0);chest.setAttribute('aria-label','Closed treasure chest');}
function updateRewardChestFrame(){if(!rewardChestAnimation||rewardChestAnimation.playState==='idle'||rewardChestAnimation.playState==='finished')return;const fraction=Number(rewardChestAnimation.currentTime||0)/ECONOMY.chests.revealMs,chest=rewardDialog.querySelector('.reward-chest'),image=chestFrame(fraction<.9?0:fraction<.97?1:2);if(chest.style.backgroundImage!==image)chest.style.backgroundImage=image;}
function animateRewardChest(){resetRewardChest();const chest=rewardDialog.querySelector('.reward-chest');if(reducedMotion){chest.style.backgroundImage=chestFrame(2);chest.setAttribute('aria-label','Open treasure chest');return;}rewardChestAnimation=chest.animate([{opacity:1},{opacity:1}],{duration:ECONOMY.chests.revealMs,fill:'forwards'});rewardChestAnimation.finished.then(()=>{chest.style.backgroundImage=chestFrame(2);chest.setAttribute('aria-label','Open treasure chest');}).catch(()=>{});}

function rewardArt(currency,name=''){if(currency==='skin')return game.state.activeCostumeId;if(currency==='fairy')return FAIRIES.find(f=>f.name===name)?.image||FAIRIES[0].image;return currency==='tickets'?'Nyan-Ticket.png':currency==='rubies'?'Gem.png':DATA.powerups[currency].image;}
function rewardDescription(result){return result.currency==='skin'?(result.name?'Unlocked '+result.name:'Random skin'):result.currency==='fairy'?(result.name||'Random fairy')+' ×1':(result.name?result.name+' → ':'')+result.amount+' '+rewardLabels[result.currency];}
function shopNode(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function shopExact(amount){return amount.toLocaleString('en-US',{maximumFractionDigits:0});}
function shopAmount(amount){return amount>=1e15?new Intl.NumberFormat('en-US',{notation:'scientific',maximumFractionDigits:2}).format(amount):amount>=1000000?new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2}).format(amount):shopExact(amount);}
function shopCurrency(currency){return {coins:'Gold',tickets:'Tickets',rubies:'Rubies'}[currency]||currency;}
for(const kind of ['hourly','tickets','skin']){
 const card=shopNode('article','shop-chest-card'),image=shopNode('img'),copy=shopNode('div','shop-chest-copy'),title=shopNode('h4','',rewardNames[kind]),detail=shopNode('p','shop-price'),status=shopNode('p','shop-product-status'),actions=shopNode('div','shop-card-actions'),button=shopNode('button','shop-details-button','Contents & odds'),action=shopNode('button','primary');
 card.dataset.chest=kind;image.src=art('Original-'+({hourly:'wood',tickets:'iron',skin:'gold'}[kind])+'-chest-0.png');image.alt='';button.type=action.type='button';
 button.onclick=()=>{rewardKind=kind;resetRewardChest();rewardDialog.querySelector('h2').textContent=rewardNames[kind];rewardDialog.querySelector('.reward-result').textContent='';rewardDialog.querySelector('.case-reel').replaceChildren();if(!rewardDialog.open)rewardDialog.showModal();updateRewardShop();};
 action.onclick=()=>{if(rewardBusy||action.disabled)return;const free=kind==='hourly'&&game.state.rewardReadyAt<=Date.now();button.onclick();void openChest(free);};
 copy.append(title,detail,status);actions.append(action,button);card.append(image,copy,actions);rewardButtons[kind]={button,detail,status,action,card};rewardShop.append(card);
}
$('shop-panel-chests').append(rewardShop);
let shopCategory='chests';
const productNodes=new Map(),productCards=new Map(),shopPurchasing=new Set();
const shopBalancesDialog=document.createElement('dialog');shopBalancesDialog.id='shop-balances-dialog';shopBalancesDialog.setAttribute('aria-labelledby','shop-balances-title');shopBalancesDialog.innerHTML='<button class="close" type="button" aria-label="Close currency balances">×</button><h2 id="shop-balances-title">Your exact balances</h2><dl><dt>Gold</dt><dd id="shop-exact-coins"></dd><dt>Tickets</dt><dd id="shop-exact-tickets"></dd><dt>Rubies</dt><dd id="shop-exact-rubies"></dd></dl>';document.body.append(shopBalancesDialog);shopBalancesDialog.querySelector('.close').onclick=()=>shopBalancesDialog.close();

function refreshShopBalances(){for(const currency of ['coins','tickets','rubies']){const value=Math.floor(game.state[currency]),node=$('shop-balance-'+currency),exact=shopExact(value)+' '+shopCurrency(currency);setText(node,shopAmount(value));node.title=exact;node.setAttribute('aria-label',exact);setText($('shop-exact-'+currency),shopExact(value));node.closest('button').setAttribute('aria-label',exact+'. View exact balances');}}
function setShopCategory(category){
 if(!['chests','boosts','exchange','gold'].includes(category))return;
 shopCategory=category;
 for(const button of $('shop-tabs').querySelectorAll('[data-shop-category]')){const selected=button.dataset.shopCategory===category;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;$('shop-panel-'+button.dataset.shopCategory).hidden=!selected;}
 $('shop-scroll').scrollTop=0;window.refreshProducts?.();
}
for(const button of $('shop-tabs').querySelectorAll('[data-shop-category]')){
 button.onclick=()=>setShopCategory(button.dataset.shopCategory);
 button.onkeydown=event=>{const keys=['chests','boosts','exchange','gold'];let index=keys.indexOf(shopCategory);if(event.key==='ArrowRight')index=(index+1)%keys.length;else if(event.key==='ArrowLeft')index=(index+keys.length-1)%keys.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=keys.length-1;else return;event.preventDefault();setShopCategory(keys[index]);$('shop-tab-'+keys[index]).focus();};
}
for(const image of document.querySelectorAll('[data-shop-currency]')){image.src=art({coins:'Coin.png',tickets:'Nyan-Ticket.png',rubies:'Gem.png'}[image.dataset.shopCurrency]);image.closest('button').onclick=()=>{refreshShopBalances();shopBalancesDialog.showModal();};}
for(const product of ECONOMY.shop.products){
 const row=shopNode('article','shop-product-card'),image=shopNode('img'),copy=shopNode('div','shop-product-copy'),title=shopNode('h4'),grants=product.grants,received=grants.coins?'coins':grants.tickets?'tickets':grants.rubies?'rubies':null,price=shopNode('p','shop-price'),status=shopNode('p','shop-product-status'),button=shopNode('button','primary');
 row.dataset.product=product.id;row.dataset.category=received==='coins'?'gold':received?'exchange':'boosts';
 image.src=art(received==='coins'?'Coin.png':received==='tickets'?'Nyan-Ticket.png':received==='rubies'?'Gem.png':'OriginalEnhancementPack.png');image.alt='';
 title.textContent=received?'Receive '+shopAmount(grants[received])+' '+shopCurrency(received):product.name;title.title=received?'Receive '+shopExact(grants[received])+' '+shopCurrency(received):product.name;
 copy.append(title);
 if(!received){const description=shopNode('p','shop-grants',Object.entries(grants).map(([kind,amount])=>shopExact(amount)+' '+({enhancement:'enhancement boost charges',protection:'failure protection charges',selling:'selling boost charges'}[kind]||shopCurrency(kind))).join(' + '));copy.append(description);}
 copy.append(price,status);button.type='button';
 button.onclick=()=>{
  if(shopPurchasing.has(product.id)||!game.canBuyShopProduct(product.id))return;
  const cost=game.shopProductCost(product.id);shopPurchasing.add(product.id);button.disabled=true;
  try{if(!game.buyShopProduct(product.id))return;save(true);render();$('shop-feedback').textContent=product.name+' received. Spent '+shopExact(cost.amount)+' '+shopCurrency(cost.currency)+'.';}
  finally{setTimeout(()=>{shopPurchasing.delete(product.id);window.refreshProducts?.();},350);}
 };
 row.append(image,copy,button);const target=received==='coins'?'shop-gold-products':received?'shop-exchange-'+received:'shop-boost-products';$(target).append(row);productNodes.set(product.id,button);productCards.set(product.id,{row,price,status,button});
}
function chestAvailability(kind){const s=game.state,cost=game.rewardCost(kind),quota=game.paidBoostInfo(),remaining=Math.max(0,s.rewardReadyAt-Date.now()),free=kind==='hourly'&&remaining===0,noSkinPool=kind==='skin'&&((window.brewerCharacter==='Tia'&&!s.tiaUnlocked)||!game.eligibleSkins(window.brewerCharacter||'Pio').length),limited=kind==='hourly'&&quota.remaining<1,short=s[cost.currency]<cost.amount;return{cost,quota,remaining,free,noSkinPool,limited,short,paidDisabled:rewardBusy||noSkinPool||limited||short};}
window.refreshShopChests=()=>{
 const s=game.state,quota=game.paidBoostInfo(),remaining=Math.max(0,s.rewardReadyAt-Date.now());
 for(const kind of ['hourly','tickets','skin']){
  const {card,action,detail,status}=rewardButtons[kind],{cost,free,noSkinPool,limited,short}=chestAvailability(kind);
  setText(detail,'Paid opening: '+shopExact(cost.amount)+' '+shopCurrency(cost.currency));
  let state='available',label='Buy · '+shopExact(cost.amount)+' '+shopCurrency(cost.currency),note=kind==='hourly'?(free?'Free reward ready':'Free in '+duration(remaining))+' · '+quota.remaining+' / '+quota.limit+' paid left':kind==='tickets'?'Random currency or fairy reward.':'Random ruby, fairy or eligible outfit reward.';
  if(rewardBusy){state='opening';label='Opening…';}
  else if(noSkinPool){state='restricted';label='No eligible outfits';note='There are no eligible outfits for the current character.';}
  else if(free){state='free';label='Claim Free';}
  else if(limited){state='limited';label='Paid limit reached';note+=' · refresh in '+duration(quota.remainingMs)+' of active play';}
  else if(short){state='unaffordable';label='Insufficient '+shopCurrency(cost.currency);note+=' · Need '+shopExact(cost.amount-s[cost.currency])+' more '+shopCurrency(cost.currency);}
  card.dataset.state=state;setText(status,note);setText(action,label);action.disabled=['opening','restricted','limited','unaffordable'].includes(state);action.setAttribute('aria-label',rewardNames[kind]+': '+label);rewardButtons[kind].button.disabled=rewardBusy;
 }
 setText($('shop-tab-note-chests'),remaining===0?'Free ready':'3 cases');refreshShopBalances();
};
window.refreshProducts=()=>{
 if(!gameMenu.open||$('game-menu-shops').hidden)return;
 refreshShopBalances();
 for(const product of ECONOMY.shop.products){
  const cost=game.shopProductCost(product.id),{row,price,status,button}=productCards.get(product.id),busy=shopPurchasing.has(product.id),short=game.state[cost.currency]<cost.amount,canBuy=game.canBuyShopProduct(product.id);
  setText(price,'Cost: '+shopExact(cost.amount)+' '+shopCurrency(cost.currency));
  row.dataset.state=busy?'purchased':short?'unaffordable':canBuy?'available':'restricted';
  setText(status,busy?'Added to your inventory':short?'Need '+shopExact(Math.ceil(cost.amount-game.state[cost.currency]))+' more '+shopCurrency(cost.currency):canBuy?'Available':'Unavailable at current inventory or balance limits');
  setText(button,busy?'Purchased':short?'Insufficient '+shopCurrency(cost.currency):canBuy?'Buy · '+shopExact(cost.amount)+' '+shopCurrency(cost.currency):'Limit reached');button.disabled=busy||!canBuy;button.setAttribute('aria-label',product.name+': '+button.textContent);
 }
 setText($('shop-tab-note-boosts'),String(document.querySelectorAll('#shop-boost-products [data-product]').length)+' pack');setText($('shop-tab-note-exchange'),String(document.querySelectorAll('#shop-panel-exchange [data-product]').length)+' bundles');setText($('shop-tab-note-gold'),String(document.querySelectorAll('#shop-gold-products [data-product]').length)+' bundles');
 window.refreshShopChests();
};
setShopCategory(shopCategory);

const questMark=document.createElement('img');questMark.className='quest-mark';questMark.src=art('OriginalQuestMark.png');questMark.alt='';$('visitor-shortcut').append(questMark);
function updateRewardShop(){if(!rewardDialog.open)return;const s=game.state,{cost,quota,remaining,noSkinPool,limited,short,paidDisabled}=chestAvailability(rewardKind);setText(rewardDialog.querySelector('.reward-balance'),fmt(s.coins)+' gold · '+fmt(s.tickets)+' tickets · '+fmt(s.rubies)+' rubies');const button=rewardDialog.querySelector('.reward-open');button.disabled=paidDisabled;setText(button,rewardBusy?'Opening…':noSkinPool?'No eligible outfits':limited?'Paid openings used':short?'Insufficient '+shopCurrency(cost.currency):'Open · '+shopExact(cost.amount)+' '+shopCurrency(cost.currency));const freeButton=rewardDialog.querySelector('.reward-free');freeButton.hidden=rewardKind!=='hourly';freeButton.disabled=rewardBusy||remaining>0;setText(freeButton,rewardBusy?'Opening…':remaining?'Free in '+duration(remaining):'Open free');const note=rewardDialog.querySelector('.reward-quota');note.hidden=rewardKind!=='hourly';setText(note,`${quota.remaining} / ${quota.limit} paid openings left · refresh in ${duration(quota.remainingMs)} of active play`);const rows=game.rewardPool(rewardKind),total=rows.reduce((n,r)=>n+r.weight,0);setText(rewardDialog.querySelector('.reward-odds'),rows.map(r=>Number((100*r.weight/total).toFixed(2))+'%: '+r.amount+' '+rewardLabels[r.currency]).join(' · ')+rewardOddsText(rewardKind));}

async function openChest(free=false){
 if(rewardBusy)return;const result=game.openReward(rewardKind,window.brewerCharacter||'Pio',Date.now(),Math.random,free);if(!result)return;save(true);render();rewardBusy=true;updateRewardShop();
 const output=rewardDialog.querySelector('.reward-result'),reel=rewardDialog.querySelector('.case-reel');output.textContent='';reel.replaceChildren();rewardAnimation?.cancel();reel.style.transform='none';animateRewardChest();
 const pool=game.rewardPool(rewardKind),total=pool.reduce((n,r)=>n+r.weight,0);
 function previewReward(){let roll=Math.random()*total;for(const row of pool){if(roll<row.weight)return row;roll-=row.weight;}return pool[pool.length-1];}
 const cards=38;
 for(let i=0;i<cards;i++){const prize=cards===1||i===32?result:previewReward(),card=document.createElement('div'),image=document.createElement('img'),label=document.createElement('span');card.className='case-item';image.src=art(rewardArt(prize.currency,prize.name));image.alt='';label.textContent=rewardDescription(prize);card.append(image,label);reel.append(card);}
 if(cards>1){const target=rewardDialog.querySelector('.case-window').clientWidth/2-32*120-56;rewardAnimation=reel.animate([{transform:'translateX(0)'},{transform:'translateX('+target+'px)'}],{duration:reducedMotion?0:ECONOMY.chests.revealMs,easing:'cubic-bezier(.12,.72,.12,1)',fill:'forwards'});try{await rewardAnimation.finished;}catch{}}
 output.textContent='You received '+rewardDescription(result)+'!';rewardBusy=false;updateRewardShop();notice(output.textContent,'success');
};
rewardDialog.querySelector('.reward-open').onclick=()=>openChest();
rewardDialog.querySelector('.reward-free').onclick=()=>openChest(true);
rewardDialog.addEventListener('close',()=>{rewardAnimation?.finish();rewardChestAnimation?.finish();});
setInterval(()=>{updateRewardShop();if(gameMenu.open&&!$('game-menu-shops').hidden)window.refreshShopChests();},1000);

// Browser preferences are separate from transferable gameplay saves.
function applyGameSettings(){reducedMotion=gameSettings.reducedMotion;const root=document.documentElement;root.dataset.reducedMotion=String(reducedMotion);root.dataset.shortcuts=String(gameSettings.shortcuts);root.dataset.textSize=gameSettings.textSize;root.dataset.character=String(gameSettings.character);root.dataset.lightMode=String(gameSettings.lightMode);window.applyCharacterSettings?.();if(music)music.volume=gameSettings.musicVolume;visitorBell.volume=gameSettings.effectsVolume;for(const{audio,scale}of originalSfxPlayers.values())audio.volume=gameSettings.effectsVolume*scale;if(!gameSettings.effectsVolume)stopOriginalSfx();if(!gameSettings.idleDialogue)window.clearIdleDialogue?.();if(reducedMotion){rewardAnimation?.finish();rewardChestAnimation?.finish();}}
for(const key of Object.keys(gameSettings)){const control=$('setting-'+key);if(!control||['switch','group'].includes(control.getAttribute('role')))continue;control.type==='checkbox'?control.checked=gameSettings[key]:control.value=String(gameSettings[key]);control.oninput=()=>{gameSettings[key]=control.type==='checkbox'?control.checked:control.tagName==='SELECT'&&key==='textSize'?control.value:Number(control.value);applyGameSettings();try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(gameSettings));$('settings-message').textContent='Settings saved on this browser.';}catch{$('settings-message').textContent='Settings apply now, but could not be saved.';}};}
$('save-dialog-now').onclick=()=>save(true);
for(const button of document.querySelectorAll('[data-save-panel]'))button.onclick=()=>setSavePage(button.dataset.savePanel);
function syncSaveDialogStatus(){const warning=saveBlocked||!saveOK;$('save-dialog-status').textContent=$('save-status').textContent;document.querySelector('#save-dialog .save-current').dataset.saveState=warning?'warning':saveDirty?'saving':'saved';$('save-dialog-now').disabled=saveBlocked;$('save-device-note').textContent=warning?'Automatic saving is unavailable. Download a backup in Backup & transfer to keep this shop.':'Your progress saves automatically in this browser. For a copy outside this device, use Backup & transfer.';}
new MutationObserver(syncSaveDialogStatus).observe($('save-status'),{childList:true,characterData:true,subtree:true});syncSaveDialogStatus();
let effectAudio=null;document.addEventListener('click',event=>{const button=event.target.closest('#game-menu-open,#game-menu [data-menu-page],#game-menu [data-menu-back],#game-menu .game-menu-tile,dialog .close,.back-to-menu');if(!button||button.disabled)return;playOriginalSfx('UI Click.wav',.09,70);});
applyGameSettings();
function persistGameSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify(gameSettings));$('settings-message').textContent='Settings saved on this browser.';}catch{$('settings-message').textContent='Settings apply now, but could not be saved.';}}
function refreshNativeSettings(){updateMusicButton();$('setting-sound').setAttribute('aria-checked',String(gameSettings.effectsVolume>0));for(const key of ['character','lightMode','confirmSell','idleDialogue'])$('setting-'+key).setAttribute('aria-checked',String(gameSettings[key]));}
for(const key of ['character','lightMode','confirmSell','idleDialogue'])$('setting-'+key).onclick=()=>{gameSettings[key]=!gameSettings[key];applyGameSettings();refreshNativeSettings();persistGameSettings();};
let lastEffectsVolume=gameSettings.effectsVolume||.5;
$('setting-sound').onclick=()=>{if(gameSettings.effectsVolume){lastEffectsVolume=gameSettings.effectsVolume;gameSettings.effectsVolume=0;}else gameSettings.effectsVolume=lastEffectsVolume;$('setting-effectsVolume').value=gameSettings.effectsVolume;applyGameSettings();refreshNativeSettings();persistGameSettings();};
$('setting-effectsVolume').addEventListener('input',refreshNativeSettings);
$('fullscreen-setting').hidden=!document.fullscreenEnabled;
$('setting-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('settings-message').textContent='Fullscreen is unavailable in this browser.';}};
document.addEventListener('fullscreenchange',()=>$('setting-fullscreen').setAttribute('aria-checked',String(!!document.fullscreenElement)));

refreshNativeSettings();
function refreshTextSizePill(){for(const button of $('setting-textSize').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.textSize===gameSettings.textSize));}
for(const button of $('setting-textSize').querySelectorAll('button'))button.onclick=()=>{gameSettings.textSize=button.dataset.textSize;applyGameSettings();refreshTextSizePill();persistGameSettings();};
refreshTextSizePill();

function claimAllMailGifts(){if(saveBlocked)return;const rubies=game.state.rubies,claims=[...game.state.claimedUpdates],reward=game.claimAllUpdates();if(reward===null){setText($('mail-status'),'No gifts available, or your ruby balance cannot hold them.');return;}save(true);if(!saveOK||saveBlocked){game.state.rubies=rubies;game.state.claimedUpdates=claims;saveDirty=true;setText($('mail-status'),'Could not save your gifts. Nothing was claimed; please free browser storage and try again.');refreshMail.key=null;refreshMail();return;}render();setText($('mail-status'),'Thank you for playing! Received '+reward+' rubies from all pending gifts.');}
$('mail-claim-all').onclick=claimAllMailGifts;
function refreshMail(){const pending=UPDATES.entries.filter(update=>!game.state.claimedUpdates.includes(update.id));setText($('mail-count'),pending.length?pending.length+(pending.length===1?' gift':' gifts'):'Up to date');const claimAll=$('mail-claim-all');claimAll.disabled=!pending.length||saveBlocked;setText(claimAll,pending.length?'Claim all · '+pending.reduce((n,u)=>n+u.rubies,0)+' rubies':'All gifts claimed');const key=JSON.stringify([game.state.claimedUpdates,saveBlocked,game.state.rubies]);if(refreshMail.key===key)return;refreshMail.key=key;const box=$('mail-updates');box.replaceChildren();for(const update of UPDATES.entries){const card=document.createElement('article'),date=document.createElement('small'),title=document.createElement('h4'),list=document.createElement('ul'),button=document.createElement('button'),icon=document.createElement('img'),claimed=game.state.claimedUpdates.includes(update.id);card.className='update-mail';date.textContent=update.date;title.textContent=update.title;for(const text of update.notes){const item=document.createElement('li');item.textContent=text;list.append(item);}button.type='button';button.disabled=claimed||saveBlocked;icon.src=art('Gem.png');icon.alt='';button.append(icon,claimed?'Claimed':saveBlocked?'Restore saving to claim':'Claim '+update.rubies);button.onclick=()=>{const rubies=game.state.rubies,claims=[...game.state.claimedUpdates],reward=game.claimUpdate(update.id);if(reward===null)return;save(true);if(!saveOK||saveBlocked){game.state.rubies=rubies;game.state.claimedUpdates=claims;saveDirty=true;$('mail-status').textContent='Could not save your claim. Free up browser storage and try again.';refreshMail.key=null;refreshMail();return;}render();$('mail-status').textContent='Thank you for playing! Received '+reward+' rubies.';};card.append(date,title,list,button);box.append(card);}}
window.refreshMail=refreshMail;refreshMail();

// Every game dialog is registered here; variants change layout, never game behavior.
const MENU_SCREENS={
 'game-menu':{variant:'menu',title:'Menu'},
 'help-dialog':{variant:'scroll'},'source-dialog':{variant:'scroll'},
 'new-item-dialog':{variant:'reveal'},
 'catalog-dialog':{variant:'book'},'catalog-reader-dialog':{variant:'reader'},
 'achievements-dialog':{variant:'bounded'},'achievement-detail-dialog':{variant:'reader'},
 'statistics-dialog':{variant:'scroll'},'costume-shop-dialog':{variant:'scroll'},
 'fairy-dialog':{variant:'scroll'},'equipped-fairy-dialog':{variant:'illustrated'},
 'visitor-order-dialog':{variant:'bounded'},'stamp-dialog':{variant:'scroll'},
 'expedition-dialog':{variant:'bounded'},'expedition-story-dialog':{variant:'bounded'},
 'expedition-journal-dialog':{variant:'bounded'},'request-dialog':{variant:'scroll'},
 'save-dialog':{variant:'bounded'},'portrait-upgrade-dialog':{variant:'upgrades'},
 'event-dialog':{variant:'scroll'},'reward-dialog':{variant:'scroll'},
 'shop-balances-dialog':{variant:'reader'},'character-picker':{variant:'scroll'},
 'tia-unlock-scene':{variant:'scroll'}
};
// Verified prefab rectangles, plus requested event and traveler adaptations using original icons.
const MENU_TITLE_ICONS={
 'expedition-dialog':['OriginalMenuExpeditions.png',100,75.92592592592592,20,.5,448],
 'visitor-order-dialog':['OriginalMenuExpeditions.png',100,75.92592592592592,20,.5,448],
 'event-dialog':['NewEventIcon.png',104,86.125,20,.5,448],
 'help-dialog':['OriginalMenuHelp.png',91,73,20,.5,448],
 'source-dialog':['OriginalMenuHelp.png',91,73,20,.5,448],
 'statistics-dialog':['OriginalMenuStats.png',72,62,20,.5,448],
 'portrait-upgrade-dialog':['OriginalTitleUpgrades.png',92,64,20,.5,448],
 'save-dialog':['OriginalMenuSave.png',106,99,20,.5,448],
 'fairy-dialog':['OriginalMenuFairy.png',87,78,20,.5,448],
 'catalog-dialog':['OriginalMenuItems.png',92,64,20,.5,448],
 'catalog-reader-dialog':['OriginalMenuItems.png',92,64,20,.5,448],
 'achievements-dialog':['OriginalMenuAchievements.png',101,76,2,0,448],
 'achievement-detail-dialog':['OriginalMenuAchievements.png',101,76,2,0,448],
 'costume-shop-dialog':['OriginalMenuCostume.png',100,81,20,.5,448],
 'character-picker':['OriginalMenuCharacter.png',104,83,20,.5,448],
 'reward-dialog':['OriginalTitleUpgrades.png',92,64,20,.5,448],
 'shop-balances-dialog':['OriginalTitleUpgrades.png',92,64,20,.5,448],
 'game-menu-shops':['OriginalTitleUpgrades.png',92,64,20,.5,448],
 'game-menu-mail':['OriginalMenuMail.png',100,100,-12,6,354],
 'game-menu-settings':['OriginalMenuSettings.png',104,83,20,.5,448]
};
function setMenuTitleIcon(header,key){
 const spec=MENU_TITLE_ICONS[key];let icon=header.querySelector('.pm-title-icon');
 if(!spec){if(icon)icon.hidden=true;header.classList.remove('pm-header-icon');return;}
 if(!icon){icon=document.createElement('img');icon.className='pm-title-icon';icon.alt='';icon.setAttribute('aria-hidden','true');header.append(icon);}
 icon.hidden=false;icon.src=art(spec[0]);icon.dataset.asset=spec[0];icon.titleSpec=spec;header.classList.add('pm-header-icon');header.style.setProperty('--pm-icon-gap',Math.max(8,spec[1]/2-spec[3]+8)+'px');layoutMenuTitleIcon(header);
}
function layoutMenuTitleIcon(header){
 const icon=header.querySelector('.pm-title-icon:not([hidden])'),title=header.querySelector('.pm-menu-title');if(!icon||!title)return;
 const [,w,h,x,y,reference]=icon.titleSpec,r=title.getBoundingClientRect(),parent=header.getBoundingClientRect();if(!r.width)return;
 const scale=Math.min(1,r.width/reference);icon.style.width=w*scale+'px';icon.style.height=h*scale+'px';icon.style.left=r.left-parent.left+x*scale+'px';icon.style.top=r.top-parent.top+r.height/2-y*scale+'px';header.style.setProperty('--pm-icon-block',Math.max(45,(h+2*Math.abs(y))*scale)+'px');
}

function pinDialogHeader(dialog){
 let header=dialog.querySelector(':scope > .dialog-header,:scope > .book-reader-header,:scope > .achievement-detail-header');
 if(!header){const title=Array.from(dialog.children).find(node=>node.matches('h2,h3'));if(!title)return;header=document.createElement('header');header.className='dialog-header';dialog.prepend(header);while(header.nextSibling){const node=header.nextSibling;header.append(node);if(node===title)break;}}
 header.classList.add('pm-menu-header');header.querySelector('.eyebrow')?.setAttribute('hidden','');
 const title=header.querySelector('h2,h3');if(title){title.classList.add('original-title','pm-menu-title');if(!title.id)title.id=dialog.id+'-title';dialog.setAttribute('aria-labelledby',title.id);}

 const close=dialog.querySelector('.close');if(close&&!header.contains(close))header.prepend(close);
 if(!header.shellResize){header.shellResize=new ResizeObserver(()=>{dialog.style.setProperty('--dialog-header-height',header.getBoundingClientRect().height+'px');layoutMenuTitleIcon(header);});header.shellResize.observe(header);}
 return header;
}
function addMenuReturn(dialog){
 if(dialog.dataset.menuShellReady)return;
 const screen=MENU_SCREENS[dialog.id];if(!screen){console.error('Unregistered menu: '+dialog.id);return;}
 dialog.dataset.menuShellReady='true';dialog.dataset.menuShell=screen.variant;dialog.classList.add('pm-menu','pm-menu--'+screen.variant);
 for(const close of dialog.querySelectorAll('.close,.new-item-close')){close.classList.add('pm-close');close.type='button';if(!close.getAttribute('aria-label'))close.setAttribute('aria-label','Close');}
 if(['reveal','illustrated'].includes(screen.variant))return;
 const header=pinDialogHeader(dialog);if(!header)return;setMenuTitleIcon(header,dialog.id);
 const iconObserver=new MutationObserver(()=>{if(dialog.open){layoutMenuTitleIcon(header);requestAnimationFrame(()=>layoutMenuTitleIcon(header));}});iconObserver.observe(dialog,{attributes:true,attributeFilter:['open']});
 if(screen.variant==='reader')return;
 let back=dialog.querySelector('[data-back-to-menu]');if(!back){back=document.createElement('button');back.type='button';back.className='back-to-menu';back.dataset.backToMenu='';back.textContent='← Back to menu';back.onclick=()=>{document.querySelectorAll('dialog[open]').forEach(open=>open.close());$('game-menu-open').click();};}header.prepend(back);back.classList.add('pm-back');
 if(dialog.id==='game-menu'){
  back.onclick=()=>{gameMenu.dataset.shopView='false';document.querySelectorAll('.game-menu-subpage').forEach(page=>page.hidden=true);menuGrid.hidden=false;syncMenuShell();};
  dialog.addEventListener('click',syncMenuShell);dialog.addEventListener('toggle',syncMenuShell);syncMenuShell();
 }
}
function syncMenuShell(){
 const header=gameMenu.querySelector('.pm-menu-header');if(!header)return;const page=Array.from(gameMenu.querySelectorAll('.game-menu-subpage')).find(p=>!p.hidden);
 setText(header.querySelector('.pm-menu-title'),page?.dataset.menuTitle||'Menu');header.querySelector('.pm-back').hidden=!page;gameMenu.dataset.shellPage=page?.id||'home';setMenuTitleIcon(header,page?.id||'game-menu');
}

$('new-item-dialog').onclick=event=>{if(!event.target.closest('.new-item-slot,#new-item-description,#new-item-stats'))$('new-item-dialog').close();};
$('new-item-dialog').querySelector('.new-item-slot').onclick=event=>{event.stopPropagation();jingleNewItem();};
$('new-item-dialog').addEventListener('close',()=>{$('new-item-dialog').getAnimations({subtree:true}).forEach(a=>a.cancel());});
$('new-item-dialog').addEventListener('keydown',event=>{if(event.key==='Enter'&&event.target===$('new-item-dialog'))$('new-item-dialog').close();});
document.querySelectorAll('.achievement-tabs,.save-navigation,.shop-tabs').forEach(tabs=>tabs.classList.add('pm-tabs'));
document.querySelectorAll('dialog').forEach(addMenuReturn);
new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes){if(node.nodeType===1&&node.matches('dialog'))addMenuReturn(node);}}).observe(document.body,{childList:true});

const helperCatElements=new Map();
function syncHelperCats(){const helpers=game.state.helpers,ingredients=$('ingredients'),left=ingredients.offsetLeft||0,width=ingredients.clientWidth;for(const[h,node]of helperCatElements)if(!helpers.includes(h)){node.remove();helperCatElements.delete(h);}helpers.forEach((h,index)=>{let node=helperCatElements.get(h);if(!node){node=document.createElement('div');node.className='conveyor-cat';node.dataset.kind=h.kind;const face=document.createElement('img'),handWindow=document.createElement('span'),hand=document.createElement('img'),timer=document.createElement('small');face.className='helper-face';face.src=art(h.kind==='blackcat'?'OriginalBlackcat.png':'OriginalPushcat.png');face.alt=h.kind==='blackcat'?'Blackcat helper':'Pushcat helper';handWindow.className='helper-hand-window';handWindow.setAttribute('aria-hidden','true');hand.className='helper-hand';hand.src=art(h.kind==='blackcat'?'BlackcatHand.png':'PushcatHand.png');hand.alt='';handWindow.append(hand);const pose=document.createElement('span');pose.className='helper-pose';pose.append(face,handWindow);node.append(pose,timer);ingredients.parentElement.append(node);helperCatElements.set(h,node);}const position=(left+width*(h.slot+.5)/ECONOMY.helpers.maxActive)+'px';if(node.style.left!==position)node.style.left=position;setText(node.querySelector('small'),Math.ceil(h.remainingMs/1000)+'s');});}
function animateIngredient(family,tier,id=null,helper=null,kind=null){if(!kind){if(helper)playOriginalSfx('Pushcat Hit.wav',.12,120);else playIngredientPlop(reducedMotion?0:INGREDIENT_FLIGHT_MS);}if(helper&&!reducedMotion)showHelperCatch(helper);if(reducedMotion){if(!kind)showCauldronTexture('plop',180);return;}const source=id!==null?beltElements.get(id):$('ingredients').children[family],target=document.querySelector(kind==='ticket'?'#tickets-display':kind==='solution'?'.solution-balance':'.liquid');if(!source||!target)return;const from=source.getBoundingClientRect(),to=target.getBoundingClientRect(),image=document.createElement('img'),x=from.left+from.width/2-20,y=from.top+from.height/2-20,dx=to.left+to.width/2-20-x,dy=to.top+to.height/2-20-y;image.src=art(kind==='ticket'?'Nyan-Ticket.png':kind==='solution'?'OriginalMiracleSolution.png':FAMILIES[family].materials[tier].image);image.alt='';image.className='falling-ingredient';image.style.left=x+'px';image.style.top=y+'px';document.body.append(image);const flight=image.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${dx*.35}px,${Math.min(-24,dy*.15)}px) rotate(-15deg) scale(.95)`,opacity:1,offset:.3},{transform:`translate(${dx}px,${dy}px) rotate(25deg) scale(.35)`,opacity:0}],{duration:INGREDIENT_FLIGHT_MS,easing:'ease-in',fill:'forwards'});flight.finished.then(()=>{if(!kind)showCauldronTexture('plop',350);}).catch(()=>{}).finally(()=>image.remove());}
function showHelperCatch(helper){const node=helperCatElements.get(helper);if(!node)return;clearTimeout(node.catchTimer);node.classList.add('catching');node.catchTimer=setTimeout(()=>node.classList.remove('catching'),100);}
function renderHelper(){const helpers=game.state.helpers,button=$('pushcat-summon');button.disabled=helpers.length>=ECONOMY.helpers.maxActive||game.state.tickets<ECONOMY.helpers.ticketCost;setText($('pushcat-label'),'Summon Pushcat');setText($('pushcat-status'),helpers.length?helpers.length+' / '+ECONOMY.helpers.maxActive+' cats · '+(!game.state.potion?'Paused':'Working'):'1 ticket');syncHelperCats();}

$('pushcat-summon').onclick=()=>{const tickets=game.state.tickets,rubies=game.state.rubies,stats={...game.state.helperStats},helpers=[...game.state.helpers],kind=game.summonHelper();if(!kind)return;save(true);if(!saveOK||saveBlocked){game.state.tickets=tickets;game.state.rubies=rubies;game.state.helperStats=stats;game.state.helpers=helpers;saveDirty=true;notice('Could not save the summon. Your ticket was returned.');}else{playOriginalSfx('Summon Pushcat.wav',.2);notice((kind==='blackcat'?'Blackcat':'Pushcat')+' is here to help! Pick the first ingredient to begin.','success');}render();};window.refreshHelper=renderHelper;renderHelper();

function decorateGameText(root){if(!root)return;const nodes=[];if(root.nodeType===3)nodes.push(root);else if(root.nodeType===1){if(root.closest('script,style,textarea,input,select,option,pre,code,[contenteditable],.reward-chip,.ui-family'))return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())nodes.push(walker.currentNode);}for(const node of nodes){const parent=node.parentElement;if(!parent||parent.closest('script,style,textarea,input,select,option,pre,code,[contenteditable],.reward-chip,.ui-family'))continue;const text=node.nodeValue,pattern=/\b(Life|Mana|Stamina)\b|\b(\d+(?:,\d{3})*(?:\.\d+)?)\s+(failure protection(?: charges?)?|protection(?: charges?)?|enhancement(?: bonus(?:es)?)?(?: charges?)?|double-sale(?: charges?)?|selling(?: bonus(?:es)?)?(?: charges?)?|sale boost(?: charges?)?|Pushcat tickets?|tickets?|rubies|ruby|likeability|expedition stamps?|stamps?)\b/g;let match,last=0,fragment=null;while((match=pattern.exec(text))){fragment??=document.createDocumentFragment();fragment.append(document.createTextNode(text.slice(last,match.index)));if(match[1]){const span=document.createElement('span');span.className='ui-family';span.textContent=match[1];span.style.color=FAMILIES.find(f=>f.label===match[1]).color;fragment.append(span);}else{const label=match[3],kind=/protection/.test(label)?'protection':/enhancement/.test(label)?'enhancement':/double-sale|selling|sale boost/.test(label)?'selling':/ticket/.test(label)?'tickets':/rub/.test(label)?'rubies':/likeability/.test(label)?'likeability':'stamps';fragment.append(rewardChip(kind,match[2]));}last=pattern.lastIndex;}if(fragment){fragment.append(document.createTextNode(text.slice(last)));node.replaceWith(fragment);}}}
decorateGameText(document.body);const presentationObserver=new MutationObserver(changes=>{const roots=new Set();for(const change of changes){if(change.type==='characterData')roots.add(change.target);else for(const node of change.addedNodes)roots.add(node);}for(const root of roots)if(root.isConnected)decorateGameText(root);});presentationObserver.observe(document.body,{childList:true,subtree:true,characterData:true});
