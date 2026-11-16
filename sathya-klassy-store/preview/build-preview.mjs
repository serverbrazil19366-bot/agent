// Builds a static demo copy of the store (no backend) for a shareable preview.
// Usage: node preview/build-preview.mjs <out-dir>
// - links become relative files (shop.html, product.html?p=…), admin → admin.html
// - preview/demo-api.js answers /api calls inside the browser with sample data
import { promises as fs } from 'node:fs';
import path from 'node:path';
import * as seed from '../lib/seed.mjs';

const out = path.resolve(process.argv[2] || 'preview-dist');
const pub = path.resolve('public');
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

const pages = ['shop', 'product', 'checkout', 'track', 'policies'];
function rewrite(text) {
  return text
    .replace(/(["'`(])\/admin\/(?=["'`])/g, '$1admin.html')
    .replace(new RegExp(`(["'\`(])\\/(${pages.join('|')})(?=[?"'#\`)])`, 'g'), '$1$2.html')
    .replace(/(["'`(])\/(assets|css|js)\//g, '$1$2/')
    .replace(/(href=|NAV = \[\[)(["'])\/(["'])/g, '$1$2index.html$3')
    .replace(/'\/api\/'/g, "'api/'");
}

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else if (/\.(js|css)$/.test(e.name) && !s.includes('vendor')) await fs.writeFile(d, rewrite(await fs.readFile(s, 'utf8')));
    else await fs.copyFile(s, d);
  }
}
for (const dir of ['assets', 'css', 'js']) await copyDir(path.join(pub, dir), path.join(out, dir));

const demo = (await fs.readFile('preview/demo-api.js', 'utf8')).replace('__SEED__', JSON.stringify({
  CATEGORIES: seed.CATEGORIES, DEFAULT_SETTINGS: seed.DEFAULT_SETTINGS, SAMPLE_PRODUCTS: seed.SAMPLE_PRODUCTS,
}).replace(/"\/assets\//g, '"assets/'))
  .replace('__PARSER__', (await fs.readFile('lib/payments.mjs', 'utf8')).replace(/^export /gm, ''));
await fs.writeFile(path.join(out, 'js/demo-api.js'), demo);

const htmlFiles = [['index.html', 'index.html'], ['admin/index.html', 'admin.html'], ...['404', ...pages].map((p) => [p + '.html', p + '.html'])];
for (const [from, to] of htmlFiles) {
  let html = rewrite(await fs.readFile(path.join(pub, from), 'utf8'));
  if (from.startsWith('admin/')) html = html.replace(/href="\/"/g, 'href="index.html"');
  html = html.replace('<script src="', '<script src="js/demo-api.js"></script>\n<script src="');
  html = html.replace(/<meta name="robots"[^>]*>\n?/, '');
  await fs.writeFile(path.join(out, to), html);
}
// the artifact host wraps the main page in its own <html>/<head>/<body>
let index = await fs.readFile(path.join(out, 'index.html'), 'utf8');
index = index
  .replace(/<!doctype html>\s*<html[^>]*>\s*<head>\s*/i, '')
  .replace(/<meta charset="utf-8">\n?/, '')
  .replace(/<meta name="viewport"[^>]*>\n?/, '')
  .replace(/<\/head>\s*<body>\s*/i, '\n')
  .replace(/<\/body>\s*<\/html>\s*$/i, '')
  .replace(/<title>[^<]*<\/title>/, '<title>Sathya Klassy Fashion</title>');
await fs.writeFile(path.join(out, 'index.html'), index);
console.log('Preview built in', out);
