# Original fairy presentation — 2026-10-26

The APK uses two views rather than putting every ability into the collection grid.

- `FairiesGUI` is a scrolling catalog. Its ordering key is the fairy ID for owned entries and ID × 10,000 for unowned entries (`0x4970D4`). The collection rate counts owned non-hidden fairy types, not accumulated XP (`0x496850`).
- `FairySlotGUI.Setup` (`0x49CF88`) assigns the icon, colored rarity letter and owned `Lv.{0}` label. Unowned entries are tinted and have no level label. Clicking a slot opens `FairyBookGUI` (`0x49D3D0`).
- The rarity lookup resolves to N, R, S, U, G for rarities 1–5 (`0x49D270`). Its colors are white, green, blue, purple and orange (`0x49D310`).
- `FairyBookGUI.Setup` (`0x498750`) places the fairy prefab on the left page, with its name ribbon, and enables rarity stars on the right. The serialized book size is 640 × 452, name frame 210 × 61 and abilities container 255 × 165.1. The abilities container has a ScrollRect and scrollbar.
- `Refresh` (`0x498B78`) updates level text, XP fill and abilities. `BuildLevelText` (`0x498CC0`) uses localized level/max-level/XP text and acquisition origins for unowned fairies. `BuildAbilitiesText` (`0x49935C`) appends the current level's ability descriptions line by line.
- English localization calls activation **Summon** and deactivation **Unsummon**. These actions return to brewing (`0x4994F4`, `0x499880`); the book also has a separate confirm/close control.

Implemented in PMG:

- Compact four-column icon catalog, owned-first ordering, rarity letters, level labels, collection meter and summoned marker.
- Separate responsive book with original Book, Fairy Name Frame, Rarity, Fairy Slot and Progress artwork.
- Current abilities, level-10 comparison, actual remake acquisition routes, and Summon/Unsummon controls. The in-game fairy shortcut opens the same book.
- Original names and rarity metadata decoded from `Fairies_271.bin` and `English_245.bin`. The existing `fairy-behe` entry is verified as native fairy51, Behe. Pisia/Fosia/Nesia retain their existing Forest/Fire/Water Fairy aliases below the original names.

Boundaries: the existing 42-fairy roster and all IDs, effects, saved ownership and duplicate-based levels remain unchanged. The native table has 51 records, including seven hidden entries; this presentation update does not add the two other non-hidden fairies missing from the current roster. Native XP progression is not substituted for the remake's copy-based levels, so the gauge is labeled level progress, not XP. The book uses existing static artwork rather than porting Unity fairy-prefab animations. Catalog tint and browser scaling approximate the original presentation.

Verified all 42 book views and rarity mappings, owned-first sorting, unowned preview/refusal to summon, maximum-level display, actual summon/unsummon and shortcut actions, close-to-catalog behavior, save-state round trip, desktop/mobile scrolling and no overlapping close/star controls. Existing UI and offline-build checks pass. No APK/REA files modified, downloads, commits or publishing.
