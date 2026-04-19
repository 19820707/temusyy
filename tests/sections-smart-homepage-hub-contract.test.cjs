/**
 * Contract tests for sections/dynamic-smart-homepage-hub.liquid.
 *
 * The homepage hub is a conversion/navigation layer: it must work without JS,
 * keep links crawlable, and avoid app/runtime dependencies.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync(path.join(__dirname, '..', 'sections', 'dynamic-smart-homepage-hub.liquid'), 'utf8');

assert.match(src, /<form[\s\S]{0,200}action="\{\{\s*routes\.search_url\s*\}\}"/, 'smart hub: search form must submit to Shopify search');
assert.match(src, /method="get"/, 'smart hub: search form must use GET');
assert.match(src, /name="q"/, 'smart hub: search input must use q parameter');
assert.match(src, /collections\[block\.settings\.collection\]/, 'smart hub: collection blocks must resolve Shopify collections');
assert.match(src, /block\.shopify_attributes/, 'smart hub: blocks must keep theme editor attributes');
assert.match(src, /aria-labelledby="smart-homepage-hub-title-/, 'smart hub: section must expose labelled region');
assert.match(src, /aria-label="\{\{\s*section\.settings\.panel_label\s*\|\s*escape\s*\}\}"/, 'smart hub: panel must expose accessible label');
assert.doesNotMatch(src, /<script\b/i, 'smart hub: must not add JS to homepage');
assert.doesNotMatch(src, /console\./, 'smart hub: must not log to console');

console.log('sections-smart-homepage-hub-contract: ok');
