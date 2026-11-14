// Checks each HTTPS site the user visits and puts its score on the toolbar
// icon. It first fetches the site's own /.well-known/poppy.json from the
// browser; only when that file exists does it send the hostname to the
// checker API on waniwani.ai for the full check. Results are cached for the
// browser session, so the popup opens on a stored report.

const API = "https://www.waniwani.ai/api/pap-checker"
const FRESH_MS = 30 * 60 * 1000
const inFlight = new Map()

function cacheKey(host) {
  return `report:${host}`
}

async function readCache(host) {
  const key = cacheKey(host)
  const stored = await chrome.storage.session.get(key)
  return stored[key]
}

async function writeCache(host, entry) {
  await chrome.storage.session.set({ [cacheKey(host)]: entry })
}

function scoreColor(score) {
  if (score >= 90) return "#1e8e3e"
  if (score >= 60) return "#b7791f"
  return "#c62828"
}

async function paintBadge(tabId, entry) {
  if (tabId === undefined) return
  if (!entry || entry.kind !== "report" || entry.report.verdict === "absent") {
    await chrome.action.setBadgeText({ tabId, text: "" })
    return
  }
  const { score } = entry.report
  await chrome.action.setBadgeBackgroundColor({ tabId, color: scoreColor(score) })
  await chrome.action.setBadgeTextColor?.({ tabId, color: "#ffffff" })
  await chrome.action.setBadgeText({ tabId, text: String(score) })
}

/**
 * Hosts the automatic check never touches: IP addresses, single-label names
 * and private suffixes. Sending those to the checker would leak intranet
 * names, and the checker refuses private addresses anyway.
 */
const PRIVATE_SUFFIXES = [".local", ".internal", ".lan", ".corp", ".home", ".home.arpa", ".intranet", ".localhost", ".test", ".invalid"]

function isPublicHostname(host) {
  const name = host.replace(/:\d+$/, "").toLowerCase()
  if (name.startsWith("[") || /^\d+(\.\d+){3}$/.test(name)) return false
  if (!name.includes(".") || name === "localhost") return false
  return !PRIVATE_SUFFIXES.some((suffix) => name.endsWith(suffix))
}

/**
 * True only when the site serves a JSON object with a protocol_version at
 * the well-known path. Sites that answer every path with their HTML, or with
 * a 403 from a firewall, don't count, so their hostnames never leave the
 * browser.
 */
async function hasPoppyJson(host) {
  try {
    const response = await fetch(`https://${host}/.well-known/poppy.json`, {
      credentials: "omit",
      cache: "no-store",
      redirect: "follow",
    })
    if (!response.ok) return false
    const body = await response.json()
    return typeof body === "object" && body !== null && typeof body.protocol_version === "string"
  } catch {
    return false
  }
}

async function fullCheck(host) {
  const response = await fetch(`${API}?domain=${encodeURIComponent(host)}`, { credentials: "omit" })
  const body = await response.json().catch(() => undefined)
  if (response.status === 429) {
    return { kind: "error", title: "Too many checks", message: `Wait ${response.headers.get("retry-after") ?? "a few"} seconds, then run the check again.` }
  }
  if (!response.ok || !body || typeof body.score !== "number") {
    return { kind: "error", title: "The check didn't finish", message: body?.error?.message ?? `The checker answered HTTP ${response.status}.` }
  }
  return { kind: "report", report: body }
}

/**
 * Runs the check for a host, once at a time per host. With force, it skips
 * the cache and the poppy.json pre-check, so the popup's re-run button always
 * gets a full report.
 */
function check(host, { force = false } = {}) {
  const running = inFlight.get(host)
  if (running) return running
  const job = (async () => {
    if (!force) {
      const cached = await readCache(host)
      if (cached && Date.now() - cached.at < FRESH_MS) return cached
    }
    let entry
    try {
      if (!force && !(await hasPoppyJson(host))) {
        entry = { kind: "report", report: { verdict: "absent", domain: host, score: 0 } }
      } else {
        entry = await fullCheck(host)
      }
    } catch {
      entry = { kind: "error", title: "The checker can't be reached", message: "Check your connection, then run the check again." }
    }
    entry.at = Date.now()
    if (entry.kind === "report") await writeCache(host, entry)
    return entry
  })().finally(() => inFlight.delete(host))
  inFlight.set(host, job)
  return job
}

function hostOf(url) {
  try {
    const parsed = new URL(url ?? "")
    return parsed.protocol === "https:" ? parsed.host : undefined
  } catch {
    return undefined
  }
}

async function checkTab(tabId, url) {
  const host = hostOf(url)
  if (!host || !isPublicHostname(host)) {
    await chrome.action.setBadgeText({ tabId, text: "" })
    return
  }
  const entry = await check(host)
  await paintBadge(tabId, entry)
}

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  if (change.status === "complete") void checkTab(tabId, tab.url)
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId).catch(() => undefined)
  if (tab) void checkTab(tabId, tab.url)
})

chrome.runtime.onMessage.addListener((message, _sender, reply) => {
  if (message?.type !== "check" || typeof message.host !== "string") return false
  check(message.host, { force: Boolean(message.force) }).then(async (entry) => {
    await paintBadge(message.tabId, entry)
    reply(entry)
  })
  return true
})
