#!/usr/bin/env node
/**
 * CI contract: fail fast if workflow YAML drops critical safety rails.
 *
 * Runtime role: first-class gate executed before Node setup in CI (uses runner Node).
 * Consumes: .github/workflows/theme-check.yml, .github/dependabot.yml, repo package.json (existence).
 * Mutates: none (read-only); exits non-zero on contract breach.
 *
 * Invariants:
 * - theme-check job must be time-bounded (no unbounded runner spend).
 * - concurrency must avoid PR stampede / overlapping duplicate work.
 * - regression gate must run before Theme Check (fail cheap checks first).
 * - permissions must not grant write on the contents scope (supply-chain / surprise commits).
 * - Node on setup-node must be LTS >= 22 (GitHub Actions Node 20 runner deprecation).
 * - Theme Check must remain fail-closed at --fail-level crash (no silent downgrade).
 * - theme-check-action step must not precede the Regression tests step block (fail-fast order).
 * - Order checks must be anchored to step names, not substring search (comments must not spoof order).
 * - timeout-minutes must be a sane bound (catch typos / accidental runaway budgets).
 * - timeout-minutes must be read from the theme-check job block only (comments cannot spoof budget).
 * - package.json must expose a test script that still invokes this verifier (npm test drift guard).
 * - checkout must stay shallow (fetch-depth: 1) to bound clone cost and history attack surface.
 * - checkout must set persist-credentials: false (no long-lived git credentials on read-only CI).
 * - workflow_dispatch must exist for manual mission re-run without empty commits.
 * - continue-on-error: true is forbidden (would mask contract / Theme Check failures).
 * - Job env CI=true standardizes npm/test tooling behavior on the runner.
 * - dependabot.yml must batch github-actions updates (groups) and cap PR concurrency.
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..', '..');
const workflowPath = path.join(__dirname, '..', 'workflows', 'theme-check.yml');

let raw;
try {
  raw = fs.readFileSync(workflowPath, 'utf8');
} catch (e) {
  assert.fail(`workflow: cannot read ${workflowPath}: ${e && e.message ? e.message : e}`);
}

assert.ok(raw.length < 65536, 'workflow: file unexpectedly large (possible abuse or mis-commit)');
assert.match(raw, /^on:\s*$/m, 'workflow: missing top-level on: trigger block');
assert.match(raw, /^\s+push:\s*$/m, 'workflow: must trigger on push');
assert.match(raw, /^\s+pull_request:\s*$/m, 'workflow: must trigger on pull_request');
assert.match(raw, /branches:\s*\[\s*main\s*\]/, 'workflow: push/PR must target main branch');
assert.match(raw, /^\s*workflow_dispatch:\s*$/m, 'workflow: must declare workflow_dispatch (manual re-run / ops)');

const jobKeyIdx = raw.search(/^\s{2}theme-check:\s*$/m);
assert.ok(jobKeyIdx !== -1, 'workflow: missing jobs.theme-check job key');
const stepsIdx = raw.indexOf('steps:', jobKeyIdx);
assert.ok(stepsIdx !== -1, 'workflow: theme-check job must declare steps:');
const jobHeaderSlice = raw.slice(jobKeyIdx, stepsIdx);
const tmJob = jobHeaderSlice.match(/timeout-minutes:\s*(\d+)/);
assert.ok(tmJob, 'workflow: theme-check job missing timeout-minutes before steps:');
{
  const n = parseInt(tmJob[1], 10);
  assert.ok(n >= 1 && n <= 120, `workflow: timeout-minutes must be 1..120 within theme-check job (got ${n})`);
}
assert.match(
  jobHeaderSlice,
  /\benv:\s*\n\s+CI:\s*['"]true['"]/,
  'workflow: theme-check job must export CI=true for deterministic npm/test behavior'
);
assert.match(raw, /fetch-depth:\s*1\b/, 'workflow: actions/checkout must set fetch-depth: 1 (shallow clone)');
assert.match(
  raw,
  /persist-credentials:\s*false\b/,
  'workflow: actions/checkout must set persist-credentials false (token not written to git config)'
);
assert.ok(
  !/continue-on-error:\s*true\b/.test(raw),
  'workflow: continue-on-error: true is forbidden (masks failures / green-washing CI)'
);
assert.match(raw, /concurrency:/, 'workflow: missing concurrency block');
assert.match(raw, /cancel-in-progress:/, 'workflow: missing cancel-in-progress');
assert.match(
  raw,
  /group:\s*\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.ref\s*\}\}/,
  'workflow: concurrency group must bind workflow + ref (no unscoped stampede)'
);
assert.match(raw, /Regression tests \(theme contracts\)/, 'workflow: missing regression step label');
assert.match(raw, /npm run test/, 'workflow: must run npm test (full contract suite)');
assert.match(raw, /permissions:/, 'workflow: missing explicit permissions');
assert.match(raw, /^\s*contents:\s*read\s*$/m, 'workflow: contents permission should stay read');
assert.match(raw, /^\s*checks:\s*write\s*$/m, 'workflow: checks: write required for theme-check annotations');

// Match YAML permission line only (ignore comments mentioning the same words).
assert.ok(
  !/^\s*contents:\s*write\s*$/m.test(raw),
  'workflow: contents scope must not be write (least privilege)'
);

assert.match(
  raw,
  /node-version:\s*['"]2[2-9]['"]/,
  'workflow: setup-node must use Node 22+ LTS (runner Node 20 deprecation)'
);
assert.match(raw, /uses:\s*actions\/checkout@v\d+/, 'workflow: actions/checkout must be pinned');
assert.match(raw, /uses:\s*actions\/setup-node@v\d+/, 'workflow: actions/setup-node must be pinned');
assert.match(raw, /uses:\s*actions\/checkout@v6\b/, 'workflow: actions/checkout must stay at v6+');
assert.match(raw, /uses:\s*actions\/setup-node@v6\b/, 'workflow: actions/setup-node must stay at v6+');
assert.match(raw, /shopify\/theme-check-action@v\d+/, 'workflow: theme-check-action must be pinned (e.g. @v2)');
assert.match(raw, /flags:\s*["']?--fail-level\s+crash["']?/, 'workflow: Theme Check must use --fail-level crash');
assert.match(raw, /theme_root:\s*["']\.["']/, 'workflow: theme_check theme_root must be repo root "."');

assert.match(
  raw,
  /node\s+\.github\/scripts\/verify-ci-invariants\.mjs/,
  'workflow: must invoke this verifier via node .github/scripts/verify-ci-invariants.mjs'
);

const regStep = raw.indexOf('- name: Regression tests (theme contracts)');
const themeStep = raw.indexOf('- name: Run Theme Check');
assert.ok(
  regStep !== -1 && themeStep !== -1 && regStep < themeStep,
  'workflow: Regression tests step must precede Run Theme Check step'
);
const betweenRegAndTheme = raw.slice(regStep, themeStep);
// invariant: npm run test must be the step command, not a comment string elsewhere in the slice
assert.match(
  betweenRegAndTheme,
  /run:\s+npm run test\s*$/m,
  'workflow: Regression tests step must use run: npm run test (comment spoofing not sufficient)'
);
const afterTheme = raw.slice(themeStep);
assert.match(
  afterTheme,
  /uses:\s*shopify\/theme-check-action@v\d+/,
  'workflow: Run Theme Check step must declare uses: shopify/theme-check-action@…'
);

assert.match(raw, /^\s*runs-on:\s+ubuntu-latest\s*$/m, 'workflow: theme-check job must use ubuntu-latest');

const pkgPath = path.join(repoRoot, 'package.json');
assert.ok(fs.existsSync(pkgPath), 'repo: package.json must exist (npm run test is not a no-op)');
let pkg;
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (e) {
  assert.fail(`repo: package.json invalid JSON — ${e && e.message ? e.message : e}`);
}
assert.ok(pkg.scripts && typeof pkg.scripts.test === 'string', 'repo: package.json must define scripts.test');
assert.match(
  pkg.scripts.test,
  /verify-ci-invariants\.mjs/,
  'repo: npm test chain must invoke verify-ci-invariants.mjs (CI drift guard)'
);

// --- Dependabot contract (supply-chain / merge-train hygiene)
const dependabotPath = path.join(repoRoot, '.github', 'dependabot.yml');
let dab;
try {
  dab = fs.readFileSync(dependabotPath, 'utf8');
} catch (e) {
  assert.fail(`dependabot: cannot read ${dependabotPath}: ${e && e.message ? e.message : e}`);
}
assert.ok(dab.length < 32768, 'dependabot: file unexpectedly large');
assert.match(dab, /^version:\s*2\s*$/m, 'dependabot: version must be 2');
assert.match(dab, /package-ecosystem:\s*["']github-actions["']/, 'dependabot: must use github-actions ecosystem');
assert.match(dab, /directory:\s*["']\/["']/, 'dependabot: directory must be /');
assert.match(dab, /interval:\s*["']weekly["']/, 'dependabot: schedule interval must be weekly');
assert.match(dab, /day:\s*["']monday["']/i, 'dependabot: must pin weekly run to monday');
assert.match(dab, /time:\s*["']06:00["']/, 'dependabot: must pin schedule time 06:00');
assert.match(dab, /timezone:\s*["']UTC["']/, 'dependabot: must use UTC for deterministic schedule');
const prLimit = dab.match(/open-pull-requests-limit:\s*(\d+)/);
assert.ok(prLimit, 'dependabot: open-pull-requests-limit required');
{
  const lim = parseInt(prLimit[1], 10);
  assert.ok(lim >= 1 && lim <= 15, `dependabot: open-pull-requests-limit must be 1..15 (got ${lim})`);
}
assert.match(dab, /commit-message:\s*\n\s+prefix:\s*["']chore\(ci\)["']/, 'dependabot: commit prefix must be chore(ci)');
assert.match(dab, /\bgroups:\s*\n\s+actions:\s*\n\s+patterns:/, 'dependabot: must define groups.actions.patterns');
assert.match(dab, /-\s*["']\*["']/, 'dependabot: actions group must include pattern *');
assert.match(dab, /labels:\s*\n\s+-\s*["']dependencies["']/, 'dependabot: must include dependencies label');

console.log('verify-ci-invariants: ok');
