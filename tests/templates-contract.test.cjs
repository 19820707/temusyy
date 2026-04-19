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

console.log('templates-contract: ok');
