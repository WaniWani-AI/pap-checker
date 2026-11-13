#!/usr/bin/env bash
# Packs extension/ into dist/pap-checker-<version>.zip for the Chrome Web Store.
set -euo pipefail
cd "$(dirname "$0")/.."
version=$(node -p "require('./extension/manifest.json').version")
mkdir -p dist
rm -f "dist/pap-checker-${version}.zip"
(cd extension && zip -qr "../dist/pap-checker-${version}.zip" . -x '.*')
echo "dist/pap-checker-${version}.zip"
