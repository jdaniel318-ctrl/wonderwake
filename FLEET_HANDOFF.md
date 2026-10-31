# Wonderwake → Black Flag handoff

Skybloom 0.10.0 is a standalone family preview. This package prepares a return to the fleet; it does not register a vessel, change fleet authority, deploy the engine, or transfer a learner record.

## Concrete launch and return

| Direction | Proposed or existing action | Boundary |
| --- | --- | --- |
| Engine → Wonderwake | An explicit “Wonderwake — family preview” link to `https://jdaniel318-ctrl.github.io/wonderwake/` | Opens the learner chooser. Do not append account, learner, access-token, or progress parameters. Add the engine link only after inspecting its current navigation. |
| Wonderwake → Engine | Existing Grown-ups → Open Black Flag Engine link to `https://jdaniel318-ctrl.github.io/-ikes-wood-signs/` | A new tab with `noopener noreferrer` and no referrer; no learner payload. Engine sign-in remains separate. |
| Ship capabilities → Fleet | Download public ship passport; review `wonderwake_fleet.js` and `FLEET_LESSONS.md` | Metadata only. Review and adopt components deliberately. |
| Learner progress → Backup | Keep a progress copy | Explicit local download; never attach it to a fleet registration or public issue. |

Local checks confirm the outbound link attributes and metadata boundaries. The connected GitHub inspection returned “Unknown tool” during this build, so the current live engine code, inbound navigation and authentication flow were not inspected. The older engine build in the descriptor is now labeled `last_recorded_engine_build`, with `current_engine_verified: false`; it is not a claim about the deployed engine.

## Return sequence and acceptance

1. Finish the three device tests in START_HERE.txt on the deployed Skybloom build. Keep a current progress copy before replacing files. Confirm the release label, not just a cached page.
2. In the current Black Flag source, add or update the explicit preview link, retaining its existing navigation and authentication rules. Verify the deployed link reaches Wonderwake's chooser, and Grown-ups returns to the intended engine. Verify opening and closing either tab leaves the other usable.
3. If server-backed commissioning is desired, use the fleet's current registration and health-check workflow. Verify the registered vessel identity, version, entry URL, owner permissions, authenticated server readback and health evidence. This public passport is not evidence of those checks. Keep `commissioned` and `live_health_verified` false until independently confirmed.
4. Review candidate interaction patterns on one suitable fleet page first. Run that page's regression tests and a device test, then expand only where the pattern improves the activity.

## Isolation and rollback

Wonderwake uses its own IndexedDB database (`blackflag_wonderwake_local_v1`), with validated learner IDs and local profiles. Different repository paths on the same GitHub Pages hostname share an origin; this is not an authenticated isolation boundary. No storage schema or academic reward rules changed in Skybloom. Flight completion increments the current learner's flight count once and does not award math mastery or extra sparks.

Recovery code is `recovery/Wonderwake13-Clearpath.zip`. Restore its complete top-level asset set together; never mix runtime files from two releases. Keep current progress and pictures before rollback. Do not clear browser website data. Recovery contains application code, not learner data.

## Ready versus outstanding

Ready for review: source ZIP, integrity inventory, public descriptor, repeatable tests, recovery code and documented fleet patterns.

Still required: physical iPad/Safari/Pencil acceptance, actual deployment verification, current engine integration inspection and any server commissioning proof. No claim of cloud sync, protected child accounts, complete K–12 coverage or fleet production isolation is made.
