# Recorded sound credits

All recordings below are offered under **Creative Commons Zero 1.0 (CC0)** by their source pages. They may be redistributed and adapted, including in commercial projects. Source licenses checked on 2026-11-11. This file credits the recordists even though CC0 does not require attribution.

License: https://creativecommons.org/publicdomain/zero/1.0/
Legal text: https://creativecommons.org/publicdomain/zero/1.0/legalcode

| Game file | Recording / creator | Source |
| --- | --- | --- |
| `birds.ogg` | Ambient Bird Sounds — isaiah658 | https://opengameart.org/content/ambient-bird-sounds |
| `wind.ogg`, `fountain.ogg` | Park ambiences — Thimras | https://opengameart.org/content/park-ambiences |
| `fireplace.ogg` | Fireplace Sound loop — PagDev | https://opengameart.org/content/fireplace-sound-loop |
| `step-wood-1.ogg`, `step-wood-2.ogg`, `step-gravel-1.ogg`, `step-stone-1.ogg`, `step-grass-1.ogg`, `step-grass-2.ogg` | Different steps on wood, stone, leaves, gravel and mud — TinyWorlds; source recordings from pdsounds.org, edited by TinyWorlds | https://opengameart.org/content/different-steps-on-wood-stone-leaves-gravel-and-mud |
| `door-open.ogg`, `door-close.ogg` | Door Open, Door Close Set — qubodup | https://opengameart.org/content/door-open-door-close-set |
| `paper-1.ogg`, `paper-2.ogg` | Book Flip Sounds — Voltiment555 | https://opengameart.org/content/book-flip-sounds |
| `dog-bark.ogg` | Random Sounds Samples — Augmentality (Brandon Morris), submitted by HaelDB; CC0 option selected from the dual license | https://opengameart.org/content/random-sounds-samples |
| `engine.ogg` | engine_idle_loop_1.wav — RichieMcMullen | https://freesound.org/people/RichieMcMullen/sounds/386793/ |
| `murmur.ogg` | hmmmm — DAN2008 | https://freesound.org/people/DAN2008/sounds/165011/ |
| `telephone-ring.ogg` | Old style phone ringer.wav — MPTSound | https://freesound.org/people/MPTSound/sounds/552484/ |

## Adaptations and recording notes

Files are Ogg Vorbis, with DC offset removal, conservative level adjustment and short fades for one-shot effects. The ambient and engine loops use overlapping tail/head crossfades. `manifest.json` gives durations, measured decoded peak and RMS levels, original filenames, cuts and crossfade lengths. Wind is stereo; the remaining recordings were converted to mono for in-game spatial positioning. No oscillators, generated voices, or AI sound generation were used for these assets.

- Bird source: `birds-isaiah658_0.ogg`, a camera-microphone field recording cleaned by its creator.
- Wind: `park_ambience_wind.wav`, source seconds 40–75. Water: `park_ambience_river.wav`, seconds 80–110. These were recorded in a public park in Adelaide, South Australia; water is a small river over a low step, adapted as fountain ambience. These are atmospheric assets, not claims of historically or geographically exact sound.
- Fire: `fire.wav`, full recording with a loop seam crossfade.
- Footsteps: `[kdd]DifferentSteps.zip` files `wood01.ogg`, `wood03.ogg`, `gravel.ogg`, `stone01.ogg`, `leaves01.ogg`, `leaves02.ogg`. Leaf recordings provide the grass/ground variants.
- Doors: `qubodup-DoorSet.7z`, lossless `qubodup-DoorOpen01.flac` and `qubodup-DoorClose01.flac`.
- Paper: `BookFlip_SFX.zip`, `BookFlip1.wav` and `BookFlip4.wav`.
- Dog: `dog barking.ogg`, source seconds 2.72–3.17, isolated short bark.
- Engine: the creator describes a car engine ticking over; no exact vehicle model or historical authenticity claimed.
- Murmur: a person's short thinking “hmm”, used as a nonverbal acknowledgment; one performer, not a full character voice library.
- Telephone: recorded vintage-style ringer, recorded by MPTSound using a Tascam DR-40 and condenser microphones.

Freesound supplies public encoded previews of its recordings; these were used rather than an authenticated original-file download:

- Engine: https://cdn.freesound.org/previews/386/386793_7236624-hq.mp3
- Murmur: https://cdn.freesound.org/previews/165/165011_2992529-hq.mp3
- Telephone: https://cdn.freesound.org/previews/552/552484_2481400-hq.mp3

The audio assets were verified to decode, have nonzero signal and retain peak headroom. Levels and seams have been checked numerically; final subjective listening and in-game mixing remain part of game QA.
