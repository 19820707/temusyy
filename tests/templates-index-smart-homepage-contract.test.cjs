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
const idxWatches = indexTemplate.order.indexOf('homepage_editorial_watches');
const idxJewelry = indexTemplate.order.indexOf('homepage_editorial_jewelry');
assert.ok(
  idxHub !== -1 &&
    idxTrending === idxHub + 1 &&
    idxTrust === idxHub + 2 &&
    idxDepartments === idxHub + 3 &&
    idxWatches === idxHub + 4 &&
    idxJewelry === idxHub + 5,
  'index.json: after hub, popular categories, trust bar, departments, then watches and jewelry product rows, then testimonials'
);
assert.ok(idxTrending < idxTrust, 'index.json: homepage_trending_categories must appear before homepage_trust_bar');
assert.ok(idxTrust < idxDepartments, 'index.json: homepage_trust_bar must appear before homepage_department_grid');
assert.ok(idxDepartments < idxWatches, 'index.json: homepage_department_grid must appear before homepage_editorial_watches');
assert.ok(idxWatches < idxJewelry, 'index.json: homepage_editorial_watches must appear before homepage_editorial_jewelry');
assert.ok(idxTrending < idxWatches, 'index.json: trending categories must sit before product editorial rows');
assert.ok(idxTrust < idxWatches, 'index.json: homepage_trust_bar must sit before product editorial rows');
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_best_sellers_products'),
  -1,
  'index.json: minimal homepage must not include homepage_best_sellers_products in order'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_editorial_watches_banner'),
  -1,
  'index.json: minimal homepage must not include decorative watch banner in order'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_best_sellers_products'),
  'index.json: homepage_best_sellers_products section must be removed (single category funnel + two product rows)'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_editorial_watches_banner'),
  'index.json: decorative watch banner section removed'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_editorial_jewelry_banner'),
  'index.json: decorative jewelry banner section removed'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_editorial_dress_shirts'),
  'index.json: dress shirts editorial removed from minimal homepage'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_editorial_dress_pants'),
  'index.json: dress pants editorial removed from minimal homepage'
);

// T3 — Redundancy: two collection-list sections must not share the same consumer-facing title (distinct jobs).
const trendingTitle = (indexTemplate.sections.homepage_trending_categories.settings.title || '').trim().toLowerCase();
const departmentTitle = (indexTemplate.sections.homepage_department_grid.settings.title || '').trim().toLowerCase();
assert.notStrictEqual(
  trendingTitle,
  departmentTitle,
  'index.json: trending vs department collection rows must use different section titles'
);

// T4 — Hero clarity: one intent; no decorative duplicate headings in slide copy.
const heroSlide = indexTemplate.sections.homepage_hero.blocks['slide-2'].settings;
assert.strictEqual(heroSlide.title, 'Beauty & care', 'index.json: hero slide title must stay a single clear H1-style line');
assert.ok(
  typeof heroSlide.text === 'string' && heroSlide.text.indexOf('Skincare, makeup and essentials') !== -1,
  'index.json: hero slide body must use the single-intent beauty copy'
);
assert.ok(!/\bBRAND\b|\bMAKE-UP\b/i.test(heroSlide.title + ' ' + heroSlide.text), 'index.json: hero must not ship BRAND / MAKE-UP decorative copy in title or text');
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
['homepage_editorial_watches', 'homepage_editorial_jewelry'].forEach(
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
