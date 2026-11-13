// The popup sends the active tab's hostname to the checker API on
// waniwani.ai when it opens, and renders the report it gets back. Nothing
// runs in the background and nothing is stored.

const API = "https://www.waniwani.ai/api/pap-checker"
const SVG_NS = "http://www.w3.org/2000/svg"

const GROUPS = [
  { id: "discovery", name: "Discovery" },
  { id: "oauth", name: "Sign-in" },
  { id: "interfaces", name: "Interfaces" },
  { id: "session", name: "Session header" },
]

const STATUS_LABEL = { pass: "Pass", warn: "Warning", fail: "Fail", skip: "Skipped" }

const VERDICT_TITLE = {
  ready: "Personal agents can work with this site",
  issues: "Discoverable, but some interfaces fail",
  broken: "Personal agents stop before their first request",
  absent: "This site doesn't publish a poppy.json",
}

const MINIMAL_DOC = (domain) =>
  JSON.stringify(
    { protocol_version: "1.0", organization: { name: "Your company", domain }, web: {} },
    null,
    2,
  )

const content = document.getElementById("content")
const rerun = document.getElementById("rerun")

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "text") node.textContent = value
    else node.setAttribute(key, value)
  }
  for (const child of children) node.append(child)
  return node
}

function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value))
  for (const child of children) node.append(child)
  return node
}

function scoreColor(score) {
  if (score >= 90) return "var(--pass)"
  if (score >= 60) return "var(--warn)"
  return "var(--fail)"
}

/** Each status has its own shape, so color is never the only signal. */
function statusIcon(status) {
  const base = { width: 16, height: 16, viewBox: "0 0 16 16", "aria-hidden": "true" }
  const stroke = { stroke: "#ffffff", "stroke-width": 1.8, "stroke-linecap": "round", fill: "none" }
  if (status === "pass") {
    return svg("svg", base, [
      svg("circle", { cx: 8, cy: 8, r: 8, fill: "var(--pass)" }),
      svg("path", { d: "M4.6 8.2l2.2 2.2 4.6-4.8", ...stroke, "stroke-linejoin": "round" }),
    ])
  }
  if (status === "warn") {
    return svg("svg", base, [
      svg("path", { d: "M8 1.2l7.2 13.3H0.8z", fill: "var(--warn)" }),
      svg("path", { d: "M8 6v4", ...stroke, "stroke-width": 1.6 }),
      svg("circle", { cx: 8, cy: 12.2, r: 0.9, fill: "#ffffff" }),
    ])
  }
  if (status === "fail") {
    return svg("svg", base, [
      svg("rect", { width: 16, height: 16, rx: 4, fill: "var(--fail)" }),
      svg("path", { d: "M5.2 5.2l5.6 5.6M10.8 5.2l-5.6 5.6", ...stroke }),
    ])
  }
  return svg("svg", base, [
    svg("circle", { cx: 8, cy: 8, r: 7, fill: "none", stroke: "var(--muted)", "stroke-width": 1.5 }),
    svg("path", { d: "M5 8h6", stroke: "var(--muted)", "stroke-width": 1.6, "stroke-linecap": "round" }),
  ])
}

function scoreRing(score) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  return el("div", { class: "ring", role: "img", "aria-label": `Score ${score} out of 100` }, [
    svg("svg", { width: 84, height: 84, viewBox: "0 0 84 84", "aria-hidden": "true" }, [
      svg("circle", { class: "track", cx: 42, cy: 42, r: radius, fill: "none", "stroke-width": 8 }),
      svg("circle", {
        class: "value",
        cx: 42,
        cy: 42,
        r: radius,
        fill: "none",
        stroke: scoreColor(score),
        "stroke-width": 8,
        "stroke-linecap": "round",
        "stroke-dasharray": `${(circumference * score) / 100} ${circumference}`,
        transform: "rotate(-90 42 42)",
      }),
    ]),
    el("div", { class: "ring-label" }, [el("strong", { text: String(score) }), el("span", { text: "of 100" })]),
  ])
}

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`
}

function renderReport(report) {
  const { summary } = report
  const counts = [
    `${summary.pass} pass`,
    plural(summary.warn, "warning"),
    `${summary.fail} fail`,
    summary.skip ? `${summary.skip} skipped` : null,
  ].filter(Boolean)
  const declared = report.protocolVersion ? `Site declares ${report.protocolVersion}` : "No protocol_version"

  const result = el("section", { class: "result", "aria-label": "Result" }, [
    scoreRing(report.score),
    el("div", { class: "result-text" }, [
      el("p", { class: "domain", text: report.domain }),
      el("h2", { text: VERDICT_TITLE[report.verdict] }),
      el("p", { class: "meta", text: counts.join(" · ") }),
      el("p", { class: "meta", text: `${declared} · checked against ${report.specVersion}` }),
    ]),
  ])

  const groups = GROUPS.map((group) => {
    const checks = report.checks.filter((check) => check.group === group.id)
    if (!checks.length) return null
    const passed = checks.filter((check) => check.status === "pass").length
    return el("section", { class: "group" }, [
      el("h3", {}, [el("span", { text: group.name }), el("span", { text: `${passed} of ${checks.length} pass` })]),
      el(
        "ul",
        { class: "checks" },
        checks.map((check) =>
          el("li", { class: "check" }, [
            statusIcon(check.status),
            el("div", { class: "check-text" }, [
              el("span", { class: "check-title" }, [
                el("span", { class: "sr-only", text: `${STATUS_LABEL[check.status]}: ` }),
                check.title,
              ]),
              el("span", { class: "check-detail", text: check.detail }),
              check.spec ? el("span", { class: "check-spec", text: `Spec §${check.spec}` }) : "",
            ]),
          ]),
        ),
      ),
    ])
  }).filter(Boolean)

  content.replaceChildren(result, ...groups)
}

function renderAbsent(domain) {
  const doc = MINIMAL_DOC(domain)
  const copy = el("button", { class: "button", type: "button", text: "Copy this document" })
  copy.addEventListener("click", async () => {
    await navigator.clipboard.writeText(doc)
    copy.textContent = "Copied"
  })
  content.replaceChildren(
    el("section", { class: "empty" }, [
      el("p", { class: "domain", text: domain }),
      el("h2", { text: VERDICT_TITLE.absent }),
      el("p", {
        text: "/.well-known/poppy.json returned 404, so personal agents can't find this site through the protocol. The smallest valid document:",
      }),
      el("pre", { text: doc }),
      copy,
      el("p", {
        text: "Serve it as application/json. Without an OAuth issuer, also answer 404 at /.well-known/oauth-protected-resource.",
      }),
    ]),
  )
}

function renderMessage(title, body) {
  content.replaceChildren(el("section", { class: "empty" }, [el("h2", { text: title }), el("p", { text: body })]))
}

function renderLoading(domain) {
  content.replaceChildren(
    el("p", { class: "sr-only", text: `Checking ${domain}` }),
    el("div", { class: "skeleton", "aria-hidden": "true" }, [
      el("div", { style: "height: 84px" }),
      el("div", { style: "height: 16px; width: 60%" }),
      el("div", { style: "height: 44px" }),
      el("div", { style: "height: 44px" }),
      el("div", { style: "height: 44px" }),
    ]),
  )
}

async function setBadge(tabId, report) {
  if (!globalThis.chrome?.action || tabId === undefined) return
  if (report.verdict === "absent") {
    await chrome.action.setBadgeText({ tabId, text: "" })
    return
  }
  const color = report.score >= 90 ? "#1e8e3e" : report.score >= 60 ? "#b7791f" : "#c62828"
  await chrome.action.setBadgeBackgroundColor({ tabId, color })
  await chrome.action.setBadgeTextColor?.({ tabId, color: "#ffffff" })
  await chrome.action.setBadgeText({ tabId, text: String(report.score) })
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

async function check() {
  const tab = await activeTab()
  let url
  try {
    url = new URL(tab?.url ?? "")
  } catch {
    url = undefined
  }
  if (!url || url.protocol !== "https:") {
    rerun.hidden = true
    content.setAttribute("aria-busy", "false")
    renderMessage("Open a website to check it", "PAP Checker tests the HTTPS site in the current tab.")
    return
  }

  const domain = url.host
  rerun.hidden = false
  content.setAttribute("aria-busy", "true")
  renderLoading(domain)

  try {
    const response = await fetch(`${API}?domain=${encodeURIComponent(domain)}`)
    const body = await response.json().catch(() => undefined)
    if (response.status === 429) {
      const wait = response.headers.get("retry-after") ?? "a few"
      renderMessage("Too many checks", `Wait ${wait} seconds, then run the check again.`)
      return
    }
    if (!response.ok || !body || typeof body.score !== "number") {
      const message = body?.error?.message ?? `The checker answered HTTP ${response.status}.`
      renderMessage("The check didn't finish", message)
      return
    }
    if (body.verdict === "absent") renderAbsent(domain)
    else renderReport(body)
    await setBadge(tab.id, body)
  } catch {
    renderMessage("The checker can't be reached", "Check your connection, then run the check again.")
  } finally {
    content.setAttribute("aria-busy", "false")
  }
}

rerun.addEventListener("click", () => {
  void check()
})

void check()
