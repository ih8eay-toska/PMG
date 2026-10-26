# Potion Maker UI Design System

This is the implementation standard for future game interfaces. Keep this file and the screen registry synchronized when adding a legitimate component or layout variant. Reuse the existing system first; explain any new variant and check it against existing menus.

## A. Design philosophy

Potion Maker is a cozy fantasy shop: original pink ornamental frames, warm parchment, purple starry banners, original illustrated art, brown text and gold accents. Shared navigation and feedback make different screens feel like one game. A unified visual system does not require identical interiors: a commission list, illustrated book, paginated achievements and a timed traveler order need different layouts.

Keep gameplay data, content, saves, prices, timers and transaction handlers separate from presentation. Decorations must never intercept clicks, hide a deadline, change a requirement or conceal a disabled-state explanation. Do not replace original illustrations with generic CSS approximations.

## B. Canonical components

Implementation: `source/app.js` (`MENU_SCREENS`, `addMenuReturn`, `pinDialogHeader`, `syncMenuShell`) and `source/ui-design-system.css`. The stylesheet is embedded by `source/build.py` after legacy/content styles. `source/index.template.html` supplies static markup. `source/pio.js` creates character selection and Tia's arrival after the main application loads; the existing body observer applies the same shell to those dialogs.

| Component | Purpose and real implementation | Variants, required behavior and usage | Avoid |
|---|---|---|---|
| Menu shell | Native `dialog.pm-menu`, initialized once by `addMenuReturn(dialog)` | Register its stable ID in `MENU_SCREENS`; use `showModal()` and `close()` through the existing opening handler | Unregistered dialogs, a second modal framework, wrapping a dialog in another ornamental panel |
| Ornamental frame | `--ui-frame` and the standard shell rule in `source/ui-design-system.css` | Nine-sliced original border for menu/scroll/bounded/upgrades variants; transparent corners and parchment inside | Stretching the whole raster across the screen, new per-menu border artwork |
| Title banner | `.pm-menu-header > .pm-menu-title.original-title`; `pinDialogHeader` reuses the existing h2/h3 | Selectable HTML on original starry artwork; dynamic text retained for rewards, events and details; accessible dialog title ID | Rasterized text, replacing a live title with a fixed label, a second title below it |
| Back button | `.pm-back.back-to-menu[data-back-to-menu]` in the shared header | Top left; ordinary menus return to Menu. `prepareExpeditionReturn` retains contextual parent routes for journal/stamps. Game-menu subpages return to its grid | Copying navigation handlers, placing Back inside a scrolling list, changing Request into Back |
| Close button | `.pm-close` applied to existing `.close` / `.new-item-close` | Top right; original pink X, minimum control target, accessible label, existing close handler retained; native Escape remains available | CSS-drawn Xs, removing the aria-label because visual text is hidden, changing an OK/Summon button into an X |
| Content container | Existing screen bodies remain authoritative | `scroll`: dialog body scrolls with sticky header. `bounded`: named content region flexes/scrolls. `upgrades`: `.upgrade-list-scroll`. `reader`: one reading area. All use `min-height:0` where bounded | Nested long scroll regions, fixed pixel content heights, scrollable decorations |
| Tabs | `.pm-tabs` on `.achievement-tabs`, `.save-navigation`, `.shop-tabs` | Reuse each existing handler and `aria-pressed`/`aria-selected`; active state uses shared tokens; shop retains roving tab order | Treating a visual active state as saved gameplay state, replacing real buttons with spans |
| Primary buttons | Existing `button.primary` with shared palette and focus; original action-button art remains where already used | Commit/claim/accept actions keep their original disabled rules and save handling; upgrade artwork remains a deliberate content-specific variant | Reimplementing prices or claims in a shell click handler |
| Secondary buttons | Header `.pm-back` and screen-specific secondary controls | Parchment, brown ink, visible border/focus; text explains the action | A competing global button style, color-only status |
| Details/dialogs | Native dialog + `reader` variant | Nested achievement details, exact balances and catalog readers reuse header/close/tokens without another ornate frame. Close returns to the existing parent context | Opening the same dialog twice, double-framing a child reader |
| Cards | `.pm-card` (used on `.commission-card`) and controlled existing card layouts | Shared border, parchment, spacing and radius; preserve sprites, titles, rewards and relevant state accents. Existing compact achievement cards and fairy slots keep their specialized internals | Copying the entire shell onto every card, truncating source lore |
| Form controls | Shared scoped input/select/textarea rules and existing handlers | Reuse tokens; preserve native labels, min-width:0, available width and keyboard operation. Range sliders and original settings switches retain their distinct controls | Restyling the original ON/OFF sprite as a generic text box, unlabeled inputs |

### Implemented shell variants

- `menu`: root game menu and Shop/Mail/Settings routes, one shared live title/back/X. The subpages' old duplicate headers are hidden, their content and routing remain.
- `scroll`: ordinary lists, information screens, commissions, events and character dialogs. Header sticks inside the scrolling dialog.
- `bounded`: existing fixed-height achievement, expedition and save layouts retain their bounded content areas and action/navigation regions.
- `upgrades`: original upgrade panel is moved into its dialog and restored to its gameplay anchor on close. Its duplicate interior title is hidden only while inside the dialog. Category, level, price, separator and upgrade-button artwork remain.
- `reader`: parchment detail sheet, common title/X, no second ornamental border. Existing full-content scrolling and footer actions remain.
- `book`: Item Book keeps its existing scalable illustrated spread instead of receiving a second ornamental book border. It shares title, back, close and tokens.
- `illustrated`: original fairy-detail book keeps its portrait/name/rarity/abilities layout and Summon/OK behavior. The shared pink close is applied; its embedded book title stays in the book rather than a duplicate banner.
- `reveal`: original full-screen new-item celebration, book, rays and Congratulations banner retain their composition and original dismissal behavior; use the shared pink X. A menu frame/title would obscure the staged reveal.

### Original title icons

`MENU_TITLE_ICONS`, `setMenuTitleIcon` and `layoutMenuTitleIcon` in `source/app.js` are the shared implementation. `.pm-title-icon` in `source/ui-design-system.css` is an independent decorative image beside the title text, not an emoji or an inline character. The title banner remains 45 logical units high; the icon can extend above/below and overlap its left end. The original prefab rectangle and anchor are scaled together when space is limited. Header rows reserve space for the overhang, keeping Back and the pink X unobstructed. Dialog-open and resize observations update geometry. Text remains centered independently.

Reuse the verified mappings: Help→Help, Statistics→Stats, Upgrades→Upgrades, Save→Archive, Fairies→Fairies, Item Book→Items, Achievements→Achievements, Costumes→Costumes, Characters→Characters, Settings→Settings, Mail→Mailbox. The APK's In-app Products title uses **Upgrades**, even though the Menu Shop tile uses different artwork. Achievements' icon center is 2 units from the banner's left edge; Mail uses its own 354-unit reference frame and an icon center 12 units beyond its left edge, 6 units above center.

The Image components use Simple mode and preserveAspect=false, so icon dimensions follow their recorded RectTransforms, not a guessed natural PNG aspect ratio. `research/title-icons/native-title-layouts.json` records references/rectangles; `verified-assets.json` records exact decoded pixel matches to the APK. All original PNGs are unchanged.

Remake-only full-lore/detail/source/chest/balance readers reuse the corresponding parent section icon; this is a documented adaptation, not an original APK counterpart. Root Menu and the original quest/exploration title prefabs have no verified section-title icon. At the user’s request, Traveler order reuses `OriginalMenuExpeditions.png` from the expedition menu, at 100 logical units wide with its original aspect ratio and shared title placement; this is a remake adaptation. At the user’s request the remake event dialog uses the existing `NewEventIcon.png` as an adaptation: 104×86.125 logical units preserves the original 128×106 aspect ratio, with the shared banner placement. Its longer name wraps in an auto-height banner, with a separate navigation row on phones and reserved space beside the icon. This is not claimed as a recovered event-prefab rectangle. The illustrated fairy book and new-item reveal retain their specialized compositions.

When adding or changing a title icon, update `MENU_TITLE_ICONS`, document its evidence and run `node source/check-title-icons.cjs` plus relevant menu/layout regressions. Do not replace the decorative image with an inline icon that shifts the title text.

## C. Design tokens

The authoritative token definitions are the `:root` blocks and mobile override in **`source/ui-design-system.css`**. Reference them rather than copying literal values into new screen styles:

| Token group | Actual names |
|---|---|
| Artwork | `--ui-frame`, `--ui-close`, `--ui-title` (the latter uses `--original-title-frame`) |
| Colors | `--ui-paper`, `--ui-card`, `--ui-ink`, `--ui-muted`, `--ui-gold`, `--ui-purple`, `--ui-line`, `--ui-pink`, `--ui-focus`, `--ui-primary`, `--ui-primary-ink`, `--ui-secondary`, `--ui-control-hover` |
| Typography | `--ui-font` uses the existing embedded PotionMaker font with readable fallbacks. Native content hierarchies and large-text preferences remain |
| Spacing | `--ui-space-1` through `--ui-space-5` |
| Shapes/borders | `--ui-radius`, `--ui-border`, `--ui-frame-width` |
| Controls | `--ui-control-height`; pink X artwork is inset within this hit target |
| Widths/height | `--ui-shell-width`, `--ui-shell-wide`, `--ui-shell-compact`, `--ui-shell-height`; upgrades and Shop have explicit controlled widths in the same stylesheet |
| Responsive behavior | The mobile `@media(max-width:650px)` block, short-viewport header override and narrow achievement-filter override in the same file changes frame insets and header rows; existing content breakpoints stay with their layout modules |
| States | `.primary`, `.pm-back`, `.pm-close`, `.pm-tabs` selected attributes, `:focus-visible`, `:disabled`, `:hover:enabled`; existing meaningful card states are preserved |

Shell appearance overrides the old dialog-local frame/padding colors; screen content layouts stay in `source/index.template.html`, `source/potion-book.css`, `source/original-researched-ui.css`, and `source/original-mobile-ui.css`. Superseded header/close/back selector implementations have been removed. Do not add replacements to those legacy files. Original illustrated menus retain their parchment contrast in dark mode; the gameplay theme still changes normally. Layout-specific row sizes and sprite rectangles are not global design tokens.

## D. Asset usage

| Purpose | Canonical file | Scaling and ownership |
|---|---|---|
| Ornamental border and corners | `assets/extracted/background-big.png` (identical organized copy under `assets/extracted/organized/ui/`) | `--ui-frame`, nine-slice 72 (`--ui-frame-slice`), frame inset from token; native baked paper color `#edece8`; corners are part of this asset, not separate CSS curls. Border image does not fill the parchment interior |
| Purple starry title | `assets/extracted/title-frame.png` | `--original-title-frame` → `--ui-title`; native 448×45 artwork, horizontally fits the title region, text remains HTML |
| Pink X | `assets/extracted/close.png` | `--ui-close`, contained inside the common close hit target; retain its accessible label |
| Upgrade category art | `upgrade-name-frame.png`, `upgrade-grade-frame.png`, `upgrade-button.png`, `upgrade-button-disabled.png`, `upgrade-separator.png`, `upgrades.png` under `assets/extracted/` | Existing `--original-upgrade-*` variables and upgrade rows in `source/original-researched-ui.css`; never replace with generic card/button visuals |
| Original action-button skin | `--action-button-art` in `source/index.template.html` | Existing sliced action buttons keep their image, hit target, feedback and game handlers |
| Item Book and fairy-book details | `source/potion-book-frame.svg` and existing book/fairy variables in `source/potion-book.css` / `source/original-researched-ui.css` | Existing controlled illustrated exceptions; keep full lore and readable page regions |

`source/build.py` embeds the shared PNGs through the existing artwork replacement loop, then `share_style_images` deduplicates image data. No external download is needed. Reuse these assets; do not create new close, title or border substitutes for individual menus. Original binary artwork is unchanged. The 201×201 frame’s corner ornament extends through pixel 68, so the shared slice is 72; a 56-pixel slice stretches ornamental fragments along long edges. The paper token matches its baked RGB(237,236,232) interior to prevent visible rectangular seams.

## E. Menu construction guide

1. Audit whether the feature belongs inside an existing screen before creating a dialog.
2. Add a stable dialog ID with the appropriate variant to `MENU_SCREENS` in `source/app.js`.
3. Provide one h2 title and one `.close[data-close]` with an accessible label. Static close buttons are already wired by the application; a dynamically created dialog must retain its own close handler.
4. Let `addMenuReturn` and `pinDialogHeader` create/reuse header and navigation. Use existing contextual parent routing for nested screens. The body observer handles dialogs appended later by character code.
5. Build the content using existing renderers, `.pm-card`, `.primary` and `.pm-tabs` as appropriate. Keep all transactions and saves in the existing game handlers.
6. Use shared tokens for new visual rules. If a truly different width or layout is needed, implement a controlled variant in the canonical stylesheet and document why.
7. Choose one scrolling owner: ordinary dialog, bounded list, or reader body. Keep navigation and timed actions reachable; avoid horizontal overflow.
8. At mobile widths allow the header to use its second title row. Use responsive internal grids and min-width/min-height:0. Honor large text and reduced motion.
9. Verify Tab, Enter and Escape, visible focus, dialog title/labels, parent return and click targets.
10. Rebuild, run the menu registry/browser check and relevant existing functional checks. Update this inventory and capture desktop/mobile evidence.

Minimal static markup using the existing architecture (replace `help-dialog` with your registered stable ID when adding a real screen):

```html
<dialog id="help-dialog" aria-labelledby="help-title">
  <button class="close" data-close aria-label="Close help">×</button>
  <h2 id="help-title">Help &amp; notes</h2>
  <section class="pm-card"><p>Screen-specific content.</p></section>
</dialog>
```

The actual existing Help menu uses the `scroll` variant. Its `#help` handler calls `showModal()` after initialization. Do not manually add another header, frame, X image or Back button. The example illustrates the architecture; it is not an instruction to duplicate the existing ID.

## F. Complete screen registry

The source-level dialog inventory is **25 stable dialog IDs**, including four created in `source/app.js` and two in `source/pio.js`. The live `MENU_SCREENS` registry is authoritative for variants. Static source is `source/index.template.html`; all dialog renderers/opening handlers except the two character screens are in `source/app.js`.

| Screen / ID | Opening mechanism | Previous implementation → shared migration | Variant / special content | Verification |
|---|---|---|---|---|
| Menu / `game-menu` | `#game-menu-open` | Only ornamental menu → canonical shell/live title | menu; illustrated tile grid | Entry, close, subpage/back routes, geometry |
| Help / `help-dialog` | `#help` | Plain dialog/original title → shared frame/header/X/back | scroll; disclosures | Entry/close/geometry + existing UI checks |
| Sources / `source-dialog` | `#sources` | Plain title/dialog → shared shell | scroll; provenance links/disclosures | Entry/close/geometry |
| New item / `new-item-dialog` | `queueNewItemReveal` → `showNewItemReveal` | Original staged reveal retained, common X | reveal; Congratulations/book/rays | Entry/close/geometry + enhancement/UI checks |
| Item Book / `catalog-dialog` | `#catalog` → `renderCatalog` | Illustrated book retained, shared header controls | book; family/tier/page navigation | Entry/close/geometry + book regression |
| Full lore / `catalog-reader-dialog` | `openCatalogReader` | Parchment reader → shared reader header/X | reader; full text/records/table | Entry/close/geometry + book regression |
| Achievements / `achievements-dialog` | `#achievements` → `renderAchievements` | Compact parchment → shared outer shell/header | bounded; filters, pages, claims | Entry/close/geometry + all reward/lore checks |
| Achievement details / `achievement-detail-dialog` | `openAchievementDetail` | Parchment details → reader shell | reader; full lore/requirements/claim footer | Entry/close/geometry + claim checks |
| Statistics / `statistics-dialog` | `#statistics` → `renderStatistics` | Plain/original title → shared shell | scroll; table areas and wrapping reward totals | Entry/close/geometry |
| Costumes / `costume-shop-dialog` | `#costume-shop` → `renderCostumeShop` | Plain cards/dialog → shared shell | scroll; owned/locked/equip/preview content | Entry/close/geometry + costume checks |
| Fairies / `fairy-dialog` | `#fairy-book` → `renderFairies` | Original title + slots → shared shell | scroll; collection/filter/draw content | Entry/close/geometry + core/UI checks |
| Fairy details / `equipped-fairy-dialog` | Fairy card / `#fairy-shortcut` → `showFairyBook` | Original illustrated book retained, common X | illustrated; abilities/rarity/Summon/OK | Entry/close/geometry + existing fairy logic checks |
| Traveler order / `visitor-order-dialog` | `#visitor-shortcut` clones current card/actions | Original banner/plain border → shared frame/navigation/X | bounded; scrolling portrait/dialogue/requirements; fixed timer/action footer | Request vs OK and geometry; visitor checks |
| Stamp exchange / `stamp-dialog` | `#stamp-exchange-open` → `renderStampExchange` | Plain dialog → shared shell | scroll; contextual return to expeditions/story | Entry/close/geometry + expedition checks |
| Expeditions / `expedition-dialog` | `#expeditions-menu`, `openVisitorExpedition` | Individual parchment shell → shared shell | bounded; roster/destination/dispatch steps | Entry/close/geometry + expedition regression |
| Expedition chapter/report / `expedition-story-dialog` | `openExpeditionChapter`, reports/replays/story queue | Plain dialog → shared shell | bounded; choices, narrative, Next and dispatch actions | Entry/close/geometry + story/expedition checks |
| Expedition journal / `expedition-journal-dialog` | `#expedition-journal-open` → `openExpeditionJournal` | Plain dialog → shared shell | bounded; historical entries/replay; parent return | Entry/close/geometry + expedition checks |
| Potion commissions / `request-dialog` | `#commission-shortcut` → `renderRequestBoard` | Plain heading/cards → shared title/frame/X/back | scroll; real acceptance and potion deliveries | Entry/close/acceptance/geometry; commission checks |
| Saves / `save-dialog` | `#save-tools` → `renderSaveSlots` | Original title/plain border → shared shell | bounded; device/transfer/recovery pages | Entry/close/geometry + storage/migration checks |
| Shop upgrades / `portrait-upgrade-dialog` | `.portrait-upgrades` moves `upgradePanel` | Separate original panel → shared shell/header/X/back | upgrades; original category, price and action artwork | Buy price/level, panel restoration, geometry; upgrade checks |
| Event rewards / `event-dialog` | Event/gallery → `openEvent` | Original title/plain dialog → shared shell | scroll; banner/history/redemptions | Entry/close/geometry + event checks |
| Chest contents/reveal / `reward-dialog` | `rewardButtons[kind].button`, chest action | Plain dynamic dialog → shared shell | scroll; chest frames/reel/odds/reward saved before reveal | Entry/close/geometry + shop/reward checks |
| Exact balances / `shop-balances-dialog` | `[data-shop-currency]` | Small plain dialog → shared reader | reader; exact full numeric balances | Entry/close/geometry + shop checks |
| Character selection / `character-picker` | `#menu-character` → picker trigger in `source/pio.js` | Previously ID-less dynamic dialog → registered shell | scroll; portraits, affinity details, character/unlock/replay actions | Entry/close/geometry + character/UI checks |
| Tia arrival / `tia-unlock-scene` | Deferred `playTiaUnlockScene`, character replay | Standalone scene/eyebrow → shared title/frame/X/back | scroll; cast and dialogue/Continue/Finish | Entry/close/geometry + original deferred-scene checks |

### Internal routes and contextual interfaces

These are parts of the registered screens, not additional floating shells:

- Menu subpages `game-menu-shops`, `game-menu-mail`, `game-menu-settings`: original `[data-menu-page]` / `[data-menu-back]` routing. All reuse the root shell. Shop tabs Chests/Boosts/Exchange/Gold preserve current-category state and transactions; Mail keeps update list, claim-all and individual claims; Settings retains original switches, volume sliders, dialogue/text options and Dev tools disclosures.
- Saves: On this device, Backup & transfer and Recovery via `setSavePage`; slot editor/confirmation area, code disclosure, file picker/import preview and recovery actions remain inside Saves.
- Item Book: three families, 25 tier pairs and mobile Material/Potion pages; full material/potion records are reader pages rather than new dialogs. Enhancement tables are disclosures.
- Achievements: Original and Mastery, categories/families, statuses, search, sort and paginated history are views of the same bounded shell.
- Expeditions: roster, destination and dispatch steps (`setExpeditionStep`); chapter route choices/opening/dispatch/result/report/replay share the story dialog. Journal, stamp exchange and completed-story queue use the registered parent-aware dialogs.
- Costumes: Pio/Tia sections, owned/available/locked cards and previews; fairies: collection cards, draw result, abilities and origin/maximum disclosures. Events: active/break/historical banners and event-history disclosure.
- Legacy gameplay side panels `main>aside` (Help and Shop upgrades), `#travelers`, `#upgrades`, event banner gallery, debug manual ingredient picker and current request status: inline gameplay content. The upgrade panel is moved, not cloned. The traveler dialog's action proxies continue forwarding to the authoritative traveler card.
- In-play contextual UI: brewer idle/tap/stroke speech (`source/pio.js`), visitor arrival/remaining-time shortcut, commission shortcut, equipped fairy shortcut, Pushcat faces/paws/timers, potion info and gauge, boost indicators, floating ingredient flights, enhancement/result particles, toast notices, saved-status messages and CSS/browser tooltips. These are HUD feedback, not menus; adding ornate frames would obstruct gameplay.
- The Menu tile labeled Contest / Coming Soon is a disabled/placeholder destination, not a hidden menu.
- Native browser UI: sell confirmation; slot overwrite/load; import confirmation; recovery confirmation; start-over confirmation; save-file chooser/download and immersive fullscreen. Preserve browser safety/focus behavior rather than replacing these with ornamental HTML. There are no custom prompt/alert menus in the audited source.
- `Asset-Library.html` is the standalone archival browser, outside the playable game's modal shell. Its folder/search/audio controls remain separate.

Verification evidence and exact source-preservation hashes live under `research/ui-design-system/`. `source/check-menu-system.cjs` checks the runtime registry against every actual dialog, visits the 25 entry points at four viewport sizes, and tests traveler/commission/upgrade behavior. Existing specialized browser checks cover Shop, Expeditions, Book and Achievements. Native destructive confirmations are documented and covered by existing storage logic checks, not automatically accepted against a player's save.

## G. UI quality checklist

- [ ] Registered stable dialog ID and a justified existing variant; updated this inventory.
- [ ] Canonical original ornamental frame, or a documented book/reader/reveal exception; no double frame.
- [ ] Purple starry title on applicable menus; no duplicate heading; correct accessible title.
- [ ] Original pink X; accessible label; common hit target, top-right placement and working Escape.
- [ ] Back is top left and returns to the correct menu/parent without changing a transaction.
- [ ] Shared typography, parchment, brown/gold accents, spacing and control tokens; readable contrast.
- [ ] Normal, large text and reduced-motion behavior retained; family/status meaning is also expressed in text.
- [ ] Desktop/mobile layouts fit; no horizontal overflow or overlapping controls; original corners remain intact.
- [ ] One sensible scrolling owner; header, pagination and time-sensitive actions remain reachable.
- [ ] Tab/Enter/focus indicators and screen labels work; nested details return to context.
- [ ] Existing prices, requirements, timers, rewards, lore, save compatibility and duplicate-claim safeguards unchanged.
- [ ] Rebuilt offline HTML matches source; relevant functional/browser checks pass; evidence and exceptions recorded.

### Costume shop themes

The existing scroll shell displays animated costumes for the current character only, grouped by filename-based thematic families (`COSTUME_FAMILIES`, `costumeFamily`). A labeled native theme selector filters the same cards; All themes shows every family. Empty families are omitted. These themes are remake browsing categories, not newly assigned events. Static portrait entries remain in the catalog and saved ownership for compatibility but are not displayed here. Existing buy/equip handlers, free flags, event restrictions and prices remain authoritative.

### Event brewing pilot

`source/event-rush-ui.js` presents Story and Dashboard as exclusive views inside the registered `event-dialog` scroll shell. There is no second modal or ornamental border. Story uses the same `.pm-speaker-scene`, `.pm-speaker-portrait` and `.pm-speaker-message` classes as Tia’s arrival: one speaker portrait above the text. Approved story content is loaded from `data/event-rush-dialogue.json`, including the active NPC portrait and result-specific ending. Return to event focuses the dashboard; Continue/Skip stay in Story. Replay is explicitly labeled and shows the continuously running event clock.

The dashboard puts phase/time, pouch, delivery count, current/next grade and checkpoint progress first. The grade ladder reads thresholds and cumulative rewards from `RUSH_RULES` and the economy methods, with textual Reached/Current/Next/Upcoming states. Featured costume cards preserve original preview aspect ratios and show character, ownership and free availability. The existing voucher choice and saved balance use `CostumeVoucher.png`. Results distinguish recorded earnings from pending storage; pending-choice totals span all runs. Instructions live in a native How to play disclosure.

Optional milestone scenes are available from Story memories at the configured B/A thresholds. They do not auto-open over brewing. New milestones reached during an existing conversation queue behind it; Return to event leaves them available. Unlock/read flags are saved with backwards-compatible defaults. The user-supplied 109-line revision is integrated: a 24-line opening, optional B/A milestone scenes and five settled-grade endings. Opening position is saved with a dialogue revision marker; unfinished development openings restart at line zero, while active/completed runs retain their timing and rewards.

`#rush-panel` lives in the existing `#events-panel` right sidebar, replacing the legacy-event section. Its single column fits the narrow sidebar; on phones it follows the existing Events section stacking. Historical events remain accessible only inside the event dialog. Never insert the panel inside `.potion-card`, whose artwork and controls use fixed positioning. Brew remains in the live panel and Deliver on the cauldron. Existing source data, timing, rewards, eligibility and prices are authoritative.

### Arrival dialogue speaker

Tia’s arrival shows exactly one `.tia-scene-portrait` above the full-width `.tia-chat-message`. The portrait and visible speaker name change with each line, including the unknown silhouette and speaking cats. There are no fixed cast portraits or pet columns. Reuse original dialogue portraits with `object-fit:contain`; scene text, navigation, replay and unlock handling stay in `source/pio.js`. Styling lives in the canonical stylesheet.

### Commission request cards

`#commission-board .commission-request` reuses `.commission-card.pm-card`, the scroll shell, shared primary buttons and tokens. Each card separates the posted customer/role/purpose, exact recipe/family/tier, bottle count/minimum level, and named guaranteed rewards. Existing Neet, Luke and Daisy portraits identify written requests, independent of their timed visits. Likeability is explicitly shop-wide, not a new personal relationship balance. Active cards add labeled native progress and a visible cauldron eligibility explanation associated with the delivery button. Keep these rules scoped to the board: Stamp Exchange also uses commission-card. No new reward calculations, save fields or delivery handlers live in the presentation.
