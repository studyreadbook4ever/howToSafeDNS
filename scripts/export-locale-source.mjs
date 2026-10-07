import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { coreGuides } from '../assets/guides-core.js';
import { appleGuides } from '../assets/guides-apple.js';
import { providers } from '../assets/providers.js';
import { uiStrings } from '../assets/ui-strings.js';

const entries = new Set(uiStrings);
function collect(value) {
  if (typeof value === 'string' && /[가-힣]/u.test(value)) entries.add(value);
  else if (Array.isArray(value)) value.forEach(collect);
  else if (value && typeof value === 'object') Object.values(value).forEach(collect);
}
collect(coreGuides);
collect(appleGuides);
collect(providers);
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const translatableHtml = html.replace(/<option\b[\s\S]*?<\/option>/gi, '');
for (const match of translatableHtml.matchAll(/>([^<>]+)</g)) collect(match[1].trim());
for (const match of html.matchAll(/(?:aria-label|content)="([^"]+)"/g)) collect(match[1]);
mkdirSync(new URL('../locales', import.meta.url), { recursive: true });
writeFileSync(new URL('../locales/source.json', import.meta.url), JSON.stringify(Object.fromEntries([...entries].map((key) => [key, key])), null, 2) + '\n');
console.log(`Exported ${entries.size} source strings.`);
