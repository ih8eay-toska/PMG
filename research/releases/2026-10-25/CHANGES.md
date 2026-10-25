# Changes since f67f158

Audit date: 2026-10-25 (Asia/Saigon). Baseline: `f67f158` — feat: add playable Neet chapters and shop improvements. HEAD was still that commit when this audit began: these are working-tree changes, not a series of later commits. This report describes the resulting state; Git cannot recover the order of every uncommitted experiment. The accompanying file inventory records every tracked delta and added file.

## Main workshop and original UI

- Added source/original-mobile-ui.css and the UI-only source/apk-layout.js / source/apk-layout.css adapter. Recovered 720 × 1280 Expand scaling uses the smaller width/720 or height/1280 ratio, with consistent Unity-to-browser Y conversion.
- Rebuilt the top balance parchment, separate menu opener, ingredient-rack parchment/borders/gears/chains, quest portrait/frame/status bar/exclamation, original summon paw, ticket/ruby rows, Orders book and hovering active fairy.
- Moved the coin icon and full comma-separated live balance inside its parchment. Reduced rack-art sizing and adjusted button spacing, potion-icon placement, level/MAX artwork, potion-name strip and success-rate backing.
- Rebuilt the lower parchment board with Upgrades/Sell, center potion card and Success Rate/Enhance. Empty Sell/Enhance show their action labels without sale amounts/multipliers. Filled states show a centered live coin amount and multiplier. Quest/commission handover labels/actions remain supported.
- Removed decorative prototype glyphs and the empty-card discovery heading; hid enhancement-rate, selling and protection indicator UI without removing charges/effects. MAX shows the maximum-enhancement status instead of an ordinary next chance.
- Embedded assets/fonts/Basic_337.ttf for the game section. Outside Help/Events retain their earlier fonts. Level/success artwork uses the original number assets; current sale/multiplier text uses the game font where requested. Original separate menu label images avoid duplicate text.
- Native menu region is manually placed 509 × 436 with exact recovered nine-button order, centers, individual icon sizes and separators. Shop/Save/Mail remain in a separate extension at the owner's request; inactive Contest is not exposed.
- Recovered collection panel sizes, four-column fairy/item grids, two-column costume grid and one-column achievement/exploration/mail layouts. Focus expansion/scrolling retains richer remake details and actions. Corrected compact-phone header pointer handling for Back/Close.
- Reconstructed only the verified shop shell/viewport. The evidence does not prove server-supplied product contents. Existing local products remain local implementation choices.
- Centered the brewing background without stretching. Retained approximate Live2D framing/aspect ratio by owner decision. PIXI backing-buffer resolution now follows displayed size/device-pixel ratio, capped at 3, without changing logical model dimensions. Character selection retains original thumbnail proportions with labels overlaid.

## Cauldron effects and audio

- Replaced scene, cauldron, liquid and potion-slot artwork with original extraction assets. Adjusted liquid position/scale/mask and foreground layering; retained ingredient-family liquid colors and intentional empty effects.
- Added Bubble and 16-frame Boiling, plus original enhancing (5 × 5), enhanced (5 × 3), failed (4 × 4) and plop (4 × 2) sprite sheets. Effects follow current enhancement timing; exact APK effect timings are not established. Reduced motion retains static presentation. Plop overlap is capped separately from ingredient counts.
- Original Plop, enhancement result, sale, quest, summon, helper-hit and UI click sound effects replace synthetic/placeholder action audio. Audio respects volume/visibility and limits rapid overlapping voices/click playback. Uses the owner-supplied original Main Theme WAV; retains provenance for third-party archived audio.

## Current conveyor and fairy behavior

This is the current code, superseding earlier half-speed/10-per-second-empty-cap experiments and the old material-emission report body.

- Upgrade base rates are 1–20 cards/s (saved speed indexes 0–19). Existing 19 speed prices are preserved: 137, 177, 231, 300, 390, 507, 659, 857, 1113, 1448, 1882, 2446, 3180, 4134, 5375, 6987, 9083, 11808, 15350; total 66,064 gold.
- Current movement is constant with respect to upgrade, fairy and potion state: web speed = max(trackWidth × 300 / 1000, 1) CSS px/s. This maps the nominal 1000-unit crossing onto the measured rack width; it does NOT establish a literal UI-unit-to-pixel equivalence or reproduce the wider native travel range exactly. The recovered UI evidence explicitly warns that native −500…500 travel is wider than the 720-unit reference canvas. This mapping remains a fidelity limitation, not an APK-verified visual match.
- Rate = base × (1 + active supported CardsPerSecond bonus); then min(rate, 3) if no potion exists. A MAX potion still counts as filled for emission. Higher rates reduce spacing, not movement duration. No hard three-card count limit.
- Supported per-level CardsPerSecond arrays were added for fairy-22/25/31 (10–30%), fairy-34 (15–42%), fairy-43/50 (5–50%), and fairy-51 (0 through level 5, then 24–32%). Only currently available/equipped definitions apply; definitions alone do not add collection entries.
- Emission accumulates at most one second per update, loops over intervals, retains the fractional remainder and positions each catch-up card using it. Existing items move by the supplied elapsed time and are removed below −58 web px. Initial buffer, web-coordinate removal margin and resize proportional positioning remain adaptations.
- Removed the old conveyor-speed preference/UI and ignores/removes the stored setting on load; animation passes raw frame delta. This replaces the previous preference-based movement/emission slowdown and frame-slicing behavior.
- Pushcats remain separate catch-station helpers, now pause when empty OR no next enhancement exists. Minimum hit width is 2 px at dense spacing. Ticket/event-special replacement rolls and collection rewards are not turned into extra ingredient spawns.
- A stale half-speed comment and the old upgrade level-one description still contradict the current engine. They are recorded as documentation/UI debt; this release audit does not silently change gameplay or unrelated implementation.

## Shop and Bank

- Added 13 local products to data/economy.json with validated purchases and balance-cap/affordability checks: Enhancement Pack (5 enhancement + 3 protection charges for 3 rubies); ruby bundles 10/52/110/350; ticket bundles 100/520/1100/3500; gold bundles 5,000,000 / 30,000,000 / 125,000,000 / 10,100,000,000.
- Currency bundles preserve 10 tickets = 1 ruby with no discount arbitrage. Gold quotes use highest unlocked material value × owned base emission × permanent selling bonus × 60 seconds per ruby, rounded up, minimum 1 ruby. Temporary buffs, fairy supply and actual catches do not set quotes. These are local economy choices, not verified original store prices.
- Removed Bank UI and direct exchange APIs; retained shared currencyUnits and bundle exchange. No real-money purchase, account or online service was introduced.

## Dolbur chapters and trip compatibility

- Baseline already had Neet tiers 1–5 (15 routes). Added Dolbur tiers 1–5 (15 routes): Trailside Herb Hunt, Mushrooms at Base Camp, Haul the Orchard Harvest, Scout the Feathered Cliffs, Guard the Nesting Ridge. Current playable chapter total is 10 chapters / 30 family routes.
- Integrated chapter beats, choices, portraits and material mapping into the existing chapter/journal system. Added dispatch-cost/replacement/non-cancellation information and clearer reward chips/guaranteed versus chance-based expedition descriptions.
- New chapter trips persist chapterId; save validation checks the chapter/traveler/tier/family association. Settlement uses frozen active-trip identity/reward. Historical fallback recognizes Neet 1–5 and Dolbur 1–3; unmarked Dolbur 4–5 trips retain legacy settlement instead of being retroactively converted.
- Existing any-family gate and individual route eligibility remain. Tier-5 first-family continuation, later viewpoints, journal replay, unread/legacy records, deferred repeat reports, offline settlement and once-only rewards are covered by expanded expedition checks.
- Added writing archives/plans/drafts/approved pilot JSON and UI-copy audits under research/writing. These are retained as source/review material; their presence does not make every traveler draft playable or approved. Their prose was not rewritten during this audit.

## Original-asset migration and repository contents

- Added data/original-assets.json mapping stable game keys to original media, preserving costume/fairy IDs; build now uses that mapping instead of scraped embedded caches.
- Added original materials/potions, scene/UI, portraits, fairies, costumes, font and WAV audio; kept existing non-wiki Live2D rigs/motions. Asset-Library and manifest catalog 1,022 local media records, with provenance/size/hash information.
- Removed non-banner wiki media and derived crops, obsolete wiki-backed preview/generated backup HTML and source/assets.json scrape caches. Historical backup source remains. All 12 historical event/promotion banners were restored as the explicit user-approved wiki-media exception.
- research/art/wiki-media-removal.json preserves the removal/provenance record; it has 416 removed wiki metadata records, a 429-path removal list and nine legacy embedded artifacts. Counts refer to different sets; do not treat them as interchangeable or as the final Git deletion count. Complete final additions/deletions are in FILE-INVENTORY.tsv.
- Retained generated request/OK artwork, production variants/checks/prompts/previews and art-layout screenshots/reports. Added repository AGENTS.md and local ponytail/novel-writing skill files as part of the accumulated worktree.
- Rebuilt Potion-Maker.html and Asset-Library.html; expanded build/asset/audio/gameplay/story/UI checks for current source data and embedded original media. No new runtime package dependency.
- data/updates.json differences before this audit compact existing five announcements; their IDs, dates, gifts and claim compatibility remain. The new announcement is prepared separately with no invented gift.

## Release documentation and verification

- IN-GAME-MAIL.md contains player-facing copy; IN-GAME-MAIL.json is a draft payload with explicit non-runtime status/reward metadata, not a drop-in updates entry. The existing Mail system presents every entry as a claimable gift; installing this reward-free announcement would need an intentional UI decision. No new gift, claimed-ID or gameplay change was made to force it in.
- COMMIT-MESSAGE.txt contains the detailed local commit message. FILE-INVENTORY.tsv lists every changed/deleted/added path, category, baseline/final SHA-256 and byte sizes (excluding this report's self-referential inventory hash). CHECKS.md and checks.json record this audit's checks, not an inference from old reports.
- Prior UI-pass browser screenshots cover desktop 1280 × 720 / 1440 × 1000 and phone 390 × 844 / 360 × 640, native measurements, navigation and collection access. No new browser gameplay or sound listening session was performed for this documentation pass.
- Known current failure: check-late-balance.cjs rejects conveyor/luck 3/price 0/tier 21 family spread 1.2504049974132487. Do not describe the whole suite as passing. The older helper-check exception is no longer present: check-helpers passes now.
- Remaining fidelity gaps: native conveyor/world-camera coordinate mapping, iPhone safe area, exact Live2D camera framing, runtime panel animation/localization resizing, original effect timing and server product contents. Older README/material-emission narrative sections contain historical statements; this current report and code take precedence.

No push, publication or deployment is authorized. The owner explicitly authorized creating the local commit covering this complete accumulated worktree.

## Final scope totals

The inventory covers 2,990 paths relative to f67f158: 25 modified, 429 deleted, and 2,536 added. It includes the accumulated original asset extraction and research archives as well as this release documentation. Python asset validation passed for all 1,022 manifest media records. No pending implementation failure was hidden: 20 of 21 Node checks pass, with the family-spread balance assertion recorded above.
