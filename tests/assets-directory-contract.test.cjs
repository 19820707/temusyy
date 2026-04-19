/**
 * Contract: assets/ is a flat, curated storefront bundle (deterministic deploy surface).
 * invariant: unexpected files catch accidental commits; missing files catch silent theme breakage.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const names = fs.readdirSync(assetsDir).sort();

const allowed = [
  'empire.js',
  'empire.min.js',
  'giftcard.css',
  'giftcard.css.liquid',
  'instantPage.min.js',
  'polyfills.min.js',
  'ripple.css',
  'ripple.css.liquid',
  'theme.bundle.css',
  'theme.css.liquid',
  'tiny-img-link-preloader.js',
].sort();

assert.deepStrictEqual(
  names,
  allowed,
  'assets/: directory listing must match curated allowlist (update tests/assets-directory-contract.test.cjs if adding/removing assets intentionally)'
);

names.forEach(function (name) {
  const st = fs.statSync(path.join(assetsDir, name));
  assert.ok(st.isFile(), 'assets/' + name + ': must be a file (no subdirectories in assets/)');
  assert.ok(st.size > 0, 'assets/' + name + ': must be non-empty');
});

console.log('assets-directory-contract: ok');
