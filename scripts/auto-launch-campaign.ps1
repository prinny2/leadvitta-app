# LeadBellus - FULL CAMPAIGN AUTOMATION (as much as possible)
# This script:
# - Regenerates the Ads + GA4 pack
# - Copies to Desktop
# - Launches Google Ads Editor (if found)
# - Opens the pack folder
# - Opens the live site
# - Prepares everything for import
# Note: Full GUI automation of Google Ads Editor import is not possible without additional tools or the app's API.
# The script does the max possible from command line.

param()

$ErrorActionPreference = "Stop"

Write-Host "=== LEAD BELLUS ADS + GA4 CAMPAIGN AUTOMATION ===" -ForegroundColor Green

# 1. Regenerate pack
Write-Host "`n[1/7] Regenerating the pack..." -ForegroundColor Yellow
npm run ads:generate
if ($LASTEXITCODE -ne 0) { throw "Generation failed" }
Write-Host "Pack regenerated." -ForegroundColor Green

$source = "ads\google_ads_editor"
$dest = "$env:USERPROFILE\Desktop\LeadBellus_Ads_Pack_Latest"

# 2. Prepare clean folder
Write-Host "`n[2/7] Preparing pack on Desktop..." -ForegroundColor Yellow
if (-not (Test-Path $source)) {
    Write-Error "Source pack folder '$source' not found. Make sure 'ads\google_ads_editor' exists and the pack regeneration step completed successfully."
    exit 1
}
if (Test-Path $dest) { Remove-Item $dest -Recurse -Force }
New-Item -ItemType Directory -Path $dest | Out-Null
Copy-Item "$source\*" $dest -Recurse -Force
Write-Host "Pack ready at $dest" -ForegroundColor Green

# 3. Create a ready-to-import "batch" note
$batchNote = @"
LEAD BELLUS CAMPAIGN - READY FOR GOOGLE ADS EDITOR

Folder: $dest

IMMEDIATE STEPS (do these in Google Ads Editor):
1. Open Google Ads Editor
2. Click 'Get recent changes'
3. Import these files IN ORDER (Account > Import > From file):
   01_search_keywords.csv
   02_responsive_search_ads.csv
   03_negative_keywords.csv
   04_assets_manual.csv

All items are set to 'Paused' by default.
After importing, review and POST only as PAUSED.
Then go to Google Ads web to enable and set up GA4 conversions.

Domain: leadbellus.com.br (live)
"@
$batchNote | Out-File "$dest\READY_TO_IMPORT.txt" -Encoding UTF8

# 4. Find and launch Google Ads Editor
Write-Host "`n[3/7] Looking for Google Ads Editor..." -ForegroundColor Yellow
$editorExe = $null
$possiblePaths = @(
    "C:\Program Files (x86)\Google\Google Ads Editor\Google Ads Editor.exe",
    "C:\Program Files\Google\Google Ads Editor\Google Ads Editor.exe"
)
foreach ($p in $possiblePaths) {
    if (Test-Path $p) { $editorExe = $p; break }
}
if (-not $editorExe) {
    # Try to find it
    $found = Get-ChildItem "C:\Program Files*" -Recurse -Filter "*Google Ads Editor*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) { $editorExe = $found.FullName }
}

if ($editorExe) {
    Write-Host "Found at: $editorExe" -ForegroundColor Green
    Write-Host "[4/7] Launching Google Ads Editor..." -ForegroundColor Yellow
    Start-Process -FilePath $editorExe
} else {
    Write-Host "Google Ads Editor not found automatically. Please open it manually." -ForegroundColor Red
}

# 5. Open the pack folder
Write-Host "`n[5/7] Opening the pack folder..." -ForegroundColor Yellow
Start-Process $dest

# 6. Open the live site
Write-Host "`n[6/7] Opening the live production site..." -ForegroundColor Yellow
Start-Process "https://leadbellus.com.br"

# 7. Final instructions
Write-Host "`n[7/7] AUTOMATION COMPLETE!" -ForegroundColor Green
Write-Host "Pack ready at: $dest"
Write-Host "Open 'READY_TO_IMPORT.txt' inside the folder."
Write-Host "Google Ads Editor should be opening (if found)."
Write-Host "Import the 4 CSVs in order, keep Paused, then enable after review."
Write-Host "Domain: leadbellus.com.br (already live on prod)"
Write-Host "========================================" -ForegroundColor Cyan

# Show files
Get-ChildItem $dest -Name
