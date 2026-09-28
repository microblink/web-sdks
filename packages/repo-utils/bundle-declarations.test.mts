import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";

import {
  bundleDeclarations,
  importedPackageName,
  isExternalDeclarationImport,
  parseArguments,
  type DeclarationBundleOptions,
} from "./bundle-declarations.mts";

const temporaryRoots: string[] = [];

async function createPackage(
  entries: Record<string, string>,
  packageName: string | null = "@microblink/example",
): Promise<string> {
  const packageRoot = await mkdtemp(path.join(os.tmpdir(), "bundle-declarations-"));

  temporaryRoots.push(packageRoot);

  await mkdir(path.join(packageRoot, "types"));
  await writeFile(path.join(packageRoot, "package.json"), `${JSON.stringify({ name: packageName ?? undefined })}\n`);

  await Promise.all(
    Object.entries(entries).map(([entry, declaration]) =>
      writeFile(path.join(packageRoot, "types", `${entry}.d.ts`), declaration),
    ),
  );

  return packageRoot;
}

async function addPackageDeclaration(
  packageRoot: string,
  packageName: string,
  subpath: string,
  declaration: string,
): Promise<void> {
  const packageDirectory = path.join(packageRoot, "node_modules", ...packageName.split("/"));

  await mkdir(packageDirectory, { recursive: true });
  await writeFile(
    path.join(packageDirectory, "package.json"),
    `${JSON.stringify({
      name: packageName,
      exports: {
        [`./${subpath}`]: {
          types: `./${subpath}.d.ts`,
        },
      },
    })}\n`,
  );
  await writeFile(path.join(packageDirectory, `${subpath}.d.ts`), declaration);
}

async function generatedDeclaration(packageRoot: string, entry: string): Promise<string> {
  return readFile(path.join(packageRoot, "types", `${entry}.rollup.d.ts`), "utf8");
}

async function expectNoTemporaryDirectory(packageRoot: string): Promise<void> {
  expect(
    (await readdir(path.join(packageRoot, "types"))).filter((name) => name.startsWith(".declaration-rollup-")),
  ).toEqual([]);
}

afterEach(async () => {
  await Promise.all(temporaryRoots.splice(0).map((directory) => rm(directory, { force: true, recursive: true })));
});

describe("parseArguments", () => {
  it("parses repeated entries and bundled packages", () => {
    expect(
      parseArguments([
        "--entry",
        "core",
        "--entry",
        "ui",
        "--compatibility-root",
        "--bundle",
        "@microblink/ux-common",
        "--bundle",
        "type-fest",
      ]),
    ).toEqual({
      bundledPackages: ["@microblink/ux-common", "type-fest"],
      compatibilityRoot: true,
      entries: ["core", "ui"],
    });
  });

  it.each([
    { arguments_: [], error: "At least one --entry" },
    { arguments_: ["--entry"], error: "--entry requires a value" },
    { arguments_: ["--entry", "../index"], error: "Invalid --entry" },
    { arguments_: ["--entry", "index", "--entry", "index"], error: "Duplicate --entry" },
    { arguments_: ["--entry", "index", "--bundle"], error: "--bundle requires a value" },
    { arguments_: ["--entry", "index", "--bundle", "@microblink"], error: "Invalid --bundle" },
    { arguments_: ["--entry", "index", "--bundle", "package/subpath"], error: "Invalid --bundle" },
    { arguments_: ["--entry", "index", "--unknown"], error: "Unsupported option" },
    {
      arguments_: ["--entry", "core", "--compatibility-root"],
      error: "requires --entry core and --entry ui",
    },
    {
      arguments_: ["--entry", "core", "--entry", "ui", "--entry", "index", "--compatibility-root"],
      error: "cannot be combined with --entry index",
    },
    {
      arguments_: ["--entry", "core", "--entry", "ui", "--compatibility-root", "--compatibility-root"],
      error: "Duplicate --compatibility-root",
    },
  ])("rejects invalid arguments: $error", ({ arguments_, error }) => {
    expect(() => parseArguments(arguments_)).toThrow(error);
  });
});

describe("package import matching", () => {
  it.each([
    ["@microblink/ux-common", "@microblink/ux-common"],
    ["@microblink/ux-common/subpath", "@microblink/ux-common"],
    ["type-fest", "type-fest"],
    ["type-fest/source/promisable", "type-fest"],
    ["./local.js", undefined],
    ["/absolute/local.js", undefined],
  ])("extracts the package from %s", (specifier, expected) => {
    expect(importedPackageName(specifier)).toBe(expected);
  });

  it("bundles exact package names and their subpaths", () => {
    const bundledPackages = ["@microblink/ux-common", "type-fest"];

    expect(isExternalDeclarationImport("@microblink/ux-common/subpath", bundledPackages)).toBe(false);
    expect(isExternalDeclarationImport("type-fest/source/promisable", bundledPackages)).toBe(false);
    expect(isExternalDeclarationImport("@microblink/other/subpath", bundledPackages)).toBe(true);
    expect(isExternalDeclarationImport("./local.js", bundledPackages)).toBe(false);
  });
});

describe("bundleDeclarations", () => {
  it("bundles one entry while preserving external packages and including explicit packages", async () => {
    const packageRoot = await createPackage({
      index: `import type { External } from "external-package/subpath";
import type { Internal } from "@microblink/private-types/feature";
export interface PublicType extends External, Internal {}
`,
    });
    await addPackageDeclaration(
      packageRoot,
      "@microblink/private-types",
      "feature",
      "export interface Internal { internal: string; }\n",
    );

    await bundleDeclarations(
      {
        bundledPackages: ["@microblink/private-types"],
        compatibilityRoot: false,
        entries: ["index"],
      },
      packageRoot,
    );

    const declaration = await generatedDeclaration(packageRoot, "index");
    expect(declaration).toContain('from "external-package/subpath"');
    expect(declaration).not.toMatch(/from ["']@microblink\/private-types/);
    expect(declaration).toContain("interface Internal");
    await expectNoTemporaryDirectory(packageRoot);
  });

  it("bundles multiple entrypoints", async () => {
    const packageRoot = await createPackage({
      index: "export interface RootType { root: string; }\n",
      server: "export interface ServerType { server: string; }\n",
    });
    const options: DeclarationBundleOptions = {
      bundledPackages: [],
      compatibilityRoot: false,
      entries: ["index", "server"],
    };

    await bundleDeclarations(options, packageRoot);

    await expect(generatedDeclaration(packageRoot, "index")).resolves.toContain("RootType");
    await expect(generatedDeclaration(packageRoot, "server")).resolves.toContain("ServerType");
  });

  it("rewrites the package core import and writes the compatibility root", async () => {
    const packageRoot = await createPackage({
      core: "export declare class Manager { #private; }\n",
      ui: `import type { Manager } from "@microblink/example/core";
export declare function createUi(manager: Manager): void;
`,
    });

    await bundleDeclarations(
      {
        bundledPackages: [],
        compatibilityRoot: true,
        entries: ["core", "ui"],
      },
      packageRoot,
    );

    expect(await generatedDeclaration(packageRoot, "ui")).toContain('from "./core.rollup.js"');
    expect(await generatedDeclaration(packageRoot, "index")).toBe(
      'export * from "./core.rollup.js";\nexport * from "./ui.rollup.js";\n',
    );
  });

  it("keeps source-private declarations inside module scope", async () => {
    const packageRoot = await createPackage({
      index: `interface PrivateType { value: string; }
export interface PublicType { privateValue: PrivateType; }
`,
    });

    await bundleDeclarations(
      {
        bundledPackages: [],
        compatibilityRoot: false,
        entries: ["index"],
      },
      packageRoot,
    );

    const declaration = await generatedDeclaration(packageRoot, "index");
    const sourceFile = ts.createSourceFile("index.rollup.d.ts", declaration, ts.ScriptTarget.Latest, true);
    const privateDeclaration = sourceFile.statements.find(
      (statement) => ts.isInterfaceDeclaration(statement) && statement.name.text === "PrivateType",
    );

    expect(ts.isExternalModule(sourceFile)).toBe(true);
    expect(privateDeclaration && ts.isInterfaceDeclaration(privateDeclaration)).toBe(true);
    if (!privateDeclaration || !ts.isInterfaceDeclaration(privateDeclaration)) {
      throw new Error("The bundled private declaration is missing.");
    }
    expect(ts.getCombinedModifierFlags(privateDeclaration) & ts.ModifierFlags.Export).toBe(0);
  });

  it("produces deterministic output", async () => {
    const packageRoot = await createPackage({
      index: "export interface PublicType { value: string; }\n",
      server: "export declare const serverValue: string;\n",
    });
    const options: DeclarationBundleOptions = {
      bundledPackages: [],
      compatibilityRoot: false,
      entries: ["index", "server"],
    };

    await bundleDeclarations(options, packageRoot);
    const firstOutput = await Promise.all(options.entries.map((entry) => generatedDeclaration(packageRoot, entry)));
    await bundleDeclarations(options, packageRoot);
    const secondOutput = await Promise.all(options.entries.map((entry) => generatedDeclaration(packageRoot, entry)));

    expect(secondOutput).toEqual(firstOutput);
    await expectNoTemporaryDirectory(packageRoot);
  });

  it("replaces pre-existing outputs", async () => {
    const packageRoot = await createPackage({
      index: "export interface PublicType { value: string; }\n",
    });
    await writeFile(path.join(packageRoot, "types", "index.rollup.d.ts"), "stale output\n");

    await bundleDeclarations(
      {
        bundledPackages: [],
        compatibilityRoot: false,
        entries: ["index"],
      },
      packageRoot,
    );

    const declaration = await generatedDeclaration(packageRoot, "index");
    expect(declaration).toContain("PublicType");
    expect(declaration).not.toContain("stale output");
  });

  it("rejects packages without names and missing declaration entries", async () => {
    const unnamedPackage = await createPackage({ index: "export {};\n" }, null);
    const missingEntryPackage = await createPackage({ index: "export {};\n" });
    const options: DeclarationBundleOptions = {
      bundledPackages: [],
      compatibilityRoot: false,
      entries: ["server"],
    };

    await expect(bundleDeclarations(options, unnamedPackage)).rejects.toThrow("does not define a package name");
    await expect(bundleDeclarations(options, missingEntryPackage)).rejects.toThrow(
      "Declaration entrypoint does not exist",
    );
  });

  it("removes its temporary directory after a build failure", async () => {
    const packageRoot = await createPackage({
      index: `import type { Missing } from "./missing.js";
export interface PublicType extends Missing {}
`,
    });

    await expect(
      bundleDeclarations(
        {
          bundledPackages: [],
          compatibilityRoot: false,
          entries: ["index"],
        },
        packageRoot,
      ),
    ).rejects.toThrow();
    await expectNoTemporaryDirectory(packageRoot);
  });
});
