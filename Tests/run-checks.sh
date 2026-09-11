#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
check_dir="$(mktemp -d)"
trap 'rm -rf "$check_dir"' EXIT
xcrun swiftc -parse-as-library -module-cache-path "$check_dir/cache" Wortklar/Models/*.swift Wortklar/Services/*.swift Tests/ModelChecks.swift -o "$check_dir/checks"
"$check_dir/checks"
xcrun swiftc -parse-as-library -module-cache-path "$check_dir/cache" Wortklar/Models/*.swift Wortklar/Services/*.swift Wortklar/Views/*.swift Tests/KeyboardChecks.swift -o "$check_dir/keyboard-checks"
"$check_dir/keyboard-checks"
