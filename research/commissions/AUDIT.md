# Commission mechanics before UI changes

Inspected source/core.js, source/app.js, source/index.template.html and source/check-commissions.cjs before editing presentation.

- commissionOffers: one offer per family. Each tier is sampled uniformly among that family’s unlocked tiers and persisted in commissionTiers. Reopening/reloading does not reroll them. Quantity is 3. Minimum displayed level is min(recipe.max_level, 2 + commissionsCompleted % 2).
- acceptCommission: free, one active commission; rejects invalid family, an existing commission, legacy state.request and the completion-count ceiling. No traveler presence, time or coin requirement. Timed traveler orders and modern expeditions remain separate.
- There is no potion inventory. canDeliverCommission checks the single current cauldron potion for exact family and tier, displayed level >= minimum, no pending enhancement, and reward capacity on final delivery. Higher levels qualify. Event bottles are separate from state.potion and do not qualify.
- deliverCommission clears only the matching cauldron potion, increments delivered, pays only on the final bottle and clears commission/commissionTiers then. It gives no sale coins, does not consume selling boosts and does not record an ordinary sale. Quest delivery retains its existing main-action priority.
- Rewards: shop-wide likeability = 10 + 2*tier; boost type protection/enhancement/selling by family; charges = 2 + floor(tier/8). Every third completion also offers a guaranteed fairy copy, selected from non-maxed fairies when the offer is accepted. The saved fairyId is retained for an active order.
- Save version 18: commission {family,tier,level,quantity,delivered,fairyId}, commissionTiers [tier,tier,tier], commissionsCompleted. Sanitizer validates unlocked recipes and ranges; legacy quantities 2–4 remain supported. Older missing fields default safely. No commission timestamps or offline delivery.
- Current UI uses the same band title for all three families, offers reward icons without visible names and mixes quantity/minimum level into one sentence. Delivery routes are handOverCommission from the board, cauldron/main action and shortcut. Existing save/render/feedback handlers are reused.

## Implementation scope

Presentation only: three identified written requests (Neet/shrine, Luke/familiar care, Daisy/bakery), existing portraits, purpose, exact recipe and family, explicit quantity and minimum level, named rewards, active progress and current-cauldron eligibility reason. These customers describe posted requests, not timed traveler presence or personal relationship rewards. No changed economy formulas, core rules, save schema, offer generation, currencies or delivery routing.

## Verification after implementation

- Existing check-commissions, check-economy, check-core and check-save-files passed; formulas and core/save source were not edited in this pass.
- check-commissions-ui: distinct customers/purposes, exact recipe/quantity/level/rewards, acceptance without coins, empty/wrong/under-level/enhancing/ready cauldron states, partial progress save round trip, exactly three consumed bottles, unchanged coins/selling charges, final reward paid once and refreshed offers all passed.
- 12 browser layouts: offers and active order at 1366, 390 and 320 pixels, normal and large text; no horizontal overflow, correct progress and associated disabled-state explanations. Desktop offers and phone offers/active delivery area visually inspected.
- Shared menu check passed: 25 screens / 100 layouts, navigation, keyboard close and existing action checks; no runtime errors.
- Rebuilt Potion-Maker.html; check-build passed embedded-source, local-media, syntax and no-network-dependency checks.
- No economy rebalancing, new commission requirements, new save fields, commits or publication. No extended real-time playtest was performed.
