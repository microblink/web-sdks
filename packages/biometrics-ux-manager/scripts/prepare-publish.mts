import { getPackagePath } from "@microblink/repo-utils";
import { Simplify } from "type-fest";
import { PackageJsonData, writePackage } from "write-package";
import "zx/globals";

import packageJson from "../package.json";

type PackageKeys = keyof typeof packageJson;
type KeyArray = Simplify<PackageKeys>[];

const publishPath = path.resolve("publish");
const newPackagePath = path.join(publishPath, "package.json");

const pickKeys = (properties: KeyArray) => {
  const minimalPackageJson = properties.reduce((acc, key) => {
    acc[key] = packageJson[key];
    return acc;
  }, {});
  return minimalPackageJson;
};

const minimalPackageJson = pickKeys([
  "name",
  "version",
  "author",
  "type",
  "main",
  "module",
  "description",
  "keywords",
  "files",
]);

await fs.emptyDir(publishPath);

await fs.copy("dist", path.join(publishPath, "dist"));
for (const entrypoint of ["index", "core", "ui"]) {
  await fs.copy(
    path.join("types", `${entrypoint}.rollup.d.ts`),
    path.join(publishPath, "types", `${entrypoint}.rollup.d.ts`),
  );
}
await fs.copy("README.md", path.join(publishPath, "README.md"));

const bundledDependencies = new Set([
  "@microblink/analytics",
  "@microblink/shared-components",
  "@microblink/ux-common",
  "merge-anything",
  "perfect-debounce",
]);

const resolvedDependencies = Object.entries(packageJson.dependencies ?? {}).reduce<
  NonNullable<PackageJsonData["dependencies"]>
>((acc, [dependencyName, dependencyVersion]) => {
  if (bundledDependencies.has(dependencyName)) {
    return acc;
  }

  if (!dependencyName.startsWith("@microblink/")) {
    acc[dependencyName] = dependencyVersion;
    return acc;
  }

  const packagePath = getPackagePath(dependencyName);
  const dependencyPackageJson = fs.readJsonSync(path.join(packagePath, "package.json"));
  acc[dependencyName] = dependencyName.startsWith("@microblink/biometrics")
    ? dependencyPackageJson.version
    : `https://registry.npmjs.org/${dependencyName}/-/${dependencyName.split("/").at(-1)}-${dependencyPackageJson.version}.tgz`;
  return acc;
}, {});

await writePackage(
  newPackagePath,
  {
    ...minimalPackageJson,
    dependencies: resolvedDependencies,
    peerDependencies: packageJson.peerDependencies,
    peerDependenciesMeta: packageJson.peerDependenciesMeta,
    access: "public",
    types: "./types/index.rollup.d.ts",
    homepage: "https://github.com/microblink/web-sdks",
    repository: {
      type: "git",
      url: "git+https://github.com/microblink/web-sdks.git",
    },
    exports: {
      ".": {
        types: "./types/index.rollup.d.ts",
        import: "./dist/biometrics-ux-manager.js",
      },
      "./core": {
        types: "./types/core.rollup.d.ts",
        import: "./dist/core.js",
      },
      "./ui": {
        types: "./types/ui.rollup.d.ts",
        import: "./dist/ui.js",
      },
      "./package.json": "./package.json",
    },
  } as PackageJsonData,
  {
    normalize: true,
    indent: 2,
  },
);
