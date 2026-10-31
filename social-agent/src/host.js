// Buffer has no upload endpoint: it needs a public, permanent image URL.
// We upload the poster to Cloudinary (free tier) and hand Buffer its URL.
// CLOUDINARY_URL looks like cloudinary://<api_key>:<api_secret>@<cloud_name>
// (copy it from the Cloudinary dashboard).
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function credentials() {
  const raw = process.env.CLOUDINARY_URL;
  const m = raw && raw.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) throw new Error("CLOUDINARY_URL is not set (format: cloudinary://API_KEY:API_SECRET@CLOUD_NAME)");
  return { apiKey: m[1], apiSecret: m[2], cloud: m[3] };
}

export async function uploadImage(file, publicId) {
  const { apiKey, apiSecret, cloud } = credentials();
  const params = { folder: "astra-nexora-social", overwrite: "true", public_id: publicId, timestamp: String(Math.floor(Date.now() / 1000)) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join("&");
  const signature = createHash("sha1").update(toSign + apiSecret).digest("hex");

  const form = new FormData();
  for (const [k, v] of Object.entries(params)) form.append(k, v);
  form.append("api_key", apiKey);
  form.append("signature", signature);
  form.append("file", new Blob([readFileSync(file)], { type: "image/png" }), `${publicId}.png`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: form });
  const body = await res.json();
  if (!res.ok) throw new Error(`Cloudinary upload failed: ${body.error?.message ?? res.status}`);
  return body.secure_url;
}
