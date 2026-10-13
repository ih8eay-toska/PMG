# Evidence ledger — 13 October 2026

## Implemented from recorded facts

| Rule | Source | Implementation |
| --- | --- | --- |
| First ingredient determines the potion; later ingredients add value | [Materials](https://potionmaker.fandom.com/wiki/Materials), [Potion](https://potionmaker.fandom.com/wiki/Potion) | Fixed family/tier after starting, with additive material values. |
| Ingredients are free and pass across the upper bar | [Materials](https://potionmaker.fandom.com/wiki/Materials) | Random passing ingredients before and during brewing; speed scales with emission only during brewing (player observation). |
| Potions have per-tier base values, maximum levels, enhancement multipliers and success rates | [Potion](https://potionmaker.fandom.com/wiki/Potion) | 75 entries normalized into data/game-data.json; no guessed missing steps. |
| Stamina repeats a constant multiplier and chance | [Potion](https://potionmaker.fandom.com/wiki/Potion) | Tables expand the recorded constant across the documented level range. |
| Failed enhancement ordinarily destroys the potion | [Potion Maker](https://potionmaker.fandom.com/wiki/Potion_Maker) | Failure clears the current potion unless protection is available. |
| Protection is consumed only on failure | [Powerup](https://potionmaker.fandom.com/wiki/Powerup) | Each protected failure consumes one protection charge. |
| Enhancement powerup adds ten percentage points | [Powerup](https://potionmaker.fandom.com/wiki/Powerup) | Automatically applied and consumed on an attempted enhancement. Exact consumption timing is an inference from the one-use description. |
| Selling powerup doubles sale proceeds | [Powerup](https://potionmaker.fandom.com/wiki/Powerup) | Automatically applied and consumed on a sale. |
| Normal quest rewards arrive after one minute; other actions remain available | [Quests](https://potionmaker.fandom.com/wiki/Quests) | Timestamped delayed delivery, persisted across reloads. |
| Normal bundles: 5 protection, 10 enhancement, or 2 sale charges | [Quests](https://potionmaker.fandom.com/wiki/Quests), [Neet](https://potionmaker.fandom.com/wiki/Neet), [Dolbur](https://potionmaker.fandom.com/wiki/Dolbur), [Tirami](https://potionmaker.fandom.com/wiki/Tirami) | Three corresponding visitors arriving at randomized intervals, with explicit timed acceptance. |
| Material tiers reach 25; emission reaches level 20; emission does not affect initial-material selection | [Upgrades](https://potionmaker.fandom.com/wiki/Upgrades), archived UpgradeMenu_Max image | Matching tier/emission limits; constant base conveyor speed while the cauldron is empty (player observation). |
| Maximum success bonus +10.345%, maximum selling bonus +20% | [Upgrades](https://potionmaker.fandom.com/wiki/Upgrades), archived UpgradeMenu_Max image | Matching maximum bonuses; intermediate progression remains provisional. |

## Supplemented enhancement data

The [hyphenated wiki’s Potions page](https://potion-maker.fandom.com/wiki/Potions) fills all six previously incomplete entries. The reviewed values are stored in **data/potion-supplements.json** and applied automatically by **source/extract_data.py**, so re-extracting the first wiki does not discard them.

- Home MP: ×2.29, ×2.67, ×3.2, ×4. Its third multiplier replaces 3.24; the cumulative result agrees with the listed 78.26.
- Elixir of Fantasy: ×42.86, ×50, ×60, ×75.
- Elixir of Daybreak: ×50, ×58.33, ×70, ×87.5, ×116.67.
- Ashy Cursed Reagents: ×57.14, ×66.67, ×80, ×100, ×133.33.
- Blue Plague Serum: ×71.43, ×83.33, ×100, ×125, ×166.67; chances 70%, 60%, 50%, 40%, 30%.
- Gold Essence of Pride: base 1,000,000; maximum level 25; ×2.9 and 70% success on every enhancement.
- Small MP’s first multiplier is corrected to 1.5, replacing 1.57. Its cumulative result agrees with the listed 12.31.

All 75 entries now have complete enhancement tables. Cumulative totals were checked against products of the individual multipliers; the aggregate total is never used as a single-step multiplier. Community documentation remains provisional until compared with the installed game. Other disagreements between the wikis, including some Life potion chances, have not been changed in this focused update.

Mana tier 13’s base price written 8.500 remains normalized to 8,500.

## Conveyor and visitors — observed correction

The player confirmed on 13 October 2026 that ingredients are randomized, the empty-cauldron conveyor runs at a constant pace with even spacing, and Material Emission scales conveyor pace only while a potion is in the cauldron. They also confirmed the existing additive material-value rule. The old starting picker and 72% preference for the highest tier were removed. Every unlocked ingredient is now sampled equally; equal probabilities, 38 pixels/second base speed, 76-pixel spacing, and 12% additional speed per emission upgrade are provisional calibration choices. Collecting, selling, losing, or delivering a potion does not reset the belt. Reduced-motion mode displays discrete position steps.

The player confirmed random visitor arrivals and a **one-minute preparation deadline starting on acceptance for every quest**. This takes precedence over the incomplete wiki's normal/challenge distinction. The one-minute reward-delivery delay remains separate. A declined visitor leaves without starting a deadline. An expired accepted order grants no reward and keeps the player's potion. Timers persist through reloads and use elapsed wall-clock time while the page is closed.

Current scope remains Neet, Dolbur, and Tirami normal orders. One visitor arrives per encounter, with a random 20–60-second wait after the shop becomes clear. An offer awaits explicit acceptance; success/failure remains visible until dismissed. These arrival intervals, encounter concurrency, offer lifetime, random potion target distribution, and accepting an equal-or-higher enhancement level are provisional. Requirements are selected from unlocked material tiers and levels 1–4 (capped at each potion's maximum), and are frozen when offered. They no longer use a fixed family per traveler.

Portraits use the archived original character files. Neet's dialogue subpage does not exist in the cached wiki, Dolbur's page supplies no quest transcript, and the retrieved Tirami/dialogues article documents challenge lines rather than complete normal-order conversations. **data/visitor-dialogue.json therefore explicitly labels all current normal-order response lines as original fan-written text.** The retrieved article is cached at research/wiki/Tirami_dialogues.json. No invented line is presented as an original quotation; no missing facial-expression assets are fabricated.

Save schema 3 preserves v1/v2 progression, including rewards already in transit. The browser keeps a one-time raw backup of each older schema before migration, using the same save key.

## Provisional implementation choices

Upgrade prices follow the earlier prototype progression, extended geometrically. Luck is represented by ten equal steps toward +10.345%; selling uses four steps toward +20%. Neither the equal steps nor the price curves are documented.

Exact conveyor calibration, random ingredient probabilities, sale rounding, and enhancement animation duration remain estimates. The additive ingredient-value behavior was confirmed by the player. Enhancement is still immediate.

Upgrade prices and intermediate bonuses remain unchanged: the player explicitly requested keeping the economy as-is in this update. Traveler XP/level progression, additional visitors, challenges and requests remain outside this correction.

There is a technical finite-number ceiling of 1e300 to avoid JavaScript overflow. This replaces the former much lower 1e12 prototype ceiling; it is not an original gameplay limit.

## Best next verification against the phone

1. Record the first ten upgrade prices and corresponding success/sale/emission changes.
2. Compare ingredient addition before and after enhancing the same potion.
3. Record enhancement animation duration and whether actions are locked during it.
4. Measure visitor arrival intervals and order distributions; verify offer expiration and reward delivery behavior. The player has confirmed one-minute preparation deadlines.
5. Verify the supplemented recipes and conflicting mana multipliers against the phone.
6. Capture the default Pio/Tia animation states; costume texture atlases alone do not define their rigs.

## Validation

Automated checks cover complete/incomplete recipe tables, family lock, later tiers and unlock limits, success and failed/protected enhancement, automatic consumable depletion, double sales, delayed rewards without duplication, v1 migration, save round trips, and rejection of malformed saves. Browser verification uses a separate test storage key so test actions do not replace the player's save.

## Temporary fairy visitor mode — 13 October 2026

User requested more visitors and fairy rewards for now. Added the remaining seven documented visitors with original portrait assets: Claire, Luke, Piria, Charlotte, Demian, Daisy and Kyle. These additions intentionally use normal timed potion orders, not their documented request/challenge mechanics. Their guaranteed uniformly random reward comes from 35 regular fairies identified by Fairy1.png through Fairy35.png in the cached Fairy article. Event and character fairies are excluded. Fairy counts persist, duplicates accumulate, and there are no passive effects or inferred level thresholds. Original three traveler reward bundles are retained. Normal conversations are explicitly fan-written. Schema 4 migrates the original three travelers without losing pending deadlines or rewards.
