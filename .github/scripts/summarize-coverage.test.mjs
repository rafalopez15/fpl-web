import { describe, expect, it } from "vitest";
import {
  missing,
  ranges,
  readThresholds,
  toMarkdown,
} from "./summarize-coverage.mjs";

const pct = (n, total = 10) => ({ pct: n, total });
const total = (lines, others = lines) => ({
  statements: pct(others),
  branches: pct(others),
  functions: pct(others),
  lines: pct(lines),
});

describe("readThresholds", () => {
  it("reads the gate from the Vitest config", () => {
    const config = "coverage: { thresholds: { lines: 80, branches: 75.5 } }";
    expect(readThresholds(config)).toEqual({ lines: 80, branches: 75.5 });
  });

  it("is empty without a gate", () => {
    expect(readThresholds("coverage: {}")).toEqual({});
  });
});

describe("ranges", () => {
  it("joins untested lines until a tested one", () => {
    const lines = [
      [1, true],
      [2, false],
      [4, false],
      [5, true],
      [7, false],
    ];
    expect(ranges(lines)).toEqual(["2–4", "7"]);
  });

  it("is empty when everything ran", () => {
    expect(ranges([[1, true]])).toEqual([]);
  });
});

describe("missing", () => {
  const loc = (line) => ({ start: { line } });

  it("lists untested lines and untaken branches on lines that ran", () => {
    const file = {
      statementMap: { 0: loc(1), 1: loc(2), 2: loc(3), 3: loc(5) },
      s: { 0: 1, 1: 0, 2: 0, 3: 1 },
      branchMap: {
        0: { loc: loc(5), locations: [loc(5), loc(6)] },
        1: { loc: loc(2), locations: [loc(2)] },
      },
      b: { 0: [1, 0], 1: [0] },
    };
    // The branch on line 2 is left out: line 2 is already untested.
    expect(missing(file)).toEqual(["2–3", "6 branch"]);
  });

  it("counts a line as untested if any statement on it didn't run", () => {
    const file = {
      statementMap: { 0: loc(1), 1: loc(1) },
      s: { 0: 1, 1: 0 },
      branchMap: {},
      b: {},
    };
    expect(missing(file)).toEqual(["1"]);
  });
});

describe("toMarkdown", () => {
  const thresholds = { lines: 80 };

  it("says there's nothing to measure before src/lib has files", () => {
    const summary = { total: total(0) };
    summary.total.lines.total = 0;
    const markdown = toMarkdown({ summary, files: {}, thresholds });
    expect(markdown).toContain("nothing to measure yet");
  });

  it("passes at the gate and compares with main", () => {
    const markdown = toMarkdown({
      summary: { total: total(80) },
      files: {},
      thresholds,
      baseline: { total: total(75.5) },
    });
    expect(markdown).toContain("## ✅ Coverage 80.0%");
    expect(markdown).toContain(
      "Lines against `main`: ▲ 4.5% · CI fails under 80%",
    );
  });

  it("fails when any metric is under its gate", () => {
    const markdown = toMarkdown({
      summary: { total: total(90, 70) },
      files: {},
      thresholds: { lines: 80, branches: 80 },
    });
    expect(markdown).toContain("## ❌ Coverage 90.0%");
    expect(markdown).toContain("No coverage report from `main`");
  });

  it("says so when main had nothing to measure", () => {
    const empty = { pct: "Unknown", total: 0 };
    const baseline = {
      total: {
        statements: empty,
        branches: empty,
        functions: empty,
        lines: empty,
      },
    };
    const markdown = toMarkdown({
      summary: { total: total(100) },
      files: {},
      thresholds,
      baseline,
    });
    expect(markdown).toContain(
      "`main` had nothing to measure. · CI fails under 80%",
    );
    expect(markdown).not.toContain("no change");
  });

  it("lists changed files with gaps, and collapses covered ones", () => {
    const files = {
      "src/lib/a.ts": { pct: 50, missing: ["3–4"] },
      "src/lib/b.ts": { pct: 100, missing: [] },
    };
    const markdown = toMarkdown({
      summary: { total: total(90) },
      files,
      thresholds,
      changed: ["src/lib/a.ts", "src/lib/b.ts", "README.md"],
    });
    expect(markdown).toContain("| `src/lib/a.ts` | 50.0% | 3–4 |");
    expect(markdown).toContain("✅ 1 changed file(s) fully covered");
    expect(markdown).not.toContain("README.md");
  });

  it("says when no measured file changed", () => {
    const markdown = toMarkdown({
      summary: { total: total(90) },
      files: {},
      thresholds,
      changed: ["README.md"],
    });
    expect(markdown).toContain("No measured files changed.");
  });
});
