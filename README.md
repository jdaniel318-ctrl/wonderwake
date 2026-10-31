# Wonderwake07 — Prism 0.5.1

A refinement of the independent Wonderwake drawing studio. Start with START_HERE.txt for the existing GitHub Pages upload workflow.

Colors replaces Colour on the dock. A color wheel, brightness slider and optional hex entry add up to 16 custom swatches to the existing palette for each explorer. The selected color appears on the dock. The 12 default colors stay available. Swatches can be removed without changing artwork.

Pen, Pencil, Marker and Eraser each remember their own size from a continuous 1–40 slider. Tool settings are stored with the selected explorer and included in progress exports. Selecting a color while Eraser is active returns to Pen.

A tap or drag outside a menu dismisses it without drawing or activating the control underneath. Overlapping fingers belong to that same closing gesture until they all lift. The following gesture draws. Menus animate briefly and honor reduced motion; Done and Escape remain accessible alternatives. The paper, fixed header and compact dock keep their positions.

The larger paper, 2,000 strokes / 50,000 sampled points per painting, undo/redo and 12 pictures per learner remain. Existing learners, pictures and progress exports are accepted. New Prism variable widths and palette settings require Prism or later to read. Save or download before leaving an unfinished paper.

Progress remains in the existing local IndexedDB database. No server sync, new account, fleet authority or commissioning is added. Fleet lessons are documented as candidates for later review. The currently deployed game changes only when the user uploads this package.

Details: CHANGELOG.md. Verification and physical-device limitations: VERIFY.txt. Learning behavior: COLORWAKE.md. Learner workflow: LEARNERS.md. Static vessel metadata: WONDERWAKE_VESSEL.json. Test sources: verification/.

Keep a progress export before updating; do not clear website data. recovery/ contains the previous application only, not learner records.
