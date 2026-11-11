// Builds a standalone presentation (site/index.html) from the deck's slide files.
const fs = require('fs');
const path = require('path');
const [deckDir, outFile] = process.argv.slice(2);
const deck = JSON.parse(fs.readFileSync(path.join(deckDir, 'deck.json'), 'utf8'));

const blobs = {
  '/_blob/0b44b39f78765e83e4cd0dd264758a7d': 'images/cm-encoder-sidebar.png',
  '/_blob/2e1edaa2fc8c29eb9a1e360c46a3a9e2': 'images/cm-dashboard.png',
  '/_blob/5bfdfae14697e9c312672a4ebf222342': 'images/cot-dashboard.png',
  '/_blob/54ee57b76d9e17905771f9f962d0e826': 'images/merit-matrix.png',
  '/_blob/cc24f66fc9a11c34c8519213675a0c82': 'images/supervision-dashboard.png',
};

const icons = {
  PaperPlane: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/>',
  Book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  Warning: '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  CheckCircle: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/>',
};

function slide(id) {
  let h = fs.readFileSync(path.join(deckDir, 'slides', id + '.html'), 'utf8');
  for (const [k, v] of Object.entries(blobs)) h = h.split(k).join(v);
  h = h.replace(/<x-icon name="(\w+)" style="([^"]*)"><\/x-icon>/g, (m, name, style) => {
    if (!icons[name]) throw new Error('missing icon ' + name);
    return `<svg class="icon" style="${style};flex:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  });
  h = h.replace(/<x-shape kind="arrow-right" style="background:([^;]+);width:(\d+)px;height:(\d+)px"><\/x-shape>/g,
    (m, color, w, ht) => `<svg width="${w}" height="${ht}" viewBox="0 0 10 5" preserveAspectRatio="none" aria-hidden="true"><path d="M0 1.5h6V0l4 2.5L6 5V3.5H0z" fill="${color}"/></svg>`);
  h = h.split('<a href="https').join('<a target="_blank" rel="noopener" href="https');
  if (/<x-/.test(h)) throw new Error('unconverted custom element in ' + id);
  return h;
}

const fontHref = deck.faces['source-serif-4'].href;
const slides = deck.order.map(slide).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${deck.title}</title>
<meta name="description" content="Instructional Supervision System: a data-driven automated system for monitoring and evaluation of teachers’ performance. Research presentation, La Salle Green Hills.">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; }
  html, body { height: 100%; background: #0B2A1F; overflow: hidden; }
  body { font-family: 'IBM Plex Sans', Arial, sans-serif; }
  #viewport { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; }
  #stage { position: relative; width: 1920px; height: 1080px; flex: none; transform-origin: center center; }
  #stage > section { position: absolute; inset: 0; width: 1920px; height: 1080px; overflow: hidden;
    opacity: 0; visibility: hidden; transition: opacity .35s ease, visibility .35s; }
  #stage > section.active { opacity: 1; visibility: visible; }
  section div { display: flex; flex-direction: column; min-width: 0; }
  section h1, section h2, section h3, section p { overflow-wrap: break-word; }
  section h1 { font-size: 96px; } section h2 { font-size: 64px; } section h3 { font-size: 44px; }
  section ul { padding-left: 1.1em; }
  section li::marker { color: currentColor; }
  section img { display: block; }
  section aside { display: none; }
  #bar { position: fixed; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; gap: 12px;
    padding: 10px; font: 14px 'IBM Plex Sans', Arial, sans-serif; color: #C9D9CF; opacity: 0; transition: opacity .3s; }
  body:hover #bar, #bar:focus-within { opacity: 1; }
  #bar button { background: rgba(245,243,236,.12); color: #F5F3EC; border: 1px solid rgba(245,243,236,.25); border-radius: 8px;
    padding: 6px 14px; font: inherit; cursor: pointer; }
  #bar button:hover { background: rgba(245,243,236,.22); }
  #notes { position: fixed; right: 16px; top: 16px; width: min(420px, calc(100vw - 32px)); max-height: 60vh; overflow: auto;
    background: rgba(14,51,38,.95); color: #F5F3EC; border: 1px solid #2E5A47; border-radius: 12px; padding: 16px 18px;
    font: 15px/1.5 'IBM Plex Sans', Arial, sans-serif; white-space: pre-wrap; display: none; }
  #notes.show { display: block; }
  #progress { position: fixed; left: 0; top: 0; height: 4px; background: #E3B23C; transition: width .3s; }
</style>
</head>
<body>
<div id="progress"></div>
<div id="viewport"><div id="stage">
${slides}
</div></div>
<div id="notes" aria-live="polite"></div>
<nav id="bar" aria-label="Slide controls">
  <button id="prev" aria-label="Previous slide">‹ Prev</button>
  <span id="count">1 / 1</span>
  <button id="next" aria-label="Next slide">Next ›</button>
  <button id="toggle-notes" aria-label="Toggle speaker notes">Notes (N)</button>
  <button id="fs" aria-label="Toggle full screen">Full screen (F)</button>
</nav>
<script>
(function () {
  var stage = document.getElementById('stage');
  var slides = Array.prototype.slice.call(stage.children);
  var notes = document.getElementById('notes');
  var i = 0;
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'scale(' + s + ')';
  }
  function fromHash() {
    var m = /slide-(\\d+)/.exec(location.hash);
    return m ? Math.min(Math.max(parseInt(m[1], 10) - 1, 0), slides.length - 1) : 0;
  }
  function show(n, push) {
    i = Math.min(Math.max(n, 0), slides.length - 1);
    slides.forEach(function (s, k) { s.classList.toggle('active', k === i); s.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
    document.getElementById('count').textContent = (i + 1) + ' / ' + slides.length;
    document.getElementById('progress').style.width = ((i + 1) / slides.length * 100) + '%';
    var a = slides[i].querySelector('aside');
    notes.textContent = a ? a.textContent : '';
    if (push !== false) history.replaceState(null, '', '#slide-' + (i + 1));
  }
  document.getElementById('prev').onclick = function () { show(i - 1); };
  document.getElementById('next').onclick = function () { show(i + 1); };
  document.getElementById('toggle-notes').onclick = function () { notes.classList.toggle('show'); };
  function toggleFs() {
    if (!document.fullscreenElement) { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
    else { document.exitFullscreen && document.exitFullscreen(); }
  }
  document.getElementById('fs').onclick = toggleFs;
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || k === ' ' || k === 'Enter') { e.preventDefault(); show(i + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); show(i - 1); }
    else if (k === 'Home') show(0);
    else if (k === 'End') show(slides.length - 1);
    else if (k === 'n' || k === 'N') notes.classList.toggle('show');
    else if (k === 'f' || k === 'F') toggleFs();
  });
  document.getElementById('viewport').addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    show(e.clientX < window.innerWidth / 3 ? i - 1 : i + 1);
  });
  var tx = null;
  document.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
    tx = null;
  });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', function () { show(fromHash(), false); });
  fit();
  show(fromHash(), false);
})();
</script>
</body>
</html>
`;
fs.writeFileSync(outFile, html);
console.log('wrote', outFile, deck.order.length, 'slides');
