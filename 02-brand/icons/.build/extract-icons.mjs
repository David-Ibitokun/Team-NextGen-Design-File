#!/usr/bin/env node
/**
 * Extract the exact Lucide icon geometry used by RouteX and emit standalone SVG files.
 * Geometry is read from the installed lucide-react package, so output is authentic
 * v0.469.0 artwork rather than hand-reproduced paths.
 *
 * Usage: node extract-icons.mjs <srcDir> <outDir>
 */
import fs from "node:fs";
import path from "node:path";

const [, , SRC_DIR, OUT_DIR] = process.argv;

if (!SRC_DIR || !OUT_DIR) {
  console.error("Usage: node extract-icons.mjs <srcDir> <outDir>");
  process.exit(1);
}

/* ------------------------------------------------------------------ *
 * 1. Discover which icons the RouteX frontend imports from lucide-react
 * ------------------------------------------------------------------ */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith(".jsx")) out.push(full);
  }
  return out;
}

const usage = new Map(); // IconName -> Set<relativeFile>

for (const file of walk(SRC_DIR)) {
  const text = fs.readFileSync(file, "utf8");
  const re = /import\s*\{([^}]*)\}\s*from\s*["']lucide-react["']/gs;
  for (const m of text.matchAll(re)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim();
      if (!name || name.includes(" as ")) continue;
      if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) continue;
      const rel = path.relative(SRC_DIR, file);
      if (!usage.has(name)) usage.set(name, new Set());
      usage.get(name).add(rel);
    }
  }
}

/* ------------------------------------------------------------------ *
 * 2. Index the installed lucide-react ESM icon modules
 * ------------------------------------------------------------------ */

const LUCIDE_ICONS = path.resolve(
  process.cwd(),
  "node_modules/lucide-react/dist/esm/icons"
);

if (!fs.existsSync(LUCIDE_ICONS)) {
  console.error(`Could not find lucide icon modules at ${LUCIDE_ICONS}`);
  process.exit(1);
}

/** PascalCase name -> raw module source */
const library = new Map();

/**
 * Lucide 0.469 renamed a number of icons and keeps the old names as deprecated
 * aliases (AlertCircle -> CircleAlert, PlusCircle -> CirclePlus, ...).
 * The package's own export table is the authoritative alias map, so we parse it
 * rather than hardcoding a list that could drift.
 */
const aliasToModule = new Map(); // exported name -> icon module file

const bundleSrc = fs.readFileSync(
  path.join(LUCIDE_ICONS, "..", "lucide-react.js"),
  "utf8"
);

for (const line of bundleSrc.split("\n")) {
  const m = line.match(/^export\s*\{([^}]*)\}\s*from\s*['"]\.\/icons\/([^'"]+)['"]/);
  if (!m) continue;
  const moduleFile = m[2];
  for (const part of m[1].split(",")) {
    const alias = part.trim().match(/^default\s+as\s+([A-Za-z0-9_]+)$/);
    if (alias) aliasToModule.set(alias[1], moduleFile);
  }
}

for (const [exportedName, moduleFile] of aliasToModule) {
  const full = path.join(LUCIDE_ICONS, moduleFile);
  if (!fs.existsSync(full)) continue;
  const src = fs.readFileSync(full, "utf8");
  // createLucideIcon("MapPin", [ ... ])
  const m = src.match(/createLucideIcon\(\s*["']([^"']+)["']\s*,\s*(\[[\s\S]*?\])\s*\)\s*;/);
  if (!m) continue;
  if (!library.has(exportedName)) {
    library.set(exportedName, { raw: m[2], canonical: m[1] });
  }
}

/** Canonical name -> exported alias names, for reporting deprecated usage. */
const canonicalToAliases = new Map();
for (const [exportedName, entry] of library) {
  if (!canonicalToAliases.has(entry.canonical)) canonicalToAliases.set(entry.canonical, []);
  canonicalToAliases.get(entry.canonical).push(exportedName);
}

/* ------------------------------------------------------------------ *
 * 3. Evaluate the node array and render SVG
 * ------------------------------------------------------------------ */

const VOID_TAGS = new Set(["path", "circle", "rect", "line", "polyline", "polygon", "ellipse"]);

/** Lucide's shared default stroke attributes. */
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

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderChildren(nodes) {
  return nodes
    .map(([tag, attrs]) => {
      if (!VOID_TAGS.has(tag)) return "";
      const pairs = Object.entries(attrs)
        .filter(([key]) => key !== "key")
        .map(([key, value]) => `${key}="${escapeAttr(value)}"`);
      return `<${tag} ${pairs.join(" ")} />`;
    })
    .join("");
}

function renderSvg(name, nodes) {
  const attrs = Object.entries(DEFAULTS)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");
  return `<svg ${attrs}>${renderChildren(nodes)}</svg>\n`;
}

/* ------------------------------------------------------------------ *
 * 4. Emit
 *
 * Several RouteX import names are deprecated Lucide aliases that resolve to
 * the same canonical artwork (AlertCircle and CircleAlert are one file, and
 * so on). We therefore write ONE SVG per canonical icon and record every
 * name it answers to in the manifest, so nothing is duplicated on disk.
 * ------------------------------------------------------------------ */

fs.mkdirSync(OUT_DIR, { recursive: true });

const requested = [...usage.keys()].sort((a, b) => a.localeCompare(b));
const missing = [];

/** canonical name -> { nodes, usedAs: Map<importName, files> } */
const byCanonical = new Map();

for (const name of requested) {
  const entry = library.get(name);
  if (!entry) {
    missing.push(name);
    continue;
  }

  let nodes;
  try {
    // The array literal is plain data (arrays, objects, strings, numbers).
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
  if (existing) {
    for (const f of usage.get(name)) existing.add(f);
  } else {
    bucket.usedAs.set(name, new Set(usage.get(name)));
  }
}

const manifest = [];

for (const [canonical, { nodes, usedAs }] of byCanonical) {
  const svg = renderSvg(canonical, nodes);
  const slug = canonical
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-zA-Z])(\d)/g, "$1-$2")
    .toLowerCase();

  fs.writeFileSync(path.join(OUT_DIR, `${slug}.svg`), svg, "utf8");

  const names = [...usedAs.keys()].sort();
  const allFiles = [...new Set([...usedAs.values()].flatMap((s) => [...s]))].sort();

  manifest.push({
    canonical,
    file: `${slug}.svg`,
    usedAs: names,
    aliases: (canonicalToAliases.get(canonical) ?? [canonical]).sort(),
    deprecatedAlias: names.some((n) => n !== canonical),
    elements: nodes.length,
    tags: [...new Set(nodes.map(([tag]) => tag))],
    svgBody: renderChildren(nodes),
    usedIn: allFiles,
  });
}

manifest.sort((a, b) => a.canonical.localeCompare(b.canonical));

/* ------------------------------------------------------------------ *
 * 4b. Sprite sheet — one file with a <symbol> per icon, for easy
 *     reference / hand-off to design tools.
 * ------------------------------------------------------------------ */

const sprite = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<!-- RouteX icon sprite — Lucide v0.469.0 (ISC). Generated by extract-icons.mjs. -->`,
  `<!-- Usage: <svg><use href="#lucide-CircleAlert" /></svg> -->`,
  `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`,
  ...manifest.map(
    (i) => `  <symbol id="lucide-${i.canonical}" viewBox="0 0 24 24">${i.svgBody}</symbol>`
  ),
  `</svg>`,
  ``,
].join("\n");

fs.writeFileSync(path.join(OUT_DIR, "sprite.svg"), sprite, "utf8");

/* ------------------------------------------------------------------ *
 * 5. Report
 * ------------------------------------------------------------------ */

fs.writeFileSync(path.join(OUT_DIR, "index.html"), `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>RouteX &mdash; Lucide Icon Set</title>
<style>
  :root {
    --navy: #142B3B; --teal: #087F8C; --offwhite: #F7F9FA;
    --amber: #F2B544; --red: #D64545; --green: #27865B; --slate: #667784;
    --border: #DCE4E8;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 32px 24px 56px;
    background: var(--offwhite); color: var(--avory, var(--navy));
    font: 15px/1.6 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  header { max-width: 1200px; margin: 0 auto 28px; }
  h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.4px; margin: 0 0 4px; }
  .sub { color: var(--slate); font-size: 13px; margin: 0; }
  .grid {
    max-width: 1200px; margin: 0 auto;
    display: grid; gap: 14px;
    grid-template-columns: repeat(auto-fill, minmax(168px, 1fr));
  }
  .card {
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    padding: 18px 14px; text-align: center; transition: all .15s ease;
  }
  .card:hover { border-color: var(--teal); box-shadow: 0 4px 12px rgba(8,127,140,.1); transform: translateY(-2px); }
  .glyph { width: 34px; height: 34px; color: var(--teal); margin-bottom: 10px; }
  .nm { font-size: 12px; font-weight: 700; letter-spacing: -0.1px; }
  .slug { font-size: 10px; color: var(--slate); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; margin-top: 3px; word-break: break-all; }
  .meta { font-size: 10px; color: var(--slate); margin-top: 6px; }
  .swatches { max-width: 1200px; margin: 32px auto 0; }
  .swatches h2 { font-size: 15px; font-weight: 800; margin: 0 0 12px; }
  .row { display: flex; flex-wrap: wrap; gap: 10px; }
  .sw { display: flex; align-items: center; gap: 8px; background: #fff;
        border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; font-size: 11px; }
  .dot { width: 14px; height: 14px; border-radius: 4px; }
  footer { max-width: 1200px; margin: 40px auto 0; color: var(--slate); font-size: 11px; }
</style>
</head>
<body>
<header>
  <h1>RouteX Icon Set</h1>
  <p class="sub">${manifest.length} unique icons &middot; ${requested.length} import names &middot; lucide-react v0.469.0 &middot; 24&times;24 &middot; stroke 2 &middot; ISC licensed</p>
</header>

<div class="grid">
${manifest
  .map(
    (i) => `  <div class="card">
    <svg class="glyph" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${i.svgBody}</svg>
    <div class="nm">${i.canonical}</div>
    <div class="slug">${i.file}</div>
    <div class="meta">${i.usedAs.length > 1 ? `imported as ${i.usedAs.join(", ")}` : `${i.usedAs[0]}`}</div>
    <div class="meta">${i.usedIn.length} file${i.usedIn.length === 1 ? "" : "s"}</div>
  </div>`
  )
  .join("\n")}
</div>

<div class="swatches">
  <h2>Applied icon colours</h2>
  <div class="row">
    <div class="sw"><span class="dot" style="background:#087F8C"></span> Primary accent</div>
    <div class="sw"><span class="dot" style="background:#F2B544"></span> Warning / stale</div>
    <div class="sw"><span class="dot" style="background:#D64545"></span> Danger / rejected</div>
    <div class="sw"><span class="dot" style="background:#27865B"></span> Success / resolved</div>
    <div class="sw"><span class="dot" style="background:#667784"></span> Muted</div>
  </div>
</div>

<footer>
  Extracted from the installed <code>lucide-react</code> package &mdash; geometry is authentic v0.469.0 artwork.
  In the application these render via <code>&lt;Icon className="w-4 h-4" /&gt;</code> and inherit <code>currentColor</code>.
</footer>
</body>
</html>
`, "utf8");

fs.writeFileSync(
  path.join(OUT_DIR, "manifest.json"),
  JSON.stringify(
    {
      lucideVersion: "0.469.0",
      uniqueIcons: manifest.length,
      importNamesUsed: requested.length,
      deprecatedAliasesUsed: manifest
        .filter((i) => i.deprecatedAlias)
        .map((i) => ({
          canonical: i.canonical,
          usedAs: i.usedAs.filter((n) => n !== i.canonical),
          file: i.file,
        })),
      icons: manifest.map(({ svgBody, ...rest }) => rest),
    },
    null,
    2
  ) + "\n",
  "utf8"
);

console.log(
  `Extracted ${manifest.length} unique icons (${requested.length} import names) to ${OUT_DIR}`
);

const deprecated = manifest.filter((i) => i.deprecatedAlias);
if (deprecated.length) {
  console.log(`\nDeprecated Lucide aliases in use (${deprecated.length}):`);
  for (const d of deprecated) {
    console.log(`  - ${d.usedAs.filter((n) => n !== d.canonical).join(", ")} -> ${d.canonical}`);
  }
}

if (missing.length) {
  console.log(`\nCould not resolve (${missing.length}):`);
  for (const m of missing) console.log(`  - ${m}`);
}
