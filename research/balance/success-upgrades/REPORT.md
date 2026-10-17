# Enhancement success upgrade revision

The supplied original table is interpreted as the cost to buy the next bonus from each row. There are 19 purchases: 0% to 1%, then the supplied cumulative bonuses through 10.345%. These are additive percentage points.

Costs are custom to this game's bounded gold economy. See prices.json for each purchase, its reference tier, modeled gold rate, and target saving time. Prices range from 100 to 622,260 gold. They are not copied from the original billion-gold prices.

Pricing model: distribute purchases across material tiers 1–25. At each tier, evaluate every sell level in each family using current recipe values, the bonus owned before purchasing, three seconds per enhancement, half a second to select/sell, no fairy/boost/sale upgrade/helper, and no extra ingredient feeding. Expected attempts include failed runs. Compare manual selection with a conveyor waiting model (40 px/s empty; 76 px spacing; emission increases with reference tier; 1.75% assumed special slots). For each family use the geometric mean of the best manual and best conveyor gold/minute; take the geometric mean across families. Multiply by a saving target growing from 0.5 to 4 minutes, round to tens, with a 100-gold floor and at least 15% growth per purchase. These are pricing references, not measured completion times; randomness, ingredients and helpers change actual rates.

Stamina base success changes from 91% to 84.655% at all steps. Maximum permanent success remains 95% (84.655 + 10.345); fairies and consumables still apply under the 99% ceiling. Life/Mana base chances and all potion gold/multiplier tables are preserved. This does not assert equal family income following the timer change; historical economy reports describe earlier configurations.

Save version 16 retains every purchased rank and all balances. Old rank 10 becomes rank 10/19 (+5.6%); existing ranks receive at least their former +0.4 points/rank bonus. Stamina's base reduction still affects existing shops. Old saves are backed up by the existing migration mechanism. No refunds or gold conversion are performed.

Validation: check-success-upgrades.cjs covers every rank/cost, exact deductions, maximum refusal, old and extended save validation, and all 75 recipes across every rank. Existing timing, core, migration and UI checks cover integration. No browser playthrough or complete new progression calibration is claimed.
