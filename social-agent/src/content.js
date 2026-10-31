// Writes the day's post with Claude: poster copy plus one caption per network.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { ICON_NAMES, VISUALS } from "./poster.js";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

const PostSchema = z.object({
  topic: z.string().describe("Short internal label for today's topic, used to avoid repeats"),
  poster: z.object({
    kicker: z.string().describe("Short line above the headline, max 5 words, e.g. 'Being online isn't enough.'"),
    headline: z.string().describe("Poster headline, max 9 words, often two short sentences, e.g. 'Your customers are searching. Can they find you?'"),
    highlight: z.string().describe("The part of the headline to colour blue, copied exactly (usually the second sentence)"),
    subline: z.string().describe("One supporting sentence, max 12 words"),
    visual: z.enum(VISUALS).describe("Device mockup: search (Google-style results), website (landing page), dashboard (growth charts), social (phone with a post), chat (WhatsApp-style automation)"),
    visualText: z.string().describe("Text shown inside the mockup, max 6 words: the search query, page button, report title, post title or the customer's chat message"),
    badges: z.array(z.object({ icon: z.enum(ICON_NAMES), label: z.string().describe("Max 3 words, no numbers, e.g. 'More enquiries'") })).describe("3 floating outcome badges (shown with laptop mockups)"),
    points: z.array(z.object({ icon: z.enum(ICON_NAMES), title: z.string().describe("Max 4 words"), text: z.string().describe("Max 8 words") })).describe("Exactly 3 feature cards: the tips, checklist items, myth/fact/fix, or ways we help"),
    benefits: z.array(z.object({ icon: z.enum(ICON_NAMES), label: z.string().describe("Max 2 words") })).describe("Exactly 4 short benefits for the bottom row"),
    cta: z.string().describe("Call-to-action button text, max 6 words, e.g. 'Let's improve your search visibility'"),
  }),
  captions: z.object({
    instagram: z.string().describe("Instagram caption: hook line, 3-6 short lines of value, CTA ('link in bio' or DM), then 8-12 relevant hashtags on the last line"),
    facebook: z.string().describe("Facebook caption: friendly, 60-120 words, ends with the website link and WhatsApp number, 2-4 hashtags"),
    twitter: z.string().describe("X (Twitter) post: one punchy takeaway, at most 250 characters including the website link and 1-2 hashtags"),
    linkedin: z.string().describe("LinkedIn post (posted by hand): professional, 120-220 words, short paragraphs, a clear takeaway, ends with the website link and 3-5 hashtags"),
  }),
  altText: z.string().describe("Image alt text describing the poster for screen readers"),
});

function systemPrompt(brand) {
  return `You are the in-house social media manager for ${brand.name} (${brand.tagline}).

About the company: ${brand.about}
Audience: ${brand.audience}
Voice: ${brand.voice}

Contact details you may use: website ${brand.website}, Instagram ${brand.instagramHandle}, WhatsApp ${brand.whatsapp}, email ${brand.email}.

Rules:
- Never invent statistics, client names, results, awards or testimonials. If a number is not common public knowledge, leave it out.
- Give advice that is correct and current; prefer specific, doable actions over vague motivation.
- Write in English for an Indian business audience. Use Indian context (Google Maps searches, WhatsApp enquiries, local shops and clinics) where it helps.
- No emojis on the poster text. Captions may use a few emojis, sparingly.
- Every caption must stand on its own; do not refer to "the image above".
- Never mention these names, or anything related to them, anywhere: ${(brand.neverMention ?? []).join(", ") || "(none)"}.`;
}

export async function writePost({ config, date, pillar, recentTopics }) {
  const client = new Anthropic();
  const recent = recentTopics.length
    ? recentTopics.map((t) => `- ${t}`).join("\n")
    : "- (none yet)";

  const prompt = `Create the ${config.brand.name} social media post for ${date}.

Content pillar: ${pillar.name}
Poster format: ${pillar.format}
Brief: ${pillar.brief}

Topics already used recently (pick something clearly different):
${recent}

Return the poster copy and the three captions.`;

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    output_config: { effort: "medium", format: zodOutputFormat(PostSchema) },
    system: systemPrompt(config.brand),
    messages: [{ role: "user", content: prompt }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`Claude declined to write the post: ${response.stop_details?.explanation ?? "no reason given"}`);
  }
  if (!response.parsed_output) {
    throw new Error(`Claude returned no usable post (stop_reason: ${response.stop_reason})`);
  }
  return response.parsed_output;
}
