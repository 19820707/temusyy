/**
 * Ensures every section `type` referenced by templates/index.json has a matching
 * sections/<type>.liquid file in the repo (prevents publishing a broken homepage).
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

const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'templates', 'index.json');
const indexTemplate = JSON.parse(stripLeadingBlockComment(fs.readFileSync(indexPath, 'utf8')));

const types = new Set();
for (const sec of Object.values(indexTemplate.sections || {})) {
  if (sec && typeof sec.type === 'string' && sec.type.trim()) {
    types.add(sec.type.trim());
  }
}

for (const type of types) {
  const liquidRel = path.join('sections', type + '.liquid');
  const liquidAbs = path.join(root, liquidRel);
  assert.ok(
    fs.existsSync(liquidAbs),
    'index.json: section type "' + type + '" requires file ' + liquidRel
  );
}

console.log('templates-index-section-files-exist: ok');
