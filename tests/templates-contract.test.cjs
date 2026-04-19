/**
 * Contract tests for templates/*.json and templates/gift_card.liquid.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, '..', 'templates');

/** Shopify admin may prepend a C-style block comment to template JSON (e.g. index.json). */
function stripLeadingBlockComment(src) {
  const s = src.replace(/^\uFEFF/, '');
  if (!/^\s*\/\*/.test(s)) return s;
  const end = s.indexOf('*/');
  if (end === -1) return s;
  return s.slice(end + 2);
}

// --- JSON templates (T3 null-safe structure, T5 minimal valid payload) ---
const jsonFiles = fs.readdirSync(templatesDir).filter(function (f) {
  return f.endsWith('.json');
});
jsonFiles.forEach(function (f) {
  const raw = fs.readFileSync(path.join(templatesDir, f), 'utf8');
  const jsonText = stripLeadingBlockComment(raw);
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (e) {
    assert.fail(f + ': invalid JSON — ' + e.message);
  }
  assert.ok(data && typeof data === 'object', f + ': root must be object');
  assert.ok(Array.isArray(data.order) && data.order.length > 0, f + ': must define non-empty order[]');
  assert.ok(data.sections && typeof data.sections === 'object', f + ': must define sections{}');
});

const cart = JSON.parse(fs.readFileSync(path.join(templatesDir, 'cart.json'), 'utf8'));
assert.strictEqual(cart.sections.main.type, 'static-cart', 'cart.json: main section must be static-cart');

const indexTemplate = JSON.parse(stripLeadingBlockComment(fs.readFileSync(path.join(templatesDir, 'index.json'), 'utf8')));
assert.ok(
  indexTemplate.sections.homepage_smart_hub,
  'index.json: homepage must include homepage_smart_hub guidance section'
);
assert.strictEqual(
  indexTemplate.sections.homepage_smart_hub.type,
  'dynamic-smart-homepage-hub',
  'index.json: homepage_smart_hub must use dynamic-smart-homepage-hub section'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_deal_countdown'),
  indexTemplate.order.indexOf('homepage_hero') + 1,
  'index.json: deal countdown must follow hero (urgency + time)'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_smart_hub'),
  indexTemplate.order.indexOf('homepage_deal_countdown') + 1,
  'index.json: smart hub must follow deal countdown'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_best_sellers_products'),
  indexTemplate.order.indexOf('homepage_smart_hub') + 1,
  'index.json: bestsellers grid must follow hub (primary SKU decision surface near the fold)'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_trust_bar'),
  indexTemplate.order.indexOf('homepage_best_sellers_products') + 1,
  'index.json: trust bar must follow bestsellers (proof right after the main product row)'
);
assert.ok(
  indexTemplate.sections.homepage_smart_hub.settings.primary_link,
  'index.json: homepage_smart_hub primary CTA must be configured'
);

// --- gift_card.liquid (T2 CLS, T4 no console, favicon modern) ---
const gift = fs.readFileSync(path.join(templatesDir, 'gift_card.liquid'), 'utf8');
assert.doesNotMatch(
  gift,
  /settings\.favicon\s*\|\s*img_url/,
  'gift_card.liquid: favicon must not use deprecated img_url'
);
assert.match(gift, /image_url:\s*width:\s*32/, 'gift_card.liquid: favicon must use image_url width 32');
assert.match(gift, /width="570"\s+height="356"/, 'gift_card.liquid: gift card art must declare width/height');
assert.match(gift, /decoding="async"/, 'gift_card.liquid: gift card art should decode async (main thread)');
assert.match(
  gift,
  /gift_card_logo_focal/,
  'gift_card.liquid: logo focal point must use guarded assign'
);
assert.doesNotMatch(gift, /console\.(log|warn|error)\s*\(/, 'gift_card.liquid: no console.* in template');
assert.match(
  gift,
  /aria-label="\{\{\s*'general\.accessibility\.nav_main'\s*\|\s*t\s*\|\s*escape\s*\}\}"/,
  'gift_card.liquid: main landmark must use translated nav_main label'
);
{
  const idxFonts = gift.indexOf("render 'gift-card-font-faces'");
  const idxSheet = gift.indexOf("'giftcard.css'");
  assert.ok(idxFonts !== -1, "gift_card.liquid: must render snippet 'gift-card-font-faces'");
  assert.ok(idxSheet !== -1, "gift_card.liquid: must load giftcard.css");
  assert.ok(idxFonts < idxSheet, 'gift_card.liquid: font faces must load before giftcard.css (CSS variables + @font-face)');
}
const giftcardCss = fs.readFileSync(path.join(__dirname, '..', 'assets', 'giftcard.css'), 'utf8');
assert.doesNotMatch(
  giftcardCss,
  /www\.temusy\.com/i,
  'giftcard.css: must not hardcode legacy shop font host (portable theme + smaller file)'
);
assert.doesNotMatch(giftcardCss, /@font-face\s*\{/, 'giftcard.css: @font-face must come from Liquid font_face, not static CSS');
assert.match(
  giftcardCss,
  /var\(\s*--giftcard-font-body\b/,
  'giftcard.css: body must use theme-driven font stack variable'
);
assert.match(
  giftcardCss,
  /html::before[\s\S]{0,400}XXXS,XXS,XS,S,M,L,XL,XXL,XXXL/,
  'giftcard.css: html::before breakpoint list required for empire.js Layout'
);
assert.match(
  giftcardCss,
  /\.giftcard-header-logo:focus-visible/,
  'giftcard.css: header logo link must declare :focus-visible ring (keyboard UX)'
);
{
  const printBlocks = giftcardCss.match(/@media print\s*\{/g);
  assert.strictEqual(
    printBlocks ? printBlocks.length : 0,
    1,
    'giftcard.css: must have exactly one @media print { ... } block'
  );
}
const giftFonts = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'gift-card-font-faces.liquid'), 'utf8');
assert.match(giftFonts, /\|\s*font_face:/, 'snippets/gift-card-font-faces.liquid: must call font_face filter');
assert.match(giftFonts, /--giftcard-font-body:/, 'snippets/gift-card-font-faces.liquid: must define --giftcard-font-body');

const giftcardCssLiquid = fs.readFileSync(path.join(__dirname, '..', 'assets', 'giftcard.css.liquid'), 'utf8');
assert.ok(
  giftcardCssLiquid.length < 1200,
  'assets/giftcard.css.liquid: must stay a thin shim (avoid duplicating full gift card / theme CSS)'
);
assert.match(
  giftcardCssLiquid,
  /@import\s+url\s*\(\s*['"]\{\{\s*["']giftcard\.css["']\s*\|\s*asset_url\s*\}\}\s*['"]\s*\)\s*;/,
  'assets/giftcard.css.liquid: must @import giftcard.css only (single source of truth)'
);
assert.doesNotMatch(
  giftcardCssLiquid,
  /@font-face\s*\{/,
  'assets/giftcard.css.liquid: must not embed @font-face blocks (fonts via snippet + giftcard.css variables)'
);
assert.doesNotMatch(
  giftcardCssLiquid,
  /www\.temusy\.com/i,
  'assets/giftcard.css.liquid: must not hardcode legacy shop font URLs'
);

console.log('templates-contract: ok');
