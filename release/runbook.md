Production Runbook
=- Bootstrap and dependencies
- Install dependencies: npm install or yarn install
- Run unit tests: npm test
- Run Detox end-to-end tests: see e2e/ directory; requires native setup (macOS for iOS or Android emulator)

=- Build & release
- Ensure EAS CLI is installed and authenticated: npm i -g eas-cli; eas login
- Build Android: eas build -p android --profile production
- Build iOS: eas build -p ios --profile production
- After builds, distribute as per your distribution channel (Play Console / App Store).

=- Data backup/restore
- Use src/data/export-import.ts exportData() to get a JSON payload; importData(json) to restore.

=- Post-release
- Monitor crash logs and analytics; run a smoke test on a QA device.
