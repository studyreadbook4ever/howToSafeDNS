const dnsSettingsSource = {
  title: 'Apple · 암호화 DNS 프로필 사양',
  url: 'https://developer.apple.com/documentation/devicemanagement/dnssettings',
};

const serverFieldsSource = {
  title: 'Apple · DoH / DoT 서버 설정 필드',
  url: 'https://developer.apple.com/documentation/devicemanagement/dnssettings/dnssettings-data.dictionary',
};

const scopeSource = {
  title: 'Apple · 암호화 DNS와 VPN / 앱의 적용 범위',
  url: 'https://developer.apple.com/videos/play/wwdc2020/10047/',
};

const profileNotes = [
  '이 파일에는 DNS 설정 하나만 들어 있습니다. 루트 인증서, VPN, 기기 관리 등록, 앱 설치 항목은 없습니다. GitHub에서 XML 원문을 확인할 수 있습니다.',
  '프로필은 서명되지 않았습니다. “서명되지 않음”은 배포자 서명이 없다는 뜻이며, DNS 연결의 TLS 암호화와는 별개입니다. 설치 화면의 이름과 DNS 주소를 확인한 뒤 결정하세요.',
  '회사·학교가 관리하는 기기는 프로필 설치가 제한될 수 있습니다. 기존 관리 프로필을 삭제하지 말고 관리자에게 문의하세요.',
  'VPN, 브라우저의 자체 보안 DNS, 일부 앱은 별도 DNS를 사용할 수 있습니다. 이 프로필 설치만으로 모든 앱의 모든 DNS가 암호화되었다고 보장할 수는 없습니다.',
  '프로필에는 위에서 선택한 제공자의 공식 DNS 주소가 들어갑니다. 제공자별 필터링과 개인정보 처리방침도 확인하세요.',
];

const iosSources = [
  {
    title: 'Apple · iPhone / iPad 프로필 설치',
    url: 'https://support.apple.com/ko-kr/102400',
  },
  {
    title: 'Apple · iPhone 프로필 확인과 제거',
    url: 'https://support.apple.com/ko-kr/guide/iphone/iph6c493b19/ios',
  },
  dnsSettingsSource,
  serverFieldsSource,
  scopeSource,
];

const macSources = [
  {
    title: 'Apple · 최신 macOS 프로필 설치와 제거',
    url: 'https://support.apple.com/ko-kr/guide/mac-help/mh35561/mac',
  },
  {
    title: 'Apple · macOS 13 프로필 메뉴',
    url: 'https://support.apple.com/ko-kr/guide/mac-help/mh35561/13.0/mac/13.0',
  },
  {
    title: 'Apple · macOS 11 프로필 메뉴',
    url: 'https://support.apple.com/ko-kr/guide/mac-help/mh35561/11.0/mac/11.0',
  },
  dnsSettingsSource,
  serverFieldsSource,
  scopeSource,
  {
    title: 'Apple · dig와 macOS 기본 DNS의 차이',
    url: 'https://github.com/apple-oss-distributions/bind9/blob/main/bind9/bin/dig/dig.1',
  },
];

function iosMode(protocol) {
  const isDoh = protocol === 'doh';
  const name = isDoh ? 'DoH' : 'DoT';
  return {
    id: protocol,
    label: isDoh ? 'DoH 프로필' : 'DoT 프로필',
    summary: isDoh
      ? 'Apple의 기본 암호화 DNS 기능을 프로필로 설정합니다. 별도 앱 없이 Wi-Fi와 모바일 데이터에서 사용할 수 있습니다.'
      : '같은 프로필 방식으로 DNS over TLS를 설정합니다. TCP 853 연결을 허용하는 네트워크에서 사용하세요.',
    badge: isDoh ? '추천 · iOS 14+' : '대안 · iOS 14+',
    time: '약 3분',
    steps: [
      {
        title: 'Safari에서 이 페이지를 열어요',
        body: '설정 → 일반 → 정보에서 iOS / iPadOS가 14 이상인지 확인하세요. 앱 안의 브라우저로 접속했다면 주소를 복사해 Safari에서 여세요. 이전에 설치한 howToSafeDNS 프로필이 있다면 아래 “원래대로 돌리기” 방법으로 먼저 제거하세요.',
      },
      {
        title: `선택한 제공자의 ${name} 프로필을 받아요`,
        body: '아래 다운로드 버튼을 누르세요. 구성 프로필 다운로드를 허용할지 묻는 화면에서 허용을 선택합니다. 다운로드만으로 설정이 바뀌지는 않습니다.',
        download: protocol,
        codeType: isDoh ? 'doh' : 'hostname',
        note: '위 주소는 프로필에 들어갈 DNS 서버 주소입니다. Wi-Fi의 “DNS 구성”에 붙여 넣는 방식이 아닙니다.',
      },
      {
        title: '설정에서 다운로드한 프로필을 열어요',
        body: '설정 앱으로 이동해 “프로필이 다운로드됨”을 누르세요. 보이지 않으면 설정 → 일반 → VPN 및 기기 관리에서 다운로드한 프로필을 찾으세요.',
        note: '다운로드한 뒤 8분 안에 설치하지 않으면 다시 다운로드해야 합니다. 설치를 막는 메시지가 나오면 Apple의 공식 설치 안내를 확인하세요.',
      },
      {
        title: '내용을 확인하고 설치해요',
        body: `이름이 “howToSafeDNS”로 시작하고, 선택한 제공자와 ${name}이 맞는지 확인하세요. “추가 세부사항”에서 DNS 서버 주소도 확인한 뒤 설치를 누르고 기기 암호 등 화면의 안내를 따르세요. 서명되지 않은 프로필이라는 경고가 표시될 수 있습니다.`,
        note: '이 프로젝트의 파일은 DNS 설정만 담습니다. 인증서 신뢰나 조직의 기기 관리 등록을 요구하는 다른 파일이라면 설치하지 마세요.',
      },
      {
        title: '프로필과 실제 연결을 확인해요',
        body: '설정 → 일반 → VPN 및 기기 관리에서 howToSafeDNS 프로필이 설치된 것을 확인하세요. DNS 선택 메뉴가 표시되면 방금 설치한 항목이 선택되어 있는지도 확인합니다. Safari에서 새로운 웹페이지를 열어 연결을 확인하세요.',
        note: 'Wi-Fi에서 확인한 뒤 모바일 데이터에서도 확인하세요. 화면에 프로필이 있다는 사실과 DNS가 실제로 암호화되어 나간다는 사실은 서로 다릅니다.',
      },
    ],
    verify: [
      '설치한 프로필의 제공자와 프로토콜이 선택한 값과 일치하는지 확인하세요.',
      '브라우저의 자체 DNS나 VPN을 함께 쓰면 해당 경로는 따로 확인해야 합니다. 웹페이지가 열린다는 것만으로 암호화를 증명할 수는 없습니다.',
      '설치 후 연결이 안 되면 프로필을 제거해 복구하세요. DoT의 853 연결이 차단된 환경에서는 DoH 방법을 시도할 수 있습니다.',
    ],
    undo: '설정 → 일반 → VPN 및 기기 관리 → howToSafeDNS 프로필 → 프로필 제거를 누르고 기기 암호를 입력하세요. 이 프로필의 DNS 설정이 해제됩니다. 다른 제공자나 DoH / DoT로 바꾸려면 기존 프로필을 제거한 뒤 새 파일을 설치하세요.',
    notes: [
      '이 방법은 iPadOS 14 이상에서도 사용할 수 있습니다. 메뉴 이름은 OS 버전에 따라 조금 다릅니다.',
      'Wi-Fi의 “DNS 구성 → 수동”에서 IP 주소만 바꾸는 것은 DoH / DoT 설정이 아닙니다.',
      '공용 DNS가 회사 내부 도메인을 찾지 못하면 이 프로필을 제거하고 기존 DNS를 사용하세요.',
      ...profileNotes,
    ],
    sources: iosSources,
  };
}

function macMode(protocol) {
  const isDoh = protocol === 'doh';
  const name = isDoh ? 'DoH' : 'DoT';
  return {
    id: protocol,
    label: isDoh ? 'DoH 프로필' : 'DoT 프로필',
    summary: isDoh
      ? 'macOS의 기본 암호화 DNS 기능을 프로필로 설정합니다. 별도 DNS 앱이나 터미널 명령 없이 설치할 수 있습니다.'
      : 'DNS over TLS 프로필을 설치합니다. TCP 853 연결이 허용되는 네트워크에서 사용할 수 있는 대안입니다.',
    badge: isDoh ? '추천 · macOS 11+' : '대안 · macOS 11+',
    time: '약 3분',
    steps: [
      {
        title: 'macOS 버전을 확인해요',
        body: 'Apple 메뉴 → 이 Mac에 관하여에서 macOS 11 Big Sur 이상인지 확인하세요. 이전에 설치한 howToSafeDNS 프로필이 있다면 아래 “원래대로 돌리기” 방법으로 먼저 제거합니다.',
      },
      {
        title: `선택한 제공자의 ${name} 프로필을 받아요`,
        body: '다운로드 버튼을 누른 뒤 Finder의 다운로드 폴더에서 .mobileconfig 파일을 두 번 클릭하세요. 텍스트 편집기로 열면 XML 원문을 살펴볼 수도 있습니다. 파일을 여는 것만으로 설정이 적용되지는 않습니다.',
        download: protocol,
        codeType: isDoh ? 'doh' : 'hostname',
        note: '위 주소가 프로필에 들어갑니다. 네트워크 설정의 DNS 목록에 IP 주소만 입력하는 방법과는 다릅니다.',
      },
      {
        title: '다운로드한 프로필을 찾아요',
        body: '최근 macOS에서는 Apple 메뉴 → 시스템 설정 → 일반 → 기기 관리로 이동하고 “다운로드”에 있는 howToSafeDNS 프로필을 두 번 클릭하세요.',
        note: 'macOS 13 / 14에서는 시스템 설정 → 개인정보 보호 및 보안 → 프로파일, macOS 11 / 12에서는 시스템 환경설정 → 프로파일을 확인하세요. 찾기 어려우면 설정 검색에서 “프로파일” 또는 “기기 관리”를 검색하세요.',
      },
      {
        title: '내용을 확인하고 설치해요',
        body: `프로필 이름에 선택한 제공자와 ${name}이 표시되는지 확인하세요. 세부사항에서 DNS 설정과 서버 주소를 확인한 뒤 계속 → 설치를 누르고 관리자 인증 등 화면의 안내를 따르세요. 서명되지 않은 프로필이라는 경고가 표시될 수 있습니다.`,
        note: '제공되는 파일에는 DNS 설정 하나만 있습니다. 인증서, VPN, 기기 관리 등록을 요구하는 다른 파일이라면 설치하지 마세요.',
      },
      {
        title: '설정과 인터넷 연결을 확인해요',
        body: '같은 프로필 메뉴에서 howToSafeDNS가 설치된 것을 확인하세요. Safari와 평소 쓰는 앱에서 새로운 웹페이지를 열어 보세요. Wi-Fi와 유선 연결을 모두 사용한다면 각각 확인합니다.',
        note: 'VPN이나 브라우저 자체 DNS는 시스템 프로필과 다른 경로를 사용할 수 있습니다. 연결 성공만으로 모든 DNS의 암호화를 확정하지 마세요.',
      },
    ],
    verify: [
      '설치된 howToSafeDNS 프로필을 열어 제공자와 DoH / DoT가 선택한 값과 같은지 확인하세요.',
      'Safari와 다른 앱을 각각 확인하세요. Chrome / Firefox의 자체 보안 DNS와 VPN DNS 설정은 별도로 적용될 수 있습니다.',
      '연결 장애가 생기면 프로필을 제거하세요. DoT가 차단된 환경에서는 DoH 방법을 시도할 수 있습니다.',
    ],
    undo: '시스템 설정 → 일반 → 기기 관리에서 howToSafeDNS 프로필을 선택하고 제거(−) 버튼을 누르세요. 이전 macOS는 설치할 때 사용한 프로파일 메뉴에서 제거합니다. 인증 요청을 완료하면 이 프로필의 DNS 설정이 해제됩니다.',
    notes: [
      '네트워크 → DNS에서 1.1.1.1 또는 8.8.8.8만 추가하면 DNS 제공자만 바뀝니다. 암호화에는 이 DNSSettings 프로필처럼 프로토콜을 지정하는 설정이 필요합니다.',
      '일반적인 dig 명령은 macOS의 기본 DNS 처리 경로를 사용하지 않으므로 이 프로필의 작동을 검증하는 방법으로 적합하지 않습니다.',
      '회사 내부 도메인이 열리지 않으면 프로필을 제거하고 기존 네트워크 설정을 사용하세요.',
      ...profileNotes,
    ],
    sources: macSources,
  };
}

export const appleGuides = {
  ios: {
    label: 'iOS / iPadOS',
    subtitle: 'iPhone과 iPad의 기본 암호화 DNS',
    time: '약 3분',
    badge: 'iOS / iPadOS 14 이상',
    intro: 'DNS 프로필을 받아 설정 앱에서 직접 승인합니다. Wi-Fi뿐 아니라 모바일 데이터에도 적용되는 기본 DNS 설정이며, 다른 DNS를 쓰는 VPN·앱에는 예외가 있을 수 있습니다.',
    modes: [iosMode('doh'), iosMode('dot')],
  },
  macos: {
    label: 'macOS',
    subtitle: 'Mac의 기본 암호화 DNS',
    time: '약 3분',
    badge: 'macOS 11 Big Sur 이상',
    intro: 'DNS 설정 하나를 담은 프로필로 Apple의 기본 DoH / DoT 기능을 사용합니다. 파일을 받고 시스템 설정에서 설치를 승인하면 됩니다.',
    modes: [macMode('doh'), macMode('dot')],
  },
};
