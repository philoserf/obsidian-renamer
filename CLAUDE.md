# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An Obsidian plugin that renames a note's file from its `title` property, in that direction only. It replaced File Title Updater in the notes vault, where `title` is the source and filenames follow it. Scope is deliberately one action: no settings, no filename → title, no first-heading sync. A request to add one of those is a request to bring back the plugin this replaced.

`src/rename.ts` is the whole policy and is pure: `filenameFromTitle` and `planRename`. `src/main.ts` only wires it to the command, the folder menu, and the `title-rename:rename` CLI verb, and performs the rename through `fileManager.renameFile` so links update.

## Development Commands

```bash
bun run build    # check, bundle to ./main.js, then copy into $OBSIDIAN_DEPLOY_DEST (from .env.local)
bun run check    # bun --check, biome check ., bun fmt --check on Markdown
bun test         # src/rename.test.ts
bun run version  # sync package.json version into manifest.json + versions.json
```

There is no deploy script: `deploy.ts` runs as the build's last step and is a no-op when `OBSIDIAN_DEPLOY_DEST` is unset.

## Conventions

Copied from `obsidian-plugin-template`; its CLAUDE.md explains version identity, the test preload, and the Biome/`bun fmt` split. `main.js` is gitignored build output: the vault gets it from the build, and a release attaches a fresh one. Releases go through the `release-gate` and `release-ship` skills; tags are bare semver.
