# Shop UI redesign

The existing shop now uses Chests, Boosts, Exchange and Gold tabs inside the original pink ornamental frame. Only products scroll; title, navigation, balances and tabs remain visible. Desktop currency bundles use two columns, narrowing to one column on phones. The current category is remembered when reopening during the session. Chests is the initial category, with a live Free ready badge.

## Inventory and purchasing

All 16 offers remain accessible: three chests, one Enhancement Pack, eight exchange bundles (four Tickets → Rubies and four Rubies → Tickets), and four Rubies → Gold bundles. Costs come from rewardCost and shopProductCost; purchases still use openReward and buyShopProduct. Enhancement quantities are read from product.grants, not copied into a separate price table.

Cards distinguish Available, Insufficient currency (with exact shortfall), Free ready, Free cooldown, paid chest quota exhausted, no eligible outfits and inventory/balance limits. Free claims and paid openings keep their independent existing rules. Contents & odds retains the original chest reveal and probability information. A short per-product UI guard ignores duplicate click events; it creates no new saved purchase limit or economy cooldown. The existing rewardBusy guard still protects chest openings, with rewards committed before animation.

Gold, ticket and ruby balances are read directly from game.state. Large values are compact, extreme values use scientific notation; full exact values are available by tapping any balance, as well as in accessible labels/tooltips. Back to menu returns to the menu grid; Close exits the overlay, so the two controls have different behaviors.

## Changed files

- source/app.js — categories, card rendering, live balances/exact-value dialog, purchase states and click guards; modal purchase reason labels.
- source/index.template.html — shop header, tabs and category panels.
- source/original-researched-ui.css — scoped shop layout, cards, responsive rules and states.
- source/check-shop-ui.cjs — repeatable isolated Edge browser checks and screenshots (Node with built-in WebSocket and local Edge required).
- Potion-Maker.html — rebuilt offline game.
- research/shop-ui/ — screenshots, QA results and preserved-file hashes.

No changes to source/core.js, source/storage.js or data/economy.json: SHA-256 values match the pre-change snapshot in shop-preserved-hashes.json. Existing inventory, prices, rates, quantities, rewards, cooldowns, paid limits, purchase history and save schema are preserved.

## Validation

Passed: all 13 fixed products through actual UI buttons; exact grant/cost deltas for both exchange directions and all gold tiers; duplicate-click protection; all 13 insufficient-funds refusals without mutation; inventory caps; live balances; free chest cooldown; three paid openings and refusal after the limit; a free claim still allowed when the paid quota is exhausted; Ticket/Ruby Case purchase paths; all category panels; keyboard arrow navigation; selected-category retention; distinct Back/Close/reopen behavior; exact-value dialog; validated save/reload including chest history.

All four categories checked at 1920×1080, 1366×768, 1024×768, 390×844 and 320×640 (20 layout checks). Headers and tabs remain onscreen, product buttons and balances fit, only content scrolls and no horizontal overflow occurs. Very large balances, including 1e300 gold, retain exact access without clipping. Browser runtime errors: none.

Existing regression checks: check-ui.cjs, check-economy.cjs, check-storage.cjs and check-build.cjs. The generated HTML remains below GitHub's regular-file limit.

Screenshots: Shop-Before.png; Shop-After-Chests.png; Shop-After-Exchange.png; Shop-After-Gold.png; Shop-After-Mobile.png. Detailed assertions: shop-redesign-qa.json.

No known blocking issues. Browsers other than Edge and manual screen-reader output were not checked. Tests use fresh temporary browser profiles and never load the player's real browser storage.
