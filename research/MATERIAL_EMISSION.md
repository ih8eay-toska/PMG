> Historical report: the implementation has since changed to constant movement, base rates 1–20/s plus supported fairy bonuses, a 3/s empty cap, and no speed preference. See [current release audit](releases/2026-10-25/CHANGES.md#current-conveyor-and-fairy-behavior) for the final code and its coordinate-mapping limitations. Tables below describe superseded iterations, not current behavior.

# Material emission: current implementation

Audited 2026-10-25. This describes the current PMG code, not verified original APK behavior. The Bank removal does not change emission or upgrade prices.

## Rates and upgrade prices

At the default conveyor-speed setting (1×), the displayed upgrade level is the filled-cauldron spawn rate except level 1, which now emits 0.5/s. Levels run from 1 to 20; the saved `speed` index runs from 0 to 19. An empty cauldron uses `min(level, 10)` except level 1 (0.5/s) and level 20 (2.5/s). A filled cauldron means an actual potion exists, including one already at MAX.

These numbers count **all conveyor spawns**, not only ordinary ingredients and not collected ingredients. A special drop replaces the material that otherwise would have occupied that spawn.

| Level | Gold cost to reach level | Empty spawns/s | Filled spawns/s |
|---|---:|---:|---:|
| 1 | 0 | 0.5 | 0.5 |
| 2 | 137 | 2 | 2 |
| 3 | 177 | 3 | 3 |
| 4 | 231 | 4 | 4 |
| 5 | 300 | 5 | 5 |
| 6 | 390 | 6 | 6 |
| 7 | 507 | 7 | 7 |
| 8 | 659 | 8 | 8 |
| 9 | 857 | 9 | 9 |
| 10 | 1,113 | 10 | 10 |
| 11 | 1,448 | 10 | 11 |
| 12 | 1,882 | 10 | 12 |
| 13 | 2,446 | 10 | 13 |
| 14 | 3,180 | 10 | 14 |
| 15 | 4,134 | 10 | 15 |
| 16 | 5,375 | 10 | 16 |
| 17 | 6,987 | 10 | 17 |
| 18 | 9,083 | 10 | 18 |
| 19 | 11,808 | 10 | 19 |
| 20 | 15,350 | 2.5 | 20 |

The starting level is free. All 19 purchases together cost **66,064 gold**. Emission upgrades have no mastery gate; material-tier unlocks have separate gates. The upgrade changes future cadence, not ingredient value, ingredient tier, chance of enhancement, or ingredient tier; level 1 and empty level 20 have the movement exceptions below.

## Movement, spacing, and transitions

- The width-calibrated baseline V is `max(80, (track width + 60) / 3)` CSS pixels/s. Level 1 moves at V/2 in either state. Empty level 20 also moves at V/2. Other levels/states retain V. Resizing preserves each item's travel phase.
- Level 1 emits 0.5/s, so its original spacing and maximum of three live slots are preserved at half movement speed. This is not a count cap.
- Empty level 20 emits 2.5/s at V/2: twice the old spacing and half the old spatial density. Filled level 20 remains 20/s at V. Levels 2–19 are unchanged.
- For a 456 px rack, V=172 px/s. Level 1 moves at 86 px/s with 172 px spacing. Empty level 20 moves at 86 px/s with 34.4 px spacing; filled level 20 moves at 172 px/s with 8.6 px spacing.
- The track is visually mirrored, so internal decreasing x coordinates appear as left-to-right travel. Each card is mirrored back so the artwork remains upright.
- Partway to the next spawn, the remaining distance is rescaled when spacing changes. Existing items are retained in their old positions. Changing upgrades or empty/filled state therefore does not instantly rearrange the entire belt: old and new spacing can temporarily coexist.
- The constructor pre-populates at the calibrated level-1 spacing. A loaded higher level switches future arrivals to its proper cadence on the first update.
- Travel across the rack plus cleanup margin takes less than six seconds for the half-speed states and less than three seconds otherwise.
- Items are discarded once their internal position is below -58 px. Missing a material does not collect it, award value, or charge a fee.

`ECONOMY.conveyor.spacing = 76` remains in the configuration for older balance tooling. Runtime cadence uses the formula above, not that 76 px value. The legacy `emptySpeedMultiplier` is also retained for older balance tooling and no longer affects runtime movement.

## Conveyor-speed setting

Settings offers 1×, 0.75×, and 0.5×. It multiplies the elapsed time passed into the conveyor. Consequently it slows **both movement and real-time spawn rate**; spacing remains unchanged.

| Setting | Empty movement | Filled movement | Level-20 empty spawns/s | Level-20 filled spawns/s |
|---|---:|---:|---:|---:|
| 1× | 0.5 V | V | 2.5 | 20 |
| 0.75× | 0.375 V | 0.75 V | 1.875 | 15 |
| 0.5× | 0.25 V | 0.5 V | 1.25 | 10 |

This setting table describes level 20. V is the width-calibrated baseline above. The upgrade description and otherwise hidden rack label quote nominal rates; neither adjusts its text for this setting. The helper cooldown clock does **not** use the conveyor-speed multiplier, so slowing the conveyor does not slow helper timers in the same way.

## What gets spawned

Each spawn rolls for special drops first. Without fairy effects:

- Pushcat ticket probability: **1/101 = 0.990099% per spawn**.
- During an active event, Miracle Solution probability: **1/101 = 0.990099% per spawn**.
- Ordinary material probability: **100/101 = 99.009901%** outside an active event; **99/101 = 98.019802%** during it.
- One spawn is one item; ticket and Solution cannot both come from the same spawn. These are adjacent ranges of one roll, not independent extra rolls.
- An event lasts 15 minutes, followed by a 5-minute redemption break. No new Solution spawns in the break, and old uncaught Solution items are cleared when the event expires.
- A caught ticket grants 1 ticket. A caught Solution grants 1 event token only while the event is active. They do not start a potion or add potion value. Each item can pay out once.

Expected special items **spawned**, before catch losses, at the default speed:

| State | Spawns/min | Tickets/min | Solution/min during active event |
|---|---:|---:|---:|
| Level 1, empty or filled | 30 | 0.297 | 0.297 |
| Level 10, empty or filled | 600 | 5.941 | 5.941 |
| Level 20, empty | 150 | 1.485 | 1.485 |
| Level 20, filled | 1,200 | 11.881 | 11.881 |

At level 20 while filled and an event is active, ordinary materials average about **19.604/s**, not a guaranteed 20/s. Outside the event they average about **19.802/s**. Random counts vary. Slower conveyor settings multiply all these rates by the selected factor.

## Material selection and fairies

After a spawn is known to be an ordinary material, all unlocked family/tier pairs are equally likely by default. There is no highest-tier preference. Family weight equals its unlocked tier count, then a tier is selected uniformly within that family. With Life tier 25 unlocked but only tier 1 for Mana and Stamina, Life gets 25/27 of ordinary materials, and every individual unlocked material gets 1/27. With all 75 unlocked, each gets 1/75 and each family 1/3.

Only the equipped fairy's effects apply, interpolated between its level-1 and level-10 values:

- Surprise-Pong and Happy-Pong increase Mana and Life weights respectively by 5–50%. Amaze-Pong increases Mana/Stamina by 2.5–25%; Angry-Pong increases Life/Mana by 2.5–25%. These multiply weights before normalization; they are not direct percentage-point increases.
- Arch-Run, Gentle-Poong, and Behe can increase the weight of the exact material required by the first active traveler order. The weight multiplier is `1 + questMaterialWeight`. This does not favor a commission or every order simultaneously.
- Thief-Run, King-Poong, and Behe can improve ticket frequency. The formula is `min(0.5, (1/101) / (1 - ticketSpawnReduction))`. A 20% reduction gives about **1.237624% tickets**, not an extra 20 percentage points. Solution probability stays the same.
- Material-value fairies increase the value of caught added ingredients; they do not increase the spawn count. Permanent selling upgrades change sale value, not emission. The retained ruby-upgrade save fields do not modify this conveyor's emission calculation.

## Catching and potion state

- Clicking a material or pressing a visible material shortcut catches that particular item and removes it.
- The first material starts its own family/tier recipe at that recipe's base value. Later materials, including other families or tiers, add value to the existing potion; they do not change its recipe or level.
- Added value is `material value × (1 + equipped fairy materialAmount)`. Raising emission helps only if more materials are actually caught.
- A MAX potion still counts as filled and can keep gaining material value.
- During the three-second base enhancement attempt (shortened by certain fairies), the conveyor keeps moving and spawning at the filled rate. Ordinary material collection is refused, for both player and helpers. Special drops can still be collected. Helpers' working time continues to elapse.
- Selling, delivering a quest/commission potion, or losing a potion returns the belt to the empty cap on its next update. A protected failure leaves a potion, so the filled rate continues.
- Keys 1–6 catch the first six currently eligible items in the belt's stored order (oldest first), including special items. Because the track is mirrored, this is not a simple left-to-right screen ordering. Hover/focus raises the card above neighboring artwork.

## Helpers

Up to eight helpers occupy separate randomly selected free stations. A helper collects only an item passing within 12 px of its own catch point; it does not vacuum the whole rack. Normal Pushcat starts at one catch opportunity per second; its upgrade reduces that interval to 0.3 seconds at helper level 15. Blackcat is twice as fast. Fairy and event effects can change helper timing, duration, and summon odds independently of emission.

A ready helper waits if nothing catchable is overhead. After a successful catch its cooldown resets. Helpers can collect tickets and Solution while brewing. When the cauldron is empty, helper working time and cooldowns pause, and they do not start a potion by themselves. A higher emission rate supplies more opportunities; it does not guarantee every spawn is caught.

## Pausing, saves, and debug mode

- Emission and helper collection run while the document is visible. Opening a game menu does not pause them. Hiding the document does.
- Frame gaps of 2,000 ms or more are skipped. Shorter gaps are processed in steps of at most 25 ms, keeping emission/helper interactions consistent across ordinary frame rates.
- There is **no offline material backlog or automatic offline material income**. Returning after a hidden period does not dump missed spawns onto the rack.
- The upgrade index is saved; current conveyor items, their positions, serial numbers, and the partial spawn countdown are not. Reload/import/new-game builds a fresh buffer. Resizing preserves the live buffer and shifts it with the track width.
- The conveyor-speed and reduced-motion preferences are saved separately as settings. Debug exact-ingredient mode is not persisted; startup returns to conveyor mode.
- In debug mode, chosen ordinary materials are clickable directly without waiting for emission. Ordinary random belt items continue to be simulated but hidden, while special drops remain visible. The debug belt uses the same width-calibrated movement speed even empty; its spawn rate still uses the empty 10/s cap until filled. This mode deliberately bypasses normal material supply.
- Reduced motion rounds rendered item positions to the current spacing grid. It changes the presentation, not the underlying count or catch rules. Drop visual effects are capped separately and do not change rewards.

## Current practical limitations

The fastest rate still produces overlapping artwork. For a 500 px rack, movement is about 186.67 px/s and level-20 spacing is about 18.67 px empty / 9.33 px filled. The clickable card width is `max(2, min(58, spacing - 2))`; its visible icon is roughly 46 px on phones or 59 px on desktop. About 27 empty / 54 filled slots fit in the track, plus the cleanup margin. There is no hard slot-count limit. Full-traversal performance on low-end devices was not profiled.

The spawn rate is therefore not equal to collectible throughput, actual income, or 20 ordinary materials every second. Special replacements, misses, enhancement downtime, helper availability, debug mode, settings, and visibility all matter.

Gold shop quotes use the full owned emission rate, permanent selling upgrades, and highest owned material value. They do not use the empty cap, the slowdown setting, temporary buffs, or actual caught-material throughput.

## Verification and source map

A deterministic 10-second run (25 ms updates, 480 px track) produced exactly 10/100/100 new empty spawns and 10/100/200 filled spawns at levels 1/10/20. At level 20 filled, the 0.5×, 0.75×, and 1× settings produced 100, 150, and 200 new spawns respectively. Initial buffer items were excluded from those counts.

- `data/economy.json`: rates, prices, probabilities, helper rules, currency units.
- `source/core.js`: `emissionRate`, `MaterialConveyor`, `collect`, `advanceHelper`, and shop quote formula.
- `source/app.js`: `animate`, `syncBelt`, `startBelt`, manual mode, shortcuts, settings, and visibility handling.
- `source/index.template.html` / `source/original-mobile-ui.css`: mirrored track and artwork/hit-target presentation.

The Bank is removed from UI and engine APIs. The shared currency units remain **10 tickets = 1 ruby**, and the product tests verify bundle round trips do not create currency. No save schema migration is required for this removal.

## Constant-speed density update verification

Core checks simulate level 1 for 60 seconds across rack widths 0, 152, 240, 320, 456, 760, and 1200 px, including resizing. Every sample retains at most three live slots; level 20 exceeds three naturally. Empty/filled movement is identical. Existing level-1/10/20 ten-second cadence assertions, UI, economy, helper, settings, and offline build checks pass. Browser inspection confirms the level-1 spacing on desktop (about 520 px track) and phone (about 308 px track), before and after starting a potion. No original assets or upgrade prices were changed.

## Latest slowdown verification

Deterministic ten-second checks verify 5/5 new arrivals empty/filled at level 1, 100/100 at level 10, and 25/200 at level 20. Core checks confirm half movement speed for level 1 and empty level 20, doubled maximum-empty spacing, unchanged levels 2–19, and the level-one maximum of three slots across rack widths/resizes. Earlier verification entries above describe their historical runs, before this slowdown.
