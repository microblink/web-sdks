import { Simplify } from "type-fest";
import "zx/globals";
import { writePackage } from "write-package";

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
  "keywords",
  "files",
  "peerDependencies",
  "peerDependenciesMeta",
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

const typeFestVersion = packageJson.dependencies["type-fest"];
const zustandVersion = packageJson.dependencies.zustand;

await writePackage(
  newPackagePath,
  {
    ...corePackageJson,
    dependencies: {
      "type-fest": typeFestVersion,
      zustand: zustandVersion,
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
        import: "./dist/camera-manager.js",
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
  },
  {
    normalize: true,
    indent: 2,
  },
);
