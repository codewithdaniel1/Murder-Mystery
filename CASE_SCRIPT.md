# The Last Bell at Bramblewick — case logic and dialogue draft

Companion to GAME_DESIGN.md. Design reference for the first playable prototype. The user has approved the core mystery; names, dialogue, and presentation details remain editable. Updated for WWII-era dressing, detailed interactions, text plus vocal reactions, and logic-triggered arrival on November 11, 2026. This document contains the solution.

## 1. Evidence vocabulary and exact financial story

The player should not have to understand accounting to solve the case. All relevant numbers and documents must be visible together in the notebook.

Elias compared three records:

1. A supplier's original invoice: **60 pounds** for greenhouse stonework.
2. Rook's claim against the estate: **180 pounds** for that same work.
3. A ledger and payment slip: **120 pounds** paid to Rook personally, entered as though part of the supplier expense.

The sum is simple: 60 paid for actual work plus 120 diverted to Rook equals the 180 charged to the estate. The case concerns one representative transaction; optional dialogue suggests Elias suspected others.

The Avellic annotation identifies the 120-pound payment as received personally by the steward. Rook tells the player it means a restoration disbursement. The payment slip corroborates the recipient. Beatrice confirms she did not authorize a personal payment and had asked Elias to check the accounts. Interpretation, records, and testimony are distinct; the game does not imply that the unfamiliar language alone proves theft.

Use three consistent short in-world terms, displayed with original decorative glyphs and accessible transcription:

| Avellic transcription | English meaning |
|---|---|
| vel | received |
| aran | steward |
| si | personally / for oneself, in the ledger's conventional phrase |

The phrase **vel aran si** means “received personally by the steward” in this fictional accounting register. Do not claim these invented words belong to any real language. This is a tiny authored vocabulary, not a generative language system.

The library reference has the same phrase in a worked example. Players match the phrase as a whole; they need not infer grammatical rules from three isolated words.

## 2. Knowledge and claim boundaries

| Character | Knows directly | Does not know initially |
|---|---|---|
| Rook | The crime, concealment, diverted funds, his own route | Which clues the player has found unless shown or discussed |
| June | Cleaning time, passage sighting, impact sound, discovery time, broken vase | Killer's act, greenhouse hiding place, financial meaning |
| Ada | Her own argument, last sighting of Elias, terrace company | Rook's finances, bell mechanism condition |
| Tomas | Garden activity, rope repair, greenhouse access, plant hobby | Identity of the person who disturbed his tray |
| Mara | Avellic register, terrace company, Pip's behavior | Meaning of this particular ledger until it is shown to her |
| Beatrice | Authorized spending, planned arrival, Elias's request for a meeting | Rook's crime and what the player discovered before her arrival |
| Jonah | His journey with Beatrice and the contents of a delivery envelope he was told to carry | Indoor movements or the murder |

No NPC knows that the player challenged someone else unless a defined exchange establishes that knowledge. The public arrival can change everyone's available topics because it is an observable household event.

## 3. Critical-path dialogue

These are draft lines for the essential interactions of the approved core story. Bracketed notes describe availability and notebook effects, not words shown to the player. Dialogue is displayed as text with character-specific nonverbal reactions and gestures. For a given topic and relevant story state, return the same authored reply. Only a defined logic condition changes that reply; repeated-topic variants are unnecessary.

The player is a period detective wearing appropriate clothing. NPCs stop their activity to engage. If the player interrupts, the current vocal reaction and conversational gesture stop immediately; the NPC idles while paused, then can resume normal activity after the interaction ends. Preserve recorded information and withhold uncompleted event effects.

### Opening: June, entrance hall

**J01 — Introduction**

June: “Detective, I'm glad you're here. Mr. Vale has been found in the study. The constable is coming, but until then, everyone's explanation seems to be making things less clear.”

Player options: “Tell me what happened.” / “Where should I start?”

**J02 — Discovery**

June: “I found him at twenty thirty-one. I know because I looked at the hall clock before calling for help. Ada had seen him at the window a few minutes before.”

[Record attributed discovery time. Do not record an exact time of death.]

**J03 — First direction**

June: “His desk is much as he left it. Please have a look. And ask Mr. Rook about the bell—he seems very certain it explains where he was.”

[Lead: inspect study; ask Rook about bell.]

**J04 — Expected arrival**

June: “Lady Beatrice is expected this evening. Mr. Vale wanted to speak with her. Have a look at his work, ask someone what they know, then tell me what you've found.”

[Show study/interview/report objectives. Arrival is not tied to a clock minute.]

**J04a — Report findings [opening + any core study lead + one eligible case interview]**

June: “Thank you. We'd best have Lady Beatrice come straight to the front entrance. Would you telephone the gatehouse? The receiver is just there in the hall.”

[Mark June's report complete. Show explicit objective: use the hall telephone to contact the gatehouse. This topic remains available regardless of social choices.]

**T-PHONE — Gatehouse call [report completed]**

Interaction: reach for the receiver, lift it, connect the call, and hear the line come alive.

Player: “This is the castle. Please have Lady Beatrice brought to the front entrance. June needs to speak with her.”

Gatehouse operator, in text with a brief telephone-filtered acknowledgment: “Her car has just reached the lower drive. I'll send them up.”

[Replace the receiver. Commit call-completed once. Queue the arrival; begin the approach after the dialogue/inspection UI closes. The operator is an off-screen functional reply, not an additional suspect.]

**T-PHONE-EARLY — Telephone before June's report**

Response: “There's no message for the gatehouse yet. June asked me to report back after looking into the case.”

[Readable guidance with receiver/line feedback. No consumed trigger or permanent lockout.]

### Study inspection

**I01 — Covered chair / room**

Inspection: “June has covered Elias. The surrounding desk and rug have been left undisturbed.”

[No body manipulation or graphic close-up.]

**I02 — Bronze fragment**

Inspection: “A small bronze talon lies beside the desk. The break is uneven. It appears to have snapped from a larger ornament.”

[Record C01. It suggests an object; do not label it the murder weapon yet.]

**I03 — Unfinished note**

Readable note: “Beatrice—before you approve another restoration payment, compare the estate's claim with the original invoice. I have placed the papers with the old ledger. We must speak tonight. —E.V.”

[Record C02. The note expresses Elias's suspicion; it does not independently prove his interpretation.]

**I04 — Ledger and receipts**

Inspection: “The supplier's invoice says 60 pounds. The estate claim says 180 for the same work. A separate 120-pound payment names Edmund Rook. Beside it, the old ledger carries the words ‘vel aran si.’”

[Record C09 and the financial documents. Meaning remains unverified.]

### Rook, initial interview

**R01 — General account**

Rook: “A dreadful business. Elias could be difficult, but he was a thorough man. Please ask whatever you need.”

**R02 — Where were you?**

Rook: “In the bell tower, from about twenty twenty-five until twenty thirty-five. I rang the half-hour bell myself. By hand. Someone has to keep the old place running.”

[Record C03 exactly, including claimed interval and manual action.]

**R03 — Service passage**

Rook: “I haven't used that little passage all week. Nothing down there requires my attention.”

[Record an independently challengeable claim.]

**R04 — Permission to inspect office**

Rook: “Of course. The door is open. You'll find schedules, inventories, and rather too many old awards.”

[Office permission. If this is asked after severe confrontation and refused, Beatrice supplies alternate permission.]

**R05 — Ledger wording [show ledger]**

Rook: “An old expression for restoration funds released. Elias enjoyed making straightforward accounts look scholarly.”

[Record as Rook's interpretation, not verified translation.]

### Service passage and bell alcove

**I05 — Mechanism**

Inspection: “The manual rope ends at a detached coupling. The automatic chime mechanism remains connected.”

Readable repair notice: “Manual rope removed today. Automatic half-hour chime operating normally. Do not reconnect until inspected. —T. Reed”

[Record C04. The visible coupling supports the notice.]

**I06 — Fabric snag**

Inspection: “A small piece of plum lining is caught on the latch. Its edge carries a repeated stitched diamond.”

[Record fabric observation. Identity and recency require further support.]

**I07 — Office display**

Inspection: “An empty plinth is labelled ‘Bronze Falcon — Presented to Edmund Rook.’ An inventory illustration shows a falcon with one claw extended.”

[Record C07.]

### June, follow-up

**J05 — Who used the passage?**

June: “Mr. Rook went in at twenty twenty-six. I was crossing the hall with a tray. I didn't see which door he used after that.”

[Record C05. Preserve her limited sightline.]

**J06 — A noise?**

June: “A heavy bump, perhaps two minutes later. I thought someone had dropped a box. I wish I had gone to look immediately.”

[Attributed approximate sound time. Do not convert it into an exact established death time.]

**J07 — Latch [show fabric]**

June: “I cleaned that latch at quarter past eight. There was nothing caught on it then. That stitching looks like Mr. Rook's jacket lining, though you'd best compare it yourself.”

[Record recency. Unlock a polite jacket question and visual comparison.]

### Rook, evidence follow-ups

**R06 — Jacket [show fabric]**

Rook: “Yes, the lining has torn. These old door catches are a nuisance.”

Inspection during conversation: “His jacket's torn lining has the same plum fabric and stitched-diamond border.”

Player: “Which door caught it?”

Rook: “I couldn't possibly remember every door I've passed.”

[Complete C06 comparison. Do not treat matching fabric as unique laboratory identification.]

**R07 — Bell contradiction [C03 + C04]**

Player: “The manual rope was disconnected. The bell rang automatically.”

Rook: “Then I expressed myself badly. I was attending to the bell. Not necessarily pulling the rope at that particular instant.”

[Keep original statement. Record changed account. No confession yet.]

**R08 — Passage contradiction [C05 or complete C06]**

Player: “You said you hadn't used the service passage all week.”

Rook: “I may have stepped through briefly. It's been a very trying evening.”

[Record revised account.]

### Ada, terrace account

**A01 — Argument**

Ada: “Yes, we argued. He was cataloguing things for a sale. I thought he was helping Aunt Beatrice sell the place piece by piece.”

**A02 — Last sighting and company**

Ada: “I joined Dr. Voss on the terrace around twenty twenty-four. A minute later, I saw Elias drawing the study blackout curtains. We stayed outside until June called for help.”

[Record last sighting and claimed terrace presence.]

**A03 — Other people**

Ada: “Tomas was working by the fountain. Beyond the hedge? I couldn't see. You'd need to ask him.”

[Do not accidentally give Ada a complete view of the greenhouse.]

### Tomas, garden

**T01 — Garden account**

Tomas: “I was by the fountain while Miss Ada and Dr. Voss were on the terrace. I went to the kitchen when June called us.”

[Supports C11 while leaving the later hiding interval unobserved.]

**T02 — Bell repair**

Tomas: “I disconnected the rope earlier. Worn coupling. The automatic chime was fine, so I left the notice. Nobody could ring it by hand that evening.”

[Additional explanation of C04; inspection alone remains sufficient for the contradiction.]

**T03 — Greenhouse permission**

Tomas: “You can look. Please leave the pots where they are. The labels are a system, even if nobody else appreciates it.”

[Greenhouse access. Asking about a visible locked door exposes this topic.]

**T04 — Disturbed tray**

Tomas: “That tray was level before we went inside. I haven't touched it since. Someone's made a proper mess of the potting mix.”

[Directs to the weapon without requiring Pip.]

### Mara and Pip

**M01 — Language [show ledger]**

Mara: “Avellic accounting language. I can help, but I want to check the old usage before giving you an answer.”

**M02 — Favor**

Mara: “Would you take Pip around the garden while I do? The fountain and back past the greenhouse will do. He's been very patient by his standards.”

Player options: “I'll take him.” / “I'll come back.” / “Is there a reference I could check?”

**M03 — Reference route**

Mara: “The blue volume in the library reference cabinet has a worked example. Beatrice keeps the cabinet key. If she has arrived, ask her.”

[Availability depends on arrival state; no claim that Beatrice is already present when she is not.]

**M04 — Terrace account**

Mara: “Ada was with me. Tomas was by the fountain. We all went inside when we heard June. I was watching my companions, not guarding every garden entrance.”

**D01 — Fountain checkpoint**

Observation: “Pip pauses to inspect the fountain's resident stone frog.”

[Brief sniff, no timing requirement.]

**D02 — Greenhouse checkpoint**

Observation: “Pip stops at the low greenhouse vent, sniffs, and looks toward a disturbed potting tray inside.”

[The player notices a place to inspect. Pip does not know who committed the crime.]

**M05 — Return after both checkpoints**

Mara: “Thank you. He looks pleased with the management. I've checked the wording: ‘received personally by the steward.’ Not a payment to a restoration supplier.”

Player: “The papers name Rook for 120 pounds.”

Mara: “Then compare that with the supplier's actual bill. The language identifies the recipient; the figures will tell you what happened.”

[Verified interpretation source: Mara. Favor complete.]

### Alternate reference inspection

**I08 — Blue volume [cabinet access]**

Readable example: “‘Vel aran si’ — received personally by the steward. Used to distinguish a personal receipt from a payment to an outside supplier.”

[Verified interpretation source: reference. This is equivalent to M05 for deduction rules.]

### Greenhouse evidence

**I09 — Disturbed tray**

Inspection: “Beneath the loose potting mix lies a heavy bronze falcon. One talon is missing. The base is engraved with Edmund Rook's name.”

[Record C08.]

**I10 — Compare fragment [C01 + C08]**

Inspection: “The fragment's uneven edge fits the falcon's missing talon.”

[Unlock weapon connection. The game's authored reconstruction later confirms the use; no unsupported medical examination is required.]

### Arrival scene

**E01 — Approach, after completed gatehouse call and safe UI exit**

Audio: a motorcar approaches the front gate, with positional engine and gravel sounds.

[Start only when the report/call prerequisites are committed and the approach is not already queued, running, or completed. Show a subtle cue; do not rotate the player's camera. Preload the car and occupants before starting movement.]

**E02 — Beatrice exits, after the car reaches its stopping point**

Beatrice: “June? What's happened?”

June: “There's been dreadful news, my lady. Please come inside.”

Jonah, quietly to player if nearby: “I take it the luggage can wait.”

[Scene is brief and respectful. Both characters remain available if the player misses it. After the first owner conversation ends, Beatrice checks the study and then goes to the drawing room, with normal conversation access along the route.]

**B01 — Elias's meeting**

Beatrice: “Elias asked me to inspect the restoration accounts tonight. He said I should speak to him before approving any further payments.”

**B02 — Financial records [show documents]**

Beatrice: “The supplier was owed sixty. I authorized no personal payment to Edmund. If the estate paid one hundred and eighty, that extra hundred and twenty needs explaining.”

[Corroboration, not a substitute for seeing the actual records.]

**B03 — Access**

Beatrice: “You may inspect the reference cabinet and Edmund's office. Tell Tomas you have my permission for the greenhouse as well.”

[Persistent alternate permissions.]

**B04 — Collection sale**

Beatrice: “I was considering selling a few objects to fund repairs. Ada was furious. Elias was documenting the collection; the decision would have been mine.”

[Resolves the distinction between Ada's dispute and Rook's motive.]

**P01 — Journey**

Jonah: “We've been on the road together since eight. The toll receipt gives the crossing time. We stopped once for a loose luggage strap, then came straight here.”

[Record attributed journey and inspectable receipt. Do not claim the receipt independently proves every minute of the journey.]

**P02 — Delivery**

Jonah: “The envelope is from the stone supplier. Original invoice, apparently. Mr. Vale asked them to send a duplicate directly to Lady Beatrice.”

[Duplicate financial evidence is a reasonable source cross-check and a reminder if the original study document was overlooked.]

### Optional meeting and final invitation

**E03 — Rook to June [arrival complete AND (bell challenged OR financial papers shown to Rook)]**

Rook: “There's no need to trouble Lady Beatrice with every person you saw in a corridor.”

June: “Then you won't mind if I give her the short version.”

[Optional witnessed pressure. Missed fallback: June later reports that he asked her to keep quiet. Neither is required for the accusation.]

**E04 — June [owner introduced + weapon deduction + financial deduction]**

June: “The constable has telephoned. He asks that we keep everyone here. If you've put the pieces together, Lady Beatrice would like to hear it. If not, take the time you need.”

[Final invitation after the current interaction closes. Connection evidence may still need work. No forced ending or hidden countdown.]

## 4. Deductions and exact acceptance rules

Use named conclusions rather than counting arbitrary clue totals.

| Deduction | Required support |
|---|---|
| D-WEAPON: the falcon is connected to the blow in the study | C01 + C08 + explicit fragment comparison |
| D-OWNER: the falcon came from Rook's display | C07 + C08; engraving and illustration agree |
| D-ALIBI: Rook's manual-ringing account is false | C03 + C04 |
| D-PASSAGE: Rook recently used the service route | Latch fragment + June's cleaning-time statement + Rook's lining comparison |
| D-SIGHTING: June places Rook at the passage during the relevant interval | C05; retained as attributed testimony |
| D-MONEY: Rook personally received the unexplained 120-pound difference | The three financial records + verified interpretation from Mara OR reference |

Parentheses matter for D-MONEY: all three records are required, along with either valid translation source. Reading an unrelated reference or hearing Rook's unverified interpretation does not satisfy it.

A fully supported accusation requires all of:

- Culprit: Rook.
- Method: strike with the bronze falcon.
- Motive: stop disclosure of diverted restoration funds.
- D-WEAPON.
- D-MONEY.
- At least one accepted connection bundle below.

| Bundle | Required conclusions | Why it is accepted |
|---|---|---|
| A | D-ALIBI + D-PASSAGE | False account plus recent physical route evidence connects him to the relevant movement |
| B | D-ALIBI + D-SIGHTING + D-OWNER | False account, witness placement, and weapon provenance converge |
| C | D-PASSAGE + D-SIGHTING + D-OWNER | Physical route evidence, witness placement, and weapon provenance work without requiring the bell challenge |

This is a narrative deduction rubric, not a claim that these facts establish legal guilt under any real evidentiary standard. Testers must find the intended conclusion convincing; if a rival account remains equally plausible, improve the authored evidence rather than accepting an arbitrary answer key.

Further rules:

- Presenting a contradiction to Rook is optional once the underlying deduction has been made.
- Seeing his optional conversation with June is never required.
- The evidence for route A can be complete before Beatrice arrives. The final presentation requires her presence as host; the notebook directs a ready player to finish June's report and the gatehouse call if necessary. No passage of time substitutes for these actions.
- Dog completion alone is not evidence of guilt.
- Ada's argument is not an accepted murder motive for Rook.
- Using an alternate valid bundle receives the same complete ending.
- A player can explicitly state a proposed conclusion through the accusation interface; merely owning every clue does not automatically make it their conclusion.

## 5. Final presentation and feedback

**F01 — Player's supported explanation**

Player: “Elias found that the estate was charged one hundred and eighty pounds for sixty pounds of work. The remaining hundred and twenty went to Edmund Rook. Elias intended to show Beatrice tonight.”

Player: “The bronze fragment in the study fits the falcon hidden in the greenhouse. That was the object used against him.”

[Third paragraph adapts to accepted bundle; do not mention clues the player did not discover.]

Bundle A example:

Player: “Rook's account of ringing the bell cannot be true. The rope was disconnected. His jacket lining also caught on a passage latch June had cleaned that evening.”

Bundle B example:

Player: “Rook's bell story is impossible. June saw him enter the service passage, and the concealed falcon came from his office display.”

Bundle C example:

Player: “June saw Rook enter the passage. His lining caught on its freshly cleaned latch. The falcon hidden afterward came from his own display.”

**F02 — Rook responds**

Rook: “I meant to put the money back. Elias wouldn't give me time. He said Beatrice would know tonight.”

Beatrice: “And you chose to silence him.”

Rook: “Yes.”

[Confession confirms a previously supported account. The framing stays serious here.]

**F03 — Reconstruction**

Short reconstruction with brief explanatory text: Rook crosses the service passage; the falcon is shown on the desk without depicting violence; the lining catches; the automatic bell moves; the falcon is hidden beneath the potting material. Present the chronology as part of the explanation. Only introduce exact timing as reconstruction/confirmed confession, not as something the player somehow measured earlier.

**F04 — Cozy epilogue**

Beatrice: “Elias wanted this place cared for honestly. We can at least begin there.”

June: “I'll make some tea. There are several conversations this household should have had rather earlier.”

Mara, to Pip: “And you, apparently, have a new profession.”

[Optional secrets affect short additional lines. No joke interrupts the confession or diminishes the victim.]

**F05 — Correct suspect, missing support**

Beatrice: “You may be right, but that doesn't yet explain how the evidence connects him to what happened. Show us the missing link.”

[Feedback identifies the unsupported category: method, motive, or connection. Continue investigation.]

**F06 — Unsupported other suspect**

Example for Ada: “Ada's argument explains why she was upset. It doesn't connect her to the falcon or explain the missing money.”

[Use only evidence already discovered. Never reveal the missing money in feedback if the player has not found it; instead say the proposed motive lacks support. Offer review or continue.]

## 6. Map constraints to preserve the case

The exact building dimensions remain a level-design task, but the following geometry is required by the story:

- The study has a main hall door and a service-side door.
- June's position in the hall can see entry into the service passage but cannot see the study's service-side door. Her testimony must remain accurately limited.
- The bell alcove is on the accessible lower service route. Its disconnected manual mechanism must be clearly identifiable without climbing the tower.
- The office display is reachable without crossing a locked route that depends on solving the case.
- The study window is visible from the terrace, allowing Ada's last sighting while Elias draws the blackout curtains. Later closed curtains must not be treated as a contradiction of that earlier sighting.
- The terrace overlooks the fountain area, where Tomas is working during the murder window.
- The hedge blocks the greenhouse tray from the terrace. Seeing Tomas by the fountain does not imply total garden surveillance.
- Ada, Mara, and Tomas leave their outdoor positions after June's call, before the weapon is concealed.
- A dedicated service exit reaches the greenhouse side of the garden without passing through the main hall or kitchen. This allows Rook's later movement while Tomas is in the kitchen; the detailed floor plan must include that exit and its screened sightline.
- The greenhouse has one ordinary player-accessible door and a low vent Pip can sniff through. Pip does not enter or retrieve the weapon.
- Car occupants exit into a pedestrian space separated from the moving vehicle's route.

Suggested human-scale graybox targets: corridors wide enough for player/NPC passing, ordinary rooms approximately 6–10 meters across, garden circuit roughly 100–140 meters, and service-route travel comfortably under one minute. These are starting proportions to test in the chosen engine, not promises about final navigation time.

## 7. Playthrough route checks

### Friendly route, intended typical experience

Opening → study → Rook → June report → hall telephone → bell contradiction → Mara → Pip's walk → greenhouse → owner interview → June and lining → notebook → supported accusation.

Expected variation: after the call, the owner may arrive while the player heads elsewhere. The player can watch or continue; both produce the same essential access. Subsequent exploration never cancels an already-queued arrival.

### Independent investigator route

Opening → study → June → passage → Tomas case interview/greenhouse access → June report → hall telephone → recover falcon → owner access grant → office/reference cabinet → financial deduction → accusation using bundle C.

This route does not require Pip or the optional overheard meeting.

### Fast solver route

Opening → study → Rook → June report and lining account → hall telephone → bell mechanism → Mara/Pip → greenhouse → translation → accusation using bundle A as soon as the owner is present.

The arrival follows the completed call and can overlap subsequent exploration. An unusually fast player finishing in less than 30 minutes is acceptable; do not add a wait solely to force the duration target.

### Recovery route

Player completes the report/call, misses the arrival scene, refuses Pip, initially accuses Ada, then resumes → owner grants cabinet/office access → Tomas gives greenhouse direction → June repeats essential testimony → corrected deductions → supported ending.

This should still be completable, although an exploratory or struggling player may exceed the typical duration.

## 8. Quality checks for the approved core mystery

- Does the financial motive feel clear after a single read?
- Is it satisfying that careful readers may suspect Rook early from the financial papers, while still needing independent evidence to connect him to the murder?
- Is the financial document density appropriate for a cozy 30–45 minute case?
- Does the dog favor remain warm and believable given the recent death?
- Does each accepted evidence bundle support a convincing explanation when read without author commentary?
- Can a player reasonably distinguish June's observation from assumptions about where Rook went afterward?
- Are the exact unknowns, including cause/time of death before reconstruction, phrased honestly?
- Does the final reveal use only the evidence the player actually established until the confession confirms the remaining reconstruction?

These are story-quality questions for review and playtesting, not blockers to discussing the design.


## 9. Logic progression acceptance checks

- Each eligible study lead independently satisfies the early evidence prerequisite.
- Each of Rook, Ada, Tomas, and Mara supplies at least one accessible pre-arrival case interview.
- June's report is available after prerequisites in any order and is never lost after a rude dialogue choice.
- An early phone interaction gives guidance and does not consume the later call.
- The gatehouse call commits only after its exchange; interruption immediately stops the performance and returns to a safe before-or-after state. Manual saving is available once the interaction has settled.
- Repeating the call or reloading at queued/running/completed boundaries never produces a duplicate car, owner, or driver.
- The arrival can finish unseen, after which essential witnesses and permissions remain accessible.
- Declining Pip still permits arrival, library access, correct translation, and a supported ending.
- Rook's optional meeting depends on evidence actually shown to him or his alibi actually challenged.
- Runtime tests may inspect event flags, but player-perspective solvability tests must perform the actual report and telephone interactions.


## 10. Consistent replies and simple interaction rules

- Repeating Rook's alibi question before a relevant condition changes returns R02 again.
- Discovering the disabled rope enables its challenge topic; presenting it changes the corresponding account to R07. Rook does not learn about the discovery merely because the player found it.
- Repeating Mara's translation request before the favor/reference condition changes returns the same applicable response.
- Interrupting an exchange stops vocalization and conversational motion immediately. Reopening a topic uses its current eligible reply; no hidden conversation continues while closed.
- Completed discoveries and event effects remain recorded once. Uncompleted required actions do not advance the arrival or a favor.
- Saving uses one manual slot at a stable interaction boundary; Continue restores that case state without replaying completed rewards or duplicating arrivals.
