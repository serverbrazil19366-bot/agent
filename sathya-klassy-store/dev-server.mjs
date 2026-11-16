// Local preview: node dev-server.mjs  →  http://localhost:8888
// Serves public/ and runs the same /api handler with data saved in .data/.
// Local-only defaults below; on Netlify these come from environment variables.
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';

process.env.ADMIN_PASSWORD ||= 'sathya-local-dev';
process.env.PAYMENT_WEBHOOK_KEY ||= 'local-dev-webhook-key-0123456789';
const { handle } = await import('./lib/handler.mjs');
const root = path.resolve('public');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
const port = Number(process.env.PORT || 8888);

// same as netlify.toml, so CSP problems show up locally too
const toml = await fs.readFile('netlify.toml', 'utf8');
const SECURITY_HEADERS = { 'content-security-policy': /Content-Security-Policy = "([^"]+)"/.exec(toml)[1].replace('; upgrade-insecure-requests', ''), 'x-content-type-options': 'nosniff', 'x-frame-options': 'DENY', 'referrer-policy': 'strict-origin-when-cross-origin' };

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname.startsWith('/api/')) {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    const request = new Request(url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const r = await handle(request);
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
    return;
  }
  let file = path.join(root, decodeURIComponent(url.pathname));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
  } catch { if (!path.extname(file)) file += '.html'; }
  try {
    const data = await fs.readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', ...SECURITY_HEADERS });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html', ...SECURITY_HEADERS });
    res.end(await fs.readFile(path.join(root, '404.html')).catch(() => 'Not found'));
  }
}).listen(port, () => console.log(`Sathya Klassy store: http://localhost:${port}  (local admin password: ${process.env.ADMIN_PASSWORD})`));
