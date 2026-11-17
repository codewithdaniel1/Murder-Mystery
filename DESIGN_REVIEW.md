# Estate design review — 17 November 2026

## Scope and evidence

Reviewed the existing estate, without expanding the map. Inspected rendered Chrome WebGL views of the front elevation, entrance hall, kitchen, upper gallery, attic storage room, wine vault, garden lodge, fountain garden, orchard paths and gatehouse. Checked source implementations for movement, interactions, lighting, materials and the Casebook. Also inspected the actual Casebook in Chrome: its 50-page Notes editor and 28-person directory are present, the Map tab is absent, and the sampled viewport has no horizontal overflow.

Browser checks confirmed that 15 sampled inspectable objects can actually be targeted from collision-free standing positions, including the upstairs portraits, linen, invitations, attic letters and trunk, lodge documents, gatehouse mail and wine bottle. The sampled estate harness reported no JavaScript errors. Automated checks cover wall/door seams, stairs, routes, NPC animation, held props, saves, story logic and assets.

This is a sampled design review, not certification that every camera angle, animation frame, audio transition or hardware configuration is defect-free. Chrome used software WebGL for screenshots; its frame rate cannot establish performance on a player's GPU. A complete real-time playthrough and listening session on target hardware remains necessary.

## Corrections applied

- Raised the gatehouse chimney above the roof, with a cap and flashing. It previously hung into the occupied room.
- Scaled hip-roof ridge insets to the roof size. The previous fixed inset inverted the shape on narrow dormers.
- Removed low planting placements that overlapped the new side-garden paths and orchard crosswalks.
- Gave above-ground wooden floors a separate matte finish, sharing the existing oak textures. Furniture keeps its existing material. Reduced upstairs gallery lamp intensity to soften harsh pools of glare.
- Made the portrait panel preserve its source-canvas aspect ratio and adjusted its frame border.
- Extended static decoration batching to the cellar's own visibility group. Interactive objects, walls used for occlusion, animated objects and instanced objects remain separate. Cellar decorations still hide with their parent group.

## Validation

All 99 tests and the production build pass. Added regressions for occupied-room clearance under the gatehouse chimney and for cellar batching preserving surface positions, interaction parents and visibility grouping. The build still reports a JavaScript chunk-size advisory (approximately 898 kB minified, 261 kB gzip).

Compared the same software-WebGL camera views before and after batching. The sampled wine-room view fell from 9,881 to 9,281 aggregate draw calls across render passes, about 6%. This is a draw-call reduction, not a frame-rate guarantee. Total scene/render-pass cost remains high and needs profiling before adding substantial new geometry or live lights.

## Recommended priorities

1. **Reduce rendering cost before expanding.** Profile on an integrated-GPU laptop, record frame-time spikes along a fixed route through the hall, garden, lodge and cellar, then optimize the expensive shadow passes, foliage and distant geometry. Add distance-based geometry detail with smooth transitions; keep visible cellar lighting stable. Acceptance: no recurring traversal stalls and consistent frame pacing on the agreed baseline device.
2. **Give rooms distinct compositions.** Upper galleries have large bare wall and floor areas. Use a few deliberate groups: a runner, console table, framed household photographs and a writing corner. Keep door swings, stair landings and investigation sightlines clear. Reuse materials and batch static additions.
3. **Improve the strongest visual weak points.** The vehicle still has a box-like silhouette; several furnishings and stored crates have very plain forms. Replace a small number of prominent props with coherent period models and textures, checking licensing, collision and polygon counts. Prioritize the arrival car, armchairs, desks and bedside furniture.
4. **Improve characters through rigging and animation.** Validate full walk cycles, turns, work poses and dialogue interruptions from front, side and back for every costume. Check below-knee hems, closed waist seams, shoulders, cuffs, headwear and hand-to-prop contact in motion. Use properly fitted meshes and consistent skeletons rather than adding bulky covers to conceal clipping.
5. **Refine gardens through placement.** Keep the existing plant family, add clustered flower color and a few fuller canopy variants, and vary spacing deliberately. Check roots against local ground height and keep paths clear. Prefer instancing and geometry detail levels over adding many independent plants.
6. **Make period details support investigation.** Build short inspectable stories around existing ration books, delivery logs, blackout preparations, household portraits and cellar stores. Give leads follow-up dialogue and a useful notebook entry. More NPCs or more acreage are lower priority than making existing rooms and conversations rewarding.
7. **Validate the complete presentation together.** Run an uninterrupted case on a real GPU, including dog following while running, stairs, the owner arrival, outdoor-to-cellar lighting, ambient sound, both kinds of NPC dialogue and saving personal notes. Check the title, conversation and Casebook layouts at 1280×720 and 1920×1080. The current audit did not complete that full end-to-end session.
