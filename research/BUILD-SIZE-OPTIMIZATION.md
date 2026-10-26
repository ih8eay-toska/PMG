# Offline build size optimization — 2026-10-25

The current single-file game was too large for GitHub's ordinary Git file limit. The build has been optimized without removing costumes/content or reducing texture resolution.

| Measurement | Before | After |
| --- | ---: | ---: |
| Playable HTML | 133,547,534 bytes (127.36 MiB) | 101,828,135 bytes (97.11 MiB) |
| Reduction | | 31,719,399 bytes (23.75%) |

## Changes

- The 106 restored PNG wardrobe atlases have verified lossless WebP copies embedded in the generated game. All remain **1024×1024**, with identical decoded RGBA pixels, including RGB under transparent pixels. ICC profiles are retained/verified where present. Existing WebP wardrobe assets are unchanged.
- Original source PNGs, rigs and motions remain untouched. The existing restoration checks still verify all 106 original PNG hashes.
- Original PNG payloads total **50,184,619** bytes; the embedded lossless replacements total **28,813,134** bytes. Removing that binary size also removes its base64 overhead from the HTML.
- Eight repeated CSS images are shared through generated CSS variables, saving approximately **3.22 MB** while preserving the image bytes. The build check resolves those variables before validating the equivalent styles.
- No soundtrack, dialogue, static preview, costume or gameplay feature was removed. The playable result still opens directly as one offline HTML file.

## Rebuilding

Use the existing Python environment, or install the build requirement with `py -m pip install -r source/requirements-build.txt`, then run `py -B source/build.py`.

The first build encodes/verifies the PNG atlases and takes longer. Later builds reuse the SHA-256 keyed cache in **dist/texture-cache/** and recheck decoded pixels. The cache and its verification report are already excluded from Git by the existing `dist/` ignore rule; a fresh clone regenerates them. No generated copies are written into the original asset folders.

The size check in `source/check-build.cjs` now rejects a playable HTML at or above 100 MiB, so future content additions cannot silently reintroduce this specific GitHub blocker. The present headroom is roughly 2.89 MiB; a much larger future wardrobe will require a different distribution arrangement rather than silently lowering image quality.

## GitHub upload distinction

[GitHub's official limits](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github) are **100 MiB per file for ordinary Git pushes** and **25 MiB through the website upload interface**. The optimized file fits the former, so use GitHub Desktop or Git. It still exceeds the website upload limit. GitHub may also warn above 50 MiB.

A read-only audit found **no committed blobs** and **no current working files outside ignored dist/** at or above 100 MiB. The largest committed blob was **59,465,250 bytes**. No history rewrite, commits, LFS changes, push or publishing was performed.

## Verification

- Build/source/data embedding, media mapping, original costume hashes, free equipping, save round trips and presentation checks passed.
- All **106 optimized costumes rendered and animated** on their actual Pio/Tia rigs in an isolated browser, with no browser exceptions.
- The complete game passed desktop/mobile enhancement-particle and item-book checks after style image sharing. All **150 material/potion presentations** still rendered correctly.
- Exact RGBA equality is checked during every build; originals are also checked against their restoration hashes.

Only the build and its checks changed. Economy, saves, the source artwork and Live2D runtimes were preserved.
