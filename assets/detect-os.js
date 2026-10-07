/**
 * Suggest a guide from browser-provided information, never a verified OS.
 * These strings can be reduced or spoofed; the UI must allow another choice.
 * No DNS state, OS version, or network packets are inspected here.
 *
 * @returns {'windows'|'macos'|'ios'|'android'|'linux'|null}
 */
export function detectOS({
  userAgent = '',
  platform = '',
  maxTouchPoints = 0,
  clientPlatform = '',
} = {}) {
  const ua = asString(userAgent).toLowerCase();
  const legacyPlatform = asString(platform).toLowerCase();
  const hintedPlatform = asString(clientPlatform).toLowerCase();

  // ChromeOS is outside the five guides. Never route it to Linux merely
  // because its browser or legacy platform contains a Linux token.
  if (/\bcros\b|chrome\s?os/.test(`${ua} ${hintedPlatform}`)) return null;
  if (/windows phone|fuchsia/.test(`${ua} ${hintedPlatform}`)) return null;

  // Safari on an iPad can send the same UA as macOS. Mac + multi-touch is
  // a useful suggestion, not a guarantee about this or future hardware.
  const looksLikeMac = /^mac/.test(legacyPlatform) || /macintosh/.test(ua);
  if (looksLikeMac && Number(maxTouchPoints) > 1) return 'ios';

  const hintedOS = {
    windows: 'windows',
    macos: 'macos',
    ios: 'ios',
    android: 'android',
    linux: 'linux',
  }[hintedPlatform];
  if (typeof hintedOS === 'string') return hintedOS;

  // An explicit, unsupported platform hint is better than an incompatible
  // guide. Empty/Unknown hints can still fall back to the conventional UA.
  if (hintedPlatform && hintedPlatform !== 'unknown') return null;

  if (/iphone|ipad|ipod/.test(ua) || /^(iphone|ipad|ipod)$/.test(legacyPlatform)) return 'ios';
  if (/\bandroid\b/.test(ua)) return 'android';
  if (/windows nt|\bwindows\b/.test(ua) || /^win/.test(legacyPlatform)) return 'windows';
  if (/macintosh|mac os x/.test(ua) || /^mac/.test(legacyPlatform)) return 'macos';
  if (/\blinux\b/.test(ua) || /^linux/.test(legacyPlatform)) return 'linux';
  return null;
}

/** Read only local, low-entropy hints; no requests or permissions are needed. */
export async function detectBrowserOS(nav = globalThis.navigator) {
  return detectOS({
    userAgent: readProperty(nav, 'userAgent'),
    platform: readProperty(nav, 'platform'),
    maxTouchPoints: readProperty(nav, 'maxTouchPoints'),
    clientPlatform: readProperty(readProperty(nav, 'userAgentData'), 'platform'),
  });
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function readProperty(object, key) {
  // Privacy features or embedded browsers may omit or restrict these fields.
  try {
    return object?.[key];
  } catch {
    return undefined;
  }
}
