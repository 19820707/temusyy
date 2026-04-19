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

console.log('assets-tiny-preloader-contract: ok');
