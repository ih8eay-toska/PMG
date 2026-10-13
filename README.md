# Potion Maker — local recreation, version 0.3

Open **Potion-Maker.html** in Edge, Chrome, or Firefox. The playable game embeds its code, data, original icons, character portraits, and optional theme music. It needs no installation, server, account, or internet connection.

Open **Asset-Library.html** to browse the local asset archive. Keep it beside the **assets/** folder. Its source links visit Fandom only when clicked.

## Gameplay additions

- All 75 potion entries can be brewed and enhanced to their recorded maximum level. The formerly missing values are supplied by https://potion-maker.fandom.com/wiki/Potions. Home MP and Small MP use that page’s internally consistent multipliers.
- Material progression now extends to 25 tiers in each family, with recorded values and family-specific enhancement tables. Unlocked materials appear randomly on the conveyor, including before brewing starts.
- Ingredients pass at evenly spaced intervals. An empty cauldron uses constant conveyor speed; Material Emission increases speed only while brewing. Ingredient selection has no highest-tier bias.
- Enhancement failure protection, +10 percentage-point enhancement charges, and double-sale charges activate automatically.
- Neet, Dolbur, and Tirami arrive randomly with potion orders. Accept starts a one-minute preparation deadline. Delivery starts a separate one-minute reward timer. Expiration grants no reward and keeps the potion. Original portraits and explicitly fan-written normal-quest responses accompany the phases.
- Local theme music, a potion collection browser, persistent quest timers, and migration of previous prototype saves.

Keyboard: **1–6** collect the first six visible ingredients; **E** enhances; **S** sells. Catch any passing ingredient to start; the belt continues after selling, failed enhancement, and quest delivery.

## Saving

The same browser storage key is retained. Version 1 and 2 progress is migrated to version 3; the original JSON is retained under a schema-specific backup key before migration. Accepted quest deadlines and in-transit rewards survive reloads. Coins, tiers, statistics, and current potion are preserved. The intermediate luck bonus has changed because this update uses a provisional progression toward the documented maximum.

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

Still provisional: upgrade costs/intermediate increments (retained at the player’s request), exact conveyor speed and emission scaling, uniform ingredient probabilities, sale rounding, enhancement duration, visitor scheduling intervals and potion-order distributions. The player confirmed additive ingredient values, randomized arrivals, and one-minute accepted-quest deadlines. Rewards and the separate one-minute reward delay are sourced from the wiki. All normal-quest response lines in data/visitor-dialogue.json are labeled fan-written because complete original transcripts are unavailable.

Archived but not implemented: requests, fairies and their effects, costumes and character animation rigs, Pushcat/Blackcat, rubies, events, challenges, and achievements. There is no claim that downloading those assets implements their systems.

## Source and rebuilding

**source/core.js** contains the gameplay model; **source/app.js** contains browser interaction; **source/index.template.html** contains the UI. **data/game-data.json** holds normalized numerical wiki data. **research/wiki/** contains cached article responses, revision IDs, and the file index.

Rebuild the offline game and library with Python: `python source/build.py`.

Run gameplay checks with Node: `node source/check-core.cjs`.

The delivered game needs neither runtime. Python is only needed to rebuild; Pillow is needed only for asset scraping/validation.

Game/artwork credit: Sinsiroad and original artists. Music credit follows the game's original credits; the wiki identifies DOVA-SYNDROME as composer. Wiki documentation is credited to its contributors. The wiki's text license is not assumed to license all media. This remains an unofficial personal prototype with no uploaded progress or hosted service.
