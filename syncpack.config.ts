/**
 * Copyright (c) 2026 Microblink Ltd. All rights reserved.
 */

export default {
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
  versionGroups: [
    {
      label: "Pin TypeScript to 5.8.3",
      dependencies: ["typescript"],
      pinVersion: "5.8.3",
    },
    {
      label: "Ignore .version properties of local packages",
      dependencyTypes: ["local"],
      isIgnored: true,
    },
  ],
} satisfies import("syncpack").RcFile;
