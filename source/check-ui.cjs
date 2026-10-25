// Exercise real UI handlers with in-memory DOM fixtures; this is not a visual browser test.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const core=require('./core.js'),app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),pio=fs.readFileSync(path.join(__dirname,'pio.js'),'utf8'),template=fs.readFileSync(path.join(__dirname,'index.template.html'),'utf8');
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
const timeouts=[],ctx=vm.createContext({...core,QUEST_OFFER_MS:core.ECONOMY.visitors.offerMs,QUEST_REWARD_DELAY_MS:core.ECONOMY.visitors.rewardDelayMs,$,window:{},document:{hidden:false,createElement:()=>new Element(),addEventListener:(type,fn)=>handlers[type]=fn,querySelector:()=>modal?{}:null},Date:class extends Date{static now(){return now;}},Math:Object.assign(Object.create(Math),{random:()=>0}),game:new core.PotionGame(),art:x=>x,setText:(el,v)=>el.textContent=String(v),fmt:String,duration:String,notice(){},animateIngredient(){},playOriginalSfx(){},save(){saves++;},render(){},flash(){},masteredPotionCount(){return ctx.game.state.masteryStars.length;},requestAnimationFrame(){},matchMedia:()=>({matches:reduced}),setTimeout:fn=>{timeouts.push(fn);return timeouts.length;},playTiaScene(){scenePlays++;ctx.game.state.tiaIntroSeen=true;},tiaSceneTimer:null});
const run=s=>vm.runInContext(s,ctx);
function line(prefix){const s=app.split(/\r?\n/).find(s=>s.startsWith(prefix));assert.ok(s,prefix);run(s);}
for(const name of ['updateVisitorShortcut','readyQuestIndex','updateSellAction','renderNumberArt','renderEnhanceMultiplier','updateBeltLabels','materialValue','imgButton','ticketButton','solutionButton','startBelt','drawSelectedIngredients','collectMaterial','catchMaterial','animate','rewardOddsText','updateRewardShop'])line('function '+name+'(');
run(app.slice(app.indexOf('function syncBelt('),app.indexOf('function startBelt(')));
Object.assign(ctx,{ingredientMode:'manual',conveyor:new core.MaterialConveyor(456,[0,0,0],()=>0,()=>({eventActive:true}),true),belt:[],beltSlots:'',beltElements:new Map(),beltWidth:456,gameSettings:{},reducedMotion:false,specialRack:new Element(),lastFrame:0});
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
ctx.conveyor.items=[{kind:'ticket',id:20,x:ctx.conveyor.spacing}];ctx.reducedMotion=true;ctx.syncBelt();assert.equal(ctx.beltElements.get(20).style.transform,`translateX(${ctx.conveyor.spacing}px) scaleX(-1)`);
// Dense cards at the source maximum keep separate clickable strips with the correct item handler.
ctx.ingredientMode='conveyor';ctx.conveyor.spacing=4;ctx.conveyor.items=[{kind:'ticket',id:40,x:100},{kind:'ticket',id:41,x:104}];ctx.syncBelt();assert.ok(parseFloat(ctx.beltElements.get(40).style.width)<4);const ticketCount=ctx.game.state.tickets;ctx.beltElements.get(40).click();assert.equal(ctx.game.state.tickets,ticketCount+1);assert.ok(ctx.conveyor.items.some(m=>m.id===41));ctx.conveyor.spacing=2;ctx.conveyor.items=[{kind:'ticket',id:42,x:100}];ctx.syncBelt();assert.equal(ctx.beltElements.get(42).style.width,'2px');
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
ctx.renderNumberArt($('value'),'3,987');assert.equal($('value').children[0].src,'PrettyDigit3.png');assert.equal($('value').children[1].textContent,',');assert.equal($('value').children.at(-1).textContent,'3,987');const priceGlyph=$('value').children[0];ctx.renderNumberArt($('value'),'3,987');assert.equal($('value').children[0],priceGlyph);ctx.renderNumberArt($('value'),'');assert.equal($('value').children.length,1);
// Enhancement text reuses nodes until its displayed values change, including leaving maximum level.
const enhancementCode=app.slice(app.indexOf('if(n){const details='),app.indexOf('\n }else{',app.indexOf('if(n){const details=')));
ctx.n={chance:.8,multiplier:2};run(enhancementCode);const rateNode=$('enhance-details').children[0];assert.equal($('enhance-multiplier').children[0].textContent,'2');assert.equal($('enhance-multiplier').children[0].className,'mult-number');assert.equal($('enhance-multiplier').hidden,false);run(enhancementCode);assert.equal($('enhance-details').children[0],rateNode);ctx.n={chance:.9,multiplier:2};run(enhancementCode);assert.notEqual($('enhance-details').children[0],rateNode);ctx.n=null;ctx.game.enhancementStatus=()=> 'max';run(enhancementCode);assert.equal($('enhance-details').dataset.enhancement,undefined);assert.equal($('enhance-details').dataset.status,'max');assert.equal($('enhance-details').textContent,'Maximum enhancement reached');assert.equal($('enhance-multiplier').hidden,true);ctx.n={chance:.9,multiplier:2};run(enhancementCode);assert.equal($('enhance-details').dataset.status,undefined);assert.equal($('enhance-details').dataset.enhancement,'0.9|2');assert.equal($('enhance-multiplier').hidden,false);
// Fairy details update when equipped fairy or level changes, and hide when unequipped.
line('function renderFairyShortcut(');ctx.fairyEffectText=id=>id;ctx.game=new core.PotionGame();const fairy=core.FAIRIES[0];ctx.game.state.activeFairyId=fairy.id;ctx.game.state.fairies[fairy.id]=1;ctx.renderFairyShortcut();assert.equal($('equipped-fairy-level').textContent,'Level 1 / 10');ctx.game.state.fairies[fairy.id]=2;ctx.renderFairyShortcut();assert.equal($('equipped-fairy-level').textContent,'Level 2 / 10');ctx.game.state.activeFairyId=null;ctx.renderFairyShortcut();assert.equal($('fairy-shortcut').hidden,true);
// Upgrade rendering skips ordinary pickups but invalidates currency, mastery, metrics and save replacement.
ctx.game=new core.PotionGame();ctx.upgradeNodes=new Map();ctx.renderUpgradeSummary=()=>{};line('const upgradeRows=');run(app.slice(app.indexOf('function renderUpgrades('),app.indexOf('function renderUpgradeSummary(')));ctx.renderUpgrades();const originalInfo=ctx.game.upgradeInfo.bind(ctx.game);let upgradeReads=0;ctx.game.upgradeInfo=key=>{upgradeReads++;return originalInfo(key);};ctx.game.collect(0,0);ctx.renderUpgrades();upgradeReads=0;ctx.game.collect(0,0);ctx.renderUpgrades();assert.equal(upgradeReads,0);ctx.game.state.coins=1000;ctx.renderUpgrades();assert.ok(upgradeReads>0);upgradeReads=0;ctx.game.state.masteryStars.push('0-0');ctx.renderUpgrades();assert.ok(upgradeReads>0);const previousState=ctx.renderUpgrades.state;ctx.game=new core.PotionGame();ctx.renderUpgrades();assert.notEqual(ctx.renderUpgrades.state,previousState);
// Character selection invalidates when Tia unlocks or the selected brewer changes.
Object.assign(ctx,{progress:new Element(),replayScene:new Element(),buttons:['Pio','Tia'].map(name=>{const b=new Element();b.dataset.character=name;return b;}),trigger:new Element(),portrait:new Element(),selectWardrobe(){}});ctx.window.brewerCharacter='Pio';run(pio.split(/\r?\n/).find(s=>s.includes('function updateChoices(){')).trim());ctx.updateChoices();assert.equal(ctx.buttons[1].disabled,true);assert.equal(ctx.buttons[1].querySelector('.character-choice-label').textContent,'Tia · Locked');assert.equal(ctx.buttons[1].getAttribute('aria-label'),'Tia · Locked');ctx.game.state.tiaUnlocked=true;ctx.updateChoices();assert.equal(ctx.buttons[1].disabled,false);assert.equal(ctx.buttons[1].querySelector('.character-choice-label').textContent,'Tia');ctx.window.brewerCharacter='Tia';ctx.updateChoices();assert.equal(ctx.buttons[1].getAttribute('aria-pressed'),'true');ctx.game.state.tiaUnlocked=false;ctx.updateChoices();assert.equal(ctx.window.brewerCharacter,'Pio');assert.equal(ctx.buttons[0].querySelector('.character-choice-label').textContent,'Pio');
// The traveler offer exposes Request and OK only; the shortcut keeps no caption without an active commission.
assert.doesNotMatch(app,/button\('Not now'/);assert.doesNotMatch(app,/traveler-dismiss/);assert.doesNotMatch(template,/id="commission-progress">Choose order</);line('function updateRequestIndicator(');ctx.game=new core.PotionGame();ctx.updateRequestIndicator();assert.equal($('commission-progress').textContent,'');assert.equal(ctx.game.acceptCommission(0),true);ctx.updateRequestIndicator();assert.match($('commission-progress').textContent,/^0 \/ \d+$/);ctx.game.state.commission=null;ctx.updateRequestIndicator();assert.equal($('commission-progress').textContent,'');
// Real sell handler delivers matching orders without awarding a sale or selling boost.
ctx.game=new core.PotionGame();ctx.game.state.nextVisitorAt=1;ctx.game.tick(now,()=>0);ctx.game.acceptQuest(0,now);ctx.game.collect(0,0);ctx.game.state.powerups.selling=1;
ctx.updateVisitorShortcut();assert.ok($('visitor-shortcut').classes.has('quest-complete'));ctx.updateSellAction();assert.match($('sell-label').textContent,/Advance quest/);assert.ok($('sell').classes.has('quest-ready'));
line("$('sell').onclick=");$('sell').click();assert.equal(ctx.game.state.travelers[0].phase,'returning');assert.equal(ctx.game.state.coins,0);assert.equal(ctx.game.state.powerups.selling,1);assert.equal(ctx.game.state.potion,null);ctx.updateSellAction();assert.equal($('sell').classes.has('quest-ready'),false);assert.equal($('sell-label').textContent,'Sell');
ctx.updateVisitorShortcut();assert.equal($('visitor-shortcut').classes.has('quest-complete'),false);now=ctx.game.state.travelers[0].readyAt;ctx.game.settle(now);assert.equal(ctx.game.state.travelers[0].phase,'away');ctx.updateVisitorShortcut();assert.ok($('visitor-shortcut').hidden);
// A locked/migrated Tia intro waits for dialogs/visibility, retries and runs once.
const intro=pio.slice(pio.indexOf('window.playTiaUnlockScene=()=>'),pio.indexOf(';updateChoices();render();',pio.indexOf('window.playTiaUnlockScene=()=>')));assert.ok(intro.length>0);run(intro);
ctx.window.playTiaUnlockScene();assert.equal(timeouts.length,0);ctx.game.state.tiaUnlocked=true;modal=true;ctx.window.playTiaUnlockScene();timeouts.shift()();assert.equal(scenePlays,0);modal=false;
ctx.window.playTiaUnlockScene();timeouts.shift()();assert.equal(scenePlays,1);ctx.window.playTiaUnlockScene();assert.equal(timeouts.length,0);
// Moved debug controls: exact brewing stays opt-in, labels expose the active mode and the larger coin cheat respects the cap.
ctx.game=new core.PotionGame();ctx.conveyor=new core.MaterialConveyor(456,[0,0,0],()=>0,()=>({}),false);ctx.ingredientMode='conveyor';ctx.startBelt(false);
line("$('ingredient-mode-toggle').onclick=");
assert.equal($('ingredient-mode-toggle').textContent,'Choose exact ingredients (debug)');assert.equal($('ingredient-mode-toggle').getAttribute('aria-pressed'),'false');assert.equal($('ingredient-mode-status').textContent,'Conveyor');assert.equal($('dev-cheats-mode').hidden,true);
$('ingredient-mode-toggle').click();assert.equal(ctx.ingredientMode,'manual');assert.equal($('ingredient-mode-toggle').textContent,'Return to conveyor');assert.equal($('ingredient-mode-toggle').getAttribute('aria-pressed'),'true');assert.equal($('ingredient-mode-status').textContent,'Exact ingredients (debug)');assert.equal($('dev-cheats-mode').hidden,false);assert.match($('rack-label').textContent,/debug/i);
$('ingredient-mode-toggle').click();assert.equal(ctx.ingredientMode,'conveyor');assert.equal($('ingredient-mode-toggle').textContent,'Choose exact ingredients (debug)');assert.equal($('dev-cheats-mode').hidden,true);assert.equal($('rack-label').textContent,'Catch an ingredient to start');
let lastNotice='';const previousNotice=ctx.notice;ctx.notice=text=>{lastNotice=text;};line("$('dev-coins').onclick=");const coinsBefore=ctx.game.state.coins;$('dev-coins').click();assert.equal(ctx.game.state.coins,coinsBefore+100000000);assert.equal(lastNotice,'Debug cheat: added 100,000,000 coins.');ctx.game.state.coins=1e300;$('dev-coins').click();assert.equal(ctx.game.state.coins,1e300);ctx.notice=previousNotice;
// Legacy Neet tier-1 journeys render as four separate paragraphs before the outcome, and the journal rereads both.
run(app.slice(app.indexOf('function appendStoryParagraphs('),app.indexOf('function markExpeditionStorySeen(')));
run(app.slice(app.indexOf('function renderExpeditionJournal('),app.indexOf("$('expedition-journal-open')")));
{
 ctx.game=new core.PotionGame();ctx.game.state.expeditionStories=[{kind:'route',traveler:'neet',tier:0,family:0,at:1000,seen:true}];
 const journeyStory=ctx.game.recordExpeditionStory(0,{family:0,tier:0},1000,false,null);
 ctx.renderExpeditionStory(journeyStory);
 const storyContent=$('expedition-story-content'),journeySection=storyContent.children[0],outcomeSection=storyContent.children[1];
 assert.equal(storyContent.children.length,2);
 assert.equal(journeySection.dataset.kind,'journey');assert.equal(journeySection.children[0].textContent,'Journey');
 assert.equal(journeySection.children.length,5);assert.equal(journeySection.children.slice(1).length,4);
 assert.equal(journeySection.children.slice(1).map(paragraph=>paragraph.textContent).join('\n\n'),journeyStory.sections[0].text);
 assert.equal(outcomeSection.dataset.kind,'outcome');assert.equal(outcomeSection.children[1].textContent,journeyStory.sections[1].text);
 ctx.renderExpeditionJournal();
 const journalDetails=$('expedition-journal').children.find(child=>child.className==='expedition-journal-group'),routeArticle=journalDetails.children[1];
 assert.equal(routeArticle.children[2].textContent,'Journey');assert.equal(routeArticle.children.slice(3,7).length,4);
 assert.equal(routeArticle.children[7].textContent,'Outcome');assert.equal(routeArticle.children[8].textContent,journeyStory.sections[1].text);
}
// Tier chapter flows: picker card, opening choice, route change, absent dispatch, completion beats, journal replay and saved-time notice.
{
 const chapter=require('../data/expedition-chapters.json').chapters.find(entry=>entry.id==='neet-t2-mushroom-foraging');
 const storyDialog=$('expedition-story-dialog'),next=$('expedition-story-next'),secondary=$('expedition-story-secondary'),content=$('expedition-story-content');
 const previousNow=now;storyDialog.open=false;storyDialog.showModal=()=>{storyDialog.open=true;};storyDialog.close=()=>{storyDialog.open=false;};
 const lastText=()=>content.children[0].children.at(-1).children.at(-1).textContent;
 run(app.slice(app.indexOf('function renderExpeditionChapters('),app.indexOf('function renderExpeditions(')));
 line("$('expedition-story-next').onclick=");line("$('expedition-story-secondary').onclick=");line('function markExpeditionStorySeen(');line('function queueExpeditionStory(');

 // The card is visible and opens even while Neet is away; dispatch is disabled without charge.
 ctx.game=new core.PotionGame();ctx.game.state.tiers=[1,0,0];ctx.game.state.travelers[0].phase='away';ctx.game.state.coins=1234;
 ctx.renderExpeditionChapters();
 const cardFor=tier=>$('expedition-chapter-list').children.find(entry=>entry.children[0].textContent.startsWith('Tier '+tier+' · '));
 assert.equal($('expedition-chapters').hidden,false);assert.equal($('expedition-chapter-list').children.length,4);
 assert.match($('expedition-chapter-list').children[0].children[0].textContent,/Tier 1.*Herbs for the Shrine/);assert.match($('expedition-chapter-list').children[1].children[0].textContent,/Tier 2.*Mushroom Foraging/);
 assert.match($('expedition-chapter-list').children[2].children[0].textContent,/Tier 1.*Trailside Herb Hunt/);assert.match($('expedition-chapter-list').children[3].children[0].textContent,/Tier 2.*Mushrooms at Base Camp/);
 const card=cardFor(2);assert.ok(card);assert.match(card.children[2].textContent,/Read now/);
 card.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),chapter.opening[0].text);
 ctx.advanceExpeditionChapter();assert.equal(lastText(),chapter.opening[1].text);
 ctx.advanceExpeditionChapter();assert.equal(lastText(),chapter.opening[2].text);assert.equal(next.hidden,true);
 const absentOptions=content.children[1];assert.equal(absentOptions.children.length,1);assert.match(absentOptions.children[0].children[1].textContent,/Life/);assert.match(absentOptions.children[0].children[1].textContent,/Dense caps/);
 absentOptions.children[0].click();ctx.advanceExpeditionChapter();
 assert.equal(next.textContent,'Begin trip');assert.equal(next.disabled,true);assert.match(content.children.at(-1).textContent,/not in the shop/);assert.match(content.children.at(-1).textContent,/No gold is charged/);
 assert.equal(ctx.game.state.coins,1234);assert.equal(ctx.game.state.expedition,null);assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:0});storyDialog.close();
 ctx.game=new core.PotionGame(core.sanitizeSave(JSON.parse(JSON.stringify(ctx.game.state))));
 assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:0});
 ctx.openExpeditionChapter(0,1);
 assert.equal(lastText(),chapter.routes.find(route=>route.family===0).departureBeats[0].text);
 assert.equal(next.textContent,'Begin trip');assert.equal(next.disabled,true);assert.match(content.children.at(-1).textContent,/not in the shop/);storyDialog.close();

 // With all three materials at tier 2, changing route costs nothing; dispatch saves the second route.
 ctx.game=new core.PotionGame();ctx.game.state.tiers=[1,1,1];ctx.game.state.travelers[0].phase='offer';ctx.game.state.coins=100000;
 ctx.openExpeditionChapter(0,1);ctx.advanceExpeditionChapter();ctx.advanceExpeditionChapter();assert.equal(content.children[1].children.length,3);
 const routeCoins=ctx.game.state.coins;content.children[1].children[0].click();ctx.advanceExpeditionChapter();assert.equal(next.textContent,'Begin trip');assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:0});
 secondary.click();assert.equal(content.children[1].children.length,3);assert.equal(ctx.game.state.coins,routeCoins);assert.equal(ctx.game.state.expedition,null);assert.equal(ctx.game.state.expeditionChapterDraft,null);
 content.children[1].children[1].click();ctx.advanceExpeditionChapter();assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:1});storyDialog.close();
 ctx.game.state.travelers[0].requirement={family:0,tier:0,level:0};ctx.game.state.travelers[0].rewardBoost={type:'protection',amount:3};ctx.game.state.travelers[0].leaveAt=now+60000;
 ctx.game=new core.PotionGame(core.sanitizeSave(JSON.parse(JSON.stringify(ctx.game.state))));
 assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:1});
 ctx.openExpeditionChapter(0,1);assert.equal(lastText(),chapter.routes.find(route=>route.family===1).departureBeats[0].text);assert.equal(next.textContent,'Begin trip');assert.equal(next.disabled,false);
 now=1000;next.click();
 assert.equal(ctx.game.state.expedition.material.family,1);assert.equal(ctx.game.state.expedition.material.tier,1);assert.ok(ctx.game.state.coins<routeCoins);assert.equal(ctx.game.state.expeditionChapterDraft,null);assert.equal(next.textContent,'Close');storyDialog.close();

 // Completion does not open over gameplay; the chapter card offers Ready to continue.
 const completed=ctx.game.settleExpedition(ctx.game.state.expedition.readyAt);assert.ok(completed?.story);const story=completed.story;
 storyDialog.open=false;ctx.queueExpeditionStory(story);assert.equal(storyDialog.open,false);
 ctx.renderExpeditionChapters();let readyCard=cardFor(2);
 assert.match(readyCard.children[2].textContent,/Ready to continue/);assert.match(readyCard.className,/ready/);assert.equal(ctx.game.state.expeditionStories[0].seen,false);
 readyCard.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),story.beats[0].text);assert.equal(ctx.game.state.expeditionStories[0].seen,false);
 ctx.advanceExpeditionStory();assert.equal(lastText(),story.beats[1].text);storyDialog.close();

 // Closing before the report ends keeps the action available after reload.
 ctx.game=new core.PotionGame(core.sanitizeSave(JSON.parse(JSON.stringify(ctx.game.state))));
 ctx.renderExpeditionChapters();readyCard=cardFor(2);
 assert.match(readyCard.children[2].textContent,/Ready to continue/);readyCard.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),story.beats[0].text);
 for(let i=1;i<story.beats.length;i++)ctx.advanceExpeditionStory();
 assert.equal(lastText(),story.beats.at(-1).text);assert.equal(next.textContent,'Finish');ctx.advanceExpeditionStory();
 assert.equal(storyDialog.open,false);assert.equal(ctx.game.state.expeditionStories[0].seen,true);

 // Reading completes the report; the card returns to the repeatable chapter.
 ctx.renderExpeditionChapters();const repeatCard=cardFor(2);
 assert.doesNotMatch(repeatCard.children[2].textContent,/Ready to continue/);repeatCard.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),chapter.opening[0].text);storyDialog.close();

 // The journal offers the same chapter report again.
 ctx.renderExpeditionJournal();const details=$('expedition-journal').children.find(child=>child.className==='expedition-journal-group'),article=details.children[1];
 assert.equal(article.children[2].textContent,'Replay chapter report');article.children[2].click();assert.equal(storyDialog.open,true);assert.equal(lastText(),story.beats[1].text);storyDialog.close();

 // A matching sale announces the timer saving; the persisted deadline is what changed.
 line('function savedTime(');ctx.game=new core.PotionGame();ctx.game.state.coins=100000;ctx.game.state.tiers=[1,1,0];ctx.game.state.travelers[0].phase='offer';now=1000;assert.equal(ctx.game.dispatchCombinedExpedition(0,1,0,1000,()=>0),true);ctx.game.collect(0,1);const saleDeadline=Date.now()+120000;ctx.game.state.expedition.readyAt=saleDeadline;
 const notices=[],previousNotice=ctx.notice;ctx.notice=text=>notices.push(text);$('sell').click();ctx.notice=previousNotice;
 assert.equal(notices.length,1);assert.equal(notices[0],"Sold for 7 coins. 5s saved on Neet's expedition timer.");assert.equal(ctx.game.state.expedition.readyAt,saleDeadline-5000);
 now=previousNow;
 console.log('Passed: tier-chapter card visibility with Neet absent, opening choice, exact-tier options, persisted route drafts across close/reload, route change without charge, deferred Ready to continue action, early-close reload, repeat-trip reopening, journal replay and saved-time notice.');
}
// Tier-1 chapter flows: new-game card, all three routes, saved draft, dispatch, report and journal replay.
{
 const chapter=require('../data/expedition-chapters.json').chapters.find(entry=>entry.id==='neet-t1-herbs-for-the-shrine');
 const storyDialog=$('expedition-story-dialog'),next=$('expedition-story-next'),content=$('expedition-story-content');
 storyDialog.open=false;storyDialog.showModal=()=>{storyDialog.open=true;};storyDialog.close=()=>{storyDialog.open=false;};
 const lastText=()=>content.children[0].children.at(-1).children.at(-1).textContent;
 const cardFor=tier=>$('expedition-chapter-list').children.find(entry=>entry.children[0].textContent.startsWith('Tier '+tier+' · '));
 ctx.game=new core.PotionGame();ctx.game.state.travelers[0].phase='away';ctx.game.state.coins=100000;
 ctx.renderExpeditionChapters();
 assert.equal($('expedition-chapter-list').children.length,2);
 const card=$('expedition-chapter-list').children[0];assert.match(card.children[0].textContent,/Tier 1.*Herbs for the Shrine/);assert.match(card.children[1].textContent,/3 unlocked routes/);assert.match(card.children[2].textContent,/Read now/);
 assert.match($('expedition-chapter-list').children[1].children[0].textContent,/Tier 1.*Trailside Herb Hunt/);
 card.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),chapter.opening[0].text);
 ctx.advanceExpeditionChapter();assert.equal(lastText(),chapter.opening[1].text);
 ctx.advanceExpeditionChapter();assert.equal(lastText(),chapter.opening[2].text);
 const options=content.children[1];assert.equal(options.children.length,3);
 assert.match(options.children[0].children[0].textContent,/Red herb/);assert.match(options.children[0].children[1].textContent,/Life/);
 assert.match(options.children[1].children[0].textContent,/Blue herb/);assert.match(options.children[1].children[1].textContent,/Mana/);
 assert.match(options.children[2].children[0].textContent,/Yellow herb/);assert.match(options.children[2].children[1].textContent,/Stamina/);
 options.children[1].click();ctx.advanceExpeditionChapter();
 assert.equal(next.textContent,'Begin trip');assert.equal(next.disabled,true);assert.match(content.children.at(-1).textContent,/not in the shop/);
 assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:1});storyDialog.close();
 ctx.game=new core.PotionGame(core.sanitizeSave(JSON.parse(JSON.stringify(ctx.game.state))));
 assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:1});
 ctx.openExpeditionChapter(0,0);assert.equal(lastText(),chapter.routes.find(route=>route.family===1).departureBeats[0].text);assert.equal(next.disabled,true);storyDialog.close();
 ctx.game.state.travelers[0].phase='offer';ctx.game.state.coins=100000;
 ctx.openExpeditionChapter(0,0);assert.equal(lastText(),chapter.routes.find(route=>route.family===1).departureBeats[0].text);assert.equal(next.disabled,false);
 const dispatchedAt=Date.now();next.click();assert.equal(ctx.game.state.expedition.material.family,1);assert.equal(ctx.game.state.expedition.material.tier,0);assert.ok(ctx.game.state.expedition.readyAt-dispatchedAt>=120000);assert.ok(ctx.game.state.expedition.readyAt-dispatchedAt<121000);assert.equal(ctx.game.state.expeditionChapterDraft,null);assert.equal(next.textContent,'Close');storyDialog.close();
 const completed=ctx.game.settleExpedition(ctx.game.state.expedition.readyAt);assert.ok(completed?.story);const story=completed.story;
 storyDialog.open=false;ctx.queueExpeditionStory(story);assert.equal(storyDialog.open,false);
 ctx.renderExpeditionChapters();const readyCard=cardFor(1);assert.match(readyCard.children[2].textContent,/Ready to continue/);assert.equal(ctx.game.state.expeditionStories[0].seen,false);
 readyCard.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),story.beats[0].text);
 for(let i=1;i<story.beats.length;i++)ctx.advanceExpeditionStory();
 assert.equal(lastText(),story.beats.at(-1).text);assert.equal(next.textContent,'Finish');ctx.advanceExpeditionStory();
 assert.equal(storyDialog.open,false);assert.equal(ctx.game.state.expeditionStories[0].seen,true);
 ctx.renderExpeditionJournal();const details=$('expedition-journal').children.find(child=>child.className==='expedition-journal-group'),article=details.children[1];
 assert.equal(article.children[2].textContent,'Replay chapter report');article.children[2].click();assert.equal(storyDialog.open,true);assert.equal(lastText(),story.beats[1].text);storyDialog.close();
 for(const legacySeen of [true,false]){
  ctx.game=new core.PotionGame();ctx.game.state.travelers[0].phase='offer';ctx.game.state.coins=100000;ctx.game.state.expeditionStories=[{kind:'route',traveler:'neet',tier:0,family:1,at:500,seen:legacySeen}];
  assert.equal(ctx.game.dispatchCombinedExpedition(0,0,1,1000,()=>0),true);const repeated=ctx.game.settleExpedition(121000).story;assert.equal(repeated.chapterId,chapter.id);
  ctx.renderExpeditionChapters();const repeatReady=cardFor(1);assert.match(repeatReady.children[2].textContent,/Ready to continue/);
  repeatReady.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),repeated.beats[0].text);storyDialog.close();
  assert.equal(ctx.game.state.expeditionStories[0].seen,legacySeen);
 }
 console.log('Passed: tier-1 chapter card on a new game, three-route opening choice, saved draft across reload, dispatch with 120s timer, deferred Ready to continue report, journal replay and Ready report after repeating seen/unread legacy routes.');
}
// Tier-5 chapter flows: five-beat opening, unlocked egg choices, full first report, later viewpoint report, Daisy portrait, journal replay.
{
 const chapter=require('../data/expedition-chapters.json').chapters.find(entry=>entry.id==='neet-t5-tend-the-nesting-grounds'),lifeViewpoint=require('../data/expedition-stories.json').travelers.neet.viewpoints['0'].text;
 const storyDialog=$('expedition-story-dialog'),next=$('expedition-story-next'),content=$('expedition-story-content');
 const previousNow=now;storyDialog.open=false;storyDialog.showModal=()=>{storyDialog.open=true;};storyDialog.close=()=>{storyDialog.open=false;};
 const lastText=()=>content.children[0].children.at(-1).children.at(-1).textContent,cardFor=tier=>$('expedition-chapter-list').children.find(entry=>entry.children[0].textContent.startsWith('Tier '+tier+' · '));
 ctx.game=new core.PotionGame();ctx.game.state.tiers=[4,0,0];ctx.game.state.travelers[0].phase='offer';ctx.game.state.coins=1e6;ctx.openExpeditionChapter(0,4);
 assert.equal(chapter.opening.length,5);assert.equal(lastText(),chapter.opening[0].text);for(let i=1;i<5;i++)ctx.advanceExpeditionChapter();assert.equal(lastText(),chapter.opening[4].text);
 const oneOption=content.children[1];assert.equal(oneOption.children.length,1);assert.match(oneOption.children[0].children[0].textContent,/Rainbow bird's egg/);storyDialog.close();
 ctx.game=new core.PotionGame();ctx.game.state.tiers=[4,4,4];ctx.game.state.travelers[0].phase='offer';ctx.game.state.coins=1e6;ctx.openExpeditionChapter(0,4);for(let i=1;i<5;i++)ctx.advanceExpeditionChapter();
 const options=content.children[1];assert.equal(options.children.length,3);options.children[0].click();ctx.advanceExpeditionChapter();assert.equal(next.textContent,'Begin trip');const dispatchedAt=Date.now();next.click();assert.equal(ctx.game.state.expedition.material.family,0);assert.ok(ctx.game.state.expedition.readyAt-dispatchedAt>=120000&&ctx.game.state.expedition.readyAt-dispatchedAt<121000);storyDialog.close();
 const first=ctx.game.settleExpedition(ctx.game.state.expedition.readyAt).story;assert.equal(first.chapterId,chapter.id);assert.equal(first.beats.length,17);ctx.renderExpeditionChapters();const ready=cardFor(5);assert.match(ready.children[2].textContent,/Ready to continue/);ready.click();assert.equal(lastText(),first.beats[0].text);ctx.advanceExpeditionStory();assert.equal(content.children[0].children.length,1);for(let i=2;i<7;i++)ctx.advanceExpeditionStory();assert.equal(lastText(),'That is all right. We can try again another time.');assert.equal(content.children[0].children.length,2);assert.equal(content.children[0].children[0].src,'DaisyPortrait.png');storyDialog.close();
 ctx.game.markExpeditionStorySeen(first.recordIds);ctx.renderExpeditionJournal();const details=$('expedition-journal').children.find(child=>child.className==='expedition-journal-group'),article=details.children[1];assert.equal(article.children[2].textContent,'Replay chapter report');article.children[2].click();assert.equal(lastText(),chapter.routes.find(route=>route.family===0).returnBeats[0].text);storyDialog.close();
 ctx.game.state.travelers[0].phase='offer';assert.equal(ctx.game.dispatchCombinedExpedition(0,4,0,2000,()=>0),true);const later=ctx.game.settleExpedition(ctx.game.state.expedition.readyAt).story;assert.equal(later.beats.length,2);assert.equal(later.beats[0].id,'trip-end');assert.equal(later.beats[1].id,'viewpoint');assert.equal(later.beats[1].text,lifeViewpoint);ctx.renderExpeditionChapters();const laterReady=cardFor(5);assert.match(laterReady.children[2].textContent,/Ready to continue/);laterReady.click();assert.equal(lastText(),later.beats[0].text);ctx.advanceExpeditionStory();assert.equal(lastText(),lifeViewpoint);assert.equal(content.children[0].children.length,1);storyDialog.close();
 now=previousNow;
 console.log('Passed: tier-5 chapter opening and egg-option gating, 120s dispatch, full first report, exact later viewpoint, Daisy beat portrait, narrator portrait-free beats and journal replay.');
}
// Dolbur tier-5 chapter flows: five-beat opening, all three egg choices, full first report, exact later viewpoint, journal replay.
{
 const chapter=require('../data/expedition-chapters.json').chapters.find(entry=>entry.id==='dolbur-t5-guard-the-nesting-ridge'),lifeViewpoint=require('../data/expedition-stories.json').travelers.dolbur.viewpoints['0'].text;
 const storyDialog=$('expedition-story-dialog'),next=$('expedition-story-next'),content=$('expedition-story-content');
 const previousNow=now;storyDialog.open=false;storyDialog.showModal=()=>{storyDialog.open=true;};storyDialog.close=()=>{storyDialog.open=false;};
 const lastText=()=>content.children[0].children.at(-1).children.at(-1).textContent,card=()=>$('expedition-chapter-list').children.find(entry=>entry.children[0].textContent.includes('Guard the Nesting Ridge'));
 ctx.game=new core.PotionGame();ctx.game.state.tiers=[4,4,4];ctx.game.state.travelers[1].phase='offer';ctx.game.state.coins=1e6;ctx.openExpeditionChapter(1,4);
 assert.equal(chapter.opening.length,5);assert.equal(lastText(),chapter.opening[0].text);for(let i=1;i<5;i++)ctx.advanceExpeditionChapter();assert.equal(lastText(),chapter.opening[4].text);
 const options=content.children[1];assert.equal(options.children.length,3);options.children[0].click();ctx.advanceExpeditionChapter();assert.equal(next.textContent,'Begin trip');const dispatchedAt=Date.now();next.click();assert.deepEqual(ctx.game.state.expedition.material,{family:0,tier:4});assert.equal(ctx.game.state.expedition.chapterId,chapter.id);assert.ok(ctx.game.state.expedition.readyAt-dispatchedAt>=120000&&ctx.game.state.expedition.readyAt-dispatchedAt<121000);storyDialog.close();
 const first=ctx.game.settleExpedition(ctx.game.state.expedition.readyAt).story;assert.equal(first.chapterId,chapter.id);assert.equal(first.beats.length,19);ctx.renderExpeditionChapters();const ready=card();assert.match(ready.children[2].textContent,/Ready to continue/);ready.click();assert.equal(lastText(),first.beats[0].text);ctx.advanceExpeditionStory();assert.equal(lastText(),chapter.routes.find(route=>route.family===0).returnBeats[0].text);for(let i=2;i<7;i++)ctx.advanceExpeditionStory();assert.equal(content.children[0].children.length,2);assert.equal(content.children[0].children[0].src,'DaisyPortrait.png');storyDialog.close();
 ctx.game.markExpeditionStorySeen(first.recordIds);ctx.renderExpeditionJournal();const details=$('expedition-journal').children.find(child=>child.className==='expedition-journal-group'),article=details.children[1];assert.equal(article.children[2].textContent,'Replay chapter report');article.children[2].click();assert.equal(lastText(),chapter.routes.find(route=>route.family===0).returnBeats[0].text);storyDialog.close();
 ctx.game.state.travelers[1].phase='offer';assert.equal(ctx.game.dispatchCombinedExpedition(1,4,0,2000,()=>0),true);const later=ctx.game.settleExpedition(ctx.game.state.expedition.readyAt).story;assert.equal(later.beats.length,2);assert.equal(later.beats[0].id,'trip-end');assert.equal(later.beats[1].id,'viewpoint');assert.equal(later.beats[1].text,lifeViewpoint);ctx.renderExpeditionChapters();const laterReady=card();assert.match(laterReady.children[2].textContent,/Ready to continue/);laterReady.click();assert.equal(lastText(),later.beats[0].text);ctx.advanceExpeditionStory();assert.equal(lastText(),lifeViewpoint);assert.equal(content.children[0].children.length,1);storyDialog.close();
 now=previousNow;
 console.log('Passed: Dolbur tier-5 chapter opening and egg options, 120s dispatch, full first report, Daisy portrait, journal replay and exact later viewpoint.');
}
// Dolbur tier-1 chapter flows: card order, absent dispatch, saved draft and route change, early-close report reload, repeat-trip card and journal replay.
{
 const chapter=require('../data/expedition-chapters.json').chapters.find(entry=>entry.id==='dolbur-t1-trailside-herb-hunt');
 const storyDialog=$('expedition-story-dialog'),next=$('expedition-story-next'),secondary=$('expedition-story-secondary'),content=$('expedition-story-content');
 storyDialog.open=false;storyDialog.showModal=()=>{storyDialog.open=true;};storyDialog.close=()=>{storyDialog.open=false;};
 const lastText=()=>content.children[0].children.at(-1).children.at(-1).textContent;
 const dolburCard=()=>$('expedition-chapter-list').children.find(entry=>entry.children[0].textContent.includes('Trailside Herb Hunt'));
 ctx.game=new core.PotionGame();ctx.game.state.tiers=[0,0,0];ctx.game.state.travelers[1].phase='away';ctx.game.state.coins=1234;
 ctx.renderExpeditionChapters();
 assert.equal($('expedition-chapter-list').children.length,2);assert.match(dolburCard().children[0].textContent,/Tier 1.*Trailside Herb Hunt/);assert.match(dolburCard().children[1].textContent,/Dolbur.*3 unlocked routes/);
 dolburCard().click();ctx.advanceExpeditionChapter();ctx.advanceExpeditionChapter();
 const options=content.children[1];assert.equal(options.children.length,3);options.children[1].click();ctx.advanceExpeditionChapter();
 assert.equal(next.textContent,'Begin trip');assert.equal(next.disabled,true);assert.match(content.children.at(-1).textContent,/not in the shop/);assert.equal(ctx.game.state.coins,1234);assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:1});storyDialog.close();
 ctx.game=new core.PotionGame(core.sanitizeSave(JSON.parse(JSON.stringify(ctx.game.state))));
 ctx.openExpeditionChapter(1,0);assert.equal(lastText(),chapter.routes.find(route=>route.family===1).departureBeats[0].text);assert.equal(next.disabled,true);secondary.click();assert.equal(content.children[1].children.length,3);content.children[1].children[0].click();ctx.advanceExpeditionChapter();assert.deepEqual(ctx.game.state.expeditionChapterDraft,{chapterId:chapter.id,family:0});assert.equal(ctx.game.state.coins,1234);storyDialog.close();
 ctx.game.state.travelers[1].phase='offer';ctx.game.state.coins=100000;ctx.openExpeditionChapter(1,0);const dispatchedAt=Date.now();next.click();assert.deepEqual(ctx.game.state.expedition.material,{family:0,tier:0});assert.ok(ctx.game.state.expedition.readyAt-dispatchedAt>=120000);assert.ok(ctx.game.state.expedition.readyAt-dispatchedAt<121000);assert.equal(ctx.game.state.expeditionChapterDraft,null);storyDialog.close();
 const completed=ctx.game.settleExpedition(ctx.game.state.expedition.readyAt);assert.ok(completed?.story);const story=completed.story;
 ctx.renderExpeditionChapters();let ready=dolburCard();assert.match(ready.children[2].textContent,/Ready to continue/);
 ready.click();assert.equal(storyDialog.open,true);assert.equal(lastText(),story.beats[0].text);storyDialog.close();
 ctx.game=new core.PotionGame(core.sanitizeSave(JSON.parse(JSON.stringify(ctx.game.state))));ctx.renderExpeditionChapters();ready=dolburCard();assert.match(ready.children[2].textContent,/Ready to continue/);ready.click();
 for(let i=1;i<story.beats.length;i++)ctx.advanceExpeditionStory();assert.equal(next.textContent,'Finish');ctx.advanceExpeditionStory();assert.equal(storyDialog.open,false);assert.equal(ctx.game.state.expeditionStories[0].seen,true);
 ctx.renderExpeditionChapters();assert.match(dolburCard().children[2].textContent,/Read now/);
 ctx.renderExpeditionJournal();const details=$('expedition-journal').children.find(child=>child.className==='expedition-journal-group'),article=details.children[1];assert.match(details.children[0].textContent,/Dolbur/);assert.equal(article.children[2].textContent,'Replay chapter report');article.children[2].click();assert.equal(storyDialog.open,true);assert.equal(lastText(),story.beats[1].text);storyDialog.close();
 console.log('Passed: Dolbur tier-1 chapter card, absent dispatch, saved draft across reload, route change, 120s dispatch, early-close report reload, repeat-trip card and journal replay.');
}
// Use the actual reveal handler: rewards/save/quota commit before animation resolves.
Object.assign(ctx,{rewardKind:'hourly',rewardBusy:false,rewardAnimation:null,rewardDialog:new Element(),rewardButtons:Object.fromEntries(['hourly','tickets','skin'].map(k=>[k,{detail:new Element()}])),rewardLabels:{tickets:'tickets',rubies:'rubies',protection:'protection',enhancement:'enhancement',selling:'selling',fairy:'fairy',skin:'skin'},CURRENCY_UNITS:core.ECONOMY.currencyUnits,rewardArt:x=>x,rewardDescription:r=>r.amount+' '+r.currency});
run(app.slice(app.indexOf('async function openChest('),app.indexOf("rewardDialog.querySelector('.reward-open').onclick")));
(async()=>{
 for(const reduce of [false,true]){
  reduced=reduce;ctx.reducedMotion=reduce;ctx.game=new core.PotionGame();ctx.game.state.coins=1000;ctx.rewardBusy=false;
  const oldSaves=saves,pending=ctx.openChest();assert.equal(ctx.game.state.coins,950);assert.equal(ctx.game.state.rewardHistory.length,1);assert.equal(saves,oldSaves+1);assert.ok(ctx.rewardBusy);await pending;
  assert.equal(animations.at(-1).duration,reduce?0:4200);assert.equal(ctx.rewardDialog.querySelector('.case-reel').children.length,38);assert.match(ctx.rewardDialog.querySelector('.reward-result').textContent,/You received/);
  await ctx.openChest();await ctx.openChest();const history=ctx.game.state.rewardHistory.length;await ctx.openChest();assert.equal(ctx.game.state.rewardHistory.length,history);assert.equal(ctx.rewardDialog.querySelector('.reward-open').disabled,true);assert.match(ctx.rewardDialog.querySelector('.reward-quota').textContent,/0 \/ 3/);
  await ctx.openChest(true);assert.equal(ctx.game.state.rewardHistory.length,history+1);assert.equal(ctx.game.paidBoostInfo().remaining,0);
 }
 console.log('Passed: real UI handlers for moved exact-ingredient debug control, expanded coin cheat, manual drops/mode switches/keys, quest handover and immediate post-reward departure, deferred Tia intro, legacy Neet tier-1 journey/journal paragraph rendering, chest reveals and saved quotas with reduced motion.');
})().then(()=>require('./check-enhancement-fx.cjs')).catch(error=>{console.error(error);process.exitCode=1;});

// Live2D scales its backing buffer while keeping logical model geometry unchanged.
{
 const resizeCode=pio.split(/\r?\n/).find(line=>line.trim().startsWith('const resizeCanvas='));
 let bounds={width:520,height:500},resizes=[];
 const renderer={resolution:1,resize:(w,h)=>resizes.push([w,h])};
 const context=vm.createContext({canvas:{getBoundingClientRect:()=>bounds},app:{renderer},window:{devicePixelRatio:1},Math});
 vm.runInContext(resizeCode+';resizeCanvas();',context);assert.equal(renderer.resolution,520/380);assert.deepEqual(resizes,[[380,420]]);
 vm.runInContext('resizeCanvas()',context);assert.equal(resizes.length,1);
 bounds={width:760,height:840};context.window.devicePixelRatio=2;vm.runInContext('resizeCanvas()',context);assert.equal(renderer.resolution,3);
 bounds={width:0,height:0};vm.runInContext('resizeCanvas()',context);assert.equal(resizes.length,2);
}
