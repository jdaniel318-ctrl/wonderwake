# 0.7.0 — Glowtrail

Added the Lantern Trail: three connected, replayable island routes with bridge fitting, drawn/tapped pathfinding, and lantern reveal/code puzzles. Success animates the explorer and lights a persistent island lantern. The home quest card and map now provide a direct entrance and show the three completed lanterns. Skybridge still opens the original math activities.

One compact puzzle tray holds Undo, Reset, Clue and the next action. Pointer, tap and keyboard paths are available; reduced motion and existing optional sound are honored. Touch cancellation restores both puzzle data and selection. Input-mode changes cancel unfinished gestures safely; keyboard mutations cannot commit an active pointer gesture.

Optional bounded glowtrail progress is preserved in each explorer's local save and checked export. Checkpoints save before success animation; each island awards ten sparks once. No academic mastery is inferred from these puzzles. The existing painting, six-layer renderer, gallery, math and spelling workflows remain available.

New required upload files: wonderwake_quest.js, wonderwake_quest_ui.js and wonderwake_quest.css. No Engine, account, cloud or fleet-authority changes.

# 0.6.0 — Shadecraft

Direct pure-black-to-white grayscale swatches and a 256-value neutral slider. A separate color-intensity control makes lighter tints accessible in the wheel. Preset neutral choices synchronize the gray slider and its Keep action.

A soft shading brush and per-tool 1–100% opacity extend the existing size controls. Up to six layers support name, order, visibility, lock and whole-layer opacity. The eraser clears only its current layer. A separate renderer caches completed layers and composites the live stroke in the correct order. Old, unlayered pictures retain their previous rendering and canonical export shape.

Gallery Edit picture reopens a copy and updates the same saved entry. Starting New paper detaches the edit target and preserves the original; empty intentional edits can be saved. New layer IDs remain valid even after importing high IDs. Original timestamps, including zero, remain intact. Optional layer, stroke-opacity and tool-preference metadata is bounded and verified.

Large fixed paper, safe menu dismissal and existing drawing/gallery limits remain. The new wonderwake_paint.js is required in the upload. No Engine, cloud, fleet authority or deployment changes.

# 0.5.1 — Prism

Colors uses American spelling. The new HSV color wheel, brightness control and hex input add up to 16 custom colors per explorer to the existing palette. Custom swatches persist, export and restore; removal leaves existing artwork unchanged. The dock shows the active color.

Each of Pen, Pencil, Marker and Eraser has a 1–40 size slider with its own remembered setting. Optional paintTools metadata preserves old profile checksums while new exports carry palette and tool preferences. Stroke validation accepts integer widths from 1 to 40.

Outside gestures dismiss the open menu without painting or clicking through. All overlapping contacts remain suppressed until the gesture ends; compatibility clicks are consumed. A pen dismissal on paper also arms the existing finger guard. Menus close with a brief reduced-motion-aware transition. Done replaces the X as an alternative to tapping outside.

The large fixed paper and 2,000-stroke / 50,000-point allowance remain. No Engine, deployment, database name or learner identity changes. New Prism data requires Prism or later; recovery software is not a learner backup.

# 0.5.0 — Openpaper

Paper fills the available studio with a slim fixed header and compact tool dock. Twelve colours, illustrated pen/pencil/marker/eraser controls, four thicknesses, undo and redo. Trays animate over the paper without shifting it; reduced-motion settings are respected. Islands, Save and Gallery remain reachable on tablets and phones, including long learner nicknames.

Up to 2,000 strokes / 50,000 sampled points per picture. Duplicate/subpixel samples are skipped and completed strokes are simplified within a quarter logical pixel. A separate active-stroke layer avoids replaying the whole picture on every move. Optional paper shape and tool metadata preserve appearance through gallery rendering, download and rotation. Old paintings and exports remain accepted without rewriting their canonical data.

Progress exports use compact JSON and support import up to 64 MB. Gallery remains 12 pictures per learner. New expanded paintings require Openpaper or later to read; older builds cannot read all new painting features. No database rename, learner reset, Engine change or deployment.

# 0.4.1 — Steadyhand

Fix painting screen movement: fixed modal navigation header, fitted paper and visible studio controls. A bounded content scroller serves other long dialogs. Resize observer is removed when leaving the paper. Save feedback uses a stable-height row. Existing learner/gallery/export format is unchanged.

# 0.4.0 — Colorwake

Freehand painting, per-learner saved galleries, drawing answers, guided handwriting, prize pictures, comparison operand choices and additional mission animation. See COLORWAKE.md and VERIFY.txt.

# Release record

## 0.3.0 Fernlight — October 29, 2026
Original dinosaur explorer; character picker; constrained, preview-first SVG exchange and learner-owned image stamp; single-pointer/Pencil input guard; versioned resource URLs and script/style integrity attributes. No additional curriculum or server commissioning. Existing 0.2 profiles and exports retained. Black Flag stays at 8.8.20.72 Homeport.

## 0.2.0 Homeport — prior baseline
Independent fleet launch connection, adventure-first entrance, deliberate learner selection and static public ship passport.
