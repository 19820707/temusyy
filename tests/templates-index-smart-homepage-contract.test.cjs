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

assert.ok(indexTemplate.sections.homepage_smart_hub, 'index.json: must include homepage_smart_hub');
assert.strictEqual(
  indexTemplate.sections.homepage_smart_hub.type,
  'dynamic-smart-homepage-hub',
  'index.json: homepage_smart_hub must use dynamic-smart-homepage-hub'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_smart_hub'),
  indexTemplate.order.indexOf('homepage_hero') + 1,
  'index.json: homepage_smart_hub must appear immediately after the hero slideshow'
);
assert.ok(
  indexTemplate.sections.homepage_smart_hub.settings.primary_link,
  'index.json: homepage_smart_hub primary CTA must be configured'
);
assert.ok(
  indexTemplate.sections.homepage_smart_hub.block_order.length >= 4,
  'index.json: homepage_smart_hub must include enough paths/trust points to guide shoppers'
);

const idxHub = indexTemplate.order.indexOf('homepage_smart_hub');
const idxTrending = indexTemplate.order.indexOf('homepage_trending_categories');
const idxDepartments = indexTemplate.order.indexOf('homepage_department_grid');
const idxTrust = indexTemplate.order.indexOf('homepage_trust_bar');
const idxFirstEditorial = indexTemplate.order.indexOf('homepage_editorial_watches_banner');
assert.ok(
  idxHub !== -1 &&
    idxTrending === idxHub + 1 &&
    idxDepartments === idxHub + 2 &&
    idxTrust !== -1 &&
    idxFirstEditorial !== -1,
  'index.json: after hub, best-sellers row then departments, then trust before editorial showcases'
);
assert.ok(idxTrust < idxFirstEditorial, 'index.json: homepage_trust_bar must sit before deep editorial showcases');
assert.strictEqual(
  indexTemplate.order[indexTemplate.order.length - 1],
  'homepage_testimonials',
  'index.json: homepage_testimonials must close the page (social proof last)'
);

// T7 — No placeholder apps section: homepage must not ship an empty `apps` shell (removed from template; re-add via editor when an app block is needed).
assert.ok(
  !Object.values(indexTemplate.sections || {}).some(function (s) {
    return s && s.type === 'apps';
  }),
  'index.json: must not include an apps-only placeholder section on the homepage'
);

// T8 — Featured collection rows should expose a primary CTA label (conversion + screen-reader context on section chrome).
[
  'homepage_editorial_watches',
  'homepage_editorial_jewelry',
  'homepage_editorial_dress_shirts',
  'homepage_editorial_dress_pants',
].forEach(
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
