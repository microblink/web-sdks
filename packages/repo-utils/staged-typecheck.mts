/*
 * See .context/decisions/2026-08-03-repository-local-staged-typecheck.md.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import ts from "typescript";

const repositoryRoot = process.cwd();
const supportedExtensions = new Set([".ts", ".tsx", ".mts", ".cts"]);
const declarationFilePattern = /\.d\.(?:ts|mts|cts)$/;

function isInsideDirectory(filePath: string, directoryPath: string): boolean {
  const relativePath = path.relative(directoryPath, filePath);
  return relativePath !== "" && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath);
}

function findWorkspaceRoot(filePath: string): string | undefined {
  let directoryPath = path.dirname(filePath);

  while (isInsideDirectory(directoryPath, repositoryRoot)) {
    if (existsSync(path.join(directoryPath, "package.json")) && existsSync(path.join(directoryPath, "tsconfig.json"))) {
      return directoryPath;
    }

    directoryPath = path.dirname(directoryPath);
  }

  return undefined;
}

function groupFilesByWorkspace(filePaths: string[]): Map<string, string[]> {
  const filesByWorkspace = new Map<string, string[]>();

  for (const filePath of filePaths) {
    const absolutePath = path.resolve(filePath);

    if (!isInsideDirectory(absolutePath, repositoryRoot)) {
      throw new Error(`Staged file is outside the repository: ${filePath}`);
    }

    if (!supportedExtensions.has(path.extname(absolutePath))) {
      continue;
    }

    const workspaceRoot = findWorkspaceRoot(absolutePath);

    if (workspaceRoot === undefined) {
      console.warn(
        `Skipping staged typecheck for ${path.relative(repositoryRoot, absolutePath)}: no TypeScript workspace found`,
      );
      continue;
    }

    const workspaceFiles = filesByWorkspace.get(workspaceRoot) ?? [];
    workspaceFiles.push(absolutePath);
    filesByWorkspace.set(workspaceRoot, workspaceFiles);
  }

  return filesByWorkspace;
}

function parseWorkspaceConfig(workspaceRoot: string): ts.ParsedCommandLine {
  const configPath = path.join(workspaceRoot, "tsconfig.json");
  const { config, error } = ts.readConfigFile(configPath, ts.sys.readFile);

  if (error) {
    throw new Error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
  }

  const parsedConfig = ts.parseJsonConfigFileContent(config, ts.sys, workspaceRoot, undefined, configPath);

  if (parsedConfig.errors.length > 0) {
    const message = parsedConfig.errors
      .map(({ messageText }) => ts.flattenDiagnosticMessageText(messageText, "\n"))
      .join("\n");
    throw new Error(message);
  }

  return parsedConfig;
}

function isUnderRootDir(filePath: string, rootDir: string | undefined): boolean {
  if (rootDir === undefined) {
    return true;
  }

  return isInsideDirectory(filePath, rootDir);
}

export function selectStagedTypecheckFiles(workspaceRoot: string, filePaths: string[]): string[] {
  return selectTypecheckFiles(parseWorkspaceConfig(workspaceRoot), filePaths);
}

function selectTypecheckFiles(parsedConfig: ts.ParsedCommandLine, filePaths: string[]): string[] {
  return filePaths.filter((filePath) => isUnderRootDir(filePath, parsedConfig.options.rootDir));
}

function typecheckWorkspace(workspaceRoot: string, filePaths: string[]): number {
  const parsedConfig = parseWorkspaceConfig(workspaceRoot);
  const sourceFiles = selectTypecheckFiles(parsedConfig, filePaths);

  if (sourceFiles.length === 0) {
    return 0;
  }

  const temporaryConfigPath = path.join(workspaceRoot, `.tsconfig.staged-${randomUUID()}.json`);
  const files = [
    ...new Set([...sourceFiles, ...parsedConfig.fileNames.filter((filePath) => declarationFilePattern.test(filePath))]),
  ].map((filePath) => path.relative(workspaceRoot, filePath).replaceAll(path.sep, "/"));

  writeFileSync(
    temporaryConfigPath,
    JSON.stringify(
      {
        extends: "./tsconfig.json",
        compilerOptions: {
          emitDeclarationOnly: false,
          noEmit: true,
          skipLibCheck: true,
        },
        files,
        include: [],
      },
      undefined,
      2,
    ),
  );

  try {
    const result = spawnSync("pnpm", ["exec", "tsc", "--project", temporaryConfigPath], {
      cwd: workspaceRoot,
      stdio: "inherit",
    });

    if (result.error) {
      throw result.error;
    }

    return result.status ?? 1;
  } finally {
    rmSync(temporaryConfigPath, {
      force: true,
    });
  }
}

export function typecheckStagedFiles(filePaths: string[]): number {
  const filesByWorkspace = groupFilesByWorkspace(filePaths);

  for (const [workspaceRoot, workspaceFilePaths] of filesByWorkspace) {
    const status = typecheckWorkspace(workspaceRoot, workspaceFilePaths);

    if (status !== 0) {
      return status;
    }
  }

  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const status = typecheckStagedFiles(process.argv.slice(2));

    if (status !== 0) {
      process.exitCode = status;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
