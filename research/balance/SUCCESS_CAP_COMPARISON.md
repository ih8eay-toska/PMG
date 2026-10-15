# Success-cap comparison

15 October 2026. Analytical extension of BALANCE_REPORT.md. Gameplay unchanged. No random simulations.

## Recommendation

Use 99% as the first candidate for the final per-attempt ceiling, applied after all chance bonuses. It preserves a chance of failure at every step while penalizing a 24-step ladder less than lower caps. This is a candidate, not a claim about player frustration or a complete balance patch.

A ceiling is not a minimum chance: low-probability Life steps stay low. A chance cap also does not solve stacked fairy multipliers or resource acquisition balance.

## The hidden cost of a long ladder

If every step reaches the cap and every failure destroys the potion, completion is cap^steps. These are hypothetical equal-chance ladders, not the current Life/Mana recipes.


| Per-attempt cap | 4-step completion | 5-step completion | 24-step completion |
| --- | --- | --- | --- |
| 95% | 81.45% | 77.38% | 29.20% |
| 97% | 88.53% | 85.87% | 48.14% |
| 98% | 92.24% | 90.39% | 61.58% |
| 99% | 96.06% | 95.10% | 78.57% |

## Current final-tier recipes with specialized level-10 fairies

Each family uses its own loadout: permanent-max upgrades plus fairy-29 for Life, fairy-26 for Mana, or fairy-28 for Stamina. These are different equipped fairies. Their passive protection on unshielded failures is included (20%, 15%, 15% respectively). Target maximum enhancement in every row; this comparison does not re-optimize stopping levels after each proposed cap.

No charges means no consumable shields, enhancement charges or sale boosts. Fixed means 5 shields, 10 enhancement charges and 2 sale charges at the start of an isolated brew. Unlimited means free unlimited charges as a mathematical upper-bound scenario; ordinary failures consume shields and retry, so eventual completion is guaranteed even though each attempt can fail.


### None charges

| Cap | Life completion | Mana completion | Stamina completion | Stamina actions/brew | Stamina gold/action versus current |
| --- | --- | --- | --- | --- | --- |
| 100% | 13.225% | 75.892% | 100.000% | 26.00 | 100.00% |
| 95% | 13.225% | 66.554% | 34.981% | 16.65 | 54.63% |
| 97% | 13.225% | 70.208% | 53.645% | 19.71 | 70.75% |
| 98% | 13.225% | 72.076% | 66.182% | 21.55 | 79.83% |
| 99% | 13.225% | 73.970% | 81.450% | 23.64 | 89.59% |

### Fixed charges

| Cap | Life completion | Mana completion | Stamina completion | Stamina actions/brew | Stamina gold/action versus current |
| --- | --- | --- | --- | --- | --- |
| 100% | 95.012% | 100.000% | 100.000% | 26.00 | 100.00% |
| 95% | 95.012% | 99.999% | 99.760% | 27.25 | 95.19% |
| 97% | 95.012% | 100.000% | 99.983% | 26.74 | 97.21% |
| 98% | 95.012% | 100.000% | 99.998% | 26.49 | 98.15% |
| 99% | 95.012% | 100.000% | 100.000% | 26.24 | 99.08% |

### Unlimited charges

| Cap | Life completion | Mana completion | Stamina completion | Stamina actions/brew | Stamina gold/action versus current |
| --- | --- | --- | --- | --- | --- |
| 100% | 100.000% | 100.000% | 100.000% | 26.00 | 100.00% |
| 95% | 100.000% | 100.000% | 100.000% | 27.26 | 95.37% |
| 97% | 100.000% | 100.000% | 100.000% | 26.74 | 97.22% |
| 98% | 100.000% | 100.000% | 100.000% | 26.49 | 98.15% |
| 99% | 100.000% | 100.000% | 100.000% | 26.24 | 99.08% |

## Failure exposure: 24 capped steps without protection

For success chance c on every step and no protection:

- P = c^24.
- Expected enhancement attempts A = (1-P)/(1-c).
- Expected actions per fresh brew D = 1+A+P (collect, attempts, sale only on completion).
- Failed brews average [1+A-25P]/(1-P) actions each; this counts their initial collect and enhancements, but not any wait to obtain ingredients or rebuild value.
- Chance of three consecutive failed brews = (1-P)^3, for a specified block of three independent fresh brews. It is not the chance of seeing any streak over an entire play session.

This table isolates the cap's consequence and excludes fairy retries and shields.


| Cap | A brew fails | Three specified brews all fail | Actions per failed brew |
| --- | --- | --- | --- |
| 95% | 70.80% | 35.49% | 11.10 |
| 97% | 51.86% | 13.95% | 12.05 |
| 98% | 38.42% | 5.67% | 12.54 |
| 99% | 21.43% | 0.98% | 13.02 |

## Design implications

1. 95% is a harsh general ceiling for Stamina: even 24 individually high-chance steps complete only about 29% of the time without protection. It is poorly suited to the requested longer-but-safer role.
2. 99% leaves meaningful whole-run risk: a completely unprotected 24-step run still fails about 21% of the time. With Stamina's specialized 15% passive protection, the actual completion rate is higher, but is below 100% without consumable shields.
3. Finite shields make the tested fully upgraded Stamina loadout extremely reliable. They can absorb several unlucky attempts. That is different from guaranteed success; the exact remaining failure risk is in cap-comparisons.csv.
4. With unlimited protection and positive chance, eventual completion is mathematically 100% under every cap. If 'never guaranteed' means eventual completion must also stay below 100% even with unlimited protection, a chance cap alone cannot satisfy that. The real-game question is whether protection can be replenished indefinitely at acceptable cost.
5. Life's small base chances are largely untouched by these high ceilings. Its potentially frustrating failure burden must be addressed through the base curve, protection access, or reward/choice design separately; raising the cap does not fix it.
6. Stamina's fairy enhancement multiplier still compounds across 24 steps. A chance cap by itself cannot make family earnings comparable.

## Proposed next decision

Approve 99% as the candidate ceiling for an eventual coordinated balance proposal, while keeping failure recovery/protection availability as a separate design constraint. Do not apply only a ceiling and assume the economy is balanced.

Before changing values, clarify whether the player intends 'no guarantee' to mean each individual enhancement remains risky, or a brew can never become effectively safe with accumulated protection. These are different requirements.

## Method and limitations

compare_caps.py reuses the deterministic recurrence from calculate.py and changes only its chance ceiling. It calculates maximum-target outcomes for all 75 recipes, 21 upgrade/fairy profiles, three resource scenarios, and five ceilings (including the existing 100% baseline): 23,625 scenarios. CSV probabilities retain floating-point precision; printed percentages are rounded and can appear as 100% even when a small failure probability remains. No acquisition costs, human timing, random sampling or player-wellbeing thresholds were invented.
