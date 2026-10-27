/* =====================================================
   ASTRA NEXORA — STOCK PHOTO PIPELINE

   1. Downloads each photo in scripts/images.json
      (or uses a file you saved by hand in scripts/originals/)
   2. Converts it to WebP at every width (w800 / w1200 / w2000)
      with the same grade, so the set stays consistent
   3. Writes assets/stock/CREDITS.md
   4. Builds assets/og-image.jpg (1200×630) from the photo marked "og"

   Usage:
     npm install
     npm run images                 # all photos
     npm run images -- --slot hero  # one slot only

   Manual fallback: download the photo from its page and save it as
   scripts/originals/<source>-<id>.jpg (e.g. pexels-35184837.jpg).
===================================================== */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const originalsDir = path.join(root, "scripts", "originals");
const stockDir = path.join(root, "assets", "stock");

const config = JSON.parse(
    await readFile(path.join(root, "scripts", "images.json"), "utf8")
);

const slotArg = process.argv.indexOf("--slot");
const onlySlot = slotArg > -1 ? process.argv[slotArg + 1] : null;

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/128.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/jpeg,image/*,*/*;q=0.8"
};


/* =====================================================
   DOWNLOAD
===================================================== */

async function exists(file) {
    try {
        await access(file);
        return true;
    } catch {
        return false;
    }
}

async function fetchImage(url) {
    const res = await fetch(url, { headers, redirect: "follow" });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) {
        throw new Error(`${res.status} ${type} — ${url}`);
    }
    return Buffer.from(await res.arrayBuffer());
}

async function ogImageFromPage(pageUrl) {
    const res = await fetch(pageUrl, { headers: { ...headers, Accept: "text/html" } });
    if (!res.ok) throw new Error(`${res.status} — ${pageUrl}`);
    const html = await res.text();
    const match = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    if (!match) throw new Error(`no og:image on ${pageUrl}`);
    return match[1].replace(/&amp;/g, "&");
}

function candidateUrls(image) {
    if (image.url) {
        return [image.url];
    }
    if (image.source === "pexels") {
        return [
            `https://images.pexels.com/photos/${image.id}/pexels-photo-${image.id}.jpeg?auto=compress&cs=tinysrgb&w=2600`
        ];
    }
    if (image.source === "unsplash") {
        return [`https://unsplash.com/photos/${image.id}/download?force=true&w=2600`];
    }
    return [];
}

async function download(image) {
    const errors = [];

    for (const url of candidateUrls(image)) {
        try {
            return await fetchImage(url);
        } catch (err) {
            errors.push(err.message);
        }
    }

    try {
        const og = new URL(await ogImageFromPage(image.page));
        og.searchParams.set("w", "2600");
        og.searchParams.delete("h");
        og.searchParams.delete("fit");
        return await fetchImage(og.toString());
    } catch (err) {
        errors.push(err.message);
    }

    throw new Error(errors.join("\n    "));
}


/* =====================================================
   CONVERT
===================================================== */

function baseName(image) {
    return `${image.source}-${image.id}`;
}

async function convert(image, buffer) {
    const outputs = [];
    const meta = await sharp(buffer).metadata();

    for (const width of config.widths) {
        const file = `${baseName(image)}-w${width}.webp`;
        const info = await sharp(buffer)
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .modulate(config.grade || {})
            .webp({ quality: config.quality })
            .toFile(path.join(stockDir, file));
        outputs.push({ file, width: info.width, height: info.height, kb: Math.round(info.size / 1024) });
    }

    if (image.og) {
        await sharp(buffer)
            .rotate()
            .resize(1200, 630, { fit: "cover", position: "attention" })
            .modulate(config.grade || {})
            .jpeg({ quality: 82, mozjpeg: true })
            .toFile(path.join(root, "assets", "og-image.jpg"));
    }

    return { original: `${meta.width}×${meta.height}`, outputs };
}


/* =====================================================
   CREDITS
===================================================== */

async function existingOutputs(image) {
    const outputs = [];
    for (const width of config.widths) {
        const file = `${baseName(image)}-w${width}.webp`;
        const full = path.join(stockDir, file);
        if (!(await exists(full))) return null;
        const meta = await sharp(full).metadata();
        const { size } = await import("node:fs/promises").then(fs => fs.stat(full));
        outputs.push({ file, width: meta.width, height: meta.height, kb: Math.round(size / 1024) });
    }
    return { outputs };
}

async function writeCredits(results) {
    // Keep entries from earlier runs (e.g. when only one --slot was processed)
    for (const image of config.images) {
        if (!results.has(baseName(image))) {
            const previous = await existingOutputs(image);
            if (previous) results.set(baseName(image), previous);
        }
    }

    const today = new Date().toISOString().slice(0, 10);
    const licence = {
        pexels: "[Pexels License](https://www.pexels.com/license/)",
        unsplash: "[Unsplash License](https://unsplash.com/license)"
    };

    const rows = config.images.map(image => {
        const result = results.get(baseName(image));
        const files = result
            ? result.outputs.map(o => `\`${o.file}\` (${o.width}×${o.height}, ${o.kb} KB)`).join("<br>")
            : "_not processed_";
        return `| ${image.slot} | ${image.status} | ${files} | [${image.title}](${image.page}) | ${image.photographer || "TODO — check source page"} | ${licence[image.source] || ""} | ${result ? today : ""} |`;
    });

    const md = [
        "# Stock photo credits",
        "",
        "Generated by `npm run images` from `scripts/images.json`. Edit the JSON, not this file.",
        "",
        "Grade applied to every photo (keeps the set consistent): " +
            `saturation ${config.grade?.saturation ?? 1}, WebP quality ${config.quality}.`,
        "",
        "| Slot | Status | Files | Source | Photographer | Licence | Downloaded |",
        "|------|--------|-------|--------|--------------|---------|------------|",
        ...rows,
        ""
    ].join("\n");

    await writeFile(path.join(stockDir, "CREDITS.md"), md);
}


/* =====================================================
   RUN
===================================================== */

await mkdir(originalsDir, { recursive: true });
await mkdir(stockDir, { recursive: true });

const results = new Map();
let failed = 0;

for (const image of config.images) {
    if (onlySlot && image.slot !== onlySlot) continue;

    const name = baseName(image);
    const original = path.join(originalsDir, `${name}.jpg`);

    try {
        let buffer;

        if (await exists(original)) {
            buffer = await readFile(original);
            console.log(`• ${name}: using saved original`);
        } else {
            buffer = await download(image);
            await writeFile(original, buffer);
            console.log(`• ${name}: downloaded`);
        }

        const result = await convert(image, buffer);
        results.set(name, result);
        console.log(`  ${result.original} → ${result.outputs.map(o => `${o.width}w ${o.kb}KB`).join(", ")}`);
    } catch (err) {
        failed++;
        console.error(`✗ ${name}: could not get the photo\n    ${err.message}`);
        console.error(`  Save it by hand as scripts/originals/${name}.jpg from ${image.page}`);
    }
}

await writeCredits(results);

console.log(failed ? `\nDone with ${failed} failure(s).` : "\nDone.");
process.exitCode = failed ? 1 : 0;
