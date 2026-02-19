import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const REQUIRED_PARTIALS = [
  "partials/header.html",
  "partials/footer.html"
];

const PAGE_DIRS = [
  ".",
  "playbooks",
  "case-studies",
  "creative-lab",
  "growth-vault",
  "media"
];

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function readFile(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function validatePartialsExist() {
  for (const partial of REQUIRED_PARTIALS) {
    if (!fileExists(partial)) {
      throw new Error(`Missing required partial file: ${partial}`);
    }
  }
}

function validatePageIncludes(filePath) {
  const content = readFile(filePath);

  if (!content.includes("partials/header.html")) {
    throw new Error(`Missing header partial include in: ${filePath}`);
  }

  if (!content.includes("partials/footer.html")) {
    throw new Error(`Missing footer partial include in: ${filePath}`);
  }
}

function validatePages() {
  for (const dir of PAGE_DIRS) {

    const dirPath = path.join(ROOT, dir);

    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {

      if (!file.endsWith(".html")) continue;

      const relPath =
        dir === "."
          ? file
          : path.join(dir, file);

      validatePageIncludes(relPath);
    }
  }
}

function main() {

  console.log("Running site structure validation...");

  validatePartialsExist();

  validatePages();

  console.log("Validation passed.");
}

main();
