import {
  appendFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

// Appends to the step summary in Actions, and writes the file the PR comment is built from.
export function writeMarkdown(markdown, markdownPath) {
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
  if (markdownPath) writeFileSync(markdownPath, markdown);
}

export function readJson(path) {
  return existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : null;
}

export function cell(text) {
  return String(text ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

export function firstLine(text, max = 200) {
  return String(text ?? "")
    .split("\n")[0]
    .slice(0, max);
}
