import test from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage } from '../assets/detect-language.js';

test('respects browser language preference order and skips unsupported languages', () => {
  assert.equal(detectLanguage(['de-DE', 'fr-CA', 'en-US']), 'fr');
  assert.equal(detectLanguage(['ru-RU', 'ko-KR']), 'ru');
  assert.equal(detectLanguage(['en-GB', 'ja-JP']), 'en');
  assert.equal(detectLanguage(['ja-JP', 'en-US']), 'ja');
});

test('normalizes supported language tags and accepts a language string', () => {
  assert.equal(detectLanguage('  KO-kr  '), 'ko');
  assert.equal(detectLanguage('fr_CA'), 'fr');
  assert.equal(detectLanguage('ru'), 'ru');
  assert.equal(detectLanguage('ja-JP'), 'ja');
  assert.equal(detectLanguage('EN-au'), 'en');
});

test('maps Chinese regional and script variants to available Simplified Chinese', () => {
  for (const tag of ['zh', 'zh-CN', 'zh-SG', 'zh-TW', 'zh-HK', 'zh-Hant', 'zh-Hans-CN']) {
    assert.equal(detectLanguage(tag), 'zh-CN', tag);
  }
  assert.equal(detectLanguage(['zh-Hant-TW', 'ja-JP']), 'zh-CN');
});

test('falls back to English when no supported preference is present', () => {
  assert.equal(detectLanguage(), 'en');
  assert.equal(detectLanguage([]), 'en');
  assert.equal(detectLanguage(['de-DE', 'es-ES']), 'en');
  assert.equal(detectLanguage(''), 'en');
  assert.equal(detectLanguage('korean'), 'en');
  assert.equal(detectLanguage('javascript'), 'en');
});

test('ignores unknown input types without losing valid later preferences', () => {
  for (const value of [null, 42, false, {}, Symbol('unknown')]) {
    assert.equal(detectLanguage(value), 'en');
  }
  assert.equal(detectLanguage([null, 42, {}, Symbol('unknown'), 'ru-UA']), 'ru');
});
