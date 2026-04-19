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

// Smart hub — intent lanes (not only category shortcuts): bestsellers, gifts, price cap, new, support.
(function smartHubShoppingLanes() {
  const hub = indexTemplate.sections.homepage_smart_hub;
  const bo = hub.block_order;
  assert.strictEqual(bo.length, 5, 'index.json: hub must ship five lane blocks');
  assert.strictEqual(hub.blocks[bo[0]].type, 'collection_link', 'index.json: lane 1 type');
  assert.strictEqual(hub.blocks[bo[0]].settings.collection, 'best-sellers', 'index.json: lane 1 best sellers');
  assert.strictEqual(hub.blocks[bo[1]].type, 'collection_link', 'index.json: lane 2 type');
  assert.strictEqual(hub.blocks[bo[1]].settings.collection, 'toys-and-games', 'index.json: lane 2 gifts');
  assert.strictEqual(hub.blocks[bo[2]].type, 'collection_link', 'index.json: lane 3 type');
  assert.strictEqual(hub.blocks[bo[2]].settings.collection, 'under-50', 'index.json: lane 3 under fifty');
  assert.strictEqual(hub.blocks[bo[3]].type, 'collection_link', 'index.json: lane 4 type');
  assert.strictEqual(hub.blocks[bo[3]].settings.collection, 'new-arrivals', 'index.json: lane 4 new arrivals');
  assert.strictEqual(hub.blocks[bo[4]].type, 'trust_point', 'index.json: lane 5 support');
  assert.ok(
    ((hub.blocks[bo[4]].settings.title || '') + '').toLowerCase().indexOf('support') !== -1,
    'index.json: support lane title must mention support'
  );
})();

// Featured collection sections: cap choice density (6–8 SKUs per row).
['homepage_best_sellers_products', 'homepage_featured_products'].forEach(function (sid) {
  const sec = indexTemplate.sections[sid];
  if (!sec || sec.type !== 'dynamic-featured-collection') {
    return;
  }
  const n = sec.settings.product_count;
  assert.ok(typeof n === 'number' && n >= 6 && n <= 8, 'index.json: ' + sid + ' product_count must stay between 6 and 8');
});

assert.deepStrictEqual(
  indexTemplate.order,
  [
    'homepage_hero',
    'homepage_smart_hub',
    'homepage_best_sellers_products',
    'homepage_trending_categories',
    'homepage_trust_bar',
    'homepage_featured_products',
    'homepage_testimonials',
  ],
  'index.json: canonical homepage stack (hero → hub → SKUs → categories → trust → featured → reviews)'
);

const idxHub = indexTemplate.order.indexOf('homepage_smart_hub');
const idxBest = indexTemplate.order.indexOf('homepage_best_sellers_products');
const idxTrending = indexTemplate.order.indexOf('homepage_trending_categories');
const idxTrust = indexTemplate.order.indexOf('homepage_trust_bar');
const idxFeatured = indexTemplate.order.indexOf('homepage_featured_products');
assert.ok(indexTemplate.sections.homepage_best_sellers_products, 'index.json: must include homepage_best_sellers_products');
assert.strictEqual(
  indexTemplate.sections.homepage_best_sellers_products.type,
  'dynamic-featured-collection',
  'index.json: homepage_best_sellers_products must use dynamic-featured-collection'
);

// T2 — Decision engine: real product grid within first scroll (hero + hub, then featured collection).
assert.strictEqual(
  indexTemplate.order[0],
  'homepage_hero',
  'index.json: first section must be hero (orientation without a full product grid)'
);
assert.strictEqual(
  indexTemplate.order[1],
  'homepage_smart_hub',
  'index.json: second section must be smart hub (search + paths)'
);
assert.strictEqual(
  indexTemplate.order[2],
  'homepage_best_sellers_products',
  'index.json: third section must be best-sellers grid so shoppers see real products early'
);
(function decisionEngineFeaturedCollection() {
  const sec = indexTemplate.sections.homepage_best_sellers_products;
  const st = sec.settings;
  assert.strictEqual(st.collection, 'best-sellers', 'index.json: decision row must use best-sellers collection');
  assert.strictEqual(st.layout, 'grid', 'index.json: decision row must use grid layout');
  assert.strictEqual(st.product_count, 6, 'index.json: decision row must surface six products (dense first scroll)');
  assert.strictEqual(
    (st.title || '').trim(),
    "This week's top sellers",
    'index.json: decision row title must stay a specific, non-generic bestsellers line'
  );
})();
assert.ok(indexTemplate.sections.homepage_trending_categories, 'index.json: must include homepage_trending_categories');
assert.strictEqual(
  indexTemplate.sections.homepage_trending_categories.type,
  'dynamic-collection-list',
  'index.json: trending row must use dynamic-collection-list'
);
assert.ok(indexTemplate.sections.homepage_featured_products, 'index.json: must include homepage_featured_products');
assert.strictEqual(
  indexTemplate.sections.homepage_featured_products.type,
  'dynamic-featured-collection',
  'index.json: featured products row must use dynamic-featured-collection'
);
assert.ok(
  idxHub !== -1 &&
    idxBest === idxHub + 1 &&
    idxTrending === idxHub + 2 &&
    idxTrust === idxHub + 3 &&
    idxFeatured === idxHub + 4,
  'index.json: hub → bestsellers → category discovery → trust → one featured grid'
);
assert.ok(idxBest < idxTrending, 'index.json: best sellers before category thumbnails');
assert.ok(idxTrending < idxTrust, 'index.json: category row before trust bar');
assert.ok(idxTrust < idxFeatured, 'index.json: trust before final featured product strip');

// T5 — Trust bar: shipping, returns, support + volume proof (homepage merchandising contract).
(function trustBarHighConversion() {
  const bar = indexTemplate.sections.homepage_trust_bar;
  assert.strictEqual(bar.type, 'dynamic-highlights-banner', 'index.json: trust bar section type');
  const orderIds = bar.block_order;
  assert.strictEqual(orderIds.length, 4, 'index.json: trust bar must ship four highlights');
  const proof = bar.blocks[orderIds[0]].settings;
  const ship = bar.blocks[orderIds[1]].settings;
  const ret = bar.blocks[orderIds[2]].settings;
  const sup = bar.blocks[orderIds[3]].settings;
  assert.strictEqual((proof.title || '').trim(), '+12,000 orders delivered', 'index.json: trust proof title');
  assert.ok(
    (proof.text || '').indexOf('Trusted by customers worldwide') !== -1,
    'index.json: trust proof must include worldwide social proof line'
  );
  assert.strictEqual((ship.title || '').trim(), 'Fast shipping', 'index.json: shipping highlight title');
  assert.strictEqual((ship.link || '').trim(), '/policies/shipping-policy', 'index.json: shipping highlight link');
  assert.strictEqual((ret.title || '').trim(), 'Easy returns', 'index.json: returns highlight title');
  assert.strictEqual((ret.link || '').trim(), '/policies/refund-policy', 'index.json: returns highlight link');
  assert.strictEqual((sup.title || '').trim(), 'Customer support', 'index.json: support highlight title');
  assert.strictEqual((sup.link || '').trim(), 'shopify://pages/support', 'index.json: support highlight link');
})();

// T5b — Trust sits after category discovery (volume proof before the last product strip).
assert.strictEqual(idxTrust, idxTrending + 1, 'index.json: trust bar follows trending categories');
assert.strictEqual(idxFeatured, idxTrust + 1, 'index.json: featured picks follow trust');
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_editorial_watches_banner'),
  -1,
  'index.json: minimal homepage must not include decorative watch banner in order'
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

// T3 — One category surface + distinct jobs vs bestsellers / featured SKUs.
const trendingTitle = (indexTemplate.sections.homepage_trending_categories.settings.title || '').trim().toLowerCase();
const bestTitle = (indexTemplate.sections.homepage_best_sellers_products.settings.title || '').trim().toLowerCase();
const featuredTitle = (indexTemplate.sections.homepage_featured_products.settings.title || '').trim().toLowerCase();
assert.notStrictEqual(trendingTitle, bestTitle, 'index.json: trending categories title must differ from bestsellers row');
assert.notStrictEqual(trendingTitle, featuredTitle, 'index.json: trending categories title must differ from featured picks row');
assert.notStrictEqual(bestTitle, featuredTitle, 'index.json: bestsellers vs featured picks must stay visually distinct');
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_department_grid'),
  'index.json: remove duplicate department grid (trending categories is the single category explorer)'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_recently_viewed'),
  'index.json: recently viewed removed from minimal homepage stack'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_editorial_watches'),
  'index.json: extra editorial watches row removed for one objective per product strip'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_editorial_jewelry'),
  'index.json: extra editorial jewelry row folded into homepage_featured_products'
);

// T4 — Hero: what is this + what do I do next (minimal copy, single CTA, no full-slide link duplicate).
const heroSlide = indexTemplate.sections.homepage_hero.blocks['slide-2'].settings;
assert.strictEqual(heroSlide.title, 'Beauty & care', 'index.json: hero title answers category intent');
assert.ok(
  typeof heroSlide.text === 'string' && heroSlide.text.indexOf('Skincare, makeup and essentials.') !== -1,
  'index.json: hero subtext stays one short line'
);
assert.strictEqual(
  (heroSlide.button_one_label || '').trim(),
  'Shop now',
  'index.json: hero must expose exactly one primary CTA label'
);
assert.ok(
  (heroSlide.button_one_link || '').indexOf('collections/health-and-beauty') !== -1 ||
    (heroSlide.button_one_link || '').indexOf('health-and-beauty') !== -1,
  'index.json: hero CTA must deep-link into the beauty collection'
);
assert.strictEqual(
  (heroSlide.link || '').trim(),
  '',
  'index.json: hero slide background link must be blank so the image is not a second competing CTA'
);
assert.strictEqual((heroSlide.button_two_label || '').trim(), '', 'index.json: hero must not ship a second button label');
assert.strictEqual((heroSlide.button_two_link || '').trim(), '', 'index.json: hero must not ship a second button link');
assert.ok(!/\bBRAND\b|\bMAKE-UP\b/i.test(heroSlide.title + ' ' + heroSlide.text), 'index.json: hero must not ship BRAND / MAKE-UP decorative copy in title or text');
assert.strictEqual(
  indexTemplate.sections.homepage_hero.settings.slideshow_height,
  'small',
  'index.json: hero uses compact slideshow height (less billboard, product-forward)'
);
assert.strictEqual(
  indexTemplate.sections.homepage_hero.settings.slideshow_height_mobile,
  'small',
  'index.json: hero mobile height matches compact preset for consistent framing on small screens'
);
assert.strictEqual(
  indexTemplate.sections.homepage_hero.settings.slideshow_width,
  'content',
  'index.json: hero uses content width to reduce heavy full-bleed branding'
);
assert.strictEqual(
  indexTemplate.sections.homepage_hero.settings.slideshow_text_below_image,
  true,
  'index.json: hero keeps text and CTA below the image (no headline stacked on the product photo)'
);
assert.strictEqual(
  indexTemplate.order[indexTemplate.order.length - 1],
  'homepage_testimonials',
  'index.json: homepage_testimonials must close the page (social proof last)'
);
assert.strictEqual(
  (indexTemplate.sections.homepage_testimonials.settings.title || '').trim(),
  'What buyers said (with photos)',
  'index.json: testimonials title must read human and specific (not generic “reviews”)'
);
assert.strictEqual(
  indexTemplate.sections.homepage_testimonials.block_order.length,
  4,
  'index.json: keep testimonial count modest (lighter DOM / less carousel-like density)'
);

// T9 — Performance posture: product strips use grids on mobile (no slideshow layout on homepage collections).
['homepage_best_sellers_products', 'homepage_featured_products'].forEach(function (sid) {
  const sec = indexTemplate.sections[sid];
  assert.strictEqual(sec.settings.layout, 'grid', 'index.json: ' + sid + ' must use grid layout');
  assert.strictEqual(sec.settings.mobile_layout, 'grid', 'index.json: ' + sid + ' must use mobile grid (avoid deep carousels)');
});
assert.strictEqual(
  indexTemplate.sections.homepage_trust_bar.settings.mobile_layout,
  'grid',
  'index.json: trust bar must stay grid on small screens'
);
assert.strictEqual(
  indexTemplate.sections.homepage_hero.block_order.length,
  1,
  'index.json: hero must ship a single slide (lighter hero + no useless slide churn)'
);
assert.strictEqual(
  indexTemplate.sections.homepage_hero.settings.enable_autoplay,
  false,
  'index.json: hero autoplay off (saves motion + CPU; faster perceived load)'
);

// T7 — No placeholder apps section: homepage must not ship an empty `apps` shell (removed from template; re-add via editor when an app block is needed).
assert.ok(
  !Object.values(indexTemplate.sections || {}).some(function (s) {
    return s && s.type === 'apps';
  }),
  'index.json: must not include an apps-only placeholder section on the homepage'
);

// T8 — Featured collection rows should expose a primary CTA label (conversion + screen-reader context on section chrome).
['homepage_best_sellers_products', 'homepage_featured_products'].forEach(function (sid) {
  const sec = indexTemplate.sections[sid];
  if (!sec || sec.type !== 'dynamic-featured-collection') {
    return;
  }
  assert.ok(
    typeof sec.settings.cta_label === 'string' && sec.settings.cta_label.trim().length > 0,
    'index.json: ' + sid + ' must set a non-empty cta_label'
  );
});

console.log('templates-index-smart-homepage-contract: ok');
