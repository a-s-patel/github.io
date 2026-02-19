#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const IGNORE_DIRS = new Set([
  ".git",
  ".github",
  "node_modules",
  "partials",
  "templates",
  "scripts",
]);

const MANIFEST_PATH = path.join(ROOT, "site-manifest.json");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function shouldIgnore(relPosix) {
  return relPosix.split("/").some((segment) => IGNORE_DIRS.has(segment));
}

function walkForIndexRoutes() {
  const routes = new Set();

  function walk(dirAbs) {
    const entries = fs.readdirSync(dirAbs, { withFileTypes: true });
    for (const entry of entries) {
      const fullAbs = path.join(dirAbs, entry.name);
      const relPosix = toPosix(path.relative(ROOT, fullAbs));

      if (entry.isDirectory()) {
        if (shouldIgnore(relPosix)) continue;
        walk(fullAbs);
        continue;
      }

      if (!entry.isFile()) continue;
      if (entry.name.toLowerCase() !== "index.html") continue;
      if (shouldIgnore(relPosix)) continue;

      if (relPosix === "index.html") {
        routes.add("/");
        continue;
      }

      const dirPosix = path.posix.dirname(relPosix);
      const cleaned = dirPosix.replace(/^\.?\/?/, "").replace(/\/+$/, "");
      if (!cleaned) {
        routes.add("/");
        continue;
      }
      routes.add(`/${cleaned}/`);
    }
  }

  walk(ROOT);

  return Array.from(routes).sort((a, b) => {
    if (a === "/") return -1;
    if (b === "/") return 1;
    return a.localeCompare(b);
  });
}

function readManifest() {
  const raw = fs.readFileSync(MANIFEST_PATH, "utf8");
  return JSON.parse(raw);
}

function writeManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

function priorityForRoute(route) {
  if (route === "/") return "1.0";
  const depth = route.split("/").filter(Boolean).length;
  return depth <= 1 ? "0.8" : "0.7";
}

function writeSitemap(baseUrl, routes) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];

  for (const route of routes) {
    const absolute = new URL(route, baseUrl).toString();
    lines.push("  <url>");
    lines.push(`    <loc>${absolute}</loc>`);
    lines.push("    <changefreq>weekly</changefreq>");
    lines.push(`    <priority>${priorityForRoute(route)}</priority>`);
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  fs.writeFileSync(SITEMAP_PATH, `${lines.join("\n")}\n`);
}

function main() {
  const routes = walkForIndexRoutes();
  const manifest = readManifest();

  if (!manifest || typeof manifest !== "object") {
    throw new Error("site-manifest.json is not a valid JSON object.");
  }

  if (!manifest.baseUrl || typeof manifest.baseUrl !== "string") {
    throw new Error('site-manifest.json missing "baseUrl" (string).');
  }

  manifest.pages = routes;
  writeManifest(manifest);
  writeSitemap(manifest.baseUrl, routes);

  console.log("✅ synched site-manifest.json and sitemap.xml");
}

main();
