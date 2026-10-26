# Book and enhancement visuals — 2026-10-25

The later native-code pass in `CHEST-AND-GAUGE-ANIMATION.md` supersedes this pass's particle placement/counts and adds the original gauge and chest animation.

The potion book uses the original `assets/extracted/book.png` as an open spread: material on the left, matching potion on the right. Family buttons and a shared tier selector/previous/next navigation cover all 75 pairs. Each page scrolls independently, including on narrow screens. Existing lore, supplier notes, reviews, mastery-locked commentary and brewing records are retained. CSS is in `source/potion-book.css`, embedded by `source/build.py`.

Original APK ParticleSystem UV modules were read directly from `Work/apk/assets/bin/Data/data.unity3d` in PotionMaker-REA (read-only):

| Effect | PathID | Grid | Recorded particle lifetime |
| --- | --- | --- | --- |
| Enhancing | 196 | 5 × 5 | 1 s |
| Enhanced | 198 | 5 × 3 | 0.5–0.75 s |
| Enhance Failed | 188 | 4 × 4 | 0.71 s |
| Small Plop | 192 | 4 × 1 | 0.33 s |

The browser approximation uses the existing original PNGs as individual particles. Gathering sparks are small, the success flash is centered on the liquid, and failure smoke rises from the cauldron. Generated CSS smoke/ripple overlays were removed. The old plop grid was incorrectly 4 × 2; it now uses the original 4 × 1. These are bounded browser effects, not a full reimplementation of Unity's particle simulation. Reduced-motion mode shows one brief static frame; effects clean themselves up.

Boost visibility bug: `source/original-mobile-ui.css` applied `display: none !important` to every `.powerup-panel-indicator`. That rule now applies only to `[hidden]` indicators, allowing the existing original-layout positions and charge counts to show normally. No balance or charge-consumption logic changed.

Verification: all 75 paired entries, desktop/mobile independent scrolling, all three positive-charge badges, sprite sizes and cleanup, reduced-motion rendering, and zero browser exceptions checked in an isolated browser profile. UI/effect and offline-build checks run. No original asset files modified.
