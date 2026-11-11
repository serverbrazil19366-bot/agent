# Astra Leads web page

A one-file page that shows the Apps Script dashboards (laptop view and phone view) **without opening script.google.com**. It works in any browser, even one signed into several Google accounts, where script.google.com shows "Sorry, unable to open the file".

It loads the dashboard from your Apps Script web app (`?api=page`). The buttons call the script through `doPost`, so sending replies and marking leads both work. Every request carries your private key, which is saved on each device the first time you open `…/#k=<key>`.

## Put it online (no GitHub)
1. In `index.html`, set `WEB_APP_URL` to your Apps Script web app URL (it ends in `/exec`).
2. Go to <https://app.netlify.com/drop> and drag this folder onto the page.
3. Open `https://<your-site>.netlify.app/#k=<ACCESS_KEY>` once on each device. Then add it to the home screen or bookmark it.

The page picks the phone view on small screens and the laptop view on large ones. Add `?view=desktop` or `?view=mobile` to force one.
