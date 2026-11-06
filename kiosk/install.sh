#!/usr/bin/env bash
# One-command setup for the computer behind the board monitor (macOS, Linux).
# Opens the board full screen now and at every login.
#
#   curl -fsSL https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.sh | bash
#
# Options go after "bash -s --":
#   --url <url>   Page to show (default: the live board)
#   --no-start    Set up only, the board opens at the next login
#   --uninstall   Undo everything this script set up

set -euo pipefail

SCRIPT_URL="https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.sh"
APP_DIR="$HOME/.aisboard"
LAUNCHER="$APP_DIR/start-board.sh"
LOG="$APP_DIR/board.log"
LABEL="io.github.ais-lab.board"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
AUTOSTART="$HOME/.config/autostart/aisboard.desktop"

write_launcher() {
  cat > "$LAUNCHER" <<'LAUNCHER_EOF'
#!/usr/bin/env bash
# Opens the board full screen. Written by kiosk/install.sh.

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
URL="$(cat "$APP_DIR/board-url")"

find_browser() {
  local path name
  for path in \
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "$HOME/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    "/Applications/Chromium.app/Contents/MacOS/Chromium" \
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"; do
    if [ -x "$path" ]; then
      echo "$path"
      return 0
    fi
  done
  for name in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge; do
    command -v "$name" && return 0
  done
  return 1
}

BROWSER="${BOARD_BROWSER:-$(find_browser)}"
if [ -z "$BROWSER" ]; then
  echo "No Chrome, Chromium or Edge found." >&2
  exit 1
fi
if [ "${1:-}" = "--check" ]; then
  echo "$BROWSER"
  exit 0
fi

# The network comes up after the desktop, and a page opened too early is stuck
# on an error screen. A lab proxy can block curl but not the browser, so open
# it anyway once the wait is over.
until curl -fs -o /dev/null --max-time 5 "$URL" || [ "$SECONDS" -ge "${BOARD_WAIT_SECONDS:-120}" ]; do
  sleep 3
done

# Keep the screen on for as long as the browser runs.
KEEP_AWAKE=()
if [ "$(uname)" = "Darwin" ]; then
  KEEP_AWAKE=(caffeinate -dis)
elif [ -n "${DISPLAY:-}" ] && command -v xset >/dev/null; then
  xset s off
  xset s noblank
  xset -dpms
fi

# Incognito: no "restore pages?" prompt after a power cut. The separate profile
# keeps this apart from any Chrome someone opens by hand. The password flags
# stop a keychain prompt from covering the board after an automatic login.
FLAGS=(
  --kiosk
  --incognito
  --no-first-run
  --noerrdialogs
  --disable-infobars
  --disable-session-crashed-bubble
  --password-store=basic
  --use-mock-keychain
  "--user-data-dir=$APP_DIR/browser-profile"
)

# Quitting on purpose exits 0 and stays closed. A crash comes back by itself.
while true; do
  "${KEEP_AWAKE[@]}" "$BROWSER" "${FLAGS[@]}" "$URL"
  [ $? -eq 0 ] && exit 0
  sleep 5
done
LAUNCHER_EOF
}

stop_board() {
  if [ "$(uname)" = "Darwin" ]; then
    launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
  fi
  # The launcher first, or it would restart the browser.
  pkill -f "$LAUNCHER" 2>/dev/null || true
  pkill -f "$APP_DIR/browser-profile" 2>/dev/null || true
}

install_macos() {
  mkdir -p "$(dirname "$PLIST")"
  cat > "$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$LAUNCHER</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>LimitLoadToSessionType</key>
  <string>Aqua</string>
  <key>ProcessType</key>
  <string>Interactive</string>
  <key>StandardOutPath</key>
  <string>$LOG</string>
  <key>StandardErrorPath</key>
  <string>$LOG</string>
</dict>
</plist>
PLIST_EOF
  # Loading the agent starts it. Left unloaded, it loads at the next login.
  # On a reinstall the old copy can take a moment to go away, hence the retry.
  if [ "$1" = "1" ]; then
    launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || {
      sleep 2
      launchctl bootstrap "gui/$(id -u)" "$PLIST"
    }
  fi
}

install_linux() {
  mkdir -p "$(dirname "$AUTOSTART")"
  cat > "$AUTOSTART" <<DESKTOP_EOF
[Desktop Entry]
Type=Application
Name=AIS Board
Exec=/bin/bash "$LAUNCHER"
X-GNOME-Autostart-enabled=true
DESKTOP_EOF
  if [ "$1" != "1" ]; then
    return
  fi
  if [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then
    nohup bash "$LAUNCHER" >> "$LOG" 2>&1 &
  else
    echo "No desktop session in this terminal, so the board opens at the next login."
  fi
}

uninstall() {
  stop_board
  rm -f "$PLIST" "$AUTOSTART"
  rm -rf "$APP_DIR"
  echo "Removed. The board no longer opens at login."
}

main() {
  local url="https://ais-lab.github.io/AIS-Dashboard/"
  local start_now=1
  while [ $# -gt 0 ]; do
    case "$1" in
      --url)
        url="${2:?--url needs a value}"
        shift 2
        ;;
      --no-start)
        start_now=0
        shift
        ;;
      --uninstall)
        uninstall
        return
        ;;
      *)
        echo "Unknown option: $1" >&2
        exit 2
        ;;
    esac
  done

  local system
  system="$(uname)"
  if [ "$system" != "Darwin" ] && [ "$system" != "Linux" ]; then
    echo "This script is for macOS and Linux. On Windows use kiosk/install.ps1." >&2
    exit 1
  fi

  mkdir -p "$APP_DIR"
  write_launcher
  printf '%s\n' "$url" > "$APP_DIR/board-url"

  local browser
  if ! browser="$(bash "$LAUNCHER" --check)"; then
    echo "Install Google Chrome first, then run this again: https://www.google.com/chrome/" >&2
    exit 1
  fi

  stop_board
  if [ "$system" = "Darwin" ]; then
    install_macos "$start_now"
  else
    install_linux "$start_now"
  fi

  cat <<DONE_EOF

Done. The board opens full screen at every login.
  Page:     $url
  Browser:  $browser
  To quit:  Cmd+Q on macOS, Alt+F4 on Linux. It comes back at the next login.
  To undo:  curl -fsSL $SCRIPT_URL | bash -s -- --uninstall

Last step, by hand: turn on automatic login, or the board waits for someone to
log in after a restart or power cut.
  macOS:         System Settings > Users & Groups > Automatically log in as
  Raspberry Pi:  sudo raspi-config > System Options > Auto Login
  Other Linux:   Settings > Users > Automatic Login
DONE_EOF
}

# Last line on purpose: a half-downloaded script runs nothing.
main "$@"
