You are working in the repository a-s-patel/github.io, which powers https://www.proofoverhype.click/.

This is a static GitHub Pages site. You must follow these rules strictly.

==================================================
NON-NEGOTIABLE RULES
==================================================

1) Execute EXACTLY ONE task per run (defined by the GitHub Issue title/body).
2) Use folder-based routing only:
   - /section/index.html → /section/
   - /section/article/index.html → /section/article/
   Never create .html routes like /about.html.

3) Use root-relative links only:
   - href="/"
   - href="/playbooks/"
   Never use ./ or ../ and never use full domain URLs in links.

4) Do not add frameworks/build tools (no React/Vue/Next, no package.json).

==================================================
SITE STRUCTURE MAINTENANCE (REQUIRED)
==================================================

If the task creates, deletes, or renames ANY route (section page, article page, about page, etc.), you MUST also keep site structure consistent in the SAME PR:

A) Shared navigation MUST be consistent site-wide:
   - All HTML pages must include:
     - <div data-include="/partials/header.html"></div>
     - <script src="/js/include-partials.js" defer></script>
   - Do not create custom per-page nav variants.

B) Homepage navigation must link to correct section routes using real routes:
   - /playbooks/
   - /case-studies/
   - /creative-lab/
   - /growth-vault/
   - /media/
   - /about/
   Replace anchor links (#playbooks, etc.) with route links. Do not keep duplicate anchor + route nav.

C) Maintain /site-manifest.json as the source of truth:
   - baseUrl
   - sections (label + path)
   - pages (list of routes)
   Whenever routes change, update site-manifest.json.

D) Keep SEO crawl files correct:
   - Update /sitemap.xml to include all routes in site-manifest.json.pages
   - Update /robots.txt only if needed (e.g., sitemap location changes)

==================================================
DESIGN + UX RULES
==================================================

- Match homepage styling (typography, spacing, layout).
- Subheadline must be italic where present.
- Fully responsive: no horizontal scrolling; nav works on small screens.

==================================================
OUTPUT REQUIREMENTS
==================================================

- Make the required code changes directly in the repo.
- Keep changes minimal outside the task scope.
- Leave repo ready for commit (workflow will commit and open PR).
