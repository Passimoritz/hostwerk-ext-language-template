'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { compare, tooLong, badge } = require('../scripts/update');
const { pseudo, build } = require('../scripts/pseudo');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const count = (s) => (String(s).match(/\{\}/g) || []).length;
const named = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');

for (const l of manifest.languages || []) {
  test(`${l.id}: valid file, same placeholders, no empty translations`, (t) => {
    const pack = JSON.parse(fs.readFileSync(path.join(root, l.file), 'utf8'));
    assert.strictEqual(typeof pack.texts, 'object');
    for (const [k, v] of Object.entries(pack.texts)) {
      assert.ok(String(v).trim(), `empty translation: ${k}`);
      assert.strictEqual(named(v), named(k), `placeholders differ: ${k}`);
    }
    for (const p of pack.patterns || []) {
      assert.ok(Array.isArray(p) && p.length === 2, `pattern must be [source, translation]: ${JSON.stringify(p)}`);
      assert.strictEqual(count(p[1]), count(p[0]), `number of {} differs: ${p[0]}`);
    }
    // Nur Warnung, kein Fehler: viel zu lange Übersetzungen werden in Knöpfen und Reitern abgeschnitten
    for (const x of tooLong(pack)) t.diagnostic(`warning: ${x.ratio}× longer than the original – may be cut off: ${x.key}`);
  });
}

test('coverage: counts texts and patterns, ignores empty values', () => {
  const src = { texts: { Hallo: 'Hello', Welt: 'World' }, patterns: [['{} Dienste', '{} services']] };
  const r = compare(src, { texts: { Hallo: 'Bonjour', Welt: '' }, patterns: [] });
  assert.deepStrictEqual(r.missing, ['Welt']); assert.strictEqual(r.missingPatterns.length, 1); assert.strictEqual(r.coverage, 33.3);
  assert.strictEqual(compare(src, { texts: { Hallo: 'a', Welt: 'b' }, patterns: [['{} Dienste', '{} services']] }).coverage, 100);
});

test('too long: more than twice as long and 20+ characters more, compared with English', () => {
  const src = { texts: { Speichern: 'Save', Abbrechen: 'Cancel' }, patterns: [['{} Dienste', '{} services']] };
  const r = tooLong({ texts: { Speichern: 'Enregistrer toutes les modifications maintenant', Abbrechen: 'Annuler' }, patterns: [['{} Dienste', '{} services en cours d’exécution sur cet ordinateur']] }, src);
  assert.deepStrictEqual(r.map((x) => x.key), ['Speichern', '{} Dienste']);
  assert.deepStrictEqual(tooLong({ texts: { Abbrechen: 'Annuler' } }, src), []);
});

test('badge: shields.io endpoint with colour by coverage', () => {
  assert.deepStrictEqual(badge(96.2, 'Français'), { schemaVersion: 1, label: 'Français', message: '96.2 %', color: 'brightgreen' });
  assert.strictEqual(badge(10).color, 'red');
});

test('pseudo language: longer, accents, brackets, placeholders untouched', () => {
  const p = pseudo('{n} services on {host}');
  assert.match(p, /^\[\{n\} sérvíçés öñ \{host\} ·+\]$/);
  assert.ok(p.length > '{n} services on {host}'.length * 1.3);
  const pack = build({ texts: { Speichern: 'Save' }, patterns: [['{} Dienste', '{} services']] });
  assert.strictEqual(pack.texts.Speichern.startsWith('[Sávé'), true);
  assert.strictEqual(count(pack.patterns[0][1]), 1);
});
