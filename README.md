# Instructional Supervision System — Presentation

A 10–12 minute presentation of the research study *Instructional Supervision System: A Data-Driven Automated System for Monitoring and Evaluation of Teachers’ Performance* (Reynel Mario Canor, La Salle Green Hills, 2026).

- `site/` — the website deployed to Cloudflare Pages (`instructional-supervision-system`): a home page to choose a version, `site/v1/` and `site/v2/`.
- `deck-v1/` — Version 1 (concise; Problem, Solution, Results) slide files, one HTML `<section>` per slide, speaker notes in `<aside>`.
- `deck-v2/` — Version 2 (follows the paper, full script in the notes) slide files.
- `scripts/build-site.js` — rebuilds a version's page from its deck folder:

```bash
node scripts/build-site.js deck-v1 site/v1/index.html
node scripts/build-site.js deck-v2 site/v2/index.html
```

Controls: ← / → or click to change slides, **N** for speaker notes, **F** for full screen. Link to a slide with `#slide-7`.

## Deploying

The site is deployed to Cloudflare Pages as a single advanced-mode worker that embeds `site/` (no separate asset upload):

```bash
node scripts/build-site.js deck-v1 site/v1/index.html
node scripts/build-site.js deck-v2 site/v2/index.html
node scripts/build-worker.js site dist/_worker.js
```

Then upload `dist/_worker.js` as a Pages direct-upload deployment (multipart form: `branch=main`, `manifest={}`, `_worker.js=@dist/_worker.js`).

## Offline copies

`offline/` holds a self-contained copy of each version that needs no internet:

- `Instructional-Supervision-System-Version-1.html` / `-Version-2.html` — the full presentation (images and fonts embedded, speaker notes with **N**, full screen with **F**). Open by double-clicking.
- `Instructional-Supervision-System-Version-1.pdf` / `-Version-2.pdf` — one slide per 16:9 page, as a fallback for any computer.

Rebuild the HTML copies after changing a deck:

```bash
python3 scripts/build-offline.py site/v1/index.html offline/Instructional-Supervision-System-Version-1.html
python3 scripts/build-offline.py site/v2/index.html offline/Instructional-Supervision-System-Version-2.html
```
