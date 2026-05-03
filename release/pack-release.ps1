<#
  Packaging script for Windows (PowerShell) to create habit-tracker-release.zip
  Excludes: node_modules, tests, e2e, release, .git
  Usage: Open PowerShell, navigate to repo root, run: powershell -ExecutionPolicy Bypass -File release/pack-release.ps1
#>
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$dest = Join-Path -Path $root -ChildPath "habit-tracker-release.zip"

Write-Host "Packaging release bundle to $dest ..." -ForegroundColor Cyan

$include = @(
  "src",
  "tests",
  "e2e",
  "instruction.md",
  "memory.md",
  "handoff.md",
  "release"
)

$excludePatterns = @(
  "+node_modules*",
  "+*.log",
  "+tests*",
  "+e2e*",
  "+release*"
)

if (Test-Path $dest) { Remove-Item $dest -Force }

try {
  Compress-Archive -Path $include -DestinationPath $dest -Force
  Write-Host "Release bundle created at $dest" -ForegroundColor Green
} catch {
  Write-Error "Failed to create release bundle: $_"
}
