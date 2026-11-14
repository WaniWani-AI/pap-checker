# PAP Checker

A Chrome extension that tells you whether the site in your current tab works with personal agents through the [Personal Agent Protocol](https://personalagentprotocol.org) (Poppy, formerly PAP), version 1.0.

Open the popup on any HTTPS site. You get a score out of 100 and every check, with the spec section it comes from and what to fix.

![PAP Checker on a site with problems](store/screenshot-problems.png)

## What it checks

The checks follow the order a personal agent works in, so the first failure is the one that stops an agent.

- **Discovery.** `/.well-known/poppy.json` at the exact path, redirects that stay on HTTPS, `organization.domain` against the host that served the file (`www` and the apex are different hosts), the required fields, scope hints, extensions and every `supported_versions` document.
- **Sign-in.** The protected resource metadata, the issuer it names, and the issuer's own metadata listing the domain back in `protected_resources`.
- **Interfaces.** An MCP `initialize` on each MCP server, a load of each OpenAPI description, the tasks endpoint and the browser-session page.
- **Session header.** The checker acts as a personal agent with published client metadata and keys. It signs a Session JWT for each call, then sends a forged one and a request with an unsupported `Poppy-Version`, which a conforming endpoint has to refuse.

## The score

A pass counts 1 and a warning 0.5, over the checks that ran. Skipped checks don't count. A failure in discovery or sign-in caps the score at 40, because a personal agent stops there and never reaches the interfaces that passed.

## Privacy

The extension asks for `activeTab`, so it sees the current tab's address only when you click its icon. It then sends that hostname to `https://www.waniwani.ai/api/pap-checker`, which runs the checks against the site's public endpoints and returns the report. Nothing runs in the background, nothing is stored, and no other data leaves your browser. Details in [PRIVACY.md](PRIVACY.md).

The same report is available without the extension:

```bash
curl "https://www.waniwani.ai/api/pap-checker?domain=example.com"
```

or on the web at [waniwani.ai/pap-checker](https://waniwani.ai/pap-checker).

## Install

From the Chrome Web Store once the listing is live, or by hand:

1. Download `pap-checker-<version>.zip` from the [latest release](https://github.com/WaniWani-AI/pap-checker/releases/latest) and unzip it.
2. Open `chrome://extensions`, turn on Developer mode, and click **Load unpacked**.
3. Pick the unzipped folder.

## Develop

The extension is plain HTML, CSS and JavaScript in [`extension/`](extension), with no build step. Load that folder unpacked to try a change.

```bash
./scripts/build.sh                 # dist/pap-checker-<version>.zip
node scripts/render-assets.cjs     # icons and store screenshots (needs Playwright)
```

## Release

Bump `version` in `extension/manifest.json`, then either push a matching tag or run the **Release** workflow by hand on `main` from the Actions tab, which creates the tag itself:

```bash
git tag v1.0.1 && git push origin v1.0.1
```

The [release workflow](.github/workflows/release.yml) builds the zip and attaches it to a GitHub release. When the repository has the `CWS_EXTENSION_ID`, `CWS_PUBLISHER_ID`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET` and `CWS_REFRESH_TOKEN` secrets, it also uploads and publishes the zip to the Chrome Web Store.

## About

Built by [Waniwani](https://waniwani.ai). PAP Checker is a community tool. It is not affiliated with Sierra, Meta or the Personal Agent Protocol project, and the names Personal Agent Protocol and Poppy belong to their owners.

MIT licensed, see [LICENSE](LICENSE).
