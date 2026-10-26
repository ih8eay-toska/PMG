# Repository guidance for OpenCode and coding agents

## Goal: safe cleanup pass

Review the Potion Maker code for clearly redundant, duplicated, or unnecessarily expensive work. Make only small, high-confidence improvements that preserve the current game. First inspect and report likely candidates; then implement only changes whose behavior and call sites are understood. Leave uncertain or risky candidates unchanged and explain why.

## Project shape

- `Potion-Maker.html` is the playable, self-contained browser game.
- `source/` contains the source files and build/check scripts. `source/build.py` produces the playable HTML from the source template and data.
- `data/` contains game tables, dialogue, economy and other content. `assets/` contains original game art and audio.
- Read the relevant README sections and source before changing code. Treat source and data as authoritative; avoid hand-editing generated `Potion-Maker.html` when the change belongs in `source/` or `data/`.

## Preserve these behaviors

- Keep the game playable as a local HTML file without a server or network connection.
- Preserve existing save compatibility, migrations, export/import behavior, currencies, economy values, reward probabilities, progression, timers, and offline timing.
- Preserve gameplay and UI behavior, keyboard and pointer controls, reduced-motion/accessibility behavior, visitor/quest/commission/expedition flows, fairy and Pushcat mechanics, events, character interactions, and dialogue/content.
- Do not remove code merely because a plain text search finds no reference. The project uses DOM IDs, event wiring, string keys, generated data, and other dynamic references; trace actual usage first.
- Do not alter original assets or replace/rename them as part of a code cleanup.

## Change rules

- Prefer deleting truly duplicate code or consolidating identical logic with a narrow change. Avoid broad rewrites, stylistic churn, speculative abstraction, micro-optimizations, and unrelated feature work.
- Before removing or merging anything, inspect all call sites, initialization order, event listeners, data references, and relevant checks. Describe what makes the code redundant and what will remain responsible for the behavior.
- Only claim a performance improvement when you can identify the repeated work or hot path that the change reduces. Preserve timing and visible results.
- Do not add dependencies, change the build system, adjust balance, rewrite content, or reformat whole files.
- Keep edits limited to the agreed cleanup. Do not commit, push, publish, or reset/revert existing work unless explicitly asked.

## Verification and report

- Inspect existing checks and use only relevant, already available checks when appropriate; do not add tests for this cleanup. If a check or build is not run, state that plainly.
- If source changes require rebuilding the playable HTML, use the documented build process and report that the generated file changed. Do not silently leave source and playable HTML out of sync.
- Finish with a concise report: files changed, each cleanup and its evidence, behavior intentionally preserved, checks/build run and results, and any candidates left untouched with the reason.

## UI implementation standard

All menu work must follow [UI_DESIGN_SYSTEM.md](UI_DESIGN_SYSTEM.md). Reuse the registered shared shell, original frame/title/close assets and centralized tokens. Register new dialog IDs in MENU_SCREENS, document justified variants, update the screen inventory and verify desktop/mobile navigation without changing gameplay or saves.
