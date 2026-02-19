#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

/**
 * Production-grade site validator for Proof Over Hype
 *
 * Validates:
 * 1) site-manifest.json exists and is well-formed
 * 2) sitemap.xml exists and contains every URL implied by manifest.pages
 * 3) Every manifest route (except "/") has a corresponding /<route>/index.html
 * 4) Every published HTML page (excluding partials/templates) uses shared includes:
 *    - data-include="/partials/header.html"
 *    - data-include="/partials/footer.html"
 *    - script src="/js/include-partials.js"
 * 5) Link hygiene:
 *    - No ./ or ../ href/src
 *    - No .html links (use folder routes)
 *    - Internal hrefs must be root-relative
 * 6) Basic SEO sanity checks on published pages:
 *    - <title> exists
 *    - meta description exists
 *    - canonical exists
 *
 * Intentionally excludes:
 * - partials/**  (fragments; not full pages)
 * - templates/** (reference files; not published)
 * - scripts/**   (not published)
 * - .github/**, node_modules/**, etc.
 */

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([
  ".git",
  ".github",
  "node_modules",
  "partials",
  "templates",
  "scripts",
  "assets",
  "images",
  "img",
  "static",
  "dist",
  "build",
  "vendor",
]);

const REQUIRED_FILES = [
  "site-manifest.json",
  "sitemap.xml",
  "partials/header.html",
  "partials/footer.html",
  "js/include-partials.js",
];

function die(message) {
  console.error(`\n❌ ${message}\n`);
  process.exit(1);
}

function warn(message) {
  console.warn(`\n⚠️ ${message}\n`);
}

function existsRel(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function readTextRel(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function readJsonRel(rel) {
  try {
    return JSON.parse(readTextRel(rel));
  } catch (e) {
    die(`Failed to parse JSON: ${rel}\n${e.message}`);
  }
}

/**
 * Normalize URL for comparison:
 * - parse as URL
 * - treat www/non-www as equivalent by stripping leading "www."
 * - normalize pathname: folder routes end with "/" (except "/")
 */
function normalizeUrlForCompare(input) {
  const s = String(input || "").trim();
  if (!s) return "";

  let u;
  try {
    u = new URL(s);
  } catch {
    // If not absolute, try as path
    u = new URL(s, "https://example.invalid");
  }

  const host = (u.hostname || "").toLowerCase();
  const hostSansWww = host.startsWith("www.") ? host.slice(4) : host;

  let pathname = u.pathname || "/";
  const looksLikeFile = /\.[a-z0-9]+$/i.test(pathname);
  if (!looksLikeFile && pathname !== "/" && !pathname.endsWith("/")) {
    pathname += "/";
  }

  return `${hostSansWww}${pathname}`;
}

function toAbsolute(baseUrl, pagePath) {
  return new URL(pagePath, baseUrl).toString();
}

function ensureFolderRoute(p) {
  return p === "/" || p.endsWith("/");
}

function extractSitemapLocs(xml) {
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(String(m[1]).trim());
  }
  return locs;
}

function shouldIgnorePath(relPosix) {
  const parts = relPosix.split("/");
  return parts.some((seg) => IGNORE_DIRS.has(seg));
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function listPublishedHtmlFiles(dirAbs) {
  const out = [];

  function walk(currentAbs) {
    const entries = fs.readdirSync(currentAbs, { withFileTypes: true });
    for (const ent of entries) {
      const fullAbs = path.join(currentAbs, ent.name);
      const relPosix = toPosix(path.relative(ROOT, fullAbs));

      if (ent.isDirectory()) {
        if (shouldIgnorePath(relPosix)) continue;
        walk(fullAbs);
        continue;
      }

      if (!ent.isFile()) continue;
      if (!ent.name.toLowerCase().endsWith(".html")) continue;

      // Exclude any html under ignored dirs (belt + suspenders)
      if (shouldIgnorePath(relPosix)) continue;

      out.push(relPosix);
    }
  }

  walk(dirAbs);
  return out;
}

function isPublishedPage(relPosix) {
  // Published "pages" are typically index.html files or root 404.html.
  // We validate all published html files (excluding partials/templates/scripts).
  return true;
}

function assertRequiredFilesExist() {
  for (const f of REQUIRED_FILES) {
    if (!existsRel(f)) die(`Missing required file: ${f}`);
  }
}

function validateManifestAndSitemap() {
  const manifest = readJsonRel("site-manifest.json");

  if (!manifest || typeof manifest !== "object") {
    die("site-manifest.json is not a valid JSON object.");
  }

  const { baseUrl, sections, pages } = manifest;

  if (!baseUrl || typeof baseUrl !== "string") {
    die(`site-manifest.json missing "baseUrl" (string).`);
  }

  if (!Array.isArray(sections)) {
    die(`site-manifest.json "sections" must be an array.`);
  }

  if (!Array.isArray(pages) || pages.length === 0) {
    die(`site-manifest.json "pages" must be a non-empty array (include at least "/").`);
  }

  // Enforce route formatting
  for (const p of pages) {
    if (typeof p !== "string") die(`site-manifest.json "pages" contains a non-string value.`);
    if (!p.startsWith("/")) die(`Manifest page must start with "/": "${p}"`);
    if (!ensureFolderRoute(p)) die(`Manifest page must be "/" or end with "/": "${p}"`);
  }

  // Sitemap checks
  const sitemapXml = readTextRel("sitemap.xml");
  const locs = extractSitemapLocs(sitemapXml);

  if (locs.length === 0) {
    die("sitemap.xml has no <loc> entries.");
  }

  const sitemapSet = new Set(locs.map(normalizeUrlForCompare));

  // Must contain every manifest page URL
  for (const p of pages) {
    const abs = toAbsolute(baseUrl, p);
    const key = normalizeUrlForCompare(abs);
    if (!sitemapSet.has(key)) {
      die(`sitemap.xml missing URL: ${abs}`);
    }
  }

  // Route -> file existence checks
  for (const p of pages) {
    if (p === "/") continue;

    const folder = p.replace(/^\/+/, "").replace(/\/+$/, ""); // "/about/" => "about"
    const fileRel = `${folder}/index.html`;
    if (!existsRel(fileRel)) {
      die(`Missing file for route "${p}": expected ${fileRel}`);
    }
  }

  return { manifest };
}

function validateHtmlPages() {
  const htmlFiles = listPublishedHtmlFiles(ROOT);

  const badRelative = /(href|src)=["'](\.\.\/|\.\/)/g;
  const badHtmlLinks = /(href|src)=["'][^"']+\.html(["'#?]|$)/gi;

  for (const rel of htmlFiles) {
    if (!isPublishedPage(rel)) continue;

    // Allow 404.html if you ever add it
    if (rel === "404.html") continue;

    const abs = path.join(ROOT, rel);
    const html = fs.readFileSync(abs, "utf8");

    // Required shared include system
    if (!html.includes('data-include="/partials/header.html"')) {
      die(`Missing header partial include in: ${rel}`);
    }
    if (!html.includes('data-include="/partials/footer.html"')) {
      die(`Missing footer partial include in: ${rel}`);
    }
    if (!html.includes('src="/js/include-partials.js"')) {
      die(`Missing include-partials.js script in: ${rel}`);
    }

    // Link hygiene
    if (badRelative.test(html)) {
      die(`Found relative ./ or ../ link in: ${rel}`);
    }

    if (badHtmlLinks.test(html)) {
      die(`Found ".html" link in: ${rel} (use folder routes like "/about/")`);
    }

    // Root-relative internal hrefs
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
    for (const href of hrefs) {
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        href.startsWith("javascript:")
      ) {
        continue;
      }

      if (href.trim() === "") continue;

      if (!href.startsWith("/")) {
        die(`Non-root-relative href "${href}" in ${rel}`);
      }
    }

    // Basic SEO sanity checks (lightweight; won’t over-block Codex)
    if (!/<title>[^<]+<\/title>/i.test(html)) {
      die(`Missing <title> in: ${rel}`);
    }

    if (!/<meta\s+name=["']description["']\s+content=["'][^"']+["']\s*\/?>/i.test(html)) {
      die(`Missing meta description in: ${rel}`);
    }

    if (!/<link\s+rel=["']canonical["']\s+href=["'][^"']+["']\s*\/?>/i.test(html)) {
      die(`Missing canonical link tag in: ${rel}`);
    }
  }
}

function main() {
  assertRequiredFilesExist();

  validateManifestAndSitemap();
  validateHtmlPages();

  console.log("✅ validate-site passed");
}

main();
