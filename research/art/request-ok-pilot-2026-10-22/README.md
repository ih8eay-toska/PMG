# Request / OK button art pilot — 22 October 2026

Owner-review drafts generated with the built-in image-generation tool and imagegen skill. Recommendation: **charcoal + lavender v2** for PMG's current dark UI. Parchment + rose is the stronger original-game homage.

## Files

| Direction | Blank transparent PNG master | Dimensions | File size |
|---|---|---|---|
| Parchment + rose | parchment-rose-background.png | 2073 × 758 px | 1,155,763 bytes (1.10 MiB) |
| Charcoal + lavender, recommended | charcoal-lavender-background-v2.png | 2172 × 724 px | 765,547 bytes (748 KiB) |

Each master contains one blank button face, without baked-in wording, functional icons or characters. Ornament is limited to the parchment end caps; the selected dark version removes the first version's diamond motifs.

- parchment-rose-mockup.png — desktop and phone Request/OK labels, interaction-state examples and checkerboard alpha preview.
- charcoal-lavender-mockup.png — same review layout for the recommended direction.
- asset-checks.json — measured dimensions, byte sizes, alpha properties and sampled label-area contrast.
- generation-prompts.json — exact generation and revision prompts and reference roles.
- iterations/charcoal-lavender-v1.png — retained superseded first direction-B image, not recommended.

## Reference inspection and size basis

Read AGENTS.md and the imagegen skill and prompting references. Inspected the current source/index.template.html button, dialog and traveler-choice rules and the Request/OK construction in source/app.js. Viewed the archived original assets/references/Succubus_RequestWindow.webp and the owner's supplied dark traveler-order screenshot codex-clipboard-dee97aca-cf86-4eab-86b6-90c245309283.png. The screenshot predates the latest Request/OK layout; the preview follows the current two-column source structure.

Current rules: 700 px desktop dialog, 28 px dialog padding, 1 px borders, 22 px traveler padding, two equal columns separated by 10 px. Each button is 293 × 46 px. At a representative 390 px phone viewport the dialog is 362 px wide and traveler padding drops to 14 px, giving 132 × 46 px buttons. Labels use Segoe UI Semibold 14 px. Phone width is a representative review choice, not a detected user device.

Calculation:
- Desktop: (700 − 2 − 56 − 2 − 44 − 10) / 2 = 293 px.
- Phone: (362 − 2 − 56 − 2 − 28 − 10) / 2 = 132 px.

Browser preview of file:/// was blocked by browser policy. No alternate browser route was attempted. These are static size-accurate compositing mockups derived from CSS, not live browser screenshots or live accessibility verification.

## Readability, scaling and transparency checks

Both outputs are RGBA PNGs with alpha ranging from 0 to 255. Approximately 48.11% of the parchment canvas and 49.95% of the dark canvas is fully transparent. The center is almost opaque (parchment alpha 252–254; dark alpha 254). No checkerboard is baked into the assets. The checkerboard appears only in the review mockups.

The generated masters include generous transparent margins and faint alpha fringe beyond the main silhouette. Visible artwork bounds at alpha >128 are:
- Parchment: x48–2025, y171–579.
- Dark v2: x22–2150, y166–537.

Masters are retained unmodified. For mockup compositing only, the visible artwork bounds were selected with a 2 px safety margin; the shape was scaled to 46 px high, and 20 px end caps were held fixed while only the quiet middle was stretched/compressed horizontally. **Do not directly stretch the full padded master into a button.** A future production export should normalize the transparent bounds, clean the faint edge fringe, and provide a smaller export with documented slice caps. Current master sizes are unnecessarily large for a shipped button.

At native phone size the paper grain stays unobtrusive and rose scrollwork reads as a small border accent, not muddy center texture. Direction B was simplified by removing the projecting diamond ornaments; its border survives narrow scaling more cleanly. Both centers leave room for Request and OK with the font above.

Measured minimum contrast over the central label area of the 132 × 46 px composited normal-state preview:
- Parchment with dark plum #342435 labels: 12.18:1.
- Dark v2 with cream #eee8db labels: 9.69:1.

These measurements apply to the selected center pixels and normal-state label colors; they are not a full application accessibility audit. White inherited text should not be used on the parchment face. Use the dark plum label color there.

## Interaction feasibility

The mockups demonstrate normal, hover (+10% brightness), pressed (−8% brightness and 1 px downward movement), and keyboard-focus states (3 px gold outline, offset from the face). They are review composites, not additional installed runtime assets.

Keep labels as live text, preserve the 46 px click target, and keep a visible focus outline. Press feedback should include position or border change so it does not rely on color alone. The existing helper captions remain useful: Request opens the expedition chapter while OK accepts a potion order. Shared artwork reduces the current color distinction between those two actions, so do not remove those captions without another clarity check.

## Scope

All project writes for this task are inside research/art/request-ok-pilot-2026-10-22/. Generated originals also remain in the tool-managed Codex generated_images location. No gameplay/UI source, data, existing asset or playable HTML was edited. No integration, game build, commit, push or publication was performed. Other pre-existing worktree changes remain outside this art pilot.
