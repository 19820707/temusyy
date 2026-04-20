/**
 * Contract tests for templates/index.json homepage merchandising.
 *
 * Canonical stack: hero → deal_zone → trending_products (best-sellers grid) → decision_shortcuts (hub) →
 * trust_bar → category_grid → featured_products → recently_viewed → testimonials (exactly nine sections).
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

/** Single source of truth for homepage section order (keep in sync with index.json block comment). */
const CANONICAL_HOMEPAGE_ORDER = [
  'homepage_hero',
  'homepage_deal_zone',
  'homepage_best_sellers_products',
  'homepage_smart_hub',
  'homepage_trust_bar',
  'homepage_trending_categories',
  'homepage_featured_products',
  'homepage_recently_viewed',
  'homepage_testimonials',
];

const indexTemplate = JSON.parse(
  stripLeadingBlockComment(fs.readFileSync(path.join(__dirname, '..', 'templates', 'index.json'), 'utf8'))
);

assert.strictEqual(indexTemplate.order.length, 9, 'index.json: homepage order must stay at nine sections');
assert.strictEqual(
  new Set(indexTemplate.order).size,
  indexTemplate.order.length,
  'index.json: order must not list the same section id twice'
);
assert.strictEqual(
  Object.keys(indexTemplate.sections).length,
  indexTemplate.order.length,
  'index.json: every defined section must appear in order (no orphan sections{})'
);
assert.deepStrictEqual(
  Object.keys(indexTemplate.sections).sort(),
  [...CANONICAL_HOMEPAGE_ORDER].sort(),
  'index.json: sections{} keys must match order[] set'
);
CANONICAL_HOMEPAGE_ORDER.forEach(function (id) {
  assert.ok(indexTemplate.sections[id], 'index.json: order references missing section: ' + id);
});

assert.ok(indexTemplate.sections.homepage_deal_zone, 'index.json: must include homepage_deal_zone');
assert.strictEqual(
  indexTemplate.sections.homepage_deal_zone.type,
  'dynamic-temusy-deal-zone',
  'index.json: deal zone must use dynamic-temusy-deal-zone'
);
assert.strictEqual(
  indexTemplate.sections.homepage_deal_zone.settings.collection,
  'best-sellers',
  'index.json: deal zone collection must align with bestsellers lane'
);
assert.strictEqual(
  indexTemplate.sections.homepage_deal_zone.settings.product_count,
  8,
  'index.json: deal zone product_count stays dense for marketplace-style rail (eight SKUs)'
);
assert.strictEqual(
  indexTemplate.sections.homepage_deal_zone.settings.show_countdown,
  true,
  'index.json: deal zone must ship the live countdown strip'
);
assert.strictEqual(
  indexTemplate.sections.homepage_deal_zone.settings.show_bundle_lane,
  true,
  'index.json: deal zone must ship the bundle lane (AliExpress-style dual rail)'
);

(function dealZoneMarketplaceChrome() {
  const dz = fs.readFileSync(path.join(__dirname, '..', 'sections', 'dynamic-temusy-deal-zone.liquid'), 'utf8');
  assert.match(dz, /temusy-deal-zone__rails--split/, 'deal zone: must support split rails when bundle lane is on');
  assert.match(dz, /temusy-deal-zone__scroller/, 'deal zone: must ship horizontal SKU scroller');
  assert.match(dz, /temusy-deal-zone__scroller-shell/, 'deal zone: must wrap scroller with chrome (nav + region)');
  assert.match(dz, /data-initial-remaining-sec=/, 'deal zone: must expose server-computed window for progress + timer');
  assert.match(dz, /data-temusy-deal-progress/, 'deal zone: must render temporal progress affordance');
  assert.match(dz, /shopify:section:unload/, 'deal zone: must tear down listeners/timers on section unload');
  assert.match(dz, /visibilitychange/, 'deal zone: must sync countdown with tab visibility');
  assert.ok(
    !/render\s+'product-grid-item'/.test(dz),
    'deal zone: must not render heavy product-grid-item in the horizontal rail (use lightweight card)'
  );
  assert.match(
    dz,
    /render\s+'temusy-deal-zone-card'/,
    'deal zone: must render lightweight temusy-deal-zone-card in the SKU rail'
  );
  const dealCard = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'temusy-deal-zone-card.liquid'), 'utf8');
  assert.match(
    dealCard,
    /data-temusy-feedback-collection/,
    'temusy-deal-zone-card: must expose data-temusy-feedback-collection for personalization clicks'
  );
  assert.match(dealCard, /image_url:\s*width:\s*480/, 'temusy-deal-zone-card: must cap image src width');
  assert.match(dealCard, /widths:\s*'200,\s*280,\s*400,\s*480'/, 'temusy-deal-zone-card: must ship responsive srcset widths');
})();

assert.ok(indexTemplate.sections.homepage_smart_hub, 'index.json: must include homepage_smart_hub');
assert.strictEqual(
  indexTemplate.sections.homepage_smart_hub.type,
  'dynamic-smart-homepage-hub',
  'index.json: homepage_smart_hub must use dynamic-smart-homepage-hub'
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

(function smartHubAutomaticShopFlowCopy() {
  const hub = indexTemplate.sections.homepage_smart_hub;
  const st = hub.settings;
  const plain = (st.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  assert.ok(plain.length === 0, 'index.json: hub body text must be empty (no long fold explanations)');
  assert.ok(
    /shop flow/i.test((st.title || '').trim()),
    'index.json: hub title must read as automatic shop flow (Shop flow automático / shop flow)'
  );
  assert.ok(
    ((st.search_placeholder || '').trim().length > 0 && (st.search_placeholder || '').trim().length <= 40),
    'index.json: hub search placeholder stays short'
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
  CANONICAL_HOMEPAGE_ORDER,
  'index.json: canonical 9-step stack (hero → deal_zone → trending_products → decision_shortcuts → trust_bar → category_grid → featured_products → recently_viewed → testimonials)'
);

const idxHero = indexTemplate.order.indexOf('homepage_hero');
const idxDeal = indexTemplate.order.indexOf('homepage_deal_zone');
const idxBest = indexTemplate.order.indexOf('homepage_best_sellers_products');
const idxHub = indexTemplate.order.indexOf('homepage_smart_hub');
const idxTrust = indexTemplate.order.indexOf('homepage_trust_bar');
const idxTrending = indexTemplate.order.indexOf('homepage_trending_categories');
const idxFeatured = indexTemplate.order.indexOf('homepage_featured_products');
const idxRecent = indexTemplate.order.indexOf('homepage_recently_viewed');
assert.strictEqual(idxDeal, idxHero + 1, 'index.json: deal zone immediately after hero');
assert.strictEqual(idxBest, idxHero + 2, 'index.json: product grid immediately after deal zone');
assert.ok(indexTemplate.sections.homepage_best_sellers_products, 'index.json: must include homepage_best_sellers_products');
assert.strictEqual(
  indexTemplate.sections.homepage_best_sellers_products.type,
  'dynamic-featured-collection',
  'index.json: homepage_best_sellers_products must use dynamic-featured-collection'
);

// T2 — Nine-step commerce: hero → deal zone → SKUs → hub → trust → categories → featured → recent → reviews.
CANONICAL_HOMEPAGE_ORDER.forEach(function (expectedId, i) {
  assert.strictEqual(
    indexTemplate.order[i],
    expectedId,
    'index.json: order[' + i + '] must be ' + expectedId
  );
});
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
(function intentShortcutCollectionStrip() {
  const sec = indexTemplate.sections.homepage_trending_categories;
  const bo = sec.block_order;
  assert.strictEqual(bo.length, 3, 'index.json: category_grid ships three visual quick paths (anti-decision: fewer tiles)');
  assert.ok(
    (sec.settings.title || '').trim().toLowerCase().indexOf('quick') !== -1,
    'index.json: category row title must read as quick paths (no “shop by intent” tutorial framing)'
  );
  assert.strictEqual(sec.blocks[bo[0]].settings.collection, 'under-50', 'index.json: quick path 1 → under fifty');
  assert.strictEqual(sec.blocks[bo[1]].settings.collection, 'best-sellers', 'index.json: quick path 2 → best sellers');
  assert.strictEqual(sec.blocks[bo[2]].settings.collection, 'new-arrivals', 'index.json: quick path 3 → new arrivals');
  assert.ok(
    (sec.blocks[bo[0]].settings.title || '').toLowerCase().indexOf('50') !== -1,
    'index.json: first tile label must signal the value ceiling'
  );
})();
assert.ok(indexTemplate.sections.homepage_featured_products, 'index.json: must include homepage_featured_products');
assert.strictEqual(
  indexTemplate.sections.homepage_featured_products.type,
  'dynamic-featured-collection',
  'index.json: featured products row must use dynamic-featured-collection'
);
(function featuredRowBuyIntentZone() {
  const st = indexTemplate.sections.homepage_featured_products.settings;
  assert.strictEqual(
    st.temusy_intent_zone,
    'buy',
    'index.json: featured collection row must opt into buy-intent zone (intent detection + consistency with bestsellers row)'
  );
})();
assert.ok(
  idxHero !== -1 &&
    idxDeal === idxHero + 1 &&
    idxBest === idxHero + 2 &&
    idxHub === idxBest + 1 &&
    idxTrust === idxHub + 1 &&
    idxTrending === idxTrust + 1 &&
    idxFeatured === idxTrending + 1 &&
    idxRecent === idxFeatured + 1 &&
    indexTemplate.order.indexOf('homepage_testimonials') === idxRecent + 1,
  'index.json: hero → deal_zone → trending_products → decision_shortcuts → trust_bar → category_grid → featured_products → recently_viewed → testimonials'
);
assert.ok(idxDeal < idxBest, 'index.json: deal zone before first product grid');
assert.ok(idxBest < idxHub, 'index.json: first product grid before hub');
assert.ok(idxHub < idxTrust, 'index.json: hub before trust');
assert.ok(idxTrust < idxTrending, 'index.json: trust before category grid');
assert.ok(idxTrending < idxFeatured, 'index.json: categories before featured picks');
assert.ok(idxFeatured < idxRecent, 'index.json: featured before recently viewed');

// T5 — Trust bar: Amazon-style intent chips (free ship, returns, secure checkout, 24/7) + high-contrast strip.
(function trustBarHighConversion() {
  const bar = indexTemplate.sections.homepage_trust_bar;
  assert.strictEqual(bar.type, 'dynamic-highlights-banner', 'index.json: trust bar section type');
  const st = bar.settings;
  assert.strictEqual((st.background_color || '').toLowerCase(), '#0f172a', 'index.json: trust bar uses a dark band for contrast');
  assert.strictEqual((st.color || '').toLowerCase(), '#f1f5f9', 'index.json: trust bar body/heading text stays light on dark');
  assert.strictEqual((st.icon_color || '').toLowerCase(), '#5eead4', 'index.json: trust bar icons get a bright accent');
  const orderIds = bar.block_order;
  assert.strictEqual(orderIds.length, 4, 'index.json: trust bar must ship four highlights');
  const freeShip = bar.blocks[orderIds[0]].settings;
  const easyReturns = bar.blocks[orderIds[1]].settings;
  const secureCheckout = bar.blocks[orderIds[2]].settings;
  const support247 = bar.blocks[orderIds[3]].settings;
  assert.strictEqual((freeShip.title || '').trim(), '✔ Free shipping', 'index.json: trust tile 1 headline');
  assert.strictEqual(freeShip.icon, 'icon-delivery-package', 'index.json: trust tile 1 icon');
  assert.strictEqual((freeShip.link || '').trim(), '/policies/shipping-policy', 'index.json: free shipping links policy');
  assert.ok(
    (freeShip.text || '').toLowerCase().indexOf('policy') !== -1,
    'index.json: free shipping blurb must anchor on written policy'
  );
  assert.strictEqual((easyReturns.title || '').trim(), '✔ Easy returns', 'index.json: trust tile 2 headline');
  assert.strictEqual(easyReturns.icon, 'icon-label-tag', 'index.json: trust tile 2 icon');
  assert.strictEqual((easyReturns.link || '').trim(), '/policies/refund-policy', 'index.json: returns highlight link');
  assert.ok(
    (easyReturns.text || '').toLowerCase().indexOf('policy') !== -1,
    'index.json: returns blurb must reference policy clarity'
  );
  assert.strictEqual((secureCheckout.title || '').trim(), '✔ Secure checkout', 'index.json: trust tile 3 headline');
  assert.strictEqual(secureCheckout.icon, 'icon-lock', 'index.json: trust tile 3 icon');
  assert.strictEqual((secureCheckout.link || '').trim(), '', 'index.json: secure checkout tile has no competing off-site link');
  assert.ok(
    ((secureCheckout.text || '').toLowerCase().indexOf('checkout') !== -1 ||
      (secureCheckout.text || '').toLowerCase().indexOf('encryption') !== -1),
    'index.json: secure checkout blurb must name checkout or encryption'
  );
  assert.strictEqual((support247.title || '').trim(), '✔ 24/7 support', 'index.json: trust tile 4 headline');
  assert.strictEqual(support247.icon, 'icon-chat-alternate', 'index.json: trust tile 4 icon');
  assert.strictEqual((support247.link || '').trim(), 'shopify://pages/support', 'index.json: support highlight link');
})();

// T5b — Hub sits after first SKU grid; trust then category discovery.
assert.strictEqual(idxHub, idxBest + 1, 'index.json: decision_shortcuts (hub) follows trending_products grid');
assert.strictEqual(idxTrust, idxHub + 1, 'index.json: trust_bar follows hub');
assert.strictEqual(idxTrending, idxTrust + 1, 'index.json: category_grid follows trust');
assert.strictEqual(idxFeatured, idxTrending + 1, 'index.json: featured_products follow categories');
assert.strictEqual(idxRecent, idxFeatured + 1, 'index.json: recently_viewed follows featured');
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
  Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_recently_viewed'),
  'index.json: homepage must ship recently viewed (localStorage-backed; no heavy personalization)'
);
assert.strictEqual(
  indexTemplate.sections.homepage_recently_viewed.type,
  'static-recently-viewed',
  'index.json: recently viewed must use static-recently-viewed'
);
assert.strictEqual(
  indexTemplate.sections.homepage_recently_viewed.settings.enable_recently_viewed_products,
  true,
  'index.json: recently viewed section must be enabled'
);
assert.ok(
  !Object.prototype.hasOwnProperty.call(indexTemplate.sections, 'homepage_recommended_for_you'),
  'index.json: nine-step stack omits recommended row (re-add via Theme Editor if needed)'
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
assert.strictEqual(
  heroSlide.title,
  '🔥 Best-selling beauty products',
  'index.json: hero title must lead with proof-of-demand (best-selling), not category branding'
);
assert.ok(
  typeof heroSlide.text === 'string' &&
    heroSlide.text.indexOf('4.8') !== -1 &&
    heroSlide.text.toLowerCase().indexOf('rated') !== -1,
  'index.json: hero subtext must surface a tight social-proof line (rating)'
);
assert.strictEqual(
  (heroSlide.button_one_label || '').trim(),
  'Shop best-selling beauty',
  'index.json: hero CTA must read as direct commerce into the beauty lane'
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
  assert.match(themeLiquid, /render\s+'temusy-smart-entry-popup'/, 'theme.liquid: must load temusy-smart-entry-popup (session entry offer)');
  assert.match(
    themeLiquid,
    /render\s+'temusy-location-context-popup'/,
    'theme.liquid: must load temusy-location-context-popup (shipping/currency/language trust sheet)'
  );
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
    /data-temusy-buy-zone/,
    'dynamic-featured-product-inline: buy-now band must expose data-temusy-buy-zone when enabled'
  );
  assert.match(
    inlineProducts,
    /render\s+'product-grid-item'/,
    'dynamic-featured-product-inline: must render real product cards (re-add via Theme Editor when a compact strip is needed)'
  );
  assert.match(inlineProducts, /"id":\s*"limit"/, 'dynamic-featured-product-inline: schema must expose limit setting');
})();

console.log('templates-index-smart-homepage-contract: ok');
