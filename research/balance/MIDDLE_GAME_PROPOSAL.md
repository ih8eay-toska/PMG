# Middle-game balance draft: tiers 7–16

15 October 2026. This extends the earlier tier-1–6 proposal. No gameplay values changed. Fairy abilities and their builds remain outside balance targets; the 99% final ceiling is included.

## Result

A combined tier-1–16 draft meets the approved 2× family-income bound without consumables or fairies for every permanent-upgrade state checked, with no backward income steps on unlocking any tier in this range. The tier-6-to-7 Stamina progression problem is resolved in the combined draft.

The comparison uses best fixed stopping level by expected gold/expected actions, including early sale, free chosen starting ingredients, and no extra ingredient additions. Every failure attempt counts as an action; selling counts only when a brew survives. There is no random simulation.

## Proposed middle-tier values

Life is unchanged. Mana requires some reductions at tiers 9–13, plus an increase at tier 16. Stamina gets larger multipliers and modest chance increases at tiers 15–16. Base values and maximum levels are unchanged.

The numbers below are candidate game-balance overrides, not corrections to the wiki. Preserve the original source figures when implementing an eventual patch. Three-decimal Stamina multipliers provide more room to satisfy the narrow cross-profile range.


| Tier | Potion | Current multipliers | Draft multipliers | Chance change |
| --- | --- | --- | --- | --- |
| 7 | Normal SP potion | 1.55 at every step | 2.163 at every step | Unchanged |
| 8 | Carbonated lemon potion | 1.65 at every step | 2.128 at every step | Unchanged |
| 9 | Large MP potion | 4.29 / 5 / 6 / 7.5 | 4.22 / 4.92 / 5.9 / 7.37 | Unchanged |
| 9 | Large SP potion | 1.7 at every step | 2.186 at every step | Unchanged |
| 10 | Blessing MP potion | 5 / 5.83 / 7 / 8.75 | 4.82 / 5.62 / 6.75 / 8.44 | Unchanged |
| 10 | Blessing SP potion | 1.75 at every step | 2.201 at every step | Unchanged |
| 11 | Grape potion | 5.71 / 6.67 / 8 / 10 | 5.08 / 5.94 / 7.12 / 8.9 | Unchanged |
| 11 | Potion of Riddle | 1.8 at every step | 2.141 at every step | Unchanged |
| 12 | Elixir of Wisdom | 7.14 / 8.33 / 10 / 12.5 | 5.35 / 6.25 / 7.5 / 9.38 | Unchanged |
| 12 | Elixir of Energy | 1.9 at every step | 2.091 at every step | Unchanged |
| 13 | Shining MP potion | 8.57 / 10 / 12 / 15 | 8.03 / 9.37 / 11.24 / 14.06 | Unchanged |
| 13 | Shining SP potion | 1.95 at every step | 2.307 at every step | Unchanged |
| 14 | Advanced SP potion | 2 at every step | 2.367 at every step | Unchanged |
| 15 | Electric resistance potion | 2.05 at every step | 2.335 at every step | 75% → 76% each step |
| 16 | Enriched MP potion | 15.71 / 18.33 / 22 / 27.5 | 16.95 / 19.78 / 23.74 / 29.67 | Unchanged |
| 16 | Enriched SP potion | 2.15 at every step | 2.418 at every step | 75% → 79% each step |

## Baseline family earnings spread

The current column is the worst of the original three upgrade profiles. The draft column is the worst across every tested partial-upgrade state, a stricter check.


| Tier | Current worst of three profiles | Draft worst of all tested states |
| --- | --- | --- |
| 7 | 14.76× | 1.9984× |
| 8 | 11.85× | 1.9960× |
| 9 | 15.98× | 1.9998× |
| 10 | 18.15× | 1.9974× |
| 11 | 18.01× | 1.9943× |
| 12 | 18.12× | 1.9989× |
| 13 | 19.44× | 1.9947× |
| 14 | 17.82× | 1.9935× |
| 15 | 14.39× | 1.9911× |
| 16 | 16.41× | 1.9996× |

## Partial-upgrade coverage and an early-draft correction

Checked 11 normal luck levels × 11 ruby fortune levels × 15 distinct sale multipliers = 1,815 distinct permanent states per tier. The 15 sale multipliers cover every combination of normal selling upgrades and ruby value upgrades: their additive effects depend on their combined level. Across 16 tiers, this gives 29,040 tier/state comparisons; each includes all three families and every fixed stopping level.

The first early proposal only checked three profiles. Exhaustive partial states exposed a tier-3 spread of about 2.059×. The revised Blueberry potion multiplier sequence is 1.39 / 1.59 / 1.86 / 2.23 instead of the first draft's 1.38 / 1.57 / 1.84 / 2.21. With that amendment, all tier-1–16 baseline states pass. early-candidates-revised.json supersedes the original early candidate JSON for the combined draft; the original report remains historical.

Assertions also confirm no decline in expected gold/action from tier 1 through 16 within each family in any tested state. This does not assess unlock-cost payback, time, collection RNG, quests, achievements or extra-ingredient strategies.

## Finite consumables, checked separately

Fixed starting inventory is 5 shields, 10 enhancement charges, and 2 sale charges per isolated brew; it is not freely refilled. The table shows the worst family spread across the three main upgrade profiles. The no-consumable 2× approval does not impose that same bound here.


| Tier | Draft fixed-inventory spread |
| --- | --- |
| 7 | 4.24× |
| 8 | 3.20× |
| 9 | 2.57× |
| 10 | 2.85× |
| 11 | 2.32× |
| 12 | 1.87× |
| 13 | 1.50× |
| 14 | 1.81× |
| 15 | 2.79× |
| 16 | 5.72× |

## Deployment boundary and remaining work

Do not apply this isolated draft yet. Tier 16 leads into untouched tier 17, so the late-game reward curve must be checked next. Higher base success in the new tier-16 Stamina recipe also makes preserving sensible next-tier risk progression important.

Some proposed Mana reductions are substantial because four multipliers compound. For example, approximately 25% smaller multipliers at every step can reduce a fully enhanced payout by roughly 68%; this is not a small cosmetic adjustment. These reductions require player approval after the full curve is available. Existing saved active potions and records must be handled explicitly when a gameplay patch is eventually implemented.

Stamina's per-step multiplier sometimes decreases on a higher tier while its maximum level increases. The validated progression constraint is nondecreasing gold/action, not monotone individual multiplier values. Completion odds, total payout, resource requirements and intermediate selling decisions still deserve a final review.

The current search chooses small scalar changes to each Mana sequence and a constant Stamina multiplier; it allows Stamina chance increases in one-percentage-point steps only when the initial search fails. It checks a bounded grid, so failure of the initial search is not a proof that every conceivable multiplier sequence is impossible. Some passing candidates sit close to the 2× bound; all actual rounded values are checked.

## Reproduction

Run draft_middle.py with calculate.py, inputs.json and the original early-candidates.json beside it to reproduce the middle search. Then run check_partial.py with early-candidates-revised.json and middle-candidates.json to verify the combined tier-1–16 curve. Calculation snapshots describe proposed values only; they do not modify game-data.json or the built HTML.

## Next task

Extend the draft through tiers 17–25. Check tier-16-to-17 continuity, the same full permanent-upgrade state grid, separate fixed-consumable outcomes, and whether the intended jackpot/steady/long-run identities still hold. Present the complete proposal for approval before editing gameplay.
