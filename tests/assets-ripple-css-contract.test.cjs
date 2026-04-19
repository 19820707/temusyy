/**
 * Contract: ripple.css (MDC ripple) must keep storefront a11y baselines layered on vendor CSS.
 * Contract: ripple.css.liquid must remain a thin shim to ripple.css (single source of truth).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'assets', 'ripple.css');
const raw = fs.readFileSync(p, 'utf8');

assert.match(raw, /\.mdc-ripple-surface:focus-visible/, 'ripple.css: must define :focus-visible outline for keyboard users');
assert.match(
  raw,
  /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/,
  'ripple.css: must respect prefers-reduced-motion for ripple pseudo-elements'
);
assert.match(raw, /animation:\s*none\s*!important/, 'ripple.css: reduced-motion must disable ripple animations');

const pLiquid = path.join(__dirname, '..', 'assets', 'ripple.css.liquid');
const liquid = fs.readFileSync(pLiquid, 'utf8');
assert.ok(liquid.length < 1500, 'ripple.css.liquid: must stay a thin shim (no full MDC duplicate)');
assert.match(
  liquid,
  /@import\s+url\s*\(\s*['"]\{\{\s*["']ripple\.css["']\s*\|\s*asset_url\s*\}\}\s*['"]\s*\)\s*;/,
  'ripple.css.liquid: must @import ripple.css only (single source of truth)'
);
assert.doesNotMatch(
  liquid,
  /@keyframes\s+mdc-ripple/,
  'ripple.css.liquid: must not embed vendor keyframes (belongs in ripple.css)'
);
assert.match(liquid, /invariant:/, 'ripple.css.liquid: must document invariants for future editors');

console.log('assets-ripple-css-contract: ok');
