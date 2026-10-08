# One-time setup for Windows. Run from the project root in PowerShell: .\setup.ps1
# Use .\setup.ps1 --reset-db to re-enter the Neon connection string.
$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

# --- Check prerequisites ---
py -3.14 --version *> $null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Python 3.14 not found. Install from https://www.python.org/downloads/" -ForegroundColor Red
  exit 1
}
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js / npm not found. Install Node 20+ from https://nodejs.org" -ForegroundColor Red
  exit 1
}

# --- Backend ---
Write-Host "Setting up backend with Python 3.14..."
Set-Location "$Root\backend"
foreach ($d in @("venv", ".venv")) { if (Test-Path $d) { Remove-Item -Recurse -Force $d } }
py -3.14 -m venv venv
.\venv\Scripts\python.exe -m pip install --upgrade pip -q
.\venv\Scripts\python.exe -m pip install -r requirements.txt

# --- Database config (Neon) ---
function Test-DbConfigured {
  (Test-Path .env) -and (Select-String -Path .env -Pattern '^DATABASE_URL=postgres' -Quiet) -and -not (Select-String -Path .env -Pattern 'USER:PASSWORD' -Quiet)
}

if ($args -contains "--reset-db" -or -not (Test-DbConfigured)) {
  Write-Host "`nNeon database connection needed." -ForegroundColor Yellow
  Write-Host "Get the connection string from the team chat (starts with postgresql://)."
  while ($true) {
    $DbUrl = Read-Host "Paste DATABASE_URL (or press Enter to skip for now)"
    if ([string]::IsNullOrWhiteSpace($DbUrl)) {
      if (-not (Test-Path .env)) { Copy-Item .env.example .env }
      Write-Host "Skipped. Re-run .\setup.ps1 when you have it." -ForegroundColor Yellow
      break
    } elseif ($DbUrl.StartsWith("postgres")) {
      $DbPooled = Read-Host "Paste DATABASE_URL_POOLED (optional, Enter to skip)"
      # Write without a BOM so python-dotenv reads the first key correctly
      [IO.File]::WriteAllLines("$Root\backend\.env", @("DATABASE_URL=$DbUrl", "DATABASE_URL_POOLED=$DbPooled"), (New-Object System.Text.UTF8Encoding $false))
      Write-Host "Saved to backend\.env"
      break
    } else {
      Write-Host "That doesn't look like a Postgres URL. It should start with postgresql://" -ForegroundColor Red
    }
  }
}

if (Test-DbConfigured) {
  Write-Host "Creating database tables (safe to re-run)..."
  .\venv\Scripts\python.exe init_db.py
}

# --- Frontend ---
Write-Host "Setting up frontend..."
Set-Location "$Root\frontend"
npm install

Set-Location $Root
Write-Host "`nSetup complete. Start everything with: .\dev.ps1" -ForegroundColor Green
