/**
 * Regression contracts for multilingual SEO and Shopify localization controls.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

const seo = read('snippets/seo-localization-tags.liquid');
assert.match(seo, /localization\.available_languages\.size\s*>\s*1/, 'seo-localization-tags: must guard language alternates');
assert.match(seo, /rel="alternate"\s+hreflang="\{\{\s*language\.iso_code\s*\|\s*escape\s*\}\}"/, 'seo-localization-tags: must emit escaped hreflang');
assert.match(seo, /hreflang="x-default"/, 'seo-localization-tags: must emit x-default alternate');
assert.match(seo, /request\.path\s*\|\s*remove_first:\s*current_locale_root/, 'seo-localization-tags: must preserve current page path across locales');

['theme.liquid', 'quickshop.liquid', 'password.liquid', 'none.liquid'].forEach(layout => {
  assert.match(
    read(path.join('layout', layout)),
    /render 'seo-localization-tags'/,
    `${layout}: must render hreflang localization tags`
  );
});

const social = read('snippets/social-meta-tags.liquid');
assert.match(social, /og:locale/, 'social-meta-tags: must emit og:locale');
assert.match(social, /og:locale:alternate/, 'social-meta-tags: must emit alternate Open Graph locales');

['sections/static-utility-bar.liquid', 'sections/static-footer.liquid'].forEach(file => {
  const src = read(file);
  assert.doesNotMatch(src, /href="#"\s+lang="\{\{\s*locale\.iso_code/, `${file}: language options must not degrade to # links`);
  assert.match(src, /locale\.root_url\s*\|\s*default:\s*routes\.root_url/, `${file}: language links must use locale root_url fallback`);
  assert.match(src, /data-value="\{\{\s*locale\.iso_code\s*\|\s*escape\s*\}\}"/, `${file}: locale code data-value must be escaped`);
  assert.match(src, /locale\.endonym_name\s*\|\s*capitalize\s*\|\s*escape/, `${file}: locale display name must be escaped`);
  assert.match(src, /country\.name\s*\|\s*escape/, `${file}: country names must be escaped`);
});

const empire = read('assets/empire.js');
const empireMin = read('assets/empire.min.js');
assert.match(empire, /e\.preventDefault\(\);[\s\S]{0,120}_submitForm/, 'empire.js: localization option click must prevent # navigation');
assert.match(empire, /form\.requestSubmit/, 'empire.js: localization form should use requestSubmit when available');
assert.match(empireMin, /preventDefault\(\),t\._submitForm/, 'empire.min.js: min bundle must prevent # navigation');
assert.match(empireMin, /requestSubmit\?e\.requestSubmit\(\):e\.submit\(\)/, 'empire.min.js: min bundle must mirror requestSubmit fallback');

console.log('localization-seo-contract: ok');
