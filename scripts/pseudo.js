#!/usr/bin/env node
'use strict';
/*
 * Pseudo language: every Hostwerk text with accents, about 40 % longer and in [brackets] – switch Hostwerk to it and
 * you see at once where a longer language gets cut off, where texts are not translatable (no brackets) and where
 * text is glued together.
 *   node scripts/pseudo.js [texts.json]   → lang/qps.json and the entry “Pseudo (length test)” in manifest.json
 *   node scripts/pseudo.js --remove       → removes both again (do this before a release)
 * Placeholders ({}, {name}) stay untouched, so Hostwerk can still fill them in.
 */
const fs = require('fs');
const path = require('path');

const URL = 'https://raw.githubusercontent.com/Passimoritz/hostwerk-public/main/sdk/i18n/texts.json';
const root = path.join(__dirname, '..');
const FILE = 'lang/qps.json';
const ENTRY = { id: 'qps', name: 'Pseudo (length test)', file: FILE };
const ACCENT = { a: 'á', e: 'é', i: 'í', o: 'ö', u: 'ü', c: 'ç', n: 'ñ', y: 'ý', A: 'Å', E: 'É', I: 'Î', O: 'Ø', U: 'Ü', C: 'Ç', N: 'Ñ' };

/** One text as pseudo text: accents, ~40 % longer, in brackets; {…} placeholders unchanged. */
function pseudo(text) {
  const s = String(text);
  if (!s.trim()) return s;
  const parts = s.split(/(\{\w*\})/);
  const body = parts.map((p) => (/^\{\w*\}$/.test(p) ? p : p.replace(/[A-Za-z]/g, (ch) => ACCENT[ch] || ch))).join('');
  const letters = s.replace(/\{\w*\}/g, '').length;
  const pad = '·'.repeat(Math.max(1, Math.round(letters * 0.4)));
  return `[${body} ${pad}]`;
}

/** Whole pack from the source (German keys → pseudo of the English text). */
function build(source) {
  const texts = {};
  for (const [k, v] of Object.entries(source.texts || {})) texts[k] = pseudo(v || k);
  const patterns = (source.patterns || []).filter((p) => Array.isArray(p) && p.length === 2).map(([de, en]) => [de, pseudo(en || de)]);
  return { texts, patterns };
}

function setEntry(on) {
  const mf = path.join(root, 'manifest.json');
  const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
  const rest = (m.languages || []).filter((l) => l.id !== ENTRY.id);
  m.languages = on ? [...rest, ENTRY] : rest;
  fs.writeFileSync(mf, `${JSON.stringify(m, null, 2)}\n`);
}

async function main() {
  if (process.argv[2] === '--remove') {
    setEntry(false);
    fs.rmSync(path.join(root, FILE), { force: true });
    console.log('Pseudo language removed.');
    return;
  }
  const arg = process.argv[2];
  const source = arg ? JSON.parse(fs.readFileSync(arg, 'utf8')) : await (await fetch(URL)).json();
  const pack = build(source);
  fs.writeFileSync(path.join(root, FILE), `${JSON.stringify(pack, null, 1)}\n`);
  setEntry(true);
  console.log(`${FILE}: ${Object.keys(pack.texts).length} texts, ${pack.patterns.length} patterns. Install this folder in Hostwerk (Extensions → For developers → Developer mode → folder of an extension) and choose “Pseudo (length test)” under Settings → General → Language.`);
}

module.exports = { pseudo, build };
if (require.main === module) main().catch((e) => { console.error(e.message); process.exit(1); });
