# The Last Bell at Bramblewick

A first-person browser murder mystery set at a fictional English estate in 1942. This is a playable prototype with an estate art overhaul, NPC routines and recorded environmental sound, built with TypeScript, Three.js and Vite. All source, assets, plans and generated output live in this single project folder.

## Run locally

Use Node.js 22.12 or newer. From this folder:

```sh
npm install
npm run dev
```

Open the Local address printed by Vite (normally http://127.0.0.1:5173). Use a desktop browser with WebGL2 and hardware acceleration. Internet access is needed for the initial dependency installation; the game itself uses bundled local assets and synthesized audio without external runtime services.

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

The estate now has slate roofs and turrets, an arched portico, detailed window surrounds, guttering, chimney stacks, walnut panelling, curtains, chandeliers, patterned rugs and scanned wooden chairs. Eight scanned PBR material sets supply color, normal and roughness detail. Natural HDR sky lighting and screen-space ambient occlusion replace the original flat lighting. Plants and trees are textured scanned models; vegetation is instanced and the tree mesh is simplified for browser rendering. NPCs use textured human meshes with idle and walk animations. Each witness now follows a loop of work stations, with reading, housekeeping, gardening or car-checking gestures. NPCs navigate around walls and furniture, open doors on approach, stop for conversations and resume afterward. NPC walk cadence follows actual travel speed, with a shorter blended stride and a turn before changing direction. Work gestures restore their base pose every frame to prevent accumulating arm rotations. Pip’s mesh now has a lightweight four-leg skinning rig with distance-driven trotting, planted stance paws and a smooth return to standing. He follows the detective or Mara using collision-aware paths, waits for closed doors, and no longer teleports to catch up.

Low rendering quality disables ambient occlusion and shadows. Pixel ratio is capped, and ambient occlusion uses a reduced resolution. There is a loading screen while the larger art assets load; the total local asset set is approximately 81 MiB. No external asset requests occur at runtime.

## Remaining visual and testing work

This is not a finished photorealistic production game. The cast currently shares two base human models with different scale and fabric tint. Their civilian clothes need a historically precise WWII costume pass. Some props, the vehicle, interaction hands still use prototype geometry. Pip’s gait is procedural and still needs visual review in motion. The updated architecture, routines and sound mix require an in-browser visual/listening review and performance measurements on target laptops. Recorded nonverbal reactions currently share one performer with modest playback-rate differences. NPC routine positions restart on load; investigation state and player position retain the existing manual save behavior. Browser-control tooling remains unavailable, so the earlier browser smoke test does not validate the new visuals, routines or subjective sound quality.

The 30–45 minute play length has not yet been validated. No mobile support or public deployment has been completed.

## Validation

```sh
npm test
npm run build
```

Forty-nine automated tests cover the mystery and save state, all eight GLB assets and animation rigs, front-wall and internal-door seams, framed passage openings, reachable NPC work stations, collision-safe movement, interrupted routines, continuous ambience, sound attenuation and canceled vocals. Animation regressions exercise both real character rigs for a full minute of repeated poses, rapid interruptions, speed-dependent cadence, dog paw contacts and following around obstacles. The architecture tests construct the same castle geometry without a WebGL renderer and raycast the relevant wall surfaces. Chrome smoke testing verified rendering, entrance navigation, June’s conversation, objective changes, notebook evidence and a save/reload/Continue cycle. A complete human playthrough and broad device/browser performance testing are still needed.

See `ASSET_CREDITS.md` for texture sources and licenses. `GAME_DESIGN.md`, `CASE_SCRIPT.md` and `PLANNING_CHECKLIST.md` preserve the design; the case script contains spoilers.
