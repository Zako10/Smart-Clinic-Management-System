$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root 'smartclinic-frontend'

Write-Host '== Smart Clinic verification =='
Write-Host ''

Write-Host '[1/5] Restoring backend test dependencies...'
dotnet restore (Join-Path $root 'SmartClinic.API.Tests\SmartClinic.API.Tests.csproj') -v:minimal

Write-Host '[2/5] Building and running API integration tests...'
$testProject = Join-Path $root 'SmartClinic.API.Tests\SmartClinic.API.Tests.csproj'
dotnet build $testProject --no-restore -m:1 -p:OutputPath=bin\TestVerify\
dotnet test $testProject --no-build --no-restore --verbosity minimal -p:OutputPath=bin\TestVerify\

Write-Host '[3/5] Installing frontend dependencies from lockfile...'
Push-Location $frontend
try {
  npm.cmd install

  Write-Host '[4/5] Building vanilla frontend...'
  npm.cmd run build

  Write-Host '[5/5] Checking frontend entrypoints are not using React...'
  $filesToCheck = @(
    'package.json',
    'vite.config.ts',
    'index.html',
    'src\main.js',
    'dist\index.html'
  )

  $matches = Select-String -Path $filesToCheck -Pattern 'react', 'React', 'main.tsx', 'tsx' -SimpleMatch -ErrorAction SilentlyContinue
  if ($matches) {
    $matches | Format-Table Path, LineNumber, Line -AutoSize
    throw 'React references were found in the active frontend files.'
  }
}
finally {
  Pop-Location
}

Write-Host ''
Write-Host 'All checks passed.'
