# Channel posts

Ready to paste. They are plain text, so they work in Slack, Teams or Discord.

Send posts 1 and 2 only after the upload page is set up (see
[Admin setup](../README.md#admin-setup)). Until then it can't take requests.

## 1. For all lab members

```text
You can now post on the lab monitor yourself 🖥️

It takes about a minute. You don't need Drive access or special file names.

1. Open https://ais-lab.github.io/AIS-Dashboard/upload/ and sign in with Google.
2. First time only: click "Request access" and add a short note saying who you are. The request goes to ais.aislab@gmail.com, and you'll get an email once you're approved.
3. Add an image, a short text or an event countdown, pick the dates, and post it.

It shows up on the screen within a minute and comes down by itself after the last day. You can edit or remove your own posts on the same page.

Please don't post anything private: everything on the board can be read by anyone who has the link.

Questions? Email ais.aislab@gmail.com.
```

## 2. For the board admin

```text
AIS Board: how to approve access requests

Each request arrives at ais.aislab@gmail.com with the subject "AIS Board: access request from ...". You can reply to that email to reach the person directly.

To approve or decline, use either one:

- On the site: open https://ais-lab.github.io/AIS-Dashboard/admin/ and sign in as ais.aislab@gmail.com. Use Approve or Decline under "Who can post".
- In the spreadsheet: open "AIS Board members" (the link is in the email) and set status to approved or rejected.

Approved people get an email straight away and can start posting. Declined people get no email; they see it on the upload page.

The same page and spreadsheet are where you remove someone or make them an admin. Please keep the spreadsheet out of the board's Drive folder, because that folder is public.
```

## 3. For whoever looks after the monitor

```text
AIS Board: setting up the monitor

Run one command, once, on the computer connected to the monitor. It opens the board full screen right away and again at every login.

macOS or Linux (Terminal):

curl -fsSL https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.sh | bash

Windows (PowerShell):

irm https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.ps1 | iex

You need Chrome (Edge is fine on Windows). Then turn on automatic login, otherwise the board waits at the login screen after a restart or power cut.

To get out of full screen, press Cmd+Q on a Mac or Alt+F4 elsewhere. It comes back at the next login.

Full guide, including how to remove it: https://github.com/ais-lab/AIS-Dashboard/tree/main/kiosk
```
