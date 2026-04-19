/**
 * Contract: theme.css must not embed shop-locked font URLs; typography is bootstrapped via snippets/theme-font-faces.liquid.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const themeCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'theme.css'), 'utf8');

assert.doesNotMatch(
  themeCss,
  /@font-face\s*\{/,
  'theme.css: must not embed @font-face blocks (use snippets/theme-font-faces.liquid)'
);
assert.doesNotMatch(themeCss, /www\.temusy\.com/i, 'theme.css: must not hardcode legacy shop font hostnames');
assert.doesNotMatch(themeCss, /temusy\.com\/cdn\/fonts/i, 'theme.css: must not hardcode legacy font CDN paths');
assert.match(
  themeCss,
  /var\(--theme-font-body\)/,
  'theme.css: must use --theme-font-body for body typography (settings-driven)'
);
assert.match(themeCss, /invariant:.*theme-font-faces/i, 'theme.css: must document font-face invariant in header');
assert.ok(
  themeCss.includes('--theme-font-body|heading|button|menu'),
  'theme.css: header must document --theme-font-* ownership (theme-font-faces.liquid)'
);
assert.match(
  themeCss,
  /@media\s*\(\s*forced-colors:\s*active\s*\)[\s\S]*\.product-form--atc-button:focus-visible/,
  'theme.css: must define forced-colors focus-visible fallback for ATC / primary actions'
);

const snippet = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'theme-font-faces.liquid'), 'utf8');
assert.match(snippet, /\|\s*font_face:/, 'theme-font-faces.liquid: must call font_face filter');
assert.match(snippet, /--theme-font-body:/, 'theme-font-faces.liquid: must define --theme-font-body');
assert.match(snippet, /--theme-font-menu:/, 'theme-font-faces.liquid: must define --theme-font-menu');

function assertFontsBeforeTheme(layoutPath, label) {
  const raw = fs.readFileSync(path.join(__dirname, '..', 'layout', layoutPath), 'utf8');
  const iFaces = raw.indexOf("render 'theme-font-faces'");
  const iSheet = raw.indexOf("'theme.css' | asset_url | stylesheet_tag");
  assert.ok(iFaces !== -1, `${label}: must render theme-font-faces`);
  assert.ok(iSheet !== -1, `${label}: must load theme.css`);
  assert.ok(iFaces < iSheet, `${label}: theme-font-faces must appear before theme.css stylesheet_tag`);
}

assertFontsBeforeTheme('theme.liquid', 'layout/theme.liquid');
assertFontsBeforeTheme('quickshop.liquid', 'layout/quickshop.liquid');
assertFontsBeforeTheme('password.liquid', 'layout/password.liquid');
assertFontsBeforeTheme('none.liquid', 'layout/none.liquid');

{
  const themeCssLiquid = fs.readFileSync(path.join(__dirname, '..', 'assets', 'theme.css.liquid'), 'utf8');
  assert.ok(
    themeCssLiquid.length < 2000,
    'theme.css.liquid: must stay a thin shim (no duplicate theme + font Liquid)'
  );
  assert.match(
    themeCssLiquid,
    /@import\s+url\s*\(\s*['"]\{\{\s*["']theme\.css["']\s*\|\s*asset_url\s*\}\}\s*['"]\s*\)\s*;/,
    'theme.css.liquid: must @import theme.css only (single source of truth)'
  );
  assert.doesNotMatch(
    themeCssLiquid,
    /\|\s*font_face\s*:/,
    'theme.css.liquid: must not embed font_face (belongs in snippets/theme-font-faces.liquid)'
  );
  assert.match(themeCssLiquid, /invariant:/, 'theme.css.liquid: must document invariants for future editors');
}

console.log('assets-theme-css-contract: ok');
