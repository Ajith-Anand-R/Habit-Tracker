#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(pwd)
RELEASE_FILE="habit-tracker-release.zip"

echo "[Release] Packaging final hand-off bundle..."

if command -v zip >/dev/null 2>&1; then
  echo "Using zip to create release bundle..."
  zip -r "$RELEASE_FILE" . -x "node_modules/*" \
    "tests/*" "e2e/*" "release/*" >/dev/null
else
  echo "zip not found. Falling back to tar.gz."
  tar -czf habit-tracker-release.tar.gz -C . . --exclude=node_modules --exclude=tests --exclude=e2e --exclude=release
  RELEASE_FILE="habit-tracker-release.tar.gz"
fi

echo "Release bundle created at ${ROOT_DIR}/${RELEASE_FILE}"
