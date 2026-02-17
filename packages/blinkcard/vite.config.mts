import { getPackagePath, linkResources } from "@microblink/repo-utils";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";
import { fs, path } from "zx";

const resourcesDir = path.resolve(__dirname, "public", "resources");

export default defineConfig((config) => ({
  build: {
    sourcemap: config.mode === "development",
    minify: config.mode === "production",
    target: "es2022",
    lib: {
      formats: ["es"],
      entry: "./src/index.ts",
      fileName: "blinkcard",
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
        ranOnce = true;
      },
    },
  ],
  test: {
    environment: "jsdom",
  },
}));

let ranOnce = false;
type Dependency = keyof typeof dependencies;

async function moveBlinkCardResources() {
  const packageName: Dependency = "@microblink/blinkcard-core";
  const pkgPath = getPackagePath(packageName);
  const distPath = path.join(pkgPath, "dist", "resources");
  const files = fs.readdirSync(distPath);

  fs.ensureDirSync(resourcesDir);

  for (const filePath of files) {
    await linkResources(
      path.join(distPath, filePath),
      path.join(resourcesDir, filePath),
    );
  }
}
