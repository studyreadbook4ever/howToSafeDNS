import { securityProviders } from './providers-security.js';
import { privacyProviders } from './providers-privacy.js';

// Addresses and policy summaries are sourced from each operator's own docs.
// A published commitment is not an independent guarantee of safety.
export const providers = {
  cloudflare: {
    provider: 'Cloudflare',
    ipv4: '1.1.1.1', ipv4alt: '1.0.0.1',
    ipv6: '2606:4700:4700::1111', ipv6alt: '2606:4700:4700::1001',
    dot: 'one.one.one.one', doh: 'https://cloudflare-dns.com/dns-query',
    description: '일반 조회 · 기본 서비스에는 콘텐츠 차단 없음',
    policy: '개인정보를 광고 타기팅에 사용하거나 판매하지 않는다고 밝힙니다. 제한된 조회·디버그 로그는 25시간 이내 삭제하며 일부 표본·집계 예외는 정책에 명시되어 있습니다.',
    source: 'https://developers.cloudflare.com/1.1.1.1/encryption/',
    privacy: 'https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/',
  },
  google: {
    provider: 'Google Public DNS',
    ipv4: '8.8.8.8', ipv4alt: '8.8.4.4',
    ipv6: '2001:4860:4860::8888', ipv6alt: '2001:4860:4860::8844',
    dot: 'dns.google', doh: 'https://dns.google/dns-query',
    description: '일반 조회 · 악성 사이트 차단 서비스는 아님',
    policy: 'DNS에서 수집한 개인정보를 광고 타기팅에 사용하지 않는다고 밝힙니다. IP와 조회를 포함한 임시 로그는 보통 24–48시간 보관하며, 보안·오남용 대응 예외와 비식별 장기 로그가 있습니다.',
    source: 'https://developers.google.com/speed/public-dns/docs/secure-transports',
    privacy: 'https://developers.google.com/speed/public-dns/privacy',
  },
  ...securityProviders,
  ...privacyProviders,
};
