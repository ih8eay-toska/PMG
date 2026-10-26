Shared menu frame correction

- Retained original artwork; changed shared border slice from 56 to 72 because corner ornaments extend through pixel 68.
- Matched shared paper to the frame baked RGB(237,236,232) background.
- Event title uses existing NewEventIcon.png through the shared title helper, preserving aspect ratio; long title wraps on phones.
- Shared menu check: 25 screens, 100 layouts, navigation and behavior passed; no runtime errors.
- Final title icon check: 45 checks passed; no runtime errors.
- Final build check passed: embedded source current, 565 local media files, no network dependency.
- Visually reviewed event at 1366, 390 and 320 widths and settings at 1366. Original binary assets, gameplay and saves unchanged.
