// Public endpoints and attributed policy summaries reviewed against official sources, October 2026.
// A filtering resolver can return false positives; encryption does not guarantee a site is safe.
export const securityProviders = {
  quad9: {
    provider: 'Quad9',
    label: 'Quad9 · 악성 도메인 차단',
    ipv4: '9.9.9.9',
    ipv4alt: '149.112.112.112',
    ipv6: '2620:fe::fe',
    ipv6alt: '2620:fe::9',
    dot: 'dns.quad9.net',
    doh: 'https://dns.quad9.net/dns-query',
    description: '위협으로 분류한 도메인을 차단하는 무료 서비스입니다. 차단 판단이 틀리면 정상 사이트도 열리지 않을 수 있습니다.',
    policy: 'Quad9는 사용자 IP를 수집·기록하지 않는다고 명시합니다. 개인과 연결하지 않는 집계 및 도메인 통계는 처리하므로 “아무 데이터도 저장하지 않음”을 뜻하지 않습니다.',
    source: 'https://docs.quad9.net/services/',
    privacy: 'https://quad9.net/privacy/policy/'
  },
  adguard: {
    provider: 'AdGuard DNS',
    label: 'AdGuard DNS · 광고·추적 차단',
    ipv4: '94.140.14.14',
    ipv4alt: '94.140.15.15',
    ipv6: '2a10:50c0::ad1:ff',
    ipv6alt: '2a10:50c0::ad2:ff',
    dot: 'dns.adguard-dns.com',
    doh: 'https://dns.adguard-dns.com/dns-query',
    description: '공개 기본 서버는 광고·추적·악성 도메인을 차단합니다. 일부 사이트나 앱의 기능이 함께 막힐 수 있습니다.',
    policy: 'AdGuard는 공개 DNS에서 개인 데이터를 처리하지 않는다고 명시합니다. 사용자와 연결하지 않는 사용 통계와 최근 24시간의 익명 도메인 데이터는 저장합니다.',
    source: 'https://adguard-dns.io/en/public-dns.html',
    privacy: 'https://adguard-dns.io/en/privacy.html'
  },
  controld: {
    provider: 'Control D',
    label: 'Control D · 악성 도메인 차단',
    ipv4: '76.76.2.11',
    ipv4alt: '76.76.10.11',
    ipv6: '2606:1a40::11',
    ipv6alt: '2606:1a40:1::11',
    dot: 'p1.freedns.controld.com',
    doh: 'https://freedns.controld.com/p1',
    description: '무료 악성 도메인 필터입니다. 아래 IP는 암호화 연결용이며 평문 DNS용 주소와 다릅니다. 정상 도메인이 잘못 차단될 수도 있습니다.',
    policy: 'Control D의 무료 DNS 문서는 개별 방문 기록·타임스탬프·조회 로그를 저장하지 않는다고 명시합니다. 유료 계정과 웹사이트에는 별도의 개인정보 정책이 적용됩니다.',
    source: 'https://docs.controld.com/docs/free-dns',
    bootstrapSource: 'https://docs.controld.com/docs/control-d-ip-ranges',
    privacy: 'https://controld.com/privacy'
  },
  cleanbrowsing: {
    provider: 'CleanBrowsing',
    label: 'CleanBrowsing · 보안 필터',
    ipv4: '185.228.168.9',
    ipv4alt: '185.228.169.9',
    ipv6: '2a0d:2a00:1::2',
    ipv6alt: '2a0d:2a00:2::2',
    dot: 'security-filter-dns.cleanbrowsing.org',
    doh: 'https://doh.cleanbrowsing.org/doh/security-filter/',
    description: '무료 Security 필터는 피싱·스팸·악성 도메인을 차단합니다. 성인 콘텐츠 필터는 아니며 정상 사이트가 잘못 차단될 수도 있습니다.',
    policy: 'CleanBrowsing은 무료 DNS에서 조회를 개인에게 연결할 수 있는 IP 등 식별 정보를 기록·저장하지 않는다고 명시합니다. 익명 집계 DNS 데이터는 서비스 운영에 처리합니다.',
    source: 'https://cleanbrowsing.org/filters',
    privacy: 'https://cleanbrowsing.org/privacy'
  },
  dns4eu: {
    provider: 'DNS4EU',
    label: 'DNS4EU · 보호용 DNS',
    ipv4: '86.54.11.1',
    ipv4alt: '86.54.11.201',
    ipv6: '2a13:1001::86:54:11:1',
    ipv6alt: '2a13:1001::86:54:11:201',
    dot: 'protective.joindns4.eu',
    doh: 'https://protective.joindns4.eu/dns-query',
    description: '유럽 개인 이용자를 위한 무료 보호용 DNS입니다. 악성·피싱·명령제어 도메인과 법원 명령에 따른 도메인을 차단합니다. 한국에서는 연결과 지연을 확인하세요.',
    policy: 'DNS4EU는 클라이언트 IP를 완전히 익명화한 뒤 기록하고, 조회를 판매·프로파일링·광고 타기팅에 사용하지 않는다고 명시합니다. 로그 자체가 없다는 뜻은 아닙니다.',
    source: 'https://joindns4.eu/for-public',
    privacy: 'https://legal-documents-dns4eu.s3.fr-par.scw.cloud/DNS4EU-Public-DNS-Resolver-policy-2025.pdf'
  }
};
