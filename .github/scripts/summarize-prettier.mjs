// Summarizes `prettier --check .` in the step summary and PR comment.
//
//     npx prettier --check . > prettier.log 2>&1
//     node summarize-prettier.mjs prettier.log [formatting-summary.md]
import { existsSync, readFileSync } from "node:fs";
import { writeMarkdown } from "./summary-output.mjs";

const FIX = "Run `npm run format` and commit the result.";

export function readLog(log) {
  const lines = log.split("\n");
  const files = lines
    .filter((l) => l.startsWith("[warn] ") && !l.includes("Code style issues"))
    .map((l) => l.slice("[warn] ".length));
  const errors = lines
    .filter((l) => l.startsWith("[error] "))
    .map((l) => l.slice("[error] ".length));
  return { files, errors };
}

export function toMarkdown({ files, errors }) {
  if (errors.length) {
    return [
      `## ❌ Prettier couldn't read ${errors.length} line(s) of input`,
      "",
      "```",
      ...errors.slice(0, 20),
      "```",
      "",
    ].join("\n");
  }
  if (!files.length) return "## ✅ Formatted with Prettier\n";
  return [
    `## ❌ ${files.length} file(s) need formatting`,
    "",
    FIX,
    "",
    ...files.map((f) => `- \`${f}\``),
    "",
  ].join("\n");
}

function main() {
  const [logPath = "prettier.log", markdownPath] = process.argv.slice(2);
  if (!existsSync(logPath)) {
    const message = `No Prettier output at ${logPath}; Prettier likely didn't run.`;
    console.log(message);
    writeMarkdown(`## ⚠️ No formatting results\n\n${message}\n`, markdownPath);
    return;
  }
  writeMarkdown(
    toMarkdown(readLog(readFileSync(logPath, "utf8"))),
    markdownPath,
  );
}

if (import.meta.main) main();
