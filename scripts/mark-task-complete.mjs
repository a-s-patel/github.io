import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const taskId = requiredEnv("TASK_ID");

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function write(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function markDone(md, id) {
  const lines = md.split("\n");
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Matches:
    // - [ ] id:task-11 title: ...
    // - [ ] id:task-11 ...
    const m = line.match(/^- \[( |x|X)\]\s+id:([^\s]+)\s+(.+)\s*$/);
    if (!m) continue;

    const currentId = m[2].trim();
    if (currentId !== id) continue;

    if (m[1].toLowerCase() === "x") {
      return { md, changed: false, reason: "already_done" };
    }

    lines[i] = line.replace(/^- \[\s\]/, "- [x]");
    changed = true;
    return { md: lines.join("\n"), changed, reason: "marked_done" };
  }

  return { md, changed: false, reason: "not_found" };
}

function sh(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function commitToMain(message) {
  sh("git config user.name \"github-actions[bot]\"");
  sh("git config user.email \"41898282+github-actions[bot]@users.noreply.github.com\"");
  sh("git add TASKS.md");
  sh(`git commit -m "${message.replaceAll('"', '\\"')}"`);
  sh("git push origin HEAD:main");
}

function main() {
  const tasksPath = path.join(process.cwd(), "TASKS.md");
  if (!fs.existsSync(tasksPath)) throw new Error("TASKS.md not found at repo root.");

  const original = read(tasksPath);
  const result = markDone(original, taskId);

  if (!result.changed) {
    console.log(`No change: ${taskId} (${result.reason})`);
    return;
  }

  write(tasksPath, result.md);
  commitToMain(`chore(tasks): mark ${taskId} complete`);
  console.log(`Marked complete: ${taskId}`);
}

main();
