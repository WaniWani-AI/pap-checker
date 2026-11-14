// Renders the PNG icons from icons/icon.svg and the Chrome Web Store
// screenshots from fixture reports, with the chrome.* calls stubbed.
// Run: node scripts/render-assets.cjs  (needs Playwright with Chromium)
const { chromium } = require("playwright")
const fs = require("node:fs")
const path = require("node:path")

const root = path.join(__dirname, "..")
const ext = path.join(root, "extension")

async function icons(browser) {
  const svg = fs.readFileSync(path.join(ext, "icons", "icon.svg"), "utf8")
  const page = await browser.newPage()
  for (const size of [16, 32, 48, 128]) {
    // 128 keeps the store's 16px transparent margin around a 96px mark.
    const mark = size === 128 ? 96 : size
    await page.setViewportSize({ width: size, height: size })
    await page.setContent(
      `<html><body style="margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px">${svg.replace('width="28" height="28"', `width="${mark}" height="${mark}"`)}</body></html>`,
    )
    await page.screenshot({ path: path.join(ext, "icons", `icon-${size}.png`), omitBackground: true })
  }
  await page.close()
}

async function screenshot(browser, name, fixture, tabUrl) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  const host = new URL(tabUrl).host
  const entry = fixture === null
    ? { kind: "report", report: { verdict: "absent", domain: host, score: 0 } }
    : { kind: "report", report: JSON.parse(fs.readFileSync(fixture, "utf8")) }
  await page.addInitScript(({ url, entry }) => {
    globalThis.chrome = {
      tabs: { query: async () => [{ id: 1, url }] },
      storage: { session: { get: async () => ({}) } },
      runtime: { sendMessage: async () => entry },
      permissions: { contains: async () => true, request: async () => true },
    }
  }, { url: tabUrl, entry })
  // Frame the 380x600 popup on a neutral 1280x800 canvas, as the store expects.
  await page.goto(`file://${path.join(ext, "popup.html")}`)
  await page.waitForTimeout(900)
  await page.addStyleTag({
    content: `html{background:#f3f2ef;min-height:800px} body{background:transparent;display:flex;justify-content:center;padding-top:100px} .popup{border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.14),0 0 0 1px rgba(0,0,0,.06);overflow:hidden}`,
  })
  await page.screenshot({ path: path.join(root, "store", `screenshot-${name}.png`) })
  await context.close()
}

;(async () => {
  const browser = await chromium.launch()
  await icons(browser)
  const fixtures = path.join(root, "store", "fixtures")
  await screenshot(browser, "ready", path.join(fixtures, "ready.json"), "https://shop.example.com/")
  await screenshot(browser, "problems", path.join(fixtures, "problems.json"), "https://www.travel.example/")
  await screenshot(browser, "absent", null, "https://news.example.org/")
  await browser.close()
})()
