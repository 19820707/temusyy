/**
 * Contract: theme assets must not ship .map files or //# sourceMappingURL in minified storefront JS.
 * invariant: no committed assets/*.map (CDN bloat + reverse-engineering surface); e.g. empire.min.js.map, instantPage.min.js.map, polyfills.min.js.map.
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
  if (name === 'instantPage.min.js') {
    assert.ok(
      !raw.includes('instantPage.min.js.map'),
      'assets/instantPage.min.js: must not reference instantPage.min.js.map (avoid DevTools 404 + disclosure)'
    );
  }
  if (name === 'polyfills.min.js') {
    assert.ok(
      !raw.includes('polyfills.min.js.map'),
      'assets/polyfills.min.js: must not reference polyfills.min.js.map (avoid DevTools 404 + disclosure)'
    );
    assert.doesNotMatch(
      raw,
      /detatchEvent/,
      'assets/polyfills.min.js: legacy detach must use detachEvent spelling (IE attachEvent teardown)'
    );
    assert.match(
      raw,
      /t\.detachEvent\("on"/,
      'assets/polyfills.min.js: must retain IE detachEvent branch for attachEvent symmetry'
    );
  }
});

const maps = fs.readdirSync(assetsDir).filter(function (name) {
  return name.endsWith('.map');
});
assert.strictEqual(maps.length, 0, 'assets/: must not contain .map files; found: ' + maps.join(', '));

// invariant: unminified empire.js is loaded when settings.minify_scripts is false; stray map URLs still trigger DevTools 404s + disclosure surface
{
  const empireSrc = fs.readFileSync(path.join(assetsDir, 'empire.js'), 'utf8');
  assert.ok(
    !/sourceMappingURL=/i.test(empireSrc),
    'assets/empire.js: must not contain //# sourceMappingURL (non-min storefront path must match min bundle policy)'
  );
}

console.log('assets-no-sourcemaps-contract: ok');
