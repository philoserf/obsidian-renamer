import { describe, expect, test } from "bun:test";
import { filenameFromTitle, type NoteRef, planRename } from "./rename";

const note: NoteRef = {
  path: "Drafts/Old name.md",
  basename: "Old name",
  extension: "md",
  parentPath: "Drafts",
};
const free = () => false;

describe("filenameFromTitle", () => {
  test("removes characters a filename cannot hold", () => {
    expect(filenameFromTitle('Why "X"? A/B: #1 [^x] <y>|*\\')).toBe(
      "Why X AB 1 x y",
    );
  });

  test("collapses the whitespace removal leaves behind", () => {
    expect(filenameFromTitle("Left / right")).toBe("Left right");
    expect(filenameFromTitle("  padded  ")).toBe("padded");
  });

  test("keeps everything else", () => {
    expect(filenameFromTitle("Café, naïve—and 'quoted' (2026)")).toBe(
      "Café, naïve—and 'quoted' (2026)",
    );
  });
});

describe("planRename", () => {
  test("renames within the note's folder", () => {
    expect(planRename(note, "New name?", free)).toEqual({
      kind: "rename",
      to: "Drafts/New name.md",
    });
  });

  test("renames at the vault root", () => {
    const root = { ...note, path: "Old name.md", parentPath: "/" };
    expect(planRename(root, "New", free)).toEqual({
      kind: "rename",
      to: "New.md",
    });
  });

  test("leaves a matching note alone", () => {
    expect(planRename(note, "Old name", free)).toEqual({ kind: "unchanged" });
    expect(planRename(note, "Old name?", free)).toEqual({ kind: "unchanged" });
  });

  test("allows a case-only rename", () => {
    expect(planRename(note, "Old Name", free)).toEqual({
      kind: "rename",
      to: "Drafts/Old Name.md",
    });
  });

  test("skips a missing or blank title", () => {
    for (const title of [undefined, null, 42, "", "   "]) {
      expect(planRename(note, title, free)).toEqual({
        kind: "skip",
        reason: "no title",
      });
    }
  });

  test("skips a title with nothing usable", () => {
    expect(planRename(note, "???", free)).toEqual({
      kind: "skip",
      reason: "title has no usable characters",
    });
  });

  test("never overwrites another file", () => {
    expect(planRename(note, "Taken", () => true)).toEqual({
      kind: "skip",
      reason: "Drafts/Taken.md already exists",
    });
  });
});
