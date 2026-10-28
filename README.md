# Renamer

Rename an [Obsidian](https://obsidian.md/) note's file from its `title` property.

## You probably shouldn't install this

This is personal tooling for one vault, where `title` is the source and the filename follows it. It does one thing and has no settings.

## What it does

The filename becomes the note's `title` with the characters a filename cannot hold removed: `/ \ : * ? " < > | # ^ [ ]`. Runs of whitespace left behind collapse to one space. The `title` property itself is never changed, so a title can keep its `?` or `:`.

A note is skipped, never overwritten, when it has no `title`, when nothing usable is left of it, or when another file already has the new name (compared without regard to case). Renames go through Obsidian, so links to the note are updated.

Three ways in:

- **Command:** "Rename current note from title".
- **Folder menu:** "Rename from title" renames every note in the folder and its subfolders, then shows a count; skipped notes are listed in the console.
- **CLI:** `obsidian renamer:rename path="Drafts/Note.md"` prints one line: `renamed: <from> → <to>`, `unchanged: <path>`, `skipped: <path>: <reason>`, or `error: <path>: <message>`.

## Install

`bun install`, then put `OBSIDIAN_DEPLOY_DEST=<vault>/.obsidian/plugins/renamer` in `.env.local` and run `bun run build`. The build checks, bundles, and copies `main.js` and `manifest.json` there.

## License

MIT
