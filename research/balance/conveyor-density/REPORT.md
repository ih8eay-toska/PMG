# Conveyor density update

Material Emission now changes spacing instead of travel speed. At upgrade levels 0, 9 and 19, spacing is 76, 36.54 and 23.17 pixels. Brewing always moves at 76 px/s; empty conveyor gathering stays at 304 px/s. Density applies in both states and in the manual special-drop strip. The existing 4x empty-state special probability divisor remains, keeping empty and brewing nominal special-drop rates equal at each upgrade level. Maximum special-drop throughput is now 3.28 times the old empty-state rate.

Existing upgrades and prices are retained. New spacing takes effect at the entry edge; already visible materials are not rearranged. Narrow adjacent button areas select individual overlapping icons; decorative images ignore pointer events, and hover/focus raises the selected icon. Reduced-motion positions still use the current spacing.

## Progression sample

Sixteen fresh-save sessions and eight later-tier probes passed resource conservation and chest quotas. The same four-seed policies and assumed 500 ms actions/90% catch accuracy as step six were used. Conveyor saving-policy medians: Tia 67.64 minutes (previously 76.35), first wardrobe skin 98.10 minutes (112.76), middle upgrade gap 3.97 minutes (5.10). Manual saving-policy medians: Tia 62.03 minutes, skin 93.95 minutes. These are scripted estimates, not measured mouse performance.

Reproduce with `node research/balance/verify-live.cjs conveyor-density`. Raw runs and source hashes are in progression.json. Historical step-six results remain untouched.

Core tests cover fixed travel speed, density at low/middle/max levels, independent removal, and frame subdivision consistency. UI handler tests cover individual overlapping card selection. Browser visual inspection and actual mouse feel remain unverified because local-file browser access is blocked in this environment.
