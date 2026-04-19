/**
 * Contract tests for assets/tiny-img-link-preloader.js (navigation prefetch helper).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '..', 'assets', 'tiny-img-link-preloader.js');
const src = fs.readFileSync(srcPath, 'utf8');

// T1 — No duplicate per-anchor listener stacking (gesture handlers use once)
assert.match(src, /once:\s*true/, 'expected once:true for touch lifecycle listeners');

// T2 — Delegated mouseout: exactly one document-level mouseout (no per-anchor stacking)
assert.match(
  src,
  /document\.addEventListener\(\s*['"]mouseout['"]/,
  'expected delegated document mouseout listener'
);
const mouseoutRegistrations = src.match(/addEventListener\(\s*['"]mouseout['"]/g) || [];
assert.strictEqual(
  mouseoutRegistrations.length,
  1,
  'expected exactly one mouseout addEventListener (delegated, no per-link leaks)'
);

// T3 — Null / invalid URL safety
assert.match(src, /new URL\(/, 'expected URL parsing');
assert.match(src, /catch\s*\(/, 'expected try/catch around URL or prefetch assignment');

// T4 — JS stability: no console.* in this asset
assert.doesNotMatch(src, /console\.(log|error|warn|debug)/, 'prefetch helper must not log to console');

// T5 — Performance: clear pending hover timer before starting a new hover chain
assert.match(
  src,
  /if\s*\(\s*mouseoverTimer\s*\)\s*\{[^}]*clearTimeout\(\s*mouseoverTimer\s*\)/,
  'expected mouseoverTimer cleared when starting a new hover intent'
);

// T6 — Lifecycle: duplicate script include must not stack document listeners
assert.match(
  src,
  /tinyImgLinkPrefetcherInit/,
  'expected documentElement dataset sentinel for single init'
);
assert.match(
  src,
  /dataset\.tinyImgLinkPrefetcherInit\s*===\s*['"]1['"]/,
  'expected init guard to compare sentinel before registering listeners'
);

// T7 — DOM safety: Text-node targets must not call closest on non-Elements
assert.match(src, /closestAnchorFromEventTarget/, 'expected text-node-safe anchor resolver');
assert.match(
  src,
  /nodeType\s*===\s*3/,
  'expected Text node (nodeType 3) handling before closest'
);

// T8 — document.body must be guarded before dataset reads (execution-order safety)
assert.match(
  src,
  /var\s+body\s*=\s*document\.body/,
  'expected document.body bound to a variable before dataset use'
);

console.log('assets-tiny-preloader-contract: ok');
