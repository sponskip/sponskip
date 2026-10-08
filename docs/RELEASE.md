# Release procedure

1. Run `node --test test/detector.test.cjs` and `node scripts/validate-package.mjs`.
2. Create a fresh Chrome profile and remove any old unpacked Sponskip builds.
3. Load the repository with **Load unpacked** at `chrome://extensions`.
4. Verify a public video with a known SponsorBlock segment skips correctly.
5. Verify a video without captions continues normally and shows no extension error.
6. Verify auto-skip, toast, badge count, sound, rescan, and clear-data controls behave as labeled.
7. Open the options page and confirm its privacy links and local statistics.
8. Build the ZIP from a clean temporary directory and inspect it. `manifest.json` must be at the ZIP root.

```bash
node scripts/validate-package.mjs
stage_dir=$(mktemp -d)
cp manifest.json background.js content.js detector.js popup.html popup.js options.html options.js LICENSE "$stage_dir"
cp -R icons "$stage_dir/icons"
node scripts/validate-package.mjs "$stage_dir"
(cd "$stage_dir" && zip -qr "$OLDPWD/sponskip-v1.0.1.zip" .)
unzip -l sponskip-v1.0.1.zip
```
