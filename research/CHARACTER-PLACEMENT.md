# Original character framing

Recovered from the local original APK, without modifying REA or its assets:

- `level0` Camera PathID 172: orthographic half-height 6.4, full viewport, zero local camera Y, World parent scale 1.
- `sharedassets0.assets` Live2DModel PathID 1800: Pio local position (0, 0.43856, 0), scale (3.2, 3.2, 1).
- Live2DModel PathID 1799: Tia position (0, 1, 0), scale (3, 3, 1).
- Pio moc PathID 319 is 720 x 621; Tia moc PathID 297 is 800 x 800. SHA-256 hashes match the remake's existing rigs exactly.
- Native `Live2DModel.Start` at RVA 0x4B4B80 builds `Ortho(0, canvasWidth, canvasWidth, 0, near, far)`. `OnRenderObject` at 0x4B4E4C multiplies the object's local-to-world matrix by this canvas matrix.
- `WorldBehaviour.OnCharacterChanged` at 0x426DB4 instantiates under World with `worldPositionStays=false`, retaining prefab-local placement. `ScaleToFit` at 0x426FA4 adjusts only the background, not the character or camera.

At reference height 1280, one world unit projects to 100 pixels. Pio's projection square is 640 wide with top `640 - (3.2 + .43856) * 100 = 276.144`; Tia's is 600 wide, top 240. At other heights these dimensions follow the world camera's fixed vertical span, independently of the UI's Expand scale.

The previous browser controller bottom-aligned Pio's shorter 621-high canvas inside a 420-high render box and applied the archive layout's additional negative center-Y offset. Together these pushed Pio down. The correction uses a square projection based on moc width, zero model origin and neutral web layout, plus each character's recovered world position/scale. Empty space below Pio's shorter canvas is intentional and follows the original projection.

Static portraits reuse the framing rectangle, but their image crop is not a recoverable Live2D projection. Animated costumes share their character's rig and placement. Evidence is in `character-placement-evidence.json` and `character-placement-native.txt`.

Validation uses browser measurements and the original serialized/native data. An original-device screenshot comparison was not available, so animation-pose and device-specific safe-area differences remain outside this check.
