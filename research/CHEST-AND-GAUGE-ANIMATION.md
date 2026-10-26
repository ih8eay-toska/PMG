# Chest and enhancement animation evidence — 2026-10-25

Inspected the original APK's ARM64 IL2CPP code and serialized Unity scene/particle settings. APK and REA files were read only.

## Chests

`ExplorationRewardGUI.GetChestSprite` at RVA `0x492CA8` selects `wood-chest-0`, `iron-chest-0` or `gold-chest-0`. It returns gold when `FairyId` (offset `0x30`) is nonzero, otherwise wood for reward Index 0, iron for Index 1 and gold for the remaining indices. `ExplorationRewardChestGUI.Setup` at `0x48B77C` uses this selection and marks received/unreceived entries with white/gray color and an unknown marker.

All three chest materials have image states 0 (closed), 1 (partly open), and 2 (open). No original chest-opening AnimationClip or frame timing was located: the APK's two AnimationClips are `Glow` and `Pushcat@Hand`. This does not prove that no other code ever switches chest frames.

PMG now shows these three states during its existing reward reveal. Wooden/iron/gold are assigned to the remake's boost/ticket/ruby cases. This shop mapping and the last-part-of-reveal opening timing are remake choices, not recovered APK behavior. The existing reward reel, odds, costs and commit-before-reveal behavior are retained. Explicit image switches follow the reveal clock; reduced motion displays the open state immediately. Closing finishes both animations without awarding again.

## Enhancement gauge

`EnhancementGUI.<DoEnhance>d__44.MoveNext` at `0x42DCC4` activates the gauge and sets alpha 1, resets its Image fill to 0, starts the enhancing ParticleSystem, updates fill from the tween, and moves the emitter horizontally using `Ease.Lerp(enhancingGfxMin, enhancingGfxMax, progress)`. At completion it stops that emitter, sets fill to 1, executes the enhancement, then starts `DoFadeOutEnhanceGauge`.

The normal gauge tint is cyan `(0,1,1,1)`; the APK's illegal-workshop branch uses red. PMG uses the normal cyan tint and original `gauge-background.png`, `gauge-fill.png`, and `gauge-frame.png`. Its accessible progress element replaces the previous generated purple bar.

Recovered scene RectTransforms:

- Gauge PathID 400: 400 × 10 logical units, anchored at (0, 149.1) within Enhancement.
- Enhancement PathID 350: anchored Y −494, height 264; the existing web action panel begins 132 units above its center, so the gauge is 17.1 units above the panel top.
- Fill PathID 420: X −2, width 404, height 10. The browser clips the original fill horizontally.
- End caps PathIDs 379/336: 18 × 24, offset −5/+5 at the ends.

The web gauge follows these dimensions and placement using the existing APK scaling unit. The current web completion hides the gauge immediately; the APK's separate fade-out coroutine has not been reproduced.

## Particles

| Effect | Particle PathID | UV frames | Native emission | Lifetime |
| --- | --- | --- | --- | --- |
| Enhancing | 196 | 5 × 5 | 50/s | 1 s |
| Enhanced | 198 | 5 × 3 | burst 5 | 0.5–0.75 s |
| Enhance Failed | 188 | 4 × 4 | burst 36 | 0.71 s |

Enhancing colors range from pink `(1,.294,.953)` to blue `(.471,.671,1)`; success colors range from gold to pale yellow; failure is gray/slate. The browser tints white sprite alpha masks, moves the enhancing spawn point along the gauge, and puts result bursts around the potion slot, following the original Enhancement hierarchy. This corrects the previous cauldron-only placement. Browser particle movement/size and UV timing remain approximations of Unity's curves; enhancing particles are capped at 150 per attempt. Reduced motion uses one static particle.

Verified all three states for each chest, safe reward commit/close/repeated-click behavior, reduced motion, desktop/mobile gauge bounds and original cap images, five/36 result particles, cleanup, and zero browser exceptions. UI, economy and offline build checks pass.
