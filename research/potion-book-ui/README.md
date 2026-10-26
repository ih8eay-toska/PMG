# Potion Book redesign

The illustrated two-page encyclopedia is retained. Material appears on the left and its paired potion on the right; each has original sprite, canonical name, tier/unlock status, key statistics, an exact-text overview and Read full lore. Smaller screens show one full-size page with Material/Potion controls. Life/Mana/Stamina, all 25 tiers per family, the selector and previous/next recipe buttons remain available.

## Background quality

Both available book assets (assets/extracted/book.png and assets/extracted/organized/ui/book.png) are identical 320×226 PNGs, SHA-256 45b25d3a966d58efdecb1bd08bd37aa4cd0ecac5b7192b1efadaf6757dcb1dfa. The asset manifest contained no higher-resolution original. The old PNG is preserved and no raster upscaling or pixelated rendering is used for the new book.

source/potion-book-frame.svg reconstructs the original’s parchment leaves, curved bottom edges, aged paper, central binding, dark cover and gold corners as scalable paths, gradients and subtle procedural grain. Its 1200×820 viewBox is a coordinate system, not a raster resolution. The SVG is embedded directly by the existing offline build. Existing material and potion sprites are unchanged.

## Content and reading

Text remains selectable HTML inside equal-width CSS Grid page regions, with safe margins outside the frame and spine. The normal spread has no page-level scrolling. Compact overview excerpts are taken directly from existing text; full text is available in the dedicated parchment reader, without rewriting data. The reader has Material notes / Potion lore navigation, one reading scroll area and a close control that returns to the same book entry.

Complete material lore, supplier notes, original potion descriptions, expanded lore, original bottle notes, customer reviews, supply notes, current-character commentary, brewing records and enhancement tables remain accessible. Existing maximum-enhancement commentary gates are retained (??? before mastery). Full original potion notes are included even where a customer review previously occupied the same slot. Short viewports or large text may scroll the whole book stage; individual illustrated pages never acquire internal scrollbars.

## Modified files

- source/app.js — compact overviews, existing full-content reuse, exact-text excerpts, mobile page controls and reading navigation.
- source/index.template.html — page-safe spread, current-pair label and dedicated reader.
- source/potion-book.css — typography, independent page regions, parchment reader and responsive book layout; unrelated effects/gauge/achievement rules retained.
- source/potion-book-frame.svg — new scalable reconstruction.
- source/build.py — embed the SVG instead of stretching the 320-pixel book background.
- source/check-build.cjs — verify current SVG and reader are embedded offline.
- source/check-potion-book-ui.cjs — repeatable isolated Edge browser checks and screenshots.
- Potion-Maker.html — rebuilt playable game.
- research/potion-book-ui/ — screenshots, QA data, source-resolution findings and preservation hashes.

## Validation

All 75 material/potion pairings: exact names, original sprite identity and decoding, material value, correct tier/unlock state, 25-entry selectors, full material/potion text, supplier/bottle/review notes, enhancement notes and unchanged mastery gating. Pio and Tia commentary both verified after mastery. Family changes, selector, previous/next limits, native Enter activation, reader navigation and return to book passed. Save round-trip and reload passed.

Layout checks: 2560×1440, 1920×1080, 1366×768, 1024×768, 390×844 and 320×640, with normal and large text. Representative short/long/tier-25 entries checked in both page views; all 75 entries additionally checked for page bounds at 1024 and 390 widths in both text modes. No spine/frame overlap, horizontal overflow or normal-page scrollbars. SVG parsed correctly, computed book image-rendering is auto, and no browser runtime errors occurred.

Existing UI and build checks passed. Game logic, storage, game-data.json, flavor-text.json, material-descriptions.json, achievement-lore.json and original book PNG hashes match the pre-change snapshot (preservation-verification.json). Economy, saves, canonical names and narrative data were not edited.

Screenshots: Potion-Book-Before.png; Potion-Book-After-1920.png; Potion-Book-After-2560.png; Potion-Book-After-1024.png; Potion-Book-After-390.png; Potion-Book-After-Reader.png. Detailed browser results: potion-book-qa.json. Browser checks use a fresh temporary profile, never the player’s storage.

No known blocking issues. Manual screen-reader output and browsers other than Edge were not checked. No page-turn animation was added.
