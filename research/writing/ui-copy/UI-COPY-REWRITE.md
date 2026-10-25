# UI-Copy Rewrite — Potion Maker (fan prototype) · revision 2

Writer: GLM-5.3-Flash — Creative Director & Writer.
Owner goal: **less visible instructional text** — short visible labels with details genuinely hidden behind named, tap/keyboard-friendly controls; every mechanism was traced in current code (see UI-COPY-AUDIT.md §7 matrix).
Rev 3 (narrow): visitor-departure wording, arrival base-wait phrasing, base trip durations + chapter readability, and removal of stale Sources future-work claims — all code-cited in the audit §7. All other rev-2 decisions stand.

## Implementation notes for DeepSeek

- **Authoritative files:** `source/index.template.html`, `source/app.js` (offsets cited), `data/updates.json`. Regenerate `Potion-Maker.html` with the documented build; do not hand-edit it.
- **`[TEXT]`** = string-only edit · **`[LAYOUT]`** = markup/wiring change · **`[LAYOUT minor]`** = small, contained change.
- **Expandable pattern (one consistent mechanism):** native `<details><summary>` (or a button + `aria-expanded` + region, same behavior). Keyboard-reachable, no hover dependence, no hover-only `title` carriers remain.
- **Help = topic list with expandable details** (§C is the contract: exact initial view + exact expanded contents).
- **Event help has a single route:** the existing *View current event* button. **No extra "About events" control** (withdrawn from rev 1 — it would duplicate the same destination).
- **Pushcat:** immediate cost visible; duration/odds/capacity/pause rules live only in Help ▸; the long hover `title` is deleted; existing live state (*"N/8 cats · Working/Paused"*, per-cat timer cells) is preserved untouched.
- Immutably preserved: save/import warnings, all verified economy numbers, story prose, dialogue, material flavor.

---

## A. Main brewing screen

*Initial visible after edits: activity line, room captions, tickets, event clock + balance + one button; no dev block, no event paragraph.*

### A.1 How-to vs intro — `[TEXT]`

**Current popover (SEC 1.1):**
> How to play
> A handful of herbs, a little luck, and something wonderful in the cauldron. Pick a passing ingredient to start a potion. Add more ingredients or enhance to multiply its value. Sell before luck runs out and grow your shop.

**Replacement:**
> How to play
> 1. Catch a passing ingredient to start a potion.
> 2. Add more ingredients, or Enhance to multiply value.
> 3. Sell before luck runs out and grow your shop.
> Travelers, commissions, expeditions and helpers are explained in Help.

**Current intro line (SEC 1.2):**
> Your first ingredient decides the potion. Every ingredient after it adds value. Your workbench · The cauldron is ready.

**Replacement:**
> Your first catch sets the potion. Every catch after adds value.

`Your workbench` / `The cauldron is ready.` unchanged.

**`[LAYOUT minor]` alternative (owner's pick):** header item `Help & notes` opens the Help dialog directly; the popover text is then unnecessary.

### A.2 Dev note and block relocation — `[TEXT]` + `[LAYOUT]`

**Current (rack header):**
> Choose exact ingredients (debug) · Brewing mode: Conveyor (default). Exact-ingredient brewing is a debug test tool; visitor expedition Life/Mana/Stamina materials are chosen separately.

**Replacement:**
> Brewing mode: Conveyor. Exact ingredients is a debug tool.

`[LAYOUT]`: relocate the Dev cheats block (SEC 1.1: *"Debug shortcuts change this browser's saved game. The conveyor is the normal brewing mode."*, `+100,000,000 coins`, `Unlock all materials`, the exact-ingredients switch) behind **Settings ▸ Dev tools**. Function and labels unchanged; the dev facts also appear once as Help topic 12. The current hover title (app @148231) is deleted in F.2.

### A.3 Events panel — `[TEXT]` removal; single route; no new control

**Current static paragraph (SEC 1.6):**
> Events · 15-minute events · 5-minute redemption breaks. Collect Miracle Solution for skins and boosts.

**Action: delete.** The panel then shows exactly what the code already renders:
```
Events
{clock}   e.g. "Cricket · Drops end in 11:40" / "Cricket · Redemption break 3:12 · Next: Summer 2015 · Part 1" (eventStatusText(), app @123627)
✨ {N}     "340 Miracle Solution" (dialog variant appends "saved")
[ View current event ]  → label becomes [ Redeem ending event ] during the break
```
The **existing** button is the optional-help route: it opens the event dialog, which carries the explanation and the redemption shop. No second About button (rev 1's redundant proposal is retracted).

**Event dialog pacing — `[TEXT]` (first sentences verified @122692):**
> Miracle Solution drops during the 15-minute event. The following 5-minute break stays open for redemption. Your balance carries over. Original banner dates …

**Replacement (same facts; history explicitly labeled):**
> Miracle Solution drops only during the 15-minute event. The following 5-minute break stays open for redemption, and your balance carries over.
> **Past banners (historical).** *(existing banner-history sentences continue unchanged)*

### A.4 Pushcat summon — `[TEXT]` + `[LAYOUT]`

*Player sees: "Summon Pushcat · 1 ticket" and, with cats out, "2/8 cats · Working / Paused" plus per-cat timer cells. Nothing about odds/duration is permanently displayed.*

- Remove the **entire hover `title`** (current text, app @148231): *"1 ticket · {d} working seconds · {p}% Blackcat chance · up to 8 cats. Timers pause while empty, hidden or closed. Pushcat {a}s / Blackcat {b}s per catch. Event: double working time. Event: 5× Blackcat odds. Custom intervals and prices."* — its content moves verbatim into Help topic 5 (§C.5); the two event suffixes are already visible in the event clock line, so they are not lost.
- Delete rev 1's proposed permanent statistics caption entirely — **no permanent sentence** anywhere.
- Keep all existing live state: the button text toggling *"Summon Pushcat · 1 ticket"* ↔ *"N/8 cats · Working/Paused"*, and per-cat timer cells (`syncHelperCats()`). No new UI elements.

### A.5 Sell / give labels — keep (aria parity `[LAYOUT minor]`)

*"Advance quest" / "Deliver commission" / "Sell potion"* labels and their pointer-`title` extras stay; the same meaning becomes available to keyboard/touch through aria, not new paragraphs.

---

## B. Updates & gifts (mail) — `data/updates.json` `[TEXT]`, owner-approved content edit

Heading and CTA unchanged: *"See what changed and claim a thank-you gift with each release."* / `Claim all gifts`. Notes become short bullets.

1. **2026-10-22 · Neet's story chapters are here** — Play Neet's tier-1–5 chapters; choose unlocked Life/Mana/Stamina routes to shape the story. Trip reports land in the Story journal; selling the route's potion shortens the trip. +10 rubies.
2. **2026-10-17 · New journeys, potion commissions, and a livelier shop** — Commissions: one order, three matching potions, no fee or deadline; every third adds a fairy while unmaxed fairies remain. Expeditions: 250 jobs (25 per visitor), dispatched from a visitor's page; dispatch costs gold, replaces the visitor's order, and continues while closed. Stamps redeem at the Stamp Exchange. +20 rubies.
3. **2026-10-17 · A helping paw for your potion shop** — Pushcat helpers: one ticket to summon, up to 8 cats, 60 working seconds before bonuses; they gather ingredients, tickets and Solution; timers survive reloads. +10 rubies.
4. **2026-10-17 · Get to know your fairy companions** — Fairy entries show exact current-level bonuses; unowned show a level-1 preview; 32 of 38 have working abilities and inactive ones say so. +10 rubies.
5. **2026-10-17 · A smoother shop and safer saves** — New settings (audio, speed, shortcuts, motion, dialogue, text size); 5-second autosave, backups, shareable saves; costumes cost 200 tickets, duplicates return 200. +10 rubies.

---

## C. Help — compact topic list with expandable details (the contract)

### C.0 Pattern and placement

`[LAYOUT]`: replace the dialog's three dense paragraphs (SEC 3.1–3.3) with a native `<details>` list inside the existing dialog. Every topic is a `summary` row (one `dt`-style label + one terse line); its content expands in place. No page switching, no new screens; scroll stays as today.

### C.1 What the player sees on open (initial visible — exact)

> **The brewing loop**
> Catch a passing ingredient, brew, enhance, sell. Open a topic for details.
>
> ▾ **Catch & brew** — *The first catch sets the recipe; later catches add value.*
> ▸ **Enhance & sell** — *Enhance raises value and risks loss; Sell banks it.*
> ▸ **Boost charges** — *Protection, enhancement and double-sale apply automatically.*
> ▸ **Travelers & commissions** — *Serve short orders and fee-free batches.*
> ▸ **Pushcat helpers** — *One ticket summons a cat; eight can work at once.*
> ▸ **Fairies & costumes** — *Equip one fairy; duplicates raise its level.*
> ▸ **Conveyor speeds** — *Belt slows when empty; Emission packs it denser.*
> ▸ **Expeditions & story trips** — *Send an ordering visitor on a paid story job.*
> ▸ **Stamp Exchange** — *Stamps buy boosts, tickets or fairy copies.*
> ▸ **Upgrades & mastery** — *Gold upgrades; later tiers need family mastery.*
> ▸ **Saves & keys** — *Autosave every 5 s; keys 1–6, E, S.*
> ▸ **Dev tools** — *Exact ingredients and debug shortcuts change this save.*

(All rows closed by default except none; rows are one line each on desktop. "▸/▾" depicts the disclosure glyph, aria-labels are the topic names.)

### C.2 Expanded contents — exact texts per topic

All sentences verified; corrections applied (prep 45–90 s; arrivals 20–60 s; 1–3 boosts; likeability; all-three-families stamp gate; 40%/two-miss; 120 s story base; sale-reduction formula; Blackcat formula).

**1 · Catch & brew**
> The conveyor carries unlocked ingredients even while the cauldron is empty. The first ingredient you catch fixes the recipe; later catches add value. Pushcat tickets and Miracle Solution keep moving in both ingredient modes.

**2 · Enhance & sell**
> Enhance raises a potion's value but risks losing it. Sell banks the gold. Life favors short, risky chains; Mana offers steadier brewing; Stamina has safer attempts and a longer mastery path. Selling before mastery can earn gold more efficiently.

**3 · Boost charges**
> Protection saves a failed attempt; enhancement charges add ten percentage points; selling charges double a sale. Charges apply automatically.

**4 · Travelers & commissions**
> Travelers visit after a short wait, which some fairies reduce. Other travelers can still visit during an expedition. Each offer stands for one minute. Accepting starts a 45–90 second prep window; visitor-time fairies can add more, and their cards show the seconds. A matching potion turns Sell into Advance quest. Delivered orders earn visitor EXP; the traveler returns after 30 seconds with two tickets and 1–3 boost charges of one random type, then heads home as soon as the reward is paid out.
> Commissions ask for three matching potions: no fee, no deadline, progress saved; every third completed commission adds an unmaxed fairy. Deliveries use the potion instead of selling it. Short quests still complete alongside. A failed order ends the visit at its prep window, and the traveler leaves about a minute later; completed travelers leave the moment their reward pays out.

**5 · Pushcat helpers**
> One ticket per summon, up to eight cats, each with its own spot and timer. Cats pause while the cauldron is empty or the game is hidden or closed; timers survive reloads. Working time starts at 60 seconds, adjusted by fairies and events (2× during Halak's Birthday). Blackcat chance starts at 5%, gains listed fairy percentage points, and multiplies with the active event (5× during Summer Part 2). Pushcat speed upgrades cut catch intervals from 1.00 s toward 0.30 s, and Blackcats operate twice as fast. Cats add caught ingredients to the potion and route tickets and Miracle Solution to their balances. Fairy and event bonuses lock in when each cat is summoned.

**6 · Fairies & costumes**
> Equip one fairy for its passive effect; duplicates raise its level, up to 10. Entries show current-level values, or a level-1 preview if unowned; inactive abilities are labeled. Ingredient spawn bonuses change relative weights, not guaranteed drop percentages. Enhancement success bonuses remain subject to the 99% ceiling. Regular Live2D costumes cost 200 tickets; duplicates grant 200 tickets; event costumes are redeemed in their events.

**7 · Conveyor speeds**
> Brewing moves at 80 pixels per second; an empty cauldron slows to 40 so you can choose a recipe. Material Emission packs up to 3.28× density and also means more special-drop opportunities. Special-drop odds per spawn are the same in both states. Each visible strip of a stacked card selects that material.

**8 · Expeditions & story trips**
> Only a visitor currently offering or waiting for a potion order can be dispatched. Dispatch replaces that order, costs gold, and cannot be cancelled. Only the dispatched visitor is unavailable; brewing and commissions continue.
> A job tier opens when any one material family reaches that tier; only families already at that tier can offer their material as the story route. The material shapes the story and is not awarded when the trip returns. Trips continue while the game is closed and pay stamps, likeability and a supply set, with random fairy and currency bonuses.
> Listed trip lengths are base durations; request-duration fairy bonuses shorten them. Supply jobs take 120 seconds. Fairy searches take 120 seconds plus 60 per request level, finding a fairy 40% of the time — a guaranteed find after two misses for the same fairy. Story chapters take 120 seconds; a chapter opens once one material family reaches its tier, and its route options follow family tiers. Unlocked chapters can be read while their traveler is away, but starting the trip still requires them in the shop. Selling a matching potion — same family and tier as the chapter's route material — shortens the wait: each sale saves about 5 seconds at base value, scaled with the sale's value, at most 20 seconds per sale.

**9 · Stamp Exchange**
> Every expedition awards stamps. Boost offers are always available. Ticket offers open when all three material families reach tier 6; fairy copies open at their listed tier, which every family must reach. A fairy exchange grants one copy, including levels for fairies you already own. Costs are shown on each offer (5 stamps per boost charge, 10 per ticket, and 12 stamps plus 2 per unlock tier for a fairy).

**10 · Upgrades & mastery**
> Upgrades cost gold and apply immediately. Some material upgrades require earlier potions in that family to be mastered; the upgrade shows your progress.

**11 · Saves & keys**
> Saves live in this browser and autosave every 5 seconds; the Save dialog shows exports, imports and the pre-import backup. Keys: 1–6 catch visible conveyor items; in exact-ingredient mode, 1–3 choose materials and 4–6 catch the special-drop strip; E enhances; S sells or hands over a matching quest potion.

**12 · Dev tools**
> Dev shortcuts change this browser's saved game. The conveyor is the normal brewing mode. Exact-ingredient brewing is a debug test tool; it still runs the underlying conveyor for helper collection, and visitor expedition materials are chosen separately.

### C.3 What moves where (so nothing is lost)

- Traveler/commission rules ↔ SEC 3.2 paragraph + dialog intros + Sources §4.2 sentences → Topics 4 and 8 (single home).
- Boost-effect sentences (dropped from rev 1) → Topic 3, verbatim restored.
- "Expeditions cannot be cancelled." → Topic 8 + recommended one-line beside the dispatch button (owner item 5).
- Dev facts → Topic 12 (+ Settings block after A.2).
- Dialog intros shrink (§E) because Topics carry the detail; costs/deadlines/consequences stay beside their controls (dispatch cost cells, timer text, save warnings, offer cards) — those never moved into Help.

---

## D. Sources & prototype notes — further reduced, expandable blocks

### D.1 Initial visible (exact)

> **Sources & prototype notes**
> A personal fan prototype of Potion Maker, the 2015 mobile game by Sinsiroad (Pio Design). Everything runs offline in this file; saves stay on this device.
>
> ▸ **Where the data comes from** — Wiki sources and this prototype's own balance.
> ▸ **What is still provisional** — Figures still being tuned.
> ▸ **Credits and licenses** — Sounds and original art/music credits.
> ▸ **Statistics reference** — Where the counters' categories come from.

*(four `<details>` rows; one summary line each.)*

### D.2 Expanded contents (exact)

**Where the data comes from**
> Wiki figures are the original reference values; this prototype's balance — potion values, upgrade costs, chest pools, fairy bonuses — is its own and is what the game plays.
> The 75 potion entries and their recorded numeric values come from the [Potion](https://potionmaker.fandom.com/wiki/Potion) and [Materials](https://potionmaker.fandom.com/wiki/Materials) articles; that page lists names, base prices and starting potions but no flavor text, so the Material book uses labeled fan-written interpretations.
> Powerup behavior, quest rewards, EXP, traveler levels, and normal request costs, durations and base reward odds reference both wikis, supplemented by the [hyphenated wiki's Potions table](https://potion-maker.fandom.com/wiki/Potions).
> Fairy enhancement-value bonuses are spread across the recipe's steps, applying once over a full enhancement path; saved gold, unlocked tiers, ownership and in-progress potion values were preserved in that change.
> Original reference figures and balance calculations remain with the project's research notes.

*(dedupes the repeated custom-balance and hyphenated-wiki sentences from SEC 4.1; keeps the three real wiki anchors exactly as in the template.)*

**What is still provisional**
> Upgrade costs and intermediate increments (retained at your request), exact conveyor speed and emission scaling, sale rounding, enhancement timing, visitor arrival intervals, order distributions, interpolated quest-EXP entries, and long-request reward tables.
> A few fairy abilities remain unimplemented; affected entries say so in the Fairy Collection.

*(The prior "full Pushcat/Blackcat event systems and quest material-rate abilities remain future work" claim was stale — helper event multipliers and quest-material spawn weighting are implemented — and was removed rather than preserved; evidence in audit §7. The inactive-fairy line is the only genuinely missing feature listed.)*

**Credits and licenses**
> The visitor arrival sound is "Shop door bell.wav" by 775noise (Freesound, CC0 1.0). *[anchor kept]* · The ingredient-impact splash is "Splash, small #2" by Joseph SARDIN (BigSoundBank, CC0 1.0). *[anchor kept]* · The original assets, including music, are credited to Sinsiroad and the original artists/composers. Wiki documentation is credited to its contributors. All game files and progress remain local.

**Statistics reference**
> The Statistics screen uses the wiki achievement categories as a reference for coins collected, successful/failed enhancements, ingredients used and level-1 sales, plus local gameplay breakdowns. Counters unavailable in older saves begin at migration and are marked as tracked history.

### D.3 Deleted here (live rules → Help topics; repetition → removed)

- *"Normal-quest response text is fan-written; original portraits and documented reward bundles are used. Visitor potion orders award 1–5 charges… Unaccepted offers expire after one minute; completed and failed visitors also leave automatically after one minute. Long traveler requests retain their separate reward tables."* — the 1–5 figure is **contradicted by code** (1–3); the sentence is deleted from Sources. Its real content is already in Topic 4, corrected by this revision: 1–3 charges, 60-s offer expiry, completed travelers departing at payout, and failed visits' one-minute linger; long-request tables stay in the provisional block.
- *"Supply errands grant three boost charges suited to the visitor; fairy searches have a 40% chance, guaranteed after two misses…"* — Topic 8 (numbers verified).
- *"The Conveyor behavior… follow your observations."* interior sentence — provisional block keeps it in one clause ("retained at your request" context).
- Repeated "hyphenated wiki" sentence and second custom-balance paragraph — deduped in D.2.

---

## E. Feature-dialog intro one-liners — `[TEXT]`

Intros name the activity; details live in cards, dynamic notes, and Help topics.

1. **Achievements (SEC 6.1)** → *"Each potion has its own achievement title and original peak-lore. Earn it by successfully enhancing that potion to maximum level."* + muted small note *"Older saves may have partial recipe history."* (kept, moved down).
2. **Costume shop (SEC 8.1)** → *"Live2D costumes use Pushcat tickets."* The no-model note stays beside such costumes (`[LAYOUT minor]`).
3. **Fairy (SEC 9.1)** → *"Equip one fairy for its passive effect; duplicates raise its level, up to 10."* Spawn-weight and 99% sentences → Topic 6 (they may also appear as one-line card-section footnotes, DeepSeek's call — do not keep in both places).
4. **Stamp Exchange (SEC 12.1)** → *"Every expedition awards stamps. Exchange them for boost charges, Pushcat tickets or fairy copies."* + one-line unlock strip *"Ticket and fairy offers need that tier in all three families."* (`[LAYOUT minor]`; per-offer cost/tier lines are already dynamic).
5. **Expedition menu (SEC 13.2)** → *"Select a job, choose a route material, then dispatch. Only a visitor with a live order can be sent; the material shapes the story and is not awarded."* Provenance sentence onto Sources; hover wording → *"Open a job to see its full reward pool."* Keep the concrete dynamic dispatch notes (@61400 cluster) — they are the "beside the decision" layer; optional trims: the two "dispatch waits…" variants can drop their repeated opening clause.
6. **Commissions (SEC 16.1 + board note @68030 + status @68400)** → *"Choose one order and deliver its three potions — no fee, no deadline. Short quests still complete alongside."* Board note → *"Deliveries consume the potion instead of selling it. Any higher level qualifies. Finish one commission to refresh the choices."* (fairy sentence now in Topic 4). Status suffix *"· No entry fee or time limit."* — owner item (removal recommended; same fact in intro + note).
7. **Save (SEC 17.1)** — unchanged. **Bank (SEC 18.1)** — unchanged. Catalog/Statistics/Story/Journal/Traveler-order — unchanged.
8. **Event dialog** — see A.3; also the event page's status line already carries the honest disabled state *"Upcoming rotation · redemption opens when this event starts."* (keep).

---

## F. Hover-only tooltips → visible or removed

1. **Reward chests** — keep buttons; add a visible odds caption (numbers verified): > Free every 1h · up to 3 paid per 20 active min · paid keeps the free timer · one boost type per opening. *(ticket/ruby case: show the expectation line as caption instead of title)*. The current ~200-char `title` (@131250–@136100) may remain as a pointer-extra or be deleted — either way nothing depends on it.
2. **Pushcat summon** — title deleted (A.4).
3. **Route-locked job tiles (@62780)** — the existing `small` line shows *"Upgrade X materials to tier N to unlock this route."* visibly; the `title` is redundant → delete.
4. **Job reward pool** — *"hover a job"* → *"Open a job"* (`[LAYOUT minor]`: reward pool opens on click/focus).

---

## G. Visible vs expanded, per surface (review doc for the owner)

| Surface | Visible after edits | Optional/expanded |
|---|---|---|
| Main screen | Activity line; room captions; event clock + balance + View current event; "Summon Pushcat · 1 ticket" + live N/8 state; control labels | Help topics; event dialog (existing button); Dev block behind Settings |
| Travelers/orders | Label + timer + prep deadline; dialog dialogue (flavor kept) | Help Topic 4 |
| Commissions | Intro line; board note (qualification rules); per-order requirements | Help Topic 4 |
| Expeditions | One-line orientation; cost/tier cells; unlock notes; dispatch notes | Help Topic 8; chapter/journal dialogs open as today |
| Stamps | One-line intro + unlock strip; per-offer cost/tier | Help Topic 9 |
| Fairies/costumes | Two-line/eight-word intros; in-card values & notes | Help Topics 5–6 |
| Events | Panel clock/balance/button; dialog status + mechanics first | Past banners (historical) block |
| Help | Intro line + 12 one-line rows | Topic details (§C.2 exactly) |
| Sources | 3-line opening + 4 rows | Block details (§D.2 exactly) |
| Saves | Full warning text unchanged | — |

---

## H. Remaining questions and owner items

Live-behavior corrections are resolved by the verification matrix (audit §7) and are not listed here. Genuinely open:

1. **Unverified-by-code claims retained from today's copy** (not contradicted, not re-verified in this pass): *"Selling before mastery can earn gold more efficiently"* (Help original; topic 2 keeps it as-is), and the wiki-credit framing of "*Powerup behavior, quest rewards, EXP…*" as design reference.
2. **Banner-history tail** past *"Your balance carries over."* (@122692+) — reproduce verbatim in the "Past banners (historical)" block during implementation.
3. **Runtime QA after edits**: dialog focus order, `<details>` semantics in the Help dialog, light-theme contrast, touch behavior — the audit's explicit residual gap.
4. **CSS-only tooltips** beyond `title` attributes: none found in sampled strings; re-check once during implementation.
5. Owner content/design choices (as flagged in audit §10): events-paragraph deletion, mail trims, Dev relocation, commission status suffix, "cannot be cancelled" placement beside dispatch, Help labels/contents (§C), Sources opening wording (§D).

## I. Approvals checklist (what changes, at a glance)

Removes: events-panel paragraph; helper hover wall; Sources repetition + stale "1–5" sentence; dialog re-teaching; compresses mail.
Adds: Help accordion (§C), Sources accordion (§D), reward-odds caption, chapter/trip guidance *inside Topic 8* (not new permanent text), "cannot be cancelled" line (owner choice of placement).
Untouched: gameplay, saves, story/dialogue/material flavor, save warnings, every verified number's value (only their homes move).
