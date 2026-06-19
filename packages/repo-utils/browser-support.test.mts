import nodeFs from "node:fs";
import os from "node:os";
import nodePath from "node:path";
import { describe, expect, it } from "vitest";
import { getBrowserSupportErrors } from "./browser-support.mts";

function writeFile(filePath: string, content: string): void {
  nodeFs.mkdirSync(nodePath.dirname(filePath), { recursive: true });
  nodeFs.writeFileSync(filePath, content);
}

function writePackageJson(packageRoot: string, packageJson: object): void {
  writeFile(
    nodePath.join(packageRoot, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
}

function createWorkspace(): string {
  return nodeFs.mkdtempSync(nodePath.join(os.tmpdir(), "browser-support-"));
}

function cleanupWorkspace(workspaceRoot: string): void {
  nodeFs.rmSync(workspaceRoot, { recursive: true, force: true });
}

function writeBrowserTargetedTooling(packageRoot: string): void {
  writeFile(
    nodePath.join(packageRoot, "vite.config.mts"),
    "getBrowserslistEsbuildTarget();\n",
  );
}

const browserSupportReadme = `# Browser Package

## Browser Support

This package supports these browser versions and newer:

- Chrome / Chromium 96 (desktop and Android)
- Edge 96
- Opera 84
- Firefox 114 (desktop)
- Safari 16.4 (macOS)
- iOS Safari 16.4
`;

const browserPackageBrowserslist = [
  "Chrome >= 96",
  "ChromeAndroid >= 96",
  "Edge >= 96",
  "Opera >= 84",
  "Firefox >= 114",
  "Safari >= 16.4",
  "iOS >= 16.4",
];

describe("browser support checks", () => {
  it("passes for a valid package-local browser baseline", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/browser");

      writePackageJson(packageRoot, {
        name: "@scope/browser",
        browserslist: browserPackageBrowserslist,
      });
      writeBrowserTargetedTooling(packageRoot);
      writeFile(nodePath.join(packageRoot, "README.md"), browserSupportReadme);

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("reports README browser support drift", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/browser");

      writePackageJson(packageRoot, {
        name: "@scope/browser",
        browserslist: browserPackageBrowserslist,
      });
      writeBrowserTargetedTooling(packageRoot);
      writeFile(
        nodePath.join(packageRoot, "README.md"),
        browserSupportReadme.replace("iOS Safari 16.4", "iOS Safari 15.1"),
      );

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        [
          "@scope/browser README.md Browser Support bullets do not match package browserslist.",
          "Expected:",
          "- Chrome / Chromium 96 (desktop and Android)",
          "- Edge 96",
          "- Opera 84",
          "- Firefox 114 (desktop)",
          "- Safari 16.4 (macOS)",
          "- iOS Safari 16.4",
          "Actual:",
          "- Chrome / Chromium 96 (desktop and Android)",
          "- Edge 96",
          "- Opera 84",
          "- Firefox 114 (desktop)",
          "- Safari 16.4 (macOS)",
          "- iOS Safari 15.1",
        ].join("\n"),
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("checks README.github.md when it exists", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/browser");

      writePackageJson(packageRoot, {
        name: "@scope/browser",
        browserslist: browserPackageBrowserslist,
      });
      writeBrowserTargetedTooling(packageRoot);
      writeFile(
        nodePath.join(packageRoot, "README.md"),
        "# Browser Package\n\nInternal package notes.\n",
      );
      writeFile(
        nodePath.join(packageRoot, "README.github.md"),
        browserSupportReadme,
      );

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("reports internal README browser support when README.github.md exists", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/browser");

      writePackageJson(packageRoot, {
        name: "@scope/browser",
      });
      writeFile(nodePath.join(packageRoot, "README.md"), browserSupportReadme);
      writeFile(
        nodePath.join(packageRoot, "README.github.md"),
        "# Browser Package\n\n## Usage\n",
      );

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        "@scope/browser README.md must not contain a Browser Support section when README.github.md exists; public browser support docs belong in README.github.md.",
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("reports browser APIs unsupported by package-local browserslist", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/browser");
      const browserslist = [
        "Chrome >= 96",
        "ChromeAndroid >= 96",
        "Edge >= 96",
        "Opera >= 84",
        "Firefox >= 132",
        "Safari >= 15.0",
        "iOS >= 15.0",
      ];

      writePackageJson(packageRoot, {
        name: "@scope/browser",
        browserslist,
      });
      writeBrowserTargetedTooling(packageRoot);
      writeFile(
        nodePath.join(packageRoot, "README.md"),
        [
          "# Browser Package",
          "",
          "## Browser Support",
          "",
          "This package supports these browser versions and newer:",
          "",
          "- Chrome / Chromium 96 (desktop and Android)",
          "- Edge 96",
          "- Opera 84",
          "- Firefox 132 (desktop)",
          "- Safari 15.0 (macOS)",
          "- iOS Safari 15.0",
          "",
        ].join("\n"),
      );
      writeFile(
        nodePath.join(packageRoot, "src/index.ts"),
        [
          'const video = document.createElement("video");',
          "video.requestVideoFrameCallback(() => undefined);",
          "video.cancelVideoFrameCallback(1);",
          "",
        ].join("\n"),
      );

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        "@scope/browser uses native HTMLVideoElement.requestVideoFrameCallback() in packages/browser/src/index.ts:2:1, but package browserslist includes unsupported targets: Safari >= 15.0 (native support requires 15.4), iOS >= 15.0 (native support requires 15.4).",
        "@scope/browser uses native HTMLVideoElement.cancelVideoFrameCallback() in packages/browser/src/index.ts:3:1, but package browserslist includes unsupported targets: Safari >= 15.0 (native support requires 15.4), iOS >= 15.0 (native support requires 15.4).",
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("reports browser APIs used by no-baseline workspace dependencies under the consumer baseline", () => {
    const workspaceRoot = createWorkspace();

    try {
      const commonRoot = nodePath.join(workspaceRoot, "packages/worker-common");
      const consumerRoot = nodePath.join(workspaceRoot, "packages/worker");
      const browserslist = [
        "Chrome >= 96",
        "ChromeAndroid >= 96",
        "Edge >= 96",
        "Opera >= 84",
        "Firefox >= 132",
        "Safari >= 15.0",
        "iOS >= 15.0",
      ];

      writePackageJson(commonRoot, {
        name: "@scope/worker-common",
        exports: {
          "./video": {
            types: "./types/video.d.ts",
            import: "./dist/video.js",
          },
        },
      });
      writeFile(
        nodePath.join(commonRoot, "src/video.ts"),
        [
          "export function requestFrame(video: HTMLVideoElement): void {",
          "  video.requestVideoFrameCallback(() => undefined);",
          "}",
          "",
        ].join("\n"),
      );

      writePackageJson(consumerRoot, {
        name: "@scope/worker",
        dependencies: {
          "@scope/worker-common": "workspace:*",
        },
        browserslist,
      });
      writeBrowserTargetedTooling(consumerRoot);
      writeFile(
        nodePath.join(consumerRoot, "README.md"),
        [
          "# Worker Package",
          "",
          "## Browser Support",
          "",
          "This package supports these browser versions and newer:",
          "",
          "- Chrome / Chromium 96 (desktop and Android)",
          "- Edge 96",
          "- Opera 84",
          "- Firefox 132 (desktop)",
          "- Safari 15.0 (macOS)",
          "- iOS Safari 15.0",
          "",
        ].join("\n"),
      );
      writeFile(
        nodePath.join(consumerRoot, "src/index.ts"),
        [
          'import { requestFrame } from "@scope/worker-common/video";',
          "",
          "export { requestFrame };",
          "",
        ].join("\n"),
      );

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        "@scope/worker uses native HTMLVideoElement.requestVideoFrameCallback() in packages/worker-common/src/video.ts:2:3, but package browserslist includes unsupported targets: Safari >= 15.0 (native support requires 15.4), iOS >= 15.0 (native support requires 15.4).",
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("does not scan type-only workspace dependencies under the consumer baseline", () => {
    const workspaceRoot = createWorkspace();

    try {
      const commonRoot = nodePath.join(workspaceRoot, "packages/worker-common");
      const consumerRoot = nodePath.join(workspaceRoot, "packages/worker");
      const browserslist = [
        "Chrome >= 96",
        "ChromeAndroid >= 96",
        "Edge >= 96",
        "Opera >= 84",
        "Firefox >= 132",
        "Safari >= 15.0",
        "iOS >= 15.0",
      ];

      writePackageJson(commonRoot, {
        name: "@scope/worker-common",
        exports: {
          "./video": {
            types: "./types/video.d.ts",
            import: "./dist/video.js",
          },
        },
      });
      writeFile(
        nodePath.join(commonRoot, "src/video.ts"),
        [
          "export interface VideoApi {",
          "  requestFrame(video: HTMLVideoElement): void;",
          "}",
          "",
          "export function requestFrame(video: HTMLVideoElement): void {",
          "  video.requestVideoFrameCallback(() => undefined);",
          "}",
          "",
        ].join("\n"),
      );

      writePackageJson(consumerRoot, {
        name: "@scope/worker",
        dependencies: {
          "@scope/worker-common": "workspace:*",
        },
        browserslist,
      });
      writeBrowserTargetedTooling(consumerRoot);
      writeFile(
        nodePath.join(consumerRoot, "README.md"),
        [
          "# Worker Package",
          "",
          "## Browser Support",
          "",
          "This package supports these browser versions and newer:",
          "",
          "- Chrome / Chromium 96 (desktop and Android)",
          "- Edge 96",
          "- Opera 84",
          "- Firefox 132 (desktop)",
          "- Safari 15.0 (macOS)",
          "- iOS Safari 15.0",
          "",
        ].join("\n"),
      );
      writeFile(
        nodePath.join(consumerRoot, "src/index.ts"),
        [
          'import type { VideoApi } from "@scope/worker-common/video";',
          "",
          "export type { VideoApi };",
          "",
        ].join("\n"),
      );

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("reports package baselines older than browser-targeted dependencies", () => {
    const workspaceRoot = createWorkspace();

    try {
      const dependencyRoot = nodePath.join(workspaceRoot, "packages/core");
      const consumerRoot = nodePath.join(workspaceRoot, "packages/consumer");

      writePackageJson(dependencyRoot, {
        name: "@scope/core",
        browserslist: browserPackageBrowserslist,
      });
      writeBrowserTargetedTooling(dependencyRoot);
      writeFile(
        nodePath.join(dependencyRoot, "README.md"),
        browserSupportReadme.replace("Browser Package", "Core Package"),
      );

      writePackageJson(consumerRoot, {
        name: "@scope/consumer",
        dependencies: {
          "@scope/core": "workspace:^",
        },
        browserslist: [
          "Chrome >= 96",
          "ChromeAndroid >= 96",
          "Edge >= 96",
          "Opera >= 84",
          "Firefox >= 89",
          "Safari >= 14.4",
          "iOS >= 16.4",
        ],
      });
      writeBrowserTargetedTooling(consumerRoot);
      writeFile(
        nodePath.join(consumerRoot, "README.md"),
        [
          "# Consumer Package",
          "",
          "## Browser Support",
          "",
          "This package supports these browser versions and newer:",
          "",
          "- Chrome / Chromium 96 (desktop and Android)",
          "- Edge 96",
          "- Opera 84",
          "- Firefox 89 (desktop)",
          "- Safari 14.4 (macOS)",
          "- iOS Safari 16.4",
          "",
        ].join("\n"),
      );

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        "@scope/consumer declares Firefox >= 89, but @scope/core declares Firefox >= 114.",
        "@scope/consumer declares Safari >= 14.4, but @scope/core declares Safari >= 16.4.",
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("requires browserslist for packages using browser-targeted tooling", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/browser");

      writePackageJson(packageRoot, {
        name: "@scope/browser",
      });
      writeBrowserTargetedTooling(packageRoot);

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        "@scope/browser uses browser-targeted tooling but does not declare package-local browserslist.",
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("requires browser-targeted tooling for packages declaring browserslist", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/browser");

      writePackageJson(packageRoot, {
        name: "@scope/browser",
        browserslist: browserPackageBrowserslist,
      });
      writeFile(nodePath.join(packageRoot, "README.md"), browserSupportReadme);

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        "@scope/browser declares browserslist but does not use browser-targeted tooling.",
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });

  it("forbids common packages from owning browser baselines", () => {
    const workspaceRoot = createWorkspace();

    try {
      const packageRoot = nodePath.join(workspaceRoot, "packages/core-common");

      writePackageJson(packageRoot, {
        name: "@scope/core-common",
        browserslist: browserPackageBrowserslist,
      });
      writeFile(nodePath.join(packageRoot, "README.md"), browserSupportReadme);

      expect(getBrowserSupportErrors(workspaceRoot)).toEqual([
        "@scope/core-common must not declare browserslist; consuming product packages own browser baselines.",
        "@scope/core-common README.md must not contain a Browser Support section; consuming product packages own browser baselines.",
      ]);
    } finally {
      cleanupWorkspace(workspaceRoot);
    }
  });
});
