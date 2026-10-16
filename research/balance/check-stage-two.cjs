// This check compares stage two with stage one; later deliberate tuning will invalidate it.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {session,economy}=require('./baseline-current.cjs');
const folder=path.join(__dirname,'current-baseline'),before=require('./current-baseline/sessions.json');
const scenarios=[{name:'Manual · earned boosts',mode:'manual'},{name:'Conveyor · earned boosts',mode:'conveyor'},{name:'Manual · paid boost chests',mode:'manual',paid:true},{name:'Conveyor · paid boost chests',mode:'conveyor',paid:true},{name:'Conveyor · spend event tokens on boosts',mode:'conveyor',eventSpend:'boosts'},{name:'Conveyor · traveler requests',mode:'conveyor',requests:true}];
const frozenHashes=Object.fromEntries(fs.readdirSync(folder).map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(folder,file))).digest('hex')]));
for(const scenario of scenarios)for(const seed of [1,17,40])assert.deepEqual(session(seed,scenario),before.find(row=>row.scenario===scenario.name&&row.seed===seed),'behavior changed: '+scenario.name+' seed '+seed);
assert.deepEqual(JSON.parse(JSON.stringify(economy())),require('./current-baseline/economy.json'));
for(const [file,hash]of Object.entries(frozenHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(folder,file))).digest('hex'),hash,'stage-one evidence changed');
console.log('Passed: 18 full two-hour seeded sessions and all economy summaries match stage one exactly; baseline artifacts unchanged.');
