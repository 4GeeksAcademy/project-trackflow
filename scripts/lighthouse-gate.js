#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const baseUrl = process.env.BASE_URL || "http://127.0.0.1:6060";
const chromePath =
  process.env.CHROME_PATH ||
  "/home/codespace/.cache/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-linux64/chrome-headless-shell";

const pages = [
  { key: "home_en", url: `${baseUrl}/index.html` },
  { key: "app_en", url: `${baseUrl}/application.html` },
  { key: "home_es", url: `${baseUrl}/es/index.html` },
  { key: "app_es", url: `${baseUrl}/es/application.html` }
];

const categories = ["performance", "accessibility", "best-practices", "seo"];
const outDir = path.resolve(process.cwd(), ".lighthouse-gate-results");

function ensureOutDir() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

function runLighthouse(url, outputFile) {
  const cmd = [
    `CHROME_PATH='${chromePath}'`,
    "npx --yes lighthouse",
    `'${url}'`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--chrome-flags='--headless --no-sandbox --disable-dev-shm-usage'",
    "--quiet",
    "--no-enable-error-reporting",
    "--output=json",
    `--output-path='${outputFile}'`
  ].join(" ");

  execSync(cmd, { stdio: "pipe" });
  return JSON.parse(fs.readFileSync(outputFile, "utf8"));
}

function scoreFromResult(result, category) {
  return Math.round((result.categories[category].score || 0) * 100);
}

function main() {
  ensureOutDir();

  const attempts = 3;
  const failures = [];

  console.log(`Lighthouse gate starting with BASE_URL=${baseUrl}`);
  console.log(`Using CHROME_PATH=${chromePath}`);

  for (const page of pages) {
    const runs = {};
    for (const category of categories) {
      runs[category] = [];
    }

    for (let i = 1; i <= attempts; i++) {
      const out = path.join(outDir, `${page.key}-run-${i}.json`);
      const result = runLighthouse(page.url, out);

      for (const category of categories) {
        runs[category].push(scoreFromResult(result, category));
      }
    }

    const medians = {};
    for (const category of categories) {
      medians[category] = median(runs[category]);
    }

    console.log(`\n${page.key}`);
    for (const category of categories) {
      const runList = runs[category].join(", ");
      console.log(`- ${category}: runs [${runList}], median ${medians[category]}`);
      if (medians[category] < 100) {
        failures.push({ page: page.key, category, median: medians[category], runs: runs[category] });
      }
    }
  }

  if (failures.length) {
    console.log("\nLighthouse gate FAILED. Categories below 100 median:");
    for (const failure of failures) {
      console.log(
        `- ${failure.page} | ${failure.category} | median ${failure.median} | runs [${failure.runs.join(", ")}]`
      );
    }
    process.exit(1);
  }

  console.log("\nLighthouse gate PASSED: all tracked categories are 100 median on all pages.");
}

main();
