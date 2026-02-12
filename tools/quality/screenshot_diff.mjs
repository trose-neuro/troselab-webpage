#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { chromium } from "playwright";

const baseUrl = process.argv[2] || "http://127.0.0.1:4173";
const outRoot = process.argv[3] || "artifacts/quality-screenshots";
const minDiffRatio = Number(process.env.MIN_SCREEN_DIFF_RATIO || "0.005");

const pages = [
  { path: "/", slug: "home" },
  { path: "/research/", slug: "research" },
  { path: "/publications/", slug: "publications" },
  { path: "/blog/", slug: "news" },
];

const lightDir = join(outRoot, "light");
const darkDir = join(outRoot, "dark");
const diffDir = join(outRoot, "diff");
mkdirSync(lightDir, { recursive: true });
mkdirSync(darkDir, { recursive: true });
mkdirSync(diffDir, { recursive: true });

const captureMode = async (browser, mode, pageInfo) => {
  const context = await browser.newContext({
    colorScheme: mode === "dark" ? "dark" : "light",
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript((isDark) => {
    window.localStorage.setItem("dark-mode", String(isDark));
  }, mode === "dark");

  const page = await context.newPage();
  await page.goto(`${baseUrl}${pageInfo.path}`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  try {
    await page.waitForLoadState("networkidle", { timeout: 10000 });
  } catch {
    // tolerate long-running third-party network requests
  }
  const outPath = join(mode === "dark" ? darkDir : lightDir, `${pageInfo.slug}.png`);
  await page.screenshot({ path: outPath, fullPage: true });
  await context.close();
  return outPath;
};

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const failures = [];
  const report = {};

  try {
    for (const pageInfo of pages) {
      const lightPath = await captureMode(browser, "light", pageInfo);
      const darkPath = await captureMode(browser, "dark", pageInfo);

      const light = PNG.sync.read(readFileSync(lightPath));
      const dark = PNG.sync.read(readFileSync(darkPath));

      if (light.width !== dark.width || light.height !== dark.height) {
        failures.push(`${pageInfo.path}: image dimensions do not match`);
        continue;
      }

      const diff = new PNG({ width: light.width, height: light.height });
      const diffPixels = pixelmatch(
        light.data,
        dark.data,
        diff.data,
        light.width,
        light.height,
        { threshold: 0.12 }
      );

      const ratio = diffPixels / (light.width * light.height);
      report[pageInfo.path] = {
        diffPixels,
        ratio,
      };

      const diffPath = join(diffDir, `${pageInfo.slug}.png`);
      writeFileSync(diffPath, PNG.sync.write(diff));

      if (ratio < minDiffRatio) {
        failures.push(
          `${pageInfo.path}: light/dark diff ratio ${ratio.toFixed(4)} below threshold ${minDiffRatio}`
        );
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(join(outRoot, "report.json"), JSON.stringify(report, null, 2));

  if (failures.length > 0) {
    console.error("Screenshot diff gate failed:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("Screenshot diff gate passed.");
};

await main();
