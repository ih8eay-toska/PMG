# Shared economy rules — stage 5 integrated

`data/economy.json` (schema 2) is authoritative for live economy values. Stage 5 applies the stage-four candidate alongside its recipe arrays in `data/game-data.json`. Explicit cost tables replace exponential prices; the config also supplies mastery gates, Bank pairs, chest price bands/quotas, request costs and fairy adjustments. Player gold and existing unlocks are not converted or reset. See [the implementation notes](STAGE_FIVE_IMPLEMENTATION.md).

## Connected systems

| Group | Consumers |
| --- | --- |
| Upgrade cost curves, maxima and bonuses | Purchases, upgrade descriptions, statistics, conveyor speed, research |
| Costume prices, Tia threshold, event costs/bundles/timers | Purchases, character selection, event pages, research |
| Chest prices, weighted pools, cooldown, reveal duration and conversions | Opening rules, current-state expected-return labels, research |
| Bank units and conveyor probabilities | Exchange labels/transactions, spawning, research |
| Visitor timers and boost/ruby rewards | State transitions, countdowns, descriptions, research |

Recipe-specific values remain in `data/game-data.json`. Costume identities remain in `data/costumes.json`; its duplicate `cost` field is removed. Game-data source metadata is not a second live economy configuration. Fairy abilities and request-specific tables remain in the core, shared with research through the same game methods.

The offline builder embeds economy data alongside game data. Browser gameplay and Node research load the same configuration. No new dependency is added.

## Planning targets

`PROPOSED_TARGETS.json` records the 3–5 minute middle-game upgrade target, 60–90 minute Tia target, 1.25 family-income ratio, and proposed mastery gates. This research file is not loaded by gameplay.

Stage 5 activates gold-exchange restrictions, paid chest price bands, saved opening quotas, family mastery gates and manual-mode special drops. Saves use version 15, with a backup of older raw saves before replacement. Existing pending quest/request rewards keep their previous amounts.

## Historical stage-two validation

1. `npm test` checks gameplay, saves, visitors, events, config wiring, active balance profiles and the offline build. Configuration tests use an isolated VM to change prices, timers and bundles and check charges and labels.
2. `npm run test:balance-baseline` checks analytical probability/resource results against sampled game transitions.
3. `node research/balance/check-stage-two.cjs` compares 18 full sessions and the economy summary with frozen stage-one evidence. Later deliberate balance changes will invalidate this stage-specific check.

The commands above characterized the earlier economy; the superseded live numeric fixtures required updates, now completed in step 6. Stage 5 ran syntax checks and the offline builder, not the gameplay test suites. Historical baseline/candidate calculations now load `research-runtime.cjs`, `stage-five-before-core.js` and `stage-five-before.json` so live changes do not silently alter their model. The frozen numerical output folders remain unchanged.

## Next

Stage 3 calculations are in [the candidate report](stage-three-candidate/REPORT.md), with exact arrays, effective prices, seeded sessions and assumptions alongside it. These are research inputs, not a live config. The report separates ordinary family-income bounds, Tia pacing by policy and the unresolved middle-game purchase cadence.

Stage 4 calculations are in [the resource economy report](stage-four-candidate/REPORT.md). Its selected rules are now integrated. The report describes the research state when written; its numerical results remain simulations rather than measured human play. The conveyor middle-game median remains above the 3–5 minute target.

Step 6 automated verification now passes: live save migration, saved quotas, resource accounting, Bank guards, case outcomes and UI handlers. Superseded numeric fixtures are updated. See [verification results](stage-six-verification/REPORT.md); browser visual inspection remains pending because local file URLs are blocked by the browser tool. The step-six report includes a concrete legacy-gold purchasing-power example. Any gold reset or conversion still requires a separate decision.

Current conveyor behavior and updated pacing: [density report](conveyor-density/REPORT.md). Material Emission shortens spawn spacing at fixed travel speed; special-drop frequency increases with density.

Superseding correction: [slow selection / faster brewing](conveyor-slow-start/REPORT.md): 19 px/s empty, 76 px/s brewing; unchanged per-spawn odds. Specific-recipe income regression remains a tuning issue.

Current speed adjustment: empty conveyor 40 px/s (40/76 base-speed multiplier); brewing 76 px/s. Earlier 19 px/s progression estimates are historical and require recalculation.

Current conveyor speeds: 40 px/s empty, 80 px/s brewing (base speed 80, empty multiplier 0.5). Emission spacing remains 76 pixels before upgrades.

Regular wardrobe costumes now cost 200 Pushcat tickets; duplicate skins convert into 200 tickets (one selectable regular skin). Historical pricing and timing reports retain their original values.
