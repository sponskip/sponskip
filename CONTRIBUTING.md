# Contributing to Sponskip

Thanks for helping improve Sponskip.

## Before opening a pull request

- Keep detection logic local to the browser. Do not add analytics, telemetry, advertising SDKs, or undeclared network endpoints.
- Add a focused test or document a repeatable manual check when you change detection behavior.
- Update `docs/PRIVACY.md` and `docs/STORE-LISTING.md` if your change affects permissions, stored data, or network requests.
- Do not include private or unlisted YouTube URLs, browser profiles, cookies, account data, or credentials.

## Development checks

```bash
node --test test/detector.test.cjs
node scripts/validate-package.mjs
node --check background.js
node --check content.js
```

## Pull requests

Use the pull request template and keep each change focused. The repository license is source-available and does not grant redistribution rights.
