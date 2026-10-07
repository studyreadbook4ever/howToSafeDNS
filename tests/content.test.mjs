import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isIP } from 'node:net';
import { coreGuides } from '../assets/guides-core.js';
import { appleGuides } from '../assets/guides-apple.js';
import { providers } from '../assets/providers.js';

const root = new URL('../', import.meta.url);
const source = JSON.parse(readFileSync(new URL('locales/source.json', root), 'utf8'));
const placeholders = (value) => [...value.matchAll(/\{\{\w+\}\}/g)].map((match) => match[0]).sort();

for (const locale of ['en', 'ru', 'fr', 'zh-CN', 'ja']) {
  test(`${locale}: every guide, policy and UI string is translated without losing placeholders`, () => {
    const dictionary = JSON.parse(readFileSync(new URL(`locales/${locale}.json`, root), 'utf8'));
    assert.deepEqual(Object.keys(dictionary).sort(), Object.keys(source).sort());
    for (const [key, value] of Object.entries(dictionary)) {
      assert.equal(typeof value, 'string', key);
      assert.ok(value.trim().length, key);
      assert.deepEqual(placeholders(value), placeholders(key), key);
      assert.ok(!/[가-힣]/u.test(value), `Untranslated Korean in ${key}`);
    }
  });
}

test('all five OS guides have complete steps, verification, rollback and official sources', () => {
  const guides = { ...coreGuides, ...appleGuides };
  assert.deepEqual(Object.keys(guides).sort(), ['android', 'ios', 'linux', 'macos', 'windows']);
  for (const guide of Object.values(guides)) {
    assert.ok(guide.modes.length);
    for (const mode of guide.modes) {
      assert.ok(mode.steps.length >= 4);
      assert.ok(mode.verify.length >= 2);
      assert.ok(mode.undo.length > 25);
      assert.ok(mode.sources.length);
      for (const step of mode.steps) assert.ok(step.title && step.body);
      for (const item of mode.sources) assert.equal(new URL(item.url).protocol, 'https:');
    }
  }
});

test('providers have explicit transport addresses and published privacy commitments', () => {
  assert.ok(Object.keys(providers).length >= 9);
  for (const [id, provider] of Object.entries(providers)) {
    assert.equal(new URL(provider.doh).protocol, 'https:', id);
    assert.ok(/^[a-z0-9.-]+$/i.test(provider.dot), id);
    assert.ok(provider.policy && provider.description, id);
    assert.equal(new URL(provider.source).protocol, 'https:', id);
    assert.equal(new URL(provider.privacy).protocol, 'https:', id);
    for (const field of ['ipv4', 'ipv4alt']) if (provider[field]) assert.equal(isIP(provider[field]), 4, id);
    for (const field of ['ipv6', 'ipv6alt']) if (provider[field]) assert.equal(isIP(provider[field]), 6, id);
  }
});

test('README contains only the requested deployed site link', () => {
  assert.equal(readFileSync(new URL('README.md', root), 'utf8').trim(), '[howToSafeDNS 사이트 바로가기](https://studyreadbook4ever.github.io/howToSafeDNS/)');
});
