import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

function requiredEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const taskId = requiredEnv("TASK_ID"); // e.g. task-13

function read(p) {
  return fs.readFileSync(p, "utf8");
}

function write(p, s) {
  fs.writeFileSync(p, s, "utf8");
}

function sh(cmd) {
  execSync(cmd, { stdio: "inherit" });
}

function commitToMain(message) {
  sh('git config user.name "github-actions[bot]"');
  sh('git config user.email "41898282+github-actions[bot]@users.noreply.github.com"');
  sh("git add TASKS.md");
  sh(`git commit -m "${message.replaceAll('"', '\\"')}"`);
  sh("git push origin HEAD:main");
}

function markComplete(md, taskId) {
  const m = taskId.match(/^task-(\d+)$/i);
  if (!m) return { md, changed: false, reason: `invalid_task_id:${taskId}` };

  const num = m[1];
  const lines = md.split("\n");

  let inTargetTask = false;
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    const header = lines[i].match(/^Task\s+(\d+)\s+—\s+(.+)\s*$/);
    if (header) {
      inTargetTask = header[1] === num;
      continue;
    }

    if (!inTargetTask) continue;

    const status = lines[i].match(/^Status:\s*(TODO|COMPLETE)\s*$/i);
    if (status) {
      const current = status[1].toUpperCase();
      if (current === "COMPLETE") {
        return { md, changed: false, reason: "already_complete" };
      }

      lines[i] = "Status: COMPLETE";
      changed = true;
      return { md: lines.join("\n"), changed, reason: "marked_complete" };
    }

    // If we hit another task without finding status line, stop scanning
    if (lines[i].match(/^Task\s+\d+\s+—\s+/)) break;
  }

  return { md, changed: false, reason: "task_or_status_not_found" };
}

function main() {
  const tasksPath = path.join(process.cwd(), "TASKS.md");
  if (!fs.existsSync(tasksPath)) throw new Error("TASKS.md not found at repo root.");

  const original = read(tasksPath);
  const result = markComplete(original, taskId);

  if (!result.changed) {
    console.log(`No change: ${taskId} (${result.reason})`);
    return;
  }

  write(tasksPath, result.md);
  commitToMain(`chore(tasks): mark ${taskId} complete`);
  console.log(`Marked complete: ${taskId}`);
}

main();
