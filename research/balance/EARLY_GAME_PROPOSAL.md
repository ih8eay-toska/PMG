# Early-game balance draft: tiers 1–6

15 October 2026. Design target approved: strongest family at most twice weakest in expected gold per action at equivalent tier and upgrades, without consumables or fairies. Current 99% ceiling included. This is a numerical proposal, not an applied patch.

## Proposed scope

Buff seven Mana/Stamina recipes at tiers 3–6. Leave base values, chances, maximum levels, Life multipliers, tiers 1–2, fairy abilities, saves and upgrade costs unchanged. Do not increase failure probability to meet the income target. Keep constant per-step Stamina multipliers nondecreasing across this early batch.

The draft searches for small upward multiplier adjustments that satisfy the range in all three tested profiles: no upgrades, normal shop maximum, and permanent shop/ruby maximum. It rounds multipliers to two decimals and checks the actual rounded candidate. This search finds a feasible early draft, not a globally optimal balancing solution. Partial upgrade states are not yet exhaustively checked.

## Proposed multipliers


| Potion | Tier | Current step multipliers | Proposed step multipliers |
| --- | --- | --- | --- |
| Blueberry potion | 3 | 1.38 → 1.57 → 1.83 → 2.2 | 1.38 → 1.57 → 1.84 → 2.21 |
| Orange potion | 3 | 1.3 → 1.3 | 1.84 → 1.84 |
| Small MP potion | 4 | 1.5 → 1.71 → 2 → 2.4 | 1.62 → 1.85 → 2.17 → 2.6 |
| Small SP potion | 4 | 1.4 → 1.4 → 1.4 | 2.04 → 2.04 → 2.04 |
| Mineral potion | 5 | 2 → 2.33 → 2.8 → 3.5 | 2.04 → 2.37 → 2.85 → 3.57 |
| Vitamin potion | 5 | 1.45 → 1.45 → 1.45 → 1.45 | 2.08 → 2.08 → 2.08 → 2.08 |
| Home SP potion | 6 | 1.5 → 1.5 → 1.5 → 1.5 → 1.5 | 2.08 → 2.08 → 2.08 → 2.08 → 2.08 |

## Earnings spread, no consumables or fairies

Each cell is current → proposed strongest/weakest gold-per-action ratio. Every stopping level is considered, including immediate sale.


| Tier | No upgrades | Normal shop max | Shop + ruby max |
| --- | --- | --- | --- |
| 1 | 1.00× → 1.00× | 1.00× → 1.00× | 1.00× → 1.00× |
| 2 | 1.00× → 1.00× | 1.09× → 1.09× | 1.30× → 1.30× |
| 3 | 1.65× → 1.65× | 2.42× → 1.98× | 3.16× → 1.99× |
| 4 | 2.93× → 1.99× | 4.56× → 1.93× | 6.19× → 1.99× |
| 5 | 4.83× → 2.00× | 7.69× → 1.83× | 8.36× → 1.97× |
| 6 | 6.52× → 1.69× | 7.84× → 1.53× | 7.87× → 1.53× |

## Example: tier 6 gold per action


| Profile | Life current → draft | Mana current → draft | Stamina current → draft |
| --- | --- | --- | --- |
| Base | 260.83 → 260.83 | 154.05 → 154.05 | 40.00 → 172.33 |
| Shop max | 498.63 → 498.63 | 332.36 → 332.36 | 63.64 → 326.22 |
| Permanent max | 1009.13 → 1009.13 | 737.27 → 737.27 | 128.18 → 657.56 |

## Fixed charge bundle, checked separately

5 shields, 10 enhancement charges, 2 sale charges at the start of each isolated brew; no fairies. No free refill is assumed. A 2× bound was approved for the no-consumable baseline, not for these resource-rich starts.


| Tier | Worst spread across three profiles: current → draft |
| --- | --- |
| 1 | 1.00× → 1.00× |
| 2 | 1.87× → 1.87× |
| 3 | 4.22× → 2.51× |
| 4 | 8.45× → 2.73× |
| 5 | 11.92× → 2.81× |
| 6 | 10.93× → 2.13× |

## Why this must not be applied as an isolated batch yet

The tier-6 Stamina buff crosses the existing tier-7 reward curve. Its additional enhancement step no longer compensates for its smaller original multipliers. Applying only these seven changes would make the next Stamina unlock worse in gold/action.


| Profile | Proposed tier-6 Stamina | Unchanged tier-7 Stamina |
| --- | --- | --- |
| Base | 172.33 | 55.23 |
| Shop max | 326.22 | 115.38 |
| Permanent max | 657.56 | 249.58 |


Recommendation: retain this as a candidate and extend the same checks into the middle-game curve before approving a gameplay patch. Avoid silently nerfing early Life earnings to force a smaller patch. Check each adjacent unlock, then the full late-game curve and all partial permanent-upgrade levels before applying changes.

This draft also does not introduce meaningful intermediate selling checkpoints: increasing all multipliers in a recipe mainly makes maximum enhancement more attractive. That is a separate design task, and passing the family-income constraint is not evidence that stopping decisions have improved.

## Validation and limits

Deterministic expected-value calculations, no random simulation. Checks assert all 18 tier/profile comparisons meet the 2× baseline range, rounded candidates maintain early per-family income progression, and the input recipe snapshot matches current game data. Separate finite-charge comparisons identify remaining gaps. Full strategy details are in early-comparisons.csv; proposed values are in early-candidates.json. draft_early.py reproduces the candidate search using calculate.py and inputs.json.

No gameplay data or browser UI changed. Original wiki multipliers remain intact. Gold/minute, charge acquisition, adaptive stopping by inventory, ingredient additions, fairy balance, unlock cost payback and subjective frustration are not evaluated in this small draft. Larger Stamina buffs could reduce the value of collecting extra ingredients; that interaction needs a later check before a final patch.
