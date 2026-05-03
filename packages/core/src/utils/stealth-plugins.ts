// Normally we would use the stealth plugin itself but due to how each evasion is imported at runtime
// we need to import each plugin manually for easier consumer builds

import puppeteerExtra from "puppeteer-extra";
import ChromeAppPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.app/index.js';
import ChromeCsiPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.csi/index.js';
import ChromeLoadTimesPlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.loadTimes/index.js';
import ChromeRuntimePlugin from 'puppeteer-extra-plugin-stealth/evasions/chrome.runtime/index.js';
import IframeContentWindowPlugin from 'puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow/index.js';
import MediaCodecsPlugin from 'puppeteer-extra-plugin-stealth/evasions/media.codecs/index.js';
import NavigatorHardwareConcurrencyPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.hardwareConcurrency/index.js';
import NavigatorLanguagesPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.languages/index.js';
import NavigatorPermissionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/navigator.permissions/index.js';
import SourceurlPlugin from 'puppeteer-extra-plugin-stealth/evasions/sourceurl/index.js';
import WebglVendorPlugin from 'puppeteer-extra-plugin-stealth/evasions/webgl.vendor/index.js';
import WindowOuterdimensionsPlugin from 'puppeteer-extra-plugin-stealth/evasions/window.outerdimensions/index.js';

const puppeteer = puppeteerExtra.default;

puppeteer.use(ChromeAppPlugin());
puppeteer.use(ChromeCsiPlugin());
puppeteer.use(ChromeLoadTimesPlugin());
puppeteer.use(ChromeRuntimePlugin());
puppeteer.use(IframeContentWindowPlugin());
puppeteer.use(MediaCodecsPlugin());
puppeteer.use(NavigatorHardwareConcurrencyPlugin());
puppeteer.use(NavigatorLanguagesPlugin());
puppeteer.use(NavigatorPermissionsPlugin());
// puppeteer.use(NavigatorPluginsPlugin());
// puppeteer.use(NavigatorVendorPlugin());
// puppeteer.use(NavigatorWebdriverPlugin());
puppeteer.use(SourceurlPlugin());
puppeteer.use(WebglVendorPlugin());
puppeteer.use(WindowOuterdimensionsPlugin());

// Following set of plugins are used for generating valid user agents but this project already sets user agents with other library
// puppeteer.use(UserAgentOverridePlugin());
// puppeteer.use(UserPreferencesPlugin());
// puppeteer.use(UserDataDirPlugin());