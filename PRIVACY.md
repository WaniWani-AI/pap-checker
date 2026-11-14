# Privacy policy

Last updated: 14 November 2026 (version 1.2.0)

PAP Checker is a Chrome extension published by Waniwani. This page says what it collects and why.

## What the extension sends, and to whom

**When you click the extension's icon**, it reads the current tab's address through Chrome's `activeTab` permission and sends the hostname (for example `shop.example.com`) to `https://www.waniwani.ai/api/pap-checker` for the check.

**Automatic scores are off until you turn them on** with the **Turn on** button in the popup, which asks Chrome for access to HTTPS sites. Once on, when a page finishes loading, the extension asks that site for its own public `/.well-known/poppy.json`, without cookies. That request goes from your browser to the site you are already visiting. Only when the site answers with a JSON document that carries a `protocol_version` does the extension send the site's hostname to the checker. Sites without the file, which is most of the web, are never sent to Waniwani. Neither are IP addresses, `localhost`, names without a dot, or private names such as `*.local`, `*.internal`, `*.lan` and `*.corp`. You can turn automatic scores off in Chrome's site access settings for the extension.

The extension sends nothing else: no full URL, no page content, no cookies and no identifier for you or your browser. Results are kept in the browser's session storage for 30 minutes, so the popup opens at once, and are cleared when the browser closes.

## What the checker does with it

The checker fetches the public Personal Agent Protocol endpoints of that hostname, such as `/.well-known/poppy.json`, and returns a report to the extension. The server that runs the checker keeps standard request logs (time, the hostname checked, IP address), which we use to run the service and to limit abuse. We don't sell this data or use it for advertising.

## Contact

Questions go to the issues of [WaniWani-AI/pap-checker](https://github.com/WaniWani-AI/pap-checker/issues).
