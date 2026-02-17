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
  const corePackageJson = properties.reduce((acc, key) => {
    acc[key] = packageJson[key];
    return acc;
  }, {});
  return corePackageJson;
};

const corePackageJson = pickKeys([
  "name",
  "version",
  "author",
  "type",
  "main",
  "module",
  "description",
  "files",
]);

await fs.emptyDir(publishPath);

await fs.copy("dist", path.join(publishPath, "dist"));
await fs.copy("types", path.join(publishPath, "types"));
await fs.copy("README.md", path.join(publishPath, "README.md"));

// These dependencies are bundled into the main types file, so we don't need to
// include them in the dependencies.
const bundleDependencies = ["@microblink/analytics", "@microblink/ux-common"];

const microblinkDependencies = Object.keys(packageJson.dependencies).filter(
  (key) => key.startsWith("@microblink") && !bundleDependencies.includes(key),
);

// Since monorepo dependencies resolve to the version "workspace:*", we need
// to resolve the actual versions of the dependencies before publishing the
// package.
const mbDepsWithVersion = microblinkDependencies.reduce<
  PackageJsonData["dependencies"]
>((acc, key) => {
  const pkgPath = getPackagePath(key);
  const pkgJson = fs.readJsonSync(path.join(pkgPath, "package.json"));
  if (!acc) {
    return;
  }
  acc[key] = `^${pkgJson.version}`;
  return acc;
}, {});

// add type-fest to dependencies
const typeFestVersion = packageJson.dependencies["type-fest"];
mbDepsWithVersion!["type-fest"] = typeFestVersion;

await writePackage(
  newPackagePath,
  {
    ...corePackageJson,
    dependencies: mbDepsWithVersion,
    access: "public",
    registry: "https://registry.npmjs.org/",
    types: "./types/index.rollup.d.ts",
    homepage: "https://github.com/microblink/web-sdks",
    repository: {
      type: "git",
      url: "git+https://github.com/microblink/web-sdks.git",
    },
    exports: {
      ".": {
        types: "./types/index.rollup.d.ts",
        import: "./dist/blinkid-ux-manager.js",
      },
      "./package.json": "./package.json",
    },
  } as PackageJsonData,
  {
    normalize: true,
    indent: 2,
  },
);
