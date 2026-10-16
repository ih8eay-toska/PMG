# Stage 4 — resource supply and chest economy candidate

Research only, 16 October 2026. **Live gameplay and player saves are unchanged.** This builds on the stage-three candidate; it is not a drop-in configuration or a completed migration.

## Main findings

1. **Regular skins can be earned without converting gold.** The saving policies buy their first 300-ticket skin at median **104.8 minutes manually / 110 minutes on the conveyor**. Tickets and Miracle Solution remain available in manual mode through a proposed special-reward strip. That strip does not exist in the live UI yet.
2. **The repeated profitable case loop is removed in this candidate.** Ticket cases return **87–89.5%** of their currency cost; ruby cases **77.5–78.82%**, including maximum-fairy and duplicate-skin conversions. New fairies and skins have no assigned currency resale value. Individual openings can still win.
3. **Gold buys a bounded boost supply.** Keep one free hourly opening, plus gold openings with **3 charges of one random boost**, capped at **3 paid openings per 20 active minutes**. Prices rise from 50 to 16,000 gold as material tiers advance. Normal play can earn more boosts from quests and events; paid openings are supplemental.
4. **Gathering and prices need to move together.** Proposed empty-cauldron conveyor gathering is 4× faster; currency drop odds per emitted item are divided by four in that state. Middle material prices increase from the stage-three scale of 10 to 18. Final median purchase gaps are **3.11 minutes manually / 5.37 minutes on the conveyor**. The conveyor still exceeds the 3–5-minute target; long tails and missed tiers remain relevant.
5. **The benchmark is not a promise for every play style.** Saving-policy median Tia times are **63.69 / 76.6 minutes** at two actions/second. Event spending, case openings, exact-ingredient waiting and action speed change this. No human playtest or save conversion was performed.

## Proposed rules to implement together

### Bank and collectibles

- Remove all gold exchanges in both directions. Keep **10 Pushcat tickets ↔ 1 ruby** in whole bundles. Exchange preserves ticket-equivalent value; it does not generate currency by rounding.
- Regular costumes stay 300 tickets. Event costumes stay excluded from ordinary purchases and case pools. A duplicate case skin becomes 300 tickets; fairy rolls become 5 tickets only when every fairy is already level 10.
- Keep 15-minute events and the five-minute redemption gap. Event skins cost 50 Miracle Solution; one Solution buys the existing bundle of one protection, one enhancement and one selling charge.

### Visitors and requests

- Delivered visitor orders grant **2 tickets plus 1–3 charges of one random boost** after the existing 30-second return. They no longer grant an automatic ruby. Offer and preparation deadlines remain one minute; the existing 20–60-second next-visitor wait stays unchanged. Failed/unserved orders do not receive rewards.
- Requests keep their existing duration, likeability, bonus odds, fairy identities and fairy odds. Costs by required visitor level 1–10 become **150 / 400 / 1,200 / 3,000 / 8,000 / 20,000 / 50,000 / 120,000 / 180,000 / 250,000 gold**. Level-one coin rewards become 125 gold with their existing 70% chance. Expected direct gold change is −62.5 per one-minute request, before duration reductions; this route rewards likeability/fairy opportunities rather than printing gold.
- An active request still blocks visitor arrivals. Its collection value must be weighed against orders forgone; requests.csv lists all 35 request rows. Reduced request durations change the rate of the negative direct gold expectation, not its sign.

### Gold boost chest

One free opening is available on a wall-clock hourly cooldown. Unclaimed hours do not stack multiple claims. Paid openings do not reset the free timer. Both versions give three charges of **one** equally likely boost; the expected reward is one charge of each type, but a particular opening does not give that bundle.

| Highest unlocked material tier | Gold per paid opening |
| --- | ---: |
| 1–4 | 50 |
| 5–9 | 250 |
| 10–14 | 1,000 |
| 15–19 | 4,000 |
| 20–25 | 16,000 |

The paid quota follows fixed windows of total active play, not event index or device wall time. It allows nine paid openings per full active hour, or 27 charges. A player can open six near a window boundary—three on either side. Free claims do not consume paid slots. The quota must be saved; closing/reopening the game must not refresh it. Reduced motion shortens the reveal without removing the quota.

The first high-price draft slowed Tia unnecessarily. The selected lower price table makes charges an optional purchase while keeping their long-run volume bounded. It is not a proof that every boost type repays its gold price in every recipe or state.

### Gathering and upgrade prices

Normal conveyor speed while a potion exists stays tied to Material Emission. When empty, gathering speed becomes four times the original base. At that moment ticket/Solution probabilities are divided by four, preserving their nominal spawn rate per active time at the same emission level. Catch rates can still change with visibility and reveal interruptions. Manual ingredient selection remains immediate, with a separate strip for special drops that continues to move at the normal configured rates.

Stage-three recipe values, ordinary upgrade effects, proposed fairy adjustments and same-family mastery gates are retained. The middle price factor changes from 10 to 18 starting at owned tier 7; early prices retain the 8.5 factor. See material-prices.csv for actual gold costs. Tier gates remain 5→2, 10→5, 15→8, 20→12, 25→16 earlier same-family mastered recipes. Tia still needs 20 unique stars.

The gathering sweeps show why changing a price scalar alone is insufficient under these policies. The chosen gathering change is a proposal with a visible effect on the game, not a hidden correction to original-game data. The ordinary-family analytical income bound is still **1.23×** across 2,750 tier/upgrade/input comparisons, without consumables or fairies. The conveyor formula uses the new empty gathering rate, equal family tiers and a chosen exact recipe; it excludes visible stock, missed catches and other actions.

## Case pools and expected currency return

The ticket case costs 10 tickets: **6 tickets 60%; 10 tickets 15%; 20 tickets 5%; 1 ruby 12%; 3 rubies 2%; 8 rubies 1%; one fairy 5%.** Ticket outcomes occupy 80% of the pool; the eight-ruby jackpot has a 1% chance.

The ruby case costs 30 rubies: **15 rubies 60%; 45 rubies 15%; 150 rubies 5%; one fairy 19%; one eligible current-character skin 1%.** Eligibility still excludes event/free/default skins. Owned outcomes convert to 300 tickets. The 1% is per opening; no pity/guarantee is added. After 100 independent openings the chance of at least one skin outcome is about 63.4%, before accounting for duplicates.

| Case | Fairy collection | Eligible skins | Expected currency returned |
| --- | --- | --- | ---: |
| 10-ticket | Not all maxed | None owned | 87% |
| 30-ruby | Not all maxed | None owned | 77.5% |
| 10-ticket | Not all maxed | All owned | 87% |
| 30-ruby | Not all maxed | All owned | 78.5% |
| 10-ticket | All maxed | None owned | 89.5% |
| 30-ruby | All maxed | None owned | 77.82% |
| 10-ticket | All maxed | All owned | 89.5% |
| 30-ruby | All maxed | All owned | 78.82% |

These are exact weighted expectations from the isolated game engine at Bank rates, not gold conversion rates. Partial ownership lies between the listed extremes. Let V = tickets + 10×rubies. Bank exchange preserves V, each ticket case has expected V loss at least 1.05 tickets, and each ruby case at least 63.55 tickets. Mixing those exchanges and cases cannot create a positive expected currency loop under the proposed rules. Outside rewards from active play are separate income. Fairies and new skins can have player utility that is not included in these percentages.

## Fresh-save simulation results

40 seeds per policy, three active hours each. Tia/wardrobe cells show conditional median minutes and number reached. A regular-skin milestone means a guaranteed wardrobe purchase, not a case skin. Missing milestones are censored at 180 minutes; they are never assigned a fabricated completion time.

| Policy | Tia minutes (reached) | Wardrobe skin minutes (reached) | Median middle purchase gap |
| --- | ---: | ---: | ---: |
| Manual · save for skins | 63.69 (40/40) | 104.8 (40/40) | 3.11 |
| Conveyor · save for skins | 76.6 (40/40) | 110 (40/40) | 5.37 |
| Manual · event boosts | 59.16 (40/40) | 104.03 (40/40) | 2.87 |
| Conveyor · event boosts | 70.27 (40/40) | 109.18 (40/40) | 4.81 |
| Manual · buy boost stock | 63.63 (40/40) | 103.47 (40/40) | 3.13 |
| Conveyor · buy boost stock | 77.35 (40/40) | 110.48 (40/40) | 5.4 |
| Conveyor · open cases | 89.99 (40/40) | not reached (0/40) | 5.85 |
| Manual · traveler requests | 63.6 (40/40) | 112.49 (40/40) | 3.13 |
| Conveyor · exact recipe | 116.7 (40/40) | 124.32 (40/40) | 6.07 |
| Conveyor · ruby cases | 77.01 (40/40) | not reached (0/40) | 5.43 |

Saving-policy percentile detail:

| Policy | Tia P10 / P50 / P90 | Wardrobe P10 / P50 / P90 | Middle gaps P10 / P50 / P90 |
| --- | ---: | ---: | ---: |
| Manual · save for skins | 61.88 / 63.69 / 65.72 | 99.1 / 104.8 / 107.79 | 2.25 / 3.11 / 5.07 |
| Conveyor · save for skins | 74.66 / 76.6 / 78.75 | 105.05 / 110 / 116.95 | 3.04 / 5.37 / 10.63 |

The case-opening policies obtained 0 new case skins across 0/80 runs. They spend currencies instead of making a guaranteed wardrobe purchase. The first prioritizes ticket cases and recycles spare rubies into tickets; the second saves tickets into rubies and opens ruby cases. Missing wardrobe purchases do not establish the number of cosmetics obtained. Gambling is an optional collection route, not a guaranteed substitute for the wardrobe.

| Case policy | Median paid case openings | Median ruby-case openings | New case skins |
| --- | ---: | ---: | --- |
| Conveyor · open cases | 327 | 0 | 0 in 0/40 runs |
| Conveyor · ruby cases | 2 | 2 | 0 in 0/40 runs |

## Measured replenishment

Median incoming amounts per active hour in saving policies; not all incoming stock must be consumed. Requests and paid/event-spending policies have their own rows in resource-supply.csv. Median totals are calculated per run before summarizing.

| Policy | Dropped tickets/h | Quest tickets/h | Miracle Solution/h | Quest boost charges/h |
| --- | ---: | ---: | ---: | ---: |
| Manual · save for skins | 79 | 98.67 | 61 | 99.67 |
| Conveyor · save for skins | 73.33 | 92 | 55.67 | 92.67 |

Every completed session balances starting inventory + gross income − gross expense = final inventory for gold, tickets, rubies, Solution and all three boosts. Chest costs and rewards are recorded separately, including same-currency outcomes. The greatest paid count observed in one window was 3; the adapter rejects further paid openings until the next window. Sessions record consumption and opportunity costs rather than assuming permanent full boosts. Free hourly claims, event redemption, order handover and chest reveals consume policy time/actions.

## Established progression probes

12 seeds at each owned-tier/input combination, two active hours each. Each synthetic state starts with earlier recipes mastered and matching ordinary upgrades, but zero currencies and no fairies. These are local progression probes, not fresh-save arrival times. Old mastered recipes use the no-consumable optimal early-sale target; unmastered recipes pursue their maximum. Collected fairies are not auto-equipped except in the case-opening policy.

| Starting state | Runs | Median middle purchase gap | Median delivered orders | Median paid boost openings |
| --- | ---: | ---: | ---: | ---: |
| Tier 10 · manual | 12 | 3.16 | 98 | 18 |
| Tier 10 · conveyor | 12 | 5.71 | 86 | 18 |
| Tier 20 · manual | 12 | not reached | 98 | 18 |
| Tier 20 · conveyor | 12 | not reached | 76 | 18 |

Tier-20 probes are outside the defined tier-7–16 middle-gap range. Their missing middle gap is expected, not a failed upgrade. Raw purchase times, endpoints and remaining stock are in phase-sessions.json.

## Simulation correction and limits

The earlier harness moved the conveyor in 250 ms jumps. Its spawn loop intentionally skips emissions that enter more than 58 pixels past the edge in one update. At high speed, coarse jumps can therefore drop items that would be emitted under normal frame updates. This pass advances conveyor physics in **50 ms steps** while retaining a 250 ms quest clock and 500 ms player actions. At the selected maximum movement rate a substep is under 58 pixels. This corrects the sampling artifact without changing live source.

Earlier stage-one/three evidence remains frozen and is approximate with respect to that artifact. Differences from it also include policies and new rules; they must not be attributed solely to the economy. Preliminary calibration/supply-sweep artifacts used earlier draft settings and, in some runs, coarse conveyor steps. The final sessions.json, phase-sessions.json, assumptions.json and candidate.json are the authoritative outputs for this pass. gather-sweep.json and final-calibration.json use the corrected conveyor substeps.

The first eight seeds informed tuning; the final sample extends through seed 40. No human timing, browser presentation, offline-return session or save migration is validated here. Action speed is assumed, not capped by this model; stage three already showed faster/slower inputs can move Tia outside 60–90 minutes. Purchase-gap percentiles contain observed purchases only and can miss later uncompleted tiers. A best no-charge stopping policy does not optimize every temporary boost inventory. No claim of a global optimal player strategy is made.

## Implementation handoff

1. Load recipe/cost tables and resource rules through the shared runtime config. Put Bank pair validation, dynamic chest price and paid quotas in core methods used by the UI. Avoid relying only on disabled buttons. Implement the proposed special-drop strip in manual mode and the new empty-gathering rate.
2. Update reward descriptions, odds, price bands, visible paid quota and countdowns. Keep the free wall-clock cooldown separate from active paid windows. Remove gold exchange options. Match fairy/ordinary upgrade descriptions to the stage-three proposal.
3. Preserve pending rewards and existing ownership during migration: old promised 1-ruby quest rewards and 1–5 rolled boost amounts must not be zeroed by new defaults. Snapshot pending request costs/results and chest results, including old probabilities. Freeze rewards before the reveal and do not reroll after reload.
4. Persist/validate paid-window state, retain existing total active play, and preserve old stars, Tia, costumes and fairy levels. Update validation to accept zero automatic quest-ruby reward. No gold reset or conversion is approved by this report. Calculate legacy purchasing-power examples before any conversion decision.
5. Recheck the 3–5-minute benchmark and presentation after integration. The modeled candidate remains subject to its stated policy/timing limits. Source-hashes.json confirms the live files used by this calculation stayed unchanged; research-hashes.json records the calculation inputs.

## Reproduce

Run node research/balance/stage-four.cjs for 400 fresh-save sessions, 48 phase probes, exact case returns and this report. All writes stay inside stage-four-candidate. The engine is isolated from the live game and never reads browser localStorage. --calibrate runs an eight-seed draft; --gather-sweep compares empty-gathering rates; --supply-sweep compares uniform flow changes. Those commands replace only their named research outputs and the candidate snapshot, not frozen previous stages or gameplay files.
