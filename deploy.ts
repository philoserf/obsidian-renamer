import { $ } from "bun";

// The build's last step: copy the bundle into the vault's plugin folder, so
// there is no separate deploy. Unset, the build stops at ./main.js.
const dest = process.env.OBSIDIAN_DEPLOY_DEST;
if (!dest) {
  console.log("OBSIDIAN_DEPLOY_DEST not set — built ./main.js only");
  process.exit(0);
}

await $`mkdir -p ${dest}`;
await $`cp main.js manifest.json ${dest}`;
console.log(`Installed to ${dest}`);
