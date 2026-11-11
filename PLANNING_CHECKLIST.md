# Planning checklist and decision register

Status: first browser prototype implemented following the user’s coding authorization on November 11, 2026. Three.js, TypeScript and Vite are installed in the canonical project. Free CC0 textures are bundled. No MCP installation, asset purchase or public deployment was performed. README.md records implementation coverage and remaining work.

## Single project folder

The canonical project folder is `/Users/danielpeng/projects/Murder Mystery`. Keep plans, source, assets, and eventual generated build output inside this one project. Do not create another checkout, sibling prototype project, or duplicate source copy for routine development. Internal folders may organize the one project. The old `Murder Mystery Game` folder was removed after its contents and Git metadata were moved here.

## Confirmed direction

- First-person 3D investigation in a castle and its grounds; the player is a WWII-era detective wearing period detective clothing.
- Cozy, mostly lighthearted tone; typical first playthrough 30–45 minutes.
- GTA V-inspired realistic presentation and a lively world, with beautiful pleasant scenery and smooth performance prioritized.
- Browser release for desktop/laptop users first; self-hostable without a required paid platform or runtime service.
- WWII-era historical setting.
- Free art/audio/animation assets initially; any purchase is a separate discussion.
- Contradictory NPC accounts, unfamiliar-language clues, and favors including Pip's walk.
- Nearby dog, bird, car, NPC, and environmental sounds; text dialogue with character-specific nonverbal vocalizations is an accepted first-version route.
- Detailed physical, visual, and audio feedback for every designed interaction.
- Logic-driven story events. The owner's arrival follows investigation, a report to June, and a hall-telephone call; it is no longer unlocked by ten elapsed minutes.
- The curator/steward mystery, financial motive, bronze falcon, and false bell account are accepted.
- The supplied skills and MCP projects may be used when they fit the selected implementation.
- One simple manual Save Game slot with Continue in the same browser.
- NPCs repeat the same current-state reply until an explicit logic condition changes.
- NPC activity stops on interaction; current vocalization and conversational motion stop immediately when interrupted.
- Accessibility-specific settings/defaults are deferred for now.

## Working proposals, not additional user requirements

- Rural Britain in 1942; region and exact year can be adjusted within the confirmed era.
- TypeScript + Three.js with static output as the technical starting point, subject to a representative browser prototype. Godot web export remains an alternative to evaluate if needed.
- First-person hands for doors, objects, pages, evidence presentation, telephone, and Pip's lead.
- Text plus emotionally appropriate murmurs, grunts, sighs, and chuckles; fully spoken dialogue can follow if suitable recordings are available.
- Automatic graphics quality plus Low/Medium/High overrides, sharp notebook text, and no loss of gameplay on lower presets.
- One browser-local state record behind Save Game/Continue; no autosave, multiple slots, cloud save, or export/import in the initial version.

## Remaining decisions and work

| Priority | Item | Next action |
|---|---|---|
| 1 | Representative hardware | Choose named mainstream and weaker laptop baselines; include Apple Silicon and Windows/browser checks where available |
| 2 | Visual reference brief | Define beautiful realistic hall/garden views, NPCs, detective outfit and sleeves/hands, and arrival with material, lighting, period, and readability targets |
| 3 | Free asset candidates | Evaluate environment, characters, hand rig, dog, car, animation, and audio together; record licenses and optimization work |
| 4 | Exact floor plan | Draw room dimensions, doors, crime-route distances, witness sightlines, service exit, and dog loop |
| 5 | Interaction register | Assign full animation/audio/state/cancellation behavior to every authored interactable; section 26 gives the initial contract |
| 6 | Opening experience | Specify the first five minutes and the visible report-to-June/phone objectives |
| 7 | Historical consistency | Check props, currency, clothes, vehicle, telephone, documents, and blackout sightlines against the selected country/year |
| 8 | Browser prototype criteria | Test visuals, movement, hand interaction, text/vocalization, positional sound, progression, and loading on the baseline machines |
| 9 | Hosting integration | Inspect the Haunted House host/setup before choosing final deployment commands, base path, and server configuration |
| 10 | Optional controls | Decide whether controller support and visible body/legs belong in the first release |

No need to ask again about platform, era category, initial asset spending, progression style, core mystery approval, simple saving, repeated NPC replies, interruption stops, detective identity, or accessibility defaults.

## Prototype planning specification

The first small browser scene should contain one representative room, a garden view, one animated NPC, first-person hands, a door/drawer, one inspectable clue, a short text conversation with vocal reactions, and a spatial sound source. A clue/interview/report interaction should queue a simple event once. The next slice adds the full telephone/car arrival and Pip's favor.

Evaluate appearance and responsiveness together. Provisional targets from GAME_DESIGN.md include a 60 fps goal on the selected mainstream machine, a stable 30 fps low-quality target on the weaker baseline, an initial playable transfer near or below 20 MB, and a 10–15 second first-playable goal on a specified 25 Mbps connection. These are targets to measure, not promised results.

Completion criteria:

- The player can understand and complete the investigation actions without author guidance.
- Hand/object contact, NPC motion, and sound support the requested realism.
- Clues stay readable at lower graphics settings.
- Story events follow real prerequisites and remain correct across save/load and interruption.
- Browser focus/cursor/audio behavior is predictable.
- Performance and asset transfer stay within agreed budgets or produce concrete scope/quality adjustments.

## Validation that requires implementation and playtesting

- Whether the realistic appearance is achievable with free candidate assets and the target hardware.
- Whether the short case feels cozy and satisfying and normally takes 30–45 minutes.
- Whether detailed interactions remain pleasant when repeated.
- Whether the logic-driven arrival feels natural and the next action is always clear.
- Whether pathfinding, browser saves, asset loading, and scene interruptions recover reliably.

Automated checks test state and progression. Human first-time testers judge atmosphere, navigation, interaction feel, and clue fairness. The current task remains planning only; these are future validation tasks.

## Decisions that can wait

Final title, optional banter, extra decorative props, additional cases, achievements, localization, fully spoken dialogue, mobile/touch delivery, accessibility-specific defaults/settings, expanded save features, and a release date. The core plan can move to a prototype once the representative hardware, initial asset approach, interaction register, and opening/visual brief are concrete and the user asks to begin implementation.
