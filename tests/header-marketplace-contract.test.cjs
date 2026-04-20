/**
 * Contract: marketplace header preset + assets stay wired for safe storefront output.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function stripLeadingBlockComment(raw) {
  return raw.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
}

const headerGroup = JSON.parse(
  stripLeadingBlockComment(fs.readFileSync(path.join(root, 'sections', 'header-group.json'), 'utf8'))
);
const headerSettings = headerGroup.sections.header.settings;
assert.equal(
  headerSettings.header_visual_style,
  'marketplace',
  'header-group.json: Temusy preset should keep marketplace header shell'
);
assert.ok('marketplace_app_url' in headerSettings, 'header-group: marketplace_app_url setting must exist');
assert.ok('marketplace_accent_nav_handle' in headerSettings, 'header-group: marketplace_accent_nav_handle must exist');

const staticHeader = fs.readFileSync(path.join(root, 'sections', 'static-header.liquid'), 'utf8');
assert.match(staticHeader, /header_visual_style/, 'static-header: schema must expose header_visual_style');
assert.match(
  staticHeader,
  /"id"\s*:\s*"header_visual_style"[\s\S]*?"default"\s*:\s*"marketplace"/,
  'static-header: header_visual_style schema default must be marketplace so deploys opt-in without editor saves'
);
assert.match(
  staticHeader,
  /section\.settings\.header_visual_style\s*\|\s*default:\s*'marketplace'/,
  'static-header: must default blank setting to marketplace in Liquid'
);
assert.match(staticHeader, /marketplace_header/, 'static-header: must branch on marketplace_header');
assert.match(staticHeader, /"header_visual_style"\s*:/, 'static-header: section JSON must expose header_visual_style for scripts');
assert.match(staticHeader, /header-marketplace\.css/, 'static-header: must load header-marketplace.css when marketplace');

const extras = fs.readFileSync(path.join(root, 'snippets', 'header-marketplace-extras.liquid'), 'utf8');
assert.match(extras, /mp_app_safe/, 'header-marketplace-extras: must gate app link on safety flag');
assert.match(extras, /javascript:/, 'header-marketplace-extras: must reject javascript: URLs');
assert.match(extras, /mp_app_raw\s*\|\s*escape/, 'header-marketplace-extras: must escape app href attribute');

const mpCss = fs.readFileSync(path.join(root, 'assets', 'header-marketplace.css'), 'utf8');
assert.match(
  mpCss,
  /@media\s*\(\s*forced-colors:\s*active\s*\)/,
  'header-marketplace.css: must define forced-colors fallbacks for marketplace controls'
);
assert.match(mpCss, /focus-visible/, 'header-marketplace.css: must define focus-visible affordances');

const navmenu = fs.readFileSync(path.join(root, 'snippets', 'navmenu.liquid'), 'utf8');
assert.match(
  navmenu,
  /accent_nav_handle\s*\|\s*default:\s*''\s*\|\s*strip\s*\|\s*downcase/,
  'navmenu: accent handle must normalize with downcase for reliable matching'
);

console.log('header-marketplace-contract: ok');
