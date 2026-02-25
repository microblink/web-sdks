import { beforeEach, describe, expect, it, vi } from "vitest";
import { fs, path, type ProcessOutput } from "zx";
import {
  getPackagePath,
  getResourcesPath,
  linkResources,
  moveResources,
} from "./utils.mts";

/** Helper to create a mock ProcessOutput with just the text() method we need */
function mockProcessOutput(output: string) {
  return { text: () => output } as unknown as ProcessOutput;
}

// Hoist the mock function so it can be used in vi.mock factory
const mockSyncFn = vi.hoisted(() => vi.fn());

// Mock external dependencies
vi.mock("zx", async (importOriginal) => {
  const actual = await importOriginal<typeof import("zx")>();
  return {
    $: {
      sync: mockSyncFn,
    },
    fs: {
      pathExistsSync: vi.fn(),
      existsSync: vi.fn(),
      removeSync: vi.fn(),
      ensureSymlink: vi.fn(),
      copy: vi.fn(),
      readdirSync: vi.fn().mockReturnValue(["file1.js", "file2.js"]),
      ensureDirSync: vi.fn(),
    },
    path: actual.path,
  };
});

describe("Utils", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPackagePath", () => {
    it("should return normalized path when package is found", () => {
      const mockPath = "/path/to/package";
      mockSyncFn.mockReturnValue(mockProcessOutput(mockPath));

      const result = getPackagePath("test-package");
      expect(result).toBe(mockPath);
    });

    it("should return empty string when command fails", () => {
      mockSyncFn.mockReturnValue(mockProcessOutput(""));

      const result = getPackagePath("non-existent-package");
      expect(result).toBe("");
    });
  });

  describe("getResourcesPath", () => {
    beforeEach(() => {
      // Mock the shell command for getPackagePath which is used by getResourcesPath
      const mockPath = "/path/to/package";
      mockSyncFn.mockReturnValue(mockProcessOutput(mockPath));
    });

    it("should return correct resources path when package exists", () => {
      const result = getResourcesPath("test-sdk");
      expect(result).toBe("/path/to/package/dist/resources");
    });

    it("should handle empty package path", () => {
      mockSyncFn.mockReturnValue(mockProcessOutput(""));

      const result = getResourcesPath("non-existent-sdk");
      expect(result).toBe("/dist/resources");
    });
  });

  describe("linkResources", () => {
    const sourcePath = "/source/path";
    const destinationPath = "/destination/path";

    beforeEach(() => {
      vi.clearAllMocks();
      // Reset copy mock to succeed by default
      vi.mocked(fs.copy).mockResolvedValue();
      vi.mocked(fs.existsSync).mockReturnValue(false);
    });

    describe("when source exists", () => {
      beforeEach(() => {
        vi.mocked(fs.pathExistsSync).mockReturnValue(true);
      });

      it("should create symlink when symlinking succeeds", async () => {
        vi.mocked(fs.ensureSymlink).mockResolvedValue();

        await linkResources(sourcePath, destinationPath);

        expect(fs.ensureSymlink).toHaveBeenCalledWith(
          sourcePath,
          destinationPath,
        );
        expect(fs.copy).not.toHaveBeenCalled();
      });

      describe("when symlinking fails", () => {
        beforeEach(() => {
          vi.mocked(fs.ensureSymlink).mockRejectedValue(
            new Error("EPERM: operation not permitted"),
          );
        });

        it("should fall back to copying when copy succeeds", async () => {
          await linkResources(sourcePath, destinationPath);

          expect(fs.ensureSymlink).toHaveBeenCalledWith(
            sourcePath,
            destinationPath,
          );
          expect(fs.copy).toHaveBeenCalledWith(sourcePath, destinationPath, {
            overwrite: true,
          });
        });

        it("should throw error when copy also fails", async () => {
          vi.mocked(fs.copy).mockRejectedValue(new Error("Copy failed"));

          await expect(
            linkResources(sourcePath, destinationPath),
          ).rejects.toThrow("Copy failed");
        });
      });
    });

    describe("when source does not exist", () => {
      beforeEach(() => {
        vi.mocked(fs.pathExistsSync).mockReturnValue(false);
      });

      it("should log and return without attempting symlink or copy", async () => {
        const consoleSpy = vi.spyOn(console, "log");

        await linkResources(sourcePath, destinationPath);

        expect(fs.ensureSymlink).not.toHaveBeenCalled();
        expect(fs.copy).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalledWith(`${sourcePath} doesn't exist`);
      });
    });
  });

  describe("moveResources", () => {
    const packagePath = "test-package";
    const mockPkgPath = "/path/to/package";
    const moveTo = "/move/to/path";

    beforeEach(() => {
      // Mock the shell command for getPackagePath which is used by moveResources
      mockSyncFn.mockReturnValue(mockProcessOutput(mockPkgPath));
      vi.mocked(fs.pathExistsSync).mockReturnValue(true);
      vi.mocked(fs.ensureSymlink).mockResolvedValue();
      // Reset copy mock to succeed by default
      vi.mocked(fs.copy).mockResolvedValue();
    });

    it("should move resources successfully", async () => {
      await moveResources(packagePath, moveTo);

      expect(fs.ensureDirSync).toHaveBeenCalledWith(moveTo);
      expect(fs.readdirSync).toHaveBeenCalledWith(
        path.join(mockPkgPath, "dist", "resources"),
      );

      // Try symlink first
      expect(fs.ensureSymlink).toHaveBeenCalledTimes(2);
      expect(fs.ensureSymlink).toHaveBeenNthCalledWith(
        1,
        path.join(mockPkgPath, "dist", "resources", "file1.js"),
        path.join(moveTo, "file1.js"),
      );
      expect(fs.ensureSymlink).toHaveBeenNthCalledWith(
        2,
        path.join(mockPkgPath, "dist", "resources", "file2.js"),
        path.join(moveTo, "file2.js"),
      );

      // Symlinking succeeds in this scenario, so fallback copy is not used.
      expect(fs.copy).not.toHaveBeenCalled();
    });

    it("should throw error when package path is not found", async () => {
      mockSyncFn.mockReturnValue(mockProcessOutput(""));

      await expect(moveResources(packagePath, moveTo)).rejects.toThrow(
        `Could not find package path for ${packagePath}`,
      );
    });

    it("should throw error when resources directory does not exist", async () => {
      vi.mocked(fs.pathExistsSync).mockReturnValue(false);

      await expect(moveResources(packagePath, moveTo)).rejects.toThrow(
        `Resources directory does not exist at ${path.join(mockPkgPath, "dist", "resources")}. Make sure ${packagePath} is built first.`,
      );
    });
  });
});
