# The Last Bell at Bramblewick

A first-person browser murder mystery set at a fictional English estate in 1942. This is a playable prototype with a second-pass estate art overhaul, built with TypeScript, Three.js and Vite. All source, assets, plans and generated output live in this single project folder.

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
- Seven named NPCs, state-dependent dialogue topics, conversation interruptions and synthesized vocal reactions.
- Evidence inspection, 16 notebook entries, five deductions, supported accusation routes and a case ending.
- Pip’s garden walk and an alternative route to translating the ledger.
- Owner/driver arrival after June’s report and a completed gatehouse call; an animated car approach.
- Spatial synthesized birds, dog and car sounds; footsteps and interaction effects.
- Manual save/Continue and rendering-quality controls.

## Current art pass

The estate now has slate roofs and turrets, an arched portico, detailed window surrounds, guttering, chimney stacks, walnut panelling, curtains, chandeliers, patterned rugs and scanned wooden chairs. Eight scanned PBR material sets supply color, normal and roughness detail. Natural HDR sky lighting and screen-space ambient occlusion replace the original flat lighting. Plants and trees are textured scanned models; vegetation is instanced and the tree mesh is simplified for browser rendering. NPCs use textured human meshes with idle and walk animations. Pip uses a more detailed dog mesh.

Low rendering quality disables ambient occlusion and shadows. Pixel ratio is capped, and ambient occlusion uses a reduced resolution. There is a loading screen while the larger art assets load; the total local asset set is approximately 81 MiB. No external asset requests occur at runtime.

## Remaining visual and testing work

This is not a finished photorealistic production game. The cast currently shares two base human models with different scale and fabric tint. Their civilian clothes need a historically precise WWII costume pass. Some props, the vehicle, interaction hands and dog motion still use prototype geometry or behavior. The updated architecture and lighting require a new in-browser visual review and performance measurements on target laptops. Browser-control tooling became unavailable during this art pass, so the earlier browser smoke test does not validate these new visuals.

The 30–45 minute play length has not yet been validated. No mobile support or public deployment has been completed.

## Validation

```sh
npm test
npm run build
```

Twenty-two automated tests cover arrival prerequisites/idempotence, three valid solution routes, unsupported accusations, deduction prerequisites, save validation/restoration, all eight GLB assets, simplified mesh indices, character scales and animation rigs. Chrome smoke testing verified rendering, entrance navigation, June’s conversation, objective changes, notebook evidence and a save/reload/Continue cycle. A complete human playthrough and broad device/browser performance testing are still needed.

See `ASSET_CREDITS.md` for texture sources and licenses. `GAME_DESIGN.md`, `CASE_SCRIPT.md` and `PLANNING_CHECKLIST.md` preserve the design; the case script contains spoilers.
