/**
 * Contract: instantPage.min.js must resolve Text-node event targets before .closest("a")
 * (event.target can be a Text node — no .closest → TypeError kills prefetch + mouseout handler).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'assets', 'instantPage.min.js');
const raw = fs.readFileSync(p, 'utf8');

assert.match(raw, /y=t=>/, 'instantPage.min.js: must define element resolver y()');
assert.match(raw, /y\(e\.target\)/, 'instantPage.min.js: touch/mousedown must use y(e.target)');
assert.match(raw, /y\(o\.target\)/, 'instantPage.min.js: mouseover must use y(o.target)');
assert.match(raw, /y\(n\.target\)/, 'instantPage.min.js: mouseout p() must use y(n.target)');
assert.doesNotMatch(
  raw,
  /e\.target\.closest\("a"\)/,
  'instantPage.min.js: must not call .closest on raw e.target (Text node hazard)'
);
assert.doesNotMatch(raw, /sourceMappingURL=/i, 'instantPage.min.js: must not reference source maps');

console.log('instant-page-element-anchor: ok');
