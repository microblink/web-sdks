/*
 * See .context/decisions/2026-08-03-repository-local-staged-typecheck.md.
 */
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

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

function getDeclarationFiles(workspaceRoot: string): string[] {
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

  return parsedConfig.fileNames.filter((filePath) => declarationFilePattern.test(filePath));
}

function typecheckWorkspace(workspaceRoot: string, filePaths: string[]): number {
  const temporaryConfigPath = path.join(workspaceRoot, `.tsconfig.staged-${randomUUID()}.json`);
  const files = [...new Set([...filePaths, ...getDeclarationFiles(workspaceRoot)])].map((filePath) =>
    path.relative(workspaceRoot, filePath).replaceAll(path.sep, "/"),
  );

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

try {
  const filesByWorkspace = groupFilesByWorkspace(process.argv.slice(2));

  for (const [workspaceRoot, filePaths] of filesByWorkspace) {
    const status = typecheckWorkspace(workspaceRoot, filePaths);

    if (status !== 0) {
      process.exitCode = status;
      break;
    }
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
