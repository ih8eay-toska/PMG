# Pushcat helpers

Sources: https://potionmaker.fandom.com/wiki/Pushcat , https://potionmaker.fandom.com/wiki/Blackcat , https://potionmaker.fandom.com/wiki/Upgrades , https://potionmaker.fandom.com/wiki/Fairy .

Wiki mechanics retained: summon costs one ticket; 60 working seconds; empty cauldron pauses work/timer; player chooses starting recipe; Blackcat is faster; 15 displayed upgrade levels. Our game additionally pauses while hidden/closed and saves remaining time/cooldown. Helpers collect visible ingredients, tickets and Miracle Solution. Manual mode uses the underlying simulated belt. Up to eight helpers may be active. Each summon charges one ticket; summoning at the limit is refused without charge. Every cat has an independent working timer and cooldown. Fairy and event effects are frozen when summoned; speed upgrade purchases update active cats immediately. Failure to persist a summon refunds the ticket in memory.

Custom balance (wiki does not specify these): base Blackcat chance 5%; base Pushcat interval 1000 ms falling linearly to 300 ms at level 15; Blackcat twice as fast; gold upgrade prices 500 * 1.65^step, rounded. HALAK duration and Summer Part 2 Blackcat chance multipliers are enabled during their active rotations. Conveyor speed settings affect supply, not helper working seconds. Hidden/background and frames longer than 2 seconds do not simulate catch-up.

Helper bonuses connected: Magi-Run duration +10–30%, speed +10–20%, Blackcat chance +1–10 percentage points; Warri-Run speed +10–20%; Poong-Poong Blackcat chance +5–10 points; King-Poong chance +5–15 points; Hero-Poong duration +10–60%. Existing Forest/Fire/Water recorded bonuses now apply: duration −5%, chance +5 points (fixed, as previously recorded). Beany-Kong remains inactive because enhancement duration is not modeled. Other partial fairy abilities remain as previously implemented.

Compatibility: optional pushcat (upgrade count) and helpers list added to version 15 saves. Missing fields default to upgrade level 1 and no active helpers. Legacy single helper fields are migrated into a one-entry helpers list. Existing claims, balances and unlocks remain supported.

Ingredients now fall from their source card into the cauldron for manual clicks and helper catches. Cat portraits sit at persistent belt slots and jump vertically when catching overhead cards. Animation elements clean up on completion; reduced motion skips both flight and jumps. Cat artwork currently uses the archived dialogue portraits.

Cats now have persistent slots (0–7), preserved through reloads and other cats arriving/departing. Each catches only while a conveyor item center is within 12 pixels of its head. Collection cooldown starts after a successful catch; ready cats wait in place. Cats jump vertically, never toward remote ingredients. The frame loop uses at most 25 ms simulation substeps to avoid skipping the catch window on slower frames. Legacy helpers without slots receive slots during migration.

See PUSHCAT-WIKI-AUDIT.md for the subsequent source audit, four additional fairies, ticket/quest-material effects, event multipliers and summon milestone rewards. At maximum emission, a deterministic 60-second normal-conveyor test collected 60 ingredients at Pushcat level 1 and 199 at level 15. This measures simulated collection, not human/browser performance.

Helper catches now include tickets and active-event Miracle Solution. They use the same balance limits and event eligibility as manual collection; ordinary ingredient statistics exclude special drops. Currency catches trigger immediate saves and fly toward their balances. Empty/hidden pauses and overhead-only catches still apply.
