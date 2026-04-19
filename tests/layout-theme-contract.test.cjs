/**
 * Contract tests for layout shells (theme + quickshop + password + none): meta, fonts, favicon parity.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const readLayout = (name) =>
  fs.readFileSync(path.join(__dirname, '..', 'layout', name), 'utf8');

const themeLiquid = readLayout('theme.liquid');
const quickshopLiquid = readLayout('quickshop.liquid');
const passwordLiquid = readLayout('password.liquid');
const noneLiquid = readLayout('none.liquid');

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
assert.ok(
  themeLiquid.includes('Array.isArray(mapping.elements)') &&
    themeLiquid.includes('Array.isArray(mapping.blocks)'),
  'theme.liquid: animation mapping must guard elements/blocks arrays before forEach'
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

// T6 — Design-mode vendor beacon must not dereference optional window.BOOMR
assert.match(
  themeLiquid,
  /\(window\.BOOMR\s*&&\s*window\.BOOMR\.shopId\)\s*\|\|\s*''/,
  'theme.liquid: OOTS beacon shop_id must guard BOOMR and default to empty string'
);
assert.doesNotMatch(
  themeLiquid,
  /shop_id:\s*window\.BOOMR\.shopId\b/,
  'theme.liquid: OOTS beacon must not use unguarded window.BOOMR.shopId'
);
assert.match(
  themeLiquid,
  /\(window\.Shopify\.shop\s*&&\s*window\.Shopify\.shop\.toLowerCase\(\)\)\s*\|\|\s*''/,
  'theme.liquid: OOTS beacon shop_domain must guard Shopify.shop before toLowerCase'
);
assert.doesNotMatch(
  themeLiquid,
  /shop_domain:\s*window\.Shopify\.shop\.toLowerCase\(\)/,
  'theme.liquid: OOTS beacon must not call toLowerCase on unguarded Shopify.shop'
);

// T7 — Keyboard affordance (shell parity with password/quickshop layouts)
assert.match(
  themeLiquid,
  /\/\/\s*invariant:\s*detect Tab without relying only on deprecated keyCode/,
  'theme.liquid: handleFirstTab must document Tab vs keyCode invariant'
);

// --- Other layouts: favicon + menu font preload + x_handle parity with theme.liquid ---

function assertFaviconImageUrl(label, src) {
  assert.match(src, /image_url:\s*width:\s*32/, `${label}: favicon must use image_url width 32`);
  assert.doesNotMatch(
    src,
    /settings\.favicon\s*\|\s*img_url/,
    `${label}: favicon must not use deprecated img_url`
  );
}

function assertMenuFontPreloadGated(label, src) {
  if (!src.includes('font_url')) return;
  assert.ok(
    src.includes('settings.type_menu != blank') && src.includes('font_url'),
    `${label}: menu font preload must be conditional on type_menu when font_url is used`
  );
}

function assertXHandleDefault(label, src) {
  if (!src.includes('twitter_handle: x_handle')) return;
  assert.match(
    src,
    /\{%\s*assign\s+x_handle\s*=\s*''\s*%\}/,
    `${label}: x_handle must default before conditional split when social-meta-tags is used`
  );
  assert.ok(
    src.includes("{% if settings.social_x != blank %}"),
    `${label}: social_x split must be inside blank check`
  );
}

for (const [label, body] of [
  ['quickshop.liquid', quickshopLiquid],
  ['password.liquid', passwordLiquid],
  ['none.liquid', noneLiquid],
]) {
  assertFaviconImageUrl(label, body);
  assertMenuFontPreloadGated(label, body);
  assertXHandleDefault(label, body);
}

// password.liquid: runtime shell parity with theme.liquid (animation parse, empire load)
assert.doesNotMatch(
  passwordLiquid,
  /console\.warn\(\s*['"]Unable to parse animation mapping/,
  'password.liquid: animation mapping parse must not console.warn'
);
assert.ok(
  passwordLiquid.includes('settings.minify_scripts') &&
    passwordLiquid.includes('empire.min.js') &&
    passwordLiquid.includes('empire.js'),
  'password.liquid: empire bundle must follow minify_scripts gate like theme.liquid'
);
assert.strictEqual(
  (passwordLiquid.match(/\basync\b/g) || []).length,
  2,
  'password.liquid: both empire script variants must use async (non-blocking)'
);
assert.match(
  passwordLiquid,
  /e\.key\s*===\s*['"]Tab['"]\s*\|\|\s*e\.keyCode\s*===\s*9/,
  'password.liquid: keyboard focus affordance must use e.key Tab with keyCode fallback'
);

// quickshop.liquid: runtime + a11y shell parity with theme.liquid
assert.doesNotMatch(
  quickshopLiquid,
  /console\.warn\(\s*['"]Unable to parse animation mapping/,
  'quickshop.liquid: animation mapping parse must not console.warn'
);
assert.ok(
  quickshopLiquid.includes('settings.minify_scripts') &&
    quickshopLiquid.includes('empire.min.js') &&
    quickshopLiquid.includes('empire.js'),
  'quickshop.liquid: empire bundle must follow minify_scripts gate like theme.liquid'
);
assert.strictEqual(
  (quickshopLiquid.match(/\basync\b/g) || []).length,
  2,
  'quickshop.liquid: both empire script variants must use async (non-blocking)'
);
assert.match(
  quickshopLiquid,
  /e\.key\s*===\s*['"]Tab['"]\s*\|\|\s*e\.keyCode\s*===\s*9/,
  'quickshop.liquid: keyboard focus affordance must use e.key Tab with keyCode fallback'
);
assert.match(
  quickshopLiquid,
  /class="skip-to-main"[^>]*href="#site-main"/,
  'quickshop.liquid: skip-to-main link must target #site-main like theme.liquid'
);

console.log('layout-theme-contract: ok');
