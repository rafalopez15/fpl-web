// Summarizes a step that only passes or fails (type check, build), with the end of
// its log when it fails.
//
//     node summarize-log.mjs "Type check" success|failure typecheck.log [summary.md]
import { existsSync, readFileSync } from "node:fs";
import { writeMarkdown } from "./summary-output.mjs";

const TAIL_LINES = 40;

export function toMarkdown(title, outcome, log) {
  if (outcome === "success") return `## ✅ ${title} passed\n`;
  // Strips terminal colors.
  const clean = log.replace(/\x1b\[[0-9;]*m/g, "").trimEnd();
  const tail = clean.split("\n").slice(-TAIL_LINES).join("\n");
  return [
    `## ❌ ${title} failed`,
    "",
    "<details><summary>End of the log</summary>",
    "",
    "```",
    tail,
    "```",
    "</details>",
    "",
  ].join("\n");
}

function main() {
  const [title, outcome, logPath, markdownPath] = process.argv.slice(2);
  if (outcome !== "success" && !existsSync(logPath)) {
    writeMarkdown(`## ⚠️ ${title} didn't run\n`, markdownPath);
    return;
  }
  const log = existsSync(logPath) ? readFileSync(logPath, "utf8") : "";
  writeMarkdown(toMarkdown(title, outcome, log), markdownPath);
}

if (import.meta.main) main();
