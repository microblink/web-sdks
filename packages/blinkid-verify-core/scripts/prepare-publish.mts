import { Simplify } from "type-fest";
import { writePackage } from "write-package";
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

const bundledDependencies = [
  "@microblink/analytics",
  "@microblink/blinkid-verify-wasm",
  "@microblink/blinkid-verify-worker",
  "@microblink/core-common",
];

const publishedDependencies = Object.fromEntries(
  Object.entries(packageJson.dependencies).filter(
    ([key]) => !bundledDependencies.includes(key),
  ),
);

await fs.emptyDir(publishPath);

await fs.copy("dist", path.join(publishPath, "dist"));
await fs.copy("types", path.join(publishPath, "types"));
await fs.copy("README.md", path.join(publishPath, "README.md"));

// Keep bundled internal packages out of the published manifest. They are
// either rolled into the runtime bundle or inlined into index.rollup.d.ts.

await writePackage(
  newPackagePath,
  {
    ...corePackageJson,
    dependencies: publishedDependencies,
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
        import: "./dist/blinkid-verify-core.js",
      },
      "./package.json": "./package.json",
    },
  },
  {
    normalize: true,
    indent: 2,
  },
);
