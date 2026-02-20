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
TASK STATUS KEY
--------------------------------------------------

Status values:
- COMPLETE
- TODO

Codex must:
- Execute exactly ONE TODO task per run
- Open a PR
- In that PR, change the task Status from TODO → COMPLETE
- Then STOP

If Codex finds a task’s outputs already exist, it must:
- Mark it COMPLETE in TASKS.md
- Make no other changes (unless required for validator)
- Open PR
- STOP

--------------------------------------------------
Task 1 — Foundation: sections + shared nav + homepage links
Status: COMPLETE
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

--------------------------------------------------
Task 2 — Add About page
Status: COMPLETE
--------------------------------------------------

Create:

- /about/index.html

--------------------------------------------------
Task 3 — Add Teardowns section
Status: COMPLETE
--------------------------------------------------

Create:

- /teardowns/index.html

--------------------------------------------------
Task 4 — Create shared article page template
Status: COMPLETE
--------------------------------------------------

Create consistent article layout structure.

--------------------------------------------------
Task 5 — Generate placeholder articles per section
Status: COMPLETE
--------------------------------------------------

For EACH section create 3–6 placeholder articles.

--------------------------------------------------
Task 6 — Mobile responsiveness pass
Status: COMPLETE
--------------------------------------------------

Audit and fix mobile layout across all pages.

--------------------------------------------------
Task 7 — System light/dark theme support
Status: COMPLETE
--------------------------------------------------

Ensure site respects system theme.

--------------------------------------------------
Task 8 — Add 404 page
Status: COMPLETE
--------------------------------------------------

Create:

- /404.html

--------------------------------------------------
Task 9 — SEO improvements
Status: COMPLETE
--------------------------------------------------

Ensure each page includes:
- Unique <title>
- Meta description
- Open Graph tags
- Twitter preview tags

--------------------------------------------------
Task 10 — sitemap.xml + robots.txt
Status: COMPLETE
--------------------------------------------------

Create/maintain:
- /sitemap.xml
- /robots.txt (points to sitemap)

--------------------------------------------------
Task 11 — Performance + accessibility quick pass
Status: COMPLETE
--------------------------------------------------

Requirements:
- Check contrast and focus states
- Keyboard navigation works
- No layout shift regressions
- Images sized appropriately
- No horizontal scroll on mobile
- Keep design consistent

Deliverables:
- Minimal CSS/HTML fixes only where necessary
- No redesign

--------------------------------------------------
Task 12 — Simple contributor docs
Status: COMPLETE
--------------------------------------------------

Update README with:
- “How to add a new section page”
- “How to add a new article page”
- “How to run the Codex workflow (Issue + label)”
- “How to run structure validation locally” (if applicable)

--------------------------------------------------
Task 13 — Playbooks: create missing article pages and wire card links
Status: TODO
--------------------------------------------------

Goal:
- On /playbooks/, each card must link to its corresponding article page.
- Create article pages that do not exist yet.
- Maintain exact format consistency with existing article pages.

DO NOT recreate:
- /playbooks/meta-hooks-playbook/ (already exists)
- /playbooks/activation-experiment-bank/ (already exists)

Requirements:
- Inspect /playbooks/index.html and identify all cards.
- For each card:
  - If the linked article page already exists, ensure the card links to it.
  - If the article page does not exist, create it using the existing article template and design patterns.
- The new article pages must follow folder-based routing:
  - /playbooks/<slug>/index.html
- Use root-relative links only.
- Update /sitemap.xml if your site’s workflow expects new pages to be included.

--------------------------------------------------
Task 14 — Case Studies: create missing article pages and wire card links
Status: TODO
--------------------------------------------------

Goal:
- On /case-studies/, each card must link to its corresponding article page.
- Create article pages that do not exist yet.
- Maintain exact format consistency with existing article pages.

DO NOT recreate:
- /case-studies/cac-120-to-95/ (already exists)

Requirements:
- Inspect /case-studies/index.html and identify all cards.
- For each card:
  - If the linked article page already exists, ensure the card links to it.
  - If the article page does not exist, create it using the existing article template and design patterns.
- New pages must follow:
  - /case-studies/<slug>/index.html
- Use root-relative links only.
- Update /sitemap.xml if needed.

--------------------------------------------------
Task 15 — Creative Lab: create missing article pages and wire card links
Status: TODO
--------------------------------------------------

Goal:
- On /creative-lab/, each card must link to its corresponding article page.
- Create article pages that do not exist yet.
- Maintain exact format consistency with existing article pages.

DO NOT recreate:
- /creative-lab/creative-brief-generator/ (already exists)

Requirements:
- Inspect /creative-lab/index.html and identify all cards.
- For each card:
  - If the linked article page already exists, ensure the card links to it.
  - If the article page does not exist, create it using the existing article template and design patterns.
- New pages must follow:
  - /creative-lab/<slug>/index.html
- Use root-relative links only.
- Update /sitemap.xml if needed.

--------------------------------------------------
Task 16 — Growth Vault: create missing article pages and wire card links
Status: TODO
--------------------------------------------------

Goal:
- On /growth-vault/, each card must link to its corresponding article page.
- Create article pages that do not exist yet.
- Maintain exact format consistency with existing article pages.

DO NOT recreate:
- /growth-vault/metrics-dictionary/ (already exists)

Requirements:
- Inspect /growth-vault/index.html and identify all cards.
- For each card:
  - If the linked article page already exists, ensure the card links to it.
  - If the article page does not exist, create it using the existing article template and design patterns.
- New pages must follow:
  - /growth-vault/<slug>/index.html
- Use root-relative links only.
- Update /sitemap.xml if needed.

--------------------------------------------------
Task 17 — Media: create missing article pages and wire card links
Status: TODO
--------------------------------------------------

Goal:
- On /media/, each card must link to its corresponding article page.
- Create article pages that do not exist yet.
- Maintain exact format consistency with existing article pages.

DO NOT recreate:
- /media/newsletter/ (already exists)

Requirements:
- Inspect /media/index.html and identify all cards.
- For each card:
  - If the linked article page already exists, ensure the card links to it.
  - If the article page does not exist, create it using the existing article template and design patterns.
- New pages must follow:
  - /media/<slug>/index.html
- Use root-relative links only.
- Update /sitemap.xml if needed.
