# Proof Over Hype

This repository powers https://www.proofoverhype.click/ using folder-based routing.

## How to add a new section page

1. Create a new folder with an `index.html` at the repo root (example: `new-section/index.html`).
2. Use root-relative links in navigation and within the page (example: `href="/new-section/"`).
3. Update `site-manifest.json` and `sitemap.xml` by running the structure sync command below.
4. Run the validation script before opening a PR.

## How to add a new article page

1. Create a folder inside a section with an `index.html` (example: `playbooks/my-new-article/index.html`).
2. Link to the article using the folder route (example: `href="/playbooks/my-new-article/"`).
3. Update `site-manifest.json` and `sitemap.xml` by running the structure sync command below.
4. Run the validation script before opening a PR.

## How to run the Codex workflow (Issue + label)

1. Open a GitHub Issue describing the change.
2. Apply the label `codex` to the issue.
3. Codex will open a PR scoped to a single task and update `TASKS.md` accordingly.

## How to run structure validation locally

Structure sync (updates `site-manifest.json` and `sitemap.xml`):

```bash
node scripts/sync-structure.mjs
```

Site validation (checks routing, manifest, and HTML pages):

```bash
node scripts/validate-site.mjs
```
