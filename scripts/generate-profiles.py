#!/usr/bin/env python3
"""Generate auditable Apple DNS profiles from the website's provider map.

Run from the repository root:
  node --input-type=module -e 'import {providers} from "./assets/providers.js";
    console.log(JSON.stringify(providers))' | python3 scripts/generate-profiles.py

Add --check to verify committed profiles without changing files. The input is a
JSON object keyed by provider slug. Each value has provider, doh, optional dot,
and optional ipv4/ipv4alt/ipv6/ipv6alt fields. Provider descriptions and policies
use the website's existing locale dictionaries. Korean files retain their root
paths; English, Russian, French, Simplified Chinese, and Japanese files are
generated in matching language subdirectories.
"""

import argparse
import ipaddress
import json
import os
from pathlib import Path
import plistlib
import re
import sys
import tempfile
from urllib.parse import urlsplit
import uuid


PROFILE_DIRECTORY = Path(__file__).resolve().parent.parent / "profiles"
LOCALE_DIRECTORY = PROFILE_DIRECTORY.parent / "locales"
LANGUAGES = ("ko", "en", "ru", "fr", "zh-CN", "ja")
SITE_URL = "https://studyreadbook4ever.github.io/howToSafeDNS/"
PROFILE_IDENTIFIER = "io.github.studyreadbook4ever.howToSafeDNS"
IP_FIELDS = (("ipv4", 4), ("ipv4alt", 4), ("ipv6", 6), ("ipv6alt", 6))
SLUG_PATTERN = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
HOSTNAME_PATTERN = re.compile(
    r"(?=.{1,253}\Z)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\Z"
)
PROFILE_CONTENT_NOTE = (
    "이 파일에는 DNS 설정 하나만 들어 있습니다. 루트 인증서, VPN, 기기 관리 등록, "
    "앱 설치 항목은 없습니다. GitHub에서 XML 원문을 확인할 수 있습니다."
)
PROFILE_UNSIGNED_NOTE = (
    "프로필은 서명되지 않았습니다. “서명되지 않음”은 배포자 서명이 없다는 뜻이며, "
    "DNS 연결의 TLS 암호화와는 별개입니다. 설치 화면의 이름과 DNS 주소를 확인한 뒤 결정하세요."
)


def locale_dictionaries():
    dictionaries = {"ko": {}}
    for language in LANGUAGES[1:]:
        dictionary = json.loads((LOCALE_DIRECTORY / f"{language}.json").read_text(encoding="utf-8"))
        if not isinstance(dictionary, dict):
            raise ValueError(f"{language}: locale must be a JSON object")
        dictionaries[language] = dictionary
    return dictionaries


def translate(source, language, dictionaries):
    if language == "ko":
        return source
    translated = dictionaries[language].get(source)
    if not isinstance(translated, str) or not translated.strip():
        raise ValueError(f"{language}: missing translation for {source!r}")
    return translated


def string_field(provider, key, *, required=False):
    value = provider.get(key)
    if value is None and not required:
        return ""
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{key} must be a nonempty string")
    return value.strip()


def server_addresses(provider):
    addresses = []
    for field, family in IP_FIELDS:
        value = provider.get(field)
        if value is None or value == "":
            continue
        values = value if isinstance(value, list) else [value]
        for address in values:
            if not isinstance(address, str):
                raise ValueError(f"{field} addresses must be strings")
            parsed = ipaddress.ip_address(address)
            if parsed.version != family:
                raise ValueError(f"{field} must contain IPv{family} addresses")
            if parsed.is_unspecified or parsed.is_loopback or parsed.is_multicast:
                raise ValueError(f"{field} must identify a unicast DNS server")
            if address not in addresses:
                addresses.append(address)
    return addresses


def validate_endpoints(provider):
    doh = string_field(provider, "doh", required=True)
    parsed = urlsplit(doh)
    if (
        parsed.scheme != "https"
        or not parsed.hostname
        or parsed.username
        or parsed.password
        or parsed.fragment
        or not parsed.path
        or any(character.isspace() for character in doh)
    ):
        raise ValueError("doh must be an HTTPS DNS endpoint without credentials or a fragment")
    # Accessing port also validates that a supplied port has a valid format.
    parsed.port
    dot = string_field(provider, "dot")
    if dot and not HOSTNAME_PATTERN.fullmatch(dot):
        raise ValueError("dot must be a TLS certificate hostname without a scheme, path, or port")
    return doh, dot


def profile_bytes(slug, provider, protocol, endpoint, addresses, language, dictionaries):
    variant = f"{slug}-{protocol}"
    name = string_field(provider, "provider", required=True)
    protocol_name = "DoH" if protocol == "doh" else "DoT"
    display_name = f"howToSafeDNS · {name} · {protocol_name}"
    filename = f"{variant}.mobileconfig"
    relative_path = filename if language == "ko" else f"{language}/{filename}"
    profile_url = f"{SITE_URL}profiles/{relative_path}"
    dns = {"DNSProtocol": "HTTPS" if protocol == "doh" else "TLS"}
    if addresses:
        dns["ServerAddresses"] = addresses
    dns["ServerURL" if protocol == "doh" else "ServerName"] = endpoint

    details = [
        translate(PROFILE_CONTENT_NOTE, language, dictionaries),
        translate(PROFILE_UNSIGNED_NOTE, language, dictionaries),
    ]
    for field in ("description", "filter", "policy"):
        source = string_field(provider, field)
        if source:
            details.append(translate(source, language, dictionaries))
    privacy = string_field(provider, "privacy")
    if privacy:
        details.append(f"{translate('개인정보 정책', language, dictionaries)}: {privacy}")
    description = "\n\n".join(details)
    payload = {
        "PayloadType": "com.apple.dnsSettings.managed",
        "PayloadVersion": 1,
        "PayloadIdentifier": f"{PROFILE_IDENTIFIER}.dns",
        "PayloadUUID": str(uuid.uuid5(uuid.NAMESPACE_URL, f"{profile_url}#dns")).upper(),
        "PayloadDisplayName": display_name,
        "DNSSettings": dns,
    }
    profile = {
        "PayloadType": "Configuration",
        "PayloadVersion": 1,
        # All variants represent the same setting and replace the previous one.
        "PayloadIdentifier": PROFILE_IDENTIFIER,
        "PayloadUUID": str(uuid.uuid5(uuid.NAMESPACE_URL, profile_url)).upper(),
        "PayloadDisplayName": display_name,
        "PayloadDescription": description,
        "PayloadScope": "System",
        "PayloadContent": [payload],
    }
    return plistlib.dumps(profile, fmt=plistlib.FMT_XML, sort_keys=False)


def generate(provider_map, dictionaries=None):
    if not isinstance(provider_map, dict) or not provider_map:
        raise ValueError("stdin must be a nonempty JSON provider map")
    if dictionaries is None:
        dictionaries = locale_dictionaries()
    generated = {}
    for slug, provider in provider_map.items():
        if not isinstance(slug, str) or not SLUG_PATTERN.fullmatch(slug):
            raise ValueError(f"invalid provider slug: {slug!r}")
        if not isinstance(provider, dict):
            raise ValueError(f"{slug}: provider must be an object")
        try:
            string_field(provider, "provider", required=True)
            doh, dot = validate_endpoints(provider)
            addresses = server_addresses(provider)
            for protocol, endpoint in (("doh", doh), ("dot", dot)):
                if endpoint:
                    filename = f"{slug}-{protocol}.mobileconfig"
                    for language in LANGUAGES:
                        relative_path = filename if language == "ko" else f"{language}/{filename}"
                        generated[relative_path] = profile_bytes(
                            slug, provider, protocol, endpoint, addresses, language, dictionaries
                        )
        except (TypeError, ValueError) as error:
            raise ValueError(f"{slug}: {error}") from error
    return generated


def write_generated(generated):
    """Stage all output first; restore replaced files if a commit write fails."""
    PROFILE_DIRECTORY.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".profile-generation-", dir=PROFILE_DIRECTORY) as temporary:
        staged = Path(temporary)
        originals = {}
        for relative_path, contents in generated.items():
            stage_path = staged / "new" / relative_path
            stage_path.parent.mkdir(parents=True, exist_ok=True)
            stage_path.write_bytes(contents)
            target = PROFILE_DIRECTORY / relative_path
            originals[relative_path] = target.read_bytes() if target.is_file() else None
        committed = []
        try:
            for relative_path in generated:
                target = PROFILE_DIRECTORY / relative_path
                target.parent.mkdir(parents=True, exist_ok=True)
                os.replace(staged / "new" / relative_path, target)
                committed.append(relative_path)
        except OSError:
            for relative_path in reversed(committed):
                target = PROFILE_DIRECTORY / relative_path
                previous = originals[relative_path]
                if previous is None:
                    target.unlink()
                else:
                    backup = staged / "restore" / relative_path
                    backup.parent.mkdir(parents=True, exist_ok=True)
                    backup.write_bytes(previous)
                    os.replace(backup, target)
            raise


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="compare files without writing")
    args = parser.parse_args()
    try:
        # Validate all providers and all language descriptions before any write.
        generated = generate(json.load(sys.stdin))
    except (json.JSONDecodeError, OSError, TypeError, ValueError) as error:
        print(f"Profile generation failed: {error}", file=sys.stderr)
        return 1

    if args.check:
        mismatches = [
            filename
            for filename, expected in generated.items()
            if not (PROFILE_DIRECTORY / filename).is_file()
            or (PROFILE_DIRECTORY / filename).read_bytes() != expected
        ]
        if mismatches:
            print("Missing or outdated profiles: " + ", ".join(mismatches), file=sys.stderr)
            return 1
        print(f"Verified {len(generated)} reproducible profiles.")
        return 0

    try:
        write_generated(generated)
    except OSError as error:
        print(f"Profile output failed: {error}", file=sys.stderr)
        return 1
    # Deliberately do not remove files that aren't named by this provider map.
    print(f"Generated {len(generated)} profiles.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
