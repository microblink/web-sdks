import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

/** Published compatibility root that re-exports `/core` and `/ui` declaration rollups. */
const COMPATIBILITY_DECLARATION_ROLLUP = `export * from "./core.rollup.js";
export * from "./ui.rollup.js";
`;

function parseDeclarationFile(fileName: string, text: string): ts.SourceFile {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
}

function isExported(node: ts.Node): boolean {
  return Boolean(
    ts.canHaveModifiers(node) &&
    ts.getModifiers(node)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword),
  );
}

function namedClasses(sourceFile: ts.SourceFile): Map<string, ts.ClassDeclaration> {
  const classes = new Map<string, ts.ClassDeclaration>();

  for (const statement of sourceFile.statements) {
    if (!ts.isClassDeclaration(statement) || !statement.name) {
      continue;
    }
    if (classes.has(statement.name.text)) {
      throw new Error(`${sourceFile.fileName} declares class ${statement.name.text} more than once.`);
    }
    classes.set(statement.name.text, statement);
  }

  return classes;
}

function comparableClassText(sourceFile: ts.SourceFile, declaration: ts.ClassDeclaration): string {
  return declaration.getText(sourceFile).replace(/^export\s+/, "");
}

function classRange(sourceFile: ts.SourceFile, declaration: ts.ClassDeclaration): [start: number, end: number] {
  const jsDoc = ts.getJSDocCommentsAndTags(declaration).find(ts.isJSDoc);
  const start = jsDoc?.getStart(sourceFile) ?? declaration.getStart(sourceFile);
  let end = declaration.getEnd();
  const source = sourceFile.text;

  if (source[end] === ";") {
    end += 1;
  }
  while (source[end] === "\n" || source[end] === "\r") {
    end += 1;
  }
  return [start, end];
}

function sharedCoreClasses(coreSourceFile: ts.SourceFile, uiSourceFile: ts.SourceFile): ts.ClassDeclaration[] {
  const coreClasses = namedClasses(coreSourceFile);
  const sharedClasses: ts.ClassDeclaration[] = [];

  for (const [className, uiClass] of namedClasses(uiSourceFile)) {
    const coreClass = coreClasses.get(className);
    if (!coreClass) {
      continue;
    }
    if (!isExported(coreClass) || isExported(uiClass)) {
      throw new Error(
        `${className} must be exported only by core.rollup.d.ts before it can be shared with ui.rollup.d.ts.`,
      );
    }
    if (comparableClassText(coreSourceFile, coreClass) !== comparableClassText(uiSourceFile, uiClass)) {
      throw new Error(`${className} has different declarations in core.rollup.d.ts and ui.rollup.d.ts.`);
    }
    sharedClasses.push(uiClass);
  }

  if (sharedClasses.length === 0) {
    throw new Error("ui.rollup.d.ts does not contain any core class declarations to share.");
  }
  return sharedClasses;
}

function insertCoreClassImport(declaration: string, classNames: readonly string[]): string {
  const sourceFile = parseDeclarationFile("ui.rollup.d.ts", declaration);
  const lastImport = sourceFile.statements.filter(ts.isImportDeclaration).at(-1);
  if (!lastImport) {
    throw new Error("ui.rollup.d.ts must contain an import before core classes can be shared.");
  }

  const insertAt = lastImport.getEnd();
  const prefix = declaration.slice(0, insertAt).replace(/[\r\n]*$/, "\n");
  const importLine = `import { ${classNames.join(", ")} } from "./core.rollup.js";\n`;
  return `${prefix}${importLine}\n${declaration.slice(insertAt).replace(/^[\r\n]*/, "")}`;
}

function removeClassDeclarations(sourceFile: ts.SourceFile, classes: readonly ts.ClassDeclaration[]): string {
  return classes
    .map((declaration) => classRange(sourceFile, declaration))
    .sort(([left], [right]) => right - left)
    .reduce((text, [start, end]) => `${text.slice(0, start)}${text.slice(end)}`, sourceFile.text);
}

/**
 * Replaces API Extractor's inlined copies of `/core` classes in `ui.rollup.d.ts` with imports from `core.rollup.d.ts`.
 *
 * Extractor rollups are independent, so `/ui` would otherwise declare its own `CameraManager`. Classes with private
 * fields are nominally typed, and that copy is not assignable to the `/core` class.
 */
async function shareCoreClassesInUiDeclarationRollup(typesDirectory: string): Promise<void> {
  const coreRollupPath = path.join(typesDirectory, "core.rollup.d.ts");
  const uiRollupPath = path.join(typesDirectory, "ui.rollup.d.ts");
  const [coreDeclaration, uiDeclaration] = await Promise.all([
    readFile(coreRollupPath, "utf8").then((declaration) => declaration.replaceAll("\r\n", "\n")),
    readFile(uiRollupPath, "utf8").then((declaration) => declaration.replaceAll("\r\n", "\n")),
  ]);

  const coreSourceFile = parseDeclarationFile("core.rollup.d.ts", coreDeclaration);
  const uiSourceFile = parseDeclarationFile("ui.rollup.d.ts", uiDeclaration);
  const classes = sharedCoreClasses(coreSourceFile, uiSourceFile);
  const sharedClassNames = classes.map((declaration) => declaration.name!.text);
  const nextUiDeclaration = removeClassDeclarations(uiSourceFile, classes);

  await writeFile(uiRollupPath, insertCoreClassImport(nextUiDeclaration, sharedClassNames));
}

/**
 * Writes `index.rollup.d.ts` as a re-export of the `/core` and `/ui` rollups.
 *
 * API Extractor can only roll up one entrypoint per run, so a compatibility-root rollup would duplicate core classes.
 */
async function writeCompatibilityDeclarationRollup(typesDirectory: string): Promise<string> {
  const coreRollupPath = path.join(typesDirectory, "core.rollup.d.ts");
  const uiRollupPath = path.join(typesDirectory, "ui.rollup.d.ts");
  const indexRollupPath = path.join(typesDirectory, "index.rollup.d.ts");

  try {
    await Promise.all([access(coreRollupPath), access(uiRollupPath)]);
  } catch {
    throw new Error(
      `Cannot write ${indexRollupPath} because core.rollup.d.ts or ui.rollup.d.ts is missing in ${typesDirectory}.`,
    );
  }

  await writeFile(indexRollupPath, COMPATIBILITY_DECLARATION_ROLLUP);
  return indexRollupPath;
}

/**
 * After API Extractor writes `core.rollup.d.ts` and `ui.rollup.d.ts`, share `/core` class identities into `/ui` and
 * write the compatibility root as a re-export of both rollups.
 */
export async function finalizeSplitDeclarationRollups(typesDirectory = path.resolve("types")): Promise<string> {
  await shareCoreClassesInUiDeclarationRollup(typesDirectory);
  return writeCompatibilityDeclarationRollup(typesDirectory);
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  return entry != null && import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (isExecutedDirectly()) {
  await finalizeSplitDeclarationRollups();
}
