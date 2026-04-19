/**
 * Merchandising + Flow tags: three-lane labels (trending / best seller / limited stock).
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const snippetPath = path.join(__dirname, '..', 'snippets', 'product-merchandising-labels.liquid');
const snippet = fs.readFileSync(snippetPath, 'utf8');
const urgencySnip = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'product-urgency-badges.liquid'), 'utf8');

assert.match(snippet, /temusy-interesse/, 'merch labels: Flow interest tags fold into Trending lane');
assert.match(snippet, /flow-interesse/, 'merch labels: must recognize flow-interesse alias');
assert.match(snippet, /temusy-vendas/, 'merch labels: Flow sales tags fold into Best seller lane');
assert.match(snippet, /flow-vendas/, 'merch labels: must recognize flow-vendas alias');
assert.match(snippet, /product\.merch\.popular/, 'merch labels: must translate Popular lane');
assert.match(snippet, /product\.merch\.trending/, 'merch labels: must translate trending lane');
assert.match(snippet, /product\.merch\.bestseller/, 'merch labels: must translate best seller lane');
assert.match(snippet, /product\.merch\.last_units/, 'merch labels: must translate limited-stock lane');
assert.match(snippet, /productitem__merch-label--popular/, 'merch labels: must style Popular lane');
assert.match(snippet, /productitem__merch-label--trending/, 'merch labels: must style trending lane');
assert.doesNotMatch(
  snippet,
  /productitem__merch-label--selling-fast/,
  'merch labels: Selling fast chip lives in product-urgency-badges (single surface)'
);
assert.match(snippet, /productitem__merch-label--bestseller/, 'merch labels: must style best seller lane');
assert.match(snippet, /productitem__merch-label--scarcity/, 'merch labels: must style scarcity lane');
assert.match(snippet, /assign tags_only = tags_only \| default: false/, 'merch labels: tags_only param for smart stack (urgency via stock row)');

assert.match(urgencySnip, /product-urgency-badges/, 'urgency badges: snippet must self-identify in comment header');
assert.match(urgencySnip, /product\.urgency\.only_n_left/, 'urgency badges: must translate stock pill');
assert.match(urgencySnip, /product\.urgency\.selling_fast/, 'urgency badges: must translate velocity pill');
assert.match(urgencySnip, /product\.urgency\.in_n_carts/, 'urgency badges: must translate carts pill (metafield-driven)');
assert.match(urgencySnip, /metafields\.custom\.active_carts/, 'urgency badges: must read custom.active_carts metafield');
assert.match(urgencySnip, /productitem__urgency-badge--stock/, 'urgency badges: must style stock pill');
assert.match(urgencySnip, /productitem__urgency-badge--velocity/, 'urgency badges: must style velocity pill');
assert.match(urgencySnip, /productitem__urgency-badge--carts/, 'urgency badges: must style carts pill');

function assertMerchKeys(file) {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', file), 'utf8'));
  const merch = data.product && data.product.merch;
  assert.ok(merch, file + ': product.merch must exist');
  assert.strictEqual(typeof merch.popular, 'string', file + ': product.merch.popular');
  assert.strictEqual(typeof merch.selling_fast, 'string', file + ': product.merch.selling_fast');
  assert.strictEqual(typeof merch.trending, 'string', file + ': product.merch.trending');
  assert.strictEqual(typeof merch.bestseller, 'string', file + ': product.merch.bestseller');
  assert.strictEqual(typeof merch.last_units, 'string', file + ': product.merch.last_units');
  assert.ok(merch.popular.trim().length > 0, file + ': popular non-empty');
  assert.ok(merch.selling_fast.trim().length > 0, file + ': selling_fast non-empty');
  assert.ok(merch.trending.trim().length > 0, file + ': trending non-empty');
  assert.ok(merch.bestseller.trim().length > 0, file + ': bestseller non-empty');
  assert.ok(merch.last_units.trim().length > 0, file + ': last_units non-empty');
}

assertMerchKeys('en.default.json');
assertMerchKeys('pt-BR.json');

const css = fs.readFileSync(path.join(__dirname, '..', 'assets', 'theme.bundle.css'), 'utf8');
assert.match(css, /\.productitem__merch-label--popular\b/, 'theme.bundle.css: Popular label color');
assert.match(css, /\.productitem__merch-label--trending\b/, 'theme.bundle.css: trending label color');
assert.match(css, /\.productitem__merch-label--selling-fast\b/, 'theme.bundle.css: Selling fast label color');
assert.match(css, /\.productitem__merch-label--bestseller\b/, 'theme.bundle.css: bestseller label color');
assert.match(css, /\.productitem__merch-label--scarcity\b/, 'theme.bundle.css: scarcity label color');
assert.match(css, /\.productitem__urgency-badge--stock\b/, 'theme.bundle.css: urgency stock pill');
assert.match(css, /\.productitem__urgency-badge--velocity\b/, 'theme.bundle.css: urgency velocity pill');
assert.match(css, /\.productitem__urgency-badge--carts\b/, 'theme.bundle.css: urgency carts pill');
assert.doesNotMatch(
  css,
  /\.productitem__merch-label--flow-interest\b/,
  'theme.bundle.css: retired flow-interest chip (merged into trending)'
);
assert.doesNotMatch(
  css,
  /\.productitem__merch-label--flow-sales\b/,
  'theme.bundle.css: retired flow-sales chip (merged into best seller)'
);

const docPath = path.join(__dirname, '..', 'docs', 'shopify-flow-fase-8.md');
assert.ok(fs.existsSync(docPath), 'docs/shopify-flow-fase-8.md must exist');
const doc = fs.readFileSync(docPath, 'utf8');
assert.match(doc, /Shopify Flow/, 'fase-8 doc: must mention Shopify Flow');
assert.match(doc, /temusy-interesse/, 'fase-8 doc: must document interest tag');
assert.match(doc, /temusy-vendas/, 'fase-8 doc: must document sales tag');

const gridItem = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'product-grid-item.liquid'), 'utf8');
assert.match(gridItem, /data-smart-product-stack/, 'product-grid-item: must render smart stack region');
assert.match(gridItem, /tags_only:\s*true/, 'product-grid-item: stack must pass tags_only to merch labels');
assert.match(gridItem, /temusy_emphasize_price/, 'product-grid-item: must allow buy-zone strips to override price emphasis');
assert.match(gridItem, /product-urgency-badges/, 'product-grid-item: must render compact urgency badges in smart stack');
assert.match(gridItem, /productitem--no-smart-context/, 'product-grid-item: de-emphasize cards without merchandising context');

console.log('product-merchandising-flow-contract: ok');
