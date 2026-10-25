# UI-Copy Audit — Potion Maker (fan prototype) · revision 3

Writer: GLM-5.3-Flash — Creative Director & Writer.
Status: owner-review draft. Rev 2 structure accepted; this revision applies narrow factual corrections (visitor departures, arrival wording, base trip durations, stale future-work claims), each with code cites. No game files changed; ``source/``, ``data/``, ``assets/`` and the playable HTML were read only.

## Method and sources

- Static copy verbatim from ``source/index.template.html`` (SEC n.n below); dynamic copy from ``source/app.js`` and ``source/core.js`` via string extraction + offset/pattern windows (~422/~182 human strings).
- Mechanics verified in current code this revision (cited inline, §7). Data sources: ``data/economy.json``, ``data/event-stories.json`` (11 historical banners), ``data/updates.json`` (six mail entries).
- Flavor/lore excluded by design and untouched: ``flavor-text.json`` / ``material-descriptions.json`` (praised italic material flavor), ``achievement-lore.json``, ``visitor-dialogue.json``, ``brewer-dialogue.json``, ``expedition-stories/-jobs/-chapters`` prose, ``event-stories`` banner prose.

Placement legend: **[Visible]** on screen · **[Contextual]** beside the action · **[Help ▸]** inside Help, hidden until its topic is opened · **[Dup]** remove as duplication · **[Ref]** reference (attribution/license/historical).

---

## 1. Main brewing screen

### 1.1 Header and How-to area — SEC 1.1/1.2

Simultaneously visible: the "How to play" popover (*"A handful of herbs… Pick a passing ingredient to start a potion. Add more ingredients or enhance to multiply its value. Sell before luck runs out and grow your shop."*) and the persistent line (*"Your first ingredient decides the potion. Every ingredient after it adds value."*) + prototype line + the Dev cheats block (cheat buttons, *"Debug shortcuts change this browser's saved game."*, brewing-mode sentence again in the rack header).

- Items teach the same lesson twice. **[Dup]**
- Dev surface permanently visible on the main screen. **[Layout]**

Recommendation: one brief activity line stays visible; the popover collapses (or opens Help directly); Dev tools move behind Settings ▸ Dev tools (text unchanged there).

### 1.2 Room strip — SEC 1.3/1.4

*"Bank"*, *"Catch a passing ingredient"*, *"Three potion families"*, *"Summon Pushcat · 1 ticket"*, QUEST/ORDERS badges.

- Concise and beside their actions. **[Visible]** — keep.
- Summon button: visible text already carries the immediate cost and — when cats exist — live state *"N/8 cats · Working/Paused"* (app @148231), plus per-cat timer cells (`syncHelperCats`, per-cat `img`+`small`). This useful live state is preserved in the rewrite. The **~250-char hover-only ``title``** (duration seconds, Blackcat %, intervals, pause rules, event notes, "Custom intervals and prices.") is the violation: invisible on touch/keyboard. Sending duration/odds/capacity/pause rules to Help ▸; delete the ``title`` dependence. **[Dup → Help ▸ Pushcat helpers]**

### 1.3 Potion card and controls — SEC 1.5

*"Your next little discovery"*, *"★ Enhance · E"*, *"Sell potion · S"*, *"Start brewing to see your chances"*, *"— coins"*. Dynamic relabels (app @23327): *"Advance quest" / "Deliver commission" / "Sell potion"*. Good; keep; ensure focus/aria parity with the pointer-only ``title`` extras (minor).

### 1.4 Upgrades/achievements/events — SEC 1.5/1.6

*"Shop upgrades — Better ingredients, brighter possibilities."*, *"All shop upgrades complete · View upgrades"*, *"Next potion achievement — View achievements"*: keep.

### 1.5 Events panel — SEC 1.6 + app @122060–@128600 ← the owner's example

Four competing pieces today: the static paragraph (*"15-minute events · 5-minute redemption breaks. Collect Miracle Solution for skins and boosts."*), the live clock (*eventStatusText()* @123627: *"NAME · Drops end in m:ss"* / *"NAME · Redemption break m:ss · Next: NAME"* + event suffixes like *"Summons during the active event receive double working time."*), the balance row (*"{N} Miracle Solution"*; dialog variant *"…saved"*), and the button *"View current event"* / *"Redeem ending event"* → the dialog that already explains Solution, the break, carry-over, and hosts redemption.

- The paragraph duplicates the clock and the dialog. **[Dup — delete]**
- The existing button is **already** an explanation route, so no second "About" control is warranted; the rewrite designates it the single route (revision-1's proposed About button is withdrawn). 

### 1.6 Note on two factual errors in today's visible copy (now code-corrected)

- Help today says *"Accept an order to start its one-minute preparation deadline."* — code: prep is 45–90 s (``acceptQuest()``; ``visitors.prepareMinMs/prepareMaxMs``), modified by fairy ``questPrep``.
- Help today says *"Travelers arrive at random and wait one minute."* — the timing figure is a base wait for the next arrival (`scheduleVisitor()`; `waitMinMs/waitMaxMs`; fairy `visitorDelay` reduces it), and the one-minute figure belongs only to the offer window (`visitors.offerMs`). Arrivals continue during an expedition — the dispatched traveler counts as `'away'` (expedition validation requires phase `'away'`) and is excluded from arrival picks via the `available` filter; only the separate legacy request system gates new arrivals. Player copy states this simply, without scheduling internals (owner-approved wording, rewrite §C.2).

## 2. Menu, Settings, Mail — SEC 2.1–2.4

Menu tiles keep. Mail heading + *"Claim all gifts"* keep. Settings notes (speed, motion, dialogue, text size, keys) stay beside their controls. **Mail entries are the largest repeated-instruction block** (the 2026-10-17 entry ≈18 paragraphs re-teaching Help) → trimmed bullets proposed in REWRITE §B (content edit — owner-approved).

## 3. Help dialog — SEC 3.1–3.3 → compact topic list with expandable details (rev 2 design)

Revision 1 kept the wall and re-sorted it; that is rejected. Current state: ~3,300 characters, 11 paragraphs, no headings, mixes onboarding + deep numbers + dev facts; expeditions live elsewhere; two timing claims are wrong (§1.6).

New pattern: **Help opens showing a one-line intro + a topic list (one terse line per topic). Opening a topic reveals its details.** All numbers/advanced rules live inside expanded topics; the initial view contains no wall. Exact initial and expanded contents are specified in REWRITE §C. Facts migrate from dialog intros and Sources §4.2 (where they currently duplicate or hide), and the corrections of §7 are baked in.

## 4. Sources & prototype notes — SEC 4.1–4.3 → further reduced (rev 2)

Current ~3,600 characters, repeated sentences (the custom-balance claim appears twice; the hyphenated-wiki sentence is quoted twice across paragraphs), live-mechanics rules misfiled, and research-folder pointers shown to players.

Rev 2 design: a 3-line opening, then **four collapsed blocks** (Where the data comes from · What is still provisional · Credits and licenses · Statistics reference). Original reference figures vs. this prototype's current balance are stated explicitly and once. The three real wiki anchors (Potion, Materials, hyphenated-wiki Potions) and the two sound-license anchors are preserved exactly (template anchors verified: fandom links + Freesound/BigSoundBank). Where every dropped sentence goes is tracked in §7.2.

## 5. Feature dialogs — intros and in-dialog notes

Verification of revision-1 drafts against code produced these corrections (details §7): expedition rewards are **likeability** (not visitor EXP); the Sources "1–5 charges" claim is stale; stamp gating is **all three families** at the tier; timed variant names fixed. Remaining structural recommendations (unchanged from rev 1, now with correct facts):

| Dialog (SEC) | Recommendation |
|---|---|
| Catalog 5.1 / Statistics 7.1 / Traveler order 11.1 / Story 14 / Journal 15 | Keep as-is. |
| Achievements 6.1 | 2-sentence intro; "Older saves may have partial recipe history." → muted note. |
| Costume shop 8.1 | One line ("Live2D costumes use Pushcat tickets."); static-image note stays beside such costumes. |
| Fairy 9.1 | 2-line intro; spawn-weight + 99% notes move to Help ▸ (or become card-section footnotes, DeepSeek minor). |
| Stamp Exchange 12.1 | One line + per-offer unlock/cost lines already dynamic; explain "all three families" rule in Help ▸ (and per-card notes if DeepSeek prefers). |
| Expedition 13.1–13.2 | One-line orientation; hover-only advice reworded tap/keyboard; provenance sentence moved to Sources; dispatch notes (excellent, concrete) reduced by one clause each (optional). |
| Commissions 16.1 | Intro ≤2 lines; board note loses the fairy sentence (now Help ▸); status suffix *"No entry fee or time limit."* removal flagged for owner. |
| Save 17.1 | **No change** — warnings preserved verbatim ("Imports show a preview and back up your current shop before replacing it."). |
| Bank 18.1 | No change. |
| Event dialog | Mechanics sentences first, history labeled **"Past banners (historical)"**; becomes the single event-help route for the deleted panel paragraph. |

## 6. Accessibility / placement findings

1. Hover-only explainers to fix: sell/give titles (keep as pointer-extra, ensure aria parity), route-locked titles (@62780), reward-odds title (~200 chars, @131250–@136100 numbers verified), the **helper title (@148231 — delete; facts to Help ▸)**, *"hover a job…"* wording → *"Open a job…"*.
2. Help-surface set (small and consistent): **topic-list Help with expanded details**, the event dialog as the event's single explanation route, Sources for provenance/licenses/limits. No new paragraph walls; no new permanent paragraphs.
3. Costs/requirements/deadlines/failure reasons sit beside decisions today (dispatch cost cells, unlock notes, prep deadline visible in the quest timer, stamp offer costs/tiers, save warnings) — nothing decision-critical is missing; the issues are repetition, hover-only carriers, and two wrong numbers.

## 7. Code-verification matrix (this revision; no owner decision needed)

| Claim | Verified | Cite |
|---|---|---|
| Visitor prep 45–90 s, fairy ``questPrep`` modifier | ✓ | ``core.js acceptQuest()``: ``deadline = now + (prepareMin…Max)(1+questPrep)``; `economy.json visitors.prepareMinMs=45000 / prepareMaxMs=90000` |
| Arrival base wait (20–60 s) for the next visit, reduced by fairy ``visitorDelay``; **other visitors keep arriving during an expedition** — the dispatched traveler counts as ``'away'`` and is excluded from arrival picks; only the separate legacy request system gates the rotation; offer window 60 s | ✓ | ``core.js scheduleVisitor()`` (`waitMinMs/waitMaxMs` × `(1−visitorDelay)`); ``tick()`` spawn branch @~84310: gate `if(!s.request && every(t=>t.phase==='away'))`, where expedition validation requires the dispatched traveler's phase `'away'` and `available` excludes `state.expedition?.travelerIndex`; ``visitors.offerMs`` |
| Completed travelers depart **at payout** — no completed-visitor one-minute wait stays anywhere. Offer expiry (60 s) and failed visits (lingering `leaveAt = now + QUEST_OFFER_MS`) remain distinct | ✓ | ``core.js settle()``: pays reward and sets `phase:'away'` in one step; ``tick()`` dismisses `complete` visitors immediately and `['offer','failed']` at `leaveAt`; failure assigns `leaveAt=now+QUEST_OFFER_MS` |
| Sources' stale future-work pair — **both live**: helper event multipliers (2× working time, 5× Blackcat odds) and quest-material spawn weighting are implemented | ✓ | ``core.js helperInfo()`` (event multipliers); conveyor `questMaterialWeight` weighting (fairy-24/32/behe effect entries). Removed from Sources; the genuinely missing item that remains is inactive-fairy abilities (labeled in cards) |
| Order rewards: 2 tickets + **1–3 boost charges** (random type) + visitor EXP | ✓ | ``core.js randomQuestBoost()`` (`boostMin+randomIndex(boostMax−boostMin+1)`); `visitors.boostMin=1/boostMax=3`; `rewardDelayMs=30000` |
| Sources **"1–5 charges"** false — replaced by 1–3 in the rewrite; sentence is deleted, not migrated | ✓ resolved | same cites |
| Expedition rewards pay **likeability** (+ stamps/supplies/bonuses), not visitor EXP | ✓ | ``core.js`` reward schema: ``{stamps, likeability, boostBundle, fairyId, extra}``; ``REQUESTS[].likeability``; ``likeabilityInfo()`` milestones cap 25,000 |
| Fairy searches: **40% base, guaranteed after 2 misses** (same fairy); combined trips average pool chances | ✓ | ``core.js expeditionInfo()`` `fairyChance: misses>=2 ? 1 : 0.4`; ``combinedExpeditionInfo()`` pool average |
| Story trips: **120 s base**; supplies 120 s; fairy searches 120 s + 60 s×request level; times shrink by fairy ``requestDurationReduction`` | ✓ | ``core.js`` constants (`EXPEDITION_STORY_DURATION_MS=120000`), `expeditionInfo()` duration formula |
| Matching-potion sales shorten story trips: potion family **and tier** must equal the route material; saves `round(5000 × value ÷ recipe base)` s per sale, ≤ 20 s per sale (`EXPEDITION_SALE_REDUCTION_MS=5000`, `…_CAP_MS=20000`), never more than remaining | ✓ | ``core.js reduceExpeditionForSale()`` applied in ``sell()``; app notice reports the saved figure |
| Stamp Exchange gating: offers tier 1 boosts; tickets need **all three families at tier 6**; fairy copies unlock at their listed tier (economy ``fairyUnlocks``), unlock test is ``min(tiers)+1 < offer.tier``; fairy cost `12+2×tier` stamps; one copy incl. levels | ✓ | ``core.js stampOffers()/redeemStamps()``; `economy.expeditions.rewards.exchange` |
| Chapter opens when any one family reaches the tier; route material only from families already at that tier; dispatch requires a visitor with a live order and replaces it; trips cannot be cancelled | ✓ | ``core.js expeditionChapter()/startExpedition()`` (tier/phase gates); app lock/unlock notes @62780; Sources copy "Expeditions cannot be cancelled" (retained, moved to Help ▸) |
| Blackcat: `min(1, (0.05 + fairy percentage points) × event multiplier)`; working seconds `60s × (1+pushcatSummonTime−reduction) × event mult`; intervals `1.00→0.30 s` over 15 Pushcat-speed levels; Blackcat ÷2 speed; Summer Part 2 ×5 odds, HALAK 2× duration | ✓ | ``core.js helperInfo()``; `economy.json helpers` + `EVENTS` data. The earlier captured "3.0%" was not code-derived and is not used |
| Summon live state *"N/8 cats · Working / Paused"*, per-cat timer cells | ✓ | app `renderHelper` @148231, `syncHelperCats()` |

## 7.2 Map of where existing information moves (nothing decision-critical dropped)

- Boost effects *"protection saves a failed attempt; enhancement adds ten percentage points; selling doubles a sale; charges apply automatically"* — remembered not lost: Help ▸ Boost charges (full sentences retained), since the cauldron UI shows charges but not their effect values.
- *"Expeditions cannot be cancelled."* — moved from Sources §4.2 to Help ▸ Expeditions; the dispatch UI may also show it beside the button if DeepSeek prefers (recommend yes, one short line).
- *Offers expire after one minute; visitors also leave automatically after one minute.* — Help ▸ Travelers, now split by code: offers expire at 60 s; failed orders linger about a minute; **completed travelers depart the moment their reward pays out — the old one-minute completed-wait claim is deleted as stale** (`settle()`/`tick()` evidence in the §7 matrix).
- *"Only the dispatched visitor is unavailable; commissions and other visitors continue."* — Help ▸ Expeditions (kept as-is).
- *"The conveyor is the normal brewing mode."* / exact-ingredient notes / strip keys 4–6 — Dev-tools topic, collapsed.
- *"Normal-quest response text is fan-written…"*, *"Character-inspired greetings and tasks are original writing."*, wiki/link blocks — Sources lowered blocks only.
- Events paragraph's "Collect Miracle Solution for skins and boosts." — already covered by the dialog's rewards list ("Redemption…"); deleted as duplication; the split dialog copy keeps drops/break/carry-over facts.
- Long-request reward tables note — Sources · provisional/history block, one line.
- Panel trivia removed only when a live control already carries the fact (events paragraph → clock+dialog; commission status suffix → intro+note; helper hover wall → Help topic + live state).

## 8. Coverage

Reviewed: main screen (all areas + dynamic relabels), menu/Settings/Mail, Help + Sources dialogs in full, all 14 feature-dialog intros, 40+ dynamic clusters; mechanics verified in code this round (matrix §7).

**Still not individually verified (explicit):** runtime rendering QA (focus order, reflow of trimmed copy, light-theme contrast, native `<details>` keyboard behavior inside the Help dialog); the banner-history tail beyond *"Your balance carries over."* (@122692 partial); per-fairy effect texts beyond sampled cluster @83359; possible CSS-only tooltips (none found in sampled strings); settings audio strings re-verified item-by-item; touch behavior of per-cat timers.

## 9. Prioritized clutter reductions (rev 2)

1. Events panel: delete the paragraph; the existing **View current event** button is the one help route (no new control).
2. Help → compact topic list + expanded details (initial view ≈ one intro line + 12 terse rows; all numbers inside topics).
3. Sources → 3-line opening + four collapsed blocks; repetitions removed; links preserved.
4. Pushcat: no permanent statistics sentence anywhere; summon button keeps cost + live *"N/8 · Working/Paused"*; hover title deleted; facts in Help ▸.
5. Mail bullets (owner-approved content edits).
6. Dialog intro one-liners; hover-only odds captions become visible text.
7. Dev-tools block out of the main screen.

## 10. Owner-approval items (genuine design/content choices only)

1. Deleting the events-panel paragraph (facts shown twice elsewhere; the dialog keeps them).
2. updates.json mail trims (dated gift content).
3. Dev-tools relocation.
4. Removing the "Completed commissions… No entry fee or time limit." status suffix (same fact in intro + note; owner may keep it out of caution).
5. Whether the cancelled-trip forbidding ("Expeditions cannot be cancelled") also appears beside the dispatch button, or only in Help ▸ (recommend beside the button).
6. Help topic-list labels and section contents (REWRITE §C) — since Help's whole look changes.
7. Sources opening wording (REWRITE §D).

All recommendations preserve gameplay, saves, economy/verified numbers, story/dialogue/material flavor. Implementer note: template is authoritative; regenerate `Potion-Maker.html` after edits.
