import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

// The site is a browser ES module and needs no Node package configuration.
const source = await readFile(new URL('../assets/detect-os.js', import.meta.url), 'utf8');
const { detectOS, detectBrowserOS } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

const cases = [
  ['Windows Chrome', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/144.0.0.0 Safari/537.36', platform: 'Win32' }, 'windows'],
  ['Windows Firefox', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:145.0) Gecko/20100101 Firefox/145.0' }, 'windows'],
  ['macOS Safari', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/26.0 Safari/605.1.15', platform: 'MacIntel', maxTouchPoints: 0 }, 'macos'],
  ['iPhone Safari with frozen OS version', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/26.0 Mobile/15E148 Safari/604.1' }, 'ios'],
  ['iPad mobile UA', { userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' }, 'ios'],
  ['iPad desktop UA', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/26.0 Safari/605.1.15', platform: 'MacIntel', maxTouchPoints: 5 }, 'ios'],
  ['iPad desktop UA with macOS hint', { clientPlatform: 'macOS', platform: 'MacIntel', maxTouchPoints: 5 }, 'ios'],
  ['iPod', { userAgent: 'Mozilla/5.0 (iPod touch; CPU iPhone OS 15_0 like Mac OS X) Mobile/15E148' }, 'ios'],
  ['Android reduced Chrome UA takes precedence over Linux', { userAgent: 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/144.0.0.0 Mobile Safari/537.36', platform: 'Linux armv8l' }, 'android'],
  ['Android tablet', { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel Tablet) AppleWebKit/537.36 Chrome/144.0.0.0 Safari/537.36' }, 'android'],
  ['Linux x86 Chrome', { userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/144.0.0.0 Safari/537.36', platform: 'Linux x86_64' }, 'linux'],
  ['Linux Firefox', { userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:145.0) Gecko/20100101 Firefox/145.0' }, 'linux'],
  ['ChromeOS UA with Linux legacy platform', { userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 Chrome/144.0.0.0 Safari/537.36', platform: 'Linux x86_64' }, null],
  ['ChromeOS hint', { clientPlatform: 'Chrome OS', platform: 'Linux x86_64' }, null],
  ['ChromeOS hint with compatibility UA', { clientPlatform: 'ChromeOS', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }, null],
  ['unsupported Windows Phone', { userAgent: 'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; Lumia) AppleWebKit/537.36' }, null],
  ['unsupported Fuchsia hint', { clientPlatform: 'Fuchsia', platform: 'Linux x86_64' }, null],
  ['explicit unsupported hint', { clientPlatform: 'Other OS', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }, null],
  ['arbitrary platform names cannot match object prototype keys', { clientPlatform: 'constructor' }, null],
  ['empty information', {}, null],
  ['generic privacy UA', { userAgent: 'Mozilla/5.0', platform: '' }, null],
  ['unrecognized platform', { userAgent: 'custom browser', platform: 'FreeBSD amd64' }, null],
  ['Unknown hint may use supported UA', { clientPlatform: 'Unknown', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, 'windows'],
  ['structured hint with reduced UA', { clientPlatform: 'Windows', userAgent: 'Mozilla/5.0' }, 'windows'],
  ['structured hint overrides desktop compatibility UA', { clientPlatform: 'Android', userAgent: 'Mozilla/5.0 (X11; Linux x86_64)' }, 'android'],
  ['spoofed UA remains only a suggestion', { userAgent: 'Mozilla/5.0 (Linux; Android 10; K)', platform: 'Win32' }, 'android'],
  ['touchscreen Windows is not an iPad', { clientPlatform: 'Windows', platform: 'Win32', maxTouchPoints: 10 }, 'windows'],
  ['single-touch Mac is not enough for iPad heuristic', { platform: 'MacIntel', maxTouchPoints: 1 }, 'macos'],
  ['legacy platform fallback', { platform: 'Linux x86_64' }, 'linux'],
  ['non-string inputs do not invent an OS', { userAgent: null, platform: 123, clientPlatform: false }, null],
];

for (const [name, input, expected] of cases) {
  test(name, () => assert.equal(detectOS(input), expected));
}

test('all five low-entropy platform hints are supported', () => {
  for (const [platform, expected] of Object.entries({ Windows: 'windows', macOS: 'macos', iOS: 'ios', Android: 'android', Linux: 'linux' })) {
    assert.equal(detectOS({ clientPlatform: platform }), expected);
  }
});

test('browser wrapper reads low-entropy hints without requesting high-entropy values', async () => {
  let highEntropyCalled = false;
  const nav = {
    userAgent: 'Mozilla/5.0',
    userAgentData: { platform: 'Android', getHighEntropyValues() { highEntropyCalled = true; throw new Error('must not be called'); } },
  };
  assert.equal(await detectBrowserOS(nav), 'android');
  assert.equal(highEntropyCalled, false);
});

test('browser wrapper tolerates missing navigator fields', async () => {
  assert.equal(await detectBrowserOS({}), null);
  assert.equal(await detectBrowserOS(null), null);
});

test('restricted userAgentData falls back to conventional UA', async () => {
  const nav = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    get userAgentData() { throw new Error('restricted'); },
  };
  assert.equal(await detectBrowserOS(nav), 'windows');
});

test('restricted UA still permits the structured platform hint', async () => {
  const nav = {
    get userAgent() { throw new Error('restricted'); },
    userAgentData: { platform: 'Linux' },
  };
  assert.equal(await detectBrowserOS(nav), 'linux');
});
