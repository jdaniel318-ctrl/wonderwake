# Wonderwake09 — Glowtrail 0.7.0

A connected, untimed Lantern Trail adventure built from Wonderwake's touch, drawing, layering and saved-progress lessons. Start with START_HERE.txt for uploading and the next three device checks.

Three island routes each combine Bridge Bay (fit countable planks), Firefly Trail (draw or tap a safe route), and Lantern Hollow (move a light through a dark layer and match a discovered symbol code). The explorer walks the completed path and the island lantern lights up. One contextual tray exposes Undo, Reset, Clue and the current action. Clues are optional; there are no timers or lives. Each island awards ten sparks once. Existing academic skill records are not altered by puzzle play.

Committed actions and puzzle checkpoints are kept with the selected explorer. Wait for the checked-save message before closing or refreshing. Partial quests survive a progress export; a failed local save keeps current work available in the page for export. Existing profile shapes and checksums remain unchanged when no optional glowtrail field is present.

The rule engine lives in wonderwake_quest.js; drawing/input and scene lifecycle live in wonderwake_quest_ui.js; responsive layout lives in wonderwake_quest.css. Core validates the bounded optional state, and app integration owns learner identity, reward and checked saving. The existing studio renderer and painting tools remain unchanged. All visuals are original Canvas/HTML/SVG code using the existing character art; no new remote dependency.

See VERIFY.txt, verification/RESULTS.json and verification/REVIEW.txt for evidence and limitations. This package does not deploy or commission Wonderwake into the fleet. New quest metadata requires Glowtrail or later. recovery/ contains the previous application ZIP, not learner records.
