// Summarizes ESLint's JSON report in the job log, step summary and PR comment.
//
//     node summarize-eslint.mjs eslint-report.json [eslint-summary.md]
import { relative } from "node:path";
import { cell, readJson, writeMarkdown } from "./summary-output.mjs";

export function readIssues(report) {
  return report.flatMap((file) =>
    file.messages.map((m) => ({
      location: `${relative(process.cwd(), file.filePath)}:${m.line ?? 0}`,
      level: m.severity === 2 ? "error" : "warning",
      rule: m.ruleId ?? "parse",
      message: m.message,
    })),
  );
}

export function toMarkdown(issues) {
  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.length - errors;
  // CI runs with --max-warnings 0, so a warning fails it too.
  const status = issues.length
    ? `❌ ${issues.length} ESLint issue(s)`
    : "✅ No ESLint issues";
  const lines = [
    `## ${status}`,
    "",
    "| Errors | Warnings |",
    "|---|---|",
    `| ${errors} | ${warnings} |`,
  ];
  if (issues.length) {
    lines.push("", "| Location | Rule | Message |", "|---|---|---|");
    for (const i of issues) {
      lines.push(`| \`${i.location}\` | \`${i.rule}\` | ${cell(i.message)} |`);
    }
  }
  return lines.join("\n") + "\n";
}

function main() {
  const [reportPath = "eslint-report.json", markdownPath] =
    process.argv.slice(2);
  const report = readJson(reportPath);
  if (!report) {
    const message = `No ESLint report at ${reportPath}; ESLint likely crashed.`;
    console.log(message);
    writeMarkdown(`## ⚠️ No ESLint results\n\n${message}\n`, markdownPath);
    return;
  }
  const issues = readIssues(report);
  console.log(
    issues.length ? `${issues.length} ESLint issue(s)` : "No ESLint issues",
  );
  for (const i of issues) {
    console.log(`  ${i.location} ${i.level} ${i.rule}: ${i.message}`);
  }
  writeMarkdown(toMarkdown(issues), markdownPath);
}

if (import.meta.main) main();
