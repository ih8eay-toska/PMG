const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {PotionGame,sanitizeSave,TRAVELERS,FAMILIES}=require('./core.js');
const root=path.resolve(__dirname,'..');
const stories=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-stories.json'),'utf8'));
const jobs=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-jobs.json'),'utf8')).entries;
const participants=new Set(['claire','daisy','dolbur','kyle','neet']);
const neutralTravelers=new Set(['charlotte','demian','luke','piria','tirami']);

assert.equal(stories.batch,'v2-stories-t1-5');
assert.deepEqual(Object.keys(stories.travelers).sort(),TRAVELERS.map(t=>t.id).sort());
assert.equal(Object.keys(stories.event.routes).length,3);
assert.ok(stories.event.opening.trim());
let routeCount=0,viewpointCount=0,neutralCount=0;
for(const traveler of TRAVELERS){
 const story=stories.travelers[traveler.id];
 assert.ok(story,'missing story for '+traveler.id);
 assert.equal(story.participant,participants.has(traveler.id),'participant flag '+traveler.id);
 for(const tier of [1,2,3,4]){
  for(let family=0;family<FAMILIES.length;family++){
   const entry=story.routes[String(tier)]?.[String(family)];
   assert.ok(entry,'missing route '+traveler.id+' '+tier+' '+family);
   assert.equal(entry.material,FAMILIES[family].materials[tier-1].name,'material '+traveler.id+' '+tier+' '+family);
   assert.equal(entry.job,jobs[traveler.id][tier-1].name,'job '+traveler.id+' '+tier);
   assert.ok(entry.hook.trim()&&entry.outcome.trim(),'blank route '+traveler.id+' '+tier+' '+family);
   if(traveler.id==='neet'&&tier===1){assert.ok(entry.journey?.trim(),'blank journey '+traveler.id+' '+tier+' '+family);assert.equal(entry.journey.split(/\n\s*\n/).length,4,'journey paragraphs '+traveler.id+' '+tier+' '+family);}else assert.equal(entry.journey,undefined,'unexpected journey '+traveler.id+' '+tier+' '+family);
   routeCount++;
  }
 }
 if(participants.has(traveler.id)){
  assert.equal(Object.keys(story.viewpoints).length,3,'viewpoints '+traveler.id);
  for(let family=0;family<FAMILIES.length;family++){
   const entry=story.viewpoints[String(family)];
   assert.equal(entry.material,FAMILIES[family].materials[4].name,'viewpoint material '+traveler.id+' '+family);
   assert.equal(entry.job,jobs[traveler.id][4].name,'viewpoint job '+traveler.id);
   assert.ok(entry.text.trim(),'blank viewpoint '+traveler.id+' '+family);
   viewpointCount++;
  }
  assert.equal(story.neutral,undefined);
 }else{
  assert.ok(neutralTravelers.has(traveler.id),'unexpected neutral traveler '+traveler.id);
  assert.ok(story.neutral.hook.trim()&&story.neutral.text.trim(),'blank neutral '+traveler.id);
  assert.equal(story.neutral.job,jobs[traveler.id][4].name,'neutral job '+traveler.id);
  neutralCount++;
 }
}
assert.equal(routeCount,120);
assert.equal(viewpointCount,15);
assert.equal(neutralCount,5);
for(let family=0;family<FAMILIES.length;family++){
 const entry=stories.event.routes[String(family)];
 assert.equal(entry.material,FAMILIES[family].materials[4].name,'event material '+family);
 assert.ok(entry.name.trim()&&entry.text.trim(),'blank event route '+family);
}

const baseGame=()=>{const g=new PotionGame();g.state.coins=100000;g.state.tiers=[4,4,4];return g;};
const complete=(g,index,tier,family)=>{g.state.travelers[index].phase='offer';const info=g.combinedExpeditionInfo(index,tier);assert.ok(info,'no expedition info '+index+' '+tier);assert.ok(g.startExpedition(index,info.requestId,'combined',1000,0,{family,tier},null,0),'dispatch failed '+index+' '+tier+' '+family);const result=g.settleExpedition(g.state.expedition.readyAt);assert.ok(result,'settlement failed');return result;};
const reload=state=>new PotionGame(sanitizeSave(JSON.parse(JSON.stringify(state))));

// Tier 1-4 routes without a chapter keep the unconverted preview, completion, journal, reload and replay behavior.
let g=baseGame(),preview=g.expeditionStoryPreview(2,0,0);
assert.equal(preview.kind,'route');
assert.equal(preview.hook,stories.travelers.tirami.routes['1']['0'].hook);
let result=complete(g,2,0,0);
assert.equal(result.material.family,0);
assert.equal(result.material.tier,0);
assert.equal(result.story.kind,'route');
assert.equal(result.story.sections.length,1);
assert.equal(result.story.sections[0].kind,'outcome');
assert.equal(result.story.sections[0].text,stories.travelers.tirami.routes['1']['0'].outcome);
assert.equal(g.state.expeditionStories.length,1);
assert.equal(g.state.expeditionStories[0].kind,'route');
assert.equal(g.state.expeditionStories[0].seen,false);
assert.equal(g.pendingExpeditionStory().kind,'route');
assert.equal(g.expeditionJournal().routes.length,1);
assert.equal(g.expeditionJournal().routes[0].journey,'');
assert.equal(g.expeditionJournal().routes[0].outcome,stories.travelers.tirami.routes['1']['0'].outcome);
let restored=reload(g.state);
assert.equal(restored.state.expeditionStories.length,1);
assert.equal(restored.expeditionJournal().routes[0].journey,'');
assert.equal(restored.expeditionJournal().routes[0].outcome,stories.travelers.tirami.routes['1']['0'].outcome);
const pending=restored.pendingExpeditionStory();
assert.equal(pending.sections.length,1);
assert.equal(pending.sections[0].kind,'outcome');
assert.equal(pending.sections[0].text,stories.travelers.tirami.routes['1']['0'].outcome);
assert.ok(restored.markExpeditionStorySeen(pending.recordIds));
assert.equal(restored.pendingExpeditionStory(),null);
let restoredAgain=reload(restored.state);
assert.equal(restoredAgain.pendingExpeditionStory(),null);
const replay=complete(restoredAgain,2,0,0);
assert.equal(replay.story.kind,'route');
assert.equal(replay.story.sections.length,1);
assert.equal(replay.story.sections[0].kind,'outcome');
assert.equal(restoredAgain.state.expeditionStories.length,1);
assert.equal(restoredAgain.expeditionJournal().routes.length,1);
assert.equal(restoredAgain.expeditionJournal().routes[0].journey,'');

// The other two Tirami tier-1 routes carry their own outcomes.
for(const family of [1,2]){
 g=baseGame();result=complete(g,2,0,family);
 const entry=stories.travelers.tirami.routes['1'][String(family)];
 assert.equal(result.story.sections.length,1);
 assert.equal(result.story.sections[0].kind,'outcome');
 assert.equal(result.story.sections[0].text,entry.outcome);
 assert.equal(g.expeditionJournal().routes[0].journey,'');
 assert.equal(g.expeditionJournal().routes[0].outcome,entry.outcome);
}

// Tier 5 participants without a chapter: first completion opens the shared event, later completions show only the new viewpoint.
g=baseGame();result=complete(g,3,4,0);
assert.equal(result.story.sections.length,3);
assert.equal(result.story.sections[0].kind,'opening');
assert.equal(result.story.sections[1].kind,'telling');
assert.equal(result.story.sections[2].kind,'viewpoint');
assert.equal(result.story.sections[1].text,stories.event.routes['0'].text);
assert.equal(result.story.sections[2].text,stories.travelers.claire.viewpoints['0'].text);
assert.equal(g.state.expeditionStories.filter(record=>record.kind==='event').length,1);
assert.equal(g.state.expeditionStories.filter(record=>record.kind==='viewpoint').length,1);
assert.equal(g.expeditionJournal().events.length,1);
assert.deepEqual(g.expeditionJournal().events[0].viewpoints.map(viewpoint=>viewpoint.traveler.id),['claire']);
assert.ok(!g.expeditionJournal().events[0].viewpoints.some(viewpoint=>viewpoint.traveler.id==='kyle'));
restored=reload(g.state);
const firstEvent=restored.pendingExpeditionStory();
assert.equal(firstEvent.sections.length,3);
assert.ok(restored.markExpeditionStorySeen(firstEvent.recordIds));
assert.equal(restored.pendingExpeditionStory(),null);
result=complete(restored,9,4,0);
assert.equal(result.story.sections.length,1);
assert.equal(result.story.sections[0].kind,'viewpoint');
assert.equal(result.story.sections[0].text,stories.travelers.kyle.viewpoints['0'].text);
assert.equal(restored.state.expeditionStories.filter(record=>record.kind==='event').length,1);
assert.deepEqual(restored.expeditionJournal().events[0].viewpoints.map(viewpoint=>viewpoint.traveler.id),['claire','kyle']);
restoredAgain=reload(restored.state);
assert.equal(restoredAgain.expeditionJournal().events.length,1);
assert.deepEqual(restoredAgain.expeditionJournal().events[0].viewpoints.map(viewpoint=>viewpoint.traveler.id),['claire','kyle']);

// Tier 5 non-participants use the neutral hook and text; repeating a family does not duplicate the journal entry.
g=baseGame();preview=g.expeditionStoryPreview(4,4,1);
assert.equal(preview.kind,'neutral');
assert.equal(preview.hook,stories.travelers.luke.neutral.hook);
result=complete(g,4,4,1);
assert.equal(result.story.kind,'neutral');
assert.equal(result.story.sections[0].text,stories.travelers.luke.neutral.text);
assert.equal(g.state.expeditionStories.length,1);
result=complete(g,4,4,2);
assert.equal(result.story.kind,'neutral');
assert.equal(result.story.sections[0].text,stories.travelers.luke.neutral.text);
assert.equal(g.state.expeditionStories.length,1);
assert.equal(g.expeditionJournal().neutral.length,1);

// Tiers 6-25 and legacy trips without a material have no invented story.
g=baseGame();g.state.tiers=[5,5,5];result=complete(g,0,5,0);
assert.equal(result.material.tier,5);
assert.equal(result.story,null);
assert.equal(g.state.expeditionStories.length,0);
assert.deepEqual(g.expeditionJournal().counts,{routes:0,eventFamilies:0,neutral:0});
g=baseGame();g.state.travelers[0].phase='offer';
assert.ok(g.startExpedition(0,0,'supplies',1000));
result=g.settleExpedition(g.state.expedition.readyAt);
assert.equal(result.material,null);
assert.equal(result.story,null);
assert.equal(g.state.expeditionStories.length,0);

// Offline completion settles through tick, adds one story, and survives reload without duplication.
g=baseGame();g.state.travelers[3].phase='offer';const info=g.combinedExpeditionInfo(3,4);
assert.ok(g.startExpedition(3,info.requestId,'combined',1000,0,{family:2,tier:4},null,0));
const ready=g.state.expedition.readyAt,offline=reload(g.state);
const events=offline.tick(ready);
assert.ok(events.some(event=>event.kind==='expedition'&&event.story));
assert.equal(offline.state.expedition,null);
assert.equal(offline.expeditionJournal().events.length,1);
assert.equal(offline.expeditionJournal().events[0].familyLabel,'Stamina');
assert.equal(offline.state.expeditionStories.length,2);
assert.equal(offline.pendingExpeditionStory().sections.length,3);
assert.ok(offline.markExpeditionStorySeen(offline.pendingExpeditionStory().recordIds));
restored=reload(offline.state);
assert.equal(restored.pendingExpeditionStory(),null);
assert.equal(restored.expeditionJournal().events.length,1);
assert.equal(restored.expeditionJournal().events[0].viewpoints.length,1);

// An unconverted tier-1 route settles offline and remains in the journal after reload.
g=baseGame();g.state.travelers[2].phase='offer';const journeyInfo=g.combinedExpeditionInfo(2,0);
assert.ok(g.startExpedition(2,journeyInfo.requestId,'combined',1000,0,{family:2,tier:0},null,0));
const journeyReady=g.state.expedition.readyAt,offlineJourney=reload(g.state);
const journeyEvents=offlineJourney.tick(journeyReady);
assert.ok(journeyEvents.some(event=>event.kind==='expedition'&&event.story?.sections?.[0]?.kind==='outcome'));
assert.equal(offlineJourney.expeditionJournal().routes.length,1);
assert.equal(offlineJourney.expeditionJournal().routes[0].journey,'');
assert.equal(offlineJourney.expeditionJournal().routes[0].outcome,stories.travelers.tirami.routes['1']['2'].outcome);
const journeyPending=offlineJourney.pendingExpeditionStory();
assert.equal(journeyPending.sections.length,1);
assert.equal(journeyPending.sections[0].kind,'outcome');
assert.equal(journeyPending.sections[0].text,stories.travelers.tirami.routes['1']['2'].outcome);
assert.ok(offlineJourney.markExpeditionStorySeen(journeyPending.recordIds));
restored=reload(offlineJourney.state);
assert.equal(restored.pendingExpeditionStory(),null);
assert.equal(restored.expeditionJournal().routes[0].journey,'');

console.log('Passed: story data mapping, tier 1-4 hooks/outcomes, unconverted Tirami tier-1 outcomes, legacy Neet four-paragraph journeys, journal rereading, tier 5 event ordering, neutral tier 5 text, save/reload idempotency and offline settlement.');

// Neet tier-1 chapter: reviewed script fidelity, new-game availability, all three routes, timer and legacy records.
{
 const chapterData=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-chapters.json'),'utf8'));
 const reviewed=JSON.parse(fs.readFileSync(path.join(root,'research','writing','expedition-stories','stories-v2','chapter-pilot-neet-t1.json'),'utf8'));
 const chapter=chapterData.chapters.find(entry=>entry.id==='neet-t1-herbs-for-the-shrine'),familyIds={Life:0,Mana:1,Stamina:2};
 assert.ok(chapter);assert.equal(chapterData.chapters[0].id,chapter.id);assert.equal(chapterData.chapters[0].tier,1);assert.equal(chapterData.chapters[1].tier,2);
 assert.equal(chapter.traveler,reviewed.traveler);assert.equal(chapter.tier,reviewed.tier);assert.equal(chapter.job,reviewed.job);
 assert.deepEqual(chapter.opening,reviewed.opening.beats);assert.deepEqual(chapter.dispatch,reviewed.sharedDispatch);
 assert.deepEqual(chapter.routes.map(route=>route.family),reviewed.routes.map(route=>familyIds[route.family]));
 for(const[route,source]of chapter.routes.map((route,index)=>[route,reviewed.routes[index]])){
  assert.equal(route.familyLabel,source.family);assert.equal(route.material,source.material);
  assert.deepEqual(route.confirmBeats,source.confirmBeats);assert.deepEqual(route.departureBeats,source.departureBeats);assert.deepEqual(route.returnBeats,source.returnBeats);
 }
 const fresh=new PotionGame();
 assert.deepEqual(fresh.unlockedExpeditionChapters().filter(entry=>entry.traveler==='neet').map(entry=>entry.id),[chapter.id]);
 assert.deepEqual(fresh.expeditionChapter(0,0).routes.map(route=>route.family),[0,1,2]);
 assert.equal(fresh.expeditionChapter(0,1),null);
 for(const tiers of [[0,0,0],[1,0,0],[1,1,0],[1,1,1]]){
  const g=new PotionGame();g.state.tiers=tiers;assert.deepEqual(g.expeditionChapter(0,0).routes.map(route=>route.family),[0,1,2],'tier-1 routes '+tiers.join(','));
 }
 const draft=new PotionGame();assert.equal(draft.setExpeditionChapterDraft(chapter.id,2),true);assert.deepEqual(draft.state.expeditionChapterDraft,{chapterId:chapter.id,family:2});
 for(const family of [0,1,2]){
  const g=new PotionGame();g.state.coins=100000;g.state.travelers[0].phase='offer';
  const info=g.combinedExpeditionInfo(0,0);assert.equal(info.duration,120000,'tier-1 timer');
  assert.ok(g.startExpedition(0,info.requestId,'combined',1000,0,{family,tier:0},null,0));
  assert.equal(g.state.expedition.readyAt-1000,120000);assert.deepEqual(g.state.expedition.material,{family,tier:0});
  const result=g.settleExpedition(g.state.expedition.readyAt),route=chapter.routes.find(entry=>entry.family===family),expectedBeats=[chapter.dispatch.at(-1),...route.returnBeats];
  assert.equal(result.story.chapterId,chapter.id);assert.equal(result.story.title,'Tier 1 · '+chapter.job);assert.deepEqual(result.story.beats,expectedBeats);assert.equal(result.story.sections[0].text,route.returnBeats.at(-1).text);
  const record=g.state.expeditionStories[0];assert.equal(record.chapterId,chapter.id);assert.equal(record.seen,false);assert.equal(g.pendingExpeditionStory(),null);
  const report=g.expeditionChapterReport(0,0);assert.equal(report.chapterId,chapter.id);assert.deepEqual(report.beats,expectedBeats);assert.deepEqual(report.recordIds,[`route:neet:0:${family}:chapter:${chapter.id}`]);
  const loaded=reload(g.state);assert.equal(loaded.expeditionJournal().routes[0].chapterId,chapter.id);assert.deepEqual(loaded.expeditionJournal().routes[0].chapterBeats,route.returnBeats);assert.equal(loaded.expeditionChapterReport(0,0).chapterId,chapter.id);
  assert.ok(loaded.markExpeditionStorySeen(loaded.expeditionChapterReport(0,0).recordIds));assert.equal(loaded.expeditionChapterReport(0,0),null);assert.equal(reload(loaded.state).expeditionChapterReport(0,0),null);
 }
 const oldState=new PotionGame().state;
 oldState.coins=1234;oldState.expeditionStamps=17;oldState.likeability=88;oldState.powerups.protection=4;
 oldState.expeditionStories=[
  {kind:'route',traveler:'neet',tier:0,family:0,at:1000,seen:true},
  {kind:'route',traveler:'neet',tier:0,family:1,at:2000,seen:false}
 ];
 const oldLoaded=reload(oldState);
 assert.deepEqual(oldLoaded.state.expeditionStories,oldState.expeditionStories);
 assert.equal(oldLoaded.state.coins,1234);assert.equal(oldLoaded.state.expeditionStamps,17);assert.equal(oldLoaded.state.likeability,88);assert.equal(oldLoaded.state.powerups.protection,4);
 const oldJournal=oldLoaded.expeditionJournal();
 assert.equal(oldJournal.routes.length,2);
 for(const route of oldJournal.routes){
  const entry=stories.travelers.neet.routes['1'][String(route.family)];
  assert.equal(route.chapterId,null);assert.equal(route.journey,entry.journey);assert.equal(route.outcome,entry.outcome);
 }
 assert.equal(oldLoaded.expeditionChapterReport(0,0),null);
 const oldPending=oldLoaded.pendingExpeditionStory();assert.equal(oldPending.chapterId,undefined);assert.equal(oldPending.sections[0].kind,'journey');assert.equal(oldPending.sections[0].text,stories.travelers.neet.routes['1']['1'].journey);
 assert.ok(oldLoaded.markExpeditionStorySeen(oldPending.recordIds));assert.equal(oldLoaded.pendingExpeditionStory(),null);assert.equal(oldLoaded.state.expeditionStories.find(record=>record.family===1).seen,true);
 assert.equal(reload(oldLoaded.state).expeditionJournal().routes.find(route=>route.family===1).chapterId,null);
 for(const legacySeen of [true,false]){
  const g=new PotionGame();g.state.coins=100000;g.state.travelers[0].phase='offer';
  const legacy={kind:'route',traveler:'neet',tier:0,family:1,at:500,seen:legacySeen};
  g.state.expeditionStories=[{...legacy}];
  assert.equal(g.dispatchCombinedExpedition(0,0,1,1000,()=>0),true,'legacy repeat dispatch');
  const settled=g.settleExpedition(121000);assert.ok(settled?.story);assert.equal(settled.story.chapterId,chapter.id);assert.equal(g.state.expeditionStamps,settled.stamps);
  assert.equal(g.state.expeditionStories.length,2);assert.deepEqual(g.state.expeditionStories[0],legacy);
  const chapterRecord=g.state.expeditionStories[1];assert.equal(chapterRecord.chapterId,chapter.id);assert.equal(chapterRecord.seen,false);
  const report=g.expeditionChapterReport(0,0);assert.ok(report);assert.equal(report.chapterId,chapter.id);assert.deepEqual(report.recordIds,[`route:neet:0:1:chapter:${chapter.id}`]);
  const pending=g.pendingExpeditionStory();
  if(legacySeen)assert.equal(pending,null);else{assert.ok(pending);assert.equal(pending.chapterId,undefined);assert.deepEqual(pending.recordIds,['route:neet:0:1']);assert.equal(pending.sections[0].kind,'journey');assert.equal(pending.sections[0].text,stories.travelers.neet.routes['1']['1'].journey);}
  const loaded=reload(g.state);assert.deepEqual(loaded.state.expeditionStories,g.state.expeditionStories);
  assert.equal(loaded.expeditionChapterReport(0,0).chapterId,chapter.id);
  if(legacySeen)assert.equal(loaded.pendingExpeditionStory(),null);else assert.equal(loaded.pendingExpeditionStory().sections[0].kind,'journey');
  const journal=loaded.expeditionJournal().routes;assert.equal(journal.length,2);
  const oldEntry=journal.find(route=>!route.chapterId),chapterEntry=journal.find(route=>route.chapterId===chapter.id);
  assert.ok(oldEntry&&chapterEntry);assert.equal(oldEntry.journey,stories.travelers.neet.routes['1']['1'].journey);assert.equal(oldEntry.outcome,stories.travelers.neet.routes['1']['1'].outcome);assert.deepEqual(chapterEntry.chapterBeats,chapter.routes.find(route=>route.family===1).returnBeats);
  if(!legacySeen){assert.equal(loaded.state.expeditionStories[0].seen,false);assert.ok(loaded.markExpeditionStorySeen(pending.recordIds));assert.equal(loaded.state.expeditionStories[0].seen,true);assert.equal(loaded.pendingExpeditionStory(),null);assert.equal(loaded.expeditionChapterReport(0,0).chapterId,chapter.id);}
  assert.ok(loaded.markExpeditionStorySeen(loaded.expeditionChapterReport(0,0).recordIds));assert.equal(loaded.expeditionChapterReport(0,0),null);
 }
 console.log('Passed: Neet tier-1 chapter matches the reviewed script, opens on new-game materials with all three routes, uses the 120s timer, persists chapter records/reports and preserves seen and unread legacy tier-1 records/stories when the same route is replayed as a chapter.');
}

// Neet tier-2 chapter: exact route continuation beats, journal replay data, reload/offline settlement and idempotency.
{
 const chapter=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-chapters.json'),'utf8')).chapters.find(entry=>entry.id==='neet-t2-mushroom-foraging');
 assert.ok(chapter);assert.equal(chapter.traveler,'neet');assert.equal(chapter.tier,2);assert.equal(chapter.opening.at(-1).phase,'choice');assert.equal(chapter.opening.at(-1).options.length,3);
 const route=family=>chapter.routes.find(entry=>entry.family===family),expectedBeats=family=>[...chapter.dispatch.slice(-1),...route(family).returnBeats].map(beat=>({...beat})),lastText=family=>route(family).returnBeats.at(-1).text;
 for(const family of [0,1,2]){
  const g=baseGame(),result=complete(g,0,1,family);
  assert.equal(result.story.chapterId,chapter.id);assert.equal(result.story.title,'Tier 2 · '+chapter.job);assert.deepEqual(result.story.beats,expectedBeats(family));assert.equal(result.story.sections.length,1);assert.equal(result.story.sections[0].text,lastText(family));
  const entry=g.expeditionJournal().routes[0];assert.equal(entry.chapterId,chapter.id);assert.deepEqual(entry.chapterBeats,route(family).returnBeats);assert.equal(entry.outcome,lastText(family));assert.equal(entry.journey,'');assert.equal(entry.job,chapter.job);
  assert.equal(g.state.expeditionStories.length,1);assert.equal(g.state.expeditionStories[0].seen,false);assert.equal(g.pendingExpeditionStory(),null);
  const report=g.expeditionChapterReport(0,1);assert.equal(report.chapterId,chapter.id);assert.deepEqual(report.beats,expectedBeats(family));assert.deepEqual(report.recordIds,[`route:neet:1:${family}:chapter:${chapter.id}`]);assert.equal(report.sections[0].text,lastText(family));
  const loaded=reload(g.state);assert.equal(loaded.pendingExpeditionStory(),null);const loadedReport=loaded.expeditionChapterReport(0,1);assert.equal(loadedReport.chapterId,chapter.id);assert.deepEqual(loadedReport.beats,expectedBeats(family));assert.ok(loaded.markExpeditionStorySeen(loadedReport.recordIds));assert.equal(loaded.expeditionChapterReport(0,1),null);assert.equal(loaded.pendingExpeditionStory(),null);assert.equal(reload(loaded.state).expeditionChapterReport(0,1),null);
  const again=complete(loaded,0,1,family);assert.equal(again.story.chapterId,chapter.id);assert.equal(loaded.state.expeditionStories.length,1);assert.equal(loaded.state.expeditionStories[0].seen,false);assert.equal(loaded.expeditionChapterReport(0,1).chapterId,chapter.id);assert.equal(loaded.expeditionJournal().routes.length,1);
 }
 const offlineGame=baseGame();offlineGame.state.travelers[0].phase='offer';const offlineInfo=offlineGame.combinedExpeditionInfo(0,1);assert.ok(offlineGame.startExpedition(0,offlineInfo.requestId,'combined',1000,0,{family:2,tier:1},null,0));const offlineReady=offlineGame.state.expedition.readyAt,offline=reload(offlineGame.state);const offlineEvents=offline.tick(offlineReady);const offlineStory=offlineEvents.find(event=>event.kind==='expedition')?.story;assert.ok(offlineStory);assert.equal(offlineStory.chapterId,chapter.id);assert.deepEqual(offlineStory.beats,expectedBeats(2));assert.equal(offline.state.expedition,null);assert.equal(offline.expeditionJournal().routes[0].chapterId,chapter.id);assert.equal(offline.expeditionJournal().routes[0].outcome,lastText(2));assert.equal(offline.pendingExpeditionStory(),null);const offlineReport=offline.expeditionChapterReport(0,1);assert.equal(offlineReport.chapterId,chapter.id);assert.deepEqual(offlineReport.beats,expectedBeats(2));assert.ok(offline.markExpeditionStorySeen(offlineReport.recordIds));assert.equal(offline.expeditionChapterReport(0,1),null);assert.equal(reload(offline.state).expeditionChapterReport(0,1),null);
 const unconverted=baseGame();const oldResult=complete(unconverted,2,0,0),oldEntry=unconverted.expeditionJournal().routes[0];assert.equal(oldResult.story.chapterId,undefined);assert.equal(oldEntry.chapterId,null);assert.equal(oldEntry.chapterBeats,null);assert.equal(oldEntry.journey,'');assert.equal(oldEntry.outcome,stories.travelers.tirami.routes['1']['0'].outcome);
 console.log('Passed: chapter route beats for all three materials, exact outcomes, deferred chapter-report readiness, repeat-trip reset, journal replay data, save/reload and offline settlement, and unconverted-route fallback.');
}

// Neet tier-3 and tier-4 chapters: reviewed script fidelity, per-tier unlock gating, draft persistence, absent dispatch, report/repeat and journal replay.
for(const[file,id,tier]of[
 ['chapter-pilot-neet-t3.json','neet-t3-helping-in-the-orchard',3],
 ['chapter-pilot-neet-t4.json','neet-t4-gather-fallen-feathers',4]
]){
 const chapterData=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-chapters.json'),'utf8'));
 const reviewed=JSON.parse(fs.readFileSync(path.join(root,'research','writing','expedition-stories','stories-v2',file),'utf8'));
 const chapter=chapterData.chapters.find(entry=>entry.id===id),familyIds={Life:0,Mana:1,Stamina:2},jobTier=tier-1;
 assert.ok(chapter,'missing chapter '+id);
 assert.equal(chapterData.chapters[jobTier].id,id,'chapter order '+id);
 assert.equal(chapter.traveler,reviewed.traveler);assert.equal(chapter.tier,reviewed.tier);assert.equal(chapter.job,reviewed.job);
 assert.deepEqual(chapter.opening,reviewed.opening.beats);assert.deepEqual(chapter.dispatch,reviewed.sharedDispatch);
 assert.deepEqual(chapter.routes.map(route=>route.family),reviewed.routes.map(route=>familyIds[route.family]));
 for(const[route,source]of chapter.routes.map((route,index)=>[route,reviewed.routes[index]])){
  assert.equal(route.familyLabel,source.family);assert.equal(route.material,source.material);
  assert.deepEqual(route.confirmBeats,source.confirmBeats);assert.deepEqual(route.departureBeats,source.departureBeats);assert.deepEqual(route.returnBeats,source.returnBeats);
 }
 const tiers=available=>{const g=new PotionGame();g.state.tiers=available;return g;};
 assert.equal(tiers([jobTier-1,jobTier-1,jobTier-1]).unlockedExpeditionChapters().some(entry=>entry.id===id),false,'chapter unlocks too early');
 for(const family of [0,1,2]){
  const onlyFamily=[0,0,0];onlyFamily[family]=jobTier;
  assert.deepEqual(tiers(onlyFamily).expeditionChapter(0,jobTier).routes.map(route=>route.family),[family],'single unlocked route '+id+' '+family);
 }
 const allRoutes=tiers([jobTier,jobTier,jobTier]);assert.deepEqual(allRoutes.expeditionChapter(0,jobTier).routes.map(route=>route.family),[0,1,2]);
 assert.deepEqual(allRoutes.unlockedExpeditionChapters().filter(entry=>entry.traveler==='neet').map(entry=>entry.tier),Array.from({length:tier},(_,index)=>index+1));
 const draft=tiers([jobTier,0,0]);assert.equal(draft.setExpeditionChapterDraft(id,1),false);assert.equal(draft.setExpeditionChapterDraft(id,0),true);assert.deepEqual(draft.state.expeditionChapterDraft,{chapterId:id,family:0});
 const loadedDraft=reload(draft.state);assert.deepEqual(loadedDraft.state.expeditionChapterDraft,{chapterId:id,family:0});assert.equal(loadedDraft.clearExpeditionChapterDraft(id),true);assert.equal(loadedDraft.state.expeditionChapterDraft,null);
 assert.throws(()=>sanitizeSave({...draft.state,expeditionChapterDraft:{chapterId:id,family:3}}));
 const absent=tiers([jobTier,jobTier,jobTier]);absent.state.coins=1234;absent.state.travelers[0].phase='away';const beforeAbsent=JSON.stringify(absent.state);
 assert.equal(absent.dispatchCombinedExpedition(0,jobTier,0,1000,()=>0),false);assert.equal(JSON.stringify(absent.state),beforeAbsent);
 for(const family of [0,1,2]){
  const g=tiers([jobTier,jobTier,jobTier]);g.state.coins=100000;g.state.travelers[0].phase='offer';const info=g.combinedExpeditionInfo(0,jobTier);assert.equal(info.duration,120000,'chapter timer '+id);
  assert.equal(g.dispatchCombinedExpedition(0,jobTier,family,1000,()=>0),true);assert.equal(g.state.expedition.readyAt-1000,120000);assert.deepEqual(g.state.expedition.material,{family,tier:jobTier});
  const result=g.settleExpedition(g.state.expedition.readyAt),route=chapter.routes.find(entry=>entry.family===family),expectedBeats=[chapter.dispatch.at(-1),...route.returnBeats];
  assert.equal(result.story.chapterId,chapter.id);assert.equal(result.story.title,'Tier '+tier+' · '+chapter.job);assert.deepEqual(result.story.beats,expectedBeats);assert.equal(result.story.sections[0].text,route.returnBeats.at(-1).text);
  const record=g.state.expeditionStories[0];assert.equal(record.chapterId,chapter.id);assert.equal(record.seen,false);assert.equal(g.pendingExpeditionStory(),null);
  const report=g.expeditionChapterReport(0,jobTier);assert.equal(report.chapterId,chapter.id);assert.deepEqual(report.beats,expectedBeats);assert.deepEqual(report.recordIds,[`route:neet:${jobTier}:${family}:chapter:${chapter.id}`]);
  const loaded=reload(g.state);assert.equal(loaded.expeditionJournal().routes[0].chapterId,chapter.id);assert.deepEqual(loaded.expeditionJournal().routes[0].chapterBeats,route.returnBeats);assert.equal(loaded.expeditionChapterReport(0,jobTier).chapterId,chapter.id);
  assert.ok(loaded.markExpeditionStorySeen(loaded.expeditionChapterReport(0,jobTier).recordIds));assert.equal(loaded.expeditionChapterReport(0,jobTier),null);assert.equal(reload(loaded.state).expeditionChapterReport(0,jobTier),null);
  const again=complete(loaded,0,jobTier,family);assert.equal(again.story.chapterId,chapter.id);assert.equal(loaded.state.expeditionStories.length,1);assert.equal(loaded.state.expeditionStories[0].seen,false);assert.equal(loaded.expeditionChapterReport(0,jobTier).chapterId,chapter.id);assert.equal(loaded.expeditionJournal().routes.length,1);
 }
}
console.log('Passed: Neet tier-3 and tier-4 chapters match the reviewed scripts, unlock only from their tier, expose only unlocked routes, persist drafts, refuse absent dispatch without charging, and preserve timer, reports, repeat trips and journal replay.');

// Neet tier-5 chapter: exact reviewed routes, family-level first/later Cold Roost history, journal replay and save/reload.
{
 const chapterData=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-chapters.json'),'utf8')),reviewed=JSON.parse(fs.readFileSync(path.join(root,'research','writing','expedition-stories','stories-v2','chapter-pilot-neet-t5.json'),'utf8'));
 const chapter=chapterData.chapters.find(entry=>entry.id==='neet-t5-tend-the-nesting-grounds'),familyIds={Life:0,Mana:1,Stamina:2};
 assert.ok(chapter,'missing tier-5 chapter');assert.equal(chapterData.chapters[4].id,chapter.id);assert.equal(chapter.traveler,reviewed.traveler);assert.equal(chapter.tier,5);assert.equal(chapter.job,reviewed.job);assert.equal(chapter.job,'Tend the Nesting Grounds');
 assert.deepEqual(chapter.opening,reviewed.opening.beats);assert.deepEqual(chapter.dispatch,reviewed.sharedDispatch);
 assert.deepEqual(chapter.routes.map(route=>route.family),reviewed.routes.map(route=>familyIds[route.family]));
 for(const[route,source]of chapter.routes.map((route,index)=>[route,reviewed.routes[index]])){assert.equal(route.familyLabel,source.family);assert.equal(route.material,source.material);assert.deepEqual(route.confirmBeats,source.confirmBeats);assert.deepEqual(route.departureBeats,source.departureBeats);assert.deepEqual(route.returnBeats,source.returnBeats);}
 const tiers=available=>{const g=new PotionGame();g.state.tiers=available;return g;};
 assert.equal(tiers([3,3,3]).unlockedExpeditionChapters().some(entry=>entry.id===chapter.id),false,'tier-5 chapter unlocks too early');
 assert.deepEqual(tiers([4,0,0]).expeditionChapter(0,4).routes.map(route=>route.family),[0]);
 assert.deepEqual(tiers([0,4,0]).expeditionChapter(0,4).routes.map(route=>route.family),[1]);
 assert.deepEqual(tiers([0,0,4]).expeditionChapter(0,4).routes.map(route=>route.family),[2]);
 assert.deepEqual(tiers([4,4,4]).expeditionChapter(0,4).routes.map(route=>route.family),[0,1,2]);
 assert.deepEqual(tiers([4,4,4]).unlockedExpeditionChapters().filter(entry=>entry.traveler==='neet').map(entry=>entry.tier),[1,2,3,4,5]);
 const route=family=>chapter.routes.find(entry=>entry.family===family),fullBeats=family=>[chapter.dispatch.at(-1),...route(family).returnBeats].map(beat=>({...beat})),last=family=>route(family).returnBeats.at(-1),neetViewpoint=family=>stories.travelers.neet.viewpoints[String(family)].text,laterBeats=family=>[chapter.dispatch.at(-1),{id:'viewpoint',phase:'viewpoint',speaker:'narrator',portrait:'none',text:neetViewpoint(family)}].map(beat=>({...beat})),laterSection=family=>({kind:'viewpoint',title:"Neet's viewpoint",text:neetViewpoint(family)});
 const g=tiers([4,4,4]);g.state.coins=1e6,ingredientsBefore=JSON.stringify([g.state.ingredients,g.state.ingredientsByFamily]);
 let result=complete(g,0,4,0),record=g.state.expeditionStories.find(entry=>entry.kind==='route');
 assert.equal(JSON.stringify([g.state.ingredients,g.state.ingredientsByFamily]),ingredientsBefore,'tier-5 chapter awarded a material');
 assert.equal(g.state.expedition,null);assert.equal(result.story.chapterId,chapter.id);assert.equal(result.story.title,'Tier 5 · '+chapter.job);assert.deepEqual(result.story.beats,fullBeats(0));assert.equal(result.story.sections[0].text,last(0).text);
 assert.equal(record.chapterId,chapter.id);assert.equal(record.firstCompletion,true);assert.equal(record.seen,false);
 assert.equal(g.state.expeditionStories.filter(entry=>entry.kind==='event'&&entry.family===0).length,1);assert.equal(g.state.expeditionStories.filter(entry=>entry.kind==='viewpoint'&&entry.traveler==='neet'&&entry.family===0).length,1);
 assert.ok(g.state.expeditionStories.filter(entry=>entry.kind==='event'||entry.kind==='viewpoint').every(entry=>entry.seen));
 assert.equal(g.pendingExpeditionStory(),null,'chapter first completion must not queue the old shared-event scene again');
 const firstReport=g.expeditionChapterReport(0,4);assert.equal(firstReport.chapterId,chapter.id);assert.deepEqual(firstReport.beats,fullBeats(0));assert.deepEqual(firstReport.recordIds,[`route:neet:4:0:chapter:${chapter.id}`]);
 const journal=g.expeditionJournal();assert.equal(journal.routes.length,1);assert.deepEqual(journal.routes[0].chapterBeats,route(0).returnBeats);assert.equal(journal.events.length,1);assert.deepEqual(journal.events[0].viewpoints.map(viewpoint=>viewpoint.traveler.id),['neet']);
 const loaded=reload(g.state);assert.deepEqual(loaded.expeditionChapterReport(0,4).beats,fullBeats(0));assert.equal(loaded.expeditionJournal().events.length,1);
 assert.ok(loaded.markExpeditionStorySeen(loaded.expeditionChapterReport(0,4).recordIds));assert.equal(loaded.expeditionChapterReport(0,4),null);
 result=complete(loaded,0,4,0);record=loaded.state.expeditionStories.find(entry=>entry.kind==='route');
 assert.equal(record.firstCompletion,false);assert.equal(record.seen,false);assert.deepEqual(result.story.beats,laterBeats(0));assert.deepEqual(result.story.sections,[laterSection(0)]);
 assert.equal(loaded.state.expeditionStories.filter(entry=>entry.kind==='event'&&entry.family===0).length,1);assert.equal(loaded.pendingExpeditionStory(),null);
 const laterReload=reload(loaded.state),laterReport=laterReload.expeditionChapterReport(0,4);assert.deepEqual(laterReport.beats,laterBeats(0));assert.deepEqual(laterReport.sections,[laterSection(0)]);
 assert.deepEqual(reload(loaded.state).expeditionJournal().routes[0].chapterBeats,route(0).returnBeats);
 const immediate=complete(g,3,4,0);assert.equal(immediate.story.sections.length,1);assert.equal(immediate.story.sections[0].kind,'viewpoint');assert.equal(immediate.story.sections[0].text,stories.travelers.claire.viewpoints['0'].text);
 const order=tiers([4,4,4]);order.state.coins=1e6;for(const family of [2,0,1]){const trip=complete(order,0,4,family);assert.deepEqual(trip.story.beats,fullBeats(family),'first family completion route order '+family);assert.equal(order.state.expeditionStories.find(entry=>entry.kind==='route'&&entry.family===family).firstCompletion,true);}
 for(const family of [2,0,1]){for(const entry of order.state.expeditionStories.filter(entry=>entry.kind==='route'&&entry.chapterId===chapter.id))entry.seen=true;const later=complete(order,0,4,family);assert.deepEqual(later.story.beats,laterBeats(family),'later family viewpoint '+family);assert.deepEqual(later.story.sections,[laterSection(family)]);const repeated=reload(order.state),report=repeated.expeditionChapterReport(0,4);assert.deepEqual(report.beats,laterBeats(family),'later family viewpoint after reload '+family);assert.deepEqual(report.sections,[laterSection(family)]);assert.deepEqual(repeated.expeditionJournal().routes.find(entry=>entry.family===family).chapterBeats,route(family).returnBeats);}
 const offlineBase=tiers([4,4,4]);offlineBase.state.coins=1e6;offlineBase.state.travelers[0].phase='offer';assert.equal(offlineBase.dispatchCombinedExpedition(0,4,1,5000,()=>0),true);const offlineReady=offlineBase.state.expedition.readyAt,offline=reload(offlineBase.state),offlineEvents=offline.tick(offlineReady),offlineStory=offlineEvents.find(event=>event.kind==='expedition'&&event.story)?.story;
 assert.equal(offlineStory.chapterId,chapter.id);assert.deepEqual(offlineStory.beats,fullBeats(1));assert.equal(offline.state.expedition,null);assert.equal(offline.state.expeditionStories.find(record=>record.chapterId===chapter.id&&record.family===1).firstCompletion,true);const beforeRepeat=JSON.stringify([offline.state.coins,offline.state.expeditionStories]);assert.equal(offline.settleExpedition(offlineReady),null);assert.equal(JSON.stringify([offline.state.coins,offline.state.expeditionStories]),beforeRepeat);
 const other=tiers([4,4,4]);other.state.coins=1e6;const oldEvent=complete(other,3,4,0);assert.equal(oldEvent.story.sections.length,3);assert.equal(other.state.expeditionStories.find(entry=>entry.kind==='event'&&entry.family===0).seen,false);
 const afterOld=complete(other,0,4,0);assert.deepEqual(afterOld.story.beats,laterBeats(0));assert.deepEqual(afterOld.story.sections,[laterSection(0)]);assert.equal(other.state.expeditionStories.filter(entry=>entry.kind==='event'&&entry.family===0).length,1);assert.equal(other.state.expeditionStories.find(entry=>entry.kind==='event'&&entry.family===0).seen,false);
 const pending=other.pendingExpeditionStory();assert.ok(pending);assert.equal(pending.sections.length,3);assert.equal(pending.sections[0].kind,'opening');assert.equal(pending.sections[1].text,stories.event.routes['0'].text);assert.equal(pending.sections[2].text,stories.travelers.claire.viewpoints['0'].text);
 const otherAll=tiers([4,4,4]);otherAll.state.coins=1e6;
 for(const family of [0,1,2]){for(const entry of otherAll.state.expeditionStories.filter(entry=>entry.kind==='route'&&entry.chapterId===chapter.id))entry.seen=true;complete(otherAll,3,4,family);const later=complete(otherAll,0,4,family);assert.deepEqual(later.story.beats,laterBeats(family),'other-traveler-first viewpoint '+family);assert.deepEqual(later.story.sections,[laterSection(family)]);assert.equal(otherAll.state.expeditionStories.find(entry=>entry.kind==='route'&&entry.family===family).firstCompletion,false);const repeated=reload(otherAll.state),report=repeated.expeditionChapterReport(0,4);assert.deepEqual(report.beats,laterBeats(family),'other-traveler-first viewpoint after reload '+family);assert.deepEqual(report.sections,[laterSection(family)]);assert.equal(repeated.state.expeditionStories.find(entry=>entry.kind==='event'&&entry.family===family).seen,false);}
 console.log('Passed: Neet tier-5 chapter matches the reviewed script, unlocks from any tier-5 egg, exposes only unlocked options, keeps first family completions full, shows exact later viewpoints for Life, Mana and Stamina after same-traveler and other-traveler first completions, preserves unread stories, and survives reload with journal replay.');
}

// Dolbur tier 1-4 chapters: exact reviewed scripts, all twelve routes, tier/family gating,
// drafts, absent dispatch, cost/one-trip/timer/sale, reports, reloads, legacy records and offline replay.
{
 const chapterData=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-chapters.json'),'utf8'));
 const gameData=JSON.parse(fs.readFileSync(path.join(root,'data','game-data.json'),'utf8'));
 const familyIds={Life:0,Mana:1,Stamina:2};
 const chapterIds={1:'dolbur-t1-trailside-herb-hunt',2:'dolbur-t2-mushrooms-at-base-camp',3:'dolbur-t3-haul-the-orchard-harvest',4:'dolbur-t4-scout-the-feathered-cliffs'};
 const drafts={};
 for(const tier of [1,2,3,4])drafts[tier]=JSON.parse(fs.readFileSync(path.join(root,'research','writing','expedition-stories','stories-v2','chapter-pilot-dolbur-t'+tier+'.json'),'utf8'));
 const chapterFor=tier=>chapterData.chapters.find(chapter=>chapter.id===chapterIds[tier]);
 const routeFor=(chapter,family)=>chapter.routes.find(route=>route.family===family);
 const beatsFor=(chapter,family)=>[chapter.dispatch.at(-1),...routeFor(chapter,family).returnBeats].map(beat=>({...beat}));
 const makeDolbur=(tiers=[0,0,0])=>{const g=new PotionGame();g.state.tiers=tiers;g.state.coins=100000;g.state.travelers[1].phase='away';return g;};

 // Fidelity: every opening, choice, dispatch and route beat stays byte-identical to its reviewed draft.
 for(const tier of [1,2,3,4]){
  const chapter=chapterFor(tier),draft=drafts[tier];
  assert.ok(chapter,'missing Dolbur tier '+tier);assert.equal(chapter.traveler,draft.traveler);assert.equal(chapter.tier,draft.tier);assert.equal(chapter.job,draft.job);
  assert.equal(chapter.job,jobs.dolbur[tier-1].name,'Dolbur job '+tier);
  assert.deepEqual(chapter.opening,draft.opening.beats,'Dolbur opening '+tier);assert.deepEqual(chapter.dispatch,draft.sharedDispatch,'Dolbur dispatch '+tier);
  assert.deepEqual(chapter.routes.map(route=>route.family),draft.routes.map(route=>familyIds[route.family]),'Dolbur route order '+tier);
  for(const[route,source]of chapter.routes.map((route,index)=>[route,draft.routes[index]])){
   assert.equal(route.familyLabel,source.family);assert.equal(route.material,source.material);
   assert.equal(route.material,gameData.families[route.family].materials[tier-1].name,'Dolbur material '+tier+' '+route.family);
   assert.deepEqual(route.confirmBeats,source.confirmBeats,'Dolbur confirm '+tier+' '+route.family);
   assert.deepEqual(route.departureBeats,source.departureBeats,'Dolbur departure '+tier+' '+route.family);
   assert.deepEqual(route.returnBeats,source.returnBeats,'Dolbur return '+tier+' '+route.family);
   const story=stories.travelers.dolbur.routes[String(tier)][String(route.family)];
   assert.equal(route.confirmBeats[0].text,story.hook,'Dolbur hook '+tier+' '+route.family);
   assert.equal(route.returnBeats.at(-1).text,story.outcome,'Dolbur outcome '+tier+' '+route.family);
  }
 }

 // Any one family opens the tier; only its unlocked families are offered. The next tier stays closed.
 for(const tier of [1,2,3,4]){
  const chapter=chapterFor(tier),jobTier=tier-1;
  const fresh=makeDolbur([0,0,0]);
  if(tier===1)assert.deepEqual(fresh.expeditionChapter(1,0).routes.map(route=>route.family),[0,1,2]);
  else assert.equal(fresh.expeditionChapter(1,jobTier),null,'Dolbur tier '+tier+' opens too early');
  for(const family of [0,1,2]){
   const tiers=[jobTier-1,jobTier-1,jobTier-1];tiers[family]=jobTier;
   const g=makeDolbur(tiers);
   assert.deepEqual(g.expeditionChapter(1,jobTier).routes.map(route=>route.family),[family],'Dolbur single route '+tier+' '+family);
   assert.equal(g.setExpeditionChapterDraft(chapter.id,family),true);
   assert.deepEqual(g.state.expeditionChapterDraft,{chapterId:chapter.id,family});
  }
  const all=makeDolbur([jobTier,jobTier,jobTier]);
  assert.deepEqual(all.expeditionChapter(1,jobTier).routes.map(route=>route.family),[0,1,2]);
 }

 // Drafts persist across reloads, locked families are refused, and changing route costs nothing.
 for(const tier of [1,2,3,4]){
  const chapter=chapterFor(tier),jobTier=tier-1,g=makeDolbur([jobTier,jobTier,jobTier]);
  assert.equal(g.setExpeditionChapterDraft(chapter.id,3),false);
  for(const family of [0,1,2]){
   assert.equal(g.setExpeditionChapterDraft(chapter.id,family),true);
   assert.deepEqual(g.state.expeditionChapterDraft,{chapterId:chapter.id,family});
   const loaded=reload(g.state);assert.deepEqual(loaded.state.expeditionChapterDraft,{chapterId:chapter.id,family});
   assert.equal(loaded.clearExpeditionChapterDraft(chapter.id),true);assert.equal(loaded.state.expeditionChapterDraft,null);
  }
  const routeChange=makeDolbur([jobTier,jobTier,jobTier]),coins=routeChange.state.coins;
  assert.equal(routeChange.setExpeditionChapterDraft(chapter.id,0),true);assert.equal(routeChange.setExpeditionChapterDraft(chapter.id,1),true);
  assert.deepEqual(routeChange.state.expeditionChapterDraft,{chapterId:chapter.id,family:1});assert.equal(routeChange.state.coins,coins);assert.equal(routeChange.state.expedition,null);
  if(jobTier>0){const locked=makeDolbur([jobTier,0,0]);assert.equal(locked.setExpeditionChapterDraft(chapter.id,1),false);assert.equal(locked.setExpeditionChapterDraft(chapter.id,0),true);}
 }

 // Dolbur must be present with an offer/active visit: absent dispatch refuses without charge.
 for(const tier of [1,2,3,4]){
  const jobTier=tier-1;
  for(const family of [0,1,2]){
   const absent=makeDolbur([jobTier,jobTier,jobTier]);absent.state.travelers[1].phase='away';absent.state.coins=1234;
   const before=JSON.stringify(absent.state);assert.equal(absent.dispatchCombinedExpedition(1,jobTier,family,1000,()=>0),false,'Dolbur absent '+tier+' '+family);assert.equal(JSON.stringify(absent.state),before,'Dolbur absent charge '+tier+' '+family);
  }
 }

 // Every route: charge, one-trip rule, 120s timer, matching sale saving, report, repeat and journal replay.
 for(const tier of [1,2,3,4]){
  const chapter=chapterFor(tier),jobTier=tier-1;
  for(const family of [0,1,2]){
   const g=makeDolbur([jobTier,jobTier,jobTier]);g.state.travelers[1].phase='offer';const info=g.combinedExpeditionInfo(1,jobTier),beforeCoins=g.state.coins;
   assert.equal(g.dispatchCombinedExpedition(1,jobTier,family,1000,()=>0),true,'Dolbur dispatch '+tier+' '+family);
   assert.equal(g.state.coins,beforeCoins-info.cost,'Dolbur cost '+tier+' '+family);assert.equal(g.state.expedition.focus,'combined');assert.equal(g.state.expedition.readyAt-1000,120000,'Dolbur timer '+tier+' '+family);assert.deepEqual(g.state.expedition.material,{family,tier:jobTier});assert.equal(g.state.expedition.chapterId,chapter.id,'Dolbur chapter marker '+tier+' '+family);
   const activeState=JSON.stringify(g.state);assert.equal(g.dispatchCombinedExpedition(1,jobTier,family,2000,()=>0),false,'Dolbur one-trip '+tier+' '+family);assert.equal(JSON.stringify(g.state),activeState);
   const readyAt=g.state.expedition.readyAt;assert.ok(g.collect(family,jobTier));assert.ok(g.sell(2000)>0);assert.equal(g.lastSaleExpeditionTimeSaved,5000,'Dolbur sale saving '+tier+' '+family);assert.equal(g.state.expedition.readyAt,readyAt-5000);
   const result=g.settleExpedition(g.state.expedition.readyAt),route=routeFor(chapter,family),expected=beatsFor(chapter,family);
   assert.ok(result?.story);assert.equal(result.story.chapterId,chapter.id);assert.equal(result.story.title,'Tier '+tier+' · '+chapter.job);assert.deepEqual(result.story.beats,expected,'Dolbur report beats '+tier+' '+family);assert.equal(result.story.sections[0].text,route.returnBeats.at(-1).text);
   const record=g.state.expeditionStories[0];assert.equal(record.chapterId,chapter.id);assert.equal(record.seen,false);assert.equal(g.pendingExpeditionStory(),null);
   const report=g.expeditionChapterReport(1,jobTier);assert.ok(report);assert.equal(report.chapterId,chapter.id);assert.deepEqual(report.beats,expected);assert.deepEqual(report.recordIds,[`route:dolbur:${jobTier}:${family}:chapter:${chapter.id}`]);
   const entry=g.expeditionJournal().routes[0];assert.equal(entry.chapterId,chapter.id);assert.deepEqual(entry.chapterBeats,route.returnBeats);assert.equal(entry.outcome,route.returnBeats.at(-1).text);assert.equal(entry.journey,'');assert.equal(entry.job,chapter.job);
   const loaded=reload(g.state);assert.deepEqual(loaded.expeditionChapterReport(1,jobTier).beats,expected);assert.deepEqual(loaded.expeditionJournal().routes[0].chapterBeats,route.returnBeats);
   assert.ok(loaded.markExpeditionStorySeen(loaded.expeditionChapterReport(1,jobTier).recordIds));assert.equal(loaded.expeditionChapterReport(1,jobTier),null);assert.equal(reload(loaded.state).expeditionChapterReport(1,jobTier),null);
   loaded.state.coins=1e6;const again=complete(loaded,1,jobTier,family);assert.equal(again.story.chapterId,chapter.id);assert.equal(loaded.state.expeditionStories.length,1);assert.equal(loaded.state.expeditionStories[0].seen,false);assert.equal(loaded.expeditionJournal().routes.length,1);assert.ok(loaded.expeditionChapterReport(1,jobTier));
  }
 }

 // A fresh chapter trip reports even beside an older unread legacy Journey/Outcome record for the same route.
 for(const tier of [1,2,3,4]){
  const chapter=chapterFor(tier),jobTier=tier-1;
  for(const family of [0,1,2]){
   for(const legacySeen of [true,false]){
    const g=makeDolbur([jobTier,jobTier,jobTier]);g.state.travelers[1].phase='offer';g.state.expeditionStories=[{kind:'route',traveler:'dolbur',tier:jobTier,family,at:500,seen:legacySeen}];
    const legacy=JSON.parse(JSON.stringify(g.state.expeditionStories[0])),expected=beatsFor(chapter,family);
    assert.equal(g.dispatchCombinedExpedition(1,jobTier,family,1000,()=>0),true);const settled=g.settleExpedition(121000);assert.ok(settled?.story);assert.equal(settled.story.chapterId,chapter.id);
    assert.equal(g.state.expeditionStories.length,2);assert.deepEqual(g.state.expeditionStories[0],legacy,'legacy record preserved '+tier+' '+family);assert.equal(g.state.expeditionStories[0].seen,legacySeen);
    const chapterRecord=g.state.expeditionStories[1];assert.equal(chapterRecord.chapterId,chapter.id);assert.equal(chapterRecord.seen,false);
    const report=g.expeditionChapterReport(1,jobTier);assert.ok(report);assert.equal(report.chapterId,chapter.id);assert.deepEqual(report.beats,expected);
    const pending=g.pendingExpeditionStory();
    if(legacySeen)assert.equal(pending,null);
    else{assert.ok(pending);assert.equal(pending.chapterId,undefined);assert.deepEqual(pending.recordIds,[`route:dolbur:${jobTier}:${family}`]);assert.equal(pending.sections[0].kind,'outcome');assert.equal(pending.sections[0].text,stories.travelers.dolbur.routes[String(tier)][String(family)].outcome);}
    const loaded=reload(g.state);assert.deepEqual(loaded.state.expeditionStories,g.state.expeditionStories);assert.equal(loaded.expeditionChapterReport(1,jobTier).chapterId,chapter.id);
    const journal=loaded.expeditionJournal().routes;assert.equal(journal.length,2);const oldEntry=journal.find(route=>!route.chapterId),chapterEntry=journal.find(route=>route.chapterId===chapter.id);assert.ok(oldEntry&&chapterEntry);assert.equal(oldEntry.outcome,stories.travelers.dolbur.routes[String(tier)][String(family)].outcome);assert.deepEqual(chapterEntry.chapterBeats,routeFor(chapter,family).returnBeats);
    if(!legacySeen){assert.equal(loaded.state.expeditionStories[0].seen,false);assert.ok(loaded.markExpeditionStorySeen(pending.recordIds));assert.equal(loaded.state.expeditionStories[0].seen,true);assert.equal(loaded.expeditionChapterReport(1,jobTier).chapterId,chapter.id);}
    assert.ok(loaded.markExpeditionStorySeen(loaded.expeditionChapterReport(1,jobTier).recordIds));assert.equal(loaded.expeditionChapterReport(1,jobTier),null);
   }
  }
 }

 // A tier-4 trip saved before this chapter has no marker: reload and offline settlement keep it legacy.
 const preChapter=makeDolbur([3,3,3]);preChapter.state.travelers[1].phase='offer';const preInfo=preChapter.combinedExpeditionInfo(1,3),preCoins=preChapter.state.coins;
 assert.equal(preChapter.dispatchCombinedExpedition(1,3,1,1000,()=>0),true);const preSaved=JSON.parse(JSON.stringify(preChapter.state.expedition)),preChapterId=chapterFor(4).id;
 assert.equal(preSaved.chapterId,preChapterId);delete preChapter.state.expedition.chapterId;
 const preLoaded=reload(preChapter.state),preTrip=preLoaded.state.expedition;
 assert.equal(preTrip.chapterId,undefined);assert.equal(preTrip.readyAt,preSaved.readyAt);assert.deepEqual(preTrip.material,preSaved.material);assert.deepEqual(preTrip.reward,preSaved.reward);assert.equal(preLoaded.state.coins,preCoins-preInfo.cost);
 const preStory=preLoaded.tick(preTrip.readyAt).find(event=>event.kind==='expedition')?.story,preOutcome=stories.travelers.dolbur.routes['4']['1'].outcome;
 assert.ok(preStory);assert.equal(preStory.chapterId,undefined);assert.deepEqual(preStory.recordIds,['route:dolbur:3:1']);assert.deepEqual(preStory.sections,[{kind:'outcome',title:'Outcome',text:preOutcome}]);
 assert.equal(preLoaded.state.expeditionStories[0].chapterId,undefined);assert.equal(preLoaded.expeditionChapterReport(1,3),null);assert.equal(preLoaded.expeditionJournal().routes[0].chapterId,null);assert.equal(preLoaded.expeditionJournal().routes[0].outcome,preOutcome);

 // A newly dispatched tier-4 chapter trip stores its chapter marker and keeps its report after reload/offline settlement.
 const newChapter=makeDolbur([3,3,3]);newChapter.state.travelers[1].phase='offer';assert.equal(newChapter.dispatchCombinedExpedition(1,3,2,1000,()=>0),true);assert.equal(newChapter.state.expedition.chapterId,preChapterId);
 const newLoaded=reload(newChapter.state);assert.equal(newLoaded.state.expedition.chapterId,preChapterId);const newReady=newLoaded.state.expedition.readyAt,newStory=newLoaded.tick(newReady).find(event=>event.kind==='expedition')?.story,newExpected=beatsFor(chapterFor(4),2);
 assert.ok(newStory);assert.equal(newStory.chapterId,preChapterId);assert.deepEqual(newStory.beats,newExpected);assert.equal(newLoaded.expeditionChapterReport(1,3).chapterId,preChapterId);assert.deepEqual(newLoaded.expeditionJournal().routes[0].chapterBeats,routeFor(chapterFor(4),2).returnBeats);

 // A Dolbur trip from a chapter that was already playable stays a chapter trip when its older save has no marker.
 const historical=makeDolbur([2,2,2]);historical.state.travelers[1].phase='offer';assert.equal(historical.dispatchCombinedExpedition(1,2,0,1000,()=>0),true);delete historical.state.expedition.chapterId;
 const historicalLoaded=reload(historical.state),historicalStory=historicalLoaded.tick(historicalLoaded.state.expedition.readyAt).find(event=>event.kind==='expedition')?.story;
 assert.ok(historicalStory);assert.equal(historicalStory.chapterId,chapterFor(3).id);assert.ok(historicalLoaded.expeditionChapterReport(1,2));

 // Offline completion settles once, persists the exact report and journal replay, and cannot settle twice.
 for(const tier of [1,2,3,4]){
  const chapter=chapterFor(tier),jobTier=tier-1;
  for(const family of [0,1,2]){
   const g=makeDolbur([jobTier,jobTier,jobTier]);g.state.travelers[1].phase='offer';assert.equal(g.dispatchCombinedExpedition(1,jobTier,family,1000,()=>0),true);const ready=g.state.expedition.readyAt,offline=reload(g.state),events=offline.tick(ready),story=events.find(event=>event.kind==='expedition')?.story,expected=beatsFor(chapter,family);
   assert.ok(story);assert.equal(story.chapterId,chapter.id);assert.deepEqual(story.beats,expected);assert.equal(offline.state.expedition,null);assert.equal(offline.expeditionJournal().routes[0].chapterId,chapter.id);assert.deepEqual(offline.expeditionJournal().routes[0].chapterBeats,routeFor(chapter,family).returnBeats);
   const report=offline.expeditionChapterReport(1,jobTier);assert.ok(report);assert.deepEqual(report.beats,expected);assert.equal(offline.pendingExpeditionStory(),null);
   const before=JSON.stringify([offline.state.coins,offline.state.expeditionStories]);assert.equal(offline.settleExpedition(ready),null);assert.equal(JSON.stringify([offline.state.coins,offline.state.expeditionStories]),before);
   assert.ok(offline.markExpeditionStorySeen(report.recordIds));assert.equal(reload(offline.state).expeditionChapterReport(1,jobTier),null);
  }
 }
 console.log('Passed: Dolbur tier 1-4 chapters match all twelve reviewed routes byte-for-byte, open from any family tier with only unlocked choices, persist and change drafts, refuse absent dispatch without charge, keep cost/one-trip/120s/sale saving, repeat and reload reports, preserve unread legacy records, and settle offline with journal replay.');
}

// Dolbur tier-5 chapter: exact reviewed script, family-level first/later Cold Roost history,
// active legacy trips, journal replay and offline settlement.
{
 const chapterData=JSON.parse(fs.readFileSync(path.join(root,'data','expedition-chapters.json'),'utf8')),reviewed=JSON.parse(fs.readFileSync(path.join(root,'research','writing','expedition-stories','stories-v2','chapter-pilot-dolbur-t5.json'),'utf8')),familyIds={Life:0,Mana:1,Stamina:2};
 const chapter=chapterData.chapters.find(entry=>entry.id==='dolbur-t5-guard-the-nesting-ridge');
 assert.ok(chapter,'missing Dolbur tier-5 chapter');assert.equal(chapterData.chapters.at(-1).id,chapter.id,'Dolbur tier-5 chapter must keep the existing chapter order');assert.equal(chapterData.chapters[4].id,'neet-t5-tend-the-nesting-grounds','Neet tier-5 chapter order changed');
 assert.equal(chapter.traveler,reviewed.traveler);assert.equal(chapter.tier,reviewed.tier);assert.equal(chapter.job,reviewed.job);assert.equal(chapter.job,jobs.dolbur[4].name);
 assert.deepEqual(chapter.opening,reviewed.opening.beats,'Dolbur tier-5 opening');assert.deepEqual(chapter.dispatch,reviewed.sharedDispatch,'Dolbur tier-5 dispatch');
 assert.deepEqual(chapter.routes.map(route=>route.family),reviewed.routes.map(route=>familyIds[route.family]),'Dolbur tier-5 route order');
 for(const[route,source]of chapter.routes.map((route,index)=>[route,reviewed.routes[index]])){assert.equal(route.familyLabel,source.family);assert.equal(route.material,source.material);assert.equal(route.material,FAMILIES[route.family].materials[4].name,'Dolbur tier-5 material '+route.family);assert.deepEqual(route.confirmBeats,source.confirmBeats,'Dolbur tier-5 confirm '+route.family);assert.deepEqual(route.departureBeats,source.departureBeats,'Dolbur tier-5 departure '+route.family);assert.deepEqual(route.returnBeats,source.returnBeats,'Dolbur tier-5 return '+route.family);}
 const route=family=>chapter.routes.find(entry=>entry.family===family),viewpoint=family=>stories.travelers.dolbur.viewpoints[String(family)].text,fullBeats=family=>[chapter.dispatch.at(-1),...route(family).returnBeats].map(beat=>({...beat})),laterBeats=family=>[chapter.dispatch.at(-1),{id:'viewpoint',phase:'viewpoint',speaker:'narrator',portrait:'none',text:viewpoint(family)}].map(beat=>({...beat})),laterSection=family=>({kind:'viewpoint',title:"Dolbur's viewpoint",text:viewpoint(family)});
 const tiers=available=>{const g=new PotionGame();g.state.tiers=available;g.state.coins=1e6;return g;};
 const makeDolbur=available=>{const g=tiers(available);g.state.travelers[1].phase='away';return g;};

 // Any family opens the tier; only unlocked egg routes are offered and drafts persist.
 assert.equal(tiers([3,3,3]).unlockedExpeditionChapters().some(entry=>entry.id===chapter.id),false,'Dolbur tier-5 chapter unlocks too early');
 assert.deepEqual(tiers([4,0,0]).expeditionChapter(1,4).routes.map(route=>route.family),[0]);
 assert.deepEqual(tiers([0,4,0]).expeditionChapter(1,4).routes.map(route=>route.family),[1]);
 assert.deepEqual(tiers([0,0,4]).expeditionChapter(1,4).routes.map(route=>route.family),[2]);
 assert.deepEqual(tiers([4,4,4]).expeditionChapter(1,4).routes.map(route=>route.family),[0,1,2]);
 assert.deepEqual(tiers([4,4,4]).unlockedExpeditionChapters().filter(entry=>entry.traveler==='dolbur').map(entry=>entry.tier),[1,2,3,4,5]);
 const draft=makeDolbur([4,4,4]);assert.equal(draft.setExpeditionChapterDraft(chapter.id,2),true);assert.deepEqual(draft.state.expeditionChapterDraft,{chapterId:chapter.id,family:2});assert.deepEqual(reload(draft.state).state.expeditionChapterDraft,{chapterId:chapter.id,family:2});
 assert.equal(makeDolbur([4,4,0]).setExpeditionChapterDraft(chapter.id,2),false);
 const absent=makeDolbur([4,4,4]);absent.state.travelers[1].phase='away';absent.state.coins=1234;const absentBefore=JSON.stringify(absent.state);assert.equal(absent.dispatchCombinedExpedition(1,4,0,1000,()=>0),false,'Dolbur tier-5 absent dispatch');assert.equal(JSON.stringify(absent.state),absentBefore,'Dolbur tier-5 absent dispatch charged');

 // Every route: marker, cost, one-trip rule, 120s timer, matching-sale saving, first completion,
 // exact later viewpoint, journal replay and reload.
 for(const family of [0,1,2]){
  const g=makeDolbur([4,4,4]);g.state.travelers[1].phase='offer';const info=g.combinedExpeditionInfo(1,4),beforeCoins=g.state.coins;
  assert.equal(g.dispatchCombinedExpedition(1,4,family,1000,()=>0),true,'Dolbur tier-5 dispatch '+family);
  assert.equal(g.state.coins,beforeCoins-info.cost,'Dolbur tier-5 cost '+family);assert.equal(g.state.expedition.readyAt-1000,120000,'Dolbur tier-5 timer '+family);assert.deepEqual(g.state.expedition.material,{family,tier:4});assert.equal(g.state.expedition.chapterId,chapter.id,'Dolbur tier-5 marker '+family);
  const active=JSON.stringify(g.state);assert.equal(g.dispatchCombinedExpedition(1,4,family,2000,()=>0),false,'Dolbur tier-5 one-trip rule');assert.equal(JSON.stringify(g.state),active);
  const loadedTrip=reload(g.state);assert.equal(loadedTrip.state.expedition.chapterId,chapter.id);assert.deepEqual(loadedTrip.state.expedition.reward,g.state.expedition.reward);
  const readyAt=loadedTrip.state.expedition.readyAt;assert.ok(loadedTrip.collect(family,4));assert.ok(loadedTrip.sell(2000)>0);assert.equal(loadedTrip.lastSaleExpeditionTimeSaved,5000,'Dolbur tier-5 sale saving '+family);assert.equal(loadedTrip.state.expedition.readyAt,readyAt-5000);
  const result=loadedTrip.settleExpedition(loadedTrip.state.expedition.readyAt),record=loadedTrip.state.expeditionStories.find(entry=>entry.kind==='route');
  assert.ok(result?.story,'Dolbur tier-5 report '+family);assert.equal(result.story.chapterId,chapter.id);assert.deepEqual(result.story.beats,fullBeats(family),'Dolbur tier-5 first report '+family);assert.deepEqual(result.story.sections,[{kind:'outcome',title:'Outcome',text:route(family).returnBeats.at(-1).text}]);assert.equal(record.chapterId,chapter.id);assert.equal(record.firstCompletion,true);assert.equal(record.seen,false);
  assert.equal(loadedTrip.state.expeditionStories.filter(entry=>entry.kind==='event'&&entry.family===family).length,1);assert.equal(loadedTrip.state.expeditionStories.filter(entry=>entry.kind==='viewpoint'&&entry.traveler==='dolbur'&&entry.family===family).length,1);assert.ok(loadedTrip.state.expeditionStories.filter(entry=>entry.kind==='event'||entry.kind==='viewpoint').every(entry=>entry.seen));assert.equal(loadedTrip.pendingExpeditionStory(),null,'Dolbur tier-5 first completion queued the legacy shared event');
  const report=loadedTrip.expeditionChapterReport(1,4);assert.ok(report);assert.equal(report.chapterId,chapter.id);assert.deepEqual(report.beats,fullBeats(family));assert.deepEqual(report.recordIds,[`route:dolbur:4:${family}:chapter:${chapter.id}`]);
  const journal=loadedTrip.expeditionJournal();assert.deepEqual(journal.routes[0].chapterBeats,route(family).returnBeats);assert.deepEqual(journal.events[0].viewpoints.map(entry=>entry.traveler.id),['dolbur']);
  assert.ok(loadedTrip.markExpeditionStorySeen(report.recordIds));assert.equal(loadedTrip.expeditionChapterReport(1,4),null);
  const later=complete(loadedTrip,1,4,family);assert.deepEqual(later.story.beats,laterBeats(family),'Dolbur tier-5 later report '+family);assert.deepEqual(later.story.sections,[laterSection(family)]);const laterRecord=loadedTrip.state.expeditionStories.find(entry=>entry.kind==='route');assert.equal(laterRecord.firstCompletion,false);assert.equal(laterRecord.seen,false);assert.equal(loadedTrip.state.expeditionStories.filter(entry=>entry.kind==='route').length,1,'Dolbur tier-5 repeat duplicated the journal route');
  const repeated=reload(loadedTrip.state),repeatReport=repeated.expeditionChapterReport(1,4);assert.deepEqual(repeatReport.beats,laterBeats(family));assert.deepEqual(repeatReport.sections,[laterSection(family)]);assert.deepEqual(repeated.expeditionJournal().routes[0].chapterBeats,route(family).returnBeats);
 }

 // A Neet-first family gives Dolbur the short later report and keeps the journal event viewable.
 for(const family of [0,1,2]){
  const g=tiers([4,4,4]),neet=complete(g,0,4,family);assert.ok(neet.story);assert.equal(g.pendingExpeditionStory(),null,'Neet chapter first completion queued the legacy shared event');
  const dolbur=complete(g,1,4,family);assert.deepEqual(dolbur.story.beats,laterBeats(family),'Dolbur tier-5 Neet-first report '+family);assert.deepEqual(dolbur.story.sections,[laterSection(family)]);
  const eventRecord=g.state.expeditionStories.find(entry=>entry.kind==='event'&&entry.family===family);assert.ok(eventRecord);assert.equal(eventRecord.seen,true);
  const journal=g.expeditionJournal();assert.equal(journal.routes.length,2);assert.deepEqual(journal.events[0].viewpoints.map(entry=>entry.traveler.id),['neet','dolbur']);assert.deepEqual(journal.routes.find(entry=>entry.traveler.id==='dolbur').chapterBeats,route(family).returnBeats);assert.equal(g.pendingExpeditionStory(),null);
  const repeat=complete(g,1,4,family);assert.deepEqual(repeat.story.beats,laterBeats(family));assert.equal(g.state.expeditionStories.filter(entry=>entry.kind==='route').length,2);assert.equal(g.expeditionJournal().routes.length,2);
 }

 // An older unread event/viewpoint from another traveler stays unread; Dolbur gets the later report.
 {
  const g=tiers([4,4,4]),claire=complete(g,3,4,0);assert.ok(claire.story);assert.equal(g.pendingExpeditionStory().sections.at(-1).text,stories.travelers.claire.viewpoints['0'].text);
  const dolbur=complete(g,1,4,0);assert.deepEqual(dolbur.story.beats,laterBeats(0));assert.deepEqual(dolbur.story.sections,[laterSection(0)]);assert.equal(g.state.expeditionStories.find(entry=>entry.kind==='event'&&entry.family===0).seen,false);
  assert.deepEqual(g.expeditionJournal().events[0].viewpoints.map(entry=>entry.traveler.id).sort(),['claire','dolbur']);
  const pending=g.pendingExpeditionStory();assert.ok(pending);assert.equal(pending.sections.length,3);assert.equal(pending.sections[2].text,stories.travelers.claire.viewpoints['0'].text);assert.ok(g.markExpeditionStorySeen(pending.recordIds));assert.equal(g.pendingExpeditionStory(),null);assert.equal(g.state.expeditionStories.find(entry=>entry.kind==='event'&&entry.family===0).seen,true);assert.equal(g.state.expeditionStories.find(entry=>entry.kind==='viewpoint'&&entry.traveler==='claire'&&entry.family===0).seen,true);
 }

 // New chapter trips survive reload/offline settlement and cannot settle twice.
 const offline=makeDolbur([4,4,4]);offline.state.travelers[1].phase='offer';assert.equal(offline.dispatchCombinedExpedition(1,4,2,1000,()=>0),true);const offlineReady=offline.state.expedition.readyAt,offlineLoaded=reload(offline.state),offlineEvents=offlineLoaded.tick(offlineReady),offlineStory=offlineEvents.find(event=>event.kind==='expedition')?.story;
 assert.ok(offlineStory);assert.equal(offlineStory.chapterId,chapter.id);assert.deepEqual(offlineStory.beats,fullBeats(2));assert.equal(offlineLoaded.state.expedition,null);assert.ok(offlineLoaded.expeditionChapterReport(1,4));assert.deepEqual(offlineLoaded.expeditionJournal().routes[0].chapterBeats,route(2).returnBeats);
 const offlineBefore=JSON.stringify([offlineLoaded.state.coins,offlineLoaded.state.expeditionStories,offlineLoaded.state.expeditionStamps,offlineLoaded.state.likeability,offlineLoaded.state.powerups]);assert.equal(offlineLoaded.settleExpedition(offlineReady),null);assert.equal(JSON.stringify([offlineLoaded.state.coins,offlineLoaded.state.expeditionStories,offlineLoaded.state.expeditionStamps,offlineLoaded.state.likeability,offlineLoaded.state.powerups]),offlineBefore);

 // An already-active Dolbur tier-5 trip saved without a marker keeps its legacy settlement,
 // deadline, material, cost and frozen reward across reload and offline completion.
 for(const family of [0,1,2]){
  const legacy=makeDolbur([4,4,4]);legacy.state.travelers[1].phase='offer';const info=legacy.combinedExpeditionInfo(1,4),coins=legacy.state.coins;assert.equal(legacy.dispatchCombinedExpedition(1,4,family,1000,()=>0),true);const saved=JSON.parse(JSON.stringify(legacy.state.expedition));assert.equal(saved.chapterId,chapter.id);delete legacy.state.expedition.chapterId;
  const loaded=reload(legacy.state),trip=loaded.state.expedition;assert.equal(trip.chapterId,undefined);assert.equal(trip.readyAt,saved.readyAt);assert.deepEqual(trip.material,saved.material);assert.deepEqual(trip.reward,saved.reward);assert.equal(loaded.state.coins,coins-info.cost);
  const frozen=JSON.stringify({readyAt:trip.readyAt,material:trip.material,reward:trip.reward}),events=loaded.tick(trip.readyAt),story=events.find(event=>event.kind==='expedition')?.story;
  assert.ok(story);assert.equal(story.chapterId,undefined);assert.equal(story.kind,'event');assert.equal(story.sections.length,3);assert.equal(story.sections[0].text,stories.event.opening);assert.equal(story.sections[1].text,stories.event.routes[String(family)].text);assert.equal(story.sections[2].text,viewpoint(family));assert.equal(loaded.state.expedition,null);assert.equal(loaded.expeditionChapterReport(1,4),null);assert.equal(loaded.expeditionJournal().routes.length,0);assert.ok(loaded.state.expeditionStories.every(record=>record.chapterId===undefined));assert.equal(JSON.stringify({readyAt:saved.readyAt,material:saved.material,reward:saved.reward}),frozen);
  const before=JSON.stringify([loaded.state.coins,loaded.state.expeditionStories,loaded.state.expeditionStamps,loaded.state.likeability,loaded.state.powerups]);assert.equal(loaded.settleExpedition(trip.readyAt),null);assert.equal(JSON.stringify([loaded.state.coins,loaded.state.expeditionStories,loaded.state.expeditionStamps,loaded.state.likeability,loaded.state.powerups]),before);
 }
 console.log('Passed: Dolbur tier-5 chapter matches the reviewed script byte-for-byte, unlocks from any tier-5 egg, exposes only unlocked routes, keeps cost/one-trip/120s/sale saving, shows full first family completions and exact later viewpoints after same-traveler, Neet-first and unmarked legacy trips, preserves unread records and journal replay, and settles offline once.');
}
