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

## Incomplete or conflicting entries

- Mana tier 6: only three of four required multipliers recorded. The unrecorded final enhancement is unavailable.
- Mana tiers 20, 21, 22 and 24: missing multiplier sequences. Brewing/selling is allowed where base information is recorded; unavailable enhancements stay disabled.
- Stamina tier 25: missing base price, maximum level, and enhancement values. Its material art/value are archived; starting that potion is disabled.
- Mana tier 4: this wiki records first multiplier 1.57; the separate potion-maker wiki records 1.5. This build uses the potionmaker wiki provisionally.
- Mana tier 6: this wiki records the third multiplier as 3.24, also needing phone verification.
- Mana tier 13: base price written 8.500 is normalized as 8,500 based on the table's thousands notation and progression context.

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
5. Check the six incomplete recipe rows and the two conflicting mana multipliers.
6. Capture the default Pio/Tia animation states; costume texture atlases alone do not define their rigs.

## Validation

Automated checks cover complete/incomplete recipe tables, family lock, later tiers and unlock limits, success and failed/protected enhancement, automatic consumable depletion, double sales, delayed rewards without duplication, v1 migration, save round trips, and rejection of malformed saves. Browser verification uses a separate test storage key so test actions do not replace the player's save.
