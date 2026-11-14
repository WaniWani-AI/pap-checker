# Privacy policy

Last updated: 14 November 2026

PAP Checker is a Chrome extension published by Waniwani. This page says what it collects and why.

## What the extension sends, and to whom

When a page finishes loading in an HTTPS tab, the extension asks that site for its own `/.well-known/poppy.json`, the public file the Personal Agent Protocol defines. That request goes from your browser to the site you are already visiting, without cookies.

Only when the site publishes that file does the extension send the site's hostname (for example `shop.example.com`) to `https://www.waniwani.ai/api/pap-checker` for the full check. Sites without the file, which is most of the web, are never sent to Waniwani. The extension sends nothing else: no full URL, no page content, no cookies and no identifier for you or your browser.

Results are kept in the browser's session storage for 30 minutes, so the popup opens at once, and are cleared when the browser closes. Clicking the re-run button sends the hostname for a fresh full check.

## What the checker does with it

The checker fetches the public Personal Agent Protocol endpoints of that hostname, such as `/.well-known/poppy.json`, and returns a report to the extension. The server that runs the checker keeps standard request logs (time, the hostname checked, IP address), which we use to run the service and to limit abuse. We don't sell this data or use it for advertising.

## Contact

Questions go to the issues of [WaniWani-AI/pap-checker](https://github.com/WaniWani-AI/pap-checker/issues).
