/**
 * Contract: LICENSE must remain identifiable MIT + SPDX for tooling and supply-chain clarity.
 * T1–T5: not cart/CLS; prevents accidental truncation or replacement with a placeholder.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'LICENSE');
const raw = fs.readFileSync(p, 'utf8');

assert.match(raw, /^SPDX-License-Identifier:\s*MIT\s*$/m, 'LICENSE: must declare SPDX-License-Identifier: MIT');
assert.match(raw, /^MIT License\s*$/m, 'LICENSE: must retain MIT License title');
assert.match(raw, /Copyright \(c\)/, 'LICENSE: must retain copyright line');
assert.match(
  raw,
  /THE SOFTWARE IS PROVIDED "AS IS"/,
  'LICENSE: must retain standard MIT warranty disclaimer'
);
assert.match(
  raw,
  /Permission is hereby granted/,
  'LICENSE: must retain permission grant preamble'
);
assert.doesNotMatch(raw, /TODO|YOUR_NAME_HERE|TBD\s*copyright/i, 'LICENSE: must not contain placeholder ownership text');

console.log('license-contract: ok');
