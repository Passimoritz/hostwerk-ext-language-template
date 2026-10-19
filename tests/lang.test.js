'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { compare } = require('../scripts/update');

const root = path.join(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const count = (s) => (String(s).match(/\{\}/g) || []).length;
const named = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join(',');

for (const l of manifest.languages || []) {
  test(`${l.id}: valid file, same placeholders, no empty translations`, () => {
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
  });
}

test('coverage: counts texts and patterns, ignores empty values', () => {
  const src = { texts: { Hallo: 'Hello', Welt: 'World' }, patterns: [['{} Dienste', '{} services']] };
  const r = compare(src, { texts: { Hallo: 'Bonjour', Welt: '' }, patterns: [] });
  assert.deepStrictEqual(r.missing, ['Welt']); assert.strictEqual(r.missingPatterns.length, 1); assert.strictEqual(r.coverage, 33.3);
  assert.strictEqual(compare(src, { texts: { Hallo: 'a', Welt: 'b' }, patterns: [['{} Dienste', '{} services']] }).coverage, 100);
});
