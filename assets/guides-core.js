// Instructions reviewed against the linked first-party documentation in October 2026.
const chromeSources = [
  { title: 'Google Chrome · 보안 DNS 설정', url: 'https://support.google.com/chrome/answer/10468685?hl=ko&co=GENIE.Platform%3DDesktop' },
  { title: 'Microsoft Edge · 보안 DNS 설정', url: 'https://support.microsoft.com/en-us/edge/securely-browse-the-web-in-microsoft-edge' },
  { title: 'Microsoft Edge · 자동 모드와 암호화 모드', url: 'https://learn.microsoft.com/en-us/deployedge/microsoft-edge-policies/DnsOverHttpsMode' }
];
const firefoxSources = [
  { title: 'Mozilla · DNS over HTTPS 보호 수준', url: 'https://support.mozilla.org/en-US/kb/dns-over-https' }
];

function chromiumMode(id = 'browser') {
  return {
    id,
    label: 'Chrome · Edge',
    summary: '브라우저에서 제공자를 직접 선택해 DoH를 사용합니다. 다른 앱의 DNS는 별도입니다.',
    badge: '브라우저 DoH',
    time: '약 2분',
    steps: [
      { title: '브라우저의 보안 설정 열기', body: 'Chrome: 오른쪽 위 ⋮ → 설정 → 개인 정보 보호 및 보안 → 보안.\nEdge: 오른쪽 위 … → 설정 → 개인 정보, 검색 및 서비스 → 보안. 메뉴가 다르면 설정 검색창에서 “DNS”를 검색하세요.' },
      { title: '보안 DNS 켜기', body: '“보안 DNS 사용”을 켜고 “다른 제공자 선택” 또는 제공자를 직접 선택하는 항목을 누르세요. “현재 서비스 제공자 사용”은 자동 모드라 암호화 연결이 실패하면 평문 DNS로 돌아갈 수 있습니다.' },
      { title: '선택한 제공자의 주소 넣기', body: '목록에서 {{provider}}를 고르거나, “맞춤설정/사용자 지정” 입력란에 아래 주소 전체를 붙여 넣으세요. 이곳에는 1.1.1.1 같은 IP 주소가 아니라 https://로 시작하는 DoH 주소가 들어갑니다.', codeType: 'doh' },
      { title: '설정이 유지되는지 확인하기', body: '다른 설정 화면에 갔다가 다시 돌아와 보안 DNS가 켜져 있고 제공자가 {{provider}}로 선택되어 있는지 확인하세요. 새 탭에서 웹사이트를 열어 정상 접속되는지도 확인합니다.', note: '설정이 잠겨 있거나 항목이 없다면 회사·학교 정책, 자녀 보호 기능 또는 브라우저 버전의 영향을 받을 수 있습니다.' }
    ],
    verify: [
      '“보안 DNS 사용”이 켜져 있고 자동 모드 대신 지정한 제공자가 선택되어 있는지 확인하세요.',
      '웹사이트 접속 성공은 동작 확인입니다. 기기 전체 DNS의 암호화를 증명하지는 않습니다.'
    ],
    undo: '같은 메뉴에서 “보안 DNS 사용”을 끄거나, 변경 전의 제공자와 모드로 되돌리세요.',
    notes: [
      '이 설정은 해당 브라우저의 DNS 조회에 적용됩니다. 게임, 메신저, 다른 브라우저에는 따로 설정해야 합니다.',
      'VPN이나 조직 내부 도메인을 이용한다면 기존 DNS 정책과 함께 확인하세요. 공용 제공자가 내부 이름을 모르면 접속이 실패할 수 있습니다.'
    ],
    sources: chromeSources
  };
}

function firefoxMode(id = 'firefox') {
  return {
    id,
    label: 'Firefox',
    summary: '최대 보호 또는 사용자 지정의 경고 옵션으로 암호화 실패 시 자동 대체를 막습니다.',
    badge: '브라우저 DoH',
    time: '약 2분',
    steps: [
      { title: '개인 정보 설정 열기', body: '오른쪽 위 ☰ → 설정 → 개인 정보 및 보안으로 들어가 아래쪽의 “DNS over HTTPS” 항목을 찾으세요. 버전에 따라 “고급 설정”을 눌러 보호 수준을 엽니다.' },
      { title: '암호화 실패 시 경고하도록 설정하기', body: '“최대 보호(Max Protection)”를 선택하세요. 새 화면에 “사용자 지정(Custom protection)”이 있다면 그 항목을 선택하고 “보안 DNS를 사용할 수 없으면 항상 경고”를 켜세요. 기본 보호·강화 보호는 문제가 생기면 대체 경로를 사용할 수 있습니다.' },
      { title: '제공자 주소 입력하기', body: '제공자 목록에서 {{provider}}를 고르세요. 없으면 “사용자 지정”을 선택하고 아래 DoH 주소 전체를 붙여 넣습니다.', codeType: 'doh' },
      { title: '활성 상태와 예외 확인하기', body: '같은 화면에서 DoH 상태가 “활성(Active)”인지 확인하세요. 암호화 실패 경고가 나타나면 주소와 연결을 먼저 확인하세요. 경고에서 사이트를 예외에 추가하면 그 사이트는 시스템 DNS를 사용할 수 있습니다.' }
    ],
    verify: [
      'DoH 상태가 “활성”이고, 제공자와 보호 수준이 선택한 값인지 확인하세요.',
      '“예외 관리”에 등록된 사이트가 있는지 확인하세요. 예외가 적용되면 해당 사이트는 시스템 DNS로 조회할 수 있습니다.'
    ],
    undo: 'DNS over HTTPS 보호 수준을 변경 전 값으로 되돌리세요. “끔”을 선택하면 시스템 DNS를 사용합니다.',
    notes: [
      'Firefox의 설정이며 기기 전체에 적용되지 않습니다.',
      '엄격한 설정에서는 암호화 서버에 연결할 수 없거나 내부 이름을 조회하지 못할 때 경고가 나타날 수 있습니다.'
    ],
    sources: firefoxSources
  };
}

export const coreGuides = {
  windows: {
    label: 'Windows',
    subtitle: 'Windows 11은 설정에서, Windows 10은 브라우저에서 시작하세요.',
    time: '약 3분',
    badge: 'DoH',
    intro: 'Windows 11은 운영체제의 DNS 클라이언트에서 DoH를 지원합니다. Windows 10에는 같은 기본 설정 화면이 없으므로 아래 브라우저 방법을 선택하세요.',
    modes: [
      {
        id: 'win11',
        label: 'Windows 11',
        summary: '현재 네트워크의 Windows DNS 클라이언트에 DoH를 설정합니다.',
        badge: '운영체제 DoH',
        time: '약 3분',
        steps: [
          { title: '현재 연결의 설정 열기', body: '시작 → 설정 → 네트워크 및 인터넷으로 들어가세요. Wi-Fi라면 Wi-Fi → 연결된 네트워크의 속성, 유선이라면 이더넷을 엽니다. 변경 전 DNS 설정은 사진이나 메모로 남겨 두세요.' },
          { title: 'DNS 서버 할당을 수동으로 바꾸기', body: '“DNS 서버 할당” 옆의 편집 → 수동을 선택하고 IPv4 입력 항목을 켜세요. 기기의 IP 주소·게이트웨이를 바꾸는 “IP 할당” 항목과 구별하세요.' },
          { title: 'IPv4 DNS 주소 입력하기', body: '기본 설정 DNS와 대체 DNS에 아래 값을 넣으세요. 제공자가 대체 주소를 공개하지 않았다면 대체 DNS는 비워둡니다. 입력한 각 서버에 다음 단계의 암호화 옵션을 설정하세요.', code: '{{ipv4config}}', codeType: 'literal' },
          { title: 'DoH를 켜고 평문 대체 끄기', body: '입력한 각 서버의 “DNS over HTTPS”에서 “켬(수동 템플릿)”을 고르고 아래 주소를 입력하세요. “평문으로 대체(Fallback to plaintext)”는 끕니다. 선택한 서버를 자동으로 인식하는 경우 “켬(자동 템플릿)”도 사용할 수 있어요. 예전 화면에서는 “암호화된 연결만(HTTPS를 통한 DNS)”을 고릅니다.', codeType: 'doh', note: '암호화 연결이 실패하면 조회가 실패하는 설정입니다. 실패했을 때 평문 DNS로 조용히 전환하지 않습니다.' },
          { title: 'IPv6 DNS도 사용한다면 함께 설정하기', body: '현재 연결에서 IPv6 DNS도 받거나 사용한다면 IPv6 DNS 입력 항목에도 아래 값을 넣으세요. 입력한 각 서버에 같은 DoH 옵션과 “평문으로 대체 끔”을 적용합니다. IPv6 네트워크 기능 자체를 끌 필요는 없습니다.', code: '{{ipv6config}}', codeType: 'literal', requires: 'ipv6' },
          { title: '저장하고 설정 확인하기', body: '저장을 누르고 네트워크 속성에서 DNS 주소와 암호화 표시를 확인하세요. 새 웹사이트가 열리는지 확인합니다. Wi-Fi·이더넷·다른 네트워크를 번갈아 사용하면 사용하는 연결마다 설정을 확인하세요.' }
        ],
        verify: [
          '설정을 다시 열어 등록한 각 DNS 서버에 DoH가 켜져 있고 평문 대체가 꺼져 있는지 확인하세요.',
          'DNS를 자체적으로 처리하는 앱과 VPN은 별도의 설정을 사용할 수 있습니다. 이 화면만으로 모든 앱의 DNS 경로가 확인되지는 않습니다.'
        ],
        undo: '같은 “DNS 서버 할당 → 편집”에서 변경 전 설정으로 복원하세요. 원래 자동이었다면 “자동(DHCP)”을 선택하고 저장합니다.',
        notes: [
          '1.1.1.1이나 8.8.8.8 같은 주소만 입력하면 암호화 설정이 끝난 것이 아닙니다. DoH 옵션까지 켜야 합니다.',
          '회사·학교 네트워크나 VPN은 내부 DNS와 정책을 사용할 수 있습니다. 설정이 관리되거나 메뉴가 없다면 해당 환경의 안내를 확인하세요.',
          'DoH 메뉴가 없는 Windows 10에서는 Chrome·Edge 또는 Firefox 방법을 선택하세요.'
        ],
        sources: [
          { title: 'Microsoft · Windows 네트워크와 DoH 옵션', url: 'https://support.microsoft.com/en-us/windows/experience/connectivity-networking/essential-network-settings-and-tasks-in-windows' },
          { title: 'Cloudflare · Windows 설정과 DNS 서버 주소', url: 'https://developers.cloudflare.com/1.1.1.1/setup/windows/' }
        ]
      },
      chromiumMode(),
      firefoxMode()
    ]
  },
  android: {
    label: 'Android',
    subtitle: '프라이빗 DNS에 제공자의 이름 하나를 넣으세요.',
    time: '약 1분',
    badge: 'DoT · DoH3',
    intro: 'Android 9 이상에서는 “프라이빗 DNS”로 암호화 DNS를 설정할 수 있습니다. Wi-Fi와 모바일 데이터에 적용되며, 지원되는 최신 환경에서는 알려진 제공자에 대해 DoH3를 사용할 수도 있습니다.',
    modes: [
      {
        id: 'private',
        label: '프라이빗 DNS',
        summary: '자동 모드 대신 제공자 호스트 이름을 직접 지정합니다.',
        badge: '운영체제 암호화 DNS',
        time: '약 1분',
        steps: [
          { title: '프라이빗 DNS 설정 찾기', body: '휴대전화의 설정 앱에서 “프라이빗 DNS”를 검색하세요. 보통 네트워크 및 인터넷 → 프라이빗 DNS에 있습니다. 기종에 따라 “개인 DNS” 또는 연결 → 기타 연결 설정 안에 표시됩니다.' },
          { title: '제공자 호스트 이름 선택하기', body: '현재 선택된 옵션을 메모한 뒤 “프라이빗 DNS 제공자 호스트 이름”을 선택하세요. “자동”은 네트워크가 제공한 DNS를 쓰며 암호화가 안 되면 평문으로 돌아갈 수 있습니다.' },
          { title: '제공자 이름 붙여 넣기', body: '아래 이름을 입력란에 붙여 넣으세요. https://, /dns-query, IP 주소는 넣지 않습니다. {{provider}}의 암호화 DNS 서버를 지정하는 이름입니다.', codeType: 'hostname' },
          { title: '저장하고 두 연결에서 확인하기', body: '저장을 누르고 새 웹사이트를 열어 보세요. Wi-Fi와 모바일 데이터를 각각 사용할 때도 확인합니다. “프라이빗 DNS 서버에 연결할 수 없음”이 나오면 입력한 이름과 현재 네트워크를 확인하세요.', note: '제공자 이름을 지정한 모드는 암호화 서버에 연결되지 않으면 조회가 실패할 수 있습니다. 공공 Wi-Fi 로그인이나 암호화 DNS가 차단된 네트워크에서는 문제가 생길 수 있습니다.' }
        ],
        verify: [
          '설정을 다시 열어 “제공자 호스트 이름”이 선택되어 있고 입력한 이름이 유지되는지 확인하세요.',
          'Wi-Fi와 모바일 데이터에서 각각 정상 조회되는지 확인하세요. 단순 접속 성공만으로 기기 전체의 DNS 암호화가 검증되는 것은 아닙니다.'
        ],
        undo: '프라이빗 DNS 화면에서 변경 전 옵션으로 되돌리세요. 원래 “자동”이었다면 자동을 선택하고 저장합니다.',
        notes: [
          '이 기능의 기본 기반은 DoT입니다. 지원되는 Android 버전·업데이트·제공자 조합에서는 DoH3로 전환될 수 있어 무조건 DoT라고 단정하지 않습니다.',
          '프라이빗 DNS는 Android 시스템 DNS를 이용하는 조회에 적용됩니다. 자체 DNS를 쓰는 앱·브라우저·VPN의 동작은 따로 확인하세요.',
          'Android 9의 일부 VPN·DNS 변경 앱은 프라이빗 DNS를 우회할 수 있습니다. Android 9 미만에는 이 기본 기능이 없습니다.'
        ],
        sources: [
          { title: 'Cloudflare · Android 프라이빗 DNS와 DoH3', url: 'https://developers.cloudflare.com/1.1.1.1/setup/android/' },
          { title: 'Google Public DNS · Android 설정과 자동 모드', url: 'https://developers.google.com/speed/public-dns/docs/using#android' }
        ]
      }
    ]
  },
  linux: {
    label: 'Linux',
    subtitle: '사용 중인 DNS 서비스에 맞춰 설정하세요.',
    time: '약 5분',
    badge: 'DoT · DoH',
    intro: 'Linux는 배포판과 네트워크 관리자에 따라 방법이 다릅니다. 아래 DoT 방법은 이미 systemd-resolved를 사용하는 환경용입니다. 그 밖의 환경은 브라우저 DoH로 시작할 수 있습니다.',
    modes: [
      {
        id: 'resolved',
        label: 'systemd-resolved',
        summary: 'systemd 248 이상이며 로컬 DNS가 resolved를 사용하는 환경에서 인증된 DoT를 설정합니다.',
        badge: '운영체제 DoT',
        time: '약 5분',
        steps: [
          { title: '이 방법을 사용할 수 있는지 확인하기', body: '터미널에서 아래 명령을 실행하세요. 서비스가 active이고 systemd 버전이 248 이상이며 마지막 경로가 /run/systemd/resolve/stub-resolv.conf인 환경을 대상으로 합니다. 다르면 기존 DNS 관리 방식을 유지하고 브라우저 방법을 선택하세요.', code: 'systemctl is-active systemd-resolved\nresolvectl --version\nresolvectl status\nreadlink -f /etc/resolv.conf', codeType: 'literal' },
          { title: '새 설정 파일 열기', body: '현재 resolvectl status 결과를 저장해 두세요. 아래 경로에 파일이 이미 있다면 먼저 복사해 보관하고 내용도 확인하세요. 명령은 관리자 암호를 요청할 수 있습니다. 기존 서비스를 끄거나 resolv.conf를 바꾸지 않습니다.', code: 'sudo install -d /etc/systemd/resolved.conf.d\nsudoedit /etc/systemd/resolved.conf.d/90-howtosafedns.conf', codeType: 'literal' },
          { title: '인증된 DoT 설정 저장하기', body: '편집기에 아래 내용을 넣고 저장하세요. IP 뒤의 #호스트이름은 서버 인증서 확인에 쓰입니다. DNSOverTLS=yes는 암호화를 필수로 하고, opportunistic처럼 실패 시 평문으로 바꾸지 않습니다. 첫 빈 DNS= 줄은 앞서 누적된 전역 서버 목록을 비웁니다.', code: '[Resolve]\nDNS=\nDNS={{dotservers}}\nFallbackDNS=\nDomains=\nDomains=~.\nDNSOverTLS=yes', codeType: 'literal' },
          { title: 'DNS 서비스에 적용하기', body: '아래 명령으로 설정을 적용하고 실제 조회를 해 보세요. 잠시 DNS 조회가 끊길 수 있습니다. 외부 DNS 서버까지 TCP 853 연결이 허용되어야 합니다.', code: 'sudo systemctl restart systemd-resolved\nresolvectl status\nresolvectl query --cache=no example.com', codeType: 'literal' },
          { title: '전역 설정과 링크별 설정 확인하기', body: 'Global에 선택한 서버와 DNSOverTLS 활성 표시가 있는지 확인하세요. 각 Link의 DNS 서버·DNS Domain·DNSOverTLS도 확인합니다. VPN의 내부 도메인이나 링크별 DNSOverTLS 설정은 이 전역 설정보다 우선할 수 있습니다. 해당 링크의 NetworkManager·systemd-networkd 설정을 따로 맞춰야 하며, 전역 파일만으로 모든 DNS가 바뀌었다고 판단하면 안 됩니다.' }
        ],
        verify: [
          'resolvectl status에서 전역 및 사용하는 링크의 DNS·라우팅·DoT 설정을 확인하고, 캐시를 쓰지 않는 실제 조회가 성공하는지 확인하세요.',
          '더 확인하려면 실제 외부 네트워크 인터페이스를 Wireshark로 관찰하세요. DoT는 TCP 853을 사용합니다. 루프백의 127.0.0.53 조회는 기기 내부 통신이므로 외부 평문 DNS와 구별하세요.',
          'resolvectl의 DNSSEC 인증 표시는 TLS 사용 여부와 다른 정보입니다. 설정과 조회 성공만으로 모든 앱의 트래픽이 검증되는 것은 아닙니다.'
        ],
        undo: '이번에 새로 만든 파일이라면 sudo rm /etc/systemd/resolved.conf.d/90-howtosafedns.conf 를 실행하세요. 원래 있던 파일을 편집했다면 보관한 원본으로 복원하세요. 그다음 sudo systemctl restart systemd-resolved 로 다시 적용합니다.',
        notes: [
          'Domains=~.는 일반 인터넷 이름에 전역 DNS를 우선 사용하게 합니다. 더 구체적인 VPN·내부 도메인 경로 또는 같은 ~. 경로가 있으면 별도의 링크 DNS가 선택될 수 있습니다.',
          'NetworkManager·systemd-networkd·VPN이 지정한 링크별 설정과 나중에 읽는 다른 설정 파일은 별도로 확인해야 합니다.',
          '이 방법은 IPv4로 DNS 서버에 연결합니다. IPv6 전용 네트워크에서는 제공자의 IPv6 서버로 설정을 조정해야 합니다.',
          'mDNS·LLMNR 및 자체 DNS를 쓰는 앱은 이 일반 DNS 설정의 적용 범위와 다릅니다. 회사·학교 내부 DNS를 공용 DNS로 무작정 교체하지 마세요.'
        ],
        sources: [
          { title: 'systemd · resolved.conf: DoT와 서버 이름 인증', url: 'https://github.com/systemd/systemd/blob/main/man/resolved.conf.xml' },
          { title: 'systemd · DNS 라우팅과 resolv.conf 모드', url: 'https://github.com/systemd/systemd/blob/main/man/systemd-resolved.service.xml' },
          { title: 'systemd · resolvectl 조회와 상태 확인', url: 'https://github.com/systemd/systemd/blob/main/man/resolvectl.xml' }
        ]
      },
      chromiumMode(),
      firefoxMode()
    ]
  }
};
