const assert=require('node:assert/strict'),{PotionGame,INITIAL,sanitizeSave,ORIGINAL_ACHIEVEMENTS,FAIRIES}=require('./core.js');
const clone=x=>JSON.parse(JSON.stringify(x)),reload=g=>new PotionGame(sanitizeSave(clone(g.state)));
assert.equal(ORIGINAL_ACHIEVEMENTS.length,176);assert.equal(new Set(ORIGINAL_ACHIEVEMENTS.map(r=>r.Id)).size,176);
const full=new PotionGame();Object.assign(full.state.metrics,{coinsEarned:1e14,enhancementsSucceeded:10000,enhancementsFailed:10000,soldLevelOne:10000});Object.assign(full.state,{ingredients:150000000,likeability:10000,tiers:[24,24,24]});full.state.helperStats={summons:1000000,blackcats:1000000,materials:0};full.state.originalAchievements.expeditionsCompleted=35;full.state.fairies=Object.fromEntries(FAIRIES.map(f=>[f.id,10]));
for(const row of ORIGINAL_ACHIEVEMENTS){const p=full.originalAchievementProgress(row.Id);assert(p.earned,'not earned: '+row.Id);}
const before={rubies:full.state.rubies,tickets:full.state.tickets};for(const row of ORIGINAL_ACHIEVEMENTS){assert(full.claimOriginalAchievement(row.Id));assert(!full.claimOriginalAchievement(row.Id),'duplicate reward '+row.Id);}
assert.equal(full.state.rubies-before.rubies,ORIGINAL_ACHIEVEMENTS.reduce((sum,r)=>sum+r.RewardRuby,0));assert.equal(full.state.tickets-before.tickets,ORIGINAL_ACHIEVEMENTS.reduce((sum,r)=>sum+r.RewardTicket,0));const saved=reload(full);assert.equal(saved.state.originalAchievements.claimed.length,176);for(const row of ORIGINAL_ACHIEVEMENTS)assert(!saved.claimOriginalAchievement(row.Id));
const g=new PotionGame();assert(!g.claimOriginalAchievement(1));g.state.ingredients=30;assert(g.claimOriginalAchievement(1));g.state.metrics.enhancementsSucceeded=499;assert(!g.originalAchievementProgress(14).earned);g.state.metrics.enhancementsSucceeded=500;assert(g.originalAchievementProgress(14).earned);assert.equal(g.state.originalAchievements.claimed.includes(13),false,'earned prerequisite does not require claiming it');
g.state.fairies['fairy-1']=1;assert(!g.originalAchievementProgress(201).earned);g.state.originalAchievements.expeditionsCompleted=1;assert(g.originalAchievementProgress(101).earned);assert(g.originalAchievementProgress(201).earned);g.state.rubies=Number.MAX_SAFE_INTEGER;const held=clone(g.state);assert(!g.claimOriginalAchievement(201));assert.deepEqual(g.state,held,'overflow is atomic');
for(const version of [14,15,16]){const old=clone(INITIAL());old.version=version;delete old.originalAchievements;const s=sanitizeSave(old);assert.equal(s.version,18);assert.deepEqual(s.originalAchievements,{claimed:[],expeditionsCompleted:0});}
for(const value of [{claimed:[1,1],expeditionsCompleted:0},{claimed:[99999],expeditionsCompleted:0},{claimed:[],expeditionsCompleted:-1},{claimed:[],expeditionsCompleted:1.5}]){const raw=INITIAL();raw.originalAchievements=value;assert.throws(()=>sanitizeSave(raw));}
const raw=INITIAL();delete raw.originalAchievements;assert.throws(()=>sanitizeSave(raw));
const trip=new PotionGame();trip.state.expedition={requestId:0,focus:'supplies',readyAt:10,travelerIndex:0,fairyWon:false,reward:{stamps:1,likeability:10,boostBundle:{protection:1},fairyId:null,extra:null}};assert.equal(trip.settleExpedition(9),null);assert.equal(trip.state.originalAchievements.expeditionsCompleted,0);assert(trip.settleExpedition(10));assert.equal(trip.state.originalAchievements.expeditionsCompleted,1);assert.equal(trip.settleExpedition(11),null);assert.equal(trip.state.originalAchievements.expeditionsCompleted,1);
console.log('Passed: all 176 targets, original reward totals, prerequisites, one-time claims/reload, v14–16 migration, invalid progress/claims, atomic overflow and exactly-once expedition settlement.');
const fs=require('fs'),path=require('path'),vm=require('vm'),app=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');
const tierContext=vm.createContext({});vm.runInContext(app.match(/function visibleOriginalAchievementTiers\(progress\)\{[\s\S]*?\n\}/)[0],tierContext);
const tiers=game=>tierContext.visibleOriginalAchievementTiers(ORIGINAL_ACHIEVEMENTS.map(r=>game.originalAchievementProgress(r.Id)));
const stage=new PotionGame();stage.state.ingredients=150000000;
assert.equal(tiers(stage).length,46);assert(tiers(stage).some(p=>p.row.Id===1));assert(!tiers(stage).some(p=>p.row.Id===31));
assert(stage.claimOriginalAchievement(1));assert(!tiers(stage).some(p=>p.row.Id===1));assert(tiers(stage).some(p=>p.row.Id===31&&p.claimable));
assert(stage.claimOriginalAchievement(31));assert(tiers(reload(stage)).some(p=>p.row.Id===32));
assert.equal(tiers(stage).filter(p=>p.row.Condition===16).length,35,'Different fairy acquisitions remain independent');
const complete=reload(full);complete.state.originalAchievements.claimed=[];const balances=[complete.state.rubies,complete.state.tickets];
for(let pass=0;pass<176;pass++){const ready=tiers(complete).filter(p=>p.claimable);if(!ready.length)break;for(const p of ready)assert(complete.claimOriginalAchievement(p.row.Id));}
assert.equal(complete.state.originalAchievements.claimed.length,176,'No hidden reward becomes unreachable');
assert.equal(complete.state.rubies-balances[0],253);assert.equal(complete.state.tickets-balances[1],1080);
assert.equal(tiers(complete).length,46);assert(tiers(complete).every(p=>p.claimed),'Final tiers remain as completed cards');
assert(tiers(complete).some(p=>p.row.Id===12));assert(!tiers(complete).some(p=>p.row.Id===2));
console.log('Passed: one visible tier per chain, tutorial-to-1,000 materials, pending rewards retained, reload, independent fairies, all 176 rewards reachable and completed final tiers.');
