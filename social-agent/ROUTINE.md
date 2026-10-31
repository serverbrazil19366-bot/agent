# Daily routine (no API keys)

A Claude Code routine runs this every day on the Claude plan, so there is no
Claude API bill. Claude writes the post itself, the repo script designs the
poster, GitHub hosts the image (the repo is public), and the Buffer connector
(OAuth, `https://mcp.buffer.com/mcp`) schedules it. No Buffer API key, no
Cloudinary.

The routine prompt is: "Follow social-agent/ROUTINE.md for tomorrow's post."

## Steps for the session

1. `cd social-agent && npm ci`. Playwright's Chromium is preinstalled in the
   cloud container; only if `chromium.launch()` fails, run
   `npx playwright install chromium`.
2. Work out **tomorrow's date** in Asia/Kolkata (`TZ=Asia/Kolkata date -d tomorrow +%F`),
   its weekday, and that weekday's pillar in `config.json`. If `history.json`
   already has that date, stop and report "already scheduled".
3. Read `config.json` (brand, voice, contact details) and the last 30 entries
   of `history.json`. Pick a topic for the pillar that is clearly different
   from those.
4. Write `output/post.json` with exactly this shape (the rules in
   `systemPrompt` and the field descriptions in `src/content.js` apply - no
   invented statistics, client names, results or testimonials, and never
   mention any name in `config.json` `brand.neverMention`, e.g. Guggulr):
   ```json
   {
     "topic": "...",
     "poster": {
       "kicker": "...", "headline": "max 9 words", "highlight": "part of headline in blue",
       "subline": "max 12 words",
       "visual": "search | website | dashboard | social | chat", "visualText": "max 6 words",
       "badges": [{ "icon": "...", "label": "max 3 words, no numbers" }],
       "points": [{ "icon": "...", "title": "max 4 words", "text": "max 8 words" }],
       "benefits": [{ "icon": "...", "label": "max 2 words" }],
       "cta": "max 6 words"
     },
     "captions": { "instagram": "...", "facebook": "...", "twitter": "max 250 chars", "linkedin": "..." },
     "altText": "..."
   }
   ```
   3 badges, exactly 3 points, exactly 4 benefits. Icons must be names from
   `ICONS` in `src/poster.js`. Vary `visual` from day to day.
5. Render: `node src/index.js --post output/post.json --dry-run --date <date>`.
   Open `output/<date>/poster.png` and look at it. If text is cut off or
   cramped, shorten the copy and render again.
6. Host the poster: copy it to `posters/<date>.png`, commit, and push to the
   `social-posters` branch (create it from the current branch if missing). The
   image URL is
   `https://raw.githubusercontent.com/serverbrazil19366-bot/agent/social-posters/social-agent/posters/<date>.png`.
   Check it returns HTTP 200 before going on.
7. Buffer connector: `get_account`, then `list_channels` for the organization.
   Use the channels for each service in `config.json` `channels.services`
   (Instagram, Facebook, X/twitter) whose name contains "astra" (else the only
   channel of that service). LinkedIn is not in Buffer; it is posted by hand.
8. For each channel, `create_post` with its caption, the image URL as an image
   asset with the alt text, and a custom scheduled time on that date from
   `config.json` `postTimes` (Asia/Kolkata, e.g. `2026-11-03T18:30:00+05:30`).
   Instagram: type `post`, share to feed. Facebook: type `post`. If
   `config.json` `mode` is `draft`, save as drafts instead.
9. Append to `history.json`:
   `{ "date", "pillar", "topic", "headline", "imageUrl", "mode", "scheduled": [{ "service", "postId", "dueAt" }] }`,
   commit and push it to the `social-posters` branch too.
10. Report: date, topic, headline, image URL, and each channel's scheduled time
    or the error Buffer returned. Then give the LinkedIn caption and the image
    URL in full so it can be copied and posted by hand. If any step fails, say which and why; do
    not invent a success.
