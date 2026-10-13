# Evidence ledger — 13 October 2026

## Implemented from recorded facts

| Rule | Source | Implementation |
| --- | --- | --- |
| First ingredient determines the potion; later ingredients add value | [Materials](https://potionmaker.fandom.com/wiki/Materials), [Potion](https://potionmaker.fandom.com/wiki/Potion) | Fixed family/tier after starting, with additive material values. |
| Ingredients are free and pass across the upper bar | [Materials](https://potionmaker.fandom.com/wiki/Materials) | Passing ingredient buttons during brewing. |
| Potions have per-tier base values, maximum levels, enhancement multipliers and success rates | [Potion](https://potionmaker.fandom.com/wiki/Potion) | 75 entries normalized into data/game-data.json; no guessed missing steps. |
| Stamina repeats a constant multiplier and chance | [Potion](https://potionmaker.fandom.com/wiki/Potion) | Tables expand the recorded constant across the documented level range. |
| Failed enhancement ordinarily destroys the potion | [Potion Maker](https://potionmaker.fandom.com/wiki/Potion_Maker) | Failure clears the current potion unless protection is available. |
| Protection is consumed only on failure | [Powerup](https://potionmaker.fandom.com/wiki/Powerup) | Each protected failure consumes one protection charge. |
| Enhancement powerup adds ten percentage points | [Powerup](https://potionmaker.fandom.com/wiki/Powerup) | Automatically applied and consumed on an attempted enhancement. Exact consumption timing is an inference from the one-use description. |
| Selling powerup doubles sale proceeds | [Powerup](https://potionmaker.fandom.com/wiki/Powerup) | Automatically applied and consumed on a sale. |
| Normal quest rewards arrive after one minute; other actions remain available | [Quests](https://potionmaker.fandom.com/wiki/Quests) | Timestamped delayed delivery, persisted across reloads. |
| Normal bundles: 5 protection, 10 enhancement, or 2 sale charges | [Quests](https://potionmaker.fandom.com/wiki/Quests), [Neet](https://potionmaker.fandom.com/wiki/Neet), [Dolbur](https://potionmaker.fandom.com/wiki/Dolbur), [Tirami](https://potionmaker.fandom.com/wiki/Tirami) | Three corresponding repeatable visitor orders. |
| Material tiers reach 25; emission reaches level 20; emission does not affect initial-material selection | [Upgrades](https://potionmaker.fandom.com/wiki/Upgrades), archived UpgradeMenu_Max image | Matching tier/emission limits; separate starting picker. |
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

## Provisional implementation choices

Upgrade prices follow the earlier prototype progression, extended geometrically. Luck is represented by ten equal steps toward +10.345%; selling uses four steps toward +20%. Neither the equal steps nor the price curves are documented.

Ingredient movement, capacity, refill rate, the 72% preference for the best unlocked material, initial-picker arrangement, and addition of unmultiplied ingredient values to an enhanced potion remain estimates. Enhancement is immediate; original action durations are not recorded here.

The three visitors are continuously available except during their reward timers. Each asks for a level-2 potion at the highest unlocked documented tier in its assigned family. These exact family/level/tier targets, continuous availability, and automatic repeat offers are prototype choices. Traveler XP/level progression and requests are not simulated.

There is a technical finite-number ceiling of 1e300 to avoid JavaScript overflow. This replaces the former much lower 1e12 prototype ceiling; it is not an original gameplay limit.

## Best next verification against the phone

1. Record the first ten upgrade prices and corresponding success/sale/emission changes.
2. Compare ingredient addition before and after enhancing the same potion.
3. Record enhancement animation duration and whether actions are locked during it.
4. Record visitor arrival intervals, actual first orders, delivery behavior, and reward timers.
5. Verify the supplemented recipes and conflicting mana multipliers against the phone.
6. Capture the default Pio/Tia animation states; costume texture atlases alone do not define their rigs.

## Validation

Automated checks cover complete/incomplete recipe tables, family lock, later tiers and unlock limits, success and failed/protected enhancement, automatic consumable depletion, double sales, delayed rewards without duplication, v1 migration, save round trips, and rejection of malformed saves. Browser verification uses a separate test storage key so test actions do not replace the player's save.
