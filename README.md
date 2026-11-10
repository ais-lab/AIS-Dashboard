# AIS-Dashboard

Display board for AIS Lab — a Next.js app that turns a Google Drive folder
into a kiosk-style slideshow. Hosted as a static site on GitHub Pages.

Live: [ais-lab.github.io/AIS-Dashboard](https://ais-lab.github.io/AIS-Dashboard/)

## Post something on the board

1. Open the [upload page](https://ais-lab.github.io/AIS-Dashboard/upload/) and
   sign in with Google.
2. The first time, click **Request access**. The request goes to
   `ais.aislab@gmail.com`, and you get an email once you are approved.
3. Add an image, a text slide or a countdown, and pick the dates. It is on the
   screen within a minute.

People with Editor access to the Drive folder can also add files directly; see
the [guide](https://ais-lab.github.io/AIS-Dashboard/tutorial/).

## Admin setup

Do this once to turn on `/upload` and set up the monitor. It takes about 20
minutes. Stay signed in as `ais.aislab@gmail.com` throughout: the upload
service runs as that account, sends its emails from it, and keeps the members
sheet in its Drive.

The board keeps working the whole time. Until step 4 is done, `/upload` just
says uploading isn't set up yet.

### 1. Get access to the Drive folder

`ais.aislab@gmail.com` needs **Editor** access to the board's folder,
`aisboard content`. Have the folder's owner share it with that account. Without
this, `setup()` in step 3 fails with a "not found" error.

### 2. Create the Google sign-in client

In [Google Cloud Console](https://console.cloud.google.com/), open the project
that holds the board's Drive API key and go to **Google Auth Platform**. Older
guides call this the OAuth consent screen.

1. If the overview page shows **Get started**, click it. App name `AIS Board`,
   your email as the support email, audience **External**, your email as the
   contact. Add no scopes.
2. **Audience → Publish app**, so anyone with a Google account can sign in.
   Only the basic email and profile scopes are used, so Google does not need to
   review it.
3. Under **Branding**, leave the logo empty. A logo needs Google's brand
   verification. Without it, the sign-in screen shows the site's address
   instead of the app name, which is fine.
4. **Clients → Create client**. Type **Web application**. Under **Authorized
   JavaScript origins** add `https://ais-lab.github.io` and
   `http://localhost:3000`. Add no redirect URIs.
5. Copy the **Client ID**. It ends in `.apps.googleusercontent.com`.

### 3. Deploy the upload service

1. Go to [script.google.com](https://script.google.com/) → **New project**, and
   name it `AIS Board API`.
2. **Project Settings** → tick **Show "appsscript.json" manifest file**. Back
   in the editor, replace `appsscript.json` and `Code.gs` with the files in
   [`apps-script/`](apps-script/).
3. **Project Settings → Script properties**, add:

   | Property    | Value                                                     |
   | ----------- | --------------------------------------------------------- |
   | `FOLDER_ID` | The folder ID, same as the `NEXT_PUBLIC_DRIVE_FOLDER_ID` repo variable |
   | `CLIENT_ID` | The client ID from step 2                                 |
   | `SITE_URL`  | `https://ais-lab.github.io/AIS-Dashboard`                 |

   To have more than one admin, also add `ADMIN_EMAILS` with a comma-separated
   list. It replaces the default, so include `ais.aislab@gmail.com`.
4. In the editor pick the `setup` function and click **Run**. Google asks you
   to authorize your own script: **Advanced → Go to AIS Board API**. The log
   prints the link to the new `AIS Board members` sheet and who gets requests.
5. **Deploy → New deployment → Web app**. Execute as **Me**, who has access
   **Anyone**. Deploy and copy the **Web app URL**. It ends in `/exec`.

### 4. Connect the site

1. In this repo, **Settings → Secrets and variables → Actions → Variables**,
   add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (the client ID from step 2) and
   `NEXT_PUBLIC_API_URL` (the web app URL from step 3).
2. **Actions → Deploy to GitHub Pages → Run workflow**.
3. When it finishes, open
   [`/upload`](https://ais-lab.github.io/AIS-Dashboard/upload/) and sign in as
   `ais.aislab@gmail.com`. You should see the upload form.
4. Before telling the lab, try the member side with a second Google account:
   - Request access, and check that the email reaches `ais.aislab@gmail.com`.
   - Approve it in `/admin`, and check that the second account gets the
     approval email.
   - Post a test item, wait for it on the board (up to a minute), then delete
     it on `/upload`.

The `NEXT_PUBLIC_ENV`, `NEXT_PUBLIC_BASE_URL` and `NEXT_PUBLIC_APP_URL`
variables are no longer used, so you can delete them.

### 5. Set up the monitor

Run this once on the computer behind the monitor. You need Google Chrome; on
Windows, Edge works too. It opens the board full screen now and at every login.

macOS or Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.sh | bash
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/ais-lab/AIS-Dashboard/main/kiosk/install.ps1 | iex
```

Then turn on automatic login, or after a restart the board waits at the login
screen. [`kiosk/README.md`](kiosk/README.md) says where that setting is on each
system, and how to quit or remove the kiosk.

### 6. Tell the lab

Paste the posts from [`docs/channel-posts.md`](docs/channel-posts.md) into the
lab channel. The printable poster is [`docs/poster/poster.pdf`](docs/poster/poster.pdf).

### Approving people

Each request arrives by email at `ais.aislab@gmail.com`, with links to both
places you can answer it. Reply to the email to reach the person directly.

- **On the site:** open [`/admin`](https://ais-lab.github.io/AIS-Dashboard/admin/),
  sign in, and use **Approve** or **Decline** under "Who can post". This is also
  where you remove someone or make them an admin.
- **In the `AIS Board members` sheet:** set `status` to `approved` or `rejected`,
  and `role` to `member` or `admin`.

Both work the same: an approved person gets an email right away, and a declined
person sees it on the upload page.

The sheet is a normal Google Sheet, so **File → Download → Microsoft Excel**
gives you an `.xlsx` copy. Make changes in the sheet itself, because edits to a
downloaded copy do nothing. Keep it out of the board's Drive folder: that folder
is public and the board would show it on the screen.

Files uploaded through the site are owned by `ais.aislab@gmail.com` and record
the uploader in their Drive description. Members can edit or remove only their
own; admins can change anything.

## What it does

- Polls a Google Drive folder every 30s and renders its contents:
  - Images → fullscreen slide with blurred background fill
  - Text / Markdown → rendered slide
  - JSON → countdown event card
  - Folder → nested slideshow (1 level deep, weighted random)
- Display windows are encoded in filenames (e.g. `summer_F20260601T20260831.png`).
  See [/tutorial](https://ais-lab.github.io/AIS-Dashboard/tutorial/) for the
  full filename rules and an interactive name generator.
- Folder source can be overridden per-browser via `/admin` (handy for
  testing without redeploying).
- Bilingual EN / JA throughout.

## Architecture

A static site. The board itself has no backend; only uploads use one (step 4).

1. Browser fetches the Drive folder directly using a public Google API key
   (`NEXT_PUBLIC_GOOGLE_API_KEY`). The key is restricted by HTTP referrer to
   the Pages domain in Google Cloud.
2. The folder is shared as **Anyone with the link – Viewer**. Editors are
   added explicitly in Drive's share dialog — they can upload and modify
   content; the board (and any visitor) can only read.
3. Filename tokens (`F` from, `T` to, `D` duration, `W` weight) drive
   scheduling and selection. Parsing lives in
   [`src/lib/utils/filename-rules.ts`](src/lib/utils/filename-rules.ts).
4. `/upload` goes through a small Google Apps Script web app
   ([`apps-script/`](apps-script/README.md)) that runs as the admin's Google
   account. It checks the members list in a Google Sheet, then saves the file
   into the folder with the date tokens in its name, so members need no Drive
   access.

The dashboard fetches images and text/JSON directly from
`https://www.googleapis.com/drive/v3/files/<id>?alt=media&key=…`.

## Routes

| Path        | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `/`         | The board itself                                       |
| `/upload`   | Sign in, request access, post and manage your items    |
| `/tutorial` | Filename guide + interactive generator                 |
| `/admin`    | Approve members, folder override (this browser), folder contents preview, setup checklist |

The dashboard's hover overlay (bottom-left) links to these pages.

## Environment variables

All values are `NEXT_PUBLIC_*` and shipped to the browser.

| Name                          | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_API_KEY`  | Google Cloud API key with Drive API enabled, restricted by HTTP referrer |
| `NEXT_PUBLIC_DRIVE_FOLDER_ID` | Default Drive folder ID (can be overridden per-browser via `/admin`)    |
| `NEXT_PUBLIC_BASE_PATH`       | Subpath when hosted under one (e.g. `/AIS-Dashboard` on GitHub Pages)   |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | OAuth client ID for "Sign in with Google"                               |
| `NEXT_PUBLIC_API_URL`         | URL of the deployed Apps Script web app                                 |

The last two turn on `/upload`. Without them the board still works and members
add files in Drive. See [Admin setup](#admin-setup).

In CI (`.github/workflows/deploy.yml`), every var above except the API key
is read from repo **Variables**; `NEXT_PUBLIC_GOOGLE_API_KEY` lives in
repo **Secrets**.

## Local development

```bash
cp .env.example .env.local   # fill in values
yarn install
yarn dev
```

Visit `http://localhost:3000`. Add `http://localhost:3000/*` to the API
key's referrer restrictions in Google Cloud so it works locally too. To work
on `/upload` without touching the real folder, run the local API stand-in
described in [`apps-script/README.md`](apps-script/README.md#developing-locally).

## Deploying

Push to `main`. The `Deploy to GitHub Pages` workflow builds the static
export (`next build` with `output: "export"`) and publishes the `out/`
directory. Only `src/`, `public/`, config files, and the workflow itself
trigger rebuilds — README edits do not.

To change the default folder without touching code: repo → Settings →
Variables → edit `NEXT_PUBLIC_DRIVE_FOLDER_ID` → Actions → re-run the
deploy workflow.

## Setting up from scratch

1. **Create a Drive folder.** Share as "Anyone with the link – Viewer".
   Add content managers as **Editor**.
2. **Create a Google Cloud API key.** Enable Google Drive API; restrict
   the key by HTTP referrer to your Pages domain (and localhost for dev);
   restrict API to Drive only.
3. **Configure GitHub.** Add the variables and secret listed above. Enable
   Pages → Source: GitHub Actions.
4. **Push.** First deploy bootstraps; subsequent deploys happen on push to
   `main` (filtered by path).

## Stack

- Next.js 14 (`output: "export"`)
- TanStack Query for polling + caching
- Tailwind + a small subset of Radix primitives
- `embla-carousel-react` for the slideshow
- `react-markdown` for text slides
- `open-meteo` for the weather badge
