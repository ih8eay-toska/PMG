# Original settings menu

Read-only evidence: original SettingsGUI prefab (resources.assets PathID 2099), SettingsGUI methods 0x406C70–0x408D14, Settings.Load 0x406904, GameSystem.OnLightModeChanged 0x4A179C, Live2DCharacterBehaviour.OnCharacterSettingsChanged 0x4B3360, CauldronGUI.RefreshBoiling 0x448D6C, EnhancementGUI.OnSellButtonClicked 0x457EE8.

Original menu uses immediate OnOffSwitchGUI controls, a 448×45 title frame, 60-unit row spacing, paired 59/57×43 switch sprites and a circle row marker. Settings setters write PlayerPrefs and notify consumers. No Apply button.

Character activates/deactivates the character object. Light Mode selects 30 rather than 60 FPS and disables boiling; it is not a color theme. Confirm Sell opens SellBox before a sale and defaults off. Native music/sound/voice/character default on; light and confirm default off.

PMG implements music, sound, character visibility, low-power rendering/boiling, sale confirmation, and browser fullscreen. Existing saved audio levels are retained (including muted effects). Music enable state now persists. Preferences remain in pmg-settings-v1, separately from game progress. Low-power rendering preserves elapsed-time gameplay timing; the Live2D ticker uses 30/60 FPS and stops when the character is hidden. Browser fullscreen follows actual fullscreen state and is only requested by a click.

English remains the available language. Android push notifications, Play Games login/achievement synchronization, original support/website actions and automatic credits scrolling are not copied. The native voice handler exists but there is no Voice row in this prefab; no fake voice control was added. Volume sliders, Dark Mode, idle dialogue, dialogue duration and text size now use the same original-style rows. The separate browser-options group and entire Animations section were removed. Existing reduced-motion and shortcut preferences remain compatible internally; system reduced-motion defaults still apply. Debug tools remain separate. Saves remain in Save & backup.

Verification: source preference/dialogue/audio checks; offline build integrity; isolated desktop and 390×844 browser checks of switches, reload persistence, cancel/accept sale, original artwork, character hiding and boiling suppression. Fullscreen requires real browser user activation and is not claimed as headless-tested.
