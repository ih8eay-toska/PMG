# Visitor Expeditions redesign

The menu now guides the player through Choose Visitor → Choose Expedition → Prepare & Dispatch. The selected visitor and job remain visible, earlier selections survive Back/reopening, and the persistent action bar stays onscreen. One content area scrolls; the list and detail panels do not create nested scrollbars.

The compact roster supports All visitors and Available now. Statuses distinguish a live order, absence, returning rewards and an expedition already running. Unlocked jobs remain selectable when dispatch is blocked. Future jobs are collapsed, selectable for inspection, and explain their material-tier requirement. Rewards and probabilities are expanded only when requested.

Story preparation is separate from dispatch: authored chapters save their existing route draft and return to preparation. Non-chapter jobs allow their existing material route to be selected while absent. The preparation panel lists dispatch blockers; the final action shows cost, duration and the no-cancellation/replaced-order restriction. It rechecks eligibility before calling the existing dispatch function and prevents a repeated submission. Reports remain available from their job; Journal and Stamp Exchange return to the parent expedition/story screen.

## Gameplay preserved

No changes in this task to core.js, storage.js, economy tables, dialogue, potion/material mappings, authored chapter/story tables, rewards, probabilities, durations, progression or save schema. Costs and reward displays come from combinedExpeditionInfo. Dispatch still uses dispatchCombinedExpedition and the existing chapter draft/settlement methods. A live order means offer or active, exactly as startExpedition requires. Existing single-shared-chapter-draft behavior is retained; choosing another chapter route replaces that draft according to existing rules. UI visitor/job choices are remembered for the current session; gameplay and the chapter draft persist through saves/reloads.

## Modified files

- source/app.js: guided presentation, selection memory, statuses, preparation-only story reader, guarded dispatch and return navigation.
- source/index.template.html: roster, steps, master/detail panels, labeled stamps and persistent action bar.
- source/original-researched-ui.css: responsive cream/gold layout, selected/locked/focus styles.
- source/check-build.cjs: replace obsolete unfiltered-chapter-list assertions with checks for the new guided interface.
- source/check-expedition-ui.cjs: isolated Edge browser checks; screenshots and results go here. Requires local Edge and Node with built-in WebSocket. Uses a fresh temporary profile, never the player's storage.
- Potion-Maker.html: rebuilt playable offline game.
- research/expedition-ui/: this report, screenshots and QA results.

## Verification

Browser: all 10 visitors; available filter; switching/back/reopening; unlocked and locked jobs; all 30 authored chapter routes plus three non-chapter routes; free preparation while absent; insufficient gold and running-request blockers; single-charge duplicate-click prevention; dispatch; report/Journal/Exchange navigation; exact stamp reward; validated save round-trip; reload settlement of an expired in-flight expedition; repeat reload without duplicate reward; native Enter activation and focus handoff. Full 25-tier lists checked at 1200×768, 1024×768 and 390×844; no horizontal overflow and the primary action stays in bounds. No browser runtime errors.

Existing checks: check-core.cjs, check-ui.cjs, check-visitors.cjs, check-storage.cjs, check-migration.cjs and check-build.cjs. Build regenerated with source/build.py and remains below GitHub's regular-file limit.

Screenshots: Expeditions-Before.png; Expeditions-After-Roster.png; Expeditions-After-Jobs.png; Expeditions-After-Preparation.png; Expeditions-After-Mobile.png. Detailed browser assertions: expedition-redesign-qa.json.

No known blocking issues. Screen-reader output and browsers other than Edge were not manually tested.
