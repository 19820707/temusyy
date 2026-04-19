/**
 * Contract: snippets/temusy-personalization-engine.liquid — client personalization shell.
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const snippet = fs.readFileSync(path.join(root, 'snippets', 'temusy-personalization-engine.liquid'), 'utf8');
const theme = fs.readFileSync(path.join(root, 'layout', 'theme.liquid'), 'utf8');

assert.match(snippet, /temusy_signal_weights/, 'personalization engine: must persist click weights key');
assert.match(snippet, /data-temusy-hub-paths/, 'personalization engine: must target hub path rows');
assert.match(snippet, /TemusyPersonalization/, 'personalization engine: must expose window.TemusyPersonalization.refresh');
assert.match(snippet, /getState/, 'personalization engine: must expose getState for debugging');
assert.match(snippet, /temusy:intent/, 'personalization engine: must subscribe to temusy:intent');
assert.match(snippet, /shopify:section:load/, 'personalization engine: must re-run on theme editor section load');
assert.doesNotMatch(snippet, /console\./, 'personalization engine: must not log to console');

assert.match(theme, /render\s+'temusy-personalization-engine'/, 'theme.liquid: must load personalization engine after interest bridge');

console.log('snippets-temusy-personalization-engine-contract: ok');
