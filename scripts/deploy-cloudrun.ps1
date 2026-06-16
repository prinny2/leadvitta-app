# Deploy LeadBellus no Cloud Run (build + push + deploy).
# Uso (na raiz do repo):
#   pwsh -File scripts/deploy-cloudrun.ps1
#
# NEXT_PUBLIC_* são públicos (build-time). Valores espelham o Cloud Run em produção.
# Segredos (OpenAI, Stripe, Firebase SA, Z-API) NÃO entram aqui — já estão no serviço.

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

$shortSha = (git rev-parse --short HEAD).Trim()
if (-not $shortSha) { throw "git rev-parse falhou — rode na raiz do repo." }

$subs = @(
  "_NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBMlo174XZFQUdvPE1JBJJLt4R6DUk2hls"
  "_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=leadvitta-app.firebaseapp.com"
  "_NEXT_PUBLIC_FIREBASE_PROJECT_ID=leadvitta-app"
  "_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=leadvitta-app.firebasestorage.app"
  "_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=87102725202"
  "_NEXT_PUBLIC_FIREBASE_APP_ID=1:87102725202:web:e48089af9c157b31b5d38b"
  "_NEXT_PUBLIC_SITE_URL=https://leadbellus.com.br"
  "_NEXT_PUBLIC_META_PIXEL_ID="
  "_NEXT_PUBLIC_GA4_ID="
) -join ","

Write-Host "Deploy Cloud Run — SHORT_SHA=$shortSha"
gcloud builds submit --config cloudbuild.yaml --substitutions=$subs