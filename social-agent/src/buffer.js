// Buffer GraphQL API (https://developers.buffer.com). Auth: personal API key
// from https://publish.buffer.com/settings/api in BUFFER_API_KEY.
const ENDPOINT = "https://api.buffer.com";

async function gql(query, variables = {}) {
  const key = process.env.BUFFER_API_KEY;
  if (!key) throw new Error("BUFFER_API_KEY is not set");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.errors?.length) {
    const msg = body.errors?.map((e) => e.message).join("; ") || res.statusText;
    throw new Error(`Buffer API ${res.status}: ${msg}`);
  }
  return body.data;
}

export async function listOrganizations() {
  const data = await gql(`query { account { organizations { id name } } }`);
  return data.account.organizations;
}

export async function listChannels(organizationId) {
  const data = await gql(
    `query Channels($org: OrganizationId!) { channels(input: { organizationId: $org }) { id name service } }`,
    { org: organizationId },
  );
  return data.channels;
}

// Picks one channel per wanted service. BUFFER_CHANNEL_IDS (comma separated)
// overrides discovery; otherwise channels are found by service, preferring
// names that contain config.channels.nameMatch.
export async function resolveChannels({ services, nameMatch }) {
  const orgs = process.env.BUFFER_ORG_ID
    ? [{ id: process.env.BUFFER_ORG_ID }]
    : await listOrganizations();
  const all = (await Promise.all(orgs.map((o) => listChannels(o.id)))).flat();

  const pinned = (process.env.BUFFER_CHANNEL_IDS || "").split(",").map((s) => s.trim()).filter(Boolean);
  if (pinned.length) return all.filter((c) => pinned.includes(c.id));

  const match = (nameMatch || "").toLowerCase();
  return services.flatMap((service) => {
    const ofService = all.filter((c) => c.service === service);
    const preferred = ofService.filter((c) => match && c.name.toLowerCase().includes(match));
    const pick = (preferred.length ? preferred : ofService)[0];
    if (!pick) console.warn(`! No ${service} channel connected in Buffer - skipping ${service}.`);
    return pick ? [pick] : [];
  });
}

const CREATE_POST = `
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    ... on PostActionSuccess { post { id dueAt } }
    ... on MutationError { message }
  }
}`;

function metadataFor(service) {
  if (service === "instagram") return { instagram: { type: "post", shouldShareToFeed: true } };
  if (service === "facebook") return { facebook: { type: "post" } };
  return undefined;
}

// mode "schedule" posts at dueAt; "draft" saves it to Buffer drafts for a
// human to approve; "queue" drops it into the channel's next free slot.
export async function createPost({ channel, text, imageUrl, altText, dueAt, mode }) {
  const input = {
    channelId: channel.id,
    text,
    schedulingType: "automatic",
    assets: [{ image: { url: imageUrl, ...(altText ? { metadata: { altText } } : {}) } }],
    metadata: metadataFor(channel.service),
  };
  if (mode === "queue" || !dueAt) input.mode = "addToQueue";
  else {
    input.mode = "customScheduled";
    input.dueAt = dueAt;
  }
  if (mode === "draft") input.saveToDraft = true;

  const result = (await gql(CREATE_POST, { input })).createPost;
  if (result.message) throw new Error(`Buffer refused the ${channel.service} post: ${result.message}`);
  return result.post;
}
