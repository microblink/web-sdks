// @ts-check

/** @type {import("syncpack").RcFile} */
const config = {
  sortFirst: [
    "name",
    "description",
    "homepage",
    "repository",
    "private",
    "version",
    "author",
    "scripts",
    "type",
    "main",
    "module",
    "types",
    "exports",
    "publishConfig",
    "files",
    "dependencies",
    "devDependencies",
    "peerDependencies",
  ],
  dependencyTypes: ["!local"],
  versionGroups: [
    {
      label: "Pin TypeScript to 5.8.3",
      dependencies: ["typescript"],
      pinVersion: "5.8.3",
    },
  ],
};

module.exports = config;
