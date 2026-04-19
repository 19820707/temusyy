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
  indexTemplate.order.indexOf('homepage_deal_countdown'),
  indexTemplate.order.indexOf('homepage_hero') + 1,
  'index.json: deal countdown must follow hero (time urgency near the fold)'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_smart_hub'),
  indexTemplate.order.indexOf('homepage_deal_countdown') + 1,
  'index.json: smart hub must follow deal countdown'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_best_sellers_products'),
  indexTemplate.order.indexOf('homepage_smart_hub') + 1,
  'index.json: bestsellers grid must follow hub'
);
assert.strictEqual(
  indexTemplate.order.indexOf('homepage_trust_bar'),
  indexTemplate.order.indexOf('homepage_best_sellers_products') + 1,
  'index.json: trust bar must follow bestsellers (proof near the fold)'
);
assert.ok(
  indexTemplate.sections.homepage_smart_hub.settings.primary_link,
  'index.json: homepage_smart_hub primary CTA must be configured'
);
assert.ok(
  indexTemplate.sections.homepage_smart_hub.block_order.length >= 4,
  'index.json: homepage_smart_hub must include enough paths/trust points to guide shoppers'
);

// Smart hub — shopping path engine: gifts → trending → under $50 → best sellers → support.
(function smartHubShoppingLanes() {
  const hub = indexTemplate.sections.homepage_smart_hub;
  const bo = hub.block_order;
  assert.strictEqual(hub.settings.paths_layout, 'path_chips', 'index.json: hub must use path_chips layout');
  assert.strictEqual(bo.length, 8, 'index.json: hub must ship five lane blocks plus three search intent hints');
  assert.strictEqual(hub.blocks[bo[0]].type, 'collection_link', 'index.json: lane 1 type');
  assert.strictEqual(hub.blocks[bo[0]].settings.collection, 'toys-and-games', 'index.json: lane 1 gifts path');
  assert.strictEqual((hub.blocks[bo[0]].settings.chip_label || '').trim(), 'Gifts', 'index.json: lane 1 chip Gifts');
  assert.strictEqual(hub.blocks[bo[1]].type, 'collection_link', 'index.json: lane 2 type');
  assert.strictEqual(hub.blocks[bo[1]].settings.collection, 'new-arrivals', 'index.json: lane 2 trending path');
  assert.strictEqual((hub.blocks[bo[1]].settings.chip_label || '').trim(), 'Trending', 'index.json: lane 2 chip Trending');
  assert.strictEqual(hub.blocks[bo[2]].type, 'collection_link', 'index.json: lane 3 type');
  assert.strictEqual(hub.blocks[bo[2]].settings.collection, 'under-50', 'index.json: lane 3 under fifty');
  assert.strictEqual(hub.blocks[bo[3]].type, 'collection_link', 'index.json: lane 4 type');
  assert.strictEqual(hub.blocks[bo[3]].settings.collection, 'best-sellers', 'index.json: lane 4 best sellers');
  assert.strictEqual(hub.blocks[bo[4]].type, 'trust_point', 'index.json: lane 5 support');
  assert.ok(
    ((hub.blocks[bo[4]].settings.title || '') + '').toLowerCase().indexOf('support') !== -1,
    'index.json: support lane title must mention support'
  );
  assert.strictEqual(hub.blocks[bo[5]].type, 'search_intent_hint', 'index.json: intent block 1 type');
  assert.strictEqual(
    (hub.blocks[bo[5]].settings.label || '').trim(),
    'Watches under $50',
    'index.json: intent under $50 label'
  );
  assert.strictEqual(hub.blocks[bo[6]].type, 'search_intent_hint', 'index.json: intent block 2 type');
  assert.strictEqual(
    (hub.blocks[bo[6]].settings.label || '').trim(),
    'Premium watches',
    'index.json: intent premium label'
  );
  assert.strictEqual(hub.blocks[bo[7]].type, 'search_intent_hint', 'index.json: intent block 3 type');
  assert.strictEqual((hub.blocks[bo[7]].settings.label || '').trim(), 'Best sellers', 'index.json: intent bestsellers label');
  assert.ok(
    ((hub.blocks[bo[5]].settings.keywords || '') + '').toLowerCase().indexOf('watch') !== -1,
    'index.json: intent hints must trigger on watch-related typing'
  );
})();

(function homepageDealCountdown() {
  const cd = indexTemplate.sections.homepage_deal_countdown;
  assert.ok(cd, 'index.json: must include homepage_deal_countdown');
  assert.strictEqual(cd.type, 'dynamic-countdown-timer', 'index.json: deal strip must use dynamic-countdown-timer');
  const st = cd.settings;
  assert.strictEqual(st.countdown_timer_complete, true, 'index.json: countdown should hide when offer window ends');
  assert.ok(
    ((st.title || '') + '').toLowerCase().indexOf('ends') !== -1,
    'index.json: countdown title must signal time pressure (Ends in…)'
  );
  assert.ok(
    ((st.button_link || '') + '').indexOf('best-sellers') !== -1,
    'index.json: countdown CTA should deep-link into bestsellers collection'
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
    'homepage_deal_countdown',
    'homepage_smart_hub',
    'homepage_best_sellers_products',
    'homepage_trust_bar',
    'homepage_adaptive_priority',
    'homepage_trending_categories',
    'homepage_featured_products',
    'homepage_testimonials',
  ],
  'index.json: canonical homepage stack (hero → countdown → hub → bestsellers → trust → adaptive → categories → featured → reviews)'
);

const idxCountdown = indexTemplate.order.indexOf('homepage_deal_countdown');
const idxHub = indexTemplate.order.indexOf('homepage_smart_hub');
const idxBest = indexTemplate.order.indexOf('homepage_best_sellers_products');
const idxAdapt = indexTemplate.order.indexOf('homepage_adaptive_priority');
const idxTrending = indexTemplate.order.indexOf('homepage_trending_categories');
const idxTrust = indexTemplate.order.indexOf('homepage_trust_bar');
const idxFeatured = indexTemplate.order.indexOf('homepage_featured_products');
assert.ok(indexTemplate.sections.homepage_best_sellers_products, 'index.json: must include homepage_best_sellers_products');
assert.strictEqual(
  indexTemplate.sections.homepage_best_sellers_products.type,
  'dynamic-featured-collection',
  'index.json: homepage_best_sellers_products must use dynamic-featured-collection'
);
assert.ok(indexTemplate.sections.homepage_adaptive_priority, 'index.json: must include homepage_adaptive_priority');
assert.strictEqual(
  indexTemplate.sections.homepage_adaptive_priority.type,
  'dynamic-adaptive-homepage-priority',
  'index.json: adaptive strip must use dynamic-adaptive-homepage-priority'
);
(function adaptivePriorityStrip() {
  const st = indexTemplate.sections.homepage_adaptive_priority.settings;
  const n = st.product_limit;
  assert.ok(typeof n === 'number' && n >= 2 && n <= 8, 'index.json: adaptive product_limit must stay between 2 and 8');
  assert.ok(
    typeof st.cta_label === 'string' && st.cta_label.indexOf('[[collection]]') !== -1,
    'index.json: adaptive CTA must support [[collection]] token'
  );
})();

// T2 — One-screen commerce: hero → countdown → hub → bestsellers → trust (urgency then guided paths).
assert.strictEqual(
  indexTemplate.order[0],
  'homepage_hero',
  'index.json: first section must be hero (orientation without a full product grid)'
);
assert.strictEqual(
  indexTemplate.order[1],
  'homepage_deal_countdown',
  'index.json: second section must be deal countdown (urgency + time)'
);
assert.strictEqual(
  indexTemplate.order[2],
  'homepage_smart_hub',
  'index.json: third section must be smart hub (search + shopping paths)'
);
assert.strictEqual(
  indexTemplate.order[3],
  'homepage_best_sellers_products',
  'index.json: fourth section must be best-sellers grid (main SKU decision surface near the fold)'
);
assert.strictEqual(
  indexTemplate.order[4],
  'homepage_trust_bar',
  'index.json: fifth section must be trust bar (proof immediately after bestsellers)'
);
assert.strictEqual(
  indexTemplate.order[5],
  'homepage_adaptive_priority',
  'index.json: sixth section must be adaptive priority (cookie-driven; empty until interest is set)'
);
(function decisionEngineFeaturedCollection() {
  const sec = indexTemplate.sections.homepage_best_sellers_products;
  const st = sec.settings;
  assert.strictEqual(st.collection, 'best-sellers', 'index.json: decision row must use best-sellers collection');
  assert.strictEqual(st.layout, 'grid', 'index.json: decision row must use grid layout');
  assert.strictEqual(st.product_count, 8, 'index.json: decision row must surface eight products (max density within 6–8 contract)');
  assert.strictEqual(
    st.temusy_intent_zone,
    'buy',
    'index.json: bestsellers featured collection must opt into buy-intent zone (intent detection)'
  );
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
  idxCountdown !== -1 &&
    idxHub === idxCountdown + 1 &&
    idxBest === idxHub + 1 &&
    idxTrust === idxHub + 2 &&
    idxAdapt === idxHub + 3 &&
    idxTrending === idxHub + 4 &&
    idxFeatured === idxHub + 5,
  'index.json: countdown → hub → bestsellers → trust → adaptive → categories → featured grid'
);
assert.ok(idxBest < idxAdapt, 'index.json: best sellers before adaptive strip');
assert.ok(idxAdapt < idxTrending, 'index.json: adaptive strip before category thumbnails');
assert.ok(idxBest < idxTrending, 'index.json: best sellers before category thumbnails');
assert.ok(idxTrust < idxAdapt, 'index.json: trust bar before adaptive strip');
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
  assert.ok(
    (proof.text || '').toLowerCase().indexOf('anxiety') !== -1,
    'index.json: trust proof should name reduced purchase anxiety (psychological economy)'
  );
  assert.strictEqual(
    (ship.title || '').trim(),
    'Shipping costs & timelines—up front',
    'index.json: shipping highlight title (psychological risk reduction)'
  );
  assert.strictEqual((ship.link || '').trim(), '/policies/shipping-policy', 'index.json: shipping highlight link');
  assert.ok(
    (ship.text || '').toLowerCase().indexOf('policy') !== -1,
    'index.json: shipping highlight must point shoppers to written policy'
  );
  assert.strictEqual(
    (ret.title || '').trim(),
    'Returns you can read before you buy',
    'index.json: returns highlight title (psychological risk reduction)'
  );
  assert.strictEqual((ret.link || '').trim(), '/policies/refund-policy', 'index.json: returns highlight link');
  assert.ok(
    (ret.text || '').toLowerCase().indexOf('policy') !== -1,
    'index.json: returns highlight must reference policy clarity'
  );
  assert.strictEqual(
    (sup.title || '').trim(),
    'Support when an order matters',
    'index.json: support highlight title (psychological risk reduction)'
  );
  assert.strictEqual((sup.link || '').trim(), 'shopify://pages/support', 'index.json: support highlight link');
})();

// T5b — Trust sits right after bestsellers; deeper discovery (categories, featured) stays below the primary stack.
assert.strictEqual(idxTrust, idxBest + 1, 'index.json: trust bar follows bestsellers grid');
assert.strictEqual(idxAdapt, idxTrust + 1, 'index.json: adaptive strip follows trust');
assert.strictEqual(idxTrending, idxAdapt + 1, 'index.json: trending categories follow adaptive');
assert.strictEqual(idxFeatured, idxTrending + 1, 'index.json: featured picks follow category row');
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
  'See Beauty offers',
  'index.json: hero must use a reward-lane CTA (not generic Shop now) while staying collection-honest'
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

// Adaptive interest: cookie bridge + hub anchors (Liquid cannot read localStorage).
(function adaptiveInterestWiring() {
  const root = path.join(__dirname, '..');
  const themeLiquid = fs.readFileSync(path.join(root, 'layout', 'theme.liquid'), 'utf8');
  const bridge = fs.readFileSync(path.join(root, 'snippets', 'temusy-interest-bridge.liquid'), 'utf8');
  const hubLiquid = fs.readFileSync(path.join(root, 'sections', 'dynamic-smart-homepage-hub.liquid'), 'utf8');
  const collectionItem = fs.readFileSync(path.join(root, 'snippets', 'collection-list-item.liquid'), 'utf8');
  const adaptiveSection = fs.readFileSync(
    path.join(root, 'sections', 'dynamic-adaptive-homepage-priority.liquid'),
    'utf8'
  );
  const inlineProducts = fs.readFileSync(
    path.join(root, 'sections', 'dynamic-featured-product-inline.liquid'),
    'utf8'
  );
  assert.match(themeLiquid, /render\s+'temusy-interest-bridge'/, 'theme.liquid: must load temusy-interest-bridge (feedback loop cookie)');
  assert.match(themeLiquid, /render\s+'temusy-personalization-engine'/, 'theme.liquid: must load temusy-personalization-engine (adaptive shell)');
  assert.match(
    themeLiquid,
    /data-temusy-feedback-collection/,
    'theme.liquid: must expose data-temusy-feedback-collection on body for product/collection view signals'
  );
  assert.match(
    themeLiquid,
    /template\.name\s*==\s*['"]index['"][\s\S]{0,800}temusy-intent-detection/,
    'theme.liquid: index template must load temusy-intent-detection (scroll/click/idle heuristics)'
  );
  const intentSnippet = fs.readFileSync(path.join(root, 'snippets', 'temusy-intent-detection.liquid'), 'utf8');
  assert.match(intentSnippet, /temusy_home_intent/, 'temusy-intent-detection: must persist intent key in sessionStorage');
  assert.match(intentSnippet, /FAST_SCROLL_PX/, 'temusy-intent-detection: must define fast-scroll threshold');
  assert.match(intentSnippet, /commit\('buy'\)/, 'temusy-intent-detection: must commit buy intent on fast click');
  assert.match(intentSnippet, /commit\('indecisive'\)/, 'temusy-intent-detection: must commit indecisive on long idle');
  assert.match(intentSnippet, /temusy:intent/, 'temusy-intent-detection: must emit temusy:intent for personalization sync');
  assert.match(bridge, /temusy_interest/, 'temusy-interest-bridge: must set temusy_interest cookie name');
  assert.match(bridge, /cartcount:update/, 'temusy-interest-bridge: must listen for cartcount:update (add-to-cart feedback)');
  assert.match(bridge, /data-temusy-feedback-collection/, 'temusy-interest-bridge: must read data-temusy-feedback-collection rows');
  assert.match(bridge, /data-product-atc/, 'temusy-interest-bridge: must capture ATC context via data-product-atc');
  assert.match(hubLiquid, /data-temusy-interest="\{\{\s*block\.settings\.collection/, 'hub: collection cards must expose data-temusy-interest');
  assert.match(
    collectionItem,
    /data-temusy-interest="\{\{\s*current_collection\.handle/,
    'collection-list-item: real collection links must tag data-temusy-interest with handle'
  );
  assert.match(
    adaptiveSection,
    /request\.cookies\.temusy_interest/,
    'dynamic-adaptive-homepage-priority: must read request.cookies.temusy_interest'
  );
  assert.match(
    inlineProducts,
    /data-featured-product-inline/,
    'dynamic-featured-product-inline: must expose section hook for contracts / styling'
  );
  assert.match(
    inlineProducts,
    /render\s+'product-grid-item'/,
    'dynamic-featured-product-inline: must render real product cards (re-add via Theme Editor when a compact strip is needed)'
  );
  assert.match(inlineProducts, /"id":\s*"limit"/, 'dynamic-featured-product-inline: schema must expose limit setting');
})();

console.log('templates-index-smart-homepage-contract: ok');
