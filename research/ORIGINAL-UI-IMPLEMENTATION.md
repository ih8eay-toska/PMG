# Recovered UI applied to PMG — 2026-10-25

- Pushcat/Blackcat use the recovered body sprites, stand/crouch positions and left-hand geometry. A catch switches poses for 100 ms (`SideboardGUI.UpdatePushcats`, RVA 0x40A424; duration float at 0xA50A5C). Reduced motion keeps the resting pose. Catch mechanics and timers are unchanged.
- Help, Statistics, Save, Event and Visitor Order headings use the original Simple Image title-frame, with separate text and a 45 px logical height. Upgrades has a fixed framed heading and scrolling contents.
- Tirami, Charlotte, Daisy, Demian and Kyle use original body art plus success/failure Face overlays positioned from their quest prefab rectangles. Success is shown during the remake's returning/complete phases; failure during its failed phase. Other visitors retain their original base art. Quest payout, departure and dialog-opening rules remain unchanged.
- Upgrade rows follow original order and use Upgrade Name Frame, Upgrade Grade Frame behind the price, Upgrade Button, Upgrade Button Disabled for MAX, and Upgrade Separator. Responsive text wrapping preserves the remake's descriptions and mastery requirements. Material purchases open the unlocked material in the paired book and play Congratulation.

Source: original APK Unity prefabs and ARM64 code; full evidence is in the local Codex workspace's `original-ui-investigation` folder. Implementation is in `source/app.js`, `source/original-researched-ui.css` and `source/build.py`.

Verification: build/source embedding, UI, helpers, visitors and success-upgrade checks passed. Isolated Edge checks at 1200×900 and 390×844 verified scrolling, purchases, material previews, MAX/affordability, 30 visitor portrait states (ten distinct result overlays), face alignment and cat pose timing. No browser exceptions. No live APK side-by-side comparison was performed; responsive typography and menu dimensions adapt to PMG rather than replacing its entire layout.
