// @ts-check
import { $, fs, path } from "zx";

/**
 * Returns the path to the resources directory of the package.
 */
export function getResourcesPath(sdk: string) {
  const sdkPath = getPackagePath(sdk);

  const src = `${sdkPath}/dist/resources`;

  return src;
}

/**
 * Returns the absolute path to the package.
 *
 * @param {string} packageName name of the package
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
async function copyResources(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
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
 * Symlinks the resources from the source path to the destination path.
 * Falls back to copying if symlinking fails (e.g., on Windows without admin rights).
 */
export async function linkResources(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  if (!fs.pathExistsSync(sourcePath)) {
    console.log(`${sourcePath} doesn't exist`);
    return;
  }

  try {
    // First try to create a symlink
    await fs.ensureSymlink(sourcePath, destinationPath);
    console.log(`Symlinked files to ${destinationPath}`);
  } catch (error) {
    // If symlinking fails, fall back to copying
    console.log(
      `Symlinking failed, falling back to copying: ${(error as Error).message}`,
    );
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
    throw new Error(
      `Resources directory does not exist at ${resourcesPath}. Make sure ${packagePath} is built first.`,
    );
  }

  const files = fs.readdirSync(resourcesPath);
  fs.ensureDirSync(moveTo);

  for (const filePath of files) {
    await linkResources(
      path.join(resourcesPath, filePath),
      path.join(moveTo, filePath),
    );
  }
}
