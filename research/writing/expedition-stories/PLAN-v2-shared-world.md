# Shared-world expedition plan v2 — arcs, material branches, ensemble milestones

Status: **accepted by the owner as a planning framework; pilot drafting authorized for M1 ("The Cold
Roost") only. Fan-written creative planning; not game text, not code, not balance.**
Supersedes the v1 drafting direction (independent per-character stories). The v1 drafts
(`drafts/neet.json`, `dolbur.json`, `tirami.json`, `claire.json`) are **preserved untouched as
reference** — four full voices, several scenes reusable. Nothing is integrated into `data/` or source.

Scope limits (per owner): no 250-chapter drafting — M1 pilot first; no rewards/unlock/implementation
decisions; randomized potion variants explicitly out of scope.

---

## 0. What this plan is built on (inspected)

- `data/game-data.json` — families Life/Mana/Stamina; per tier one color-variant material per family
  (Life = red/first, Mana = blue/second, Stamina = gold/third), e.g. tier 5:
  `Rainbow bird's egg / Bluebird's egg / Wyvern's egg`; canonical potion names verified against
  `families[].recipes[].name` (not `materials[].starting_name`).
- `data/expedition-jobs.json` — all 250 job names (10 × 25). They are the chapter hooks; several tiers
  are **naturally event-aligned across all ten characters** (eggs at tier 5, flowers at tier 10,
  crystals at tier 15, legend stones at tier 20, fallen tears at tier 25), which makes the ensemble
  premise fall on prepared ground.
- `data/visitor-dialogue.json` — established fan-written voices (`entries`) plus user-provided
  originals (`documented`: tirami, luke, charlotte, demian). Tone anchors, quoted below only as anchors.
- `data/material-descriptions.json` — per-material imagery hooks used to keep branch subjects distinct.
- `research/wiki/*.json` — infobox facts re-extracted directly: Luke 15 wizard; Piria 21 thief;
  Charlotte 27, species "Human (Assumed)"; Demian 28 revenue officer, species "Unconfirmed";
  Daisy 17 baker, species "Unknown"; Kyle 18, occupation/species "Unknown". Wiki personality prose is
  effectively absent — per the v1 rules, voices come from role + project dialogue, labeled fan-written.
- `source/core.js` + `source/app.js` — implementation status (updated): the per-tier material choice
  is implemented — the dispatch UI offers the unlocked families at that tier and the chosen family is
  saved with the expedition (`s.expedition.material`; `dispatchCombinedExpedition` takes the family
  argument). A tier opens when **any one** family reaches it, while materials from other families
  become available when those families are upgraded.
- v1 files: `README.md` (voice cards, ledger) and the four draft JSONs (read and re-validated earlier
  in this session).

---

## 1. Overall premise

**One region, ten posts, five bands.** The expedition calendar reads as one continuous story of the
small region around Pio and Tia's shop. Ten working specialists — a shrine clerk, a warrior, a
merchant, a knight, a wizard, a thief, a madam, a revenue officer, a baker, a challenger — each spend
the same five bands climbing their own calling, and each band closes with one event big enough that
several of them are present at once. The region grows up around them: chores (band 1) harden into
institutions (fairs, permits, vaults), institutions meet legend (stones, runes, relics), and legend
closes the fifth band at the shrine.

**The shop is the connective tissue.** Chapters are commissioned from the shop by visiting NPCs — a
chosen traveler, tier, and coin cost, exactly as the current expeditions work — and the shop's
brewing is the quiet supply line every arc assumes running behind it. Narratively, no chapter
*requires* a delivered potion; making one a hard dispatch requirement would be a separate gameplay
proposal, and nothing in this plan assumes it. "Meaningful character growth" is what the NPCs carry
out of the shop's orbit, not a lesson the shopkeeper preaches.

**Divergence by design.** The ten arcs share a world map, not a plot. Each has a private axis (see
arc cards): custody, reliability, reputation, interpretation, attention, belonging, legacy, service,
nourishment, measure. Bands advance each axis differently — some arcs get busier, some get quieter,
some barely change pace at all (documented personalities are floors, not ceilings: Dolbur keeps
making mistakes, Tirami keeps starring herself, Charlotte keeps her third person).

**The band architecture.**

| Band | Tiers | Register | Closes with |
| --- | --- | --- | --- |
| 1 | 1–5 | home ground — chores that turn personal | Milestone M1: the cold roost (eggs) |
| 2 | 6–10 | community — fairs, permits, markets | M2: the silent fair (flowers) |
| 3 | 11–15 | exotic trade — convoys, dealers, strays | M3: the crystal flood (crystals) |
| 4 | 16–20 | legendary matter — vaults, schemes, syndicates | M4: three stones, one auction (legend stones) |
| 5 | 21–25 | mythic close — relics, curses, the fallen tears | M5: the vigil of the fallen tears |

Each milestone exports a handful of **permanent regional facts** — the accounted spine every
telling agrees on (a landmark like the lost ford bridge, a standing rule, a debt, a nickname) that
later chapters use as shared common knowledge, while each route's own consequences live inside its
telling. That is how growth and consequences accumulate without any branch tree exploding.

---

## 2. Choice and branch model

### 2.1 What the material choice means (all 25 tiers)

The three variant materials of a tier are three **different subjects in the world**, not three sizes
of one object. Tier 8 is the clearest example: `Manticore fur` (a dangerous beast groomed by caretakers),
`Werewolf fur` (a neighbor with a civil problem), `Kobold fur` (a clan economy) — three counterparties,
three obstacles, three resolutions. So every chapter is specified as **one procedural spine + three
branch bodies**: the job's skeleton (what the NPC is hired to do) is fixed; the chosen material decides
which crisis occupies the body and how it resolves.

Branch differences are therefore narrative-state differences (who, what stands in the way, what is
risked, what is left behind) — mandated by the premise against "ingredient-name substitutions."

### 2.2 Per-character branch signatures

To keep 750 eventual outcomes coherent, each character has a fixed feeling for what each family
*means to them*. This is the drafting scaffold, not a straitjacket — a chapter may bend a signature
if the scene earns it.

| Character | Life (red) | Mana (blue) | Stamina (gold) |
| --- | --- | --- | --- |
| Neet | a person stands in front of her and needs the shelf | the shelf's own history needs checking — rites, provenance, records | the shrine's building, beds, and seasons need her back |
| Dolbur | someone's in trouble mid-adventure; plan bends | the gear or the route meets chaotic magic | the big physical feat, with his mistake-pattern as comedy |
| Tirami | beats a rival on service and nerve | wins on information, certificates, authentication | wins on scale — logistics under pressure |
| Claire | the people the regulation exists for | the enchanted fringe of the rulebook (cursed/angelic lots) | the long physical procedure done perfectly |
| Luke | a creature's need — his fluent register | magic misbehaving; his listening is the diagnosis | the long patient watch no one else can hold |
| Piria | the job that is secretly about keeping someone safe | contraband that shouldn't exist and does | the caper: craft compressed under time |
| Charlotte | the commission that turns charitable | the arcane display piece | the acquisition campaign — journeys, auctions |
| Demian | the valuation that protects a small seller | the unregistered arcane file | the field audit trek — carriage, checkpoints, weather |
| Daisy | a dish that fixes someone | the sealed odd-ingredient experiment (never near food) | festival-scale baking logistics |
| Kyle | the dare that turns out to help someone | the magical protocol/test | the endurance trial with a crowd watching |

### 2.3 Ensemble consistency — **RULE R: one event, three tellings (recorded)**

**What the owner has confirmed:**
- A tier's chapter opens when **any one** of Life, Mana, or Stamina is upgraded to that tier. Only
  the upgraded materials are offered as choices; the others appear as choices when they are
  upgraded.
- The choice is made **independently at each unlocked tier**, including tiers played out of story
  order; a choice at one tier implies nothing about choices at other tiers — not that a same-family
  route continues, and not that any particular earlier route was ever played.
- The player picks the material. All three routes are legitimate story content with **genuinely
  different outcomes**, each experienceable as its material unlocks. No route permanently blocks
  the others; a later route is never downgraded to generic aftermath.
- Randomized potion variants remain out of scope.

**The convention (how three routes can all be true).** Each ensemble milestone is authored as
**one accounted spine + three complete tellings**, one per material:

1. **Spine facts** — the small, region-scale, *irreversible* list every telling includes
   identically (e.g., M3: no lives lost; the old ford bridge is lost; every crate delivered; the
   flood night becomes the road's core legend). Because they are identical everywhere, no replay
   order, no route mix, and no later chapter can ever contradict them. Anything that must endure
   for every player belongs on the spine.
2. **Route facts** — each telling's own subject, crisis, resolution, and outcome: which material
   was the crisis subject, which approach carried the event, and what that route alone leaves
   behind. The three tellings' outcomes genuinely differ; overlap is allowed only where routes
   agree on spine facts.
3. **Private reveals** — per participant, per route: one thing only their post could know *in that
   telling* (an unseen action, a hidden motive, a corrected misunderstanding, a quiet
   contribution). Reveals interlock with the route facts of the telling they appear in and never
   leak across tellings.

Each telling is a complete, standalone account. Dispatching a route's material presents that
route's full telling; unlocking a second material later and dispatching it presents that route's
own full telling — a parallel complete account, not a continuation and not aftermath. Replaying an
already-told route re-shows its chapters; narrative needs no completion history.

**In-world warrant (recommended): the almanac tellings.** The region keeps three accounts of each
milestone side by side — the red, blue, and gold entries in Neet's shrine almanac — a register folk
memory already treats the way it treats three ballads of one night: variant tellings, all sung as
true. This gives later text a diegetic home for the variants: rumor characters (Tirami, Piria) may
cite "the other telling" as in-world gossip, and §6.6's unreliable-version valve keeps it flavor,
not contradiction.

**What later chapters may safely remember.**
- Spine facts: freely, from any character ("since the ford went down").
- Route facts: **confined to the telling they belong to** — that chapter and its perspectives (for
  an ensemble event, the participants' chapters of that same telling). A later chapter — even the
  same family at a later tier — recalls only spine facts and character development that does not
  depend on any particular earlier material choice, because the game lets players choose each tier
  independently and play tiers out of story order.
- **Escape hatch (flagged during drafting, never assumed):** if a later chapter truly must recall
  a prior route (e.g., "the toll she paid" months later), the chapter is marked as requiring
  tracked chapter history and conditional text, and raised for an owner decision (§7.4). No such
  system is assumed to exist; the default posture above works without it.
- Reveals: never recalled by another character (§6.6 governs).
- If a route owns a consequence that *must* endure for every player (a new map point, a standing
  rule), it is promoted to the spine — each route then produces it by its own mechanism (§7, open
  decision).

Non-participant NPCs at a milestone tier are written as normal solo chapters that may reference the
event only through branch-neutral phrasing ("since the ford went down"), see §6.

### 2.4 What stays out of narrative hands

Rewards, how the choice UI surfaces at dispatch, save/migration of progress, and where the
upgraded-material unlocks live at runtime: owner territory (the tier-unlock rule and the choice
itself are confirmed in §2.3). Narrative only supplies the fact tables those systems would need.

---

## 3. Arc cards (ten)

Conventions: anchors marked **(D)** are documented (wiki infobox, or user-provided dialogue);
**(P)** are proposed fan-written additions; everything else is project-established voice.
Endings are "earned" in the sense that band 5 pays each arc's central tension, at each character's
own register. Growth never homogenizes anyone.

### 3.1 Neet — cleric, 19 — axis: **custody**
- **(D)** Occupation cleric; protection-themed rewards. Wiki personality: empty. Voice (project):
  formal-courteous, shrine-centered, dry ledger humor, unfazed but refuses shortcuts.
- **Starting outlook:** the shrine is a promise she keeps by hand — stocked shelves, a lit lamp,
  counted vials, pilgrims supplied before the roads close.
- **Central tension:** she guards things best by keeping them *circulating*; a storehouse instinct
  (hoard the care) keeps colliding with the shrine's real work (a measure out the door beats a shelf
  in the dark). Her arc is learning which things to lock and which to leave unlocked.
- **Relationships (P):** Claire — two kinds of order, mutual recognition; Daisy — supply-trust
  (blessings for bread, no contracts needed); Tirami — polite friction over pricing at the shrine
  door; an almanac habit that turns into the region's memory.
- **Bands:** 1–5 chores with an almanac habit; 6–10 the shrine gains a public face (singing garden,
  family remedies, kindness as inventory); 11–15 exotic stewardship (crystal altar, shed wings) —
  she learns relics also need *circulation* (lent, not locked); 16–20 the shrine becomes the region's
  archive of legend (runes traced, scales blessed, stones meditated) and her handwriting is on
  everything; 21–25 consecration — the fallen tears winter under her roof, and her margins become
  the account everyone else's account defers to.
- **Earned ending:** the vigil held on her floors, her almanac cited by knight, officer, and merchant
  alike. She keeps asking the shop for one last potion — explicitly *not* to stock. To keep.
- **Branch flavor:** Life = hands on a person; Mana = hands on the record; Stamina = hands on the
  building. (Example tension: M1 branch colors who she prays *for*, never whether she prayed.)

### 3.2 Dolbur — warrior, 21 — axis: **reliability**
- **(D)** "Always positive. But sometimes he makes mistakes." (Pio's documented quote — the arc's
  contract.)
- **Starting outlook:** every expedition is the one he'll finally do perfectly. It won't be. That's
  fine; the positive is load-bearing.
- **Central tension:** he trusts his strength; the party slowly reveals it trusts his *repairs* more
  — the blush-line is correction, not failure. Arc = learning that being the one who fixes it loud
  and fast is a job, not a consolation prize.
- **Relationships (P):** Kyle — aspirational little brother (born at M1, tested in the field); Neet —
  she mends what he breaks, deadpan, and he has started bringing her the pieces cheerfully; Guild
  captain/cook remain unnamed archetypes (v1 rule).
- **Bands:** 1–5 the supply-list guy who forgets the list; 6–10 he finds his real role: logistics
  under pressure — the man who carries (paths cleared, caravans escorted); 11–15 the vein and the
  frontier: strength harnessed to teamwork (the flood year makes him *the* muscle of record); 16–20
  trusted with legendary loads, including the standard/route duties at the expedition; 21–25 the
  last march: mistakes get smaller, repairs get faster, and the rearguard plan is his.
- **Earned ending:** the march is his plan — two cheerful errors, zero casualties, and the examiners
  who once judged his forms now ask how he'd train a recruit. He has an answer. It is mostly lists.
- **Branch flavor:** Life = the rescue that bends the plan; Mana = the hilarious gear-catastrophe
  he improvises out of; Stamina = the feat where his error-pattern is the comedy engine.

### 3.3 Tirami — potion merchant, 14 — axis: **reputation**
- **(D)** Peppy, competitive, Pio's rival, ★ punctuation, blushes on her own loss, brags on wins,
  both quest types hers to issue. Documented tone anchors only.
- **Starting outlook:** the market is a scoreboard and she is on it — every deal is proof.
- **Central tension:** being *famed* vs. becoming *trusted*. She learns the second is the only
  scoreboard that never resets — while keeping attention-craft (her rumors, her window displays) as
  a licensed part of her kit. Honesty about prices; theater about everything else.
- **Relationships (P):** Charlotte — aesthetic rivalry that matures into trade respect; Demian —
  the one official she cannot charm, which is why she keeps trying on purpose; Daisy — jam-for-pastry
  supply bond; the shop (Pio/Tia stay protagonist-neutral, rivalry off-screen per v1 rule).
- **Bands:** 1–5 the market's loudest student (ratings cards, basket chases); 6–10 section wars settle
  into a season price sheet and a flower-stall war she wins by *not* leaving; 11–15 exotic trade —
  breaks the crystal corner with one public bid, reads paperwork like coins; 16–20 the legendary bid:
  hosts grading committees, beats the speculator syndicate with a true rumor and honest prices;
  21–25 the appraisal of the unpricable — "genuine, beyond pricing" — the fee waived on condition
  no one finds out, and everyone finds out (it was the point).
- **Earned ending:** "the clause merchant" downstairs, the disclosure cards copied at three counters,
  the framed wall: glass eye, riddle, wreath, objection, clawmark, clause warning. The waived fee
  stays unframed — the joke she tells about herself.
- **Branch flavor:** Life = service beat-down of a rival; Mana = certificates and authentication
  wins; Stamina = scale wins — the cold-cart, the convoy contract.

### 3.4 Claire — knight, 23 — axis: **interpretation**
- **(D)** Palace knight, formal speech; Tia calls her famous. Project voice: patrols, gate watch,
  infirmary, escort, kit inspections, mentorship.
- **Starting outlook:** procedure is armor; the kit is the conscience; she would rather answer a
  question about a label than explain a missing item.
- **Central tension:** the regulation exists to protect people — she knows it — but her career keeps
  making her choose between the letter and the purpose. The arc is learning to make that choice
  **on the record**, and to accept help and credit without flinching. She never stops being formal;
  her warmth stays in the interpretation.
- **Relationships (P):** Neet — the shrine's order and the patrol's order, quietly equivalent;
  Tirami — law meets commerce and both leave satisfied, rarely; Demian — professional kinship, one
  shared quiet hour a band; recruits — the mentorship thread (her T2/T24 v1 patterns).
- **Bands:** 1–5 small-hours protection (rations, nests, the infirmary shelf); 6–10 the royal side of
  the region's life (flowerbeds, preserves, escorts) — the fair teaches her command in public;
  11–15 command under water: the flood year makes her the escort of record and she files her first
  judgment call openly; 16–20 writes rules instead of obeying them (the vault schedule, the chapel
  seal) while guarding what must stay untouched; 21–25 the reliquary: she plans every pace, then
  lets the keepers set it — the arc's proof filed as "no report at all."
- **Earned ending:** the region's quiet institution: the escort standard, the magistrate's window,
  a recruit she trained making the third report by himself. **She is the only NPC present at all
  five milestones** — the connective spine of the shared world, always at her post.
- **Branch flavor:** Life = the person inside the rule; Mana = the rulebook's enchanted fringe;
  Stamina = perfect procedure as quiet spectacle.

### 3.5 Luke — wizard, 15 — axis: **attention**
- **(D)** Silent, ellipsis speech, pet owner feeding potions to pets; short phrases. His arc's
  non-negotiable: he stays a listener. (One earned spoken sentence at the vigil — see ending.)
- **Starting outlook:** the world talks loudly; he listens to the parts that don't. The workbench
  has a cat on it and a standing order list written in animal.
- **Central tension:** understood vs. legible. Everyone assumes quiet means absent; his fluency is
  in languages without words (creatures, magic, weather). The arc is being *understood* without
  becoming talkative — his notebook becomes readable; he does not.
- **Relationships (P):** Piria — she reads him perfectly; he reads rooftops; their few exchanges are
  the safest in the region; Neet — two quiet keepers dividing a shrine's silence; Daisy — feeds
  whoever sits on her window ledge, including him; his rotating familiar cast stays (v1 rule).
- **Bands:** 1–5 the familiar workshop — care as fluency; 6–10 field observation (dreaming flowers,
  tonic labels, monster eyes) — the notebook starts being readable to others; 11–15 attunement —
  his magic becomes a listening instrument (crystal colors, the shore of tears) and it hears the
  flood before the sky does; 16–20 the scholar's alphabet — runes, scales, stones: the region's
  translator, paid in quiet; 21–25 the vigil — the fallen tears settle for him, because he already
  sat with them all year.
- **Earned ending:** at the vigil he says one full sentence, to Neet, about the tears. Everything
  else stays ellipses forever, and it counts. The shop receives a hand-scribbled page for the door.
- **Branch flavor:** Life = a creature's need; Mana = magic misbehaving (his diagnosis); Stamina =
  the long watch — nobody outlasts him at it.

### 3.6 Piria — thief, 21 — axis: **belonging**
- **(D)** Playful thief, adept (Tia's documented sneak-attack anecdote); project voice: night jobs,
  informants, fences, rooftops, "no questions," favors, cheerful exits.
- **Starting outlook:** the town is a map of exits. Belonging is a weakness — except she keeps
  paying it anyway, in unlocked windows and full alley bowls.
- **Central tension:** competence without attachment vs. discovering she is attached: the roofline
  is a home. The arc is permission to be *from* here — without ever promising to be legible. No
  solemnity: her vote counts at closing time, and she'd deny the ballot existed.
- **Relationships (P):** Luke — the quiet mutual fluency (above); Daisy — the back door never
  locked for her; Demian — a cat-and-mouse so collegial it is nearly a correspondence; he has never
  once proven anything, and she has never once made him try; Kyle — she taught him two shortcuts
  and told him to tell no one; he hasn't.
- **Bands:** 1–5 small jobs with a heart (a nesting permit *negotiated*, not stolen — her T5 pivot);
  6–10 the gray-market years: hidden stock, garden walls, Backstreet bargains — always the town's
  gray, never its wounds; 11–15 she saves the crystal season with a route (the shepherd's track)
  scouted days before anyone asked — the region's best mapmaker is its least official resident;
  16–20 the whisper network breaks the speculator syndicate with false roof routes, and the auction
  never knows how close it came; 21–25 the exchange: she keeps the vigil's approaches clean through
  the underworld's own channels, off the books, off the stage.
- **Earned ending:** the shrine's offertory box comes back polished. Nobody learns who. Her door
  remains unlocked; she keeps the key anyway.
- **Branch flavor:** Life = the job that is secretly protection; Mana = contraband too strange to
  fence; Stamina = the compressed caper.

### 3.7 Charlotte — madam, 27 — axis: **legacy**
- **(D)** Wealthy, third-person self-reference, "darling," ♡; family from the countryside (existing
  line); potion shown to family (documented beat). Wiki species "Human (Assumed)" — never specified.
- **Starting outlook:** taste is a public service; beauty is an argument that wins.
- **Central tension:** acquisition as love vs. discovering she is building not a collection but a
  **household** — what remains of Charlotte after the season ends? Her arc: from impressing to
  endowing, without giving up a single superlative. Growth makes her generous, not solemn.
- **Relationships (P):** Tirami — rivalry upgraded to mutuality (band 4's auction seat them side by
  side, typeset differently); Demian — the file she cannot charm and the only taxpayer who files
  early to fluster him; Daisy — her kitchen's confidante; Neet — the shrine's lamp is her band-5
  gift; the duchess — off-screen rival, referenced, never seen.
- **Bands:** 1–5 elegant commissions (tea, fan, centrepiece) with a soft streak she denies; 6–10 the
  garden-party year — she hosts the fair's unofficial court and pays for the parts the permits
  forget; 11–15 the salon: crystals, antique scrolls, patron of the exchange's better habits;
  16–20 the exhibit: the legendary stones reserved; when the auction's provenance turns on a
  favor, Charlotte is the hidden benefactor no one can prove; 21–25 the presentation: she lends the
  collection to the vigil and writes the family a letter that says, for once, what she gave away.
- **Earned ending:** the collection travels to the shrine and does not fully return — "Charlotte's
  long loan," recorded third-person on the donors' board. ♡
- **Branch flavor:** Life = commissions that turn charitable; Mana = the arcane showpiece;
  Stamina = the acquisition campaign.

### 3.8 Demian — revenue officer, 28 — axis: **service**
- **(D)** Revenue officer, formal, distinguished; documented lines: "I demand payback," "Hmm…money
  is not the only way." (The latter is his arc's title, in his own words.)
- **Central tension:** the ledger is the kingdom's promise kept — every entry is a debt the crown
  owes its own honesty — and the work keeps showing him entries that are true but wrong (a shortage
  caused by kindness; an error that was care). Arc: from enforcement to stewardship; he starts
  writing margins that protect people from the crown's own bluntness.
- **Starting outlook:** the shop has not been watched closely enough, and he says so with a bow.
- **Relationships (P):** Claire — professional kinship, one shared silent hour per band; Charlotte —
  his most regular file, impeccably polite on both sides; Tirami — always one clause ahead, and he
  respects it even as he writes the clause that catches the next one.
- **Bands:** 1–5 inventories, weight tickets, receipts: performed perfectly and joylessly; 6–10 the
  fair teaches him a licence can be one page (his reform becomes local legend); 11–15 reconciles a
  flood-year's crystal accounts and finds the books kinder than expected; 16–20 the legendary audit:
  the syndicate's shell buyer dies quietly in his margins; 21–25 seals the fallen-tear inventory and
  attends the vigil off-record, hat off, with "no tax due" written on a consignment of tears.
- **Earned ending:** the margin note he leaves at the shrine: *carried, witnessed, exempt.* The
  documented line pays off; money was not the only way.
- **Branch flavor:** Life = the valuation that shields a small seller; Mana = the unregistered
  arcane file; Stamina = the field trek.

### 3.9 Daisy — baker, 17 — axis: **nourishment**
- **(D)** Baker, polite, uses potions in breadmaking, notably doesn't get upset on failure; species
  "Unknown" per wiki — never specified, family kept vague (v1 rule).
- **Central tension:** everyone leans on her sunniness — so who feeds the feeder? The arc is the town
  learning to care back (a knight's standing escort for her delivery cart, a shrine blessing, flour
  left by a thief who denies it) while she never loses the cheer or the craft. Her failure-mode
  stays "That is all right. We can try again another time." — canon floor.
- **Starting outlook:** the bakery is the region's warmest room; the potions go in the dough;
  unusual ingredients stay sealed, separate from food, always (v1 safety rule — kept as an arc rule).
- **Relationships (P):** Neet — mutual supply-trust; Piria — the unlocked back door; everyone else
  orbits: the kids' class, the wedding couple, the wing traders.
- **Bands:** 1–5 first batches (eggs, herbs): potion-bread as quiet charity; 6–10 the festival year:
  honey rolls for the fair, the window's flower season, the bakery becomes an event by itself;
  11–15 the courier years — deliveries to the weeping shore, the rune chapel, the wing traders'
  mountain road: her cart is the one thing everyone waves at; 16–20 the sage-stones picnic — she
  hosts the auction's leftovers as the town's neutral ground; 21–25 she bakes for the fallen-tear
  expedition: the vigil's provisioner, off-stage, in her own chapter.
- **Earned ending:** the vigil runs on her bread — and at dawn the town's leftovers return to her
  counter as gifts, care returned at last. She cries a little into the flour and calls it proofing.
- **Branch flavor:** Life = a dish that fixes a person; Mana = the sealed experiment; Stamina =
  festival logistics.

### 3.10 Kyle — traveler, 18 — axis: **measure**
- **(D)** Young man issuing challenge quests; wiki: occupation "Unknown", species "Unknown" —
  personality blank; voice from project lines (dares, guild test, proving himself).
- **Starting outlook:** if it can be dared, he'll take it — and behind the grin, his storeroom is
  immaculate. He counts everything. He just never counted *why*.
- **Central tension:** measuring himself against other people's dares vs. finding what he wants to
  *keep*. The challenger who keeps count of everything learns to keep some things for himself.
- **Relationships (P):** Dolbur — hero turned peer (a rope caught at M1 begins it); Tirami — the
  dare economy (she bets, he runs); Piria — two shortcuts, told to no one; Neet — the ledger page
  at the end.
- **Bands:** 1–5 the storeroom apprenticeship (his job ladder is literally inventory — herbs in
  storage, egg-straw packing): each chore taken as an endurance dare, each done exactly right
  because the dare was his own; 6–10 bigger rooms — crystal strongboxes, scroll shelves — and he
  starts adding labels that tell stories; 11–15 the packing-list year: relic transport done with
  the guild's trust; 16–20 the legendary inventory: he counts the stones for the auction under
  Demian's audit — official trust, earned by a shelf; at the milestone he is why the vault never
  goes a digit short; 21–25 the strongbox: he preps the fallen-tear strongbox, opens and closes it
  at the vigil, and — passes nothing. No exam. Just kept count one more year.
- **Earned ending:** he hands Neet the page — everything accounted — and asks, quietly, whether he
  can do the counting again next year. "I would be grateful." His dare finally aims somewhere soft.
- **Branch flavor:** Life = the dare that turns out to help someone; Mana = the magical protocol
  test; Stamina = the endurance trial with a crowd.

---

## 4. Ensemble milestones (five cards)

Each card: participants (preselected group, proposed), why they work together, central conflict,
the three material tellings (Life/Mana/Stamina, named with the tier's exact materials), the spine
facts common to every telling plus each route's own outcome, and what each participant's perspective
uniquely reveals per route. Slashes separate the
tier's exact material names — **Life first, Mana second, Stamina third** per game-data. (The cards
were sketched with one shared outcome list under the earlier draft; re-sorting those lists into
spine + per-route outcomes, per §2.3, is the first editorial step of drafting — before any chapter
text — and each milestone's three routes must end in **distinct outcomes**, not merely distinct
problems or methods.)

### M1 — Tier 5 · "The Cold Roost"
Materials: `Rainbow bird's egg` (Life) / `Bluebird's egg` (Mana) / `Wyvern's egg` (Stamina)
**Participants (P):** Neet, Dolbur, Claire, Daisy, Kyle — *why:* a cold snap is a civic event with
four kinds of responders: shelter (bakery), rites and records (shrine), official patrol (knight),
eager muscle (challenger), and the warrior who never met a ridge he wouldn't climb. Job hooks line
up (Tend the Nesting Grounds / Guard the Nesting Ridge / Protect the Cliffside Nests / Eggs for a
Fresh Cake Batch / Inspect the Egg Packing Straw).

**Shared opening:** an out-of-season frost forces three clutches down from the high nests onto one
shared crag by the orchard; the ledge is failing at frostfall; nobody owns wild things, so everyone
who owes them a favor comes.

**Central conflict:** time and jurisdiction: a ledge that will not wait, three clutches with
different needs, and no single authority over any of it.

**Spine facts (accounted in every telling):** every egg hatches safe; the crag is thereafter a named
protected site with a patrol schedule in Claire's handwriting; Daisy's warmth trick (oven-warmed
straw, never food) becomes region lore; Dolbur drops a rope and Kyle catches it, which is how a
warrior and a challenger become friends; Neet records the hatch-day in the shrine almanac (the
entry later bands cite).

**Branches:**
- **Life — Rainbow bird's egg:** the rainbow clutch arrived abandoned and cooling; the crisis is
  warmth and fosterage — persuading two other clutches' keepers to accept strange eggs. Resolution:
  Daisy's warmed straw + Neet's patient introduction-by-scent; the rainbow chicks fledge mixed,
  adopting the whole crag; the bluebird and wyvern clutches winter through on the sound patch of the
  same ledge — walk-through patrols and one hay rope, booked in the almanac as a line each.
  *Reveals:* Claire quietly reclassifies the crag as protected (fixed fact
  originated here); Daisy learns an egg can be cradled like dough without a recipe; Kyle's climbing
  dare is to reach the abandoned nest first.
- **Mana — Bluebird's egg:** the bluebird shells dulled overnight — the song inside failing, a slow
  magical problem no one can grab. Resolution: Neet's quiet rite and Kyle's stillness (he is
  surprisingly good at holding a ladder for hours); the clutch sings flat all spring and recovers by
  band 2 (carry fact); the rainbow eggs winter under Daisy's warmed straw, and the wyvern brood is
  moved to the quarry ledge as a simple precaution — quiet winters for the other clutches in this
  telling, since this route's crisis never touched them.
  *Reveals:* Neet's rite works because she sang the wrong lullaby on purpose,
  matching the flat note; Claire's contribution is silence kept for three nights.
- **Stamina — Wyvern's egg:** the wyvern mother circles, territorial, while her egg rolls loose on
  the failing ledge. Resolution: Dolbur's climb, Kyle's anchor, Claire's cordons; the brood moves to
  the old quarry ledge (a lasting map-point); the rainbow and bluebird clutches winter out the
  season on the shared ledge untroubled in this telling — their crises belong to the other tellings'
  accounts.
  *Reveals:* Dolbur makes the climb with a bent piton
  he then *reports* (arc milestone); the mother accepts the move because Daisy, absurdly, baked.

### M2 — Tier 10 · "The Silent Fair"
Materials: `Dancing flower` (Life) / `Dreamy flower` (Mana) / `Singing flower` (Stamina)
**Participants (P):** Tirami, Charlotte, Demian, Claire, Daisy — *why:* the royal meadow fair is
exactly where their jurisdictions collide on purpose: commerce and taste and permits and security
and pastry. Job hooks align (Reserve the Best Flower Stall / Prepare the Garden Party Flowers /
Inspect the Flower Market Licences / Guard the Royal Flowerbeds / Flowers for the Bakery Window).

**Shared opening:** the fair is days away; the meadow's anchor flowers misbehave, and each of the
five has a different reason to care whether the spring survives.

**Central conflict:** three flavors of botanical disaster + jurisdiction comedy (royal guard vs.
market permits vs. patroness schedule vs. pastry logistics).

**Spine facts (accounted in every telling):** the fair happens and ends well; Charlotte's display takes
the ribbon; Demian's one-page licence reform debuts and is adopted; Tirami holds the corner stall on
her eighth consecutive argument-day; Daisy's stall outsells expectations and she gives the surplus
away; Claire's incident-log discipline gets borrowed by the fair committee (a small phrase of hers
becomes procedure).

**Branches:**
- **Life — Dancing flower:** the cornerstone dancing flowers have lost their partners (the season's
  pollinators moved on), so the opening pavilion dance cannot form. Resolution: the town pairs in —
  Charlotte choreographs, Tirami sells the pairing as the season's *event*, Daisy keeps everyone
  standing. *Reveals:* Charlotte's real motive is a promise to the head gardener's late husband
  (kept vague); Claire discovers her incident-log phrase fits a dance floor.
- **Mana — Dreamy flower:** the dreamy row's fragrance puts half the setup crew asleep on day one —
  comedy on the surface, hazard underneath. Resolution: Claire re-schedules the fair around the
  scent's timetable and the dreamy row becomes the evening attraction (permanent schedule change —
  carry fact). *Reveals:* Demian's licence inspection notices the flower supplier's declaration was
  right and the *map* was wrong; Tirami's stall survives by being awake when nobody else is.
- **Stamina — Singing flower:** the singing flowers have gone silent — the fair's closing song
  cannot start. Resolution: silence respected; the fair ends wordless, and the flowers sing *after*
  the crowd goes home; the committee adopts "the song is not for booking" as a rule (carry fact).
  *Reveals:* Daisy hums back all week until the flowers trust her; Demian's real discovery is that
  silence has no fee schedule and he writes the exemption by hand.

### M3 — Tier 15 · "The Crystal Flood"
Materials: `Red crystal` (Life) / `Blue crystal` (Mana) / `Gold crystal` (Stamina)
**Participants (P):** Claire, Dolbur, Tirami, Piria, Luke — *why:* the crystal season is a chain —
vein (Dolbur) → road (Claire) → cargo and deals (Tirami) → gray-market stock and routes (Piria) →
resonance and reading (Luke) — and a flash flood breaks every link at once. Job hooks align cleanly
(Break Open the Crystal Vein / Guard the Crystal Convoy / Outbid the Crystal Dealer / A Crystal
Dealer's Hidden Stock / Attune the Colour Crystals).

**Shared opening:** the year's combined crystal convoy is caught by the flash flood at the ford as
the river rises; the old bridge is doomed in every branch.

**Central conflict:** three competing claims on what must survive (the shrine-infirmary stock, the
exchange's entrusted blues, the crown's gold) and one river that does not care about claims.

**Spine facts (accounted in every telling):** no lives lost; the river crests at dusk — the road's one loud
night — and falls back by dawn (established here so every perspective keeps the same clock); the old
ford bridge is lost (permanent map
fact); every crate delivered within the season; the flood night becomes the road's core legend;
the rebuilt crossing is later called "the shepherd's ford" (named in band 4, whatever route was told).

**Branches:**
- **Life — Red crystal:** the shrine-infirmary red stock is aboard the stranded wagon — the crisis
  is holding, warming, and shielding the medicine load. Resolution: Claire's hold order, Dolbur's
  rope-work, the crates sheltered on high ground. *Reveals:* Claire moved the heal-cart uphill
  before the crest (unseen); Neet's altar consignment is on the manifest (off-screen link).
- **Mana — Blue crystal:** the exchange's scrying blues cannot be allowed to soak — the crisis is
  rerouting. Resolution: the shepherd's track (Piria's scouting), Luke's attunement keeping the
  blues stable in the wet. Route-owned outcome: the track is pre-scouted, used, and never signed by
  her — the credit lands unsigned in every later file of this telling. *Reveals:* Tirami pays the
  track's standing toll without being asked;
  Piria marked the route days in advance because the hermit's kettle was dry.
- **Stamina — Gold crystal:** the crown's payment gold must move — the crisis is the ridge haul.
  Resolution: Dolbur's ropes and pulley, Tirami's cold-cart guarantee, Luke's chime-warnings for
  the loosened rock. *Reveals:* Dolbur carries the vein-master out last and first; Demian reconciles
  the accounts afterward (off-screen) and finds the gold one ingot correct.

### M4 — Tier 20 · "Three Stones, One Auction"
Materials: `Stone of Sage` (Life) / `Stone of Deep-sea` (Mana) / `Stone of Glory` (Stamina)
**Participants (P):** Claire, Tirami, Charlotte, Demian, Piria, Kyle — *why:* money, secrets, and
provenance — and the event sits inside the vault Claire secures, so her vault post (Secure the
Legendary Stone Vault) belongs on-page: the viewing days are held there, and the region's security
officer of record is one of its voices on the spot. (Neet and Daisy reference the stones solo.) Job
hooks align (Secure the Legendary Stone Vault / A Rival Bid for Sage Stones /
Reserve the Legendary Stone Exhibit / Audit the Legendary Stone Vault / A Whisper about Legendary
Stones / Inventory the Legendary Stones).

**Shared opening:** the three legend stones surface at one auction — first time in a generation; the
crown sends an audit, collectors circle, and a speculator syndicate arrives with deeper pockets than
anyone local.

**Central conflict:** legitimate keepers vs. the syndicate + provenance questions + a vault full of
worth during the viewing days.

**Spine facts (accounted in every telling):** all three stones end with keepers, not speculators; the
syndicate's run ends inside the auction week — it wins not one lot and is traced in Demian's audit
margins, each branch producing its own defeat mechanism below rather than by off-screen fiat; the
auction house adopts a provenance-first rule (the town's second small institutional win); Claire's
paired-guard, case-custody viewing protocol enters the vault's standing rules; Tirami's bid or
counter-move becomes next season's
market talk; Kyle's inventory is exact to the digit (fixed fact — his T20 trust is earned here).

**Branches:**
- **Life — Stone of Sage:** the sage stone's provenance is questioned mid-auction. Resolution:
  Demian's audit authenticates the chain; Charlotte withdraws her own bid, connoisseur's sacrifice,
  so a young keeper can have it. *Reveals:* Tirami's rival bids *for* the keeper to drive the
  syndicate's price up and out; Charlotte is the anonymous settlement of the auction house's debt;
  Demian's authentication doubles as the trap — the same audit that verifies the sage chain maps the
  shell buyer's funding, which is how the syndicate's margins end; Claire's viewer rota keeps the
  sage stone's display never unwatched once, quietly starving the syndicate of the gap it planned
  around (her reveal).
- **Mana — Stone of Deep-sea:** the lot arrives with a sunken ship's ledger missing — provenance
  hangs wet in the air. Resolution: Charlotte funds the shore expedition; Luke-adjacent resonance
  and Piria's shore contacts recover the ledger. *Reveals:* the resurfaced ledger disproves the
  syndicate's forged provenance claim, and Demian's stamped comparison voids their documentation the
  day it surfaces (his reveal); Claire closed the viewing room for the week the shore expedition
  ran — custody creates the time the provenance needed (her reveal); the ledger's last page names
  the stone's first keeper: a shrine (Neet acknowledges off-screen).
- **Stamina — Stone of Glory:** the Glory stone is the one the syndicate opens a grab for during
  the viewing. Resolution: the preempted heist fails against layered interiors — Claire's
  paired-guard rule put the syndicate's inside man next to a verifier every hour (her reveal);
  Kyle's inventory counts the stone in and out and *one click short* (his reveal); Piria had fed
  the crew false roof routes (her reveal); Tirami's "buyers always regret it" rumor holds the
  speculator ring's nerve (her reveal); Demian's shell-buyer paper trail ends the syndicate (his
  reveal).

### M5 — Tier 25 · "The Vigil of the Fallen Tears"
Materials: ``Lucifer`s red tears`` (Life) / `Lucifer's blue tears` (Mana) / `Lucifer's golden tears` (Stamina) —
the Life name is verbatim from game-data (backtick apostrophe); prose below may read naturally as "Lucifer's red tears."
**Participants (P):** Neet, Claire, Dolbur, Tirami, Luke — *why:* the region's ending belongs to its
solemn registers: the shrine (Neet), the escort (Claire), the march (Dolbur), the appraisal (Tirami),
the witness (Luke). Job hooks align exactly (Consecrate the Fallen Tears / Escort the Fallen Tear
Reliquary / The Last March / The Ultimate Tear Appraisal / Observe the Fallen Tears).

**Shared opening:** storm season; the crown-road carries the fallen-tear reliquary to the shrine;
the five meet it at the last night, each at their post.

**Central conflict:** not a fight — a vigil under three real dangers: the road (storm), the
shrine's readiness, and what the tears wake in their keepers.

**Spine facts (accounted in every telling):** the reliquary arrives unchanged; the vigil is held and
completes at dawn; the five posts (shrine, escort, march, appraisal, witness) become the region's
standing order for relic nights; off-screen contributions are visible in the margins — Daisy's
provisions feed it, Kyle's strongbox holds ready, Charlotte's lamp is lit, Demian's inventory is
sealed "exempt," Piria's rooftops are quiet — the band's endings all pay off here.

**Branches:**
- **Life — Lucifer's red tears:** the red tear's warmth strains the whole caravan (ended horses,
  short tempers, kept vigils). Resolution: Dolbur's march carries the rearguard through the storm's
  long night; Neet's lamp never wavers. *Reveals:* the tear "eats" frustration — Tirami spends the
  appraisal conspicuously calm (unlike her, and she hates how it feels true); Claire files her
  shortest report ever.
- **Mana — Lucifer's blue tears:** the blue tear weeps sorrow; the road passes the weeping shore,
  and grief walks beside the wheels. Resolution: Claire's silence protocol, Luke's keeping (the one
  quiet presence the shore accepts), Tirami's genuineness ruling under grief. *Reveals:* Luke is
  the one who tells Claire where the shore's edge lies, using no words she can quote; Neet's shrine
  is ready because she stockpiled *quiet* (the adults' version of the same preparations).
- **Stamina — Lucifer's golden tears:** the gold tear's glory draws pretenders and crowds; the road
  must be kept ordinary while fooling everyone that it is. Resolution: the quiet cart, no honor
  guard (Claire's v1 choice, retained as reference), Dolbur's march as the loudest decoy since he
  is *genuinely* excited, Tirami's waived-fee appraisal. *Reveals:* the pretenders left because
  Dolbur told them the truth about how heavy glory is; Luke attended the whole thing from the
  bell-tower roof and said so later in six words.

---

## 5. Worked example — M3 "The Crystal Flood"

Demonstrates Rule R in miniature: the spine opening → three complete tellings → two participant
perspectives per telling, showing facts agreeing and reveals not colliding — plus how the
convention handles the flood night's one big irreversible event, the old bridge.

### Shared opening (spine — printed identically in every telling)
> The year's crystal convoy sat three days early at the ford when the river turned brown. The old
> bridge was swaying by noon. Claire stood the far bank and sent the count backward along the rope — Dolbur
> hauling, Tirami dispensing her cold-cart guarantee to anyone listening, and a chime no one saw
> anyone hang started ringing under the wind.

### Branch summaries
- **Life (Red crystal):** the stranded wagon held the shrine-infirmary red stock. The question asked was
  "what here can least afford a river": hold the wagon, warm the stock, shield the crates.
  Outcome facts: hold succeeded; a cask opened and found intact; the shrine consignment
  delivered with its seal unbroken.
- **Mana (Blue crystal):** the exchange's scrying blues could not soak. The resolution ran on the
  shepherd's track reroute and Luke's attunement. Outcome facts: reroute succeeded; the blues
  arrived resonance-clean; the standing toll was paid by an anonymous stall (named in only one
  perspective).
- **Stamina (Gold crystal):** the crown's gold had to move. Ridge haul: ropes, pulley, chime
  warnings for rock. Outcome facts: the gold arrived complete (Demian's reconciliation found it
  exact); the vein-master was carried out twice — once by rope, once complaining.

### Two perspectives, all three branches (consistency shown inside each branch)

**Claire (escort) — Life:** She gave the hold order at the first brown swell and kept it past the
hour regulations allowed, re-justifying it twice in her log. Unseen by the others, she had already
moved the heal-cart uphill "on inspection rounds." She signs the day off as "convoy held; nothing
soaked; the bridge was old." *Agrees with:* Tirami sees the hold order standing; Dolbur hauls by it.

**Tirami (merchant) — Life:** Her wagons were third in the convoy, chiefly carrying consignments.
She spends the flood re-pricing her risk out loud so her crews stay put — and quietly
agrees to carry the shrine's manifest at her own underwriting. Unseen by her: Claire had climbed
the bank to pin the rope line to the oak herself. *Agrees with:* the shrine consignment's seal
unbroken (Neet confirms later, off-screen).

**Claire — Mana:** The hold order stands; the difference is the route decision. She authorizes the
shepherd's track on Piria's one-line note ("gate dry, kettle dry, go") and later cannot find the
author to thank. *Agrees with:* the blues arrive resonance-clean; Piria's track used without
signature; Tirami's toll payment is the clue Claire keeps in her file.

**Tirami — Mana:** Her cold-cart contract is voided by the reroute, and she pays the standing toll
herself to keep the hermit's good will — her ledger line reads "reputation, track toll, worth it."
Unseen by her: Luke's chimes told Piria when the track's second gate would close. *Agrees with:*
the anonymous-stall fact; the toll receipt Demian later finds, unsigned.

**Claire — Stamina:** The hold order stands but yields to the haul plan; she marshals the ridge
line instead, pairing guards by strength. Unseen by the others: she assigned Dolbur the *last*
carry out on purpose — the one trip everyone else would have taken. *Agrees with:* the carrier-out
twice (carried, then complaining); gold exact to the ingot.

**Tirami — Stamina:** Her underwriting covers the ridge haul's equipment; her reveal is the
cold-cart guarantee rewritten in chalk on the wagon side, which the carriers adopted as a chant.
Unseen by her: Demian's reconciliation (off-screen) and the vein-master's complaint — which is the
only version of the story she ever hears, and retells with relish.

**Consistency discipline visible in the example:** the dusk crest, the bridge lost, and all crates
delivered are **spine facts** — printed identically in all three tellings, so no replay or route
order ever un-loses the bridge or undelivers a crate; opening details (hold order, cold-cart,
chimes) shared; each perspective adds exactly one private action no other perspective claims;
route-owned consequences (the anonymous toll, the ridge chant) stay inside their route. Conflict-free
by construction — now across viewings, not inside one canon line.

### What repeat visits and later chapters see (the bridge as the test case)

- **On repeat visits:** a player who later unlocks Mana and dispatches it gets the Mana telling in
  full — the same flood night with the blues rerouted, ending with the bridge lost all over again
  *because the spine says so*, not as a re-run or aftermath. Replaying an already-told route
  re-shows that route's text; narrative needs no completion history.
- **On the irreversible event:** only spine facts may be irreversible. The bridge falls in every
  telling identically, so "the ford has no old bridge" is safe common knowledge for band 4+
  chapters regardless of which telling was viewed last. A route-owned irreversible mark (say, the
  Mana track becoming a standing road) stays route-scoped unless the owner promotes it to the
  spine (§7.2).
- **What later chapters remember:** spine facts freely ("since the ford went down") plus character
  growth that holds on every route — never a particular earlier route, since each tier's material
  is chosen independently and tiers can be played out of order. Route facts stay inside this
  telling's chapters and perspectives; a later chapter that truly must cite "the toll she paid" is
  flagged as needing tracked chapter history and conditional text (§7.4), not assumed to work.
  Reveals never recalled; rumor characters may wink at "the almanac's other telling" as in-world
  variant gossip.

---

## 6. Continuity approach

**6.1 The fact table.** Before any milestone chapter is drafted, its fact table is written and
frozen: the spine facts common to every telling, three route-fact lists (subject, resolution,
route-owned outcome), per-participant private reveals *per route*, and ≤3 **carry facts** the
milestone exports to later bands — spine-tagged by default (e.g., M3's "the old ford bridge is
lost"); route-tagged carry facts stay inside their route. Tables live as markdown in this
folder first; a structured JSON form can be minted later (owner's call, §7).

**6.2 Route-tagged consequences.** Carry facts carry a spine or route tag. Spine-tagged facts are
recalled freely by any later chapter ("since the ford went down"). Route-tagged facts live inside
the telling they belong to — that chapter and its perspectives — and are **not** recalled by later
tiers by default: the game lets the player choose each tier's material independently and play
tiers out of story order, so a same-family choice at a later tier does not prove any earlier route
was played. Later chapters therefore assume only spine facts plus character growth that holds on
every route. A later chapter that genuinely needs prior-route recall is flagged during drafting as
requiring tracked chapter history and conditional text (§7.4); no such system is assumed to exist,
and the default posture works without it. All routes stay open, and a later viewing never rewrites
an earlier route's facts.

**6.3 Off-screen interactions.** Allowed deliberately, with three guards:
1. Consistent with documented personality (no character becomes someone else off-screen).
2. Recorded in a running "off-screen ledger" (who, band, what once) so future chapters can cite it.
3. Later acknowledgment is by **effect**, never by narrating the unseen scene: Claire's kit carries
   a jam label; Demian's file drawer holds an unsigned track receipt; Neet's almanac cites the
   roost. The town feels networked without any extra scene.

**6.4 Relationship density cap.** Each NPC gets at most two "named bonds" referenced repeatedly
(e.g., Dolbur↔Kyle, Tirami↔Demian) plus ambient ties. Prevents the web from becoming a chore to
track and keeps non-participant cameo references light.

**6.5 Later acknowledgments.** Each band opens with one neutral recall of the previous milestone in
each participant's continuing chapters (cheap, non-replay-dependent), plus the spine regional facts
(doing the heavy lifting — the ford, the fair rules, the catalogued stones).

**6.6 Telling discipline.** Spine shared / route outcomes divergent / private facts private. A
character may not "remember" another character's route-private reveal; rumor-carrying characters
(Tirami, Piria) may circulate *unreliable* versions — flagged in-world as such, and now with a
diegetic hook in the almanac's variant tellings (Rule R), which is both flavor and a safety valve.

---

## 7. Decisions — confirmed record and what is still open

**Recorded (owner-confirmed; nothing pending):**
- **Three playable routes with genuinely different outcomes.** All three material tellings are
  story content, each experienceable as its material unlocks; the first route chosen never blocks
  the others; later routes are full tellings, never generic aftermath. (Rule R, §2.3.)
- **Tier unlock rule.** A tier's chapter opens when any one of Life / Mana / Stamina is upgraded to
  that tier; only the upgraded materials are offered as choices, the others appearing as choices
  when they are upgraded.
- **The player chooses the material.** Randomized potion variants remain out of scope.
  Implementation status (not narrative's to change): the source presents the material choice at
  dispatch, opens a tier when **any one** family reaches it, enables only families at that tier,
  and saves the chosen material with the expedition (`s.expedition.material`;
  `dispatchCombinedExpedition` takes the family argument). Other routes become available when
  their families are upgraded. Narrative planning only records the requirement.

**Still open (genuinely open creative decisions):**

1. **Ensemble rosters.** Proposed rosters, with Claire on-page at all five milestones as the
   connective spine and every NPC on-page at least once: M1 Neet/Dolbur/Claire/Daisy/Kyle · M2
   Tirami/Charlotte/Demian/Claire/Daisy · M3 Claire/Dolbur/Tirami/Piria/Luke · M4
   Claire/Tirami/Charlotte/Demian/Piria/Kyle · M5 Neet/Claire/Dolbur/Tirami/Luke. Owner may resize
   (e.g., three per milestone for focus, or all ten at M5).
2. **Route-owned durable marks.** Default under Rule R: route-specific consequences live inside
   their route's telling. If a mark should endure for every player regardless of routes viewed
   (e.g., M1-Stamina's quarry-ledge brood site as a map point), it is promoted to the spine, with
   each route producing it by its own mechanism. Which marks, if any, to promote: owner's call per
   landmark.
3. **Repeat-visit seasoning.** Default: replaying an already-told route re-shows the same chapters.
   An optional one-line aftermath variation ("the almanac again") is polish, not required.
4. **Beyond-spine recall (tracked chapter history).** The default writing rule needs no system:
   chapters assume only spine facts and choice-independent growth, and route consequences stay
   inside their telling. If the owner wants flagged later chapters to actually reference a specific
   earlier route's consequences, that requires tracked chapter history with conditional text — a
   system that does not exist and is not assumed by any drafted chapter. Whether to ever build it:
   owner's call per flagged case.
5. **Cost of solo branching.** Every solo chapter × 3 materially distinct outcomes ≈ 750 texts
   eventually. Confirm the per-character branch-signature scaffold (§2.2) as the drafting economy,
   and whether solo-route carry facts persist beyond the session (design choice) or stay local.
6. **Salvage policy for v1 drafts.** Reference-only (current default) vs. selective reuse — several
   v1 scenes are already compatible with v2 (claire T15 flood, neet T25 vigil, tirami T20 rumor,
   claire T2's reserve margin). Decide whether verbatim reuse is allowed in v2 drafting.
7. **Tone ceiling for band 5.** Mythic register for all ten (including Kyle/Daisy whose canon is
   thinnest) — approve the register, or cap certain endings at "quiet" (e.g., Daisy's dawn scene).

---

*Fan-written planning only. No game data, source, or playable HTML was modified for this proposal.*
