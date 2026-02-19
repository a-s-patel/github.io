# Structure Sync

Use this to keep `site-manifest.json` and `sitemap.xml` aligned with published routes.

How to run:

```bash
node scripts/sync-structure.mjs
```

What it does:
- Scans for folder-based routes (`/section/index.html` => `/section/`)
- Updates `site-manifest.json` `pages`
- Rebuilds `sitemap.xml` from the manifest base URL
