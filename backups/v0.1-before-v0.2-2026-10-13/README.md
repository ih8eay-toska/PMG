# Potion Maker — personal offline prototype

Double-click **Potion-Maker.html** and open it in Edge, Chrome, or Firefox. It contains all 19 images and the game logic; internet access and installation are not needed.

Click ingredients on the shelf, enhance your potion, sell it, and spend coins on upgrades. Keyboard shortcuts: **1–6** collect ingredients, **E** enhances, **S** sells.

The game saves coins, upgrades, statistics, and the current potion in your browser. File-based browser storage varies between browsers and file locations. Use **Save tools → Export backup** before moving the game or switching browsers. If auto-save is unavailable, a message appears in the header. Save imports replace current progress only after confirmation.

## Included

- Three potion families and their first three tiers: nine potions.
- Free ingredients, probabilistic enhancement, sales, and six upgrade categories.
- Embedded ingredient/potion icons and Pio illustration from the Potion Maker Fandom wiki.
- Automatic saving and JSON backup/import.

## Fidelity and sources

This is an unofficial gameplay prototype, not recovered original code or a verified reproduction of a particular iOS version.

Potion base values, first-three-tier enhancement tables, material values, and starting-potion rules were taken from:

- https://potionmaker.fandom.com/wiki/Potion
- https://potionmaker.fandom.com/wiki/Materials
- https://potionmaker.fandom.com/wiki/Potion_Maker

Upgrade categories were informed by https://potionmaker.fandom.com/wiki/Upgrades. Character artwork is linked from https://potionmaker.fandom.com/wiki/Pio. Direct image URLs and SHA-256 hashes are recorded in **asset-sources.json**. Wiki documentation is credited to its contributors. Original game artwork is credited to Sinsiroad and its artists; the wiki's text license is not assumed to license all images.

**Prototype balance choices, awaiting phone comparison:** upgrade prices, +2 percentage-point luck upgrades, +5% selling-price upgrades, shelf capacity and refill time, sale rounding, and the interaction between added ingredients and an already-enhanced potion. These choices are exposed in the editable source. The interface and cauldron illustration are newly implemented.

Not yet included: travelers, quests, costumes, fairies, protection powerups, music, original character animations, higher potion tiers, offline earnings, or iPhone save compatibility.

## Project files

- **Potion-Maker.html** — the standalone playable game.
- **asset-sources.json** — image source URLs, MIME types, and hashes.
- **Potion-Maker-preview.jpg** — browser screenshot.
- **source/** — editable HTML template, gameplay logic, embedded asset data, build script, and logic checks.

To rebuild from editable source with Python installed: `python source/build.py`. To run gameplay logic checks with Node installed: `node source/check-core.cjs`.

The delivered HTML needs neither runtime.

## Verification

Logic checks cover starting and adding ingredients, fixed potion family, enhancement success/failure and maximum level, sale rounding, affordability and unlocks, and save validation. Browser checks confirmed ingredient collection, six sales, buying a mana-material upgrade, persistence after reload, successful enhancement, and no reported JavaScript errors in those interactions.
