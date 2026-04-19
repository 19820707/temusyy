/**
 * Contract: SECURITY.md must define scope, private reporting, and engineering pointers without embedding secrets.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'SECURITY.md');
const raw = fs.readFileSync(p, 'utf8');

assert.match(raw, /Reportar uma vulnerabilidade|vulnerabilidade/i, 'SECURITY.md: must describe vulnerability reporting');
assert.match(raw, /n[aã]o.*issue.*p[úu]blico|issue p[úu]blico/i, 'SECURITY.md: must discourage public exploitable issues');
assert.match(raw, /\bmain\b/, 'SECURITY.md: must name supported branch (main)');
assert.match(raw, /Invariantes de engenharia/i, 'SECURITY.md: must document engineering invariants section');
assert.match(raw, /Fora de [âa]mbito|fora de [âa]mbito/i, 'SECURITY.md: must define out-of-scope');
assert.match(raw, /Security|Advisories|vulnerability/i, 'SECURITY.md: must reference GitHub security reporting path');

assert.doesNotMatch(raw, /\bshpat_[a-z0-9]{10,}/i, 'SECURITY.md: must not contain Admin API token-like literals');
assert.doesNotMatch(raw, /\bshpua_[a-z0-9]{10,}/i, 'SECURITY.md: must not contain storefront token-like literals');
assert.doesNotMatch(
  raw,
  /github\.com\/[^/\s]+\/[^/\s]+\/security\/advisories\/new/i,
  'SECURITY.md: must not hardcode org/repo advisory URL (forks and renames break)'
);

console.log('security-md-contract: ok');
