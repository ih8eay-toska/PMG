// Report generation for the research calculation; never imported by gameplay.
const fs=require('node:fs'),path=require('node:path');
const study=require('./stage-three.cjs');
const fmt=n=>n===null?'not reached':Number(n).toLocaleString('en-US',{maximumFractionDigits:2});
const csv=rows=>Object.keys(rows[0]).join(',')+'\n'+rows.map(r=>Object.values(r).map(v=>JSON.stringify(v??'')).join(',')).join('\n')+'\n';
module.exports=function report(c,result,rows,sensitivity,out){
 const api=study.studyEngine(c),metrics={familyComparisons:0,worstFamilySpread:{ratio:0},incomeDeclines:[],middlePurchaseGaps:[],fairyStress:[],feeding:[]};
 // Check all active ordinary upgrade combinations, separately for both inputs.
 for(let luck=0;luck<=10;luck++)for(let price=0;price<=4;price++){
  const previous={manual:[0,0,0],conveyor:[0,0,0]};
  for(let t=0;t<25;t++){
   const a=[0,1,2].map(f=>study.rates(api,f,t,{luck,price}));
   for(const mode of ['manual','conveyor']){
    const income=a.map(r=>r[mode].goldPerMinute),ratio=Math.max(...income)/Math.min(...income);metrics.familyComparisons++;
    if(ratio>metrics.worstFamilySpread.ratio)metrics.worstFamilySpread={ratio,luck,price,tier:t+1,mode,income};
    for(let f=0;f<3;f++){if(income[f]<previous[mode][f])metrics.incomeDeclines.push({luck,price,tier:t+1,family:f,mode,previous:previous[mode][f],income:income[f]});previous[mode][f]=income[f];}
   }
  }
 }
 for(const name of new Set(result.runs.map(r=>r.scenario))){
  const selected=result.runs.filter(r=>r.scenario===name),gaps=selected.flatMap(r=>[...r.upgradeTimes].sort((a,b)=>a.atMinutes-b.atMinutes).map((u,i,a)=>({...u,gap:u.atMinutes-(i?a[i-1].atMinutes:0)})).filter(u=>u.tier>=7&&u.tier<=16).map(u=>u.gap));
  metrics.middlePurchaseGaps.push({scenario:name,...study.describe(gaps),runsWithMiddlePurchase:selected.filter(r=>r.upgradeTimes.some(u=>u.tier>=7&&u.tier<=16)).length,runs:selected.length,horizonMinutes:120});
 }
 // Compare each fairy with the same family, tier, inventory and ordinary upgrades.
 const unassisted=new Map();
 for(const mode of ['normalized','original'])for(const inventory of ['0/0/0','5/10/2']){
  let worst={ratio:0};
  for(const r of rows.filter(r=>r.fairyMode===mode&&r.fairy&&r.inventory===inventory)){
   const f=api.FAMILIES.findIndex(f=>f.label===r.family),key=f+':'+r.tier+':'+inventory;
   if(!unassisted.has(key))unassisted.set(key,study.rates(api,f,r.tier-1,{luck:10,price:4},inventory.split('/').map(Number)));
   const base=unassisted.get(key);
   for(const input of ['manual','conveyor']){const ratio=r[input+'GoldPerMinute']/base[input].goldPerMinute;if(ratio>worst.ratio)worst={ratio,fairy:r.profile,family:r.family,tier:r.tier,input};}
  }
  metrics.fairyStress.push({mode,inventory,...worst});
 }
 // Manual additional-ingredient strategy: real core operations, all lower recipes
 // available, and a highest-value unlocked ingredient. No free extra actions.
 for(const tier of [1,7,13,19,25]){
  const t=tier-1,extra=api.FAMILIES.flatMap((f,family)=>f.materials.slice(0,t+1).map((m,index)=>({family,tier:index,value:m.value}))).sort((a,b)=>b.value-a.value)[0];
  let best={goldPerMinute:0};
  for(let f=0;f<3;f++)for(let r=0;r<=t;r++)for(const additions of [0,1,5,20,100]){
   const g=new api.PotionGame();Object.assign(g.state,{tiers:[t,t,t],luck:10,price:4});g.collect(f,r);
   for(let i=0;i<additions;i++)g.collect(extra.family,extra.tier);
   const sale=[g.sellValue()],chances=[],doubled=[];
   while(g.next()){chances.push(g.next().chance);g.enhance(0,1);sale.push(g.sellValue());}
   const l={chances,sale,doubled,q:0};
   for(let stop=0;stop<sale.length;stop++){const e=api.evaluate(l,stop),income=e.expectedGold/(e.actions+additions)*120;if(income>best.goldPerMinute)best={goldPerMinute:income,family:api.FAMILIES[f].label,recipeTier:r+1,additions,sellLevel:stop+1};}
  }
  const noFeeding=Math.max(...[0,1,2].map(f=>study.rates(api,f,t,{luck:10,price:4}).manual.goldPerMinute));
  metrics.feeding.push({unlockedTier:tier,...best,highestTierNoFeedingGoldPerMinute:noFeeding,ratioToHighestTierNoFeeding:best.goldPerMinute/noFeeding});
 }
 const effective=[];
 for(let f=0;f<3;f++)for(let t=0;t<24;t++){
  const g=new api.PotionGame();g.state.tiers=[t,t,t];g.state.masteryStars=Array.from({length:t},(_,i)=>f+'-'+i);const u=g.upgradeInfo('tier'+f);
  effective.push({family:api.FAMILIES[f].label,fromTier:t+1,toTier:t+2,cost:u.cost,earlierSameFamilyMastery:c.rules.familyMasteryGates.find(a=>a.unlockTier===t+2)?.masteredRecipes||0});
 }
 fs.writeFileSync(path.join(out,'effective-material-costs.csv'),csv(effective));
 fs.writeFileSync(path.join(out,'metrics.json'),JSON.stringify(metrics,null,2)+'\n');
 const mainNames=['Manual · earned boosts','Conveyor · available ingredients','Conveyor · available ingredients + token boosts','Conveyor · earned boosts'];
 const timing=mainNames.map(name=>{const s=result.summary.find(s=>s.scenario===name),m=s.milestones.tia;return`| ${name} | ${fmt(m.p10)} | ${fmt(m.p50)} | ${fmt(m.p90)} | ${m.count}/${s.runs} |`;}).join('\n');
 const middle=metrics.middlePurchaseGaps.filter(r=>mainNames.includes(r.scenario)).map(r=>`| ${r.scenario} | ${fmt(r.p10)} | ${fmt(r.p50)} | ${fmt(r.p90)} | ${r.count} purchases in ${r.runsWithMiddlePurchase}/${r.runs} runs |`).join('\n');
 const sense=api.summarizeSessions(sensitivity).map(s=>{const m=s.milestones.tia;return`| ${s.scenario} | ${fmt(m.p50)} | ${m.count}/${s.runs} |`;}).join('\n');
 const sample=[1,5,10,15,20,25].map(tier=>{const a=api.FAMILIES.map((f,i)=>{const r=f.recipes[tier-1],l=api.ladder(i,tier-1,{luck:10,price:4});return`${fmt(r.base)} / ${fmt(l.sale.at(-1))}`;});return`| ${tier} | ${a.join(' | ')} |`;}).join('\n');
 const stress=metrics.fairyStress.map(r=>`| ${r.mode} | ${r.inventory} | ${fmt(r.ratio)}× | ${r.fairy}, ${r.family}, tier ${r.tier}, ${r.input} |`).join('\n');
 const boosts=result.runs.filter(r=>r.scenario==='Conveyor · available ingredients').map(r=>Object.values(r.used).reduce((a,b)=>a+b,0));
 const feed=metrics.feeding.map(r=>`| ${r.unlockedTier} | ${r.family} tier ${r.recipeTier}, sell Lv ${r.sellLevel} | ${r.additions} | ${fmt(r.ratioToHighestTierNoFeeding)}× |`).join('\n');
 const doc=`# Stage 3 — candidate potion and upgrade curves

Research calculation, 16 October 2026. **Candidate only: gameplay and player saves are unchanged.** This is a measured draft, not a deployment-ready balance approval.

## Main findings

1. **The ordinary family-income target is attainable.** Worst spread is **${fmt(metrics.worstFamilySpread.ratio)}×**, below 1.25×, across ${metrics.familyComparisons.toLocaleString('en-US')} comparisons: 25 tiers × 11 luck levels × 5 selling levels × 2 input models. No fairy or consumable is assumed for that bound. ${metrics.incomeDeclines.length} backward income steps were found within these profiles.
2. **Tia pacing depends on player policy.** At two actions/second, median unlocks are **${fmt(result.summary.find(s=>s.scenario==='Manual · earned boosts').milestones.tia.p50)} minutes manually / ${fmt(result.summary.find(s=>s.scenario==='Conveyor · available ingredients').milestones.tia.p50)} minutes on the opportunistic conveyor**. Waiting for one exact ingredient misses the two-hour horizon in all 40 runs. Faster/slower input produces different outcomes; the 60–90 minute benchmark is not satisfied across every input rate.
3. **The 3–5 minute middle-game target is not met overall.** Median gaps are **${fmt(metrics.middlePurchaseGaps.find(r=>r.scenario==='Manual · earned boosts').p50)} minutes manually / ${fmt(metrics.middlePurchaseGaps.find(r=>r.scenario==='Conveyor · available ingredients').p50)} minutes on the opportunistic conveyor**, with long tails and bursts. Later upgrade tiers that are not reached within two hours have no measured completion time.
4. **Fairy compounding must be addressed together with recipes.** The candidate distributes a multiplier bonus across a whole brew and reduces chance bonuses; original abilities are separately evaluated. These would be visible ability changes requiring matching descriptions during implementation.
5. **Keep this draft out of live gameplay until resource tuning.** Bank conversion, paid chests, requests, missed ingredients and action speed can change progression. Stage 4 must reconcile those sources before prices or save conversion are activated.

## Tia unlock — active minutes

40 seeds per policy; horizon 120 minutes. P10/P50/P90 are conditional on reaching the milestone. Non-completions are censored, not assigned 120-minute unlocks.

| Policy | P10 | P50 | P90 | Reached |
| --- | ---: | ---: | ---: | ---: |
${timing}

The first eight seeds informed calibration; seeds 9–40 extend the sample. This is not independent human validation. The original frozen baseline had median manual/conveyor times of 5.23/21.35 minutes under its exact-recipe policy.

## Middle-game purchase gaps

Time since the preceding material purchase across all three families, selecting purchases that unlock tiers 7–16. This differs from the existing harness's per-family wait metric. Both remain in the artifacts. Rows omit future purchases not reached by the horizon, so this table cannot establish the pace of the entire middle game.

| Policy | P10 min | P50 min | P90 min | Observations |
| --- | ---: | ---: | ---: | --- |
${middle}

## Candidate rules

1. Preserve recipe identities, images, names and maximum levels. Use a smooth reference income of **300 × 1.30^(tier−1)** gold/minute. For each recipe, choose the whole-gold base that matches the geometric mean of manual and exact-conveyor income at luck 5 / selling 2. That mean is a calibration reference, not an actual player mode.
2. Life uses short risky chains: chances 80% down to 50%, multipliers 1.65 up to 2.55. Mana uses 88% down to 72%, with multipliers 1.60–1.90 over the first four steps and 1.05 on a fifth step. Stamina uses 91% each step, multipliers 1.65 for its first three steps and 1.025 thereafter. Best farming stop and maximum mastery level are separate decisions.
3. Luck grants **0.4 percentage points per level**, up to +4. Selling and conveyor upgrade effects retain current strengths. The global 99% cap remains. Stamina without charges or fairies reaches 95% per attempt at maximum ordinary luck; the proposed strongest fairy chance bonus raises it to 98%. Enhancement charges can still temporarily hit the ceiling.
4. Ingredient additions are 10% of their recipe's new base. Fairy enhancement-chance bonuses are 10% of their current values. A fairy multiplier b becomes (1+b)^(1/n) per enhancement on an n-step recipe, so reaching maximum receives a factor of (1+b), rather than (1+b)^n. Other fairy effects remain unchanged.
5. Material prices use the same measured recipe income: start with four times the geometric-mean rate at reference luck min(10,floor(tier/2)) / selling min(4,floor(tier/5)). Tutorial tiers use one, 1.5 and two reference minutes before scaling. Final early scale is 8.5/4; owned tier 7 onward uses 10/4. These are price factors, **not promises of observed minutes**. Explicit effective prices are in effective-material-costs.csv. Luck, price and speed have separate bounded tables in candidate.json.

The proposed same-family mastery gates are tier 5 → 2 earlier recipes; tier 10 → 5; tier 15 → 8; tier 20 → 12; tier 25 → 16. All are reachable using earlier recipes. They are enforced only by the research adapter. Tia still requires 20 unique stars. No star is granted twice, and no existing unlock is revoked in this calculation.

## Example potion values

Each cell is base / maximum sale with luck 10, selling 4, no fairy or charge. Gold values stay on the new bounded curve; this does not convert legacy balances.

| Material tier | Life | Mana | Stamina |
| --- | ---: | ---: | ---: |
${sample}

## Fairy and finite-boost stress

All ${api.FAIRIES.length} fairies are evaluated at levels 1/5/10, every recipe and every stopping level, with zero inventory and finite 5 protection / 10 enhancement / 2 selling charges. The second inventory is a single-brew budget, **not sustainable infinite supply**. Family-specialist fairy bonuses are intentionally outside the ordinary 1.25× bound.

| Ability model | Starting charges P/E/S | Largest income gain versus same unassisted recipe | Where |
| --- | --- | ---: | --- |
${stress}

Fresh-save session fairies are not auto-equipped; isolated stress is not a simulation of obtaining a max fairy. Session boost budgets come from actual quest/request/free-chest/paid-chest/event rewards and consumption. In opportunistic conveyor sessions the median total consumed is ${fmt(study.describe(boosts).p50)} charges over two hours. Conservation is checked by the reused baseline harness.

## Extra ingredient strategy

Manual selection, ordinary max upgrades, no charges or fairy. Search every available recipe and stopping level, adding 0/1/5/20/100 of the highest-value unlocked ingredient before enhancement. Additions cost actions. This is a bounded strategy search, not proof of a global optimum; conveyor feeding remains unmeasured.

| Highest unlocked tier | Best recipe in search | Extra ingredients | Income versus best unfed highest-tier recipe |
| --- | --- | ---: | ---: |
${feed}

## Action-speed sensitivity

16 seeds per policy, 120-minute horizon. Input intervals are assumptions; there is no gameplay action cooldown in this draft.

| Policy | Median Tia minutes | Reached |
| --- | ---: | ---: |
${sense}

## What stage 4 must resolve

1. Tune real replenishment and opportunity costs together: boost prices/limits, quest throughput, request costs/rewards and event-token tradeoffs. The current paid-chest policy only buys above 100,000 gold; absence of early paid openings is not a safety claim about unlimited purchases.
2. Reconcile middle-game funding time and burst purchases with the input policies. Exact-recipe waiting still has no pity mechanism; do not fix that solely by raising manual prices. Retain early-sale farming as a named policy in the next simulations.
3. Remove/restrict gold conversion only alongside measured collection-income alternatives. The new lower gold scale makes the existing Bank/request amounts obsolete; no automatic migration is approved here.
4. Repeat the candidate pass after resource changes and verify long sessions reaching later tiers. A two-hour run that never reaches a tier says nothing about that tier's typical upgrade interval.

## Artifacts and reproduction

- candidate.json holds recipe arrays, economy inputs, price reference tables and research rules. It is **not a drop-in live config**: the adapter applies effective costs, mastery gates and proposed fairy changes.
- sessions.json / session-summary.json contain 320 primary two-hour runs. sensitivity-sessions.json adds 64 runs. cost-sweep.json records 96 calibration runs with uniform price scales 2/4/6/8; those intentionally omit the final middle-game price ramp.
- recipes.csv contains ${rows.length.toLocaleString('en-US')} recipe/profile/inventory rows. metrics.json contains family bounds, middle purchase gaps, fairy stress and feeding results. source-hashes.json identifies unchanged live input files.
- Run node research/balance/stage-three.cjs --calibrate for the price sweep, then node research/balance/stage-three.cjs for the final candidate, simulations and report. The frozen current-baseline directory is never a destination.

No browser playtest, visual review or game build was performed for this research-only step. No player save, currency, ownership, live source or HTML was changed. Timing, menu navigation and chest overhead retain the documented baseline assumptions; skin exchange, highest-request selection and automatic quest handling are bot policies.
`;
 fs.writeFileSync(path.join(out,'REPORT.md'),doc);
 console.log(JSON.stringify({familyComparisons:metrics.familyComparisons,worstFamilySpread:metrics.worstFamilySpread,incomeDeclines:metrics.incomeDeclines.length,middle:metrics.middlePurchaseGaps.filter(r=>mainNames.includes(r.scenario))},null,2));
};
