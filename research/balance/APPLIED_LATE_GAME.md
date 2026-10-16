# Applied late-game balance — tiers 13–25

16 October 2026. Implemented from the live early/middle curve recorded in
`applied-candidates.json`, including Blueberry `[1.38, 1.57, 1.84, 2.30]`.
The alternative `MIDDLE_GAME_PROPOSAL.md` and its tier-7–16 candidates were
not applied. All tiers 1–12 remain exactly as previously shipped.

## Scope and tradeoff

30 late recipes change: 24 receive multiplier increases and 20 receive success
chance increases (some receive both). Every changed value is a buff relative
to the previous live recipe. The exact original and applied arrays, including
unchanged steps, are in `applied-late-candidates.json`.

The search first tries original chances and payout-only scaling. Under this
policy, tiers 15 onward need chance adjustments to satisfy the family-income
limit across permanent upgrades while keeping maximum enhancement worthwhile.
Stamina chances increase at tiers 15–25; Life's lowest chances increase at
tiers 17–25. Mana chances stay unchanged. This is a personal balance override,
not a correction to the original game's wiki figures.

| Material tier | Life success chances, in enhancement order | Stamina chance per step |
| --- | --- | --- |
| 13 | 70%, 50%, 35%, 20% | 75% |
| 14 | 70%, 50%, 35%, 20% | 75% |
| 15 | 65%, 40%, 35%, 20% | 77% |
| 16 | 55%, 40%, 25%, 10% | 79% |
| 17 | 50%, 30%, 15%, 15% | 81% |
| 18 | 45%, 20%, 19%, 19% | 82% |
| 19 | 40%, 20%, 20%, 20% | 83% |
| 20 | 30%, 21%, 21%, 21% | 84% |
| 21 | 25%, 17%, 17%, 17% | 82% |
| 22 | 20%, 18%, 18%, 18% | 83% |
| 23 | 18%, 18%, 18%, 18% | 84% |
| 24 | 18%, 18%, 18%, 18% | 85% |
| 25 | 18%, 18%, 18%, 18% | 86% |

These are base chances, before upgrades/charges/fairies and the existing 99%
final ceiling. Individual chance and multiplier values need not rise at each
tier: extra Stamina steps and Mana's fifth enhancement at tier 21 change the
whole-brew comparison. The enforced progression measure is gold per action.

Life retains short, risky jackpot paths; Mana uses five/six total levels;
Stamina keeps its long ladders through level 25. With no upgrades or charges,
tier-25 maximum completion probabilities are approximately 0.105%, 2.52%, and
2.68%, respectively. Maximum enhancement remains the best fixed stopping
target in every late baseline state; this does not add a new optimal early-sale
strategy.

## Verified baseline

For every tier 1–25, check all 6,655 combinations of normal luck 0–10, normal
selling 0–4, ruby fortune 0–10, and ruby value 0–10: 166,375 tier/state checks.
Every fixed selling level, including immediate sale, is considered. Use actual
99% capped chances, sequential multiplications, whole-gold sales, one starting
collection, attempted enhancements, and a sale action only on surviving brews.
Failures restart as separate independent brews; expected gold / expected
actions is the long-run action-efficiency measure.

- Worst family earnings spread, all tiers: **1.998871339×**.
- Worst family spread in tiers 13–25: **1.979995850×**.
- Minimum adjacent-tier income ratio, all tiers: **1.476190476×**.
- Minimum ratio over the late section including 12→13: **2.499024312×**.
- Minimum Stamina 12→13 ratio: **3.423864509×**, replacing the previous
  approximately 0.348495043× regression.

`source/check-balance.py` independently checks exact applied tables, untouched
fields, all upgrade combinations, every stopping level, and every adjacent
unlock. `source/check-late-balance.cjs` repeats the full grid through actual
`PotionGame.next`, `enhance`, and `sellValue` methods, checks maximum late
targets, cross-checks 18 terminal report outcomes against actual shield retry,
boost depletion and sale transitions, and checks finite/saveable values with every collected fairy at level
10 (equipping supported effects). The largest tested fairy-assisted sale is
about **3.781686e19**, well below the existing 1e300 limit.

## Consumables, economy and numerical limits

`late-outcomes.csv` records 468 before/after best-target outcomes: 13 tiers ×
three families × three upgrade profiles × two inventory modes × two phases.
`late-outcomes-summary.json` includes terminal outcomes and maximum spreads.
Finite mode starts an isolated brew with five shields, ten enhancement charges,
and two sale charges. Shields retry failed steps, enhancement charges are spent
on attempts, and a surviving sale consumes one sale charge. Inventory is not
refilled for free. The report includes expected resource use.

The finite-inventory family spread reaches **13.236825704×** at tier 25 with
maximum permanent upgrades. This diagnostic is outside the approved
no-consumable 2× constraint. Fairy abilities remain unchanged and intentionally
unbalanced. Neither diagnostic claims a balanced resource-acquisition economy.

Conveyor waits, extra ingredients, upgrade payback, quest/achievement value,
adaptive selling after charge depletion, and player enjoyment are not modeled.
Large late payouts exceed JavaScript's MAX_SAFE_INTEGER: existing floating-point
currency remains finite/saveable but cannot guarantee single-gold precision at
that scale. No currency representation or cap change is included.

## Saves and reproducibility

Save schema 10 and `pmg-offline-v1` remain unchanged. Existing balances, current
potion value/level, records, achievements, costumes, and timers are preserved.
Future enhancement steps use the new multiplier/chance tables; past steps and
statistics are not recalculated. A previously maxed potion retains its saved
value. Recipe notes, the Potion book notice and Sources label the overrides.

Run:

```
python source/check-balance.py
node source/check-late-balance.cjs
npm test
python research/balance/report_late.py OUTPUT_DIRECTORY
python research/balance/draft_late.py OUTPUT_DIRECTORY
```

The report uses the Python standard library. The research search requires NumPy;
the offline game needs neither Python nor NumPy. Search reconstruction uses
historical `inputs.json` plus the exact applied early/middle arrays, so it remains
reproducible after deployment. Its candidate arrays were reproduced and matched
the applied arrays numerically before release.

Search policy: buff only, preserve within-recipe multiplier proportions as far
as three-decimal rounding allows, keep Mana chances, try Life chance floors and
constant Stamina chances in one-percentage-point increments, and enforce a
1.98× search bound for margin below 2×. Choose the smallest summed mean chance
increase within that restricted grid, then the smallest log payout increase.
Difference constraints enforce simultaneous family limits and previous-tier
income. This is a reproducible feasible curve, not proof of global minimum
changes among arbitrary recipe shapes. Validation uses the actual rounded
tables and sale rounding across the full upgrade grid.
