import fs from "node:fs";
import path from "node:path";

const GITHUB_API = "https://api.github.com";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const token = requiredEnv("GITHUB_TOKEN");
const repo = requiredEnv("REPO"); // owner/name

function readTasksMd() {
  const p = path.join(process.cwd(), "TASKS.md");
  if (!fs.existsSync(p)) throw new Error("TASKS.md not found at repo root.");
  return fs.readFileSync(p, "utf8");
}

/**
 * Supported TASKS.md patterns (per task):
 *
 * Pattern A (preferred, explicit):
 * - [ ] id:task-11 title: Some title
 *   body: |
 *     multi-line
 *
 * Pattern B (lightweight, still stable):
 * - [ ] id:task-11 Some title
 *   - details: blah blah
 *
 * Completion is - [x]
 */
function parseTasks(md) {
  const lines = md.split("\n");
  const tasks = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern A: "- [ ] id:task-11 title: Something"
    let m = line.match(/^- \[( |x|X)\]\s+id:([^\s]+)\s+title:\s*(.+)\s*$/);

    // Pattern B: "- [ ] id:task-11 Something"
    if (!m) {
      const m2 = line.match(/^- \[( |x|X)\]\s+id:([^\s]+)\s+(.+)\s*$/);
      if (m2) m = [m2[0], m2[1], m2[2], m2[3]];
    }

    if (!m) continue;

    const done = m[1].toLowerCase() === "x";
    const id = m[2].trim();
    const title = m[3].trim();

    // Try to extract an explicit "body: |" block (Pattern A)
    let body = "";
    let j = i + 1;

    // Skip blank lines right after header
    while (j < lines.length && lines[j].trim() === "") j++;

    // Body block support
    if (j < lines.length && lines[j].match(/^\s*body:\s*\|\s*$/)) {
      j++;
      const bodyLines = [];
      while (j < lines.length) {
        const l = lines[j];
        if (l.match(/^- \[( |x|X)\]\s+id:/)) break; // next task
        bodyLines.push(l.replace(/^\s{2}/, "")); // strip 2-space indent if present
        j++;
      }
      body = bodyLines.join("\n").trimEnd();
    } else {
      // Otherwise gather up to the next task line as a bulleted body (Pattern B)
      const bodyLines = [];
      while (j < lines.length) {
        const l = lines[j];
        if (l.match(/^- \[( |x|X)\]\s+id:/)) break;
        if (l.trim() !== "") bodyLines.push(l.trim());
        j++;
      }
      body = bodyLines.join("\n").trimEnd();
    }

    tasks.push({ id, title, body, done });
  }

  return tasks;
}

async function ghFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "task-dispatcher",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status} ${res.statusText}: ${text}`);
  }

  return res.json();
}

function ownerRepo() {
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error(`Invalid REPO value: ${repo}`);
  return { owner, name };
}

async function listOpenCodexIssues() {
  const { owner, name } = ownerRepo();
  const url = `${GITHUB_API}/repos/${owner}/${name}/issues?state=open&labels=codex-run&per_page=100`;
  return ghFetch(url);
}

async function listOpenPulls() {
  const { owner, name } = ownerRepo();
  const url = `${GITHUB_API}/repos/${owner}/${name}/pulls?state=open&per_page=100`;
  return ghFetch(url);
}

function hasTaskIdInText(taskId, text) {
  const hay = (text || "").toLowerCase();
  const id = taskId.toLowerCase();
  return (
    hay.includes(`task id: ${id}`) ||
    hay.includes(`taskid: ${id}`) ||
    hay.includes(`task_id: ${id}`) ||
    hay.includes(id)
  );
}

async function alreadyInFlight(taskId) {
  const issues = await listOpenCodexIssues();
  const foundIssue = issues.find((it) =>
    hasTaskIdInText(taskId, `${it.title}\n${it.body || ""}`)
  );
  if (foundIssue) {
    return { type: "issue", number: foundIssue.number, title: foundIssue.title };
  }

  const pulls = await listOpenPulls();
  const foundPr = pulls.find((it) =>
    hasTaskIdInText(taskId, `${it.title}\n${it.body || ""}`)
  );
  if (foundPr) {
    return { type: "pr", number: foundPr.number, title: foundPr.title };
  }

  return null;
}

async function createCodexIssue(task) {
  const { owner, name } = ownerRepo();
  const url = `${GITHUB_API}/repos/${owner}/${name}/issues`;

  const body =
`Task ID: ${task.id}

Task Title: ${task.title}

Instructions:
${task.body && task.body.trim() ? task.body.trim() : "(no body provided)"}

---
Automation notes:
- Source of truth: TASKS.md
- This issue was created by: scripts/dispatch-next-task.mjs
- Please keep "Task ID: ${task.id}" intact in any PR body and commits.
`;

  const payload = {
    title: task.title,
    body,
    labels: ["codex-run"],
  };

  return ghFetch(url, { method: "POST", body: JSON.stringify(payload) });
}

async function main() {
  const md = readTasksMd();
  const tasks = parseTasks(md);

  if (!tasks.length) {
    console.log("No tasks found. Ensure TASKS.md uses lines like: - [ ] id:task-11 ...");
    return;
  }

  const next = tasks.find((t) => !t.done);

  if (!next) {
    console.log("All tasks complete. Nothing to dispatch.");
    return;
  }

  const inflight = await alreadyInFlight(next.id);
  if (inflight) {
    console.log(`Task already in flight (${inflight.type} #${inflight.number}): ${inflight.title}`);
    return;
  }

  const created = await createCodexIssue(next);
  console.log(`Dispatched ${next.id} -> Issue #${created.number}: ${created.title}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
