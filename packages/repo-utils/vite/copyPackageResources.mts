import type { Plugin } from "vite";
import { fs, path } from "zx";

import { getPackagePath } from "../utils.mts";

const WASM_VARIANT_DIRECTORIES = ["simd", "simd-threads", "simd-relaxed", "simd-relaxed-threads"] as const;

type PackageResources =
  | { packageName: string; entries?: readonly string[] }
  | { packageName: string; resourceSet: "wasmVariants" };

interface CopyPackageResourcesOptions {
  destination: string;
  packages: readonly PackageResources[];
  prepare?: () => void | Promise<void>;
}

export function copyPackageResources({ destination, packages, prepare }: CopyPackageResourcesOptions): Plugin {
  let copied = false;

  return {
    name: "copy-package-resources",
    async buildStart() {
      if (copied) {
        return;
      }

      fs.emptyDirSync(destination);
      await prepare?.();

      for (const packageResources of packages) {
        const { packageName } = packageResources;
        const entries = "resourceSet" in packageResources ? WASM_VARIANT_DIRECTORIES : packageResources.entries;
        const packagePath = getPackagePath(packageName);
        if (!packagePath) {
          throw new Error(`Could not find package path for ${packageName}`);
        }

        const sourceDirectory = path.join(packagePath, "dist");
        if (!fs.pathExistsSync(sourceDirectory)) {
          if (entries) {
            throw new Error(`Required resource directory does not exist: ${sourceDirectory}`);
          }

          this.warn(`Skipping ${packageName} resources because ${sourceDirectory} does not exist.`);
          continue;
        }

        for (const entry of entries ?? fs.readdirSync(sourceDirectory)) {
          const source = path.join(sourceDirectory, entry);
          const target = path.join(destination, entry);

          fs.removeSync(target);

          if (!fs.existsSync(source)) {
            throw new Error(`Missing required ${packageName} resource: ${entry}`);
          }

          fs.copySync(source, target, { overwrite: true });
        }
      }

      copied = true;
    },
  };
}
