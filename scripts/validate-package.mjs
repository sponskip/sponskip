import { access, readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.argv[2] || process.cwd());
const allowed = new Set([
  "manifest.json", "background.js", "content.js", "detector.js", "popup.html", "popup.js",
  "options.html", "options.js", "icons", "LICENSE", "README.md", "CONTRIBUTING.md", "SECURITY.md", "docs", "scripts", "test"
]);

const manifest = JSON.parse(await readFile(resolve(root, "manifest.json"), "utf8"));
if (manifest.manifest_version !== 3) throw new Error("manifest_version must be 3");
for (const field of ["name", "version", "description", "action"]) {
  if (!manifest[field]) throw new Error(`manifest is missing ${field}`);
}

for (const size of ["16", "48", "128"]) {
  const icon = manifest.icons?.[size];
  if (!icon) throw new Error(`manifest is missing ${size}px icon metadata`);
  await access(resolve(root, icon));
}

const entries = await readdir(root, { withFileTypes: true });
const unexpected = entries
  .filter((entry) => !entry.name.startsWith(".") && !entry.name.match(/^sponskip-v[\d.]+\.zip$/) && !allowed.has(entry.name))
  .map((entry) => entry.name);
if (unexpected.length > 0) throw new Error(`unexpected repository entries: ${unexpected.join(", ")}`);

console.log(`Package gate passed: ${manifest.name} ${manifest.version}; required icons and Manifest V3 metadata are present in ${root}.`);
