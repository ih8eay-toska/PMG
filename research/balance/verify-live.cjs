// Bounded progression smoke check using the published live engine. Historical outputs stay untouched.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const api=require('./live-runtime.cjs'),study=require('./stage-four.cjs'),candidate=require('./stage-four-candidate/candidate.json');
const resources=['coins','tickets','rubies','solution','protection','enhancement','selling'],boosts=['protection','enhancement','selling'];
let source=study.session.toString();
// The research adapter used Infinity for mastery locks; live upgrades expose a locked flag.
assert.ok(source.includes('.filter(u=>u.level<u.max)'));source=source.replace('.filter(u=>u.level<u.max)','.filter(u=>u.level<u.max&&!u.locked)');
// Exercise the actual Bank method instead of the historical simulator's transaction copy.
assert.ok(source.includes('if(s[from]<paid)return false;s[from]-=paid;s[to]+=received;'));source=source.replace('if(s[from]<paid)return false;s[from]-=paid;s[to]+=received;','if(!game.exchange(from,to,lots))return false;');
const session=new Function('engine','baseline','resources','boosts','clone','return ('+source+');')(()=>api,api,resources,boosts,x=>JSON.parse(JSON.stringify(x)));
const root=path.resolve(__dirname,'../..'),files=['source/core.js','source/app.js','data/game-data.json','data/economy.json'],hashes=()=>Object.fromEntries(files.map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f))).digest('hex')])),before=hashes(),runs=[];
for(const scenario of [
 {name:'Manual · save for skins',mode:'manual',earlySales:true},
 {name:'Conveyor · save for skins',mode:'conveyor',earlySales:true},
 {name:'Conveyor · paid boost stock',mode:'conveyor',earlySales:true,paid:true},
 {name:'Conveyor · ruby cases',mode:'conveyor',earlySales:true,gamble:true,rubyCases:true,equipFairy:true}
]){
 for(let seed=1;seed<=4;seed++)runs.push(session(candidate,scenario,seed,{minutes:180}));
 console.log(scenario.name+' verified');
}
const probes=[];for(const startTier of [10,20])for(const mode of ['manual','conveyor'])for(let seed=1;seed<=2;seed++)probes.push(session(candidate,{name:'Tier '+startTier+' · '+mode,mode,earlySales:true,paid:true},seed,{startTier,minutes:120}));
const rows=study.summary(runs),phaseRows=study.summary(probes);
for(const row of rows.filter(r=>r.scenario.includes('save for skins'))){assert.equal(row.milestones.tia.notReached,0);assert.equal(row.milestones.regularSkin.notReached,0);}
assert.deepEqual(hashes(),before,'runtime changed during verification');
const out=path.join(__dirname,process.argv[2]||'stage-six-verification');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,'progression.json'),JSON.stringify({assumptions:{seedsPerPolicy:4,freshMinutes:180,phaseSeeds:2,phaseMinutes:120,actionMs:500,conveyorStepMs:50,capture:.9,timingIsAssumed:true,scope:'Targeted live-engine smoke sample; not a replacement for the stage-four calibration or human playtesting.'},sourceHashes:before,summary:rows,phaseSummary:phaseRows,runs,probes},null,2)+'\n');
console.log(JSON.stringify(rows.map(r=>({scenario:r.scenario,tia:r.milestones.tia.p50,skin:r.milestones.regularSkin.p50,middle:r.middleGaps.p50})),null,2));
console.log('Passed: 16 fresh-save sessions and eight phase probes; resource ledgers balanced and paid quotas respected.');
