# Proof Over Hype — Build Tasks (PR-per-task)

Rules:
- One task = one PR
- Keep PRs small and easy to review
- Use folder URLs (example: /playbooks/ not /playbooks.html)
- Use root-relative links everywhere (example: href="/playbooks/")

---

## Task 1 — Foundation: sections + shared nav + homepage links
- Create section folders:
  - /playbooks/index.html
  - /case-studies/index.html
  - /creative-lab/index.html
  - /growth-vault/index.html
  - /media/index.html
- Add a shared header/nav across homepage + all section pages
- Update homepage nav items so:
  - “Playbooks” → /playbooks/
  - “Case Studies” → /case-studies/
  - “Creative Lab” → /creative-lab/
  - “Growth Vault” → /growth-vault/
  - “Media” → /media/
- Each section page:
  - Same H1 + subheadline styling as homepage
  - Subheadline italic
  - “Coming soon” layout with 3–6 starter article cards linking to placeholder article routes

## Task 2 — Add About page
- Create /about/index.html
- Match shared header/nav + styling (italic subheadline)
- Add a short “what this site is” description and a simple contact CTA (no forms)

## Task 3 — Add Teardowns section
- Create /teardowns/index.html
- Add to nav (header + homepage if appropriate)
- 3–6 starter teardown cards linking to placeholder teardown pages

## Task 4 — Create a shared Article template
- Create a consistent article layout (title, date, reading time, content area, back link)
- Apply to at least one placeholder article to prove it works

## Task 5 — Generate placeholder articles per section
- For each section, add 3–6 placeholder articles:
  - /playbooks/<slug>/index.html
  - /case-studies/<slug>/index.html
  - /creative-lab/<slug>/index.html
  - /growth-vault/<slug>/index.html
  - /media/<slug>/index.html
  - /teardowns/<slug>/index.html (if present)
- Each section index page should link to its articles

## Task 6 — Mobile responsiveness pass
- Ensure nav works on phones and tablets
- No horizontal scrolling
- Typography scales cleanly
- Cards stack nicely

## Task 7 — System light/dark theme pass
- Ensure pages follow OS theme automatically (prefers-color-scheme)
- Make sure text contrast is readable in both modes

## Task 8 — Add a 404 page
- Create /404.html (GitHub Pages friendly)
- Styled consistent with site + links back home/sections

## Task 9 — SEO basics
- Unique <title> per page
- Meta description per page
- Open Graph + Twitter tags for homepage + section pages

## Task 10 — sitemap.xml + robots.txt
- Add /sitemap.xml with links to main pages (and placeholder articles)
- Add /robots.txt that points to sitemap

## Task 11 — Performance + accessibility quick pass
- Check contrast, focus states, keyboard navigation
- Ensure images are sized appropriately
- Minimize layout shift

## Task 12 — Simple contributor docs
- Add a short section to README:
  - “How to add a new section page”
  - “How to add a new article”
  - “How to run the Codex workflow (Issue + label)”
