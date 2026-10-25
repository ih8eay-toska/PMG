# Before / After — UI copy presentation · revision 2

Writer: GLM-5.3-Flash — Creative Director & Writer.
Annotated wireframes for the three surfaces; reflects rev 2 (accordion Help, accordion Sources, single event route, no permanent Pushcat statistics). Legend: `( )` button · `<…>` live dynamic value · `▸` closed expandable row · `▾` open row (native `<details><summary>`; keyboard/tap accessible, never hover-only).

---

## 1. Event panel

### Before — a paragraph teaches what the clock shows and the dialog explains

```
┌──────────────────────────────────────────────┐
│ Next potion achievement   [View achievements]│
├──────────────────────────────────────────────┤
│ Events                                       │
│ 15-minute events · 5-minute redemption       │
│ breaks. Collect Miracle Solution for skins   │
│ and boosts.        ← permanent paragraph     │
│                                              │
│ < Cricket · Drops end in 11:40 >  ← clock    │
│ ✨ <340> Miracle Solution     ← balance      │
│ [ View current event ]                       │
└──────────────────────────────────────────────┘
```

### After — the panel is the activity; the existing button is the only help route

```
┌──────────────────────────────────────────────┐
│ Next potion achievement   [View achievements]│
├──────────────────────────────────────────────┤
│ Events                 ← panel label only    │
│ < Cricket · Redemption break 3:12 ·          │
│   Next: Summer 2015 · Part 1 >               │
│ ✨ <340> Miracle Solution                    │
│ [ View current event ] ← single route;       │
│     becomes [ Redeem ending event ] in break │
└──────────────────────────────────────────────┘
```
No paragraph; **no second "About events" control** (it would open the same dialog the button already opens). What the open dialog shows:

```
┌─ Event dialog (opened via the one button) ───┐
│ <status line + event suffixes>               │
│ ✨ <340> Miracle Solution saved              │
│ Miracle Solution drops only during the       │
│ 15-minute event. The following 5-minute      │
│ break stays open for redemption, and your    │
│ balance carries over.                        │
│ ▾ Past banners (historical)                  │
│   <existing banner-history sentences,        │
│    unchanged>                                │
└──────────────────────────────────────────────┘
```

---

## 2. Help

### Before — one 11-paragraph wall; wrong times; expeditions scattered elsewhere

```
┌──────────────────────────────────────────────┐
│ ×  The brewing loop                          │
│ …11 dense paragraphs, no headings…           │
│ (claim today: "Accept an order to start its  │
│  one-minute preparation deadline" — code     │
│  says 45–90 s)                               │
└──────────────────────────────────────────────┘
```

### After — brief intro + twelve one-line rows; numbers only inside topics

```
┌──────────────────────────────────────────────┐
│ ×  The brewing loop                          │
│ Catch a passing ingredient, brew, enhance,   │
│ sell. Open a topic for details.              │
│                                              │
│ ▾ Catch & brew        first catch = recipe   │
│ ▸ Enhance & sell       value vs. banking     │
│ ▸ Boost charges        auto-applied          │
│ ▸ Travelers & comm.    orders + batches      │
│ ▸ Pushcat helpers      1 ticket per summon   │
│ ▸ Fairies & costumes   equip one             │
│ ▸ Conveyor speeds      80/40 pps             │
│ ▸ Expeditions & trips  paid story jobs       │
│ ▸ Stamp Exchange       stamps → rewards      │
│ ▸ Upgrades & mastery   gold upgrades         │
│ ▸ Saves & keys         autosave · keys       │
│ ▸ Dev tools            debug notes           │
└──────────────────────────────────────────────┘
```

Initial visible text: the intro line + those twelve rows (no numbers). Example of one opened row (Tap/Enter the row → expands):

```
│ ▾ Expeditions & story trips                  │
│   Only a visitor currently offering or       │
│   waiting for a potion order can be          │
│   dispatched. Dispatch replaces that order,  │
│   costs gold, and cannot be cancelled. Only  │
│   the dispatched visitor is unavailable;     │
│   brewing and commissions continue.          │
│   Job tiers open when any one family reaches │
│   that tier; route materials come from       │
│   families already there. Trips pay stamps,  │
│   likeability and a supply set (while the    │
│   game is closed too). Trip times are base   │
│   durations; fairy bonuses shorten them.     │
│   Supply jobs: 120 s. Fairy searches: +60 s  │
│   per request level; 40% find, guaranteed    │
│   after two misses. Chapters: 120 s —        │
│   readable while the traveler is away, but   │
│   dispatch needs them in the shop. Selling   │
│   a matching potion shortens the wait        │
│   (~5 s per base-value sale, ≤20 s).         │
└──────────────────────────────────────────────┘
```
Pushcat topic (in place of any permanent statistics sentence) carries duration, Blackcat formula (5% + fairy points, × event), capacity 8, pause rules and intervals; the summon button on the real screen keeps only the cost and the live *"2/8 cats · Working / Paused"* state.

---

## 3. Sources & prototype notes

### Before — blended walls, repeated sentences, live rules misfiled

```
┌──────────────────────────────────────────────┐
│ ×  Evidence and fidelity                     │
│ …custom-balance paragraph (balance stated    │
│  twice; hyphenated-wiki sentence twice)…     │
│ …"orders award 1–5 charges" (stale; code     │
│  = 1–3) · fairy rules · cancelled never…     │
│ …licenses · statistics reference…            │
└──────────────────────────────────────────────┘
```

### After — 3-line opening; four rows; details collapsed but present

```
┌──────────────────────────────────────────────┐
│ ×  Sources & prototype notes                 │
│ A personal fan prototype of Potion Maker,    │
│ the 2015 mobile game by Sinsiroad (Pio       │
│ Design). Everything runs offline in this     │
│ file; saves stay on this device.             │
│                                              │
│ ▸ Where the data comes from                  │
│ ▸ What is still provisional                  │
│ ▸ Credits and licenses                       │
│ ▸ Statistics reference                       │
└──────────────────────────────────────────────┘
```

Opened example ("Where the data comes from"):

```
│ ▾ Where the data comes from                  │
│   Wiki figures are the original reference    │
│   values; this prototype's balance is its    │
│   own and is what the game plays.            │
│   The 75 potion entries come from the        │
│   [Potion] and [Materials] wiki pages; the   │
│   hyphenated wiki's Potions table            │
│   supplements them.                          │
│   Flavor text is fan-labeled (the wikis'     │
│   tables carry none).                        │
└──────────────────────────────────────────────┘
```
All three wiki anchors and both sound-license anchors remain real links (template-verified); the provisional list and the statistics reference keep their exact content inside expanded blocks. Live rules, the stale "1–5 charges" sentence, and the stale "Pushcat/Blackcat … future work" claim are deleted here — their verified content lives in Help topics and the remaining genuinely missing features stay as the inactive-ability line.

---

## Shared pattern recap (rev 2)

| Pattern | Use |
|---|---|
| One-line rows; details on open | Help (12 topics), Sources (4 blocks) |
| Costs/deadlines/consequences beside actions | dispatch cells, timer text, offer cards, save warnings — unchanged |
| Single existing control as help route | event panel's View current event (no new About) |
| Live state over permanent stats | helper button text + per-cat timers |
| Hover-only tooltips | deleted or redundant; facts to visible captions or expanded topics |
| Flavor walls (dialogs, mail, material lore) | untouched or trimmed with owner approval; never rewritten wholesale |
