/**
 * Contract tests for locales/*.json (Shopify storefront + schema translations).
 *
 * Mapping to regression matrix:
 * - T1 (cart copy surface): product.buttons.add_to_cart present in every storefront locale.
 * - T2 (CLS / layout copy): not asserted here (handled in layout/CSS); locale strings must stay JSON-safe.
 * - T3 (null safety / missing keys): required paths must exist for layout + compare drawer + primary ATC label + newsletter marketing consent (snippets/newsletter.liquid).
 * - T4 (JS stability): no literal "console." inside translation payloads (prevents accidental script injection).
 * - T5 (payload hygiene): valid JSON only; *.schema.json excluded from storefront key matrix.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'locales');
const files = fs.readdirSync(localesDir).filter(function (f) {
  return f.endsWith('.json');
});
assert.ok(files.includes('en.default.json'), 'locales: en.default.json must exist');

const requiredPaths = [
  ['general', 'accessibility', 'skip_to_content'],
  ['general', 'accessibility', 'close'],
  ['general', 'newsletter', 'consent'],
  ['product', 'buttons', 'add_to_cart'],
  ['product_compare', 'drawer_notification', 'one'],
  ['product_compare', 'drawer_notification', 'other'],
];

function getPath(obj, parts) {
  var cur = obj;
  for (var i = 0; i < parts.length; i++) {
    if (cur == null || typeof cur !== 'object' || !(parts[i] in cur)) {
      return undefined;
    }
    cur = cur[parts[i]];
  }
  return cur;
}

function allStringValues(obj, acc) {
  acc = acc || [];
  if (obj == null) {
    return acc;
  }
  if (typeof obj === 'string') {
    acc.push(obj);
    return acc;
  }
  if (Array.isArray(obj)) {
    obj.forEach(function (v) {
      allStringValues(v, acc);
    });
    return acc;
  }
  if (typeof obj === 'object') {
    Object.keys(obj).forEach(function (k) {
      allStringValues(obj[k], acc);
    });
  }
  return acc;
}

files.forEach(function (file) {
  const raw = fs.readFileSync(path.join(localesDir, file), 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    assert.fail(file + ': invalid JSON — ' + e.message);
  }

  if (file.endsWith('.schema.json')) {
    assert.ok(data && typeof data === 'object', file + ': schema root must be object');
    return;
  }

  requiredPaths.forEach(function (parts) {
    const v = getPath(data, parts);
    assert.ok(typeof v === 'string' && v.length > 0, file + ': missing string at ' + parts.join('.'));
  });

  const other = getPath(data, ['product_compare', 'drawer_notification', 'other']);
  assert.ok(
    /\{\{\s*count\s*\}\}/.test(other),
    file + ': product_compare.drawer_notification.other must contain {{ count }} for empire.js replace chain'
  );

  allStringValues(data).forEach(function (s) {
    assert.ok(
      s.indexOf('console.') === -1,
      file + ': translation strings must not contain the substring "console." (T4)'
    );
  });
});

// T3 — No cramped Liquid tokens ({{terms}}) in any storefront locale; prevents subtle render bugs.
files.forEach(function (file) {
  if (file.endsWith('.schema.json')) {
    return;
  }
  const raw = fs.readFileSync(path.join(localesDir, file), 'utf8');
  assert.doesNotMatch(raw, /\{\{terms\}\}/, file + ': must not use {{terms}}; use {{ terms }}');
  assert.doesNotMatch(raw, /\{\{category\}\}/, file + ': must not use {{category}}; use {{ category }}');
});

const esRaw = fs.readFileSync(path.join(localesDir, 'es.json'), 'utf8');
assert.doesNotMatch(
  esRaw,
  /"other":\s*"Resultados de la búsqueda[^"]*"\s+in\s+\{\{\s*category\s*\}\}/,
  'es.json: search breadcrumbs_count_when_filtered.other must use Spanish "en", not English "in"'
);
assert.match(esRaw, /en \{\{\s*category\s*\}\}/, 'es.json: must retain "en {{ category }}" in search results copy');

const itRaw = fs.readFileSync(path.join(localesDir, 'it.json'), 'utf8');
assert.doesNotMatch(
  itRaw,
  /"in_stock":\s*"\{\{\s*inventory_quantity\s*\}\}\s+in stock"/,
  'it.json: product.status.in_stock must not leave English "in stock" (T2 copy consistency)'
);

const deRaw = fs.readFileSync(path.join(localesDir, 'de.json'), 'utf8');
assert.doesNotMatch(
  deRaw,
  /\{\{terms\s*\}\}/,
  'de.json: must not use {{terms }} (missing space); use {{ terms }} for Liquid interpolation'
);

console.log('locales-contract: ok');
