# Wonderwake04 — Colorwake

Start with START_HERE.txt. Release notes: COLORWAKE.md. Verification: VERIFY.txt. The following is retained 0.3 baseline documentation; 0.4 additions take precedence.

# Wonderwake 0.3.0 — Fernlight

An independent Black Flag learning ship. Update only the existing `wonderwake` repository with **Wonderwake03.zip**. Keep Black Flag's `-ikes-wood-signs` repository unchanged. `START_HERE.txt` is the current upload guide.

## New in this release

- **Fern the triceratops:** an original, friendly dinosaur character, available when adding a learner and through **Choose my explorer** for an existing learner. Appears in the island world, quest portrait, learner cards and mathematics/spelling bridge scenes. No skills reset when changing appearance.
- **Explorer picker:** the original princess, trailblazer and robot remain. No new learner is silently created or selected.
- **Artwork workshop (Grown-ups):** download an editable Fern SVG; import a constrained SVG subset; inspect a rendered preview; approve its PNG for the active learner. A checked illustration can be that learner's avatar and their Maker Grove stamp. No original SVG is executed in the live page, sent over the network or stored in a profile.
- **Drawing input guard:** one active pointer; pen use suppresses touch until an explicit finger reset. Finger and mouse drawing still work without a Pencil. Does not claim native hardware palm-rejection validation.
- **Release delivery:** same static site, no service worker. Versioned local resource URLs and Subresource Integrity attributes protect against a mix of old and new script bytes; the existing source inventory remains available for packaging checks.

## Preserved

24 local learner profiles, stable IDs, `blackflag_wonderwake_local_v1`, existing object store and schema-1 progress envelope; separate mathematics and spelling; artwork, preferences and nickname rules. Original curriculum and storage transaction/readback implementation are unchanged. Optional `artwork` stores one bounded PNG and label per learner. Existing exports remain readable; old profiles do not gain empty fields or have their checksums changed automatically.

Existing activities: Skybridge (30 seed mathematics skills); Wordforge (120 words / 12 banks); Letter Trails (52 guides); Maker Grove (pumpkin/tree/robot and new imported-art stamp); Star Glider. This is a pilot with selected K–12 practice, not a complete curriculum, formal assessment or reviewed educational service. See `CURRICULUM_AND_SAFETY.md` for retained content coverage and limitations.

## ArtCraft / VectorCraft resource use

This release follows the reviewed SVG interchange and pen/finger design direction. It does **not** embed or execute VectorCraft, copy its code or bundled assets, start an MCP server, or connect to `artcraft-services`. The parser, pointer policy and dinosaur geometry are original implementation. `CREATIVE_WORKFLOW.md` identifies the official sources consulted, supported subset and exact limits. A browser SVG roundtrip is tested; an export actually produced by a running VectorCraft installation has not been tested here.

## Privacy and boundaries

No external scripts, fonts, textures, application analytics, automatic upload, cloud progress or microphone permissions. Browser speech remains the existing opt-in device/browser feature, with its existing limitations. Imported artwork is decoded locally and saved only after explicit preview approval. Progress files are not encrypted; keep them privately. A shared-family learner picker is **not authenticated child accounts**. The Grown-ups section is not a security gate. Separate GitHub project paths on one hostname are not origin isolation.

Black Flag's launch link and authentication are unchanged. The static ship passport contains only release/capability notes, not live health, learner data or delegated authority. Server commissioning remains pending. This release does not resolve the fleet's paused quota investigation.

## Saving / rollback

Storage errors remain explicit and do not permit overwriting unreadable records. One active game tab per device. Export important progress privately. Old 0.2 software rejects new dinosaur/custom-illustration records, so **do not downgrade after using these features**. No automatic data deletion, migration or rollback is provided. The source package retains the previous release only as reference, not as a recommended live downgrade.

## Verification

From the source-package root run `node --test tests/*.test.cjs`, then `python tests/browser.test.py`, `python tests/multi_learners.test.py`, `python tests/homeport.browser.py`, and `python tests/fernlight.browser.py`.

Browser tests use actual shipped markup, scripts, delegated routes, browser XML/image decoding, Canvas drawing and downloads, with explicitly synthetic IndexedDB and a SHA-256 bridge. Node tests use real WebCrypto for export integrity. Native Safari, Pencil input, real IndexedDB across device restarts and VectorCraft export interoperability still need acceptance. No production deployment, database or account action is performed by the tests.
