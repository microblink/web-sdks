/** Copyright (c) 2026 Microblink Ltd. All rights reserved. */

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
      label: "Ignore vitest",
      dependencies: ["vitest", "@vitest/**"],
      isIgnored: true,
    },
    {
      label: "Ignore workspace protocol ranges",
      isIgnored: true,
      specifierTypes: ["workspace-protocol"],
    },
  ],
} satisfies import("syncpack").RcFile;
