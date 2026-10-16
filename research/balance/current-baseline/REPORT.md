# Current-game baseline — stage 1

Research only. No live values or player saves were changed.

## Read first

This measures the current game, not the proposed mixed economy. Times below are seeded bot outcomes under stated input assumptions, not human playtest measurements or guarantees. Missing milestones are right-censored at the run horizon; reported percentiles use successful runs only.

## Main findings

1. **Input mode changes progression substantially.** At two actions/second, the mastery-first bot unlocks Tia at a median 5.2 active minutes manually versus 21.4 on the conveyor. All 40 seeds reach Tia in both groups. These are policy-conditioned measurements, not a promised player experience.
2. **Collection access differs by mode.** Manual-only play has no ticket or Miracle Solution drops. The Bank still enables a regular skin at median 7.7 minutes. Conveyor play reaches a first event skin within two hours in 24/40 runs; the median among successful runs is 106.9 minutes. Failed-to-reach runs are not assigned a fabricated completion time.
3. **Economy scales are disconnected.** All material upgrades cost about 25.4 trillion gold, while maximum ordinary-shop tier-25 sales are roughly 120–942 quadrillion. Regular skins through the Bank cost 3 million gold and paid boost chests cost 10,000.
4. **There is a late-state positive-return loop.** Once all fairies are maxed, the ticket case converts fairy outcomes into tickets and returns 101% of its cost in Bank-equivalent currencies on average. This is a long-run expectation; individual openings can lose currency. New skin/fairy values are excluded.
5. **Boost replenishment has a time cost.** Normal chest reveals take 4.2 seconds, but reduced motion removes that delay and closing the dialog can finish the animation early. Compare the paid-chest and reduced-motion runs before interpreting boost abundance. Chasing a low stock before every enhancement can spend most of a session opening chests.

## Reproduce

Run `node research/balance/baseline-current.cjs`. Outputs overwrite only `research/balance/current-baseline/`. `source-hashes.json` identifies the exact sources used; `assumptions.json` records all run settings.

## Milestones

| Policy | First material upgrade | Tia | All material tiers | Regular skin | Event skin |
|---|---|---|---|---|---|
| Manual · earned boosts | 0.275 min (40/40 reached) | 5.233 min (40/40 reached) | 21.28 min (40/40 reached) | 7.725 min (40/40 reached) | not reached (40/40) |
| Conveyor · earned boosts | 0.3333 min (40/40 reached) | 21.35 min (40/40 reached) | not reached (40/40) | 41.35 min (40/40 reached) | 106.9 min (24/40 reached) |
| Manual · paid boost chests | 0.275 min (40/40 reached) | 5.233 min (40/40 reached) | not reached (40/40) | 16.34 min (40/40 reached) | not reached (40/40) |
| Conveyor · paid boost chests | 0.3333 min (40/40 reached) | 21.35 min (40/40 reached) | not reached (40/40) | 51.92 min (40/40 reached) | 102 min (26/40 reached) |
| Conveyor · spend event tokens on boosts | 0.3167 min (40/40 reached) | 15.83 min (40/40 reached) | 111.5 min (10/40 reached) | 30.55 min (40/40 reached) | not reached (40/40) |
| Conveyor · traveler requests | 0.3333 min (40/40 reached) | 22.93 min (40/40 reached) | not reached (40/40) | 43.68 min (40/40 reached) | 103.3 min (28/40 reached) |
| manual · paid chests, reduced motion | 0.1875 min (16/16 reached) | 5.088 min (16/16 reached) | 18.25 min (16/16 reached) | 7.488 min (16/16 reached) | not reached (16/16) |
| conveyor · paid chests, reduced motion | 0.3042 min (16/16 reached) | 22.34 min (16/16 reached) | 91.19 min (16/16 reached) | 35.11 min (16/16 reached) | 92.81 min (14/16 reached) |

P10/P50/P90, non-completion counts, income, boosts and upgrade waits are in `session-summary.json`; individual seeds are in `sessions.json`. Resource income by source is in `resource-supply.csv`; each session verifies boost and event-token conservation. Upgrade waits include the policy’s mastery/quest detours and are not isolated upgrade payback estimates.

## Current terminal brewing, maximum ordinary shop upgrades

| Family | Best selling level, no charges | Maximum completion | Maximum sale | Gold/action |
|---|---:|---:|---:|---:|
| Life | 5 | 0.6455% | 941,500,000,000,000,000 | 2,540,000,000,000,000 |
| Mana | 6 | 6.928% | 120,300,000,000,000,000 | 2,110,000,000,000,000 |
| Stamina | 25 | 40.92% | 150,200,000,000,000,000 | 3,497,000,000,000,000 |

`recipe-baseline.csv` covers all 75 recipes, base/middle/maximum ordinary shop upgrades and each collected fairy at levels 1/5/10 with maximum shop upgrades. Each profile compares every fixed selling target with no charges and a finite 5-protection/10-enhancement/2-selling inventory. Fixed inventories are isolated-brew diagnostics, not free perpetual refills. The finite solver accounts for enhancement-charge depletion and protection/fairy retries. It does not prove an optimal adaptive selling strategy.

## Currency and reward connections

- All material upgrades: 25,420,000,000,000 gold. A regular skin through the Bank: 3,000,000 gold. A Ruby case: 2,000,000 gold.
- The paid boost chest remains 10,000 gold with no per-cycle purchase limit. Gold buys renewable protection, enhancement and selling charges.
- Case returns are in `economy.json`, including all-fairies-maxed and all-case-skins-owned states. Bank-equivalent values count liquid currencies only; fairies and new skins are not assigned invented prices.
- Conveyor item probability is 1/101 for tickets and an additional 1/101 for Miracle Solution during events. Manual selection produces neither.
- Event skins rotate every 20 active minutes: a complete 11-event loop is 220 active minutes. A 50-token balance does not guarantee the desired event is still open.

## Session policies and timing

1. Every run starts from a fresh in-memory `PotionGame`. Start the conveyor with a 456-pixel viewport, advance it every 250 ms, and allow one player action every 500 ms. Sensitivity runs use 250 ms and 1,000 ms actions. There is no new delay added to the game.
2. Catch visible special drops with 90% capture probability and accept visitor offers promptly. Complete accepted orders first, using actual random targets and deadlines; wait the actual 30 seconds for rewards. Dismiss completed/failed visitors promptly. Quest delivery sacrifices the potion sale, recorded as `questGoldForgone`.
3. Otherwise pursue the lowest-tier unmastered recipe, targeting maximum enhancement; when everything unlocked is mastered, brew the highest-base unlocked recipe. Buy the cheapest affordable permanent upgrade, consuming an action. Additional ingredient stuffing and globally optimal adaptive sales are not simulated.
4. Redeem a first regular skin through the current Bank as soon as 3 million gold is available. Reserve Miracle Solution for the first available event skin, except the explicit event-boost policy, which spends tokens when a boost stock is below five. Free hourly chests are claimed when ready. Normal chest reveals occupy 4.2 seconds plus one action; reduced-motion runs use zero reveal time. Paid-chest policies replenish low stocks when no upgrade is affordable and at least 100,000 gold remains before opening.
5. The request policy starts the highest unlocked affordable request from the highest-level visitor at most once per ten active minutes after three deliveries. Requests use actual costs, frozen outcomes and completion times and block visitor arrivals. Other policies concentrate on visitor orders. Newly acquired fairies remain unequipped in session runs; their effects are measured separately in the analytical matrix.

## Limitations and decisions for stage 2

Action times, capture accuracy, spending priorities and prompt visitor handling are explicit assumptions, not measured human behavior. No gold/hour claim should be separated from its policy. Analytical conveyor rates use equal material unlocks across families, phase-averaged event probabilities and one-second empty-cauldron emissions. They exclude visible starting inventory, misses and other activities. Finite-inventory rates require refill time; next-upgrade affordability is cost/current income, not incremental return-on-investment. Large gold balances have floating-point precision limits. Menu navigation and multi-click exchanges are simplified into policy actions. Core rules run directly; Bank rates are read from the app because the exchange currently lives in UI code. Case openings during long sessions, fairy equipment choices, extra ingredients and background/offline request settlement are not optimized. No actual browser or save storage is accessed.

Historical reports include disabled ruby upgrade profiles and older reward systems; they remain historical evidence. Use this directory for current-value comparisons. Choose pacing targets and a legacy-gold migration policy in later stages; this report does not authorize or apply those changes.
