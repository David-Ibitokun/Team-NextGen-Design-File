#!/usr/bin/env node
/**
 * Extract the Lucide icons used by the RouteX mobile app (React Native).
 *
 * The mobile app depends on `lucide-react-native@^1.59.0`. That package is the
 * React Native port of the same upstream Lucide geometry as `lucide-react`,
 * which IS installed in the frontend. Lucide's v0.469 -> v1.x changes were
 * export-name renames only (AlertCircle -> CircleAlert, etc.); the artwork is
 * identical. We therefore read geometry from the installed lucide-react
 * package, and resolve the mobile app's older export names through the
 * package's own alias table.
 *
 * Usage: node extract-mobile-icons.mjs <mobileSrcDir> <lucideReactDir> <outDir>
 */
import fs from "node:fs";
import path from "node:path";

const [, , MOBILE_SRC, LUCIDE_DIR, OUT_DIR] = process.argv;

if (!MOBILE_SRC || !LUCIDE_DIR || !OUT_DIR) {
  console.error(
    "Usage: node extract-mobile-icons.mjs <mobileSrcDir> <lucideReactDistEsmDir> <outDir>"
  );
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 1. Which icons does the mobile app import?
 * ------------------------------------------------------------------ */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

const usage = new Map(); // import name -> Set<relative file>

for (const file of walk(MOBILE_SRC)) {
  const text = fs.readFileSync(file, "utf8");
  const re = /import\s*\{([^}]*)\}\s*from\s*["']lucide-react-native["']/gs;
  for (const m of text.matchAll(re)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim();
      if (!name || name.includes(" as ")) continue;
      if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue;
      const rel = path.relative(MOBILE_SRC, file);
      if (!usage.has(name)) usage.set(name, new Set());
      usage.get(name).add(rel);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 2. Index the lucide-react package (geometry + alias table)
 * ------------------------------------------------------------------ */

const ICONS_DIR = path.join(LUCIDE_DIR, "icons");
if (!fs.existsSync(ICONS_DIR)) {
  console.error(`Could not find lucide icon modules at ${ICONS_DIR}`);
  process.exit(1);
}

/** exported name -> { raw, canonical } */
const library = new Map();

const bundleSrc = fs.readFileSync(path.join(LUCIDE_DIR, "lucide-react.js"), "utf8");

for (const line of bundleSrc.split("\n")) {
  const m = line.match(/^export\s*\{([^}]*)\}\s*from\s*['"]\.\/icons\/([^'"]+)['"]/);
  if (!m) continue;
  const moduleFile = m[2];
  const full = path.join(ICONS_DIR, moduleFile);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, "utf8");
  const cm = src.match(/createLucideIcon\(\s*["']([^"']+)["']\s*,\s*(\[[\s\S]*?\])\s*\)\s*;/);
  if (!cm) continue;

  // The export list holds every alias for this module, e.g.
  //   export { default as AlertCircle, default as CircleAlert, ... } from './icons/circle-alert.js';
  for (const part of m[1].split(",")) {
    const alias = part.trim().match(/^default\s+as\s+([A-Za-z0-9_]+)$/);
    if (alias && !library.has(alias[1])) {
      library.set(alias[1], { raw: cm[2], canonical: cm[1] });
    }
  }
}

/* ------------------------------------------------------------------ *
 * 3. Render
 * ------------------------------------------------------------------ */

const VOID_TAGS = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse"]);

const DEFAULTS = {
  xmlns: "http://www.w3.org/2000/svg",
  width: "24",
  height: "24",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

const esc = (v) =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function renderChildren(nodes) {
  return nodes
    .map(([tag, attrs]) => {
      if (!VOID_TAGS.has(tag)) return "";
      const pairs = Object.entries(attrs)
        .filter(([k]) => k !== "key")
        .map(([k, v]) => `${k}="${esc(v)}"`);
      return `<${tag} ${pairs.join(" ")} />`;
    })
    .join("");
}

function renderSvg(nodes) {
  const attrs = Object.entries(DEFAULTS)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<svg ${attrs}>${renderChildren(nodes)}</svg>\n`;
}

function slugify(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const requested = [...usage.keys()].sort((a, b) => a.localeCompare(b));
const missing = [];
const byCanonical = new Map();

for (const name of requested) {
  const entry = library.get(name);
  if (!entry) {
    missing.push(name);
    continue;
  }

  let nodes;
  try {
    nodes = new Function(`return ${entry.raw}`)();
  } catch (err) {
    missing.push(`${name} (parse error: ${err.message})`);
    continue;
  }

  if (!Array.isArray(nodes) || nodes.length === 0) {
    missing.push(`${name} (empty node array)`);
    continue;
  }

  if (!byCanonical.has(entry.canonical)) {
    byCanonical.set(entry.canonical, { nodes, usedAs: new Map() });
  }
  const bucket = byCanonical.get(entry.canonical);
  const existing = bucket.usedAs.get(name);
  if (existing) for (const f of usage.get(name)) existing.add(f);
  else bucket.usedAs.set(name, new Set(usage.get(name)));
}

const manifest = [];

for (const [canonical, { nodes, usedAs }] of byCanonical) {
  const slug = slugify(canonical);
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), renderSvg(nodes), "utf8");

  const names = [...usedAs.keys()].sort();
  const files = [...new Set([...usedAs.values()].flatMap((s) => [...s]))].sort();

  manifest.push({
    canonical,
    file: `${slug}.svg`,
    usedAs: names,
    elements: nodes.length,
    tags: [...new Set(nodes.map(([t]) => t))],
    svgBody: renderChildren(nodes),
    usedIn: files,
  });
}

manifest.sort((a, b) => a.canonical.localeCompare(b.canonical));

/* sprite */
fs.writeFileSync(
  path.join(OUT_DIR, "sprite.svg"),
  [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<!-- RouteX Mobile icon sprite — Lucide (ISC). Generated by extract-mobile-icons.mjs. -->`,
    `<!-- Usage: <svg><use href="#lucide-MapPin" /></svg> -->`,
    `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`,
    ...manifest.map((i) => `  <symbol id="lucide-${i.canonical}" viewBox="0 0 24 24">${i.svgBody}</symbol>`),
    `</svg>`,
    ``,
  ].join("\n"),
  "utf8"
);

/* manifest.json */
fs.writeFileSync(
  path.join(OUT_DIR, "manifest.json"),
  JSON.stringify(
    {
      package: "lucide-react-native@^1.59.0",
      geometrySource: "lucide-react@0.469.0 (identical upstream Lucide geometry)",
      uniqueIcons: manifest.length,
      importNamesUsed: requested.length,
      icons: manifest.map(({ svgBody, ...rest }) => rest),
    },
    null,
    2
  ) + "\n",
  "utf8"
);

/* gallery */
const CARDS = manifest
  .map(
    (i) => `  <div class="card">
    <svg class="glyph" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${i.svgBody}</svg>
    <div class="nm">${i.canonical}</div>
    <div class="slug">${i.file}</div>
    <div class="meta">${i.usedAs.join(", ")}</div>
    <div class="meta">${i.usedIn.length} file${i.usedIn.length === 1 ? "" : "s"}</div>
  </div>`
  )
  .join("\n");

fs.writeFileSync(
  path.join(OUT_DIR, "index.html"),
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>RouteX Mobile &mdash; Lucide Icon Set</title>
<style>
  :root {
    --navy: #142B3B; --navy-dark: #0D1E2A; --teal: #087F8C; --teal-light: #E6F4F6;
    --offwhite: #F7F9FA; --amber: #F2B544; --red: #D64545; --green: #27865B;
    --slate: #667784; --border: #DCE4E8;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 32px 24px 56px;
    background: var(--offwhite); color: var(--navy);
    font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  header { max-width: 1200px; margin: 0 auto 28px; }
  h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.4px; margin: 0 0 4px; }
  .sub { color: var(--slate); font-size: 13px; margin: 0; }
  .grid { max-width: 1200px; margin: 0 auto; display: grid; gap: 14px;
          grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); }
  .card { background: #fff; border: 1px solid var(--border); border-radius: 12px;
          padding: 18px 14px; text-align: center; transition: all .15s ease; }
  .card:hover { border-color: var(--teal); box-shadow: 0 4px 12px rgba(8,127,140,.1); transform: translateY(-2px); }
  .glyph { width: 34px; height: 34px; color: var(--teal); margin-bottom: 10px; }
  .nm { font-size: 12px; font-weight: 700; }
  .slug { font-size: 10px; color: var(--slate); font-family: ui-monospace, Menlo, monospace; margin-top: 3px; word-break: break-all; }
  .meta { font-size: 10px; color: var(--slate); margin-top: 4px; }
  footer { max-width: 1200px; margin: 40px auto 0; color: var(--slate); font-size: 11px; }
</style>
</head>
<body>
<header>
  <h1>RouteX Mobile Icon Set</h1>
  <p class="sub">${manifest.length} unique icons &middot; ${requested.length} import names &middot; lucide-react-native v1.59 &middot; 24&times;24 &middot; stroke 2 &middot; ISC licensed</p>
</header>
<div class="grid">
${CARDS}
</div>
<footer>
  Geometry matches <code>lucide-react-native@^1.59.0</code>. The same artwork is also used by the
  web app (<code>lucide-react@0.469.0</code>) &mdash; the two libraries share upstream Lucide geometry.
</footer>
</body>
</html>
`,
  "utf8"
);

console.log(
  `Extracted ${manifest.length} unique icons (${requested.length} import names) to ${OUT_DIR}`
);
if (missing.length) {
  console.log(`\nCould not resolve (${missing.length}):`);
  for (const m of missing) console.log(`  - ${m}`);
}
