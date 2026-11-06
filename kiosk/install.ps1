# One-command setup for the computer behind the board monitor (Windows 10/11).
# Opens the board full screen now and at every login. No admin rights needed.
#
#   irm https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.ps1 | iex
#
# To pass an option:
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.ps1))) -Uninstall
#
#   -Url <url>   Page to show (default: the live board)
#   -NoStart     Set up only, the board opens at the next login
#   -Uninstall   Undo everything this script set up

param(
  [string]$Url = "https://ais-lab.github.io/AIS-Dashboard/",
  [switch]$NoStart,
  [switch]$Uninstall
)

$ErrorActionPreference = "Stop"
$AppDir = Join-Path $env:LOCALAPPDATA "AISBoard"
$Launcher = Join-Path $AppDir "start-board.ps1"
$Shortcut = Join-Path ([Environment]::GetFolderPath("Startup")) "AIS Board.lnk"
$LaunchArgs = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$Launcher`""

$LauncherScript = @'
# Opens the board full screen. Written by kiosk/install.ps1.

$Url = (Get-Content -Raw (Join-Path $PSScriptRoot "board-url.txt")).Trim()

$Browser = @(
  "$env:ProgramFiles\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
  "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
  "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
  "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $Browser) { exit 1 }

# The network comes up after the desktop, and a page opened too early is stuck
# on an error screen. A lab proxy can block this check but not the browser, so
# open it anyway once the wait is over.
$Deadline = (Get-Date).AddSeconds(120)
while ((Get-Date) -lt $Deadline) {
  try {
    Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5 | Out-Null
    break
  } catch {
    Start-Sleep -Seconds 3
  }
}

# Keep the screen on for as long as this script runs. The number is
# ES_CONTINUOUS + ES_SYSTEM_REQUIRED + ES_DISPLAY_REQUIRED (0x80000003).
Add-Type -Namespace AISBoard -Name Power -MemberDefinition @"
[System.Runtime.InteropServices.DllImport("kernel32.dll")]
public static extern uint SetThreadExecutionState(uint flags);
"@
[AISBoard.Power]::SetThreadExecutionState([uint32]2147483651) | Out-Null

# Incognito/InPrivate: no "restore pages?" prompt after a power cut. The separate
# profile keeps this apart from any browser someone opens by hand.
$BrowserProfile = Join-Path $PSScriptRoot "browser-profile"
$Flags = "--kiosk `"$Url`" --edge-kiosk-type=fullscreen --incognito --inprivate " +
  "--no-first-run --noerrdialogs --disable-infobars " +
  "--disable-session-crashed-bubble `"--user-data-dir=$BrowserProfile`""

# Quitting on purpose exits 0 and stays closed. A crash comes back by itself.
while ($true) {
  $Run = Start-Process -FilePath $Browser -ArgumentList $Flags -PassThru -Wait
  if ($Run.ExitCode -eq 0) { break }
  Start-Sleep -Seconds 5
}
'@

function Stop-Board {
  Get-CimInstance Win32_Process |
    Where-Object { $_.ProcessId -ne $PID -and $_.CommandLine -like "*\AISBoard\*" } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

if ($Uninstall) {
  Stop-Board
  Remove-Item $Shortcut -Force -ErrorAction SilentlyContinue
  Remove-Item $AppDir -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "Removed. The board no longer opens at login."
  return
}

Stop-Board
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null
Set-Content -Path $Launcher -Value $LauncherScript -Encoding UTF8
Set-Content -Path (Join-Path $AppDir "board-url.txt") -Value $Url -Encoding ASCII

$Link = (New-Object -ComObject WScript.Shell).CreateShortcut($Shortcut)
$Link.TargetPath = "powershell.exe"
$Link.Arguments = $LaunchArgs
$Link.WindowStyle = 7
$Link.Save()

if (-not $NoStart) {
  Start-Process -FilePath "powershell.exe" -ArgumentList $LaunchArgs -WindowStyle Hidden
}

Write-Host ""
Write-Host "Done. The board opens full screen at every login."
Write-Host "  Page:     $Url"
Write-Host "  To quit:  Alt+F4. It comes back at the next login."
Write-Host ""
Write-Host "Last step, by hand: turn on automatic login, or the board waits for someone"
Write-Host "to log in after a restart or power cut. Run netplwiz and untick"
Write-Host "'Users must enter a user name and password to use this computer'."
