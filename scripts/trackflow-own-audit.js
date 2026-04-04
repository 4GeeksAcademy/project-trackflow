#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { performance } = require("perf_hooks");

const BASE_URL = process.env.BASE_URL || "http://127.0.0.1:6060";
const ROOT = process.cwd();
const baseHost = new URL(BASE_URL).hostname;
const trustedHosts = new Set([baseHost, "127.0.0.1", "localhost", "trackflow.com"]);

const pages = [
  { key: "home_en", route: "/index.html", lang: "en" },
  { key: "app_en", route: "/application.html", lang: "en" },
  { key: "home_es", route: "/es/index.html", lang: "es" },
  { key: "app_es", route: "/es/application.html", lang: "es" }
];

const categoryNames = ["performance", "accessibility", "bestPractices", "seo"];

function scoreCategory(checks) {
  if (!checks.length) return 100;
  const passed = checks.filter((c) => c.pass).length;
  return Math.round((passed / checks.length) * 100);
}

function has(html, pattern) {
  return pattern.test(html);
}

function attrMatchAll(html, tagName, attrName) {
  const regex = new RegExp(`<${tagName}[^>]*\\s${attrName}="([^"]+)"[^>]*>`, "gi");
  const matches = [];
  let m;
  while ((m = regex.exec(html)) !== null) matches.push(m[1]);
  return matches;
}

function fileSizeBytes(relPath) {
  const full = path.join(ROOT, relPath.replace(/^\//, ""));
  if (!fs.existsSync(full)) return -1;
  return fs.statSync(full).size;
}

async function fetchWithTiming(url) {
  const t0 = performance.now();
  const res = await fetch(url);
  const html = await res.text();
  const t1 = performance.now();
  return { ok: res.ok, status: res.status, html, ms: t1 - t0, bytes: Buffer.byteLength(html, "utf8") };
}

function runChecks(page, html, net) {
  const perf = [];
  const a11y = [];
  const best = [];
  const seo = [];

  const cssLinks = attrMatchAll(html, "link", "href").filter((h) => h.endsWith(".css"));
  const absoluteAssets = attrMatchAll(html, "link", "href")
    .concat(attrMatchAll(html, "script", "src"))
    .filter((u) => /^https?:\/\//i.test(u));

  const externalAssets = absoluteAssets.filter((u) => {
    try {
      const host = new URL(u).hostname;
      return !trustedHosts.has(host);
    } catch {
      return true;
    }
  });

  // Performance (custom, Lighthouse-like)
  perf.push({ name: "HTML responds successfully", pass: net.ok && net.status === 200 });
  perf.push({ name: "Fast HTML response (<800ms)", pass: net.ms < 800 });
  perf.push({ name: "HTML payload budget (<250KB)", pass: net.bytes < 250 * 1024 });
  perf.push({ name: "No third-party network assets", pass: externalAssets.length === 0 });
  perf.push({ name: "Main CSS preload present", pass: has(html, /<link[^>]*rel="preload"[^>]*as="style"/i) });

  // Validate local CSS budgets when referenced
  const cssBudgetPass = cssLinks.every((href) => {
    if (/^https?:\/\//i.test(href)) return false;
    const size = fileSizeBytes(href);
    return size > 0 && size < 60 * 1024;
  });
  perf.push({ name: "CSS bundle budget (<60KB each)", pass: cssBudgetPass });

  // Accessibility (custom, Lighthouse-like)
  a11y.push({ name: "Document language declared", pass: has(html, /<html[^>]*\slang="[a-z]{2}(-[A-Z]{2})?"/i) });
  a11y.push({ name: "Skip link present", pass: has(html, /href="#main-content"/i) });
  a11y.push({ name: "Single H1 present", pass: (html.match(/<h1\b/gi) || []).length === 1 });
  a11y.push({ name: "Form inputs have labels (application pages)", pass: !page.key.includes("app") || has(html, /<label[^>]*for="companyName"/i) });
  a11y.push({ name: "Fieldsets include legends (application pages)", pass: !page.key.includes("app") || has(html, /<fieldset[\s\S]*?<legend/i) });
  a11y.push({ name: "No invalid fieldset aria-required", pass: !has(html, /<fieldset[^>]*aria-required=/i) });

  // Best Practices (custom, Lighthouse-like)
  best.push({ name: "Canonical uses HTTPS", pass: has(html, /<link[^>]*rel="canonical"[^>]*href="https:\/\//i) });
  best.push({ name: "Manifest linked", pass: has(html, /<link[^>]*rel="manifest"/i) });
  best.push({ name: "Favicon linked", pass: has(html, /<link[^>]*rel="icon"/i) });
  best.push({ name: "No insecure HTTP links", pass: !has(html, /href="http:\/\//i) });

  const blankLinks = [...html.matchAll(/<a[^>]*target="_blank"[^>]*>/gi)].map((m) => m[0]);
  const safeBlankLinks = blankLinks.every((tag) => /rel="[^"]*noopener[^"]*noreferrer[^"]*"/i.test(tag));
  best.push({ name: "External _blank links are safe", pass: blankLinks.length === 0 || safeBlankLinks });

  // SEO (custom, Lighthouse-like)
  seo.push({ name: "Title present", pass: has(html, /<title>[^<]{10,}<\/title>/i) });
  seo.push({ name: "Meta description present", pass: has(html, /<meta[^>]*name="description"[^>]*content="[^"]{50,}"/i) });
  seo.push({ name: "Canonical present", pass: has(html, /<link[^>]*rel="canonical"/i) });
  seo.push({ name: "Robots meta index/follow", pass: has(html, /<meta[^>]*name="robots"[^>]*content="[^"]*index[^"]*follow/i) });
  seo.push({ name: "Hreflang links present", pass: has(html, /hreflang="en"/i) && has(html, /hreflang="es"/i) && has(html, /hreflang="x-default"/i) });
  seo.push({ name: "Open Graph tags present", pass: has(html, /property="og:title"/i) && has(html, /property="og:description"/i) && has(html, /property="og:image"/i) });
  seo.push({ name: "Twitter card tags present", pass: has(html, /name="twitter:card"/i) && has(html, /name="twitter:image"/i) });
  seo.push({ name: "Structured data present", pass: has(html, /<script[^>]*type="application\/ld\+json"/i) });

  return { performance: perf, accessibility: a11y, bestPractices: best, seo };
}

async function main() {
  console.log(`Custom audit target: ${BASE_URL}`);
  const results = [];

  for (const page of pages) {
    const url = `${BASE_URL}${page.route}`;
    const net = await fetchWithTiming(url);
    const checks = runChecks(page, net.html, net);

    const categoryScores = {
      performance: scoreCategory(checks.performance),
      accessibility: scoreCategory(checks.accessibility),
      bestPractices: scoreCategory(checks.bestPractices),
      seo: scoreCategory(checks.seo)
    };

    results.push({ page: page.key, url, categoryScores, checks });
  }

  let hasFailure = false;
  for (const res of results) {
    console.log(`\n${res.page} (${res.url})`);
    for (const category of categoryNames) {
      const score = res.categoryScores[category];
      console.log(`- ${category}: ${score}`);
      if (score < 100) hasFailure = true;

      const failedChecks = res.checks[category].filter((c) => !c.pass);
      if (failedChecks.length) {
        for (const fail of failedChecks) {
          console.log(`  FAIL: ${fail.name}`);
        }
      }
    }
  }

  if (hasFailure) {
    console.log("\nCustom quality gate FAILED (one or more categories < 100).");
    process.exit(1);
  }

  console.log("\nCustom quality gate PASSED (all categories are 100).\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
