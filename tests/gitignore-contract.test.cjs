/**
 * Contract: .gitignore must keep secrets/tooling out of git without ignoring theme payloads.
 * T1–T5: supply-chain / repo hygiene (not cart/CLS); fails on accidental removal of critical ignores.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const p = path.join(__dirname, '..', '.gitignore');
const raw = fs.readFileSync(p, 'utf8');

assert.match(raw, /^\s*#\s*Invariants/m, '.gitignore: must document invariants header');
assert.match(raw, /^\.shopify\/\s*$/m, '.gitignore: must ignore .shopify/ (CLI state)');
assert.match(raw, /^\.env\s*$/m, '.gitignore: must ignore .env');
assert.match(raw, /^\.env\.\*\s*$/m, '.gitignore: must ignore .env.*');
assert.match(raw, /^!\.env\.example\s*$/m, '.gitignore: must allow .env.example via negation');
assert.match(raw, /^node_modules\/\s*$/m, '.gitignore: must ignore node_modules/');
assert.match(raw, /^\*\.pem\s*$/m, '.gitignore: must ignore *.pem (key material)');
assert.match(raw, /^\*\.crt\s*$/m, '.gitignore: must ignore *.crt (cert material)');
assert.match(raw, /^id_rsa\s*$/m, '.gitignore: must ignore default SSH private key filename id_rsa');
assert.match(raw, /^id_ed25519\s*$/m, '.gitignore: must ignore default SSH private key filename id_ed25519');
assert.match(raw, /^assets\/\*\.map\s*$/m, '.gitignore: must ignore assets/*.map (do not ship theme source maps)');

['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'].forEach(function (dir) {
  assert.doesNotMatch(
    raw,
    new RegExp('^' + dir + '/\\s*$', 'm'),
    '.gitignore: must not ignore entire ' + dir + '/ (would drop theme from VCS)'
  );
});

assert.doesNotMatch(raw, /^\/assets\s*$/m, '.gitignore: must not ignore /assets');
assert.doesNotMatch(raw, /^\*\.liquid\s*$/m, '.gitignore: must not ignore all Liquid files');

console.log('gitignore-contract: ok');
