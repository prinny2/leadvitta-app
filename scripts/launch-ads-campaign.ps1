# LeadBellus Ads + GA4 Full Automation Launcher
# Run this to regenerate pack, copy to Desktop, open folder, and get import instructions.

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot


Write-Host "=== LEAD BELLUS ADS + GA4 AUTOMATION ===" -ForegroundColor Green
Write-Host "Regenerating pack..." -ForegroundColor Yellow
npm run ads:generate

if ($LASTEXITCODE -ne 0) {
    Write-Error "Pack generation failed."
    exit 1
}

$packDir = Join-Path "ads" "google_ads_editor"
$dest = Join-Path ([Environment]::GetFolderPath("Desktop")) "LeadBellus_Ads_Pack_Auto"

if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest | Out-Null
Copy-Item -Path (Join-Path $packDir "*") -Destination $dest -Recurse -Force

# Create auto-instructions file
$instructions = @"
LEAD BELLUS ADS CAMPAIGN - IMPORT TO GOOGLE ADS EDITOR (AUTOMATED PREP)

1. Open Google Ads Editor desktop app.
2. Click 'Get recent changes' at the top.
3. Account > Import > From file...
4. Import these files IN THIS ORDER (all will be Paused):
   - 01_search_keywords.csv   (sets up campaign + keywords)
   - 02_responsive_search_ads.csv
   - 03_negative_keywords.csv
   - 04_assets_manual.csv
5. Review everything. Post changes ONLY as Paused first.
6. After import, go to Google Ads web and run the GA4 setup from 07_ga4_conversions.md
7. Domain is leadbellus.com.br (already aliased to this prod deploy).

Pack generated for production: https://leadbellus.com.br
"@
$instructions | Out-File -FilePath (Join-Path $dest "AUTO_IMPORT_INSTRUCTIONS.txt") -Encoding UTF8

Invoke-Item -LiteralPath $dest

Write-Host "Automation done!" -ForegroundColor Green
Write-Host "Pack copied to: $dest" -ForegroundColor Cyan
Write-Host "Folder opened. Open AUTO_IMPORT_INSTRUCTIONS.txt and follow to import into Editor." -ForegroundColor White
Write-Host "Everything is automated except the final GUI import (Google limitation)." -ForegroundColor Yellow
