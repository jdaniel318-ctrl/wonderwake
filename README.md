# Wonderwake10 — Sparkstep 0.7.1

A movement and transition update for the Lantern Trail. Original explorers now step along accepted routes, fireflies gather behind them, fitted planks sparkle, and a short lantern dissolve connects the puzzles and island celebrations. Skip animation is available during travel. Reduced motion completes these effects immediately.

The explorer stays at START until a drawn route is accepted. The scene keeps the same bounds between puzzles, including on narrow phones. No puzzle rules, reward rules, stored profile schema or drawing-studio controls change in this update.

Start with START_HERE.txt for uploading and three device checks. The new wonderwake_quest_motion.js file is required. Upload all top-level files together so the integrity-checked scripts match. Existing learners, gallery pictures, Glowtrail progress and progress-copy checksums remain compatible.

Architecture: wonderwake_quest.js owns rules and validation; wonderwake_quest_motion.js samples accepted routes by distance; quest UI owns transient movement and scene changes. Optional walking poses reuse the original artwork in world/creative. All static callers keep their existing pose. Animation never decides puzzle success or grants a reward. The app still owns selected-learner identity and checked local saving.

Source, tests and review evidence are included in verification/. recovery/ contains the previous Glowtrail application ZIP. See VERIFY.txt for what was actually tested and the remaining physical Safari/Pencil check. Wonderwake remains a standalone family preview.
