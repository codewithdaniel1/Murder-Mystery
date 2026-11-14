# The Last Bell at Bramblewick

A first-person browser murder mystery set at a fictional English estate in 1942. This is a playable prototype with an estate art overhaul, NPC routines and recorded environmental sound, built with TypeScript, Three.js and Vite. All source, assets, plans and generated output live in this single project folder.

## Run locally

Use Node.js 22.12 or newer. From this folder:

```sh
npm install
npm run dev
```

Open the Local address printed by Vite (normally http://127.0.0.1:5173). Use a desktop browser with WebGL2 and hardware acceleration. Internet access is needed for the initial dependency installation; the game itself uses bundled local assets and recorded audio without external runtime services.

## Controls

- Mouse: look around. Click the scene to capture the mouse; drag to look if capture is unavailable.
- WASD: walk. Left Shift: brisk walk.
- E: interact with the object or person at the centre reticle.
- Tab: open or close the notebook.
- Escape: leave an interaction or pause exploration.
- Left/right arrow: rotate an inspected object.

Start by walking through the front entrance and speaking to June. Objectives and the notebook map provide directions. The case requires examining clues, listening to accounts and establishing connections in the notebook. An unsupported accusation can be revised without restarting.

## Save

Use **Menu → Save game**. There is one manual browser-local slot; saving replaces it. **Continue investigation** restores the case and player position. There is no autosave. Clearing browser storage or changing the site address loses access to that slot. Saving is temporarily unavailable while the arrival animation runs; resume until the car stops. The event pauses with the game.

## Self-host

```sh
npm run build
npm run preview
```

Publish the contents of `dist/` on a static HTTP(S) server. Relative asset paths support hosting under a subdirectory. No backend, account, API key or paid platform is required. `dist/` is generated output inside this project, not a second source project. Do not open `index.html` directly with a file URL.

## Implemented

- Walkable castle, study, library, service passage, gardens, fountain and greenhouse.
- Seven named NPCs with collision-aware routines, reading/work gestures, state-dependent dialogue topics, conversation interruptions and recorded nonverbal reactions.
- Evidence inspection, 16 notebook entries, five deductions, supported accusation routes and a case ending.
- Pip’s garden walk and an alternative route to translating the ledger.
- Owner/driver arrival after June’s report and a completed gatehouse call; an animated car approach.
- Recorded birds, wind, fountain, fireplace, dog, engine, footsteps and interaction effects, with positional playback and indoor/outdoor mixing.
- Manual save/Continue and rendering-quality controls.

## Current art pass

The estate now has slate roofs and turrets, an arched portico, detailed window surrounds, guttering, chimney stacks, walnut panelling, curtains, chandeliers, patterned rugs and scanned wooden chairs. Eight scanned PBR material sets supply color, normal and roughness detail. Natural HDR sky lighting and screen-space ambient occlusion replace the original flat lighting. Plants and trees are textured scanned models; vegetation is instanced and the tree mesh is simplified for browser rendering. NPCs use textured human meshes with idle and walk animations. Each witness now follows a loop of work stations, with reading, housekeeping, gardening or car-checking gestures. NPCs navigate around walls and furniture, open doors on approach, stop for conversations and resume afterward. NPC walk cadence follows actual travel speed, with acceleration, braking, a shorter blended stride, narrower leg alignment and a turn before changing direction. Actual deformed sole vertices are sampled each frame against the floor, thin rugs, paths and greenhouse slab; skinned-mesh bind transforms are refreshed before contact is evaluated. Work gestures restore their base pose every frame to prevent accumulating arm rotations. Pip’s mesh now has a lightweight four-leg skinning rig with distance-driven trotting, planted stance paws and a smooth return to standing. He follows the detective or Mara using collision-aware paths, waits for closed doors, and no longer teleports to catch up.

The scene uses kinematic collision, not a general rigid-body simulation. The player takes collision-checked substeps around walls, furniture, visible NPCs and the car; NPC routes include nearby people and the car. The arriving vehicle waits if its swept path would reach the player, a witness or Pip. Doorframes, shelves, benches and gate piers have matching solid bounds. Maintained plaster finishes, a detailed longcase clock, planted soil beds and a leafy tree perimeter replace the rough interior and scattered foreground blades.

Low rendering quality disables ambient occlusion and shadows. Pixel ratio is capped, and ambient occlusion uses a reduced resolution. There is a loading screen while the larger art assets load; the total bundled asset set is approximately 79 MiB. The four human model files together total approximately 34 MiB, smaller than the original two-model download. No external asset requests occur at runtime.

## Remaining visual and testing work

This is not a finished photorealistic production game. The cast uses four base human models across seven NPCs, with different hair, clothing colors, fitted glasses and hats. Some faces and silhouettes are still shared. Their civilian clothes need a historically precise WWII costume pass. Some props, the vehicle and interaction hands still use prototype geometry. Pip’s gait is procedural and still needs visual review in motion. The updated library, clock, grounds and character fittings were inspected in rendered Chrome screenshots. Target-laptop performance measurements and a subjective listening review remain outstanding. Recorded nonverbal reactions currently share one performer with modest playback-rate differences. NPC routine positions restart on load; investigation state and player position retain the existing manual save behavior. The latest visual review used an isolated local Chrome session with software WebGL; it does not establish GPU performance on players’ hardware or AAA production quality.

The 30–45 minute play length has not yet been validated. No mobile support or public deployment has been completed.

## Validation

```sh
npm test
npm run build
```

Sixty-three automated tests cover the mystery and save state, all eleven GLB assets and animation rigs, front-wall and internal-door seams, framed passage openings, reachable NPC work stations, collision-safe movement, interrupted routines, continuous ambience, sound attenuation and canceled vocals. Animation regressions exercise both real character rigs for a full minute of repeated poses, rapid interruptions, speed-dependent cadence, dog paw contacts and following around obstacles. Additional regressions check the actual animated shoe geometry of all four human rigs, grounded imported transforms, the library doorway’s furniture clearance, collision against the parked car, interrupted arrivals, and recovery from saves overlapping new solids. The architecture tests construct the same castle geometry without a WebGL renderer and raycast the relevant wall surfaces. Chrome smoke testing verified rendering, entrance navigation, June’s conversation, objective changes, notebook evidence and a save/reload/Continue cycle. The latest isolated Chrome check verified Edition 05’s normal new-case launch, inspected the library, clock, grounds and fitted characters, and simulated two minutes of the full scene: all seven witnesses reached all three work stations. A complete human playthrough and broad device/browser performance testing are still needed.

See `ASSET_CREDITS.md` for texture sources and licenses. `GAME_DESIGN.md`, `CASE_SCRIPT.md` and `PLANNING_CHECKLIST.md` preserve the design; the case script contains spoilers.
