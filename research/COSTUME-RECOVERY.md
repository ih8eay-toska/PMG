# Archived costume recovery

The initial pass recovered 95 previously static outfits: 68 Pio and 27 Tia. All are free to equip. Healer's character assignment was corrected to Pio using the matching archived rig and portrait.

The subsequent approved pass added 11 distinct outfits (six Tia, five Pio) and corrected nine existing character-specific previews while preserving every existing costume ID and its character assignment. The wardrobe now contains 182 animated and 34 static outfits, 216 total. All 11 additions are free and excluded from paid random skin pools. Their pinned sources, original costume IDs and preview hashes are in `approved-costume-additions.json`. All 11 passed actual rebuilt-game wardrobe-button/Live2D checks at zero tickets (`approved-costume-render-check.json`); the shared recovery check also verifies all 106 recovered outfits' hashes, free equipping and save round trips. UI, economy and offline build checks passed.

Darklord remains unresolved. Original APK table records identify Pio's `darklord-costume-real` (3101) and `darklord-costume-fallen` (3102), and Tia's `darklord-costume-fallen` (103081) and `darklord-costume-normal` (103082). No matching atlas was recovered in the checked archives. Existing static entries were retained. The original CloudFront host failed DNS resolution during research; S3 and Wayback checks timed out, so absence from those services is not established. Original cached costume asset bundles remain an unverified recovery route.

Sources:
- https://github.com/fghrsh/live2d_api at `02dc5b3aaf5cee35455c816596820055c5363205` (65 outfits).
- https://github.com/imuncle/live2d at `b5caf5390c8c226f19c817ea37d5bc4452d85209` (30 outfits).

Only original PNG texture atlases were downloaded (45,142,916 bytes). Archived rig hashes match the existing local Pio and Tia rigs. No runtime, model rig, or motion was replaced. Each PNG was checked against its archived Git blob hash, PNG header, dimensions and byte count; SHA-256 hashes are recorded in `restored-costume-textures.json`. That file also lists the 34 unresolved outfits. Their absence from these archives does not establish that they are unavailable everywhere.

Validation: all 95 outfits rendered visible pixels and changed pose in an isolated headless Edge software-WebGL test. All passed texture hash, zero-ticket equip and save round-trip checks. UI and offline build checks passed. `costume-render-check.json` records per-outfit results. The complete gameplay test suite was not rerun; the previously known unrelated balance failure was not addressed.

`source/recover-costume-textures.cjs` reproduces downloads from the pinned source index without fetching runtime code. `source/check-restored-costumes.cjs` verifies restored entries and can generate the isolated rendering fixture.

The rebuilt standalone `Potion-Maker.html` is approximately 133 MB because it embeds the original lossless PNG atlases. No commits or publishing were performed.
