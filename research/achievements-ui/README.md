# Achievements UI redesign

Implemented in the existing offline game. Original achievements and Potion Mastery now use compact, paginated parchment cards with progress bars, clear states and separate full-detail readers. Desktop pages contain 6–9 cards; smaller layouts use 2–6. Navigation, summaries and filters stay visible while one bounded card area scrolls when necessary.

Category/family filters, status filters, search, default order and closest-to-completion sorting are available. Original achievements also offer Recently claimed, using the saved claim order: completion timestamps do not exist, so none are fabricated. Default order prioritizes current claimable rewards. Completed shows previously claimed tiers, including earlier milestones. Unclaimed later tiers remain hidden until their preceding reward is claimed. Mastery retains all 75 existing titles and complete lore in details; legacy recorded stars are honored even when detailed enhancement history is unavailable.

Claims retain existing rewards, prerequisites, capacity checks and save-failure rollback. Both card and detail claims work; duplicate claims are rejected. Keyboard focus returns after details and claims. Original icons, potion sprites, text selection, accessible progress labels and large-text preferences are retained. No game tables, balance, storage or save formats were changed.

Files changed for this task:
- source/app.js — presentation state, compact cards/details, filtering, pagination and safe claim integration.
- source/index.template.html — achievements layout and detail dialog.
- source/original-researched-ui.css — scoped responsive achievements styling.
- Potion-Maker.html — rebuilt playable offline game.
- source/check-achievement-ui.cjs — repeatable isolated Edge browser verification.
- research/achievements-ui/ — screenshots, QA results and preservation hashes.

Validation:
- All 176 original rewards reached through the current-tier UI flow; exactly 253 rubies and 1,080 tickets awarded, with no duplicates. All 176 claimed entries accessible through paginated history; 46 final current goals retained.
- All 75 mastery entries browsed and their full titles/lore compared exactly. All 75 maximum-level records show earned mastery. Family and original category filters verified.
- Pagination, empty results, sorting/filtering without save mutation, native Enter activation, focus return, first-tier replacement, card/detail claims, simulated save failure rollback and save reload passed.
- Legacy partial-history/star-only saves retain earned mastery and explain missing enhancement history.
- Layouts checked at 2560×1440, 1920×1080, 1366×768, 1024×768, 768×1024, 390×844 and 320×640, with normal and large text: no horizontal overflow, card overlap or inaccessible pagination. Very short screens scroll the card area; details use one reading scroll area.
- Existing check-original-achievements.cjs, check-ui.cjs, check-build.cjs, check-migration.cjs and check-storage.cjs passed. Browser runtime errors: zero.
- SHA-256 preservation verified for core.js, storage.js, original-achievements.json, achievement-lore.json, game-data.json and economy.json.

Run `node source/check-achievement-ui.cjs` on Windows with Edge installed. It opens a fresh temporary profile and never uses the player's browser storage. Set PMG_QA_OUTPUT to change screenshot/result destination. Full results: achievements-qa.json; preservation-verification.json.

Screenshots include Achievements-Before.png, Achievements-After-1366.png, Achievements-After-1920.png, Achievements-After-390.png, Achievements-After-320.png, Achievements-After-Detail.png and Achievements-After-Mobile-Detail.png.

No known blocking issues. Manual screen-reader output and browsers other than Edge were not checked. No commits, pushes or publishing.
