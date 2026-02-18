import fs from "fs";
import path from "path";

function fail(msg) {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

function readFile(p) {
  return fs.readFileSync(p, "utf8");
}

function exists(p) {
  return fs.existsSync(p);
}

function listHtmlFiles(dir) {
  const out = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      if (item.name === ".git" || item.name === "node_modules") continue;
      out.push(...listHtmlFiles(full));
    } else if (item.isFile() && item.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function normalizeUrl(u) {
  // Normalize common sitemap differences:
  // - trim whitespace
  // - ensure no trailing spaces/newlines
  // - ensure path ends with "/" for folder routes (except root)
  // - keep scheme + host exactly as provided in manifest.baseUrl
  const s = String(u || "").trim();
  if (!s) return s;

  try {
    const url = new URL(s);
    // Normalize pathname: ensure trailing slash unless it's root or has a file extension
    const hasExt = /\.[a-z0-9]+$/i.test(url.pathname);
    if (!hasExt && url.pathname !== "/" && !url.pathname.endsWith("/")) {
      url.pathname = url.pathname + "/";
    }
    // Remove default port and normalize
    url.hash = "";
    return url.toString();
  } catch {
    // If not a valid absolute URL, just return trimmed
    return s;
  }
}

function extractSitemapLocs(xml) {
  // Extract all <loc>...</loc> values (handles whitespace/newlines)
  const locs = [];
  const re = /<loc>\s*([^<]+?)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1]);
  }
  return locs;
}

function main() {
  const repoRoot = process.cwd();

  const manifestPath = path.join(repoRoot, "site-manifest.json");
  if (!exists(manifestPath)) fail("Missing site-manifest.json");

  const manifest = JSON.parse(readFile(manifestPath));

  if (!manifest.baseUrl) fail("site-manifest.json missing baseUrl");
  if (!Array.isArray(manifest.sections)) fail("site-manifest.json sections must be an array");
  if (!Array.isArray(manifest.pages)) fail("site-manifest.json pages must be an array");

  // Required partials
  const headerPartial = path.join(repoRoot, "partials", "header.html");
  if (!exists(headerPartial)) fail("Missing partials/header.html");

  const includeScript = path.join(repoRoot, "js", "include-partials.js");
  if (!exists(includeScript)) fail("Missing js/include-partials.js");

  // Sitemap must exist
  const sitemapPath = path.join(repoRoot, "sitemap.xml");
  if (!exists(sitemapPath)) fail("Missing sitemap.xml");

  const sitemapXml = readFile(sitemapPath);
  const sitemapLocsRaw = extractSitemapLocs(sitemapXml);
  const sitemapLocs = new Set(sitemapLocsRaw.map(normalizeUrl));

  // Build expected URLs from manifest.pages
  const expected = manifest.pages.map((p) => normalizeUrl(`${manifest.baseUrl}${p}`));

  // Validate sitemap contains all expected URLs
  for (const url of expected) {
    if (!sitemapLocs.has(url)) {
      console.error("---- Debug ----");
      console.error("Expected URL:", url);
      console.error("Manifest baseUrl:", manifest.baseUrl);
      console.error("Manifest pages:", manifest.pages);
      console.error("Sitemap loc count:", sitemapLocsRaw.length);
      console.error("First few sitemap locs:", sitemapLocsRaw.slice(0, 10));
      console.error("---------------");
      fail(`sitemap.xml missing URL: ${url}`);
    }
  }

  // Scan HTML files for bad patterns
  const htmlFiles = listHtmlFiles(repoRoot);

  for (const file of htmlFiles) {
    const html = readFile(file);

    // Disallow ../ and ./ in href/src
    const badRelative = /(href|src)=["'](\.\.\/|\.\/)/g;
    if (badRelative.test(html)) {
      fail(`Found relative ./ or ../ link in: ${path.relative(repoRoot, file)}`);
    }

    // Disallow .html links
    const badHtmlLinks = /(href|src)=["'][^"']+\.html(["'#?])/g;
    if (badHtmlLinks.test(html)) {
      fail(`Found '.html' link in: ${path.relative(repoRoot, file)} (use folder routes instead)`);
    }

    // Require partial includes (skip 404.html if you ever add one)
    const is404 = file.endsWith(`${path.sep}404.html`);
    if (!is404) {
      if (!html.includes('data-include="/partials/header.html"')) {
        fail(`Missing header partial include in: ${path.relative(repoRoot, file)}`);
      }
      if (!html.includes('src="/js/include-partials.js"')) {
        fail(`Missing include-partials.js script in: ${path.relative(repoRoot, file)}`);
      }
    }

    // Root-relative href enforcement for internal links
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map((m) => m[1]);
    for (const href of hrefs) {
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("#") ||
        href.startsWith("tel:")
      )
        continue;

      if (!href.startsWith("/")) {
        fail(`Non-root-relative href "${href}" in ${path.relative(repoRoot, file)}`);
      }
    }
  }

  console.log("✅ validate-site passed");
}

main();
