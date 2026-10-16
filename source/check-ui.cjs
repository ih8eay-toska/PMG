// Exercise real UI handlers with in-memory DOM fixtures; this is not a visual browser test.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const core=require('./core.js'),app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),pio=fs.readFileSync(path.join(__dirname,'pio.js'),'utf8');
const handlers={},nodes=new Map(),animations=[];
class Element{
 constructor(){this.children=[];this.dataset={};this.style={};this.attributes={};this.hidden=false;this.clientWidth=456;this.firstChild={textContent:''};this.classes=new Set();this.classList={add:(...c)=>c.forEach(x=>this.classes.add(x)),remove:c=>this.classes.delete(c),toggle:(c,on)=>{if(on)this.classes.add(c);else this.classes.delete(c);},contains:c=>this.classes.has(c)};}
 append(...children){for(const c of children){c.parentElement=this;this.children.push(c);}}
 replaceChildren(...children){this.children=[];this.append(...children);}
 remove(){if(this.parentElement)this.parentElement.children=this.parentElement.children.filter(x=>x!==this);}
 setAttribute(k,v){this.attributes[k]=String(v);}
 getAttribute(k){return this.attributes[k];}
 removeAttribute(k){delete this.attributes[k];}
 querySelector(k){this.queries??=new Map();if(!this.queries.has(k))this.queries.set(k,new Element());return this.queries.get(k);}
 animate(frames,options){animations.push(options);return{finished:Promise.resolve(),cancel(){},finish(){}};}
 click(){this.onclick?.();}
}
function $(id){if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id);}
$('ingredients').parentElement=new Element();
let modal=false,now=Date.now(),reduced=false,saves=0,scenePlays=0;
const timeouts=[],ctx=vm.createContext({...core,QUEST_OFFER_MS:core.ECONOMY.visitors.offerMs,QUEST_REWARD_DELAY_MS:core.ECONOMY.visitors.rewardDelayMs,$,window:{},document:{hidden:false,createElement:()=>new Element(),addEventListener:(type,fn)=>handlers[type]=fn,querySelector:()=>modal?{}:null},Date:class extends Date{static now(){return now;}},Math:Object.assign(Object.create(Math),{random:()=>0}),game:new core.PotionGame(),art:x=>x,setText:(el,v)=>el.textContent=String(v),fmt:String,duration:String,notice(){},save(){saves++;},render(){},flash(){},masteredPotionCount(){return ctx.game.state.masteryStars.length;},requestAnimationFrame(){},matchMedia:()=>({matches:reduced}),setTimeout:fn=>{timeouts.push(fn);return timeouts.length;},playTiaScene(){scenePlays++;ctx.game.state.tiaIntroSeen=true;},tiaSceneTimer:null});
const run=s=>vm.runInContext(s,ctx);
function line(prefix){const s=app.split(/\r?\n/).find(s=>s.startsWith(prefix));assert.ok(s,prefix);run(s);}
for(const name of ['updateVisitorShortcut','readyQuestIndex','updateSellAction','updateBeltLabels','materialValue','imgButton','ticketButton','solutionButton','startBelt','drawSelectedIngredients','collectMaterial','catchMaterial','animate','rewardOddsText','updateRewardShop'])line('function '+name+'(');
run(app.slice(app.indexOf('function syncBelt('),app.indexOf('function startBelt(')));
Object.assign(ctx,{ingredientMode:'manual',conveyor:new core.MaterialConveyor(456,[0,0,0],()=>0,()=>({eventActive:true}),true),belt:[],beltSlots:'',beltElements:new Map(),beltWidth:456,gameSettings:{conveyorSpeed:1},reducedMotion:false,specialRack:new Element(),lastFrame:0});
assert.equal(ctx.materialValue(.7),'0.7');
// Asset aliases retain exact-key priority and the first normalized match.
const assetContext=vm.createContext({ASSETS:{'Some_Art.png':'first','Some-Art.png':'second','Other.png':'other'}});vm.runInContext(app.split(/\r?\n/).find(s=>s.startsWith('function art(')),assetContext);assert.equal(assetContext.art('some art.png'),'first');const aliases=assetContext.art.aliases;assert.equal(assetContext.art('Some-Art.png'),'second');assert.equal(assetContext.art('absent'),'');assert.equal(assetContext.art.aliases,aliases);
// Manual mode shows only special drops and keeps them available after redraws.
ctx.conveyor.items=[{family:0,tier:0,id:10,x:0},{kind:'ticket',id:11,x:76},{kind:'solution',id:12,x:152}];
ctx.startBelt(false);assert.equal(ctx.specialRack.hidden,false);assert.equal($('ingredients').children.length,3);assert.equal($('special-ingredients').children.length,2);assert.equal(ctx.belt.length,2);
const originalButton=$('ingredients').children[0],originalSelector=$('starter-selectors').children[0];ctx.drawSelectedIngredients();assert.equal($('ingredients').children[0],originalButton);assert.equal($('starter-selectors').children[0],originalSelector);ctx.game.state.selected[0]=1;ctx.game.state.tiers[0]=1;ctx.drawSelectedIngredients();assert.notEqual($('ingredients').children[0],originalButton);ctx.game.state.selected[0]=0;ctx.game.state.tiers[0]=0;ctx.drawSelectedIngredients();
line("document.addEventListener('keydown'");
const key=(key,extra={})=>handlers.keydown({key,target:{tagName:'BODY'},...extra});
key('1');assert.ok(ctx.game.state.potion);assert.equal(ctx.belt.length,2,'manual redraw must retain special keyboard targets');
key('4');assert.equal(ctx.game.state.tickets,1);assert.equal(ctx.conveyor.items.some(x=>x.id===11),false);key('4');assert.equal(ctx.game.state.eventRotation.solution,1);
const count=ctx.game.state.ingredients;key('2',{target:{tagName:'SELECT'}});modal=true;key('2');modal=false;assert.equal(ctx.game.state.ingredients,count);
ctx.ingredientMode='conveyor';ctx.startBelt(false);assert.equal(ctx.specialRack.hidden,true);assert.equal(ctx.conveyor.manual,false);
ctx.ingredientMode='manual';ctx.startBelt(false);assert.equal(ctx.conveyor.manual,true);
ctx.conveyor.items=[{kind:'ticket',id:20,x:80}];ctx.reducedMotion=true;ctx.syncBelt();assert.equal(ctx.beltElements.get(20).style.transform,'translateX(76px) scaleX(-1)');
// Dense cards retain separate clickable strips with the correct item handler.
ctx.ingredientMode='conveyor';ctx.conveyor.spacing=76/3.28;ctx.conveyor.items=[{kind:'ticket',id:40,x:100},{kind:'ticket',id:41,x:100+76/3.28}];ctx.syncBelt();assert.ok(parseFloat(ctx.beltElements.get(40).style.width)<76/3.28);const ticketCount=ctx.game.state.tickets;ctx.beltElements.get(40).click();assert.equal(ctx.game.state.tickets,ticketCount+1);assert.ok(ctx.conveyor.items.some(m=>m.id===41));
// Stable conveyor cards avoid repeated style writes; movement changes only transforms.
ctx.reducedMotion=false;ctx.syncBelt();let styleWrites=0;for(const el of ctx.beltElements.values())el.style=new Proxy(el.style,{set(target,key,value){styleWrites++;target[key]=value;return true;}});ctx.syncBelt();assert.equal(styleWrites,0);for(const item of ctx.conveyor.items)item.x-=1;ctx.syncBelt();assert.equal(styleWrites,ctx.beltElements.size);
// Event expiration removes stale Solution immediately in either mode.
for(const mode of ['manual','conveyor']){
 ctx.ingredientMode=mode;ctx.game=new core.PotionGame();ctx.game.state.eventRotation.elapsedMs=core.EVENT_ACTIVE_MS;
 ctx.conveyor.items=[{kind:'solution',id:30,x:76},{kind:'ticket',id:31,x:152}];ctx.syncBelt();
 Object.assign(ctx,{eventClock:new Element(),solutionCount:new Element(),eventFigures:[],promotion:new Element(),eventOpen:new Element(),eventDialog:new Element(),eventStatusText:()=>'',refreshEventPage(){}});
 line('function updateEventGallery(');line('window.refreshEvents=');ctx.window.refreshEvents();assert.equal(ctx.conveyor.items.some(x=>x.kind==='solution'),false);assert.equal(ctx.beltElements.has(30),false,'expired Solution must leave the DOM immediately');
}
// Sidebar shows exactly the current/next pair, and archive/next during breaks, including wraparound.
ctx.promotion=new Element();ctx.eventOpen=new Element();ctx.eventFigures=core.EVENTS.map(()=>new Element());
for(let index=0;index<core.EVENTS.length;index++)for(const active of [true,false]){ctx.updateEventGallery({index,active});const next=(index+1)%core.EVENTS.length;assert.equal(ctx.promotion.hidden,active);ctx.eventFigures.forEach((figure,i)=>{assert.equal(figure.hidden,i!==next&&(!active||i!==index));assert.equal(figure.style.order,i===next?'1':'0');});assert.match(ctx.eventOpen.textContent,active?/View current/:/Redeem ending/);}
// Unchanged rotation does not revisit banner elements; phase/index loops above cover invalidation.
let bannerLookups=0;for(const figure of ctx.eventFigures){const query=figure.querySelector.bind(figure);figure.querySelector=k=>{bannerLookups++;return query(k);};}ctx.updateEventGallery({index:core.EVENTS.length-1,active:false});assert.equal(bannerLookups,0);
// Enhancement text reuses nodes until its displayed values change, including leaving maximum level.
const enhancementCode=app.slice(app.indexOf('if(n){const details='),app.indexOf('\n }else{',app.indexOf('if(n){const details=')));
ctx.n={chance:.8,multiplier:2};run(enhancementCode);const rateNode=$('enhance-details').children[0];run(enhancementCode);assert.equal($('enhance-details').children[0],rateNode);ctx.n={chance:.9,multiplier:2};run(enhancementCode);assert.notEqual($('enhance-details').children[0],rateNode);ctx.n=null;ctx.game.enhancementStatus=()=> 'max';run(enhancementCode);assert.equal($('enhance-details').dataset.enhancement,undefined);ctx.n={chance:.9,multiplier:2};run(enhancementCode);assert.equal($('enhance-details').dataset.enhancement,'0.9|2');
// Fairy details update when equipped fairy or level changes, and hide when unequipped.
line('function renderFairyShortcut(');ctx.fairyEffectText=id=>id;ctx.game=new core.PotionGame();const fairy=core.FAIRIES[0];ctx.game.state.activeFairyId=fairy.id;ctx.game.state.fairies[fairy.id]=1;ctx.renderFairyShortcut();assert.equal($('equipped-fairy-level').textContent,'Level 1 / 10');ctx.game.state.fairies[fairy.id]=2;ctx.renderFairyShortcut();assert.equal($('equipped-fairy-level').textContent,'Level 2 / 10');ctx.game.state.activeFairyId=null;ctx.renderFairyShortcut();assert.equal($('fairy-shortcut').hidden,true);
// Upgrade rendering skips ordinary pickups but invalidates currency, mastery, metrics and save replacement.
ctx.game=new core.PotionGame();ctx.upgradeNodes=new Map();ctx.renderUpgradeSummary=()=>{};line('const upgradeRows=');run(app.slice(app.indexOf('function renderUpgrades('),app.indexOf('function renderUpgradeSummary(')));ctx.renderUpgrades();const originalInfo=ctx.game.upgradeInfo.bind(ctx.game);let upgradeReads=0;ctx.game.upgradeInfo=key=>{upgradeReads++;return originalInfo(key);};ctx.game.collect(0,0);ctx.renderUpgrades();upgradeReads=0;ctx.game.collect(0,0);ctx.renderUpgrades();assert.equal(upgradeReads,0);ctx.game.state.coins=1000;ctx.renderUpgrades();assert.ok(upgradeReads>0);upgradeReads=0;ctx.game.state.masteryStars.push('0-0');ctx.renderUpgrades();assert.ok(upgradeReads>0);const previousState=ctx.renderUpgrades.state;ctx.game=new core.PotionGame();ctx.renderUpgrades();assert.notEqual(ctx.renderUpgrades.state,previousState);
// Character selection invalidates when Tia unlocks or the selected brewer changes.
Object.assign(ctx,{progress:new Element(),replayScene:new Element(),buttons:['Pio','Tia'].map(name=>{const b=new Element();b.dataset.character=name;return b;}),trigger:new Element(),portrait:new Element(),selectWardrobe(){}});ctx.window.brewerCharacter='Pio';run(pio.split(/\r?\n/).find(s=>s.includes('function updateChoices(){')).trim());ctx.updateChoices();assert.equal(ctx.buttons[1].disabled,true);ctx.game.state.tiaUnlocked=true;ctx.updateChoices();assert.equal(ctx.buttons[1].disabled,false);ctx.window.brewerCharacter='Tia';ctx.updateChoices();assert.equal(ctx.buttons[1].getAttribute('aria-pressed'),'true');ctx.game.state.tiaUnlocked=false;ctx.updateChoices();assert.equal(ctx.window.brewerCharacter,'Pio');
// Real sell handler delivers matching orders without awarding a sale or selling boost.
ctx.game=new core.PotionGame();ctx.game.state.nextVisitorAt=1;ctx.game.tick(now,()=>0);ctx.game.acceptQuest(0,now);ctx.game.collect(0,0);ctx.game.state.powerups.selling=1;
ctx.updateVisitorShortcut();assert.ok($('visitor-shortcut').classes.has('quest-complete'));ctx.updateSellAction();assert.match($('sell').firstChild.textContent,/Advance quest/);
line("$('sell').onclick=");$('sell').click();assert.equal(ctx.game.state.travelers[0].phase,'returning');assert.equal(ctx.game.state.coins,0);assert.equal(ctx.game.state.powerups.selling,1);assert.equal(ctx.game.state.potion,null);
ctx.updateVisitorShortcut();assert.equal($('visitor-shortcut').classes.has('quest-complete'),false);now=ctx.game.state.travelers[0].readyAt;ctx.game.settle(now);ctx.updateVisitorShortcut();assert.ok($('visitor-shortcut').classes.has('quest-complete'));assert.match($('visitor-shortcut').getAttribute('aria-label'),/Quest complete/);
ctx.game.dismissVisitor(0,now,()=>0);ctx.updateVisitorShortcut();assert.ok($('visitor-shortcut').hidden);
// A locked/migrated Tia intro waits for dialogs/visibility, retries and runs once.
const intro=pio.slice(pio.indexOf('window.playTiaUnlockScene=()=>'),pio.indexOf(';updateChoices();render();',pio.indexOf('window.playTiaUnlockScene=()=>')));assert.ok(intro.length>0);run(intro);
ctx.window.playTiaUnlockScene();assert.equal(timeouts.length,0);ctx.game.state.tiaUnlocked=true;modal=true;ctx.window.playTiaUnlockScene();timeouts.shift()();assert.equal(scenePlays,0);modal=false;
ctx.window.playTiaUnlockScene();timeouts.shift()();assert.equal(scenePlays,1);ctx.window.playTiaUnlockScene();assert.equal(timeouts.length,0);
// Use the actual reveal handler: rewards/save/quota commit before animation resolves.
Object.assign(ctx,{rewardKind:'hourly',rewardBusy:false,rewardAnimation:null,rewardDialog:new Element(),rewardButtons:Object.fromEntries(['hourly','tickets','skin'].map(k=>[k,{detail:new Element()}])),rewardLabels:{tickets:'tickets',rubies:'rubies',protection:'protection',enhancement:'enhancement',selling:'selling',fairy:'fairy',skin:'skin'},CURRENCY_UNITS:core.ECONOMY.bank.units,rewardArt:x=>x,rewardDescription:r=>r.amount+' '+r.currency});
run(app.slice(app.indexOf('async function openChest('),app.indexOf("rewardDialog.querySelector('.reward-open').onclick")));
(async()=>{
 for(const reduce of [false,true]){
  reduced=reduce;ctx.reducedMotion=reduce;ctx.game=new core.PotionGame();ctx.game.state.coins=1000;ctx.rewardBusy=false;
  const oldSaves=saves,pending=ctx.openChest();assert.equal(ctx.game.state.coins,950);assert.equal(ctx.game.state.rewardHistory.length,1);assert.equal(saves,oldSaves+1);assert.ok(ctx.rewardBusy);await pending;
  assert.equal(animations.at(-1).duration,reduce?0:4200);assert.equal(ctx.rewardDialog.querySelector('.case-reel').children.length,38);assert.match(ctx.rewardDialog.querySelector('.reward-result').textContent,/You received/);
  await ctx.openChest();await ctx.openChest();const history=ctx.game.state.rewardHistory.length;await ctx.openChest();assert.equal(ctx.game.state.rewardHistory.length,history);assert.equal(ctx.rewardDialog.querySelector('.reward-open').disabled,true);assert.match(ctx.rewardDialog.querySelector('.reward-quota').textContent,/0 \/ 3/);
  await ctx.openChest(true);assert.equal(ctx.game.state.rewardHistory.length,history+1);assert.equal(ctx.game.paidBoostInfo().remaining,0);
 }
 console.log('Passed: real UI handlers for manual drops/mode switches/keys, quest handover/completion badge, deferred Tia intro, chest reveals and saved quotas with reduced motion.');
})().catch(error=>{console.error(error);process.exitCode=1;});
