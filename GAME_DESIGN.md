# The Last Bell at Bramblewick — game design draft

Implementation authorized by the user on November 11, 2026. The first browser prototype is now implemented with Three.js, TypeScript and Vite. This document preserves the wider design target; see README.md for the implemented scope, validation and remaining work.

## 1. Status and design target

Confirmed by the player/designer:

- A murder mystery set inside a castle and on its outside grounds.
- First-person 3D exploration.
- GTA V as the reference for realistic visuals and a lively world, while retaining first-person exploration. This supersedes the earlier stylized-art proposal.
- A cozy, mostly lighthearted tone.
- A typical first playthrough of 30–45 minutes.
- NPC conversations, including contradictory accounts.
- Evidence in an unfamiliar language, with an NPC able to interpret it after a favor such as walking their dog.
- Browser delivery for desktop/laptop computers first, with self-hosting and no required paid service.
- A historical WWII-era setting.
- The best coherent visual quality achievable while maintaining a smooth browser experience; free assets initially, with purchases discussed separately.
- Positional environmental sounds and audible NPC reactions. Text dialogue with character-specific nonverbal vocalizations is an accepted route.
- Detailed presentation for every designed interaction, including physical response, animation, sound, and persistent state.
- Major story events triggered by investigation logic and player actions. The owner's arrival is no longer tied to ten elapsed minutes.
- Approval of the proposed curator/steward mystery, financial motive, bronze falcon, and false bell account.
- The player is a detective of the era, dressed accordingly; beautiful, realistic scenery and a pleasant atmosphere are central to the presentation.
- One simple manual in-game save slot with Continue.
- NPC replies remain the same until a relevant logic condition changes.
- NPC activity/voice/gesture stops when interaction is interrupted.
- Accessibility-specific settings and defaults are deferred for now.
- Planning only at this stage.

The core mystery and the requirements above are confirmed. The title, exact country/year, names, detailed event conditions, map dimensions, engine, performance budgets, and individual presentation choices remain design proposals. The 30–45 minute target is a playtesting target, not a guaranteed duration for every player. Updated November 11, 2026; logic-driven progression supersedes the earlier minute-by-minute event schedule.

High concept: As a period detective, explore a beautiful, warmly lit castle estate after the discovery of a murder. Piece together a small household's competing stories while its evening continues around you. Help a guest walk her dog, decipher a peculiar ledger, witness a late arrival, and explain who killed the curator and why.

The design should make the player feel observant, curious, and socially resourceful. It should not require fast reflexes or external knowledge of forensic science.

## 2. Design pillars and boundaries

1. **A place worth exploring.** A compact estate with distinctive rooms, readable landmarks, and useful connections between indoors and outdoors.
2. **People with lives and secrets.** NPCs move, react to events, and withhold information for specific reasons. Most secrets are embarrassing rather than murderous.
3. **Fair deduction.** Every required conclusion has support in discoverable evidence. The solution does not depend on guessing what the writer intended.
4. **Useful kindness.** Favors reveal character and create opportunities to investigate. They are short and connected to the case.
5. **An evening that responds.** Investigation milestones and explicit player actions trigger arrivals and meetings. NPCs carry out their routines between those events.
6. **Cozy suspense.** Warm interiors, gentle humor, a memorable dog, and a respectful treatment of the victim. No gore, combat, chase sequences, or jump scares in the proposed first case.

Out of scope for the first case: multiplayer, procedural killers, combat, survival mechanics, hunger, a day/night cycle spanning multiple days, an open-world village, crafting, fully simulated crowds, and unrestricted AI-generated testimony.

Replay value comes from catching missed scenes, choosing a different investigation route, and understanding earlier lies. Once solved, the same case will not provide a genuinely new whodunit; additional cases would be a later content expansion.

## 3. Player role and opening

You are a detective of the WWII era, wearing period detective clothing. Working backstory: Beatrice asked you to look into concerns about the castle's collection and accounts; you arrive shortly after Elias is found dead. The household recognizes why you are investigating while the local constable is on the way.

Proposed outfit: a tailored wool coat over a shirt, tie, and waistcoat, practical leather shoes, and an optional brimmed hat. In first person, the coat sleeves/cuffs and hands establish the character during object interactions. A full visible body is still a separate presentation decision; the detective identity and period clothing are confirmed.

The game begins shortly after the curator, Elias Vale, has been found dead in the study. June, the housekeeper, asks you to help make sense of the household's accounts while the constable travels to the estate. The victim is covered; the player investigates nearby objects and traces without graphic examination.

Opening objectives:

- Speak to June in the entrance hall.
- Inspect the study.
- Ask someone about the evening's bell.

The first useful clue should appear within roughly two minutes. The player should encounter their first understandable contradiction within roughly five minutes.

The household's immediate behavior stays believable: people are unsettled, staff keep the estate functioning, and guests are asked to remain nearby. Humor comes from personalities and social awkwardness, not from mocking the death.

## 4. Proposed setting and visual identity

Bramblewick Castle is an old family estate with a manageable occupied wing and enclosed garden. The unused wings are visibly closed for restoration. This explains why a castle can have a compact playable footprint.

The setting is now confirmed as WWII era. Working art/story choice: a fictional rural British castle estate in 1942. The exact country and year are still proposed. Period clothes, paper records, a household telephone, a wireless set, and a period motorcar establish the era; the case remains a civilian household mystery.

For the British proposal, use blackout curtains and screened interior lighting. Ada's last sighting of Elias is specifically as he draws the study curtains, so the later closed window does not invalidate her account. The National Archives documents the wartime requirement to screen light escaping from windows and other openings. [Historical reference](https://www.nationalarchives.gov.uk/education/resources/home-front-1939-1945-part-one/?show=all). Keep the garden readable through art-directed ambient light; do not require players to navigate unusable darkness. Props, notices, vehicle details, and money receive a period-consistency pass before final art. Financial amounts are fictional plot figures, now denominated in pounds for this proposed location.

Visual direction:

- Realistic human and architectural proportions, grounded materials, and natural lighting, using GTA V as the user's visual reference. Exact visual quality remains subject to an art sample and target-hardware testing.
- Detailed stone, timber, fabric, metal, glass, and foliage that remain consistent across rooms and characters.
- Beautiful, realistic scenery: honey-colored stone, warm amber lamps, carefully tended gardens, natural foliage, attractive views, and burgundy upholstery. The estate should feel pleasant to inhabit throughout the investigation.
- Clear object silhouettes and restrained decorative clutter near evidence.
- Soft outdoor drizzle and comfortable interiors rather than horror darkness.
- A small number of memorable character silhouettes and outfits.
- Natural walking, turning, eye contact, and visible household activities support the sense of a living estate.
- Clues remain legible on an ordinary display without pixel hunting.

The player can inspect larger versions of letters and objects. Every important written prop also has a readable text view.

## 5. Estate layout

Design the main route as a loop with two useful shortcuts. A player should usually reach a known destination in 15–40 seconds. These are layout targets to test, not fixed dimensions.

```text
                      FRONT DRIVE / ARRIVAL
                               |
                         ENTRANCE HALL
                         /     |     \
                      STUDY  LIBRARY  DRAWING ROOM
                        |       |          |
                  SERVICE PASSAGE ---- KITCHEN
                        |                  |
                    ROOK'S OFFICE     GARDEN TERRACE
                                           |
                                GARDEN LOOP / GREENHOUSE
```

The bell mechanism is a small, visible service alcove off the passage, not a separate tower level. The tower is visible from outdoors, but a climbable tower is unnecessary for this short case.

| Area | Purpose | Distinguishing feature |
|---|---|---|
| Entrance hall | Orientation, arrivals, final accusation | Grand clock and colored floor runner |
| Study | Crime scene, victim's work | Green desk lamp and covered chair |
| Library | Translation reference, scholar's base | Tall blue shelves and rolling ladder dressing |
| Drawing room | Social conversations, owner's base | Fireplace and yellow settee |
| Kitchen | Staff account, useful overhearing | Warm range and herb bundles |
| Service passage / office alcove | Alibi contradiction and weapon provenance | Exposed bell mechanism and brass trophies |
| Front drive | Car arrival and driver | Stone gateposts and gravel turnaround |
| Garden / greenhouse | Dog favor and concealed evidence | Circular path, fountain, distinctive glass roof |

The greenhouse is a small endpoint within the garden area. The office is a small room off the passage. A separate service exit links the passage directly to the greenhouse side of the garden, outside the kitchen's sightline; include this shortcut in the detailed floor plan even though the simplified diagram omits it. Treat these as compact spaces, not invitations to add full extra wings.

Navigation rules:

- Every important area has a visible sign, landmark, or both.
- The garden route loops back instead of ending in a long return walk.
- Doors cannot trap the player or require precision positioning.
- NPCs can pass the player in corridors.
- The driveway's car route is separated from the pedestrian approach with a curb or gate.
- Decorative doors visibly communicate that they are outside the playable wing.
- A simple illustrated estate map becomes available immediately in the notebook.

## 6. Cast and what each person contributes

There are five resident/guest suspects initially, followed by the owner and driver. Seven principal on-estate speaking NPCs is the proposed ceiling, not a requirement to give all seven equal dialogue volume. A short telephone reply from the off-screen gatehouse operator is a functional exchange, not an additional suspect or full NPC.

| Character | Role and personality | What they want | Secret / investigation role |
|---|---|---|---|
| Edmund Rook | Steward; precise and professionally helpful | Preserve his reputation and control the household's account | Killer; diverted restoration money and invents a bell-tower alibi |
| June Bell | Housekeeper; practical, dry humor | Protect staff and prevent a scandal | Altered a household inventory to hide an accidental breakage; key witness |
| Ada Ashcombe | Owner's niece; artistic and impatient | Stop the proposed sale of family objects | Argued with Elias about the sale; initially looks strongly motivated |
| Tomas Reed | Gardener; shy, proud of his plants | Keep the greenhouse project alive | Uses estate supplies for an unauthorized rare-plant hobby; conceals garden activity |
| Dr. Mara Voss | Visiting scholar; witty, protective of her dog | Keep Pip comfortable and finish her archival work | Can interpret Avellic ledger terminology; a demanding but friendly witness |
| Lady Beatrice Ashcombe | Owner; arrives after the gatehouse call | Understand the death and the estate's finances | Has quietly considered selling part of the collection; arrival changes access and conversations |
| Jonah Pike | Driver; observant and understated | Finish a difficult evening without being blamed | Describes the owner's journey and an earlier delivery; supporting witness |

Victim: Elias Vale, curator and cataloguer. He discovered suspicious accounts and intended to discuss them with Beatrice that evening. Optional personal details should make him a person: he repaired a music box for Ada, remembered June's birthday, and had a fussy but affectionate correspondence with Mara.

Dog: Pip, a small terrier. Pip has no health bar and cannot be hurt or permanently lost. His behavior creates a clue opportunity rather than independently identifying the murderer.

NPC knowledge has limits. A person can describe what they saw or heard, repeat a rumor with attribution, infer something, or lie. They cannot know a private event merely because it occurred in the global game state.

## 7. Writer-only solution: the fixed truth

The user has accepted this core solution. This section is the canonical working account; wording and period details can still be refined. The game never reveals it wholesale before the ending.

- **Killer:** Edmund Rook.
- **Victim:** Elias Vale.
- **Motive:** Elias discovered that Rook diverted restoration funds to himself and intended to show Beatrice supporting records.
- **Method:** Rook struck Elias with a heavy bronze falcon ornament normally displayed in Rook's office. The act is never shown graphically.
- **Opportunity:** Rook entered the study through the service route during the short interval before the body was discovered.
- **Concealment:** He hid the ornament beneath loose potting material in the greenhouse, returned toward the household rooms, and claimed to have been manually ringing the tower bell.
- **Mistake:** The bell's manual rope had been removed for repairs; the evening chime came from its automatic mechanism. His invented activity can be disproved. Physical evidence and financial records must still connect him to the crime; a false alibi alone is insufficient.

### Historical timeline, before gameplay

| Story time | Ground truth |
|---|---|
| 20:10 | Elias finishes comparing the restoration ledger with receipts. |
| 20:15 | June cleans the service latch, leaving it free of fabric or debris. |
| 20:20 | Ada argues with Elias about the collection sale, then leaves. |
| 20:24 | Ada and Mara settle on the terrace; Tomas works in the garden in their view. |
| 20:25 | Elias is last seen alive at his study window as he draws the blackout curtains. |
| 20:26 | June sees Rook enter the service passage. She does not see him enter the study. |
| About 20:28 | Rook kills Elias in the study. June hears a heavy impact but cannot identify its cause. |
| About 20:29 | Rook leaves through the service route; his distinctive jacket lining catches on the latch. |
| 20:30 | The automatic bell chimes. Rook later claims he rang it manually. |
| 20:31 | June discovers the body. The reasonable initial death window is 20:25–20:31, not an exact medically established minute. |
| 20:32–20:34 | As attention turns to the study, Rook conceals the falcon in the greenhouse. The terrace witnesses have gone indoors by then. |
| 20:40 | The player takes control. |
| During investigation | Beatrice arrives with Jonah after the player completes the gatehouse call; there is no predetermined arrival minute. |

Before scripting, validate the distances and sightlines against this timeline. If the route cannot physically be walked in the allotted time, revise the map or timeline rather than accepting a contradiction.

Beatrice's late arrival is not, by itself, proof that she could not have committed a crime earlier. Jonah's account and travel records support her earlier whereabouts. The case must not ask the player to make the invalid inference that arriving late automatically clears her.

### Main deductions

1. The bell story is false: Rook claims a manual action that the mechanism could not perform that evening.
2. Rook recently used the service route: June's observation and the snagged lining contradict his denial of recent use.
3. The concealed falcon connects the crime scene to his office: a broken ornament piece at the scene fits the recovered falcon; its engraving matches the office display record.
4. Rook had a specific financial motive: the ledger's true meaning and payment records show personal diversion of restoration funds.

These are converging lines of evidence. The falcon being his possession does not alone prove he wielded it, and the lining is a narrative physical match rather than an invented claim of infallible forensic testing.

## 8. Clue register and alternative routes

The target is roughly twelve core evidence entries plus four to six optional details. A numbered entry can contain a short document or a small pair of linked observations, but should have a single clear purpose.

| ID | Evidence | Where / how acquired | Supports |
|---|---|---|---|
| C01 | Broken bronze talon | Inspect the study rug near the desk | A damaged bronze object was involved |
| C02 | Elias's unfinished note: accounts must be shown to Beatrice | Study desk | Financial motive and reason to question the owner |
| C03 | Rook's statement that he rang the bell manually | Ask Rook about the relevant interval | Explicit alibi claim |
| C04 | Disconnected manual rope and dated repair notice | Service bell alcove | The claimed manual ringing was impossible |
| C05 | June's sighting of Rook entering the passage | Ask June about movements, optionally show the alibi | Opportunity and contradiction |
| C06 | Fresh snag of distinctive lining, plus June's cleaning time | Service latch; compare through examination and conversation | Recent passage use and link to Rook's jacket |
| C07 | Falcon display label / old inventory illustration | Rook's office display | Provenance of the missing ornament |
| C08 | Concealed bronze falcon with missing talon | Greenhouse discovery | Physical link to C01 and C07 |
| C09 | Avellic ledger annotation | Study ledger | Meaning initially uncertain; requires interpretation |
| C10 | Correct interpretation and corresponding receipts | Mara's help OR library reference plus receipts | Funds went to Rook personally rather than to restoration work |
| C11 | Terrace accounts and Ada's explanation of the argument | Ada, Mara, Tomas | Distinguish the collection dispute from the financial crime |
| C12 | Owner/driver account and delivery/travel documents | Available after arrival | Context for the ledger, the planned meeting, and earlier whereabouts |

Optional details: June's broken vase, Tomas's plant hobby, a note about Elias's repaired music box, an overheard request by Rook for June to keep quiet, Pip's toy, and the estate's proposed sale catalogue.

### Evidence access rules

- The study, common rooms, garden path, and bell alcove are accessible from the opening.
- Rook's small office can be inspected by asking him; his desire to appear helpful makes this possible without a favor. Beatrice can authorize access later if the player has antagonized him.
- The greenhouse begins latched. Tomas provides access if asked about the garden; Beatrice provides a second permission route after arrival. Pip can reveal the hiding location from outside a low open vent, but recovering the object uses a door and normal interaction.
- Every essential physical clue persists. Neither rain nor a scheduled event destroys the only copy.
- The falcon can be found by following Pip, investigating a visible disturbed potting tray, or asking Tomas about disturbance. The dog route is rewarding but not mandatory.
- The ledger can be understood through Mara or an in-world reference accessible after Beatrice's arrival. The reference puzzle requires no real-world language knowledge.
- If June misses her scheduled conversation, she can still give her essential account later. The overheard version adds tone and optional detail.

Alternative routes should overlap in conclusion but feel distinct in play. Do not make three identical documents that simply repeat the answer.

## 9. Language puzzle and Pip's walk

Use one small fictional language, Avellic, represented by a consistent short vocabulary and a handful of repeated symbols. The puzzle concerns the meaning of an accounting annotation, not translation of a full unfamiliar alphabet.

Rook loosely describes the annotation as an approved restoration payment. The real wording records money received personally by the steward. Paired records show a 60-pound supplier invoice, a 180-pound estate claim, and the remaining 120 paid personally to Rook. The financial inference comes from interpreting the annotation alongside the documents; knowing one translated word is not enough by itself.

Mara can explain the wording, but first asks the player to give Pip a short garden walk because she needs a few minutes to compose herself and finish checking a reference. She knows the ledger is relevant but does not yet know it establishes a murder motive. Avoid portraying her as knowingly withholding urgent proof of a killer merely to demand a favor.

Walk flow:

1. Accept the request; a short objective names the garden circuit.
2. Pip follows the player to the terrace.
3. Visit the fountain and the greenhouse corner, visible landmarks on one loop.
4. Pip pauses and sniffs at the vent near the disturbed tray.
5. The player notices the disturbance and can inspect it or return later.
6. Bring Pip back to Mara; she interprets the annotation.

Target duration: two to three minutes of movement and brief interactions, counted within the overall game target. No repeated laps, hidden waypoint counting, mandatory fetch collectibles, or dexterity leash controls.

Reliability rules:

- Pip uses authored path points with follow behavior, not a physically simulated tether.
- Pip waits at a safe reachable point if separated.
- An off-camera recovery can return Pip to the last reachable point if stuck.
- Leaving to investigate another room does not fail the favor.
- Pip cannot enter the road while the car is moving.
- Returning after the required landmarks completes the favor once; repeated interactions cannot duplicate rewards.
- If the player declines, Mara stays conversational. The reference route remains available.

Optional translation interface: show the original annotation beside the interpretation and attribute the interpretation to its source. A translated claim is not automatically elevated to verified truth just because an NPC said it.

## 10. Contradictions and dialogue

Conversations use selectable topics and short authored responses. This is the proposed initial design because evidence consistency is central to the game.

Available topic families:

- What happened?
- Where were you?
- Ask about a person.
- Ask about a discovered clue.
- Present evidence.
- Help with a small request.
- Return to a disputed statement.

Examples of different kinds of contradiction:

| Pair of claims | Explanation | Gameplay purpose |
|---|---|---|
| Rook says he rang the bell; the mechanism cannot be rung manually | Deliberate false alibi | Core deduction |
| Ada says she did not threaten Elias; June heard raised voices | Ada argued about selling objects and is minimizing it | Strong suspicion with an innocent explanation |
| Tomas says nobody used the greenhouse; the tray is disturbed | He was protecting his unauthorized plants and did not watch every entrance | Establish limited knowledge and a non-murder secret |
| June says the inventory is accurate; an old list differs | She concealed an accidental breakage | Show that dishonesty does not automatically imply murder |

Do not count imprecision as a lie. If someone says “after the bell,” preserve that wording until the player establishes which event they mean. Avoid multiplying clock tricks in the first case; one bell-related deception is sufficient.

Presentation flow for the main alibi:

1. Hear and record Rook's claim.
2. Inspect the disabled manual mechanism.
3. Notebook offers the option to connect those two entries.
4. Player chooses a plain-language explanation: “The bell rang automatically; he could not have rung it by hand.”
5. A new challenge topic appears when speaking to Rook.
6. Rook tries to reframe his statement; his response is recorded separately rather than overwriting the original.

NPC state tracks specific facts such as favor completed, evidence shown, and contradiction challenged. For the same topic in the same relevant state, the NPC gives the same authored reply. A reply changes only when an explicit prerequisite becomes true; repeated questioning or waiting alone does not produce new information. Use the most specific eligible response, with deterministic priority if several conditions are true. Avoid a numerical relationship system or random repeated-topic variants.

When the player starts a conversation, the NPC stops their current movement/activity and turns toward the player. On interruption, the NPC immediately stops the current vocalization and conversational gesture and settles into idle. While paused, they stay stopped. After control resumes and the interaction ends, they may resume their scheduled activity. Reopening the topic gives the same current-state response; already-recorded information remains, and uncompleted event effects are not granted.

Social choices can change warmth, optional confessions, and ending lines. They cannot permanently remove all access to a required clue. A rude question might cause a temporary refusal with another route, rather than a lost campaign.

## 11. Logic-driven progression and target pacing

Major events now depend on established facts and deliberate player actions. This replaces the earlier 4/10/14/18/21/25-minute schedule. Short animation durations, ambient sound intervals, and navigation still use simulation time; they do not decide when the story advances.

Keep three concepts separate:

- **Historical evidence:** the crime's fixed 20:10–20:40 chronology remains available in statements and documents.
- **Investigation progress:** milestones such as finding a study clue, reporting to June, or calling the gatehouse control the present story.
- **Actual session duration:** 30–45 minutes is a pacing target measured in playtests, with no deadline or automatic failure.

### Owner arrival: explicit action chain

1. Complete June's opening conversation.
2. Inspect any core study lead: the bronze fragment, unfinished note, or financial papers. All are available immediately.
3. Question at least one other resident/guest about the case. Rook, Ada, Tomas, and Mara each have an eligible case topic; taking Pip for a walk is not required.
4. Return to June and select “Report what I've found.” She asks you to telephone the gatehouse and have Beatrice brought to the front entrance.
5. Use the hall telephone. The gatehouse operator replies that Beatrice's car has reached the lower drive and will be sent up.
6. After the call ends and the player leaves any reading/menu interaction, cue the approaching engine and start the arrival sequence. A brief physical approach is part of the scene, not a ten-minute unlock timer.

The notebook shows the current next action at each step. The player is never expected to guess a hidden evidence count. June's report topic remains available regardless of courtesy choices. The phone always gives a meaningful response; before the report it offers to leave a message, without consuming the later call or permanently advancing the arrival.

The exact arrival condition is: opening complete AND at least one eligible study lead recorded AND at least one eligible interview completed AND June's report completed AND the gatehouse call completed. Every prerequisite is reachable before Beatrice arrives. The alternate library translation, office permission fallback, and final presentation may depend on her arrival, but nothing needed to trigger the arrival depends on them.

### Other event rules

| Event | Trigger | Presentation and recovery |
|---|---|---|
| Staff exchange | Player has inspected a study lead and returns near the kitchen | A brief June/Tomas exchange; their essential accounts remain repeatable |
| Owner arrival | Complete the report-and-telephone chain above | Engine cue and driveway scene; Beatrice and Jonah remain available if unseen |
| Owner roaming | Arrival greeting is complete and player ends the first owner conversation | Beatrice checks the study, then settles in the drawing room; she remains interruptible for questions |
| Scholar relocation | Dog favor finishes, or player declines it and learns the reference-book route; arrival has completed | Mara mentions moving indoors; an active dog favor reserves her location until a safe transition |
| Drizzle | Arrival is complete and player has visited the garden, at the next safe outdoor transition | Gradual weather change; clues remain recoverable |
| Rook pressures June | Arrival is complete and player challenges the bell account OR presents the suspicious financial papers to Rook | Queue the meeting after participants are free; later June can report the request |
| Final invitation | Owner has been introduced and player has established the weapon and financial deductions | June offers to assemble the household; the player may continue gathering connection evidence |
| Supported conclusion | Owner is present and the player chooses to present an accepted evidence bundle | Begin the ending; no wait for an arbitrary late-game minute |

For Rook's meeting, the parentheses are arrival complete AND (bell challenged OR financial papers presented to Rook). Public story progress does not give Rook knowledge of documents he has not been shown.

A pacing budget to test: opening and first evidence 4–6 minutes; early interviews and report/call 5–8; garden, translation, and owner interviews 10–14; deductions and follow-up 7–10; ending 3–5. Routes overlap differently; the intended total is approximately 29–43 minutes. Fast and completionist players can fall outside the typical range.

Reading, dialogue, pause menus, and loss of browser focus pause scene movement. Completing an interaction can make an event eligible, but the event starts only at a safe transition. Waiting on a bench does not manufacture clues or satisfy missing story prerequisites. A “Let the car pull up” option may finish an already-triggered approach, with the same completed state as watching it.

## 12. Event and NPC scheduling behavior

NPCs follow phase-based routines and short ambient activities. Investigation events select the current phase; locomotion and activity animations play out within it.

| NPC | Opening | After arrival | Late investigation |
|---|---|---|---|
| Rook | Hall / office | Drawing room greeting, then office | Brief June meeting, then hall |
| June | Hall / kitchen | Greets owner | Service passage meeting, then kitchen |
| Ada | Drawing room / terrace | Speaks with Beatrice | Drawing room |
| Tomas | Garden | Briefly near front path | Garden shelter |
| Mara | Library | Moves after favor resolution/reference-route discussion and arrival | Drawing room; unresolved favor remains available |
| Beatrice | Off-map | Drive, hall greeting, study visit after first conversation | Drawing room, with brief announced visits to nearby rooms |
| Jonah | Off-map | Drive and parked car | Front covered porch |

Technical behavior to preserve in implementation:

- A single progression coordinator evaluates event conditions after committed player actions. Simulation time drives movement and presentation durations only.
- Events have stable IDs, explicit trigger conditions, required participants, priority, and queued/running/completed states. Completed events cannot be queued again.
- Each one-time event fires once, including after a save reload.
- Walking routes are cosmetic execution of intended state; a blocked route cannot permanently prevent essential content.
- Dialogue pauses the shared simulation, so an NPC cannot walk away during a conversation.
- The car must complete its arrival safely even if the player waits near the drive; use a protected lane and fixed stopping point.
- Skipping an arrival animation completes the same arrival state and makes both NPCs available.
- A skipped or interrupted optional meeting uses a later conversation fallback.
- If one action makes several events eligible, queue them deterministically and resolve shared NPC reservations in an authored order. The arrival takes precedence over optional staff meetings.
- The browser game pauses on loss of tab/application focus and on mouse-capture loss. Resuming does not fast-forward a wall-clock backlog of events.
- When a favor involves an NPC or Pip, the schedule respects that reservation and resumes from the appropriate phase after release.

The event system should record both “event happened” and “player witnessed event.” Only the second allows the notebook to say the player personally saw it.

## 13. Exploration, controls, and interactions

Proposed desktop keyboard/mouse controls:

- Move: WASD / left stick.
- Look: mouse / right stick.
- Interact or speak: E / primary controller button.
- Notebook: Tab / menu button.
- Back or pause: Escape / back button.
- Optional faster walk: Shift / stick button.

No required jumping, crouching, climbing, or precision platforming. These would add input and collision complexity without improving this case.

Use a small reticle and a readable prompt when looking at an interactable within reach. Objects do not need to glow continuously. Dedicated interaction-highlight settings are deferred.

Every authored interaction must have complete physical and audiovisual feedback. The following interaction families define the production scope; section 26 specifies the detailed behavior:

1. Pick up, rotate, turn over, inspect, and put back or collect evidence.
2. Open letters, turn relevant pages, compare objects, and record deductions.
3. Talk, show evidence, receive an NPC response, and end the conversation naturally.
4. Operate door handles, keys, drawers, cabinets, and relevant switches.
5. Lift/use/replace the telephone receiver and complete story calls.
6. Attach Pip's lead, walk him, react to his discoveries, and return him.
7. Interact with authored environmental props such as the reference cabinet and greenhouse tray.

Visible hands and object contact are the proposed implementation of the requested interaction detail. Each action must define cancellation, interruption, and save behavior. Decorative objects need an explicit decision in the asset register about whether they are interactive; every object advertised as interactive must respond consistently.

Evidence is recorded automatically at the defined discovery point. A compact inventory tracks the few physical exhibits, keys, and favor items that need possession state. Selecting “show evidence” presents the relevant object or notebook entry through a short hand/object animation. Returning or hiding the held object does not erase a discovery. Critical evidence cannot be dropped into an unreachable location.

Use a smooth, responsive first-person camera and short event framing. A dedicated accessibility/settings-default pass is deferred; ordinary movement, text dialogue, and pause controls remain part of the basic game.

## 14. Notebook and deduction interface

Five tabs are sufficient:

1. **People:** name, portrait, role, recorded statements, last known location.
2. **Evidence:** inspectable entries with source, place, and discovery time.
3. **Timeline:** past-event claims and witnessed present events, with uncertainty preserved.
4. **Connections:** a small set of player-built deductions.
5. **Map / current leads:** estate layout and two or three useful next actions.

Do not show omniscient live NPC positions by default. “Last seen in library” is more honest than an unexplained tracking dot. An optional assistance setting may show current locations for convenience.

Each evidence entry distinguishes:

- Observed fact: “The manual bell rope is disconnected.”
- Attributed statement: “Rook says he rang the bell.”
- Player inference: “Rook's claimed action was impossible.”

Connections use selecting two or three entries and choosing a short conclusion. This avoids a fiddly string-board interface while keeping the reasoning with the player. Wrong connections receive a neutral explanation of the gap, not a spoiler or a punishment.

Example: connecting the falcon to Rook's office establishes ownership; it does not yet establish who used it. The notebook should say exactly that.

The player can review old statements after a character changes their account. Automatic note-taking reduces memory burden without automatically solving the case.

## 15. Accusation and ending

The final explanation is available from the hall after Beatrice has arrived and the player has enough evidence to make a meaningful attempt. If the evidence is ready first, the notebook directs the player to finish June's report and the gatehouse call. Beatrice hosts the explanation, so her presence is an explicit scene prerequisite. The deduction-triggered invitation is a reminder, not a requirement; the player can initiate a supported accusation as soon as eligible.

The player selects:

- Who killed Elias?
- How was he killed?
- Why?
- Which evidence supports the explanation?

A fair evaluation should accept equivalent evidence routes, including the reference translation instead of Mara's help. Require relevant support for method, motive, and the connection to the suspect rather than one exact inventory checklist.

Proposed reasoning requirements:

- Method: crime-scene fragment connected to the recovered falcon.
- Motive: financial diversion supported by the interpreted ledger and corroborating records; the owner's clarification adds context.
- Connection/opportunity: at least two compatible supports from the false bell account, recent passage evidence, June's sighting, and weapon provenance.

The exact draft acceptance combinations are specified in CASE_SCRIPT.md. A correct name with unrelated clues must not count as a fully solved case.

Outcomes:

- **Case explained:** correct culprit and a coherent supported account; confession adds emotional context and confirms details already inferred.
- **Right suspicion, unfinished case:** correct culprit with weak support; Beatrice asks the player to investigate the missing link. The player can continue.
- **Unsupported accusation:** the accused challenges the claimed reasoning. The game points to the unsupported part without announcing the killer. The player can continue or explicitly choose an unresolved ending.

The game does not randomly change its answer after an accusation. The confession cannot supply the first and only proof of the core mystery.

Ending lasts around two to three minutes, shows the reconstructed events without gore, and briefly resolves optional secrets. Pip returns to Mara, the restoration situation is addressed, and the household remembers how the player treated them. Brief text presents the explanation and chronology.

## 16. Simple saving and interruption behavior

The first version uses one manual browser-local save slot:

- Pause menu: **Save Game**. Saving replaces the one existing slot and shows a brief confirmation.
- Main menu: **Continue**, available when a valid save exists.
- Store the current case progress, discovered evidence, relevant NPC states, favor progress, persistent object states, completed/queued story events, and a safe player location.
- Save at stable interaction boundaries. Cancel or complete the current interaction before saving. Short event sequences settle at a defined safe checkpoint; the save need not reproduce a half-played hand animation or a vehicle's exact intermediate wheel position.
- Loading restores that stable state without duplicating evidence, favors, the car, or NPCs.
- A simple game/save version check prevents reading incompatible data. If a future update cannot load the save, show that clearly and offer a fresh start; a migration framework is outside the initial scope.
- Browser storage failure shows a truthful “Could not save” message. Save data belongs to that browser/profile/site and may be lost if site data is cleared.

Autosaves, multiple slots, cloud sync, account login, save export/import, and a save-management screen are deferred. The proposed implementation is one small locally stored state record; choose the simplest browser storage that meets that need.

### Interruptions

Starting an NPC interaction stops that NPC's current activity. Canceling or pausing immediately stops their current voice reaction and conversational motion. The conversation closes or pauses as appropriate, and the NPC settles into idle. Resume ordinary activity only after the interaction/pause ends. No spoken or text exchange continues secretly in the background.

Already-discovered facts stay discovered. A story effect tied to finishing an exchange, such as the gatehouse call, requires its defined completion action; canceling early cannot grant it. Repeated interactions never duplicate completed effects. Pip keeps his completed route landmarks and waits safely if the player pauses or interrupts the favor.

### Guidance and deferred settings

Keep ordinary readable dialogue, a current-objective notebook, and clear interaction prompts. A simple optional hint can point toward the next unresolved lead if needed. Accessibility-specific controls/defaults, sound-caption settings, input remapping, navigation assistance, and reduced-motion options are deferred at the user's request. They are not first-prototype completion gates.

## 17. Audio, animation, and writing scope

Positional audio is required for the dog, garden birds, car, footsteps, and appropriate NPC/prop sounds. Sources grow clearer nearby and move across the stereo field as the player turns. Doors, walls, and room transitions affect the mix through authored room zones and simple occlusion. The fireplace, rain, crockery, fountain, and clockwork support the cozy atmosphere.

Music: a small set of unobtrusive cues for exploration, a deduction, arrival, and resolution. Avoid continuous ominous scoring that fights the cozy tone.

The selected first-version route is text dialogue with required character-specific nonverbal vocalizations: brief murmurs, grunts, sighs, chuckles, and acknowledgments matched to emotion. These accompany gaze, mouth/face movement, and gestures without pretending to lip-sync unheard sentences. Use a small varied set per character and a cooldown; do not repeat a grunt for every letter of text. Fully spoken lines may be added later if free suitable recordings can be produced; no paid speech API is required.

Environmental sounds, vocal reactions, music, and UI have separate volume controls. A dedicated sound-caption feature is deferred. Nearby ambient vocalizations are occasional, while deliberate conversation responses are reliably audible and are mixed clearly above background sounds. The user starts audio through the game's Begin/Resume interaction, in line with browser autoplay requirements. [Web Audio guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).

Animation needs:

- Shared humanoid idle, walk, turn, sit, gaze, talk gestures, emotional reactions, and contextual object interaction; first-person hands for the interaction families in section 26.
- Dog idle, walk, sniff, sit, and a happy reaction.
- Car drive in, stop, doors open, occupants exit, then parked state.
- Short in-engine ending reconstruction, reusing existing spaces and motions.

Writing budget, to validate through a read-through:

- Approximately 70–100 short dialogue nodes across the cast.
- Typical node: one to three short sentences; long explanations broken into optional follow-ups.
- Around twelve core evidence entries and four to six optional details.
- One complete favor with alternate evidence access.
- One coherent final explanation with outcome variations.

The critical route should expose substantially fewer than all authored dialogue nodes. A completionist who reads every optional line may exceed 45 minutes.

## 18. System architecture proposal, without selecting an engine

Use a data-driven single-player browser application. Desktop/laptop browsers and static self-hosting are confirmed. The recommended technical starting point is TypeScript, Three.js, a static build tool, and browser audio/storage APIs; this remains a design recommendation pending a small visual/performance prototype. See section 25 for the rationale, Godot alternative, and hosting constraints.

Required systems:

- Player movement and camera.
- Interaction targeting and inspect UI.
- Case state: evidence, claims, permissions, discoveries, and deductions.
- Dialogue runner with conditions and explicit effects.
- Condition-based progression coordinator, event queue, and short presentation timers.
- NPC schedules and navigation.
- Favor state, including the dog route.
- Notebook and accusation evaluation.
- Save/load and settings.
- Positional audio, NPC vocal reactions, and ordinary interaction feedback.

Suggested content records:

| Record | Essential fields |
|---|---|
| Character | ID, display name, role, schedule, known facts, dialogue root |
| Evidence | ID, content, location, acquisition rules, provenance, related deductions |
| Statement | ID, speaker, text, claimed event/time, requirements, superseding statement if any |
| Event | ID, prerequisite expressions, participants, priority, queued/running/completed status, presentation duration, effects, missed-scene fallback |
| Favor | ID, states, checkpoints, completion effects, alternate-route relationships |
| Deduction | ID, accepted evidence combinations, conclusion, unlocked dialogue |
| Accusation rule | Proposed culprit/method/motive, accepted support combinations, result |
| Save | Game/save version, one stable case-state record, completed/queued events, object states, favor/NPC phases, safe player position |

Keep the writer's truth separate from player knowledge. A hidden truth flag should never automatically appear in dialogue options or notebook entries.

A live generative language model is not required for this design. If conversational AI is considered later, it must be constrained to the character's actual knowledge and must not invent clues, alter the killer, or replace authored progression. That would be a separate feature and reliability project.

The proposed game needs static asset delivery and local browser saves, with no account system, multiplayer backend, online database, or paid runtime API. Network access is needed to fetch uncached game assets; a fully offline mode is not promised. Hosting software can be free, while the user's server, bandwidth, power, and optional domain remain infrastructure considerations. The existing Haunted House hosting setup has not yet been inspected.

## 19. Production sequence and completion gates

Do not estimate a release date until the platform, engine, asset approach, developer availability, and prototype performance are known.

### Phase A — mystery and paper design

Deliverables: approved premise and tone, ground-truth timeline, map sketch, suspect knowledge table, clue graph, accepted deduction combinations, and complete critical-path dialogue draft.

Gate: a person can solve the case from written materials without author explanation; no crucial inference relies on hidden facts or a single unrepeatable scene.

### Phase B — movement and investigation prototype

Deliverables: a browser graybox hall/study/library/garden loop, first-person movement, detailed sample interactions, one NPC conversation with vocal reactions, two pieces of evidence, notebook, and a small condition-based event chain.

Gate: a new player can move comfortably, identify an interactable, record a clue, and understand a contradiction.

Include an early visual feasibility sample before expanding production: one representative room opening onto a small garden view, one NPC, and one inspectable clue. Review the requested realistic look, animation quality, clue readability, and performance on named target hardware. Final art production follows that result; it is not postponed entirely until the end of development.

### Phase C — signature feature slice

Deliverables: functioning report/telephone/owner-arrival chain, one NPC routine change, Pip's favor, positional audio, the ledger translation, alternate evidence access, and browser saving/loading of those states.

Gate: both the direct route and fallback routes work; no softlock from missed arrival, declined favor, or interrupted conversation.

### Phase D — complete playable case

Deliverables: all essential clues, seven NPC roles, full schedule, supported accusation, ending, and hint ladder.

Gate: an unfamiliar tester can finish from beginning to end and explain the reasoning without assistance from the developer.

### Phase E — cozy presentation and polish

Deliverables: final scenery/lighting pass, sound, character animation, readable evidence props, and performance work.

Gate: the mystery remains readable, navigation is comfortable, and the presentation supports the intended tone.

### Phase F — release preparation

Deliverables: browser build, input checks, simple one-slot save/Continue behavior and version check, credits and asset-license records, content description, and final regression checks.

Gate: representative first-time players typically finish in the intended range; all essential routes and save boundaries pass.

## 20. Validation plan

Narrative checks:

- Every assertion about the crime is traceable to the writer's truth or an explicitly authored lie/mistake.
- NPCs do not reference unseen evidence before being told about it.
- All required conclusions have accessible support.
- No rival theory has equally strong support because of an accidental omission.
- Historical movements fit the actual map, travel time, and sightlines.
- The mechanism proves the specific manual-ringing claim false, not the broader unsupported claim that Rook could never have been near the tower.

Progression checks:

- Finish without walking Pip.
- Finish after missing the arrival and overheard meeting.
- Finish after questioning suspects in a different order.
- Find the weapon before the fragment or provenance entry.
- Translate the ledger before learning Rook's alibi.
- Decline a favor, then return to it later.
- Satisfy prerequisites in different orders; repeat the gatehouse interaction; verify only one arrival and no circular dependencies.
- Accuse incorrectly, continue, and solve correctly.
- Complete an early valid accusation without waiting for the final invitation.

State and movement checks:

- Save/load immediately before and after arrival.
- Save/load during the dog favor and after a deduction.
- Pause or alt-tab near an event boundary.
- Stand in an NPC's intended route.
- Approach the driveway during the car sequence.
- Repeatedly interact with a completed favor or collected clue.
- Skip cinematics without losing participants or evidence.

Observe playtest friction locally or through voluntary feedback. No telemetry service is assumed. Track completion time, time to first clue, missed interactions, hint use, wrong inferences, and whether the player can explain the final answer in their own words.

## 21. Risks and planned responses

| Risk | Response |
|---|---|
| Estate feels empty | Concentrate interaction in a compact wing and garden; use visible closed restoration areas |
| First playthrough is too long | Reduce repeated walking and optional dialogue exposure before simplifying the central deduction |
| Players miss essential events | Persistent evidence and alternate testimony; distinguish witnessing from learning later |
| Dog pathfinding becomes frustrating | Short authored route, robust recovery, no failure timer |
| Killer is obvious too early | Give innocent suspects understandable secrets and make physical evidence necessary |
| Mystery feels arbitrary | Clear evidence meanings, fixed truth, and playtesting without author hints |
| Players guess the culprit and skip reasoning | Require a coherent supported explanation for the complete ending |
| Progression rules confuse or block players | Show explicit next actions, offer multiple eligible early interviews, and verify no circular dependencies |
| Too much art work for the scope | Cohesive realistic modular rooms, shared character motions, a limited set of unique props, and an early visual sample |
| Realistic graphics make clues hard to see | Test evidence at the actual gameplay camera; use composition, lighting, readable inspection views, and clear ordinary prompts |
| Realistic characters expose weak movement | Test walk/turn/stop and conversation behavior on one character before building the whole cast |
| Dialogue becomes inconsistent | Explicit knowledge conditions, statement history, and authored core content |

## 22. Remaining decisions

Settled: browser delivery for desktop/laptop computers first; static self-hosting with no required paid service; WWII-era detective player and clothing; beautiful realistic scenery with smooth performance prioritized; free assets initially; detailed interactions; positional audio; text with audible NPC vocal reactions; unchanged NPC replies until relevant logic changes; immediate interruption stops; logic-driven events; one manual save slot; the core murder mystery; and deferral of accessibility-specific defaults.

Remaining design choices:

- Exact region/year within WWII; rural Britain in 1942 is the current working choice.
- A named baseline computer for performance checks and a concrete visual reference brief.
- The free environment, character, hand, dog, vehicle, animation, and audio assets to evaluate together.
- Whether visible body/legs are needed in addition to the proposed first-person hands.
- Optional controller support and the precise notebook/control layout.
- Final room dimensions, sightlines, and the first-five-minute sequence.
- The Haunted House host URL or server configuration, before deployment planning is finalized.

There is no need to reapprove the core mystery or choose between browser and desktop delivery again. Numerical performance and download budgets in section 25 are provisional prototype targets. CASE_SCRIPT.md specifies the accepted solution and updated arrival dialogue; PLANNING_CHECKLIST.md tracks remaining work. Implementation remains unauthorized until the user asks to start building.

## 23. User-supplied development resources and MCP evaluation

Reviewed November 10, 2026. This is a documentation review, not an installation, source-code audit, compatibility test, or engine decision. No external skill or MCP server was installed or connected during this review. Repository capabilities below are described by their maintainers and still require a local trial if selected.

| Resource | What it provides | Proposed use in this project |
|---|---|---|
| [awesome-gamedev-agent-skills](https://github.com/gamedev-skills/awesome-gamedev-agent-skills) | A collection of agent instructions, including dialogue, saving, level design, camera, assets, and engine-specific guidance; it is not itself an MCP server | Consult a small relevant subset once the engine and next development task are known |
| [gameplay-mcp](https://github.com/nowsprinting/gameplay-mcp) | A Unity runtime MCP package with UI interaction, object inspection, screenshots, and custom-tool extension; its README explicitly excludes WebGL | Candidate only if Unity is selected and the intended testing platform is supported |
| [game-automation topic](https://github.com/topics/game-automation) | A discovery page containing many independent repositories | Search for a specific missing capability later; not a single package to install |
| [tugcantopaloglu/godot-mcp](https://github.com/tugcantopaloglu/godot-mcp) | Godot scene operations, runtime inspection, input simulation, logs, navigation queries, and script validation | Candidate for inspecting NPC movement, checking interactions, and diagnosing schedule failures |
| [hi-godot/godot-ai](https://github.com/hi-godot/godot-ai) | Godot editor integration for scenes, scripts, UI, materials, animation, and other editor operations | Candidate for constructing and iterating on the estate, characters, and notebook interface |

The Godot AI documentation also describes an in-editor test runner. It requires authored suites; it does not automatically assess whether a mystery is fair or a playthrough enjoyable. Its documented synchronous test methods are distinct from a full asynchronous gameplay run. [Testing documentation](https://github.com/hi-godot/godot-ai/blob/main/docs/testing.md).

### Selection approach

The browser platform is now settled. Godot remains an alternative to the recommended browser-native approach in section 25, subject to web-export visual and performance testing. Use a Godot MCP integration only if Godot is selected. The Unity-only gameplay MCP does not fit the proposed browser-native implementation. Use one primary integration initially; add another only for a demonstrated missing capability.

A small evaluation scene should establish that the chosen integration can:

1. Open and inspect the intended project and scene.
2. Make a reversible scene edit and confirm it persists after reopening.
3. Validate a script and report a deliberately introduced error accurately.
4. Run the scene and expose useful diagnostics.
5. Support the intended gameplay observation/control workflow, directly or through small project-specific hooks.

This evaluation is future implementation work. Do not install a complete skill catalog or multiple overlapping servers merely because links are available.

### Project-specific testing capabilities to plan

The following are requirements we would implement or adapt, not claims that every linked tool already supplies them:

- Read investigation milestones, pause state, and queued/running/completed event IDs.
- Inspect an NPC's intended destination and actual position.
- Inspect Pip's favor phase and reached landmarks.
- List the player's collected evidence, heard statements, and completed deductions.
- Load a known test save or reset an isolated test session.
- Exercise real interactions to satisfy prerequisite chains, and advance only presentation timers for targeted scene tests.
- Exercise the final accusation using each accepted evidence bundle.

Keep these in development/test workflows. The released game should launch and play without a player's MCP setup.

### Two complementary forms of testing

**Functional checks** may inspect hidden state and use test saves to reproduce specific situations. Examples: stop just before completing the gatehouse call, save, complete it, and verify one arrival; reload each boundary state and verify no duplicate car or lost call; leave an eligible event queued during reading; finish the dog favor and verify rewards occur once.

**Player-perspective checks** must use only discoverable information and ordinary interactions. They must not read the hidden culprit field, preload the solution script, grant themselves clues, or set completion flags. A successful debug-assisted run is not evidence that a new player can solve the case naturally.

Test scenarios to add to the earlier validation plan:

- Miss the car scene and still find both new witnesses.
- Decline Pip's walk and complete the reference-book route.
- Find evidence in a different order without dialogue revealing undiscovered facts.
- Block Pip's path and verify recovery without resetting the favor.
- Load saves before and after scheduled events and compare narrative state.
- Complete every accepted accusation bundle using earned evidence.

Automated checks can detect broken progression and inconsistent state. Human first-time playtests remain necessary to assess warmth, legibility, comfort, clue fairness, and the 30–45 minute target.

## 24. Realistic presentation and a living estate

The user's clarified reference is GTA V for realistic visuals and a lively world, with first-person exploration retained. The following is our proposed translation of that preference into this mystery's design, not a claim about specific GTA mechanics or a commitment to reproduce its production scale.

### Visual target

- Human-scale rooms and doors, convincing furniture proportions, and consistent character scale.
- Stone with readable surface variation, wood with restrained wear, fabric with believable texture, and metal/glass that react consistently to lighting.
- Warm interior lighting balanced against cooler garden light; the cozy mood comes from color, sound, and character behavior.
- Rain visibly affects outdoor surfaces while sheltered areas remain dry. All essential evidence remains recoverable under the established time rules.
- Hand-placed storytelling details: a tray being cleared, a half-read book, fresh soil, a misplaced tool, or damp footprints used only where authored evidence supports them.
- Evidence remains visible from normal standing height and reachable inspection positions. Decorative realism must not turn a clue into a tiny indistinguishable speck.

Prepare a small art brief before asset selection: reference views for the hall, study, garden, one person, and the arriving car; a material/color palette; and an example of the notebook over the gameplay view. These are planning deliverables, not completed images.

### First-person feel

Proposed controls prioritize responsive walking and looking, a faster walk where space permits, smooth stair handling, and predictable door interaction. Camera movement should remain comfortable under the settings already specified.

Detailed interactions are now required. The proposed first-person presentation uses hands to operate objects, lift and rotate clues, turn relevant pages, and show evidence. Select the hand rig and action animations early. Visible body/legs and a third-person toggle remain separate unconfirmed features. The physical action must restore a stable state when canceled or interrupted.

The player can explore available rooms freely, approach conversations in different orders, and investigate optional details. Physical props only need simulation where it improves an interaction. Critical evidence should not be accidentally knocked into an unreachable location.

### Visible NPC activities

Each character should have a small believable activity set tied to their schedule:

| Character | Example activity | Investigation-relevant reaction |
|---|---|---|
| June | Clears a tray, checks the hall, tends the kitchen | Stops to answer and resumes the appropriate task afterward |
| Rook | Straightens office papers, checks the clock, crosses the service route | Becomes more guarded after evidence is presented |
| Ada | Looks through a catalogue, watches the terrace | Changes her topic after the owner's arrival |
| Tomas | Waters plants, sorts pots, shelters from rain | Notices the disturbed greenhouse tray when asked |
| Mara | Reads, checks an annotation, watches Pip | Adjusts her routine while the dog favor is active |
| Beatrice | Leaves the car, listens to June, settles in the drawing room | Responds to the documents the player shows her |
| Jonah | Parks, handles luggage, waits by the covered entrance | Remains available for questions after the arrival scene |

Activities must respect the historical evidence timeline and the live schedule. Their transitions need natural stopping points, attention toward the player, and collision-aware movement. Essential dialogue must never become inaccessible because an animation is unfinished.

Use a small set of optional environmental reactions: a greeting on approach, stepping around someone in a corridor, a comment when drizzle begins, or looking toward the approaching car. Avoid repeating lines on every pass. These reactions add atmosphere without changing the murder's fixed facts.

### Production implications and validation

The immediate visual production target is a convincing estate wing and garden. Realistic assets, character movement, and lighting add work that must be included in the budget and prototype plan.

Evaluate environment, character, dog, and vehicle assets together for consistent proportions and finish. A polished room beside an obviously mismatched character will not meet the target. The tool shortlist remains provisional until browser performance on the target hardware and the visual sample are assessed.

Validate both a busy outdoor view and a lit interior, including the arrival with multiple characters visible. Section 25 gives provisional performance budgets to test against named hardware; no frame-rate or visual-equivalence promise has been established yet.


## 25. Browser delivery, free self-hosting, and visual performance

Confirmed November 11, 2026: desktop/laptop browsers first, free assets initially, and the ability to host the game without a paid platform or runtime service. This section is a planning specification, not a deployed site or benchmark result.

### Proposed technical direction

Recommend TypeScript + Three.js for rendering, a static production build, authored case data, browser audio, and local browser storage. This gives direct control over the web interface, asset loading, and quality settings. This recommendation is a design judgment, not a measured claim that it outperforms every engine.

Three.js documents a build workflow producing files ready for web hosting. [Three.js installation and production guide](https://threejs.org/manual/pages/installation.html). The proposed build output would live inside the one canonical project folder; it is generated delivery output, not a separate project checkout. Vite documents static output and subpath configuration, and distinguishes its local preview server from production serving. [Vite static deployment](https://vite.dev/guide/static-deploy.html).

Godot remains a viable candidate if the editor workflow materially helps production, but its browser export must be evaluated directly: the documented web target uses WebGL 2 and the Compatibility renderer; Forward+/Mobile renderer features are not available there. Single-threaded export simplifies hosting; threaded export has additional isolation/header requirements. [Godot web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html). Do not choose an engine based only on available MCP tools or a desktop render that cannot be reproduced in a browser.

### Hosting and delivery contract

- A production bundle of HTML, JavaScript, models, textures, audio, fonts, and case data served from the user's own static web server.
- Bundle runtime libraries and assets locally; avoid a required paid CDN, external speech generation, or remote AI service.
- Support both a dedicated domain and a path such as `/murder-mystery/`; verify model, texture, audio, and save identifiers under the chosen base path.
- Use a production static server and appropriate cache/compression/MIME settings. A self-hosted static-file server such as Caddy is one documented option. [Caddy static files](https://caddyserver.com/docs/quick-starts/static-files).
- Public delivery should use HTTPS; local development uses a local web server. Opening the HTML directly from the filesystem is not the delivery workflow.
- Version entry manifests and assets so updating the game cannot mix an old script with incompatible new files.
- Saving uses the one local slot and Save Game/Continue interface described in section 16. No account, cloud service, import/export, or save-management system is needed. Report storage failure honestly; clearing site data can remove the local save.
- Self-hosting avoids a mandatory game-service subscription. Existing machine/network costs and an optional domain are separate. No hardware purchase, hosting plan, or asset purchase is authorized here.

The Haunted House project/host has not been located or inspected. Reuse its deployment pattern only after checking its actual server and base-path arrangement; do not claim the setups already match.

### Quality and responsiveness targets

These numbers are initial budgets to validate, not promises for arbitrary computers:

| Area | Starting target | How to assess |
|---|---|---|
| Frame rate | Aim for 60 fps on the chosen mainstream laptop; provide a stable 30 fps low-quality target on the agreed weaker baseline | Measure frame times while walking, talking, entering garden, and watching arrival |
| Frame budget | About 16.7 ms for 60 fps / 33.3 ms for 30 fps | Profile CPU and GPU work and investigate sustained overruns |
| Initial playable download | Aim for 20 MB or less compressed before entering the opening area | Cold-cache transfer measurement; allow later area assets to load separately |
| Full first-case transfer | Initial cap target about 150 MB compressed | Audit the actual asset bundle before promising a cap |
| First playable view | Aim for 10–15 seconds on a specified 25 Mbps test connection | Include transfer, decoding, shader preparation, and scene setup |
| Visible interaction response | Immediate prompt/feedback, with a target under 100 ms for the first response | Measure click/key-to-feedback, not the full hand animation |
| Quality modes | Auto, Low, Medium, High | Changes preserve every clue, event, sound cue, and interaction |

Choose a named integrated-graphics laptop and an Apple Silicon Mac for representative tests; exact models are still open. Test Chrome/Edge, Firefox, and Safari on applicable desktop platforms before declaring support. Phones/tablets are outside the first release target.

Proposed rendering strategy:

- Build realism through consistent materials, composition, lighting, sound, and grounded animations.
- Bake most static environmental lighting; reserve dynamic lighting/shadows for a small set of moving characters and important sources.
- Use simplified distant models, shared materials, repeated-prop instancing, and room/visibility culling.
- Compress texture assets for GPU use, provide reduced-resolution variants, and reserve high detail for evidence and close objects.
- Cap internal rendering resolution on very high-density displays; adapt resolution and optional effects when sustained frame times exceed the selected target.
- Preload adjacent spaces and the car/NPC assets before triggering arrival. Decode/upload incrementally to avoid sudden stalls.
- Use subtle, affordable rain and surface effects; avoid making elaborate reflections or expensive post-processing essential to the look.
- Keep notebook/dialogue text and clue close-ups sharp even when the 3D view scales down.

WebGL guidance supports conservative memory budgeting, quality settings, compressed textures, and batching. WebGL does not expose a portable exact total-GPU-memory query, so estimate usage and profile real devices. [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

Quality adaptation should use a sustained performance window and hysteresis, not change settings every frame. Allow manual override. Loss of graphics context should pause the game and offer recovery from the last stable save.

### Free asset production plan

Evaluate cohesive free assets for the estate, period furnishings, seven principal characters, first-person hands, Pip, car, and animation. Record source and redistribution terms for each chosen asset. Free availability alone does not establish that a file may be bundled with the game.

Convert chosen models to a consistent scale, material treatment, rig convention, and web delivery format. Reduce excessive geometry and texture sizes before integration. Close inspection props receive the highest detail priority. Character faces and hands must be evaluated at actual conversation distance; a collection of individually attractive but mismatched assets will not meet the intended look.

The visual sample should prove one room, garden view, NPC conversation, hand/object action, and positional sound on the intended browser baseline. This is future prototype work. No assets have yet been bought, downloaded, or installed for this plan.

## 26. Detailed interactions and positional sound

### Complete interaction contract

For every designed interactable, define: visible affordance, reach/line-of-sight, input, hand/contact motion, object motion, sound, feedback, state change, cancel behavior, and save/reload behavior. The interaction register is the source of truth for which environmental objects are usable.

| Interaction | Physical and audiovisual detail | Required state/recovery behavior |
|---|---|---|
| Door | Hand meets handle, latch moves, door opens with a material-appropriate sound | Locked door rattles and explains why; collision cannot trap the player/NPC |
| Drawer/cabinet | Hand pulls handle; drawer/lid slides or swings; contents remain aligned | Persist open/closed and contents; avoid collecting through a closed surface |
| Key/lock | Select suitable key, align hand, turn key, hear lock disengage | Unlock commits once; cancel before commitment leaves it locked |
| Letter/ledger | Lift/open, turn relevant pages, inspect markings, readable transcription | Preserve discovered pages and translation source; allow immediate exit |
| Loose clue | Pick up, rotate, turn over, compare details, collect or replace | Discovery persists; essential exhibit cannot be lost outside reachable space |
| Fragment comparison | Align fragment with recovered ornament and show the matching edge | Player confirms the connection; avoid an unexplained automatic solution |
| Show evidence | Raise the actual exhibit or notebook page; NPC looks and reacts | NPC learns only the specific evidence presented |
| Telephone | Reach for receiver, lift, connect, read the reply with a vocal reaction, replace receiver | Commit the gatehouse-call flag once after the exchange; resumed saves cannot duplicate arrival |
| Pip's lead | Kneel/reach, attach clasp, show a light visual lead and collar sound | Lead visuals do not require expensive rope physics; Pip cannot trap the player |
| Walk/return Pip | Footsteps, sniffing, occasional bark, gaze toward the clue, greeting on return | Route landmarks persist; stuck recovery and interruption remain supported |
| Greenhouse tray | Move loose material with a short hand/tool motion and reveal the falcon | Revealed/collected states persist separately; repeated actions do not duplicate evidence |
| Talk/end conversation | NPC stops activity, turns, makes eye contact, gestures and vocalizes; interruption stops voice/gesture immediately | Same reply until relevant logic changes; idle while interrupted/paused, then return to the appropriate activity |
| Environmental switch/curtain | Contextual hand action, visible switch/fabric movement, sound and lighting response | Only authored props expose interaction; changes cannot erase essential evidence |

Use short reusable motions with object-specific alignment. Give immediate feedback before animation finishes; detailed interaction must not make repeatedly opening a door or rereading a note tedious. Canceling stops the current performance immediately and settles the object/NPC safely. Commit persistent effects at a documented point and make cancellation/reload settle into a valid before-or-after state. Dedicated reduced-motion settings are deferred.

### Sound behavior

- Pip: localized paws, sniffing, collar/lead sounds, and occasional barks tied to behavior.
- Birds: positioned in garden locations, with varied calls and restrained repetition.
- Car: approaching engine, gravel tires, brake/stop, door latch, occupants' footsteps, then engine off.
- NPCs: nearby movement and occasional ambient sounds; interaction-triggered murmurs/grunts/sighs/chuckles with emotion and character identity.
- Rooms: fireplaces, clockwork, rain, fountain, and kitchen sounds mixed by proximity and room boundaries.

Use a listener tied to the player camera, distance attenuation, and directional panning. Browser Web Audio provides spatial-source primitives; room occlusion and mixing rules still need to be authored for this game. [PannerNode reference](https://developer.mozilla.org/en-US/docs/Web/API/PannerNode).

Limit simultaneous background sources and prioritize dialogue/evidence cues. Distant loops can be virtualized and resumed without sounding as though every source restarts when approached. A closed door can muffle an adjacent room without expensive acoustic simulation. The car remains observable in the world and its arrival is recorded through the normal event/notebook system; sound-caption settings are deferred.

The Begin Investigation/Resume action enables browser audio and mouse capture. Escape releases the cursor, pauses, and stops the current NPC vocalization/gesture. Background tabs do not progress the story or accumulate a burst of queued sounds. Include basic audio volume controls; text dialogue remains the source of the spoken exchange's information.
