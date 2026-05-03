#!/usr/bin/env bash
set -euo pipefail

echo "[Release] Packaging release bundle..."

ROOT_DIR=$(pwd)
RELEASE_OUTPUT="habit-tracker-release.zip"

if command -v zip >/dev/null 2>&1; then
  echo "Using zip to create release bundle..."
  zip -r "$RELEASE_OUTPUT" . -x "node_modules/*" "tests/*" "e2e/*" "release/*" >/dev/null
  echo "Release bundle created at $ROOT_DIR/$RELEASE_OUTPUT"
else
  echo "zip not found. Falling back to tar.gz."
  tar -czf habit-tracker-release.tar.gz -C . . --exclude=node_modules --exclude=tests --exclude=e2e --exclude=release
  echo "Release archive created at $ROOT_DIR/habit-tracker-release.tar.gz"
fi
