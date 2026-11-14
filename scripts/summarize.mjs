// Merges every run in research/results/ into research/summary.json and
// research/summary.csv: one row per company, with the rule below.
//
// A company publishes if any of its hosts served a poppy.json in any run,
// and keeps its best score. Otherwise its category is the first one seen,
// in this order: not_published, blocks, redirects_away, no_answer,
// unreachable, checker_error. A 404 is a definite answer, so it outranks a
// firewall or a timeout on another run or host.

import { readFile, readdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const ORDER = ["publishes", "not_published", "blocks", "redirects_away", "no_answer", "unreachable", "checker_error"]

const csvCell = (value) => {
  const text = value === undefined || value === null ? "" : String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

async function main() {
  const { targets, spec } = JSON.parse(await readFile(join(ROOT, "research", "targets.json"), "utf8"))
  const dir = join(ROOT, "research", "results")
  const files = (await readdir(dir)).filter((name) => name.endsWith(".json")).sort()
  const runs = await Promise.all(files.map(async (name) => JSON.parse(await readFile(join(dir, name), "utf8"))))

  const companies = targets.map((target) => {
    const observations = runs.flatMap((run) =>
      run.results
        .filter((result) => result.company === target.name)
        .map((result) => ({
          run: run.startedAt,
          host: result.host,
          category: result.category,
          score: result.score,
          version: result.version,
          status: result.status,
        })),
    )
    const published = observations.filter((o) => o.category === "publishes")
    let outcome
    if (published.length) {
      const best = published.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a))
      outcome = { category: "publishes", score: best.score, version: best.version, host: best.host }
    } else {
      const category = ORDER.find((c) => observations.some((o) => o.category === c)) ?? "not_scanned"
      const statuses = [...new Set(observations.filter((o) => o.category === "blocks").map((o) => o.status))]
      outcome = { category, ...(statuses.length ? { statuses } : {}) }
    }
    return { name: target.name, segment: target.segment, groups: target.groups, source: target.source, hosts: target.hosts, ...outcome, observations }
  })

  const tally = (rows) =>
    Object.fromEntries(ORDER.map((c) => [c, rows.filter((r) => r.category === c).length]).filter(([, n]) => n > 0))
  const groups = ["poppy_partners", "top_banks", "top_insurers"]
  const summary = {
    spec,
    runs: runs.map((run) => ({ startedAt: run.startedAt, finishedAt: run.finishedAt, hosts: run.results.length })),
    totals: {
      all: { companies: companies.length, ...tally(companies) },
      ...Object.fromEntries(groups.map((g) => {
        const rows = companies.filter((c) => c.groups.includes(g))
        return [g, { companies: rows.length, ...tally(rows) }]
      })),
    },
    companies,
  }
  await writeFile(join(ROOT, "research", "summary.json"), `${JSON.stringify(summary, null, 2)}\n`)

  const header = ["company", "segment", "groups", "category", "score", "version", "host", "blocked_statuses", "runs_observed", "source"]
  const lines = companies.map((c) =>
    [c.name, c.segment, c.groups.join(" "), c.category, c.score, c.version, c.host, c.statuses?.join(" "), new Set(c.observations.map((o) => o.run)).size, c.source]
      .map(csvCell)
      .join(","),
  )
  await writeFile(join(ROOT, "research", "summary.csv"), `${[header.join(","), ...lines].join("\n")}\n`)
  console.log(JSON.stringify(summary.totals, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
