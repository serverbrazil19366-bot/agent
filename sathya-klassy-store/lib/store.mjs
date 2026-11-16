// Storage for the shop. On Netlify it uses Netlify Blobs (no outside database
// needed). Locally (npm run dev) it writes JSON and image files under .data/.

import { promises as fs } from 'node:fs';
import path from 'node:path';

const onNetlify = Boolean(
  process.env.NETLIFY_BLOBS_CONTEXT || process.env.NETLIFY || globalThis.Netlify
);

function fileStore(root) {
  const file = (key) => path.join(root, ...key.split('/').map(encodeURIComponent));
  return {
    async getJSON(key) {
      try { return JSON.parse(await fs.readFile(file(key), 'utf8')); }
      catch (e) { if (e.code === 'ENOENT') return null; throw e; }
    },
    async setJSON(key, value) {
      await fs.mkdir(path.dirname(file(key)), { recursive: true });
      await fs.writeFile(file(key), JSON.stringify(value, null, 2));
    },
    async getBinary(key) {
      try {
        const data = await fs.readFile(file(key));
        const meta = await this.getJSON(key + '.meta');
        return { data, type: meta?.type || 'application/octet-stream' };
      } catch (e) { if (e.code === 'ENOENT') return null; throw e; }
    },
    async setBinary(key, buf, type) {
      await fs.mkdir(path.dirname(file(key)), { recursive: true });
      await fs.writeFile(file(key), buf);
      await this.setJSON(key + '.meta', { type });
    },
    async delete(key) {
      await fs.rm(file(key), { force: true });
      await fs.rm(file(key + '.meta'), { force: true });
    },
    async list(prefix) {
      const dir = path.dirname(file(prefix + 'x'));
      const start = encodeURIComponent(prefix.split('/').pop());
      try {
        const names = await fs.readdir(dir);
        const base = prefix.split('/').slice(0, -1).join('/');
        return names
          .filter((n) => n.startsWith(start) && !n.endsWith('.meta'))
          .map((n) => (base ? base + '/' : '') + decodeURIComponent(n));
      } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    },
  };
}

async function blobStore() {
  const { getStore } = await import('@netlify/blobs');
  const store = getStore({ name: 'sathya-klassy', consistency: 'strong' });
  return {
    getJSON: (key) => store.get(key, { type: 'json' }),
    setJSON: (key, value) => store.setJSON(key, value),
    async getBinary(key) {
      const res = await store.getWithMetadata(key, { type: 'arrayBuffer' });
      if (!res) return null;
      return { data: Buffer.from(res.data), type: res.metadata?.type || 'application/octet-stream' };
    },
    setBinary: (key, buf, type) => store.set(key, buf, { metadata: { type } }),
    delete: (key) => store.delete(key),
    async list(prefix) {
      const { blobs } = await store.list({ prefix });
      return blobs.map((b) => b.key);
    },
  };
}

let cached;
export async function getStore() {
  if (!cached) {
    cached = onNetlify
      ? await blobStore()
      : fileStore(process.env.SHOP_DATA_DIR || path.resolve('.data'));
  }
  return cached;
}
