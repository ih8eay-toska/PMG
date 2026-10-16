# Step 6 — live economy verification

17 October 2026. **Automated verification and rebuild passed. Browser visual inspection remains pending:** the browser tool rejected the local `file://` URL under its security policy. No workaround was attempted. All gameplay/save tests used disposable in-memory state; no player browser storage was read or changed.

## Main findings

1. All nine live test suites pass against the rebuilt HTML. The obsolete numeric fixtures now describe the selected economy rather than the superseded exponential upgrades and one-ruby visitor reward.
2. Three small runtime fixes were required: request ticket rewards no longer truncate a valid legacy balance above one billion; manual ingredient redraws retain special-drop keyboard targets immediately; expired Miracle Solution is removed from the manual strip immediately.
3. The live ordinary-income grid passes 2,750 comparisons with a worst family ratio of **1.228346×** and no backward tier-income steps. Farming may stop before the mastery level. All 38 fairies at levels 1/5/10 across all 75 recipes produce finite, reloadable values; multiplier bonuses apply across the whole brew. Another 30,000 seeded boosted brews agree with the probability/resource solver within the declared sampling tolerances.
4. The small live progression sample keeps Tia and first-skin pacing near stage-four expectations. The conveyor saving-policy middle gap is **5.10 minutes**, still above the 3–5-minute target. This is four seeds per policy, not new calibration or human timing.
5. Existing gold is preserved without conversion. A wealthy old save can bypass gold affordability under the new prices; mastery gates and time/currency restrictions still apply. No reset, rescaling or new balance tuning was performed.

## Live progression sample

Sixteen fresh-save three-hour sessions: four seeds for each policy. Eight additional two-hour probes cover owned tiers 10/20 in manual/conveyor modes. Both saving policies reached Tia and a guaranteed wardrobe purchase in all four runs. Every resource ledger balances; no paid boost window exceeds three openings.

| Policy | Median Tia minutes | Median wardrobe skin minutes | Median middle purchase gap |
| --- | ---: | ---: | ---: |
| Manual Â· save for skins | 61.88 | 100.95 | 3.08 |
| Conveyor Â· save for skins | 76.35 | 112.76 | 5.10 |
| Conveyor Â· paid boost stock | 77.18 | 107.70 | 5.45 |
| Conveyor Â· ruby cases | 76.11 | Not reached | 5.57 |

Assumptions: one action per 500 ms, 50 ms conveyor substeps, 90% attempted-catch accuracy, scripted buying/quest priorities, and ordinary 4.2-second chest reveals. These are modeled active-play results, not a promise for every player. “Not reached” means no guaranteed wardrobe purchase within the session; the ruby-case policy spends that currency on cases. The original 40-seed candidate evidence stays unchanged.

Raw sessions, phase summaries, assumptions and runtime hashes: [progression.json](progression.json). The live adapter reuses the stage-four policy with the live core and actual Bank transactions; it skips locked upgrades using the live `locked` flag. The historical adapter used an infinite price for that purpose.

## Verification coverage

- **Save compatibility:** versions 1–14 migrate to 15; both historical version-6 formats are covered; exact raw backups are retained without replacing prior backups. Backup quota failures block overwriting the original. Existing currencies, potion values, upgrades, costumes, mastery, Tia status and event progress round-trip. Legacy fixed boosts, fairy deliveries, pending one-ruby promises and frozen 2,000-gold request results settle once.
- **Chests:** price bands, affordability/inventory refusals, three-per-fixed-window quotas across reloads, independent free cooldowns, no stacked missed hourly claims, window boundaries and reduced-motion reveals. Rewards are saved before reveal completion. Locked Tia and empty character pools cannot be charged. Exact 100-slot case enumeration covers both fairy-cap and ownership compensation states. Ticket currency returns are 87–89.5%; ruby returns are 77.5–78.8167%, excluding the noncurrency utility of new fairies/skins.
- **Progression:** every material cost and mastery gate, all selected recipe tables, all 75 mastery paths, unique twentieth-star Tia unlock, deferred intro gating/retry, and no duplicate star awards. The 99% ceiling remains an upper bound; it does not imply every family reaches 99% with ordinary upgrades.
- **UI handlers:** actual manual-mode drops, mode changes, keys 1–6, control/modal guards, fractional material labels, event expiration, direct quest handover without a sale/selling-charge loss, visitor completion badges, chest pool display/reveal and quota labels. These use in-memory DOM fixtures, not a rendering engine.
- **Build/history:** current core/app/storage and data are embedded, scripts parse, IDs are unique, 332 media assets are offline, and both Live2D rigs remain embedded. The archived baseline's 72,000 sampled brews and 18 seeded historical sessions still pass; frozen research artifacts are unchanged.

## Concrete legacy-gold purchasing power

The complete three-family material ladder now costs **33,622,181 gold**, excluding ancillary upgrades. The last Life material upgrade costs **2,739,137 gold**. A hypothetical existing **1.96 Qi (1.96 × 10^18) gold** balance is about **58.3 billion complete material ladders** in nominal gold terms. The upgrades are one-time purchases and still mastery-gated; this comparison only demonstrates affordability. Any conversion proposal requires a separate reviewed decision. No player save was inspected to produce this example.

## Reproduce

Run each live suite with Node (the package test script contains the same ordered commands):

```powershell
$checks = @('core','storage','migration','ui','events','visitors','economy','late-balance','build')
foreach ($check in $checks) {
    node "source/check-$check.cjs"
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
node research/balance/verify-live.cjs
node research/balance/check-baseline.cjs
node research/balance/check-stage-two.cjs
```

`verify-live.cjs` overwrites only this step-six progression artifact. Historical folders are not rewritten. `source/build.py` rebuilt `Potion-Maker.html` successfully; the final build suite passed after that rebuild. `git diff --check` passed. npm itself was not used; the Node equivalents ran directly.

## Remaining visual check

Open the rebuilt local HTML in the normal browser and inspect portrait/mobile layouts, the manual special-drop strip, chest reel clipping, the completed-quest badge and the Tia intro artwork. Automated handler tests do not establish those visual results. Browser security policy prevents the agent from completing that inspection in this environment.
