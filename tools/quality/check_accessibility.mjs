#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { chromium } from "playwright";

const require = createRequire(import.meta.url);
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";
const pages = ["/", "/research/", "/publications/", "/blog/"];
const modes = ["light", "dark"];
const failures = [];

const relevantViolation = (violation) => {
  if (violation.id === "color-contrast") return true;
  return ["serious", "critical"].includes(violation.impact || "");
};

const runPage = async (browser, mode, pagePath) => {
  const context = await browser.newContext({
    colorScheme: mode === "dark" ? "dark" : "light",
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript((isDark) => {
    window.localStorage.setItem("dark-mode", String(isDark));
  }, mode === "dark");

  const page = await context.newPage();
  const url = `${baseUrl}${pagePath}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  try {
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  } catch {
    // tolerate long-polling/third-party scripts and continue checks
  }
  await page.addScriptTag({ content: axeSource });

  const results = await page.evaluate(async () => {
    return await axe.run(document, {
      runOnly: {
        type: "tag",
        values: ["wcag2a", "wcag2aa", "wcag21aa"],
      },
    });
  });

  const violations = results.violations.filter(relevantViolation);
  for (const violation of violations) {
    const targets = violation.nodes
      .slice(0, 3)
      .map((node) => node.target.join(" "))
      .join(" | ");
    failures.push(
      `${mode.toUpperCase()} ${pagePath} [${violation.id}] ${violation.help} :: ${targets}`
    );
  }

  await context.close();
};

const main = async () => {
  const browser = await chromium.launch({ headless: true });

  try {
    for (const mode of modes) {
      for (const pagePath of pages) {
        await runPage(browser, mode, pagePath);
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error("Accessibility/contrast violations:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Accessibility and contrast checks passed.");
};

await main();
