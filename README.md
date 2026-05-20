# AIS-Dashboard

Display board for AIS Lab — a Next.js app that turns a Google Drive folder
into a kiosk-style slideshow. Hosted as a static site on GitHub Pages.

Live: [ais-lab.github.io/AIS-Dashboard](https://ais-lab.github.io/AIS-Dashboard/)

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

Pure static site. No backend.

1. Browser fetches the Drive folder directly using a public Google API key
   (`NEXT_PUBLIC_GOOGLE_API_KEY`). The key is restricted by HTTP referrer to
   the Pages domain in Google Cloud.
2. The folder is shared as **Anyone with the link – Viewer**. Editors are
   added explicitly in Drive's share dialog — they can upload and modify
   content; the board (and any visitor) can only read.
3. Filename tokens (`F` from, `T` to, `D` duration, `W` weight) drive
   scheduling and selection. Parsing lives in
   [`src/lib/utils/filename-rules.ts`](src/lib/utils/filename-rules.ts).

The dashboard fetches images and text/JSON directly from
`https://www.googleapis.com/drive/v3/files/<id>?alt=media&key=…`.

## Routes

| Path        | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `/`         | The board itself                                       |
| `/tutorial` | Filename guide + interactive generator                 |
| `/admin`    | Folder override (this browser), folder contents preview, setup checklist |

The dashboard's hover overlay (bottom-left) links to `/tutorial` and `/admin`.

## Environment variables

All values are `NEXT_PUBLIC_*` and shipped to the browser.

| Name                          | Purpose                                                                 |
| ----------------------------- | ----------------------------------------------------------------------- |
| `NEXT_PUBLIC_GOOGLE_API_KEY`  | Google Cloud API key with Drive API enabled, restricted by HTTP referrer |
| `NEXT_PUBLIC_DRIVE_FOLDER_ID` | Default Drive folder ID (can be overridden per-browser via `/admin`)    |
| `NEXT_PUBLIC_BASE_URL`        | Canonical URL (e.g. `https://ais-lab.github.io/AIS-Dashboard`)          |
| `NEXT_PUBLIC_APP_URL`         | Same as above for most setups                                           |
| `NEXT_PUBLIC_ENV`             | `staging` or `production`                                               |
| `NEXT_PUBLIC_BASE_PATH`       | Subpath when hosted under one (e.g. `/AIS-Dashboard` on GitHub Pages)   |

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
key's referrer restrictions in Google Cloud so it works locally too.

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
