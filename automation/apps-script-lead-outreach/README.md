# Free version: Google Apps Script (no n8n, no paid tools)

The same pipeline as `../n8n-lead-audit-outreach`, but it runs on Google's servers inside a Google Sheet, so there's no server and no monthly fee.

| Step | n8n version | Free version |
|---|---|---|
| Find leads | Outscraper (paid after 500/mo) | **Google Places API (New)**, with a daily quota cap so it can never bill |
| Speed audit | PageSpeed API | **PageSpeed API** (free, no billing) |
| Owner email | Hunter.io (25 free/mo) | **Reads the clinic's own website** (home, /contact, /about), so it's unlimited |
| Send | Gmail node | **GmailApp**, built in (100 recipients/day on free Gmail) |
| Log | Google Sheets node | The same sheet the script lives in |
| Hosting | n8n Cloud (paid) or self-host | **Free**, Google runs it every 10 minutes |

## Setup (about 20 minutes, one time)

### A. Google Cloud API key (free)
1. Go to <https://console.cloud.google.com/> → create a project, e.g. `astra-outreach`.
2. **APIs & Services → Library**. Enable **Places API (New)** and **PageSpeed Insights API**.
3. **APIs & Services → Credentials → Create credentials → API key**. Copy the key.
   Click *Restrict key* → *API restrictions* → tick only those 2 APIs → Save.
4. Places needs a billing account (a card) even when you stay inside the free allowance. Google gives 1,000 free Places searches a month; this script uses about 3 a day, so about 66 a month.
   **To guarantee ₹0:** go to **APIs & Services → Places API (New) → Quotas**, find **Text Search requests per day**, and set it to **10**. Google then blocks request number 11 instead of charging for it.

   *No card?* Skip Places entirely. Paste leads into the sheet yourself (business_name, website, status `new`), copied from Google Maps. Everything else still runs automatically.

### B. The sheet and script
1. Create a new Google Sheet, e.g. **Astra Nexora Leads**.
2. **Extensions → Apps Script**. Delete what's there and paste all of `Code.gs`.
3. At the top, paste your key into `GOOGLE_API_KEY`. Change `AREAS` / `BUSINESS_TYPE` if you want another niche. Save.
4. Choose **setup** in the function dropdown → **Run** → allow the permissions (*Advanced → Go to project* is normal for your own script).
5. Go back to the sheet and refresh. An **Astra Outreach** menu appears.

### C. Test, then go live
1. **Astra Outreach → Find leads now**. Rows appear in the `Leads` tab.
2. **Astra Outreach → Process next lead now**, two or three times. Each click audits leads until one email is ready.
3. `SEND_MODE` is `'draft'` by default, so check **Gmail → Drafts**. Read 3–5 of them.
4. When you're happy with them, change `SEND_MODE` to `'send'` and save. From then on it runs itself:
   - about 9 AM daily: searches the next area in `AREAS`
   - every 10 minutes, 10 AM–6 PM, Mon–Fri: at most 1 email, and at most 20 a day

## Daily use
- **Replies:** when someone replies "no", change that row's status to `opted_out`. For a positive reply, use `replied`. That email address is never contacted again.
- **`no_website` rows** are your list for the website-design offer, with their phone numbers.
- **`no_email` rows:** the site has no email on it. Call or WhatsApp them instead; the phone number is in the row.
- **Logs:** Apps Script → *Executions* shows each run and any error.

## Honest limits
- Free Gmail is limited to 100 recipients a day, and a new account should send about 10 a day for the first 2 weeks. Set `EMAILS_PER_DAY` to `10` at first.
- The website's email is often a generic inbox like `info@`, and usually no owner name is shown, so the greeting is "Hi Doctor". Expect more emails per clinic and fewer named contacts than Hunter would give.
- Some sites block automated audits. Those become `audit_failed`.
- PageSpeed mobile scores vary by about ±15% between runs. The email tells the reader they can check it at pagespeed.web.dev.
