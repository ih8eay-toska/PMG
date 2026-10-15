# Potion Maker — local recreation, version 0.6

Open **Potion-Maker.html** in Edge, Chrome, or Firefox. The playable game embeds its code, data, original icons, character portraits, and optional theme music. It needs no installation, server, account, or internet connection.

Open **Asset-Library.html** to browse the local asset archive. Keep it beside the **assets/** folder. Its source links visit Fandom only when clicked.

## Gameplay additions

- Personal balance adjustments now replace wiki multipliers for 17 potions through tier 12. See **research/balance/APPLIED_EARLY_MIDDLE.md** for scope, original values and the unresolved late-game boundary.
- All 75 potion entries can be brewed and enhanced to their recorded maximum level. The formerly missing values are supplied by https://potion-maker.fandom.com/wiki/Potions. Home MP and Small MP use that page’s internally consistent multipliers.
- Material progression now extends to 25 tiers in each family, with recorded values and family-specific enhancement tables. Unlocked materials appear randomly on the conveyor, including before brewing starts.
- Ingredients pass at evenly spaced intervals. An empty cauldron uses constant conveyor speed; Material Emission increases speed only while brewing. Ingredient selection has no highest-tier bias.
- Enhancement failure protection, +10 percentage-point enhancement charges, and double-sale charges activate automatically.
- Neet, Dolbur, and Tirami arrive randomly with potion orders. Accept starts a one-minute preparation deadline. Delivery grants the reward immediately. Expiration grants no reward and keeps the potion. Original portraits and explicitly fan-written normal-quest responses accompany the phases.
- Local theme music, potion and material books, potion-specific achievements with original titles and peak lore, persistent quest timers, and save migration.

Keyboard: **1–6** collect the first six visible ingredients; **E** enhances; **S** sells. Catch any passing ingredient to start; the belt continues after selling, failed enhancement, and quest delivery.

## Saving

The same browser storage key is retained. Save schemas 1–7 migrate to schema 8; the original JSON is retained under a schema-specific backup key before migration. Accepted quest deadlines, requests in progress, equipped fairies, and in-transit rewards survive reloads. Coins, tiers, statistics, current potion, and existing fairy progress are preserved. The intermediate luck bonus has changed because this update uses a provisional progression toward the documented maximum.

Use **Save tools → Export backup** before changing browsers, moving the HTML file, or clearing browser data. File URL storage behavior varies by browser. Imports validate data and ask before replacing progress. The asset folder is not the save-data location.

The prior project files are preserved under **backups/** when this update is installed. Those backups preserve project files, not browser storage.

## Asset archive

The local library contains **428 unique verified media files** from the public wiki file index:

- **assets/materials/life, mana, stamina/** — ingredient art.
- **assets/potions/life, mana, stamina/** — potion icons.
- **assets/characters/** — portraits and character art.
- **assets/costumes/** — costume portraits and texture atlases.
- **assets/fairies/** — fairy icons.
- **assets/powerups/** — the three consumable icons.
- **assets/ui/** — coins, tickets, and interface icons.
- **assets/audio/** — the theme track.
- **assets/references/** — screenshots, dialogue/profile images, banners, and other reference media.

Original downloaded bytes are retained. File extensions match the actual returned media type; the wiki CDN frequently returns WebP for files originally named PNG or JPG. **asset-manifest.json** records the original names/URLs, source pages where identified, local paths, MIME types, dimensions, byte sizes, and SHA-256 hashes. Five unsupported SVG/ICO files are recorded as skipped. No failed media downloads remain in the manifest.

Costume texture atlases are packed pieces, not immediately usable full-character images or animation definitions. Reference screenshots are not treated as individual sprites. The source index is archived in **research/wiki/file-index.json**.

## Accuracy and remaining gaps

See **research/MECHANICS.md** for sourced rules, uncertain behavior, and the next comparison work. The wiki is old and incomplete; this build is not verified against a specific iOS game version.

Still provisional: upgrade costs/intermediate increments (retained at the player’s request), exact conveyor speed and emission scaling, uniform ingredient probabilities, sale rounding, enhancement duration, visitor scheduling intervals and potion-order distributions. The player confirmed additive ingredient values, randomized arrivals, and one-minute accepted-quest deadlines. Reward amounts are sourced from the wiki; this prototype grants them immediately as requested. All normal-quest response lines in data/visitor-dialogue.json are labeled fan-written because complete original transcripts are unavailable.

Fairies can now be equipped one at a time. Repeats raise a fairy by one level each, to level 10; because the wiki does not publish duplicate EXP thresholds, this is a simple estimate. Supported passive effects change ingredient family odds/value, potion enhancement chance/multiplier/sale value, enhancement failure protection chance, and visitor timers. Lv 1-to-10 values interpolate linearly where the wiki supplies both endpoints. Effects for enhancement animations, Pushcat/Blackcat, timed tickets, and quest material rates await those systems. Costumes and character animation rigs, rubies, event quests, and challenges are also not implemented.

## Source and rebuilding

**source/core.js** contains the gameplay model; **source/app.js** contains browser interaction; **source/index.template.html** contains the UI. **data/game-data.json** holds normalized numerical wiki data. **research/wiki/** contains cached article responses, revision IDs, and the file index.

Rebuild the offline game and library with Python: `python source/build.py`.

Run gameplay checks with Node: `node source/check-core.cjs`.

The delivered game needs neither runtime. Python is only needed to rebuild; Pillow is needed only for asset scraping/validation.

Game/artwork credit: Sinsiroad and original artists. Music credit follows the game's original credits; the wiki identifies DOVA-SYNDROME as composer. Wiki documentation is credited to its contributors. The wiki's text license is not assumed to license all media. This remains an unofficial personal prototype with no uploaded progress or hosted service.

## Added visitors and fairy collection

Claire, Luke, Piria, Charlotte, Demian, Daisy and Kyle join the three existing travelers. For this temporary personal-game mode, each added visitor offers a normal one-minute potion order and brings one uniformly random fairy from the 35 regular wiki fairies immediately after delivery. Original portraits are bundled; Charlotte and Daisy use the archived happy/disappointed expressions. Existing Neet, Dolbur and Tirami powerup rewards remain unchanged.

The Fairies screen records owned types and duplicates, and lets you equip one fairy at a time. Each duplicate raises its inferred level by one, up to level 10; the wiki does not publish the exact EXP thresholds, so this is a simple estimate. Supported fairy boosts affect ingredient family odds/value, enhancement chance/multiplier, potion sale value, failure protection, and visitor timers. Some abilities still need absent systems such as enhancement animations, Pushcat/Blackcat, timed tickets, and quest material rates. Reward choice is frozen on delivery and saved, preventing rerolls or duplicate payouts on reload. Save schema 8 preserves older progress and in-flight rewards; old saves are backed up before migration.

## Statistics

The Statistics screen shows preserved lifetime totals plus detailed tracked counters for coins earned/spent, brews, level-1 sales, enhancement successes/failures, protection use, lost potions, upgrades, active visible play time, visitor offers/acceptance/delivery/failure/declines, collections, current upgrades and consumables. Tables break records down by family, all 75 potions and all ten visitors. The wiki Achievements categories provide the reference counters; unsupported systems display as unavailable rather than invented zeroes.

Schema 5 preserves earlier totals and starts detailed tracking at migration. Older saves cannot reconstruct prior income, successes or per-potion activity; the screen explicitly labels the tracking date and partial history. Active play time excludes hidden-page and closed-page time. Autosave runs every 15 seconds as well as after actions and on pagehide.

## Visitor progression and requests

Successful visitor orders now award EXP by potion family and material tier. Visitor levels follow the wiki's documented thresholds through level 12 and unlock all 35 documented normal requests at levels 1–10. Requests deduct their documented coin cost immediately, run on a persistent timer, and award recorded likeability plus the listed chance-based coin, ticket, powerup, or named-fairy rewards. Likeability is stored as an aggregate because the wiki does not say whether those points apply to Pio or Tia. The quest EXP table contains unknown entries; those are interpolated between the nearest documented values and labeled as estimates.

Requests are available from the Request board after active visitors are dismissed. The original ruby menu and starting a request mid-quest are not implemented; visitors cannot arrive while another visitor is on a request. Event requests are also archived. Request reward odds are the wiki's base odds at the recommended level and are not adjusted for visitor level.

## Save and regression repairs

Schema 8 recognizes both earlier version-6 formats, retains legacy mastery records, and recovers fractional fairy-adjusted timestamps from older saves. New arrival/deadline timestamps are whole milliseconds. Imported request rewards must match the request definition and visitor levels must match EXP. Failure to write an optional migration backup no longer prevents a valid shop from loading.

Return-duration fairy abilities now shorten newly started requests; instant potion-order rewards remain instant and existing request timers are unchanged.

Run all Node checks with `npm test` (no dependency installation needed). The local CommonJS package boundary keeps these checks working inside a parent ES-module project. Checks cover core behavior, storage failure recovery and the compiled offline HTML.

## Rendering and saves

The workbench retains upgrade buttons, powerups, unchanged visitors and the current bottle between actions. Statistics reuse their rows and update the play clock separately. Conveyor accessibility labels change when visible slots change; its width is measured on resize. Rapid actions share a save write after 250 milliseconds; export, import, reset, page exit and hiding the page flush immediately. A forced browser or computer crash during that short window can lose the most recent action.

Run `python source/rendering-qa.py`, open the generated `Rendering-QA.html`, and click **Run rendering checks**. It uses a separate disposable save and checks retained elements, timer updates, keyboard access, batched writes and the exit flush. It never reads or replaces the main game's save.

## Conveyor Pushcat tickets

Each new conveyor slot has a 1/101 chance to contain one Pushcat ticket instead of an ingredient: about 100 ingredients per ticket on average, not a guaranteed interval. Ticket odds are independent of material tiers and fairy family-odds bonuses. Tickets share ingredient spacing and speed; click or use the corresponding 1–6 shortcut to collect +1 ticket without changing the potion or ingredient counters. Missed tickets leave the belt normally. Collected tickets use the existing balance and save format.

Exact-ingredient mode offers materials only. Switching modes preserves the conveyor items and pauses its movement while manual selection is active, preventing free ticket rerolls and keeping moving slots out of manual selection. Importing a shop or starting a new shop resets the belt as before. This adds ticket income; the full economy has not been rebalanced around it.

Browser regression: run `python source/conveyor-qa.py`, open `Conveyor-QA.html`, click **Prepare ticket test**, collect the ticket with the mouse or key 1, then click **Verify ticket test**. The fixture uses a separate save key and checks one-time rewards, unchanged potion/counters, manual mode isolation, mode-switch preservation and saved tickets.
