// Scans every host in research/targets.json through the public checker API
// and writes one timestamped file to research/results/. Requests are spaced
// to stay under the API's limit of 6 checks a minute per IP.
//
//   node scripts/scan.mjs            # full run
//   node scripts/scan.mjs --limit 3  # first 3 hosts, for a quick test

import { readFile, writeFile, mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const API = "https://www.waniwani.ai/api/pap-checker"
const GAP_MS = 13_000
const USER_AGENT = "PAPCheckerResearch/1.0 (+https://github.com/WaniWani-AI/pap-checker/tree/main/research)"

const limitArg = process.argv.indexOf("--limit")
const limit = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity

/** Sorts the checker's answer into one of the study's categories. */
export function classify(report) {
  if (!report || typeof report.verdict !== "string") return { category: "checker_error" }
  if (report.poppyJson !== undefined) {
    return { category: "publishes", score: report.score, version: report.protocolVersion ?? null }
  }
  if (report.verdict === "absent") return { category: "not_published" }
  const detail = report.checks?.[0]?.detail ?? ""
  if (/did not answer within/.test(detail)) return { category: "no_answer" }
  if (/redirects to/.test(detail)) return { category: "redirects_away" }
  if (/returned HTTP \d+/.test(detail)) {
    return { category: "blocks", status: Number(/HTTP (\d+)/.exec(detail)[1]) }
  }
  return { category: "unreachable", detail }
}

async function checkHost(host) {
  const started = Date.now()
  try {
    const response = await fetch(`${API}?domain=${encodeURIComponent(host)}`, {
      headers: { "user-agent": USER_AGENT },
    })
    const report = await response.json().catch(() => undefined)
    if (!response.ok) {
      return { host, httpStatus: response.status, ms: Date.now() - started, category: "checker_error", error: report?.error?.code ?? null }
    }
    return { host, ms: Date.now() - started, ...classify(report), report }
  } catch (error) {
    return { host, ms: Date.now() - started, category: "checker_error", error: String(error) }
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function main() {
  const targets = JSON.parse(await readFile(join(ROOT, "research", "targets.json"), "utf8"))
  const jobs = targets.targets.flatMap((target) => target.hosts.map((host) => ({ target, host }))).slice(0, limit)

  const startedAt = new Date().toISOString()
  const results = []
  for (const [index, { target, host }] of jobs.entries()) {
    if (index > 0) await sleep(GAP_MS)
    const result = await checkHost(host)
    results.push({ company: target.name, ...result })
    console.log(`${index + 1}/${jobs.length} ${host} ${result.category}${result.score !== undefined ? ` ${result.score}` : ""}`)
  }

  const run = {
    startedAt,
    finishedAt: new Date().toISOString(),
    api: API,
    userAgent: USER_AGENT,
    spec: targets.spec,
    results,
  }
  const file = join(ROOT, "research", "results", `${startedAt.replace(/[:.]/g, "-")}.json`)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, `${JSON.stringify(run, null, 2)}\n`)
  console.log(`wrote ${file}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
