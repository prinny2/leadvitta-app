# ============================================================
# LEAD BELLUS - FULL ADS + GA4 AUTOMATION (ONE CLICK)
# ============================================================
# This script does EVERYTHING:
# 1. Regenerates the Google Ads Editor pack (keywords, ads, negatives, assets, GA4)
# 2. Copies the pack to Desktop with timestamp for safety
# 3. Creates ready-to-use import instructions
# 4. Opens the pack folder
# 5. Opens the live production site (leadbellus.com.br)
# 6. Prints exact next steps to launch the campaign
#
# Run this anytime you want to refresh the campaign.
# ============================================================

param(
    [switch]$NoBrowser
)
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $repoRoot


Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  LEAD BELLUS ADS + GA4 AUTOMATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Regenerate pack
Write-Host "[1/6] Regenerating Ads + GA4 pack..." -ForegroundColor Yellow
npm run ads:generate
if ($LASTEXITCODE -ne 0) {
    Write-Error "Pack generation failed. Fix errors and re-run."
    exit 1
}
Write-Host "    Pack generated successfully." -ForegroundColor Green

$source = Join-Path "ads" "google_ads_editor"
if (-not (Test-Path $source)) {
    Write-Error "Source pack not found at $source"
    exit 1
}

# 2. Copy to Desktop (timestamped)
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss-fff"
$dest = Join-Path ([Environment]::GetFolderPath("Desktop")) "LeadBellus_Campaign_$timestamp"
$destBase = $dest
$suffix = 1
while (Test-Path $dest) {
    $dest = "${destBase}_$suffix"
    $suffix++
}
Write-Host "[2/6] Copying fresh pack to Desktop..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $dest | Out-Null
Copy-Item -Path (Join-Path $source "*") -Destination $dest -Recurse -Force
Write-Host "    Copied to: $dest" -ForegroundColor Green

# 3. Create master instructions file
Write-Host "[3/6] Creating launch instructions..." -ForegroundColor Yellow
$instructions = @"
================================================================================
LEAD BELLUS - GOOGLE ADS CAMPAIGN LAUNCH (AUTOMATED)
Generated: $(Get-Date)
Production URL: https://leadbellus.com.br
================================================================================

STEP 1: IMPORT TO GOOGLE ADS EDITOR
-----------------------------------
1. Open Google Ads Editor (desktop app)
2. Click "Get recent changes" (top button)
3. Go to: Account > Import > From file...
4. Import files IN THIS EXACT ORDER (all will be Paused by default):
   - 01_search_keywords.csv
   - 02_responsive_search_ads.csv
   - 03_negative_keywords.csv
   - 04_assets_manual.csv
5. Review everything. Post changes ONLY as PAUSED first.
6. Close Editor when done.

STEP 2: GA4 CONVERSIONS (IMPORTANT!)
------------------------------------
After import:
- Open 07_ga4_conversions.md
- Follow steps to link GA4 property G-223KR63TS8
- Import conversions: sign_up, begin_checkout, purchase, generate
- Set "purchase" as primary conversion for bidding.

STEP 3: LAUNCH (AFTER REVIEW)
-----------------------------
- In Google Ads web UI:
  - Enable the campaign
  - Set budget
  - Monitor for first 48h
- Use the automation rules in 06_automation_rules.md

GUARDRAILS (DO NOT REMOVE)
--------------------------
- Campaign starts Paused
- Search only (no Display, no remarketing yet)
- No fake claims, no "7 dias gratis", no guaranteed results
- Final URLs use leadbellus.com.br

FILES IN THIS FOLDER
--------------------
01_search_keywords.csv     - Main import (campaign + keywords)
02_responsive_search_ads.csv - Ads
03_negative_keywords.csv   - Negatives
04_assets_manual.csv       - Sitelinks + callouts
05_launch_checklist.md     - Pre/post checks
06_automation_rules.md     - Rules to create in Google Ads
07_ga4_conversions.md      - GA4 setup
README.md                  - Full docs

NEXT TIME
---------
Just run: .\scripts\full-ads-automation.ps1
It will regenerate everything fresh.

Support: Check ADS_COMMAND_CENTER.md for overall strategy.
"@

$instructions | Out-File -FilePath (Join-Path $dest "00_LAUNCH_CAMPAIGN_NOW.txt") -Encoding UTF8


# 4. Open folder
Write-Host "[4/6] Opening pack folder..." -ForegroundColor Yellow
Invoke-Item -LiteralPath $dest

# 5. Open live site
if (-not $NoBrowser) {
    Write-Host "[5/6] Opening live site (leadbellus.com.br)..." -ForegroundColor Yellow
    Start-Process "https://leadbellus.com.br"
}

# 6. Final message
Write-Host "[6/6] AUTOMATION COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Pack location: $dest" -ForegroundColor Cyan
Write-Host "Main file: 00_LAUNCH_CAMPAIGN_NOW.txt" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Open the folder that just appeared."
Write-Host "2. Read 00_LAUNCH_CAMPAIGN_NOW.txt"
Write-Host "3. Import the 4 CSV files into Google Ads Editor (Paused)."
Write-Host "4. Follow GA4 steps in 07_ga4_conversions.md"
Write-Host "5. Review and go live (carefully)."
Write-Host ""
Write-Host "Everything is ready. Domain is leadbellus.com.br" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

# Optional: show files
Get-ChildItem $dest -Name | Sort-Object
