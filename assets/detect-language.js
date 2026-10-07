// Resolve browser language preferences in their original priority order.
// The site currently provides one Chinese locale: Simplified Chinese.
export function detectLanguage(languages = []) {
  const preferences = typeof languages === 'string'
    ? [languages]
    : Array.isArray(languages) ? languages : [];

  for (const preference of preferences) {
    if (typeof preference !== 'string') continue;
    const primary = preference.trim().toLowerCase().replaceAll('_', '-').split('-')[0];
    if (primary === 'zh') return 'zh-CN';
    if (['ko', 'ru', 'fr', 'ja', 'en'].includes(primary)) return primary;
  }

  return 'en';
}
