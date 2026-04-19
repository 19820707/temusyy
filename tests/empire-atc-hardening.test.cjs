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

assert.match(src, /_createTimeoutSignal\(timeoutMs\)/, 'order reorder flow must centralize timeout signal creation');
assert.match(src, /typeof AbortController === 'undefined'/, 'order reorder flow must degrade when AbortController is unavailable');

// T6 - Order reorder fail-closed: no empty payloads or brittle JSON crash on customer order page
assert.match(src, /_readJsonNode\(selector, fallback\)/, 'order page JSON payloads must parse through a safe fallback');
assert.match(src, /if \(!this\.itemsToAddToCart\.length\)/, 'order reorder must not send an empty cart mutation');
assert.match(
  src,
  /item\.selling_plan_allocation && item\.selling_plan_allocation\.selling_plan/,
  'order reorder selling_plan access must be guarded'
);
assert.doesNotMatch(src, /sourceMappingURL=empire\.js\.map/, 'empire.js must not point at stale generated source maps');

// Minified bundle must stay in sync (production when settings.minify_scripts)
assert.match(min, /_tryAcquireAddLock/, 'empire.min.js should include add-lock (rebuild if this fails)');
assert.match(min, /_createTimeoutSignal/, 'empire.min.js should include order timeout fallback (rebuild if this fails)');

console.log('empire-atc-hardening: ok');
