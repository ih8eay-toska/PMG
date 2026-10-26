# Original title icons restored

The shared header now restores verified APK section icons as independent decorative images over the left end of the original title banner. The label stays independently centered and the banner remains 45 logical units high for these headers. Responsive scaling reserves room for the icon above/below the banner and keeps Back/Close clear. The prior small inline Upgrades decoration is removed.

Verified mappings: Help→Help; Statistics→Stats; Upgrades and In-app Products/Shop→Upgrades; Save→Archive; Fairies→Fairies; Item Book→Items; Achievements→Achievements; Costumes→Costumes; Characters→Characters; Settings→Settings; Mail→Mailbox. Shop's original title icon is deliberately different from its Menu tile. The Achievements icon uses its original left-edge anchor (2 units); Mail uses its own 354-unit reference banner, center offset −12 horizontally/+6 vertically. Other section icons use their original prefab rectangles, generally centered 20 units from the banner's left edge.

The original Unity Images use Simple mode and preserveAspect=false. The implementation therefore matches the recorded icon rectangle rather than imposing the PNG's natural aspect ratio. Existing PNGs were compared against the decoded APK Sprite pixels; all 11 source icons matched exactly. Upgrades uses its original 92×64 UI rectangle even though the source sprite is 120×67. No artwork was redrawn or modified.

Remake-only source/full-lore/chest/balance headers reuse the corresponding parent icon; these are documented adaptations. Root Menu and quest/event/exploration title cards have no verified title-icon reference, so none was invented. Illustrated fairy details and the new-item reveal retain their native compositions.

Modified files:
- source/app.js — MENU_TITLE_ICONS, shared independent image setup, original rectangle/anchor placement, dialog-open/resize measurement and dynamic subpage switching.
- source/ui-design-system.css — original icon overhang, 45-unit banner, centered label, responsive header clearance and reader-title treatment.
- source/original-researched-ui.css and source/potion-book.css — removed old title-specific width/margin/font overrides that competed with the shared component.
- source/build.py — embeds the existing original Upgrades PNG as a title icon; other icons reuse existing embedded assets.
- source/check-title-icons.cjs — repeatable focused browser verification.
- UI_DESIGN_SYSTEM.md — permanent title-icon component, evidence, mappings and exceptions.
- Potion-Maker.html — rebuilt offline game.
- research/title-icons/ — native layout/asset verification, screenshots and QA results.

Validation: 42 icon cases across 1366×900, 390×844 and 320×640 verify exact assigned asset, successful decoding, native rectangle proportions, icon within dialog bounds, Back/Close clearance, 45-unit banner and no horizontal overflow. Dynamic Shop/Mail/Settings icons switch correctly and disappear on return to root Menu. No browser runtime errors.

The full 25-dialog / 100-layout menu regression passed, including close/back routes, large text/dark-mode contrast and original traveler/commission/upgrade behavior. All 176 original rewards and 75 mastery entries, save rollback/reload, legacy history and normal/large achievement layouts passed. Existing UI/build checks passed. Protected gameplay/storage/data/art hashes remain unchanged.

Evidence: native-title-layouts.json; verified-assets.json; title-icons-qa.json; preservation-verification.json. `node source/check-title-icons.cjs` runs in a fresh temporary Edge profile; PMG_QA_OUTPUT can redirect screenshots/results. It never uses player browser storage.

Manual side-by-side comparison with a running APK and browsers other than Edge remain unchecked. No commits, pushes or publishing.
