# Supplied event dialogue integration

The user's pasted replacement JSON is saved as `data/event-rush-dialogue.json`. All scene text, speakers, portrait keys, titles and ending grades match the supplied data exactly. The original fan-written draft has not been substituted.

Implemented scenes: opening 24 lines; milestone B 12; milestone A 14; No-deliveries ending 11; C ending 11; B ending 10; A ending 11; S ending 16. Total 109. Existing portrait assets for Pio, Tia and Tirami are embedded offline. No new art or narrative text was generated.

The renderer reads supplied scene titles and lines. Exactly one ending is selected using the settled grade; replays never issue rewards. Development notices and unfinished-scene button labels are removed. Collection instructions stay in the gameplay UI; the fictional merchant seals/ledger are not new mechanics, and the story does not equip costumes or summon NPC helpers.

Saved opening positions now accept indices 0–23. Additive `dialogueRevision:1` distinguishes the supplied script from development content. Existing unfinished development openings restart at line zero of the actual script. Existing gathering/packing/break state, deadlines, delivery progress, pending choices and completed reward records are retained. No completed run is restarted or paid again.

Verified in the offline browser: all 109 displayed lines match source text, speaker and portrait; first opening remains untimed through all 24 lines and can reload at line 10; all five endings resolve correctly; milestone read flags and portable saves persist; normal and large-text portrait layouts fit 1366px, 390px and 320px viewports. Existing event presentation and gameplay regressions also pass.

No balance, currency, costume ownership, Tia progression or historical-event hold changes. No commits, pushes or publication. Full real-time event pacing remains untested.
