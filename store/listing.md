# Chrome Web Store listing

Everything the store's dashboard asks for, ready to paste.

## Name

PAP Checker

## Summary (132 characters max)

Check whether a site works with personal agents through the Personal Agent Protocol (Poppy) 1.0. Score, every check, every fix.

## Description

PAP Checker shows whether the sites you visit work with personal agents such as Muse through the Personal Agent Protocol (Poppy, formerly PAP), version 1.0. Sites that publish a poppy.json get their score on the toolbar icon as you browse.

You get a score out of 100 and every check the spec asks for, each with its spec section and what to fix:

• Discovery: poppy.json at the well-known path, organization.domain against the host that served it, required fields, extensions and version documents.
• Sign-in: the protected resource metadata and the issuer that has to list the domain back.
• Interfaces: a live call to each MCP server, OpenAPI description, tasks endpoint and browser-session page.
• Session header: requests signed as a real personal agent, plus a forged one that a conforming site has to refuse.

A failure in discovery or sign-in caps the score at 40, because an agent stops there.

Privacy: the extension first asks each site for its own public poppy.json. Only sites that publish one are sent, by hostname, to the checker at waniwani.ai. Nothing else leaves your browser. Open source under the MIT license: github.com/WaniWani-AI/pap-checker

Built by Waniwani. A community tool, not affiliated with Sierra, Meta or the Personal Agent Protocol project.

## Category

Developer Tools

## Language

English

## Single purpose

Check visited sites against the Personal Agent Protocol and show the result.

## Permission justifications

- **Host permission for https://*/*:** to request each visited site's public /.well-known/poppy.json from the browser, and to read the active tab's address, so the score can show on the icon without a click. No content is read from or injected into pages.
- **storage:** keeps each result in session storage for 30 minutes so the popup opens at once. Cleared when the browser closes.

## Remote code

No. All code ships in the package.

## Data usage

Collects: website content? No. Web history? Only in this narrow form: the hostname of a visited site is sent to the checker when that site publishes a poppy.json, to provide the extension's single purpose. Not sold, not used for anything else.

## Privacy policy URL

https://github.com/WaniWani-AI/pap-checker/blob/main/PRIVACY.md

## Assets

- Icon: `extension/icons/icon-128.png`
- Screenshots (1280×800): `store/screenshot-ready.png`, `store/screenshot-problems.png`, `store/screenshot-absent.png`
