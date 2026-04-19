/**
 * Contract tests for templates/index.json homepage merchandising.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function stripLeadingBlockComment(src) {
  const s = src.replace(/^\uFEFF/, '');
  if (!/^\s*\/\*/.test(s)) return s;
  const end = s.indexOf('*/');
  if (end === -1) return s;
  return s.slice(end + 2);
}

const indexTemplate = JSON.parse(
  stripLeadingBlockComment(fs.readFileSync(path.join(__dirname, '..', 'templates', 'index.json'), 'utf8'))
);

assert.ok(indexTemplate.sections.smart_homepage_hub, 'index.json: must include smart_homepage_hub');
assert.strictEqual(
  indexTemplate.sections.smart_homepage_hub.type,
  'dynamic-smart-homepage-hub',
  'index.json: smart_homepage_hub must use dynamic-smart-homepage-hub'
);
assert.strictEqual(
  indexTemplate.order.indexOf('smart_homepage_hub'),
  indexTemplate.order.indexOf('dynamic_slideshow') + 1,
  'index.json: smart_homepage_hub must appear immediately after the hero slideshow'
);
assert.ok(
  indexTemplate.sections.smart_homepage_hub.settings.primary_link,
  'index.json: smart_homepage_hub primary CTA must be configured'
);
assert.ok(
  indexTemplate.sections.smart_homepage_hub.block_order.length >= 4,
  'index.json: smart_homepage_hub must include enough paths/trust points to guide shoppers'
);

// T7 — No placeholder apps section: homepage must not ship an empty `apps` shell (removed from template; re-add via editor when an app block is needed).
assert.ok(
  !Object.values(indexTemplate.sections || {}).some(function (s) {
    return s && s.type === 'apps';
  }),
  'index.json: must not include an apps-only placeholder section on the homepage'
);

// T8 — Featured collection rows should expose a primary CTA label (conversion + screen-reader context on section chrome).
['dynamic_featured_collection-2', 'dynamic_featured_collection_Tc6fXq', 'dynamic_featured_collection', 'dynamic_featured_collection_ppMTgJ'].forEach(
  function (sid) {
    const sec = indexTemplate.sections[sid];
    if (!sec || sec.type !== 'dynamic-featured-collection') {
      return;
    }
    assert.ok(
      typeof sec.settings.cta_label === 'string' && sec.settings.cta_label.trim().length > 0,
      'index.json: ' + sid + ' must set a non-empty cta_label'
    );
  }
);

console.log('templates-index-smart-homepage-contract: ok');
