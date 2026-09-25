import { access, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { build } from "rolldown";
import { dts } from "rolldown-plugin-dts";

interface PackageManifest {
  name?: string;
}

export interface DeclarationBundleOptions {
  bundledPackages: string[];
  compatibilityRoot: boolean;
  entries: string[];
}

const temporaryDirectoryPrefix = ".declaration-rollup-";

function optionValue(arguments_: readonly string[], index: number, option: string): string {
  const value = arguments_[index + 1];

  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value.`);
  }

  return value;
}

function isEntryName(value: string): boolean {
  return value !== "." && value !== ".." && !value.includes("/") && !value.includes("\\");
}

function isPackageName(value: string): boolean {
  if (value.startsWith("@")) {
    const [scope, name, ...rest] = value.slice(1).split("/");

    return rest.length === 0 && Boolean(scope) && Boolean(name);
  }

  return !value.includes("/");
}

export function parseArguments(arguments_: readonly string[]): DeclarationBundleOptions {
  const entries: string[] = [];
  const bundledPackages: string[] = [];
  let compatibilityRoot = false;

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];

    if (argument === "--entry") {
      const entry = optionValue(arguments_, index, argument);

      if (!isEntryName(entry)) {
        throw new Error(`Invalid --entry value: ${entry}.`);
      }

      if (entries.includes(entry)) {
        throw new Error(`Duplicate --entry value: ${entry}.`);
      }

      entries.push(entry);
      index += 1;

      continue;
    }

    if (argument === "--bundle") {
      const packageName = optionValue(arguments_, index, argument);

      if (!isPackageName(packageName)) {
        throw new Error(`Invalid --bundle package name: ${packageName}.`);
      }

      if (!bundledPackages.includes(packageName)) {
        bundledPackages.push(packageName);
      }

      index += 1;

      continue;
    }

    if (argument === "--compatibility-root") {
      if (compatibilityRoot) {
        throw new Error("Duplicate --compatibility-root option.");
      }

      compatibilityRoot = true;

      continue;
    }

    throw new Error(`Unsupported option: ${argument ?? "<missing>"}.`);
  }

  if (entries.length === 0) {
    throw new Error("At least one --entry value is required.");
  }

  if (compatibilityRoot) {
    if (!entries.includes("core") || !entries.includes("ui")) {
      throw new Error("--compatibility-root requires --entry core and --entry ui.");
    }

    if (entries.includes("index")) {
      throw new Error("--compatibility-root cannot be combined with --entry index.");
    }
  }

  return { bundledPackages, compatibilityRoot, entries };
}

export function importedPackageName(id: string): string | undefined {
  if (id.startsWith(".") || path.isAbsolute(id)) {
    return undefined;
  }

  const segments = id.split("/");
  return id.startsWith("@") ? segments.slice(0, 2).join("/") : segments[0];
}

export function isExternalDeclarationImport(id: string, bundledPackages: readonly string[]): boolean {
  const packageName = importedPackageName(id);
  return packageName !== undefined && !bundledPackages.includes(packageName);
}

async function bundleEntrypoint(
  packageRoot: string,
  packageName: string,
  typesDirectory: string,
  temporaryDirectory: string,
  entry: string,
  bundledPackages: readonly string[],
): Promise<void> {
  await build({
    cwd: packageRoot,
    input: {
      [entry]: path.join(typesDirectory, `${entry}.d.ts`),
    },
    external: (id) => isExternalDeclarationImport(id, bundledPackages),
    plugins: dts({
      cwd: packageRoot,
      dtsInput: true,
      emitDtsOnly: true,
      resolver: "tsc",
      sourcemap: false,
      tsconfig: false,
    }),
    output: {
      dir: temporaryDirectory,
      entryFileNames: "[name].js",
      format: "es",
      paths: entry === "ui" ? { [`${packageName}/core`]: "./core.rollup.js" } : undefined,
    },
  });

  const temporaryOutputPath = path.join(temporaryDirectory, `${entry}.d.ts`);
  const declaration = (await readFile(temporaryOutputPath, "utf8")).trimEnd();

  await writeFile(temporaryOutputPath, `${declaration}\n\nexport {};\n`);
}

async function readPackageName(packageRoot: string): Promise<string> {
  const manifestPath = path.join(packageRoot, "package.json");
  const packageManifest = JSON.parse(await readFile(manifestPath, "utf8")) as PackageManifest;

  if (!packageManifest.name) {
    throw new Error(`${manifestPath} does not define a package name.`);
  }

  return packageManifest.name;
}

async function validateEntries(typesDirectory: string, entries: readonly string[]): Promise<void> {
  for (const entry of entries) {
    const inputPath = path.join(typesDirectory, `${entry}.d.ts`);

    try {
      await access(inputPath);
    } catch {
      throw new Error(`Declaration entrypoint does not exist: ${inputPath}.`);
    }
  }
}

async function replaceOutput(source: string, destination: string): Promise<void> {
  await rm(destination, { force: true });
  await rename(source, destination);
}

export async function bundleDeclarations(
  options: DeclarationBundleOptions,
  packageRoot = process.cwd(),
): Promise<void> {
  const packageName = await readPackageName(packageRoot);
  const typesDirectory = path.join(packageRoot, "types");

  await validateEntries(typesDirectory, options.entries);

  const temporaryDirectory = await mkdtemp(path.join(typesDirectory, temporaryDirectoryPrefix));

  try {
    for (const entry of options.entries) {
      await bundleEntrypoint(
        packageRoot,
        packageName,
        typesDirectory,
        temporaryDirectory,
        entry,
        options.bundledPackages,
      );
    }

    if (options.compatibilityRoot) {
      await writeFile(
        path.join(temporaryDirectory, "index.d.ts"),
        'export * from "./core.rollup.js";\nexport * from "./ui.rollup.js";\n',
      );
    }

    for (const entry of options.entries) {
      await replaceOutput(
        path.join(temporaryDirectory, `${entry}.d.ts`),
        path.join(typesDirectory, `${entry}.rollup.d.ts`),
      );
    }

    if (options.compatibilityRoot) {
      await replaceOutput(path.join(temporaryDirectory, "index.d.ts"), path.join(typesDirectory, "index.rollup.d.ts"));
    }
  } finally {
    await rm(temporaryDirectory, { force: true, recursive: true });
  }
}
