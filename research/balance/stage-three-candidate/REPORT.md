# Stage 3 — candidate potion and upgrade curves

Research calculation, 16 October 2026. **Candidate only: gameplay and player saves are unchanged.** This is a measured draft, not a deployment-ready balance approval.

## Main findings

1. **The ordinary family-income target is attainable.** Worst spread is **1.23×**, below 1.25×, across 2,750 comparisons: 25 tiers × 11 luck levels × 5 selling levels × 2 input models. No fairy or consumable is assumed for that bound. 0 backward income steps were found within these profiles.
2. **Tia pacing depends on player policy.** At two actions/second, median unlocks are **64.25 minutes manually / 84.7 minutes on the opportunistic conveyor**. Waiting for one exact ingredient misses the two-hour horizon in all 40 runs. Faster/slower input produces different outcomes; the 60–90 minute benchmark is not satisfied across every input rate.
3. **The 3–5 minute middle-game target is not met overall.** Median gaps are **1.81 minutes manually / 4.16 minutes on the opportunistic conveyor**, with long tails and bursts. Later upgrade tiers that are not reached within two hours have no measured completion time.
4. **Fairy compounding must be addressed together with recipes.** The candidate distributes a multiplier bonus across a whole brew and reduces chance bonuses; original abilities are separately evaluated. These would be visible ability changes requiring matching descriptions during implementation.
5. **Keep this draft out of live gameplay until resource tuning.** Bank conversion, paid chests, requests, missed ingredients and action speed can change progression. Stage 4 must reconcile those sources before prices or save conversion are activated.

## Tia unlock — active minutes

40 seeds per policy; horizon 120 minutes. P10/P50/P90 are conditional on reaching the milestone. Non-completions are censored, not assigned 120-minute unlocks.

| Policy | P10 | P50 | P90 | Reached |
| --- | ---: | ---: | ---: | ---: |
| Manual · earned boosts | 62.16 | 64.25 | 66.24 | 40/40 |
| Conveyor · available ingredients | 80.85 | 84.7 | 88.21 | 40/40 |
| Conveyor · available ingredients + token boosts | 72.38 | 77.27 | 80.69 | 40/40 |
| Conveyor · earned boosts | not reached | not reached | not reached | 0/40 |

The first eight seeds informed calibration; seeds 9–40 extend the sample. This is not independent human validation. The original frozen baseline had median manual/conveyor times of 5.23/21.35 minutes under its exact-recipe policy.

## Middle-game purchase gaps

Time since the preceding material purchase across all three families, selecting purchases that unlock tiers 7–16. This differs from the existing harness's per-family wait metric. Both remain in the artifacts. Rows omit future purchases not reached by the horizon, so this table cannot establish the pace of the entire middle game.

| Policy | P10 min | P50 min | P90 min | Observations |
| --- | ---: | ---: | ---: | --- |
| Manual · earned boosts | 1.12 | 1.81 | 9.01 | 595 purchases in 40/40 runs |
| Conveyor · earned boosts | not reached | not reached | not reached | 0 purchases in 0/40 runs |
| Conveyor · available ingredients | 2.48 | 4.16 | 20.18 | 232 purchases in 40/40 runs |
| Conveyor · available ingredients + token boosts | 2.28 | 3.82 | 16.45 | 340 purchases in 40/40 runs |

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
| 1 | 7 / 35 | 7 / 22 | 6 / 19 |
| 5 | 22 / 487 | 20 / 223 | 23 / 127 |
| 10 | 110 / 2,436 | 102 / 1,138 | 116 / 725 |
| 15 | 496 / 10,987 | 458 / 5,112 | 521 / 3,684 |
| 20 | 2,115 / 46,852 | 1,953 / 21,801 | 2,220 / 17,765 |
| 25 | 8,753 / 193,900 | 7,369 / 86,372 | 9,184 / 83,150 |

## Fairy and finite-boost stress

All 38 fairies are evaluated at levels 1/5/10, every recipe and every stopping level, with zero inventory and finite 5 protection / 10 enhancement / 2 selling charges. The second inventory is a single-brew budget, **not sustainable infinite supply**. Family-specialist fairy bonuses are intentionally outside the ordinary 1.25× bound.

| Ability model | Starting charges P/E/S | Largest income gain versus same unassisted recipe | Where |
| --- | --- | ---: | --- |
| normalized | 0/0/0 | 1.8× | Red-me Lv 10, Life, tier 25, conveyor |
| normalized | 5/10/2 | 1.41× | Blue-Cho Lv 10, Mana, tier 2, manual |
| original | 0/0/0 | 113.23× | Yell-Me Lv 10, Stamina, tier 25, conveyor |
| original | 5/10/2 | 92.75× | Yellow-Cho Lv 10, Stamina, tier 25, conveyor |

Fresh-save session fairies are not auto-equipped; isolated stress is not a simulation of obtaining a max fairy. Session boost budgets come from actual quest/request/free-chest/paid-chest/event rewards and consumption. In opportunistic conveyor sessions the median total consumed is 249 charges over two hours. Conservation is checked by the reused baseline harness.

## Extra ingredient strategy

Manual selection, ordinary max upgrades, no charges or fairy. Search every available recipe and stopping level, adding 0/1/5/20/100 of the highest-value unlocked ingredient before enhancement. Additions cost actions. This is a bounded strategy search, not proof of a global optimum; conveyor feeding remains unmeasured.

| Highest unlocked tier | Best recipe in search | Extra ingredients | Income versus best unfed highest-tier recipe |
| --- | --- | ---: | ---: |
| 1 | Life tier 1, sell Lv 3 | 0 | 1× |
| 7 | Life tier 7, sell Lv 5 | 0 | 1× |
| 13 | Life tier 13, sell Lv 5 | 0 | 1× |
| 19 | Life tier 19, sell Lv 5 | 0 | 1× |
| 25 | Life tier 25, sell Lv 5 | 0 | 1× |

## Action-speed sensitivity

16 seeds per policy, 120-minute horizon. Input intervals are assumptions; there is no gameplay action cooldown in this draft.

| Policy | Median Tia minutes | Reached |
| --- | ---: | ---: |
| Manual 250ms | 32.68 | 16/16 |
| Available conveyor 250ms | 46.89 | 16/16 |
| Manual 1000ms | not reached | 0/16 |
| Available conveyor 1000ms | not reached | 0/16 |

## What stage 4 must resolve

1. Tune real replenishment and opportunity costs together: boost prices/limits, quest throughput, request costs/rewards and event-token tradeoffs. The current paid-chest policy only buys above 100,000 gold; absence of early paid openings is not a safety claim about unlimited purchases.
2. Reconcile middle-game funding time and burst purchases with the input policies. Exact-recipe waiting still has no pity mechanism; do not fix that solely by raising manual prices. Retain early-sale farming as a named policy in the next simulations.
3. Remove/restrict gold conversion only alongside measured collection-income alternatives. The new lower gold scale makes the existing Bank/request amounts obsolete; no automatic migration is approved here.
4. Repeat the candidate pass after resource changes and verify long sessions reaching later tiers. A two-hour run that never reaches a tier says nothing about that tier's typical upgrade interval.

## Artifacts and reproduction

- candidate.json holds recipe arrays, economy inputs, price reference tables and research rules. It is **not a drop-in live config**: the adapter applies effective costs, mastery gates and proposed fairy changes.
- sessions.json / session-summary.json contain 320 primary two-hour runs. sensitivity-sessions.json adds 64 runs. cost-sweep.json records 96 calibration runs with uniform price scales 2/4/6/8; those intentionally omit the final middle-game price ramp.
- recipes.csv contains 34,650 recipe/profile/inventory rows. metrics.json contains family bounds, middle purchase gaps, fairy stress and feeding results. source-hashes.json identifies unchanged live input files.
- Run node research/balance/stage-three.cjs --calibrate for the price sweep, then node research/balance/stage-three.cjs for the final candidate, simulations and report. The frozen current-baseline directory is never a destination.

No browser playtest, visual review or game build was performed for this research-only step. No player save, currency, ownership, live source or HTML was changed. Timing, menu navigation and chest overhead retain the documented baseline assumptions; skin exchange, highest-request selection and automatic quest handling are bot policies.
