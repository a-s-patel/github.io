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

function ownerRepo() {
  const [owner, name] = repo.split("/");
  if (!owner || !name) throw new Error(`Invalid REPO value: ${repo}`);
  return { owner, name };
}

function readTasksMd() {
  const p = path.join(process.cwd(), "TASKS.md");
  if (!fs.existsSync(p)) throw new Error("TASKS.md not found at repo root.");
  return fs.readFileSync(p, "utf8");
}

/**
 * Parses TASKS.md in your current format:
 *
 * --------------------------------------------------
 * Task 12 — Simple contributor docs
 * Status: COMPLETE
 * --------------------------------------------------
 *
 * <body...>
 *
 * Returns tasks with:
 *  - number (12)
 *  - id ("task-12")
 *  - titleLine ("Task 12 — ...")
 *  - status ("TODO"|"COMPLETE"|other)
 *  - body (block between separators)
 */
function parseTasks(md) {
  const lines = md.split("\n");
  const tasks = [];

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const taskHeader = line.match(/^Task\s+(\d+)\s+—\s+(.+)\s*$/);
    if (!taskHeader) {
      i++;
      continue;
    }

    const number = parseInt(taskHeader[1], 10);
    const titleText = taskHeader[2].trim();
    const titleLine = `Task ${number} — ${titleText}`;
    const id = `task-${number}`;

    // Find Status line within next few lines
    let status = "";
    let statusLineIndex = -1;
    for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
      const m = lines[j].match(/^Status:\s*(TODO|COMPLETE)\s*$/i);
      if (m) {
        status = m[1].toUpperCase();
        statusLineIndex = j;
        break;
      }
      // If we hit another Task header early, bail
      if (lines[j].match(/^Task\s+\d+\s+—\s+/)) break;
    }

    // Capture body until next "Task X —" header (or EOF)
    // We include everything after the "Status:" line if present, otherwise after the header line.
    const bodyStart = statusLineIndex !== -1 ? statusLineIndex + 1 : i + 1;
    let k = bodyStart;
    const bodyLines = [];
    while (k < lines.length) {
      if (lines[k].match(/^Task\s+\d+\s+—\s+/)) break;
      bodyLines.push(lines[k]);
      k++;
    }

    const body = bodyLines.join("\n").trimEnd();

    tasks.push({
      number,
      id,
      titleLine,
      status,
      body,
    });

    i = k;
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

function hasTaskId(taskId, text) {
  const hay = (text || "").toLowerCase();
  const id = taskId.toLowerCase();
  return (
    hay.includes(`task id: ${id}`) ||
    hay.includes(`taskid: ${id}`) ||
    hay.includes(`task_id: ${id}`) ||
    hay.includes(`Task ${taskId.split("-")[1]} —`.toLowerCase()) ||
    hay.includes(id)
  );
}

async function alreadyInFlight(taskId) {
  const issues = await listOpenCodexIssues();
  const foundIssue = issues.find((it) => hasTaskId(taskId, `${it.title}\n${it.body || ""}`));
  if (foundIssue) return { type: "issue", number: foundIssue.number, title: foundIssue.title };

  const pulls = await listOpenPulls();
  const foundPr = pulls.find((it) => hasTaskId(taskId, `${it.title}\n${it.body || ""}`));
  if (foundPr) return { type: "pr", number: foundPr.number, title: foundPr.title };

  return null;
}

async function createCodexIssue(task) {
  const { owner, name } = ownerRepo();
  const url = `${GITHUB_API}/repos/${owner}/${name}/issues`;

  const body =
`Task ID: ${task.id}

${task.titleLine}

Instructions (from TASKS.md):
${task.body && task.body.trim() ? task.body.trim() : "(no instructions found in TASKS.md for this task)"}

---
Automation notes:
- Source of truth: TASKS.md
- Keep the "Task ID: ${task.id}" line intact in the PR body.
`;

  const payload = {
    title: task.titleLine,
    body,
    labels: ["codex-run"],
  };

  return ghFetch(url, { method: "POST", body: JSON.stringify(payload) });
}

async function main() {
  const md = readTasksMd();
  const tasks = parseTasks(md);

  const next = tasks.find((t) => t.status === "TODO");

  if (!next) {
    console.log("No TODO tasks found (all COMPLETE). Nothing to dispatch.");
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
