import nodeFs from "node:fs";
import { createRequire } from "node:module";
import nodePath from "node:path";
import { fileURLToPath } from "node:url";

import browserslist from "browserslist";
import { parseSync, Visitor } from "oxc-parser";

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

const browserTargetPattern = new RegExp(`^(${SUPPORTED_BROWSER_NAMES.join("|")}) >= (\\d+(?:\\.\\d+)*)$`);

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

const workspacePackageGlobs = ["packages/*", "packages/utils/*", "apps/examples/*", "apps/tests/*", "github"];

const browserSupportHeadingPattern = /^## Browser Support(?:\s|$)/m;
const runtimeSourceExtensions = [".ts", ".tsx", ".mts", ".js", ".jsx", ".mjs"];
const internalReadmeFileName = "README.md";
const githubReadmeFileName = "README.github.md";
const splitBrowserEnvironments = ["production", "core", "ui"] as const;
const splitBrowserEnvironmentLabels = {
  production: "Root",
  core: "`/core`",
  ui: "`/ui`",
} as const;
const browserSupportTableRows = [
  ["Chrome / Chromium (desktop)", "Chrome"],
  ["Chrome / Chromium (Android)", "ChromeAndroid"],
  ["Edge", "Edge"],
  ["Opera", "Opera"],
  ["Firefox (desktop)", "Firefox"],
  ["Firefox (Android)", "FirefoxAndroid"],
  ["Safari (macOS)", "Safari"],
  ["iOS Safari", "iOS"],
] as const;

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
    matchesNode(node, guardedFunctionNames) {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name === "structuredClone" &&
        !guardedFunctionNames.has("structuredClone")
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
  const support = getNestedValue(browserCompatData, compatPath)?.__compat?.support?.[compatBrowserName];

  const supportEntries = Array.isArray(support) ? support : [support];

  for (const supportEntry of supportEntries) {
    if (!supportEntry || supportEntry.prefix || supportEntry.flags) {
      continue;
    }

    const supportedVersion = normalizeCompatVersion(supportEntry.version_added);

    if (supportedVersion) {
      return supportedVersion;
    }
  }

  return undefined;
}

function resolveWorkspacePackageRoots(workspaceRoot) {
  const packageRoots: string[] = [];

  for (const workspacePackageGlob of workspacePackageGlobs) {
    if (!workspacePackageGlob.endsWith("/*")) {
      const packageRoot = nodePath.join(workspaceRoot, workspacePackageGlob);

      if (nodeFs.existsSync(nodePath.join(packageRoot, "package.json"))) {
        packageRoots.push(packageRoot);
      }

      continue;
    }

    const directoryRoot = nodePath.join(workspaceRoot, workspacePackageGlob.slice(0, -2));

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
  return packageJson.name ?? nodePath.relative(workspaceRoot, packageRoot).replaceAll(nodePath.sep, "/");
}

function getViteConfigPaths(packageRoot) {
  return ["vite.config.js", "vite.config.mjs", "vite.config.ts", "vite.config.mts"].map((fileName) =>
    nodePath.join(packageRoot, fileName),
  );
}

function getOxlintConfigPaths(packageRoot) {
  return ["oxlint.config.ts", "oxlint.config.mts", ".oxlintrc.json", ".oxlintrc.jsonc"].map((fileName) =>
    nodePath.join(packageRoot, fileName),
  );
}

function packageUsesBrowserslistEsbuildTarget(packageRoot) {
  return getViteConfigPaths(packageRoot).some((configPath) =>
    readTextIfExists(configPath)?.includes("getBrowserslistEsbuildTarget"),
  );
}

function packageUsesCompatPlugin(packageRoot, workspaceRoot) {
  const packageConfigUsesCompat = getOxlintConfigPaths(packageRoot).some((configPath) =>
    readTextIfExists(configPath)?.includes("eslint-plugin-compat"),
  );

  if (packageConfigUsesCompat) {
    return true;
  }

  const rootConfig = readTextIfExists(nodePath.join(workspaceRoot, "oxlint.config.ts"));
  const relativePackageRoot = nodePath.relative(workspaceRoot, packageRoot).split(nodePath.sep).join("/");
  const compatFilesDeclaration = rootConfig?.match(/const compatFiles = \[([\s\S]*?)\];/)?.[1];

  return (
    rootConfig?.includes("eslint-plugin-compat") && compatFilesDeclaration?.includes(`"${relativePackageRoot}/src/`)
  );
}

function getRuntimeEntryPaths(packageRoot, environment?: (typeof splitBrowserEnvironments)[number]) {
  const sourceRoot = nodePath.join(packageRoot, "src");

  if (!isDirectory(sourceRoot)) {
    return [];
  }

  const entryName = environment && environment !== "production" ? environment : "index";
  const indexEntry = runtimeSourceExtensions
    .map((extension) => nodePath.join(sourceRoot, `${entryName}${extension}`))
    .find((sourcePath) => nodeFs.existsSync(sourcePath));

  if (indexEntry) {
    return [indexEntry];
  }

  if (environment) {
    return [];
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

  const resolvedImportPath = nodePath.resolve(nodePath.dirname(importerPath), importPath);

  const sourceCandidates = [
    resolvedImportPath,
    ...runtimeSourceExtensions.map((extension) => `${resolvedImportPath}${extension}`),
    ...runtimeSourceExtensions.map((extension) => nodePath.join(resolvedImportPath, `index${extension}`)),
  ];

  return sourceCandidates.find((sourcePath) => nodeFs.existsSync(sourcePath) && isSourceFile(sourcePath));
}

function getSourceCandidate(sourcePathWithoutExtension) {
  const sourceCandidates = [
    sourcePathWithoutExtension,
    ...runtimeSourceExtensions.map((extension) => `${sourcePathWithoutExtension}${extension}`),
    ...runtimeSourceExtensions.map((extension) => nodePath.join(sourcePathWithoutExtension, `index${extension}`)),
  ];

  return sourceCandidates.find((sourcePath) => nodeFs.existsSync(sourcePath) && isSourceFile(sourcePath));
}

function getExportEntryTarget(exportEntry) {
  if (typeof exportEntry === "string") {
    return exportEntry;
  }

  if (!exportEntry || typeof exportEntry !== "object") {
    return undefined;
  }

  return exportEntry.import ?? exportEntry.default ?? exportEntry.require ?? exportEntry.types;
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
  const workspacePackageEntries = [...workspacePackages.entries()].sort(([a], [b]) => b.length - a.length);

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

  const exportTarget = getPackageExportTarget(workspaceImport.packageJson, workspaceImport.subpath);
  const exportSourcePath = getSourcePathFromPackageTarget(workspaceImport.packageRoot, exportTarget);

  if (exportSourcePath) {
    return exportSourcePath;
  }

  if (!workspaceImport.subpath) {
    return getRuntimeEntryPaths(workspaceImport.packageRoot);
  }

  return getSourceCandidate(nodePath.join(workspaceImport.packageRoot, "src", workspaceImport.subpath));
}

function getRuntimeImportPaths(parsedModule) {
  const importedPaths = parsedModule.staticImports.flatMap(({ entries, moduleRequest }) =>
    entries.length === 0 || entries.some((entry) => !entry.isType) ? [moduleRequest.value] : [],
  );
  const exportedPaths = parsedModule.staticExports.flatMap(({ entries }) =>
    entries.flatMap((entry) => (entry.moduleRequest && !entry.isType ? [entry.moduleRequest.value] : [])),
  );

  return [...new Set([...importedPaths, ...exportedPaths])];
}

function getImportedSourcePaths(sourcePath, parsedModule, workspacePackages) {
  return getRuntimeImportPaths(parsedModule).flatMap((importPath) => {
    const importedSourcePath = getResolvedSourcePath(sourcePath, importPath);

    if (importedSourcePath) {
      return [importedSourcePath];
    }

    const workspaceImportSourcePath = getWorkspaceImportSourcePath(importPath, workspacePackages);

    if (!workspaceImportSourcePath) {
      return [];
    }

    return Array.isArray(workspaceImportSourcePath) ? workspaceImportSourcePath : [workspaceImportSourcePath];
  });
}

function getRuntimeSourceFiles(packageRoot, workspacePackages, entryPaths = getRuntimeEntryPaths(packageRoot)) {
  const sourceFiles = new Map();
  const pendingSourcePaths = [...entryPaths];

  while (pendingSourcePaths.length > 0) {
    const sourcePath = pendingSourcePaths.pop();

    if (!sourcePath || sourceFiles.has(sourcePath)) {
      continue;
    }

    const sourceText = nodeFs.readFileSync(sourcePath, "utf8");
    const parsedSource = parseSync(sourcePath, sourceText);

    if (parsedSource.errors.length > 0) {
      throw new Error(
        `Failed to parse ${sourcePath}:\n${parsedSource.errors.map((error) => error.message).join("\n")}`,
      );
    }

    sourceFiles.set(sourcePath, {
      module: parsedSource.module,
      program: parsedSource.program,
      sourceText,
    });
    pendingSourcePaths.push(...getImportedSourcePaths(sourcePath, parsedSource.module, workspacePackages));
  }

  return sourceFiles;
}

function isPropertyCallExpression(node, propertyName) {
  return (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    !node.callee.computed &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === propertyName
  );
}

function getTypeofFunctionCheckIdentifier(node) {
  if (
    node.type !== "BinaryExpression" ||
    node.operator !== "===" ||
    node.left.type !== "UnaryExpression" ||
    node.left.operator !== "typeof" ||
    node.left.argument.type !== "Identifier" ||
    node.right.type !== "Literal" ||
    node.right.value !== "function"
  ) {
    return undefined;
  }

  return node.left.argument.name;
}

function updateGuardCount(guardCounts, identifierName, change) {
  if (!identifierName) {
    return;
  }

  const nextCount = (guardCounts.get(identifierName) ?? 0) + change;

  if (nextCount === 0) {
    guardCounts.delete(identifierName);
  } else {
    guardCounts.set(identifierName, nextCount);
  }
}

function getLineAndCharacterOfPosition(sourceText, position) {
  const lines = sourceText.slice(0, position).split("\n");

  return {
    line: lines.length - 1,
    character: (lines.at(-1) ?? "").length,
  };
}

function findBrowserApiUsages(runtimeSourceFiles, workspaceRoot) {
  const usages: Array<{ api: (typeof browserApiChecks)[number]; location: string }> = [];

  for (const [sourcePath, parsedSource] of runtimeSourceFiles) {
    const guardCounts = new Map();
    const visitor = new Visitor({
      IfStatement(node) {
        updateGuardCount(guardCounts, getTypeofFunctionCheckIdentifier(node.test), 1);
      },
      "IfStatement:exit"(node) {
        updateGuardCount(guardCounts, getTypeofFunctionCheckIdentifier(node.test), -1);
      },
      CallExpression(node) {
        for (const browserApiCheck of browserApiChecks) {
          if (!browserApiCheck.matchesNode(node, guardCounts)) {
            continue;
          }

          const { line, character } = getLineAndCharacterOfPosition(parsedSource.sourceText, node.start);

          usages.push({
            api: browserApiCheck,
            location: `${nodePath
              .relative(workspaceRoot, sourcePath)
              .replaceAll(nodePath.sep, "/")}:${line + 1}:${character + 1}`,
          });
        }
      },
    });

    visitor.visit(parsedSource.program);
  }

  return usages;
}

function shouldNotOwnBrowserBaseline(packageJson) {
  return packageJson.name === "@microblink/repo-utils" || packageJson.name?.endsWith("-common");
}

function getBrowserslistTargets(packageJson, subpath = "") {
  if (Array.isArray(packageJson.browserslist)) {
    return packageJson.browserslist;
  }

  const environment = subpath === "core" || subpath === "ui" ? subpath : "production";
  return packageJson.browserslist?.[environment];
}

function getDirectDependencyBrowserSupportErrors(packageJson, packageMinimums, workspacePackages) {
  const errors: string[] = [];

  for (const dependencyName of Object.keys(packageJson.dependencies ?? {})) {
    const dependencyPackage = workspacePackages.get(dependencyName);

    if (!dependencyPackage?.packageJson.browserslist) {
      continue;
    }

    const { minimums: dependencyMinimums } = parseBrowserslistMinimums(
      getBrowserslistTargets(dependencyPackage.packageJson),
    );

    for (const [browserName, dependencyMinimum] of dependencyMinimums) {
      const packageMinimum = packageMinimums.get(browserName);

      if (packageMinimum && compareVersions(packageMinimum, dependencyMinimum) < 0) {
        errors.push(
          `${packageJson.name ?? "Package"} declares ${browserName} >= ${packageMinimum}, but ${dependencyName} declares ${browserName} >= ${dependencyMinimum}.`,
        );
      }
    }
  }

  return errors;
}

function getEntrypointDependencyBrowserSupportErrors(
  packageName,
  environment,
  packageMinimums,
  runtimeSourceFiles,
  workspacePackages,
) {
  const errors: string[] = [];
  const dependencyImports = new Map();

  for (const parsedSource of runtimeSourceFiles.values()) {
    for (const importPath of getRuntimeImportPaths(parsedSource.module)) {
      const workspaceImport = getWorkspaceImportInfo(importPath, workspacePackages);

      if (workspaceImport?.packageJson.browserslist) {
        dependencyImports.set(importPath, workspaceImport);
      }
    }
  }

  for (const [importPath, dependencyImport] of dependencyImports) {
    const { minimums: dependencyMinimums } = parseBrowserslistMinimums(
      getBrowserslistTargets(dependencyImport.packageJson, dependencyImport.subpath),
    );

    for (const [browserName, dependencyMinimum] of dependencyMinimums) {
      const packageMinimum = packageMinimums.get(browserName);

      if (packageMinimum && compareVersions(packageMinimum, dependencyMinimum) < 0) {
        errors.push(
          `${packageName} ${splitBrowserEnvironmentLabels[environment]} declares ${browserName} >= ${packageMinimum}, but ${importPath} declares ${browserName} >= ${dependencyMinimum}.`,
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

  const errors: string[] = [];
  const minimums = new Map<string, string>();

  for (const target of browserslistConfig) {
    const match = browserTargetPattern.exec(target);

    if (!match) {
      errors.push(`browserslist entry "${target}" must be an explicit minimum like "Chrome >= 96".`);
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

function getBrowserslistEnvironments(browserslistConfig) {
  if (Array.isArray(browserslistConfig)) {
    return {
      errors: [],
      environments: new Map([["production", browserslistConfig]]),
      isSplit: false,
    };
  }

  if (!browserslistConfig || typeof browserslistConfig !== "object") {
    return {
      errors: ["browserslist must be an array or a named environment object."],
      environments: new Map(),
      isSplit: false,
    };
  }

  const environmentNames = Object.keys(browserslistConfig);
  const errors: string[] = [];

  for (const environment of splitBrowserEnvironments) {
    if (!environmentNames.includes(environment)) {
      errors.push(`browserslist is missing the ${environment} environment.`);
    }
  }

  for (const environment of environmentNames) {
    if (!splitBrowserEnvironments.some((supportedEnvironment) => supportedEnvironment === environment)) {
      errors.push(`browserslist environment "${environment}" is not supported; use production, core, and ui.`);
    }
  }

  return {
    errors,
    environments: new Map(
      splitBrowserEnvironments.flatMap((environment) =>
        environment in browserslistConfig ? [[environment, browserslistConfig[environment]]] : [],
      ),
    ),
    isSplit: true,
  };
}

function getRootBaselineErrors(packageName, environmentMinimums) {
  const errors: string[] = [];
  const rootMinimums = environmentMinimums.get("production");

  if (!rootMinimums) {
    return errors;
  }

  for (const environment of ["core", "ui"] as const) {
    const entryMinimums = environmentMinimums.get(environment);

    if (!entryMinimums) {
      continue;
    }

    for (const [browserName, entryMinimum] of entryMinimums) {
      const rootMinimum = rootMinimums.get(browserName);

      if (rootMinimum && compareVersions(rootMinimum, entryMinimum) < 0) {
        errors.push(
          `${packageName} Root declares ${browserName} >= ${rootMinimum}, but ${splitBrowserEnvironmentLabels[environment]} declares ${browserName} >= ${entryMinimum}.`,
        );
      }
    }
  }

  return errors;
}

export function formatBrowserSupportBullets(minimums) {
  const bullets: string[] = [];

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

function formatBrowserSupportTable(environmentMinimums) {
  const lines = ["| Browser | Root | `/core` | `/ui` |", "| --- | --- | --- | --- |"];

  for (const [label, browserName] of browserSupportTableRows) {
    const versions = splitBrowserEnvironments.map(
      (environment) => environmentMinimums.get(environment)?.get(browserName) ?? "—",
    );

    if (versions.some((version) => version !== "—")) {
      lines.push(`| ${label} | ${versions.join(" | ")} |`);
    }
  }

  return lines;
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

  return readme.slice(sectionStart, sectionStart + headingMatch[0].length + nextHeadingMatch.index);
}

function getBrowserSupportBullets(readme) {
  return (
    getBrowserSupportSection(readme)
      ?.split("\n")
      .filter((line) => line.startsWith("- ")) ?? []
  );
}

function normalizeBrowserSupportTable(lines) {
  return lines.map((line) =>
    line
      .split("|")
      .slice(1, -1)
      .map((cell) => {
        const value = cell.trim();
        return /^-+$/.test(value) ? "---" : value;
      })
      .join(" | "),
  );
}

function getBrowserSupportTable(readme) {
  const tableLines =
    getBrowserSupportSection(readme)
      ?.split("\n")
      .filter((line) => line.trimStart().startsWith("|")) ?? [];

  return normalizeBrowserSupportTable(tableLines);
}

function getReadmeInfo(packageRoot) {
  const internalReadme = readTextIfExists(nodePath.join(packageRoot, internalReadmeFileName));
  const githubReadme = readTextIfExists(nodePath.join(packageRoot, githubReadmeFileName));

  return {
    internalReadme,
    publicReadme: githubReadme ?? internalReadme,
    publicReadmeFileName: githubReadme ? githubReadmeFileName : internalReadmeFileName,
    hasGithubReadme: Boolean(githubReadme),
  };
}

function getPackageBrowserSupportErrors(packageRoot, workspaceRoot, workspacePackages) {
  const packageJsonPath = nodePath.join(packageRoot, "package.json");
  const packageJson = readJson(packageJsonPath);
  const packageName = formatPackageName(packageJson, packageRoot, workspaceRoot);
  const { internalReadme, publicReadme, publicReadmeFileName, hasGithubReadme } = getReadmeInfo(packageRoot);
  const errors: string[] = [];

  if (hasGithubReadme && internalReadme && browserSupportHeadingPattern.test(internalReadme)) {
    errors.push(
      `${packageName} README.md must not contain a Browser Support section when README.github.md exists; public browser support docs belong in README.github.md.`,
    );
  }

  if (shouldNotOwnBrowserBaseline(packageJson)) {
    if (packageJson.browserslist) {
      errors.push(`${packageName} must not declare browserslist; consuming product packages own browser baselines.`);
    }

    if (publicReadme && browserSupportHeadingPattern.test(publicReadme)) {
      errors.push(
        `${packageName} ${publicReadmeFileName} must not contain a Browser Support section; consuming product packages own browser baselines.`,
      );
    }

    return errors;
  }

  const usesBrowserTargetedTooling =
    packageUsesBrowserslistEsbuildTarget(packageRoot) || packageUsesCompatPlugin(packageRoot, workspaceRoot);

  if (usesBrowserTargetedTooling && !packageJson.browserslist) {
    errors.push(`${packageName} uses browser-targeted tooling but does not declare package-local browserslist.`);
  }

  if (!packageJson.browserslist) {
    return errors;
  }

  if (!usesBrowserTargetedTooling) {
    errors.push(`${packageName} declares browserslist but does not use browser-targeted tooling.`);
  }

  const browserslistEnvironments = getBrowserslistEnvironments(packageJson.browserslist);
  const environmentMinimums = new Map();

  errors.push(...browserslistEnvironments.errors.map((error) => `${packageName}: ${error}`));

  for (const [environment, targets] of browserslistEnvironments.environments) {
    const contractName = browserslistEnvironments.isSplit
      ? `${packageName} ${splitBrowserEnvironmentLabels[environment]}`
      : packageName;
    const { errors: browserslistErrors, minimums } = parseBrowserslistMinimums(targets);
    const entryPaths = getRuntimeEntryPaths(packageRoot, browserslistEnvironments.isSplit ? environment : undefined);
    const runtimeSourceFiles = getRuntimeSourceFiles(packageRoot, workspacePackages, entryPaths);

    environmentMinimums.set(environment, minimums);
    errors.push(...browserslistErrors.map((error) => `${contractName}: ${error}`));

    if (browserslistEnvironments.isSplit && entryPaths.length === 0) {
      errors.push(`${contractName} has no matching source entrypoint.`);
    }

    if (browserslistEnvironments.isSplit) {
      errors.push(
        ...getEntrypointDependencyBrowserSupportErrors(
          packageName,
          environment,
          minimums,
          runtimeSourceFiles,
          workspacePackages,
        ),
      );
    } else {
      errors.push(...getDirectDependencyBrowserSupportErrors(packageJson, minimums, workspacePackages));
    }

    for (const usage of findBrowserApiUsages(runtimeSourceFiles, workspaceRoot)) {
      const unsupportedTargets: string[] = [];

      for (const [browserName, packageMinimum] of minimums) {
        const compatBrowserName = browserCompatTargetNames[browserName];
        const supportedVersion = getSupportedVersion(usage.api.compatPath, compatBrowserName);

        if (supportedVersion && compareVersions(packageMinimum, supportedVersion) < 0) {
          unsupportedTargets.push(`${browserName} >= ${packageMinimum} (native support requires ${supportedVersion})`);
        }
      }

      if (unsupportedTargets.length > 0) {
        const browserslistOwner = browserslistEnvironments.isSplit ? "its" : "package";
        errors.push(
          `${contractName} uses native ${usage.api.label} in ${usage.location}, but ${browserslistOwner} browserslist includes unsupported targets: ${unsupportedTargets.join(", ")}.`,
        );
      }
    }

    try {
      browserslist(undefined, {
        env: browserslistEnvironments.isSplit ? environment : undefined,
        path: packageRoot,
      });
    } catch (error) {
      errors.push(
        `${contractName} browserslist does not resolve: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  if (browserslistEnvironments.isSplit) {
    errors.push(...getRootBaselineErrors(packageName, environmentMinimums));
  }

  if (!publicReadme) {
    errors.push(`${packageName} declares browserslist but has no README.md or README.github.md.`);
    return errors;
  }

  if (browserslistEnvironments.isSplit) {
    const actualTable = getBrowserSupportTable(publicReadme);
    const expectedTable = normalizeBrowserSupportTable(formatBrowserSupportTable(environmentMinimums));

    if (actualTable.length === 0) {
      errors.push(`${packageName} ${publicReadmeFileName} is missing a Browser Support table.`);
    } else if (actualTable.join("\n") !== expectedTable.join("\n")) {
      errors.push(
        [
          `${packageName} ${publicReadmeFileName} Browser Support table does not match package browserslist environments.`,
          "Expected:",
          ...formatBrowserSupportTable(environmentMinimums),
          "Actual:",
          ...getBrowserSupportSection(publicReadme)
            .split("\n")
            .filter((line) => line.trimStart().startsWith("|")),
        ].join("\n"),
      );
    }
  } else {
    const minimums = environmentMinimums.get("production");
    const actualBullets = getBrowserSupportBullets(publicReadme);
    const expectedBullets = formatBrowserSupportBullets(minimums);

    if (actualBullets.length === 0) {
      errors.push(`${packageName} ${publicReadmeFileName} is missing a Browser Support bullet list.`);
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
  }

  return errors;
}

export function getBrowserSupportErrors(
  workspaceRoot = nodePath.resolve(nodePath.dirname(fileURLToPath(import.meta.url)), "../.."),
) {
  const packageRoots = resolveWorkspacePackageRoots(workspaceRoot);
  const workspacePackages = getWorkspacePackageMap(packageRoots);

  return packageRoots.flatMap((packageRoot) =>
    getPackageBrowserSupportErrors(packageRoot, workspaceRoot, workspacePackages),
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
