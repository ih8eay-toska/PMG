# Pilot verification

Passed on the rebuilt offline HTML:

- `check-build.cjs`: all current sources including both event modules, local media, no network dependency, existing rig/runtime embedding and Git size limit.
- `check-event-rush.cjs`: supply collection/idempotency, upgrade-independent cadence, helpers ignoring supplies, normal brewing isolation, 5/50 boundaries, costume/voucher choice exclusivity, voucher eligibility, safe integers/import guards, old save migration, opening/gathering/packing/break reloads and offline expiry.
- `check-events.cjs`: all 11 historical definitions held, exact old position/currency retained, owned skins wearable, no historical drops/spending/rotation.
- Existing core, economy, helpers, storage, save-file and original-achievement checks passed. Historical bonus/redemption assertions were updated to the explicitly requested hold behavior; schema assertions now expect 18.
- `check-event-rush-ui.cjs`: actual opening and gathering reloads, pointer and key-1 collection, disabled occupied-cauldron brewing, level-1 MAX delivery without ordinary sales/boost usage, reward-choice/voucher UI, archive hold, replay, packing/results, quota rollback and portable compressed event saves.
- Pilot browser layouts: 1366×900, 390×844 and 320×640, no horizontal overflow or runtime exceptions. Gameplay panel verified below the fixed room frame, not overlapping potion artwork.
- Existing shared menu browser check: 25 dialogs, 100 layouts, Shop/Mail/Settings routes and request/commission/upgrade/navigation checks passed.
- Costume catalog hash unchanged; original 100×88 coupon PNG is byte-identical to its organized library copy.

`results.json` and screenshots record the focused browser checks. Tests use an isolated Edge profile and synthetic event time/counters; they do not modify the player's saved shop. A full real-time 15-minute balance/playability test has not been performed. Story dialogue remains labeled development placeholders. No commits or publication.
