// Summarizes Vitest's coverage in the job log, step summary and PR comment.
//
//     node summarize-coverage.mjs coverage/ [baseline/coverage-summary.json]
//         [changed-files.txt] [coverage-summary.md]
//
// coverage/ holds coverage-summary.json and coverage-final.json. The baseline is
// main's latest summary and changed-files.txt lists the PR's files; either may be
// missing, and that part is left out.
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { readJson, writeMarkdown } from "./summary-output.mjs";

const METRICS = ["statements", "branches", "functions", "lines"];
// More rows than this and the changed-files table is collapsed.
const MAX_OPEN_ROWS = 10;

// The gate from vitest.config.mts, so ✅/❌ matches when CI fails.
export function readThresholds(config) {
  const block = config.match(/thresholds:\s*{([^}]*)}/)?.[1] ?? "";
  return Object.fromEntries(
    [...block.matchAll(/(\w+):\s*(\d+(?:\.\d+)?)/g)].map(([, k, v]) => [
      k,
      Number(v),
    ]),
  );
}

// Untested lines as ranges ("4–6") and untaken branches on lines that ran ("8 branch").
export function missing(file) {
  const hitByLine = new Map();
  for (const [id, loc] of Object.entries(file.statementMap)) {
    const line = loc.start.line;
    const hit = file.s[id] > 0;
    hitByLine.set(line, (hitByLine.get(line) ?? true) && hit);
  }
  const lines = [...hitByLine].sort(([a], [b]) => a - b);
  const missed = new Set(lines.filter(([, hit]) => !hit).map(([line]) => line));

  const found = ranges(lines).map((range) => [parseInt(range), range]);
  for (const [id, branch] of Object.entries(file.branchMap)) {
    file.b[id].forEach((count, i) => {
      const line = branch.locations[i]?.start.line ?? branch.loc.start.line;
      if (count === 0 && !missed.has(line))
        found.push([line, `${line} branch`]);
    });
  }
  const unique = new Map(
    found.sort(([a], [b]) => a - b).map(([, label]) => [label, label]),
  );
  return [...unique.keys()];
}

// A range runs across lines with no statements, until a statement that ran.
export function ranges(lines) {
  const found = [];
  let start = null;
  let end = null;
  for (const [line, hit] of lines) {
    if (hit) {
      if (start !== null) found.push(span(start, end));
      start = null;
    } else if (start === null) {
      start = end = line;
    } else {
      end = line;
    }
  }
  if (start !== null) found.push(span(start, end));
  return found;
}

function span(start, end) {
  return start === end ? String(start) : `${start}–${end}`;
}

function change(total, baseline) {
  const difference = Math.round((total - baseline) * 10) / 10;
  if (difference > 0) return `▲ ${difference.toFixed(1)}%`;
  if (difference < 0) return `▼ ${(-difference).toFixed(1)}%`;
  return "no change";
}

export function toMarkdown({ summary, files, thresholds, baseline, changed }) {
  const total = summary.total;
  if (total.lines.total === 0) {
    return "## ✅ Coverage: nothing to measure yet\n\nNo files under `src/lib` yet.\n";
  }
  const under = METRICS.filter(
    (m) => thresholds[m] !== undefined && total[m].pct < thresholds[m],
  );
  const mark = under.length ? "❌" : "✅";
  const lines = [
    `## ${mark} Coverage ${total.lines.pct.toFixed(1)}%`,
    "",
    "| Statements | Branches | Functions | Lines |",
    "|---|---|---|---|",
    `| ${METRICS.map((m) => `${total[m].pct.toFixed(1)}%`).join(" | ")} |`,
    "",
  ];
  let note = baseline
    ? `Lines against \`main\`: ${change(total.lines.pct, baseline.total.lines.pct)}`
    : "No coverage report from `main` to compare against.";
  if (thresholds.lines !== undefined)
    note += ` · CI fails under ${thresholds.lines}%`;
  lines.push(note);

  if (changed) {
    const measured = changed.filter((path) => files[path]);
    if (!measured.length) lines.push("", "No measured files changed.");
    else lines.push("", ...changedFiles(files, measured));
  }
  return lines.join("\n") + "\n";
}

function changedFiles(files, paths) {
  const gaps = paths.filter((p) => files[p].missing.length);
  const covered = paths.filter((p) => !files[p].missing.length);
  const lines = [];
  if (gaps.length) {
    let table = [
      "| Changed file | Lines | Untested lines and branches |",
      "|---|---|---|",
      ...gaps.map(
        (p) =>
          `| \`${p}\` | ${files[p].pct.toFixed(1)}% | ${files[p].missing.join(", ")} |`,
      ),
    ];
    if (gaps.length > MAX_OPEN_ROWS) {
      const title = `${gaps.length} changed files with untested lines`;
      table = [
        `<details><summary>${title}</summary>`,
        "",
        ...table,
        "</details>",
      ];
    }
    lines.push(...table);
  }
  if (covered.length) {
    if (lines.length) lines.push("");
    lines.push(
      `<details><summary>✅ ${covered.length} changed file(s) fully covered</summary>`,
      "",
      ...covered.map((p) => `- \`${p}\``),
      "</details>",
    );
  }
  return lines;
}

// Per-file line coverage and gaps, keyed by repo-relative path.
export function readFiles(summary, final) {
  const files = {};
  for (const [path, data] of Object.entries(final)) {
    const key = relative(process.cwd(), path);
    files[key] = { pct: summary[path]?.lines.pct ?? 0, missing: missing(data) };
  }
  return files;
}

function main() {
  const [dir = "coverage", baselinePath, changedPath, markdownPath] =
    process.argv.slice(2);
  const summary = readJson(join(dir, "coverage-summary.json"));
  const final = readJson(join(dir, "coverage-final.json"));
  if (!summary || !final) {
    const message = `No coverage report in ${dir}; Vitest likely failed before writing it.`;
    console.log(message);
    writeMarkdown(`## ⚠️ No coverage results\n\n${message}\n`, markdownPath);
    return;
  }
  const changed =
    changedPath && existsSync(changedPath)
      ? readFileSync(changedPath, "utf8")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
      : null;
  const markdown = toMarkdown({
    summary,
    files: readFiles(summary, final),
    thresholds: readThresholds(readFileSync("vitest.config.mts", "utf8")),
    baseline: baselinePath ? readJson(baselinePath) : null,
    changed,
  });
  console.log(markdown);
  writeMarkdown(markdown, markdownPath);
}

if (import.meta.main) main();
