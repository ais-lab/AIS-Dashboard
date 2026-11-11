# Board monitor setup

One command turns the computer behind the monitor into a kiosk. It opens the
board full screen right away and again at every login.

You need Google Chrome (or Chromium). On Windows, Edge works too.

## Install

Easiest: open https://ais-lab.github.io/AIS-Dashboard/setup/ on that computer,
copy the command and run it. Or copy it from here.

**macOS or Linux**, in Terminal:

```bash
curl -fsSL https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.sh | bash
```

**Windows**, in PowerShell (no admin rights needed):

```powershell
irm https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.ps1 | iex
```

## Then turn on automatic login

The board starts when someone logs in, so after a restart or power cut it
waits at the login screen unless the computer logs in by itself.

| System       | Where                                                               |
| ------------ | ------------------------------------------------------------------- |
| macOS        | System Settings → Users & Groups → Automatically log in as          |
| Windows      | Run `netplwiz`, untick "Users must enter a user name and password"  |
| Raspberry Pi | `sudo raspi-config` → System Options → Auto Login                   |
| Other Linux  | Settings → Users → Automatic Login                                  |

Use a computer that holds nothing private: anyone in the room can reach it.

To have it come back after a power cut without anyone pressing the button,
turn on "start after power failure" too: `sudo pmset -a autorestart 1` on a
Mac, or the BIOS setting on a PC.

## What it does

- Waits up to 2 minutes for the network, then opens the board. The network
  often comes up after the desktop, and a page opened too early would be stuck
  on an error screen.
- Keeps the screen awake while the board is open. On Linux with Wayland, turn
  off screen blanking in Settings instead.
- Reopens the browser if it crashes.
- Uses its own browser profile, so it never touches anyone's normal browser.

## Day to day

| To               | Do this                                                           |
| ---------------- | ----------------------------------------------------------------- |
| Get out of it    | Cmd+Q on a Mac, Alt+F4 elsewhere. It comes back at the next login |
| Show another URL | Run the install command again with `--url` (below)                |
| Remove it        | Run the uninstall command (below)                                 |

```bash
curl -fsSL https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.sh | bash -s -- --url https://example.org/
```

```bash
curl -fsSL https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.sh | bash -s -- --uninstall
```

On Windows, the same two:

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.ps1))) -Url https://example.org/
```

```powershell
& ([scriptblock]::Create((irm https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.ps1))) -Uninstall
```

Add `--no-start` (`-NoStart` on Windows) to set it up without opening the board
until the next login.

## Where things are

| System        | Autostart entry                                              | Files                     |
| ------------- | ------------------------------------------------------------ | ------------------------- |
| macOS         | `~/Library/LaunchAgents/io.github.ais-lab.board.plist`       | `~/.aisboard/`            |
| Linux         | `~/.config/autostart/aisboard.desktop`                       | `~/.aisboard/`            |
| Windows       | `AIS Board` shortcut in the Startup folder (`shell:startup`) | `%LOCALAPPDATA%\AISBoard` |

If the board doesn't open on a Mac or Linux box, look in
`~/.aisboard/board.log`.
