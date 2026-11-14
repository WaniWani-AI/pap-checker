# Are insurers and banks ready for personal agents?

An open, repeatable study of how the largest US insurers and banks, and the insurance and banking companies that design the Personal Agent Protocol (Poppy), publish themselves to personal agents under Poppy 1.0.

Everything needed to check or rerun it is in this folder: the list of companies and why each one is included, the scan script, every raw result, and the summary.

## Question

When a personal agent such as Meta's Muse arrives at an insurer's or a bank's website, can it find a Poppy discovery document, and does that document work under version 1.0 of the spec?

## Who is in the study

70 companies in three groups, picked by fixed rules from public sources. A company can be in more than one group.

| Group | Rule | Source |
| --- | --- | --- |
| Top banks (25) | The 25 largest US commercial banking groups by consolidated assets. Ranks 11 and 17 are both Morgan Stanley, so rank 26 (Regions) completes the 25. | Federal Reserve, U.S. Domestically Chartered Commercial Banks, data as of 30 June 2026 |
| Top insurers (25) | The 25 largest US property/casualty insurance groups by direct premiums written. | NAIC, 2025 Top 25 Property/Casualty Groups, countrywide, all lines |
| Poppy partners (25) | Every announced Poppy design partner whose core business is insurance, banking or consumer lending. | Sierra's announcements of 6 Oct, 9 Oct and 13 Nov 2026 |

[`targets.json`](targets.json) lists each company with its group, the exact source line, and the hosts checked.

## What is checked

For each company: its bare domain and its `www` host, plus any other host the company documents publicly for Poppy (today, `app.mercury.com` and `rocket.com`). Where a group is known to consumers by another brand, the brand's site is used and noted, for example GEICO for Berkshire Hathaway's insurers.

Each host goes through the public checker at [waniwani.ai/pap-checker](https://waniwani.ai/pap-checker), the same one the extension uses, which validates against Personal Agent Protocol 1.0. The checker fetches `/.well-known/poppy.json` as a personal agent would, then the OAuth metadata, then every interface the document lists, and signs its requests as a test personal agent.

## Categories

Every host lands in exactly one category, read off the checker's response:

| Category | Meaning |
| --- | --- |
| `publishes` | A Poppy document was found and checked. Comes with a score out of 100 and the document's `protocol_version`. |
| `not_published` | The path answered 404, 410 or an HTML page. |
| `blocks` | The path answered another 4xx or 5xx status, usually a firewall. |
| `redirects_away` | The path redirected somewhere other than a `poppy.json`, such as a sign-in page. |
| `no_answer` | No response within 8 seconds. |
| `checker_error` | The checker itself failed or was rate limited. Not a result about the company. |

A company's result merges its hosts across all runs: it `publishes` if any host published in any run, with its best score. Otherwise it takes the first category in the order of the table, so a definite 404 outranks a firewall or a timeout. Every single observation stays in [`summary.json`](summary.json).

## Repetition

The scan runs three times a day, eight hours apart, on GitHub Actions ([`scan.yml`](../.github/workflows/scan.yml)). Each run writes a timestamped file to [`results/`](results), so a one-off timeout or firewall hiccup can't decide a company's result, and the history shows when a company starts publishing.

## Limits

- **Only public paths are checked.** A company can implement Poppy on a host this study doesn't know about. Tell us in an [issue](https://github.com/WaniWani-AI/pap-checker/issues) and we'll add it, with the source.
- **Firewalls may treat agents differently.** The checker identifies itself as `WaniwaniPapChecker/1.0`. A firewall that blocks it may still let a specific personal agent through.
- **Pre-1.0 documents.** The spec makes versions before 1.0 compatible only with the same minor version, so an agent built on 1.0 skips a 0.3 or 0.4 document. Those documents still get a score here, with their version shown next to it.
- **Scores reflect the checker's reading of the spec.** The checks and their spec sections are listed in the [main README](../README.md#what-it-checks). If you think one is wrong, open an issue with the section number.

## Rerun it yourself

```bash
node scripts/scan.mjs        # about 35 minutes for 140 hosts
node scripts/summarize.mjs   # rebuilds summary.json and summary.csv
```
