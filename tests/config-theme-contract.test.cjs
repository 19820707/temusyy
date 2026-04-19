/**
 * Contract tests for config/*.json (Shopify JSON with optional block-comment preamble).
 *
 * Invariants enforced here mirror comments in config files — not runtime Liquid.
 *
 * settings_schema.json is strict JSON (Shopify forbids inline comments). Schema laws
 * enforced here include: unique setting ids (T12), sane range min/max (T13), theme_info first (T14),
 * checkbox boolean defaults (T16), settings_data root keys current+presets only (T5 extension).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function stripLeadingBlockComment(raw) {
  return raw.replace(/^\/\*[\s\S]*?\*\/\s*/, '');
}

function readJsonConfig(rel) {
  const p = path.join(__dirname, '..', 'config', rel);
  return JSON.parse(stripLeadingBlockComment(fs.readFileSync(p, 'utf8')));
}

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config', 'settings_schema.json'), 'utf8'));
const data = readJsonConfig('settings_data.json');
const markets = readJsonConfig('markets.json');

// T1 — Single theme_info (no duplicate identity blocks that confuse tooling)
const themeInfoBlocks = schema.filter(function (b) {
  return b && b.name === 'theme_info';
});
assert.strictEqual(themeInfoBlocks.length, 1, 'settings_schema: exactly one theme_info block');

// T2 — Performance: minify_scripts has explicit default (predictable editor + new presets)
const perf = schema.find(function (b) {
  return b && b.name === 't:settings_schema.performance.name';
});
assert.ok(perf && Array.isArray(perf.settings), 'settings_schema: performance group exists');
const minify = perf.settings.find(function (s) {
  return s && s.id === 'minify_scripts';
});
assert.ok(minify && 'default' in minify, 'settings_schema: minify_scripts must declare default');
assert.strictEqual(typeof minify.default, 'boolean', 'settings_schema: minify_scripts default is boolean');

// T3 — Null safety / governance: age gate minimum is bounded and data respects floor
const age = schema.find(function (b) {
  return b && b.name === 't:settings_schema.age_gate.name';
});
assert.ok(age, 'settings_schema: age_gate group exists');
const minAge = age.settings.find(function (s) {
  return s && s.id === 'age_gate_site_wide_min_age';
});
assert.strictEqual(minAge.min, 18, 'settings_schema: age_gate_site_wide_min_age.min must be 18');
assert.ok(minAge.max >= minAge.min, 'settings_schema: age gate max must be >= min');
assert.ok(data.current && typeof data.current.age_gate_site_wide_min_age === 'number', 'settings_data: current.age_gate_site_wide_min_age present');
assert.ok(
  data.current.age_gate_site_wide_min_age >= 18,
  'settings_data: age_gate_site_wide_min_age must be >= 18 (aligned with schema floor)'
);

// T4 — markets.json: Shopify root shape + non-array container (upload + admin merge safety)
assert.ok(markets && typeof markets === 'object' && !Array.isArray(markets), 'markets.json: root must be a plain object');
assert.deepStrictEqual(
  Object.keys(markets).sort(),
  ['markets'],
  'markets.json: root must expose only the "markets" key (no stray top-level keys)'
);
assert.ok(markets.markets != null && typeof markets.markets === 'object', 'markets.json: "markets" value must be an object');
assert.ok(
  !Array.isArray(markets.markets),
  'markets.json: "markets" must not be an array (Shopify expects a map of market id → config)'
);
Object.keys(markets.markets).forEach(function (marketId) {
  var entry = markets.markets[marketId];
  assert.ok(
    entry != null && typeof entry === 'object' && !Array.isArray(entry),
    'markets.json: market "' + marketId + '" must be a plain object'
  );
});

// T5 — settings_data has expected top-level buckets (minimal payload structure)
assert.ok(data.current && data.presets && typeof data.presets === 'object', 'settings_data: must expose current + presets');
assert.deepStrictEqual(
  Object.keys(data).sort(),
  ['current', 'presets'],
  'settings_data: root must contain only current + presets (no stray theme JSON keys)'
);

// T6 — Layout-critical toggles: theme.liquid uses settings.minify_scripts / settings.reduce_animations without | default (branch must be strict boolean)
assert.strictEqual(
  typeof data.current.minify_scripts,
  'boolean',
  'settings_data: current.minify_scripts must be a JSON boolean (empire.min.js vs empire.js fork in layout)'
);
assert.strictEqual(
  typeof data.current.reduce_animations,
  'boolean',
  'settings_data: current.reduce_animations must be a JSON boolean (ripple.css + animation mapping in layout)'
);

// T7 — Schema ↔ runtime: minify_scripts is a checkbox (boolean channel end-to-end)
assert.strictEqual(minify.type, 'checkbox', 'settings_schema: minify_scripts must be checkbox type');
const anim = schema.find(function (b) {
  return b && b.name === 't:settings_schema.animations.name';
});
assert.ok(anim && Array.isArray(anim.settings), 'settings_schema: animations group exists');
const reduceAnim = anim.settings.find(function (s) {
  return s && s.id === 'reduce_animations';
});
assert.ok(reduceAnim, 'settings_schema: reduce_animations setting must exist');
assert.strictEqual(reduceAnim.type, 'checkbox', 'settings_schema: reduce_animations must be checkbox type');

// T8 — Preset governance: any preset that overrides age gate min must respect schema floor (18+)
Object.keys(data.presets).forEach(function (presetName) {
  var preset = data.presets[presetName];
  if (!preset || typeof preset !== 'object') {
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(preset, 'age_gate_site_wide_min_age')) {
    return;
  }
  var v = preset.age_gate_site_wide_min_age;
  assert.strictEqual(typeof v, 'number', 'settings_data: preset ' + presetName + ' age_gate_site_wide_min_age must be a number when set');
  assert.ok(v >= 18, 'settings_data: preset ' + presetName + ' age_gate_site_wide_min_age must be >= 18');
});

// T9 — theme.liquid + cart/PDP: checkbox-style settings must stay strict booleans (Liquid truthiness is not typed)
[
  'enable_age_gate_site_wide',
  'enable_product_compare',
  'enable_back_to_top_button',
  'enable_checkout_lock_icon',
  'product_grid_image_crop',
  'select_first_available_variant',
  'enable_cart_redirection',
].forEach(function (k) {
  assert.strictEqual(typeof data.current[k], 'boolean', 'settings_data: current.' + k + ' must be a JSON boolean');
});

// T10 — Inline CSS variable: root background color must be hex (theme.liquid --background-color)
assert.match(
  data.current.color_background,
  /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/,
  'settings_data: current.color_background must be a hex color (#RGB, #RRGGBB, or #RRGGBBAA) for safe CSS injection'
);

// T11 — Collection grid image style + layout width (schema-bounded; classnames + max-width)
var allowedGridStyles = ['natural', 'small', 'medium', 'large'];
assert.ok(
  allowedGridStyles.indexOf(data.current.product_grid_image_style) !== -1,
  'settings_data: current.product_grid_image_style must be one of ' + allowedGridStyles.join(', ')
);
assert.strictEqual(typeof data.current.layout_max_width, 'number', 'settings_data: current.layout_max_width must be a number');
assert.ok(
  data.current.layout_max_width >= 1200 && data.current.layout_max_width <= 1600,
  'settings_data: current.layout_max_width must be within schema range 1200–1600'
);
assert.strictEqual(
  (data.current.layout_max_width - 1200) % 100,
  0,
  'settings_data: current.layout_max_width must align to schema step (100px) from 1200'
);

// T12 — settings_schema.json: duplicate `id` across settings[] breaks theme editor + settings_data resolution
function collectSettingIds(nodes, acc) {
  acc = acc || [];
  if (!Array.isArray(nodes)) {
    return acc;
  }
  nodes.forEach(function (block) {
    if (!block || typeof block !== 'object') {
      return;
    }
    if (Array.isArray(block.settings)) {
      block.settings.forEach(function (s) {
        if (s && typeof s.id === 'string' && s.id.length) {
          acc.push(s.id);
        }
      });
    }
  });
  return acc;
}
{
  const ids = collectSettingIds(schema, []);
  const seen = Object.create(null);
  ids.forEach(function (id) {
    assert.ok(!seen[id], 'settings_schema: duplicate setting id "' + id + '" (editor undefined behavior)');
    seen[id] = true;
  });
}

// T13 — settings_schema.json: every range control must satisfy min <= max when both declared
schema.forEach(function (block) {
  if (!block || !Array.isArray(block.settings)) {
    return;
  }
  block.settings.forEach(function (s) {
    if (!s || s.type !== 'range') {
      return;
    }
    if ('min' in s && 'max' in s) {
      assert.ok(
        Number(s.min) <= Number(s.max),
        'settings_schema: range id ' + (s.id || '(missing)') + ' must have min <= max'
      );
    }
  });
});

// T14 — settings_schema.json: theme_info must remain first (Shopify convention + tooling expectations)
assert.ok(schema[0] && schema[0].name === 'theme_info', 'settings_schema: first block must be theme_info');

// T16 — settings_schema.json: every checkbox must declare a boolean default (editor + settings_data type alignment)
schema.forEach(function (block) {
  if (!block || !Array.isArray(block.settings)) {
    return;
  }
  block.settings.forEach(function (s) {
    if (!s || s.type !== 'checkbox') {
      return;
    }
    assert.ok('default' in s, 'settings_schema: checkbox id ' + (s.id || '(missing)') + ' must declare default');
    assert.strictEqual(
      typeof s.default,
      'boolean',
      'settings_schema: checkbox id ' + (s.id || '(missing)') + ' default must be boolean'
    );
  });
});

console.log('config-theme-contract: ok');
