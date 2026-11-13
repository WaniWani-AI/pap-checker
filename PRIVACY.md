# Privacy policy

Last updated: 13 November 2026

PAP Checker is a Chrome extension published by Waniwani. This page says what it collects and why.

## What the extension sends

When you click the extension's icon, it reads the address of the current tab through Chrome's `activeTab` permission and sends the hostname (for example `shop.example.com`) to `https://www.waniwani.ai/api/pap-checker`. It sends nothing else: no full URL, no page content, no cookies and no identifier for you or your browser.

The extension does nothing until you click its icon. It has no background script and stores nothing on your device.

## What the checker does with it

The checker fetches the public Personal Agent Protocol endpoints of that hostname, such as `/.well-known/poppy.json`, and returns a report to the extension. The server that runs the checker keeps standard request logs (time, the hostname checked, IP address), which we use to run the service and to limit abuse. We don't sell this data or use it for advertising.

## Contact

Questions go to the issues of [WaniWani-AI/pap-checker](https://github.com/WaniWani-AI/pap-checker/issues).
