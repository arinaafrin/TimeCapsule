# TimeCapsule × Timescope — Corrected Architecture & Full Solution

## Part 0 — What Timescope *actually* does (correcting my earlier framing)

I previously described the goal as "a linked past/present/future trio at one location." Having now read
the homepage, the Know-How page, and the full "Origins of Paris" experience page in detail, that
framing was **wrong in several important ways**. Here's what's actually true:

| What I assumed | What Timescope actually does |
|---|---|
| One location, three points in time (100y ago / now / +50y future) | One **guided walking route** (~1.2km, ~1 hour), with **multiple physical stops** along it |
| A "trio" per experience | **"The Origins of Paris" has 15+ different eras** across its stops — Gallo-Roman Lutetia, the 885 Viking siege, medieval Place de Grève, the construction of Notre-Dame, the frozen Seine, the 1910 flood, the 1889 World's Fair, etc. Each *stop* shows a different era, not the same three eras repeated |
| Past + present + future | **100% historical. There is no future/speculative content anywhere in their real product.** The "future" leg is a TimeCapsule idea, not a Timescope-validated one — I should not have implied otherwise |
| "Present" is generated | "Present" is simply **the live view already in front of the visitor** — no generation needed, it's real life, seen a second before the binoculars overlay the past |
| VR headsets | A **proprietary "Binoculars" device** — hangs around the neck, raised to the eyes only at each stop, explicitly *not* a closed VR headset ("no dizziness or motion sickness," "amplifies reality instead of replacing it," usable from age 8, works over prescription glasses) |
| AI-generated imagery | **Real 3D reconstructions** built by in-house 3D artists from **archival sources** (plans, engravings, photographs, testimonies), drawn from a proprietary library of **10,000+ historical 3D assets**, iteratively validated by a **historian-led scientific committee** across five formal steps (sourcing → narrative → 3D build → committee iteration → final validation) |
| Free/self-serve product | A **paid, ticketed, guided small-group experience** (€19–28/person, up to 15 people per departure), booked through the Fever ticketing platform, offered in **French, English, and Spanish**, with group/school rates and gift cards |

This matters because it changes what "genuine Timescope-style" should mean for your project. The
single most defining structural feature isn't a 3-year trio — it's **one Journey containing several
Stops, each anchored to a different real coordinate along a route, each showing a different era**,
built from real sources and human-reviewed. I've redesigned the architecture below around that, while
still fully supporting your original ask (a simpler single-location past/present/future case is just a
3-stop Journey at one shared coordinate — a special case of the same model, not a separate system).

---

## Part 1 — Modules, with short explanations

| # | Module | What it does |
|---|---|---|
| 1 | **Journey** | Replaces the rigid "trio" concept. A themed collection of Stops (e.g. "Origins of Paris") — could be 2 stops (a simple before/after) or 15+ (a full Timescope-style walk) |
| 2 | **Stop** | One point in the Journey: a coordinate (or reuses an existing `City`/pin), a year, an era label, and its own generated/sourced content. This *is* what your `Experience` model already is — Stops become Experiences linked to a parent Journey |
| 3 | **Location & Route** | Coordinates per Stop, plus an optional ordered walking route between them (distance, path) for a real in-person guided-walk product |
| 4 | **Archival Content Sourcing** | Pulls real historical photographs from public-domain/licensed archives instead of (or alongside) AI-generated images |
| 5 | **AI Narrative Generation** | Already built — extended so each Stop's prompt knows its Journey context (era ordering, neighboring stops) |
| 6 | **3D/Asset Pipeline (optional, higher tier)** | For true Timescope-parity, static 360° images aren't enough long-term — real reconstructions need 3D scene assets. Flagged as a major, separate future investment, not something to fake |
| 7 | **TTS Narration Audio** | Real spoken-word audio generation, multi-language, replacing the currently-empty `audio_narration_url` field |
| 8 | **Transition Viewer** | New WebXR viewer mode that sequences through a Journey's Stops with cross-fade transitions, instead of one static panorama per page load |
| 9 | **Public Preview Mode** | Unauthenticated browsing of a limited free tier, serving the Tertiary Persona properly |
| 10 | **Scientific Committee Moderation** | Extends the existing single-admin approve/reject into multi-reviewer historian review with source citations |
| 11 | **Booking/Commerce** *(flagged, not built now)* | Ticketing, guided in-person slots, group rates — this is what actually makes Timescope a business; a real scoping decision, not something to bolt on lightly |
| 12 | **Internationalization (i18n)** | UI + narration audio in English and major European languages |

---

## Part 2 — How each time period's data actually gets created

### Past
**What's needed:** for genuine Timescope-level output, real archival sources — not just an AI text
prompt. Two viable tiers:

- **Tier A (fast, what you have today, extended):** AI-generated 360° image + AI-written narrative,
  now informed by real sourced material when available (see below), always disclosed as an AI
  reconstruction rather than a verified photograph.
- **Tier B (real archival, Timescope-parity):** actual historical photographs pulled from public-domain
  or licensed archives, optionally used as **reference input** to an AI image model (img2img) so the
  generated panorama is anchored to a real photo rather than pure imagination, or displayed directly
  as a flat historical photo overlay instead of a 360° render when no genuine 360°-capable source exists.

**Where the real photos come from** (all have usable APIs):
- **Library of Congress** (`loc.gov` API) — huge US public-domain photo archive
- **Wikimedia Commons API** — enormous, free, includes many European city archives
- **Europeana API** — EU-funded aggregator across hundreds of European museums/archives, ideal given your European-language requirement
- **Gallica (BnF, France)** API — French National Library, strong Paris-era material (directly relevant if you ever cover Paris like Timescope does)
- **Rijksmuseum API**, **British Library**, **National Archives (UK/US)** — additional strong sources depending on target cities

**Data needed per Stop for the past:** city/coordinate, year, era label, one or more sourced image
references (archive name, source URL, license, photographer/attribution if known), and the historian's
short sourcing note — mirroring Timescope's own "Historical sourcing" credit line on their experience
pages.

### Present
**What's needed:** genuinely nothing to *generate* — it's real life. Three practical options, in order
of effort:
1. **Partner-supplied modern photo** of the exact spot (simplest, matches your existing upload flow)
2. **Google Street View Static API** image for the pinned coordinate (automatic, no partner effort)
3. **Live camera passthrough** on the visitor's own device (true "look up from your phone/headset and
   see today" AR effect) — a real stretch goal, meaningfully harder (device camera + AR anchoring), not
   a small addition

### Future (+50 years)
**Be direct with yourself here:** this is **not a Timescope-validated concept** — it's your product's
own differentiator. That's fine, but it should be presented to users as clearly speculative, never as
"verified" the way the past content is. Already-built prompt logic (the `isFutureYear()` branch) is the
right foundation — extend it with: real current trend data as grounding input (climate projections,
published urban development plans for that specific city if available) rather than the model
free-associating, and a persistent, unmissable "Imagined Future — Not a Prediction" UI label everywhere
this content appears.

---

## Part 3 — Full solution

### 3.1 Data model changes

```
journeys
 ├─ id (uuid, PK)
 ├─ title                    e.g. "Origins of Paris"
 ├─ description
 ├─ city_id (FK -> cities)
 ├─ created_by (FK -> users)
 ├─ status (draft, pending_review, published)
 └─ created_at / updated_at

journey_stops                  (replaces the ad-hoc "trio", generalizes to N)
 ├─ id (uuid, PK)
 ├─ journey_id (FK -> journeys)
 ├─ experience_id (FK -> experiences)     -- reuses everything already built
 ├─ sequence_order (integer)
 ├─ stop_latitude / stop_longitude        -- may differ per stop along a route
 └─ created_at / updated_at

archival_sources                (new — Tier B real-photo sourcing)
 ├─ id (uuid, PK)
 ├─ experience_id (FK -> experiences)
 ├─ archive_name           e.g. "Europeana", "Gallica"
 ├─ source_url
 ├─ license
 ├─ attribution_text
 └─ retrieved_at

narration_audio                 (new — replaces the unused audio_narration_url pattern)
 ├─ id (uuid, PK)
 ├─ story_content_id (FK -> story_contents)
 ├─ language_code           e.g. "en", "fr", "de", "es"
 ├─ audio_storage_path
 ├─ tts_provider
 └─ created_at
```

`Experience` (your existing model) becomes reusable as a "Stop" unchanged — this avoids a disruptive
rewrite. A single-location past/present/future request becomes simply: one `Journey`, three
`journey_stops`, all sharing one coordinate, years `base-100`/`current`/`current+50`.

### 3.2 Generation endpoint

```
POST /api/v1/journeys
{
  "title": "Origins of Paris",
  "city_id": "...",
  "stops": [
    { "year": 1889, "era_label": "World's Fair", "latitude": ..., "longitude": ... },
    { "year": 2026, "era_label": "Present day" },
    { "year": 2076, "era_label": "Imagined future" }
  ]
}
```
Dispatches one `GenerateJourneyJob` that fans out to the existing per-stop `GenerateStoryJob` /
`GenerateMediaJob` pipeline (reused, not rebuilt), tracked via a `journey_generation_jobs` status
so the frontend can show "3 of 3 stops generated" progress.

### 3.3 Transition viewer

A new `JourneyViewer` component wrapping the existing `ImmersiveViewer`: preloads all stops' panoramas,
cross-fades between them (opacity transition on the sphere's texture, or a shared shader uniform for a
smoother blend), with a timeline scrubber UI recreating the "raise the binoculars, present fades, past
takes its place" moment as an explicit, satisfying interaction rather than a page reload.

### 3.4 TTS integration

Recommended: **ElevenLabs** (best multilingual quality, simple API) or **Azure Speech** / **Google
Cloud TTS** (broadest European language coverage, better enterprise pricing at scale) — either fits the
existing async-job pattern as a new `GenerateNarrationAudioJob`, mirroring `GenerateStoryJob`. Target
languages: English plus major European languages — French, German, Spanish, Italian, Portuguese, Dutch
— all supported by any of the three providers above.

### 3.5 Public preview mode

Add unauthenticated read-only routes (`/preview/journeys/{id}`) serving a capped, watermarked, or
single-stop-only preview, with the full experience gated behind login — directly serving the Tertiary
Persona ("browses free/preview... before deciding to purchase") without touching the existing
authenticated flows.

### 3.6 Scientific Committee moderation

Extend `moderation_logs` to support multiple named reviewers per experience with a required source
citation field, and a "consensus" status that only flips to approved once all assigned reviewers have
signed off — a real analogue to Timescope's iterative committee process, not just a label.

---

## What I'd actually build first

Given everything above, the highest-leverage first slice is **Journey + Stop data model, the
generation endpoint, and the Transition Viewer** — that's the true structural core of "genuine
Timescope-style," and everything else (real archival sourcing, TTS, public preview, committee
workflow) can layer on afterward without rework.

Want me to start there — TDD-first, backend then frontend, same process as every milestone so far?
