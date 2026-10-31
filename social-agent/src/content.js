// Writes the day's post with Claude: poster copy plus one caption per network.
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";

const MODEL = process.env.CLAUDE_MODEL || "claude-opus-5-5";

const PostSchema = z.object({
  topic: z.string().describe("Short internal label for today's topic, used to avoid repeats"),
  poster: z.object({
    kicker: z.string().describe("2-4 word label above the headline, e.g. 'SEO TIP'"),
    headline: z.string().describe("Poster headline, max 9 words"),
    highlight: z.string().describe("One or two words copied exactly from the headline to colour as the accent"),
    subline: z.string().describe("One supporting sentence, max 20 words"),
    points: z.array(z.string()).describe("For tips/checklist: 3 or 4 points of max 9 words each. For myth: exactly 2 items, the myth then the fact. For quote/question: empty array"),
    cta: z.string().describe("Short call to action for the poster footer, max 6 words"),
  }),
  captions: z.object({
    instagram: z.string().describe("Instagram caption: hook line, 3-6 short lines of value, CTA ('link in bio' or DM), then 8-12 relevant hashtags on the last line"),
    facebook: z.string().describe("Facebook caption: friendly, 60-120 words, ends with the website link and WhatsApp number, 2-4 hashtags"),
    linkedin: z.string().describe("LinkedIn post: professional, 120-220 words, short paragraphs, a clear takeaway, ends with the website link and 3-5 hashtags"),
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
- Every caption must stand on its own; do not refer to "the image above".`;
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
