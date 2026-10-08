# Starts backend (FastAPI :2626) in a new window and frontend (Vite :5173) here.
$Root = $PSScriptRoot

if (-not (Test-Path "$Root\backend\venv\Scripts\python.exe") -or -not (Test-Path "$Root\frontend\node_modules")) {
  Write-Host "Looks like setup hasn't been run yet. Run .\setup.ps1 first." -ForegroundColor Yellow
  exit 1
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; .\venv\Scripts\python.exe run.py"
Set-Location "$Root\frontend"
npm run dev
