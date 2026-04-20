/**
 * Contract: production storefront must not leak theme-editor announcement placeholders.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'sections', 'static-announcement.liquid'), 'utf8');

assert.match(
  source,
  /announcement_placeholder\s*=\s*'Announce something here'/,
  'static-announcement: must explicitly recognize the Shopify editor placeholder'
);
assert.match(
  source,
  /never ship the theme-editor placeholder as a storefront announcement/,
  'static-announcement: placeholder suppression must be documented as a production invariant'
);
assert.match(
  source,
  /announcement_desktop\s*=\s*blank/,
  'static-announcement: placeholder text must be cleared before rendering'
);
assert.match(
  source,
  /"id"\s*:\s*"show_announcement"[\s\S]*?"default"\s*:\s*false/,
  'static-announcement: new installs must default announcement bar off'
);
assert.match(
  source,
  /"id"\s*:\s*"announcement_text"[\s\S]*?"default"\s*:\s*""/,
  'static-announcement: schema default must not contain visible placeholder copy'
);

console.log('static-announcement-contract: ok');
