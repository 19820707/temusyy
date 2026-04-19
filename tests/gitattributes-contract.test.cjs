/**
 * Contract: .gitattributes drives EOL + binary classification (cross-OS clones, CI, diffs).
 * T1–T5: maps to repo determinism (not cart/CLS); prevents silent .gitattributes drift.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', '.gitattributes');
const raw = fs.readFileSync(p, 'utf8');

assert.match(raw, /^\s*#\s*Invariants/m, '.gitattributes: must document invariants header');
assert.match(raw, /^\*\s+text=auto\s*$/m, '.gitattributes: * text=auto required');
assert.match(raw, /^\.gitattributes\s+text\s+eol=lf\s*$/m, '.gitattributes: must be LF text');
assert.match(raw, /^\*\.liquid\s+text\s+eol=lf\s*$/m, '.gitattributes: Liquid must be LF text');
assert.match(raw, /^\*\.json\s+text\s+eol=lf\s*$/m, '.gitattributes: JSON must be LF text');
assert.match(raw, /^\*\.gitignore\s+text\s+eol=lf\s*$/m, '.gitattributes: .gitignore must be LF text');
assert.match(raw, /^\*\.mjs\s+text\s+eol=lf\s*$/m, '.gitattributes: ESM scripts (CI) must be LF text');
assert.match(raw, /^\*\.cjs\s+text\s+eol=lf\s*$/m, '.gitattributes: CJS tests must be LF text');
assert.match(raw, /^\*\.yml\s+text\s+eol=lf\s*$/m, '.gitattributes: *.yml must be LF text');
assert.match(raw, /^\*\.yaml\s+text\s+eol=lf\s*$/m, '.gitattributes: *.yaml must be LF text');
assert.match(raw, /^\*\.png\s+binary\s*$/m, '.gitattributes: PNG must be binary');
assert.match(raw, /^\*\.avif\s+binary\s*$/m, '.gitattributes: AVIF must be binary');

const lines = raw.split(/\r?\n/).filter(function (l) {
  return l.trim() !== '' && !/^\s*#/.test(l);
});
const starTextAuto = lines.filter(function (l) {
  return /^\*\s+text=auto/.test(l);
});
assert.strictEqual(starTextAuto.length, 1, '.gitattributes: exactly one * text=auto rule');
assert.ok(lines[0].includes('text=auto'), '.gitattributes: default rule should precede path-specific overrides');

console.log('gitattributes-contract: ok');
