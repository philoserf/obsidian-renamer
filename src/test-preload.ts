import { mock } from "bun:test";

mock.module("obsidian", () => ({
  Notice: class Notice {},
  Plugin: class Plugin {},
  TFolder: class TFolder {},
}));
