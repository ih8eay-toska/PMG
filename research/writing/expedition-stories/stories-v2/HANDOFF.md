# HANDOFF — Batch v2-stories-t1-5 → game integration (DeepSeek)

**Scope:** tiers 1–5 story text for all ten travelers. This batch is **prose + mapping only** — nothing in `data/`, `source/`, or the playable HTML has been changed by this work. Fan-written; owner review pending before and after integration. The M1 Cold Roost pilot (`pilot-M1-cold-roost.md`) is the accepted source for the tier-5 event.

## Files

| File | Contents |
|---|---|
| `stories-v2/neet-t1-5.json` … `kyle-t1-5.json` (10 files) | Per-traveler chapters. Tier 1–4 entries carry `hook` + `outcome`; tier-5 entries carry `text`. |
| `stories-v2/shared-events.json` | Tier-5 milestone layer: shared opening + three route tellings (Life/Mana/Stamina). |

## Entry schema

**Tier 1–4 (`kind: "route"`) — one per (traveler, tier, family):**
- `hook` — short, spoiler-free pre-dispatch text. Shown in the **job tooltip before dispatch**. It frames the job and may set a small tension, but **never** reveals what happens after the trip.
- `outcome` — the post-trip text. Shown **once, after the expedition completes** (completion screen/callout, wherever the game shows results). There is no nested `Outcome:` marker; do not split any prose by searching for the word.
- Explicit fields, so no text-cutting logic is needed: mapping is `(traveler, tier, family)` → `hook` before, `outcome` after.

**Tier 5 participants (`kind: "viewpoint"`)** — neet, dolbur, claire, daisy, kyle. One per (traveler, family/egg route). Builds on the accepted pilot's viewpoints; all fifteen exist (5 × 3).

**Tier 5 non-participants (`kind: "neutral"`, `applies_to: "any"`)** — luke, piria, tirami, charlotte, demian. One entry per traveler, family-neutral: a short spoiler-free `hook` shown **before dispatch**, and the existing `text` shown **only after completion** (it references the completed frost week and must not forward-run a trip). Both remain identical for all three families; keep them neutral.

**`shared-events.json`** — `kind: "shared"` (prints identically to every player) and `kind: "route"` (one telling per family, shown only when that family was selected).

## Exact identifiers used

- **Job names** (`data/expedition-jobs.json`, entries index 0–4 = tiers 1–5, byte-exact):
  - neet: Herbs for the Shrine / Mushroom Foraging / Helping in the Orchard / Gather Fallen Feathers / Tend the Nesting Grounds
  - dolbur: Trailside Herb Hunt / Mushrooms at Base Camp / Haul the Orchard Harvest / Scout the Feathered Cliffs / Guard the Nesting Ridge
  - tirami: Compare the Herb Merchants / Find the Finest Mushrooms / Win the Orchard Contract / Grade the Feather Bundles / Bid for Prized Eggs
  - claire: Medicinal Herbs for the Patrol / Check the Forest Rations / Escort the Orchard Workers / Survey the Feathered Watchtower / Protect the Cliffside Nests
  - luke: Herbs for the Familiars / Find Familiar-Safe Mushrooms / Fruit Treats for the Pets / Soft Feathers for New Bedding / Watch over Familiar Eggs
  - piria: A Quiet Visit to the Herb Market / Mushrooms from a Secret Path / An Orchard Shortcut / Find the Hidden Feather Cache / Negotiate a Nesting Permit
  - charlotte: Arrange a Herbal Tea Delivery / Select Mushrooms for the Kitchen / An Afternoon at the Orchard / Feathers for an Elegant Fan / Choose Eggs for the Estate
  - demian: Inspect the Herbal Inventory / Check the Mushroom Weight Tickets / Audit the Orchard Receipts / Count the Feather Import Bundles / Review the Egg Handling Permits
  - daisy: Herbs for Savoury Bread / Mushrooms for the Morning Loaves / Help Pick the Orchard Fruit / Feathers for a Pastry Brush / Eggs for a Fresh Cake Batch
  - kyle: Find Suitable Herbs in Storage / Sort the Mushroom Stockpile / Check the Fruit Crates / Dust off the Feather Bundles / Inspect the Egg Packing Straw
- **Materials** (`data/game-data.json`, byte-exact): Life = Red herb / Sturdy mushroom / Fruit of power / Rainbow bird feathers / Rainbow bird's egg. Mana = Blue herb / Clever mushroom / Fruit of wisdom / Bluebird feathers / Bluebird's egg. Stamina = Yellow herb / Lively mushroom / Fruit of spirit / Wyvern feathers / Wyvern's egg.

## Display model — completion scene and replay journal

**Tier gate (current, live):** the game's tier gate is the **any-one-family rule now in `source/core.js`** — a family's material is offered once any route reaches the tier. Display keys purely on the **family actually selected at dispatch**; no gate logic is described or changed here. (An earlier note in this handoff called the any-one gate pending; that is stale — treat it as done.)

1. **Tiers 1–4, before dispatch:** the job tooltip shows `hook` for `(traveler, tier, selected family)`.
2. **Tiers 1–4, after completion:** the completion screen/result area shows `outcome` for the same triple. The hook and outcome are separate displays; never shown concatenated, and completed outcomes are never put back into the pre-dispatch tooltip.
3. **Tier 5, participants — first completion of a family (per player):** a completion scene, in this order:
   1. the `shared` opening (identical for everyone),
   2. the `route` telling for the selected family,
   3. that traveler's `viewpoint` text.
   Best presented as its own readable panel/scene, not crammed into a tooltip.
4. **Tier 5, later visits:** the shared opening and route telling must **not** replay automatically — completion uses only that traveler's `viewpoint` text. The full scene stays available on demand: write it into a **replay journal** (event log/history) keyed `(family)` at first completion, where the player can reread it voluntarily. Journal entries are named (opening → telling per family) and never depend on visit order.
5. **Tier 5, non-participants:** `hook` before dispatch, `text` after completion — same mapping discipline as tiers 1–4. They join no scene and take no branch; their texts stay identical for all three families.
6. **Pre-dispatch preview recommendation (all tiers):** the `hook` must be **visible on the screen**, not hidden in a hover-only tooltip. Recommend an inline preview line/panel on the job card itself (and the same content announced for screen readers), because touch users have no hover state at all; hover tooltips may duplicate it where a pointer exists. The outcome texts are pre-dispatch secrets and belong only after completion, never in the card or tooltip.

## Content rules already applied (do not weaken during integration)

- Chosen material is the story's focus; nothing claims an egg or any settlement ingredient is awarded (core.js:269 region — stamps/likeability/boosts/bonuses only).
- Cold Roost spine held in all three tellings and every viewpoint: frost down early (S1), all three clutches/every hatch safe (S2), crag protected + named (S3), almanac hatch-days (S6), patrol schedule + closures (S7ab), frost breaks within the week with **no lasting orchard damage** in every telling, the rope-drop catch = "an introduction" (S5, Life/Mana).
- Route-unique outcomes stay route-owned: no tier 1–4 text depends on another tier, family, or traveler's route outcome being seen (Daisy's and Charlotte's tier-4 feather sourcing, Dolbur's tier-3 Stamina haul, Kyle's tier-2 Mana labels, and Tirami's tier-3 Mana clause are all self-contained now). Within one route, participant viewpoints may reference each other's on-crag contributions (same event telling), never another route's.
- Luke's ellipses appear only inside quoted speech or clearly framed ledger/notebook lines; third-person narration around them is plain.
- Daisy's tier-5 job title mentions eggs — her viewpoint explicitly keeps the wild clutch sealed and apart, cake batch uses farm-market eggs kitchen-side (owner decision pending, see below).
- Passage sizes kept screen-readable: hooks ~1–2 sentences; outcomes ~2–4 sentences; tier-5 viewpoints longest by type.

## Coverage completed

- 10 travelers × tiers 1–4 × 3 families = **120 route entries**, each split as `hook` + `outcome` (spoiler discipline enforced per entry).
- Tier 5: 5 participants × 3 routes = **15 viewpoint texts** — six from the accepted pilot (Life: Daisy, Claire; Mana: Neet, Kyle; Stamina: Dolbur, Daisy), nine new (Life: Neet, Dolbur, Kyle; Mana: Dolbur, Claire, Daisy; Stamina: Neet, Claire, Kyle).
- Tier 5: 5 family-neutral non-participant texts, each paired with a spoiler-free neutral hook (hook = pre-dispatch, text = post-completion).
- Milestone layer: 1 shared opening + 3 route tellings = 4 event texts, each telling now carrying the full spine (all three hatches, named/protected crag, almanac, frost break without lasting damage).

## Decisions still open for the owner (not blockers for a first playtest build)

1. **Event/space for the completion scene:** the model above assumes the game can show a tier-5 scene (or at minimum a journal panel). If neither exists yet, DeepSeek should fall back to letting the tier-5 tooltip show `viewpoint`/`neutral` only and report back rather than concatenating.
2. **Daisy T5 reading** (job title vs. story focus): her batch keeps the wild eggs sealed and apart and uses only farm-market eggs — confirm or amend.
3. **Non-participant tier-5 neutrality:** identical text for all three families by design — acceptable, or request a light per-family flavoring pass.
