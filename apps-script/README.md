# AIS Board API (Apps Script)

This small Google Apps Script web app powers `/upload` and the "Who can
post" panel in `/admin`:

- Lab members sign in with Google and ask for access once.
- The request is emailed to the admin (`ais.aislab@gmail.com`), who approves
  it in `/admin` or in the members sheet. The member then gets an email.
- Approved members upload images, write text slides or add countdowns, and
  pick dates in a form. The script saves the file into the board's Drive
  folder with the date tokens in its name, so the board itself is unchanged.

The script runs as the Google account that deploys it, so members never
need access to the Drive folder. The member list lives in a Google Sheet that
`setup()` creates.

Nothing here is secret: the site only needs the OAuth client ID and the web
app URL, both public. The existing Drive API key stays as it is.

## Setup

See [Admin setup](../README.md#admin-setup) in the main README. Approving people
is covered there too.

## Updating the script

Paste the new `Code.gs`, then **Deploy → Manage deployments → Edit →
Version: New version → Deploy**. The URL stays the same. If `appsscript.json`
gained a scope, paste it too and run `setup()` again to approve it.

## Developing locally

`dev/server.mjs` runs the real `Code.gs` against an in-memory Drive and
sheet, with fake sign-in:

```bash
node apps-script/dev/server.mjs
```

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8787 NEXT_PUBLIC_GOOGLE_CLIENT_ID=dev yarn dev
```

The sign-in button becomes an email box. `admin@lab.test` is an admin and
`member@lab.test` is an approved member; any other email starts as a new
visitor.

`/outbox` lists the emails it would have sent and `/sheet` shows the members
sheet. To act out a hand edit of the sheet, open
`/sheet-edit?email=someone@lab.test&status=approved`.
