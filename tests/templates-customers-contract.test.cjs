/**
 * Contract tests for templates/customers/* and their section/snippet dependencies.
 *
 * T1 — Cart race: not applicable to customer Liquid (covered by empire-atc-hardening.test.cjs).
 * T2 — CLS: order line images use rimg (unchanged); asserts no regression in order unit-price guard.
 * T3 — Null safety: billing_address, selling_plan_allocation, unit_price_measurement, address list.
 * T4 — No hardcoded English ARIA in order checkboxes; no console in templates.
 * T5 — Customer templates remain thin section delegates only.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const customersDir = path.join(__dirname, '..', 'templates', 'customers');
const allowedSections = {
  'account.liquid': "{% section 'account' %}",
  'login.liquid': "{% section 'login' %}",
  'register.liquid': "{% section 'register' %}",
  'addresses.liquid': "{% section 'addresses' %}",
  'order.liquid': "{% section 'order' %}",
  'activate_account.liquid': "{% section 'activateaccount' %}",
  'reset_password.liquid': "{% section 'resetpassword' %}",
};

Object.keys(allowedSections).forEach(function (name) {
  const p = path.join(customersDir, name);
  const raw = fs.readFileSync(p, 'utf8');
  const stripped = raw.replace(/^\uFEFF/, '').trim();
  assert.ok(
    stripped.includes(allowedSections[name]),
    name + ': must include ' + allowedSections[name]
  );
  assert.doesNotMatch(
    stripped,
    /\{%\s*section\s+'[^']+'\s*%\}[\s\S]*\{%\s*section\s+'/,
    name + ': must not declare multiple {% section %} tags'
  );
  assert.doesNotMatch(stripped, /console\.(log|warn|error)\s*\(/, name + ': no console in template');
});

const orderSection = fs.readFileSync(path.join(__dirname, '..', 'sections', 'order.liquid'), 'utf8');
assert.doesNotMatch(
  orderSection,
  /aria-label="Select /,
  'order.liquid: checkbox aria-label must be translated, not hardcoded English'
);
assert.doesNotMatch(
  orderSection,
  /title="Select all"/,
  'order.liquid: select-all title must be translated'
);
assert.match(
  orderSection,
  /line_item\.selling_plan_allocation\s*!=\s*blank/,
  'order.liquid: selling_plan_allocation must be guarded'
);
const unitIf = orderSection.indexOf('{% if line_item.unit_price_measurement != blank %}');
const cap = orderSection.indexOf('{% capture total_quantity %}');
assert.ok(unitIf !== -1 && cap !== -1 && cap > unitIf, 'order.liquid: unit price captures must be inside measurement guard');

const loginSection = fs.readFileSync(path.join(__dirname, '..', 'sections', 'login.liquid'), 'utf8');
assert.match(
  loginSection,
  /shop\.checkout\s*!=\s*blank\s+and\s+shop\.checkout\.guest_login/,
  'login.liquid: guest_login must guard shop.checkout'
);

const addrSnippet = fs.readFileSync(path.join(__dirname, '..', 'snippets', 'account-address-list.liquid'), 'utf8');
assert.match(addrSnippet, /\{%\s*unless\s+address\s*==\s*blank\s*%\}/, 'account-address-list: must guard blank address');

const resetSection = fs.readFileSync(path.join(__dirname, '..', 'sections', 'resetpassword.liquid'), 'utf8');
assert.match(resetSection, /reset_password_user/, 'resetpassword.liquid: must assign safe subtitle user variable');

const localesDir = path.join(__dirname, '..', 'locales');
fs.readdirSync(localesDir)
  .filter(function (f) {
    return f.endsWith('.json') && !f.endsWith('.schema.json');
  })
  .forEach(function (file) {
    const data = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
    const v = data.customers && data.customers.order && data.customers.order.select_line_item;
    assert.ok(
      typeof v === 'string' && v.length > 0,
      file + ': customers.order.select_line_item must be a non-empty string'
    );
  });

console.log('templates-customers-contract: ok');
