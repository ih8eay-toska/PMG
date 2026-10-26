# Event brewing pilot — The Shop That Would Not Sleep

Open `Potion-Maker.html`. After Tia has arrived, finish or skip the labeled opening placeholder. The Events section on the right shows the live event, supplies, deliveries and progress, replacing its legacy-event content. On narrow screens it uses the existing stacked Events section. Catch gold-ringed E supplies from the conveyor; normal brews may remain in the cauldron while collecting. Brew consumes one pouch supply when the cauldron is empty; Deliver completes one level-1 MAX event bottle. Cats ignore supplies. Event brewing does not advance normal recipes, sales, commissions, visitor orders or mastery.

## Provisional configuration

- Gathering: 900 seconds, saved wall-clock deadline starting after the opening.
- Packing: up to 60 seconds; finish early when pouch and event cauldron are empty.
- Break: existing 300 seconds. Reload/offline time advances deadlines, never collections or deliveries.
- Supplies: independent 5-second schedule, first supply immediately eligible; maximum 180 opportunities in an uninterrupted 15-minute run. No missed-spawn catch-up, upgrade/fairy rate bonus or pouch capacity.
- Every 5 deliveries in a run: the existing bundle of 1 protection, 1 enhancement and 1 selling charge.
- Every 50 cumulative deliveries: one persistent outfit-or-voucher choice. Remainder carries between runs.
- Grades: zero = No deliveries; C = 1–49, B = 50–99, A = 100–149, S = 150+. Rewards include all attained lower tiers, paid once at settlement. Per-tier additions: C 1 ruby + 1 enhancement; B 2 rubies + 1 protection; A 3 rubies + 1 selling; S 5 rubies + 2 of each boost. Cumulative totals: C 1 ruby/1 enhancement; B 3 rubies/1 protection/1 enhancement; A 6 rubies/1 of each; S 11 rubies/3 of each. Grade boosts are additional to five-bottle checkpoints. Zero deliveries pays nothing. Configuration lives in `data/economy.json`, `events.gradeRubyRewards` and `events.gradeBoostRewards`.
- Existing completed results retain their recorded ruby amount and have zero added grade boosts if the older save lacks that field. No retroactive payout or duplicate lower-grade claim occurs. New settlements save the complete earned bundle; currency/boost overflow stays pending until storage has room.
- One permanent voucher redeems one unowned eligible non-free pilot outfit. Vouchers may accumulate indefinitely. Other event pools remain held until their migration.

## Exact featured pool

| ID | Character | Existing availability |
|---|---|---|
| Pajamas_Costume.png | Pio | Existing ticket purchase preserved |
| Pajamas_Costume_Pink.png | Pio | Existing ticket purchase preserved |
| Pajamas_Costume_Blue.png | Tia | Existing ticket purchase preserved |
| Pajamas_Costume_Green.png | Tia | Existing ticket purchase preserved |
| cute-pajamas-costume-purple.png | Tia | Already free; remains free |
| cute-pajamas-costume-skyblue.png | Tia | Already free; remains free |

Free outfits are labeled in the reward chooser; players can take a voucher instead. Fan-made and static costumes are not voucher rewards. Redeeming never equips automatically or spends tickets.

## Compatibility and assets

Save schema 18 migrates schemas 1–17 through the existing validator, recovery backup, compressed transfer and named-slot paths. The event potion is a separate boolean identity in event state, not a fabricated ordinary recipe. Pending rewards record `night-order` as their origin and remain claimable during breaks and subsequent pilot runs. Failed persisted actions restore state and one-use collection tokens.

Per the user's follow-up, the 11 historical definitions remain intact and their exact `eventRotation` position/elapsed time/Miracle Solution balance is frozen. Owned skins stay owned and wearable. Historical gathering, redemption and special helper bonuses are paused. No currency conversion or bulk event migration was applied. Historical artwork and notes are available from the event page's on-hold archive.

`CostumeVoucher.png` embeds the existing `assets/extracted/coupon.png` through the build pipeline; it is byte-identical to the organized library copy. SHA-256: `68ccca27d24af0adb0a7ad1897bf90d155de7f971f65b248c37e596b24e62b74`. No new artwork or network dependency.

## Remaining work

The user-supplied 109-line dialogue revision is integrated from `data/event-rush-dialogue.json`, with Pio, Tia and Tirami, two optional milestones and five grade-specific endings. The cadence and grades need a real 15-minute playtest. Tia now unlocks free after mastering all three tier-1 beginner potions: Sample Red Potion (`0-0`), Sample Blue potion (`1-0`) and Sample Yellow potion (`2-0`), each at MAX level 3. Unrelated masteries do not substitute. Existing unlocked saves remain unlocked, and saves already meeting the three beginner masteries qualify on load. Her arrival scene still precedes events.

Next milestone: playtest a full event, including story pacing, supply frequency and repeated Brew/Deliver actions before migrating another historical event.
