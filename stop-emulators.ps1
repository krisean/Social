# Stop Firebase Emulators
# This script finds and kills all running Firebase emulator processes

Write-Host "Looking for running Firebase emulators..." -ForegroundColor Cyan

# Find Firebase emulator processes by checking for processes listening on Firebase emulator ports
$firebasePorts = @(4000, 4001, 4400, 4401, 4500, 4501, 5001, 8080, 9099, 9000)
$firebaseProcesses = @()

foreach ($port in $firebasePorts) {
    $connections = netstat -ano 2>$null | Select-String ":$port" | ForEach-Object {
        if ($_ -match '\s+(\d+)$') {
            $matches[1]
        }
    }
    foreach ($processId in $connections) {
        try {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process -and $process.Name -eq "node") {
                $firebaseProcesses += $process
            }
        } catch {
            # Process might not exist anymore
        }
    }
}

# Remove duplicates
$firebaseProcesses = $firebaseProcesses | Select-Object -Unique

if ($firebaseProcesses.Count -eq 0) {
    Write-Host "No Firebase emulator processes found running." -ForegroundColor Green
    exit 0
}

Write-Host "Found $($firebaseProcesses.Count) Firebase emulator process(es):" -ForegroundColor Yellow
$firebaseProcesses | ForEach-Object {
    Write-Host "  - $($_.Name) (PID: $($_.Id))" -ForegroundColor Gray
}

# Stop the processes
Write-Host "Stopping Firebase emulators..." -ForegroundColor Red
$firebaseProcesses | Stop-Process -Force

# Verify they're stopped
Start-Sleep -Seconds 2
$stillRunning = $false
foreach ($port in $firebasePorts) {
    $connections = netstat -ano 2>$null | Select-String ":$port"
    if ($connections) {
        $stillRunning = $true
        break
    }
}

if (-not $stillRunning) {
    Write-Host "All Firebase emulators stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "Some Firebase emulator processes may still be running." -ForegroundColor Yellow
}
