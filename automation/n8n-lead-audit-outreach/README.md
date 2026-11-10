# Astra Nexora: Maps Lead Audit & Outreach (n8n)

Google Maps leads → website speed audit → owner email → personalised cold email → Google Sheet log.

**Import:** n8n → *Workflows* → *Import from File* → `workflow.json`.

```
Manual / Weekdays 10:30 IST
  → Config → Search Google Maps (Outscraper) → Read Leads Log → Clean & Dedupe
  → Has Website? ── no ──→ Log No Website   (your website-design offer list)
        │ yes
  → Loop Over Leads (1 at a time)
      → PageSpeed Audit (Mobile) → Extract Speed Metrics → Slow Site? ── no ─→ Log Skipped ─┐
      → Find Owner Email (Hunter) → Pick Decision Maker → Email Found? ── no ─→ Log Skipped ─┤
      → Send Audit Email (Gmail) → Mark Sent → Log Sent → Wait 2–3 min ─────────────────────┘ back to loop
```

## Changes from the original guide

| Guide said | The workflow does | Why |
|---|---|---|
| `https://outscraper.com` | `https://api.app.outscraper.com/maps/search-v3`, `async=false` | That's the real API endpoint. The website field it returns is `site`, not `website`. |
| `https://googleapis.com` | `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` | That's the real PageSpeed endpoint. |
| Apollo `https://apollo.io` | Hunter.io `domain-search` | Apollo's people search hides emails unless you make a second paid "enrich" call. Hunter returns name, position and email in one call, and its free tier covers 25 searches a month. |
| Email every lead | Email only if Speed Index > `speed_threshold_s` (3 s) | Otherwise the email says "your site is slow" to a site that is fast. |
| "this Thursday" | `call_day` = two working days from today | "This Thursday" is wrong when the email goes out on a Thursday or Friday. |
| Facebook / Practo / Justdial links count as websites | Treated as **no website** | Those pages aren't the clinic's own site, so they're website-design leads instead. |
| No duplicate check | Skips any `place_id` or `domain` already in the sheet | Each run would otherwise email the same clinics again. |
| No way to unsubscribe | Footer: *reply "no" and I won't email again* | Gmail's bulk-sender rules and India's DPDP Act both expect an easy way to opt out. If someone replies "no", add their row to the sheet with status `opted_out`. The duplicate check will then skip them. |
| — | Gmail "Append n8n attribution" **off** | Without this, every email ends with "sent automatically with n8n". |

## Setup (about 15 minutes)

### 1. Google Sheet
Create a sheet. Rename the first tab to **`Leads Log`** and paste this header row into row 1:

```
date	status	business_name	website	domain	phone	address	rating	place_id	speed_index	perf_score	contact_name	email	email_position	note
```

Copy the sheet ID from its URL (`docs.google.com/spreadsheets/d/<THIS PART>/edit`) and paste it into the **Config** node as `sheet_id`.

`status` values: `sent`, `fast` (site is already quick), `no_email`, `audit_failed`, `no_website`.

### 2. Credentials (n8n → *Credentials* → *Add*)
| Node | Credential type | Name / Value |
|---|---|---|
| Search Google Maps | **Header Auth** | Name `X-API-KEY`, Value = Outscraper API key (app.outscraper.com → Profile) |
| PageSpeed Audit (Mobile) | **Query Auth** | Name `key`, Value = Google Cloud API key with *PageSpeed Insights API* enabled |
| Find Owner Email (Hunter) | **Query Auth** | Name `api_key`, Value = Hunter.io API key |
| Read/Log nodes | **Google Sheets OAuth2** | sign in |
| Send Audit Email | **Gmail OAuth2** | sign in with the sending account |

After import, open each of those nodes and select its credential.

### 3. Test before going live
1. In **Config**, set `search_limit` to `3`.
2. In **Send Audit Email**, temporarily change *To* to your own address.
3. Click **Execute workflow**. Check the email you get and the rows written to the sheet.
4. Put both settings back, then turn the workflow **Active** so it runs every weekday at 10:30 IST.

To target a different niche or city, edit `search_query` in **Config** (for example `Physiotherapy clinics in Coimbatore, India`). The Chennai line in the email body is in `src/email.html`.

## Limits to keep in mind
- **20 emails per run, 2–3 minutes apart.** This is the guide's rule 1. One run takes about 1 hour.
- **Outscraper:** the first 500 places each month are free, then it is paid per place. **Hunter:** 25 free searches a month. One search is used per lead that has a slow website.
- A brand-new Gmail account should start with about 10 emails a day for the first 2 weeks. If you can, send from a Google Workspace address on your own domain, because it lands in inboxes more often than @gmail.com.
- PageSpeed mobile results vary by about ±15% between runs. The email tells the reader they can check the number themselves at pagespeed.web.dev.

## Editing
The Code-node JavaScript and the email HTML are in `src/`. After editing them, run `python3 src/build.py` to rebuild `workflow.json`, then import it again.
