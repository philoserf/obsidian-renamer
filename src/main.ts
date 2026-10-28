import { Notice, Plugin, type TFile, TFolder } from "obsidian";
import { type Plan, planRename } from "./rename";

export default class RenamerPlugin extends Plugin {
  override async onload(): Promise<void> {
    this.addCommand({
      id: "rename-current-note",
      name: "Rename current note from title",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (file?.extension !== "md") return false;
        if (!checking) void this.renameAndNotify(file);
        return true;
      },
    });

    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, fileOrFolder) => {
        if (!(fileOrFolder instanceof TFolder)) return;
        menu.addItem((item) =>
          item
            .setTitle("Rename from title")
            .setIcon("text-cursor-input")
            .onClick(() => void this.renameFolder(fileOrFolder)),
        );
      }),
    );

    // For automation driving Obsidian through its CLI, whose `command id=` acts
    // on the active note and prints nothing.
    this.registerCliHandler(
      "renamer:rename",
      "Rename one note's file from its title and print the result",
      {
        path: {
          value: "<path>",
          description: "Vault path of the note",
          required: true,
        },
      },
      async ({ path }) => {
        const file = path ? this.app.vault.getFileByPath(path) : null;
        if (!file) return `error: ${path}: no such file`;
        return this.rename(file);
      },
    );
  }

  /** Renames `file` from its title; returns one line saying what happened. */
  async rename(file: TFile): Promise<string> {
    const title = this.app.metadataCache.getFileCache(file)?.frontmatter?.title;
    const plan: Plan = planRename(
      {
        path: file.path,
        basename: file.basename,
        extension: file.extension,
        parentPath: file.parent?.path ?? "/",
      },
      title,
      (to) => this.taken(file, to),
    );
    switch (plan.kind) {
      case "unchanged":
        return `unchanged: ${file.path}`;
      case "skip":
        return `skipped: ${file.path}: ${plan.reason}`;
      case "rename": {
        const from = file.path;
        try {
          await this.app.fileManager.renameFile(file, plan.to);
        } catch (err) {
          return `error: ${from}: ${err instanceof Error ? err.message : String(err)}`;
        }
        return `renamed: ${from} → ${plan.to}`;
      }
    }
  }

  private taken(file: TFile, to: string): boolean {
    const want = to.toLowerCase();
    return this.app.vault
      .getFiles()
      .some((f) => f !== file && f.path.toLowerCase() === want);
  }

  private async renameAndNotify(file: TFile): Promise<void> {
    const line = await this.rename(file);
    if (!line.startsWith("unchanged")) new Notice(line);
  }

  private async renameFolder(folder: TFolder): Promise<void> {
    const prefix = folder.isRoot() ? "" : `${folder.path}/`;
    const files = this.app.vault
      .getMarkdownFiles()
      .filter((f) => f.path.startsWith(prefix));
    const lines: string[] = [];
    for (const file of files) lines.push(await this.rename(file));
    const renamed = lines.filter((l) => l.startsWith("renamed")).length;
    const problems = lines.filter(
      (l) => l.startsWith("skipped") || l.startsWith("error"),
    );
    for (const l of problems) console.warn(`[Renamer] ${l}`);
    new Notice(
      `Renamer: ${renamed} renamed, ${problems.length} skipped of ${files.length}` +
        (problems.length ? " — see console" : ""),
    );
  }
}
