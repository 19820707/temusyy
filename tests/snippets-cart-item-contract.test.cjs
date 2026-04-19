/**
 * Contract tests for snippets/cart-item.liquid (cart line markup).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'snippets', 'cart-item.liquid');
const src = fs.readFileSync(p, 'utf8');

// T1 — Cart line identity for JS (empire / cart updates)
assert.match(src, /data-cartitem-key="\{\{\s*item\.key\s*\}\}"/, 'cart-item: stable data-cartitem-key');

// T2 — rimg lazy + canvas for line image CLS discipline
assert.match(src, /lazy:\s*true/, 'cart-item: rimg must lazy-load line image');
assert.match(src, /canvas:\s*true/, 'cart-item: rimg should use canvas placeholder path');

// T3 — Null-safe selling plan + unit price guards
assert.match(
  src,
  /selling_plan_allocation\s*!=\s*blank\s+and\s+item\.selling_plan_allocation\.selling_plan\s*!=\s*blank/s,
  'cart-item: selling plan must be guarded before property access'
);
assert.match(
  src,
  /\{%\s*if\s+item\.unit_price_measurement\s*!=\s*blank\s*%\}/,
  'cart-item: unit price captures must sit inside measurement guard'
);

// T4 — No hard-coded English remove phrase in aria-label
assert.doesNotMatch(
  src,
  /aria-label="remove\s+\{\{/i,
  'cart-item: remove link must not use hard-coded English aria-label'
);
assert.match(
  src,
  /aria-label="\{\{\s*'product_compare\.remove'\s*\|\s*t/,
  'cart-item: remove aria-label must use translation'
);

// T5 — Explicit size for cart thumb (bounded payload)
assert.match(src, /size:\s*'120x'/, 'cart-item: rimg size must stay bounded (120x)');

console.log('snippets-cart-item-contract: ok');
