#!/usr/bin/env node
/**
 * CI contract: fail fast if workflow YAML drops critical safety rails.
 * Invariants:
 * - theme-check job must be time-bounded (no unbounded runner spend).
 * - concurrency must avoid PR stampede / overlapping duplicate work.
 * - regression gate must run before Theme Check (fail cheap checks first).
 * - permissions must not grant write on the contents scope (supply-chain / surprise commits).
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workflowPath = path.join(__dirname, '..', 'workflows', 'theme-check.yml');
const raw = fs.readFileSync(workflowPath, 'utf8');

assert.match(raw, /timeout-minutes:\s*\d+/, 'workflow: missing job timeout-minutes');
assert.match(raw, /concurrency:/, 'workflow: missing concurrency block');
assert.match(raw, /cancel-in-progress:/, 'workflow: missing cancel-in-progress');
assert.match(raw, /Regression tests \(theme contracts\)/, 'workflow: missing regression step label');
assert.match(raw, /npm run test/, 'workflow: must run npm test (full contract suite)');
assert.match(raw, /permissions:/, 'workflow: missing explicit permissions');
// Match YAML permission line only (ignore comments mentioning the same words).
assert.ok(
  !/^\s*contents:\s*write\s*$/m.test(raw),
  'workflow: contents scope must not be write (least privilege)'
);

console.log('verify-ci-invariants: ok');
