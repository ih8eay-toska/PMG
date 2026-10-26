# Global UI unification — implementation and verification

Implemented the canonical menu shell in the existing offline game, including Traveler Order, Potion Commissions and Shop Upgrades. All 25 discovered dialogs are registered. Nineteen use the ornamental shell; three child readers and the Item Book, fairy book and new-item reveal retain documented specialized compositions to avoid double framing. Shared purple titles, original pink X, navigation, parchment typography/tokens and focus rules apply where appropriate.

Traveler Request still opens expeditions; OK still accepts the timed order. Its timer and action buttons now remain in a fixed footer above the frame on mobile while the portrait/dialogue/requirements scroll. Commissions retain their real acceptance/delivery logic. Upgrades retain original category/price/grade/button/separator art, exact costs/levels and panel restoration on close. Long lists remain scrollable. Statistics reward totals now wrap rather than overflowing.

Permanent standard: ../../UI_DESIGN_SYSTEM.md. It includes philosophy, implemented components/variants, authoritative tokens, original asset paths/scaling, construction example, complete dialog/internal-route/HUD/native-interface inventory and reusable QA checklist. AGENTS.md and README.md link to it. Machine-readable registry: screen-registry.json.

Modified implementation/documentation files:
- source/app.js — registered shell, shared header/back/close setup, live menu-subpage titles, traveler fixed action/footer integration and shared component classes.
- source/pio.js — stable character-picker ID, real Tia scene heading and removal of obsolete title margin styling; character/Live2D behavior retained.
- source/index.template.html — traveler footer and removal of superseded shell presentation rules.
- source/ui-design-system.css — canonical asset-backed shell, centralized tokens, controls and responsive layout variants.
- source/original-researched-ui.css and source/potion-book.css — superseded header/close/back presentation removed; specialized content layouts retained.
- source/build.py — embed the canonical stylesheet and original shared frame/close artwork.
- source/check-menu-system.cjs — complete isolated Edge menu/interaction regression.
- source/check-achievement-ui.cjs — wait for native asynchronous close before asserting focus return.
- UI_DESIGN_SYSTEM.md, AGENTS.md, README.md — permanent standard and discovery links.
- Potion-Maker.html — rebuilt playable game.
- research/ui-design-system/ — source registry, before/after screenshots, detailed QA results, removed-selector inventory and preservation hashes. Existing specialized browser checks also refreshed their own QA evidence.

Validation:
- 25 registered dialogs exactly match all 19 static and 6 dynamic dialogs discovered in source/runtime; every opening mechanism visited.
- 100 screen/viewport checks at 1366×900, 1024×768, 390×844 and 320×640. Frame/title/close appearance, close targets/actions, bounds and horizontal overflow verified; traveler footer actions stay visible.
- Shop/Mail/Settings back routes pass with one header/title/X; mobile large-text layouts and light/dark parchment contrast pass. Native Enter closes the focused X. Browser runtime errors: zero.
- Actual Request versus OK, commission acceptance, exact upgrade deduction/level increment and upgrade-panel restoration pass.
- Existing Shop browser regression: all 13 products, 3 chests, limits/cooldowns, purchase refusals, navigation and save reload pass.
- Existing Expedition browser regression: all 10 visitors, 30 authored routes, preparation, blockers, exact dispatch costs, story reports, journal/stamp parent navigation and saved state pass.
- Existing Book browser regression: all 75 pairings, complete narratives, original art, Pio/Tia mastery commentary, navigation, multiple resolutions/large text and save reload pass.
- Existing Achievement browser regression: all 176 original rewards, exactly 253 rubies/1,080 tickets, all 75 full mastery lore entries, duplicate rejection, rollback, history, legacy saves, keyboard and 320px–2560px normal/large layouts pass.
- Existing UI, visitor, commission, success-upgrade, settings, storage, migration, original-achievement, event, mail, presentation and embedded-build checks pass.
- SHA-256 checks confirm 22 protected logic/storage/data/original-art files unchanged (preservation-verification.json). No balance, save format, original PNG or lore changes.

Run `node source/check-menu-system.cjs` on Windows with Edge. It uses a fresh temporary browser profile and never the player's browser data. PMG_QA_OUTPUT can redirect evidence. Main results: menu-system-qa.json and menu-system-layout-qa.json.

No known blockers. Native browser file/confirmation UI is deliberately left native; destructive confirmations are not automatically accepted against player data. Manual screen-reader output and browsers other than Edge remain unchecked. No commits, pushes or publishing.
