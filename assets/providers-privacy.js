// First-party endpoint and privacy documentation checked on 2026-10-07.
// Provider statements below are attributed claims, not independent audits.
// Mullvad public encrypted DNS is omitted: retirement announced for 2026-11-02.
// Wikimedia DNS is omitted: beta service without a formal DNS privacy policy.
// A missing alternate/IPv6 address must stay omitted, never be invented.
export const privacyProviders = {
  libredns: {
    provider: 'LibreDNS',
    ipv4: '116.202.176.26',
    ipv6: '2a01:4f8:1c0c:8274::1',
    oneServer: true,
    dot: 'dot.libredns.gr',
    doh: 'https://doh.libredns.gr/dns-query',
    description: 'LibreOps가 운영하는 공개 암호화 DNS. 광고 차단 없는 기본 주소입니다.',
    policy: '운영자는 DNS 데몬의 로그를 비활성화해 조회 로그를 남기지 않는다고 안내합니다.',
    source: 'https://libredns.gr/',
    privacy: 'https://libredns.gr/',
  },
  rethinkdns: {
    provider: 'RethinkDNS',
    // Resolve this hostname when bootstrapping. No static IP promise is
    // inferred from old documentation or a current DNS answer.
    noServerAddresses: true,
    dot: 'max.rethinkdns.com',
    doh: 'https://max.rethinkdns.com/',
    description: '계정 없이 쓰는 공개 암호화 DNS. Fly.io에서 운영되는 max 주소입니다.',
    policy: '운영자는 기본적으로 DNS 조회 로그를 저장하지 않는다고 안내합니다. 유료 이용자가 별도로 켠 로그·분석 기능은 예외이며 호스팅 업체의 정책도 적용됩니다.',
    source: 'https://github.com/serverless-dns/serverless-dns#the-rethinkdns-resolver',
    privacy: 'https://rethinkdns.com/privacy',
  },
};
