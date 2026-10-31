// Daily run: pick the day's pillar, write the post with Claude, design the
// poster, host it, and schedule it on Instagram, Facebook and LinkedIn in Buffer.
//
//   node src/index.js                 prepare tomorrow's post (the default)
//   node src/index.js --date 2026-11-03
//   node src/index.js --dry-run       write + design only, nothing is uploaded or scheduled
//   node src/index.js --sample        skip Claude and use sample copy (to check the design)
//   node src/index.js --mode draft    save to Buffer drafts instead of scheduling
//   node src/index.js --force         run again for a date that was already posted
//   node src/index.js --post post.json --dry-run
//                                     design a poster from copy written elsewhere
//                                     (the no-API-key routine, see ROUTINE.md)
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { writePost } from "./content.js";
import { posterHtml, renderPoster, THEME_NAMES } from "./poster.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const config = JSON.parse(readFileSync(path.join(root, "config.json"), "utf8"));
const historyFile = path.join(root, "history.json");

function parseArgs(argv) {
  const args = { dryRun: false, sample: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--sample") args.sample = true;
    else if (a === "--force") args.force = true;
    else if (a === "--date") args.date = argv[++i];
    else if (a === "--mode") args.mode = argv[++i];
    else if (a === "--post") args.post = argv[++i];
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

// Calendar date in the brand's timezone, `days` from now.
function localDate(tz, days = 0) {
  const d = new Date(Date.now() + days * 86400000);
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

// "2026-11-03" + "18:30" in Asia/Kolkata -> ISO UTC timestamp.
function zonedToUtc(date, time, tz) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" })
      .formatToParts(new Date(guess)).map((p) => [p.type, p.value]),
  );
  const asLocal = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
  return new Date(guess - (asLocal - guess)).toISOString();
}

const SAMPLE = {
  topic: "Google Business Profile photos",
  poster: {
    kicker: "Local SEO tip",
    headline: "Get found on Google Maps this week",
    highlight: "Google Maps",
    subline: "Small fixes to your Business Profile bring more calls from people nearby.",
    points: ["Pick the most exact primary category", "Add 10 real photos of your shop and team", "Reply to every review within 48 hours", "Post an offer or update every week"],
    cta: "Free profile audit - DM us",
  },
  captions: {
    instagram: "Sample Instagram caption.\n\n#digitalmarketing #localseo",
    facebook: "Sample Facebook caption. https://astranexora.netlify.app/",
    twitter: "Sample X post. https://astranexora.netlify.app/",
    linkedin: "Sample LinkedIn post. https://astranexora.netlify.app/",
  },
  altText: "Astra Nexora poster with four Google Business Profile tips.",
};

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const tz = config.timezone;
  const date = args.date || localDate(tz, 1);
  const mode = args.mode || process.env.POST_MODE || config.mode;
  if (!["schedule", "draft", "queue"].includes(mode)) throw new Error(`Unknown mode "${mode}" (use schedule, draft or queue)`);

  const history = existsSync(historyFile) ? JSON.parse(readFileSync(historyFile, "utf8")) : [];
  if (!args.dryRun && !args.force && history.some((h) => h.date === date)) {
    console.log(`Already posted for ${date}. Use --force to post again.`);
    return;
  }

  const weekday = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }).toLowerCase();
  const pillar = config.pillars[weekday];
  const dayNumber = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86400000);
  const theme = THEME_NAMES[dayNumber % THEME_NAMES.length];
  console.log(`> ${date} (${weekday}) - ${pillar.name}, ${pillar.format} format, ${theme} theme`);

  const post = args.post
    ? JSON.parse(readFileSync(args.post, "utf8"))
    : args.sample
    ? SAMPLE
    : await writePost({ config, date, pillar, recentTopics: history.slice(-30).map((h) => `${h.pillar}: ${h.topic}`) });
  console.log(`> Topic: ${post.topic}`);

  const outDir = path.join(root, "output", date);
  mkdirSync(outDir, { recursive: true });
  const posterFile = path.join(outDir, "poster.png");
  await renderPoster(posterHtml({ post, pillar, brand: config.brand, theme }), posterFile);
  writeFileSync(path.join(outDir, "post.json"), JSON.stringify({ date, pillar: pillar.name, theme, ...post }, null, 2));
  console.log(`> Poster: ${path.relative(process.cwd(), posterFile)}`);

  if (args.dryRun) {
    console.log("> Dry run: nothing uploaded or scheduled.");
    return;
  }

  const { uploadImage } = await import("./host.js");
  const { resolveChannels, createPost } = await import("./buffer.js");

  const imageUrl = await uploadImage(posterFile, `${date}-${pillar.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`);
  console.log(`> Image: ${imageUrl}`);

  const channels = await resolveChannels(config.channels);
  if (!channels.length) throw new Error("No Buffer channels found. Run `npm run channels` to check your connected pages.");

  const scheduled = [];
  const failures = [];
  for (const channel of channels) {
    const text = post.captions[channel.service];
    if (!text) {
      console.warn(`! No caption for ${channel.service}; skipping ${channel.name}.`);
      continue;
    }
    let dueAt = zonedToUtc(date, config.postTimes[channel.service] ?? "18:30", tz);
    let channelMode = mode;
    if (mode !== "queue" && Date.parse(dueAt) < Date.now() + 5 * 60000) {
      console.warn(`! ${channel.service} time ${dueAt} has passed; adding to the Buffer queue instead.`);
      channelMode = mode === "draft" ? "draft" : "queue";
      if (channelMode === "draft") dueAt = undefined;
    }
    try {
      const created = await createPost({ channel, text, imageUrl, altText: post.altText, dueAt, mode: channelMode });
      console.log(`> ${channel.service.padEnd(9)} ${channelMode === "draft" ? "saved as draft" : `scheduled for ${created.dueAt}`} (${channel.name})`);
      scheduled.push({ service: channel.service, postId: created.id, dueAt: created.dueAt ?? null });
    } catch (err) {
      console.error(`x ${channel.service}: ${err.message}`);
      failures.push(channel.service);
    }
  }

  for (const service of config.channels.manual ?? []) {
    if (post.captions[service]) console.log(`\n--- ${service} caption (post this by hand) ---\n${post.captions[service]}\n`);
  }

  if (scheduled.length) {
    history.push({ date, pillar: pillar.name, topic: post.topic, headline: post.poster.headline, imageUrl, mode, scheduled });
    writeFileSync(historyFile, JSON.stringify(history, null, 2) + "\n");
  }
  if (failures.length) {
    process.exitCode = 1;
    console.error(`Failed for: ${failures.join(", ")}`);
  }
}

main().catch((err) => {
  console.error(`x ${err.message}`);
  process.exit(1);
});
