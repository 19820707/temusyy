/**
 * Regression: theme-owned empire paths must not emit noisy / PII-adjacent console output.
 * (Vendor bundles inside empire.js may still reference console for third-party code.)
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const empirePath = path.join(__dirname, '..', 'assets', 'empire.js');
const minPath = path.join(__dirname, '..', 'assets', 'empire.min.js');
const empire = fs.readFileSync(empirePath, 'utf8');
const empireMin = fs.readFileSync(minPath, 'utf8');

assert.doesNotMatch(empire, /Search had error/, 'empire.js: predictive search must not retain Search had error log string');
assert.doesNotMatch(
  empire,
  /\}\)\.catch\(e\s*=>\s*\{\s*console\.log\(e\)/,
  'empire.js: surface pick-up distance catch must not console.log the rejection reason'
);
assert.doesNotMatch(empireMin, /Search had error/, 'empire.min.js: must match empire.js (no Search had error in min bundle)');

assert.match(
  empire,
  /PREDICTIVE_SEARCH_TIMEOUT_MS\s*=\s*15000/,
  'empire.js: LiveSearch predictive fetch must declare bounded timeout (race + hang containment)'
);
assert.match(
  empire,
  /signal:\s*predictiveController\.signal/,
  'empire.js: LiveSearch fetch must pass AbortController signal'
);
assert.match(
  empire,
  /search-icon--processing'\)\.prop\(['"]disabled['"],\s*true\)/,
  'empire.js: LiveSearch processing state must use .prop(disabled,true) not broken .attr(disabled)'
);

{
  const m = empire.match(/section_id=predictive-search[\s\S]{0,2800}/);
  assert.ok(m, 'empire.js: predictive search fetch snippet must exist');
  assert.doesNotMatch(
    m[0],
    /throw error/,
    'empire.js: LiveSearch predictive fetch must not rethrow (unhandled rejection / noisy failure surface)'
  );
  assert.match(
    m[0],
    /this\._searchError\(error\)/,
    'empire.js: LiveSearch network failures must fail closed via _searchError'
  );
}

assert.match(
  empire,
  /calculate_shipping\)\.prop\(['"]disabled['"],\s*false\)/,
  'empire.js: cart shipping calculator must use .prop(disabled,false) on submit control'
);

console.log('assets-empire-no-storefront-console-contract: ok');
