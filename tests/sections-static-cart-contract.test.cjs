/**
 * Contract tests for sections/static-cart.liquid (cart page shell).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'sections', 'static-cart.liquid');
const src = fs.readFileSync(p, 'utf8');

// T1 — Cart surface wired for empire section bootstrap
assert.match(src, /data-section-type="static-cart"/, 'static-cart: section type marker for JS');

// T3 — No hard-coded English aria on the cart form (i18n + accessibility)
assert.doesNotMatch(
  src,
  /aria-label="cart checkout"/i,
  'static-cart: cart form must not use hard-coded English aria-label'
);
assert.match(
  src,
  /aria-label="\{\{\s*'cart\.general\.your_cart'\s*\|\s*t\s*\|\s*escape\s*\}\}"/,
  'static-cart: cart form aria-label must use cart.general.your_cart translation'
);

// T2 / T5 — Sidebar promo images go through rimg with lazy (CLS + payload discipline)
assert.match(src, /render\s+'rimg'/, 'static-cart: sidebar images must use rimg');
assert.match(src, /lazy:\s*true/, 'static-cart: rimg must request lazy loading for sidebar images');

// T4 — No inline console.* in this section
assert.doesNotMatch(src, /console\.(log|warn|error|debug)\s*\(/, 'static-cart: must not embed console.* calls');

console.log('sections-static-cart-contract: ok');
