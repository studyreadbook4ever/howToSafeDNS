import { coreGuides } from './guides-core.js';
import { appleGuides } from './guides-apple.js';
import { detectBrowserOS } from './detect-os.js';
import { providers } from './providers.js';
import { t, variables, loadLanguage, preferredLanguage, currentLanguage } from './i18n.js';

const guides = { ...coreGuides, ...appleGuides };
const osOrder = ['windows', 'macos', 'ios', 'android', 'linux'];
const icons = {
  windows: '<rect x="3" y="3" width="7" height="7" rx=".5"/><rect x="14" y="3" width="7" height="7" rx=".5"/><rect x="3" y="14" width="7" height="7" rx=".5"/><rect x="14" y="14" width="7" height="7" rx=".5"/>',
  macos: '<rect x="4" y="3" width="16" height="13" rx="2"/><path d="M2 20h20m-14-4-1 4m9-4 1 4"/>',
  ios: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 5h4m-3 14h2"/>',
  android: '<path d="m7 5-2-3m12 3 2-3M5 10a7 7 0 0 1 14 0v9H5V10Zm-3 1v6m20-6v6M8 19v3m8-3v3M8 8h.01M16 8h.01"/>',
  linux: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m7 9 3 3-3 3m6 0h4"/>',
};
const svg = (key) => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg>`;
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const fill = (value) => {
  const selected = providers[provider];
  const fields = {
    ...selected,
    os: guides[activeOS]?.label,
    ipv4config: [`${t('기본 설정 DNS')}: ${selected.ipv4}`, `${t('대체 DNS')}: ${selected.ipv4alt || t('비워두세요 (제공자가 대체 주소를 공개하지 않았어요)')}`].join('\n'),
    ipv6config: selected.ipv6 ? [`${t('기본 설정 DNS')}: ${selected.ipv6}`, `${t('대체 DNS')}: ${selected.ipv6alt || t('비워두세요')}`].join('\n') : '',
    dotservers: [selected.ipv4, selected.ipv4alt].filter(Boolean).map((ip) => `${ip}#${selected.dot}`).join(' '),
  };
  return String(value ?? '').replace(/\{\{(\w+)\}\}/g, (_, key) => fields[key] ?? '');
};
const text = (value) => escape(fill(t(value)));
let activeOS = null;
let activeMode = null;
let provider = 'cloudflare';
let initialOS = null;
let manuallySelected = false;
let toastTimer;
const panel = document.querySelector('#guide');
const note = document.querySelector('#detection-note');
const staticText = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
while (walker.nextNode()) {
  const node = walker.currentNode;
  const source = node.textContent.trim();
  if (/[가-힣]/u.test(source) && !node.parentElement.closest('select,script,style')) staticText.push({ node, source, prefix: node.textContent.match(/^\s*/)[0], suffix: node.textContent.match(/\s*$/)[0] });
}
const staticAttributes = [];
document.querySelectorAll('[aria-label],meta[content]').forEach((element) => {
  for (const name of ['aria-label', 'content']) {
    const source = element.getAttribute(name);
    if (source && /[가-힣]/u.test(source)) staticAttributes.push({ element, name, source });
  }
});

function applyStaticLanguage() {
  document.documentElement.lang = currentLanguage;
  document.title = `howToSafeDNS · ${t('암호화 DNS 설정 안내')}`;
  staticText.forEach(({ node, source, prefix, suffix }) => { node.textContent = prefix + t(source) + suffix; });
  staticAttributes.forEach(({ element, name, source }) => element.setAttribute(name, t(source)));
  document.querySelector('#language-select').value = currentLanguage;
  document.querySelector('#provider-count').textContent = variables('{{count}}개 제공자의 공식 암호화 지원·보안·개인정보 정책을 확인했어요. 정책의 내용은 제공자마다 다릅니다.', { count: Object.keys(providers).length });
}

document.querySelector('#os-options').innerHTML = osOrder.map((id) => `<button class="os-option" type="button" data-os="${id}" aria-pressed="false">${svg(id)}<span>${escape(guides[id].label)}</span><span class="os-check" aria-hidden="true">✓</span></button>`).join('');
document.querySelector('#provider-select').innerHTML = Object.entries(providers).map(([id, item]) => `<option value="${id}">${escape(item.provider)}</option>`).join('');

function renderProvider() {
  const selected = providers[provider];
  document.querySelector('#provider-description').textContent = t(selected.description);
  document.querySelector('#provider-policy-content').innerHTML = `<p>${text(selected.policy)}</p><div class="provider-links"><a href="${escape(selected.source)}" target="_blank" rel="noopener noreferrer">${text('공식 설정 문서')}</a><a href="${escape(selected.privacy)}" target="_blank" rel="noopener noreferrer">${text('개인정보 정책')}</a></div><p class="policy-note">${text('공식 정책을 소개하는 것이며, 안전성을 절대 보장하거나 독립 인증하는 의미는 아닙니다. 차단 기능이 있는 제공자는 정상 사이트도 차단할 수 있어요.')}</p>`;
}

function showToast(message) {
  const toast = document.querySelector('#toast');
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
}

function updateDetectionNote() {
  if (manuallySelected) note.textContent = t('직접 선택한 OS의 안내를 보고 있어요.');
  else if (initialOS) note.textContent = variables('브라우저 정보로 {{os}} 안내를 선택했어요. 다른 OS도 볼 수 있어요.', { os: guides[initialOS].label });
  else note.textContent = t('OS를 확인하지 못했어요. 사용 중인 기기를 직접 선택해주세요.');
}

function copyableCode(code, title, index, label = '') {
  const copyTitle = label ? `${t(title)} · ${t(label)}` : t(title);
  return `${label ? `<p class="address-caption">${text(label)}</p>` : ''}<div class="code-block"><pre><code>${text(code)}</code></pre><button type="button" class="copy-button" data-copy-step="${index}" aria-label="${escape(variables('{{title}} 설정값 복사', { title: copyTitle }))}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/></svg><span>${text('복사')}</span></button></div>`;
}

function renderCode(step, code, index) {
  if (!code) return '';
  const family = step.code === '{{ipv4config}}' ? 'ipv4' : step.code === '{{ipv6config}}' ? 'ipv6' : null;
  if (!family) return copyableCode(code, step.title, index);
  const selected = providers[provider];
  const primary = copyableCode(selected[family], step.title, index, '기본 설정 DNS');
  const alternate = selected[`${family}alt`] ? copyableCode(selected[`${family}alt`], step.title, index, '대체 DNS') : `<p class="setting-empty">${text('대체 DNS')}: ${text('비워두세요 (제공자가 대체 주소를 공개하지 않았어요)')}</p>`;
  return primary + alternate;
}

function profilePath(protocol) {
  return `${currentLanguage === 'ko' ? '' : currentLanguage + '/'}${provider}-${protocol}.mobileconfig`;
}

function render() {
  renderProvider();
  document.querySelectorAll('[data-os]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.os === activeOS)));
  updateDetectionNote();
  if (!activeOS) {
    panel.innerHTML = `<div class="empty-state"><span class="empty-icon">${svg('macos')}</span><h2>${text('어떤 기기를 사용하시나요?')}</h2><p>${text('기기 선택에서 OS를 고르면 바로 설정 안내가 열려요.')}</p></div>`;
    return;
  }
  const baseGuide = guides[activeOS];
  const guide = { ...baseGuide, modes: baseGuide.modes.filter((item) => providers[provider].ipv4 || !['win11', 'resolved'].includes(item.id)) };
  const mode = guide.modes.find((item) => item.id === activeMode) ?? guide.modes[0];
  activeMode = mode.id;
  panel.innerHTML = `
    <div class="guide-heading">
      <div class="guide-title-row"><span class="guide-os-icon">${svg(activeOS)}</span><span class="guide-overline">${text(guide.subtitle)}</span></div>
      <h2>${text('{{os}}에서 DNS 암호화하기')}</h2>
      <p class="guide-intro">${text(guide.intro)}</p>
      <div class="mode-options">${guide.modes.map((item, index) => `<button type="button" class="mode-option" data-mode="${escape(item.id)}" aria-pressed="${item.id === activeMode}">${text(item.label)}${index === 0 ? `<span class="recommended-label">${text('추천')}</span>` : ''}</button>`).join('')}</div>
      <div class="guide-meta"><span class="protocol-badge">${text(mode.badge ?? guide.badge)}</span><span>${text(mode.time ?? guide.time)}</span><span class="meta-separator">·</span><span>${text('{{provider}} 사용')}</span></div>
      <p class="mode-summary">${text(mode.summary)}${!providers[provider].ipv4 && ['windows', 'linux'].includes(activeOS) ? ' ' + text('이 제공자는 직접 지정할 고정 IP를 이 안내에 포함하지 않아, 브라우저 DoH 방법을 제공합니다.') : ''}</p>
    </div>
    <ol class="steps">${mode.steps.map((step, index) => {
      let code = step.code;
      if (step.codeType === 'hostname') code = providers[provider].dot;
      if (step.codeType === 'doh') code = providers[provider].doh;
      const hasIpv6 = !!providers[provider].ipv6;
      const body = step.requires === 'ipv6' && !hasIpv6 ? '선택한 제공자는 공식 IPv6 DNS 주소를 공개하지 않았어요. IPv6 DNS가 함께 할당되는 네트워크라면 IPv6 주소가 있는 제공자를 선택하거나 아래 브라우저 DoH 방법을 사용하세요. IPv6 네트워크 기능을 끄는 방법은 권장하지 않아요.' : step.body;
      if (step.requires === 'ipv6' && !hasIpv6) code = null;
      return `<li class="step"><span class="step-number" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span><div class="step-content"><h3>${text(step.title)}</h3><p>${text(body)}</p>${renderCode(step, code, index)}${step.download ? `<a class="download-button" href="./profiles/${escape(profilePath(step.download))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></svg>${escape(variables('{{provider}} {{protocol}} 프로파일 다운로드', { provider: providers[provider].provider, protocol: step.download.toUpperCase() }))}</a><p class="download-caption">${text('설치 전 XML 원문을 확인할 수 있어요.')} <a href="https://github.com/studyreadbook4ever/howToSafeDNS/blob/main/profiles/${escape(profilePath(step.download))}" target="_blank" rel="noopener noreferrer">${text('XML 원문 확인')}</a></p>` : ''}${step.note ? `<p class="step-note"><span aria-hidden="true">↳</span>${text(step.note)}</p>` : ''}</div></li>`;
    }).join('')}</ol>
    <div class="verification"><div class="verification-heading"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m7.5 12 3 3 6-6"/></svg><h3>${text('설정 후 확인하기')}</h3></div><ul>${mode.verify.map((item) => `<li>${text(item)}</li>`).join('')}</ul><p class="verification-note">${text('이 안내를 읽거나 값을 복사한 것만으로 설정이 적용되지는 않아요.')}</p></div>
    ${mode.notes?.length ? `<div class="guide-notes"><h3>${text('알아두면 좋아요')}</h3><ul>${mode.notes.map((item) => `<li>${text(item)}</li>`).join('')}</ul></div>` : ''}
    <div class="guide-bottom"><details class="undo-details"><summary>${text('원래 설정으로 돌아가기')}<span aria-hidden="true">+</span></summary><p>${text(mode.undo)}</p></details><details class="sources-details"><summary>${text('공식 문서 보기')}<span aria-hidden="true">+</span></summary><ul><li><a href="${escape(providers[provider].source)}" target="_blank" rel="noopener noreferrer">${text('{{provider}} · 공식 설정 문서')}</a></li>${mode.sources.map((source) => `<li><a href="${escape(source.url)}" target="_blank" rel="noopener noreferrer">${text(source.title)}</a></li>`).join('')}</ul><p class="source-date">${text('문서 확인: 2026년 10월 7일 · 화면 이름은 버전에 따라 다를 수 있어요.')}</p></details></div>`;
}

function selectOS(id, manual = true) {
  if (!osOrder.includes(id)) return;
  activeOS = id;
  activeMode = null;
  manuallySelected = manual;
  if (manual) history.replaceState(null, '', `${location.pathname}${location.search}#${id}`);
  render();
  document.querySelector('#announcement').textContent = variables('{{os}} 설정 안내를 표시합니다.', { os: guides[id].label });
}

document.querySelector('#os-options').addEventListener('click', (event) => {
  const button = event.target.closest('[data-os]');
  if (button) selectOS(button.dataset.os);
});
document.querySelector('#provider-select').addEventListener('change', (event) => {
  if (event.target.name !== 'provider' || !providers[event.target.value]) return;
  provider = event.target.value;
  render();
  document.querySelector('#announcement').textContent = variables('{{provider}}의 설정값으로 변경했습니다.', { provider: providers[provider].provider });
});
document.querySelector('#language-select').addEventListener('change', async (event) => {
  if (!await loadLanguage(event.target.value)) return;
  const url = new URL(location.href);
  url.searchParams.set('lang', currentLanguage);
  history.replaceState(null, '', url);
  applyStaticLanguage();
  render();
});
panel.addEventListener('click', async (event) => {
  const modeButton = event.target.closest('[data-mode]');
  if (modeButton) {
    activeMode = modeButton.dataset.mode;
    render();
    panel.querySelector(`[data-mode="${activeMode}"]`).focus({ preventScroll: true });
    return;
  }
  const copyButton = event.target.closest('[data-copy-step]');
  if (!copyButton) return;
  const value = copyButton.closest('.code-block').querySelector('code').textContent;
  try {
    await navigator.clipboard.writeText(value);
    showToast(t('설정값을 복사했어요. 설정 화면에 붙여넣어주세요.'));
  } catch {
    const code = copyButton.closest('.code-block').querySelector('code');
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    showToast(t('자동 복사가 제한됐어요. 선택된 값을 직접 복사해주세요.'));
  }
});
window.addEventListener('hashchange', () => {
  const id = location.hash.slice(1).toLowerCase();
  if (osOrder.includes(id)) selectOS(id);
  else if (!id && initialOS) selectOS(initialOS, false);
});

await loadLanguage(preferredLanguage());
applyStaticLanguage();
initialOS = await detectBrowserOS();
const requestedOS = location.hash.slice(1).toLowerCase();
if (osOrder.includes(requestedOS)) selectOS(requestedOS);
else if (initialOS) selectOS(initialOS, false);
else render();
