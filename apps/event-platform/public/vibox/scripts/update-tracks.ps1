# Script to update tracks.json with clean filenames

$audioDir = "..\audio"
$tracksJsonPath = "..\data\tracks.json"

Write-Host "Updating tracks.json with clean filenames..." -ForegroundColor Yellow

$audioFiles = Get-ChildItem $audioDir | Where-Object { 
    @('.mp3', '.wav', '.flac', '.aac') -contains [System.IO.Path]::GetExtension($_.Name).ToLower()
} | Select-Object -ExpandProperty Name | Sort-Object

$tracksJson = $audioFiles | ConvertTo-Json -Depth 10
$tracksJson | Out-File -FilePath $tracksJsonPath -Encoding UTF8

Write-Host "✅ Updated tracks.json with $($audioFiles.Count) files" -ForegroundColor Green
Write-Host "Files: $($audioFiles -join ', ')" -ForegroundColor Cyan
