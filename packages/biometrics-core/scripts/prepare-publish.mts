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
await fs.copy("types/index.rollup.d.ts", path.join(publishPath, "types/index.rollup.d.ts"));
await fs.copy("README.md", path.join(publishPath, "README.md"));

const dependencyEntries = Object.entries(packageJson.dependencies ?? {});
const resolvedDependencies = dependencyEntries.reduce<NonNullable<PackageJsonData["dependencies"]>>(
  (acc, [dependencyName, dependencyVersion]) => {
    if (dependencyName.startsWith("@microblink/")) {
      return acc;
    }

    acc[dependencyName] = dependencyVersion;
    return acc;
  },
  {},
);

await writePackage(
  newPackagePath,
  {
    ...minimalPackageJson,
    dependencies: Object.keys(resolvedDependencies).length > 0 ? resolvedDependencies : undefined,
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
        import: "./dist/biometrics-core.js",
      },
      "./package.json": "./package.json",
    },
  } as PackageJsonData,
  {
    normalize: true,
    indent: 2,
  },
);
