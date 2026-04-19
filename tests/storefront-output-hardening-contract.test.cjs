/**
 * Regression contracts for storefront output hardening.
 * These checks protect high-risk Liquid/JS surfaces where merchant or customer text
 * can otherwise drift into executable HTML/JSON contexts.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const breadcrumbs = read('snippets/breadcrumbs.liquid');
[
  'page.title',
  'product.title',
  'collection.title',
  'blog.title',
  'article.title',
  'page_title',
].forEach(token => {
  assert.match(
    breadcrumbs,
    new RegExp(token.replace('.', '\\.') + String.raw`[\s\S]{0,80}\|\s*escape`),
    `breadcrumbs.liquid: ${token} must be escaped before rendering`
  );
});
assert.match(
  breadcrumbs,
  /current_tags\s*\|\s*join:\s*" \+ "\s*\|\s*escape/,
  'breadcrumbs.liquid: joined current_tags must be escaped'
);

const pagination = read('snippets/pagination.liquid');
assert.match(pagination, /part\.title\s*\|\s*escape/, 'pagination.liquid: part.title must be escaped');
assert.match(pagination, /part\.url\s*\|\s*escape/, 'pagination.liquid: part.url must be escaped in href');

const structured = read('snippets/structured-data.liquid');
assert.match(
  structured,
  /search\.terms\s*\|\s*url_encode/,
  'structured-data.liquid: search.terms must be URL-encoded inside @id URLs'
);
assert.match(
  structured,
  /product\.description\s*\|\s*strip_html\s*\|\s*json/,
  'structured-data.liquid: product.description must be stripped and JSON encoded'
);
assert.match(structured, /shop\.name\s*\|\s*json/, 'structured-data.liquid: shop.name must be JSON encoded');
assert.match(structured, /shop\.url\s*\|\s*json/, 'structured-data.liquid: shop.url must be JSON encoded');

const newsletter = read('snippets/newsletter.liquid');
assert.match(newsletter, /type="email"[\s\S]{0,420}\brequired\b/, 'newsletter.liquid: email must be required');
assert.match(newsletter, /maxlength="254"/, 'newsletter.liquid: email must have RFC-sized maxlength guard');
assert.match(
  newsletter,
  /name="contact\[accepts_marketing\]"[\s\S]{0,120}\brequired\b/,
  'newsletter.liquid: marketing consent checkbox must be explicit and required'
);

const optionsSelect = read('snippets/options-select.liquid');
assert.match(
  optionsSelect,
  /data-variant-option-name="\{\{\s*option\.name\s*\|\s*escape\s*\}\}"/,
  'options-select.liquid: option name data attribute must be escaped'
);

const liveSearch = read('snippets/live-search-form.liquid');
assert.match(liveSearch, /split_tag\[1\]\s*\|\s*escape/, 'live-search-form.liquid: filter labels must be escaped');
assert.match(liveSearch, /data-filter-all="[\s\S]*\|\s*t\s*\|\s*escape/, 'live-search-form.liquid: data-filter-all must be escaped');

const empire = read('assets/empire.js');
const empireMin = read('assets/empire.min.js');
assert.match(empire, /optionNameValueSpan\.textContent/, 'empire.js: variant label value must use textContent');
assert.match(empire, /option\.textContent = optionLabel/, 'empire.js: option labels must be text-only');
assert.match(empire, /escapeModalText/, 'empire.js: pickup modal title strings must be escaped before HTML composition');
assert.match(empire, /filterLabel\.textContent/, 'empire.js: live-search filter label must use textContent');
assert.match(empireMin, /textContent=n\.dataset\.variantOptionChosenValue/, 'empire.min.js: min bundle must mirror variant textContent hardening');
assert.match(empireMin, /filterLabel\.textContent/, 'empire.min.js: min bundle must mirror live-search label hardening');
assert.match(empireMin, /surface-pick-up-modal__variant/, 'empire.min.js: pickup modal variant markup must exist');
assert.match(empireMin, /&amp;[\s\S]*&lt;[\s\S]*&gt;[\s\S]*&quot;[\s\S]*&#39;/, 'empire.min.js: min bundle must escape pickup modal title strings');

console.log('storefront-output-hardening-contract: ok');
