You are working in the repository a-s-patel/github.io, which powers https://www.proofoverhype.click/.

This is a static GitHub Pages site using folder-based routing and shared styling.

You must follow ALL rules below strictly.

--------------------------------------------------
PRIMARY OBJECTIVE
--------------------------------------------------

Execute EXACTLY ONE task per run.

The task is defined by the GitHub Issue title and body.

Do NOT implement multiple tasks.
Do NOT implement future tasks.
Do NOT modify unrelated files.

--------------------------------------------------
REPOSITORY STRUCTURE RULES (CRITICAL)
--------------------------------------------------

Use folder-based URLs ONLY:

Correct:
- /playbooks/index.html → /playbooks/
- /about/index.html → /about/
- /playbooks/meta-hooks-playbook/index.html → /playbooks/meta-hooks-playbook/

Never create:
- playbooks.html
- about.html
- nested duplicate structures

--------------------------------------------------
LINKING RULES (CRITICAL)
--------------------------------------------------

Always use root-relative links:

Correct:
- href="/"
- href="/playbooks/"
- href="/case-studies/"
- href="/about/"

Never use:
- ./playbooks
- ../playbooks
- playbooks.html
- full domain URLs

This ensures compatibility with the custom domain.

--------------------------------------------------
NAVIGATION RULES (CRITICAL)
--------------------------------------------------

The site must have ONE consistent shared header/navigation.

If creating new pages:
- Reuse the existing header structure from index.html
- Do NOT create alternate nav designs
- Do NOT duplicate nav logic in inconsistent ways

Navigation must include links to all existing main sections when appropriate.

--------------------------------------------------
DESIGN CONSISTENCY RULES
--------------------------------------------------

Match the homepage design exactly:

- Same typography scale
- Same spacing system
- Same container widths
- Same header structure
- Same color system

Subheadline must be italic when present.

Do NOT introduce new visual systems unless explicitly instructed.

--------------------------------------------------
MOBILE RESPONSIVENESS RULES
--------------------------------------------------

All new pages must be fully responsive.

Ensure:
- No horizontal scrolling
- Text remains readable on mobile
- Navigation works on mobile
- Cards stack vertically on smaller screens

--------------------------------------------------
FRAMEWORK RULES
--------------------------------------------------

This is a static site.

Do NOT add:
- React
- Vue
- Next.js
- build tools
- package.json
- bundlers

Use only static HTML, CSS, and existing styles.

--------------------------------------------------
SAFE FILE MODIFICATION RULES
--------------------------------------------------

Allowed:
- Create new folders
- Create new index.html files
- Modify navigation links
- Add new article pages
- Update existing HTML carefully

Avoid modifying unrelated sections.

--------------------------------------------------
OUTPUT REQUIREMENTS
--------------------------------------------------

Make the required code changes directly in the repository.

When finished:

- Ensure files are ready to commit
- Do not leave incomplete work
- Do not leave placeholder TODO comments unless explicitly instructed

The workflow will handle committing and creating the Pull Request.

--------------------------------------------------
QUALITY BAR
--------------------------------------------------

The result must look like a natural, intentional extension of the existing site.

Not like a prototype.
Not like a demo.
Not like a generated template.

It must integrate cleanly with the current architecture.
