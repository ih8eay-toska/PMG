# Pio Live2D

Pio model and motions: https://github.com/fghrsh/live2d_api/tree/master/model/Potion-Maker/Pio
Original model/art rights belong to their creators (Potion Maker / Sinsiroad). The source repository limits model use to research/study and noncommercial use; its MIT code license does not grant rights to the character art. See MODEL-SOURCE.md.

The 48 textures matching the existing wardrobe were converted to lossless WebP. Unmatched costumes retain the existing portrait. The build embeds all runtime and model resources so the game remains usable offline from a local HTML file.

Browser libraries (vendored, no CDN requests during play):
- PixiJS 6.5.10: https://github.com/pixijs/pixijs (MIT)
- pixi-live2d-display 0.4.0, Cubism 2 bundle: https://github.com/guansss/pixi-live2d-display (MIT)
- Legacy Cubism 2 core: https://github.com/dylanNew/live2d/blob/master/webgl/Live2D/lib/live2d.min.js (Live2D proprietary runtime; retain its applicable terms).

Pio renders at 30 FPS and pauses while the page is hidden. A failed WebGL/model load leaves the portrait visible. Success and failure motions play after enhancement attempts.

Tia uses her default outfit from the same model repository (Potion-Maker/Tia), with lossless WebP texture and idle/success/failure motions embedded offline. The character picker uses the existing Slider-characters artwork and remembers Pio/Tia selection in local browser storage under pmg-brewer-character. Pio wardrobe ownership and game progress are shared and preserved when switching.
