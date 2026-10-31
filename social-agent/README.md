# Astra Nexora social media agent

Every day this agent writes a post for Astra Nexora, designs a branded poster
and schedules it in Buffer for the Instagram, Facebook and LinkedIn pages.

**Tamil summary:** Daily 17:53 IST-ku GitHub Actions run aagum. Claude naalaiya
post-ah ezhudhum, brand colours-la poster design pannum, Cloudinary-la image
upload pannum, Buffer-la Instagram 18:30, Facebook 19:00, LinkedIn 09:30 (IST)
schedule pannum. Neenga onnum panna vendaam. Approve panni post panna
venumna `POST_MODE` = `draft` vechidunga.

## How it works

| Step | What happens | Code |
|---|---|---|
| 1. Plan | Picks the day's pillar (Mon SEO tip, Tue social media, Wed website check, Thu myth vs fact, Fri AI & automation, Sat brand & local, Sun audience question) | `config.json` |
| 2. Write | Claude writes the poster copy plus separate Instagram, Facebook and LinkedIn captions, avoiding the last 30 topics | `src/content.js` |
| 3. Design | Renders a 1080×1350 poster in the brand fonts (Oswald, Crimson Text) and colours, rotating navy, blue and light themes | `src/poster.js` |
| 4. Host | Uploads the poster to Cloudinary, because Buffer needs a public image URL | `src/host.js` |
| 5. Schedule | Creates one Buffer post per channel at the times in `config.json` | `src/buffer.js` |
| 6. Remember | Adds the topic to `history.json` so topics don't repeat | `src/index.js` |

## One-time setup (about 15 minutes)

1. **Buffer:** connect the Astra Nexora Instagram (business account), Facebook
   page and LinkedIn company page at https://publish.buffer.com. Then create an
   API key at https://publish.buffer.com/settings/api.
2. **Claude:** create an API key at https://platform.claude.com.
3. **Cloudinary (free):** sign up at https://cloudinary.com. On the dashboard,
   copy the **API environment variable**, which looks like
   `cloudinary://123456:abcdef@your-cloud`.
4. **GitHub:** in this repo go to *Settings → Secrets and variables → Actions*
   and add three repository secrets:
   - `ANTHROPIC_API_KEY`
   - `BUFFER_API_KEY`
   - `CLOUDINARY_URL`
5. **Test it:** *Actions → Social media agent → Run workflow*, set mode to
   `draft`. The posts appear in Buffer drafts and the poster is attached to the
   run as an artifact. Check them, then run without draft.
6. The daily schedule only runs from the repository's **default branch**, so
   merge this folder and `.github/workflows/social-agent.yml` into it.

### Optional variables (Settings → Variables → Actions)

| Variable | Use |
|---|---|
| `POST_MODE` | `schedule` (default, fully automatic), `draft` (you approve each post in Buffer) or `queue` (Buffer's own posting slots) |
| `BUFFER_ORG_ID` | Only if your Buffer account has several organizations |
| `BUFFER_CHANNEL_IDS` | Comma-separated channel IDs, if the agent picks the wrong page |

## Run it on your computer

```bash
cd social-agent
npm install
npx playwright install chromium
```

Check the design without spending anything (sample copy, no upload):

```bash
node src/index.js --sample --dry-run
```

Write a real post and poster, but don't schedule it:

```bash
ANTHROPIC_API_KEY=... node src/index.js --dry-run
```

List the Buffer channels the agent can see:

```bash
BUFFER_API_KEY=... npm run channels
```

The poster and text land in `output/<date>/`.

Other options: `--date 2026-11-10` picks the post date (default is tomorrow),
`--mode draft|schedule|queue` overrides the mode, and `--force` posts again
for a date that was already done.

## Changing things

- **Posting times, pillars, brand details:** edit `config.json`.
- **Poster look:** edit the CSS in `src/poster.js`.
- **Tone and rules for the writing:** edit `systemPrompt` in `src/content.js`.
- **Model:** set `CLAUDE_MODEL` (default `claude-opus-5-5`).

## Costs

- Claude: one request a day, roughly a few rupees a day.
- Buffer: the agent schedules only one day ahead, so it keeps very few posts
  in the queue at once. Check your plan's limit on scheduled posts per channel.
  The API limits (600 requests a day on Free) are far above the ~6 this uses.
- Cloudinary and GitHub Actions: within the free tiers.

## Notes

- Instagram posts need an Instagram business or creator account connected in Buffer.
- Claude is told never to invent statistics, client names or results. Still,
  read the first week's posts in `draft` mode before switching to `schedule`.
