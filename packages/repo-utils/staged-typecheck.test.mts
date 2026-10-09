import nodeFs from "node:fs";
import os from "node:os";
import nodePath from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { selectStagedTypecheckFiles } from "./staged-typecheck.mts";

const workspaceRoots: string[] = [];

function createWorkspace(): string {
  const workspaceRoot = nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "staged-typecheck-"));
  workspaceRoots.push(workspaceRoot);
  return workspaceRoot;
}

afterEach(() => {
  for (const workspaceRoot of workspaceRoots.splice(0)) {
    nodeFs.rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

function writeFile(filePath: string, content: string): void {
  nodeFs.mkdirSync(nodePath.dirname(filePath), { recursive: true });
  nodeFs.writeFileSync(filePath, content);
}

describe("selectStagedTypecheckFiles", () => {
  it("skips staged files outside the workspace rootDir", () => {
    const workspaceRoot = createWorkspace();
    const sourceFile = nodePath.join(workspaceRoot, "src/index.ts");
    const configFile = nodePath.join(workspaceRoot, "vite.config.mts");

    writeFile(
      nodePath.join(workspaceRoot, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          rootDir: "src",
          noEmit: true,
        },
        include: ["src"],
      }),
    );
    writeFile(sourceFile, "export const value = 1;\n");
    writeFile(configFile, "export default {};\n");

    expect(selectStagedTypecheckFiles(workspaceRoot, [sourceFile, configFile])).toEqual([sourceFile]);
  });

  it("includes staged files when the workspace does not set rootDir", () => {
    const workspaceRoot = createWorkspace();
    const configFile = nodePath.join(workspaceRoot, "vite.config.mts");

    writeFile(
      nodePath.join(workspaceRoot, "tsconfig.json"),
      JSON.stringify({
        compilerOptions: {
          noEmit: true,
        },
        include: ["vite.config.mts"],
      }),
    );
    writeFile(configFile, "export default {};\n");

    expect(selectStagedTypecheckFiles(workspaceRoot, [configFile])).toEqual([configFile]);
  });
});
