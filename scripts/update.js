#!/usr/bin/env node
'use strict';
/*
 * Fetch Hostwerk's current interface texts and show what this language pack still misses.
 *   node scripts/update.js                   → lang/<id>.todo.json (German text → English hint) + coverage
 *   node scripts/update.js <file>            → same, with a local copy of texts.json (offline)
 *   node scripts/update.js --badge <out>     → also writes a shields.io endpoint file with the coverage (used by the Action)
 * Source: https://github.com/Passimoritz/hostwerk-public/blob/main/sdk/i18n/texts.json (Hostwerk's en.json:
 * keys = German source text, values = English). Your file uses the same keys: { "texts": { "<German>": "<yours>" } }.
 */
const fs = require('fs');
const path = require('path');

const URL = 'https://raw.githubusercontent.com/Passimoritz/hostwerk-public/main/sdk/i18n/texts.json';
const root = path.join(__dirname, '..');

/** Missing texts and patterns of a pack compared with the source. → { missing, missingPatterns, coverage } */
function compare(source, pack) {
  const texts = source.texts || {}; const mine = (pack && pack.texts) || {};
  const missing = Object.keys(texts).filter((k) => !mine[k] || !String(mine[k]).trim());
  const have = new Set(((pack && pack.patterns) || []).filter((p) => Array.isArray(p) && p[1]).map((p) => p[0]));
  const missingPatterns = (source.patterns || []).filter((p) => Array.isArray(p) && !have.has(p[0]));
  const total = Object.keys(texts).length + (source.patterns || []).length;
  const done = total - missing.length - missingPatterns.length;
  return { missing, missingPatterns, coverage: total ? Math.round((done / total) * 1000) / 10 : 100 };
}

/**
 * Translations that are far longer than the original – they get cut off in buttons, tabs and tiles.
 * Compared with the English text (or the German key when there is none): more than twice as long and at least
 * 20 characters more. → [{ key, text, ref, ratio }]
 */
function tooLong(pack, source = {}) {
  const out = [];
  const en = source.texts || {};
  const check = (key, text, ref) => {
    const a = String(text || '').length; const b = String(ref || key).length;
    if (a > b * 2 && a - b >= 20) out.push({ key, text, ref: ref || key, ratio: Math.round((a / Math.max(1, b)) * 10) / 10 });
  };
  for (const [k, v] of Object.entries((pack && pack.texts) || {})) check(k, v, en[k]);
  const enPat = new Map((source.patterns || []).filter(Array.isArray).map((p) => [p[0], p[1]]));
  for (const p of (pack && pack.patterns) || []) if (Array.isArray(p)) check(p[0], p[1], enPat.get(p[0]));
  return out.sort((a, b) => b.ratio - a.ratio);
}

/** shields.io endpoint file: { schemaVersion, label, message, color } – colour by coverage. */
function badge(coverage, label = 'translated') {
  const color = coverage >= 95 ? 'brightgreen' : coverage >= 75 ? 'green' : coverage >= 50 ? 'yellow' : coverage >= 25 ? 'orange' : 'red';
  return { schemaVersion: 1, label, message: `${coverage} %`, color };
}

async function main() {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const args = process.argv.slice(2);
  const bi = args.indexOf('--badge');
  const badgeOut = bi >= 0 ? args.splice(bi, 2)[1] : null;
  const arg = args[0];
  const source = arg ? JSON.parse(fs.readFileSync(arg, 'utf8')) : await (await fetch(URL)).json();
  const langs = (m.languages || []).filter((l) => l.id !== 'qps'); // die Pseudo-Sprache ist keine Übersetzung
  for (const l of langs) {
    const file = path.join(root, l.file);
    const pack = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { texts: {}, patterns: [] };
    const r = compare(source, pack);
    const todo = { texts: Object.fromEntries(r.missing.map((k) => [k, source.texts[k]])), patterns: r.missingPatterns };
    const out = file.replace(/\.json$/, '.todo.json');
    fs.writeFileSync(out, `${JSON.stringify(todo, null, 2)}\n`);
    console.log(`${l.name} (${l.id}): ${r.coverage} % translated – ${r.missing.length} texts and ${r.missingPatterns.length} patterns missing → ${path.relative(root, out)}`);
    console.log('  Translate the German keys (the English value is only a hint), then move them into', path.relative(root, file));
    const long = tooLong(pack, source);
    if (long.length) {
      console.log(`  ${long.length} translations are much longer than the original and may be cut off:`);
      for (const x of long.slice(0, 10)) console.log(`    ${x.ratio}× “${x.ref}” → “${x.text}”`);
    }
    if (badgeOut && l === langs[0]) fs.writeFileSync(badgeOut, `${JSON.stringify(badge(r.coverage, `${l.name}`))}\n`);
  }
}

module.exports = { compare, tooLong, badge };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
