# Astra Leads: phone app

A small installable app (PWA) for the lead outreach Apps Script (`../automation/apps-script-lead-outreach`). It shows:

- **Replies**: who replied, what they said, what you sent them, and the fixes to send. Buttons: Reply in Gmail, Call, Call booked, Not interested.
- **Calls**: calls you've booked, with Won / Lost buttons.
- **Sent**: every email that went out.
- **Pipeline**: how many leads are in each status.

It also sends a **push alert** to your phone when a doctor replies. On iPhone this needs iOS 16.4+ and the app added to the Home Screen.

## How it fits together
```
Apps Script (every 10 min) ── finds a reply ──► POST /api/notify ──► Web Push ──► your phone
Phone app ── GET <web app URL>?api=data&t=<token> ──► Apps Script reads the Leads sheet
```
The pairing token is created by your Apps Script. The app keeps it on your phone. This Netlify site stores only the token's SHA-256 hash and your phone's push subscription, in Netlify Blobs. The VAPID keys are generated on the first request and stored there too, so there are no secrets in the repo.

## Deploy (once)
1. Netlify → **Add new site → Import an existing project → GitHub →** this repository.
2. Branch: the one with this folder. **Base directory: `astra-leads-app`**. Leave the build command empty. Publish directory `public` and functions `netlify/functions` come from `netlify.toml`.
3. Site name: `astra-leads`, so the URL is `https://astra-leads.netlify.app`. If you use another name, put that URL in `APP_URL` in the Apps Script `CONFIG`.

## Pair your phone (once)
1. Apps Script → **Deploy → New deployment → Web app** → Execute as **Me**, Who has access **Anyone** → Deploy. Every request still needs your private token.
2. Run **appLink**. Open the link it prints **on your phone**.
3. iPhone: Share → **Add to Home Screen**, then open Astra Leads from the home screen. Android: ⋮ → **Install app**.
4. Tap **Turn on reply alerts**, then run **testNotification** in Apps Script to check.

After changing the Apps Script code: Deploy → Manage deployments → ✏️ → **New version**. The web app URL stays the same.
