# Potion Maker — local recreation, version 0.6

Menu implementation standard: [UI design system and complete screen inventory](UI_DESIGN_SYSTEM.md).

Latest accumulated update: [changes since f67f158](research/releases/2026-10-25/CHANGES.md), [current verification](research/releases/2026-10-25/CHECKS.md), and [prepared player mail](research/releases/2026-10-25/IN-GAME-MAIL.md). Older narrative sections below include historical behavior; the release audit identifies superseded settings/rates and remaining APK fidelity gaps.

Open **Potion-Maker.html** in Edge, Chrome, or Firefox. The playable game embeds its code, data, original icons, character portraits, and optional theme music. It needs no installation, server, account, or internet connection.

Open **Asset-Library.html** to browse the local asset archive. Keep it beside the **assets/** folder. Its source links visit Fandom only when clicked.

## Build size and GitHub uploads

The offline HTML now uses verified lossless wardrobe compression and shared embedded style artwork. See [build-size measurements and rebuilding instructions](research/BUILD-SIZE-OPTIMIZATION.md). Rebuilding requires `py -m pip install -r source/requirements-build.txt`, then `py -B source/build.py`. The first build creates an ignored cache in `dist/texture-cache/`.

Use GitHub Desktop or Git for the playable HTML: it is below the 100 MiB Git file limit, but above the website upload interface's 25 MiB limit.

## GitHub Pages updates

Every push to `main` runs `.github/workflows/pages.yml`. It first generates the ignored lossless-texture verification cache using the existing pinned build dependency, verifies the committed offline HTML, copies `Potion-Maker.html` to `gh-pages/index.html` while retaining branch history and `.nojekyll`, then deploys that same file through GitHub Pages. The Pages publishing source is **GitHub Actions**; the branch is also maintained as a mirror. No personal access token or new repository secret is required by the workflow.

When game source or data changes, rebuild and commit `Potion-Maker.html` before pushing. The workflow refuses a stale build. Local commits alone do not publish until pushed. You can also run **Publish Potion Maker** manually from Actions. Deployment runs are serialized so overlapping pushes cannot overwrite the mirror simultaneously.

## Gameplay additions

- Pio's free **Shinobu Oshino Sundress** fan costume appears beside Default in the wardrobe. It uses a new white-and-pink dress texture, retaining Pio's face and purple hair. The straw hat was removed on request. [Artwork prompts, references, rig limits and verification](research/custom-costumes/shinobu-sundress.json).
- Personal balance adjustments cover 47 potions across tiers 1–25: the existing 17 early/middle tables plus 30 late-game tables. Late changes buff multipliers and some success chances, connecting every unlock without reducing earlier values. See **research/balance/APPLIED_LATE_GAME.md** for scope, exact arrays, checks and limitations; **APPLIED_EARLY_MIDDLE.md** records the preserved earlier pass.
- All 75 potion entries can be brewed and enhanced to their recorded maximum level. The formerly missing values are supplied by https://potion-maker.fandom.com/wiki/Potions. Home MP and Small MP use that page’s internally consistent multipliers.
- Material progression now extends to 25 tiers in each family, with recorded values and family-specific enhancement tables. Unlocked materials appear randomly on the conveyor, including before brewing starts.
- Ingredients pass at evenly spaced intervals. Movement is calibrated to rack width. Level 1 runs at half speed with one arrival every two seconds, naturally fitting at most three items. Level 20 empty runs at half speed and half its former spatial density (2.5 arrivals/s); filled remains 20/s. Levels 2–19 retain their prior behavior. Ingredient selection has no highest-tier bias.
- Enhancement failure protection, +10 percentage-point enhancement charges, and double-sale charges activate automatically.
- All ten travelers arrive randomly with potion orders. Accept starts a randomized 45–90-second preparation deadline. Delivery grants the reward immediately. Expiration grants no reward and keeps the potion. Completed and failed visits end automatically without a goodbye prompt. Original portraits and explicitly fan-written normal-quest responses accompany the phases; each visitor has five fan-written request-and-flavor pairs. Character-neutral documented request lines remain in the offer pool; Tirami's Pio/Tia-addressed challenge lines are preserved separately so the offer never changes with the equipped outfit.
- Local theme music, potion and material books, potion-specific achievements with original titles and peak lore, persistent quest timers, and save migration.

Current emission rates, all upgrade prices, special-drop odds, settings, helper interactions, and limitations are documented in **research/MATERIAL_EMISSION.md**.

Keyboard: **1–6** collect the first six visible ingredients; **E** enhances; **S** sells. Catch any passing ingredient to start; the belt continues after selling, failed enhancement, and quest delivery.

The offline Shop offers 13 locally implemented products (APK server-provided contents are not verified): an Enhancement Pack (5 enhancement and 3 protection charges for 3 rubies), four ruby bundles, four ticket bundles, and four gold bundles. Ticket/ruby prices follow the shared 10-ticket-per-ruby rate without bundle discounts. Gold prices are local balance choices, not recovered store prices: one ruby buys 60 seconds of base material value at the highest owned material tier, the owned emission rate, and the permanent selling-upgrade multiplier; bundle costs round up. Temporary boosts and fairies do not change these quotes, and gold cannot buy premium currency. Products credit existing saved balances immediately. The old Bank UI and direct exchange action have been removed; only the shared 10:1 bundle pricing remains.

Original `enhancing.png` (5×5), `enhanced.png` (5×3), `enhance-failed.png` (4×4), and `plop.png` (4×2) sheets now accompany the corresponding cauldron events. Playback follows the current enhancement duration and brief result/drop effects; the original APK timing is not confirmed. Reduced motion uses static frames, and rapid drop effects are capped at three overlapping sprites.

## Saving

The **Save & backup** screen separates **On this device**, **Backup & transfer**, and **Recovery**. The default page shows autosave status and three compact manual snapshots. Snapshot names can be changed when updating a snapshot. File backups are the main transfer option; save codes are available under “Use a save code instead.” Recovery contains the previous shop and the separate start-over action. Storage keys and save formats are unchanged.

**Menu → Save** now offers three named manual slots. Each shows a timestamp, currency balances, Mastery Stars and character preview. Saving over an occupied slot or loading a slot asks for confirmation. Loading uses the existing validated import path and keeps the previous shop in the pre-import backup. Autosave still writes only the current shop; slots change only when you explicitly save to them. Names can be changed when saving a slot. These slots are local to this browser/origin and are not bundled into a single exported file: export each loaded shop separately to keep copies outside browser storage.

The same browser storage key is retained. Save schemas 1–9 migrate to schema 10; the original JSON is retained under a schema-specific backup key before migration. Accepted quest deadlines, requests in progress, equipped fairies, and in-transit rewards survive reloads. Coins, tiers, statistics, current potion, and existing fairy progress are preserved. The intermediate luck bonus has changed because this update uses a provisional progression toward the documented maximum.

Use **Save tools → Export backup** before changing browsers, moving the HTML file, or clearing browser data. File URL storage behavior varies by browser. Imports validate data and ask before replacing progress. The asset folder is not the save-data location.

Historical source files remain under **backups/**. Obsolete generated HTML, previews and scrape caches containing wiki media were removed during the original-asset migration. Backups do not include browser storage.

## Original asset library

The game now uses the owner's original extracted media instead of wiki downloads. **420 non-banner wiki media files and derived crops were removed** from the asset folders (13,249,489 bytes), along with nine obsolete embedded builds, previews and scrape caches elsewhere in the repository. The rebuilt **Asset-Library.html** catalogs 1,022 local media files with their size and SHA-256 in **asset-manifest.json**.

- **assets/extracted/** and **assets/extracted/organized/** contain original portraits, costume thumbnails, fairies, interface artwork and effects.
- **assets/original-apk/** contains original material/potion icons and brewing-scene artwork.
- **assets/audio/original-apk/** supplies original sound effects and the Main Theme WAV.
- **assets/live2d/** retains the existing repository-sourced rigs, motions and textures; these were not scraped from the wiki.
- **data/original-assets.json** maps existing game keys to original files, preserving saved costume/fairy IDs. Duplicate names for Pio/Tia costume thumbnails were matched visually against the prior previews.

All 12 historical event/promotion banners are retained from the wiki archive as an explicit user-approved exception. They remain visible in the event gallery and event dialogs; other artwork continues to use the original extraction.

Non-wiki project-generated button artwork and existing third-party audio remain, with their provenance. The removal inventory in **research/art/wiki-media-removal.json** retains metadata, not the removed media. Wiki gameplay research and citations remain as data sources; this change removes media, not gameplay records or writing.

## Accuracy and remaining gaps

See **research/MECHANICS.md** for sourced rules, uncertain behavior, and the next comparison work. The wiki is old and incomplete; this build is not verified against a specific iOS game version.

Still provisional: upgrade costs/intermediate increments (retained at the player’s request), exact conveyor speed and emission scaling, uniform ingredient probabilities, sale rounding, enhancement duration, visitor scheduling intervals and potion-order distributions. The player confirmed additive ingredient values, randomized arrivals, and randomized 45–90-second accepted-quest deadlines. Reward amounts are sourced from the wiki; this prototype grants them immediately as requested. All normal-quest response lines in data/visitor-dialogue.json are labeled fan-written because complete original transcripts are unavailable.

Costume portraits can now be bought for 1 ruby each and freely equipped from the Costume shop; ownership and the active outfit are saved. The initial outfit is free. Fairies can now be equipped one at a time. Repeats raise a fairy by one level each, to level 10; because the wiki does not publish duplicate EXP thresholds, this is a simple estimate. Supported passive effects change ingredient family odds/value, potion enhancement chance/multiplier/sale value, enhancement failure protection chance, and visitor timers. Lv 1-to-10 values interpolate linearly where the wiki supplies both endpoints. Effects for enhancement animations, Pushcat/Blackcat, timed tickets, and quest material rates await those systems. Character animation rigs, event quests, and challenges are not implemented.

## Source and rebuilding

**source/core.js** contains the gameplay model; **source/app.js** contains browser interaction; **source/index.template.html** contains the UI. **data/game-data.json** holds normalized numerical wiki data. **research/wiki/** contains cached article responses, revision IDs, and the file index.

Rebuild the offline game and library with Python: `python source/build.py`.

Run gameplay checks with Node: `node source/check-core.cjs`.

The delivered game needs neither runtime. Python is only needed to rebuild; Pillow is used for asset inspection/validation.

Game/artwork credit: Sinsiroad and original artists. Music credit follows the game's original credits; the wiki identifies DOVA-SYNDROME as composer. The visitor bell is a CC0 recording by 775noise (Freesound); its source and license note remain with the audio asset and in the in-game Sources dialog. The current ingredient plop and action sounds come from the owner-supplied original-game APK extraction; no separate license claim is made for those files. The earlier CC0 cauldron splash is retained in the archive but is no longer used by the game. Wiki documentation is credited to its contributors. The wiki's text license is not assumed to license all media. This remains an unofficial personal prototype with no uploaded progress or hosted service.

## Added visitors and fairy collection

Claire, Luke, Piria, Charlotte, Demian, Daisy and Kyle join the three existing travelers. For this temporary personal-game mode, each added visitor offers a normal 45–90-second potion order and brings one uniformly random fairy from the 35 regular wiki fairies immediately after delivery. Original portraits are bundled; Charlotte and Daisy use the archived happy/disappointed expressions. Existing Neet, Dolbur and Tirami powerup rewards remain unchanged.

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

