// Bundles site/ into one Cloudflare Pages advanced-mode worker (dist/_worker.js),
// so the deploy needs no separate static-asset upload.
const fs = require('fs');
const path = require('path');
const [siteDir, outFile] = process.argv.slice(2);
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png' };
const files = {};
(function walk(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    const rel = '/' + path.relative(siteDir, p).split(path.sep).join('/');
    files[rel] = { type: types[path.extname(p)] || 'application/octet-stream', b64: fs.readFileSync(p).toString('base64') };
  }
})(siteDir);
const src = `const FILES = ${JSON.stringify(files)};
const cache = {};
function bytes(p) {
  if (!cache[p]) { const s = atob(FILES[p].b64); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); cache[p] = u; }
  return cache[p];
}
export default {
  async fetch(request) {
    let p = new URL(request.url).pathname;
    if (p.endsWith('/')) p += 'index.html';
    const f = FILES[p];
    if (!f) return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain' } });
    return new Response(bytes(p), { headers: { 'content-type': f.type, 'cache-control': p.endsWith('.html') ? 'no-cache' : 'public, max-age=86400', 'x-content-type-options': 'nosniff' } });
  }
};
`;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, src);
console.log('wrote', outFile, Object.keys(files).join(', '), (src.length / 1024).toFixed(0) + ' KB');
