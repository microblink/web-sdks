import { getPackagePath, linkResources } from "@microblink/repo-utils";
import { stripIndents } from "common-tags";
import { defineConfig } from "vite";
import { fs, path } from "zx";
import { dependencies } from "./package.json";

let ranOnce = false;
const resourcesDir = path.resolve(__dirname, "public", "resources");

type Dependency = keyof typeof dependencies;

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: "es2022",
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "blinkcard-core",
    },
  },
  plugins: [
    {
      name: "move-resources",
      buildStart: async () => {
        if (ranOnce) {
          return;
        }
        await moveBlinkCardResources();
        await moveWorker();
        await writeResourceDoc();
        ranOnce = true;
      },
    },
  ],
  test: {
    environment: "happy-dom",
    setupFiles: [path.resolve(__dirname, "vitest.setup.ts")],
  },
}));

async function writeResourceDoc() {
  fs.outputFile(
    path.join(resourcesDir, "DO_NOT_MODIFY_THIS_DIRECTORY.md"),
    stripIndents`
      Do not modify the name of this directory, or the files inside it.
      The Wasm and Web Workers will look for the \`resources\` directory on the path.`,
  );
}

async function moveWorker() {
  const packageName: Dependency = "@microblink/blinkcard-worker";
  const pkgPath = getPackagePath(packageName);
  if (!pkgPath) {
    throw new Error(`Could not find package path for ${packageName}`);
  }
  const distPath = path.join(pkgPath, "dist");
  if (!fs.pathExistsSync(distPath)) {
    throw new Error(
      `Dist directory does not exist at ${distPath}. Make sure ${packageName} is built first.`,
    );
  }

  const files = fs.readdirSync(distPath);

  fs.ensureDirSync(resourcesDir);

  for (const filePath of files) {
    await linkResources(
      path.join(distPath, filePath),
      path.join(resourcesDir, filePath),
    );
  }
}

async function moveBlinkCardResources() {
  const packageName: Dependency = "@microblink/blinkcard-wasm";
  const pkgPath = getPackagePath(packageName);
  if (!pkgPath) {
    throw new Error(`Could not find package path for ${packageName}`);
  }
  const distPath = path.join(pkgPath, "dist");

  if (!fs.pathExistsSync(distPath)) {
    throw new Error(
      `Dist directory does not exist at ${distPath}. Make sure ${packageName} is built first.`,
    );
  }

  const files = fs.readdirSync(distPath);
  fs.ensureDirSync(resourcesDir);

  for (const filePath of files) {
    await linkResources(
      path.join(distPath, filePath),
      path.join(resourcesDir, filePath),
    );
  }
}
