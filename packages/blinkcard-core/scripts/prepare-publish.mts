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

await fs.emptyDir(publishPath);

await fs.copy("dist", path.join(publishPath, "dist"));
await fs.copy("types", path.join(publishPath, "types"));
await fs.copy("README.md", path.join(publishPath, "README.md"));

// We don't want to include [@microblink/blinkcard-worker, @microblink/blinkcard-wasm and @microblink/core-common] in the published package.json.
// They are rolled up into the main types file, and don't have any runtime code

await writePackage(
  newPackagePath,
  {
    ...corePackageJson,
    dependencies: {
      "type-fest": packageJson.dependencies["type-fest"],
      comlink: packageJson.dependencies.comlink,
    },
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
        import: "./dist/blinkcard-core.js",
      },
      "./package.json": "./package.json",
    },
  },
  {
    normalize: true,
    indent: 2,
  },
);
