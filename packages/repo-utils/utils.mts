import browserslist from "browserslist";
import browserslistToEsbuild from "browserslist-to-esbuild";
import type { Plugin } from "vite";
import { $, fs, path } from "zx";

type BrowserslistToEsbuild = (
  browserslistConfig?: string | readonly string[],
  options?: browserslist.Options,
) => string[];

const convertBrowserslistToEsbuild = browserslistToEsbuild as unknown as BrowserslistToEsbuild;

interface BrowserslistEsbuildTargetOptions {
  /** A single named Browserslist environment. Mutually exclusive with `environments`. */
  environment?: string;
  /**
   * Several named Browserslist environments whose baselines are unioned. Use this when one build produces multiple
   * entrypoints that declare their own baselines, so the shared output is transpiled for the lowest one.
   */
  environments?: readonly string[];
  packageRoot?: string;
}

/**
 * Vite/esbuild `build.target` for published SDK packages, derived from the package-local Browserslist config. Internal
 * apps under `apps/` should use `es2022`.
 */
export function getBrowserslistEsbuildTarget({
  environment,
  environments,
  packageRoot = process.cwd(),
}: BrowserslistEsbuildTargetOptions = {}): string[] {
  if (environments) {
    const queries = environments.flatMap((name) => {
      const config = browserslist.loadConfig({ env: name, path: packageRoot });
      if (!config) {
        throw new Error(`Browserslist environment "${name}" is not declared in ${packageRoot}.`);
      }
      return config;
    });
    return convertBrowserslistToEsbuild(queries, { path: packageRoot });
  }

  return convertBrowserslistToEsbuild(undefined, {
    env: environment,
    path: packageRoot,
  });
}

/**
 * Vite plugin that collapses whitespace inside JSX `class`, `className`, and `classList` attributes so multi-line
 * utility class lists stay readable in source while producing a clean DOM.
 */
export function collapseClassWhitespace() {
  return {
    name: "collapse-class-whitespace",
    enforce: "pre" as const,
    transform(code: string, id: string) {
      if (!/\.[jt]sx?$/.test(id)) return null;

      let result = code.replace(
        /\b(class(?:Name)?)\s*=\s*(["'])([\s\S]*?)\2/g,
        (_match: string, attr: string, quote: string, content: string) =>
          `${attr}=${quote}${content.replace(/\s+/g, " ").trim()}${quote}`,
      );

      // Braced expressions need brace balancing; protect `${...}` interpolations while collapsing.
      const bracedAttrRegex = /\b(class(?:Name|List)?)\s*=\s*\{/g;
      let match: RegExpExecArray | null;

      while ((match = bracedAttrRegex.exec(result)) !== null) {
        const startIdx = match.index;
        const attrName = match[1];
        const openingBraceIdx = startIdx + match[0].length - 1;

        let depth = 1;
        let endIdx = -1;
        for (let i = openingBraceIdx + 1; i < result.length; i++) {
          if (result[i] === "{") depth++;
          if (result[i] === "}") depth--;
          if (depth === 0) {
            endIdx = i;
            break;
          }
        }

        if (endIdx === -1) continue;

        const rawContent = result.slice(openingBraceIdx + 1, endIdx);
        const parts = rawContent.split(/(\$\{[\s\S]*?\})/g);
        const cleanedContent = parts.map((part, i) => (i % 2 === 0 ? part.replace(/\s+/g, " ") : part)).join("");

        const before = result.slice(0, startIdx);
        const replacement = `${attrName}={${cleanedContent.trim()}}`;
        result = before + replacement + result.slice(endIdx + 1);
        bracedAttrRegex.lastIndex = before.length + replacement.length;
      }

      return { code: result, map: null };
    },
  };
}

export function removeModuleRegions(): Plugin {
  return {
    name: "remove-module-regions",
    apply(_config, { command, mode }) {
      return command === "build" && mode === "production";
    },
    generateBundle(_options, bundle) {
      for (const output of Object.values(bundle)) {
        if (output.type === "chunk") {
          output.code = output.code.replace(/^[\t ]*\/\/#(?:end)?region[^\r\n]*(?:\r?\n|$)/gm, "");
        }
      }
    },
  };
}

/** Returns the path to the resources directory of the package. */
export function getResourcesPath(sdk: string) {
  const dist_path = `/dist/resources`;
  if (sdk === "") {
    return dist_path;
  } else {
    const sdkPath = getPackagePath(sdk);
    return `${sdkPath}${dist_path}`;
  }
}

/**
 * Returns the absolute path to the package.
 *
 * @param {string} packageName Name of the package
 */
export function getPackagePath(packageName: string) {
  const packagePath = $.sync`pnpm -F "${packageName}" exec pwd`.text().trim();
  return packagePath;
}

/**
 * Copies resources from source to destination with overwrite option.
 *
 * @param {string} sourcePath
 * @param {string} destinationPath
 */
async function copyResources(sourcePath: string, destinationPath: string): Promise<void> {
  if (!fs.pathExistsSync(sourcePath)) {
    console.log(`${sourcePath} doesn't exist`);
    return;
  }

  try {
    await fs.copy(sourcePath, destinationPath, { overwrite: true });
    console.log(`Copied files to ${destinationPath}`);
  } catch (copyError) {
    console.error(`Failed to copy files: ${copyError}`);
    throw copyError;
  }
}

/**
 * Symlinks the resources from the source path to the destination path. Falls back to copying if symlinking fails (e.g.,
 * on Windows without admin rights).
 */
export async function linkResources(sourcePath: string, destinationPath: string): Promise<void> {
  if (!fs.pathExistsSync(sourcePath)) {
    console.log(`${sourcePath} doesn't exist`);
    return;
  }

  try {
    // First try to create a symlink
    // If it exists at the destination, `fs.ensureSymlink` will throw!
    if (fs.existsSync(destinationPath)) {
      fs.removeSync(destinationPath);
    }
    await fs.ensureSymlink(sourcePath, destinationPath);
  } catch (error) {
    const symlinkError = error as NodeJS.ErrnoException;
    if (symlinkError.code === "EEXIST" && fs.existsSync(destinationPath)) {
      return;
    }

    // If symlinking fails, fall back to copying
    console.log(`Symlinking failed, falling back to copying: ${(error as Error).message}`);
    await copyResources(sourcePath, destinationPath);
  }
}

/**
 * Moves the resources from the package path to the moveTo path.
 *
 * @param {string} packagePath
 * @param {string} moveTo
 * @param {string[]} moveFrom
 */
export async function moveResources(
  packagePath: string,
  moveTo: string,
  moveFrom: string[] = ["dist", "resources"],
): Promise<void> {
  const pkgPath = getPackagePath(packagePath);
  if (!pkgPath) {
    throw new Error(`Could not find package path for ${packagePath}`);
  }
  const resourcesPath = path.join(pkgPath, ...moveFrom);

  if (!fs.pathExistsSync(resourcesPath)) {
    throw new Error(`Resources directory does not exist at ${resourcesPath}. Make sure ${packagePath} is built first.`);
  }

  const files = fs.readdirSync(resourcesPath);
  fs.ensureDirSync(moveTo);

  for (const filePath of files) {
    await linkResources(path.join(resourcesPath, filePath), path.join(moveTo, filePath));
  }
}
