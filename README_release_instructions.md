# Release Archive Instructions
This repository now includes a Windows-friendly packaging script release/pack-release.ps1.
To generate a self-contained release bundle (habit-tracker-release.zip) on Windows:
- Open PowerShell with appropriate permissions
- Navigate to the repo root
- Run: powershell -ExecutionPolicy Bypass -File release/pack-release.ps1
- The archive will be created at: <repo-root>/habit-tracker-release.zip
- The archive contains the source, handoff docs, and release scripts for distribution.

## EAS Android APK workflow
The repository also includes a GitHub Actions workflow at `.github/workflows/eas-android-build.yml` that runs an EAS local Android build and uploads the APK as a workflow artifact.

Required GitHub repository secrets:
- `EXPO_TOKEN`
- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

To create `KEYSTORE_BASE64` from a keystore file:
```bash
base64 habit.keystore > keystore.txt
```

Workflow behavior:
- Decodes the keystore into `android/app/habit.keystore`
- Exports signing credentials for the build
- Runs `eas build -p android --profile production --non-interactive --local --json`
- Uploads the generated APK from the local EAS artifacts directory as the `habit-tracker-apk` artifact

After pushing to `main`, open GitHub Actions and run the `EAS Android Build` workflow to produce the APK download.
