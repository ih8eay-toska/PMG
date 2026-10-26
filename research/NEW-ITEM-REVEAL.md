# Original upgrade / item reveal — recovered and implemented

Research and implementation: 2026-10-25. Original `data.unity3d` scene/prefab data, extracted English localization and ARM64 `libil2cpp.so` were inspected read-only. The full raw investigation is in the Codex workspace's `new-item-investigation` directory.

## Sequence and controls

`UpgradeGUI.OnWorkshopUpgraded` (0x415C9C) refreshes the row and starts `DoShowUnlockedMaterial`. Its coroutine (0x584918) yields `WaitForSeconds(0)`, resolves the material at the current upgrade grade, plays its configured **Congratulation** audio, and calls `Dialogs.ShowItemBook(material,true)` (0x45549C). Non-material upgrade groups do not supply an unlocked material.

`ItemBookGUI.Setup` (0x4AB1D0) configures one item slot with `starred=false`, sets a description/report according to item type, and calls `BookGUI.Congratulate` when requested. Materials have an empty description in this code path; potions use Description1 on the left and Description2 after their statistical report. `StatsReportBuilder.Append` uses `{0}: {1}`, while Starting Potion uses its two-line variant.

The same book appears for MAX potions: `EnhancementGUI.<DoShowMaxLevelPotion>.MoveNext` (0x42E400) waits **0.5 seconds**, plays the congratulations sound and shows the congratulated item book. PMG now follows this path whenever an enhancement reaches MAX, including later brews of an already-mastered recipe. Normal enhancement successes keep their normal sound/effects.

`BookGUI.OnPointerClick` dispatches virtual slot 5, `DialogGUI.Close`. The book has no serialized close-button reference and permits Escape. PMG also offers an explicit accessible close button. Text areas accept scrolling without dismissing the reveal, and clicking the item triggers its recovered jiggle. Closing a material reveal returns to the existing upgrade dialog.

## Recovered layout

These are logical Unity units, with upward-positive Y:

| Element | Position relative to parent | Size |
| --- | --- | --- |
| Book | center | 640×452 |
| Item Slot | (−151,+79), book center | 238×238 |
| Icon | (0,+5), slot center | 127×185, aspect preserved |
| Name frame | (−2,−102), slot center | 238×57 |
| Name text | centered in name frame | 220×36, font 18 |
| Description | (−142,−110), book center | 243×90, font 20 |
| Statistical report | (+145,+17), book center | 255×360, font 20, line spacing 1.2 |
| Pin | (−257,+229), book center | 43×102 |
| Congratulations banner | (0,+215), center; bottom pivot | 542×258 |

The fullscreen Image is black with alpha **0.6509804**. `ItemBookGUI` resources.assets PathID **5848** serializes popup animation mode **2**, with the five dialog boolean flags false. Its `CongratulationGUI` is PathID **6998**.

## Animation

- Popup: **300 ms**, scale **0.7 → 1** with OutCubic; alpha is clamped from a **−0.3 → 1** interpolation.
- Celebration: title and sunlight start at zero scale, wait **100 ms**, then grow over **300 ms**. Title uses InOutSinusoidal. Sunlight uses OutBack with overshoot parameter **3**, ending at scale **2**.
- Sunlight consists of four mirrored **247×247** quarter sprites. Native rotation is **−75°/s** in Unity coordinates, mapped to clockwise CSS rotation. After entrance it pulses between scale **2 and 2.5** during the first second of a five-second cycle, using quadratic easing.
- Item tap: a **200 ms** rotation using the serialized four-key Hermite curve and **−10°** native amplitude. PMG samples the recovered curve, converting its rotation direction to screen coordinates.
- Reduced Motion shows the finished artwork without the popup, rotation, pulsing or jiggle. Closing cancels all reveal animations. Delayed reveals check that the save state has not been replaced.

Animation methods: Congratulation coroutine 0x42C490, rotation 0x44B5CC, Dialog popup 0x42D6D8, ItemSlot jiggle 0x432B9C. Browser curves are sampled; the pulse clock starts with the reveal rather than using Unity's global scene-time phase.

## Adaptations and issues

- PMG does not store individual-material total/manual/helper collection counters or per-recipe cumulative MAX counts. Those fields say **Not recorded**. No historical numbers were fabricated and no save schema was changed.
- The native material report's Price is an original integer economy value. PMG retains its current economy and shows **Added value** instead. Its paired potion uses the current recipe name.
- The existing expanded catalog remains available unchanged. This reveal uses the original potion description/bottle note, rather than loading the full expanded catalog into a purchase popup. Longer text scrolls within the recovered page rectangles.
- The book scales to fit desktop and phone viewports. Exact live-APK frame comparison has not been performed.

## Verification

Build/source embedding, UI/enhancement regression and success-upgrade checks passed. Isolated Edge tests verified the actual material purchase and exact coin deduction, underlying upgrade dialog retention, non-material no-popup guard, 500 ms MAX reveal, item jiggle, dismissal and animation cleanup, stale-state cancellation, reduced motion, all **150** material/potion presentations and mobile bounds. No browser exceptions were recorded. No REA, APK, PMG-Unity, balance or save data files were modified.
