# Applied early and middle progression

The player requested applying the reviewed candidates before the late-game pass. This update changes enhancement multipliers for 17 recipes: seven early Mana/Stamina recipes at tiers 3–6, plus six Stamina and four Life recipes at tiers 7–12. The early Blueberry proposal is amended to `[1.38, 1.57, 1.84, 2.30]` to satisfy the partial-upgrade baseline. It remains one of the seven early recipes.

Exact original and applied arrays are recorded in `applied-candidates.json`. Original numerical inputs, `early-candidates.json` and the earlier reports remain historical evidence; they are not snapshots of the current balanced game. Older draft scripts may reproduce the older candidate rather than this amendment. Use `python source/check-balance.py` to check the applied curve against current game data.

The baseline checks all 6,655 combinations of normal luck/selling and ruby fortune/value upgrades at every tier 1–12. It optimizes all fixed selling levels, including immediate sale, using the 99% chance ceiling, sequential multipliers and whole-gold sale rounding. It requires a family earnings spread at most 2× and nondecreasing gold per action at adjacent unlocks. No additional ingredient collections, fairies or consumables are included in this baseline.

Fairy abilities are deliberately unchanged and excluded from the earnings constraint at the player's request. Base prices, chances, maximum levels, upgrade costs, quest rules and material values are unchanged. Recipe notes and the Sources screen label the adjusted multipliers as personal balance changes rather than original wiki values.

Save schema and storage key remain unchanged. Existing potion values, balances and achievements are preserved; subsequent enhancements use the updated multipliers. Existing metrics are not recalculated.

## Known remaining work

Tiers 13–25 remain unchanged. Stamina tier 13 can earn about 65.15% less per action than adjusted tier 12. This intentional partial release needs a connected late-game review. The original middle review also found maximum enhancement still best throughout its baseline; this update does not add meaningful intermediate selling choices or claim to balance resource acquisition, play time or enjoyment.

Validation: `npm test` checks gameplay, saves and embedded offline build; `python source/check-balance.py` checks the applied arrays, untouched fields and exhaustive early/middle baseline. The submitted middle candidate was regenerated independently before applying it; all nine supplied CSV outputs reproduced exactly.
