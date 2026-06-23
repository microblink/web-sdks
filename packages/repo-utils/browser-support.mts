import browserslist from "browserslist";
import { createRequire } from "node:module";
import nodeFs from "node:fs";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const require = createRequire(import.meta.url);
const browserCompatData = require("@mdn/browser-compat-data");

const SUPPORTED_BROWSER_NAMES = [
  "Chrome",
  "ChromeAndroid",
  "Edge",
  "Opera",
  "Firefox",
  "FirefoxAndroid",
  "Safari",
  "iOS",
];

const browserTargetPattern = new RegExp(
  `^(${SUPPORTED_BROWSER_NAMES.join("|")}) >= (\\d+(?:\\.\\d+)*)$`,
);

const browserCompatTargetNames = {
  Chrome: "chrome",
  ChromeAndroid: "chrome_android",
  Edge: "edge",
  Opera: "opera",
  Firefox: "firefox",
  FirefoxAndroid: "firefox_android",
  Safari: "safari",
  iOS: "safari_ios",
};

const workspacePackageGlobs = [
  "packages/*",
  "packages/utils/*",
  "apps/examples/*",
  "apps/tests/*",
  "github",
];

const browserSupportHeadingPattern = /^## Browser Support(?:\s|$)/m;
const runtimeSourceExtensions = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs"];
const internalReadmeFileName = "README.md";
const githubReadmeFileName = "README.github.md";

const browserApiChecks = [
  {
    label: "HTMLVideoElement.requestVideoFrameCallback()",
    compatPath: ["api", "HTMLVideoElement", "requestVideoFrameCallback"],
    matchesNode(node) {
      return isPropertyCallExpression(node, "requestVideoFrameCallback");
    },
  },
  {
    label: "HTMLVideoElement.cancelVideoFrameCallback()",
    compatPath: ["api", "HTMLVideoElement", "cancelVideoFrameCallback"],
    matchesNode(node) {
      return isPropertyCallExpression(node, "cancelVideoFrameCallback");
    },
  },
  {
    label: "structuredClone()",
    compatPath: ["api", "structuredClone"],
    matchesNode(node) {
      return (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "structuredClone" &&
        !hasTypeofFunctionGuard(node, "structuredClone")
      );
    },
  },
  {
    label: "Crypto.randomUUID()",
    compatPath: ["api", "Crypto", "randomUUID"],
    matchesNode(node) {
      return isPropertyCallExpression(node, "randomUUID");
    },
  },
];

function readJson(filePath) {
  return JSON.parse(nodeFs.readFileSync(filePath, "utf8"));
}

function readTextIfExists(filePath) {
  if (!nodeFs.existsSync(filePath)) {
    return undefined;
  }

  return nodeFs.readFileSync(filePath, "utf8");
}

function isDirectory(filePath) {
  return nodeFs.existsSync(filePath) && nodeFs.statSync(filePath).isDirectory();
}

function isSourceFile(filePath) {
  return (
    runtimeSourceExtensions.includes(nodePath.extname(filePath)) &&
    !filePath.endsWith(".d.ts") &&
    !filePath.endsWith(".test.ts") &&
    !filePath.endsWith(".test.tsx") &&
    !filePath.endsWith(".test.mts") &&
    !filePath.endsWith(".test.js")
  );
}

function compareVersions(a, b) {
  const aParts = a.split(".").map((part) => Number(part));
  const bParts = b.split(".").map((part) => Number(part));
  const length = Math.max(aParts.length, bParts.length);

  for (let i = 0; i < length; i += 1) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);

    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
}

function getNestedValue(value, pathParts) {
  return pathParts.reduce((currentValue, pathPart) => {
    return currentValue?.[pathPart];
  }, value);
}

function normalizeCompatVersion(version) {
  if (version === true) {
    return "0";
  }

  if (typeof version !== "string") {
    return undefined;
  }

  const match = version.match(/\d+(?:\.\d+)*/);
  return match?.[0];
}

function getSupportedVersion(compatPath, compatBrowserName) {
  const support =
    getNestedValue(browserCompatData, compatPath)?.__compat?.support?.[
      compatBrowserName
    ];

  const supportEntries = Array.isArray(support) ? support : [support];

  for (const supportEntry of supportEntries) {
    if (!supportEntry || supportEntry.prefix || supportEntry.flags) {
      continue;
    }

    const supportedVersion = normalizeCompatVersion(
      supportEntry.version_added,
    );

    if (supportedVersion) {
      return supportedVersion;
    }
  }

  return undefined;
}

function resolveWorkspacePackageRoots(workspaceRoot) {
  const packageRoots = [];

  for (const workspacePackageGlob of workspacePackageGlobs) {
    if (!workspacePackageGlob.endsWith("/*")) {
      const packageRoot = nodePath.join(workspaceRoot, workspacePackageGlob);

      if (nodeFs.existsSync(nodePath.join(packageRoot, "package.json"))) {
        packageRoots.push(packageRoot);
      }

      continue;
    }

    const directoryRoot = nodePath.join(
      workspaceRoot,
      workspacePackageGlob.slice(0, -2),
    );

    if (!isDirectory(directoryRoot)) {
      continue;
    }

    for (const entry of nodeFs.readdirSync(directoryRoot, {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory()) {
        continue;
      }

      const packageRoot = nodePath.join(directoryRoot, entry.name);

      if (nodeFs.existsSync(nodePath.join(packageRoot, "package.json"))) {
        packageRoots.push(packageRoot);
      }
    }
  }

  return packageRoots.sort();
}

function getWorkspacePackageMap(packageRoots) {
  const workspacePackages = new Map();

  for (const packageRoot of packageRoots) {
    const packageJson = readJson(nodePath.join(packageRoot, "package.json"));

    if (packageJson.name) {
      workspacePackages.set(packageJson.name, {
        packageJson,
        packageRoot,
      });
    }
  }

  return workspacePackages;
}

function formatPackageName(packageJson, packageRoot, workspaceRoot) {
  return (
    packageJson.name ??
    nodePath.relative(workspaceRoot, packageRoot).replaceAll(nodePath.sep, "/")
  );
}

function getViteConfigPaths(packageRoot) {
  return [
    "vite.config.js",
    "vite.config.mjs",
    "vite.config.ts",
    "vite.config.mts",
  ].map((fileName) => nodePath.join(packageRoot, fileName));
}

function getEslintConfigPaths(packageRoot) {
  return [
    ".eslintrc.cjs",
    ".eslintrc.js",
    "eslint.config.cjs",
    "eslint.config.js",
    "eslint.config.mjs",
  ].map((fileName) => nodePath.join(packageRoot, fileName));
}

function packageUsesBrowserslistEsbuildTarget(packageRoot) {
  return getViteConfigPaths(packageRoot).some((configPath) =>
    readTextIfExists(configPath)?.includes("getBrowserslistEsbuildTarget"),
  );
}

function packageUsesCompatPlugin(packageRoot) {
  return getEslintConfigPaths(packageRoot).some((configPath) =>
    readTextIfExists(configPath)?.includes("plugin:compat/recommended"),
  );
}

function getRuntimeEntryPaths(packageRoot) {
  const sourceRoot = nodePath.join(packageRoot, "src");

  if (!isDirectory(sourceRoot)) {
    return [];
  }

  const indexEntry = runtimeSourceExtensions
    .map((extension) => nodePath.join(sourceRoot, `index${extension}`))
    .find((sourcePath) => nodeFs.existsSync(sourcePath));

  if (indexEntry) {
    return [indexEntry];
  }

  return nodeFs
    .readdirSync(sourceRoot)
    .map((fileName) => nodePath.join(sourceRoot, fileName))
    .filter((sourcePath) => nodeFs.statSync(sourcePath).isFile())
    .filter(isSourceFile);
}

function getResolvedSourcePath(importerPath, importPath) {
  if (!importPath.startsWith(".")) {
    return undefined;
  }

  const resolvedImportPath = nodePath.resolve(
    nodePath.dirname(importerPath),
    importPath,
  );

  const sourceCandidates = [
    resolvedImportPath,
    ...runtimeSourceExtensions.map(
      (extension) => `${resolvedImportPath}${extension}`,
    ),
    ...runtimeSourceExtensions.map((extension) =>
      nodePath.join(resolvedImportPath, `index${extension}`),
    ),
  ];

  return sourceCandidates.find(
    (sourcePath) => nodeFs.existsSync(sourcePath) && isSourceFile(sourcePath),
  );
}

function getSourceCandidate(sourcePathWithoutExtension) {
  const sourceCandidates = [
    sourcePathWithoutExtension,
    ...runtimeSourceExtensions.map(
      (extension) => `${sourcePathWithoutExtension}${extension}`,
    ),
    ...runtimeSourceExtensions.map((extension) =>
      nodePath.join(sourcePathWithoutExtension, `index${extension}`),
    ),
  ];

  return sourceCandidates.find(
    (sourcePath) => nodeFs.existsSync(sourcePath) && isSourceFile(sourcePath),
  );
}

function getExportEntryTarget(exportEntry) {
  if (typeof exportEntry === "string") {
    return exportEntry;
  }

  if (!exportEntry || typeof exportEntry !== "object") {
    return undefined;
  }

  return (
    exportEntry.import ??
    exportEntry.default ??
    exportEntry.require ??
    exportEntry.types
  );
}

function getPackageExportTarget(packageJson, subpath) {
  const packageExports = packageJson.exports;

  if (!packageExports) {
    return undefined;
  }

  if (typeof packageExports === "string" || packageExports.import) {
    return subpath ? undefined : getExportEntryTarget(packageExports);
  }

  const exportKey = subpath ? `./${subpath}` : ".";

  return getExportEntryTarget(packageExports[exportKey]);
}

function getSourcePathFromPackageTarget(packageRoot, packageTarget) {
  if (!packageTarget || packageTarget.endsWith(".json")) {
    return undefined;
  }

  const sourceTarget = packageTarget
    .replace(/\.d\.ts$/, "")
    .replace(/\.(c|m)?js$/, "")
    .replace(/^\.\//, "")
    .replace(/^dist\//, "src/")
    .replace(/^types\//, "src/");

  return getSourceCandidate(nodePath.join(packageRoot, sourceTarget));
}

function getWorkspaceImportInfo(importPath, workspacePackages) {
  const workspacePackageEntries = [...workspacePackages.entries()].sort(
    ([a], [b]) => b.length - a.length,
  );

  for (const [packageName, workspacePackage] of workspacePackageEntries) {
    if (importPath === packageName) {
      return { ...workspacePackage, subpath: "" };
    }

    if (importPath.startsWith(`${packageName}/`)) {
      return {
        ...workspacePackage,
        subpath: importPath.slice(packageName.length + 1),
      };
    }
  }

  return undefined;
}

function getWorkspaceImportSourcePath(importPath, workspacePackages) {
  const workspaceImport = getWorkspaceImportInfo(importPath, workspacePackages);

  if (!workspaceImport || workspaceImport.packageJson.browserslist) {
    return undefined;
  }

  const exportTarget = getPackageExportTarget(
    workspaceImport.packageJson,
    workspaceImport.subpath,
  );
  const exportSourcePath = getSourcePathFromPackageTarget(
    workspaceImport.packageRoot,
    exportTarget,
  );

  if (exportSourcePath) {
    return exportSourcePath;
  }

  if (!workspaceImport.subpath) {
    return getRuntimeEntryPaths(workspaceImport.packageRoot);
  }

  return getSourceCandidate(
    nodePath.join(workspaceImport.packageRoot, "src", workspaceImport.subpath),
  );
}

function isTypeOnlyImportDeclaration(statement) {
  if (!ts.isImportDeclaration(statement)) {
    return false;
  }

  const importClause = statement.importClause;

  if (!importClause) {
    return false;
  }

  if (importClause.isTypeOnly) {
    return true;
  }

  if (importClause.name) {
    return false;
  }

  if (!importClause.namedBindings) {
    return false;
  }

  return (
    ts.isNamedImports(importClause.namedBindings) &&
    importClause.namedBindings.elements.every((element) => element.isTypeOnly)
  );
}

function isTypeOnlyExportDeclaration(statement) {
  if (!ts.isExportDeclaration(statement)) {
    return false;
  }

  if (statement.isTypeOnly) {
    return true;
  }

  if (!statement.exportClause) {
    return false;
  }

  return (
    ts.isNamedExports(statement.exportClause) &&
    statement.exportClause.elements.every((element) => element.isTypeOnly)
  );
}

function getImportedSourcePaths(sourcePath, sourceFile, workspacePackages) {
  return sourceFile.statements.flatMap((statement) => {
    if (
      !(
        ts.isImportDeclaration(statement) ||
        ts.isExportDeclaration(statement)
      ) ||
      !statement.moduleSpecifier ||
      !ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      return [];
    }

    if (
      isTypeOnlyImportDeclaration(statement) ||
      isTypeOnlyExportDeclaration(statement)
    ) {
      return [];
    }

    const importPath = statement.moduleSpecifier.text;
    const importedSourcePath = getResolvedSourcePath(sourcePath, importPath);

    if (importedSourcePath) {
      return [importedSourcePath];
    }

    const workspaceImportSourcePath = getWorkspaceImportSourcePath(
      importPath,
      workspacePackages,
    );

    if (!workspaceImportSourcePath) {
      return [];
    }

    return Array.isArray(workspaceImportSourcePath)
      ? workspaceImportSourcePath
      : [workspaceImportSourcePath];
  });
}

function getRuntimeSourceFiles(packageRoot, workspacePackages) {
  const sourceFiles = new Map();
  const pendingSourcePaths = getRuntimeEntryPaths(packageRoot);

  while (pendingSourcePaths.length > 0) {
    const sourcePath = pendingSourcePaths.pop();

    if (!sourcePath || sourceFiles.has(sourcePath)) {
      continue;
    }

    const sourceText = nodeFs.readFileSync(sourcePath, "utf8");
    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
    );

    sourceFiles.set(sourcePath, sourceFile);
    pendingSourcePaths.push(
      ...getImportedSourcePaths(sourcePath, sourceFile, workspacePackages),
    );
  }

  return sourceFiles;
}

function isPropertyCallExpression(node, propertyName) {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === propertyName
  );
}

function isTypeofFunctionCheck(node, identifierName) {
  return (
    ts.isBinaryExpression(node) &&
    node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken &&
    ts.isTypeOfExpression(node.left) &&
    ts.isIdentifier(node.left.expression) &&
    node.left.expression.text === identifierName &&
    ts.isStringLiteral(node.right) &&
    node.right.text === "function"
  );
}

function hasTypeofFunctionGuard(node, identifierName) {
  let currentNode = node.parent;

  while (currentNode) {
    if (
      ts.isIfStatement(currentNode) &&
      isTypeofFunctionCheck(currentNode.expression, identifierName)
    ) {
      return true;
    }

    currentNode = currentNode.parent;
  }

  return false;
}

function findBrowserApiUsages(packageRoot, workspaceRoot, workspacePackages) {
  const usages = [];

  for (const [sourcePath, sourceFile] of getRuntimeSourceFiles(
    packageRoot,
    workspacePackages,
  )) {
    const visit = (node) => {
      for (const browserApiCheck of browserApiChecks) {
        if (browserApiCheck.matchesNode(node)) {
          const { line, character } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart(sourceFile),
          );

          usages.push({
            api: browserApiCheck,
            location: `${nodePath
              .relative(workspaceRoot, sourcePath)
              .replaceAll(nodePath.sep, "/")}:${line + 1}:${character + 1}`,
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  return usages;
}

function shouldNotOwnBrowserBaseline(packageJson) {
  return (
    packageJson.name === "@microblink/repo-utils" ||
    packageJson.name?.endsWith("-common")
  );
}

function getDependencyBrowserSupportErrors(
  packageJson,
  packageMinimums,
  workspacePackages,
) {
  const errors = [];

  for (const dependencyName of Object.keys(packageJson.dependencies ?? {})) {
    const dependencyPackage = workspacePackages.get(dependencyName);

    if (!dependencyPackage?.packageJson.browserslist) {
      continue;
    }

    const { minimums: dependencyMinimums } = parseBrowserslistMinimums(
      dependencyPackage.packageJson.browserslist,
    );

    for (const [browserName, dependencyMinimum] of dependencyMinimums) {
      const packageMinimum = packageMinimums.get(browserName);

      if (
        packageMinimum &&
        compareVersions(packageMinimum, dependencyMinimum) < 0
      ) {
        errors.push(
          `${packageJson.name ?? "Package"} declares ${browserName} >= ${packageMinimum}, but ${dependencyName} declares ${browserName} >= ${dependencyMinimum}.`,
        );
      }
    }
  }

  return errors;
}

export function parseBrowserslistMinimums(browserslistConfig) {
  if (!Array.isArray(browserslistConfig)) {
    return {
      errors: ["browserslist must be an array of explicit browser minimums."],
      minimums: new Map(),
    };
  }

  const errors = [];
  const minimums = new Map();

  for (const target of browserslistConfig) {
    const match = browserTargetPattern.exec(target);

    if (!match) {
      errors.push(
        `browserslist entry "${target}" must be an explicit minimum like "Chrome >= 96".`,
      );
      continue;
    }

    const [, browserName, version] = match;

    if (minimums.has(browserName)) {
      errors.push(`browserslist declares ${browserName} more than once.`);
      continue;
    }

    minimums.set(browserName, version);
  }

  return { errors, minimums };
}

export function formatBrowserSupportBullets(minimums) {
  const bullets = [];

  const chrome = minimums.get("Chrome");
  const chromeAndroid = minimums.get("ChromeAndroid");

  if (chrome && chromeAndroid === chrome) {
    bullets.push(`- Chrome / Chromium ${chrome} (desktop and Android)`);
  } else {
    if (chrome) {
      bullets.push(`- Chrome / Chromium ${chrome} (desktop)`);
    }

    if (chromeAndroid) {
      bullets.push(`- Chrome / Chromium ${chromeAndroid} (Android)`);
    }
  }

  const edge = minimums.get("Edge");

  if (edge) {
    bullets.push(`- Edge ${edge}`);
  }

  const opera = minimums.get("Opera");

  if (opera) {
    bullets.push(`- Opera ${opera}`);
  }

  const firefox = minimums.get("Firefox");
  const firefoxAndroid = minimums.get("FirefoxAndroid");

  if (firefox && firefoxAndroid === firefox) {
    bullets.push(`- Firefox ${firefox} (desktop and Android)`);
  } else {
    if (firefox) {
      bullets.push(`- Firefox ${firefox} (desktop)`);
    }

    if (firefoxAndroid) {
      bullets.push(`- Firefox ${firefoxAndroid} (Android)`);
    }
  }

  const safari = minimums.get("Safari");

  if (safari) {
    bullets.push(`- Safari ${safari} (macOS)`);
  }

  const ios = minimums.get("iOS");

  if (ios) {
    bullets.push(`- iOS Safari ${ios}`);
  }

  return bullets;
}

function getBrowserSupportSection(readme) {
  const headingMatch = browserSupportHeadingPattern.exec(readme);

  if (!headingMatch) {
    return undefined;
  }

  const sectionStart = headingMatch.index;
  const rest = readme.slice(sectionStart + headingMatch[0].length);
  const nextHeadingMatch = /^## /m.exec(rest);

  if (!nextHeadingMatch) {
    return readme.slice(sectionStart);
  }

  return readme.slice(
    sectionStart,
    sectionStart + headingMatch[0].length + nextHeadingMatch.index,
  );
}

function getBrowserSupportBullets(readme) {
  return (
    getBrowserSupportSection(readme)
      ?.split("\n")
      .filter((line) => line.startsWith("- ")) ?? []
  );
}

function getReadmeInfo(packageRoot) {
  const internalReadme = readTextIfExists(
    nodePath.join(packageRoot, internalReadmeFileName),
  );
  const githubReadme = readTextIfExists(
    nodePath.join(packageRoot, githubReadmeFileName),
  );

  return {
    internalReadme,
    publicReadme: githubReadme ?? internalReadme,
    publicReadmeFileName: githubReadme
      ? githubReadmeFileName
      : internalReadmeFileName,
    hasGithubReadme: Boolean(githubReadme),
  };
}

function getPackageBrowserSupportErrors(
  packageRoot,
  workspaceRoot,
  workspacePackages,
) {
  const packageJsonPath = nodePath.join(packageRoot, "package.json");
  const packageJson = readJson(packageJsonPath);
  const packageName = formatPackageName(packageJson, packageRoot, workspaceRoot);
  const {
    internalReadme,
    publicReadme,
    publicReadmeFileName,
    hasGithubReadme,
  } = getReadmeInfo(packageRoot);
  const errors = [];

  if (
    hasGithubReadme &&
    internalReadme &&
    browserSupportHeadingPattern.test(internalReadme)
  ) {
    errors.push(
      `${packageName} README.md must not contain a Browser Support section when README.github.md exists; public browser support docs belong in README.github.md.`,
    );
  }

  if (shouldNotOwnBrowserBaseline(packageJson)) {
    if (packageJson.browserslist) {
      errors.push(
        `${packageName} must not declare browserslist; consuming product packages own browser baselines.`,
      );
    }

    if (publicReadme && browserSupportHeadingPattern.test(publicReadme)) {
      errors.push(
        `${packageName} ${publicReadmeFileName} must not contain a Browser Support section; consuming product packages own browser baselines.`,
      );
    }

    return errors;
  }

  const usesBrowserTargetedTooling =
    packageUsesBrowserslistEsbuildTarget(packageRoot) ||
    packageUsesCompatPlugin(packageRoot);

  if (usesBrowserTargetedTooling && !packageJson.browserslist) {
    errors.push(
      `${packageName} uses browser-targeted tooling but does not declare package-local browserslist.`,
    );
  }

  if (!packageJson.browserslist) {
    return errors;
  }

  if (!usesBrowserTargetedTooling) {
    errors.push(
      `${packageName} declares browserslist but does not use browser-targeted tooling.`,
    );
  }

  const { errors: browserslistErrors, minimums } = parseBrowserslistMinimums(
    packageJson.browserslist,
  );

  errors.push(
    ...browserslistErrors.map((error) => `${packageName}: ${error}`),
  );

  errors.push(
    ...getDependencyBrowserSupportErrors(
      packageJson,
      minimums,
      workspacePackages,
    ),
  );

  for (const usage of findBrowserApiUsages(
    packageRoot,
    workspaceRoot,
    workspacePackages,
  )) {
    const unsupportedTargets = [];

    for (const [browserName, packageMinimum] of minimums) {
      const compatBrowserName = browserCompatTargetNames[browserName];
      const supportedVersion = getSupportedVersion(
        usage.api.compatPath,
        compatBrowserName,
      );

      if (
        supportedVersion &&
        compareVersions(packageMinimum, supportedVersion) < 0
      ) {
        unsupportedTargets.push(
          `${browserName} >= ${packageMinimum} (native support requires ${supportedVersion})`,
        );
      }
    }

    if (unsupportedTargets.length > 0) {
      errors.push(
        `${packageName} uses native ${usage.api.label} in ${usage.location}, but package browserslist includes unsupported targets: ${unsupportedTargets.join(", ")}.`,
      );
    }
  }

  try {
    browserslist(packageJson.browserslist, { path: packageRoot });
  } catch (error) {
    errors.push(
      `${packageName} browserslist does not resolve: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (!publicReadme) {
    errors.push(
      `${packageName} declares browserslist but has no README.md or README.github.md.`,
    );
    return errors;
  }

  const actualBullets = getBrowserSupportBullets(publicReadme);
  const expectedBullets = formatBrowserSupportBullets(minimums);

  if (actualBullets.length === 0) {
    errors.push(
      `${packageName} ${publicReadmeFileName} is missing a Browser Support bullet list.`,
    );
  } else if (actualBullets.join("\n") !== expectedBullets.join("\n")) {
    errors.push(
      [
        `${packageName} ${publicReadmeFileName} Browser Support bullets do not match package browserslist.`,
        "Expected:",
        ...expectedBullets,
        "Actual:",
        ...actualBullets,
      ].join("\n"),
    );
  }

  return errors;
}

export function getBrowserSupportErrors(
  workspaceRoot = nodePath.resolve(
    nodePath.dirname(fileURLToPath(import.meta.url)),
    "../..",
  ),
) {
  const packageRoots = resolveWorkspacePackageRoots(workspaceRoot);
  const workspacePackages = getWorkspacePackageMap(packageRoots);

  return packageRoots.flatMap((packageRoot) =>
    getPackageBrowserSupportErrors(
      packageRoot,
      workspaceRoot,
      workspacePackages,
    ),
  );
}

export function assertBrowserSupport(workspaceRoot) {
  const errors = getBrowserSupportErrors(workspaceRoot);

  if (errors.length > 0) {
    throw new Error(["Browser support check failed:", ...errors].join("\n"));
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    assertBrowserSupport(process.argv[2]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
