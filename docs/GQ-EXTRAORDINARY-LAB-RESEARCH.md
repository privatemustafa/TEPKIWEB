# The Extraordinary Lab (GQ × Audemars Piguet) — Visual + Technical Research Report

> Reference experience: https://www.gq.com/sponsored/story/the-extraordinary-lab
> (UK mirror / interactive host: https://interactive.gq-magazine.co.uk/audemars-piquet-gq-rd5/)
> Studio: **Immersive Garden** (Paris) — Awwwards Agency of the Year. SOTD April 6, 2026.
> Purpose of this doc: reverse-engineer the cinematic scroll experience, beat-by-beat, then map it onto **TEPKİ — "FULLMETAL"** album promo site (hero 3D object = album cover instead of a watch). This is a brief for a separate implementation agent. Sections 8 and 9 are the actionable build spec.

Reference screenshots analyzed (live captures):
- `public/assets/gq-1.png` — intro / loader-reveal beat
- `public/assets/gq-2.png` — "Design & user experience" / click-to-explore beat
- `public/assets/gq-3.png` — "Innovation" environment beat
- `public/assets/gq-4.png` — macro detail / "Continue the journey" outro
Hero asset for our build: `public/album-cover.png` (analyzed below).

---

## 1. Overview & Creative Concept

"The Extraordinary Lab" is a single-page, scroll-driven cinematic WebGL experience built by Immersive Garden for Condé Nast / GQ to showcase **Audemars Piguet's RD#5** (the ultra-thin RD research series). Rather than a page of stacked sections, the whole thing is authored as **one continuous cinematic timeline** — the user scrolls (or drags) forward/backward through it "like a media player," and that single playhead simultaneously drives camera moves, scene/environment changes, 3D animation, UI transitions, atmospheric effects, dialogue, and the **sound mix**. The narrative is framed as a conversation between **Cam Wolf (GQ Watch Editor)** and **J Balvin**, whose projected silhouettes appear inside the scenes.

The emotional/cinematic intent: treat a wristwatch like a museum artifact in a darkened, reverent gallery. Slow, deliberate, "thumb on a jeweler's loupe" pacing (not a roller coaster). The watch is the only fully-lit object in a dark void; everything else — screens, blueprints, reflective floor, sunset horizon — exists to flatter it. The throughline is **"HERITAGE MEETS INNOVATION"**: heritage = warm sunset/ocean and scattered paper blueprints; innovation = cold blue x-ray screens and a clinical horizon-gradient lab. It is luxury product storytelling disguised as a documentary.

---

## 2. Tech Stack (best-effort, with confidence levels)

| Layer | Tech | Confidence | Why / Evidence |
|---|---|---|---|
| App shell / framework | **Nuxt.js (Vue)** | High | Listed explicitly on Awwwards SOTD tech tags. (Note: this is Vue, not React — see §9 for our React port.) |
| 3D rendering | **WebGL via Three.js** | High | Stated in Immersive Garden's own case study ("WebGL / Three.js"). |
| Motion authoring | **Theatre.js** ("Theater.js") | High | Case study: used as a *production pipeline* so designers + devs could tune camera/timing/transitions live, in-browser, instead of hardcoding. |
| Tweening / scroll orchestration | **GSAP** (+ ScrollTrigger-style scroll sync) | High | Listed in tech ("GSAP"); "scroll-synchronised timelines." |
| Smooth scroll | **Lenis** (or equivalent virtual scroll) | Medium | Not named, but the buttery scrub + drag-based navigation is the Lenis signature and standard in Immersive Garden work. |
| 3D content pipeline | **Blender** + **PBR** + **HDR lighting** | High | Tech tags ("Blender"); case study mentions PBR workflows and HDR lighting. |
| Model delivery | **glTF/GLB + Draco/meshopt**, streamed | Medium-High | webgpu.com note: "watch the geometry stream in" via Network tab — implies chunked/streamed glTF. |
| Custom shaders | **GLSL** (planar reflections, billboard reflections, parallax mapping) | High | Case study explicitly lists "custom shaders / billboard reflections / parallax mapping / planar reflections." |
| Post-processing | **Bloom / tone mapping** (rim/edge glow), likely subtle DOF | Medium | Visible edge-glow on pedestal + bloom on highlights; standard postprocessing stack. |
| Audio | **Web Audio API / Howler-class wrapper** | High | "Audio acts as navigation"; sound progression tied to the timeline; SOUND toggle present. |
| Accessibility | **prefers-reduced-motion** handling | Medium-High | webgpu.com explicitly: "Toggle prefers-reduced-motion and see what concessions were made." |
| Reported scope | ~10 people, ~3.5 months | High | Stated in case study. Runs ~60fps even on older phones (claimed). |

**Net:** the real site is Vue/Nuxt + Three.js + Theatre.js + GSAP. For our rebuild we translate this to **Next.js + React Three Fiber + GSAP/ScrollTrigger + Lenis** (§9), since the rest of TEPKİWEB is already Next.js 14 + GSAP.

---

## 3. Loading Experience (the gate before the scene)

The experience does not reveal the 3D scene until assets (heavy GLB geometry, HDR env maps, textures, audio) are streamed in. Expected pattern (industry-standard for this studio, inferred):

- **Beat 0 — Preloader gate.** Black screen, centered minimal type (GQ × AP lockup), a **numeric percentage counter 0→100%** and/or a thin progress bar. A short brand statement and a **"click anywhere to enable sound"** prompt (the UK mirror exposes this exact string) — required because browsers block autoplay audio until a user gesture.
- The first click both **unlocks the Web Audio context** and triggers the **reveal transition**: the loader fades/wipes and the camera eases into the intro room (Beat 1) as ambient pad + low drone fade up.
- Reduced-motion / low-power devices likely get a lighter env map, fewer reflections, and a faster/curtailed intro.

For our build, treat this as a **hard loading gate**: don't start the scroll timeline until `useProgress()` (drei) reaches 100% AND the user has clicked to enable audio.

---

## 4. Scroll-by-Scroll / Chapter-by-Chapter Breakdown

The site is one continuous timeline. The on-screen chapter label cycles through (from the UK mirror DOM): **"Audemars Piguet DNA" → "Design & user experience" → "Innovation"**, bracketed by an intro and a "Continue the journey" outro. Below, each beat is reconstructed from the four screenshots + case study. The bottom-center label and the bottom waveform are persistent (see §5).

### Beat 0 — Loader
- **Screen:** black, percentage counter, GQ×AP lockup, "click anywhere to enable sound."
- **Camera:** static / pre-roll.
- **Audio:** silent until gesture, then ambient fade-in.
- **Exit:** click → wipe to Beat 1.

### Beat 1 — Intro: "HERITAGE MEETS INNOVATION" (chapter: Audemars Piguet DNA)
*(see `gq-1.png`)*
- **On screen:** a dark gallery room. Mid-left, a **large cinema screen / video wall** plays a soft-focus **sunset over an ocean** (warm orange horizon at the waterline, cool blue-grey sky, slightly pixelated/LED texture). Center-right sits a **low black rectangular pedestal/plinth** with a glowing rim-light tracing its top edges (the watch is still *inside/closed* — not yet revealed). Center screen: large semi-transparent title **"HERITAGE MEETS INNOVATION"** (thin uppercase, sits over the scene at ~40% opacity, partially overlapping the pedestal). Floor is dark and faintly reflective.
- **Camera:** slow dolly-in toward the pedestal; gentle, near-still.
- **Animates:** title fades/holds; horizon video loops; pedestal edge-glow breathes; subtle floating dust/atmosphere.
- **Hero behavior:** dormant inside the box.
- **UI:** top-left **GQ × AP** logos; top-right **SOUND** toggle; bottom **audio waveform** line; bottom-center **"· AUDEMARS PIGUET DNA ·"** label.
- **Audio:** ambient room tone + the warm "heritage" pad; first lines of Cam/Balvin dialogue may begin.

### Beat 2 — The Reveal / Lift-off
- **On screen (transition):** the pedestal opens / the watch **rises and lifts off** the plinth, the room lights subtly shift, the sunset screen pushes to the side.
- **Camera:** pulls back slightly and orbits a few degrees so the watch becomes the clear focal subject.
- **Hero behavior:** the watch ascends and begins a slow continuous **idle rotation / float**.
- **Audio:** musical swell marks the reveal.

### Beat 3 — "Design & user experience": Hero presentation + hotspot
*(see `gq-2.png`)*
- **On screen:** the **RD#5 watch (steel case, blue chronograph dial, integrated bracelet)** floats above a pale reflective slab/runway. The environment has flipped warmer/lighter on the right (a tall **sunset-gradient panel** glows pink/blue at frame-right). The **floor is now a glossy mirror** scattered with **blueprints / technical papers** (planar-reflected). A thin **leader line** runs from the watch's pusher to a hotspot marker labeled **"+ CLICK TO EXPLORE"** (top-right). A faint attributed **pull-quote** sits center-low: *"Even the touch of the new pusher really feels like a leap forward."* with a small speaker credit ("J BALVIN / AP COLLECTOR" style). **Prev/next chevron arrows** ( ‹ › ) appear mid-left.
- **Camera:** slow push toward the case side / pusher; slight parallax as you scrub.
- **Animates in:** leader line draws on; hotspot pulses; quote fades up; blueprint reflections drift.
- **Hero behavior:** continues idle rotation; clicking the hotspot triggers a focused **detail zoom** on the pusher (interaction state).
- **UI:** same persistent chrome; chapter label now "DESIGN & USER EXPERIENCE."
- **Audio:** dialogue about the design/feel; mix tightens around the spoken line.

### Beat 4 — "Innovation": Lab environment with floating screens / exploded internals
*(see `gq-3.png`)*
- **On screen:** the environment transforms into a **clinical curved horizon gradient** — a bright glowing band across the middle of a dark blue void (like a planetary horizon / softbox), with thin vertical support lines. The watch sits centered on a reflective dark platform with a **circular shadow/halo** beneath it. **Two floating screens** hover behind: left one shows a **blue x-ray / wireframe of the movement (flying tourbillon)** on black; right one shows a **macro photo of the caseback/movement** mounted on a thin stand. More **blueprints lie flat** on the reflective floor. Center-low **pull-quote:** *"This one? You forget that you're even wearing it sometimes."*
- **Camera:** wider, slightly lower angle to take in both screens; slow lateral drift (parallax between watch and the two background screens).
- **Animates in:** screens slide/fade up from behind; x-ray content animates; halo intensifies.
- **Hero behavior:** rotates to present the dial; possibly a subtle **exploded-view** or movement highlight tied to scroll.
- **UI:** chapter label "‖ INNOVATION ‖"; **progress dots** flank the waveform; prev/next chevrons.
- **Audio:** colder, more "innovation/lab" tonal palette; dialogue continues.

### Beat 5 — Macro detail beauty pass
*(see `gq-4.png`)*
- **On screen:** everything goes to **pure black**. An **extreme macro of the watch's side profile** — the brushed case flank, two rectangular pushers, and the central **octagonal "AP" crown** — lit by a single hard top rim light. No environment, no screens; just the object as sculpture.
- **Camera:** locked-off macro, very shallow depth of field; tiny breathing move.
- **Animates:** light sweeps slowly along the brushed metal; rest of frame stays black.
- **Hero behavior:** near-still hero pose; the climax "money shot."
- **UI:** chrome dims to minimum (logos + SOUND only at top); prev/next chevrons top-center.

### Beat 6 — Outro: "Continue the journey"
*(also `gq-4.png`, end state)*
- **On screen:** still on black, a bottom-center **button "› CONTINUE THE JOURNEY"** (outlined pill). This is the CTA hand-off (to AP/GQ editorial or product).
- **Camera:** settles / holds.
- **Animates:** button fades up; ambient bed resolves.
- **Audio:** music resolves to a soft tail; SOUND toggle still available.

---

## 5. Persistent UI Chrome

These elements live in a fixed HTML/CSS layer **above the canvas** and persist across the whole timeline, changing only state/label:

- **Top-left:** `GQ ✕ [AP]` co-brand lockup (small, white). Always visible.
- **Top-right:** **SOUND** toggle (text button). Toggles the master audio mute; the tiny equalizer-bars glyph next to GQ animates when sound is on.
- **Bottom-center label:** the **chapter name** in spaced caps with small dot/bar tick marks, e.g. `· AUDEMARS PIGUET DNA ·`, `‖ INNOVATION ‖`. Cross-fades as you cross chapter thresholds.
- **Bottom audio waveform:** a thin horizontal **reactive waveform line** spanning the lower third, tinted with a warm orange→cool blue gradient. It doubles as a **scrubber/progress bar** of the cinematic timeline and reacts to the audio amplitude. **Progress dots** sit along it marking chapter anchors.
- **Prev/next chevrons** ( ‹ › ): appear once past the intro, let you jump chapter-to-chapter (the "media player" metaphor).
- **Click-to-explore hotspots:** contextual, per-beat (Beat 3), not persistent.

Behavior: chrome is minimal and recedes during beauty passes (Beat 5–6 strips it back to logos + SOUND), and is fully present during informational beats.

---

## 6. Motion / Animation Principles

- **Single scrubbed master timeline.** One playhead (scroll position → normalized 0..1) drives *everything*. Forward and backward are symmetric (you can scrub back). Authored in Theatre.js, played via GSAP/ScrollTrigger scrub.
- **Smooth-scroll inertia.** Virtual/smooth scroll (Lenis-style) so the camera motion is eased and continuous, never 1:1 jumpy. Scrub smoothing (`scrub: ~1–1.5`) so the playhead lags scroll slightly = silky.
- **Hold beats.** Transitions "hold still long enough to read the watchmaking" — i.e. long dwell ranges between movement bursts so the eye can rest on info. Don't animate continuously.
- **Parallax depth.** Background screens, blueprints, and horizon move at different rates than the hero → strong depth. Planar/billboard reflections reinforce the Z-volume.
- **Reveal patterns:** leader lines *draw on* (stroke-dash style), text fades up with a slight Y-rise, screens slide in from behind the hero, halos bloom in.
- **Hero idle:** constant slow float (sin-based bob) + slow rotation independent of scroll, so the object feels alive even when the playhead is paused.
- **Pinning:** the canvas is effectively pinned full-viewport for the whole experience; "sections" are just timeline ranges, not stacked DOM. Scroll height is a tall virtual track that maps to timeline progress.
- **Easing:** expo/quart ease-in-out for camera; the overall feel is heavy, expensive, deliberate.
- **Reduced motion:** disable idle float + heavy reflections, shorten/skip transitions, possibly fall back to discrete chaptered states.

---

## 7. Color, Lighting, Material Language

- **Base:** near-black gallery void; everything emerges from darkness. High contrast, low key.
- **Two-temperature story:** **warm** (heritage) = sunset orange/peach horizon + warm paper blueprints; **cool** (innovation) = clinical blue x-ray screens + blue-grey horizon gradient. The waveform gradient (orange↔blue) encodes this duality.
- **Rim / edge glow:** the pedestal's top edges glow (emissive seam); highlights on the steel case bloom slightly. Bloom postprocessing on speculars only, not flat.
- **Reflective floor:** glossy planar-reflected slab — blueprints and the hero double underneath. Key signature of the "premium" look.
- **Gradient horizon:** a softbox/curved-light band as the only background light source in the Innovation beat — reads as both environment and key light.
- **Materials:** PBR metal (brushed + polished steel), glass dial, matte black plinth, emissive screens. HDR env map for crisp specular reflections on the case.
- **Type:** thin, wide-tracked uppercase sans for chrome/labels; a lighter serif/italic for the human pull-quotes (editorial voice vs system voice).

---

## 8. MAPPING TABLE — GQ Beat → TEPKİ "FULLMETAL" Album Site

**Hero swap:** the floating RD#5 watch → the **FULLMETAL album cover** (`public/album-cover.png`).

*Album-cover description (for the 3D treatment):* cream/ivory background; top-down shot of a shirtless, heavily tattooed bald man (Tepki) bending forward; warped **liquid-chrome "FULLMETAL"** lettering smeared around him with steel-blue edge fringing; a small metal **monogram mark** centered at the bottom. Palette: ivory + chrome/steel-blue + black ink. This palette is the inverse of GQ's dark room — lean into a **bright/overexposed "metal" gallery** as our signature, with chrome as the recurring material.

**Treatment options for the hero:** (a) a thick **album slab / vinyl-jacket** with the cover as the front face, beveled chrome edges (closest analog to the watch-as-object); or (b) a **floating chrome-framed canvas** of the cover. Recommend (a) — a physical album object you can rotate, flip to a back/tracklist face, and "explode."

Narrative arc = the album's geographic journey: **Sefaköy → Tiflis → Buenos Aires**, plus **Tracklist** and **Merch** beats and a **footer/continue** beat.

| # | GQ beat | TEPKİ equivalent | Hero behavior | Environment | UI overlay | Audio |
|---|---|---|---|---|---|---|
| 0 | Loader gate | **Loader** — % counter, "TEPKİ" + "FULLMETAL" lockup, "tap to enter / enable sound" | Cover hidden in a chrome case/crate | Black→ignite | %; tap prompt | silent → beat drops on tap |
| 1 | Intro "Heritage meets Innovation" | **Intro — "FULLMETAL"** title over the scene; concept statement | Album slab dormant on a chrome plinth, rim-glow | Overexposed ivory "metal room" w/ video wall (city B-roll) | Top-left `TEPKİ ✕ FULLMETAL`; top-right `SES/SOUND`; bottom waveform; label `· FULLMETAL ·` | intro ambience / album intro track |
| 2 | Reveal / lift-off | **Drop** — cover lifts off plinth, idle float begins | Rises, slow rotation | Lights bloom | swell | hook hits |
| 3 | "Design & UX" + hotspot | **Chapter 1 — SEFAKÖY** (origin / home) | Float + click hotspot → zoom a cover detail (tattoo / monogram) | Warm side-panel; reflective floor w/ scattered lyric sheets | `+ KEŞFET / EXPLORE` hotspot; pull-quote (a lyric); chapter `SEFAKÖY`; ‹ › | Sefaköy track stem; spoken intro line |
| 4 | "Innovation" lab + screens | **Chapter 2 — TİFLİS** (transition / journey) | Rotate to back face; subtle explode of layers | Cool blue horizon gradient; **two floating screens** = music video still + lyric/x-ray of the cover | quote (lyric); chapter `TİFLİS`; progress dots; ‹ › | Tiflis track; colder mix |
| 5 | Macro beauty pass | **Chapter 3 — BUENOS AIRES** (climax) | Extreme macro on chrome lettering / monogram, light sweep | Pure black, single rim light | minimal chrome; ‹ › | climactic track peak |
| — | *(new)* | **Tracklist beat** | Cover flips to **back face = tracklist**; tracks list reveal-up, each row hover-scrubs a preview | Dark studio; the album object as menu | numbered tracklist; click row → play preview | per-track preview on hover/click |
| — | *(new)* | **Merch beat** | Album object morphs/dissolves to **merch** (tee/hoodie/vinyl) carousel on chrome pedestals | Bright ivory shop-gallery | product cards, price, `SEPETE EKLE / ADD` (Supabase-backed) | beat continues, ducked |
| 6 | "Continue the journey" outro | **Footer / Continue** — `DİNLE / LISTEN` + socials | Cover settles, slow spin | Black, button fades up | `› DİNLE (Spotify/Apple)`, socials, credits | music resolves to tail |

**Quote/text swaps:** replace AP pull-quotes with **Tepki lyric snippets** per chapter, and the system labels (chapter names) with the city names. Keep the same *structure* (system caps labels vs human italic quotes).

---

## 9. Implementation Plan — Next.js 14 + React Three Fiber

The repo is already **Next.js 14 (App Router) + React 18 + GSAP + Tailwind + Supabase**. Add the R3F stack on top.

### 9.1 Exact npm packages to add
```bash
# 3D core
npm i three @react-three/fiber @react-three/drei
# postprocessing (bloom, tone mapping, DOF, vignette)
npm i @react-three/postprocessing postprocessing
# smooth scroll + scroll-driven animation
npm i lenis
# gsap is already installed (^3.12.5); register ScrollTrigger from it
# state
npm i zustand
# audio
npm i howler && npm i -D @types/howler
# (optional) timeline authoring like Theatre.js, if you want live tuning
npm i @theatre/core @theatre/studio
# types
npm i -D @types/three
```
Notes: use GSAP **ScrollTrigger** (bundled in `gsap/dist/ScrollTrigger`) for the scrubbed master timeline; use **Lenis** for smooth/virtual scroll and feed its scroll value into ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`. Theatre.js is optional but matches the original pipeline (lets you keyframe camera in-browser, then ship the saved state JSON and remove `@theatre/studio` from prod).

### 9.2 Architecture
- `app/page.tsx` — full-viewport pinned `<Canvas>` (fixed position) + a tall scroll spacer `div` (e.g. `height: 700vh`) that defines timeline length. HTML UI chrome layered above with `pointer-events` managed per element.
- `components/Experience.tsx` — R3F scene: hero album object, environment, screens, reflective floor.
- `components/Hero.tsx` — the album slab. Build a beveled box geometry; front face = `album-cover.png` as a texture (`useTexture`), edges = chrome `MeshStandardMaterial` (metalness 1, low roughness) under an HDR env map (`<Environment preset="studio" />` or a custom `.hdr`). Idle float via `useFrame` (sin bob + slow Y rotation).
- `components/CameraRig.tsx` — single camera whose position/target are driven by the normalized timeline progress (lerp between authored keyframes per beat).
- `lib/timeline.ts` — define beats as an array of `{ id, range:[start,end], camera, heroState, env, ui }`; a Zustand store holds `progress` + `activeBeat`; ScrollTrigger `onUpdate` writes `progress`.
- `components/ui/*` — Chrome (TopBar with TEPKİ✕FULLMETAL + SOUND), Waveform/scrubber, ChapterLabel, Quote, Hotspot, Chevrons, Tracklist, Merch, Footer. Pure DOM/Tailwind, driven by `activeBeat` from the store.
- `components/AudioManager.tsx` — Howler; master track + per-chapter stems; unlock on first gesture; SOUND toggle mutes master; (optional) `AnalyserNode` → drive the waveform amplitude.
- `components/Loader.tsx` — drei `useProgress()`; gate the timeline until 100% + audio-unlock click.

### 9.3 Reflective floor & screens
- Floor: drei `<MeshReflectorMaterial>` (planar reflection, blur, mixStrength) — direct analog to the site's reflective slab. Scatter "lyric sheet" planes on it.
- Background screens: simple planes with `meshBasicMaterial` + video/image textures; parallax them at a different rate than the hero by offsetting their position by `progress`.
- Postprocessing: `<EffectComposer><Bloom/> <ToneMapping/> <Vignette/></EffectComposer>` — keep bloom threshold high so only chrome speculars glow.

### 9.4 Asset checklist
- [x] `public/album-cover.png` (hero front face — exists)
- [ ] `public/album-back.png` or generated tracklist face (Tracklist beat)
- [ ] HDR environment map (`/hdr/studio.hdr`) for chrome reflections (keep ≤1–2 MB, equirect 1k–2k)
- [ ] City B-roll loops for the video wall (Sefaköy/Tiflis/Buenos Aires) — short, compressed `.mp4`/`.webm`, muted, looped
- [ ] Music-video stills / "x-ray" lyric art for the two floating screens
- [ ] Lyric-sheet textures for the reflective floor
- [ ] Audio: master/intro track + per-chapter stems + per-track previews (compressed, e.g. ~96–128 kbps for previews)
- [ ] Merch images (tee/hoodie/vinyl) — Supabase-backed product data
- [ ] Fonts: wide-tracked uppercase sans (chrome/labels) + an italic serif (lyric quotes)
- [ ] Optional: if using a 3D album model instead of slab, a Draco-compressed `.glb`

### 9.5 Performance notes
- **Loading gate:** don't mount/run the timeline until `useProgress().progress === 100` AND audio unlocked. Show % counter (Beat 0).
- **Streaming:** Draco/meshopt-compress any GLB; lazy-load heavy textures per beat (don't load Merch images at start). Use `<Suspense>` boundaries.
- **Mobile fps:** cap `dpr={[1, 1.5]}`; drop `MeshReflectorMaterial` blur/resolution or swap to a cheap fake-reflection plane on mobile; reduce bloom; fewer floor papers; pause `useFrame` work when tab hidden.
- **LOD / quality tiers:** detect device (or low fps) and tier down — disable postprocessing + reflections on low tier; smaller HDR.
- **prefers-reduced-motion:** `const reduced = useReducedMotion()` → disable idle float, smooth-scroll inertia, and long camera moves; present chapters as discrete fade states; still allow scrubbing.
- **Scroll:** Lenis with conservative `lerp` (~0.08–0.12) and ScrollTrigger `scrub: 1`. On touch, ensure Lenis touch handling is enabled and the tall spacer is real scrollable height.
- **Audio:** preload only the current + next chapter stems; unload distant ones. Always provide the SOUND mute (some browsers/users want silence).
- **SSR:** `<Canvas>` and Lenis are client-only — wrap in `'use client'` and `dynamic(() => import(...), { ssr: false })` for the experience component to avoid hydration issues.

---

## Sources
- Immersive Garden case study via Awwwards: https://www.awwwards.com/gq-audemars-piguet-the-extraordinary-lab.html
- Awwwards SOTD (tech tags: Nuxt.js, Blender, WebGL, 3D): https://www.awwwards.com/sites/gq-ap-the-extraordinary-lab
- WebGPU.com showcase (stack + DevTools notes): https://www.webgpu.com/showcase/extraordinary-lab-audemars-piguet-webgl/
- UK mirror (chapter labels, "click anywhere to enable sound"): https://www.gq-magazine.co.uk/bc/the-extraordinary-lab
- Live experience: https://www.gq.com/sponsored/story/the-extraordinary-lab
- Local screenshots: `public/assets/gq-1..4.png`; hero `public/album-cover.png`

*Confidence: chapter labels, studio, and named tech (Nuxt, Three.js, Theatre.js, GSAP, Blender, PBR, shaders, planar reflections) are confirmed by sources. Exact camera coordinates, easing curves, Lenis/Howler usage, and bloom params are inferred from the screenshots + studio conventions and marked Medium confidence where noted.*
