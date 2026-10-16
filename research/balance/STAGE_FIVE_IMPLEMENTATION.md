# Step 5 — live economy integration

17 October 2026. The selected stage-four candidate is integrated into the source and rebuilt offline game. No browser storage was opened or changed by this work. Existing saved gold and in-progress potion values are retained when loaded.

## Applied rules

1. **Brewing and upgrades:** all 75 recipe tables and ingredient values come from the selected candidate. Explicit material/luck/selling/emission cost tables replace exponential prices. Family mastery gates apply only to future purchases; existing tiers remain unlocked. Tia still requires 20 unique stars. Normal luck grants 0.4 percentage points per level, with the existing 99% final cap. Fairy chance bonuses use the proposed scale; fairy enhancement multipliers are distributed across a recipe's steps.
2. **Bank and cases:** core validates ticket/ruby exchange pairs and whole safe bundles; gold is not exchangeable. Ticket cases cost 10 tickets, ruby cases 30 rubies. Event costumes remain excluded; duplicate skins grant 300 tickets. Maxed fairy collections convert fairy outcomes to five tickets. A character without eligible skins cannot be charged for a ruby case.
3. **Boost chest:** one free opening per wall-clock hour, plus three paid openings per fixed 20 active-minute window. Each opening grants three charges of one random boost type. Highest-owned-tier price bands are 50 / 250 / 1,000 / 4,000 / 16,000 gold. UI prices, quota, free timer and disabled state use core methods. Rewards and paid counters are saved before the reveal; reduced motion does not bypass quotas.
4. **Visitors and requests:** new orders freeze two tickets and a random 1–3 boost charges when offered, then pay after the existing 30-second return. No automatic ruby is added to new offers. Requests retain their identities, durations, odds and likeability; costs follow the new level table and new level-one coin rewards are 125 gold. Existing request results retain their saved amounts.
5. **Gathering and presentation:** empty-cauldron conveyor gathering is four times as fast, with per-item currency odds divided by four in that state. Brewing emission remains unchanged. Manual mode has a separate special-drop strip; keys 1–3 choose ingredients and 4–6 catch special drops. Core keeps visible emissions through longer frame updates. Upgrade locks show required family mastery, fairy details show current effects, and help/catalog copy describes the new rules. Fractional added ingredient values are shown rather than rounded down to zero.

## Save compatibility required by this integration

The live save format is version 15. Versions 1–14 remain accepted. On loading an older save, storage writes the untouched raw save to its versioned backup key before allowing normal saves to replace it. If the backup cannot be written, the original remains protected from overwrite and the UI offers export/import recovery.

- The new paid-window counter is validated against accumulated active play and survives reloads. Existing active-play totals are retained.
- Old version-14 offers/active orders retain their promised one-ruby reward. Returning rewards retain their saved boost quantity and pending ruby. Already completed orders do not pay again.
- Older returning fairy rewards remain deliverable when still represented in the old save; legacy fixed boost rewards are retained. New offers use the new pool.
- Pending requests may retain the former 2,000-gold coin result. The loader accepts that known historical amount on later reloads, preserving the frozen outcome without rerolling it.
- Existing gold, tickets, rubies, stars, Tia, outfits, fairies, ordinary upgrades, detailed records and the current potion are retained. No legacy-gold rescaling is implemented or approved.

## Files and provenance

Runtime rules are in `source/core.js`; UI in `source/app.js` and `source/index.template.html`; backup behavior in `source/storage.js`. The offline builder embeds the revised `data/economy.json` and `data/game-data.json` into `Potion-Maker.html`.

`integrate-stage-five.cjs` publishes tables from `stage-four-candidate/candidate.json`. `stage-five-before.json` preserves the prior data/config, and `stage-five-before-core.js` preserves the previous built runtime. `research-runtime.cjs` loads that archived engine for historical calculations. The historical solver's core consumers are pinned to it; current live gameplay uses `source/core.js`. Research reports written before integration remain historical evidence.

## Build status and remaining step 6 work

Syntax checks passed for core, app and storage. The offline build completed with 332 embedded media files. No gameplay suite, browser visual check, save round-trip exercise or fresh pacing simulation was run during this integration step.

Step 6 must update superseded live numeric fixtures and verify:

1. Old-save backups, both historical version-6 formats, pending legacy/new rewards, v15 round trips, preserved unlocks and unchanged balances.
2. Paid opening limits across reloads, window boundaries and reduced motion; independent free cooldowns; dynamic prices; inventory-cap and affordability rejection before charging.
3. Family mastery gates, new brewing/fairy arithmetic, Bank pair/rounding limits, exact case probabilities, duplicate conversions and event/current-character eligibility.
4. Manual special drops, mode changes, keyboard controls, expiration of event drops and visible frame/emission behavior.
5. Integrated pacing and presentation. The research conveyor median was 5.37 minutes per middle purchase, above the 3–5-minute target; input speed and player policy still affect progression. Human timing has not been measured.

Legacy-gold purchasing-power examples remain necessary before proposing any currency conversion. This step changes future rules and provides compatibility handling; it does not establish that the full verification stage is complete.

## Step-six outcome

Automated verification and rebuild now pass; three small runtime fixes were required. Browser visual inspection is still pending because the browser tool blocks local file URLs. See [the step-six report](stage-six-verification/REPORT.md) for coverage, current progression measurements and remaining limits.
