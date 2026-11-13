# Chrome Web Store listing

Everything the store's dashboard asks for, ready to paste.

## Name

PAP Checker

## Summary (132 characters max)

Check whether a site works with personal agents through the Personal Agent Protocol (Poppy) 1.0. Score, every check, every fix.

## Description

Open PAP Checker on any HTTPS site to see whether personal agents such as Muse can work with it through the Personal Agent Protocol (Poppy, formerly PAP), version 1.0.

You get a score out of 100 and every check the spec asks for, each with its spec section and what to fix:

• Discovery: poppy.json at the well-known path, organization.domain against the host that served it, required fields, extensions and version documents.
• Sign-in: the protected resource metadata and the issuer that has to list the domain back.
• Interfaces: a live call to each MCP server, OpenAPI description, tasks endpoint and browser-session page.
• Session header: requests signed as a real personal agent, plus a forged one that a conforming site has to refuse.

A failure in discovery or sign-in caps the score at 40, because an agent stops there.

The extension only runs when you click it, and it sends nothing but the site's hostname to the checker at waniwani.ai. Open source under the MIT license: github.com/WaniWani-AI/pap-checker

Built by Waniwani. A community tool, not affiliated with Sierra, Meta or the Personal Agent Protocol project.

## Category

Developer Tools

## Language

English

## Single purpose

Check the site in the current tab against the Personal Agent Protocol and show the result.

## Permission justifications

- **activeTab:** reads the current tab's address when the user clicks the extension, to know which site to check.
- **Host permission for waniwani.ai:** sends the hostname to the checker API at www.waniwani.ai and reads the report.

## Remote code

No. All code ships in the package.

## Data usage

Collects: website content? No. Web history? No. The hostname of the current tab is sent to the checker when the user clicks the extension, to provide the extension's single purpose. Not sold, not used for anything else.

## Privacy policy URL

https://github.com/WaniWani-AI/pap-checker/blob/main/PRIVACY.md

## Assets

- Icon: `extension/icons/icon-128.png`
- Screenshots (1280×800): `store/screenshot-ready.png`, `store/screenshot-problems.png`, `store/screenshot-absent.png`
