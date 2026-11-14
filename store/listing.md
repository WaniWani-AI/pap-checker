# Chrome Web Store listing

Everything the store's dashboard asks for, ready to paste.

## Name

PAP Checker

## Summary (132 characters max)

Check whether a site works with personal agents through the Personal Agent Protocol (Poppy) 1.0. Score, every check, every fix.

## Description

PAP Checker shows whether a site works with personal agents such as Muse through the Personal Agent Protocol (Poppy, formerly PAP), version 1.0. Click the icon on any site to check it, or turn on automatic scores to see them on the icon as you browse.

You get a score out of 100 and every check the spec asks for, each with its spec section and what to fix:

• Discovery: poppy.json at the well-known path, organization.domain against the host that served it, required fields, extensions and version documents.
• Sign-in: the protected resource metadata and the issuer that has to list the domain back.
• Interfaces: a live call to each MCP server, OpenAPI description, tasks endpoint and browser-session page.
• Session header: requests signed as a real personal agent, plus a forged one that a conforming site has to refuse.

A failure in discovery or sign-in caps the score at 40, because an agent stops there.

Privacy: a click sends the current site's hostname to the checker at waniwani.ai. Automatic scores are opt-in, and then only sites that publish a poppy.json are sent. Nothing else leaves your browser. Open source under the MIT license: github.com/WaniWani-AI/pap-checker

Made with ❤️ by Waniwani. A community tool, not affiliated with Sierra, Meta or the Personal Agent Protocol project.

## Category

Developer Tools

## Language

English

## Single purpose

Check visited sites against the Personal Agent Protocol and show the result.

## Permission justifications

- **activeTab:** reads the current tab's address when the user clicks the extension, to know which site to check.
- **Host permission (www.waniwani.ai, waniwani.ai):** sends the hostname to the checker API on waniwani.ai and reads the report.
- **Optional host permission https://*/*:** requested only when the user clicks "Turn on" for automatic scores. Used to request each visited site's public /.well-known/poppy.json and read the tab's address, so the score shows on the icon without a click. No content is read from or injected into pages.
- **storage:** keeps each result in session storage for 30 minutes so the popup opens at once. Cleared when the browser closes.

## Remote code

No. All code ships in the package.

## Data usage

Tick **Web history**, and only that. The extension sends the hostname of a visited site to the checker when that site publishes a poppy.json, which counts as a narrow form of browsing history. Then tick all three certifications: not sold to third parties, not used for purposes unrelated to the single purpose, not used for creditworthiness or lending.

## Privacy policy URL

https://github.com/WaniWani-AI/pap-checker/blob/main/PRIVACY.md

## Assets

- Icon: `extension/icons/icon-128.png`
- Small promo tile (440×280): `store/promo-small-440x280.png`
- Screenshots (1280×800): `store/screenshot-ready.png`, `store/screenshot-problems.png`, `store/screenshot-absent.png`
