# Current checks — 2026-10-25

All existing source/check-*.cjs checks were run individually so a failure did not hide later results.

| Check | Result |
|---|---|
| check-audio.cjs | PASS |
| check-build.cjs | PASS |
| check-commissions.cjs | PASS |
| check-core.cjs | PASS |
| check-economy.cjs | PASS |
| check-enhancement-fx.cjs | PASS |
| check-enhancement.cjs | PASS |
| check-events.cjs | PASS |
| check-expedition-stories.cjs | PASS |
| check-expeditions.cjs | PASS |
| check-helpers.cjs | PASS |
| check-late-balance.cjs | FAIL |
| check-mail.cjs | PASS |
| check-migration.cjs | PASS |
| check-presentation.cjs | PASS |
| check-save-files.cjs | PASS |
| check-settings.cjs | PASS |
| check-storage.cjs | PASS |
| check-success-upgrades.cjs | PASS |
| check-ui.cjs | PASS |
| check-visitors.cjs | PASS |

Raw output: checks.json. The balance failure is not repaired by this documentation/commit task. Browser evidence from the earlier UI pass remains under research/art/apk-ui-layout-2026-10-25; no new runtime gameplay verification was performed here.

Python source/check-assets.py also passed: 1,022 media paths, sizes and SHA-256 hashes verified; non-banner wiki removal and retained historical banners verified.
