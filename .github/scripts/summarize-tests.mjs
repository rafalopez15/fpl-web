// Summarizes Vitest's JSON report in the job log, step summary and PR comment.
//
//     node summarize-tests.mjs test-results.json [tests-summary.md]
import { relative } from "node:path";
import { cell, firstLine, readJson, writeMarkdown } from "./summary-output.mjs";

export function readResults(report) {
  const failures = [];
  for (const file of report.testResults) {
    const path = relative(process.cwd(), file.name);
    const failed = file.assertionResults.filter((t) => t.status === "failed");
    for (const test of failed) {
      failures.push([
        `${path} > ${test.fullName}`,
        firstLine(test.failureMessages[0]),
      ]);
    }
    // A file that fails to load has no test results, only a message.
    if (file.status === "failed" && failed.length === 0) {
      failures.push([path, firstLine(file.message)]);
    }
  }
  const skipped = report.numPendingTests + report.numTodoTests;
  return {
    total: report.numTotalTests,
    passed: report.numPassedTests,
    failed: report.numFailedTests,
    skipped,
    failures,
  };
}

export function toMarkdown(results) {
  const { total, passed, failed, skipped, failures } = results;
  const rate = total ? (passed / total) * 100 : 0;
  const status = failures.length
    ? `❌ ${failures.length} test failure(s)`
    : "✅ All tests passed";
  const lines = [
    `## ${status}`,
    "",
    "| Total | Passed | Failed | Skipped | Pass rate |",
    "|---|---|---|---|---|",
    `| ${total} | ${passed} | ${failed} | ${skipped} | ${rate.toFixed(1)}% |`,
  ];
  if (failures.length) {
    lines.push("", "### Failures", "", "| Test | Error |", "|---|---|");
    for (const [name, message] of failures) {
      lines.push(`| \`${cell(name)}\` | ${cell(message)} |`);
    }
  }
  return lines.join("\n") + "\n";
}

function main() {
  const [reportPath = "test-results.json", markdownPath] =
    process.argv.slice(2);
  const report = readJson(reportPath);
  if (!report) {
    const message = `No test report at ${reportPath}; Vitest likely failed before running tests.`;
    console.log(message);
    writeMarkdown(`## ⚠️ No test results\n\n${message}\n`, markdownPath);
    return;
  }
  const results = readResults(report);
  console.log(
    `${results.passed}/${results.total} passed, ${results.skipped} skipped`,
  );
  for (const [name, message] of results.failures) {
    console.log(`  FAILED ${name}: ${message}`);
  }
  writeMarkdown(toMarkdown(results), markdownPath);
}

if (import.meta.main) main();
