# Save screen redesign — 2026-10-26

The former screen placed editable names, manual saves, file transfer, codes, recovery and reset in one long column with equal emphasis.

The new default page presents current-shop/autosave status and three compact snapshots. Empty slots have one create action; filled slots show name, timestamp, gold and Mastery Stars, with Load and Update actions. Naming is expandable and applies on the next snapshot save.

Backup & transfer prioritizes downloading/importing `.pmgsave` files. Save-code tools are collapsed. Recovery separately presents the previous shop and start-over action. The header and page navigation remain visible while the content scrolls on smaller screens. Saving errors change the status styling and explain how to keep a portable backup.

No storage keys, schemas, game balance or save-code formats changed. Existing overwrite/load/import/reset confirmations and backup-before-load behavior remain.

Verified:

- Existing save-file, settings, UI and generated-build checks pass.
- Desktop 1200×900 and mobile 390×844: no horizontal overflow; all pages and content scrolling work.
- Snapshot create/load, cancellation, backup-before-load and recovery work.
- Compressed code round trip and malformed-code handling work.
- Backup download and importing a native browser File from the downloaded content work, including import cancellation.
- Blocked storage disables snapshot creation and manual saving, with visible backup guidance.
- Start-over cancellation preserves current progress.
- No browser exceptions in either interaction run.

Browser QA used isolated temporary profiles. The native operating-system file picker was not automated; the unchanged file-selection handler was tested with a browser File object.
