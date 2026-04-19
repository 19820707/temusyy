/**
 * Regression / contract tests: source-level checks for ATC hardening in assets/empire.js
 * (Shopify theme bundle — not imported as a module).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const empirePath = path.join(__dirname, '..', 'assets', 'empire.js');
const minPath = path.join(__dirname, '..', 'assets', 'empire.min.js');
const src = fs.readFileSync(empirePath, 'utf8');
const min = fs.readFileSync(minPath, 'utf8');

// T1 — Cart race / concurrency: global add-lock + alive guard
assert.match(src, /AddToCartFlyout\._tryAcquireAddLock/, 'expected global add-lock acquire helper');
assert.match(src, /AddToCartFlyout\._releaseAddLock/, 'expected global add-lock release helper');
assert.match(src, /this\._alive = false/, 'expected unload to invalidate instance');

// T2 — CLS: ATC banner image dimensions
assert.match(src, /width="200" height="200"/, 'expected fixed dimensions on ATC flyout image');

// T3 — Null safety: line item + variant options guards
assert.match(src, /if \(!lineItem\)/, 'expected null guard when cart line missing');
assert.match(src, /response\.variant_options && response\.variant_options\[0\]/, 'expected variant_options guard');

// T4 — No console.error in free-shipping async path for this block
assert.doesNotMatch(
  src.slice(src.indexOf('_updateCart()'), src.indexOf('_onError(error)')),
  /console\.error\('Error loading content/,
  'free-shipping catch must not log raw console errors'
);

// T5 — Timeouts on cart AJAX
assert.match(src, /timeout: CART_AJAX_TIMEOUT_MS/, 'expected jQuery cart AJAX timeout');
assert.match(src, /CART_FETCH_TIMEOUT_MS/, 'expected fetch timeout for order reorder flow');

// Minified bundle must stay in sync (production when settings.minify_scripts)
assert.match(min, /_tryAcquireAddLock/, 'empire.min.js should include add-lock (rebuild if this fails)');

console.log('empire-atc-hardening: ok');
