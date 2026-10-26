# Event rewards and shop economy options

This is a local-code audit and design proposal. Only cumulative event-grade rewards and their boosts are implemented in this pass; proposed chest/helper changes below are not applied.

## Current verified numbers

- Exchange in either direction: 1 ruby = 10 tickets. Regular selected outfit: 200 tickets = 20 rubies. Enhancement Pack: 3 rubies for 5 enhancement + 3 protection charges.
- Pushcat: 1 ticket buys 60 seconds of working time. Eight cats use 8 tickets per working minute, or 120 tickets = 12 rubies for 15 working minutes. Paused/empty/MAX/event-potion time does not consume helper working time. Blackcat occurs at base 5% and works twice as fast; upgrades and fairies also matter.
- Base conveyor ticket opportunity: 1/101 per emission. At 1, 3 and 20 emissions/s, expected ticket opportunities are 0.59, 1.78 and 11.88/minute. These are opportunities, not guaranteed catches; empty belts cap at 3 emissions/s and fairy modifiers can change rates. Late-game ticket opportunities can already exceed eight cats' running cost.
- Supply chest: one free opening per hour; a roll gives 3 of one boost type. Three paid gold openings per 20 active minutes; price rises by unlocked material tier.
- Ticket chest: costs 10 tickets; 5% fairy roll, expected 6.1 tickets + 0.26 rubies in currency per opening = 8.7 tickets' value, plus fairy progress. With all fairies maxed, the fairy roll becomes 5 tickets, increasing expected currency to 8.95 tickets. These expected values are long-run averages, not guarantees or the value of progression.
- Costume chest: costs 30 rubies; 1% costume, 19% fairy and 80% ruby outcomes. Expected ruby return is 23.25 per roll, before fairy/duplicate compensation. A costume roll averages 100 openings: 3,000 rubies gross, roughly 675 net currency spent after ruby returns, ignoring fairy value and compensation. A NEW outfit takes longer if the random costume pool already contains owned items. Directly choosing an eligible ordinary outfit costs 20 rubies' value, so this chest is poorly positioned as a costume purchase.
- Original achievements total 253 rubies, earned once. Events now provide recurring ruby income.

## Implemented event rewards

| Final grade | Deliveries | Total rubies | Extra grade boosts (protection/enhancement/selling) | Existing checkpoint boosts of each type |
|---|---:|---:|---|---:|
| C | 1–49 | 1 | 0 / 1 / 0 | floor(deliveries / 5) |
| B | 50–99 | 3 | 1 / 1 / 0 | 10–19 |
| A | 100–149 | 6 | 1 / 1 / 1 | 20–29 |
| S | 150+ | 11 | 3 / 3 / 3 | 30–36 at the pilot's 180-opportunity maximum |

At exactly 150 deliveries, a player earns 11 rubies, 33 of EACH boost including checkpoints, and three costume-or-voucher choices. Eleven rubies can become 110 tickets, funding 13.75 minutes of eight-cat working time. An uninterrupted 20–21-minute event/packing/break cycle gives an upper bound of about 31–33 event rubies/hour at consistent S grades; conversations, misses and normal brewing reduce actual throughput. B gives 3 rubies and one costume choice at 50 deliveries; A gives 6 and two at 100. The boost shop is consequently a convenience purchase, not an essential upgrade path for regular event players.

## Plan 1 — preserve mechanics, make spending honest

Keep prices, odds, exchange and helper costs. Rename the 30-ruby costume chest to a clearly described mixed lucky chest, display odds and currency expectations before buying, and place the 200-ticket choose-your-outfit option beside it. Do not imply that a costume is a likely outcome. Retain the supply chest as a convenient free/gold source. Optionally grant 5–10 tutorial tickets once so beginners can try helpers without needing a chest win.

Lowest implementation risk. It fixes misleading positioning but retains long unlucky streaks and the weak value of chasing costumes via the mixed chest.

## Plan 2 — give every chest a useful job (recommended)

- Supply chest: retain its current free/gold role. Do not raise event grade boosts further until actual usage is measured.
- Fairy chest: retain the 10-ticket price and fairy focus. Add a visible guarantee by 20 openings without a fairy; choose only non-maxed fairies. Pause this offer when every fairy is maxed. Recalculate payouts/expected value before implementation because replacing a roll at the guarantee changes the distribution.
- Wardrobe chest: replace the mixed 30-ruby draw with a 15-ruby guaranteed random UNOWNED ordinary outfit. Keep selected outfits at 200 tickets = 20 rubies. Disable it when its eligible pool is exhausted. No duplicate conversion, currency jackpot or event-voucher outfits inside it.
- Helpers: retain 1 ticket per working minute, max eight and existing pause rules. Give a small one-time tutorial allowance rather than lowering recurring costs; late-game emissions can already support the crew.
- Vouchers: reserve them for event outfits; no voucher-to-ruby/ticket conversion. Existing free/owned skins remain free/owned.

Fifteen versus twenty rubies is a proposed 25% discount for accepting a random outfit, not a recovered original-game rule. Existing currency balances and ownership would be preserved in any future migration.

## Plan 3 — make active play the main economy

Keep the newly implemented cumulative ladder and preserve helper pricing. De-emphasize paid random chests: offer clear fixed boost purchases, the chosen-outfit catalog and a separate deterministic fairy progression path. Use the free supply chest as a small bonus. Measure rubies earned/spent per hour, helper tickets caught/spent and boost consumption over several sessions before changing any quantities. If inventory balloons, first propose reducing the EVERY-FIVE-BOTTLE checkpoint frequency or rotating its single boost type; do not silently remove rewards or nerf the approved grade ladder.

This produces a more generous cozy game with less chest variance, but needs more playtesting and product changes than Plan 2. Do not turn surplus costume vouchers into another unlimited premium-currency source.

## Recommendation

Start with Plan 2's wardrobe chest and tutorial helper allowance, then add the fairy guarantee after checking its exact expected value. Keep current event rewards for several real 15-minute sessions before adjusting checkpoint income. No proposed shop, chest odds, helper prices or tutorial grants have been changed by this audit.
