#!/usr/bin/env node
'use strict';
/*
 * Fetch Hostwerk's current interface texts and show what this language pack still misses.
 *   node scripts/update.js            → lang/<id>.todo.json (German text → English hint) + coverage
 *   node scripts/update.js <file>     → same, with a local copy of texts.json (offline)
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

async function main() {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const arg = process.argv[2];
  const source = arg ? JSON.parse(fs.readFileSync(arg, 'utf8')) : await (await fetch(URL)).json();
  for (const l of m.languages || []) {
    const file = path.join(root, l.file);
    const pack = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { texts: {}, patterns: [] };
    const r = compare(source, pack);
    const todo = { texts: Object.fromEntries(r.missing.map((k) => [k, source.texts[k]])), patterns: r.missingPatterns };
    const out = file.replace(/\.json$/, '.todo.json');
    fs.writeFileSync(out, `${JSON.stringify(todo, null, 2)}\n`);
    console.log(`${l.name} (${l.id}): ${r.coverage} % translated – ${r.missing.length} texts and ${r.missingPatterns.length} patterns missing → ${path.relative(root, out)}`);
    console.log('  Translate the German keys (the English value is only a hint), then move them into', path.relative(root, file));
  }
}

module.exports = { compare };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
