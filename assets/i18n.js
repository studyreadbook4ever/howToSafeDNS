import { detectLanguage } from './detect-language.js';

export const supportedLanguages = [
  { id: 'ko', label: '한국어' }, { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' }, { id: 'fr', label: 'Français' },
  { id: 'zh-CN', label: '简体中文' }, { id: 'ja', label: '日本語' },
];
export let currentLanguage = 'ko';
let dictionary = {};
let latestRequest = 0;
const cache = new Map([['ko', {}]]);

export function t(source) { return dictionary[source] ?? source; }

export function variables(source, fields = {}) {
  return t(source).replace(/\{\{(\w+)\}\}/g, (match, key) => fields[key] ?? match);
}

export function preferredLanguage(nav = globalThis.navigator, search = globalThis.location?.search ?? '') {
  const explicit = new URLSearchParams(search).get('lang');
  if (supportedLanguages.some((item) => item.id === explicit)) return explicit;
  try { return detectLanguage(nav?.languages?.length ? nav.languages : [nav?.language]); }
  catch { return 'en'; }
}

export async function loadLanguage(requested) {
  const request = ++latestRequest;
  let language = supportedLanguages.some((item) => item.id === requested) ? requested : 'en';
  try {
    if (!cache.has(language)) {
      const response = await fetch(new URL(`../locales/${language}.json`, import.meta.url));
      if (!response.ok) throw new Error(`Locale HTTP ${response.status}`);
      cache.set(language, await response.json());
    }
  } catch (error) {
    console.warn('Translation loading failed; using the built-in Korean guide.', error);
    language = 'ko';
  }
  if (request !== latestRequest) return false;
  dictionary = cache.get(language);
  currentLanguage = language;
  return true;
}
