// Characters Obsidian refuses in a filename: path separators, the ones
// Windows and iOS reject, and the ones that break a wikilink.
const ILLEGAL = /[/\\:*?"<>|#^[\]]/g;

/** The filename a title asks for, without extension. Empty if nothing is left. */
export function filenameFromTitle(title: string): string {
  return title.replace(ILLEGAL, "").replace(/\s+/g, " ").trim();
}

export interface NoteRef {
  path: string;
  basename: string;
  extension: string;
  parentPath: string;
}

export type Plan =
  | { kind: "rename"; to: string }
  | { kind: "unchanged" }
  | { kind: "skip"; reason: string };

/**
 * What renaming `note` from its `title` would do. `taken` answers whether a
 * path, compared case-insensitively, already belongs to another file: the
 * vault's filenames are unique without regard to case, and macOS agrees.
 */
export function planRename(
  note: NoteRef,
  title: unknown,
  taken: (path: string) => boolean,
): Plan {
  if (typeof title !== "string" || title.trim() === "") {
    return { kind: "skip", reason: "no title" };
  }
  const name = filenameFromTitle(title);
  if (name === "") {
    return { kind: "skip", reason: "title has no usable characters" };
  }
  if (name === note.basename) return { kind: "unchanged" };
  const dir = note.parentPath === "/" ? "" : `${note.parentPath}/`;
  const to = `${dir}${name}.${note.extension}`;
  if (taken(to)) return { kind: "skip", reason: `${to} already exists` };
  return { kind: "rename", to };
}
