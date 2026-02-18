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
      // Skip git + node-ish dirs if ever added
      if (item.name === ".git" || item.name === "node_modules") continue;
      out.push(...listHtmlFiles(full));
    } else if (item.isFile() && item.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function isRootRelativeLink(href) {
  return href.startsWith("/");
}

function main() {
  const repoRoot = process.cwd();

  const manifestPath = path.join(repoRoot, "site-manifest.json");
  if (!exists(manifestPath)) fail("Missing site-manifest.json");

  const manifest = JSON.parse(readFile(manifestPath));

  // Basic manifest sanity
  if (!manifest.baseUrl) fail("site-manifest.json missing baseUrl");
  if (!Array.isArray(manifest.sections)) fail("site-manifest.json sections must be an array");
  if (!Array.isArray(manifest.pages)) fail("site-manifest.json pages must be an array");

  // Ensure required partials exist
  const headerPartial = path.join(repoRoot, "partials", "header.html");
  if (!exists(headerPartial)) fail("Missing partials/header.html");

  const includeScript = path.join(repoRoot, "js", "include-partials.js");
  if (!exists(includeScript)) fail("Missing js/include-partials.js");

  // Verify sitemap exists and includes manifest pages (best-effort, not strict XML parsing)
  const sitemapPath = path.join(repoRoot, "sitemap.xml");
  if (!exists(sitemapPath)) fail("Missing sitemap.xml");
  const sitemap = readFile(sitemapPath);

  for (const p of manifest.pages) {
    const url = `${manifest.baseUrl}${p}`;
    if (!sitemap.includes(url)) {
      fail(`sitemap.xml missing URL: ${url}`);
    }
  }

  // Scan HTML files for bad linking patterns
  const htmlFiles = listHtmlFiles(repoRoot);

  for (const file of htmlFiles) {
    const html = readFile(file);

    // Disallow ../ and ./ in href/src (common GitHub Pages breakage)
    const badRelative = /(href|src)=["'](\.\.\/|\.\/)/g;
    if (badRelative.test(html)) {
      fail(`Found relative ./ or ../ link in: ${path.relative(repoRoot, file)}`);
    }

    // Disallow .html route linking (encourage folder routes)
    const badHtmlLinks = /(href|src)=["'][^"']+\.html(["'#?])/g;
    if (badHtmlLinks.test(html)) {
      // allow the file itself; disallow links to .html
      // this is a heuristic; treat as fail to enforce clean routing
      fail(`Found '.html' link in: ${path.relative(repoRoot, file)} (use folder routes instead)`);
    }

    // Require partial includes on every HTML page except 404.html (optional choice)
    const is404 = file.endsWith(`${path.sep}404.html`);
    if (!is404) {
      if (!html.includes('data-include="/partials/header.html"')) {
        fail(`Missing header partial include in: ${path.relative(repoRoot, file)}`);
      }
      if (!html.includes('src="/js/include-partials.js"')) {
        fail(`Missing include-partials.js script in: ${path.relative(repoRoot, file)}`);
      }
    }

    // Require root-relative internal navigation links (quick heuristic)
    // (If links exist and do not start with http/mailto/#, they should start with /)
    const hrefs = [...html.matchAll(/href=["']([^"']+)["']/g)].map(m => m[1]);
    for (const href of hrefs) {
      if (
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("#") ||
        href.startsWith("tel:")
      ) continue;

      if (!isRootRelativeLink(href)) {
        fail(`Non-root-relative href "${href}" in ${path.relative(repoRoot, file)}`);
      }
    }
  }

  console.log("✅ validate-site passed");
}

main();
