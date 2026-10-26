# PMG optimization audit — 26 October 2026

## Scope and preservation

Read AGENTS.md and .opencode/skills/ponytail/SKILL.md before changes. Captured the full Git porcelain status, staged diff and hashes of existing top-level/source/data files. The staged diff was empty and remains unchanged: the pending commit stays paused. No commit, push, publication, deployment, reset or clean operation. No changes to PotionMaker-REA or PMG-Unity. Browser runs used fresh temporary Edge profiles and isolated test states; the player's real storage was never opened.

Only four runtime/build source files and the generated Potion-Maker.html changed. All other baseline-hashed files, including gameplay core, storage, economy/data, styles, existing checks, Asset-Library.html and guidance, remain identical. Original assets, provenance, backups and historical records were retained. This folder contains new audit evidence, not replacement historical reports.

## Repository and execution map

- Root: package.json enumerates 20 existing Node checks; README documents Python source/build.py as the build entry. Potion-Maker.html is the self-contained playable artifact. Asset-Library.html and asset-manifest.json serve the separate reference library.
- source/index.template.html supplies DOM and base CSS. Build injects original mobile/book/APK/shared styles, 565 art/audio registry keys, inline data, event-rush.js + core.js, storage.js, app.js + event-rush-ui.js, then the three bundled Live2D/PIXI vendor scripts, embedded model/motion/wardrobe data, pio.js and apk-layout.js. Original font and all required media remain embedded; no live external data loading.
- core.js owns deterministic game transactions, economy, probabilities, upgrades, conveyor and helper simulation, event settlement, original achievements, expeditions/stories and version 1–18 save validation/migration. These were reviewed as dependencies, not rewritten.
- app.js owns rendering, controls, enhancement effects, reward reveals, audio, save UI, shared menus and the conveyor RAF. A 250-ms interval settles gameplay; one-second sections refresh visible clocks/statistics. pio.js owns the independent PIXI ticker, character interactions, costume disposal, idle dialogue and arrival presentation. event-rush-ui.js adds its existing 250-ms event timer. Five application intervals were observed and stayed stable.
- Audio: original SFX players are cached by name; ingredient plop is decoded once and capped at three voices, with audio nodes disconnected on completion. Music autostart listeners are removed after activation. No audio behavior was changed.
- Storage: autosave is delayed/coalesced, explicit transactions flush when required, and writeStoredGame suppresses identical serialized writes while validating and retaining recovery data. Named slots, backups, import/export, migration and rollback remain untouched.
- UI: shared menus are registered once, with per-header Resize/Mutation observers and delegated navigation. Catalogue, upgrades, statistics, expedition and event subpanels already use caches or targeted updates in several places. Presentation decoration observes added text; eliminating unnecessary commission subtree replacement also removes work from this observer.
- Build: build_textures verifies exact lossless wardrobe pixels/profiles even on cached builds; build_styles already shares repeated CSS images. The new build change shares identical registry payloads only. Source/reference files are never removed to shrink runtime output.
- Retained areas: assets contains 2,722 files / 147,358,389 bytes; data 28 files; source 62 files; backups 25 files; research 399 files before this report. See repository-map.json. Directory inspection is not a claim of independently reverse-engineering every historical binary.

## Strong candidates and changes made

1. **source/app.js — commission subtree churn.** Trace: helper catches call render(), which calls renderRequestBoard while its dialog is open. Baseline produced 134 board rebuilds in a ten-second helper session. Added the same small state-key approach already used by other panels. The key covers the active commission/offer tiers/completion count, fairy rewards, legacy request, cauldron recipe and level, enhancement/event busy flags and actual delivery eligibility; state identity invalidates on save replacement. Potion value and unrelated ingredient counters do not affect this screen. Existing button handlers still perform all transactions. Reusing cards also retains focus instead of replacing buttons during unrelated renders.
2. **source/app.js — finished chest polling.** Trace: RAF calls updateRewardChestFrame; animateRewardChest's finished handler already assigns frame 2. The updater now returns for a finished animation as well as an absent/idle animation. Reset, running frames, reduced motion, reward commitment and completion artwork are retained.
3. **source/pio.js — unwanted ticker restart.** The previous visibility handler called app.start when a tab returned regardless of Character being disabled; applyCharacterSettings could start it while hidden. Both now use the existing settings function, which requires Character on and document visible. Same logical model dimensions, max FPS settings, motion updates and controls.
4. **source/event-rush-ui.js — duplicate dashboard refresh.** The active page was updated by refreshRush on every render/250-ms timer and again by refreshEvents on renders/one-second ticks. The final module override of refreshEvents now handles the legacy page only; refreshRush remains responsible for the active page. Explicit story/navigation refresh handlers remain intact. No event clock, settlement or saving cadence changed.
5. **source/build.py — duplicate media literals.** Found 19 byte-identical groups costing 706,506 duplicate payload characters. A local shared string pool is emitted into the existing ASSETS script; all keys and their enumeration order are retained. Full JSON serialization of the evaluated registry before and after is identical: all 565 values are byte-for-byte equal. No source image, audio or font conversion or deletion.
6. **Potion-Maker.html** rebuilt from these sources. Asset-Library.html was regenerated identically. The exact optimization-only source diff is optimization-only.patch.

## Measurements

Protocol: preserved pre-change HTML in the Codex task workspace; fresh Edge headless profiles, local file URLs, 1366×900 / device scale 1, software WebGL/SwiftShader, same seeded initial states and settings. Three-second windows for idle, maximum-emission conveyor, eight upgraded helpers, commission with helpers, event dashboard, enhancement effects and finished chest. A second pair repeats the commission/helper scenario for ten seconds. Counters and performance observers are identical on both builds. No browser checks ran concurrently with these measurements. Page timers and simulation used elapsed time normally; offline production was not simulated.

| Measure | Before | After |
|---|---:|---:|
| HTML bytes | 102,758,984 | 102,052,242 |
| Unchanged commission subtree mutation records, 10 s | 536 | 0 |
| 200 direct unchanged board renders, first/second pair | 55.9 / 44.9 ms | 0.1 / 0.2 ms |
| Existing commission button retained | No | Yes |
| Event dashboard refresh calls, 3 s | 15 | 12 |
| Event dialog mutation records, 3 s | 258 | 207 |
| Finished-chest DOM queries, 3 s | 430 | 0 |
| Ticker running after Character off + visibility event | Yes | No |
| Ticker running after settings applied while hidden | Yes | No |
| Commission/helper p95 RAF interval, 10 s repeat | 13.9 ms | 13.9 ms |

The build is 706,742 bytes (0.67 MiB) smaller overall, including source changes. These results establish less repeated work, not an across-the-board FPS improvement. In the initial three-second commission sample p95 worsened from 13.9 to 20.8 ms; the ten-second repeat was equal. Other short-window pacing varied in both directions. Initial model-ready startup was 1.724 vs 1.778 s, while the repeat was 2.345 vs 2.019 s: no consistent startup gain is established. No >50-ms long tasks were observed in the seven steady-state measurement windows; the observer was installed after startup and does not measure startup long tasks. Full per-scenario script/layout times and frame distributions are in the JSON files.

After one-time menu content was warm, 120 additional opens/closes across help, commissions, events and root menu did not accumulate DOM/listeners: the ten-second pair measured 2,824 collected DOM nodes and 257 JS listeners both before and after. Observer registrations and intervals stayed stable as well. Initial connected DOM grew while previously unvisited event content mounted (1,529→1,616 in the focused runs), then stabilized; this is not hidden as a leak-free-from-first-open claim. Instrumentation contributes to absolute resource counts. No HTTP(S) requests or runtime exceptions were recorded in these runs.

## Verification, including failures

- Affected first-batch existing checks passed: commissions, settings, historical events, event-rush lifecycle/rewards, helpers and enhancement effects.
- Full package test list was run directly with Node because npm is unavailable in this shell: **18 passed, 2 failed**. Commands, assertions and thresholds were not edited. See existing-checks.log/json.
- check-ui.cjs fails at line 37 expecting a collected legacy Miracle Solution. The current core intentionally returns false while historical events are held; check-events explicitly verifies that hold. The identical failure reproduces using the captured pre-change app.js and unchanged core/data. Left unchanged.
- check-late-balance.cjs fails at line 16: conveyor, luck 3, price 0, tier 21 spread 1.2504049974132487 exceeds 1.25. The identical baseline failure is recorded. No balance calculation or threshold was changed.
- Existing commission browser check passed exact offers, acceptance, all delivery eligibility transitions, partial save restoration, once-only payout and refresh, plus 12 desktop/phone/large-text layouts.
- Existing event gameplay, presentation and dialogue browser checks passed gathering/packing/expiry, keyboard collection, delivery isolation, voucher/reward persistence, replay clocks, rollback, 109 supplied lines and all ending selection, with 1366/390/320 layouts and normal/large text.
- Existing shop browser check passed all 13 purchases and 13 refusal cases, free/paid quotas, ticket/ruby cases, navigation, save/reload and 20 layouts. Only its output directory was redirected; assertions and source files were unchanged.
- Shared-menu check: first run caught a new-item reveal overflow at 1366×900; isolated repeat passed all 100 layouts/25 screens, keyboard close, navigation and original actions. Baseline full run also passed. Focused 350-frame sampling then reproduced the overflow in both builds: baseline 140 frames, optimized 141 frames, maximum scroll width 1,485 for a 1,366-pixel dialog, with overflow hidden. The rotating/pulsing rays are clipped by the existing reveal rule. This explains the timing-sensitive check; its assertions and intentional effect remain untouched. See menu-first-run.json and reveal-before/after.json.
- Existing title-icon browser check passed 48 desktop/phone placements with no errors.
- check-build passed current source/data embedding, all 565 local media entries, fonts, offline rigs/motions, runtime syntax, historical banners, no network dependency and the regular Git file-size limit.
- Representative desktop shop, phone event dashboard and 320-pixel large-text commission delivery area were visually inspected. Screenshots are included. The original CSS, art, typography and logical character positioning were unchanged.

## Candidates deliberately left alone and remaining costs

- Dense conveyor transforms, hit strips, edge fading, emissions and helper geometry reads: these follow verified APK movement/probability/collection rules. Timing and scaling changes need dedicated physical-device profiling; the current comparison does not justify altering them.
- CSS layering across template/mobile/APK/shared menus: overlapping selectors encode intentional viewport/specialized book/reveal behavior. Removing them without a full computed-style/visual matrix is appearance risk; no new overriding stylesheet was added.
- Historical event definitions/gallery and legacy request/save branches: historical position/currency/ownership and pending migrations are explicitly preserved. Text-search absence or a disabled current feature is insufficient proof of dead code. Unused-looking globals offer no measurable benefit here, so they were not opportunistically removed.
- Save validation, migration backups, quota rollback and explicit transaction flushes: reducing these could change recovery guarantees or duplicate rewards. Their measured cadence and existing deduplication did not justify a storage rewrite.
- Text decoration and shared-header observers: fixed registrations, no measured growth in repeated use. A broader observer rewrite is not supported by this evidence.
- Offline wardrobe/audio/model payloads remain the largest startup/parse/decode cost. They serve valid owned costumes, original assets and offline operation. No lossy compression, lazy network loading, runtime removal or SDK change.
- Existing reveal overflow and balance/UI-check failures remain documented; fixing their appearance/economy semantics is a separate decision. No mobile hardware GPU/thermal test, hours-long session, manual audio listening, or exhaustive every-costume rendering pass was performed. Headless software graphics and short samples limit general FPS/memory conclusions.

No functioning feature was deleted to reduce size. Changes are small and reviewable through the saved incremental patch; the pending commit remains paused.
