# Proof Over Hype — Build Tasks (PR-per-task workflow)

This repository powers https://www.proofoverhype.click/

All work is executed by Codex via GitHub Issues and Pull Requests.

--------------------------------------------------
GLOBAL RULES
--------------------------------------------------

These rules apply to ALL tasks:

- One task = one Pull Request
- Do NOT combine tasks
- Do NOT implement future tasks early
- Keep PRs small and reviewable
- Follow folder-based routing only

Correct routing examples:
- /playbooks/index.html → /playbooks/
- /about/index.html → /about/
- /playbooks/meta-hooks-playbook/index.html → /playbooks/meta-hooks-playbook/

Never create:
- playbooks.html
- about.html
- relative path routing

Always use root-relative links:

Correct:
- href="/"
- href="/playbooks/"
- href="/about/"

Never use:
- ./playbooks
- ../playbooks
- playbooks.html

--------------------------------------------------
Task 1 — Foundation: sections + shared nav + homepage links
--------------------------------------------------

Create section folders:

- /playbooks/index.html
- /case-studies/index.html
- /creative-lab/index.html
- /growth-vault/index.html
- /media/index.html

Navigation requirements:

- Add a shared header/navigation across homepage and all section pages
- Replace homepage anchor links (#playbooks, #case-studies, etc.) with real route links:
  - “Playbooks” → /playbooks/
  - “Case Studies” → /case-studies/
  - “Creative Lab” → /creative-lab/
  - “Growth Vault” → /growth-vault/
  - “Media” → /media/
- Do NOT keep or duplicate anchor-based navigation
- Use root-relative links only

Section page requirements:

Each section page must include:

- Same H1 styling as homepage
- Subheadline must be italic
- Same typography, spacing, and layout system
- Shared header/navigation
- “Coming soon” layout
- 3–6 starter article cards linking to placeholder article routes, example:
  - /playbooks/meta-hooks-playbook/

Mobile requirements:

- No horizontal scrolling
- Typography scales properly
- Layout stacks cleanly on mobile

--------------------------------------------------
Task 2 — Add About page
--------------------------------------------------

Create:

- /about/index.html

Requirements:

- Same shared header/navigation
- Same H1 styling
- Subheadline must be italic
- Include short “About Proof Over Hype” description
- Include link back to homepage (/)
- Fully responsive layout

--------------------------------------------------
Task 3 — Add Teardowns section
--------------------------------------------------

Create:

- /teardowns/index.html

Requirements:

- Add link to navigation
- Same layout and styling as other sections
- Include 3–6 teardown article cards linking to placeholder teardown pages

--------------------------------------------------
Task 4 — Create shared article page template
--------------------------------------------------

Create consistent article layout structure:

Example:

- /playbooks/example-article/index.html

Requirements:

- Title
- Subheadline (italic)
- Content container
- Back link to section
- Shared header/navigation
- Fully responsive

This template will be reused across all sections.

--------------------------------------------------
Task 5 — Generate placeholder articles per section
--------------------------------------------------

For EACH section create 3–6 placeholder articles:

Structure example:

- /playbooks/article-slug/index.html
- /case-studies/article-slug/index.html
- /creative-lab/article-slug/index.html
- /growth-vault/article-slug/index.html
- /media/article-slug/index.html
- /teardowns/article-slug/index.html

Requirements:

- Use shared article layout template
- Each section page must link to its articles
- Use folder-based routing only

--------------------------------------------------
Task 6 — Mobile responsiveness pass
--------------------------------------------------

Audit and fix mobile layout across all pages:

Ensure:

- Navigation works correctly
- No horizontal scrolling
- Proper spacing and typography
- Cards stack vertically
- No layout breaks on smaller screens

--------------------------------------------------
Task 7 — System light/dark theme support
--------------------------------------------------

Ensure site respects system theme:

- Use prefers-color-scheme
- Maintain readability in both modes
- Preserve existing visual design intent

Do not introduce a new design system.

--------------------------------------------------
Task 8 — Add 404 page
--------------------------------------------------

Create:

- /404.html

Requirements:

- Match site styling
- Include navigation
- Include link back to homepage and sections

--------------------------------------------------
Task 9 — SEO improvements
--------------------------------------------------

Ensure each page includes:

- Unique <title>
- Meta description
- Open Graph tags
- Twitter preview tags

Preserve current homepage SEO setup.

--------------------------------------------------
Task 10 — Verify and update sitemap.xml and robots.txt
--------------------------------------------------

Do NOT recreate files if they already exist.

Instead:

- Verify /sitemap.xml includes all sections and article routes
- Update sitemap.xml to include any newly created pages
- Verify /robots.txt references sitemap.xml correctly
- Update only if necessary

--------------------------------------------------
Task 11 — Performance and accessibility pass
--------------------------------------------------

Improve:

- Text contrast
- Focus states
- Keyboard navigation
- Image sizing
- Layout stability

Preserve visual design.

--------------------------------------------------
Task 12 — Contributor documentation
--------------------------------------------------

Update README.md with instructions:

- How to add a new section
- How to add a new article
- How to use folder-based routing
- How to trigger Codex via Issue + codex-run label

Keep instructions simple and clear.
