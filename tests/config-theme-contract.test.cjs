/**
 * Contract tests for config/*.json (Shopify JSON with optional block-comment preamble).
 *
 * Invariants enforced here mirror comments in config files — not runtime Liquid.
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

// T4 — JSON stability: markets root shape
assert.ok(markets && typeof markets.markets === 'object', 'markets.json: markets key must be an object');

// T5 — settings_data has expected top-level buckets (minimal payload structure)
assert.ok(data.current && data.presets && typeof data.presets === 'object', 'settings_data: must expose current + presets');

console.log('config-theme-contract: ok');
