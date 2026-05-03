import path from "path";
import "./stealth-plugins.js";
import { Browser } from "puppeteer";
import puppeteerExtra from 'puppeteer-extra';
import * as fs from 'fs';

const puppeteer = puppeteerExtra.default;

export const PuppeteerLaunchOptions: string[] = [
  '--start-maximized',
  '--disable-blink-features=AutomationControlled',
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--window-position=0,0',
  '--ignore-certificate-errors',
  '--disable-features=BackForwardCache'
]

export const PuppeteerIgnoreArgs: string[] = [
  '--enable-automation'
]

export async function withBrowser<T = void>(
  task: (browser: Browser) => Promise<T>,
  config?: { headless?: boolean, cacheDir?: string },
): Promise<T> {
  const { headless = false, cacheDir } = config || {};

  const browser = await puppeteer.launch({
    ...(cacheDir && {
      userDataDir: cacheDir,
      executablePath: getBrowserExecutablePath(cacheDir),
      env: {
        PUPPETEER_CACHE_DIR: cacheDir,
        PUPPETEER_EXECUTABLE_PATH: getBrowserExecutablePath(cacheDir)
      },
    }),
    headless: headless,
    args: PuppeteerLaunchOptions,
    ignoreDefaultArgs: PuppeteerIgnoreArgs
  });

  try {
    return await task(browser);
  } finally {
    await browser.close();
  }
}

export function getBrowserExecutablePath(cacheDir: string) {
  const chromeDir = path.join(cacheDir, 'chrome');

  if (!fs.existsSync(chromeDir)) {
    throw new Error(`Could not find chrome path in cache. Ssearched for: ${chromeDir}`);
  }

  const folders = fs.readdirSync(chromeDir);
  if (folders.length === 0) {
    throw new Error("Chrome folder is empty!");
  }

  const chromeExePath = path.join(chromeDir, folders[0], "chrome-win64", "chrome.exe");
  if (!fs.existsSync(chromeExePath)) {
    throw new Error(`chrome.exe not found in path: ${chromeExePath}`);
  }

  return chromeExePath;
}