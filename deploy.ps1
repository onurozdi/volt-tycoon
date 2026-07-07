# Volt Tycoon - GitHub Pages yayin betigi
# Kullanim: .\deploy.ps1  (oyunu derler, docs/ gunceller, GitHub'a yollar)
$ErrorActionPreference = "Stop"
$env:Path += ";$env:USERPROFILE\tools\node"
Set-Location $PSScriptRoot

Write-Host "Derleniyor..." -ForegroundColor Cyan
Set-Location ev-tycoon
npm run build
if (-not $?) { throw "Derleme basarisiz" }
Set-Location ..

Write-Host "docs/ guncelleniyor..." -ForegroundColor Cyan
Remove-Item -Recurse -Force docs -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force docs | Out-Null
Copy-Item -Recurse -Force ev-tycoon\dist\* docs\

git add docs
git commit -m "Pages guncellemesi: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push

Write-Host "Yayinda: https://onurozdi.github.io/volt-tycoon/ (1-2 dk icinde guncellenir)" -ForegroundColor Green
