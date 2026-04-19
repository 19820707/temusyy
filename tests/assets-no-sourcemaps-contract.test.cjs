/**
 * Contract: theme assets must not ship .map files or //# sourceMappingURL in minified storefront JS.
 * invariant: no committed assets/*.map (CDN bloat + reverse-engineering surface); includes empire.min.js.map / empire.js.map.
 * invariant: minified bundles must not trigger browser fetches for missing .map on Shopify CDN
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const minJs = fs
  .readdirSync(assetsDir)
  .filter(function (name) {
    return name.endsWith('.min.js');
  });

minJs.forEach(function (name) {
  const p = path.join(assetsDir, name);
  const raw = fs.readFileSync(p, 'utf8');
  assert.ok(
    !/sourceMappingURL=/i.test(raw),
    'assets/' + name + ': must not contain //# sourceMappingURL (avoids 404 map requests + disclosure)'
  );
  if (name === 'empire.min.js') {
    assert.ok(
      !raw.includes('empire.min.js.map') && !raw.includes('empire.js.map'),
      'assets/empire.min.js: must not embed theme map filenames (terser --source-map or hand edits must stay off production bundle)'
    );
  }
});

const maps = fs.readdirSync(assetsDir).filter(function (name) {
  return name.endsWith('.map');
});
assert.strictEqual(maps.length, 0, 'assets/: must not contain .map files; found: ' + maps.join(', '));

console.log('assets-no-sourcemaps-contract: ok');
