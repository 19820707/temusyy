/**
 * Contract tests for layout/theme.liquid (shell: meta, fonts, scripts, compare drawer).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const themeLiquid = fs.readFileSync(path.join(__dirname, '..', 'layout', 'theme.liquid'), 'utf8');

// T1 — Cart: layout exposes Theme.routes (downstream empire add-to-cart depends on this object)
assert.match(themeLiquid, /window\.Theme\.routes\s*=\s*\{/, 'theme.liquid: Theme.routes bootstrap must exist');

// T2 — CLS / media: favicon uses sized image_url (not deprecated img_url)
assert.match(themeLiquid, /image_url:\s*width:\s*32/, 'theme.liquid: favicon must use image_url width 32');
assert.doesNotMatch(
  themeLiquid,
  /settings\.favicon\s*\|\s*img_url/,
  'theme.liquid: favicon must not use deprecated img_url'
);

// T3 — Null-safe Liquid: font preload gated; social handle gated
assert.ok(
  themeLiquid.includes('settings.type_menu != blank') && themeLiquid.includes('font_url'),
  'theme.liquid: menu font preload must be conditional on type_menu'
);
assert.match(
  themeLiquid,
  /\{%\s*assign\s+x_handle\s*=\s*''\s*%\}/,
  'theme.liquid: x_handle must default before conditional split'
);

// T4 — JS stability: animation mapping must not console.warn
assert.doesNotMatch(
  themeLiquid,
  /console\.warn\(\s*['"]Unable to parse animation mapping/,
  'theme.liquid: animation mapping parse must not console.warn'
);

// T5 — Performance: link prefetch helper must load deferred (non-blocking parser)
assert.match(
  themeLiquid,
  /tiny-img-link-preloader\.js[\s\S]{0,120}defer/,
  'theme.liquid: tiny-img-link-preloader must use defer'
);
assert.doesNotMatch(
  themeLiquid,
  /tiny-img-link-preloader\.js'\s*\|\s*asset_url\s*\|\s*script_tag/,
  'theme.liquid: tiny-img-link-preloader must not use script_tag (blocking)'
);

// Compare drawer: valid translation key for no-JS / initial paint
assert.doesNotMatch(
  themeLiquid,
  /\{\{\s*'product_compare\.drawer_notification'\s*\|\s*t:\s*count\s*\}\}/,
  'theme.liquid: invalid translation key drawer_notification|t:count must be removed'
);
assert.match(
  themeLiquid,
  /product_compare\.drawer_notification\.one/,
  'theme.liquid: drawer notification must use .one key for static text'
);

console.log('layout-theme-contract: ok');
