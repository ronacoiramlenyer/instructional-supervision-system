# Instructional Supervision System — Presentation

A 10–12 minute presentation of the research study *Instructional Supervision System: A Data-Driven Automated System for Monitoring and Evaluation of Teachers’ Performance* (Reynel Mario Canor, La Salle Green Hills, 2026).

- `site/` — the static web version of the deck, deployed to Cloudflare Pages (`instructional-supervision-system`).
- `deck/` — the source slide files (one HTML `<section>` per slide, with speaker notes in `<aside>`).
- `scripts/build-site.js` — rebuilds `site/index.html` from `deck/`:

```bash
node scripts/build-site.js deck site/index.html
```

Controls: ← / → or click to change slides, **N** for speaker notes, **F** for full screen. Link to a slide with `#slide-7`.

## Deploying

The site is deployed to Cloudflare Pages as a single advanced-mode worker that embeds `site/` (no separate asset upload):

```bash
node scripts/build-site.js deck site/index.html
node scripts/build-worker.js site dist/_worker.js
```

Then upload `dist/_worker.js` as a Pages direct-upload deployment (multipart form: `branch=main`, `manifest={}`, `_worker.js=@dist/_worker.js`).
