# Potion Maker: mathematical balance report

Date: 15 October 2026. Based on the local implementation in `source/core.js` and all 75 recipes in `data/game-data.json`. No gameplay values were changed. No random simulation or external wiki verification was used.

## Decisions confirmed by the player

- Compare gold per action; seconds and earnings per minute remain unspecified.
- Compare no consumables, a fixed starting inventory, and unlimited consumables separately.
- Fixed inventory: 5 protection charges, 10 enhancement charges, 2 double-sale charges, per isolated fresh brew.
- Diagnose enhancement first; analyze ingredient additions separately.
- Intended identities: Life = risky jackpots; Mana = steady income; Stamina = longer runs with safer individual steps.

## Main finding

There is no single family that should be nerfed across all conditions. The leader changes with upgrades and consumables. At final tier, Mana dominates the unupgraded/no-consumable case, Stamina leads with permanent upgrades alone, and Life leads with the fixed charge bundle once normal shop upgrades are maxed. Specialized fairies change the ranking again. An across-the-board Mana nerf is not justified by the earlier per-brew comparison alone.

## Method and scope

An action is one collect that starts a brew, one enhancement attempt (including protected failures), or one sale. Failed brews do not use a sale action. Selecting an entry, changing menus, receiving quests, and acquiring upgrades or charges are excluded. Starting ingredients are free; each scenario conditions on being able to select the desired unlocked ingredient. Conveyor waiting and keyboard/mouse effort are not measured.

For every recipe and scenario, calculate every fixed stopping level, from selling immediately to reaching maximum. The tables below use the stopping level with the greatest expected gold divided by expected actions. This covers fixed level targets; it is not proof of the globally optimal adaptive strategy when remaining charges change a player's decision.

Gold/action is the ratio E[gold]/E[actions], not the expectation of gold/actions in a single attempt. With identical independent restarts, this ratio describes long-run production only when the scenario's resource supply is sustainable. A fixed-inventory row is a conditional isolated-brew efficiency, not sustainable income: its inventory does NOT refill for free. Unlimited is an upper-bound scenario with acquisition costs excluded.

All 25 tiers are compared for all three families. Profiles: no upgrades; maximum normal luck/sale upgrades; maximum normal plus ruby fortune/value upgrades; then that permanent-max profile with each of the 18 relevant level-10 fairies equipped individually (one fairy at a time). Material boosts are deferred to the ingredient analysis. Level-1 fairy paths, partial upgrades, quests, charge replenishment, upgrade purchase costs and acquisition time are outside these comparisons.

The formulas use the actual code: normal luck adds 10.345 percentage points at maximum, ruby fortune adds 10 points, and an enhancement charge adds 10 points per attempt. Success is capped at 100%. Sale factor is 1, 1.2, or 1.7 before fairy bonuses; a sale charge doubles the result. Final sale values are floored. This is a deterministic analytical calculation using floating-point arithmetic; displayed values are rounded.

## Equations

For step i with success chance p_i and multiplier m_i, a destructive unprotected attempt is favorable in immediate expected value when p_i*m_i > 1. That criterion ignores time/actions and does not by itself identify the best stopping strategy.

Without protection or fairy retries, targeting k enhancements:

- Completion probability P = product(p_i), i = 0 ... k-1.
- Successful payout S = floor(base * product(m_i) * sale factor).
- Expected enhancement attempts A = sum(product(p_j), j = 0 ... i-1), i = 0 ... k-1; the empty product is 1.
- Expected gold G = P*S.
- Expected actions D = 1 + A + P.
- Gold/action = G/D.

For a fairy that protects a failed attempt with probability q, and no protection charges, each step can repeat. Its probability of eventually passing before destruction is p/[1-(1-p)q]; its expected attempts before passing or destruction is 1/[1-(1-p)q].

Finite charges require dynamic programming over (enhancement level, shields left, enhancement charges left). Every attempt consumes an enhancement charge if present. On failure, a shield is consumed first; only without a shield can fairy protection apply. At each state, the expected action count includes the current attempt plus the success/failure branches. The same-state retry term, when shields and enhancement charges are exhausted, is solved algebraically rather than sampled or truncated.

With unlimited protection, completion probability is 1 for every positive step chance. Expected attempts are sum(1/p_i); expected protection use is sum((1-p_i)/p_i). Unlimited enhancement charges apply their chance boost on every attempt. This scenario counts one eventual sale.


## Final-tier comparison: gold per action

All these winning fixed targets are the maximum level (Life 5, Mana 6, Stamina 25).

| Upgrades | Charges | Life | Mana | Stamina | Leader |
| --- | --- | --- | --- | --- | --- |
| Base | None | 68.4 B | 146 T | 5.54 T | Mana |
| Base | Fixed | 1.25 Qa | 3.11 Qa | 1.9 Qa | Mana |
| Base | Unlimited | 12.1 Qa | 3.68 Qa | 7.82 Qa | Life |
| Shop max | None | 44.3 T | 420 T | 130 T | Mana |
| Shop max | Fixed | 8.16 Qa | 4.83 Qa | 7.26 Qa | Life |
| Shop max | Unlimited | 24.7 Qa | 5.09 Qa | 10.5 Qa | Life |
| Permanent max | None | 494 T | 1.14 Qa | 1.77 Qa | Stamina |
| Permanent max | Fixed | 27.1 Qa | 7.96 Qa | 15.4 Qa | Life |
| Permanent max | Unlimited | 47.4 Qa | 8.05 Qa | 16.4 Qa | Life |

## Final-tier completion and resource demand

Enhancement and shield columns are expected charges consumed per fresh attempted brew, not per successful sale. Fixed stock is 5 shields and 10 enhancement charges. A sale charge is consumed only on success, so expected sale-charge use equals completion probability (one charge per completed sale). The second starting sale charge cannot affect a single-brew comparison.

| Upgrades | Charges | Family | Completion | Actions | Enhance charges | Shields |
| --- | --- | --- | --- | --- | --- | --- |
| Base | None | Life | 7.68e-05% | 2.125 | 0.000 | 0.000 |
| Base | None | Mana | 2.52% | 3.439 | 0.000 | 0.000 |
| Base | None | Stamina | 0.0191581% | 4.333 | 0.000 | 0.000 |
| Base | Fixed | Life | 2.71958% | 8.230 | 7.203 | 4.966 |
| Base | Fixed | Mana | 76.7068% | 9.852 | 8.085 | 3.177 |
| Base | Fixed | Stamina | 17.711% | 23.338 | 9.995 | 4.826 |
| Base | Unlimited | Life | 100% | 31.281 | 29.281 | 25.281 |
| Base | Unlimited | Mana | 100% | 10.845 | 8.845 | 3.845 |
| Base | Unlimited | Stamina | 100% | 32.000 | 30.000 | 6.000 |
| Shop max | None | Life | 0.0441014% | 2.260 | 0.000 | 0.000 |
| Shop max | None | Mana | 6.92755% | 3.951 | 0.000 | 0.000 |
| Shop max | None | Stamina | 0.523616% | 6.066 | 0.000 | 0.000 |
| Shop max | Fixed | Life | 15.8083% | 8.799 | 7.641 | 4.770 |
| Shop max | Fixed | Mana | 92.1334% | 9.151 | 7.229 | 2.248 |
| Shop max | Fixed | Stamina | 67.4466% | 27.925 | 10.000 | 3.834 |
| Shop max | Unlimited | Life | 100% | 18.404 | 16.404 | 12.404 |
| Shop max | Unlimited | Mana | 100% | 9.416 | 7.416 | 2.416 |
| Shop max | Unlimited | Stamina | 100% | 28.565 | 26.565 | 2.565 |
| Permanent max | None | Life | 0.372053% | 2.424 | 0.000 | 0.000 |
| Permanent max | None | Mana | 15.5129% | 4.603 | 0.000 | 0.000 |
| Permanent max | None | Stamina | 8.74377% | 10.539 | 0.000 | 0.000 |
| Permanent max | Fixed | Life | 38.2581% | 9.089 | 7.706 | 4.336 |
| Permanent max | Fixed | Mana | 98.3165% | 8.382 | 6.399 | 1.401 |
| Permanent max | Fixed | Stamina | 99.2749% | 27.462 | 10.000 | 1.486 |
| Permanent max | Unlimited | Life | 100% | 13.576 | 11.576 | 7.576 |
| Permanent max | Unlimited | Mana | 100% | 8.430 | 6.430 | 1.430 |
| Permanent max | Unlimited | Stamina | 100% | 26.000 | 24.000 | 0.000 |

## Risk and reliability

Without upgrades or consumables, final Life has a 0.0000768% completion probability, versus 2.52% for Mana and 0.0191581% for Stamina. Its huge expected payout is driven by rare jackpots. It should not be described as steady earnings.

For repeated fresh, independent, unprotected runs, chance of at least one completion after n runs is 1-(1-P)^n. The required n for confidence c is ceil(log(1-c)/log(1-P)). These are counts of attempted brews, not clicks or elapsed time.


| Final-tier family | Runs for ≥50% chance of a completion | Runs for ≥95% chance |
| --- | --- | --- |
| Life | 902,536 | 3,900,692 |
| Mana | 28 | 118 |
| Stamina | 3,618 | 15,636 |

## Fairy sensitivity

The following independently picks the best of the 18 relevant level-10 fairies for each final-tier family under permanent-max upgrades, without consumables. These are three different loadouts, not simultaneous bonuses. All highest-paying targets are maximum level.


| Family | Best tested fairy | Gold/action | Completion | Versus no fairy |
| --- | --- | --- | --- | --- |
| Life | Red-me (fairy-29) | 24.1 Qa | 13.22% | 48.81× |
| Mana | Blue-Me (fairy-26) | 9.54 Qa | 75.89% | 8.34× |
| Stamina | Yell-Me (fairy-28) | 651 Qa | 100% | 368.54× |


The Stamina-specific fairy-28 supplies +30 percentage points success, +20% enhancement multiplier per step, and 15% failure protection at level 10. Combined with normal and ruby upgrades, 70% base + 20.345 points permanent + 30 points fairy exceeds 100% even without enhancement charges. All 24 steps become guaranteed. The multiplier bonus compounds as 1.2^24 ≈ 79.50, not as a one-time 20% bonus. This compounding is a major source of power differences between long and short enhancement ladders.

Life's fairy-29 combines +30 points chance, +20% multiplier, and 20% failure protection. Mana's fairy-26 combines +30 points chance, +20% multiplier, and 15% failure protection. A maxed collection can therefore undermine the proposed family roles. These are current implementation effects, not independently verified original-game mechanics.


## All tiers: no upgrades or consumables

Each cell is gold/action at the best fixed target; parentheses give the sale level. These figures condition on that tier already being unlocked.


| Tier | Life | Mana | Stamina |
| --- | --- | --- | --- |
| 1 | 5 (L1) | 5 (L1) | 5 (L1) |
| 2 | 10 (L1) | 10 (L1) | 10 (L1) |
| 3 | 24.69 (L5) | 15 (L1) | 15 (L1) |
| 4 | 61.46 (L5) | 22.48 (L5) | 21 (L1) |
| 5 | 132.8 (L5) | 61.78 (L5) | 27.5 (L1) |
| 6 | 260.8 (L5) | 154 (L5) | 40 (L1) |
| 7 | 674.5 (L5) | 468.6 (L5) | 55.23 (L7) |
| 8 | 4.37 K (L5) | 5.72 K (L5) | 483.1 (L8) |
| 9 | 11.1 K (L5) | 23.7 K (L5) | 1.49 K (L9) |
| 10 | 38 K (L5) | 87.9 K (L5) | 4.84 K (L10) |
| 11 | 80.3 K (L5) | 255 K (L5) | 14.2 K (L11) |
| 12 | 145 K (L5) | 915 K (L5) | 50.5 K (L12) |
| 13 | 1.25 M (L5) | 3.23 M (L5) | 166 K (L13) |
| 14 | 5.57 M (L5) | 8.44 M (L5) | 474 K (L14) |
| 15 | 17.9 M (L5) | 21.6 M (L5) | 1.5 M (L15) |
| 16 | 95.4 M (L5) | 116 M (L5) | 7.05 M (L16) |
| 17 | 340 M (L5) | 450 M (L5) | 24.3 M (L17) |
| 18 | 914 M (L5) | 1.69 B (L5) | 80.6 M (L18) |
| 19 | 2.12 B (L5) | 6.8 B (L5) | 257 M (L19) |
| 20 | 5.4 B (L5) | 23.7 B (L5) | 1.42 B (L20) |
| 21 | 13.5 B (L5) | 3.05 T (L6) | 3.35 B (L21) |
| 22 | 28 B (L5) | 11.9 T (L6) | 26.7 B (L22) |
| 23 | 41.3 B (L5) | 32.2 T (L6) | 167 B (L23) |
| 24 | 52.6 B (L5) | 72.7 T (L6) | 973 B (L24) |
| 25 | 68.4 B (L5) | 146 T (L6) | 5.54 T (L25) |

## Selling early: a different conclusion from per-brew expected value

At base upgrades and no consumables, selling immediately wins gold/action for Life tiers 1–2, Mana tiers 1–3, and Stamina tiers 1–6. All other tiers favor maximum enhancement among the fixed level targets tested. With permanent-max upgrades but no consumables, immediate selling still wins for Life tier 1, Mana tier 1, and Stamina tiers 1–3.

Thus, the current action-efficiency frontier is largely binary: sell immediately or push all the way to max. There are no intermediate winning stopping levels in these three no-fairy/no-consumable upgrade profiles. This is a more specific balance issue than saying almost every enhancement has positive expected value. Positive expected value can still be too small to justify an extra action.

This conclusion excludes quest value, achievement value, risk aversion, charge acquisition costs and adaptive decisions based on remaining inventory. Those can make early sales rational even when a fixed gold-maximizing policy does not.

## Ingredient additions: separate mathematical finding

Assume k extra identical ingredients are added before any enhancement; each adds a value a. Hold the enhancement target and starting resource profile fixed. Ignore final whole-gold rounding for the algebra. Let B be base value, P completion probability, M the product of multipliers, s the selling factor, and D expected actions before the extra ingredients.

Gold/action(k) = P*M*s*(B + k*a)/(D + k).

The sign of each additional ingredient's marginal effect is determined by a*D - B:

- If a*D > B, adding more before enhancing raises efficiency toward the limit P*M*s*a, with diminishing gains.
- If a*D < B, those additions lower efficiency.
- If equal, the unrounded ratio is unchanged.

There is therefore no interior finite optimum in this simplified model. A finite input cap, time cost, inventory cost, or different action model would be needed if a designed finite number of additions is a goal. This is a diagnosis, not a recommendation to add a cap.

The strongest unboosted material adds 44,889 value in every family. At final tier with no upgrades or charges, B = 1,000,000 and the break-even added value is about 470,611 for Life, 290,765 for Mana, and 230,793 for Stamina. One extra strongest material before enhancing is therefore inefficient in all three cases. This does not establish that additions are always bad: smaller base recipes and stronger material/fairy boosts change the inequality. Additions between enhancements require their own policy analysis and are not included here.

## Balancing priorities supported by these calculations

1. Set a success-ceiling policy for combined permanent upgrades, fairies, and charges. Guaranteed max-level Stamina already exists without consumables in a tested specialized-fairy loadout. Decide whether that is intended before tuning base potion chances.
2. Address compounding per-step fairy multipliers when comparing families with 4, 5 and 24 enhancement steps. Equal percentage bonuses are not equal total bonuses.
3. Tune and compare resource scenarios separately. Unupgraded Mana is dominant, but normal-upgrade/fixed-stock Life leads and specialized-fairy Stamina leads. Avoid a universal Mana nerf based only on one baseline.
4. If meaningful stopping choices are a goal, tune the gold/action frontier to support some intermediate targets. Most current fixed policies choose immediate sale or maximum enhancement.
5. Keep ingredient economics and charge replenishment visible. A balanced isolated-brew table does not establish a balanced full economy.

## Decisions still needed before a balance patch

- What income spread between families is acceptable at comparable progression? A twofold band was previously suggested, not approved as a design requirement.
- Should fully upgraded or fairy-assisted builds ever guarantee success? If so, for which family and resource cost?
- What is the sustainable acquisition cost of protection/enhancement/sale charges in actions? Quests, draw odds, currency exchanges and player strategy affect this; it cannot be inferred from enhancement tables alone.
- Does an enhancement click deserve the same weight as collecting and selling? The player selected equal actions as the report baseline; this is not measured time.
- Should jackpots, achievements and completed quests be valued beyond gold? This report intentionally does not assign invented gold equivalents to them.

No numerical balance patch is proposed until these design choices are settled. The findings above already identify which mechanisms need attention.

## Reproducibility and validation

`calculate.py` reads the local input snapshot `inputs.json`. It enumerates 36,477 fixed-target strategies, producing 4,725 best-target comparisons. `all-strategies.csv` contains every target, including immediate sale; `best-fixed-targets.csv` contains the strongest fixed target per recipe, profile and charge scenario. There are no sampled random outcomes.

Analytical self-checks cover unprotected completion and reach probabilities, a finite-shield geometric case, and the unlimited-protection expected-attempt formula. The implementation was cross-read against the game's chance cap, per-attempt boost consumption, shield-before-fairy ordering, retry-at-same-level behavior and floor-on-sale formula. Browser behavior and original wiki correctness were not reverified for this report.
