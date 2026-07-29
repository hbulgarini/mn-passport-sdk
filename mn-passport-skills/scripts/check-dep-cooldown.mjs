#!/usr/bin/env node
// 7-day dependency cooldown (docs/development-workflow.md §2 deps / §4).
// Fails when the lockfile introduces a package version published less than
// 7 days ago — the window in which a supply-chain compromise is most often
// caught and yanked. Override: a "Cooldown-override: <reason>" line in the
// PR description (passed via the PR_BODY env var), for urgent security
// patches only — a conscious, recorded decision.
//
// Usage: node check-dep-cooldown.mjs [base-ref]   (default origin/main)
// Supports npm lockfiles (package-lock.json v2/v3).
import { execFileSync } from 'node:child_process';

const COOLDOWN_DAYS = 7;
const LOCKFILE = 'package-lock.json';
const base = process.argv[2] ?? 'origin/main';

const override = (process.env.PR_BODY ?? '').match(/^\s*cooldown-override:\s*(\S.*)$/im);

function gitShow(ref, path) {
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

function versionPairs(lockText) {
  const out = new Set();
  if (!lockText) return out;
  const lock = JSON.parse(lockText);
  for (const [path, entry] of Object.entries(lock.packages ?? {})) {
    if (!path || entry.link) continue; // root project or workspace link
    const idx = path.lastIndexOf('node_modules/');
    if (idx === -1) continue;
    const name = path.slice(idx + 'node_modules/'.length);
    if (entry.version) out.add(`${name}@${entry.version}`);
  }
  return out;
}

const head = gitShow('HEAD', LOCKFILE);
if (head === null) {
  console.log('No package-lock.json at HEAD — nothing to check.');
  process.exit(0);
}
for (const other of ['yarn.lock', 'pnpm-lock.yaml', 'bun.lock', 'bun.lockb']) {
  if (gitShow('HEAD', other) !== null) {
    console.log(`::warning::${other} present — the cooldown check currently reads package-lock.json only.`);
  }
}

const before = versionPairs(gitShow(base, LOCKFILE));
const added = [...versionPairs(head)].filter((p) => !before.has(p));

if (added.length === 0) {
  console.log('No new package versions introduced.');
  process.exit(0);
}
console.log(`Checking ${added.length} new package version(s) against the ${COOLDOWN_DAYS}-day cooldown…`);

const now = Date.now();
const violations = [];
for (const pair of added) {
  const at = pair.lastIndexOf('@');
  const name = pair.slice(0, at);
  const version = pair.slice(at + 1);
  let times;
  try {
    times = JSON.parse(
      execFileSync('npm', ['view', name, 'time', '--json'], {
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
      }),
    );
  } catch {
    console.log(`::warning::Could not fetch publish times for ${pair} — skipping.`);
    continue;
  }
  const published = times?.[version];
  if (!published) {
    console.log(`::warning::No publish time recorded for ${pair} — skipping.`);
    continue;
  }
  const ageDays = (now - Date.parse(published)) / 86_400_000;
  if (ageDays < COOLDOWN_DAYS) {
    violations.push(`${pair} — published ${ageDays.toFixed(1)} days ago (${published})`);
  }
}

if (violations.length === 0) {
  console.log('All new package versions are outside the cooldown window.');
  process.exit(0);
}

if (override) {
  console.log(`::warning::Cooldown override in effect — "${override[1].trim()}". Quarantined versions adopted consciously:`);
  for (const v of violations) console.log(`::warning::  ${v}`);
  process.exit(0);
}

console.log('::error::7-day dependency cooldown violated (supply-chain quarantine, docs/development-workflow.md §4):');
for (const v of violations) console.log(`::error::  ${v}`);
console.log('::error::If this is an urgent security patch, add "Cooldown-override: <reason>" to the PR description.');
process.exit(1);
