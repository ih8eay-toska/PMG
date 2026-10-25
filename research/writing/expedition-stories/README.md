# Expedition story drafting — voice cards, approach, ledger

Status: **drafting for review only.** Nothing here edits game code, data, or balance.
`data/expedition-jobs.json` stays unchanged until a batch is approved; structured drafts live in
`drafts/<character>.json` and map back to the existing entries by **character id + array index (tier 1–25)**.
Job `name` fields are never altered; only `description` is rewritten.

## How the game consumes this file (checked)

- `source/app.js` (`renderExpeditions`): `job.name` renders on the job button; `job.description` is shown in the button tooltip, followed by guaranteed-reward details. Both characters' job lists are indexed by material tier (0–24 → Tier 1–25).
- `source/core.js` (`combinedExpeditionInfo`): tier selects the request template, cost, duration, stamps band, likeability, boost bundle, and fairy pool. Description has **no mechanical effect**.
- Protagonist routes are already handled separately: `EXPEDITION_PROFILES` (app.js) swaps Pio/Tia greetings. Story descriptions are therefore written **protagonist-neutral** ("the brewer", "the shop") so one text serves both routes. Bonus (rubies/tickets) also varies per visitor, not per story.
- The player picks one material family (Life/Mana/Stamina) plus tier per job; each tier's trio of variant materials is listed in `data/game-data.json`. Stories reference the correct trio and, where apt, the correct tier's potion names (e.g. Tier 4 Life → Small HP Potion).

## Canonical facts vs. invention

Wiki pages are cached raw HTML (`research/wiki/*.json`); most are stubs.

| Source class | Characters | Use |
| --- | --- | --- |
| `research/wiki` stub pages (facts) | Neet 19 cleric · Dolbur 21 warrior · Tirami 14 potion merchant, Pio's rival, ★ in text · Claire 23 knight, formal · Luke 15 wizard, silent, pet owner · Piria 21 thief, playful · Charlotte 27 wealthy madam, third-person self-reference · Demian 28 revenue officer, formal · Daisy 17 baker, potions go into bread · Kyle 18 traveler, issue challenges | Treated as canon; never contradicted. |
| `research/wiki` (thin) | Neet & Kyle personality fields are **empty** in the wiki | Voice built from role + project's established fan-written lines, labeled as fan-written. |
| `data/visitor-dialogue.json` `documented` | Tirami, Luke, Charlotte, Demian | User-provided original dialogue; tone anchors. |
| `data/visitor-dialogue.json` `entries` | All 10 | Project-established fan-written voices (offer/active/complete/failed/returning pools) — the primary in-repo voice reference. |
| `data/flavor-text.json`, `data/material-descriptions.json` | — | House style (dry, affectionate humor) and per-material imagery hooks (Drunkagora "lively name", Whyragora "sounds like a question", keepsakes like Mom's Heart "carry a mother's warmth"). |

**Everything written in this folder is fan-written.** No line is presented as recovered canon or quotation.

## Narrative approach (per character)

Tier bands give each character an arc with variety, not 25 rescues of the same plot:

- **Tiers 1–5** — home ground; small chores, small personalities.
- **6–10** — community horizon: guilds, markets, pilgrims, staff.
- **11–15** — exotic trade: preserves, specimens, wings, relics.
- **16–20** — legendary matter: scrolls, spirit tears, runes, dragon scales, sage stones.
- **21–25** — mythic close: pendants, curse-work, demon trade, plague containment, Lucifer's tears.

Story rules:

1. One concrete situation per job, ideally one that only this character would have.
2. Correct material names and tier semantics from `data/game-data.json`; correct families (the trios) and no invented ingredients/recipes; tier-appropriate potion names only when they add meaning.
3. Meaningful variety: chores, trades, rescues, negotiations, caretaking, mishap+recovery; no recycled plot skeletons with swapped nouns.
4. Small satisfying resolutions; growth where earned (Dolbur's documented "sometimes he makes mistakes" is a feature, and he improves across tiers).
5. Established relationships stay friendly (Tirami–Pio rivalry stays fond; Demian's tax "payback" is played his dignified way; Piria's mischief stays consensual and kind).
6. Safe-content rule inherited from Daisy's existing text: unusual materials stay sealed and separate from food.

## Voice cards

### Neet — cleric (19)
- **Documented:** occupation cleric; normal quests reward 5 protection charges (protection-themed). Personality section in wiki is empty.
- **Project voice (fan-written):** formal-courteous ("Could you prepare…", "I would be grateful"), shrine-centered: medicine shelf, pilgrims, night vigil, blessing ceremony, garden volunteers, children's lessons, sick parishioners, emergency kit.
- **Inference:** a steward: inventories, labels, rations, quiet humor; competence in healing and rites; unfazed by danger but refuses shortcuts; respect toward spirits/fairies/dragons.
- **Gaps:** whether her shrine serves a specific faith, her age-related history, family. Avoid specifying.

### Dolbur — warrior (21)
- **Documented:** energetic warrior, adventurer; reward is enhancement bonus items; Pio's quote: "always positive. But sometimes he makes mistakes."
- **Project voice:** exclamation-forward, competitive spars, forgot-the-supplies gag, guiding, guild exam, recruit mentor.
- **Inference:** good-hearted bluster; mishaps with cheerful repair; grows measurably more careful in the higher tiers while staying incapable of self-doubt.
- **Gaps:** no guild name, no backstory. Invented guild captain/cook stay unnamed archetypes.

### Tirami — potion merchant (14)
- **Documented:** peppy, competitive; Pio's rival; ★ in text; blushes on own failure, brags on win; only traveler issuing both normal and challenge quests; documented challenge lines anchor tone.
- **Project voice:** market plots — restock, tasting contest, rival stall, label design, trades, bets; closing ★ punctuation.
- **Inference:** commerce as sport; she rates shop work honestly while never conceding; fondness underneath the rivalry.
- **Gaps:** her shop's ownership (independent stall — keep vague), family.

### Claire — knight (23)
- **Documented:** palace knight, speaks formally; Tia calls her famous.
- **Project voice:** patrols, gate watch, infirmary, escort duty, kit inspections, squire mentorship, requisitions.
- **Inference:** duty-first, precise, quietly protective; cares for the people inside the regulation.
- **Gaps:** rank specifics, knight-commander's name (kept as title).

### Luke — wizard (15)
- **Documented:** silent, speaks quietly; pet owner who feeds potions to pets; Nyan-ticket rewards.
- **Project voice:** ellipsis-laden fragments; pets, familiars, journeys, gentle protection; third-person narration does most of the talking in descriptions.
- **Inference:** observational naturalist tone; communicates as much by action as speech; his magic is quiet, not flashy.
- **Gaps:** which pets (varied cats/birds/dog/familiars appear already; keep that variety).

### Piria — thief (21)
- **Documented:** thief, playful, adept (Tia anecdote: startled her via sneak attack); ticket rewards.
- **Project voice:** night jobs, informants, fences, rooftops, "no questions", favors; cheerful exits.
- **Inference:** consensual mischief; returns things; competence performed lightly; the town tolerates and half-adores her.
- **Gaps:** none big; keep victims imaginary or willing.

### Charlotte — madam (27)
- **Documented:** wealthy, high-class; **third-person self-reference**; challenge quest = one MAX-level potion, likeability reward.
- **Project voice:** afternoon tea, collections, portrait sitting, duchess rivalry, charity, family visits; "darling".
- **Inference:** taste as moral framework; generosity wrapped in vanity; genuinely delightful beneath the pose.
- **Gaps:** her family is "from the countryside" (existing line) — keep unspecified otherwise.

### Demian — revenue officer (28)
- **Documented:** revenue officer collecting taxes, formal, distinguished, likely high-ranked; documented line: "So the rumors are true. I'll be back." / "Hmm…money is not the only way."
- **Project voice:** valuations, ledgers, audits, licenses, checkpoints, capital journeys.
- **Inference:** paperwork as care for the kingdom; dry courtesy; a hidden practical streak (carriage travel, packing).
- **Gaps:** crown vs. kingdom color — keep generic "crown/office".

### Daisy — baker (17)
- **Documented:** baker, polite, uses potions in breadmaking; does not get upset on failure.
- **Project voice:** first batch rising, festival orders, honey rolls, wedding cakes, children's class, ill neighbors; *unusual materials stay sealed and separate from food.*
- **Inference:** hospitality superpower; biological-family unspecified ("species unknown" — never specify).
- **Gaps:** her bakery's exact town; keep it "the bakery".

### Kyle — traveler (18)
- **Documented:** young man, issues challenge quests; personality blank in wiki.
- **Project voice:** dares, guild test, proving himself, honest assessment; inventory plots in expedition boilerplate ("searches his stored goods, checking labels, setting suitable materials aside").
- **Inference:** earnest striver; keeps a surprisingly well-run storeroom; friendship-seeking, not mercenary.
- **Gaps:** what "the guild" is to him (keep as the local adventurers' guild from existing text).

## Progress ledger

| Batch | Character (25 jobs) | State | Draft file |
| --- | --- | --- | --- |
| 0 | VCards, outline, source study | done | README.md |
| 1 | neet, dolbur | **delivered; review edits applied** (fondness wording in Tirami card applies to all cards; Neet T5 sentence smoothed) | drafts/neet.json, drafts/dolbur.json |
| 2 | tirami, claire | **delivered — Batch 2 review applied** (Claire T2/T9 reconciliation clarity, T17/18/20/23/24/25 resolution variety; Tirami T15 roles, T18 wording, T20 rumor logic; trophy summary aligned; T21 annotation labeled as inference) | drafts/tirami.json, drafts/claire.json |
| r2 | potionTier canonicalization (all delivered drafts) | done — `potionTier` now lists `families[].recipes[].name` values, not `materials[].starting_name` (Life renames: Baby HP Potion, Blessed HP Potion, Homemade HP Potion, Cursed Bloody Reagent; all capitalization verbatim against game-data) | drafts/neet.json, drafts/dolbur.json, drafts/tirami.json, drafts/claire.json |
| v2-pilot | M1 "The Cold Roost" (shared-world, Rule R) | **accepted by owner**, review complete | pilot-M1-cold-roost.md |
| v2-t1-5 | all ten travelers, tiers 1–5 (Rule R routes) | **delivered — for DeepSeek playtest integration; owner review pending.** 120 route texts (tiers 1–4 × 3 families × 10 travelers); 15 tier-5 participant viewpoints (6 from accepted pilot, 9 new); 5 family-neutral tier-5 non-participant texts; 4 event-layer texts (shared opening + 3 route tellings). No game files touched — prose + mapping only. | stories-v2/ (per-traveler JSON ×10 + shared-events.json + HANDOFF.md) |
| 3 | luke, piria | queued — Luke keeps ellipsis speech inside third-person narration; Piria plots stay consensual and kind | — |
| 4 | charlotte, demian | queued — Charlotte third-person self-reference mandatory; Demian's dry courtesy per documented lines | — |
| 5 | daisy, kyle | queued — Daisy's sealed-and-separate food rule; Kyle's storeroom + guild-test plots | — |

Ledger conventions: batch k is "delivered" once its JSON + review text exist; any character whose 25
descriptions are approved can be merged into `data/expedition-jobs.json` by replacing `description`
only (names, order, IDs untouched) and running the documented `source/build.py` step — **not done by
default**; the review-first rule stands.

> **Premise change (owner, 2026-10-20):** the v1 direction (independent per-character stories) and the
> Batch 3–5 queue are **paused** at the owner's request. New premise: shared world, per-tier
> Life/Mana/Stamina branch choice, ten growth arcs, ensemble milestones at tiers 5/10/15/20/25 —
> planned in `PLAN-v2-shared-world.md` (pending owner decisions). The v1 drafts above remain untouched
> as reference and are not integrated.
