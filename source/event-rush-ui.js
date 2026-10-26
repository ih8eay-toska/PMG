// Event presentation uses the registered event dialog and existing gameplay transactions.
const rushPanel=document.createElement('section');rushPanel.id='rush-panel';rushPanel.className='event-status';rushPanel.innerHTML='<h3></h3><p id="rush-clock"></p><p id="rush-pouch" class="solution-balance"></p><p id="rush-counts"></p><p id="rush-progress"></p><p id="rush-brew-reason" class="small muted"></p><button id="rush-brew" class="primary">Brew event potion</button><button id="rush-open">Event, rewards & results</button>';$('events-panel').append(rushPanel);rushPanel.querySelector('h3').textContent=RUSH_RULES.name;
const rushBody=document.createElement('div');rushBody.id='rush-event-content';rushBody.innerHTML=`
<section id="rush-story-view" hidden aria-label="Event conversation">
 <p id="rush-story-mode"></p><p id="rush-story-clock" class="small muted"></p>
 <div id="rush-scene" class="pm-speaker-scene">
  <img id="rush-speaker-portrait" class="pm-speaker-portrait" alt="">
  <div class="pm-speaker-message"><strong id="rush-speaker"></strong><p id="rush-line" aria-live="polite" aria-atomic="true"></p></div>
 </div>
 <div class="rush-scene-actions"><button id="rush-next" class="primary">Continue</button><button id="rush-skip">Skip scene</button><button id="rush-story-back">Return to event</button></div>
</section>
<section id="rush-dashboard" aria-label="Event dashboard">
 <nav id="rush-tabs" class="pm-tabs" aria-label="Event sections"><button type="button" data-rush-tab="live" aria-pressed="true">Current run</button><button type="button" data-rush-tab="results" aria-pressed="false">Results</button><button type="button" data-rush-tab="rewards" aria-pressed="false">Rewards</button><button type="button" data-rush-tab="memories" aria-pressed="false">Story</button></nav>
 <section data-rush-view="live"><p id="rush-page-clock"></p>
 <dl class="rush-stat-grid"><div><dt>Supplies in pouch</dt><dd id="rush-page-pouch"></dd></div><div><dt>Bottles delivered</dt><dd id="rush-page-delivered"></dd></div></dl>
 <p id="rush-grade-summary"></p><progress id="rush-grade-progress" aria-label="Progress toward next grade"></progress>
 <div class="rush-checkpoints"><label>Next boost checkpoint <progress id="rush-boost-progress"></progress><span id="rush-boost-copy"></span></label><label>Next costume choice <progress id="rush-costume-progress"></progress><span id="rush-costume-copy"></span></label></div>
 <button id="rush-resume-opening" class="primary" hidden>Continue opening · timer waits</button>
 </section><section id="rush-results" data-rush-view="results" hidden aria-label="Previous event results"></section>
 <section data-rush-view="rewards" hidden>
 <details id="rush-how"><summary>How to play</summary><div id="rush-how-copy"></div></details>
 <section aria-labelledby="rush-grades-heading"><h3 id="rush-grades-heading">Grade rewards</h3><p class="small muted">Each grade includes all lower grades. These rewards are additional to delivery checkpoints and pay once when the run ends. Zero deliveries earns none.</p><ol id="rush-grade-ladder"></ol></section>
 <section aria-labelledby="rush-featured-heading"><h3 id="rush-featured-heading">Featured outfits</h3><p id="rush-featured-copy"></p><div id="rush-featured" class="rush-costume-grid"></div></section>
 <section aria-labelledby="rush-choices-heading"><h3 id="rush-choices-heading">Pending costume rewards</h3><div id="rush-choices"></div><p id="rush-vouchers"></p><p class="small muted">Vouchers do not expire. Historical event pools remain on hold.</p><button id="rush-wardrobe">Use vouchers in costume shop</button></section>
 </section><section data-rush-view="memories" hidden aria-labelledby="rush-memories-heading"><h3 id="rush-memories-heading">Story memories</h3><div class="rush-scene-actions"><button id="rush-replay-opening">Replay opening</button><button id="rush-replay-ending">Replay ending</button></div><div id="rush-memories"></div></section>
 <button id="rush-legacy">Historical events · on hold</button><p id="rush-feedback" role="status"></p>
</section>`;eventDialog.append(rushBody);
let rushTab='live';
function setRushTab(tab){rushTab=tab;for(const button of $('rush-tabs').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.rushTab===tab));for(const section of $('rush-dashboard').querySelectorAll('[data-rush-view]'))section.hidden=section.dataset.rushView!==tab;}
for(const button of $('rush-tabs').querySelectorAll('button'))button.onclick=()=>{setRushTab(button.dataset.rushTab);eventDialog.scrollTop=0;};
const rushStoryScenes=RUSH_API.dialogue.scenes;
function rushSceneForMode(mode=rushSceneMode){const id=mode.replace('replay-','');if(id!=='ending')return rushStoryScenes[id];const ending={'No deliveries':'ending-none',C:'ending-c',B:'ending-b',A:'ending-a',S:'ending-s'}[game.state.eventRush.previous?.grade]||'ending-none';return rushStoryScenes[ending];}

let rushSceneMode=null,rushReplayLine=0,rushPageKey='',rushPhaseKey='',rushStoryQueue=[],rushQueuedMilestones=new Set();
function rushTransaction(action,message=''){
 const state=JSON.parse(JSON.stringify(game.state)),tokens=new Set(game.rushTokens||[]);if(saveBlocked){notice('Saving is blocked. Export or restore your save first.');return false;}
 if(!action())return false;save(true);if(!saveOK){game.state=state;game.rushTokens=tokens;saveDirty=true;notice('Could not save the event action. It has been undone.');render();return false;}
 render();if(message)notice(message,'success');return true;
}
function rushClockText(r,now=Date.now()){return r.phase==='locked'?'Master all three beginner potions (Life, Mana and Stamina), then finish Tia’s arrival scene to participate.':r.phase==='opening'?'Opening conversation · timer has not started':r.phase==='gathering'?'Gathering · '+eventTime(Math.max(0,r.endsAt-now)):r.phase==='packing'?'Packing up · '+eventTime(Math.max(0,r.packingEndsAt-now)): 'Break · next event in '+eventTime(Math.max(0,r.breakEndsAt-now));}
function rushGradeState(delivered){const ladder=Object.entries(RUSH_RULES.grades).sort((a,b)=>a[1]-b[1]),reached=ladder.filter(([,n])=>delivered>=n);return{ladder,current:reached.at(-1)?.[0]||null,next:ladder.find(([,n])=>delivered<n)||null};}
function rushGradeCopy(delivered){const g=rushGradeState(delivered);return (g.current?'Grade '+g.current:'No grade yet')+(g.next?' · '+(g.next[1]-delivered)+' more bottles to '+g.next[0]:' · Highest grade reached');}
function focusRushView(){requestAnimationFrame(()=>{if(!eventDialog.open)return;eventDialog.scrollTop=0;const target=rushSceneMode?$('rush-next'):$('rush-dashboard');target.tabIndex=target.tabIndex<0?-1:target.tabIndex;target.focus({preventScroll:true});});}
function openRushEvent(view='auto'){
 eventDialog.dataset.rush='true';eventDialog.querySelector('h2').textContent=RUSH_RULES.name;
 const r=game.state.eventRush;window.rushOffered=r.run+'|'+(r.phase==='opening'?'opening':r.previous&&!r.endingSeen?'ending':'');rushSceneMode=view==='dashboard'?null:r.phase==='opening'?'opening':r.previous&&!r.endingSeen?'ending':null;rushReplayLine=0;rushStoryQueue=[];rushQueuedMilestones=new Set(r.storyMilestones.unlocked);rushPageKey='';setRushTab(r.phase==='break'?'results':'live');refreshRushPage();if(!eventDialog.open)eventDialog.showModal();focusRushView();
}
function showRushStory(mode){rushSceneMode=mode;rushReplayLine=0;rushStoryQueue=[];rushQueuedMilestones=new Set(game.state.eventRush.storyMilestones.unlocked);refreshRushPage();focusRushView();}
$('rush-open').onclick=()=>openRushEvent();$('rush-brew').onclick=()=>rushTransaction(()=>game.brewRush(),'Event potion brewed. Ready to deliver.');
$('rush-wardrobe').onclick=()=>{eventDialog.close();renderCostumeShop();$('costume-shop-dialog').showModal();};
$('rush-legacy').onclick=()=>{eventDialog.close();openEvent(game.eventInfo().index);};
$('rush-resume-opening').onclick=()=>showRushStory('opening');
$('rush-replay-opening').onclick=()=>showRushStory('replay-opening');$('rush-replay-ending').onclick=()=>showRushStory('replay-ending');
$('rush-story-back').onclick=()=>{rushSceneMode=null;rushStoryQueue=[];refreshRushPage();focusRushView();};
function finishRushScene(){
 const finished=rushSceneMode;
 if(finished==='opening'){if(!rushTransaction(()=>game.startRush()))return;}
 else if(finished==='ending'){if(!rushTransaction(()=>{game.state.eventRush.endingSeen=true;return true;}))return;}
 else if(finished?.startsWith('milestone-')){if(!rushTransaction(()=>{const seen=game.state.eventRush.storyMilestones.seen;if(!seen.includes(finished))seen.push(finished);return true;}))return;}
 rushSceneMode=finished==='opening'?null:rushStoryQueue.shift()||null;rushReplayLine=0;rushPageKey='';refreshRushPage();focusRushView();
}
$('rush-skip').onclick=finishRushScene;
$('rush-next').onclick=()=>{if(!rushSceneMode)return;const id=rushSceneMode.replace('replay-',''),scene=rushSceneForMode(),r=game.state.eventRush,line=rushSceneMode==='opening'?r.line:rushReplayLine;if(line>=scene.lines.length-1){finishRushScene();return;}if(rushSceneMode==='opening'){if(!rushTransaction(()=>{game.state.eventRush.line++;return true;}))return;}else rushReplayLine++;refreshRushPage();};
function rushRewardChips(node,reward){node.append(rewardChip('rubies',reward.rubies));for(const[key,amount]of Object.entries(reward.boosts))if(amount)node.append(rewardChip(key,amount));}
function refreshRushStory(){
 const r=game.state.eventRush;if(rushSceneMode==='opening'&&r.phase!=='opening')rushSceneMode=null;
 const showing=!!rushSceneMode;$('rush-story-view').hidden=!showing;$('rush-dashboard').hidden=showing;$('rush-scene').hidden=!showing;if(!showing)return;
 const id=rushSceneMode.replace('replay-',''),scene=rushSceneForMode(),line=rushSceneMode==='opening'?r.line:rushReplayLine,entry=scene.lines[Math.min(line,scene.lines.length-1)];
 setText($('rush-story-mode'),(rushSceneMode.startsWith('replay-')?'Replay · ':rushSceneMode==='opening'?'First opening · ':'')+scene.title+(id==='ending'&&r.previous?' · '+r.previous.grade:''));
 setText($('rush-story-clock'),rushSceneMode==='opening'?`The ${RUSH_RULES.activeMs/60000}-minute gathering timer starts after Finish or Skip.`:rushClockText(r)+' · Conversations do not pause or reset event time.');
 renderSpeakerLine($('rush-speaker-portrait'),$('rush-speaker'),$('rush-line'),entry);setText($('rush-next'),line===scene.lines.length-1?'Finish':'Continue');
 setText($('rush-skip'),rushSceneMode==='opening'?'Skip opening & start event':'Skip scene');
 for(const unlocked of r.storyMilestones.unlocked){if(!rushQueuedMilestones.has(unlocked)&&!r.storyMilestones.seen.includes(unlocked)&&unlocked!==id)rushStoryQueue.push(unlocked);rushQueuedMilestones.add(unlocked);}
}
function refreshRushPage(){
 const r=game.state.eventRush;refreshRushStory();setText($('rush-page-clock'),rushClockText(r));setText($('rush-page-pouch'),r.pouch);setText($('rush-page-delivered'),r.delivered);setText($('rush-grade-summary'),rushGradeCopy(r.delivered));
 const status=rushGradeState(r.delivered),progress=$('rush-grade-progress');progress.max=status.next?.[1]||status.ladder.at(-1)[1];progress.value=Math.min(r.delivered,progress.max);progress.setAttribute('aria-valuetext',rushGradeCopy(r.delivered));
 for(const[k,every,value,label]of [['boost',RUSH_RULES.boostEvery,r.delivered%RUSH_RULES.boostEvery,'this run'],['costume',RUSH_RULES.costumeEvery,r.rewardProgress,'carried between runs']]){const p=$('rush-'+k+'-progress');p.max=every;p.value=value;p.setAttribute('aria-label','Next '+k+' reward');setText($('rush-'+k+'-copy'),`${value} / ${every} · ${label}`);}
 $('rush-resume-opening').hidden=r.phase!=='opening';$('rush-replay-opening').hidden=!r.run;$('rush-replay-ending').hidden=!r.previous;
 const rows=$('rush-grade-ladder').children;for(const row of rows){const grade=row.dataset.grade,min=RUSH_RULES.grades[grade],state=grade===status.current?'Current grade':grade===status.next?.[0]?'Next target':r.delivered>=min?'Reached':'Upcoming';row.dataset.state=state;setText(row.querySelector('.rush-grade-state'),state);}
 const key=JSON.stringify([r.previous,r.pending,r.vouchers,r.rubyRewardsPending,r.boostRewardsPending,r.rewardProgress,r.best,r.storyMilestones,game.state.costumes]);if(key===rushPageKey)return;rushPageKey=key;
 renderRushResults(r);renderRushCostumes();renderRushChoices(r);renderRushMemories(r);
 $('rush-vouchers').replaceChildren(rewardChip('vouchers',r.vouchers),document.createTextNode(' Costume Vouchers'));
}
function renderRushResults(r){
 const box=$('rush-results');box.replaceChildren();if(!r.previous){const p=document.createElement('p');p.textContent='Your first results will appear here after packing up.';box.append(p);return;}
 const p=r.previous,title=document.createElement('h3');title.textContent='Previous rush · '+p.grade;const stats=document.createElement('dl');stats.className='rush-stat-grid';
 for(const[label,value]of [['Delivered bottles',p.delivered],['Supplies collected',p.collected],['Expired supplies',p.unused],['Undelivered bottles',p.undelivered],['Personal best',r.best],['Costume choices earned',p.choicesEarned]]){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);stats.append(row);}
 const grade=document.createElement('p');grade.append(document.createTextNode('Grade rewards earned: '));rushRewardChips(grade,{rubies:p.rubyReward||0,boosts:p.gradeBoostReward||{}});
 const checkpoints=document.createElement('p');checkpoints.append(document.createTextNode(p.boostsEarned+' delivery checkpoints earned: '));for(const[key,amount]of Object.entries(ECONOMY.events.boostBundle))checkpoints.append(rewardChip(key,p.boostsEarned*amount));
 const pending=document.createElement('p');pending.className='small muted';pending.textContent='Grade rewards settle automatically once; these are recorded earnings, not claim buttons. Pending storage amounts below include all runs.';if(r.rubyRewardsPending)pending.append(document.createTextNode(' Rubies awaiting balance space: '+r.rubyRewardsPending+'.'));for(const[key,amount]of Object.entries(r.boostRewardsPending))if(amount)pending.append(document.createTextNode(' Pending '+key+': '+amount+'.'));
 box.append(title,stats,grade,checkpoints,pending);
}
function renderRushCostumes(){
 const box=$('rush-featured');box.replaceChildren();for(const id of RUSH_RULES.featured){const c=COSTUMES.entries.find(c=>c.id===id);if(!c?.live2d)continue;const card=document.createElement('article'),img=document.createElement('img'),name=document.createElement('h4'),detail=document.createElement('p');card.className='rush-costume-card';card.dataset.featured=id;img.src=art(id);img.alt=c.character+' · '+c.name;img.loading='lazy';name.textContent=c.name;detail.textContent=c.character+' · '+(game.state.costumes.includes(id)?'Owned':c.free?'Available free in costume shop':'Eligible reward');card.append(img,name,detail);box.append(card);}
}
function renderRushChoices(r){
 const choices=$('rush-choices');choices.replaceChildren();for(const pending of r.pending){const row=document.createElement('section'),title=document.createElement('h4'),select=document.createElement('select'),label=document.createElement('label'),claim=document.createElement('button'),voucher=document.createElement('button');row.className='rush-choice';title.textContent=RUSH_RULES.name+' · '+pending.count+' choices available';label.textContent='Featured outfit';select.setAttribute('aria-label','Choose a featured event outfit');for(const id of RUSH_RULES.featured){const c=COSTUMES.entries.find(c=>c.id===id);if(game.voucherEligible(id)&&!game.state.costumes.includes(id))select.add(new Option(c.character+' · '+c.name,id));}claim.textContent='Choose outfit';claim.disabled=!select.options.length;claim.onclick=()=>rushTransaction(()=>game.claimRushChoice(pending.eventId,select.value),'Outfit added to your wardrobe.');voucher.append(rewardChip('vouchers',1),document.createTextNode(' Take Costume Voucher'));voucher.onclick=()=>rushTransaction(()=>game.claimRushChoice(pending.eventId,'voucher'),'Costume Voucher saved.');label.append(select);row.append(title,label,claim,voucher);choices.append(row);}if(!r.pending.length)choices.textContent='No pending choices. Next reward: '+r.rewardProgress+' / '+RUSH_RULES.costumeEvery+' deliveries.';
}
function renderRushMemories(r){
 const box=$('rush-memories');box.replaceChildren();for(const[id,grade]of [['milestone-b','B'],['milestone-a','A']]){const unlocked=r.storyMilestones.unlocked.includes(id),seen=r.storyMilestones.seen.includes(id),row=document.createElement('p'),button=document.createElement('button');button.textContent=(seen?'Replay · ':'Read · ')+rushStoryScenes[id].title;button.disabled=!unlocked;button.onclick=()=>showRushStory(id);row.append(button,document.createTextNode(unlocked?(seen?' · Read':' · Unread'):' · Unlocks at '+RUSH_RULES.grades[grade]+' deliveries'));box.append(row);}
}
// Static explanatory content is derived from the same rules as the game.
$('rush-how-copy').textContent=`Catch event supplies alongside normal materials. Each goes into your pouch, even while another potion is brewing. With an empty cauldron, Brew consumes one supply and creates one MAX bottle; use Deliver on the cauldron to finish it. Cats ignore supplies. Gathering lasts ${RUSH_RULES.activeMs/60000} minutes, packing lasts up to ${RUSH_RULES.packingMs/1000} seconds, then a ${ECONOMY.events.breakMs/60000}-minute break. Closing menus does not pause time. Unused supplies expire. Every ${RUSH_RULES.boostEvery} deliveries grants the checkpoint bundle; every ${RUSH_RULES.costumeEvery} grants a costume-or-voucher choice. Costume progress carries across runs.`;
$('rush-how-copy').append(document.createElement('br'),document.createTextNode('Each delivery checkpoint grants: '));for(const[key,amount]of Object.entries(ECONOMY.events.boostBundle))$('rush-how-copy').append(rewardChip(key,amount));
$('rush-featured-copy').append(document.createTextNode(`Every ${RUSH_RULES.costumeEvery} deliveries, choose one unowned featured outfit or `),rewardChip('vouchers',1),document.createTextNode(' permanent Costume Voucher. Free outfits remain available free.'));
for(const[g,min]of rushGradeState(0).ladder){const row=document.createElement('li'),title=document.createElement('h4'),state=document.createElement('p'),reward=document.createElement('div');row.dataset.grade=g;title.textContent=g+' · '+min+' '+(min===1?'delivery':'deliveries');state.className='rush-grade-state';reward.className='rush-grade-rewards';rushRewardChips(reward,game.rushGradeRewards(min));row.append(title,state,reward);$('rush-grade-ladder').append(row);}
window.refreshRush=(settle=true)=>{
 const old=game.state.eventRush.phase,oldPrevious=game.state.eventRush.previous,oldRubies=game.state.rubies,oldPendingBoosts=JSON.stringify(game.state.eventRush.boostRewardsPending), r=settle?game.settleRush():game.state.eventRush;if(old!==r.phase||oldPrevious!==r.previous||oldRubies!==game.state.rubies||oldPendingBoosts!==JSON.stringify(r.boostRewardsPending))save(true);
 setText($('rush-clock'),rushClockText(r));if($('rush-pouch').dataset.count!==String(r.pouch)){$('rush-pouch').dataset.count=r.pouch;$('rush-pouch').replaceChildren();const icon=document.createElement('img');icon.src=art('OriginalEventSupply.png');icon.alt='';$('rush-pouch').append(icon,document.createTextNode(r.pouch+' supplies in pouch'));}
 setText($('rush-counts'),r.delivered+' bottles delivered this run');setText($('rush-progress'),`${rushGradeCopy(r.delivered)} · ${r.delivered%RUSH_RULES.boostEvery} / ${RUSH_RULES.boostEvery} to next boost · ${r.rewardProgress} / ${RUSH_RULES.costumeEvery} to costume choice`);const reason=game.rushBrewReason(Date.now(),false);$('rush-brew').disabled=!!reason;setText($('rush-brew-reason'),reason);$('rush-brew').setAttribute('aria-describedby','rush-brew-reason');
 if(eventDialog.open&&eventDialog.dataset.rush==='true')refreshRushPage();
 const phaseKey=r.run+'|'+r.phase;if(phaseKey!==rushPhaseKey){rushPhaseKey=phaseKey;save(true);queueMicrotask(()=>render());if(conveyor){conveyor.items=conveyor.items.filter(m=>m.kind!=='event-supply');syncBelt();}}
 const offer=r.run+'|'+(r.phase==='opening'?'opening':r.previous&&!r.endingSeen?'ending':'');if((r.phase==='opening'||r.previous&&!r.endingSeen)&&window.rushOffered!==offer&&!document.hidden&&!document.querySelector('dialog[open]')){window.rushOffered=offer;openRushEvent();}
};
window.advanceRushConveyor=()=>{
 const r=game.state.eventRush;if(r.phase!=='gathering'||Date.now()<r.nextSupplyAt)return;const before=r.nextSupplyAt,token=game.mintRushSupply();if(!token)return;save(true);if(!saveOK||saveBlocked){r.nextSupplyAt=before;game.rushTokens.delete(token);return;}conveyor.items.push({kind:'event-supply',token,run:r.run,x:conveyor.width,id:conveyor.serial++});
};
window.refreshRush();

// Historical definitions and their exact saved currency are retained for later migration.


const legacyLabel=document.createElement('label'),legacySelect=document.createElement('select');legacyLabel.textContent='Archived event';legacySelect.setAttribute('aria-label','Choose a historical event');EVENTS.forEach((event,index)=>legacySelect.add(new Option(event.name,index)));legacySelect.onchange=()=>{eventPageIndex=Number(legacySelect.value);refreshLegacyEventPage();};legacySelect.add(new Option('Season 2 · Archived promotion',EVENTS.length));legacyLabel.append(legacySelect);eventDialog.querySelector('.event-page-banner').before(legacyLabel);legacyLabel.className='legacy-event-selector';
let legacyPageKey='';
function refreshLegacyEventPage(){
 const event=EVENTS[eventPageIndex];if(!event){eventDialog.querySelector('h2').textContent='Historical promotion';legacySelect.value=EVENTS.length;eventDialog.querySelector('.event-page-status').textContent='Season 2 · Archived promotion';eventDialog.querySelector('.event-page-balance').textContent='';eventDialog.querySelector(':scope > p.small.muted').textContent='Original Twitter follow and retweet promotion, outside the gameplay rotation.';eventDialog.querySelector('.event-page-banner').src=art('Third_Event_Banner_-_English.webp');eventDialog.querySelector('.event-page-banner').alt='Season 2 historical promotion';eventDialog.querySelector('.event-story h3').textContent='Season 2';eventDialog.querySelector('.event-story p').textContent='Archived original promotion. No rewards or currency conversion are offered here.';eventDialog.querySelector('.event-rewards').replaceChildren();legacyPageKey='';return;}eventDialog.querySelector('h2').textContent='Historical events · On hold';legacySelect.value=eventPageIndex;eventDialog.querySelector('.event-page-status').textContent=event.name+' · Awaiting migration into the new brewing system.';
 eventDialog.querySelector('.event-page-balance').textContent=fmt(game.state.eventRotation.solution)+' historical Miracle Solution preserved';
 eventDialog.querySelector(':scope > p.small.muted').textContent='Historical gathering and redemption are paused. Your previous event position, saved Miracle Solution and owned outfits are preserved. No conversion has been applied.';
 const key=JSON.stringify([eventPageIndex,game.state.costumes]);if(key===legacyPageKey)return;legacyPageKey=key;
 const story=EVENT_STORIES[eventPageIndex];eventDialog.querySelector('.event-story h3').textContent=story.title;eventDialog.querySelector('.event-story p').textContent=story.text;const banner=eventDialog.querySelector('.event-page-banner');banner.src=art(event.banner);banner.alt=event.name+' historical banner';
 const rewards=eventDialog.querySelector('.event-rewards');rewards.replaceChildren();for(const id of event.skins){const c=COSTUMES.entries.find(c=>c.id===id),row=document.createElement('section'),image=document.createElement('img'),copy=document.createElement('p');row.className='event-reward';image.src=art(id);image.alt=c.name;copy.textContent=c.character+' · '+c.name+' · '+(game.state.costumes.includes(id)?'Owned':'On hold');row.append(image,copy);rewards.append(row);}
}
// Historical presentation refreshes only while its archive is visible.
window.refreshEvents=()=>{if(eventDialog.open&&eventDialog.dataset.rush!=='true')refreshLegacyEventPage();};
