/**
 * Contract: README must document local dev, tests, Theme Check, security, and stay free of secret-like literals.
 * T1–T5: contributor hygiene; cart/CLS still covered elsewhere in npm run test.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', 'README.md');
const raw = fs.readFileSync(p, 'utf8');

assert.match(raw, /npm run test/, 'README: must document npm run test');
assert.match(raw, /theme:check|Theme Check/i, 'README: must document Theme Check (local or CI)');
assert.match(raw, /shopify theme dev/, 'README: must document shopify theme dev');
assert.match(raw, /\[LICENSE\]\(LICENSE\)/, 'README: must link to LICENSE');
assert.match(raw, /\.gitignore|\.env|\.shopify/i, 'README: must mention credential hygiene (.env / .gitignore / .shopify)');
assert.match(raw, /Invariantes de engenharia/i, 'README: must document engineering invariants section');

assert.doesNotMatch(raw, /cd temusyy\b/i, 'README: must not reference obsolete folder name cd temusyy');
assert.doesNotMatch(raw, /\bshpat_[a-z0-9]{10,}/i, 'README: must not contain Admin API token-like literals');
assert.doesNotMatch(raw, /\bshpua_[a-z0-9]{10,}/i, 'README: must not contain storefront token-like literals');

console.log('readme-contract: ok');
